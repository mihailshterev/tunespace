using Microsoft.Extensions.Logging;
using TuneSpace.Application.Common;
using TuneSpace.Core.DTOs.Requests.Band;
using TuneSpace.Core.DTOs.Responses.Band;
using TuneSpace.Core.DTOs.Responses.User;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Application.Services;

internal class BandService(
    IBandRepository bandRepository,
    IUserRepository userRepository,
    IUnitOfWork unitOfWork,
    IUserAccessStateProvider accessStateProvider,
    ILogger<BandService> logger) : IBandService
{
    private readonly IBandRepository _bandRepository = bandRepository;
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IUserAccessStateProvider _accessStateProvider = accessStateProvider;
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

            return ToResponse(band);
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

            return ToResponse(band);
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

            return ToResponse(band);
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
        _logger.LogInformation("Creating new band with name: {BandName}", Helpers.SanitizeForLogging(request.Name));

        var user = await _userRepository.GetUserByIdAsync(request.UserId);
        if (user == null)
        {
            _logger.LogWarning("User not found when creating band");
            return null;
        }

        var existingBand = await _bandRepository.GetBandByUserIdAsync(request.UserId);
        if (existingBand is not null)
        {
            throw new ConflictException($"You already belong to {existingBand.Name}. Leave it before creating a new band.");
        }

        var city = request.Location.Split(',')[1].Trim();
        var country = request.Location.Split(',')[0].Trim();

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

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await _bandRepository.InsertBandAsync(band);
            await SetRoleAsync(user, BandMembershipRules.RoleOnCreatingBand(user));
        });

        _logger.LogInformation("Band {BandName} created successfully with ID {BandId}", Helpers.SanitizeForLogging(band.Name), band.Id);

        return ToResponse(band);
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
        var band = await GetBandOrThrowAsync(bandId);
        var user = await _userRepository.GetUserByIdAsync(userId.ToString())
            ?? throw new NotFoundException("User not found");

        if (band.Members.Any(m => m.Id == user.Id))
        {
            throw new ConflictException($"{user.UserName} is already a member of {band.Name}.");
        }

        if (user.IsSuspended)
        {
            throw new ConflictException($"{user.UserName}'s account is suspended, so they can't join a band.");
        }

        var currentBand = await _bandRepository.GetBandByUserIdAsync(user.Id.ToString());
        if (currentBand is not null)
        {
            throw new ConflictException($"{user.UserName} already belongs to {currentBand.Name}.");
        }

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            band.Members.Add(user);
            await _bandRepository.UpdateBandAsync(band);
            await SetRoleAsync(user, BandMembershipRules.RoleOnJoining(user));
        });

        _logger.LogInformation("User {UserId} added to band {BandId}", user.Id, band.Id);
    }

    async Task IBandService.RemoveMemberAsync(Guid bandId, Guid userId)
    {
        var band = await GetBandOrThrowAsync(bandId);
        var member = band.Members.FirstOrDefault(m => m.Id == userId)
            ?? throw new NotFoundException("That user isn't a member of this band.");

        var reason = BandMembershipRules.ValidateLeave(band, member);
        if (reason is not null)
        {
            throw new ConflictException(reason);
        }

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            band.Members.Remove(member);
            await _bandRepository.UpdateBandAsync(band);
            await SetRoleAsync(member, BandMembershipRules.RoleOnLeaving(member));
        });

        _logger.LogInformation("User {UserId} removed from band {BandId}", userId, bandId);
    }

    async Task IBandService.SetMemberRoleAsync(Guid bandId, Guid userId, Roles role)
    {
        if (!BandMembershipRules.IsBandRole(role))
        {
            throw new ConflictException("A band member can only be made a Band Admin or a Band Member.");
        }

        var band = await GetBandOrThrowAsync(bandId);
        var member = band.Members.FirstOrDefault(m => m.Id == userId)
            ?? throw new NotFoundException("That user isn't a member of this band.");

        if (member.Role == Roles.Admin)
        {
            throw new ConflictException($"{member.UserName} is a site admin; their role can only be changed from User Management.");
        }

        if (member.Role == role)
        {
            return;
        }

        var reason = BandMembershipRules.ValidateRoleChange(member, band, role);
        if (reason is not null)
        {
            throw new ConflictException(reason);
        }

        await SetRoleAsync(member, role);
        _logger.LogInformation("User {UserId} in band {BandId} is now {Role}", userId, bandId, role);
    }

    async Task<bool> IBandService.CanManageBandAsync(Guid userId, Guid bandId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId.ToString());
        if (user == null || user.IsSuspended)
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
        var band = await GetBandOrThrowAsync(id);
        var members = band.Members.ToList();

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            foreach (var member in members)
            {
                await SetRoleAsync(member, BandMembershipRules.RoleOnLeaving(member));
            }

            await _bandRepository.DeleteBandAsync(id);
        });

        _logger.LogInformation("Band with ID {Id} deleted; {Count} members returned to their non-band roles", id, members.Count);
    }

    private async Task<Band> GetBandOrThrowAsync(Guid bandId)
    {
        return await _bandRepository.GetBandByIdAsync(bandId)
            ?? throw new NotFoundException("Band not found");
    }

    private async Task SetRoleAsync(User user, Roles role)
    {
        if (user.Role != role)
        {
            await _userRepository.UpdateUserRoleAsync(user, role);
        }

        _accessStateProvider.Invalidate(user.Id);
    }

    private static BandResponse ToResponse(Band band) => new(
        band.Id.ToString(),
        band.Name,
        band.Description ?? string.Empty,
        band.Genre,
        band.Country ?? string.Empty,
        band.City ?? string.Empty,
        band.CoverImage ?? [],
        band.SpotifyId,
        band.YouTubeEmbedId,
        band.Members?
            .OrderByDescending(m => BandMembershipRules.IsManagerRole(m.Role))
            .ThenBy(m => m.UserName)
            .Select(m => new MemberResponse(
                m.Id.ToString(),
                m.UserName ?? string.Empty,
                string.Empty,
                m.ProfilePicture,
                m.Role.ToString()))
            .ToList());
}
