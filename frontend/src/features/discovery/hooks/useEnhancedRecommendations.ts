/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  RecommendationFeedback,
  BatchRecommendationFeedback,
} from "@/features/discovery/types";
import {
  getEnhancedRecommendations,
  getRecommendations,
  trackRecommendationFeedback,
  trackBatchRecommendationFeedback,
} from "@/features/discovery/api/music-discovery.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useCallback } from "react";

export interface UseEnhancedRecommendationsOptions {
  genres?: string[];
  location?: string;
  enableEnhanced?: boolean;
  enabled?: boolean;
}

export interface UseRecommendationFeedbackOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

//TODO: Refactor
export const useEnhancedRecommendations = ({
  genres,
  location,
  enableEnhanced = true,
  enabled = true,
}: UseEnhancedRecommendationsOptions = {}) => {
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5);
  const [feedbackHistory] = useState<
    Map<string, RecommendationFeedback>
  >(new Map());

  const enhancedQuery = useQuery({
    queryKey: ["enhancedRecommendations", genres, location],
    queryFn: () => getEnhancedRecommendations(genres, location),
    enabled: enabled && enableEnhanced,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const regularQuery = useQuery({
    queryKey: ["recommendations", genres, location],
    queryFn: () => getRecommendations(genres, location),
    enabled: enabled && !enableEnhanced,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const filteredRecommendations = enhancedQuery.data?.recommendations?.filter(
    (rec) => rec.confidenceScore >= confidenceThreshold
  );

  const recommendationsWithMetadata = filteredRecommendations?.map((rec) => ({
    ...rec,
    isHighConfidence: rec.confidenceScore >= 0.8,
    sourceIcon: rec.isEnhancedAI
      ? "🤖"
      : rec.isCollaborativeFiltering
      ? "👥"
      : "🔍",
    sourceLabel: rec.isEnhancedAI
      ? "Enhanced AI"
      : rec.isCollaborativeFiltering
      ? "Similar Users"
      : "Standard",
  }));

  return {
    data: enableEnhanced ? enhancedQuery.data : regularQuery.data,
    recommendations: enableEnhanced
      ? recommendationsWithMetadata || []
      : regularQuery.data || [],

    isLoading: enableEnhanced
      ? enhancedQuery.isLoading
      : regularQuery.isLoading,
    isFetching: enableEnhanced
      ? enhancedQuery.isFetching
      : regularQuery.isFetching,

    error: enableEnhanced ? enhancedQuery.error : regularQuery.error,

    hasAdaptiveLearning: enhancedQuery.data?.hasAdaptiveLearning || false,
    totalRecommendations: enhancedQuery.data?.totalRecommendations || 0,
    processedAt: enhancedQuery.data?.processedAt,

    confidenceThreshold,
    setConfidenceThreshold,

    feedbackHistory,

    refetch: enableEnhanced ? enhancedQuery.refetch : regularQuery.refetch,

    highConfidenceCount:
      recommendationsWithMetadata?.filter((r) => r.isHighConfidence).length ||
      0,
    enhancedAICount:
      recommendationsWithMetadata?.filter((r) => r.isEnhancedAI).length || 0,
    collaborativeCount:
      recommendationsWithMetadata?.filter((r) => r.isCollaborativeFiltering)
        .length || 0,
  };
};

export const useRecommendationFeedback = (
  options: UseRecommendationFeedbackOptions = {}
) => {
  const queryClient = useQueryClient();
  const [pendingFeedback, setPendingFeedback] = useState<
    RecommendationFeedback[]
  >([]);

  const feedbackMutation = useMutation({
    mutationFn: (feedback: RecommendationFeedback) =>
      trackRecommendationFeedback(feedback),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["enhancedRecommendations"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });

  const batchFeedbackMutation = useMutation({
    mutationFn: (batchFeedback: BatchRecommendationFeedback) =>
      trackBatchRecommendationFeedback(batchFeedback),
    onSuccess: (data) => {
      setPendingFeedback([]);
      queryClient.invalidateQueries({ queryKey: ["enhancedRecommendations"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      options.onSuccess?.(data);
    },
    onError: options.onError,
  });

  const submitFeedback = useCallback(
    (feedback: RecommendationFeedback) => {
      feedbackMutation.mutate(feedback);
    },
    [feedbackMutation]
  );

  const queueFeedback = useCallback((feedback: RecommendationFeedback) => {
    setPendingFeedback((prev) => {
      const filtered = prev.filter((f) => f.artistName !== feedback.artistName);
      return [...filtered, feedback];
    });
  }, []);

  const submitBatchFeedback = useCallback(() => {
    console.log(pendingFeedback);
    if (pendingFeedback.length > 0) {
      batchFeedbackMutation.mutate({
        interactions: pendingFeedback.map((feedback) => ({
          artistName: feedback.artistName,
          interactionType: feedback.interactionType,
          rating: feedback.rating,
          genres: feedback.genres,
        })),
      });
    }
  }, [batchFeedbackMutation, pendingFeedback]);

  const autoSubmitThreshold = 5;
  const shouldAutoSubmit = pendingFeedback.length >= autoSubmitThreshold;

  if (shouldAutoSubmit && !batchFeedbackMutation.isPending) {
    submitBatchFeedback();
  }

  return {
    submitFeedback,
    feedbackLoading: feedbackMutation.isPending,
    feedbackError: feedbackMutation.error,

    queueFeedback,
    submitBatchFeedback,
    batchFeedbackLoading: batchFeedbackMutation.isPending,
    batchFeedbackError: batchFeedbackMutation.error,

    pendingFeedback,
    pendingCount: pendingFeedback.length,
    hasPendingFeedback: pendingFeedback.length > 0,

    autoSubmitThreshold,
    shouldAutoSubmit,

    clearPendingFeedback: () => setPendingFeedback([]),
  };
};

export const useRecommendationExperience = (
  recommendationOptions: UseEnhancedRecommendationsOptions = {},
  feedbackOptions: UseRecommendationFeedbackOptions = {}
) => {
  const recommendations = useEnhancedRecommendations(recommendationOptions);
  const feedback = useRecommendationFeedback(feedbackOptions);

  return {
    ...recommendations,
    ...feedback,

    likeRecommendation: (artistName: string, genres: string[]) =>
      feedback.submitFeedback({
        artistName,
        interactionType: "like",
        genres,
      }),

    dislikeRecommendation: (artistName: string, genres: string[]) =>
      feedback.submitFeedback({
        artistName,
        interactionType: "dislike",
        genres,
      }),

    rateRecommendation: (artistName: string, rating: number) =>
      feedback.submitFeedback({
        artistName,
        interactionType: "rating",
        rating,
      }),

    queueLike: (artistName: string, genres: string[]) =>
      feedback.queueFeedback({
        artistName,
        interactionType: "like",
        genres,
      }),

    queueDislike: (artistName: string, genres: string[]) =>
      feedback.queueFeedback({
        artistName,
        interactionType: "dislike",
        genres,
      }),

    queueRating: (artistName: string, rating: number) =>
      feedback.queueFeedback({
        artistName,
        interactionType: "rating",
        rating,
      }),
  };
};
