namespace TuneSpace.Core.DTOs.Requests.Merchandise;

public record UpdateMerchandiseRequest(
    Guid Id,
    string? Name,
    string? Description,
    decimal? Price,
    FileDto? Image
);
