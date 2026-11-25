using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using TuneSpace.Application.Services;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Core.Models;
using Xunit;

namespace TuneSpace.Tests.Unit.Services;

public class UserManagementServiceTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IBandRepository _bandRepository = Substitute.For<IBandRepository>();
    private readonly IRefreshTokenRepository _refreshTokenRepository = Substitute.For<IRefreshTokenRepository>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly IUserAccessStateProvider _accessStateProvider = Substitute.For<IUserAccessStateProvider>();
    private readonly IUserManagementService _service;

    private readonly Guid _adminId = Guid.NewGuid();

    public UserManagementServiceTests()
    {
        _unitOfWork.ExecuteInTransactionAsync(Arg.Any<Func<Task>>()).Returns(ci => ci.Arg<Func<Task>>()());
        _userRepository
            .When(r => r.UpdateUserRoleAsync(Arg.Any<User>(), Arg.Any<Roles>()))
            .Do(ci => ci.Arg<User>().Role = ci.Arg<Roles>());

        _service = new UserManagementService(
            _userRepository,
            _bandRepository,
            _refreshTokenRepository,
            _unitOfWork,
            _accessStateProvider,
            NullLogger<UserManagementService>.Instance);
    }

    private User GivenUser(Roles role = Roles.Listener, DateTimeOffset? lockoutEnd = null, string name = "target")
    {
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = name,
            Email = $"{name}@example.com",
            Role = role,
            LockoutEnd = lockoutEnd,
        };
        _userRepository.GetUserByIdAsync(user.Id.ToString()).Returns(user);
        return user;
    }

    private Band GivenBand(params User[] members)
    {
        var band = new Band { Id = Guid.NewGuid(), Name = "The Band", Genre = "Rock", Members = [.. members] };
        foreach (var member in members)
        {
            _bandRepository.GetBandByUserIdAsync(member.Id.ToString()).Returns(band);
        }
        return band;
    }

    // ---- Listing ----

    [Fact]
    public async Task GetUsersAsync_ClampsPagingAndAttachesBands()
    {
        var bandId = Guid.NewGuid();
        var inBand = new UserListItem(Guid.NewGuid(), "a", "a@example.com", Roles.BandMember, true, null, DateTime.UtcNow, null, true, bandId);
        var solo = new UserListItem(Guid.NewGuid(), "b", "b@example.com", Roles.Listener, true, null, DateTime.UtcNow, null, false, null);
        _userRepository.GetUsersPagedAsync("a", null, null, 0, UserManagementService.MaxPageSize)
            .Returns((new List<UserListItem> { inBand, solo }, 2));
        _bandRepository.GetBandSummariesAsync(Arg.Is<IReadOnlyCollection<Guid>>(ids => ids.Single() == bandId))
            .Returns(new Dictionary<Guid, BandSummary> { [bandId] = new(bandId, "The Band", 3, 1) });

        var result = await _service.GetUsersAsync("a", null, null, page: 0, pageSize: 5000);

        Assert.Equal(1, result.Page);
        Assert.Equal(UserManagementService.MaxPageSize, result.PageSize);
        Assert.Equal("The Band", result.Items[0].Band?.Name);
        Assert.True(result.Items[0].HasProfilePicture);
        Assert.Null(result.Items[1].Band);
    }

    [Fact]
    public async Task GetStatsAsync_ReportsEveryRole()
    {
        _userRepository.GetUserCountsByRoleAsync()
            .Returns(new Dictionary<Roles, int> { [Roles.Listener] = 4, [Roles.Admin] = 1 });
        _userRepository.GetSuspendedUserCountAsync().Returns(2);

        var stats = await _service.GetStatsAsync();

        Assert.Equal(5, stats.TotalUsers);
        Assert.Equal(2, stats.SuspendedUsers);
        Assert.Equal(Enum.GetValues<Roles>().Length, stats.UsersByRole.Count);
        Assert.Equal(0, stats.UsersByRole["BandAdmin"]);
    }

    // ---- Role changes: users without a band ----

    [Theory]
    [InlineData(Roles.Listener, Roles.Admin)]
    [InlineData(Roles.Admin, Roles.Listener)]
    public async Task ChangeRoleAsync_WithoutBand_AllowsNonBandRoles(Roles from, Roles to)
    {
        var user = GivenUser(from);

        var result = await _service.ChangeRoleAsync(_adminId, user.Id, to);

        Assert.Equal(to.ToString(), result.Role);
        _accessStateProvider.Received(1).Invalidate(user.Id);
    }

    [Theory]
    [InlineData(Roles.BandAdmin)]
    [InlineData(Roles.BandMember)]
    public async Task ChangeRoleAsync_WithoutBand_RejectsBandRoles(Roles to)
    {
        var user = GivenUser();

        await Assert.ThrowsAsync<ConflictException>(() => _service.ChangeRoleAsync(_adminId, user.Id, to));
        await _userRepository.DidNotReceiveWithAnyArgs().UpdateUserRoleAsync(default!, default);
    }

    // ---- Role changes: band members ----

    [Fact]
    public async Task ChangeRoleAsync_PromoteMemberToBandAdmin_KeepsMembership()
    {
        var member = GivenUser(Roles.BandMember);
        var band = GivenBand(GivenUser(Roles.BandAdmin, name: "leader"), member);

        var result = await _service.ChangeRoleAsync(_adminId, member.Id, Roles.BandAdmin);

        Assert.Equal("BandAdmin", result.Role);
        Assert.Contains(member, band.Members);
        Assert.Equal(2, result.Band?.ManagerCount);
    }

    [Fact]
    public async Task ChangeRoleAsync_ToListener_RemovesFromBand()
    {
        var member = GivenUser(Roles.BandMember);
        var band = GivenBand(GivenUser(Roles.BandAdmin, name: "leader"), member);

        var result = await _service.ChangeRoleAsync(_adminId, member.Id, Roles.Listener);

        Assert.Equal("Listener", result.Role);
        Assert.Null(result.Band);
        Assert.DoesNotContain(member, band.Members);
        await _bandRepository.Received(1).UpdateBandAsync(band);
    }

    [Theory]
    [InlineData(Roles.BandMember)]
    [InlineData(Roles.Listener)]
    public async Task ChangeRoleAsync_DemotingSoleManager_IsRejected(Roles to)
    {
        var leader = GivenUser(Roles.BandAdmin, name: "leader");
        var band = GivenBand(leader, GivenUser(Roles.BandMember));

        await Assert.ThrowsAsync<ConflictException>(() => _service.ChangeRoleAsync(_adminId, leader.Id, to));
        Assert.Equal(Roles.BandAdmin, leader.Role);
        Assert.Contains(leader, band.Members);
    }

    [Fact]
    public async Task ChangeRoleAsync_OnlyMemberToListener_IsRejected()
    {
        var leader = GivenUser(Roles.BandAdmin, name: "leader");
        GivenBand(leader);

        var error = await Assert.ThrowsAsync<ConflictException>(() => _service.ChangeRoleAsync(_adminId, leader.Id, Roles.Listener));
        Assert.Contains("Delete the band", error.Message);
    }

    [Fact]
    public async Task ChangeRoleAsync_DemotingOneOfTwoManagers_IsAllowed()
    {
        var leader = GivenUser(Roles.BandAdmin, name: "leader");
        GivenBand(leader, GivenUser(Roles.BandAdmin, name: "co-leader"));

        var result = await _service.ChangeRoleAsync(_adminId, leader.Id, Roles.BandMember);

        Assert.Equal("BandMember", result.Role);
    }

    [Fact]
    public async Task ChangeRoleAsync_SiteAdminCountsAsManager()
    {
        var leader = GivenUser(Roles.BandAdmin, name: "leader");
        GivenBand(leader, GivenUser(Roles.Admin, name: "site admin"));

        var result = await _service.ChangeRoleAsync(_adminId, leader.Id, Roles.BandMember);

        Assert.Equal("BandMember", result.Role);
    }

    [Fact]
    public async Task ChangeRoleAsync_PromoteBandMemberToAdmin_KeepsMembership()
    {
        var member = GivenUser(Roles.BandMember);
        var band = GivenBand(GivenUser(Roles.BandAdmin, name: "leader"), member);

        var result = await _service.ChangeRoleAsync(_adminId, member.Id, Roles.Admin);

        Assert.Equal("Admin", result.Role);
        Assert.Contains(member, band.Members);
    }

    // ---- Role changes: guards ----

    [Fact]
    public async Task ChangeRoleAsync_OnSelf_Throws()
    {
        await Assert.ThrowsAsync<ConflictException>(
            () => _service.ChangeRoleAsync(_adminId, _adminId, Roles.Listener));

        await _userRepository.DidNotReceiveWithAnyArgs().UpdateUserRoleAsync(default!, default);
    }

    [Fact]
    public async Task ChangeRoleAsync_UnknownUser_ThrowsNotFound()
    {
        await Assert.ThrowsAsync<NotFoundException>(
            () => _service.ChangeRoleAsync(_adminId, Guid.NewGuid(), Roles.Admin));
    }

    [Fact]
    public async Task ChangeRoleAsync_SameRole_IsNoOp()
    {
        var leader = GivenUser(Roles.BandAdmin);
        GivenBand(leader);

        await _service.ChangeRoleAsync(_adminId, leader.Id, Roles.BandAdmin);

        await _userRepository.DidNotReceiveWithAnyArgs().UpdateUserRoleAsync(default!, default);
    }

    // ---- Suspension ----

    [Fact]
    public async Task SetSuspendedAsync_Suspend_LocksRevokesSessionsAndInvalidatesCache()
    {
        var user = GivenUser();

        await _service.SetSuspendedAsync(_adminId, user.Id, true);

        await _userRepository.Received(1).SetSuspendedAsync(user, true);
        await _refreshTokenRepository.Received(1).RevokeAllForUserAsync(user.Id);
        _accessStateProvider.Received(1).Invalidate(user.Id);
    }

    [Fact]
    public async Task SetSuspendedAsync_Restore_DoesNotRevokeSessions()
    {
        var user = GivenUser(lockoutEnd: DateTimeOffset.MaxValue);

        await _service.SetSuspendedAsync(_adminId, user.Id, false);

        await _userRepository.Received(1).SetSuspendedAsync(user, false);
        await _refreshTokenRepository.DidNotReceiveWithAnyArgs().RevokeAllForUserAsync(default);
    }

    [Fact]
    public async Task SetSuspendedAsync_OnSelf_Throws()
    {
        await Assert.ThrowsAsync<ConflictException>(
            () => _service.SetSuspendedAsync(_adminId, _adminId, true));
    }

    [Fact]
    public async Task SetSuspendedAsync_ExpiredLockout_IsTreatedAsActive()
    {
        var user = GivenUser(lockoutEnd: DateTimeOffset.UtcNow.AddMinutes(-1));

        var result = await _service.SetSuspendedAsync(_adminId, user.Id, false);

        Assert.False(result.IsSuspended);
        await _userRepository.DidNotReceiveWithAnyArgs().SetSuspendedAsync(default!, default);
    }
}
