using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneSpace.Api.Extensions;
using TuneSpace.Core.DTOs.Requests.Admin;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = nameof(Roles.Admin))]
public class AdminController(
    IUserManagementService userManagementService,
    ILogger<AdminController> logger) : ControllerBase
{
    private readonly IUserManagementService _userManagementService = userManagementService;
    private readonly ILogger<AdminController> _logger = logger;

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] string? role,
        [FromQuery] bool? suspended,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        Roles? roleFilter = null;
        if (!string.IsNullOrEmpty(role))
        {
            if (!Enum.TryParse<Roles>(role, true, out var parsedRole) || !Enum.IsDefined(parsedRole))
            {
                return BadRequest("Invalid role specified");
            }

            roleFilter = parsedRole;
        }

        var result = await _userManagementService.GetUsersAsync(search, roleFilter, suspended, page, pageSize);
        return Ok(result);
    }

    [HttpGet("users/stats")]
    public async Task<IActionResult> GetUserStats()
    {
        var stats = await _userManagementService.GetStatsAsync();
        return Ok(stats);
    }

    [HttpPut("users/{userId:guid}/role")]
    public async Task<IActionResult> UpdateUserRole(Guid userId, [FromBody] UpdateUserRoleRequest request)
    {
        if (request is null
            || !Enum.TryParse<Roles>(request.Role, true, out var role)
            || !Enum.IsDefined(role))
        {
            return BadRequest("Invalid role specified");
        }

        return await ExecuteUserActionAsync(() =>
            _userManagementService.ChangeRoleAsync(User.GetUserId(), userId, role));
    }

    [HttpPost("users/{userId:guid}/suspend")]
    public Task<IActionResult> SuspendUser(Guid userId)
    {
        return ExecuteUserActionAsync(() =>
            _userManagementService.SetSuspendedAsync(User.GetUserId(), userId, true));
    }

    [HttpPost("users/{userId:guid}/restore")]
    public Task<IActionResult> RestoreUser(Guid userId)
    {
        return ExecuteUserActionAsync(() =>
            _userManagementService.SetSuspendedAsync(User.GetUserId(), userId, false));
    }

    private async Task<IActionResult> ExecuteUserActionAsync<T>(Func<Task<T>> action)
    {
        try
        {
            return Ok(await action());
        }
        catch (NotFoundException e)
        {
            _logger.LogWarning(e, "User management target not found");
            return NotFound("User not found");
        }
        catch (ConflictException e)
        {
            _logger.LogInformation("User management action rejected: {Reason}", e.Message);
            return Conflict(e.Message);
        }
    }
}
