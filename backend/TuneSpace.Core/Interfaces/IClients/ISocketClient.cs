using TuneSpace.Core.DTOs.Responses.BandChat;
using TuneSpace.Core.DTOs.Responses.Chat;
using TuneSpace.Core.DTOs.Responses.Notification;

namespace TuneSpace.Core.Interfaces.IClients;

/// <summary>
/// Defines methods for a socket client to receive real-time messages and notifications.
/// This interface is used for implementing SignalR or similar websocket functionality.
/// </summary>
public interface ISocketClient
{
    /// <summary>
    /// Notifies the client that a new chat has been created.
    /// </summary>
    /// <param name="chat">The chat response object containing information about the newly created chat.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ChatCreated(ChatResponse chat);

    /// <summary>
    /// Delivers a notification to the client.
    /// </summary>
    /// <param name="notification">The notification object to be delivered.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ReceiveNotification(NotificationResponseDto notification);

    /// <summary>
    /// Receives a structured message in a chat system.
    /// </summary>
    /// <param name="message">The message response object containing the message content and metadata.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ReceiveMessage(MessageResponse message);

    /// <summary>
    /// Notifies the client that a new band chat has been created.
    /// </summary>
    /// <param name="chat">The band chat response object containing information about the newly created band chat.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task BandChatCreated(BandChatResponse chat);

    /// <summary>
    /// Receives a band message in the band chat system.
    /// </summary>
    /// <param name="message">The band message response object containing the message content and metadata.</param>
    /// <returns>A task representing the asynchronous operation.</returns>
    Task ReceiveBandMessage(BandMessageResponse message);
}
