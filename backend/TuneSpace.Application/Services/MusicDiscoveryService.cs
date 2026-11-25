using System.Collections.Concurrent;
using System.Text.RegularExpressions;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using TuneSpace.Core.Common;
using TuneSpace.Core.DTOs.Responses.Spotify;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Core.Models;

namespace TuneSpace.Application.Services;

/// <summary>
/// Music Discovery Service - Provides intelligent music recommendations using multiple algorithms
///
/// Architecture Overview:
/// 1. User Data Collection - Gathers Spotify listening history and preferences
/// 2. Genre Analysis - Analyzes and enriches genres based on listening patterns
/// 3. Recommendation Sources - Fetches recommendations from various sources in parallel:
///    - Local bands (MusicBrainz + Bandcamp)
///    - Registered bands (internal database)
///    - Underground/new release artists (Spotify search)
///    - AI recommendations (Enhanced AI or RAG)
///    - Collaborative filtering (user similarity)
/// 4. Data Processing - Enriches raw data and generates similar artist recommendations
/// 5. Scoring &amp; Ranking - Applies adaptive scoring algorithms with confidence boosting
/// 6. Final Processing - Applies diversity algorithms, deduplication, and cooldown management
/// </summary>
internal class MusicDiscoveryService(
    ISpotifyService spotifyService,
    IArtistDiscoveryService artistDiscoveryService,
    IDataEnrichmentService dataEnrichmentService,
    IRecommendationScoringService scoringService,
    ICollaborativeFilteringService collaborativeFilteringService,
    IServiceProvider serviceProvider,
    ILogger<MusicDiscoveryService> logger) : IMusicDiscoveryService
{
    private static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, DateTime>> UserRecommendationHistory = new();
    private readonly ISpotifyService _spotifyService = spotifyService;
    private readonly IArtistDiscoveryService _artistDiscoveryService = artistDiscoveryService;
    private readonly IDataEnrichmentService _dataEnrichmentService = dataEnrichmentService;
    private readonly IRecommendationScoringService _scoringService = scoringService;
    private readonly ICollaborativeFilteringService _collaborativeFilteringService = collaborativeFilteringService;
    private readonly IServiceProvider _serviceProvider = serviceProvider;
    private readonly ILogger<MusicDiscoveryService> _logger = logger;

    async Task<List<BandModel>> IMusicDiscoveryService.GetBandRecommendationsAsync(string? spotifyAccessToken, string userId, List<string> genres, string location)
    {
        return await GetBandRecommendationsInternalAsync(spotifyAccessToken, userId, genres, location, useEnhancedAI: false);
    }

    async Task<List<BandModel>> IMusicDiscoveryService.GetEnhancedBandRecommendationsAsync(string? spotifyAccessToken, string userId, List<string> genres, string location)
    {
        return await GetBandRecommendationsInternalAsync(spotifyAccessToken, userId, genres, location, useEnhancedAI: true);
    }

    /// <summary>
    /// Main recommendation engine - orchestrates the entire recommendation process
    ///
    /// Flow:
    /// 1. Collect user's Spotify data (recently played, followed artists, top artists)
    /// 2. Analyze and enrich genres based on listening history
    /// 3. Gather recommendations from all sources concurrently
    /// 4. Process and enrich raw recommendations with additional metadata
    /// 5. Apply adaptive scoring algorithms with confidence boosting
    /// 6. Apply final processing (diversity, deduplication, cooldown management)
    /// </summary>
    private async Task<List<BandModel>> GetBandRecommendationsInternalAsync(string? spotifyAccessToken, string userId, List<string> genres, string location, bool useEnhancedAI)
    {
        var userData = await CollectUserDataAsync(spotifyAccessToken);

        var enrichedGenres = await AnalyzeAndEnrichGenresAsync(spotifyAccessToken, userData, genres);

        var recommendationSources = await GatherRecommendationSourcesAsync(
            spotifyAccessToken, userId, enrichedGenres, location, useEnhancedAI, userData
        );

        var processedRecommendations = await ProcessAndEnrichRecommendationsAsync(
            recommendationSources, userData.TopArtists
        );

        var scoredRecommendations = await ScoreAndRankRecommendationsAsync(
            processedRecommendations, enrichedGenres, userId, location, userData.TopArtists, useEnhancedAI
        );

        var finalRecommendations = await ApplyFinalProcessingAsync(scoredRecommendations, userId);

        return finalRecommendations;
    }

    private static int ExtractUserCountFromDescription(string description)
    {
        if (string.IsNullOrEmpty(description))
        {
            return 0;
        }

        var match = Regex.Match(description, @"(\d+)\s+similar\s+users");
        return match.Success && int.TryParse(match.Groups[1].Value, out var count) ? count : 0;
    }

    /// <summary>
    /// Scores bands using adaptive weights if available, falls back to regular scoring
    /// </summary>
    private async Task<List<BandModel>> ScoreBandsAdaptivelyAsync(
        List<BandModel> bands,
        List<string> genres,
        string userId,
        string location,
        List<SpotifyArtistDTO> topArtists,
        bool isRegistered,
        bool isFromSearch = false)
    {
        try
        {
            var adaptiveScoringService = _serviceProvider.GetService<IAdaptiveRecommendationScoringService>();

            if (adaptiveScoringService != null)
            {
                return await adaptiveScoringService.ScoreBandsWithAdaptiveWeightsAsync(bands, genres, userId, location, topArtists, isRegistered, isFromSearch);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Adaptive scoring failed for user");
        }

        return _scoringService.ScoreBands(bands, genres, location, topArtists, isRegistered, isFromSearch);
    }

    public async Task TrackRecommendationInteractionAsync(string userId, string artistName, string interactionType, List<string> genres, double rating = 0.0)
    {
        try
        {
            var adaptiveLearningService = _serviceProvider.GetService<IAdaptiveLearningService>();

            if (adaptiveLearningService != null)
            {
                var feedback = new RecommendationFeedback
                {
                    UserId = Guid.Parse(userId),
                    BandName = artistName,
                    FeedbackType = ConvertInteractionTypeToFeedbackType(interactionType),
                    ExplicitRating = rating,
                    FeedbackAt = DateTime.UtcNow,
                    RecommendedAt = DateTime.UtcNow,
                    RecommendedGenres = genres
                };

                await adaptiveLearningService.ProcessRecommendationFeedbackAsync(feedback);

                _logger.LogInformation("Tracked recommendation interaction");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to track recommendation interaction");
        }
    }

    public async Task TrackBatchRecommendationInteractionsAsync(string userId, List<(string artistName, string interactionType, double rating, List<string> genres)> interactions)
    {
        try
        {
            var adaptiveLearningService = _serviceProvider.GetService<IAdaptiveLearningService>();

            if (adaptiveLearningService != null)
            {
                foreach (var (artistName, interactionType, rating, genres) in interactions)
                {
                    var feedback = new RecommendationFeedback
                    {
                        UserId = Guid.Parse(userId),
                        BandName = artistName,
                        FeedbackType = ConvertInteractionTypeToFeedbackType(interactionType),
                        ExplicitRating = rating,
                        RecommendedGenres = genres,
                        FeedbackAt = DateTime.UtcNow,
                        RecommendedAt = DateTime.UtcNow
                    };

                    await adaptiveLearningService.ProcessRecommendationFeedbackAsync(feedback);
                }

                _logger.LogInformation("Tracked batch recommendation interactions");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to track batch recommendation interactions");
        }
    }

    private static FeedbackType ConvertInteractionTypeToFeedbackType(string interactionType)
    {
        return interactionType?.ToLowerInvariant() switch
        {
            "like" or "thumbs_up" or "positive" => FeedbackType.Positive,
            "dislike" or "thumbs_down" or "negative" => FeedbackType.Negative,
            "rating" or "explicit" => FeedbackType.Explicit,
            "mixed" => FeedbackType.Mixed,
            _ => FeedbackType.None
        };
    }

    // Helper classes for organizing data
    private record UserData(
        List<RecentlyPlayedTrackDTO> RecentlyPlayedTracks,
        List<SpotifyArtistDTO> FollowedArtists,
        List<SpotifyArtistDTO> TopArtists,
        HashSet<string> KnownArtistNames);

    private record RecommendationSources(
        List<BandModel> LocalBands,
        List<BandModel> RegisteredBands,
        List<BandModel> UndergroundArtists,
        List<BandModel> NewReleaseArtists,
        (List<BandModel> Recommendations, double Confidence, string PromptUsed) AIResult,
        List<BandModel> CollaborativeRecommendations);

    private record ProcessedRecommendations(
        List<BandModel> LocalBands,
        List<BandModel> RegisteredBands,
        List<BandModel> UndergroundArtists,
        List<BandModel> SimilarBands,
        (List<BandModel> Recommendations, double Confidence, string PromptUsed) AIResult,
        List<BandModel> CollaborativeRecommendations);

    /// <summary>
    /// Step 1: Collect user data from Spotify or use mock data for manual preferences
    /// </summary>
    private async Task<UserData> CollectUserDataAsync(string? spotifyAccessToken)
    {
        if (string.IsNullOrEmpty(spotifyAccessToken))
        {
            return new UserData(
                RecentlyPlayedTracks: [],
                FollowedArtists: [],
                TopArtists: [],
                KnownArtistNames: []
            );
        }

        try
        {
            var recentlyPlayedTracksTask = _spotifyService.GetUserRecentlyPlayedTracksAsync(spotifyAccessToken);
            var followedArtistsTask = _spotifyService.GetUserFollowedArtistsAsync(spotifyAccessToken);
            var topArtistsTask = _spotifyService.GetUserTopArtistsAsync(spotifyAccessToken);

            await Task.WhenAll(recentlyPlayedTracksTask, followedArtistsTask, topArtistsTask);

            var recentlyPlayedTracks = await recentlyPlayedTracksTask;
            var followedArtists = await followedArtistsTask;
            var topArtists = await topArtistsTask;

            var knownArtistNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            foreach (var artist in followedArtists)
            {
                knownArtistNames.Add(artist.Name);
            }

            foreach (var artist in topArtists)
            {
                knownArtistNames.Add(artist.Name);
            }

            return new UserData(recentlyPlayedTracks, followedArtists, topArtists, knownArtistNames);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to collect Spotify user data, using mock data");
            return new UserData(
                RecentlyPlayedTracks: [],
                FollowedArtists: [],
                TopArtists: [],
                KnownArtistNames: []
            );
        }
    }

    /// <summary>
    /// Step 2: Analyze and enrich genres based on user's listening history or provided genres
    /// </summary>
    private async Task<List<string>> AnalyzeAndEnrichGenresAsync(string? spotifyAccessToken, UserData userData, List<string> baseGenres)
    {
        var followedArtistsGenres = userData.FollowedArtists
            .SelectMany(artist => artist.Genres ?? [])
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var recentlyPlayedArtistIds = userData.RecentlyPlayedTracks
            .Select(track => track.ArtistId)
            .Where(id => !string.IsNullOrEmpty(id))
            .Distinct()
            .ToList();

        List<string>? recentlyPlayedGenres = null;

        if (!string.IsNullOrEmpty(spotifyAccessToken) && recentlyPlayedArtistIds.Count > 0)
        {
            try
            {
                var recentArtistsWithGenres = await _artistDiscoveryService.GetArtistDetailsInBatchesAsync(spotifyAccessToken, recentlyPlayedArtistIds);

                recentlyPlayedGenres = recentArtistsWithGenres?
                    .SelectMany(artist => artist.Genres ?? [])
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to get recently played genres, using provided genres only");
            }
        }

        var combinedGenres = new List<string>();
        combinedGenres.AddRange(baseGenres);
        combinedGenres.AddRange(followedArtistsGenres);

        if (recentlyPlayedGenres != null)
        {
            combinedGenres.AddRange(recentlyPlayedGenres);
        }

        return [.. combinedGenres
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Take(20)];
    }

    /// <summary>
    /// Step 3: Gather recommendations from all sources in parallel
    /// </summary>
    private async Task<RecommendationSources> GatherRecommendationSourcesAsync(string? spotifyAccessToken, string userId, List<string> genres, string location, bool useEnhancedAI, UserData userData)
    {
        // Check if user has low recommendation history and needs more variety
        var userHistory = UserRecommendationHistory.GetOrAdd(userId, _ => new ConcurrentDictionary<string, DateTime>());
        var recentRecommendationsCount = userHistory.Count(kvp => (DateTime.UtcNow - kvp.Value).TotalDays <= 7);
        var needMoreVariety = recentRecommendationsCount > (MusicDiscoveryConstants.MaxRecommendations * 2);

        // Increase limits if we need more variety
        var localBandsLimit = needMoreVariety ? 30 : 20;
        var undergroundLimit = needMoreVariety ? 30 : MusicDiscoveryConstants.UndergroundArtistsToFetch;
        var aiLimit = needMoreVariety ? 25 : 15;
        var collaborativeLimit = needMoreVariety ? 30 : 20;

        var localBandsTask = GetLocalBandsAsync(location, genres);
        var registeredBandsTask = GetRegisteredBandsAsync(genres, location);
        var aiRecommendationsTask = GetAIRecommendationsAsync(spotifyAccessToken, userId, userData.TopArtists, genres, location, useEnhancedAI);

        Task<List<BandModel>> undergroundArtistsTask;
        Task<List<BandModel>> hipsterAndNewReleasesTask;
        Task<List<BandModel>> collaborativeRecommendationsTask;
        Task<List<BandModel>> additionalGenreVariationsTask;

        if (!string.IsNullOrEmpty(spotifyAccessToken))
        {
            undergroundArtistsTask = _artistDiscoveryService.FindArtistsByQueryAsync(spotifyAccessToken, genres, "{genre}", undergroundLimit);
            hipsterAndNewReleasesTask = _artistDiscoveryService.FindHipsterAndNewArtistsAsync(spotifyAccessToken, genres, undergroundLimit);
            collaborativeRecommendationsTask = GetCollaborativeRecommendationsAsync(userId, spotifyAccessToken);

            additionalGenreVariationsTask = GetAdditionalVarietyAsync(spotifyAccessToken, genres, needMoreVariety ? 20 : 10);
        }
        else
        {
            undergroundArtistsTask = Task.FromResult(new List<BandModel>());
            hipsterAndNewReleasesTask = Task.FromResult(new List<BandModel>());
            collaborativeRecommendationsTask = Task.FromResult(new List<BandModel>());
            additionalGenreVariationsTask = Task.FromResult(new List<BandModel>());
        }

        await Task.WhenAll(
            localBandsTask,
            registeredBandsTask,
            undergroundArtistsTask,
            hipsterAndNewReleasesTask,
            aiRecommendationsTask,
            collaborativeRecommendationsTask,
            additionalGenreVariationsTask
        );

        var localBands = await localBandsTask;
        var registeredBands = await registeredBandsTask;
        var undergroundArtists = await undergroundArtistsTask;
        var newReleaseArtists = await hipsterAndNewReleasesTask;
        var aiResult = await aiRecommendationsTask;
        var collaborativeRecommendations = await collaborativeRecommendationsTask;
        var additionalVariations = await additionalGenreVariationsTask;

        var allUndergroundArtists = new List<BandModel>();
        allUndergroundArtists.AddRange(undergroundArtists);
        allUndergroundArtists.AddRange(newReleaseArtists);
        allUndergroundArtists.AddRange(additionalVariations);

        var deduplicatedUndergroundArtists = allUndergroundArtists
            .GroupBy(b => b.Name, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.First())
            .ToList();

        return new RecommendationSources(localBands, registeredBands, deduplicatedUndergroundArtists, [], aiResult, collaborativeRecommendations);
    }

    /// <summary>
    /// Helper method to get local bands from both MusicBrainz and Bandcamp
    /// </summary>
    private async Task<List<BandModel>> GetLocalBandsAsync(string location, List<string> genres)
    {
        return await Task.Run(async () =>
        {
            using var scope = _serviceProvider.CreateScope();
            var musicBrainzClient = scope.ServiceProvider.GetRequiredService<IMusicBrainzClient>();
            var bandcampClient = scope.ServiceProvider.GetRequiredService<IBandcampClient>();

            var musicBrainzTask = musicBrainzClient.GetBandsByLocationAsync(location, 15, genres);
            var bandcampTask = GetBandcampArtistsByLocationAsync(bandcampClient, location, genres, 10);

            await Task.WhenAll(musicBrainzTask, bandcampTask);

            var musicBrainzBands = await musicBrainzTask;
            var bandcampBands = await bandcampTask;

            var allBands = new List<BandModel>();
            allBands.AddRange(musicBrainzBands);
            allBands.AddRange(bandcampBands);

            return allBands
                .GroupBy(b => b.Name, StringComparer.OrdinalIgnoreCase)
                .Select(g => g.First())
                .Take(20)
                .ToList();
        });
    }

    /// <summary>
    /// Helper method to get registered bands
    /// </summary>
    private async Task<List<BandModel>> GetRegisteredBandsAsync(List<string> genres, string location)
    {
        return await Task.Run(async () =>
        {
            using var scope = _serviceProvider.CreateScope();
            var artistDiscoveryService = scope.ServiceProvider.GetRequiredService<IArtistDiscoveryService>();
            return await artistDiscoveryService.GetRegisteredBandsAsModelsAsync(genres, location);
        });
    }

    /// <summary>
    /// Helper method to get AI recommendations
    /// </summary>
    private async Task<(List<BandModel>, double, string)> GetAIRecommendationsAsync(string? spotifyAccessToken, string userId, List<SpotifyArtistDTO> topArtists, List<string> genres, string location, bool useEnhancedAI)
    {
        return await Task.Run(async () =>
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var aiRecommendationService = scope.ServiceProvider.GetRequiredService<IAIRecommendationService>();
                var topArtistNames = topArtists.Take(10).Select(a => a.Name).ToList();

                var effectiveSpotifyToken = spotifyAccessToken ?? "no_spotify_access";

                if (useEnhancedAI)
                {
                    var enhancedResult = await aiRecommendationService.GetEnhancedRecommendationsWithConfidenceAsync(effectiveSpotifyToken, userId, topArtistNames, genres, location, 15);

                    var bandModels = enhancedResult.Recommendations.Select(rec => new BandModel
                    {
                        Id = "",
                        Name = rec.ArtistName,
                        RelevanceScore = rec.ConfidenceScore,
                        DataSource = $"Enhanced AI (Confidence: {rec.ConfidenceScore:F2})" +
                                   (string.IsNullOrEmpty(spotifyAccessToken) ? " - Manual Preferences" : ""),
                        Description = rec.Reasoning,
                        Genres = rec.MatchingGenres,
                        ExternalUrl = rec.ExternalUrl,
                        ExternalUrls = new Dictionary<string, string>
                        {
                            { "spotify", $"https://open.spotify.com/search/{Uri.EscapeDataString(rec.ArtistName)}" }
                        },
                        SimilarToArtistName = rec.Reasoning
                    }).ToList();

                    return (bandModels, enhancedResult.OverallConfidence, enhancedResult.PromptUsed);
                }
                else
                {
                    var ragRecs = await aiRecommendationService.GetRAGEnhancedRecommendationsAsync(effectiveSpotifyToken, userId, topArtistNames, genres, location, 15);

                    if (string.IsNullOrEmpty(spotifyAccessToken))
                    {
                        foreach (var band in ragRecs)
                        {
                            band.DataSource = (band.DataSource ?? "RAG Enhanced") + " - Manual Preferences";
                        }
                    }

                    return (ragRecs, 0.7, "RAG Enhanced Recommendations");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "AI recommendation service failed");

                try
                {
                    using var scope = _serviceProvider.CreateScope();
                    var aiRecommendationService = scope.ServiceProvider.GetRequiredService<IAIRecommendationService>();
                    var topArtistNames = topArtists.Take(10).Select(a => a.Name).ToList();
                    var effectiveSpotifyToken = spotifyAccessToken ?? "no_spotify_access";

                    var fallbackRecs = await aiRecommendationService.GetRAGEnhancedRecommendationsAsync(effectiveSpotifyToken, userId, topArtistNames, genres, location, 15);

                    if (string.IsNullOrEmpty(spotifyAccessToken))
                    {
                        foreach (var band in fallbackRecs)
                        {
                            band.DataSource = (band.DataSource ?? "Fallback RAG") + " - Manual Preferences";
                        }
                    }

                    return (fallbackRecs, 0.5, "Fallback recommendations due to AI service unavailability");
                }
                catch (Exception fallbackEx)
                {
                    _logger.LogError(fallbackEx, "Fallback AI recommendation service also failed");

                    return ([], 0.0, "AI recommendations unavailable");
                }
            }
        });
    }

    /// <summary>
    /// Helper method to get collaborative filtering recommendations
    /// </summary>
    private async Task<List<BandModel>> GetCollaborativeRecommendationsAsync(string userId, string? spotifyAccessToken)
    {
        return await Task.Run(async () =>
        {
            try
            {
                if (!string.IsNullOrEmpty(spotifyAccessToken))
                {
                    await _collaborativeFilteringService.UpdateUserListeningBehaviorAsync(userId, spotifyAccessToken);
                    var collabRecs = await _collaborativeFilteringService.GetCollaborativeRecommendationsAsync(userId, 20);

                    return collabRecs.Select(rec => new BandModel
                    {
                        Id = rec.ArtistId,
                        Name = rec.ArtistName,
                        RelevanceScore = Math.Min(1.0, rec.Score),
                        DataSource = "Collaborative Filtering",
                        Description = rec.ReasoningExplanation,
                        Genres = rec.CommonGenres,
                        ExternalUrls = new Dictionary<string, string>
                        {
                            { "spotify", $"https://open.spotify.com/artist/{rec.ArtistId}" }
                        },
                        SimilarToArtistName = rec.RecommendedBySimilarUsers.Count > 0 ?
                            $"Recommended by {rec.RecommendedBySimilarUsers.Count} similar users" : ""
                    }).ToList();
                }

                return [];
            }
            catch
            {
                return [];
            }
        });
    }

    /// <summary>
    /// Step 4: Process and enrich the raw recommendations
    /// </summary>
    private async Task<ProcessedRecommendations> ProcessAndEnrichRecommendationsAsync(RecommendationSources sources, List<SpotifyArtistDTO> topArtists)
    {
        var enrichedLocalBands = await _dataEnrichmentService.EnrichMultipleBandsAsync(sources.LocalBands);
        var enrichedUndergroundArtists = await _dataEnrichmentService.EnrichMultipleBandsAsync(sources.UndergroundArtists);

        var similarBands = await GenerateSimilarBandsAsync(topArtists, sources.RegisteredBands, sources, enrichedLocalBands, enrichedUndergroundArtists);

        return new ProcessedRecommendations(
            enrichedLocalBands,
            sources.RegisteredBands,
            enrichedUndergroundArtists,
            similarBands,
            sources.AIResult,
            sources.CollaborativeRecommendations);
    }

    /// <summary>
    /// Helper method to generate similar bands
    /// </summary>
    private async Task<List<BandModel>> GenerateSimilarBandsAsync(
        List<SpotifyArtistDTO> topArtists,
        List<BandModel> registeredBands,
        RecommendationSources sources,
        List<BandModel> enrichedLocalBands,
        List<BandModel> enrichedUndergroundArtists)
    {
        var similarBands = new List<BandModel>();
        var processedBandNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        enrichedLocalBands.ForEach(b => processedBandNames.Add(b.Name));
        registeredBands.ForEach(b => processedBandNames.Add(b.Name));
        enrichedUndergroundArtists.ForEach(b => processedBandNames.Add(b.Name));
        sources.CollaborativeRecommendations.ForEach(b => processedBandNames.Add(b.Name));
        sources.AIResult.Recommendations.ForEach(b => processedBandNames.Add(b.Name));

        var selectedArtists = topArtists.Take(5).Select(a => a.Name).ToList();
        var similarBandsDict = await _dataEnrichmentService.GetSimilarBandsForMultipleArtistsAsync(selectedArtists, 7, processedBandNames);

        foreach (var kvp in similarBandsDict)
        {
            foreach (var band in kvp.Value)
            {
                band.SimilarToArtistName = kvp.Key;
                similarBands.Add(band);
                processedBandNames.Add(band.Name);
            }
        }

        var selectedRegisteredBands = registeredBands.Take(5).Select(b => b.Name).ToList();
        var similarToRegisteredDict = await _dataEnrichmentService.GetSimilarBandsForMultipleArtistsAsync(
            selectedRegisteredBands, 3, processedBandNames, isRegisteredBandSimilar: true);

        foreach (var kvp in similarToRegisteredDict)
        {
            foreach (var band in kvp.Value)
            {
                band.SimilarToRegisteredBand = kvp.Key;
                similarBands.Add(band);
            }
        }

        return similarBands;
    }

    /// <summary>
    /// Step 5: Score and rank all recommendations
    /// </summary>
    private async Task<List<BandModel>> ScoreAndRankRecommendationsAsync(
        ProcessedRecommendations processed, List<string> genres, string userId, string location,
        List<SpotifyArtistDTO> topArtists, bool useEnhancedAI)
    {
        var recommendedBands = new List<BandModel>();
        var seenBandNames = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        var localScoredBands = await ScoreBandsAdaptivelyAsync(processed.LocalBands, genres, userId, location, topArtists, isRegistered: false);
        var similarScoredBands = await ScoreBandsAdaptivelyAsync(processed.SimilarBands, genres, userId, location, topArtists, isRegistered: false);
        var undergroundScoredBands = await ScoreBandsAdaptivelyAsync(processed.UndergroundArtists, genres, userId, location, topArtists, isRegistered: false, isFromSearch: true);
        var registeredScoredBands = await ScoreBandsAdaptivelyAsync(processed.RegisteredBands, genres, userId, location, topArtists, isRegistered: true);

        AddUniqueRecommendations(recommendedBands, seenBandNames, localScoredBands);
        AddUniqueRecommendations(recommendedBands, seenBandNames, similarScoredBands);
        AddUniqueRecommendations(recommendedBands, seenBandNames, undergroundScoredBands);
        AddUniqueRecommendations(recommendedBands, seenBandNames, registeredScoredBands);

        var aiScoredBands = await ApplyAIScoringAsync(processed.AIResult, genres, userId, location, topArtists, useEnhancedAI);
        AddUniqueRecommendations(recommendedBands, seenBandNames, aiScoredBands);

        var collaborativeScoredBands = ApplyCollaborativeScoring(processed.CollaborativeRecommendations, genres, location, topArtists);
        AddUniqueRecommendations(recommendedBands, seenBandNames, collaborativeScoredBands);

        return recommendedBands;
    }

    /// <summary>
    /// Helper method to add unique recommendations, avoiding duplicates by name
    /// </summary>
    private static void AddUniqueRecommendations(List<BandModel> recommendedBands, HashSet<string> seenBandNames, List<BandModel> newBands)
    {
        foreach (var band in newBands)
        {
            if (!seenBandNames.Contains(band.Name))
            {
                seenBandNames.Add(band.Name);
                recommendedBands.Add(band);
            }
            else
            {
                var existingBand = recommendedBands.FirstOrDefault(b => string.Equals(b.Name, band.Name, StringComparison.OrdinalIgnoreCase));
                if (existingBand != null && band.RelevanceScore > existingBand.RelevanceScore)
                {
                    existingBand.RelevanceScore = band.RelevanceScore;

                    if (!existingBand.DataSource?.Contains(band.DataSource ?? "") == true)
                    {
                        existingBand.DataSource = $"{existingBand.DataSource}, {band.DataSource}";
                    }

                    if (string.IsNullOrEmpty(existingBand.Description) && !string.IsNullOrEmpty(band.Description))
                    {
                        existingBand.Description = band.Description;
                    }
                }
            }
        }
    }

    /// <summary>
    /// Apply specialized scoring for AI recommendations
    /// </summary>
    private async Task<List<BandModel>> ApplyAIScoringAsync(
        (List<BandModel> Recommendations, double Confidence, string PromptUsed) aiResult,
        List<string> genres, string userId, string location, List<SpotifyArtistDTO> topArtists, bool useEnhancedAI)
    {
        var aiScoredBands = await ScoreBandsAdaptivelyAsync(aiResult.Recommendations, genres, userId, location, topArtists, isRegistered: false, isFromSearch: true);

        foreach (var band in aiScoredBands)
        {
            if (useEnhancedAI)
            {
                band.RelevanceScore += 0.5;
                band.DataSource = $"Enhanced AI + Adaptive Learning (Confidence: {aiResult.Confidence:F2})";
            }
            else
            {
                band.RelevanceScore += 0.3;
                band.DataSource = $"RAG AI (Confidence: {aiResult.Confidence:F2})";
            }

            if (!string.IsNullOrEmpty(location) &&
                band.Location?.Contains(location, StringComparison.OrdinalIgnoreCase) == true)
            {
                band.RelevanceScore += 0.2;
            }

            var genreOverlap = band.Genres.Intersect(genres, StringComparer.OrdinalIgnoreCase).Count();
            if (genreOverlap > 0 && genreOverlap < genres.Count)
            {
                band.RelevanceScore += 0.1;
            }

            band.RelevanceScore += aiResult.Confidence * 0.2;
        }

        return aiScoredBands;
    }

    /// <summary>
    /// Apply specialized scoring for collaborative filtering recommendations
    /// </summary>
    private List<BandModel> ApplyCollaborativeScoring(
        List<BandModel> collaborativeRecommendations, List<string> genres, string location, List<SpotifyArtistDTO> topArtists)
    {
        var collaborativeScoredBands = _scoringService.ScoreBands(collaborativeRecommendations, genres, location, topArtists, isRegistered: false, isFromSearch: false);

        foreach (var band in collaborativeScoredBands)
        {
            band.RelevanceScore += 0.35;
            band.DataSource = "Collaborative Filtering";

            if (band.SimilarToArtistName?.Contains("users") == true)
            {
                var userCount = ExtractUserCountFromDescription(band.SimilarToArtistName);
                if (userCount >= 3)
                {
                    band.RelevanceScore += 0.15;
                }
            }

            if (!string.IsNullOrEmpty(location) &&
                band.Location?.Contains(location, StringComparison.OrdinalIgnoreCase) == true)
            {
                band.RelevanceScore += 0.1;
            }
        }

        return collaborativeScoredBands;
    }

    /// <summary>
    /// Step 6: Apply final processing (diversity, deduplication, cooldown)
    /// </summary>
    private Task<List<BandModel>> ApplyFinalProcessingAsync(List<BandModel> scoredRecommendations, string userId)
    {
        var deduplicatedRecommendations = scoredRecommendations
            .GroupBy(b => b.Name, StringComparer.OrdinalIgnoreCase)
            .Select(g => g.OrderByDescending(b => b.RelevanceScore).First())
            .ToList();

        var userHistory = UserRecommendationHistory.GetOrAdd(userId, _ => new ConcurrentDictionary<string, DateTime>());

        var now = DateTime.UtcNow;

        var keysToRemove = userHistory
            .Where(kvp => (now - kvp.Value).TotalDays > 7)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in keysToRemove)
        {
            userHistory.TryRemove(key, out _);
        }

        var globalHistory = new ConcurrentDictionary<string, DateTime>();
        foreach (var entry in userHistory)
        {
            globalHistory[entry.Key] = entry.Value;
        }

        var diverseRecommendations = _scoringService.ApplyDiversityAndExploration(deduplicatedRecommendations, globalHistory);

        diverseRecommendations = ApplyRotationStrategy(diverseRecommendations, userId);

        if (diverseRecommendations.Count < MusicDiscoveryConstants.MaxRecommendations / 2)
        {
            var lenientKeysToRemove = userHistory
                .Where(kvp => (now - kvp.Value).TotalDays > 3)
                .Select(kvp => kvp.Key)
                .ToList();

            foreach (var key in lenientKeysToRemove)
            {
                userHistory.TryRemove(key, out _);
            }

            globalHistory.Clear();
            foreach (var entry in userHistory)
            {
                globalHistory[entry.Key] = entry.Value;
            }

            diverseRecommendations = _scoringService.ApplyDiversityAndExploration(deduplicatedRecommendations, globalHistory);

            diverseRecommendations = ApplyRotationStrategy(diverseRecommendations, userId);
        }

        if (diverseRecommendations.Count < MusicDiscoveryConstants.MaxRecommendations / 3)
        {
            var allRecommendations = _scoringService.ApplyDiversityAndExploration(deduplicatedRecommendations, new ConcurrentDictionary<string, DateTime>());
            diverseRecommendations = [.. allRecommendations.Take(MusicDiscoveryConstants.MaxRecommendations)];
        }

        foreach (var band in diverseRecommendations)
        {
            userHistory[band.Name] = now;
        }

        CleanupOldUserHistories();

        return Task.FromResult(diverseRecommendations);
    }

    /// <summary>
    /// Clean up old user histories to prevent memory leaks
    /// </summary>
    private static void CleanupOldUserHistories()
    {
        var now = DateTime.UtcNow;
        var usersToCleanup = new List<string>();

        foreach (var userEntry in UserRecommendationHistory)
        {
            if (userEntry.Value.All(historyEntry => (now - historyEntry.Value).TotalDays > 30))
            {
                usersToCleanup.Add(userEntry.Key);
            }
        }

        foreach (var userId in usersToCleanup)
        {
            UserRecommendationHistory.TryRemove(userId, out _);
        }
    }

    /// <summary>
    /// Helper method to get Bandcamp artists by location and convert them to BandModel
    /// </summary>
    private async Task<List<BandModel>> GetBandcampArtistsByLocationAsync(IBandcampClient bandcampClient, string location, List<string> genres, int limit)
    {
        try
        {
            var bandcampArtists = await bandcampClient.DiscoverArtistsByGenresAndLocationAsync(genres, location, "new", limit);

            if (bandcampArtists.Count < limit)
            {
                var locationOnlyArtists = await bandcampClient.DiscoverArtistsByLocationAsync(location, limit - bandcampArtists.Count);
                bandcampArtists.AddRange(locationOnlyArtists);
            }

            return [.. bandcampArtists.Select(ConvertBandcampToBandModel)];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get Bandcamp artists by location");
            return [];
        }
    }

    /// <summary>
    /// Convert BandcampArtistModel to BandModel
    /// </summary>
    private static BandModel ConvertBandcampToBandModel(BandcampArtistModel bandcampArtist)
    {
        return new BandModel
        {
            Name = bandcampArtist.Name,
            Genres = bandcampArtist.Genres,
            Location = bandcampArtist.Location ?? "",
            Description = bandcampArtist.Description ?? "",
            ImageUrl = bandcampArtist.ImageUrl ?? "",
            ExternalUrl = bandcampArtist.BandcampUrl,
            ExternalUrls = new Dictionary<string, string> { { "bandcamp", bandcampArtist.BandcampUrl } },
            Followers = bandcampArtist.Followers ?? 0,
            DataSource = "Bandcamp",
            RelevanceScore = 0.0
        };
    }

    /// <summary>
    /// Get additional recommendations when user needs more variety
    /// Uses broader search terms and related genres
    /// </summary>
    private async Task<List<BandModel>> GetAdditionalVarietyAsync(string spotifyAccessToken, List<string> baseGenres, int limit)
    {
        try
        {
            var additionalRecommendations = new List<BandModel>();

            var expandedGenres = new List<string>(baseGenres);

            foreach (var genre in baseGenres.Take(3))
            {
                if (genre.Contains("rock", StringComparison.OrdinalIgnoreCase))
                {
                    expandedGenres.AddRange(["alternative rock", "indie rock", "progressive rock"]);
                }
                else if (genre.Contains("metal", StringComparison.OrdinalIgnoreCase))
                {
                    expandedGenres.AddRange(["heavy metal", "thrash metal", "doom metal"]);
                }
                else if (genre.Contains("electronic", StringComparison.OrdinalIgnoreCase))
                {
                    expandedGenres.AddRange(["synthwave", "ambient", "experimental electronic"]);
                }
                else if (genre.Contains("pop", StringComparison.OrdinalIgnoreCase))
                {
                    expandedGenres.AddRange(["indie pop", "dream pop", "electropop"]);
                }
                else if (genre.Contains("jazz", StringComparison.OrdinalIgnoreCase))
                {
                    expandedGenres.AddRange(["fusion", "bebop", "contemporary jazz"]);
                }
            }

            var queryResults = await _artistDiscoveryService.FindArtistsByQueryAsync(spotifyAccessToken, [.. expandedGenres.Distinct().Take(5)], "{genre}", limit / 2);
            additionalRecommendations.AddRange(queryResults);

            return [.. additionalRecommendations.DistinctBy(b => b.Name).Take(limit)];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get additional variety recommendations");
            return [];
        }
    }

    /// <summary>
    /// Implements a rotation system to ensure variety over time
    /// </summary>
    private static List<BandModel> ApplyRotationStrategy(List<BandModel> recommendations, string userId)
    {
        var userHistory = UserRecommendationHistory.GetOrAdd(userId, _ => new ConcurrentDictionary<string, DateTime>());
        var now = DateTime.UtcNow;

        var groupedRecommendations = recommendations.GroupBy(r => r.DataSource ?? "Unknown").ToList();
        var rotatedRecommendations = new List<BandModel>();

        var maxPerSource = Math.Max(1, MusicDiscoveryConstants.MaxRecommendations / Math.Max(1, groupedRecommendations.Count));

        foreach (var group in groupedRecommendations)
        {
            var sortedGroup = group
                .OrderByDescending(r => r.RelevanceScore)
                .ThenBy(r => userHistory.TryGetValue(r.Name, out DateTime value) ? value : DateTime.MinValue)
                .Take(maxPerSource + 2)
                .ToList();

            rotatedRecommendations.AddRange(sortedGroup);
        }

        return [.. rotatedRecommendations
            .OrderByDescending(r => r.RelevanceScore)
            .Take(MusicDiscoveryConstants.MaxRecommendations)];
    }
}
