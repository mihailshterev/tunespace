using TuneSpace.Core.Models;

namespace TuneSpace.Core.Interfaces.IInfrastructure;

/// <summary>
/// Supplies a user's current role and suspension state for request authentication, so changes made
/// by an administrator apply without waiting for the user's access token to expire.
/// Results are briefly cached; call <see cref="Invalidate"/> after changing a user's role or suspension.
/// </summary>
public interface IUserAccessStateProvider
{
    /// <returns>The user's current access state, or null if the user no longer exists.</returns>
    Task<UserAccessState?> GetAsync(Guid userId);

    void Invalidate(Guid userId);
}
