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

public class BandInvitationServiceTests
{
    private readonly IBandInvitationRepository _invitationRepository = Substitute.For<IBandInvitationRepository>();
    private readonly IBandRepository _bandRepository = Substitute.For<IBandRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IBandService _bandService = Substitute.For<IBandService>();
    private readonly IUnitOfWork _unitOfWork = Substitute.For<IUnitOfWork>();
    private readonly IBandInvitationService _service;

    public BandInvitationServiceTests()
    {
        _unitOfWork.ExecuteInTransactionAsync(Arg.Any<Func<Task>>()).Returns(ci => ci.Arg<Func<Task>>()());

        _service = new BandInvitationService(
            _invitationRepository,
            _bandRepository,
            _userRepository,
            _bandService,
            _unitOfWork,
            NullLogger<BandInvitationService>.Instance);
    }

    // ---- Invite ----

    [Fact]
    public async Task InviteMemberAsync_WithListener_ShouldCreateInvitationWithoutJoining()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var band = AddBand(leader);
        var user = AddUser(Roles.Listener, "guitarist");

        var result = await _service.InviteMemberAsync(band.Id, user.Id, leader.Id);

        Assert.Equal(band.Name, result.BandName);
        Assert.Equal("guitarist", result.UserName);
        Assert.Equal("leader", result.InvitedByName);
        await _invitationRepository.Received(1).InsertInvitationAsync(Arg.Is<BandInvitation>(i =>
            i.BandId == band.Id && i.UserId == user.Id && i.InvitedById == leader.Id));
        Assert.DoesNotContain(user, band.Members);
        Assert.Equal(Roles.Listener, user.Role);
        await _bandService.DidNotReceiveWithAnyArgs().AddMemberToBandAsync(default, default);
    }

    [Fact]
    public async Task InviteMemberAsync_WithExistingMember_ShouldThrowConflict()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var user = AddUser(Roles.BandMember);
        var band = AddBand(leader, user);

        await Assert.ThrowsAsync<ConflictException>(() => _service.InviteMemberAsync(band.Id, user.Id, leader.Id));
        await _invitationRepository.DidNotReceiveWithAnyArgs().InsertInvitationAsync(default!);
    }

    [Fact]
    public async Task InviteMemberAsync_WithMemberOfAnotherBand_ShouldThrowConflict()
    {
        var user = AddUser(Roles.BandMember);
        AddBand(AddUser(Roles.BandAdmin, "other leader"), user);
        var leader = AddUser(Roles.BandAdmin, "leader");
        var band = AddBand(leader);

        await Assert.ThrowsAsync<ConflictException>(() => _service.InviteMemberAsync(band.Id, user.Id, leader.Id));
    }

    [Fact]
    public async Task InviteMemberAsync_WithSuspendedUser_ShouldThrowConflict()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var band = AddBand(leader);
        var user = AddUser(Roles.Listener);
        user.LockoutEnd = DateTimeOffset.MaxValue;

        await Assert.ThrowsAsync<ConflictException>(() => _service.InviteMemberAsync(band.Id, user.Id, leader.Id));
    }

    [Fact]
    public async Task InviteMemberAsync_WhenAlreadyInvited_ShouldThrowConflict()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var band = AddBand(leader);
        var user = AddUser(Roles.Listener);
        _invitationRepository.InvitationExistsAsync(band.Id, user.Id).Returns(true);

        await Assert.ThrowsAsync<ConflictException>(() => _service.InviteMemberAsync(band.Id, user.Id, leader.Id));
        await _invitationRepository.DidNotReceiveWithAnyArgs().InsertInvitationAsync(default!);
    }

    [Fact]
    public async Task InviteMemberAsync_WithUnknownBand_ShouldThrowNotFound()
    {
        var user = AddUser(Roles.Listener);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.InviteMemberAsync(Guid.NewGuid(), user.Id, Guid.NewGuid()));
    }

    [Fact]
    public async Task InviteMemberAsync_WithUnknownUser_ShouldThrowNotFound()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var band = AddBand(leader);

        await Assert.ThrowsAsync<NotFoundException>(() => _service.InviteMemberAsync(band.Id, Guid.NewGuid(), leader.Id));
    }

    // ---- Accept ----

    [Fact]
    public async Task AcceptInvitationAsync_WithOwnInvitation_ShouldJoinBandAndClearInvitations()
    {
        var invitation = AddInvitation();

        var result = await _service.AcceptInvitationAsync(invitation.Id, invitation.UserId);

        Assert.Equal(invitation.BandId.ToString(), result.BandId);
        await _bandService.Received(1).AddMemberToBandAsync(invitation.UserId, invitation.BandId);
        await _invitationRepository.Received(1).DeleteInvitationsForUserAsync(invitation.UserId);
    }

    [Fact]
    public async Task AcceptInvitationAsync_WithSomeoneElsesInvitation_ShouldThrowNotFound()
    {
        var invitation = AddInvitation();

        await Assert.ThrowsAsync<NotFoundException>(() => _service.AcceptInvitationAsync(invitation.Id, Guid.NewGuid()));
        await _bandService.DidNotReceiveWithAnyArgs().AddMemberToBandAsync(default, default);
    }

    [Fact]
    public async Task AcceptInvitationAsync_WhenJoiningIsRefused_ShouldKeepInvitations()
    {
        var invitation = AddInvitation();
        _bandService.AddMemberToBandAsync(invitation.UserId, invitation.BandId)
            .Returns(Task.FromException(new ConflictException("already in a band")));

        await Assert.ThrowsAsync<ConflictException>(() => _service.AcceptInvitationAsync(invitation.Id, invitation.UserId));
        await _invitationRepository.DidNotReceiveWithAnyArgs().DeleteInvitationsForUserAsync(default);
    }

    [Fact]
    public async Task AcceptInvitationAsync_WithUnknownInvitation_ShouldThrowNotFound()
    {
        await Assert.ThrowsAsync<NotFoundException>(() => _service.AcceptInvitationAsync(Guid.NewGuid(), Guid.NewGuid()));
    }

    // ---- Decline ----

    [Fact]
    public async Task DeclineInvitationAsync_WithOwnInvitation_ShouldDeleteItWithoutJoining()
    {
        var invitation = AddInvitation();

        await _service.DeclineInvitationAsync(invitation.Id, invitation.UserId);

        await _invitationRepository.Received(1).DeleteInvitationAsync(invitation);
        await _bandService.DidNotReceiveWithAnyArgs().AddMemberToBandAsync(default, default);
    }

    [Fact]
    public async Task DeclineInvitationAsync_WithSomeoneElsesInvitation_ShouldThrowNotFound()
    {
        var invitation = AddInvitation();

        await Assert.ThrowsAsync<NotFoundException>(() => _service.DeclineInvitationAsync(invitation.Id, Guid.NewGuid()));
        await _invitationRepository.DidNotReceiveWithAnyArgs().DeleteInvitationAsync(default!);
    }

    // ---- Cancel ----

    [Fact]
    public async Task CancelInvitationAsync_WithBandsInvitation_ShouldDeleteIt()
    {
        var invitation = AddInvitation();

        await _service.CancelInvitationAsync(invitation.BandId, invitation.Id);

        await _invitationRepository.Received(1).DeleteInvitationAsync(invitation);
    }

    [Fact]
    public async Task CancelInvitationAsync_WithAnotherBandsInvitation_ShouldThrowNotFound()
    {
        var invitation = AddInvitation();

        await Assert.ThrowsAsync<NotFoundException>(() => _service.CancelInvitationAsync(Guid.NewGuid(), invitation.Id));
        await _invitationRepository.DidNotReceiveWithAnyArgs().DeleteInvitationAsync(default!);
    }

    // ---- Helpers ----

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

    private BandInvitation AddInvitation()
    {
        var leader = AddUser(Roles.BandAdmin, "leader");
        var band = AddBand(leader);
        var user = AddUser(Roles.Listener, "guitarist");
        var invitation = new BandInvitation
        {
            Id = Guid.NewGuid(),
            BandId = band.Id,
            UserId = user.Id,
            InvitedById = leader.Id,
            CreatedAt = DateTime.UtcNow,
            Band = band,
            User = user,
            InvitedBy = leader,
        };
        _invitationRepository.GetInvitationByIdAsync(invitation.Id).Returns(invitation);
        return invitation;
    }
}
