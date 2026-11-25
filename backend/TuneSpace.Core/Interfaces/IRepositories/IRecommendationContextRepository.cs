using Pgvector;
using TuneSpace.Core.Entities;

namespace TuneSpace.Core.Interfaces.IRepositories;

/// <summary>
/// Repository interface for managing user recommendation contexts in the TuneSpace application.
/// Handles storage and retrieval of user preference data and behavioral patterns used to generate
/// personalized music recommendations and find users with similar tastes.
/// </summary>
public interface IRecommendationContextRepository
{
    /// <summary>
    /// Retrieves the recommendation context for a specific user.
    /// The context contains user preferences, listening history, and behavioral data
    /// used to generate personalized recommendations.
    /// </summary>
    /// <param name="userId">The unique identifier of the user.</param>
    /// <returns>The user's recommendation context if found, otherwise null.</returns>
    Task<RecommendationContext?> GetByUserIdAsync(string userId);

    /// <summary>
    /// Creates a new recommendation context or updates an existing one for a user.
    /// This method handles both insert and update operations based on whether
    /// the context already exists for the specified user.
    /// </summary>
    /// <param name="context">The recommendation context entity to create or update.</param>
    /// <returns>The created or updated recommendation context entity.</returns>
    Task<RecommendationContext> CreateOrUpdateAsync(RecommendationContext context);

    /// <summary>
    /// Deletes the recommendation context for a specific user.
    /// This removes all stored preference data and behavioral patterns for the user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user whose context should be deleted.</param>
    /// <returns>True if the deletion was successful, false if the context was not found.</returns>
    Task<bool> DeleteAsync(string userId);

    /// <summary>
    /// Finds users with similar music preferences using vector similarity search.
    /// Compares the provided user embedding against stored user embeddings to identify
    /// users with similar tastes, enabling collaborative filtering recommendations.
    /// </summary>
    /// <param name="userEmbedding">The vector embedding representing user preferences to compare against.</param>
    /// <param name="limit">Maximum number of similar users to return. Default is 10.</param>
    /// <returns>List of recommendation contexts for users with similar preferences, ordered by similarity score.</returns>
    Task<List<RecommendationContext>> GetSimilarUsersAsync(Vector userEmbedding, int limit = 10);
}
