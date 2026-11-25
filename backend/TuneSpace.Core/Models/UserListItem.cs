using TuneSpace.Core.Enums;

namespace TuneSpace.Core.Models;

/// <summary>
/// Lightweight projection of a user for administrative listings; avoids loading profile picture bytes.
/// </summary>
public record UserListItem(
    Guid Id,
    string UserName,
    string Email,
    Roles Role,
    bool EmailConfirmed,
    DateTimeOffset? LockoutEnd,
    DateTime LastActiveDate,
    string? ExternalProvider,
    bool HasProfilePicture,
    Guid? BandId)
{
    public bool IsSuspended => LockoutEnd.HasValue && LockoutEnd.Value > DateTimeOffset.UtcNow;
}
