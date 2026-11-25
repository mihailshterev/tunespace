namespace TuneSpace.Infrastructure.Options;

public class AdminOptions
{
    /// <summary>
    /// Emails of existing accounts to promote to Admin at startup. Used to bootstrap the first
    /// administrator, who can then manage everyone else from the user management page.
    /// </summary>
    public string[] BootstrapEmails { get; set; } = [];
}
