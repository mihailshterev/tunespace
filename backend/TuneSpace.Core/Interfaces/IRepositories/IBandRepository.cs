using TuneSpace.Core.Entities;
using TuneSpace.Core.Models;

namespace TuneSpace.Core.Interfaces.IRepositories;

/// <summary>
/// Provides data access methods for managing bands in the TuneSpace application.
/// </summary>
public interface IBandRepository
{
    /// <summary>
    /// Retrieves all bands from the database.
    /// </summary>
    /// <returns>A list of all band entities.</returns>
    Task<List<Band>> GetAllBandsAsync();

    /// <summary>
    /// Retrieves bands filtered by a specific genre.
    /// </summary>
    /// <param name="genre">The genre to filter by.</param>
    /// <returns>A list of bands matching the specified genre.</returns>
    Task<List<Band>> GetBandsByGenreAsync(string genre);

    /// <summary>
    /// Retrieves bands filtered by a specific location.
    /// </summary>
    /// <param name="location">The location (city, country) to filter by.</param>
    /// <returns>A list of bands from the specified location.</returns>
    Task<List<Band>> GetBandsByLocationAsync(string location);

    /// <summary>
    /// Retrieves bands filtered by both genre and location.
    /// </summary>
    /// <param name="genre">The genre to filter by.</param>
    /// <param name="location">The location to filter by.</param>
    /// <returns>A list of bands matching both the specified genre and location.</returns>
    Task<List<Band>> GetBandsByGenreAndLocationAsync(string genre, string location);

    /// <summary>
    /// Retrieves a specific band by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the band.</param>
    /// <returns>The band if found; otherwise, null.</returns>
    Task<Band?> GetBandByIdAsync(Guid id);

    /// <summary>
    /// Retrieves a band by its name.
    /// </summary>
    /// <param name="name">The name of the band to search for.</param>
    /// <returns>The band if found; otherwise, null.</returns>
    Task<Band?> GetBandByNameAsync(string name);

    /// <summary>
    /// Retrieves a band associated with a specific user.
    /// </summary>
    /// <param name="id">The user ID to search for.</param>
    /// <returns>The band if found; otherwise, null.</returns>
    Task<Band?> GetBandByUserIdAsync(string id);

    /// <summary>
    /// Inserts a new band into the database.
    /// </summary>
    /// <param name="band">The band entity to insert.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task InsertBandAsync(Band band);

    /// <summary>
    /// Updates an existing band's information in the database.
    /// </summary>
    /// <param name="band">The band entity with updated information.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateBandAsync(Band band);

    /// <summary>
    /// Deletes a band from the database.
    /// </summary>
    /// <param name="id">The unique identifier of the band to delete.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteBandAsync(Guid id);

    /// <summary>
    /// Retrieves member and manager counts for the given bands.
    /// </summary>
    /// <param name="bandIds">The bands to summarise; unknown IDs are omitted from the result.</param>
    /// <returns>Summaries keyed by band ID.</returns>
    Task<Dictionary<Guid, BandSummary>> GetBandSummariesAsync(IReadOnlyCollection<Guid> bandIds);
}
