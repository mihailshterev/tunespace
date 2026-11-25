using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Models;

namespace TuneSpace.Infrastructure.Repositories;

internal class UserRepository(UserManager<User> userManager) : IUserRepository
{
    private readonly UserManager<User> _userManager = userManager;

    async Task<User?> IUserRepository.GetUserByIdAsync(string id)
    {
        return await _userManager.FindByIdAsync(id);
    }

    async Task<User?> IUserRepository.GetUserByExternalIdAsync(string externalId, string provider)
    {
        return await _userManager.Users
            .FirstOrDefaultAsync(u => u.SpotifyId == externalId && u.ExternalProvider == provider);
    }

    async Task<User?> IUserRepository.GetUserByEmailAsync(string email)
    {
        return await _userManager.FindByEmailAsync(email);
    }

    async Task<User?> IUserRepository.GetUserByNameAsync(string name)
    {
        return await _userManager.FindByNameAsync(name);
    }

    async Task<List<User>> IUserRepository.SearchByNameAsync(string name)
    {
        return await _userManager.Users
            .Where(u => u.UserName != null && EF.Functions.ILike(u.UserName, $"{name}%"))
            .Take(5)
            .ToListAsync();
    }

    async Task IUserRepository.InsertUserAsync(User user, string password)
    {
        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            throw new ArgumentException(string.Join(" ", result.Errors.Select(e => e.Description)));
        }

        await _userManager.AddToRoleAsync(user, user.Role.ToString());
    }

    async Task IUserRepository.InsertExternalUserAsync(User user)
    {
        var result = await _userManager.CreateAsync(user);
        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(user, user.Role.ToString());
        }
    }

    async Task IUserRepository.UpdateUserAsync(User user)
    {
        await _userManager.UpdateAsync(user);
    }

    async Task<List<User>> IUserRepository.GetActiveUsersAsync(int daysBack)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysBack);
        return await _userManager.Users
            .Where(u => u.LastActiveDate >= cutoffDate)
            .ToListAsync();
    }

    async Task IUserRepository.UpdateUserLastActiveDateAsync(string userId, DateTime lastActiveDate)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user != null)
        {
            user.LastActiveDate = lastActiveDate;
            await _userManager.UpdateAsync(user);
        }
    }

    async Task<(List<UserListItem> Users, int TotalCount)> IUserRepository.GetUsersPagedAsync(string? search, Roles? role, bool? suspended, int skip, int take)
    {
        var query = _userManager.Users.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"{EscapeLikePattern(search.Trim())}%";
            query = query.Where(u =>
                (u.UserName != null && EF.Functions.ILike(u.UserName, pattern)) ||
                (u.Email != null && EF.Functions.ILike(u.Email, pattern)));
        }

        if (role.HasValue)
        {
            query = query.Where(u => u.Role == role.Value);
        }

        if (suspended.HasValue)
        {
            var now = DateTimeOffset.UtcNow;
            query = suspended.Value
                ? query.Where(u => u.LockoutEnd != null && u.LockoutEnd > now)
                : query.Where(u => u.LockoutEnd == null || u.LockoutEnd <= now);
        }

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderBy(u => u.UserName)
            .Skip(skip)
            .Take(take)
            .Select(u => new UserListItem(
                u.Id,
                u.UserName ?? string.Empty,
                u.Email ?? string.Empty,
                u.Role,
                u.EmailConfirmed,
                u.LockoutEnd,
                u.LastActiveDate,
                u.ExternalProvider,
                u.ProfilePicture != null && u.ProfilePicture.Length > 0,
                EF.Property<Guid?>(u, "BandId")))
            .ToListAsync();

        return (users, totalCount);
    }

    async Task<Dictionary<Roles, int>> IUserRepository.GetUserCountsByRoleAsync()
    {
        return await _userManager.Users
            .GroupBy(u => u.Role)
            .Select(g => new { Role = g.Key, Count = g.Count() })
            .ToDictionaryAsync(x => x.Role, x => x.Count);
    }

    async Task<int> IUserRepository.GetSuspendedUserCountAsync()
    {
        var now = DateTimeOffset.UtcNow;
        return await _userManager.Users.CountAsync(u => u.LockoutEnd != null && u.LockoutEnd > now);
    }

    async Task IUserRepository.UpdateUserRoleAsync(User user, Roles role)
    {
        user.Role = role;
        EnsureSucceeded(await _userManager.UpdateAsync(user));

        var currentRoles = await _userManager.GetRolesAsync(user);
        if (currentRoles.Count > 0)
        {
            EnsureSucceeded(await _userManager.RemoveFromRolesAsync(user, currentRoles));
        }

        EnsureSucceeded(await _userManager.AddToRoleAsync(user, role.ToString()));
    }

    async Task IUserRepository.SetSuspendedAsync(User user, bool suspended)
    {
        if (suspended)
        {
            EnsureSucceeded(await _userManager.SetLockoutEnabledAsync(user, true));
            EnsureSucceeded(await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.MaxValue));
        }
        else
        {
            EnsureSucceeded(await _userManager.SetLockoutEndDateAsync(user, null));
            EnsureSucceeded(await _userManager.ResetAccessFailedCountAsync(user));
        }
    }

    private static void EnsureSucceeded(IdentityResult result)
    {
        if (!result.Succeeded)
        {
            throw new InvalidOperationException(string.Join(" ", result.Errors.Select(e => e.Description)));
        }
    }

    private static string EscapeLikePattern(string value)
    {
        return value.Replace(@"\", @"\\").Replace("%", @"\%").Replace("_", @"\_");
    }
}
