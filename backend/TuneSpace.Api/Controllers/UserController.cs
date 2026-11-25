using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneSpace.Api.DTOs;
using TuneSpace.Api.Extensions;
using TuneSpace.Core.DTOs.Responses.User;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class UserController(
    IUserService userService,
    ILogger<UserController> logger) : ControllerBase
{
    private readonly IUserService _userService = userService;
    private readonly ILogger<UserController> _logger = logger;

    [HttpGet("{username}")]
    public async Task<IActionResult> GetUserByName(string username)
    {
        if (string.IsNullOrEmpty(username))
        {
            return BadRequest("Username cannot be null or empty");
        }

        try
        {
            var user = await _userService.GetUserByNameAsync(username);
            if (user is null)
            {
                return NotFound("User not found");
            }

            return Ok(user);
        }
        catch (NotFoundException e)
        {
            _logger.LogWarning(e, "User not found");
            return NotFound();
        }
    }

    [HttpGet("search/{search}")]
    public async Task<IActionResult> GetUsersBySearch(string search)
    {
        if (string.IsNullOrEmpty(search))
        {
            return BadRequest("Search term cannot be empty");
        }

        try
        {
            var currentUserId = User.GetUserId().ToString();
            var users = await _userService.SearchByNameAsync(search, currentUserId);
            var response = users
                .Select(user => new UserSearchResultResponse(user.Id, user.UserName ?? string.Empty, user.ProfilePicture ?? []))
                .ToList();

            return Ok(response);
        }
        catch (NotFoundException e)
        {
            _logger.LogWarning(e, "No users found for search: {Search}", LoggingExtensions.SanitizeForLogging(search));
            return NotFound(new List<UserSearchResultResponse>());
        }
    }

    [HttpGet("{username}/profile-picture")]
    public async Task<IActionResult> GetProfilePicture(string username)
    {
        if (string.IsNullOrEmpty(username))
        {
            return BadRequest("Username cannot be null or empty");
        }

        try
        {
            var profilePicture = await _userService.GetProfilePictureAsync(username);

            if (profilePicture is null)
            {
                return NotFound("Profile picture not found");
            }

            return File(profilePicture, "image/jpeg");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching profile picture for user");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{username}/profile")]
    public async Task<IActionResult> GetUserProfile(string username)
    {
        if (string.IsNullOrEmpty(username))
        {
            return BadRequest("Username cannot be null or empty");
        }

        try
        {
            var user = await _userService.GetUserByNameAsync(username);
            if (user is null)
            {
                return NotFound("User not found");
            }

            var profilePictureBase64 = user.ProfilePicture != null ?
                Convert.ToBase64String(user.ProfilePicture) : null;

            //TODO: Update
            var profile = new UserProfileResponse(
                Username: user.UserName ?? string.Empty,
                FollowerCount: 0,
                FollowingCount: 0,
                PostsCount: 0,
                PlaylistsCount: 0,
                FavoriteSong: "Unknown",
                FavoriteBand: "Unknown",
                ProfilePicture: profilePictureBase64
            );

            return Ok(profile);
        }
        catch (NotFoundException e)
        {
            _logger.LogWarning(e, "User not found");
            return NotFound();
        }
    }

    [HttpPost("upload-profile-picture")]
    public async Task<IActionResult> UploadProfilePicture([FromForm] ProfileUpdateRequest request)
    {
        var file = request.File;
        var username = request.Username;

        if (file is null || file.Length == 0)
        {
            return BadRequest("No file uploaded");
        }

        if (string.IsNullOrEmpty(username))
        {
            return BadRequest("Username cannot be null or empty");
        }

        string[] allowedFileTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp"];
        if (!allowedFileTypes.Contains(file.ContentType.ToLower()))
        {
            return BadRequest("Invalid file type. Only JPEG, PNG, JPG, GIF and WEBP are allowed.");
        }

        if (file.Length > 5 * 1024 * 1024)
        {
            return BadRequest("File size cannot exceed 5MB");
        }

        try
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            byte[] fileBytes = memoryStream.ToArray();

            await _userService.UpdateProfilePictureAsync(username, fileBytes);

            return Ok(new { message = "Profile picture updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading profile picture");
            return StatusCode(500, "Internal server error");
        }
    }
}
