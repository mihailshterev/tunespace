using System.Text.Json;
using Microsoft.Extensions.Logging;
using TuneSpace.Core.DTOs.Responses.MusicDiscovery;
using TuneSpace.Core.Interfaces.IServices;

namespace TuneSpace.Application.Services;

internal class UserLocationService(
    HttpClient httpClient,
    ILogger<UserLocationService> logger) : IUserLocationService
{
    private readonly HttpClient _httpClient = httpClient;
    private readonly ILogger<UserLocationService> _logger = logger;

    async Task<UserLocationResponse?> IUserLocationService.DetectLocationByIpAsync(string ipAddress)
    {
        try
        {
            var response = await _httpClient.GetAsync($"http://ip-api.com/json/{ipAddress}");

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to get location from IP: {StatusCode}", response.StatusCode);
                return GetDefaultLocation();
            }

            var content = await response.Content.ReadAsStringAsync();
            var locationData = JsonSerializer.Deserialize<IpApiResponse>(content);

            if (locationData?.Status == "success" && !string.IsNullOrEmpty(locationData.Country))
            {
                return new UserLocationResponse(
                    Country: locationData.Country,
                    City: locationData.City ?? "Unknown",
                    Latitude: locationData.Lat,
                    Longitude: locationData.Lon,
                    DetectionMethod: "geoip"
                );
            }

            _logger.LogWarning("IP geolocation returned unsuccessful status or empty country");
            return GetDefaultLocation();
        }
        catch
        {
            return GetDefaultLocation();
        }
    }

    async Task<UserLocationResponse?> IUserLocationService.GetLocationFromCoordinatesAsync(double latitude, double longitude)
    {
        try
        {
            var response = await _httpClient.GetAsync($"https://nominatim.openstreetmap.org/reverse?format=json&lat={latitude}&lon={longitude}&accept-language=en");

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to reverse geocode coordinates: {StatusCode}", response.StatusCode);
                return GetDefaultLocation();
            }

            var content = await response.Content.ReadAsStringAsync();
            var geocodeData = JsonSerializer.Deserialize<NominatimResponse>(content);

            if (geocodeData?.Address != null)
            {
                var country = geocodeData.Address.Country ?? "Unknown";
                var city = geocodeData.Address.City
                          ?? geocodeData.Address.Town
                          ?? geocodeData.Address.Village
                          ?? "Unknown";

                return new UserLocationResponse(
                    Country: country,
                    City: city,
                    Latitude: latitude,
                    Longitude: longitude,
                    DetectionMethod: "coordinates"
                );
            }

            return GetDefaultLocation();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting location from coordinates.");
            return GetDefaultLocation();
        }
    }

    public UserLocationResponse GetDefaultLocation()
    {
        return new UserLocationResponse(
            Country: "Global",
            City: "Worldwide",
            DetectionMethod: "default"
        );
    }

    // Helper classes for JSON deserialization
    private class IpApiResponse
    {
        public string? Status { get; set; }
        public string? Country { get; set; }
        public string? City { get; set; }
        public double? Lat { get; set; }
        public double? Lon { get; set; }
    }

    private class NominatimResponse
    {
        public NominatimAddress? Address { get; set; }
    }

    private class NominatimAddress
    {
        public string? Country { get; set; }
        public string? City { get; set; }
        public string? Town { get; set; }
        public string? Village { get; set; }
    }
}
