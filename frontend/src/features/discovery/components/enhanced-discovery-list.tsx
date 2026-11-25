import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import {
  ThumbsUp,
  ThumbsDown,
  Brain,
  Users,
  Search,
  TrendingUp,
  Zap,
  Target,
  ExternalLink,
} from "lucide-react";
import { FaSpotify } from "react-icons/fa";
import { useRecommendationExperience } from "@/features/discovery/hooks/useEnhancedRecommendations";
import { Slider } from "@/shared/ui/slider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import Loading from "@/shared/ui/loading";

interface EnhancedDiscoveryListProps {
  genres?: string[];
  location?: string;
  enableEnhanced?: boolean;
}

const EnhancedDiscoveryList: React.FC<EnhancedDiscoveryListProps> = ({
  genres = ["metal", "rock"],
  location,
  enableEnhanced = true,
}) => {
  const [showConfidenceControls, setShowConfidenceControls] = useState(false);
  const [, setSelectedRecommendation] = useState<
    string | null
  >(null);

  const {
    recommendations,
    isLoading,
    isFetching,
    error,
    hasAdaptiveLearning,
    totalRecommendations,
    confidenceThreshold,
    setConfidenceThreshold,
    highConfidenceCount,
    enhancedAICount,
    collaborativeCount,
    pendingCount,
    submitBatchFeedback,
    queueLike,
    queueDislike,
    refetch,
  } = useRecommendationExperience(
    {
      genres,
      location,
      enableEnhanced,
      enabled: true,
    },
    {
      onSuccess: (data) => {
        console.log("Feedback submitted successfully:", data);
      },
      onError: (error) => {
        console.error("Feedback submission failed:", error);
      },
    }
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSourceIcon = (recommendation: any) => {
    if (recommendation.isEnhancedAI) return <Brain className="w-4 h-4" />;
    if (recommendation.isCollaborativeFiltering)
      return <Users className="w-4 h-4" />;
    return <Search className="w-4 h-4" />;
  };

  const isSpotifyUrl = (url: string) => {
    if (!url) {
      return false;
    }

    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      return (
        hostname === "spotify.com" ||
        hostname === "open.spotify.com" ||
        hostname === "www.spotify.com" ||
        hostname.endsWith(".spotify.com")
      );
    } catch {
      return false;
    }
  };

  const getExternalLinkInfo = (url: string) => {
    if (isSpotifyUrl(url)) {
      return {
        label: "Listen on Spotify",
        icon: <FaSpotify className="w-4 h-4" />,
        className:
          "bg-green-100 hover:bg-green-200 text-green-800 border-green-300",
      };
    }
    return {
      label: "Open Link",
      icon: <ExternalLink className="w-4 h-4" />,
      className: "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300",
    };
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return "text-green-600 bg-green-50";
    if (score >= 0.6) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <Brain className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-primary/90 mb-2">
              AI is analyzing your preferences...
            </div>
            <div className="text-sm text-muted-foreground">
              {enableEnhanced
                ? "Using enhanced AI recommendations with confidence scoring"
                : "Loading standard recommendations"}
            </div>
          </div>
          <Loading />
        </div>
      </div>
    );
  }
  if (error) {
    const isAIError =
      error?.message?.includes("AI") || error?.message?.includes("confidence");
    const isNetworkError =
      error?.message?.includes("network") || error?.message?.includes("fetch");
    const isAuthError =
      error?.message?.includes("unauthorized") ||
      error?.message?.includes("403");

    return (
      <div className="p-8 text-destructive bg-destructive/10 rounded-2xl text-center my-6 border border-destructive/20">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-destructive/10 rounded-xl">
            {isAIError ? (
              <Brain className="w-6 h-6 text-destructive" />
            ) : isNetworkError ? (
              <Zap className="w-6 h-6 text-destructive" />
            ) : (
              <Target className="w-6 h-6 text-destructive" />
            )}
          </div>
          <div>
            <div className="font-semibold mb-1">
              {isAIError
                ? "AI Recommendation Engine Unavailable"
                : isNetworkError
                ? "Network Connection Error"
                : isAuthError
                ? "Authentication Required"
                : "Failed to load recommendations"}
            </div>
            <div className="text-sm text-muted-foreground">
              {isAIError
                ? "The enhanced AI recommendation system is temporarily unavailable. Try standard recommendations instead."
                : isNetworkError
                ? "Please check your internet connection and try again."
                : isAuthError
                ? "Please sign in to access enhanced AI recommendations."
                : error?.message || "An unexpected error occurred"}
            </div>
          </div>{" "}
          <div className="flex gap-2">
            <Button onClick={() => refetch()} variant="outline" size="sm">
              Try Again
            </Button>
            {isAIError && (
              <Button
                onClick={() => (window.location.href = "/discover")}
                variant="secondary"
                size="sm"
              >
                Standard Discovery
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-full py-8">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                    {enableEnhanced ? "Enhanced AI" : "Standard"}{" "}
                    Recommendations
                  </h2>
                  <p className="text-muted-foreground mt-1">
                    {enableEnhanced
                      ? "Advanced AI with confidence scoring and adaptive learning"
                      : "Standard music discovery recommendations"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={() => refetch()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <TrendingUp className="w-4 h-4" />
                Refresh
              </Button>

              {enableEnhanced && (
                <Button
                  onClick={() =>
                    setShowConfidenceControls(!showConfidenceControls)
                  }
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Target className="w-4 h-4" />
                  Controls
                </Button>
              )}
            </div>
          </div>

          {enableEnhanced && showConfidenceControls && (
            <Card className="mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  AI Recommendation Controls
                </CardTitle>
                <CardDescription>
                  Fine-tune your recommendation experience with advanced AI
                  settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Confidence Threshold:{" "}
                    {(confidenceThreshold * 100).toFixed(0)}%
                  </label>
                  <Slider
                    value={[confidenceThreshold]}
                    onValueChange={(value) => setConfidenceThreshold(value[0])}
                    min={0}
                    max={1}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Higher values show only more confident AI recommendations
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="font-semibold text-green-700">
                      {highConfidenceCount}
                    </div>
                    <div className="text-green-600">High Confidence</div>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="font-semibold text-blue-700">
                      {enhancedAICount}
                    </div>
                    <div className="text-blue-600">Enhanced AI</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="font-semibold text-purple-700">
                      {collaborativeCount}
                    </div>
                    <div className="text-purple-600">Collaborative</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {pendingCount > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <Zap className="w-5 h-5 text-amber-600" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-amber-800">
                    {pendingCount} feedback item{pendingCount > 1 ? "s" : ""}{" "}
                    pending
                  </div>
                  <div className="text-xs text-amber-600">
                    Your feedback helps improve AI recommendations
                  </div>
                </div>
                <Button
                  onClick={submitBatchFeedback}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  Submit All
                </Button>
              </div>
            </div>
          )}

          {enableEnhanced && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <div>Total: {totalRecommendations}</div>
              {hasAdaptiveLearning && (
                <Badge variant="secondary" className="text-xs">
                  Adaptive Learning Active
                </Badge>
              )}
            </div>
          )}
        </div>

        {recommendations.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-muted/50 rounded-2xl inline-block mb-4">
              <Brain className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              No recommendations found
            </h3>
            <p className="text-muted-foreground">
              Try adjusting your confidence threshold or refresh for new
              recommendations
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.map((recommendation, index) => (
              <Card
                key={`${recommendation.name}-${index}`}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col h-full"
                onClick={() => setSelectedRecommendation(recommendation.name)}
              >
                {" "}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg font-semibold mb-1">
                        {recommendation.name}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {recommendation.description ||
                          "No description available"}
                      </CardDescription>
                    </div>

                    <div className="flex flex-col gap-1 ml-3">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1 text-xs"
                          >
                            {getSourceIcon(recommendation)}
                            {recommendation.sourceLabel}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{recommendation.dataSource}</p>
                        </TooltipContent>
                      </Tooltip>

                      {enableEnhanced && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              className={`text-xs ${getConfidenceColor(
                                recommendation.confidenceScore
                              )}`}
                            >
                              {(recommendation.confidenceScore * 100).toFixed(
                                0
                              )}
                              %
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>AI Confidence Score</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>{" "}
                </CardHeader>
                <CardContent className="pt-0 flex-1 flex flex-col">
                  {recommendation.genres &&
                    recommendation.genres.length > 0 && (
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {recommendation.genres
                            .slice(0, 3)
                            .map((genre: string) => (
                              <Badge
                                key={genre}
                                variant="outline"
                                className="text-xs"
                              >
                                {genre}
                              </Badge>
                            ))}
                          {recommendation.genres.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{recommendation.genres.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                  <div className="flex-1"></div>

                  <div className="flex justify-between items-center mt-auto">
                    <div className="flex gap-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              queueLike(
                                recommendation.name,
                                recommendation.genres
                              );
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Like this recommendation</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              queueDislike(
                                recommendation.name,
                                recommendation.genres
                              );
                            }}
                            className="h-8 w-8 p-0"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Dislike this recommendation</p>
                        </TooltipContent>
                      </Tooltip>

                      {recommendation.externalUrl && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(
                                  recommendation.externalUrl,
                                  "_blank",
                                  "noopener,noreferrer"
                                );
                              }}
                              className={`h-8 px-3 gap-1 ${
                                getExternalLinkInfo(recommendation.externalUrl)
                                  .className
                              }`}
                            >
                              {
                                getExternalLinkInfo(recommendation.externalUrl)
                                  .icon
                              }
                              <span className="text-xs font-medium">
                                {isSpotifyUrl(recommendation.externalUrl)
                                  ? "Spotify"
                                  : "Open"}
                              </span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>
                              {
                                getExternalLinkInfo(recommendation.externalUrl)
                                  .label
                              }
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>

                    {recommendation.isHighConfidence && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        High Confidence
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedDiscoveryList;
