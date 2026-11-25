using FluentEmail.Core;
using Microsoft.Extensions.Logging;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Core.Models.Email;

namespace TuneSpace.Application.Services;

internal class EmailService(
    IFluentEmail fluentEmail,
    IEmailTemplateService templateService,
    ILogger<EmailService> logger) : IEmailService
{
    private readonly IFluentEmail _fluentEmail = fluentEmail;
    private readonly IEmailTemplateService _templateService = templateService;
    private readonly ILogger<EmailService> _logger = logger;

    async Task IEmailService.SendEmailConfirmationAsync(User user, string confirmationToken, string callbackUrl)
    {
        var model = new EmailConfirmationModel(
            user.UserName!,
            callbackUrl,
            DateTime.Now.Year.ToString()
        );

        var body = _templateService.ProcessTemplate("EmailConfirmationTemplate.html", model);
        await SendEmailAsync(user.Email!, "Confirm your TuneSpace account", body);
    }

    async Task IEmailService.SendWelcomeEmailAsync(User user)
    {
        var model = new WelcomeEmailModel(
            user.UserName!,
            DateTime.Now.Year.ToString()
        );

        var body = _templateService.ProcessTemplate("WelcomeTemplate.html", model);
        await SendEmailAsync(user.Email!, "Welcome to TuneSpace!", body);
    }

    async Task IEmailService.SendPasswordResetEmailAsync(User user, string resetToken, string callbackUrl)
    {
        var model = new PasswordResetModel(
            user.UserName!,
            callbackUrl,
            DateTime.Now.Year.ToString()
        );

        var body = _templateService.ProcessTemplate("PasswordResetTemplate.html", model);
        await SendEmailAsync(user.Email!, "Reset your TuneSpace password", body);
    }

    async Task IEmailService.SendEmailChangeConfirmationAsync(User user, string newEmail, string confirmationToken, string callbackUrl)
    {
        var model = new EmailChangeConfirmationModel(
            user.UserName!,
            newEmail,
            callbackUrl,
            DateTime.Now.Year.ToString()
        );

        var body = _templateService.ProcessTemplate("EmailChangeConfirmationTemplate.html", model);
        await SendEmailAsync(newEmail, "Confirm your new email address for TuneSpace", body);
    }

    private async Task SendEmailAsync(string to, string subject, string body)
    {
        try
        {
            var email = _fluentEmail
                .To(to)
                .Subject(subject)
                .Body(body, isHtml: true);

            var result = await email.SendAsync();

            if (result.Successful)
            {
                _logger.LogInformation("Email sent successfully");
            }
            else
            {
                var errors = string.Join(", ", result.ErrorMessages);
                _logger.LogError("Failed to send email. Errors: {Errors}", errors);
                throw new InvalidOperationException($"Failed to send email: {errors}");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email");
            throw;
        }
    }
}
