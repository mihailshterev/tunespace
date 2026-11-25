namespace TuneSpace.Core.Models;

/// <summary>
/// Membership counts for a band. Managers are members whose role lets them manage it (BandAdmin or Admin).
/// </summary>
public record BandSummary(Guid Id, string Name, int MemberCount, int ManagerCount);
