namespace TuneSpace.Core.DTOs.Responses.Admin;

public record UserListResponse(
    IReadOnlyList<ManagedUserResponse> Items,
    int TotalCount,
    int Page,
    int PageSize);
