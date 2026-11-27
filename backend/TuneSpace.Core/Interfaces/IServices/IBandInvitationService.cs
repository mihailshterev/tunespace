using TuneSpace.Core.DTOs.Responses.Band;

namespace TuneSpace.Core.Interfaces.IServices;

/// <summary>
/// Manages invitations to join a band. A band manager invites a user, and the user joins the band
/// only once they accept.
/// </summary>
public interface IBandInvitationService
{
    /// <summary>
    /// Invites a user to a band. Callers must check that the inviter can manage the band.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The band or user does not exist.</exception>
    /// <exception cref="Exceptions.ConflictException">The user is suspended, already in a band, or already invited to this band.</exception>
    Task<BandInvitationResponse> InviteMemberAsync(Guid bandId, Guid userId, Guid invitedById);

    /// <summary>
    /// Gets the pending invitations a band has sent. Callers must check that the actor can manage the band.
    /// </summary>
    Task<List<BandInvitationResponse>> GetBandInvitationsAsync(Guid bandId);

    /// <summary>
    /// Gets the pending invitations sent to a user.
    /// </summary>
    Task<List<BandInvitationResponse>> GetUserInvitationsAsync(Guid userId);

    /// <summary>
    /// Accepts an invitation: the user joins the band and all their other pending invitations are removed.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The invitation does not exist or was sent to someone else.</exception>
    /// <exception cref="Exceptions.ConflictException">The user can no longer join the band, for example because they joined another band.</exception>
    Task<BandInvitationResponse> AcceptInvitationAsync(Guid invitationId, Guid userId);

    /// <summary>
    /// Declines an invitation and removes it.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The invitation does not exist or was sent to someone else.</exception>
    Task<BandInvitationResponse> DeclineInvitationAsync(Guid invitationId, Guid userId);

    /// <summary>
    /// Withdraws an invitation a band has sent. Callers must check that the actor can manage the band.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The invitation does not exist or belongs to another band.</exception>
    Task CancelInvitationAsync(Guid bandId, Guid invitationId);
}
