namespace TuneSpace.Core.DTOs.Responses.Band;

public record BandInvitationResponse(
    string Id,
    string BandId,
    string BandName,
    byte[]? BandCoverImage,
    string UserId,
    string UserName,
    byte[]? UserProfilePicture,
    string? InvitedById,
    string? InvitedByName,
    DateTime CreatedAt);
