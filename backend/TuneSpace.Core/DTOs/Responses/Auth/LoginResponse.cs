namespace TuneSpace.Core.DTOs.Responses.Auth;

public record LoginResponse(
    string Id,
    string? Username,
    string Role,
    string AccessToken,
    string RefreshToken);
