using System.Text.Json;
using Microsoft.Extensions.Options;
using TuneSpace.Core.Common;
using TuneSpace.Core.DTOs.Responses.LastFm;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Models;
using TuneSpace.Infrastructure.Options;

namespace TuneSpace.Infrastructure.Clients;

internal class LastFmClient(
    HttpClient httpClient,
    IOptions<LastFmOptions> lastFmOptions,
    IBandCachingService cachingService) : ILastFmClient
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly LastFmOptions _lastFmOptions = lastFmOptions.Value;
    private readonly IBandCachingService _cachingService = cachingService;

    private const string BaseUrl = "https://ws.audioscrobbler.com/2.0/";

    async Task<BandModel> ILastFmClient.GetBandDataAsync(string bandName)
    {
        var cacheKey = $"lastfm_band_{bandName.ToLowerInvariant()}";

        return await _cachingService.GetOrCreateCachedItemAsync(
            cacheKey,
            async () =>
            {
                var apiUrl = $"{BaseUrl}?method=artist.getInfo&artist={bandName}&api_key={_lastFmOptions.ApiKey}&format=json";
                var response = await _httpClient.GetStringAsync(apiUrl);

                var bandData = JsonSerializer.Deserialize<LastFmArtistInfoResponse>(response);
                var artist = bandData?.Artist;

                if (artist == null)
                {
                    return new BandModel { Name = bandName };
                }

                var name = artist.Name ?? bandName;
                var listeners = int.TryParse(artist.Stats?.Listeners, out var l) ? l : 0;
                var playCount = int.TryParse(artist.Stats?.PlayCount, out var pc) ? pc : 0;
                var externalUrl = artist.Url ?? "";

                var tags = artist.Tags?.Tag;
                var genres = tags?.Select(t => t.Name ?? "")
                    .Where(t => !string.IsNullOrEmpty(t))
                    .ToList() ?? [];

                return new BandModel
                {
                    Name = name,
                    Listeners = listeners,
                    PlayCount = playCount,
                    ExternalUrl = externalUrl,
                    Genres = genres
                };
            },
            TimeSpan.FromHours(2)
        );
    }

    async Task<List<string>> ILastFmClient.GetSimilarBandsAsync(string bandName, int limit)
    {
        var cacheKey = $"lastfm_similar_{bandName.ToLowerInvariant()}_{limit}";

        return await _cachingService.GetOrCreateCachedItemAsync(
            cacheKey,
            async () =>
            {
                var apiUrl = $"{BaseUrl}?method=artist.getSimilar&artist={bandName}&api_key={_lastFmOptions.ApiKey}&limit={limit}&format=json";
                var response = await _httpClient.GetStringAsync(apiUrl);

                var similarBands = JsonSerializer.Deserialize<LastFmSimilarArtistsResponse>(response);
                var artists = similarBands?.SimilarArtists?.Artists;

                if (artists is null)
                {
                    return [];
                }

                var artistNames = artists
                    .Select(artist => artist.Name ?? "")
                    .Where(name => !string.IsNullOrEmpty(name))
                    .ToList();

                var undergroundArtists = new List<string>();

                foreach (var artistName in artistNames)
                {
                    try
                    {
                        var artistInfo = await ((ILastFmClient)this).GetBandDataAsync(artistName);
                        if (artistInfo.Listeners < MusicDiscoveryConstants.UndergroundListenersThreshold)
                        {
                            undergroundArtists.Add(artistName);
                        }
                    }
                    catch
                    {
                        continue;
                    }
                }

                return undergroundArtists;
            },
            TimeSpan.FromHours(4)
        );
    }
}
