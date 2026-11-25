using System.Net.Http.Headers;
using TuneSpace.Core.Interfaces.IClients;

namespace TuneSpace.Infrastructure.Clients;

internal class SpotifyClient(HttpClient httpClient) : ISpotifyClient
{
    private readonly HttpClient _httpClient = httpClient;

    private const string AuthUrl = "https://accounts.spotify.com/api/token";

    async Task<HttpResponseMessage> ISpotifyClient.GetToken(FormUrlEncodedContent parameters)
    {
        return await _httpClient.PostAsync(AuthUrl, parameters);
    }

    async Task<HttpResponseMessage> ISpotifyClient.GetUserInfo(string token)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "me");
        SetAuthorizationHeader(request, token);
        return await _httpClient.SendAsync(request);
    }

    async Task<HttpResponseMessage> ISpotifyClient.GetUserRecentlyPlayedTracks(string token, long? after, long? before, int limit)
    {
        var url = $"me/player/recently-played?limit={limit}";

        if (after.HasValue)
        {
            url += $"&after={after.Value}";
        }
        else if (before.HasValue)
        {
            url += $"&before={before.Value}";
        }

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        SetAuthorizationHeader(request, token);
        return await _httpClient.SendAsync(request);
    }

    async Task<HttpResponseMessage> ISpotifyClient.GetUserFollowedArtists(string token, string? after)
    {
        var url = "me/following?type=artist&limit=50";
        if (!string.IsNullOrEmpty(after))
        {
            url += $"&after={after}";
        }

        using var request = new HttpRequestMessage(HttpMethod.Get, url);
        SetAuthorizationHeader(request, token);
        return await _httpClient.SendAsync(request);
    }

    async Task<HttpResponseMessage> ISpotifyClient.GetUserTopArtists(string token)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "me/top/artists?time_range=short_term&limit=5&offset=0");
        SetAuthorizationHeader(request, token);
        return await _httpClient.SendAsync(request);
    }

    async Task<HttpResponseMessage> ISpotifyClient.GetUserTopSongs(string token)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, "me/top/tracks?time_range=short_term&limit=5&offset=0");
        SetAuthorizationHeader(request, token);
        return await _httpClient.SendAsync(request);
    }

    async Task<HttpResponseMessage> ISpotifyClient.GetSongsBySearch(string token, string search)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"search?q={Uri.EscapeDataString(search)}&type=track&limit=5");
        SetAuthorizationHeader(request, token);
        return await _httpClient.SendAsync(request);
    }

    async Task<HttpResponseMessage> ISpotifyClient.GetArtist(string token, string artistId)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"artists/{artistId}");
        SetAuthorizationHeader(request, token);
        return await _httpClient.SendAsync(request);
    }

    async Task<HttpResponseMessage> ISpotifyClient.GetSeveralArtists(string token, string artistIds)
    {
        using var request = new HttpRequestMessage(HttpMethod.Get, $"artists?ids={artistIds}");
        SetAuthorizationHeader(request, token);
        return await _httpClient.SendAsync(request);
    }

    async Task<HttpResponseMessage> ISpotifyClient.RefreshAccessToken(FormUrlEncodedContent parameters)
    {
        _httpClient.DefaultRequestHeaders.Accept.Clear();
        _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

        return await _httpClient.PostAsync(AuthUrl, parameters);
    }

    async Task<HttpResponseMessage> ISpotifyClient.Search(string token, string query, string types, int limit, int offset)
    {
        var requestUrl = $"search?q={Uri.EscapeDataString(query)}&type={types}";

        if (limit > 0)
        {
            requestUrl += $"&limit={limit}";
        }

        if (offset > 0)
        {
            requestUrl += $"&offset={offset}";
        }

        using var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
        SetAuthorizationHeader(request, token);
        return await _httpClient.SendAsync(request);
    }

    private static void SetAuthorizationHeader(HttpRequestMessage request, string token)
    {
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
}
