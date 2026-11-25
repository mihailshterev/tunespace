using System.Text.Json;
using TuneSpace.Core.Entities;
using TuneSpace.Core.Interfaces.IRepositories;
using TuneSpace.Core.Interfaces.IServices;
using TuneSpace.Core.Models;

namespace TuneSpace.Application.Services;

internal class VectorSearchService(
    IArtistEmbeddingRepository artistEmbeddingRepository,
    IRecommendationContextRepository recommendationContextRepository,
    IEmbeddingService embeddingService) : IVectorSearchService
{
    private readonly IArtistEmbeddingRepository _artistEmbeddingRepository = artistEmbeddingRepository;
    private readonly IRecommendationContextRepository _recommendationContextRepository = recommendationContextRepository;
    private readonly IEmbeddingService _embeddingService = embeddingService;

    async Task<List<BandModel>> IVectorSearchService.RecommendArtistsForUserAsync(string userId, List<string> topArtists, List<string> genres, List<string> recentlyPlayed, string? location, int limit)
    {
        var userEmbedding = await _embeddingService.GenerateUserPreferenceEmbeddingAsync(topArtists, genres, recentlyPlayed);

        var context = new RecommendationContext
        {
            UserId = Guid.Parse(userId),
            UserGenres = genres,
            UserLocation = location,
            UserTopArtists = topArtists,
            UserRecentlyPlayed = recentlyPlayed,
            UserPreferenceEmbedding = userEmbedding
        };

        await _recommendationContextRepository.CreateOrUpdateAsync(context);

        var recommendedArtists = await _artistEmbeddingRepository.FindSimilarArtistsAsync(userEmbedding, limit * 2);

        if (!string.IsNullOrEmpty(location))
        {
            var recommendedArtistsByLocation = recommendedArtists
                .Where(a => a.Location != null && a.Location.Contains(location, StringComparison.OrdinalIgnoreCase))
                .ToList();

            recommendedArtists = recommendedArtistsByLocation.Count > 0 ? recommendedArtistsByLocation : recommendedArtists;
        }

        if (genres.Count > 0)
        {
            recommendedArtists = [.. recommendedArtists.Where(a => a.Genres.Any(g => genres.Contains(g, StringComparer.OrdinalIgnoreCase)))];
        }

        return [.. recommendedArtists.Take(limit).Select(ConvertToBandModel)];
    }

    async Task<string> IVectorSearchService.GenerateRecommendationContextAsync(string userId, List<string> topArtists, List<string> genres, string? location)
    {
        var userEmbedding = await _embeddingService.GenerateUserPreferenceEmbeddingAsync(topArtists, genres, []);

        var contextArtists = await _artistEmbeddingRepository.FindSimilarArtistsAsync(userEmbedding, 10);

        var similarUsers = await _recommendationContextRepository.GetSimilarUsersAsync(userEmbedding, 5);

        var contextData = new
        {
            UserPreferences = new
            {
                TopArtists = topArtists.Take(5),
                Genres = genres.Take(5),
                Location = location
            },
            SimilarArtists = contextArtists.Take(5).Select(a => new
            {
                a.ArtistName,
                a.Genres,
                a.Location,
                Description = a.Description?.Length > 200 ? a.Description[..200] + "..." : a.Description
            }),
            RecommendationInsights = GenerateInsights(contextArtists, location)
        };

        return JsonSerializer.Serialize(contextData, new JsonSerializerOptions { WriteIndented = true });
    }

    async Task IVectorSearchService.IndexBandcampArtistAsync(BandcampArtistModel artist)
    {
        if (await _artistEmbeddingRepository.ExistsAsync(artist.Name))
        {
            return;
        }

        var embedding = await _embeddingService.GenerateArtistEmbeddingAsync(
            artist.Name,
            artist.Genres,
            artist.Location,
            artist.Description
        );

        var artistEmbedding = new ArtistEmbedding
        {
            ArtistName = artist.Name,
            BandcampUrl = artist.BandcampUrl,
            Genres = artist.Genres,
            Location = artist.Location,
            Description = artist.Description,
            Tags = string.Join(", ", artist.Tags),
            Embedding = embedding,
            Followers = artist.Followers,
            ImageUrl = artist.ImageUrl,
            SimilarArtists = JsonSerializer.Serialize(artist.SimilarArtists),
            DataSource = "Bandcamp",
            SourceMetadata = JsonSerializer.Serialize(new
            {
                Albums = artist.Albums.Take(3).Select(a => new { a.Title, a.ReleaseDate }),
                LastScraped = DateTime.UtcNow
            })
        };

        await _artistEmbeddingRepository.CreateAsync(artistEmbedding);
    }

    async Task IVectorSearchService.IndexBandcampArtistsBulkAsync(List<BandcampArtistModel> artists)
    {
        var artistEmbeddings = new List<ArtistEmbedding>();

        foreach (var artist in artists)
        {
            if (await _artistEmbeddingRepository.ExistsAsync(artist.Name))
            {
                continue;
            }

            var embedding = await _embeddingService.GenerateArtistEmbeddingAsync(
                artist.Name,
                artist.Genres,
                artist.Location,
                artist.Description
            );

            var artistEmbedding = new ArtistEmbedding
            {
                ArtistName = artist.Name,
                BandcampUrl = artist.BandcampUrl,
                Genres = artist.Genres,
                Location = artist.Location,
                Description = artist.Description,
                Tags = string.Join(", ", artist.Tags),
                Embedding = embedding,
                Followers = artist.Followers,
                ImageUrl = artist.ImageUrl,
                SimilarArtists = JsonSerializer.Serialize(artist.SimilarArtists),
                DataSource = "Bandcamp",
                SourceMetadata = JsonSerializer.Serialize(new
                {
                    Albums = artist.Albums.Take(3).Select(a => new { a.Title, a.ReleaseDate }),
                    LastScraped = DateTime.UtcNow
                })
            };

            artistEmbeddings.Add(artistEmbedding);
        }

        if (artistEmbeddings.Count > 0)
        {
            await _artistEmbeddingRepository.CreateBulkAsync(artistEmbeddings);
        }
    }

    async Task<bool> IVectorSearchService.IsArtistIndexedAsync(string artistName)
    {
        return await _artistEmbeddingRepository.ExistsAsync(artistName);
    }

    async Task<int> IVectorSearchService.GetIndexedArtistCountAsync()
    {
        return await _artistEmbeddingRepository.GetCountAsync();
    }

    private BandModel ConvertToBandModel(ArtistEmbedding artistEmbedding)
    {
        return new BandModel
        {
            Name = artistEmbedding.ArtistName,
            Genres = artistEmbedding.Genres,
            Location = artistEmbedding.Location ?? "",
            Description = artistEmbedding.Description ?? "",
            ImageUrl = artistEmbedding.ImageUrl ?? "",
            ExternalUrls = !string.IsNullOrEmpty(artistEmbedding.BandcampUrl)
                ? new Dictionary<string, string> { { "bandcamp", artistEmbedding.BandcampUrl } }
                : [],
            Followers = artistEmbedding.Followers ?? 0,
            Popularity = (float)(artistEmbedding.Popularity ?? 0),
            DataSource = artistEmbedding.DataSource
        };
    }

    private static List<string> GenerateInsights(List<ArtistEmbedding> similarArtists, string? location)
    {
        var insights = new List<string>();

        var commonGenres = similarArtists
            .SelectMany(a => a.Genres)
            .GroupBy(g => g, StringComparer.OrdinalIgnoreCase)
            .OrderByDescending(g => g.Count())
            .Take(3)
            .Select(g => g.Key)
            .ToList();

        if (commonGenres.Count > 0)
        {
            insights.Add($"Popular genres in similar artists: {string.Join(", ", commonGenres)}");
        }

        if (!string.IsNullOrEmpty(location))
        {
            var localArtists = similarArtists.Where(a => a.Location?.Contains(location, StringComparison.OrdinalIgnoreCase) == true).Count();
            if (localArtists > 0)
            {
                insights.Add($"Found {localArtists} similar artists from {location}");
            }
        }

        var bandcampCount = similarArtists.Count(a => a.DataSource == "Bandcamp");
        if (bandcampCount > 0)
        {
            insights.Add($"{bandcampCount} recommendations sourced from Bandcamp's underground scene");
        }

        return insights;
    }
}
