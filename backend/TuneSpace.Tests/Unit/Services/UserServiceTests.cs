using Microsoft.Extensions.Logging.Abstractions;
using NSubstitute;
using TuneSpace.Application.Services;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using Xunit;

namespace TuneSpace.Tests.Unit.Services;

public class UserServiceTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IUserService _userService;

    public UserServiceTests()
    {
        _userService = new UserService(_userRepository, NullLogger<UserService>.Instance);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithValidId_ShouldReturnUser()
    {
        var userId = Guid.NewGuid().ToString();
        var expectedUser = new User
        {
            Id = Guid.Parse(userId),
            UserName = "testuser",
            Email = "test@example.com",
            Role = Roles.Listener
        };
        _userRepository.GetUserByIdAsync(userId).Returns(expectedUser);

        var result = await _userService.GetUserByIdAsync(userId);

        Assert.Same(expectedUser, result);
        await _userRepository.Received(1).GetUserByIdAsync(userId);
    }

    [Fact]
    public async Task GetUserByIdAsync_WithInvalidId_ShouldReturnNull()
    {
        var userId = Guid.NewGuid().ToString();
        _userRepository.GetUserByIdAsync(userId).Returns((User?)null);

        var result = await _userService.GetUserByIdAsync(userId);

        Assert.Null(result);
        await _userRepository.Received(1).GetUserByIdAsync(userId);
    }

    [Fact]
    public async Task GetUserByNameAsync_WithValidName_ShouldReturnUser()
    {
        var userName = "testuser";
        var expectedUser = new User
        {
            Id = Guid.NewGuid(),
            UserName = userName,
            Email = "test@example.com",
            Role = Roles.Listener
        };
        _userRepository.GetUserByNameAsync(userName).Returns(expectedUser);

        var result = await _userService.GetUserByNameAsync(userName);

        Assert.Same(expectedUser, result);
        await _userRepository.Received(1).GetUserByNameAsync(userName);
    }

    [Fact]
    public async Task GetUserByNameAsync_WithInvalidName_ShouldReturnNull()
    {
        var userName = "nonexistentuser";
        _userRepository.GetUserByNameAsync(userName).Returns((User?)null);

        var result = await _userService.GetUserByNameAsync(userName);

        Assert.Null(result);
        await _userRepository.Received(1).GetUserByNameAsync(userName);
    }

    [Fact]
    public async Task GetProfilePictureAsync_WithValidUser_ShouldReturnProfilePicture()
    {
        var userName = "testuser";
        byte[] profilePicture = [1, 2, 3, 4, 5];
        var user = new User
        {
            Id = Guid.NewGuid(),
            UserName = userName,
            Email = "test@example.com",
            Role = Roles.Listener,
            ProfilePicture = profilePicture
        };
        _userRepository.GetUserByNameAsync(userName).Returns(user);

        var result = await _userService.GetProfilePictureAsync(userName);

        Assert.Equal(profilePicture, result);
        await _userRepository.Received(1).GetUserByNameAsync(userName);
    }

    [Fact]
    public async Task GetProfilePictureAsync_WithNonExistentUser_ShouldThrowNotFoundException()
    {
        var userName = "nonexistentuser";
        _userRepository.GetUserByNameAsync(userName).Returns((User?)null);

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _userService.GetProfilePictureAsync(userName));

        Assert.Contains($"User not found: {userName}", exception.Message);
        await _userRepository.Received(1).GetUserByNameAsync(userName);
    }

    [Fact]
    public async Task SearchByNameAsync_WithMatchingUsers_ShouldReturnFilteredUsers()
    {
        var searchName = "test";
        var currentUserId = Guid.NewGuid().ToString();
        var users = new List<User>
        {
            new() { Id = Guid.NewGuid(), UserName = "testuser1", Email = "test1@example.com", Role = Roles.Listener },
            new() { Id = Guid.Parse(currentUserId), UserName = "testuser2", Email = "test2@example.com", Role = Roles.Listener },
            new() { Id = Guid.NewGuid(), UserName = "testuser3", Email = "test3@example.com", Role = Roles.Listener }
        };
        _userRepository.SearchByNameAsync(searchName).Returns(users);

        var result = await _userService.SearchByNameAsync(searchName, currentUserId);

        Assert.Equal(2, result.Count);
        Assert.DoesNotContain(result, u => u.Id.ToString() == currentUserId);
        await _userRepository.Received(1).SearchByNameAsync(searchName);
    }

    [Fact]
    public async Task SearchByNameAsync_WithNoMatches_ShouldReturnEmptyList()
    {
        var searchName = "nonexistent";
        var currentUserId = Guid.NewGuid().ToString();
        _userRepository.SearchByNameAsync(searchName).Returns(new List<User>());

        var result = await _userService.SearchByNameAsync(searchName, currentUserId);

        Assert.Empty(result);
        await _userRepository.Received(1).SearchByNameAsync(searchName);
    }

    [Fact]
    public async Task SearchByNameAsync_WithNullCurrentUserId_ShouldReturnAllUsers()
    {
        var searchName = "test";
        var users = new List<User>
        {
            new() { Id = Guid.NewGuid(), UserName = "testuser1", Email = "test1@example.com", Role = Roles.Listener },
            new() { Id = Guid.NewGuid(), UserName = "testuser2", Email = "test2@example.com", Role = Roles.Listener }
        };
        _userRepository.SearchByNameAsync(searchName).Returns(users);

        var result = await _userService.SearchByNameAsync(searchName, null);

        Assert.Equal(users, result);
        await _userRepository.Received(1).SearchByNameAsync(searchName);
    }
}
