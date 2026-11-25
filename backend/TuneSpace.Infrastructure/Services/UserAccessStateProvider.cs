using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Models;
using TuneSpace.Infrastructure.Data;

namespace TuneSpace.Infrastructure.Services;

internal class UserAccessStateProvider(TuneSpaceDbContext context, IMemoryCache cache) : IUserAccessStateProvider
{
    // Bounds how long a change made on another server instance can take to apply; on this instance
    // Invalidate makes it immediate.
    private static readonly TimeSpan CacheDuration = TimeSpan.FromSeconds(30);

    private readonly TuneSpaceDbContext _context = context;
    private readonly IMemoryCache _cache = cache;

    private static string CacheKey(Guid userId) => $"user-access-state:{userId}";

    async Task<UserAccessState?> IUserAccessStateProvider.GetAsync(Guid userId)
    {
        if (_cache.TryGetValue(CacheKey(userId), out UserAccessState? cached))
        {
            return cached;
        }

        var now = DateTimeOffset.UtcNow;
        var state = await _context.Users
            .AsNoTracking()
            .Where(u => u.Id == userId)
            .Select(u => new UserAccessState(u.Role, u.LockoutEnd != null && u.LockoutEnd > now))
            .FirstOrDefaultAsync();

        _cache.Set(CacheKey(userId), state, CacheDuration);
        return state;
    }

    void IUserAccessStateProvider.Invalidate(Guid userId)
    {
        _cache.Remove(CacheKey(userId));
    }
}
