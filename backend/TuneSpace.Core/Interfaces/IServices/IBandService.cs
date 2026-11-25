using TuneSpace.Core.DTOs.Requests.Band;
using TuneSpace.Core.DTOs.Responses.Band;
using TuneSpace.Core.DTOs.Responses.User;

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
    /// Adds a user as a member to a specific band.
    /// </summary>
    /// <param name="userId">The unique identifier of the user to add as a member.</param>
    /// <param name="bandId">The unique identifier of the band to which the user will be added.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task AddMemberToBandAsync(Guid userId, Guid bandId);

    /// <summary>
    /// Determines whether a user may manage a band: edit its profile, change its members or delete it.
    /// Site admins may manage any band; band admins only bands they belong to.
    /// The role is read from the database, so it stays correct even when the caller's access token is stale.
    /// </summary>
    /// <param name="userId">The unique identifier of the user attempting the action.</param>
    /// <param name="bandId">The unique identifier of the band being managed.</param>
    /// <returns>True if the user may manage the band; otherwise, false.</returns>
    Task<bool> CanManageBandAsync(Guid userId, Guid bandId);

    /// <summary>
    /// Deletes a band from the system.
    /// </summary>
    /// <param name="id">The unique identifier of the band to delete.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteBandAsync(Guid id);
}
