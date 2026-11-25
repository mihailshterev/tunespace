namespace TuneSpace.Core.DTOs.Responses.Admin;

public record UserStatsResponse(
    int TotalUsers,
    int SuspendedUsers,
    IReadOnlyDictionary<string, int> UsersByRole);
