using Pgvector;
using TuneSpace.Core.Entities;

namespace TuneSpace.Core.Interfaces.IRepositories;

/// <summary>
/// Repository interface for managing artist embeddings in the TuneSpace application.
/// Provides methods for CRUD operations and similarity searches using vector embeddings
/// to enable music discovery and artist recommendation features.
/// </summary>
public interface IArtistEmbeddingRepository
{
    /// <summary>
    /// Retrieves an artist embedding by the artist's name.
    /// </summary>
    /// <param name="artistName">The name of the artist to search for.</param>
    /// <returns>The artist embedding if found, otherwise null.</returns>
    Task<ArtistEmbedding?> GetByArtistNameAsync(string artistName);

    /// <summary>
    /// Retrieves an artist embedding by the artist's Spotify ID.
    /// </summary>
    /// <param name="spotifyId">The Spotify ID of the artist.</param>
    /// <returns>The artist embedding if found, otherwise null.</returns>
    Task<ArtistEmbedding?> GetBySpotifyIdAsync(string spotifyId);

    /// <summary>
    /// Retrieves artist embeddings filtered by one or more genres.
    /// </summary>
    /// <param name="genres">List of genres to filter by.</param>
    /// <param name="limit">Maximum number of results to return. Default is 50.</param>
    /// <returns>List of artist embeddings matching the specified genres.</returns>
    Task<List<ArtistEmbedding>> GetByGenresAsync(List<string> genres, int limit = 50);

    /// <summary>
    /// Retrieves artist embeddings filtered by location.
    /// </summary>
    /// <param name="location">The location to filter artists by.</param>
    /// <param name="limit">Maximum number of results to return. Default is 50.</param>
    /// <returns>List of artist embeddings from the specified location.</returns>
    Task<List<ArtistEmbedding>> GetByLocationAsync(string location, int limit = 50);

    /// <summary>
    /// Finds artists similar to the provided embedding vector using cosine similarity.
    /// </summary>
    /// <param name="queryEmbedding">The vector embedding to compare against.</param>
    /// <param name="limit">Maximum number of similar artists to return. Default is 20.</param>
    /// <param name="threshold">Minimum similarity threshold (0.0 to 1.0). Default is 0.7.</param>
    /// <returns>List of similar artist embeddings ordered by similarity score.</returns>
    Task<List<ArtistEmbedding>> FindSimilarArtistsAsync(Vector queryEmbedding, int limit = 20, double threshold = 0.7);

    /// <summary>
    /// Finds artists similar to a specified artist by name.
    /// </summary>
    /// <param name="artistName">The name of the artist to find similarities for.</param>
    /// <param name="limit">Maximum number of similar artists to return. Default is 20.</param>
    /// <returns>List of similar artist embeddings ordered by similarity score.</returns>
    Task<List<ArtistEmbedding>> FindSimilarToArtistAsync(string artistName, int limit = 20);

    /// <summary>
    /// Finds artists similar based on genres and optionally filtered by location.
    /// </summary>
    /// <param name="genres">List of genres to base similarity on.</param>
    /// <param name="location">Optional location filter for narrowing results.</param>
    /// <param name="limit">Maximum number of results to return. Default is 20.</param>
    /// <returns>List of artist embeddings matching the criteria.</returns>
    Task<List<ArtistEmbedding>> FindSimilarByGenresAndLocationAsync(List<string> genres, string? location, int limit = 20);

    /// <summary>
    /// Creates a new artist embedding in the repository.
    /// </summary>
    /// <param name="artistEmbedding">The artist embedding entity to create.</param>
    /// <returns>The created artist embedding with any generated values (e.g., ID).</returns>
    Task<ArtistEmbedding> CreateAsync(ArtistEmbedding artistEmbedding);

    /// <summary>
    /// Updates an existing artist embedding in the repository.
    /// </summary>
    /// <param name="artistEmbedding">The artist embedding entity with updated values.</param>
    /// <returns>The updated artist embedding entity.</returns>
    Task<ArtistEmbedding> UpdateAsync(ArtistEmbedding artistEmbedding);

    /// <summary>
    /// Deletes an artist embedding by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the artist embedding to delete.</param>
    /// <returns>True if the deletion was successful, false otherwise.</returns>
    Task<bool> DeleteAsync(Guid id);

    /// <summary>
    /// Checks if an artist embedding exists for the specified artist name.
    /// </summary>
    /// <param name="artistName">The name of the artist to check for.</param>
    /// <returns>True if an embedding exists for the artist, false otherwise.</returns>
    Task<bool> ExistsAsync(string artistName);

    /// <summary>
    /// Creates multiple artist embeddings in a single batch operation for improved performance.
    /// </summary>
    /// <param name="artistEmbeddings">List of artist embedding entities to create.</param>
    /// <returns>List of created artist embeddings with any generated values.</returns>
    Task<List<ArtistEmbedding>> CreateBulkAsync(List<ArtistEmbedding> artistEmbeddings);

    /// <summary>
    /// Retrieves all artist embeddings with pagination support.
    /// </summary>
    /// <param name="skip">Number of records to skip for pagination. Default is 0.</param>
    /// <param name="take">Number of records to take for pagination. Default is 100.</param>
    /// <returns>Paginated list of artist embeddings.</returns>
    Task<List<ArtistEmbedding>> GetAllAsync(int skip = 0, int take = 100);

    /// <summary>
    /// Gets the total count of artist embeddings in the repository.
    /// </summary>
    /// <returns>The total number of artist embeddings.</returns>
    Task<int> GetCountAsync();
}
