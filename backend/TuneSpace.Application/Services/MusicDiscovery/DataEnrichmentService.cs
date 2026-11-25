using Microsoft.Extensions.Logging;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Interfaces.IInfrastructure;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Core.Models;

namespace TuneSpace.Application.Services.MusicDiscovery;

internal class DataEnrichmentService(
    ILastFmClient lastFmClient,
    IBandCachingService cachingService,
    ILogger<DataEnrichmentService> logger,
    IApiThrottler apiThrottler) : IDataEnrichmentService
{
    private readonly ILastFmClient _lastFmClient = lastFmClient;
    private readonly IBandCachingService _cachingService = cachingService;
    private readonly ILogger<DataEnrichmentService> _logger = logger;
    private readonly IApiThrottler _apiThrottler = apiThrottler;

    async Task<List<BandModel>> IDataEnrichmentService.EnrichMultipleBandsAsync(List<BandModel> bands)
    {
        if (bands.Count == 0)
        {
            return bands;
        }

        var bandNames = bands.Select(b => b.Name).Distinct().ToList();
        var enrichedDataDictionary = new Dictionary<string, BandModel>(StringComparer.OrdinalIgnoreCase);

        for (int i = 0; i < bandNames.Count; i += 5)
        {
            var batchTasks = bandNames.Skip(i).Take(5)
                .Select(async name =>
                {
                    try
                    {
                        return (name, await GetCachedBandDataAsync(name));
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to enrich data for band {BandName}", name);
                        return (name, null);
                    }
                });

            var results = await Task.WhenAll(batchTasks);

            foreach (var (name, data) in results)
            {
                if (data != null)
                    enrichedDataDictionary[name] = data;
            }
        }

        foreach (var band in bands)
        {
            if (enrichedDataDictionary.TryGetValue(band.Name, out var enrichedData))
            {
                band.Listeners = enrichedData.Listeners;
                band.PlayCount = enrichedData.PlayCount;

                if (string.IsNullOrEmpty(band.ImageUrl))
                {
                    band.ImageUrl = enrichedData.ImageUrl;
                }

                if (band.Genres.Count == 0)
                {
                    band.Genres = enrichedData.Genres;
                }
                else if (enrichedData.Genres.Count > 0)
                {
                    band.Genres.AddRange(enrichedData.Genres.Except(band.Genres, StringComparer.OrdinalIgnoreCase));
                }

                band.SimilarArtists = enrichedData.SimilarArtists;
            }
        }

        return bands;
    }

    public async Task<BandModel?> GetCachedBandDataAsync(string bandName)
    {
        string cacheKey = $"band:{bandName}";

        if (!_cachingService.TryGetCachedItem(cacheKey, out BandModel? bandData))
        {
            bandData = await _apiThrottler.ThrottledApiCall(() => _lastFmClient.GetBandDataAsync(bandName));
            _cachingService.CacheItem(cacheKey, bandData, TimeSpan.FromHours(24));
        }

        return bandData;
    }

    async Task<Dictionary<string, List<BandModel>>> IDataEnrichmentService.GetSimilarBandsForMultipleArtistsAsync(
        List<string> artistNames, int maxSimilarPerArtist, HashSet<string>? processedBandNames,
        bool isRegisteredBandSimilar)
    {
        var result = new Dictionary<string, List<BandModel>>(StringComparer.OrdinalIgnoreCase);
        using var semaphore = new SemaphoreSlim(3);
        var tasks = new List<Task>();

        foreach (var artistName in artistNames)
        {
            tasks.Add(Task.Run(async () =>
            {
                await semaphore.WaitAsync();
                try
                {
                    string cacheKey = $"similar-bands:{artistName}:{maxSimilarPerArtist}";

                    if (!_cachingService.TryGetCachedItem(cacheKey, out List<string>? similarArtistNames))
                    {
                        similarArtistNames = await _lastFmClient.GetSimilarBandsAsync(artistName, maxSimilarPerArtist);
                        _cachingService.CacheItem(cacheKey, similarArtistNames, TimeSpan.FromHours(12));
                    }

                    var bandModels = new List<BandModel>();

                    foreach (var similarArtistName in similarArtistNames ?? Enumerable.Empty<string>())
                    {
                        if (processedBandNames?.Contains(similarArtistName) == true)
                        {
                            continue;
                        }

                        try
                        {
                            var band = await GetCachedBandDataAsync(similarArtistName);

                            if (band == null)
                            {
                                continue;
                            }

                            if (isRegisteredBandSimilar)
                            {
                                band.SimilarToRegisteredBand = artistName;
                            }
                            else
                            {
                                band.SimilarToArtistName = artistName;
                            }

                            bandModels.Add(band);

                            processedBandNames?.Add(similarArtistName);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogWarning(ex, "Failed to get data for similar band {BandName}", similarArtistName);
                        }
                    }

                    lock (result)
                    {
                        result[artistName] = bandModels;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error finding similar bands for {ArtistName}", artistName);
                }
                finally
                {
                    semaphore.Release();
                }
            }));
        }

        await Task.WhenAll(tasks);
        return result;
    }
}
