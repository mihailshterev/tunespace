using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Moq;
using TuneSpace.Application.Services;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Infrastructure.Options;

namespace TuneSpace.Tests.Unit.Services;

public class AuthServiceTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<IPasswordHasher<User>> _mockPasswordHasher;
    private readonly Mock<ITokenService> _mockTokenService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IUrlBuilderService> _mockUrlBuilderService;
    private readonly Mock<UserManager<User>> _mockUserManager;
    private readonly IAuthService _authService;

    public AuthServiceTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockPasswordHasher = new Mock<IPasswordHasher<User>>();
        _mockTokenService = new Mock<ITokenService>();
        _mockEmailService = new Mock<IEmailService>();
        _mockUrlBuilderService = new Mock<IUrlBuilderService>();

        _mockUserManager = new Mock<UserManager<User>>(
            Mock.Of<IUserStore<User>>(), null!, null!, null!, null!, null!, null!, null!, null!);

        _authService = new AuthService(
            _mockUserRepository.Object,
            _mockPasswordHasher.Object,
            _mockTokenService.Object,
            _mockEmailService.Object,
            _mockUrlBuilderService.Object,
            _mockUserManager.Object,
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

        _mockUserRepository
            .Setup(x => x.GetUserByNameAsync(name))
            .ReturnsAsync((User?)null);

        _mockUserRepository
            .Setup(x => x.InsertUserAsync(It.IsAny<User>(), password))
            .Returns(Task.CompletedTask);

        _mockUserRepository
            .SetupSequence(x => x.GetUserByEmailAsync(email))
            .ReturnsAsync((User?)null)
            .ReturnsAsync(insertedUser);

        _mockUserManager
            .Setup(x => x.GenerateEmailConfirmationTokenAsync(insertedUser))
            .ReturnsAsync(token);

        _mockUrlBuilderService
            .Setup(x => x.BuildEmailConfirmationUrl(userId.ToString(), token))
            .Returns(confirmationUrl);

        _mockEmailService
            .Setup(x => x.SendEmailConfirmationAsync(insertedUser, token, confirmationUrl))
            .Returns(Task.CompletedTask);

        await _authService.RegisterAsync(name, email, password, role);

        _mockUserRepository.Verify(x => x.GetUserByNameAsync(name), Times.Once);
        _mockUserRepository.Verify(x => x.InsertUserAsync(It.Is<User>(u =>
            u.UserName == name && u.Email == email && u.Role == role && !u.EmailConfirmed), password), Times.Once);
        _mockUserRepository.Verify(x => x.GetUserByEmailAsync(email), Times.Exactly(2));
        _mockUserManager.Verify(x => x.GenerateEmailConfirmationTokenAsync(insertedUser), Times.Once);
        _mockUrlBuilderService.Verify(x => x.BuildEmailConfirmationUrl(userId.ToString(), token), Times.Once);
        _mockEmailService.Verify(x => x.SendEmailConfirmationAsync(insertedUser, token, confirmationUrl), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_WithExistingUsername_ShouldThrowArgumentException()
    {
        var name = "existinguser";
        var email = "test@example.com";
        var password = "Password123!";
        var role = Roles.Listener;

        var existingUser = new User { UserName = name };

        _mockUserRepository
            .Setup(x => x.GetUserByNameAsync(name))
            .ReturnsAsync(existingUser);

        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _authService.RegisterAsync(name, email, password, role));

        exception.Message.Should().Contain("Username already taken");
        _mockUserRepository.Verify(x => x.GetUserByNameAsync(name), Times.Once);
        _mockUserRepository.Verify(x => x.InsertUserAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
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

        _mockUserRepository
            .Setup(x => x.GetUserByEmailAsync(email))
            .ReturnsAsync(user);

        _mockPasswordHasher
            .Setup(x => x.VerifyHashedPassword(user, user.PasswordHash, password))
            .Returns(PasswordVerificationResult.Success);

        _mockUserManager
            .Setup(x => x.IsEmailConfirmedAsync(user))
            .ReturnsAsync(true);

        _mockUserRepository
            .Setup(x => x.UpdateUserAsync(user))
            .Returns(Task.CompletedTask);

        _mockTokenService
            .Setup(x => x.GenerateAccessToken(user))
            .Returns(accessToken);

        _mockTokenService
            .Setup(x => x.GenerateRefreshToken())
            .Returns(refreshToken); _mockTokenService
            .Setup(x => x.SaveRefreshTokenAsync(user, refreshToken))
            .ReturnsAsync(refreshToken);

        var result = await _authService.LoginAsync(email, password);

        result.Should().NotBeNull();
        result.Id.Should().Be(userId.ToString());
        result.Username.Should().Be("testuser");
        result.Role.Should().Be("Listener");
        result.AccessToken.Should().Be(accessToken);
        result.RefreshToken.Should().Be(refreshToken);

        _mockUserRepository.Verify(x => x.GetUserByEmailAsync(email), Times.Once);
        _mockPasswordHasher.Verify(x => x.VerifyHashedPassword(user, user.PasswordHash, password), Times.Once);
        _mockUserManager.Verify(x => x.IsEmailConfirmedAsync(user), Times.Once);
        _mockUserRepository.Verify(x => x.UpdateUserAsync(user), Times.Once);
        _mockTokenService.Verify(x => x.GenerateAccessToken(user), Times.Once);
        _mockTokenService.Verify(x => x.GenerateRefreshToken(), Times.Once);
        _mockTokenService.Verify(x => x.SaveRefreshTokenAsync(user, refreshToken), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidEmail_ShouldThrowUnauthorizedException()
    {
        var email = "nonexistent@example.com";
        var password = "Password123!";

        _mockUserRepository
            .Setup(x => x.GetUserByEmailAsync(email))
            .ReturnsAsync((User?)null);

        var exception = await Assert.ThrowsAsync<UnauthorizedException>(
            () => _authService.LoginAsync(email, password));

        exception.Message.Should().Contain("Incorrect email or password");
        _mockUserRepository.Verify(x => x.GetUserByEmailAsync(email), Times.Once);
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

        _mockUserRepository
            .Setup(x => x.GetUserByEmailAsync(email))
            .ReturnsAsync(user);

        _mockPasswordHasher
            .Setup(x => x.VerifyHashedPassword(user, user.PasswordHash, password))
            .Returns(PasswordVerificationResult.Failed);

        var exception = await Assert.ThrowsAsync<UnauthorizedException>(
            () => _authService.LoginAsync(email, password));

        exception.Message.Should().Contain("Incorrect email or password");
        _mockUserRepository.Verify(x => x.GetUserByEmailAsync(email), Times.Once);
        _mockPasswordHasher.Verify(x => x.VerifyHashedPassword(user, user.PasswordHash, password), Times.Once);
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

        _mockUserRepository
            .Setup(x => x.GetUserByEmailAsync(email))
            .ReturnsAsync(user);

        _mockPasswordHasher
            .Setup(x => x.VerifyHashedPassword(user, user.PasswordHash, password))
            .Returns(PasswordVerificationResult.Success);

        _mockUserManager
            .Setup(x => x.IsEmailConfirmedAsync(user))
            .ReturnsAsync(false);

        var exception = await Assert.ThrowsAsync<UnauthorizedException>(
            () => _authService.LoginAsync(email, password));

        exception.Message.Should().Contain("Please confirm your email address");
        _mockUserRepository.Verify(x => x.GetUserByEmailAsync(email), Times.Once);
        _mockPasswordHasher.Verify(x => x.VerifyHashedPassword(user, user.PasswordHash, password), Times.Once);
        _mockUserManager.Verify(x => x.IsEmailConfirmedAsync(user), Times.Once);
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

        _mockUserRepository
            .Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        _mockUserManager
            .Setup(x => x.ConfirmEmailAsync(user, token))
            .ReturnsAsync(IdentityResult.Success);

        _mockEmailService
            .Setup(x => x.SendWelcomeEmailAsync(user))
            .Returns(Task.CompletedTask);

        var result = await _authService.ConfirmEmailAsync(userId, token);

        result.Should().BeTrue();
        _mockUserRepository.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _mockUserManager.Verify(x => x.ConfirmEmailAsync(user, token), Times.Once);
        _mockEmailService.Verify(x => x.SendWelcomeEmailAsync(user), Times.Once);
    }

    [Fact]
    public async Task ConfirmEmailAsync_WithInvalidUser_ShouldReturnFalse()
    {
        var userId = Guid.NewGuid().ToString();
        var token = "confirmation-token";

        _mockUserRepository
            .Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync((User?)null);

        var result = await _authService.ConfirmEmailAsync(userId, token);

        result.Should().BeFalse();
        _mockUserRepository.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _mockUserManager.Verify(x => x.ConfirmEmailAsync(It.IsAny<User>(), It.IsAny<string>()), Times.Never);
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

        _mockUserRepository
            .Setup(x => x.GetUserByIdAsync(userId))
            .ReturnsAsync(user);

        _mockUserManager
            .Setup(x => x.ConfirmEmailAsync(user, token))
            .ReturnsAsync(IdentityResult.Failed());

        var result = await _authService.ConfirmEmailAsync(userId, token);

        result.Should().BeFalse();
        _mockUserRepository.Verify(x => x.GetUserByIdAsync(userId), Times.Once);
        _mockUserManager.Verify(x => x.ConfirmEmailAsync(user, token), Times.Once);
        _mockEmailService.Verify(x => x.SendWelcomeEmailAsync(It.IsAny<User>()), Times.Never);
    }
}
