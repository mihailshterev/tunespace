using TuneSpace.Core.DTOs.Requests.Band;
using TuneSpace.Core.DTOs.Responses.Band;
using TuneSpace.Core.DTOs.Responses.User;
using TuneSpace.Core.Enums;

namespace TuneSpace.Core.Interfaces.IServices;

/// <summary>
/// Provides business logic services for managing bands in the TuneSpace application.
/// </summary>
public interface IBandService
{
    /// <summary>
    /// Retrieves a band by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the band to retrieve.</param>
    /// <returns>The band response if found; otherwise, null.</returns>
    Task<BandResponse?> GetBandByIdAsync(Guid id);

    /// <summary>
    /// Retrieves a band by its name.
    /// </summary>
    /// <param name="name">The name of the band to retrieve.</param>
    /// <returns>The band response if found; otherwise, null.</returns>
    Task<BandResponse?> GetBandByNameAsync(string name);

    /// <summary>
    /// Retrieves a band associated with a specific user.
    /// </summary>
    /// <param name="id">The unique identifier of the user who owns the band.</param>
    /// <returns>The band if found; otherwise, null.</returns>
    Task<BandResponse?> GetBandByUserIdAsync(string id);

    /// <summary>
    /// Retrieves the image data for a specific band.
    /// </summary>
    /// <param name="bandId">The unique identifier of the band whose image should be retrieved.</param>
    /// <returns>The image data as a byte array if available; otherwise, null.</returns>
    Task<byte[]?> GetBandImageAsync(Guid bandId);

    /// <summary>
    /// Gets a list of the members of a specific band.
    /// </summary>
    /// <param name="bandId">The unique identifier of the band whose members are to be retrieved.</param>
    /// <returns>An array of user result responses representing the members of the band.</returns>
    Task<UserSearchResultResponse[]> GetBandMembersAsync(Guid bandId);

    /// <summary>
    /// Creates a new band based on the provided request data.
    /// </summary>
    /// <param name="request">The data required to create a band, including name, description, genre, and image.</param>
    /// <returns>The created band response if successful; otherwise, null.</returns>
    Task<BandResponse?> CreateBandAsync(CreateBandRequest request);

    /// <summary>
    /// Updates an existing band with the provided information.
    /// </summary>
    /// <param name="request">The data containing updates to the band, which may include name, description, genre, and image.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateBandAsync(UpdateBandRequest request);

    /// <summary>
    /// Adds a user to a band and gives them the BandMember role (site admins keep Admin).
    /// Users join by accepting an invitation (see <see cref="IBandInvitationService"/>), which calls this.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to add as a member.</param>
    /// <param name="bandId">The unique identifier of the band to which the user will be added.</param>
    /// <exception cref="Exceptions.NotFoundException">The band or user does not exist.</exception>
    /// <exception cref="Exceptions.ConflictException">The user is suspended, already in this band, or belongs to another band.</exception>
    Task AddMemberToBandAsync(Guid userId, Guid bandId);

    /// <summary>
    /// Removes a member from a band (or lets them leave) and returns them to Listener (site admins keep Admin).
    /// Callers must check permission: band managers may remove anyone; members may remove themselves.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The band does not exist or the user is not a member.</exception>
    /// <exception cref="Exceptions.ConflictException">The user is the band's only member or only manager.</exception>
    Task RemoveMemberAsync(Guid bandId, Guid userId);

    /// <summary>
    /// Changes a member's role within their band between BandAdmin and BandMember. Callers must check the actor can manage the band.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The band does not exist or the user is not a member.</exception>
    /// <exception cref="Exceptions.ConflictException">The role isn't a band role, the member is a site admin, or the change would leave the band without a manager.</exception>
    Task SetMemberRoleAsync(Guid bandId, Guid userId, Roles role);

    /// <summary>
    /// Determines whether a user may manage a band: edit its profile, change its members or delete it.
    /// Site admins may manage any band; band admins only bands they belong to. Suspended users manage nothing.
    /// The role is read from the database, so it stays correct even when the caller's access token is stale.
    /// </summary>
    /// <param name="userId">The unique identifier of the user attempting the action.</param>
    /// <param name="bandId">The unique identifier of the band being managed.</param>
    /// <returns>True if the user may manage the band; otherwise, false.</returns>
    Task<bool> CanManageBandAsync(Guid userId, Guid bandId);

    /// <summary>
    /// Deletes a band with its events, merchandise, chats and follows, and returns every member to
    /// Listener (site admins keep Admin).
    /// </summary>
    /// <param name="id">The unique identifier of the band to delete.</param>
    /// <exception cref="Exceptions.NotFoundException">The band does not exist.</exception>
    Task DeleteBandAsync(Guid id);
}
