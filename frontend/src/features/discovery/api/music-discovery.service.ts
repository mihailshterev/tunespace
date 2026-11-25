import httpClient from "@/shared/api/http-client";
import { BASE_URL } from "@/shared/utils/constants";
import type {
  RecommendationFeedback,
  BatchRecommendationFeedback,
  EnhancedRecommendationsResponse,
  RecommendationFeedbackResponse,
  BatchRecommendationFeedbackResponse,
  UserLocation,
  UserPreferences,
} from "@/features/discovery/types";

const baseUrl = `${BASE_URL}/MusicDiscovery`;

export const getRecommendations = async (
  genres?: string[],
  location?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any[]> => {
  let url = `${baseUrl}/recommendations`;
  const params = new URLSearchParams();

  if (genres && genres.length > 0) {
    params.append("genres", genres.join(","));
  }

  if (location) {
    params.append("location", location);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await httpClient.get(url);
  return response.data;
};

export const getEnhancedRecommendations = async (
  genres?: string[],
  location?: string
): Promise<EnhancedRecommendationsResponse> => {
  let url = `${baseUrl}/recommendations/enhanced`;
  const params = new URLSearchParams();

  if (genres && genres.length > 0) {
    params.append("genres", genres.join(","));
  }

  if (location) {
    params.append("location", location);
  }

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await httpClient.get(url);
  return response.data;
};

export const trackRecommendationFeedback = async (
  feedback: RecommendationFeedback
): Promise<RecommendationFeedbackResponse> => {
  const response = await httpClient.post(`${baseUrl}/feedback`, feedback);
  return response.data;
};

export const trackBatchRecommendationFeedback = async (
  batchFeedback: BatchRecommendationFeedback
): Promise<BatchRecommendationFeedbackResponse> => {
  const response = await httpClient.post(
    `${baseUrl}/feedback/batch`,
    batchFeedback
  );
  return response.data;
};

export const getRecommendationsByPreferences = async (
  preferences: UserPreferences
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  const response = await httpClient.post(
    `${baseUrl}/recommendations/preferences`,
    preferences
  );
  return response.data;
};

export const getEnhancedRecommendationsByPreferences = async (
  preferences: UserPreferences
): Promise<EnhancedRecommendationsResponse> => {
  const response = await httpClient.post(
    `${baseUrl}/recommendations/enhanced/preferences`,
    preferences
  );
  return response.data;
};

export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
} | null> => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.warn("Geolocation error:", error);
        resolve(null);
      },
      {
        timeout: 10000,
        maximumAge: 300000,
        enableHighAccuracy: false,
      }
    );
  });
};

export const getLocationFromCoordinates = async (
  latitude: number,
  longitude: number
): Promise<UserLocation | null> => {
  try {
    const response = await httpClient.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
    );

    const data = response.data;

    if (data.address) {
      return {
        country: data.address.country || "Unknown",
        city:
          data.address.city ||
          data.address.town ||
          data.address.village ||
          "Unknown",
        latitude,
        longitude,
        detectionMethod: "coordinates",
      };
    }

    return null;
  } catch (error) {
    console.warn("Reverse geocoding error:", error);
    return null;
  }
};
