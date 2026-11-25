export default interface UserPreferences {
  genres: string[];
  location?: string;
  preferredArtists?: string[];
  maxRecommendations?: number;
}
