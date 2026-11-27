using Microsoft.Extensions.Logging;
using TuneSpace.Core.DTOs.Responses.Band;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Application.Services;

internal class BandInvitationService(
    IBandInvitationRepository invitationRepository,
    IBandRepository bandRepository,
    IUserRepository userRepository,
    IBandService bandService,
    IUnitOfWork unitOfWork,
    ILogger<BandInvitationService> logger) : IBandInvitationService
{
    private readonly IBandInvitationRepository _invitationRepository = invitationRepository;
    private readonly IBandRepository _bandRepository = bandRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IBandService _bandService = bandService;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly ILogger<BandInvitationService> _logger = logger;

    async Task<BandInvitationResponse> IBandInvitationService.InviteMemberAsync(Guid bandId, Guid userId, Guid invitedById)
    {
        var band = await _bandRepository.GetBandByIdAsync(bandId)
            ?? throw new NotFoundException("Band not found");
        var user = await _userRepository.GetUserByIdAsync(userId.ToString())
            ?? throw new NotFoundException("User not found");

        if (band.Members.Any(m => m.Id == user.Id))
        {
            throw new ConflictException($"{user.UserName} is already a member of {band.Name}.");
        }

        if (user.IsSuspended)
        {
            throw new ConflictException($"{user.UserName}'s account is suspended, so they can't join a band.");
        }

        var currentBand = await _bandRepository.GetBandByUserIdAsync(user.Id.ToString());
        if (currentBand is not null)
        {
            throw new ConflictException($"{user.UserName} already belongs to {currentBand.Name}.");
        }

        if (await _invitationRepository.InvitationExistsAsync(band.Id, user.Id))
        {
            throw new ConflictException($"{user.UserName} has already been invited to {band.Name}.");
        }

        var inviter = await _userRepository.GetUserByIdAsync(invitedById.ToString());

        var invitation = new BandInvitation
        {
            BandId = band.Id,
            UserId = user.Id,
            InvitedById = inviter?.Id,
            CreatedAt = DateTime.UtcNow,
            Band = band,
            User = user,
            InvitedBy = inviter,
        };

        await _invitationRepository.InsertInvitationAsync(invitation);

        _logger.LogInformation("User {UserId} invited to band {BandId} by {InviterId}", user.Id, band.Id, invitedById);

        return ToResponse(invitation);
    }

    async Task<List<BandInvitationResponse>> IBandInvitationService.GetBandInvitationsAsync(Guid bandId)
    {
        var invitations = await _invitationRepository.GetInvitationsForBandAsync(bandId);
        return [.. invitations.Select(ToResponse)];
    }

    async Task<List<BandInvitationResponse>> IBandInvitationService.GetUserInvitationsAsync(Guid userId)
    {
        var invitations = await _invitationRepository.GetInvitationsForUserAsync(userId);
        return [.. invitations.Select(ToResponse)];
    }

    async Task<BandInvitationResponse> IBandInvitationService.AcceptInvitationAsync(Guid invitationId, Guid userId)
    {
        var invitation = await GetOwnInvitationOrThrowAsync(invitationId, userId);
        var response = ToResponse(invitation);

        // Joining re-checks every membership rule, since things may have changed since the invitation was sent.
        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await _bandService.AddMemberToBandAsync(userId, invitation.BandId);
            await _invitationRepository.DeleteInvitationsForUserAsync(userId);
        });

        _logger.LogInformation("User {UserId} accepted invitation {InvitationId} to band {BandId}", userId, invitationId, invitation.BandId);

        return response;
    }

    async Task<BandInvitationResponse> IBandInvitationService.DeclineInvitationAsync(Guid invitationId, Guid userId)
    {
        var invitation = await GetOwnInvitationOrThrowAsync(invitationId, userId);
        var response = ToResponse(invitation);

        await _invitationRepository.DeleteInvitationAsync(invitation);

        _logger.LogInformation("User {UserId} declined invitation {InvitationId} to band {BandId}", userId, invitationId, invitation.BandId);

        return response;
    }

    async Task IBandInvitationService.CancelInvitationAsync(Guid bandId, Guid invitationId)
    {
        var invitation = await _invitationRepository.GetInvitationByIdAsync(invitationId);
        if (invitation is null || invitation.BandId != bandId)
        {
            throw new NotFoundException("Invitation not found");
        }

        await _invitationRepository.DeleteInvitationAsync(invitation);

        _logger.LogInformation("Invitation {InvitationId} to band {BandId} was withdrawn", invitationId, bandId);
    }

    private async Task<BandInvitation> GetOwnInvitationOrThrowAsync(Guid invitationId, Guid userId)
    {
        var invitation = await _invitationRepository.GetInvitationByIdAsync(invitationId);

        // Someone else's invitation is reported as missing so its existence isn't revealed.
        if (invitation is null || invitation.UserId != userId)
        {
            throw new NotFoundException("Invitation not found");
        }

        return invitation;
    }

    private static BandInvitationResponse ToResponse(BandInvitation invitation) => new(
        invitation.Id.ToString(),
        invitation.BandId.ToString(),
        invitation.Band?.Name ?? string.Empty,
        invitation.Band?.CoverImage,
        invitation.UserId.ToString(),
        invitation.User?.UserName ?? string.Empty,
        invitation.User?.ProfilePicture,
        invitation.InvitedById?.ToString(),
        invitation.InvitedBy?.UserName,
        invitation.CreatedAt);
}
