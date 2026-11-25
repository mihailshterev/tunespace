namespace TuneSpace.Core.Interfaces.IInfrastructure;

/// <summary>
/// Runs several repository operations atomically, so multi-step changes (such as moving a user
/// out of a band and changing their role) either all apply or none do.
/// </summary>
public interface IUnitOfWork
{
    Task ExecuteInTransactionAsync(Func<Task> action);
}
