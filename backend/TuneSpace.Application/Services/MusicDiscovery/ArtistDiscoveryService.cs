using Microsoft.Extensions.Logging;
using TuneSpace.Core.Common;
using TuneSpace.Core.DTOs.Responses.Spotify;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Core.Models;

namespace TuneSpace.Application.Services.MusicDiscovery;

internal class ArtistDiscoveryService(
    ISpotifyService spotifyService,
    ILastFmClient lastFmClient,
    IBandCachingService cachingService,
    IBandRepository bandRepository,
    ILogger<ArtistDiscoveryService> logger,
    IApiThrottler apiThrottler) : IArtistDiscoveryService
{
    private readonly ISpotifyService _spotifyService = spotifyService;
    private readonly ILastFmClient _lastFmClient = lastFmClient;
    private readonly IBandCachingService _cachingService = cachingService;
    private readonly IBandRepository _bandRepository = bandRepository;
    private readonly ILogger<ArtistDiscoveryService> _logger = logger;
    private readonly IApiThrottler _apiThrottler = apiThrottler;

    async Task<List<SpotifyArtistDTO>?> IArtistDiscoveryService.GetArtistDetailsInBatchesAsync(string token, List<string> artistIds, int batchSize)
    {
        var result = new List<SpotifyArtistDTO>();
        if (artistIds.Count == 0)
        {
            return result;
        }

        string cacheKey = $"artist-details:{string.Join(",", artistIds)}";
        if (_cachingService.TryGetCachedItem(cacheKey, out List<SpotifyArtistDTO>? cachedArtists))
        {
            return cachedArtists;
        }

        for (int i = 0; i < artistIds.Count; i += batchSize)
        {
            var batch = artistIds.Skip(i).Take(batchSize).ToList();
            if (batch.Count == 0)
            {
                continue;
            }

            try
            {
                var artistIdsParam = string.Join(",", batch);
                var artists = await _apiThrottler.ThrottledApiCall(() => _spotifyService.GetSeveralArtistsAsync(token, artistIdsParam));

                if (artists != null)
                {
                    result.AddRange(artists);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving artist details batch");
            }
        }

        _cachingService.CacheItem(cacheKey, result, TimeSpan.FromHours(6));
        return result;
    }

    async Task<List<BandModel>> IArtistDiscoveryService.FindArtistsByQueryAsync(string token, List<string> genres, string queryTemplate, int limit)
    {
        var result = new List<BandModel>();
        var processedArtistNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var genre in genres)
        {
            try
            {
                string cacheKey = $"artist-search:{queryTemplate}:{genre}";

                if (!_cachingService.TryGetCachedItem(cacheKey, out List<BandModel>? cachedResults))
                {
                    var genreQuery = BuildSingleGenreQuery(queryTemplate, genre);
                    var allArtistDetails = new List<SpotifyArtistDTO>();
                    var offset = 0;
                    const int pageSize = 50;
                    const int maxPages = 3;

                    for (int page = 0; page < maxPages; page++)
                    {
                        var artistSearchResponse = await _apiThrottler.ThrottledApiCall(() =>
                            _spotifyService.SearchAsync(token, genreQuery, "artist", limit: pageSize, offset: offset)
                        );

                        if (artistSearchResponse?.Artists?.Items == null || artistSearchResponse.Artists.Items.Count == 0)
                        {
                            break;
                        }

                        allArtistDetails.AddRange([.. artistSearchResponse.Artists.Items
                            .Where(artist => artist.Popularity <= MusicDiscoveryConstants.MaxPopularityForUnderground)]);

                        if (allArtistDetails.Count >= MusicDiscoveryConstants.UndergroundArtistsToFetch || artistSearchResponse.Artists.Next == null)
                        {
                            break;
                        }

                        offset += pageSize;
                    }

                    if (allArtistDetails.Count == 0)
                    {
                        continue;
                    }

                    var artistDetails = allArtistDetails;

                    var artistAlbums = new Dictionary<string, SpotifyAlbumDTO>();

                    var undergroundArtists = artistDetails?
                        .Where(artist => artist.Popularity <= MusicDiscoveryConstants.MaxPopularityForUnderground)
                        .ToList() ?? [];

                    var genreResults = new List<BandModel>();
                    foreach (var artist in undergroundArtists)
                    {
                        if (processedArtistNames.Contains(artist.Name))
                        {
                            continue;
                        }
                        processedArtistNames.Add(artist.Name);

                        var relatedAlbum = artistAlbums.TryGetValue(artist.Id, out var album) ? album : null;

                        var bandModel = new BandModel
                        {
                            Name = artist.Name,
                            Genres = artist.Genres?.ToList() ?? [],
                            ExternalUrl = artist.ExternalUrls?.Spotify ?? string.Empty,
                            ImageUrl = artist.Images?.OrderByDescending(img => img.Width * img.Height)
                                              .FirstOrDefault()?.Url ?? string.Empty,
                            IsFromSearch = true,
                            Popularity = artist.Popularity,
                            LatestAlbum = relatedAlbum?.Name,
                            LatestAlbumReleaseDate = relatedAlbum?.ReleaseDate
                        };

                        genreResults.Add(bandModel);
                    }

                    _cachingService.CacheItem(cacheKey, genreResults, TimeSpan.FromHours(2));
                    result.AddRange(genreResults);
                }
                else if (cachedResults != null)
                {
                    foreach (var band in cachedResults)
                    {
                        if (!processedArtistNames.Contains(band.Name))
                        {
                            processedArtistNames.Add(band.Name);
                            result.Add(band);
                        }
                    }
                }

                if (result.Count >= limit)
                {
                    break;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching for artists");
            }
        }

        return result;
    }

    async Task<List<BandModel>> IArtistDiscoveryService.FindHipsterAndNewArtistsAsync(string token, List<string> genres, int limit)
    {
        var result = new List<BandModel>();

        var hipsterLimit = limit / 2;
        var newLimit = limit - hipsterLimit;

        var hipsterArtists = await FindHipsterArtistsAsync(token, genres, hipsterLimit);
        result.AddRange(hipsterArtists);

        var newArtists = await FindNewArtistsAsync(token, genres, newLimit);
        result.AddRange(newArtists);

        return [.. result.Take(limit)];
    }

    private async Task<List<BandModel>> FindHipsterArtistsAsync(string token, List<string> genres, int limit)
    {
        var result = new List<BandModel>();
        var processedArtistNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        try
        {
            foreach (var genre in genres)
            {
                var cacheKey = $"hipster-artists:{genre}";
                if (!_cachingService.TryGetCachedItem(cacheKey, out List<BandModel>? cachedResults))
                {
                    var genreResults = new List<BandModel>();
                    var offset = 0;
                    const int batchSize = 50;
                    var targetPerGenre = Math.Max(1, limit / genres.Count);

                    while (genreResults.Count < targetPerGenre && offset < 200) // Max 200 to avoid endless pagination
                    {
                        var hipsterQuery = $"genre:\"{genre}\" tag:hipster";
                        var searchResponse = await _apiThrottler.ThrottledApiCall(() =>
                            _spotifyService.SearchAsync(token, hipsterQuery, "album", batchSize, offset)
                        );

                        if (searchResponse?.Albums?.Items == null || searchResponse.Albums.Items.Count == 0)
                        {
                            break;
                        }

                        var artistIds = searchResponse.Albums.Items
                            .SelectMany(album => album.Artists)
                            .Select(artist => artist.Id)
                            .Distinct()
                            .ToList();

                        var artistDetails = await ((IArtistDiscoveryService)this).GetArtistDetailsInBatchesAsync(token, artistIds);
                        if (artistDetails == null || artistDetails.Count == 0)
                        {
                            offset += batchSize;
                            continue;
                        }

                        var albumLookup = searchResponse.Albums.Items
                            .SelectMany(album => album.Artists.Select(artist => new { ArtistId = artist.Id, Album = album }))
                            .GroupBy(x => x.ArtistId)
                            .ToDictionary(g => g.Key, g => g.First().Album);

                        foreach (var artist in artistDetails)
                        {
                            if (processedArtistNames.Contains(artist.Name) || genreResults.Count >= targetPerGenre)
                            {
                                continue;
                            }

                            processedArtistNames.Add(artist.Name);
                            var relatedAlbum = albumLookup.TryGetValue(artist.Id, out var album) ? album : null;

                            var bandModel = new BandModel
                            {
                                Id = artist.Id,
                                Name = artist.Name,
                                Genres = artist.Genres?.ToList() ?? [],
                                ExternalUrl = artist.ExternalUrls?.Spotify ?? string.Empty,
                                ImageUrl = artist.Images?.OrderByDescending(img => img.Width * img.Height)
                                              .FirstOrDefault()?.Url ?? string.Empty,
                                IsFromSearch = true,
                                Popularity = artist.Popularity,
                                SearchTags = new List<string> { "hipster", genre },
                                LatestAlbum = relatedAlbum?.Name,
                                LatestAlbumReleaseDate = relatedAlbum?.ReleaseDate
                            };

                            genreResults.Add(bandModel);
                        }

                        offset += batchSize;
                    }

                    _cachingService.CacheItem(cacheKey, genreResults, TimeSpan.FromHours(2));
                    result.AddRange(genreResults);
                }
                else if (cachedResults != null)
                {
                    foreach (var band in cachedResults)
                    {
                        if (!processedArtistNames.Contains(band.Name))
                        {
                            processedArtistNames.Add(band.Name);
                            result.Add(band);
                        }
                    }
                }

                if (result.Count >= limit)
                {
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching for hipster artists");
        }

        return result;
    }

    private async Task<List<BandModel>> FindNewArtistsAsync(string token, List<string> genres, int limit)
    {
        var result = new List<BandModel>();
        var processedArtistNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        try
        {
            foreach (var genre in genres)
            {
                var cacheKey = $"new-artists:{genre}";
                if (!_cachingService.TryGetCachedItem(cacheKey, out List<BandModel>? cachedResults))
                {
                    var genreResults = new List<BandModel>();
                    var offset = 0;
                    const int batchSize = 50;
                    var targetPerGenre = Math.Max(1, limit / genres.Count);

                    while (genreResults.Count < targetPerGenre && offset < 200)
                    {
                        var newQuery = $"genre:\"{genre}\" tag:new";
                        var searchResponse = await _apiThrottler.ThrottledApiCall(() =>
                            _spotifyService.SearchAsync(token, newQuery, "album", batchSize, offset));

                        if (searchResponse?.Albums?.Items == null || searchResponse.Albums.Items.Count == 0)
                        {
                            break;
                        }

                        var artistIds = searchResponse.Albums.Items
                            .SelectMany(album => album.Artists)
                            .Select(artist => artist.Id)
                            .Distinct()
                            .ToList();

                        var artistDetails = await ((IArtistDiscoveryService)this).GetArtistDetailsInBatchesAsync(token, artistIds);
                        if (artistDetails == null || artistDetails.Count == 0)
                        {
                            offset += batchSize;
                            continue;
                        }

                        var newArtistDetails = artistDetails
                            .Where(artist => artist.Popularity <= MusicDiscoveryConstants.MaxPopularityForUnderground)
                            .ToList();

                        var albumLookup = searchResponse.Albums.Items
                            .SelectMany(album => album.Artists.Select(artist => new { ArtistId = artist.Id, Album = album }))
                            .GroupBy(x => x.ArtistId)
                            .ToDictionary(g => g.Key, g => g.First().Album);

                        foreach (var artist in newArtistDetails)
                        {
                            if (processedArtistNames.Contains(artist.Name) || genreResults.Count >= targetPerGenre)
                            {
                                continue;
                            }

                            processedArtistNames.Add(artist.Name);
                            var relatedAlbum = albumLookup.TryGetValue(artist.Id, out var album) ? album : null;

                            var bandModel = new BandModel
                            {
                                Id = artist.Id,
                                Name = artist.Name,
                                Genres = artist.Genres?.ToList() ?? [],
                                ExternalUrl = artist.ExternalUrls?.Spotify ?? string.Empty,
                                ImageUrl = artist.Images?.OrderByDescending(img => img.Width * img.Height)
                                              .FirstOrDefault()?.Url ?? string.Empty,
                                IsFromSearch = true,
                                IsNewRelease = true,
                                Popularity = artist.Popularity,
                                SearchTags = new List<string> { "new", genre },
                                LatestAlbum = relatedAlbum?.Name,
                                LatestAlbumReleaseDate = relatedAlbum?.ReleaseDate
                            };

                            genreResults.Add(bandModel);
                        }

                        offset += batchSize;
                    }

                    _cachingService.CacheItem(cacheKey, genreResults, TimeSpan.FromHours(1));
                    result.AddRange(genreResults);
                }
                else if (cachedResults != null)
                {
                    foreach (var band in cachedResults)
                    {
                        if (!processedArtistNames.Contains(band.Name))
                        {
                            processedArtistNames.Add(band.Name);
                            result.Add(band);
                        }
                    }
                }

                if (result.Count >= limit)
                {
                    break;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error searching for new artists");
        }

        return result;
    }

    async Task<List<BandModel>> IArtistDiscoveryService.GetRegisteredBandsAsModelsAsync(List<string> genres, string location)
    {
        var bands = new List<BandModel>();
        var matchingBands = await GetMatchingRegisteredBands(genres, location);

        if (matchingBands == null || matchingBands.Count == 0)
        {
            return bands;
        }

        var bandModelTasks = matchingBands.Select(async band =>
        {
            var bandModel = new BandModel
            {
                Id = band.Id.ToString(),
                Name = band.Name ?? "Unknown",
                Location = band.Country ?? band.City ?? location,
                Genres = !string.IsNullOrEmpty(band.Genre)
                    ? [.. band.Genre.Split(',').Select(g => g.Trim())]
                    : [],
                IsRegistered = true,
                CoverImage = band.CoverImage ?? [],
            };

            try
            {
                string cacheKey = $"band:{bandModel.Name}";

                if (!_cachingService.TryGetCachedItem(cacheKey, out BandModel? cachedBandData))
                {
                    var lastFmData = await _apiThrottler.ThrottledApiCall(() => _lastFmClient.GetBandDataAsync(bandModel.Name));
                    if (lastFmData != null)
                    {
                        bandModel.Listeners = lastFmData.Listeners;
                        bandModel.PlayCount = lastFmData.PlayCount;

                        if (string.IsNullOrEmpty(bandModel.ImageUrl))
                        {
                            bandModel.ImageUrl = lastFmData.ImageUrl;
                        }

                        if (bandModel.Genres.Count == 0)
                        {
                            bandModel.Genres = lastFmData.Genres;
                        }
                        else if (lastFmData.Genres.Count > 0)
                        {
                            bandModel.Genres.AddRange(lastFmData.Genres.Except(bandModel.Genres, StringComparer.OrdinalIgnoreCase));
                        }

                        bandModel.SimilarArtists = lastFmData.SimilarArtists;
                        _cachingService.CacheItem(cacheKey, bandModel, TimeSpan.FromHours(24));
                    }
                }
                else if (cachedBandData != null)
                {
                    bandModel.Listeners = cachedBandData.Listeners;
                    bandModel.PlayCount = cachedBandData.PlayCount;

                    if (string.IsNullOrEmpty(bandModel.ImageUrl))
                    {
                        bandModel.ImageUrl = cachedBandData.ImageUrl;
                    }

                    if (bandModel.Genres.Count == 0)
                    {
                        bandModel.Genres = cachedBandData.Genres;
                    }
                    else if (cachedBandData.Genres.Count > 0)
                    {
                        bandModel.Genres.AddRange(cachedBandData.Genres.Except(bandModel.Genres, StringComparer.OrdinalIgnoreCase));
                    }

                    bandModel.SimilarArtists = cachedBandData.SimilarArtists;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error enriching band data for {BandName}", band.Name);
            }

            return bandModel;
        }).ToArray();

        var bandModels = await Task.WhenAll(bandModelTasks);
        bands.AddRange(bandModels);

        return bands;
    }

    private async Task<List<Band>?> GetMatchingRegisteredBands(List<string> genres, string location)
    {
        var result = new List<Band>();

        try
        {
            string cacheKey = $"registered-bands:{string.Join(",", genres)}:{location}";

            if (_cachingService.TryGetCachedItem(cacheKey, out List<Band>? cachedBands))
            {
                return cachedBands;
            }

            if (genres.Count > 0 && !string.IsNullOrEmpty(location))
            {
                foreach (var genre in genres)
                {
                    var bands = await _bandRepository.GetBandsByGenreAndLocationAsync(genre, location);
                    foreach (var band in bands)
                    {
                        if (!result.Any(b => b.Id == band.Id))
                        {
                            result.Add(band);
                        }
                    }
                }

                if (result.Count == 0)
                {
                    result = await _bandRepository.GetBandsByLocationAsync(location);

                    if (result.Count == 0)
                    {
                        foreach (var genre in genres)
                        {
                            var bands = await _bandRepository.GetBandsByGenreAsync(genre);
                            foreach (var band in bands)
                            {
                                if (!result.Any(b => b.Id == band.Id))
                                {
                                    result.Add(band);
                                }
                            }
                        }
                    }
                }
            }
            else if (genres.Count > 0)
            {
                foreach (var genre in genres)
                {
                    var bands = await _bandRepository.GetBandsByGenreAsync(genre);
                    foreach (var band in bands)
                    {
                        if (!result.Any(b => b.Id == band.Id))
                        {
                            result.Add(band);
                        }
                    }
                }
            }
            else if (!string.IsNullOrEmpty(location))
            {
                result = await _bandRepository.GetBandsByLocationAsync(location);
            }
            else
            {
                result = await _bandRepository.GetAllBandsAsync();
            }

            if (result.Count == 0)
            {
                result = await _bandRepository.GetAllBandsAsync();
            }

            _cachingService.CacheItem(cacheKey, result, TimeSpan.FromMinutes(30));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting registered bands");
            return [];
        }

        return result;
    }

    private static string BuildSingleGenreQuery(string queryTemplate, string genre)
    {
        if (queryTemplate.Contains("{genre}"))
        {
            return queryTemplate.Replace("{genre}", $"genre:\"{genre}\"");
        }
        return queryTemplate;
    }
}
