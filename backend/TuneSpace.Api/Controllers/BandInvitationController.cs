using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TuneSpace.Api.Extensions;
using TuneSpace.Core.DTOs.Requests.Band;
using TuneSpace.Core.DTOs.Requests.Notification;
using TuneSpace.Core.DTOs.Responses.Band;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Infrastructure.Hubs;

namespace TuneSpace.Api.Controllers;

/// <summary>
/// Band invitations: band managers invite users, and invited users accept or decline.
/// A user joins a band only by accepting an invitation.
/// </summary>
[Route("api/[controller]")]
[ApiController]
[Authorize]
public class BandInvitationController(
    IBandInvitationService invitationService,
    IBandService bandService,
    INotificationService notificationService,
    IHubContext<SocketHub, ISocketClient> hubContext,
    ILogger<BandInvitationController> logger) : ControllerBase
{
    public const string NotificationType = "BandInvite";

    private readonly IBandInvitationService _invitationService = invitationService;
    private readonly IBandService _bandService = bandService;
    private readonly INotificationService _notificationService = notificationService;
    private readonly IHubContext<SocketHub, ISocketClient> _hubContext = hubContext;
    private readonly ILogger<BandInvitationController> _logger = logger;

    /// <summary>
    /// Gets the signed-in user's pending band invitations.
    /// </summary>
    [HttpGet("mine")]
    public async Task<ActionResult<List<BandInvitationResponse>>> GetMyInvitations()
    {
        return Ok(await _invitationService.GetUserInvitationsAsync(User.GetUserId()));
    }

    /// <summary>
    /// Accepts one of the signed-in user's invitations and joins the band.
    /// </summary>
    [HttpPost("{invitationId:guid}/accept")]
    public async Task<IActionResult> AcceptInvitation(Guid invitationId)
    {
        try
        {
            var invitation = await _invitationService.AcceptInvitationAsync(invitationId, User.GetUserId());
            await NotifyInviterAsync(invitation, $"{invitation.UserName} accepted your invitation and joined {invitation.BandName}.");
            return Ok(invitation);
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
    /// Declines one of the signed-in user's invitations.
    /// </summary>
    [HttpPost("{invitationId:guid}/decline")]
    public async Task<IActionResult> DeclineInvitation(Guid invitationId)
    {
        try
        {
            var invitation = await _invitationService.DeclineInvitationAsync(invitationId, User.GetUserId());
            await NotifyInviterAsync(invitation, $"{invitation.UserName} declined your invitation to join {invitation.BandName}.");
            return NoContent();
        }
        catch (NotFoundException e)
        {
            return NotFound(e.Message);
        }
    }

    /// <summary>
    /// Gets a band's pending invitations. Only band managers may see them.
    /// </summary>
    [HttpGet("band/{bandId:guid}")]
    public async Task<ActionResult<List<BandInvitationResponse>>> GetBandInvitations(Guid bandId)
    {
        if (!await _bandService.CanManageBandAsync(User.GetUserId(), bandId))
        {
            return Forbid();
        }

        return Ok(await _invitationService.GetBandInvitationsAsync(bandId));
    }

    /// <summary>
    /// Invites a user to a band. Only band managers may invite.
    /// </summary>
    [HttpPost("band/{bandId:guid}")]
    public async Task<IActionResult> InviteMember(Guid bandId, [FromBody] InviteMemberRequest request)
    {
        if (request is null || request.UserId == Guid.Empty)
        {
            return BadRequest("User ID is required");
        }

        try
        {
            var actorId = User.GetUserId();
            if (!await _bandService.CanManageBandAsync(actorId, bandId))
            {
                return Forbid();
            }

            var invitation = await _invitationService.InviteMemberAsync(bandId, request.UserId, actorId);
            await NotifyAsync(
                invitation.UserName,
                invitation.UserId,
                $"{invitation.InvitedByName ?? "A band manager"} invited you to join {invitation.BandName}.",
                invitation.BandId);
            return Ok(invitation);
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
    /// Withdraws a pending invitation. Only band managers may do this.
    /// </summary>
    [HttpDelete("band/{bandId:guid}/{invitationId:guid}")]
    public async Task<IActionResult> CancelInvitation(Guid bandId, Guid invitationId)
    {
        try
        {
            if (!await _bandService.CanManageBandAsync(User.GetUserId(), bandId))
            {
                return Forbid();
            }

            await _invitationService.CancelInvitationAsync(bandId, invitationId);
            return NoContent();
        }
        catch (NotFoundException e)
        {
            return NotFound(e.Message);
        }
    }

    private Task NotifyInviterAsync(BandInvitationResponse invitation, string message)
    {
        if (invitation.InvitedById is null || string.IsNullOrEmpty(invitation.InvitedByName))
        {
            return Task.CompletedTask;
        }

        return NotifyAsync(invitation.InvitedByName, invitation.InvitedById, message, invitation.BandId);
    }

    /// <summary>
    /// Stores a notification and pushes it in real time. The invitation change has already been made,
    /// so a failure here is logged rather than failing the request.
    /// </summary>
    private async Task NotifyAsync(string recipientName, string recipientId, string message, string bandId)
    {
        try
        {
            var notification = await _notificationService.CreateNotificationAsync(
                new AddNotificationRequestDto(message, NotificationType, bandId, recipientName));
            await _hubContext.Clients.Group(recipientId).ReceiveNotification(notification);
        }
        catch (Exception e)
        {
            _logger.LogWarning(e, "Couldn't send band invitation notification to user {UserId}", recipientId);
        }
    }
}
