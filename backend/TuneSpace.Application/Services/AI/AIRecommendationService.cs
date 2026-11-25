using System.Diagnostics;
using System.Text.Json;
using System.Text.RegularExpressions;
using TuneSpace.Core.DTOs.Responses.Spotify;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Core.Models;

namespace TuneSpace.Application.Services.AI;

internal class AIRecommendationService(
    IOllamaClient ollamaClient,
    IVectorSearchService vectorSearchService,
    IBandcampClient bandcampClient,
    ISpotifyService spotifyService,
    IAdaptiveLearningService adaptiveLearningService,
    IEnhancedAIPromptService enhancedAIPromptService) : IAIRecommendationService
{
    private readonly IOllamaClient _ollamaClient = ollamaClient;
    private readonly IVectorSearchService _vectorSearchService = vectorSearchService;
    private readonly IBandcampClient _bandcampClient = bandcampClient;
    private readonly ISpotifyService _spotifyService = spotifyService;
    private readonly IAdaptiveLearningService _adaptiveLearningService = adaptiveLearningService;
    private readonly IEnhancedAIPromptService _enhancedAIPromptService = enhancedAIPromptService;

    async Task<EnhancedAIRecommendationResult> IAIRecommendationService.GetEnhancedRecommendationsWithConfidenceAsync(
        string spotifyAccessToken,
        string userId,
        List<string> topArtists,
        List<string> genres,
        string location,
        int limit)
    {
        var stopwatch = Stopwatch.StartNew();
        var result = new EnhancedAIRecommendationResult();
        bool usedFallback = false;

        try
        {
            var journeyContext = await ((IAIRecommendationService)this).BuildMusicalJourneyContextAsync(userId);

            var vectorResults = await _vectorSearchService.RecommendArtistsForUserAsync(userId, topArtists, genres, [], location, Math.Max(limit / 2, 5));

            var ragContext = await _vectorSearchService.GenerateRecommendationContextAsync(userId, topArtists, genres, location);

            var userBehaviorContext = await BuildUserBehaviorContextAsync(userId, journeyContext);

            var enhancedPrompt = _enhancedAIPromptService.BuildAdvancedContextAwarePrompt(topArtists, genres, location, vectorResults, ragContext, userBehaviorContext);

            result.PromptUsed = enhancedPrompt;
            result.ContextData = userBehaviorContext;

            var aiResponse = await _ollamaClient.PromptWithContext(enhancedPrompt);
            var aiRecommendations = ParseAIRecommendationsWithConfidence(aiResponse);

            var aiBands = await FetchAndScoreAISuggestedBandsAsync(aiRecommendations, userId, genres, spotifyAccessToken, journeyContext);

            var allCandidates = new List<BandModel>();
            allCandidates.AddRange(vectorResults);
            allCandidates.AddRange(aiBands);

            var rankedRecommendations = await RankRecommendationsWithAdaptiveWeightsAsync(allCandidates, topArtists, genres, location, journeyContext, limit);

            result.Recommendations = CreateConfidenceRecommendations(rankedRecommendations, aiRecommendations);

            result.OverallConfidence = result.Recommendations.Count > 0
                ? result.Recommendations.Average(r => r.ConfidenceScore)
                : 0.0;
        }
        catch (Exception)
        {
            usedFallback = true;
            result.Recommendations =
            [
                new AIRecommendationWithConfidence
                {
                    ArtistName = "Fallback Artist",
                    ConfidenceScore = 0.5,
                    Reasoning = "Fallback recommendation due to an error in AI processing.",
                    RecommendationSource = "Fallback"
                }
            ];
            result.OverallConfidence = 0.5;
        }

        stopwatch.Stop();
        result.ProcessingTime = stopwatch.Elapsed;
        result.UsedFallback = usedFallback;

        return result;
    }

    async Task<MusicalJourneyContext> IAIRecommendationService.BuildMusicalJourneyContextAsync(string userId)
    {
        try
        {
            var context = new MusicalJourneyContext();

            var genreEvolutions = await _adaptiveLearningService.GetUserGenreEvolutionAsync(userId);

            var scoringWeights = await _adaptiveLearningService.GetUserScoringWeightsAsync(userId);

            var genreTrends = await _adaptiveLearningService.GetGenreTrendsAsync(userId, 90);

            var explorationFactor = await _adaptiveLearningService.GetExplorationFactorAsync(userId);
            context.ExplorationFactor = explorationFactor;

            foreach (var evolution in genreEvolutions)
            {
                var lifecycleStage = await _adaptiveLearningService.DetermineGenreLifecycleStageAsync(userId, evolution.Genre);

                switch (lifecycleStage)
                {
                    case GenreLifecycleStage.Discovery:
                    case GenreLifecycleStage.Growth:
                        context.EmergingGenres.Add(evolution.Genre);
                        break;
                    case GenreLifecycleStage.Maturity:
                        context.MaturingGenres.Add(evolution.Genre);
                        break;
                }
            }

            context.GenreWeights = genreTrends.ToDictionary(
                kvp => kvp.Key,
                kvp => Math.Max(0.1, kvp.Value)
            );

            context.JourneyStage = explorationFactor switch
            {
                > 0.7 => "discovery",
                > 0.4 => "exploration",
                > 0.2 => "deepening",
                _ => "comfort"
            };

            context.DiscoveryReadinessScore = (int)(explorationFactor * 100);

            return context;
        }
        catch (Exception)
        {
            return new MusicalJourneyContext
            {
                JourneyStage = "exploration",
                ExplorationFactor = 0.5,
                DiscoveryReadinessScore = 50
            };
        }
    }

    private static Task<Dictionary<string, object>> BuildUserBehaviorContextAsync(string userId, MusicalJourneyContext journeyContext)
    {
        var context = new Dictionary<string, object>();

        try
        {
            context["user_id"] = userId;
            context["journey_stage"] = journeyContext.JourneyStage;
            context["exploration_factor"] = $"{journeyContext.ExplorationFactor:P1}";
            context["discovery_readiness"] = journeyContext.DiscoveryReadinessScore;

            if (journeyContext.EmergingGenres.Count > 0)
            {
                context["emerging_genres"] = string.Join(", ", journeyContext.EmergingGenres);
            }

            if (journeyContext.MaturingGenres.Count > 0)
            {
                context["maturing_genres"] = string.Join(", ", journeyContext.MaturingGenres);
            }

            var topGenreWeights = journeyContext.GenreWeights
                .OrderByDescending(w => w.Value)
                .Take(3)
                .Select(w => $"{w.Key} ({w.Value:F2})")
                .ToList();

            if (topGenreWeights.Count > 0)
            {
                context["top_genre_affinities"] = string.Join(", ", topGenreWeights);
            }

            return Task.FromResult(context);
        }
        catch
        {
            return Task.FromResult(new Dictionary<string, object>
            {
                ["journey_stage"] = "exploration",
                ["exploration_factor"] = "50%",
                ["discovery_readiness"] = 50
            });
        }
    }

    private static List<AIRecommendationWithConfidence> ParseAIRecommendationsWithConfidence(string aiResponse)
    {
        var recommendations = new List<AIRecommendationWithConfidence>();

        try
        {
            using var doc = JsonDocument.Parse(aiResponse);
            var rawResponse = doc.RootElement.GetProperty("response").GetString();

            if (string.IsNullOrEmpty(rawResponse))
            {
                return recommendations;
            }

            var cleanedResponse = Regex.Unescape(rawResponse);
            var lines = cleanedResponse.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();

                var confidenceMatch = Regex.Match(trimmedLine, @"^(.+?)\s*\[Confidence:\s*(\d+(?:\.\d+)?)\]\s*-\s*(.+)$");

                if (confidenceMatch.Success)
                {
                    var artistName = confidenceMatch.Groups[1].Value.Trim();
                    var confidenceStr = confidenceMatch.Groups[2].Value.Trim();
                    var reasoning = confidenceMatch.Groups[3].Value.Trim();

                    if (double.TryParse(confidenceStr, out var confidence))
                    {
                        recommendations.Add(new AIRecommendationWithConfidence
                        {
                            ArtistName = artistName,
                            ConfidenceScore = Math.Min(confidence / 10.0, 1.0),
                            Reasoning = reasoning,
                            RecommendationSource = "Enhanced_AI"
                        });
                    }
                }
                else
                {
                    var simpleMatch = Regex.Match(trimmedLine, @"^\d+\.?\s*(.+)$");

                    if (simpleMatch.Success)
                    {
                        var artistName = simpleMatch.Groups[1].Value.Trim();
                        recommendations.Add(new AIRecommendationWithConfidence
                        {
                            ArtistName = artistName,
                            ConfidenceScore = 0.7,
                            Reasoning = "AI recommendation",
                            RecommendationSource = "Enhanced_AI"
                        });
                    }
                }
            }
        }
        catch
        {
            return [];
        }

        return [.. recommendations.Take(15)];
    }

    private async Task<List<BandModel>> FetchAndScoreAISuggestedBandsAsync(
        List<AIRecommendationWithConfidence> aiRecommendations,
        string userId,
        List<string> genres,
        string spotifyAccessToken,
        MusicalJourneyContext journeyContext)
    {
        var bands = new List<BandModel>();
        var discoveredArtists = new List<SpotifyArtistDTO>();

        var scoringWeights = await _adaptiveLearningService.GetUserScoringWeightsAsync(userId);

        foreach (var recommendation in aiRecommendations.Take(8))
        {
            try
            {
                var searchResponse = await _spotifyService.SearchAsync(spotifyAccessToken, recommendation.ArtistName, "artist", 2);

                if (searchResponse?.Artists?.Items != null)
                {
                    foreach (var artist in searchResponse.Artists.Items.Take(1))
                    {
                        var bandModel = ConvertSpotifyArtistToBandModel(artist, genres);

                        bandModel.RelevanceScore = CalculateAdaptiveRelevanceScore(artist, genres, recommendation.ConfidenceScore, scoringWeights, journeyContext);

                        bands.Add(bandModel);
                        discoveredArtists.Add(artist);
                    }
                }

                await Task.Delay(150);
            }
            catch
            {
                continue;
            }
        }

        foreach (var artist in discoveredArtists)
        {
            try
            {
                await _vectorSearchService.IndexBandcampArtistAsync(ConvertToBandcampArtistModel(artist));
            }
            catch
            {
                continue;
            }
        }

        return bands;
    }

    private async Task<List<BandModel>> RankRecommendationsWithAdaptiveWeightsAsync(
        List<BandModel> candidates,
        List<string> topArtists,
        List<string> genres,
        string location,
        MusicalJourneyContext journeyContext,
        int limit)
    {
        if (candidates.Count <= limit)
        {
            return candidates;
        }

        try
        {
            var rankingPrompt = _enhancedAIPromptService.BuildAdaptiveRankingPrompt(candidates, topArtists, genres, location, journeyContext.JourneyStage, journeyContext.GenreWeights);

            var aiRanking = await _ollamaClient.PromptWithContext(rankingPrompt);
            var rankedBandNames = ExtractRankedBandNamesWithScores(aiRanking);

            var rankedBands = new List<BandModel>();
            var remainingCandidates = candidates.ToList();

            foreach (var (bandName, score) in rankedBandNames.Take(limit))
            {
                var band = remainingCandidates.FirstOrDefault(b => b.Name.Equals(bandName, StringComparison.OrdinalIgnoreCase));
                if (band != null)
                {
                    band.RelevanceScore = (band.RelevanceScore > 0 ? band.RelevanceScore : 0.5) * 0.7 + score * 0.3;
                    rankedBands.Add(band);
                    remainingCandidates.Remove(band);
                }
            }

            rankedBands.AddRange(remainingCandidates
                .OrderByDescending(b => b.RelevanceScore)
                .Take(limit - rankedBands.Count));

            return [.. rankedBands.Take(limit)];
        }
        catch
        {
            return [.. candidates
                .OrderByDescending(b => b.RelevanceScore)
                .Take(limit)];
        }
    }

    private static double CalculateAdaptiveRelevanceScore(
        SpotifyArtistDTO artist,
        List<string> userGenres,
        double aiConfidence,
        DynamicScoringWeights weights,
        MusicalJourneyContext journeyContext)
    {
        var popularityScore = artist.Popularity / 100.0;

        var genreMatchScore = 0.0;
        if (userGenres.Count > 0 && artist.Genres.Count > 0)
        {
            var matchingGenres = artist.Genres.Intersect(userGenres, StringComparer.OrdinalIgnoreCase).Count();
            genreMatchScore = (double)matchingGenres / Math.Max(userGenres.Count, artist.Genres.Count);
        }

        var discoveryBonus = artist.Popularity < 50 ? journeyContext.ExplorationFactor * 0.3 : 0.0;

        var journeyModifier = journeyContext.JourneyStage switch
        {
            "discovery" => aiConfidence * 0.4 + discoveryBonus * 1.5,
            "comfort" => popularityScore * 0.6 + genreMatchScore * 0.4,
            "deepening" => genreMatchScore * 0.8 + aiConfidence * 0.2,
            _ => aiConfidence * 0.3 + discoveryBonus
        };

        var adaptiveScore = (popularityScore * weights.ListenerScoreWeight) +
                           (genreMatchScore * weights.GenreMatchWeight) +
                           (aiConfidence * weights.SimilarArtistWeight) +
                           (discoveryBonus * weights.UndergroundBandWeight) +
                           (journeyModifier * 0.2);

        return Math.Min(1.0, Math.Max(0.0, adaptiveScore));
    }

    private static List<AIRecommendationWithConfidence> CreateConfidenceRecommendations(
        List<BandModel> rankedBands,
        List<AIRecommendationWithConfidence> aiRecommendations)
    {
        var results = new List<AIRecommendationWithConfidence>();

        foreach (var band in rankedBands)
        {
            var aiRec = aiRecommendations.FirstOrDefault(r => r.ArtistName.Equals(band.Name, StringComparison.OrdinalIgnoreCase));

            var recommendation = new AIRecommendationWithConfidence
            {
                ArtistName = band.Name,
                ConfidenceScore = aiRec?.ConfidenceScore ?? (band.RelevanceScore > 0 ? band.RelevanceScore : 0.5),
                Reasoning = aiRec?.Reasoning ?? GenerateFallbackExplanation(band, []),
                MatchingGenres = band.Genres.ToList(),
                ExternalUrl = band.ExternalUrl ?? string.Empty,
                RecommendationSource = aiRec?.RecommendationSource ?? "Hybrid",
                FeatureScores = new Dictionary<string, double>
                {
                    ["relevance"] = band.RelevanceScore > 0 ? band.RelevanceScore : 0.5,
                    ["popularity"] = band.Popularity > 0 ? band.Popularity : 0.0,
                    ["discovery_potential"] = band.Popularity < 50 ? 0.8 : 0.3
                }
            };

            results.Add(recommendation);
        }

        return results;
    }

    private static List<(string bandName, double score)> ExtractRankedBandNamesWithScores(string aiResponse)
    {
        var results = new List<(string, double)>();

        try
        {
            using var doc = JsonDocument.Parse(aiResponse);
            var rawResponse = doc.RootElement.GetProperty("response").GetString();

            if (string.IsNullOrEmpty(rawResponse))
            {
                return results;
            }

            var cleanedResponse = Regex.Unescape(rawResponse);
            var lines = cleanedResponse.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();

                var scoreMatch = Regex.Match(trimmedLine, @"^\d+\.?\s*(.+?)\s*\[Score:\s*(\d+(?:\.\d+)?)\]");

                if (scoreMatch.Success)
                {
                    var bandName = scoreMatch.Groups[1].Value.Trim();
                    var scoreStr = scoreMatch.Groups[2].Value.Trim();

                    if (double.TryParse(scoreStr, out var score))
                    {
                        results.Add((bandName, Math.Min(score / 10.0, 1.0)));
                    }
                }
                else
                {
                    var nameMatch = Regex.Match(trimmedLine, @"^\d+\.?\s*(.+?)(?:\s*-|$)");

                    if (nameMatch.Success)
                    {
                        var bandName = nameMatch.Groups[1].Value.Trim();
                        results.Add((bandName, 0.7));
                    }
                }
            }
        }
        catch
        {
            return [];
        }

        return [.. results.Take(20)];
    }

    public async Task<List<BandModel>> GetRAGEnhancedRecommendationsAsync(string spotifyAccessToken, string userId, List<string> topArtists, List<string> genres, string location, int limit = 20)
    {
        var vectorResults = await _vectorSearchService.RecommendArtistsForUserAsync(userId, topArtists, genres, [], location, Math.Max(limit / 2, 5));

        var ragContext = await _vectorSearchService.GenerateRecommendationContextAsync(userId, topArtists, genres, location);

        var aiRecommendations = await GenerateAIRecommendationsAsync(topArtists, genres, location, vectorResults, ragContext);

        var aiBandNames = ExtractBandNamesFromAIResponse(aiRecommendations);
        var aiBands = await FetchAISuggestedBandsAsync(aiBandNames, genres, spotifyAccessToken);

        var allCandidates = new List<BandModel>();
        allCandidates.AddRange(vectorResults);
        allCandidates.AddRange(aiBands);

        var rankedRecommendations = await RankRecommendationsWithAIAsync(allCandidates, topArtists, genres, location, 5);

        if (rankedRecommendations.Count < limit)
        {
            var additionalBands = await DiscoverAdditionalBandsAsync(genres, limit - rankedRecommendations.Count);
            rankedRecommendations.AddRange(additionalBands);
        }

        return [.. rankedRecommendations
            .GroupBy(b => b.Name.ToLower())
            .Select(g => g.First())
            .Take(limit)];
    }

    private static List<string> ExtractBandNamesFromAIResponse(string aiRawJson)
    {
        var bandNames = new List<string>();

        try
        {
            using var doc = JsonDocument.Parse(aiRawJson);
            var rawResponse = doc.RootElement.GetProperty("response").GetString();

            if (string.IsNullOrEmpty(rawResponse))
            {
                return bandNames;
            }

            var cleanedResponse = Regex.Unescape(rawResponse);

            var lines = cleanedResponse.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();

                if (Regex.IsMatch(trimmedLine, @"^\s*(\d+[\.\)]|\-|\*)\s+"))
                {
                    var boldMatch = Regex.Match(trimmedLine, @"\*\*(.+?)\*\*");
                    if (boldMatch.Success)
                    {
                        bandNames.Add(boldMatch.Groups[1].Value.Trim());
                    }
                    else
                    {
                        var content = Regex.Replace(trimmedLine, @"^[-*•\d\.\)\s]+", "").Trim();
                        var name = content.Split(['(', ':'], 2)[0].Trim();
                        if (!string.IsNullOrWhiteSpace(name))
                            bandNames.Add(name);
                    }
                }
            }
        }
        catch
        {
            return [];
        }

        return [.. bandNames.Distinct().Take(10)];
    }


    private static BandModel ConvertToBandModel(BandcampArtistModel bandcampArtist)
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
            DataSource = "Bandcamp"
        };
    }

    private static BandModel ConvertSpotifyArtistToBandModel(SpotifyArtistDTO spotifyArtist, List<string> userGenres)
    {
        return new BandModel
        {
            Id = spotifyArtist.Id,
            Name = spotifyArtist.Name,
            Genres = spotifyArtist.Genres,
            Location = "",
            ImageUrl = spotifyArtist.Images.FirstOrDefault()?.Url ?? "",
            ExternalUrl = $"https://open.spotify.com/artist/{spotifyArtist.Id}",
            ExternalUrls = new Dictionary<string, string>
            {
                { "spotify", $"https://open.spotify.com/artist/{spotifyArtist.Id}" }
            },
            Followers = spotifyArtist.Followers?.Total ?? 0,
            Popularity = spotifyArtist.Popularity,
            DataSource = "Spotify",
            RelevanceScore = CalculateRelevanceScore(spotifyArtist, userGenres)
        };
    }

    private static BandcampArtistModel ConvertToBandcampArtistModel(SpotifyArtistDTO spotifyArtist)
    {
        return new BandcampArtistModel
        {
            Name = spotifyArtist.Name,
            BandcampUrl = "",
            Location = null,
            Genres = spotifyArtist.Genres,
            Description = null,
            Tags = spotifyArtist.Genres,
            ImageUrl = spotifyArtist.Images.FirstOrDefault()?.Url,
            Followers = spotifyArtist.Followers?.Total,
            Albums = [],
            SimilarArtists = [],
            LastActive = null,
            SocialLinks = null
        };
    }

    private static double CalculateRelevanceScore(SpotifyArtistDTO artist, List<string> userGenres)
    {
        var popularityScore = artist.Popularity / 100.0;

        var genreMatchScore = 0.0;
        if (userGenres.Count > 0 && artist.Genres.Count > 0)
        {
            var matchingGenres = artist.Genres.Intersect(userGenres, StringComparer.OrdinalIgnoreCase).Count();
            genreMatchScore = (double)matchingGenres / Math.Max(userGenres.Count, artist.Genres.Count);
        }

        var discoveryBonus = artist.Popularity < 50 ? 0.2 : 0.0;

        return (popularityScore * 0.4) + (genreMatchScore * 0.5) + discoveryBonus;
    }

    private static string GenerateFallbackExplanation(BandModel band, List<string> userGenres)
    {
        var commonGenres = band.Genres.Intersect(userGenres, StringComparer.OrdinalIgnoreCase).ToList();

        if (commonGenres.Count > 0)
        {
            return $"{band.Name} is recommended because they share {string.Join(" and ", commonGenres)} elements with your preferred genres.";
        }

        return $"{band.Name} is recommended based on their unique sound in the {string.Join(", ", band.Genres)} scene.";
    }

    private async Task<string> GenerateAIRecommendationsAsync(List<string> topArtists, List<string> genres, string location, List<BandModel> vectorResults, string ragContext)
    {
        var prompt = _enhancedAIPromptService.BuildAdvancedRecommendationPrompt(topArtists, genres, location, vectorResults, ragContext);
        return await _ollamaClient.PromptWithContext(prompt);
    }

    private async Task<List<BandModel>> FetchAISuggestedBandsAsync(List<string> bandNames, List<string> genres, string spotifyAccessToken)
    {
        var bands = new List<BandModel>();
        var discoveredArtists = new List<SpotifyArtistDTO>();

        foreach (var bandName in bandNames.Take(5))
        {
            try
            {
                var searchResponse = await _spotifyService.SearchAsync(spotifyAccessToken, bandName, "artist", 2);

                if (searchResponse?.Artists?.Items != null)
                {
                    discoveredArtists.AddRange(searchResponse.Artists.Items.Take(2));
                }

                await Task.Delay(150);
            }
            catch
            {
                continue;
            }
        }

        foreach (var artist in discoveredArtists.Take(8))
        {
            try
            {
                var bandModel = ConvertSpotifyArtistToBandModel(artist, genres);

                await _vectorSearchService.IndexBandcampArtistAsync(ConvertToBandcampArtistModel(artist));

                bands.Add(bandModel);
            }
            catch
            {
                continue;
            }
        }

        return bands;
    }

    private async Task<List<BandModel>> RankRecommendationsWithAIAsync(List<BandModel> candidates, List<string> topArtists, List<string> genres, string location, int limit)
    {
        if (candidates.Count <= limit)
        {
            return candidates;
        }

        var rankingPrompt = _enhancedAIPromptService.BuildRankingPrompt(candidates, topArtists, genres, location, limit);

        try
        {
            var aiRanking = await _ollamaClient.PromptWithContext(rankingPrompt);
            var rankedBandNames = ExtractRankedBandNames(aiRanking);

            var rankedBands = new List<BandModel>();
            var remainingCandidates = candidates.ToList();

            foreach (var bandName in rankedBandNames.Take(limit))
            {
                var band = remainingCandidates.FirstOrDefault(b => b.Name.Equals(bandName, StringComparison.OrdinalIgnoreCase));
                if (band != null)
                {
                    rankedBands.Add(band);
                    remainingCandidates.Remove(band);
                }
            }

            rankedBands.AddRange(remainingCandidates
                .OrderByDescending(b => b.RelevanceScore)
                .Take(limit - rankedBands.Count));

            return [.. rankedBands.Take(limit)];
        }
        catch
        {
            return [.. candidates
                .OrderByDescending(b => b.RelevanceScore)
                .Take(limit)];
        }
    }

    private async Task<List<BandModel>> DiscoverAdditionalBandsAsync(List<string> genres, int needed)
    {
        var additionalBands = new List<BandModel>();
        var discoverResults = new List<BandcampArtistModel>();

        try
        {
            if (genres.Count > 0)
            {
                var randomGenre = genres[new Random().Next(genres.Count)];
                var random = await _bandcampClient.DiscoverRandomArtistsByGenreAsync(randomGenre, needed);
                discoverResults.AddRange(random);
            }

            foreach (var artist in discoverResults.Take(needed))
            {
                try
                {
                    await _vectorSearchService.IndexBandcampArtistAsync(artist);
                    additionalBands.Add(ConvertToBandModel(artist));
                }
                catch
                {
                    continue;
                }
            }
        }
        catch
        {
            return [];
        }

        return additionalBands;
    }

    private static List<string> ExtractRankedBandNames(string aiResponse)
    {
        var bandNames = new List<string>();

        try
        {
            using var doc = JsonDocument.Parse(aiResponse);
            var rawResponse = doc.RootElement.GetProperty("response").GetString();

            if (string.IsNullOrEmpty(rawResponse))
            {
                return bandNames;
            }

            var cleanedResponse = Regex.Unescape(rawResponse);
            var lines = cleanedResponse.Split('\n', StringSplitOptions.RemoveEmptyEntries);

            foreach (var line in lines)
            {
                var trimmedLine = line.Trim();

                var match = Regex.Match(trimmedLine, @"^\d+\.?\s*(.+)$");
                if (match.Success)
                {
                    var bandName = match.Groups[1].Value.Trim();
                    if (!string.IsNullOrEmpty(bandName))
                    {
                        bandNames.Add(bandName);
                    }
                }
                else if (!string.IsNullOrEmpty(trimmedLine) && !trimmedLine.Contains("rank", StringComparison.OrdinalIgnoreCase))
                {
                    bandNames.Add(trimmedLine);
                }
            }
        }
        catch
        {
            return [];
        }

        return [.. bandNames.Distinct()];
    }
}
