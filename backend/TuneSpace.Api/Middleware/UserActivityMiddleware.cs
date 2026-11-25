using System.IdentityModel.Tokens.Jwt;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Api.Middleware;

/// <summary>
/// Middleware to track user activity on API requests
/// </summary>
public class UserActivityMiddleware(RequestDelegate next, ILogger<UserActivityMiddleware> logger)
{
    private readonly RequestDelegate _next = next;
    private readonly ILogger<UserActivityMiddleware> _logger = logger;

    public async Task InvokeAsync(HttpContext context, IUserService userService)
    {
        if (ShouldSkipActivityTracking(context.Request.Path))
        {
            await _next(context);
            return;
        }

        if (context.User?.Identity?.IsAuthenticated == true)
        {
            var userIdClaim = context.User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            if (!string.IsNullOrEmpty(userIdClaim))
            {
                try
                {
                    _ = Task.Run(async () =>
                    {
                        try
                        {
                            await userService.UpdateUserActivityAsync(userIdClaim);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to update user activity");
                        }
                    });
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error initiating user activity update");
                }
            }
        }

        await _next(context);
    }

    private static bool ShouldSkipActivityTracking(string requestPath)
    {
        var pathsToSkip = new[]
        {
            "/health",
            "/api/auth/current-user",
            "/hubs/",
            "/swagger",
            "/favicon.ico",
            "/robots.txt"
        };

        return pathsToSkip.Any(path => requestPath.StartsWith(path, StringComparison.OrdinalIgnoreCase));
    }
}
