using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;
using TuneSpace.Core.Enums;

namespace TuneSpace.Core.Entities;

public class User : IdentityUser<Guid>
{
    public Roles Role { get; set; }
    public byte[]? ProfilePicture { get; set; }
    public string? SpotifyId { get; set; }
    public string? ExternalProvider { get; set; }
    public DateTime? ExternalLoginLinkedAt { get; set; }
    public DateTime LastActiveDate { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Suspension is stored as an Identity lockout; sign-in does not use failed-attempt lockout,
    /// so an active lockout always means an administrator suspended the account.
    /// </summary>
    [NotMapped]
    public bool IsSuspended => LockoutEnd.HasValue && LockoutEnd.Value > DateTimeOffset.UtcNow;
}
