export default interface RecommendationFeedback {
  artistName: string;
  interactionType: "like" | "dislike" | "thumbs_up" | "thumbs_down" | "rating";
  rating?: number;
  genres?: string[];
}
