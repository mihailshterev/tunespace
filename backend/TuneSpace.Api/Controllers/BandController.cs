using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneSpace.Api.DTOs;
using TuneSpace.Api.Extensions;
using TuneSpace.Application.Common;
using TuneSpace.Core.DTOs.Requests.Band;
using TuneSpace.Core.DTOs.Responses.User;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class BandController(
    IBandService bandService,
    IBandFollowService bandFollowService,
    ILogger<BandController> logger) : ControllerBase
{
    private readonly IBandService _bandService = bandService;
    private readonly IBandFollowService _bandFollowService = bandFollowService;
    private readonly ILogger<BandController> _logger = logger;

    [HttpGet("{bandId}")]
    public async Task<IActionResult> GetBandById(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        try
        {
            var band = await _bandService.GetBandByIdAsync(parsedBandId);
            return Ok(band);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching band with ID: {BandId}", LoggingExtensions.SanitizeForLogging(bandId));
            return BadRequest();
        }
    }

    [HttpGet("user/{userId}")]
    [Authorize]
    public async Task<IActionResult> GetBandByUserId(string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User ID cannot be null or empty");
        }

        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return BadRequest("Invalid User ID format");
        }

        try
        {
            var band = await _bandService.GetBandByUserIdAsync(userId);
            return Ok(band);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching band for user with ID: {UserId}", LoggingExtensions.SanitizeForLogging(userId));
            return BadRequest();
        }
    }

    [HttpGet("{bandId}/image")]
    [Authorize]
    public async Task<IActionResult> GetBandImage(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        try
        {
            var imageData = await _bandService.GetBandImageAsync(parsedBandId);

            if (imageData is null)
            {
                return NotFound();
            }

            return File(imageData, "image/jpeg");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching band image for ID: {BandId}", LoggingExtensions.SanitizeForLogging(bandId));
            return BadRequest();
        }
    }

    [HttpPost("register")]
    [Authorize]
    public async Task<IActionResult> CreateBand([FromForm] BandCreateRequest request)
    {
        try
        {
            var userId = User.GetUserId().ToString();

            var fileDto = await Helpers.ConvertToFileDto(request.Picture);

            var createBandRequest = new CreateBandRequest(
                userId,
                request.Name,
                request.Description,
                request.Genre,
                request.Location,
                fileDto ?? null
            );

            var band = await _bandService.CreateBandAsync(createBandRequest);

            if (band is null)
            {
                return BadRequest();
            }

            return Ok(band.Id);
        }
        catch (ConflictException e)
        {
            return Conflict(e.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating band");
            return BadRequest();
        }
    }

    [HttpPost("add-member")]
    [Authorize]
    public async Task<IActionResult> AddMemberToBand([FromBody] AddMemberRequest request)
    {
        var userId = request.UserId;
        var bandId = request.BandId;

        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(bandId))
        {
            return BadRequest("User ID and Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(userId, out var parsedUserId) || !Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid User ID or Band ID format");
        }

        try
        {
            if (!await _bandService.CanManageBandAsync(User.GetUserId(), parsedBandId))
            {
                return Forbid();
            }

            await _bandService.AddMemberToBandAsync(parsedUserId, parsedBandId);
            return Ok("Member added successfully");
        }
        catch (NotFoundException e)
        {
            return NotFound(e.Message);
        }
        catch (ConflictException e)
        {
            return Conflict(e.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error adding member to band with ID: {BandId}", LoggingExtensions.SanitizeForLogging(bandId));
            return BadRequest();
        }
    }

    [HttpPut("update")]
    [Authorize]
    public async Task<IActionResult> UpdateBand([FromForm] BandUpdateRequest request)
    {
        try
        {
            if (!await _bandService.CanManageBandAsync(User.GetUserId(), request.Id))
            {
                return Forbid();
            }

            var fileDto = await Helpers.ConvertToFileDto(request.Picture);

            var updateBandRequest = new UpdateBandRequest(
                request.Id,
                request.Name,
                request.Description,
                request.Genre,
                request.SpotifyId,
                request.YouTubeEmbedId,
                fileDto ?? null
            );

            await _bandService.UpdateBandAsync(updateBandRequest);
            return Ok("Band updated successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error updating band");
            return BadRequest();
        }
    }

    [HttpDelete("{bandId}")]
    [Authorize]
    public async Task<IActionResult> DeleteBand(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        try
        {
            if (!await _bandService.CanManageBandAsync(User.GetUserId(), parsedBandId))
            {
                return Forbid();
            }

            await _bandService.DeleteBandAsync(parsedBandId);
            return Ok("Band deleted successfully");
        }
        catch (NotFoundException e)
        {
            return NotFound(e.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error deleting band with ID: {BandId}", LoggingExtensions.SanitizeForLogging(bandId));
            return BadRequest();
        }
    }

    /// <summary>
    /// Removes a member from a band. Band managers may remove anyone; any member may remove themselves (leave).
    /// </summary>
    [HttpDelete("{bandId:guid}/members/{userId:guid}")]
    [Authorize]
    public async Task<IActionResult> RemoveMember(Guid bandId, Guid userId)
    {
        try
        {
            var actorId = User.GetUserId();
            if (actorId != userId && !await _bandService.CanManageBandAsync(actorId, bandId))
            {
                return Forbid();
            }

            await _bandService.RemoveMemberAsync(bandId, userId);
            return NoContent();
        }
        catch (NotFoundException e)
        {
            return NotFound(e.Message);
        }
        catch (ConflictException e)
        {
            return Conflict(e.Message);
        }
    }

    /// <summary>
    /// Makes a member a Band Admin or a Band Member. Only band managers may do this.
    /// </summary>
    [HttpPut("{bandId:guid}/members/{userId:guid}/role")]
    [Authorize]
    public async Task<IActionResult> SetMemberRole(Guid bandId, Guid userId, [FromBody] UpdateMemberRoleRequest request)
    {
        if (request is null || !Enum.TryParse<Roles>(request.Role, true, out var role) || !Enum.IsDefined(role))
        {
            return BadRequest("Invalid role specified");
        }

        try
        {
            if (!await _bandService.CanManageBandAsync(User.GetUserId(), bandId))
            {
                return Forbid();
            }

            await _bandService.SetMemberRoleAsync(bandId, userId, role);
            return NoContent();
        }
        catch (NotFoundException e)
        {
            return NotFound(e.Message);
        }
        catch (ConflictException e)
        {
            return Conflict(e.Message);
        }
    }

    [HttpGet("{bandId}/followers")]
    public async Task<ActionResult<List<UserSearchResultResponse>>> GetBandFollowers(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        try
        {
            var followers = await _bandFollowService.GetBandFollowersAsync(parsedBandId);
            return Ok(followers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting followers for band {BandId}", LoggingExtensions.SanitizeForLogging(bandId));
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{bandId}/follower-count")]
    public async Task<ActionResult<int>> GetBandFollowerCount(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        try
        {
            var count = await _bandFollowService.GetBandFollowerCountAsync(parsedBandId);
            return Ok(count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting follower count for band {BandId}", LoggingExtensions.SanitizeForLogging(bandId));
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{bandId}/is-following")]
    [Authorize]
    public async Task<ActionResult<bool>> IsFollowingBand(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return BadRequest("Invalid user ID");
        }

        try
        {
            var isFollowing = await _bandFollowService.IsFollowingBandAsync(userId, parsedBandId);
            return Ok(isFollowing);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user {UserId} is following band {BandId}", userId, LoggingExtensions.SanitizeForLogging(bandId));
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPost("{bandId}/follow")]
    [Authorize]
    public async Task<IActionResult> FollowBand(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return BadRequest("Invalid user ID");
        }

        try
        {
            var success = await _bandFollowService.FollowBandAsync(userId, parsedBandId);
            if (success)
            {
                return Ok("Successfully followed band");
            }
            else
            {
                return BadRequest("Already following this band or band/user not found");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error when user {UserId} attempting to follow band {BandId}", userId, LoggingExtensions.SanitizeForLogging(bandId));
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{bandId}/unfollow")]
    [Authorize]
    public async Task<IActionResult> UnfollowBand(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return BadRequest("Invalid user ID");
        }

        try
        {
            var success = await _bandFollowService.UnfollowBandAsync(userId, parsedBandId);
            if (success)
            {
                return Ok("Successfully unfollowed band");
            }
            else
            {
                return BadRequest("Not following this band");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error when user {UserId} attempting to unfollow band {BandId}", userId, LoggingExtensions.SanitizeForLogging(bandId));
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("user/{userId}/followed-bands")]
    [Authorize]
    public async Task<IActionResult> GetUserFollowedBands(string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User ID cannot be null or empty");
        }

        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return BadRequest("Invalid User ID format");
        }

        try
        {
            var followedBands = await _bandFollowService.GetUserFollowedBandsAsync(parsedUserId);
            return Ok(followedBands);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting followed bands for user {UserId}", LoggingExtensions.SanitizeForLogging(userId));
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("user/{userId}/followed-bands-count")]
    [Authorize]
    public async Task<ActionResult<int>> GetUserFollowedBandsCount(string userId)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return BadRequest("User ID cannot be null or empty");
        }

        if (!Guid.TryParse(userId, out var parsedUserId))
        {
            return BadRequest("Invalid User ID format");
        }

        try
        {
            var count = await _bandFollowService.GetUserFollowedBandsCountAsync(parsedUserId);
            return Ok(count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting followed bands count for user {UserId}", LoggingExtensions.SanitizeForLogging(userId));
            return StatusCode(500, "Internal server error");
        }
    }
}
