using TuneSpace.Core.Models;

namespace TuneSpace.Core.DTOs.Responses.Admin;

public record ManagedUserResponse(
    Guid Id,
    string Username,
    string Email,
    string Role,
    bool EmailConfirmed,
    bool IsSuspended,
    DateTime LastActiveDate,
    string? ExternalProvider,
    bool HasProfilePicture,
    BandSummary? Band);
