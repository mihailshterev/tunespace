using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IRepositories;

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
}
