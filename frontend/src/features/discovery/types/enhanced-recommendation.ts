export default interface EnhancedRecommendation {
  id: string;
  name: string;
  description: string;
  genres: string[];
  location: string;
  relevanceScore: number;
  dataSource: string;
  externalUrls: Record<string, string>;
  similarToArtistName?: string;
  confidenceScore: number;
  isEnhancedAI: boolean;
  isCollaborativeFiltering: boolean;
  adaptiveLearningEnabled: boolean;
}
