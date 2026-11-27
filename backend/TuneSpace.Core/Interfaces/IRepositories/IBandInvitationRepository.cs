using TuneSpace.Core.Entities;

namespace TuneSpace.Core.Interfaces.IRepositories;

/// <summary>
/// Data access for pending band invitations.
/// </summary>
public interface IBandInvitationRepository
{
    /// <summary>
    /// Gets an invitation with its band, invited user and inviter loaded.
    /// </summary>
    Task<BandInvitation?> GetInvitationByIdAsync(Guid id);

    /// <summary>
    /// Gets the pending invitations sent to a user, newest first, with band and inviter loaded.
    /// </summary>
    Task<List<BandInvitation>> GetInvitationsForUserAsync(Guid userId);

    /// <summary>
    /// Gets the pending invitations a band has sent, newest first, with invited user and inviter loaded.
    /// </summary>
    Task<List<BandInvitation>> GetInvitationsForBandAsync(Guid bandId);

    /// <summary>
    /// Checks whether a band already has a pending invitation for a user.
    /// </summary>
    Task<bool> InvitationExistsAsync(Guid bandId, Guid userId);

    Task InsertInvitationAsync(BandInvitation invitation);

    Task DeleteInvitationAsync(BandInvitation invitation);

    /// <summary>
    /// Deletes every pending invitation sent to a user, such as once they have joined a band.
    /// </summary>
    Task DeleteInvitationsForUserAsync(Guid userId);
}
