export default interface BatchRecommendationFeedbackResponse {
  message: string;
  success: boolean;
  processedCount: number;
  totalCount: number;
  timestamp: string;
}
