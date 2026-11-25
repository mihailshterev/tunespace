using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using TuneSpace.Core.DTOs.Responses.Bandcamp;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Models;

namespace TuneSpace.Infrastructure.Clients;

internal class BandcampClient(
    HttpClient httpClient,
    ILogger<BandcampClient> logger) : IBandcampClient
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<BandcampClient> _logger = logger;

    private const string ApiUrl = "https://bandcamp.com/api/discover/1/discover_web";

    private static readonly Dictionary<string, int> LocationMappings = new(StringComparer.OrdinalIgnoreCase)
    {
        { "Bulgaria", 732800 },
        { "United States", 6252001 },
        { "United Kingdom", 2635167 },
        { "Germany", 2921044 },
        { "France", 3017382 },
        { "Canada", 6251999 },
        { "Australia", 2077456 },
        { "Japan", 1861060 }
    };

    async Task<List<BandcampArtistModel>> IBandcampClient.DiscoverArtistsByGenreAsync(string genre, int limit)
    {
        try
        {
            var normalizedGenre = NormalizeGenre(genre);
            var requestBody = new
            {
                category_id = 0,
                tag_norm_names = new[] { normalizedGenre },
                geoname_id = 0,
                slice = "new",
                time_facet_id = (int?)null,
                cursor = "*",
                size = limit,
                include_result_types = new[] { "a", "s" }
            };

            return await CallDiscoverApi(requestBody);
        }
        catch (Exception)
        {
            _logger.LogError("Error discovering artists by genre");
            return [];
        }
    }

    async Task<List<BandcampArtistModel>> IBandcampClient.DiscoverArtistsByLocationAsync(string location, int limit)
    {
        try
        {
            var geonameId = LocationMappings.TryGetValue(location, out var id) ? id : 0;
            var requestBody = new
            {
                category_id = 0,
                tag_norm_names = Array.Empty<string>(),
                geoname_id = geonameId,
                slice = "new",
                time_facet_id = (int?)null,
                cursor = "*",
                size = limit,
                include_result_types = new[] { "a", "s" }
            };

            return await CallDiscoverApi(requestBody);
        }
        catch (Exception)
        {
            _logger.LogError("Error discovering artists by location");
            return [];
        }
    }

    async Task<List<BandcampArtistModel>> IBandcampClient.DiscoverArtistsByGenresAsync(List<string> genres, string sortBy, int limit)
    {
        try
        {
            var normalizedGenres = genres.Select(NormalizeGenre).ToArray();
            var requestBody = new
            {
                category_id = 0,
                tag_norm_names = normalizedGenres,
                geoname_id = 0,
                slice = sortBy,
                time_facet_id = (int?)null,
                cursor = "*",
                size = limit,
                include_result_types = new[] { "a", "s" }
            };

            return await CallDiscoverApi(requestBody);
        }
        catch (Exception)
        {
            _logger.LogError($"Error discovering artists by genres");
            return [];
        }
    }

    async Task<List<BandcampArtistModel>> IBandcampClient.DiscoverRandomArtistsByGenreAsync(string genre, int limit)
    {
        try
        {
            var normalizedGenre = NormalizeGenre(genre);
            var requestBody = new
            {
                category_id = 0,
                tag_norm_names = new[] { normalizedGenre },
                geoname_id = 0,
                slice = "rand",
                time_facet_id = (int?)null,
                cursor = "*",
                size = limit,
                include_result_types = new[] { "a", "s" }
            };

            return await CallDiscoverApi(requestBody);
        }
        catch (Exception)
        {
            _logger.LogError("Error discovering random artists by genre");
            return [];
        }
    }

    async Task<List<BandcampArtistModel>> IBandcampClient.DiscoverRandomArtistsByGenresAsync(List<string> genres, int limit)
    {
        try
        {
            var normalizedGenres = genres.Select(NormalizeGenre).ToArray();
            var requestBody = new
            {
                category_id = 0,
                tag_norm_names = normalizedGenres,
                geoname_id = 0,
                slice = "rand",
                time_facet_id = (int?)null,
                cursor = "*",
                size = limit,
                include_result_types = new[] { "a", "s" }
            };

            return await CallDiscoverApi(requestBody);
        }
        catch (Exception)
        {
            _logger.LogError("Error discovering random artists by genres");
            return [];
        }
    }

    async Task<List<BandcampArtistModel>> IBandcampClient.DiscoverArtistsByGenresAndLocationAsync(List<string> genres, string location, string sortBy, int limit)
    {
        try
        {
            var geonameId = LocationMappings.TryGetValue(location, out var id) ? id : 0;
            var normalizedGenres = genres.Select(NormalizeGenre).ToArray();
            var requestBody = new
            {
                category_id = 0,
                tag_norm_names = normalizedGenres,
                geoname_id = geonameId,
                slice = sortBy,
                time_facet_id = (int?)null,
                cursor = "*",
                size = limit,
                include_result_types = new[] { "a", "s" }
            };

            return await CallDiscoverApi(requestBody);
        }
        catch (Exception)
        {
            _logger.LogError("Error discovering artists by genres and location");
            return [];
        }
    }

    async Task<List<BandcampArtistModel>> IBandcampClient.GetRecentReleasesAsync(int limit)
    {
        try
        {
            var requestBody = new
            {
                category_id = 0,
                tag_norm_names = Array.Empty<string>(),
                geoname_id = 0,
                slice = "new",
                time_facet_id = (int?)null,
                cursor = "*",
                size = limit,
                include_result_types = new[] { "a", "s" }
            };

            return await CallDiscoverApi(requestBody);
        }
        catch (Exception)
        {
            _logger.LogError("Error fetching recent releases");
            return [];
        }
    }

    private async Task<List<BandcampArtistModel>> CallDiscoverApi(object requestBody)
    {
        var artists = new List<BandcampArtistModel>();

        try
        {
            var json = JsonSerializer.Serialize(requestBody);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(ApiUrl, content);
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            var discoverResponse = JsonSerializer.Deserialize<BandcampDiscoverResponse>(responseContent);

            if (discoverResponse?.Results != null)
            {
                foreach (var item in discoverResponse.Results)
                {
                    var artist = ConvertToArtistModel(item);
                    if (!string.IsNullOrEmpty(artist.Name))
                    {
                        artists.Add(artist);
                    }
                }
            }
        }
        catch (Exception)
        {
            _logger.LogError("Error calling Bandcamp Discover API");
        }

        return artists;
    }

    private static BandcampArtistModel ConvertToArtistModel(BandcampDiscoverItem item)
    {
        var artist = new BandcampArtistModel
        {
            Name = item.BandName,
            Location = item.BandLocation,
            Description = null,
            BandcampUrl = item.BandUrl,
            Genres = [],
            Tags = item.ItemTags?.Select(t => t.Name).ToList() ?? [],
        };

        if (item.ItemImageId.HasValue)
        {
            artist.ImageUrl = $"https://f4.bcbits.com/img/a{item.ItemImageId}_10.jpg";
        }
        else if (item.BandLatestArtId.HasValue)
        {
            artist.ImageUrl = $"https://f4.bcbits.com/img/a{item.BandLatestArtId}_10.jpg";
        }

        return artist;
    }

    private static string NormalizeGenre(string genre)
    {
        return genre.ToLowerInvariant().Replace(" ", "-");
    }
}
