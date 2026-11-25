using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using TuneSpace.Application.Services;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using Xunit;

namespace TuneSpace.Tests.Unit.Services;

public class BandServiceTests
{
    private readonly IBandRepository _bandRepository = Substitute.For<IBandRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly IUserAccessStateProvider _accessStateProvider = Substitute.For<IUserAccessStateProvider>();
    private readonly IBandService _bandService;

    public BandServiceTests()
    {
        _unitOfWork.ExecuteInTransactionAsync(Arg.Any<Func<Task>>()).Returns(ci => ci.Arg<Func<Task>>()());
        _userRepository
            .When(r => r.UpdateUserRoleAsync(Arg.Any<User>(), Arg.Any<Roles>()))
            .Do(ci => ci.Arg<User>().Role = ci.Arg<Roles>());

        _bandService = new BandService(_bandRepository, _userRepository, _unitOfWork, _accessStateProvider, NullLogger<BandService>.Instance);
    }

    [Fact]
    public async Task GetBandByIdAsync_WithValidId_ShouldReturnBandResponse()
    {
        var bandId = Guid.NewGuid();
        var band = new Band
        {
            Id = bandId,
            Name = "Test Band",
            Description = "A test band",
            Genre = "Rock",
            Country = "USA",
            City = "New York",
            CoverImage = [1, 2, 3],
            SpotifyId = "spotify123",
            YouTubeEmbedId = "youtube123",
            Members =
            [
                new() { Id = Guid.NewGuid(), UserName = "member1", ProfilePicture = [4, 5, 6] },
                new() { Id = Guid.NewGuid(), UserName = "member2", ProfilePicture = null }
            ]
        };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandByIdAsync(bandId);

        Assert.NotNull(result);
        Assert.Equal(bandId.ToString(), result.Id);
        Assert.Equal("Test Band", result.Name);
        Assert.Equal("A test band", result.Description);
        Assert.Equal("Rock", result.Genre);
        Assert.Equal("USA", result.Country);
        Assert.Equal("New York", result.City);
        Assert.Equal([1, 2, 3], result.CoverImage);
        Assert.Equal("spotify123", result.SpotifyId);
        Assert.Equal("youtube123", result.YouTubeEmbedId);
        Assert.NotNull(result.Members);
        Assert.Equal(2, result.Members.Count);
        Assert.Equal("member1", result.Members.First().Name);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        var bandId = Guid.NewGuid();
        _bandRepository.GetBandByIdAsync(bandId).Returns((Band?)null);

        var result = await _bandService.GetBandByIdAsync(bandId);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandByNameAsync_WithValidName_ShouldReturnBandResponse()
    {
        var bandName = "Test Band";
        var band = new Band
        {
            Id = Guid.NewGuid(),
            Name = bandName,
            Description = "A test band",
            Genre = "Rock",
            Country = "USA",
            City = "New York"
        };
        _bandRepository.GetBandByNameAsync(bandName).Returns(band);

        var result = await _bandService.GetBandByNameAsync(bandName);

        Assert.NotNull(result);
        Assert.Equal(bandName, result.Name);
        Assert.Equal("A test band", result.Description);
        Assert.Equal("Rock", result.Genre);
        await _bandRepository.Received(1).GetBandByNameAsync(bandName);
    }

    [Fact]
    public async Task GetBandByNameAsync_WithInvalidName_ShouldReturnNull()
    {
        var bandName = "Non-existent Band";
        _bandRepository.GetBandByNameAsync(bandName).Returns((Band?)null);

        var result = await _bandService.GetBandByNameAsync(bandName);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByNameAsync(bandName);
    }

    [Fact]
    public async Task GetBandByUserIdAsync_WithValidUserId_ShouldReturnBandResponse()
    {
        var userId = Guid.NewGuid().ToString();
        var band = new Band
        {
            Id = Guid.NewGuid(),
            Name = "User's Band",
            Description = "Band owned by user",
            Genre = "Pop",
            Country = "Canada",
            City = "Toronto"
        };
        _bandRepository.GetBandByUserIdAsync(userId).Returns(band);

        var result = await _bandService.GetBandByUserIdAsync(userId);

        Assert.NotNull(result);
        Assert.Equal("User's Band", result.Name);
        Assert.Equal("Band owned by user", result.Description);
        Assert.Equal("Pop", result.Genre);
        await _bandRepository.Received(1).GetBandByUserIdAsync(userId);
    }

    [Fact]
    public async Task GetBandByUserIdAsync_WithInvalidUserId_ShouldReturnNull()
    {
        var userId = Guid.NewGuid().ToString();
        _bandRepository.GetBandByUserIdAsync(userId).Returns((Band?)null);

        var result = await _bandService.GetBandByUserIdAsync(userId);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByUserIdAsync(userId);
    }

    [Fact]
    public async Task GetBandImageAsync_WithValidBandId_ShouldReturnImageData()
    {
        var bandId = Guid.NewGuid();
        byte[] imageData = [1, 2, 3, 4, 5];
        var band = new Band { Id = bandId, Name = "Test Band", Genre = "Rock", CoverImage = imageData };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandImageAsync(bandId);

        Assert.Equal(imageData, result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandImageAsync_WithBandWithoutImage_ShouldReturnNull()
    {
        var bandId = Guid.NewGuid();
        var band = new Band { Id = bandId, Name = "Test Band", Genre = "Rock", CoverImage = null };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandImageAsync(bandId);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandImageAsync_WithInvalidBandId_ShouldReturnNull()
    {
        var bandId = Guid.NewGuid();
        _bandRepository.GetBandByIdAsync(bandId).Returns((Band?)null);

        var result = await _bandService.GetBandImageAsync(bandId);

        Assert.Null(result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandMembersAsync_WithValidBandId_ShouldReturnMembersList()
    {
        var bandId = Guid.NewGuid();
        var band = new Band
        {
            Id = bandId,
            Name = "Test Band",
            Genre = "Rock",
            Members =
            [
                new() { Id = Guid.NewGuid(), UserName = "member1", Email = "member1@test.com", Role = Roles.BandMember },
                new() { Id = Guid.NewGuid(), UserName = "member2", Email = "member2@test.com", Role = Roles.BandAdmin },
                new() { Id = Guid.NewGuid(), UserName = "member3", Email = "member3@test.com", Role = Roles.BandMember }
            ]
        };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandMembersAsync(bandId);

        Assert.Equal(["member1", "member2", "member3"], result.Select(m => m.Name));
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    [Fact]
    public async Task GetBandMembersAsync_WithBandWithoutMembers_ShouldReturnEmptyArray()
    {
        var bandId = Guid.NewGuid();
        var band = new Band { Id = bandId, Name = "Test Band", Genre = "Rock", Members = [] };
        _bandRepository.GetBandByIdAsync(bandId).Returns(band);

        var result = await _bandService.GetBandMembersAsync(bandId);

        Assert.Empty(result);
        await _bandRepository.Received(1).GetBandByIdAsync(bandId);
    }

    private (User user, Band band) SetupUserAndBand(Roles role, bool isMember)
    {
        var user = new User { Id = Guid.NewGuid(), UserName = "user", Role = role };
        var band = new Band
        {
            Id = Guid.NewGuid(),
            Name = "Test Band",
            Genre = "Rock",
            Members = isMember ? [user] : []
        };

        _userRepository.GetUserByIdAsync(user.Id.ToString()).Returns(user);
        _bandRepository.GetBandByIdAsync(band.Id).Returns(band);

        return (user, band);
    }

    [Theory]
    [InlineData(Roles.Admin, false, true)]
    [InlineData(Roles.Admin, true, true)]
    [InlineData(Roles.BandAdmin, true, true)]
    [InlineData(Roles.BandAdmin, false, false)]
    [InlineData(Roles.BandMember, true, false)]
    [InlineData(Roles.Listener, false, false)]
    public async Task CanManageBandAsync_ShouldDependOnRoleAndMembership(Roles role, bool isMember, bool expected)
    {
        var (user, band) = SetupUserAndBand(role, isMember);

        var result = await _bandService.CanManageBandAsync(user.Id, band.Id);

        Assert.Equal(expected, result);
    }

    [Fact]
    public async Task CanManageBandAsync_WithUnknownUser_ShouldReturnFalse()
    {
        _userRepository.GetUserByIdAsync(Arg.Any<string>()).Returns((User?)null);

        var result = await _bandService.CanManageBandAsync(Guid.NewGuid(), Guid.NewGuid());

        Assert.False(result);
    }

    [Fact]
    public async Task CanManageBandAsync_WithUnknownBand_ShouldReturnFalse()
    {
        var (user, _) = SetupUserAndBand(Roles.BandAdmin, isMember: true);

        var result = await _bandService.CanManageBandAsync(user.Id, Guid.NewGuid());

        Assert.False(result);
    }

    [Fact]
    public async Task CanManageBandAsync_WithSuspendedBandAdmin_ShouldReturnFalse()
    {
        var (user, band) = SetupUserAndBand(Roles.BandAdmin, isMember: true);
        user.LockoutEnd = DateTimeOffset.MaxValue;

        Assert.False(await _bandService.CanManageBandAsync(user.Id, band.Id));
    }

    // ---- Membership helpers ----

    private User AddUser(Roles role, string name = "member")
    {
        var user = new User { Id = Guid.NewGuid(), UserName = name, Role = role };
        _userRepository.GetUserByIdAsync(user.Id.ToString()).Returns(user);
        return user;
    }

    private Band AddBand(params User[] members)
    {
        var band = new Band { Id = Guid.NewGuid(), Name = "Test Band", Genre = "Rock", Members = [.. members] };
        _bandRepository.GetBandByIdAsync(band.Id).Returns(band);
        foreach (var member in members)
        {
            _bandRepository.GetBandByUserIdAsync(member.Id.ToString()).Returns(band);
        }
        return band;
    }

    // ---- Add member ----

    [Fact]
    public async Task AddMemberToBandAsync_WithListener_ShouldAddAndPromoteToBandMember()
    {
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"));
        var user = AddUser(Roles.Listener);

        await _bandService.AddMemberToBandAsync(user.Id, band.Id);

        Assert.Contains(user, band.Members);
        Assert.Equal(Roles.BandMember, user.Role);
        await _bandRepository.Received(1).UpdateBandAsync(band);
        _accessStateProvider.Received().Invalidate(user.Id);
    }

    [Fact]
    public async Task AddMemberToBandAsync_WithSiteAdmin_ShouldKeepAdminRole()
    {
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"));
        var admin = AddUser(Roles.Admin);

        await _bandService.AddMemberToBandAsync(admin.Id, band.Id);

        Assert.Contains(admin, band.Members);
        Assert.Equal(Roles.Admin, admin.Role);
    }

    [Fact]
    public async Task AddMemberToBandAsync_WithStaleBandRoleButNoBand_ShouldNormaliseToBandMember()
    {
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"));
        var user = AddUser(Roles.BandAdmin);

        await _bandService.AddMemberToBandAsync(user.Id, band.Id);

        Assert.Equal(Roles.BandMember, user.Role);
    }

    [Fact]
    public async Task AddMemberToBandAsync_WithExistingMember_ShouldThrowConflict()
    {
        var user = AddUser(Roles.BandMember);
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"), user);

        await Assert.ThrowsAsync<ConflictException>(() => _bandService.AddMemberToBandAsync(user.Id, band.Id));
        Assert.Equal(2, band.Members.Count);
    }

    [Fact]
    public async Task AddMemberToBandAsync_WithMemberOfAnotherBand_ShouldThrowConflict()
    {
        var user = AddUser(Roles.BandMember);
        AddBand(AddUser(Roles.BandAdmin, "other leader"), user);
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"));

        await Assert.ThrowsAsync<ConflictException>(() => _bandService.AddMemberToBandAsync(user.Id, band.Id));
        Assert.DoesNotContain(user, band.Members);
    }

    [Fact]
    public async Task AddMemberToBandAsync_WithSuspendedUser_ShouldThrowConflict()
    {
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"));
        var user = AddUser(Roles.Listener);
        user.LockoutEnd = DateTimeOffset.MaxValue;

        await Assert.ThrowsAsync<ConflictException>(() => _bandService.AddMemberToBandAsync(user.Id, band.Id));
    }

    [Fact]
    public async Task AddMemberToBandAsync_WithUnknownBand_ShouldThrowNotFound()
    {
        var user = AddUser(Roles.Listener);

        await Assert.ThrowsAsync<NotFoundException>(() => _bandService.AddMemberToBandAsync(user.Id, Guid.NewGuid()));
    }

    // ---- Remove member / leave ----

    [Fact]
    public async Task RemoveMemberAsync_WithMember_ShouldRemoveAndReturnToListener()
    {
        var member = AddUser(Roles.BandMember);
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"), member);

        await _bandService.RemoveMemberAsync(band.Id, member.Id);

        Assert.DoesNotContain(member, band.Members);
        Assert.Equal(Roles.Listener, member.Role);
        _accessStateProvider.Received().Invalidate(member.Id);
    }

    [Fact]
    public async Task RemoveMemberAsync_WithSiteAdminMember_ShouldKeepAdminRole()
    {
        var admin = AddUser(Roles.Admin);
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"), admin);

        await _bandService.RemoveMemberAsync(band.Id, admin.Id);

        Assert.Equal(Roles.Admin, admin.Role);
    }

    [Fact]
    public async Task RemoveMemberAsync_WithOneOfTwoManagers_ShouldSucceed()
    {
        var coLeader = AddUser(Roles.BandAdmin, "co-leader");
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"), coLeader);

        await _bandService.RemoveMemberAsync(band.Id, coLeader.Id);

        Assert.Equal(Roles.Listener, coLeader.Role);
    }

    [Fact]
    public async Task RemoveMemberAsync_WithSoleManager_ShouldThrowConflict()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var band = AddBand(leader, AddUser(Roles.BandMember));

        await Assert.ThrowsAsync<ConflictException>(() => _bandService.RemoveMemberAsync(band.Id, leader.Id));
        Assert.Contains(leader, band.Members);
        Assert.Equal(Roles.BandAdmin, leader.Role);
    }

    [Fact]
    public async Task RemoveMemberAsync_WithOnlyMember_ShouldThrowConflict()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var band = AddBand(leader);

        await Assert.ThrowsAsync<ConflictException>(() => _bandService.RemoveMemberAsync(band.Id, leader.Id));
    }

    [Fact]
    public async Task RemoveMemberAsync_WithNonMember_ShouldThrowNotFound()
    {
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"));
        var outsider = AddUser(Roles.Listener);

        await Assert.ThrowsAsync<NotFoundException>(() => _bandService.RemoveMemberAsync(band.Id, outsider.Id));
    }

    // ---- Member roles within a band ----

    [Fact]
    public async Task SetMemberRoleAsync_PromoteMember_ShouldMakeBandAdmin()
    {
        var member = AddUser(Roles.BandMember);
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"), member);

        await _bandService.SetMemberRoleAsync(band.Id, member.Id, Roles.BandAdmin);

        Assert.Equal(Roles.BandAdmin, member.Role);
    }

    [Fact]
    public async Task SetMemberRoleAsync_DemoteSoleManager_ShouldThrowConflict()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var band = AddBand(leader, AddUser(Roles.BandMember));

        await Assert.ThrowsAsync<ConflictException>(() => _bandService.SetMemberRoleAsync(band.Id, leader.Id, Roles.BandMember));
        Assert.Equal(Roles.BandAdmin, leader.Role);
    }

    [Theory]
    [InlineData(Roles.Admin)]
    [InlineData(Roles.Listener)]
    public async Task SetMemberRoleAsync_WithNonBandRole_ShouldThrowConflict(Roles role)
    {
        var member = AddUser(Roles.BandMember);
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"), member);

        await Assert.ThrowsAsync<ConflictException>(() => _bandService.SetMemberRoleAsync(band.Id, member.Id, role));
        Assert.Equal(Roles.BandMember, member.Role);
    }

    [Fact]
    public async Task SetMemberRoleAsync_OnSiteAdmin_ShouldThrowConflict()
    {
        var admin = AddUser(Roles.Admin);
        var band = AddBand(AddUser(Roles.BandAdmin, "leader"), admin);

        await Assert.ThrowsAsync<ConflictException>(() => _bandService.SetMemberRoleAsync(band.Id, admin.Id, Roles.BandMember));
        Assert.Equal(Roles.Admin, admin.Role);
    }

    // ---- Create / delete ----

    [Fact]
    public async Task CreateBandAsync_WithMemberOfAnotherBand_ShouldThrowConflict()
    {
        var user = AddUser(Roles.BandMember);
        AddBand(AddUser(Roles.BandAdmin, "leader"), user);

        await Assert.ThrowsAsync<ConflictException>(() => _bandService.CreateBandAsync(
            new(user.Id.ToString(), "New Band", "desc", "Rock", "Bulgaria, Sofia", null)));
        await _bandRepository.DidNotReceiveWithAnyArgs().InsertBandAsync(default!);
    }

    [Theory]
    [InlineData(Roles.Listener, Roles.BandAdmin)]
    [InlineData(Roles.Admin, Roles.Admin)]
    public async Task CreateBandAsync_ShouldAssignCreatorRole(Roles initialRole, Roles expectedRole)
    {
        var user = AddUser(initialRole);

        var result = await _bandService.CreateBandAsync(
            new(user.Id.ToString(), "New Band", "desc", "Rock", "Bulgaria, Sofia", null));

        Assert.NotNull(result);
        Assert.Equal(expectedRole, user.Role);
        await _bandRepository.Received(1).InsertBandAsync(Arg.Is<Band>(b => b.Members.Contains(user)));
    }

    [Fact]
    public async Task DeleteBandAsync_ShouldReturnMembersToNonBandRoles()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var member = AddUser(Roles.BandMember);
        var admin = AddUser(Roles.Admin, "site admin");
        var band = AddBand(leader, member, admin);

        await _bandService.DeleteBandAsync(band.Id);

        Assert.Equal(Roles.Listener, leader.Role);
        Assert.Equal(Roles.Listener, member.Role);
        Assert.Equal(Roles.Admin, admin.Role);
        await _bandRepository.Received(1).DeleteBandAsync(band.Id);
    }

    [Fact]
    public async Task DeleteBandAsync_WithUnknownBand_ShouldThrowNotFound()
    {
        await Assert.ThrowsAsync<NotFoundException>(() => _bandService.DeleteBandAsync(Guid.NewGuid()));
    }
}
