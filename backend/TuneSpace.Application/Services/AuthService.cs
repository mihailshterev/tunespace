using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using TuneSpace.Core.DTOs.Responses.Auth;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Infrastructure.Options;

namespace TuneSpace.Application.Services;

internal partial class AuthService(
    IUserRepository userRepository,
    IPasswordHasher<User> passwordHasher,
    ITokenService tokenService,
    IEmailService emailService,
    IUrlBuilderService urlBuilderService,
    UserManager<User> userManager,
    IOptions<EmailOptions> emailOptions) : IAuthService
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly IPasswordHasher<User> _passwordHasher = passwordHasher;
    private readonly ITokenService _tokenService = tokenService;
    private readonly IEmailService _emailService = emailService;
    private readonly IUrlBuilderService _urlBuilderService = urlBuilderService;
    private readonly UserManager<User> _userManager = userManager;
    private readonly EmailOptions _emailOptions = emailOptions.Value;

    async Task IAuthService.RegisterAsync(string name, string email, string password, Roles role)
    {
        if (await _userRepository.GetUserByNameAsync(name) is not null)
        {
            throw new ArgumentException("Username already taken");
        }

        if (await _userRepository.GetUserByEmailAsync(email) is not null)
        {
            throw new ArgumentException("Email already registered");
        }

        var user = new User
        {
            UserName = name,
            Email = email,
            EmailConfirmed = !_emailOptions.RequireConfirmation,
            Role = role
        };

        await _userRepository.InsertUserAsync(user, password);

        if (!_emailOptions.RequireConfirmation)
        {
            return;
        }

        var insertedUser = await _userRepository.GetUserByEmailAsync(email);
        if (insertedUser is not null)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(insertedUser);
            var confirmationUrl = _urlBuilderService.BuildEmailConfirmationUrl(insertedUser.Id.ToString(), token);

            await _emailService.SendEmailConfirmationAsync(insertedUser, token, confirmationUrl);
        }
    }

    async Task<LoginResponse> IAuthService.LoginAsync(string email, string password)
    {
        var user = await _userRepository.GetUserByEmailAsync(email);

        if (user is null || VerifyPassword(user, password) is false)
        {
            throw new UnauthorizedException("Incorrect email or password");
        }

        if (_emailOptions.RequireConfirmation && !await _userManager.IsEmailConfirmedAsync(user))
        {
            throw new UnauthorizedException("Please confirm your email address before logging in. Check your inbox for the confirmation link.");
        }

        user.LastActiveDate = DateTime.UtcNow;
        await _userRepository.UpdateUserAsync(user);

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        await _tokenService.SaveRefreshTokenAsync(user, refreshToken);

        return new LoginResponse(user.Id.ToString(), user.UserName, user.Role.ToString(), accessToken, refreshToken);
    }

    async Task<LoginResponse> IAuthService.ExternalLoginAsync(string externalId, string email, string displayName, string provider, string? profilePictureUrl)
    {
        var user = await _userRepository.GetUserByExternalIdAsync(externalId, provider);

        if (user is null)
        {
            user = await _userRepository.GetUserByEmailAsync(email);

            if (user is not null)
            {
                user.SpotifyId = externalId;
                user.ExternalProvider = provider;
                user.ExternalLoginLinkedAt = DateTime.UtcNow;
                await _userRepository.UpdateUserAsync(user);
            }
            else
            {
                var sanitizedUsername = SanitizeUsername(displayName);
                user = new User
                {
                    UserName = sanitizedUsername,
                    Email = email,
                    EmailConfirmed = true,
                    Role = Roles.Listener,
                    SpotifyId = externalId,
                    ExternalProvider = provider,
                    ExternalLoginLinkedAt = DateTime.UtcNow
                };

                if (!string.IsNullOrEmpty(profilePictureUrl))
                {
                    try
                    {
                        using var httpClient = new HttpClient();
                        var imageBytes = await httpClient.GetByteArrayAsync(profilePictureUrl);
                        user.ProfilePicture = imageBytes;
                    }
                    catch
                    {
                        user.ProfilePicture = null;
                    }
                }

                await _userRepository.InsertExternalUserAsync(user);
            }
        }

        user.LastActiveDate = DateTime.UtcNow;
        await _userRepository.UpdateUserAsync(user);

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        await _tokenService.SaveRefreshTokenAsync(user, refreshToken);

        return new LoginResponse(user.Id.ToString(), user.UserName, user.Role.ToString(), accessToken, refreshToken);
    }

    async Task<bool> IAuthService.ConnectExternalAccountAsync(string userId, string externalId, string email, string displayName, string provider, string? profilePictureUrl)
    {
        var existingUser = await _userRepository.GetUserByExternalIdAsync(externalId, provider);
        if (existingUser is not null)
        {
            throw new InvalidOperationException("This Spotify account is already linked to another user.");
        }

        var user = await _userRepository.GetUserByIdAsync(userId) ?? throw new InvalidOperationException("User not found.");

        if (!string.IsNullOrEmpty(user.SpotifyId))
        {
            throw new InvalidOperationException("User already has a Spotify account linked.");
        }

        user.SpotifyId = externalId;
        user.ExternalProvider = provider;
        user.ExternalLoginLinkedAt = DateTime.UtcNow;

        if (!string.IsNullOrEmpty(profilePictureUrl) && user.ProfilePicture is null)
        {
            try
            {
                using var httpClient = new HttpClient();
                var imageBytes = await httpClient.GetByteArrayAsync(profilePictureUrl);
                user.ProfilePicture = imageBytes;
            }
            catch
            {
            }
        }

        await _userRepository.UpdateUserAsync(user);
        return true;
    }

    private bool VerifyPassword(User user, string password)
    {
        if (user.PasswordHash is null)
        {
            return false;
        }

        return _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password) is PasswordVerificationResult.Success;
    }

    private static string SanitizeUsername(string username)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            return string.Concat("user", Guid.NewGuid().ToString("N").AsSpan(0, 8));
        }

        var sanitized = SanitizeRegex().Replace(username, "_");

        return sanitized.Length > 32 ? sanitized[..32] : sanitized;
    }

    [GeneratedRegex(@"[^\w\d]")]
    private static partial Regex SanitizeRegex();

    async Task<bool> IAuthService.ConfirmEmailAsync(string userId, string token)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user is null)
        {
            return false;
        }

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded)
        {
            await _emailService.SendWelcomeEmailAsync(user);
            return true;
        }

        return false;
    }

    async Task<LoginResponse?> IAuthService.ConfirmEmailAndLoginAsync(string userId, string token)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user is null)
        {
            return null;
        }

        var result = await _userManager.ConfirmEmailAsync(user, token);
        if (result.Succeeded)
        {
            await _emailService.SendWelcomeEmailAsync(user);

            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            await _tokenService.SaveRefreshTokenAsync(user, refreshToken);

            return new LoginResponse(user.Id.ToString(), user.UserName, user.Role.ToString(), accessToken, refreshToken);
        }

        return null;
    }

    async Task IAuthService.ResendEmailConfirmationAsync(string email)
    {
        var user = await _userRepository.GetUserByEmailAsync(email) ?? throw new ArgumentException("User not found");
        if (user.EmailConfirmed)
        {
            throw new InvalidOperationException("Email is already confirmed");
        }

        var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var confirmationUrl = _urlBuilderService.BuildEmailConfirmationUrl(user.Id.ToString(), token);

        await _emailService.SendEmailConfirmationAsync(user, token, confirmationUrl);
    }

    async Task<string> IAuthService.GenerateEmailConfirmationTokenAsync(string userId)
    {
        var user = await _userRepository.GetUserByIdAsync(userId) ?? throw new ArgumentException("User not found");
        return await _userManager.GenerateEmailConfirmationTokenAsync(user);
    }

    async Task IAuthService.RequestPasswordResetAsync(string email)
    {
        var user = await _userRepository.GetUserByEmailAsync(email) ?? throw new ArgumentException("User not found");

        var token = await _userManager.GeneratePasswordResetTokenAsync(user);
        var resetUrl = _urlBuilderService.BuildPasswordResetUrl(user.Id.ToString(), token);

        await _emailService.SendPasswordResetEmailAsync(user, token, resetUrl);
    }

    async Task<bool> IAuthService.ResetPasswordAsync(string userId, string token, string newPassword)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user is null)
        {
            return false;
        }

        var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
        return result.Succeeded;
    }

    async Task IAuthService.RequestEmailChangeAsync(string userId, string newEmail)
    {
        var user = await _userRepository.GetUserByIdAsync(userId) ?? throw new ArgumentException("User not found");

        if (!string.IsNullOrEmpty(user.ExternalProvider))
        {
            throw new InvalidOperationException("External provider users cannot change their email address");
        }

        var existingUser = await _userRepository.GetUserByEmailAsync(newEmail);
        if (existingUser is not null)
        {
            throw new ArgumentException("Email address is already in use");
        }

        var token = await _userManager.GenerateChangeEmailTokenAsync(user, newEmail);
        var confirmationUrl = _urlBuilderService.BuildEmailChangeConfirmationUrl(user.Id.ToString(), token, newEmail);

        await _emailService.SendEmailChangeConfirmationAsync(user, newEmail, token, confirmationUrl);
    }

    async Task<bool> IAuthService.ConfirmEmailChangeAsync(string userId, string token, string newEmail)
    {
        var user = await _userRepository.GetUserByIdAsync(userId);
        if (user is null)
        {
            return false;
        }

        if (!string.IsNullOrEmpty(user.ExternalProvider))
        {
            return false;
        }

        var result = await _userManager.ChangeEmailAsync(user, newEmail, token);
        if (result.Succeeded)
        {
            return true;
        }

        return false;
    }
}
