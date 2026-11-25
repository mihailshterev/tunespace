import type EnhancedRecommendation from "./enhanced-recommendation";

export default interface EnhancedRecommendationsResponse {
  message: string;
  totalRecommendations: number;
  hasAdaptiveLearning: boolean;
  processedAt: string;
  recommendations: EnhancedRecommendation[];
}
