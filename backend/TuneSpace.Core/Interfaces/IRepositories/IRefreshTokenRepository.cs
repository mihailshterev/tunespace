using TuneSpace.Core.Entities;

namespace TuneSpace.Core.Interfaces.IRepositories;

/// <summary>
/// Repository interface for managing refresh tokens in the authentication system.
/// Provides methods for CRUD operations and token validation for JWT refresh tokens.
/// </summary>
public interface IRefreshTokenRepository
{
    /// <summary>
    /// Retrieves a refresh token by its token string value.
    /// </summary>
    /// <param name="token">The refresh token string to search for.</param>
    /// <returns>The refresh token entity if found, otherwise null.</returns>
    Task<RefreshToken?> GetByTokenAsync(string token);

    /// <summary>
    /// Retrieves the active refresh token for a specific user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user.</param>
    /// <returns>The user's refresh token if found, otherwise null.</returns>
    Task<RefreshToken?> GetByUserIdAsync(Guid userId);

    /// <summary>
    /// Inserts a new refresh token into the repository.
    /// </summary>
    /// <param name="refreshToken">The refresh token entity to insert.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task InsertAsync(RefreshToken refreshToken);

    /// <summary>
    /// Updates an existing refresh token in the repository.
    /// </summary>
    /// <param name="refreshToken">The refresh token entity with updated values.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task UpdateAsync(RefreshToken refreshToken);

    /// <summary>
    /// Deletes a refresh token by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the refresh token to delete.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// Deletes all expired refresh tokens from the repository.
    /// This method is typically used for cleanup operations.
    /// </summary>
    /// <returns>The number of expired tokens that were deleted.</returns>
    Task<int> DeleteExpiredAsync();

    /// <summary>
    /// Checks if a refresh token exists in the repository.
    /// </summary>
    /// <param name="token">The refresh token string to check for existence.</param>
    /// <returns>True if the token exists, otherwise false.</returns>
    Task<bool> ExistsAsync(string token);

    /// <summary>
    /// Checks if a refresh token has been revoked.
    /// </summary>
    /// <param name="token">The refresh token string to check revocation status for.</param>
    /// <returns>True if the token is revoked, otherwise false.</returns>
    Task<bool> IsRevokedAsync(string token);

    /// <summary>
    /// Revokes every active refresh token belonging to a user, ending all of their sessions.
    /// </summary>
    /// <param name="userId">The user whose tokens should be revoked.</param>
    /// <returns>The number of tokens revoked.</returns>
    Task<int> RevokeAllForUserAsync(Guid userId);
}
