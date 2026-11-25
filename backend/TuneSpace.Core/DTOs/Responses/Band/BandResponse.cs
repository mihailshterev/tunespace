namespace TuneSpace.Core.DTOs.Responses.Band;

public record BandResponse(
    string Id,
    string Name,
    string Description,
    string Genre,
    string Country,
    string City,
    byte[] CoverImage,
    string? SpotifyId,
    string? YouTubeEmbedId,
    ICollection<MemberResponse>? Members);

public record MemberResponse(
    string Id,
    string Name,
    string Email,
    byte[]? ProfilePicture,
    string Role);
