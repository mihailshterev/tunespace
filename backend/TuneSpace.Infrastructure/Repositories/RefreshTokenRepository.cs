using Microsoft.EntityFrameworkCore;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Infrastructure.Data;

namespace TuneSpace.Infrastructure.Repositories;

internal class RefreshTokenRepository(TuneSpaceDbContext context) : IRefreshTokenRepository
{
    private readonly TuneSpaceDbContext _context = context;

    async Task<RefreshToken?> IRefreshTokenRepository.GetByTokenAsync(string token)
    {
        return await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.TokenHash == token);
    }

    async Task<RefreshToken?> IRefreshTokenRepository.GetByUserIdAsync(Guid userId)
    {
        return await _context.RefreshTokens
            .FirstOrDefaultAsync(rt => rt.UserId == userId);
    }

    async Task IRefreshTokenRepository.InsertAsync(RefreshToken refreshToken)
    {
        await _context.RefreshTokens.AddAsync(refreshToken);
        await _context.SaveChangesAsync();
    }

    async Task IRefreshTokenRepository.UpdateAsync(RefreshToken refreshToken)
    {
        _context.RefreshTokens.Update(refreshToken);
        await _context.SaveChangesAsync();
    }

    async Task IRefreshTokenRepository.DeleteAsync(Guid id)
    {
        var refreshToken = await _context.RefreshTokens.FindAsync(id);
        if (refreshToken != null)
        {
            _context.RefreshTokens.Remove(refreshToken);
            await _context.SaveChangesAsync();
        }
    }

    async Task<int> IRefreshTokenRepository.DeleteExpiredAsync()
    {
        var now = DateTime.UtcNow;
        var expiredTokens = _context.RefreshTokens
            .Where(rt => rt.Expiry < now || rt.RevokedAt != null);

        _context.RefreshTokens.RemoveRange(expiredTokens);
        return await _context.SaveChangesAsync();
    }

    async Task<bool> IRefreshTokenRepository.ExistsAsync(string token)
    {
        return await _context.RefreshTokens
            .AnyAsync(rt => rt.TokenHash == token);
    }

    async Task<bool> IRefreshTokenRepository.IsRevokedAsync(string token)
    {
        return await _context.RefreshTokens
            .AnyAsync(rt => rt.TokenHash == token && rt.RevokedAt.HasValue);
    }

    async Task<int> IRefreshTokenRepository.RevokeAllForUserAsync(Guid userId)
    {
        var now = DateTime.UtcNow;
        return await _context.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
            .ExecuteUpdateAsync(setters => setters.SetProperty(rt => rt.RevokedAt, now));
    }
}
