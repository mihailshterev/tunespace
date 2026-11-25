using NSubstitute;
using TuneSpace.Application.Services;
using TuneSpace.Core.DTOs.Requests.Notification;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using Xunit;

namespace TuneSpace.Tests.Unit.Services;

public class NotificationServiceTests
{
    private readonly INotificationRepository _notificationRepository = Substitute.For<INotificationRepository>();
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly INotificationService _notificationService;

    public NotificationServiceTests()
    {
        _notificationService = new NotificationService(_notificationRepository, _userRepository);
    }

    [Fact]
    public async Task GetUserNotificationsAsync_WithValidUsername_ShouldReturnNotifications()
    {
        var username = "testuser";
        var user = new User { Id = Guid.NewGuid(), UserName = username, Email = "test@example.com" };
        var notifications = new List<Notification>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Message = "Test notification 1",
                IsRead = false,
                Type = "info",
                Timestamp = DateTime.UtcNow.AddHours(-1),
                User = user,
                RecipientName = username
            },
            new()
            {
                Id = Guid.NewGuid(),
                Message = "Test notification 2",
                IsRead = true,
                Type = "warning",
                Timestamp = DateTime.UtcNow.AddHours(-2),
                User = user,
                RecipientName = username
            }
        };
        _userRepository.GetUserByNameAsync(username).Returns(user);
        _notificationRepository.GetNotificationsByUserAsync(user).Returns(notifications);

        var result = await _notificationService.GetUserNotificationsAsync(username);

        Assert.Equal(2, result.Count);
        Assert.Equal("Test notification 1", result[0].Message);
        Assert.False(result[0].IsRead);
        Assert.Equal("info", result[0].Type);
        Assert.Equal("Test notification 2", result[1].Message);
        Assert.True(result[1].IsRead);
        Assert.Equal("warning", result[1].Type);
        await _userRepository.Received(1).GetUserByNameAsync(username);
        await _notificationRepository.Received(1).GetNotificationsByUserAsync(user);
    }

    [Fact]
    public async Task GetUserNotificationsAsync_WithInvalidUsername_ShouldThrowNotFoundException()
    {
        var username = "nonexistentuser";
        _userRepository.GetUserByNameAsync(username).Returns((User?)null);

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _notificationService.GetUserNotificationsAsync(username));

        Assert.Contains("User is not found", exception.Message);
        await _userRepository.Received(1).GetUserByNameAsync(username);
    }

    [Fact]
    public async Task CreateNotificationAsync_WithValidRequest_ShouldCreateAndReturnNotification()
    {
        var request = new AddNotificationRequestDto("New notification message", "info", "test", "testuser");
        var user = new User { Id = Guid.NewGuid(), UserName = request.RecipientName, Email = "test@example.com" };
        _userRepository.GetUserByNameAsync(request.RecipientName).Returns(user);

        var result = await _notificationService.CreateNotificationAsync(request);

        Assert.Equal(request.Message, result.Message);
        Assert.Equal(request.Type, result.Type);
        Assert.False(result.IsRead);
        await _userRepository.Received(1).GetUserByNameAsync(request.RecipientName);
        await _notificationRepository.Received(1).InsertNotificationAsync(Arg.Is<Notification>(n =>
            n.Message == request.Message &&
            n.Type == request.Type &&
            n.Source == request.Source &&
            n.RecipientName == request.RecipientName &&
            n.User == user &&
            !n.IsRead));
    }

    [Fact]
    public async Task CreateNotificationAsync_WithInvalidRecipient_ShouldThrowNotFoundException()
    {
        var request = new AddNotificationRequestDto("New notification message", "info", "test", "nonexistentuser");
        _userRepository.GetUserByNameAsync(request.RecipientName).Returns((User?)null);

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _notificationService.CreateNotificationAsync(request));

        Assert.Contains("User is not found", exception.Message);
        await _userRepository.Received(1).GetUserByNameAsync(request.RecipientName);
        await _notificationRepository.DidNotReceiveWithAnyArgs().InsertNotificationAsync(default!);
    }

    [Fact]
    public async Task ReadNotificationAsync_WithValidId_ShouldMarkNotificationAsRead()
    {
        var notificationId = Guid.NewGuid();
        var notification = new Notification
        {
            Id = notificationId,
            Message = "Test notification",
            IsRead = false,
            Type = "info",
            Timestamp = DateTime.UtcNow,
            RecipientName = "testuser"
        };
        _notificationRepository.GetNotificationByIdAsync(notificationId).Returns(notification);

        await _notificationService.ReadNotificationAsync(notificationId);

        Assert.True(notification.IsRead);
        await _notificationRepository.Received(1).GetNotificationByIdAsync(notificationId);
        await _notificationRepository.Received(1).UpdateNotificationsAsync(Arg.Is<List<Notification>>(list =>
            list.Count == 1 && list[0].Id == notificationId && list[0].IsRead));
    }

    [Fact]
    public async Task ReadNotificationAsync_WithInvalidId_ShouldThrowNotFoundException()
    {
        var notificationId = Guid.NewGuid();
        _notificationRepository.GetNotificationByIdAsync(notificationId).Returns((Notification?)null);

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _notificationService.ReadNotificationAsync(notificationId));

        Assert.Contains("Notification is not found", exception.Message);
        await _notificationRepository.Received(1).GetNotificationByIdAsync(notificationId);
        await _notificationRepository.DidNotReceiveWithAnyArgs().UpdateNotificationsAsync(default!);
    }

    [Fact]
    public async Task ReadNotificationsAsync_WithValidUsername_ShouldMarkAllNotificationsAsRead()
    {
        var username = "testuser";
        var user = new User { Id = Guid.NewGuid(), UserName = username, Email = "test@example.com" };
        var notifications = new List<Notification>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Message = "Test notification 1",
                IsRead = false,
                Type = "info",
                Timestamp = DateTime.UtcNow,
                RecipientName = username
            },
            new()
            {
                Id = Guid.NewGuid(),
                Message = "Test notification 2",
                IsRead = false,
                Type = "warning",
                Timestamp = DateTime.UtcNow,
                RecipientName = username
            }
        };
        _userRepository.GetUserByNameAsync(username).Returns(user);
        _notificationRepository.GetNotificationsByUserAsync(user).Returns(notifications);

        await _notificationService.ReadNotificationsAsync(username);

        Assert.All(notifications, n => Assert.True(n.IsRead));
        await _userRepository.Received(1).GetUserByNameAsync(username);
        await _notificationRepository.Received(1).GetNotificationsByUserAsync(user);
        await _notificationRepository.Received(1).UpdateNotificationsAsync(Arg.Is<List<Notification>>(list =>
            list.Count == 2 && list.All(n => n.IsRead)));
    }

    [Fact]
    public async Task ReadNotificationsAsync_WithInvalidUsername_ShouldThrowNotFoundException()
    {
        var username = "nonexistentuser";
        _userRepository.GetUserByNameAsync(username).Returns((User?)null);

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => _notificationService.ReadNotificationsAsync(username));

        Assert.Contains("User is not found", exception.Message);
        await _userRepository.Received(1).GetUserByNameAsync(username);
        await _notificationRepository.DidNotReceiveWithAnyArgs().GetNotificationsByUserAsync(default!);
    }

    [Fact]
    public async Task DeleteNotificationAsync_WithValidId_ShouldDeleteNotification()
    {
        var notificationId = Guid.NewGuid();

        await _notificationService.DeleteNotificationAsync(notificationId);

        await _notificationRepository.Received(1).DeleteNotificationAsync(notificationId);
    }
}
