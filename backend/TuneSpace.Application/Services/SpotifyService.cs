using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Json;
using TuneSpace.Application.Common;
using TuneSpace.Core.DTOs.Responses.Spotify;
using TuneSpace.Core.Exceptions;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Infrastructure.Options;

namespace TuneSpace.Application.Services;

internal class SpotifyService(
    ISpotifyClient spotifyClient,
    ILogger<SpotifyService> logger,
    IOptions<SpotifyOptions> spotifyOptions,
    IOAuthStateService oAuthStateService) : ISpotifyService
{
    private readonly ISpotifyClient _spotifyClient = spotifyClient;
    private readonly ILogger<SpotifyService> _logger = logger;
    private readonly SpotifyOptions _spotifyOptions = spotifyOptions.Value;
    private readonly IOAuthStateService _oAuthStateService = oAuthStateService;

    private const string SpotifyRedirectUri = "http://127.0.0.1:5053/api/Spotify/callback";

    private static readonly JsonSerializerOptions jsonSerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower,
        PropertyNameCaseInsensitive = true
    };

    string ISpotifyService.GetSpotifyLoginUrl()
    {
        return ((ISpotifyService)this).GetSpotifyLoginUrl("login");
    }

    string ISpotifyService.GetSpotifyLoginUrl(string flowType)
    {
        var baseState = _oAuthStateService.GenerateAndStoreState();
        var state = $"{flowType}:{baseState}";

        const string scope = "user-read-private user-read-email user-top-read playlist-modify-private playlist-modify-public user-read-recently-played user-follow-read";

        var redirectUrl = $"https://accounts.spotify.com/authorize?" +
                          $"response_type=code" +
                          $"&client_id={_spotifyOptions.ClientId}" +
                          $"&scope={scope}" +
                          $"&redirect_uri={SpotifyRedirectUri}" +
                          $"&state={state}";

        return redirectUrl;
    }

    async Task<SpotifyTokenResponse> ISpotifyService.ExchangeCodeForTokenAsync(string code)
    {
        var parameters = new FormUrlEncodedContent(
        [
            new KeyValuePair<string, string?>("grant_type", "authorization_code"),
            new KeyValuePair<string, string?>("code", code),
            new KeyValuePair<string, string?>("redirect_uri", SpotifyRedirectUri),
            new KeyValuePair<string, string?>("client_id", _spotifyOptions.ClientId),
            new KeyValuePair<string, string?>("client_secret", _spotifyOptions.ClientSecret)
        ]);

        try
        {
            var response = await _spotifyClient.GetToken(parameters);
            var content = await response.Content.ReadAsStringAsync();

            var tokenResponse = JsonSerializer.Deserialize<SpotifyTokenResponse>(content, jsonSerializerOptions)
                ?? throw new SpotifyApiException("Failed to deserialize token response");

            return tokenResponse;
        }
        catch (HttpRequestException e)
        {
            _logger.LogError(e, "Error exchanging code for token");
            throw;
        }
    }

    async Task<SpotifyProfileDTO> ISpotifyService.GetUserSpotifyProfileAsync(string token)
    {
        try
        {
            var response = await _spotifyClient.GetUserInfo(token);

            if (!response.IsSuccessStatusCode)
            {
                throw new SpotifyApiException("Error retrieving Spotify user data");
            }

            var user = JsonSerializer.Deserialize<SpotifyApiProfileResponse>(await response.Content.ReadAsStringAsync())
            ?? throw new SpotifyApiException("Failed to deserialize Spotify profile response");

            var profile = new SpotifyProfileDTO
            {
                Username = user.Display_Name,
                FollowerCount = user.Followers.Total,
                ProfilePicture = user.Images.Count > 0 ? user.Images[0].Url ?? string.Empty :
                                user.Images.FirstOrDefault()?.Url ?? string.Empty,
                SpotifyPlan = user.Product
            };

            return profile ?? throw new JsonException();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify user profile");
            throw;
        }
    }

    async Task<SpotifyApiProfileResponse> ISpotifyService.GetUserInfoAsync(string token)
    {
        try
        {
            var response = await _spotifyClient.GetUserInfo(token);

            if (!response.IsSuccessStatusCode)
            {
                throw new SpotifyApiException("Error retrieving Spotify user info");
            }

            var userInfo = JsonSerializer.Deserialize<SpotifyApiProfileResponse>(await response.Content.ReadAsStringAsync())
                ?? throw new SpotifyApiException("Failed to deserialize Spotify user info response");

            return userInfo;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify user info");
            throw;
        }
    }

    async Task<List<SpotifyArtistDTO>> ISpotifyService.GetUserTopArtistsAsync(string token)
    {
        try
        {
            var response = await _spotifyClient.GetUserTopArtists(token);

            if (!response.IsSuccessStatusCode)
            {
                throw new SpotifyApiException("Error retrieving Spotify user top artists");
            }

            var rootObject = JsonSerializer.Deserialize<UserTopArtistsResponse>(await response.Content.ReadAsStringAsync());

            var artistDtos = rootObject?.Items.Select(item =>
                new SpotifyArtistDTO
                {
                    Name = item.Name,
                    Popularity = item.Popularity,
                    Followers = item.Followers,
                    Images = [new() { Url = item.Images.OrderByDescending(img => img.Width * img.Height).FirstOrDefault()?.Url ?? string.Empty }]
                }
            ).ToList();

            return artistDtos ?? throw new JsonException();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify user top artists");
            throw;
        }
    }

    async Task<List<SpotifyArtistDTO>> ISpotifyService.GetUserFollowedArtistsAsync(string token)
    {
        try
        {
            var allArtists = new List<SpotifyArtistDTO>();
            string? afterCursor = null;
            bool hasMoreArtists = true;

            while (hasMoreArtists)
            {
                var response = await _spotifyClient.GetUserFollowedArtists(token, afterCursor);

                if (!response.IsSuccessStatusCode)
                {
                    throw new SpotifyApiException("Error retrieving Spotify user followed artists");
                }

                var rootObject = JsonSerializer.Deserialize<UserFollowedArtistsResponse>(await response.Content.ReadAsStringAsync());

                if (rootObject?.Artists?.Items == null)
                {
                    throw new JsonException("Failed to deserialize artists response");
                }

                var artistDtos = rootObject.Artists.Items.Select(item =>
                    new SpotifyArtistDTO
                    {
                        Id = item.Id,
                        Name = item.Name,
                        Popularity = item.Popularity,
                        Images = item.Images.OrderByDescending(img => img.Width * img.Height).ToList(),
                        Genres = item.Genres,
                        Followers = item.Followers
                    }
                ).ToList();

                allArtists.AddRange(artistDtos);

                hasMoreArtists = !string.IsNullOrEmpty(rootObject.Artists.Cursors?.After);
                afterCursor = rootObject.Artists.Cursors?.After;
            }

            return allArtists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify user followed artists");
            throw;
        }
    }

    async Task<List<RecentlyPlayedTrackDTO>> ISpotifyService.GetUserRecentlyPlayedTracksAsync(string token)
    {
        try
        {
            var response = await _spotifyClient.GetUserRecentlyPlayedTracks(token, null, null, 50);

            if (!response.IsSuccessStatusCode)
            {
                throw new SpotifyApiException("Error retrieving Spotify user recently played tracks");
            }

            var rootObject = JsonSerializer.Deserialize<UserRecentlyPlayedTracksResponse>(await response.Content.ReadAsStringAsync());

            var trackDtos = rootObject?.Items.Select(item =>
                new RecentlyPlayedTrackDTO
                {
                    TrackName = item.Track.Name,
                    ArtistName = string.Join(", ", item.Track.Artists.Select(artist => artist.Name)),
                    ArtistId = item.Track.Artists.First().Id,
                    AlbumName = item.Track.Album.Name,
                    AlbumImageUrl = item.Track.Album.Images.OrderByDescending(img => img.Width * img.Height).FirstOrDefault()?.Url ?? string.Empty,
                    PlayedAt = DateTime.Parse(item.Played_At),
                    DurationMs = item.Track.Duration_Ms
                }
            ).ToList();

            return trackDtos ?? throw new JsonException();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify user recently played tracks");
            throw;
        }
    }

    async Task<RecentlyPlayedStatsResponse> ISpotifyService.GetListeningStatsForPeriodAsync(string token, string period)
    {
        try
        {
            var (startTime, endTime, periodName) = Helpers.GetTimeRangeForPeriod(period);
            var allTracks = new List<RecentlyPlayedTrackDTO>();

            var afterTimestamp = ((DateTimeOffset)startTime).ToUnixTimeMilliseconds();

            var hasMoreData = true;
            long? currentAfter = afterTimestamp;

            while (hasMoreData && allTracks.Count < 1000)
            {
                var response = await _spotifyClient.GetUserRecentlyPlayedTracks(token, currentAfter, null, 50);

                if (!response.IsSuccessStatusCode)
                {
                    throw new SpotifyApiException("Error retrieving Spotify user recently played tracks");
                }

                var responseContent = await response.Content.ReadAsStringAsync();
                var rootObject = JsonSerializer.Deserialize<UserRecentlyPlayedTracksResponse>(responseContent);

                if (rootObject?.Items == null || rootObject.Items.Count == 0)
                {
                    hasMoreData = false;
                    break;
                }

                var responseJson = JsonSerializer.Deserialize<UserRecentlyPlayedTracksResponse>(responseContent);
                var cursors = responseJson?.Cursors;
                var nextCursor = cursors?.After?.ToString();

                var trackDtos = rootObject.Items.Select(item =>
                    new RecentlyPlayedTrackDTO
                    {
                        TrackName = item.Track.Name,
                        ArtistName = string.Join(", ", item.Track.Artists.Select(artist => artist.Name)),
                        ArtistId = item.Track.Artists.First().Id,
                        AlbumName = item.Track.Album.Name,
                        AlbumImageUrl = item.Track.Album.Images.OrderByDescending(img => img.Width * img.Height).FirstOrDefault()?.Url ?? string.Empty,
                        PlayedAt = DateTime.Parse(item.Played_At),
                        DurationMs = item.Track.Duration_Ms
                    }
                ).ToList();

                if (trackDtos.Count == 0)
                {
                    var oldestTrackInBatch = rootObject.Items.Min(item => DateTime.Parse(item.Played_At));
                    if (oldestTrackInBatch < startTime)
                    {
                        hasMoreData = false;
                        break;
                    }
                }

                allTracks.AddRange(trackDtos);

                if (!string.IsNullOrEmpty(nextCursor))
                {
                    currentAfter = long.Parse(nextCursor);
                }
                else
                {
                    hasMoreData = false;
                }

                if (rootObject.Items.Count < 50)
                {
                    hasMoreData = false;
                }

                var allTracksBeforeStartTime = rootObject.Items.All(item => DateTime.Parse(item.Played_At) < startTime);
                if (allTracksBeforeStartTime)
                {
                    hasMoreData = false;
                }
            }

            var totalHours = allTracks.Sum(t => t.DurationMinutes) / 60.0;
            var uniqueTracks = allTracks.GroupBy(t => new { t.TrackName, t.ArtistName }).Count();

            return new RecentlyPlayedStatsResponse
            {
                Tracks = allTracks.OrderByDescending(t => t.PlayedAt).ToList(),
                TotalHoursPlayed = Math.Round(totalHours, 2),
                UniqueTracksCount = uniqueTracks,
                TotalPlays = allTracks.Count,
                TimePeriod = periodName
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify listening stats for period: {Period}", period);
            throw;
        }
    }

    async Task<List<TopSongDTO>> ISpotifyService.GetUserTopSongsAsync(string token)
    {
        try
        {
            var response = await _spotifyClient.GetUserTopSongs(token);

            if (!response.IsSuccessStatusCode)
            {
                throw new SpotifyApiException("Error retrieving Spotify user top artists");
            }

            var rootObject = JsonSerializer.Deserialize<UserTopSongsResponse>(await response.Content.ReadAsStringAsync());

            var songDtos = rootObject?.Items.Select(item =>
                new TopSongDTO(
                    item.Name,
                    item.Album.Artists.First().Name,
                    item.Album.Images.OrderByDescending(img => img.Width * img.Height).FirstOrDefault()?.Url ?? string.Empty
                )
            ).ToList();

            return songDtos ?? throw new JsonException();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify user top songs");
            throw;
        }
    }

    async Task<List<SearchSongDTO>> ISpotifyService.GetSongsBySearchAsync(string token, string search)
    {
        try
        {
            var response = await _spotifyClient.GetSongsBySearch(token, search);
            var rootObject = JsonSerializer.Deserialize<SpotifySongSearchResponse>(await response.Content.ReadAsStringAsync());

            var songDtos = rootObject?.Tracks.Items.Select(item =>
                new SearchSongDTO(
                    item.Id,
                    item.Name,
                    item.Artists.First().Name,
                    item.Album.Images.OrderByDescending(img => img.Width * img.Height).FirstOrDefault()?.Url ?? string.Empty
                )
            ).ToList();

            return songDtos ?? throw new JsonException();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify songs by search");
            throw;
        }
    }

    async Task<SpotifyArtistDTO> ISpotifyService.GetArtistAsync(string token, string artistId)
    {
        try
        {
            var response = await _spotifyClient.GetArtist(token, artistId);

            if (!response.IsSuccessStatusCode)
            {
                throw new SpotifyApiException("Error retrieving Spotify artist");
            }

            var artist = JsonSerializer.Deserialize<SpotifyArtistDTO>(await response.Content.ReadAsStringAsync());

            return artist ?? throw new JsonException();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify artist");
            throw;
        }
    }

    async Task<List<SpotifyArtistDTO>> ISpotifyService.GetSeveralArtistsAsync(string token, string artistIds)
    {
        try
        {
            var response = await _spotifyClient.GetSeveralArtists(token, artistIds);

            if (!response.IsSuccessStatusCode)
            {
                throw new SpotifyApiException("Error retrieving Spotify artists");
            }

            var artists = JsonSerializer.Deserialize<SpotifySeveralArtistsResponse>(await response.Content.ReadAsStringAsync());

            return artists?.Artists ?? throw new JsonException();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving Spotify artists");
            throw;
        }
    }

    async Task<SpotifyTokenResponse> ISpotifyService.RefreshAccessTokenAsync(string refreshToken)
    {
        var parameters = new Dictionary<string, string>
        {
            { "grant_type", "refresh_token" },
            { "refresh_token", refreshToken },
            { "client_id", _spotifyOptions.ClientId },
            { "client_secret", _spotifyOptions.ClientSecret }
        };

        var content = new FormUrlEncodedContent(parameters);

        try
        {
            var response = await _spotifyClient.RefreshAccessToken(content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                throw new SpotifyApiException($"Failed to refresh Spotify token: {response.StatusCode}, {errorContent}");
            }

            var responseString = await response.Content.ReadAsStringAsync();
            var tokenResponse = JsonSerializer.Deserialize<SpotifyTokenResponse>(responseString, jsonSerializerOptions)
                ?? throw new SpotifyApiException("Failed to deserialize Spotify token response");

            if (string.IsNullOrEmpty(tokenResponse.RefreshToken))
            {
                tokenResponse.RefreshToken = refreshToken;
            }

            return tokenResponse;
        }
        catch (Exception ex) when (ex is not SpotifyApiException)
        {
            _logger.LogError(ex, "Error refreshing Spotify token");
            throw new SpotifyApiException($"Error refreshing Spotify token: {ex.Message}");
        }
    }

    async Task<SpotifySearchResponse> ISpotifyService.SearchAsync(string token, string query, string types, int limit, int offset)
    {
        try
        {
            var response = await _spotifyClient.Search(token, query, types, limit, offset);

            if (!response.IsSuccessStatusCode)
            {
                throw new SpotifyApiException($"Failed to search Spotify: {response.StatusCode}");
            }

            var content = await response.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<SpotifySearchResponse>(content) ??
                   throw new JsonException("Failed to deserialize Spotify search response");
        }
        catch (Exception ex) when (ex is not SpotifyApiException)
        {
            _logger.LogError(ex, "Error searching Spotify");
            throw new SpotifyApiException($"Error searching Spotify: {ex.Message}");
        }
    }
}
