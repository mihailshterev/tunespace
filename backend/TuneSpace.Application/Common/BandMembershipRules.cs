using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;

namespace TuneSpace.Application.Common;

/// <summary>
/// The single source of truth for how a user's role relates to band membership.
///
/// Invariants maintained by every operation that changes roles or membership:
/// <list type="bullet">
///   <item>A user belongs to at most one band (enforced by the database: users carry one BandId).</item>
///   <item>BandAdmin and BandMember are held only by users who belong to a band; Listener only by users who don't.</item>
///   <item>Admin is a site-wide role, kept whether or not the user is in a band. An Admin member counts as a band manager.</item>
///   <item>Every band keeps at least one member and at least one manager (BandAdmin or Admin).
///         A band is ended by deleting it, which returns its members to Listener.</item>
/// </list>
/// </summary>
internal static class BandMembershipRules
{
    public static bool IsBandRole(Roles role) => role is Roles.BandAdmin or Roles.BandMember;

    public static bool IsManagerRole(Roles role) => role is Roles.BandAdmin or Roles.Admin;

    /// <summary>The role a user holds after joining a band.</summary>
    public static Roles RoleOnJoining(User user) => user.Role == Roles.Admin ? Roles.Admin : Roles.BandMember;

    /// <summary>The role a user holds after creating a band.</summary>
    public static Roles RoleOnCreatingBand(User user) => user.Role == Roles.Admin ? Roles.Admin : Roles.BandAdmin;

    /// <summary>The role a user holds after leaving or being removed from a band, or when their band is deleted.</summary>
    public static Roles RoleOnLeaving(User user) => user.Role == Roles.Admin ? Roles.Admin : Roles.Listener;

    public static bool IsSoleManager(Band band, User user) =>
        IsManagerRole(user.Role)
        && !band.Members.Any(m => m.Id != user.Id && IsManagerRole(m.Role));

    /// <summary>
    /// Checks whether <paramref name="user"/> may leave (or be removed from) <paramref name="band"/>.
    /// </summary>
    /// <returns>A user-facing reason the change is refused, or null if it is allowed.</returns>
    public static string? ValidateLeave(Band band, User user)
    {
        if (band.Members.Count <= 1)
        {
            return $"{user.UserName} is the only member of {band.Name}. Delete the band instead.";
        }

        if (IsSoleManager(band, user))
        {
            return $"{user.UserName} is the only manager of {band.Name}. Make another member a Band Admin first.";
        }

        return null;
    }

    /// <summary>
    /// Checks whether <paramref name="user"/> may be given <paramref name="newRole"/>, given the band they belong to (if any).
    /// Moving a band member to Listener means removing them from the band.
    /// </summary>
    /// <returns>A user-facing reason the change is refused, or null if it is allowed.</returns>
    public static string? ValidateRoleChange(User user, Band? band, Roles newRole)
    {
        if (band is null)
        {
            return IsBandRole(newRole)
                ? $"{user.UserName} isn't in a band. Add them to a band from its dashboard first."
                : null;
        }

        if (newRole == Roles.Listener)
        {
            return ValidateLeave(band, user);
        }

        if (!IsManagerRole(newRole) && IsSoleManager(band, user))
        {
            return $"{user.UserName} is the only manager of {band.Name}. Make another member a Band Admin first.";
        }

        return null;
    }
}
