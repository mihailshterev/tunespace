import type RecommendationFeedback from "./recommendation-feedback";

export default interface BatchRecommendationFeedback {
  interactions: RecommendationFeedback[];
}
