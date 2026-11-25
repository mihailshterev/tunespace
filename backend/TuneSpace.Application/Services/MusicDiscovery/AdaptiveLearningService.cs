using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Infrastructure.Data;

namespace TuneSpace.Application.Services.MusicDiscovery;

internal class AdaptiveLearningService(
    TuneSpaceDbContext dbContext,
    ILogger<AdaptiveLearningService> logger) : IAdaptiveLearningService
{
    //TODO: Add repository
    private readonly TuneSpaceDbContext _dbContext = dbContext;
    private readonly ILogger<AdaptiveLearningService> _logger = logger;

    async Task<DynamicScoringWeights> IAdaptiveLearningService.GetUserScoringWeightsAsync(string userId)
    {
        var userGuid = Guid.Parse(userId);
        var weights = await _dbContext.DynamicScoringWeights
            .FirstOrDefaultAsync(w => w.UserId == userGuid);

        if (weights is null)
        {
            weights = new DynamicScoringWeights { UserId = userGuid };
            _dbContext.DynamicScoringWeights.Add(weights);
            await _dbContext.SaveChangesAsync();
            _logger.LogInformation("Created initial scoring weights");
        }

        return weights;
    }

    async Task IAdaptiveLearningService.UpdateScoringWeightsAsync(string userId, RecommendationFeedback feedback)
    {
        var weights = await ((IAdaptiveLearningService)this).GetUserScoringWeightsAsync(userId);
        var success = ((IAdaptiveLearningService)this).CalculateRecommendationSuccess(feedback);

        weights.RecommendationCount++;
        if (success > 0.5)
        {
            weights.PositiveFeedbackCount++;
        }

        weights.SuccessRate = (double)weights.PositiveFeedbackCount / weights.RecommendationCount;

        var learningRate = weights.LearningRate * Math.Max(0.1, weights.SuccessRate);
        var error = success - 0.7;

        foreach (var factor in feedback.ScoringFactors)
        {
            var weightAdjustment = learningRate * error * factor.Value;

            switch (factor.Key.ToLower())
            {
                case "genre":
                    weights.GenreMatchWeight = Math.Max(0.05, Math.Min(1.0,
                        weights.GenreMatchWeight + weightAdjustment));
                    break;
                case "location":
                    weights.LocationMatchWeight = Math.Max(0.05, Math.Min(1.0,
                        weights.LocationMatchWeight + weightAdjustment));
                    break;
                case "artist":
                    weights.SimilarArtistWeight = Math.Max(0.05, Math.Min(1.0,
                        weights.SimilarArtistWeight + weightAdjustment));
                    break;
                case "underground":
                    weights.UndergroundBandWeight = Math.Max(0.05, Math.Min(1.0,
                        weights.UndergroundBandWeight + weightAdjustment));
                    break;
            }
        }

        if (weights.RecommendationCount % 10 == 0)
        {
            await ((IAdaptiveLearningService)this).UpdateExplorationFactorAsync(userId, weights.SuccessRate > 0.6);
            await UpdateDiversityFactorAsync(userId, weights.SuccessRate);
        }

        weights.LastAdaptation = DateTime.UtcNow;
        weights.LastUpdated = DateTime.UtcNow;

        await _dbContext.SaveChangesAsync();
    }

    async Task<List<GenreEvolution>> IAdaptiveLearningService.GetUserGenreEvolutionAsync(string userId)
    {
        var userGuid = Guid.Parse(userId);
        return await _dbContext.GenreEvolutions
            .Where(ge => ge.UserId == userGuid)
            .OrderBy(ge => ge.Genre)
            .ToListAsync();
    }

    async Task IAdaptiveLearningService.UpdateGenrePreferencesAsync(string userId, List<string> genres, FeedbackType feedbackType)
    {
        var feedbackValue = feedbackType switch
        {
            FeedbackType.Positive => 1.0,
            FeedbackType.Negative => -0.5,
            FeedbackType.Mixed => 0.2,
            _ => 0.0
        };

        var currentTime = DateTime.UtcNow;

        foreach (var genre in genres)
        {
            var userGuid = Guid.Parse(userId);
            var evolution = await _dbContext.GenreEvolutions
                .FirstOrDefaultAsync(ge => ge.UserId == userGuid && ge.Genre == genre);

            if (evolution is null)
            {
                evolution = new GenreEvolution
                {
                    UserId = userGuid,
                    Genre = genre,
                    CurrentPreference = feedbackValue,
                    FirstEncountered = currentTime
                };
                _dbContext.GenreEvolutions.Add(evolution);
            }
            else
            {
                evolution.PreviousPreference = evolution.CurrentPreference;
                var timeDiff = (currentTime - evolution.LastUpdated).TotalDays;
                if (timeDiff > 0)
                {
                    evolution.PreferenceVelocity = (feedbackValue - evolution.CurrentPreference) / timeDiff;
                }

                var alpha = 0.3;
                evolution.CurrentPreference = alpha * feedbackValue + (1 - alpha) * evolution.CurrentPreference;
                evolution.PreferenceChange = evolution.CurrentPreference - evolution.PreviousPreference;
            }

            var month = currentTime.Month;
            var dayOfWeek = currentTime.DayOfWeek;

            if (!evolution.MonthlyPreferences.ContainsKey(month))
            {
                evolution.MonthlyPreferences[month] = feedbackValue;
            }
            else
            {
                evolution.MonthlyPreferences[month] = 0.7 * evolution.MonthlyPreferences[month] + 0.3 * feedbackValue;
            }

            if (!evolution.WeeklyPreferences.ContainsKey(dayOfWeek))
            {
                evolution.WeeklyPreferences[dayOfWeek] = feedbackValue;
            }
            else
            {
                evolution.WeeklyPreferences[dayOfWeek] = 0.7 * evolution.WeeklyPreferences[dayOfWeek] + 0.3 * feedbackValue;
            }

            evolution.LifecycleStage = await ((IAdaptiveLearningService)this).DetermineGenreLifecycleStageAsync(userId, genre);

            evolution.EncounterCount++;
            evolution.LastUpdated = currentTime;
        }

        await _dbContext.SaveChangesAsync();
    }

    async Task<Dictionary<string, double>> IAdaptiveLearningService.PredictFutureGenrePreferencesAsync(string userId, int daysAhead)
    {
        var evolutions = await ((IAdaptiveLearningService)this).GetUserGenreEvolutionAsync(userId);
        var predictions = new Dictionary<string, double>();

        foreach (var evolution in evolutions)
        {
            var predictedPreference = evolution.CurrentPreference + (evolution.PreferenceVelocity * daysAhead);

            var futureDate = DateTime.UtcNow.AddDays(daysAhead);
            var seasonalFactor = GetSeasonalFactor(evolution, futureDate);

            predictedPreference *= seasonalFactor;
            predictions[evolution.Genre] = Math.Max(0, Math.Min(1, predictedPreference));
        }

        return predictions;
    }

    async Task IAdaptiveLearningService.ProcessRecommendationFeedbackAsync(RecommendationFeedback feedback)
    {
        feedback.CalculatedSuccess = ((IAdaptiveLearningService)this).CalculateRecommendationSuccess(feedback);
        feedback.LastUpdated = DateTime.UtcNow;

        _dbContext.RecommendationFeedbacks.Add(feedback);

        await ((IAdaptiveLearningService)this).UpdateScoringWeightsAsync(feedback.UserId.ToString(), feedback);

        if (feedback.RecommendedGenres.Count != 0)
        {
            await ((IAdaptiveLearningService)this).UpdateGenrePreferencesAsync(feedback.UserId.ToString(), feedback.RecommendedGenres, feedback.FeedbackType);
        }

        await _dbContext.SaveChangesAsync();
    }

    double IAdaptiveLearningService.CalculateRecommendationSuccess(RecommendationFeedback feedback)
    {
        double success = 0.0;

        if (feedback.ExplicitRating > 0)
        {
            success += feedback.ExplicitRating / 5.0 * 0.6;
        }

        if (feedback.Clicked) success += 0.1;
        if (feedback.PlayedTrack) success += 0.15;
        if (feedback.FollowedBand) success += 0.3;
        if (feedback.SharedRecommendation) success += 0.25;
        if (feedback.SavedForLater) success += 0.2;

        if (feedback.TimeSpentListening.HasValue)
        {
            var minutes = feedback.TimeSpentListening.Value.TotalMinutes;
            if (minutes > 30) success += 0.3;
            else if (minutes > 10) success += 0.2;
            else if (minutes > 2) success += 0.1;
        }

        success += feedback.FeedbackType switch
        {
            FeedbackType.Positive => 0.2,
            FeedbackType.Negative => -0.3,
            FeedbackType.Mixed => 0.05,
            _ => 0.0
        };

        return Math.Max(0, Math.Min(1, success));
    }

    async Task IAdaptiveLearningService.TriggerPeriodicAdaptationAsync(string userId)
    {
        var weights = await ((IAdaptiveLearningService)this).GetUserScoringWeightsAsync(userId);

        if ((DateTime.UtcNow - weights.LastAdaptation).TotalDays < 7)
        {
            return;
        }

        await ((IAdaptiveLearningService)this).AdaptWeightsBasedOnSuccessRateAsync(userId);

        var evolutions = await ((IAdaptiveLearningService)this).GetUserGenreEvolutionAsync(userId);
        foreach (var evolution in evolutions)
        {
            evolution.LifecycleStage = await ((IAdaptiveLearningService)this).DetermineGenreLifecycleStageAsync(userId, evolution.Genre);
            evolution.LastUpdated = DateTime.UtcNow;
        }

        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("Completed periodic adaptation");
    }

    async Task IAdaptiveLearningService.AdaptWeightsBasedOnSuccessRateAsync(string userId)
    {
        var weights = await ((IAdaptiveLearningService)this).GetUserScoringWeightsAsync(userId);

        if (weights.RecommendationCount < 5)
        {
            return;
        }

        var userGuid = Guid.Parse(userId);
        var recentFeedback = await _dbContext.RecommendationFeedbacks
            .Where(rf => rf.UserId == userGuid)
            .Where(rf => rf.RecommendedAt > DateTime.UtcNow.AddDays(-30))
            .ToListAsync();

        var factorSuccessRates = new Dictionary<string, (double totalSuccess, int count)>();

        foreach (var feedback in recentFeedback)
        {
            foreach (var factor in feedback.ScoringFactors)
            {
                if (!factorSuccessRates.TryGetValue(factor.Key, out (double totalSuccess, int count) value))
                {
                    value = (0, 0);
                    factorSuccessRates[factor.Key] = value;
                }

                var (totalSuccess, count) = value;
                factorSuccessRates[factor.Key] = (totalSuccess + feedback.CalculatedSuccess, count + 1);
            }
        }

        foreach (var factor in factorSuccessRates)
        {
            if (factor.Value.count < 3)
            {
                continue;
            }

            var averageSuccess = factor.Value.totalSuccess / factor.Value.count;
            var adjustment = (averageSuccess - 0.5) * 0.1;

            switch (factor.Key.ToLower())
            {
                case "genre":
                    weights.GenreMatchWeight = Math.Max(0.05, Math.Min(1.0, weights.GenreMatchWeight + adjustment));
                    break;
                case "location":
                    weights.LocationMatchWeight = Math.Max(0.05, Math.Min(1.0, weights.LocationMatchWeight + adjustment));
                    break;
                case "artist":
                    weights.SimilarArtistWeight = Math.Max(0.05, Math.Min(1.0, weights.SimilarArtistWeight + adjustment));
                    break;
            }
        }

        weights.LastAdaptation = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
    }

    async Task<Dictionary<string, double>> IAdaptiveLearningService.GetGenreTrendsAsync(string userId, int daysPeriod)
    {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysPeriod);
        var userGuid = Guid.Parse(userId);
        var evolutions = await _dbContext.GenreEvolutions
            .Where(ge => ge.UserId == userGuid && ge.LastUpdated > cutoffDate)
            .ToListAsync();

        return evolutions.ToDictionary(e => e.Genre, e => e.PreferenceVelocity);
    }

    async Task<GenreLifecycleStage> IAdaptiveLearningService.DetermineGenreLifecycleStageAsync(string userId, string genre)
    {
        var userGuid = Guid.Parse(userId);
        var evolution = await _dbContext.GenreEvolutions
            .FirstOrDefaultAsync(ge => ge.UserId == userGuid && ge.Genre == genre);

        if (evolution is null)
        {
            return GenreLifecycleStage.Discovery;
        }

        var daysSinceFirst = (DateTime.UtcNow - evolution.FirstEncountered).TotalDays;
        var preference = evolution.CurrentPreference;
        var velocity = evolution.PreferenceVelocity;

        if (daysSinceFirst < 7)
        {
            return GenreLifecycleStage.Discovery;
        }

        if (velocity > 0.01 && preference < 0.7)
        {
            return GenreLifecycleStage.Growth;
        }

        if (Math.Abs(velocity) < 0.005 && preference > 0.6)
        {
            return GenreLifecycleStage.Maturity;
        }

        if (velocity < -0.01)
        {
            return GenreLifecycleStage.Decline;
        }

        if (velocity > 0.01 && daysSinceFirst > 180 && evolution.EncounterCount > 50)
        {
            return GenreLifecycleStage.Rediscovery;
        }

        return GenreLifecycleStage.Maturity;
    }

    async Task<List<string>> IAdaptiveLearningService.GetEmergingGenresForUserAsync(string userId)
    {
        var evolutions = await ((IAdaptiveLearningService)this).GetUserGenreEvolutionAsync(userId);

        return [.. evolutions
            .Where(e => e.LifecycleStage == GenreLifecycleStage.Growth ||
                       e.LifecycleStage == GenreLifecycleStage.Discovery)
            .Where(e => e.PreferenceVelocity > 0.01)
            .OrderByDescending(e => e.PreferenceVelocity)
            .Select(e => e.Genre)];
    }

    async Task<double> IAdaptiveLearningService.GetExplorationFactorAsync(string userId)
    {
        var weights = await ((IAdaptiveLearningService)this).GetUserScoringWeightsAsync(userId);
        return weights.ExplorationFactor;
    }

    async Task IAdaptiveLearningService.UpdateExplorationFactorAsync(string userId, bool wasSuccessful)
    {
        var weights = await ((IAdaptiveLearningService)this).GetUserScoringWeightsAsync(userId);

        if (wasSuccessful)
        {
            weights.ExplorationFactor = Math.Min(0.3, weights.ExplorationFactor * 1.05);
        }
        else
        {
            weights.ExplorationFactor = Math.Max(0.05, weights.ExplorationFactor * 0.95);
        }

        await _dbContext.SaveChangesAsync();
    }

    /// <summary>
    /// Updates the diversity factor based on user success rate and preference patterns.
    /// Higher success with varied genres = increase diversity, lower success = decrease diversity.
    /// </summary>
    private async Task UpdateDiversityFactorAsync(string userId, double successRate)
    {
        var weights = await ((IAdaptiveLearningService)this).GetUserScoringWeightsAsync(userId);

        var userGuid = Guid.Parse(userId);
        var recentFeedback = await _dbContext.RecommendationFeedbacks
            .Where(rf => rf.UserId == userGuid)
            .Where(rf => rf.RecommendedAt > DateTime.UtcNow.AddDays(-30))
            .OrderByDescending(rf => rf.RecommendedAt)
            .Take(20)
            .ToListAsync();

        if (recentFeedback.Count < 5)
        {
            return;
        }

        var successfulGenres = recentFeedback
            .Where(f => f.CalculatedSuccess > 0.6)
            .SelectMany(f => f.RecommendedGenres)
            .Distinct()
            .Count();

        var unsuccessfulGenres = recentFeedback
            .Where(f => f.CalculatedSuccess <= 0.4)
            .SelectMany(f => f.RecommendedGenres)
            .Distinct()
            .Count();

        var totalSuccessful = recentFeedback.Count(f => f.CalculatedSuccess > 0.6);
        var totalUnsuccessful = recentFeedback.Count(f => f.CalculatedSuccess <= 0.4);

        var diversitySuccessRatio = totalSuccessful > 0 ? (double)successfulGenres / totalSuccessful : 0;
        var diversityFailureRatio = totalUnsuccessful > 0 ? (double)unsuccessfulGenres / totalUnsuccessful : 0;

        if (diversitySuccessRatio > diversityFailureRatio && successRate > 0.6)
        {
            weights.DiversityFactor = Math.Min(0.3, weights.DiversityFactor * 1.05);
        }
        else if (diversityFailureRatio > diversitySuccessRatio && successRate < 0.5)
        {
            weights.DiversityFactor = Math.Max(0.05, weights.DiversityFactor * 0.95);
        }

        await _dbContext.SaveChangesAsync();
    }

    private static double GetSeasonalFactor(GenreEvolution evolution, DateTime targetDate)
    {
        var month = targetDate.Month;
        var dayOfWeek = targetDate.DayOfWeek;

        var seasonalFactor = 1.0;

        if (evolution.MonthlyPreferences.ContainsKey(month))
        {
            var monthlyAvg = evolution.MonthlyPreferences.Values.Average();
            seasonalFactor *= evolution.MonthlyPreferences[month] / Math.Max(0.1, monthlyAvg);
        }

        if (evolution.WeeklyPreferences.ContainsKey(dayOfWeek))
        {
            var weeklyAvg = evolution.WeeklyPreferences.Values.Average();
            seasonalFactor *= evolution.WeeklyPreferences[dayOfWeek] / Math.Max(0.1, weeklyAvg);
        }

        return Math.Max(0.5, Math.Min(2.0, seasonalFactor));
    }
}
