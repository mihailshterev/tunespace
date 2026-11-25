using System.Reflection;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Infrastructure.Services;

internal class EmailTemplateService(
    IMemoryCache cache,
    ILogger<EmailTemplateService> logger) : IEmailTemplateService
{
    private readonly IMemoryCache _cache = cache;
    private readonly ILogger<EmailTemplateService> _logger = logger;
    private readonly TimeSpan _cacheExpiry = TimeSpan.FromHours(1);

    public string LoadTemplate(string templateName)
    {
        var cacheKey = $"email_template_{templateName}";

        if (_cache.TryGetValue(cacheKey, out string? cachedTemplate))
        {
            return cachedTemplate!;
        }

        try
        {
            var template = LoadTemplateFromEmbeddedResource(templateName);
            _cache.Set(cacheKey, template, _cacheExpiry);
            return template;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to load email template: {TemplateName}", templateName);
            throw;
        }
    }

    public string ProcessTemplate(string templateName, object model)
    {
        var template = LoadTemplate(templateName);
        return Process(template, model);
    }

    private static string LoadTemplateFromEmbeddedResource(string templateName)
    {
        var assembly = Assembly.GetExecutingAssembly();
        var resourceName = $"TuneSpace.Infrastructure.Templates.Email.{templateName}";

        using var stream = assembly.GetManifestResourceStream(resourceName) ?? throw new FileNotFoundException($"Email template not found as embedded resource: {templateName}");
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }

    private static string Process(string template, object model)
    {
        var modelType = model.GetType();
        var properties = modelType.GetProperties();

        var result = template;
        foreach (var property in properties)
        {
            var value = property.GetValue(model)?.ToString() ?? string.Empty;
            var placeholder = $"{{{property.Name}}}";
            result = result.Replace(placeholder, value);
        }

        return result;
    }
}
