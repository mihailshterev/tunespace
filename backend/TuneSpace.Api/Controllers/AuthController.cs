using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Mvc;
using TuneSpace.Api.Infrastructure;
using TuneSpace.Core.Common;
using TuneSpace.Core.DTOs.Requests.Auth;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController(
    IAuthService authService,
    IUserService userService,
    ITokenService tokenService,
    ISpotifyService spotifyService,
    IOAuthStateService oAuthStateService,
    ILogger<AuthController> logger) : ControllerBase
{
    private readonly IAuthService _authService = authService;
    private readonly IUserService _userService = userService;
    private readonly ITokenService _tokenService = tokenService;
    private readonly ISpotifyService _spotifyService = spotifyService;
    private readonly IOAuthStateService _oAuthStateService = oAuthStateService;
    private readonly ILogger<AuthController> _logger = logger;

    [HttpGet("current-user")]
    public async Task<IActionResult> GetCurrentUser()
    {
        try
        {
            var accessToken = CookieHelper.GetAccessToken(Request);
            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("No access token provided");
            }

            var principal = await _tokenService.ValidateAccessTokenAsync(accessToken);
            if (principal is null)
            {
                return Unauthorized("Invalid access token");
            }

            var userId = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid token claims");
            }

            var user = await _userService.GetUserByIdAsync(userId);
            if (user is null)
            {
                return NotFound("User not found");
            }

            if (user.IsSuspended)
            {
                return Unauthorized("Account is suspended");
            }

            var profilePictureBase64 = user.ProfilePicture != null ?
                Convert.ToBase64String(user.ProfilePicture) : null;

            return Ok(new
            {
                id = user.Id.ToString(),
                username = user.UserName,
                email = user.Email,
                role = user.Role.ToString(),
                profilePicture = profilePictureBase64,
                externalProvider = user.ExternalProvider
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error during current user retrieval");
            return StatusCode(500, "An error occurred while retrieving current user information.");
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (request is null
        || string.IsNullOrEmpty(request.Name)
        || string.IsNullOrEmpty(request.Email)
        || string.IsNullOrEmpty(request.Password)
        || string.IsNullOrEmpty(request.Role))
        {
            return BadRequest("Invalid registration request.");
        }

        if (!Enum.TryParse<Roles>(request.Role, true, out var role))
        {
            return BadRequest("Invalid role specified");
        }

        // Self-registration only creates listeners. Band roles come from creating or joining a band,
        // and Admin is granted by another admin (or the Admin:BootstrapEmails setting).
        if (role != Roles.Listener)
        {
            return BadRequest("Invalid role specified");
        }

        try
        {
            await _authService.RegisterAsync(request.Name, request.Email, request.Password, role);
            var user = await _userService.GetUserByNameAsync(request.Name);

            if (user is null)
            {
                return NotFound("User not found");
            }

            return Ok(new { user.Id });
        }
        catch (ArgumentException e)
        {
            _logger.LogWarning(e, "Registration conflict");
            return Conflict(e.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error during registration");
            return StatusCode(500, "An error occurred while registering.");
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (request is null || string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
        {
            return BadRequest("Invalid login request.");
        }

        try
        {
            var response = await _authService.LoginAsync(request.Email, request.Password);

            var user = await _userService.GetUserByIdAsync(response.Id);

            var username = response.Username;
            var accessToken = response.AccessToken;
            var role = response.Role;
            var id = response.Id;
            var email = user?.Email;
            var externalProvider = user?.ExternalProvider;

            CookieHelper.SetAuthTokens(Response, response.AccessToken, response.RefreshToken);

            return Ok(new
            {
                id,
                username,
                email,
                accessToken,
                role,
                externalProvider
            });
        }
        catch (UnauthorizedException e)
        {
            _logger.LogError(e, "Unexpected error during login");
            return Unauthorized(e.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error during login");
            return StatusCode(500, "An error occurred while logging in.");
        }
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        try
        {
            var refreshToken = CookieHelper.GetRefreshToken(Request);
            if (string.IsNullOrEmpty(refreshToken))
            {
                _logger.LogWarning("Logout failed: No refresh token provided");
                return BadRequest("Refresh token is required");
            }

            await _tokenService.RevokeRefreshTokenAsync(refreshToken);

            CookieHelper.ClearAuthTokens(Response);
            Response.Cookies.Delete("SpotifyAccessToken");
            Response.Cookies.Delete("SpotifyRefreshToken");

            return NoContent();
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error during logout");
            return StatusCode(500, "An error occurred during logout.");
        }
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken()
    {
        try
        {
            var refreshToken = CookieHelper.GetRefreshToken(Request);
            if (string.IsNullOrEmpty(refreshToken))
            {
                _logger.LogWarning("Refresh token is missing");
                return BadRequest("Refresh token is required");
            }

            var user = await _tokenService.ValidateRefreshTokenAsync(refreshToken);
            if (user is null)
            {
                return Unauthorized();
            }

            var newAccessToken = _tokenService.GenerateAccessToken(user);
            var newRefreshToken = _tokenService.GenerateRefreshToken();

            await _tokenService.SaveRefreshTokenAsync(user, newRefreshToken);

            CookieHelper.SetAuthTokens(Response, newAccessToken, newRefreshToken);

            var username = user.UserName;
            var role = user.Role.ToString();
            var id = user.Id;

            _logger.LogInformation("Token refreshed successfully");
            return Ok(new
            {
                id,
                username,
                newAccessToken,
                role
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Unexpected error during token refresh");
            return StatusCode(500, "An error occurred while refreshing the token.");
        }
    }

    [HttpPost("spotify-oauth")]
    public async Task<IActionResult> SpotifyOAuth([FromBody] SpotifyOAuthRequest request)
    {
        if (request is null || string.IsNullOrEmpty(request.Code))
        {
            return BadRequest("Authorization code is required.");
        }

        if (string.IsNullOrEmpty(request.State))
        {
            _logger.LogWarning("Missing OAuth state parameter in Spotify OAuth request");
            return BadRequest("Missing OAuth state parameter.");
        }

        var actualState = request.State;
        if (request.State.Contains(':'))
        {
            var parts = request.State.Split(':', 2);
            if (parts.Length == 2)
            {
                actualState = parts[1];
            }
        }

        if (!_oAuthStateService.ValidateAndConsumeState(actualState))
        {
            _logger.LogWarning("Invalid OAuth state parameter in Spotify OAuth request");
            return BadRequest("Invalid OAuth state parameter.");
        }

        try
        {
            var spotifyTokens = await _spotifyService.ExchangeCodeForTokenAsync(request.Code);

            var spotifyProfile = await _spotifyService.GetUserSpotifyProfileAsync(spotifyTokens.AccessToken);

            var response = await _spotifyService.GetUserInfoAsync(spotifyTokens.AccessToken);

            var loginResponse = await _authService.ExternalLoginAsync(
                response.Id,
                response.Email,
                spotifyProfile.Username,
                ExternalProviders.Spotify,
                spotifyProfile.ProfilePicture
            );

            CookieHelper.SetAuthTokens(Response, loginResponse.AccessToken, loginResponse.RefreshToken);

            var tokenExpiry = DateTime.Now.AddSeconds(spotifyTokens.ExpiresIn);

            Response.Cookies.Append("SpotifyAccessToken", spotifyTokens.AccessToken, new CookieOptions
            {
                Expires = tokenExpiry,
                HttpOnly = true,
                Secure = true,
                IsEssential = true,
                Domain = "localhost",
                SameSite = SameSiteMode.None
            });

            Response.Cookies.Append("SpotifyRefreshToken", spotifyTokens.RefreshToken, new CookieOptions
            {
                Expires = DateTime.Now.AddDays(30),
                HttpOnly = true,
                Secure = true,
                IsEssential = true,
                Domain = "localhost",
                SameSite = SameSiteMode.None
            });

            return Ok(new
            {
                id = loginResponse.Id,
                username = loginResponse.Username,
                accessToken = loginResponse.AccessToken,
                role = loginResponse.Role
            });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error during Spotify OAuth authentication");
            return StatusCode(500, "An error occurred during Spotify authentication.");
        }
    }

    [HttpPost("connect-spotify")]
    public async Task<IActionResult> ConnectSpotify([FromBody] SpotifyOAuthRequest request)
    {
        if (request is null || string.IsNullOrEmpty(request.Code))
        {
            return BadRequest("Authorization code is required.");
        }

        if (string.IsNullOrEmpty(request.State))
        {
            _logger.LogWarning("Missing OAuth state parameter in Spotify connect request");
            return BadRequest("Missing OAuth state parameter.");
        }

        var actualState = request.State;
        if (request.State.Contains(':'))
        {
            var parts = request.State.Split(':', 2);
            if (parts.Length == 2)
            {
                actualState = parts[1];
            }
        }

        if (!_oAuthStateService.ValidateAndConsumeState(actualState))
        {
            _logger.LogWarning("Invalid OAuth state parameter in Spotify connect request");
            return BadRequest("Invalid OAuth state parameter.");
        }

        try
        {
            var accessToken = CookieHelper.GetAccessToken(Request);
            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("No access token provided");
            }

            var principal = await _tokenService.ValidateAccessTokenAsync(accessToken);
            if (principal is null)
            {
                return Unauthorized("Invalid access token");
            }

            var userId = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid token claims");
            }

            var spotifyTokens = await _spotifyService.ExchangeCodeForTokenAsync(request.Code);

            var spotifyProfile = await _spotifyService.GetUserSpotifyProfileAsync(spotifyTokens.AccessToken);
            var response = await _spotifyService.GetUserInfoAsync(spotifyTokens.AccessToken);

            await _authService.ConnectExternalAccountAsync(
                userId,
                response.Id,
                response.Email,
                spotifyProfile.Username,
                ExternalProviders.Spotify,
                spotifyProfile.ProfilePicture
            );

            var tokenExpiry = DateTime.Now.AddSeconds(spotifyTokens.ExpiresIn);

            Response.Cookies.Append("SpotifyAccessToken", spotifyTokens.AccessToken, new CookieOptions
            {
                Expires = tokenExpiry,
                HttpOnly = true,
                Secure = true,
                IsEssential = true,
                Domain = "localhost",
                SameSite = SameSiteMode.None
            });

            Response.Cookies.Append("SpotifyRefreshToken", spotifyTokens.RefreshToken, new CookieOptions
            {
                Expires = DateTime.Now.AddDays(30),
                HttpOnly = true,
                Secure = true,
                IsEssential = true,
                Domain = "localhost",
                SameSite = SameSiteMode.None
            });

            return Ok(new
            {
                success = true,
                message = "Spotify account connected successfully"
            });
        }
        catch (InvalidOperationException e)
        {
            _logger.LogWarning(e, "Failed to connect Spotify account for user");
            return Conflict(e.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error during Spotify account connection");
            return StatusCode(500, "An error occurred while connecting your Spotify account.");
        }
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
    {
        if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(token))
        {
            return BadRequest("User ID and token are required.");
        }

        try
        {
            var loginResponse = await _authService.ConfirmEmailAndLoginAsync(userId, token);
            if (loginResponse != null)
            {
                var user = await _userService.GetUserByIdAsync(loginResponse.Id);

                CookieHelper.SetAuthTokens(Response, loginResponse.AccessToken, loginResponse.RefreshToken);

                return Ok(new
                {
                    message = "Email confirmed successfully. You are now logged in.",
                    user = new
                    {
                        id = loginResponse.Id,
                        username = loginResponse.Username,
                        email = user?.Email,
                        accessToken = loginResponse.AccessToken,
                        role = loginResponse.Role,
                        isExternalProvider = !string.IsNullOrEmpty(user?.ExternalProvider)
                    }
                });
            }
            else
            {
                return BadRequest("Invalid or expired confirmation token.");
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error confirming email");
            return StatusCode(500, "An error occurred while confirming your email.");
        }
    }

    [HttpPost("resend-confirmation")]
    public async Task<IActionResult> ResendEmailConfirmation([FromBody] ResendConfirmationRequest request)
    {
        if (request is null || string.IsNullOrEmpty(request.Email))
        {
            return BadRequest("Email is required.");
        }

        try
        {
            await _authService.ResendEmailConfirmationAsync(request.Email);
            return Ok(new { message = "Confirmation email sent. Please check your inbox." });
        }
        catch (ArgumentException e)
        {
            _logger.LogWarning(e, "Failed to resend confirmation email");
            return NotFound(e.Message);
        }
        catch (InvalidOperationException e)
        {
            _logger.LogWarning(e, "Email already confirmed");
            return BadRequest(e.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error resending confirmation email");
            return StatusCode(500, "An error occurred while sending the confirmation email.");
        }
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        if (request is null || string.IsNullOrEmpty(request.Email))
        {
            return BadRequest("Email is required.");
        }

        try
        {
            await _authService.RequestPasswordResetAsync(request.Email);
            return Ok(new { message = "Password reset email sent. Please check your inbox." });
        }
        catch (ArgumentException e)
        {
            _logger.LogWarning(e, "Password reset requested for non-existent email");
            return Ok(new { message = "Password reset email sent. Please check your inbox." });
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error sending password reset email");
            return StatusCode(500, "An error occurred while sending the password reset email.");
        }
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest request)
    {
        if (request is null || string.IsNullOrEmpty(request.UserId) ||
            string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewPassword))
        {
            return BadRequest("User ID, token, and new password are required.");
        }

        try
        {
            var result = await _authService.ResetPasswordAsync(request.UserId, request.Token, request.NewPassword);
            if (result)
            {
                return Ok(new { message = "Password reset successfully. You can now log in with your new password." });
            }
            else
            {
                return BadRequest("Invalid or expired reset token.");
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error resetting password");
            return StatusCode(500, "An error occurred while resetting your password.");
        }
    }

    [HttpPost("request-email-change")]
    public async Task<IActionResult> RequestEmailChange([FromBody] ChangeEmailRequest request)
    {
        if (request is null || string.IsNullOrEmpty(request.NewEmail))
        {
            return BadRequest("New email is required.");
        }

        try
        {
            var accessToken = CookieHelper.GetAccessToken(Request);
            if (string.IsNullOrEmpty(accessToken))
            {
                return Unauthorized("No access token provided");
            }

            var principal = await _tokenService.ValidateAccessTokenAsync(accessToken);
            if (principal is null)
            {
                return Unauthorized("Invalid access token");
            }

            var userId = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized("Invalid token claims");
            }

            await _authService.RequestEmailChangeAsync(userId, request.NewEmail);
            return Ok(new { message = "Email change confirmation sent to your new email address. Please check your inbox." });
        }
        catch (ArgumentException e)
        {
            _logger.LogWarning(e, "Email change request failed");
            return BadRequest(e.Message);
        }
        catch (InvalidOperationException e)
        {
            _logger.LogWarning(e, "Email change request failed");
            return BadRequest(e.Message);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error requesting email change");
            return StatusCode(500, "An error occurred while requesting the email change.");
        }
    }

    [HttpPost("confirm-email-change")]
    public async Task<IActionResult> ConfirmEmailChange([FromBody] ConfirmEmailChangeRequest request)
    {
        if (request is null || string.IsNullOrEmpty(request.UserId) ||
            string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.NewEmail))
        {
            return BadRequest("User ID, token, and new email are required.");
        }

        try
        {
            var result = await _authService.ConfirmEmailChangeAsync(request.UserId, request.Token, request.NewEmail);
            if (result)
            {
                return Ok(new { message = "Email address changed successfully. Please log in again with your new email." });
            }
            else
            {
                return BadRequest("Invalid or expired confirmation token.");
            }
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error confirming email change");
            return StatusCode(500, "An error occurred while confirming the email change.");
        }
    }
}
