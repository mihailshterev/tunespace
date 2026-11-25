using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace TuneSpace.Tests.Integration;

public class UserControllerIntegrationTests(WebApplicationFactory<Program> factory) : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Theory]
    [InlineData("/api/User/testuser")]
    [InlineData("/api/User/search/test")]
    [InlineData("/api/User/search/")]
    [InlineData("/api/User/testuser/profile-picture")]
    [InlineData("/api/User/testuser/profile")]
    public async Task ProtectedEndpoint_WithoutAuthorization_ShouldReturnUnauthorized(string url)
    {
        var response = await _client.GetAsync(url, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
