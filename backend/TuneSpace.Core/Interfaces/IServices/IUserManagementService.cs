using TuneSpace.Core.DTOs.Responses.Admin;
using TuneSpace.Core.Enums;

namespace TuneSpace.Core.Interfaces.IServices;

/// <summary>
/// Administrative operations over user accounts: listing, role assignment and suspension.
/// Callers are expected to have already been authorized as <see cref="Roles.Admin"/>.
/// </summary>
public interface IUserManagementService
{
    /// <summary>
    /// Returns a page of users, optionally filtered by a username/email prefix, role and suspension state.
    /// </summary>
    Task<UserListResponse> GetUsersAsync(string? search, Roles? role, bool? suspended, int page, int pageSize);

    /// <summary>
    /// Returns user totals grouped by role, plus the number of suspended accounts.
    /// </summary>
    Task<UserStatsResponse> GetStatsAsync();

    /// <summary>
    /// Assigns a new role to a user, keeping it consistent with band membership: band roles require
    /// being in a band, moving a band member to Listener removes them from it, and a band's last
    /// member or manager can't be demoted. Admins cannot change their own role.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The target user does not exist.</exception>
    /// <exception cref="Exceptions.ConflictException">The change targets the actor or would break a band membership rule.</exception>
    Task<ManagedUserResponse> ChangeRoleAsync(Guid actorId, Guid userId, Roles role);

    /// <summary>
    /// Suspends or restores a user. Suspending blocks sign-in and revokes all of the user's refresh tokens.
    /// Admins cannot suspend themselves.
    /// </summary>
    /// <exception cref="Exceptions.NotFoundException">The target user does not exist.</exception>
    /// <exception cref="Exceptions.ConflictException">The actor attempted to suspend themselves.</exception>
    Task<ManagedUserResponse> SetSuspendedAsync(Guid actorId, Guid userId, bool suspended);
}
