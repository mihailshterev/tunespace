using Microsoft.EntityFrameworkCore;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Infrastructure.Data;

namespace TuneSpace.Infrastructure.Services;

internal class UnitOfWork(TuneSpaceDbContext context) : IUnitOfWork
{
    private readonly TuneSpaceDbContext _context = context;

    async Task IUnitOfWork.ExecuteInTransactionAsync(Func<Task> action)
    {
        // Nested calls join the outer transaction.
        if (_context.Database.CurrentTransaction is not null)
        {
            await action();
            return;
        }

        var strategy = _context.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                await action();
                await transaction.CommitAsync();
            }
            catch
            {
                await transaction.RollbackAsync();
                // Tracked entities may hold changes that were never committed; drop them so later work in this scope starts clean.
                _context.ChangeTracker.Clear();
                throw;
            }
        });
    }
}
