using Microsoft.EntityFrameworkCore;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Infrastructure.Data;

namespace TuneSpace.Infrastructure.Repositories;

internal class BandInvitationRepository(TuneSpaceDbContext context) : IBandInvitationRepository
{
    private readonly TuneSpaceDbContext _context = context;

    async Task<BandInvitation?> IBandInvitationRepository.GetInvitationByIdAsync(Guid id)
    {
        return await _context.BandInvitations
            .Include(i => i.Band)
            .Include(i => i.User)
            .Include(i => i.InvitedBy)
            .FirstOrDefaultAsync(i => i.Id == id);
    }

    async Task<List<BandInvitation>> IBandInvitationRepository.GetInvitationsForUserAsync(Guid userId)
    {
        return await _context.BandInvitations
            .Where(i => i.UserId == userId)
            .Include(i => i.Band)
            .Include(i => i.User)
            .Include(i => i.InvitedBy)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    async Task<List<BandInvitation>> IBandInvitationRepository.GetInvitationsForBandAsync(Guid bandId)
    {
        return await _context.BandInvitations
            .Where(i => i.BandId == bandId)
            .Include(i => i.Band)
            .Include(i => i.User)
            .Include(i => i.InvitedBy)
            .OrderByDescending(i => i.CreatedAt)
            .ToListAsync();
    }

    async Task<bool> IBandInvitationRepository.InvitationExistsAsync(Guid bandId, Guid userId)
    {
        return await _context.BandInvitations.AnyAsync(i => i.BandId == bandId && i.UserId == userId);
    }

    async Task IBandInvitationRepository.InsertInvitationAsync(BandInvitation invitation)
    {
        _context.BandInvitations.Add(invitation);
        await _context.SaveChangesAsync();
    }

    async Task IBandInvitationRepository.DeleteInvitationAsync(BandInvitation invitation)
    {
        _context.BandInvitations.Remove(invitation);
        await _context.SaveChangesAsync();
    }

    async Task IBandInvitationRepository.DeleteInvitationsForUserAsync(Guid userId)
    {
        await _context.BandInvitations
            .Where(i => i.UserId == userId)
            .ExecuteDeleteAsync();
    }
}
