using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneSpace.Api.Extensions;
using TuneSpace.Core.DTOs.Requests.MusicEvent;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class MusicEventController(
    IMusicEventService musicEventService,
    IBandService bandService,
    ILogger<MusicEventController> logger) : ControllerBase
{
    private readonly IMusicEventService _musicEventService = musicEventService;
    private readonly IBandService _bandService = bandService;
    private readonly ILogger<MusicEventController> _logger = logger;

    /// <summary>
    /// Resolves whether the caller may change an existing event: null when allowed, otherwise the result to return.
    /// </summary>
    private async Task<IActionResult?> AuthorizeEventChangeAsync(Guid eventId)
    {
        var existing = await _musicEventService.GetMusicEventByIdAsync(eventId);
        if (existing is null)
        {
            return NotFound("Event not found");
        }

        if (!await _bandService.CanManageBandAsync(User.GetUserId(), existing.BandId))
        {
            return Forbid();
        }

        return null;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllEvents()
    {
        try
        {
            var events = await _musicEventService.GetAllMusicEventsAsync();
            return Ok(events);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching all events");
            return BadRequest();
        }
    }

    [HttpGet("band/{bandId}")]
    public async Task<IActionResult> GetBandEvents(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        try
        {
            var events = await _musicEventService.GetMusicEventsByBandIdAsync(parsedBandId);
            return Ok(events);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching events for band with ID: {BandId}", LoggingExtensions.SanitizeForLogging(bandId));
            return BadRequest();
        }
    }

    [HttpGet("{eventId}")]
    public async Task<IActionResult> GetEventById(string eventId)
    {
        if (string.IsNullOrEmpty(eventId))
        {
            return BadRequest("Event ID cannot be null or empty");
        }

        if (!Guid.TryParse(eventId, out var parsedEventId))
        {
            return BadRequest("Invalid Event ID format");
        }

        try
        {
            var musicEvent = await _musicEventService.GetMusicEventByIdAsync(parsedEventId);

            if (musicEvent is null)
            {
                return NotFound();
            }

            return Ok(musicEvent);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching event with ID: {EventId}", LoggingExtensions.SanitizeForLogging(eventId));
            return BadRequest();
        }
    }

    [HttpGet("band/{bandId}/upcoming")]
    public async Task<IActionResult> GetUpcomingBandEvents(string bandId)
    {
        if (string.IsNullOrEmpty(bandId))
        {
            return BadRequest("Band ID cannot be null or empty");
        }

        if (!Guid.TryParse(bandId, out var parsedBandId))
        {
            return BadRequest("Invalid Band ID format");
        }

        try
        {
            var events = await _musicEventService.GetUpcomingMusicEventsAsync(parsedBandId);
            return Ok(events);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching upcoming events for band with ID: {BandId}", LoggingExtensions.SanitizeForLogging(bandId));
            return BadRequest();
        }
    }

    [HttpPost]
    public async Task<IActionResult> CreateMusicEvent(CreateMusicEventRequest request)
    {
        try
        {
            if (!await _bandService.CanManageBandAsync(User.GetUserId(), request.BandId))
            {
                return Forbid();
            }

            var musicEvent = await _musicEventService.CreateMusicEventAsync(request);

            if (musicEvent is null)
            {
                return BadRequest("Could not create event.");
            }

            return CreatedAtAction(nameof(GetEventById), new { eventId = musicEvent.Id }, musicEvent.Id);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error creating music event");
            return BadRequest();
        }
    }

    [HttpPut]
    public async Task<IActionResult> UpdateMusicEvent(UpdateMusicEventRequest request)
    {
        try
        {
            if (await AuthorizeEventChangeAsync(request.Id) is { } denied)
            {
                return denied;
            }

            await _musicEventService.UpdateMusicEventAsync(request);
            return Ok("Event updated successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error updating event with ID: {EventId}", request.Id);
            return BadRequest();
        }
    }

    [HttpDelete("{eventId}")]
    public async Task<IActionResult> DeleteMusicEvent(string eventId)
    {
        if (string.IsNullOrEmpty(eventId))
        {
            return BadRequest("Event ID cannot be null or empty");
        }

        if (!Guid.TryParse(eventId, out var parsedEventId))
        {
            return BadRequest("Invalid Event ID format");
        }

        try
        {
            if (await AuthorizeEventChangeAsync(parsedEventId) is { } denied)
            {
                return denied;
            }

            await _musicEventService.DeleteMusicEventAsync(parsedEventId);
            return Ok("Event deleted successfully");
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error deleting event with ID: {EventId}", LoggingExtensions.SanitizeForLogging(eventId));
            return BadRequest();
        }
    }
}
