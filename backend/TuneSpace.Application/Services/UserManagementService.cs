using Microsoft.Extensions.Logging;
using TuneSpace.Application.Common;
using TuneSpace.Core.DTOs.Responses.Admin;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Core.Models;

namespace TuneSpace.Application.Services;

internal class UserManagementService(
    IUserRepository userRepository,
    IBandRepository bandRepository,
    IRefreshTokenRepository refreshTokenRepository,
    IUnitOfWork unitOfWork,
    IUserAccessStateProvider accessStateProvider,
    ILogger<UserManagementService> logger) : IUserManagementService
{
    public const int MaxPageSize = 100;

    private readonly IUserRepository _userRepository = userRepository;
    private readonly IBandRepository _bandRepository = bandRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository = refreshTokenRepository;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IUserAccessStateProvider _accessStateProvider = accessStateProvider;
    private readonly ILogger<UserManagementService> _logger = logger;

    async Task<UserListResponse> IUserManagementService.GetUsersAsync(string? search, Roles? role, bool? suspended, int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);

        var (users, totalCount) = await _userRepository.GetUsersPagedAsync(search, role, suspended, (page - 1) * pageSize, pageSize);

        var bandIds = users.Where(u => u.BandId.HasValue).Select(u => u.BandId!.Value).Distinct().ToList();
        var bands = await _bandRepository.GetBandSummariesAsync(bandIds);

        var items = users
            .Select(u => new ManagedUserResponse(
                u.Id,
                u.UserName,
                u.Email,
                u.Role.ToString(),
                u.EmailConfirmed,
                u.IsSuspended,
                u.LastActiveDate,
                u.ExternalProvider,
                u.HasProfilePicture,
                u.BandId is { } bandId ? bands.GetValueOrDefault(bandId) : null))
            .ToList();

        return new UserListResponse(items, totalCount, page, pageSize);
    }

    async Task<UserStatsResponse> IUserManagementService.GetStatsAsync()
    {
        var countsByRole = await _userRepository.GetUserCountsByRoleAsync();
        var suspendedCount = await _userRepository.GetSuspendedUserCountAsync();

        // Report every role, including ones with no users, so clients get a stable shape.
        var usersByRole = Enum.GetValues<Roles>()
            .ToDictionary(r => r.ToString(), r => countsByRole.GetValueOrDefault(r));

        return new UserStatsResponse(countsByRole.Values.Sum(), suspendedCount, usersByRole);
    }

    async Task<ManagedUserResponse> IUserManagementService.ChangeRoleAsync(Guid actorId, Guid userId, Roles role)
    {
        // Blocking self-changes also guarantees at least one admin always remains.
        if (actorId == userId)
        {
            throw new ConflictException("You cannot change your own role.");
        }

        var user = await GetUserOrThrowAsync(userId);
        var band = await _bandRepository.GetBandByUserIdAsync(userId.ToString());

        if (user.Role == role)
        {
            return ToResponse(user, band);
        }

        var reason = BandMembershipRules.ValidateRoleChange(user, band, role);
        if (reason is not null)
        {
            throw new ConflictException(reason);
        }

        var previousRole = user.Role;
        var leavesBand = band is not null && role == Roles.Listener;

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            if (leavesBand)
            {
                band!.Members.Remove(user);
                await _bandRepository.UpdateBandAsync(band);
            }

            await _userRepository.UpdateUserRoleAsync(user, role);
        });

        _accessStateProvider.Invalidate(user.Id);

        _logger.LogInformation("Admin {ActorId} changed role of user {UserId} from {PreviousRole} to {NewRole}; removed from band: {LeftBand}",
            actorId, userId, previousRole, role, leavesBand);

        return ToResponse(user, leavesBand ? null : band);
    }

    async Task<ManagedUserResponse> IUserManagementService.SetSuspendedAsync(Guid actorId, Guid userId, bool suspended)
    {
        if (actorId == userId)
        {
            throw new ConflictException("You cannot suspend or restore your own account.");
        }

        var user = await GetUserOrThrowAsync(userId);
        var band = await _bandRepository.GetBandByUserIdAsync(userId.ToString());

        if (user.IsSuspended == suspended)
        {
            return ToResponse(user, band);
        }

        await _unitOfWork.ExecuteInTransactionAsync(async () =>
        {
            await _userRepository.SetSuspendedAsync(user, suspended);
            if (suspended)
            {
                await _refreshTokenRepository.RevokeAllForUserAsync(user.Id);
            }
        });

        _accessStateProvider.Invalidate(user.Id);

        _logger.LogInformation("Admin {ActorId} changed suspension of user {UserId} to {Suspended}", actorId, userId, suspended);

        return ToResponse(user, band);
    }

    private async Task<User> GetUserOrThrowAsync(Guid userId)
    {
        return await _userRepository.GetUserByIdAsync(userId.ToString())
            ?? throw new NotFoundException($"User not found: {userId}");
    }

    private static ManagedUserResponse ToResponse(User user, Band? band) => new(
        user.Id,
        user.UserName ?? string.Empty,
        user.Email ?? string.Empty,
        user.Role.ToString(),
        user.EmailConfirmed,
        user.IsSuspended,
        user.LastActiveDate,
        user.ExternalProvider,
        user.ProfilePicture is { Length: > 0 },
        band is null
            ? null
            : new BandSummary(
                band.Id,
                band.Name,
                band.Members.Count,
                band.Members.Count(m => BandMembershipRules.IsManagerRole(m.Role))));
}
