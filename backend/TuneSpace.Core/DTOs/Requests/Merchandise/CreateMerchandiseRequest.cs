namespace TuneSpace.Core.DTOs.Requests.Merchandise;

public record CreateMerchandiseRequest(
    Guid BandId,
    string Name,
    string Description,
    decimal Price,
    FileDto? Image
);
