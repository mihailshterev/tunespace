using System.Collections.Concurrent;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using TuneSpace.Core.DTOs.Responses.Spotify;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Core.Models;

namespace TuneSpace.Application.Services.MusicDiscovery;

internal class CollaborativeFilteringService(
    ISpotifyService spotifyService,
    IMemoryCache memoryCache,
    ILogger<CollaborativeFilteringService> logger) : ICollaborativeFilteringService
{
    private readonly ISpotifyService _spotifyService = spotifyService;
    private readonly IMemoryCache _memoryCache = memoryCache;
    private readonly ILogger<CollaborativeFilteringService> _logger = logger;

    private static readonly ConcurrentDictionary<string, UserListeningBehavior> _userBehaviors = new();
    private static readonly ConcurrentDictionary<string, UserSimilarity> _userSimilarities = new();
    private static readonly ConcurrentDictionary<string, DateTime> _lastSimilarityUpdate = new();

    UserSimilarity ICollaborativeFilteringService.CalculateUserSimilarity(string userId1, string userId2)
    {
        var cacheKey = $"similarity_{string.Join("_", new[] { userId1, userId2 }.OrderBy(x => x))}";

        if (_userSimilarities.TryGetValue(cacheKey, out var cachedSimilarity))
        {
            if (_lastSimilarityUpdate.TryGetValue(cacheKey, out var lastUpdate) &&
                DateTime.UtcNow.Subtract(lastUpdate).TotalHours < 24)
            {
                return cachedSimilarity;
            }
        }

        if (_memoryCache.TryGetValue(cacheKey, out UserSimilarity? memoryCachedSimilarity) && memoryCachedSimilarity != null)
        {
            _userSimilarities[cacheKey] = memoryCachedSimilarity;
            _lastSimilarityUpdate[cacheKey] = DateTime.UtcNow;
            return memoryCachedSimilarity;
        }
        try
        {
            var behavior1 = GetOrCreateUserBehavior(userId1);
            var behavior2 = GetOrCreateUserBehavior(userId2);

            var similarity = new UserSimilarity
            {
                UserId1 = userId1,
                UserId2 = userId2,
                CalculatedAt = DateTime.UtcNow,
                GenreSimilarity = CalculateCosineSimilarity(behavior1.GenreWeights, behavior2.GenreWeights),

                ArtistSimilarity = CalculateCosineSimilarity(behavior1.ArtistWeights, behavior2.ArtistWeights),

                TemporalSimilarity = CalculateTemporalSimilarity(behavior1, behavior2)
            };

            similarity.SimilarityScore =
                (similarity.GenreSimilarity * 0.4) +
                (similarity.ArtistSimilarity * 0.5) +
                (similarity.TemporalSimilarity * 0.1);

            similarity.CommonGenres = [.. behavior1.TopGenres.Intersect(behavior2.TopGenres)];
            similarity.CommonArtists = [.. behavior1.TopArtists.Intersect(behavior2.TopArtists)];
            similarity.InteractionCount = similarity.CommonGenres.Count + similarity.CommonArtists.Count;

            similarity.SimilarityBasis = "combined";

            _memoryCache.Set(cacheKey, similarity, TimeSpan.FromHours(6));

            _userSimilarities[cacheKey] = similarity;
            _lastSimilarityUpdate[cacheKey] = DateTime.UtcNow;

            return similarity;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calculating similarity between users {UserId1} and {UserId2}", userId1, userId2);
            return new UserSimilarity { UserId1 = userId1, UserId2 = userId2, SimilarityScore = 0.0 };
        }
    }

    async Task<List<UserSimilarity>> ICollaborativeFilteringService.FindSimilarUsersAsync(string userId, int maxResults, double minSimilarity)
    {
        var cacheKey = $"similar_users_{userId}_{maxResults}_{minSimilarity}";

        if (_memoryCache.TryGetValue(cacheKey, out List<UserSimilarity>? cachedResults) && cachedResults != null && cachedResults.Count > 0)
        {
            return cachedResults;
        }

        try
        {
            if (Random.Shared.Next(100) < 5)
            {
                CleanupStaleCache();
            }

            // TODO: Optimize
            var allUserIds = _userBehaviors.Keys.Where(id => id != userId).ToList();
            var similarities = new List<UserSimilarity>();

            var tasks = allUserIds.Select(otherUserId =>
            {
                try
                {
                    return Task.FromResult(((ICollaborativeFilteringService)this).CalculateUserSimilarity(userId, otherUserId));
                }
                catch
                {
                    return Task.FromResult(new UserSimilarity { UserId1 = userId, UserId2 = otherUserId, SimilarityScore = 0.0 });
                }
            });

            var results = await Task.WhenAll(tasks);
            similarities.AddRange(results);

            var similarUsers = similarities
                .Where(s => s.SimilarityScore >= minSimilarity)
                .OrderByDescending(s => s.SimilarityScore)
                .Take(maxResults)
                .ToList();

            _memoryCache.Set(cacheKey, similarUsers, TimeSpan.FromHours(2));

            return similarUsers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error finding similar users for {UserId}", userId);
            return [];
        }
    }

    async Task<List<CollaborativeRecommendation>> ICollaborativeFilteringService.GetCollaborativeRecommendationsAsync(string userId, int maxRecommendations)
    {
        try
        {
            var similarUsers = await ((ICollaborativeFilteringService)this).FindSimilarUsersAsync(userId, maxResults: 20, minSimilarity: 0.4);

            if (similarUsers.Count == 0)
            {
                _logger.LogInformation("No similar users found for {UserId}", userId);
                return [];
            }

            var userBehavior = GetOrCreateUserBehavior(userId);
            var recommendations = new Dictionary<string, CollaborativeRecommendation>();

            foreach (var similarUser in similarUsers)
            {
                var similarUserId = similarUser.UserId1 == userId ? similarUser.UserId2 : similarUser.UserId1;
                var similarUserBehavior = GetOrCreateUserBehavior(similarUserId);

                foreach (var kvp in similarUserBehavior.ArtistWeights.Take(10))
                {
                    var artistId = kvp.Key;
                    var weight = kvp.Value;

                    if (userBehavior.ArtistWeights.TryGetValue(artistId, out var userWeight) && userWeight > 0.3)
                    {
                        continue;
                    }

                    if (!recommendations.TryGetValue(artistId, out var recommendation))
                    {
                        var artistName = GetArtistName(artistId) ?? "Unknown Artist";

                        recommendation = new CollaborativeRecommendation
                        {
                            ArtistId = artistId,
                            ArtistName = artistName,
                            Score = 0.0,
                            RecommendedBySimilarUsers = [],
                            CommonGenres = []
                        };
                        recommendations[artistId] = recommendation;
                    }

                    var contributionScore = similarUser.SimilarityScore * weight;
                    recommendation.Score += contributionScore;
                    recommendation.RecommendedBySimilarUsers.Add(similarUserId);

                    var commonGenres = similarUser.CommonGenres;
                    foreach (var genre in commonGenres)
                    {
                        if (!recommendation.CommonGenres.Contains(genre))
                        {
                            recommendation.CommonGenres.Add(genre);
                        }
                    }
                }
            }

            foreach (var rec in recommendations.Values)
            {
                rec.AverageUserRating = rec.Score / rec.RecommendedBySimilarUsers.Count;
                rec.ReasoningExplanation = $"Recommended by {rec.RecommendedBySimilarUsers.Count} users with similar taste" +
                    (rec.CommonGenres.Count != 0 ? $" who also enjoy {string.Join(", ", rec.CommonGenres.Take(3))}" : "");
            }

            return [.. recommendations.Values
                .OrderByDescending(r => r.Score)
                .Take(maxRecommendations)];
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting collaborative recommendations for {UserId}", userId);
            return [];
        }
    }

    async Task ICollaborativeFilteringService.UpdateUserListeningBehaviorAsync(string userId, string spotifyAccessToken)
    {
        try
        {
            var cacheKey = $"behavior_update_{userId}";
            if (_memoryCache.TryGetValue(cacheKey, out _))
            {
                return;
            }

            var behavior = new UserListeningBehavior
            {
                UserId = userId,
                LastUpdated = DateTime.UtcNow
            };

            var topArtists = await _spotifyService.GetUserTopArtistsAsync(spotifyAccessToken);
            var recentTracks = await _spotifyService.GetUserRecentlyPlayedTracksAsync(spotifyAccessToken);
            var followedArtists = await _spotifyService.GetUserFollowedArtistsAsync(spotifyAccessToken);

            var genreFrequency = new Dictionary<string, int>();
            var artistFrequency = new Dictionary<string, int>();

            foreach (var artist in topArtists.Take(50))
            {
                var artistKey = !string.IsNullOrEmpty(artist.Id) ? artist.Id : $"name:{artist.Name}";
                artistFrequency[artistKey] = artistFrequency.GetValueOrDefault(artistKey, 0) + 3;

                if (artist.Genres != null)
                {
                    foreach (var genre in artist.Genres)
                    {
                        genreFrequency[genre] = genreFrequency.GetValueOrDefault(genre, 0) + 3;
                    }
                }
            }

            foreach (var track in recentTracks.Take(100))
            {
                if (!string.IsNullOrEmpty(track.ArtistId))
                {
                    artistFrequency[track.ArtistId] = artistFrequency.GetValueOrDefault(track.ArtistId, 0) + 1;
                }
            }

            foreach (var artist in followedArtists.Take(100))
            {
                artistFrequency[artist.Id] = artistFrequency.GetValueOrDefault(artist.Id, 0) + 2;

                foreach (var genre in artist.Genres)
                {
                    genreFrequency[genre] = genreFrequency.GetValueOrDefault(genre, 0) + 2;
                }
            }

            var maxGenreCount = genreFrequency.Values.DefaultIfEmpty(1).Max();
            var maxArtistCount = artistFrequency.Values.DefaultIfEmpty(1).Max();

            behavior.GenreWeights = genreFrequency.ToDictionary(
                kvp => kvp.Key,
                kvp => (double)kvp.Value / maxGenreCount
            );

            behavior.ArtistWeights = artistFrequency.ToDictionary(
                kvp => kvp.Key,
                kvp => (double)kvp.Value / maxArtistCount
            );

            behavior.TopGenres = [.. behavior.GenreWeights
                .OrderByDescending(kvp => kvp.Value)
                .Take(10)
                .Select(kvp => kvp.Key)
                .Where(genre => !string.IsNullOrWhiteSpace(genre))];

            behavior.TopArtists = [.. behavior.ArtistWeights
                .OrderByDescending(kvp => kvp.Value)
                .Take(20)
                .Select(kvp => kvp.Key)
                .Where(artist => !string.IsNullOrWhiteSpace(artist))];

            behavior.DiscoveryScore = CalculateDiscoveryScore(behavior, topArtists);
            behavior.IsActiveDiscoverer = behavior.DiscoveryScore > 0.6;

            CalculateTemporalMetrics(behavior, recentTracks);

            _userBehaviors[userId] = behavior;

            _memoryCache.Set(cacheKey, true, TimeSpan.FromHours(1));

            _logger.LogInformation("Updated listening behavior for user {UserId}", userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating listening behavior for {UserId}", userId);
        }
    }

    async Task<List<string>> ICollaborativeFilteringService.GetUserCohortAsync(string userId, int cohortSize)
    {
        var similarUsers = await ((ICollaborativeFilteringService)this).FindSimilarUsersAsync(userId, maxResults: cohortSize, minSimilarity: 0.2);
        return similarUsers.Select(s => s.UserId1 == userId ? s.UserId2 : s.UserId1).ToList();
    }

    double ICollaborativeFilteringService.CalculateGenreSimilarity(string userId1, string userId2)
    {
        var behavior1 = GetOrCreateUserBehavior(userId1);
        var behavior2 = GetOrCreateUserBehavior(userId2);
        return CalculateCosineSimilarity(behavior1.GenreWeights, behavior2.GenreWeights);
    }
    double ICollaborativeFilteringService.CalculateArtistSimilarity(string userId1, string userId2)
    {
        var behavior1 = GetOrCreateUserBehavior(userId1);
        var behavior2 = GetOrCreateUserBehavior(userId2);
        return CalculateCosineSimilarity(behavior1.ArtistWeights, behavior2.ArtistWeights);
    }

    int ICollaborativeFilteringService.GetCachedSimilarityCount()
    {
        return _userSimilarities.Count;
    }

    void ICollaborativeFilteringService.ClearSimilarityCache()
    {
        _userSimilarities.Clear();
        _lastSimilarityUpdate.Clear();
    }

    private static void CleanupStaleCache()
    {
        var cutoffTime = DateTime.UtcNow.AddHours(-48);
        var staleKeys = _lastSimilarityUpdate
            .Where(kvp => kvp.Value < cutoffTime)
            .Select(kvp => kvp.Key)
            .ToList();

        foreach (var key in staleKeys)
        {
            _userSimilarities.TryRemove(key, out _);
            _lastSimilarityUpdate.TryRemove(key, out _);
        }
    }

    private static UserListeningBehavior GetOrCreateUserBehavior(string userId)
    {
        if (_userBehaviors.TryGetValue(userId, out var behavior))
        {
            return behavior;
        }

        behavior = new UserListeningBehavior
        {
            UserId = userId,
            LastUpdated = DateTime.UtcNow,
            GenreWeights = new Dictionary<string, double>(),
            ArtistWeights = new Dictionary<string, double>(),
            TopGenres = new List<string>(),
            TopArtists = new List<string>(),
            DiscoveryScore = 0.5,
            WeeklyListeningHours = 0.0,
            AverageSessionLength = 0.0,
            SkipRate = 0.5,
            IsActiveDiscoverer = false
        };

        _userBehaviors[userId] = behavior;
        return behavior;
    }

    private static double CalculateCosineSimilarity(Dictionary<string, double> vector1, Dictionary<string, double> vector2)
    {
        if (vector1.Count == 0 || vector2.Count == 0)
        {
            return 0.0;
        }

        var allKeys = vector1.Keys.Union(vector2.Keys).ToList();

        if (allKeys.Count == 0)
        {
            return 0.0;
        }

        var dotProduct = 0.0;
        var magnitude1 = 0.0;
        var magnitude2 = 0.0;

        foreach (var key in allKeys)
        {
            var value1 = vector1.GetValueOrDefault(key, 0.0);
            var value2 = vector2.GetValueOrDefault(key, 0.0);

            dotProduct += value1 * value2;
            magnitude1 += value1 * value1;
            magnitude2 += value2 * value2;
        }

        var denominator = Math.Sqrt(magnitude1) * Math.Sqrt(magnitude2);
        return denominator > 0 ? dotProduct / denominator : 0.0;
    }

    private static double CalculateTemporalSimilarity(UserListeningBehavior behavior1, UserListeningBehavior behavior2)
    {
        var similarity = 0.0;
        var factors = 0;

        if (behavior1.DiscoveryScore >= 0 && behavior2.DiscoveryScore >= 0)
        {
            var discoveryDiff = Math.Abs(behavior1.DiscoveryScore - behavior2.DiscoveryScore);
            similarity += 1.0 - discoveryDiff;
            factors++;
        }

        if (behavior1.WeeklyListeningHours > 0 && behavior2.WeeklyListeningHours > 0)
        {
            var maxHours = Math.Max(behavior1.WeeklyListeningHours, behavior2.WeeklyListeningHours);
            var minHours = Math.Min(behavior1.WeeklyListeningHours, behavior2.WeeklyListeningHours);
            similarity += minHours / maxHours;
            factors++;
        }

        if (behavior1.AverageSessionLength > 0 && behavior2.AverageSessionLength > 0)
        {
            var maxSession = Math.Max(behavior1.AverageSessionLength, behavior2.AverageSessionLength);
            var minSession = Math.Min(behavior1.AverageSessionLength, behavior2.AverageSessionLength);
            similarity += minSession / maxSession;
            factors++;
        }

        if (behavior1.IsActiveDiscoverer == behavior2.IsActiveDiscoverer)
        {
            similarity += 0.5;
            factors++;
        }

        return factors > 0 ? similarity / factors : 0.5;
    }

    private static double CalculateDiscoveryScore(UserListeningBehavior behavior, List<SpotifyArtistDTO> topArtists)
    {
        var score = 0.0;

        var genreCount = behavior.TopGenres.Count;
        score += Math.Min(1.0, genreCount / 10.0) * 0.4;

        if (topArtists.Count != 0)
        {
            var averagePopularity = topArtists.Take(20).Average(a => a.Popularity);
            score += (1.0 - (averagePopularity / 100.0)) * 0.6;
        }
        else
        {
            score += 0.3;
        }

        return Math.Min(1.0, score);
    }

    private static void CalculateTemporalMetrics(UserListeningBehavior behavior, List<RecentlyPlayedTrackDTO> recentTracks)
    {
        if (recentTracks.Count != 0)
        {
            var recentTracksByDay = recentTracks
                .GroupBy(t => t.PlayedAt.Date)
                .ToList();

            if (recentTracksByDay.Count != 0)
            {
                var dailyMinutes = recentTracksByDay.Average(g => g.Count() * 3.5);
                behavior.WeeklyListeningHours = dailyMinutes * 7 / 60.0;

                var sessions = new List<List<RecentlyPlayedTrackDTO>>();
                var sortedTracks = recentTracks
                    .OrderBy(t => t.PlayedAt)
                    .ToList();

                if (sortedTracks.Count != 0)
                {
                    var currentSession = new List<RecentlyPlayedTrackDTO> { sortedTracks[0] };

                    for (int i = 1; i < sortedTracks.Count; i++)
                    {
                        var timeDiff = sortedTracks[i].PlayedAt - sortedTracks[i - 1].PlayedAt;
                        if (timeDiff.TotalMinutes <= 30)
                        {
                            currentSession.Add(sortedTracks[i]);
                        }
                        else
                        {
                            sessions.Add(currentSession);
                            currentSession = new List<RecentlyPlayedTrackDTO> { sortedTracks[i] };
                        }
                    }
                    sessions.Add(currentSession);

                    behavior.AverageSessionLength = sessions.Average(s => s.Count * 3.5);
                }
            }

            var totalTracks = recentTracks.Count;
            if (totalTracks > 0)
            {
                // TODO: Calculate skip rate based on user behavior from Spotify if possible
                var avgSessionTracks = behavior.AverageSessionLength / 3.5;
                behavior.SkipRate = Math.Max(0, Math.Min(1.0, (10 - avgSessionTracks) / 10.0));
            }
        }
    }

    private string? GetArtistName(string artistId)
    {
        try
        {
            if (artistId.StartsWith("name:"))
            {
                return artistId[5..];
            }

            // TODO: cache artist info or make API calls for artist details
            foreach (var userBehavior in _userBehaviors.Values)
            {
                var artistEntry = userBehavior.ArtistWeights.FirstOrDefault(kvp => kvp.Key == artistId);
                if (!string.IsNullOrEmpty(artistEntry.Key))
                {
                    return $"Artist_{artistId[..Math.Min(8, artistId.Length)]}";
                }
            }

            return $"Artist_{artistId[..Math.Min(8, artistId.Length)]}";
        }
        catch
        {
            return "Unknown Artist";
        }
    }
}
