using Microsoft.Extensions.Logging;
using TuneSpace.Application.Common;
using TuneSpace.Core.DTOs.Requests.Band;
using TuneSpace.Core.DTOs.Responses.Band;
using TuneSpace.Core.DTOs.Responses.User;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Application.Services;

internal class BandService(
    IBandRepository bandRepository,
    IUserRepository userRepository,
    ILogger<BandService> logger) : IBandService
{
    private readonly IBandRepository _bandRepository = bandRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly ILogger<BandService> _logger = logger;

    async Task<BandResponse?> IBandService.GetBandByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Getting band with ID {BandId}", id);
            var band = await _bandRepository.GetBandByIdAsync(id);
            if (band == null)
            {
                _logger.LogWarning("Band with ID {BandId} not found", id);
                return null;
            }

            return new BandResponse(
                band.Id.ToString(),
                band.Name,
                band.Description ?? string.Empty,
                band.Genre,
                band.Country ?? string.Empty,
                band.City ?? string.Empty,
                band.CoverImage ?? [],
                band.SpotifyId,
                band.YouTubeEmbedId,
                band.Members?.Select(m => new MemberResponse(
                    m.Id.ToString(),
                    m.UserName ?? string.Empty,
                    "",
                    m.ProfilePicture
                )).ToList()
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving band with ID {BandId}", id);
            throw;
        }
    }

    async Task<BandResponse?> IBandService.GetBandByNameAsync(string name)
    {
        try
        {
            _logger.LogInformation("Getting band with name {BandName}", name);
            var band = await _bandRepository.GetBandByNameAsync(name);
            if (band == null)
            {
                _logger.LogWarning("Band with name {BandName} not found", name);
                return null;
            }

            return new BandResponse(
                band.Id.ToString(),
                band.Name,
                band.Description ?? string.Empty,
                band.Genre,
                band.Country ?? string.Empty,
                band.City ?? string.Empty,
                band.CoverImage ?? [],
                band.SpotifyId,
                band.YouTubeEmbedId,
                band.Members?.Select(m => new MemberResponse(
                    m.Id.ToString(),
                    m.UserName ?? string.Empty,
                    "",
                    m.ProfilePicture
                )).ToList()
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving band with name {BandName}", name);
            throw;
        }
    }

    async Task<BandResponse?> IBandService.GetBandByUserIdAsync(string id)
    {
        try
        {
            _logger.LogInformation("Getting band for user");
            var band = await _bandRepository.GetBandByUserIdAsync(id);
            if (band == null)
            {
                _logger.LogWarning("No band found for user");
                return null;
            }

            return new BandResponse(
                band.Id.ToString(),
                band.Name,
                band.Description ?? string.Empty,
                band.Genre,
                band.Country ?? string.Empty,
                band.City ?? string.Empty,
                band.CoverImage ?? [],
                band.SpotifyId,
                band.YouTubeEmbedId,
                band.Members?.Select(m => new MemberResponse(
                    m.Id.ToString(),
                    m.UserName ?? string.Empty,
                    "",
                    m.ProfilePicture
                )).ToList()
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving band for user");
            throw;
        }
    }

    async Task<byte[]?> IBandService.GetBandImageAsync(Guid bandId)
    {
        try
        {
            _logger.LogInformation("Getting image for band with ID {BandId}", bandId);
            var band = await _bandRepository.GetBandByIdAsync(bandId);
            if (band == null)
            {
                _logger.LogWarning("Band with ID {BandId} not found when retrieving image", bandId);
                return null;
            }
            return band.CoverImage;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving image for band with ID {BandId}", bandId);
            throw;
        }
    }

    async Task<UserSearchResultResponse[]> IBandService.GetBandMembersAsync(Guid bandId)
    {
        try
        {
            _logger.LogInformation("Getting members for band with ID {BandId}", bandId);
            var band = await _bandRepository.GetBandByIdAsync(bandId);
            if (band is null)
            {
                _logger.LogWarning("Band with ID {BandId} not found when retrieving members", bandId);
                return [];
            }

            return [.. band.Members.Select(m => new UserSearchResultResponse(
                m.Id,
                m.UserName ?? string.Empty,
                m.ProfilePicture ?? []
            ))];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving members for band with ID {BandId}", bandId);
            throw;
        }
    }

    async Task<BandResponse?> IBandService.CreateBandAsync(CreateBandRequest request)
    {
        try
        {
            _logger.LogInformation("Creating new band with name: {BandName}", Helpers.SanitizeForLogging(request.Name));

            var user = await _userRepository.GetUserByIdAsync(request.UserId);
            if (user == null)
            {
                _logger.LogWarning("User not found when creating band");
                return null;
            }

            var city = request.Location.Split(',')[1].Trim();
            var country = request.Location.Split(',')[0].Trim();

            user.Role = Roles.BandAdmin;
            await _userRepository.UpdateUserAsync(user);
            _logger.LogInformation("User {UserName} updated to BandAdmin role", user.UserName);

            var band = new Band
            {
                Name = request.Name,
                Genre = request.Genre,
                Description = request.Description,
                Country = country,
                City = city,
                CoverImage = request.Picture?.Content,
                Members = [user],
            };

            await _bandRepository.InsertBandAsync(band);
            _logger.LogInformation("Band {BandName} created successfully with ID {BandId}", Helpers.SanitizeForLogging(band.Name), band.Id);

            return new BandResponse(
                band.Id.ToString(),
                band.Name,
                band.Description ?? string.Empty,
                band.Genre,
                band.Country ?? string.Empty,
                band.City ?? string.Empty,
                band.CoverImage ?? [],
                band.SpotifyId,
                band.YouTubeEmbedId,
                band.Members?.Select(m => new MemberResponse(
                    m.Id.ToString(),
                    m.UserName ?? string.Empty,
                    "",
                    m.ProfilePicture
                )).ToList()
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating band with name {BandName}", Helpers.SanitizeForLogging(request.Name));
            throw;
        }
    }

    async Task IBandService.UpdateBandAsync(UpdateBandRequest request)
    {
        try
        {
            _logger.LogInformation("Updating band with ID {Id}", request.Id);

            var band = await _bandRepository.GetBandByIdAsync(request.Id);
            if (band == null)
            {
                _logger.LogWarning("Band with ID {Id} not found for update", request.Id);
                return;
            }

            if (!string.IsNullOrEmpty(request.Name))
            {
                band.Name = request.Name;
            }

            if (!string.IsNullOrEmpty(request.Description))
            {
                band.Description = request.Description;
            }

            if (!string.IsNullOrEmpty(request.Genre))
            {
                band.Genre = request.Genre;
            }

            if (!string.IsNullOrEmpty(request.SpotifyId))
            {
                band.SpotifyId = request.SpotifyId;
            }

            if (!string.IsNullOrEmpty(request.YouTubeEmbedId))
            {
                band.YouTubeEmbedId = request.YouTubeEmbedId;
            }

            if (request.Picture != null)
            {
                band.CoverImage = request.Picture.Content;
            }

            await _bandRepository.UpdateBandAsync(band);
            _logger.LogInformation("Band with ID {Id} updated successfully", request.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating band with ID {Id}", request.Id);
            throw;
        }
    }

    async Task IBandService.AddMemberToBandAsync(Guid userId, Guid bandId)
    {
        try
        {
            _logger.LogInformation("Adding user to band");
            var band = await _bandRepository.GetBandByIdAsync(bandId);
            if (band == null)
            {
                _logger.LogWarning("Band not found when adding member");
                return;
            }

            var user = await _userRepository.GetUserByIdAsync(userId.ToString());
            if (user == null)
            {
                _logger.LogWarning("User not found when adding to band");
                return;
            }

            if (band.Members.Any(m => m.Id == user.Id))
            {
                _logger.LogWarning("User is already a member of the band");
                return;
            }

            band.Members.Add(user);
            await _bandRepository.UpdateBandAsync(band);

            // Only promote listeners; never demote an admin or band admin by adding them to a band.
            if (user.Role == Roles.Listener)
            {
                user.Role = Roles.BandMember;
                await _userRepository.UpdateUserAsync(user);
            }

            _logger.LogInformation("User added to band successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding user to band");
            throw;
        }
    }

    async Task<bool> IBandService.CanManageBandAsync(Guid userId, Guid bandId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId.ToString());
        if (user == null)
        {
            return false;
        }

        if (user.Role == Roles.Admin)
        {
            return true;
        }

        if (user.Role != Roles.BandAdmin)
        {
            return false;
        }

        var band = await _bandRepository.GetBandByIdAsync(bandId);
        return band?.Members?.Any(m => m.Id == userId) ?? false;
    }

    async Task IBandService.DeleteBandAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting band with ID {Id}", id);
            await _bandRepository.DeleteBandAsync(id);
            _logger.LogInformation("Band with ID {Id} deleted successfully", id);
        }
        catch (KeyNotFoundException)
        {
            _logger.LogWarning("Band with ID {Id} not found for deletion", id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting band with ID {Id}", id);
            throw;
        }
    }
}
