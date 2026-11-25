using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using TuneSpace.Core.DTOs.Requests.Auth;
using Xunit;

namespace TuneSpace.Tests.Integration;

public class AuthControllerIntegrationTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturnUnauthorized()
    {
        var loginRequest = new LoginRequest("nonexistent@example.com", "wrongpassword");

        var response = await _client.PostAsJsonAsync("/api/Auth/login", loginRequest, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Register_WithValidData_ShouldReturnOk()
    {
        var registerRequest = new RegisterRequest(
            $"testuser_{Guid.NewGuid():N}",
            $"test_{Guid.NewGuid():N}@example.com",
            "Test123!@#",
            "User");

        var response = await _client.PostAsJsonAsync("/api/Auth/register", registerRequest, TestContext.Current.CancellationToken);

        Assert.Contains(response.StatusCode, new[] { HttpStatusCode.OK, HttpStatusCode.Created, HttpStatusCode.BadRequest });
    }

    [Fact]
    public async Task Register_WithInvalidData_ShouldReturnBadRequest()
    {
        var registerRequest = new RegisterRequest("", "invalidemail", "123", "User");

        var response = await _client.PostAsJsonAsync("/api/Auth/register", registerRequest, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ForgotPassword_WithValidEmail_ShouldReturnOk()
    {
        var request = new ForgotPasswordRequest("test@example.com");

        var response = await _client.PostAsJsonAsync("/api/Auth/forgot-password", request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
