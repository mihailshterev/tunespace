using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using NSubstitute;
using TuneSpace.Application.Services;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Infrastructure.Options;
using Xunit;

namespace TuneSpace.Tests.Unit.Services;

public class AuthServiceTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IPasswordHasher<User> _passwordHasher = Substitute.For<IPasswordHasher<User>>();
    private readonly ITokenService _tokenService = Substitute.For<ITokenService>();
    private readonly IEmailService _emailService = Substitute.For<IEmailService>();
    private readonly IUrlBuilderService _urlBuilderService = Substitute.For<IUrlBuilderService>();
    private readonly UserManager<User> _userManager = Substitute.For<UserManager<User>>(
        Substitute.For<IUserStore<User>>(), null, null, null, null, null, null, null, null);
    private readonly IAuthService _authService;

    public AuthServiceTests()
    {
        _authService = new AuthService(
            _userRepository,
            _passwordHasher,
            _tokenService,
            _emailService,
            _urlBuilderService,
            _userManager,
            Options.Create(new EmailOptions()));
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ShouldCreateUserAndSendConfirmationEmail()
    {
        var name = "testuser";
        var email = "test@example.com";
        var password = "Password123!";
        var role = Roles.Listener;
        var userId = Guid.NewGuid();
        var token = "confirmation-token";
        var confirmationUrl = "https://example.com/confirm";
        var insertedUser = new User
        {
            Id = userId,
            UserName = name,
            Email = email,
            Role = role,
            EmailConfirmed = false
        };

        _userRepository.GetUserByNameAsync(name).Returns((User?)null);
        _userRepository.GetUserByEmailAsync(email).Returns((User?)null, insertedUser);
        _userManager.GenerateEmailConfirmationTokenAsync(insertedUser).Returns(token);
        _urlBuilderService.BuildEmailConfirmationUrl(userId.ToString(), token).Returns(confirmationUrl);

        await _authService.RegisterAsync(name, email, password, role);

        await _userRepository.Received(1).GetUserByNameAsync(name);
        await _userRepository.Received(1).InsertUserAsync(
            Arg.Is<User>(u => u.UserName == name && u.Email == email && u.Role == role && !u.EmailConfirmed),
            password);
        await _userRepository.Received(2).GetUserByEmailAsync(email);
        await _userManager.Received(1).GenerateEmailConfirmationTokenAsync(insertedUser);
        _urlBuilderService.Received(1).BuildEmailConfirmationUrl(userId.ToString(), token);
        await _emailService.Received(1).SendEmailConfirmationAsync(insertedUser, token, confirmationUrl);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingUsername_ShouldThrowArgumentException()
    {
        var name = "existinguser";
        _userRepository.GetUserByNameAsync(name).Returns(new User { UserName = name });

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _authService.RegisterAsync(name, "test@example.com", "Password123!", Roles.Listener));

        Assert.Contains("Username already taken", exception.Message);
        await _userRepository.Received(1).GetUserByNameAsync(name);
        await _userRepository.DidNotReceiveWithAnyArgs().InsertUserAsync(default!, default!);
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnLoginResponse()
    {
        var email = "test@example.com";
        var password = "Password123!";
        var userId = Guid.NewGuid();
        var accessToken = "access-token";
        var refreshToken = "refresh-token";
        var user = new User
        {
            Id = userId,
            UserName = "testuser",
            Email = email,
            Role = Roles.Listener,
            PasswordHash = "hashed-password"
        };

        _userRepository.GetUserByEmailAsync(email).Returns(user);
        _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password).Returns(PasswordVerificationResult.Success);
        _userManager.IsEmailConfirmedAsync(user).Returns(true);
        _tokenService.GenerateAccessToken(user).Returns(accessToken);
        _tokenService.GenerateRefreshToken().Returns(refreshToken);
        _tokenService.SaveRefreshTokenAsync(user, refreshToken).Returns(refreshToken);

        var result = await _authService.LoginAsync(email, password);

        Assert.Equal(userId.ToString(), result.Id);
        Assert.Equal("testuser", result.Username);
        Assert.Equal("Listener", result.Role);
        Assert.Equal(accessToken, result.AccessToken);
        Assert.Equal(refreshToken, result.RefreshToken);

        await _userRepository.Received(1).GetUserByEmailAsync(email);
        _passwordHasher.Received(1).VerifyHashedPassword(user, user.PasswordHash, password);
        await _userManager.Received(1).IsEmailConfirmedAsync(user);
        await _userRepository.Received(1).UpdateUserAsync(user);
        _tokenService.Received(1).GenerateAccessToken(user);
        _tokenService.Received(1).GenerateRefreshToken();
        await _tokenService.Received(1).SaveRefreshTokenAsync(user, refreshToken);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidEmail_ShouldThrowUnauthorizedException()
    {
        var email = "nonexistent@example.com";
        _userRepository.GetUserByEmailAsync(email).Returns((User?)null);

        var exception = await Assert.ThrowsAsync<UnauthorizedException>(() => _authService.LoginAsync(email, "Password123!"));

        Assert.Contains("Incorrect email or password", exception.Message);
        await _userRepository.Received(1).GetUserByEmailAsync(email);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldThrowUnauthorizedException()
    {
        var email = "test@example.com";
        var password = "WrongPassword";
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "testuser",
            Email = email,
            Role = Roles.Listener,
            PasswordHash = "hashed-password"
        };
        _userRepository.GetUserByEmailAsync(email).Returns(user);
        _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password).Returns(PasswordVerificationResult.Failed);

        var exception = await Assert.ThrowsAsync<UnauthorizedException>(() => _authService.LoginAsync(email, password));

        Assert.Contains("Incorrect email or password", exception.Message);
        await _userRepository.Received(1).GetUserByEmailAsync(email);
        _passwordHasher.Received(1).VerifyHashedPassword(user, user.PasswordHash, password);
    }

    [Fact]
    public async Task LoginAsync_WithUnconfirmedEmail_ShouldThrowUnauthorizedException()
    {
        var email = "test@example.com";
        var password = "Password123!";
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = "testuser",
            Email = email,
            Role = Roles.Listener,
            PasswordHash = "hashed-password"
        };
        _userRepository.GetUserByEmailAsync(email).Returns(user);
        _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, password).Returns(PasswordVerificationResult.Success);
        _userManager.IsEmailConfirmedAsync(user).Returns(false);

        var exception = await Assert.ThrowsAsync<UnauthorizedException>(() => _authService.LoginAsync(email, password));

        Assert.Contains("Please confirm your email address", exception.Message);
        await _userRepository.Received(1).GetUserByEmailAsync(email);
        _passwordHasher.Received(1).VerifyHashedPassword(user, user.PasswordHash, password);
        await _userManager.Received(1).IsEmailConfirmedAsync(user);
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithValidToken_ShouldReturnTrue()
    {
        var userId = Guid.NewGuid().ToString();
        var token = "confirmation-token";
        var user = new User
        {
            Id = Guid.Parse(userId),
            UserName = "testuser",
            Email = "test@example.com",
            Role = Roles.Listener
        };
        _userRepository.GetUserByIdAsync(userId).Returns(user);
        _userManager.ConfirmEmailAsync(user, token).Returns(IdentityResult.Success);

        var result = await _authService.ConfirmEmailAsync(userId, token);

        Assert.True(result);
        await _userRepository.Received(1).GetUserByIdAsync(userId);
        await _userManager.Received(1).ConfirmEmailAsync(user, token);
        await _emailService.Received(1).SendWelcomeEmailAsync(user);
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithInvalidUser_ShouldReturnFalse()
    {
        var userId = Guid.NewGuid().ToString();
        _userRepository.GetUserByIdAsync(userId).Returns((User?)null);

        var result = await _authService.ConfirmEmailAsync(userId, "confirmation-token");

        Assert.False(result);
        await _userRepository.Received(1).GetUserByIdAsync(userId);
        await _userManager.DidNotReceiveWithAnyArgs().ConfirmEmailAsync(default!, default!);
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithInvalidToken_ShouldReturnFalse()
    {
        var userId = Guid.NewGuid().ToString();
        var token = "invalid-token";
        var user = new User
        {
            Id = Guid.Parse(userId),
            UserName = "testuser",
            Email = "test@example.com",
            Role = Roles.Listener
        };
        _userRepository.GetUserByIdAsync(userId).Returns(user);
        _userManager.ConfirmEmailAsync(user, token).Returns(IdentityResult.Failed());

        var result = await _authService.ConfirmEmailAsync(userId, token);

        Assert.False(result);
        await _userRepository.Received(1).GetUserByIdAsync(userId);
        await _userManager.Received(1).ConfirmEmailAsync(user, token);
        await _emailService.DidNotReceiveWithAnyArgs().SendWelcomeEmailAsync(default!);
    }
}
