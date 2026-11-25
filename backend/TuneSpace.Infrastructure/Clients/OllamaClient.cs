using System.Text;
using System.Text.Json;
using TuneSpace.Core.Interfaces.IClients;

namespace TuneSpace.Infrastructure.Clients;

internal class OllamaClient(HttpClient httpClient) : IOllamaClient
{
    private readonly HttpClient _httpClient = httpClient;

    private const string ModelName = "gemma3:1b";
    private const string GenerateEndpoint = "http://localhost:11434/api/generate";

    async Task<string> IOllamaClient.Prompt(string location, List<string> genres)
    {
        var requestData = new
        {
            model = ModelName,
            prompt = $"The user is from {location} and prefers these genres {string.Join(",", genres)}. Suggest underground and lesser known bands from their location that match their taste. (give them in a list without descriptions) and don't say anything else",
            stream = false
        };

        string json = JsonSerializer.Serialize(requestData);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(GenerateEndpoint, content);
        response.EnsureSuccessStatusCode();

        string result = await response.Content.ReadAsStringAsync();
        return result;
    }

    async Task<string> IOllamaClient.PromptWithContext(string enhancedPrompt)
    {
        var requestData = new
        {
            model = ModelName,
            prompt = enhancedPrompt,
            stream = false
        };

        string json = JsonSerializer.Serialize(requestData);
        using var content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync(GenerateEndpoint, content);
        response.EnsureSuccessStatusCode();

        string result = await response.Content.ReadAsStringAsync();
        return result;
    }
}
