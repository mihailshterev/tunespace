using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneSpace.Api.Extensions;
using TuneSpace.Core.DTOs.Requests.MusicDiscovery;
using TuneSpace.Core.DTOs.Responses.MusicDiscovery;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class MusicDiscoveryController(
    IMusicDiscoveryService musicDiscoveryService,
    IUserLocationService userLocationService,
    ILogger<MusicDiscoveryController> logger) : ControllerBase
{
    private readonly IMusicDiscoveryService _musicDiscoveryService = musicDiscoveryService;
    private readonly IUserLocationService _userLocationService = userLocationService;
    private readonly ILogger<MusicDiscoveryController> _logger = logger;

    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations([FromQuery] string? genres, [FromQuery] string? location = null)
    {
        try
        {
            var accessToken = Request.Cookies["SpotifyAccessToken"];

            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("Access token is required");
            }

            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User ID is required");
            }

            var genresList = string.IsNullOrEmpty(genres)
                ? []
                : genres.Split(',').ToList();

            var finalLocation = location;
            if (string.IsNullOrEmpty(finalLocation))
            {
                finalLocation = await DetermineUserLocationAsync();
            }

            var recommendations = await _musicDiscoveryService.GetBandRecommendationsAsync(
                accessToken,
                userId.ToString(),
                genresList,
                finalLocation ?? ""
            );

            return Ok(recommendations);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching band recommendations");
            return BadRequest(e.Message);
        }
    }

    [HttpGet("recommendations/enhanced")]
    public async Task<IActionResult> GetEnhancedRecommendations([FromQuery] string? genres, [FromQuery] string? location = null)
    {
        try
        {
            var accessToken = Request.Cookies["SpotifyAccessToken"];
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User ID is required");
            }

            var genresList = string.IsNullOrEmpty(genres)
                ? []
                : genres.Split(',').ToList();

            var finalLocation = location;
            if (string.IsNullOrEmpty(finalLocation))
            {
                finalLocation = await DetermineUserLocationAsync();
            }

            var recommendations = await _musicDiscoveryService.GetEnhancedBandRecommendationsAsync(
                accessToken,
                userId.ToString(),
                genresList,
                finalLocation ?? "");

            var enhancedRecommendations = recommendations
                .Where(r => r.DataSource?.Contains("Enhanced AI") == true ||
                           r.DataSource?.Contains("Collaborative Filtering") == true)
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Description,
                    r.Genres,
                    r.Location,
                    r.RelevanceScore,
                    r.DataSource,
                    r.ExternalUrls,
                    r.SimilarToArtistName,
                    r.ExternalUrl,
                    ConfidenceScore = r.RelevanceScore,
                    IsEnhancedAI = r.DataSource?.Contains("Enhanced AI") == true,
                    IsCollaborativeFiltering = r.DataSource?.Contains("Collaborative Filtering") == true,
                    AdaptiveLearningEnabled = true
                })
                .OrderByDescending(r => r.ConfidenceScore)
                .ToList();

            return Ok(new
            {
                Message = string.IsNullOrEmpty(accessToken)
                ? "Enhanced AI recommendations based on your preferences (Spotify not connected)"
                : "Enhanced AI recommendations with confidence scoring",
                HasSpotifyConnection = !string.IsNullOrEmpty(accessToken),
                TotalRecommendations = enhancedRecommendations.Count,
                HasAdaptiveLearning = !string.IsNullOrEmpty(accessToken),
                Location = finalLocation,
                ProcessedAt = DateTime.UtcNow,
                Recommendations = enhancedRecommendations
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching enhanced AI recommendations");
            return BadRequest(e.Message);
        }
    }

    [HttpPost("recommendations/preferences")]
    public async Task<IActionResult> GetRecommendationsByPreferences([FromBody] UserPreferencesRequest request)
    {
        try
        {
            var accessToken = Request.Cookies["SpotifyAccessToken"];
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User ID is required");
            }


            var finalLocation = request.Location;
            if (string.IsNullOrEmpty(finalLocation))
            {
                finalLocation = await DetermineUserLocationAsync();
            }

            var recommendations = await _musicDiscoveryService.GetBandRecommendationsAsync(
                accessToken,
                userId.ToString(),
                request.Genres,
                finalLocation ?? "");

            if (request.MaxRecommendations.HasValue && request.MaxRecommendations.Value > 0)
            {
                recommendations = [.. recommendations.Take(request.MaxRecommendations.Value)];
            }

            return Ok(new
            {
                Message = string.IsNullOrEmpty(accessToken)
                    ? "Recommendations based on your preferences (Spotify not connected)"
                    : "Recommendations based on your preferences and Spotify data",
                HasSpotifyConnection = !string.IsNullOrEmpty(accessToken),
                Location = finalLocation,
                TotalRecommendations = recommendations.Count,
                Recommendations = recommendations
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching recommendations by preferences");
            return BadRequest(e.Message);
        }
    }

    [HttpPost("recommendations/enhanced/preferences")]
    public async Task<IActionResult> GetEnhancedRecommendationsByPreferences([FromBody] UserPreferencesRequest request)
    {
        try
        {
            var accessToken = Request.Cookies["SpotifyAccessToken"];
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User ID is required");
            }

            var finalLocation = request.Location;
            if (string.IsNullOrEmpty(finalLocation))
            {
                finalLocation = await DetermineUserLocationAsync();
            }

            var recommendations = await _musicDiscoveryService.GetEnhancedBandRecommendationsAsync(
                accessToken,
                userId.ToString(),
                request.Genres,
                finalLocation ?? "");

            var enhancedRecommendations = recommendations
                .Where(r => r.DataSource?.Contains("Enhanced AI") == true ||
                           r.DataSource?.Contains("Collaborative Filtering") == true)
                .Select(r => new
                {
                    r.Id,
                    r.Name,
                    r.Description,
                    r.Genres,
                    r.Location,
                    r.RelevanceScore,
                    r.DataSource,
                    r.ExternalUrls,
                    r.SimilarToArtistName,
                    r.ExternalUrl,
                    ConfidenceScore = r.RelevanceScore,
                    IsEnhancedAI = r.DataSource?.Contains("Enhanced AI") == true,
                    IsCollaborativeFiltering = r.DataSource?.Contains("Collaborative Filtering") == true,
                    AdaptiveLearningEnabled = !string.IsNullOrEmpty(accessToken)
                })
                .OrderByDescending(r => r.ConfidenceScore)
                .ToList();

            if (request.MaxRecommendations.HasValue && request.MaxRecommendations.Value > 0)
            {
                enhancedRecommendations = [.. enhancedRecommendations.Take(request.MaxRecommendations.Value)];
            }

            return Ok(new
            {
                Message = string.IsNullOrEmpty(accessToken)
                    ? "Enhanced AI recommendations based on your preferences (Spotify not connected)"
                    : "Enhanced AI recommendations based on your preferences and Spotify data",
                HasSpotifyConnection = !string.IsNullOrEmpty(accessToken),
                TotalRecommendations = enhancedRecommendations.Count,
                HasAdaptiveLearning = !string.IsNullOrEmpty(accessToken),
                Location = finalLocation,
                ProcessedAt = DateTime.UtcNow,
                Recommendations = enhancedRecommendations
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching enhanced recommendations by preferences");
            return BadRequest(e.Message);
        }
    }

    [HttpPost("feedback")]
    public async Task<IActionResult> TrackRecommendationFeedback([FromBody] RecommendationFeedbackRequest request, [FromQuery] string? genres = null)
    {
        try
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User ID is required");
            }

            var genresList = string.IsNullOrEmpty(genres)
                ? []
                : genres.Split(',').ToList();

            await _musicDiscoveryService.TrackRecommendationInteractionAsync(
                userId.ToString(),
                request.ArtistName,
                request.InteractionType,
                genresList,
                request.Rating);

            var response = new RecommendationFeedbackResponse(
                $"Successfully tracked {request.InteractionType} feedback for {request.ArtistName}",
                true,
                DateTime.UtcNow);

            return Ok(response);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error tracking recommendation feedback");

            var errorResponse = new RecommendationFeedbackResponse(
                "Failed to track recommendation feedback",
                false,
                DateTime.UtcNow);

            return BadRequest(errorResponse);
        }
    }

    [HttpPost("feedback/batch")]
    public async Task<IActionResult> TrackBatchRecommendationFeedback([FromBody] BatchRecommendationFeedbackRequest request)
    {
        try
        {
            var userId = User.GetUserId();
            if (userId == Guid.Empty)
            {
                return Unauthorized("User ID is required");
            }

            var interactions = request.Interactions
                .Select(i => (i.ArtistName, i.InteractionType, i.Rating, i.Genres))
                .ToList();

            await _musicDiscoveryService.TrackBatchRecommendationInteractionsAsync(
                userId.ToString(),
                interactions);

            var response = new BatchRecommendationFeedbackResponse(
                $"Successfully processed {request.Interactions.Count} feedback interactions",
                true,
                request.Interactions.Count,
                0,
                DateTime.UtcNow);

            return Ok(response);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error tracking batch recommendation feedback");

            var errorResponse = new BatchRecommendationFeedbackResponse(
                "Failed to track recommendation feedback",
                false,
                0,
                request.Interactions.Count,
                DateTime.UtcNow);

            return BadRequest(errorResponse);
        }
    }

    private async Task<string?> DetermineUserLocationAsync()
    {
        try
        {
            var ipAddress = GetClientIpAddress();

            if (!string.IsNullOrEmpty(ipAddress))
            {
                var locationResponse = await _userLocationService.DetectLocationByIpAsync(ipAddress);
                if (locationResponse != null)
                {
                    return $"{locationResponse.City}, {locationResponse.Country}";
                }
            }

            var defaultLocation = _userLocationService.GetDefaultLocation();
            return $"{defaultLocation.City}, {defaultLocation.Country}";
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to determine user location, using default");
            var defaultLocation = _userLocationService.GetDefaultLocation();
            return $"{defaultLocation.City}, {defaultLocation.Country}";
        }
    }

    private string? GetClientIpAddress()
    {
        try
        {
            var forwardedFor = Request.Headers["X-Forwarded-For"].FirstOrDefault();
            if (!string.IsNullOrEmpty(forwardedFor))
            {
                var ip = forwardedFor.Split(',').FirstOrDefault()?.Trim();
                if (!string.IsNullOrEmpty(ip) && IPAddress.TryParse(ip, out _))
                {
                    return ip;
                }
            }

            var realIp = Request.Headers["X-Real-IP"].FirstOrDefault();
            if (!string.IsNullOrEmpty(realIp) && IPAddress.TryParse(realIp, out _))
            {
                return realIp;
            }

            var remoteIp = Request.HttpContext.Connection.RemoteIpAddress?.ToString();
            if (!string.IsNullOrEmpty(remoteIp) && remoteIp != "::1" && remoteIp != "127.0.0.1")
            {
                return remoteIp;
            }

            return null;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to get client IP address");
            return null;
        }
    }
}
