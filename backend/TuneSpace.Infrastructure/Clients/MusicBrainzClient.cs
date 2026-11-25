using System.Text.Json;
using System.Web;
using TuneSpace.Core.DTOs.Responses.MusicBrainz;
using TuneSpace.Core.Interfaces.IClients;
using TuneSpace.Core.Models;

namespace TuneSpace.Infrastructure.Clients;

internal class MusicBrainzClient : IMusicBrainzClient
{
    private readonly HttpClient _httpClient;
    private const string BaseUrl = "https://musicbrainz.org/ws/2";

    public MusicBrainzClient(HttpClient httpClient)
    {
        _httpClient = httpClient;

        _httpClient.DefaultRequestHeaders.Add("User-Agent", "TuneSpace/1.0 (info@tunespace.com)");
        _httpClient.DefaultRequestHeaders.Add("Accept", "application/json");
    }

    async Task<BandModel> IMusicBrainzClient.GetBandDataAsync(string bandName)
    {
        var apiUrl = $"{BaseUrl}/artist/?query=artist:{bandName}&fmt=json";
        var response = await _httpClient.GetStringAsync(apiUrl);

        var bandData = JsonSerializer.Deserialize<MusicBrainzArtistSearchResponse>(response);
        var artist = bandData?.Artists?.FirstOrDefault();

        if (artist == null)
        {
            return new BandModel { Name = bandName };
        }

        var name = artist.Name ?? bandName;
        var country = artist.Country ?? "Unknown";
        var tags = artist.Tags;

        var bandModel = new BandModel
        {
            Name = name,
            Location = country,
            Genres = tags?.Select(t => t.Name ?? "").Where(t => !string.IsNullOrEmpty(t)).ToList() ?? []
        };

        return bandModel;
    }

    async Task<List<BandModel>> IMusicBrainzClient.GetBandsByLocationAsync(string location, int limit, List<string>? genres)
    {
        var query = $"area:{HttpUtility.UrlEncode(location)}";

        if (genres != null && genres.Count > 0)
        {
            var genreQuery = string.Join(" OR ", genres.Select(g => $"tag:{HttpUtility.UrlEncode(g)}"));
            query += $" AND ({genreQuery})";
        }
        else
        {
            query += " AND tag:rock";
        }

        var apiUrl = $"{BaseUrl}/artist/?query={query}&limit={limit}&fmt=json";
        var response = await _httpClient.GetAsync(apiUrl);
        if (response.StatusCode != System.Net.HttpStatusCode.OK)
        {
            throw new Exception($"Error fetching data from MusicBrainz: {response.StatusCode}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        var data = JsonSerializer.Deserialize<MusicBrainzArtistSearchResponse>(responseContent);

        var bands = new List<BandModel>();
        var artists = data?.Artists;

        if (artists == null)
        {
            return bands;
        }

        foreach (var artist in artists)
        {
            var name = artist.Name;
            var country = artist.Country;
            var tags = artist.Tags;

            if (!string.IsNullOrEmpty(name))
            {
                bands.Add(new BandModel
                {
                    Name = name,
                    Location = country ?? location,
                    Genres = tags?.Select(t => t.Name ?? "")
                        .Where(t => !string.IsNullOrEmpty(t))
                        .ToList() ?? []
                });
            }
        }

        return bands;
    }
}
