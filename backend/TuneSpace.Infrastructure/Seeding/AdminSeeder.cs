using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using TuneSpace.Core.Enums;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Infrastructure.Options;

namespace TuneSpace.Infrastructure.Seeding;

public class AdminSeeder(
    IUserRepository userRepository,
    IOptions<AdminOptions> adminOptions,
    ILogger<AdminSeeder> logger)
{
    private readonly IUserRepository _userRepository = userRepository;
    private readonly AdminOptions _adminOptions = adminOptions.Value;
    private readonly ILogger<AdminSeeder> _logger = logger;

    public async Task SeedAdminsAsync()
    {
        foreach (var email in _adminOptions.BootstrapEmails.Where(e => !string.IsNullOrWhiteSpace(e)))
        {
            var user = await _userRepository.GetUserByEmailAsync(email.Trim());
            if (user is null)
            {
                _logger.LogWarning("Admin bootstrap: no account found for a configured email; register it first");
                continue;
            }

            if (user.Role == Roles.Admin)
            {
                continue;
            }

            await _userRepository.UpdateUserRoleAsync(user, Roles.Admin);
            _logger.LogInformation("Admin bootstrap: promoted user {UserId} to Admin", user.Id);
        }
    }
}
