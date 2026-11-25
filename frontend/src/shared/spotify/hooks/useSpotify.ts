import { useQuery } from "@tanstack/react-query";
import {
  getSpotifyProfile,
  getTodayListeningStats,
  getThisWeekListeningStats,
  getRecentlyPlayedTracks,
  getFollowedArtists,
} from "@/shared/spotify/api/spotify.service";
import useSpotifyErrorHandler from "./useSpotifyErrorHandler";
import useAuth from "@/shared/auth/hooks/useAuth";
import { useCallback } from "react";

const useSpotify = () => {
  const { parseSpotifyErrorSilent, isSpotifyConnected } =
    useSpotifyErrorHandler();

  const { isAuthenticated } = useAuth();

  const {
    data: spotifyProfileData,
    isLoading: isSpotifyProfileLoading,
    isError: isSpotifyProfileError,
    error: spotifyProfileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["spotify"],
    queryFn: getSpotifyProfile,
    retry: (failureCount, error) => {
      const spotifyError = parseSpotifyErrorSilent(error);
      return spotifyError.type === "NETWORK_ERROR" && failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated && isSpotifyConnected(),
  });

  const isSpotifyDataAvailable = !!spotifyProfileData && !isSpotifyProfileError;

  const {
    data: todayStats,
    isLoading: isTodayStatsLoading,
    isError: isTodayStatsError,
    error: todayStatsError,
    refetch: refetchTodayStats,
  } = useQuery({
    queryKey: ["spotify-today-stats"],
    queryFn: getTodayListeningStats,
    enabled: isSpotifyDataAvailable,
    retry: (failureCount, error) => {
      const spotifyError = parseSpotifyErrorSilent(error);
      return spotifyError.type === "NETWORK_ERROR" && failureCount < 2;
    },
    staleTime: 10 * 60 * 1000,
  });

  const {
    data: thisWeekStats,
    isLoading: isThisWeekStatsLoading,
    isError: isThisWeekStatsError,
    error: thisWeekStatsError,
    refetch: refetchThisWeekStats,
  } = useQuery({
    queryKey: ["spotify-week-stats"],
    queryFn: getThisWeekListeningStats,
    enabled: isSpotifyDataAvailable,
    retry: (failureCount, error) => {
      const spotifyError = parseSpotifyErrorSilent(error);
      return spotifyError.type === "NETWORK_ERROR" && failureCount < 2;
    },
    staleTime: 30 * 60 * 1000,
  });

  const {
    data: recentlyPlayedTracks,
    isLoading: isRecentlyPlayedLoading,
    isError: isRecentlyPlayedError,
    error: recentlyPlayedError,
    refetch: refetchRecentlyPlayed,
  } = useQuery({
    queryKey: ["spotify-recently-played"],
    queryFn: getRecentlyPlayedTracks,
    enabled: isSpotifyDataAvailable,
    retry: (failureCount, error) => {
      const spotifyError = parseSpotifyErrorSilent(error);
      return spotifyError.type === "NETWORK_ERROR" && failureCount < 2;
    },
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: followedArtists,
    isLoading: isFollowedArtistsLoading,
    isError: isFollowedArtistsError,
    error: followedArtistsError,
    refetch: refetchFollowedArtists,
  } = useQuery({
    queryKey: ["spotify-followed-artists"],
    queryFn: getFollowedArtists,
    enabled: isSpotifyDataAvailable,
    retry: (failureCount, error) => {
      const spotifyError = parseSpotifyErrorSilent(error);
      return spotifyError.type === "NETWORK_ERROR" && failureCount < 2;
    },
    staleTime: 15 * 60 * 1000,
  });

  const isLoading =
    isSpotifyProfileLoading ||
    (isSpotifyDataAvailable &&
      (isTodayStatsLoading ||
        isThisWeekStatsLoading ||
        isRecentlyPlayedLoading ||
        isFollowedArtistsLoading));

  const hasSpotifyConnectionError =
    isSpotifyProfileError && !isSpotifyConnected();

  const hasDataErrors =
    isTodayStatsError ||
    isThisWeekStatsError ||
    isRecentlyPlayedError ||
    isFollowedArtistsError;

  const retryAll = useCallback(() => {
    if (isSpotifyProfileError) refetchProfile();
    if (isTodayStatsError) refetchTodayStats();
    if (isThisWeekStatsError) refetchThisWeekStats();
    if (isRecentlyPlayedError) refetchRecentlyPlayed();
    if (isFollowedArtistsError) refetchFollowedArtists();
  }, [
    isSpotifyProfileError,
    refetchProfile,
    isTodayStatsError,
    refetchTodayStats,
    isThisWeekStatsError,
    refetchThisWeekStats,
    isRecentlyPlayedError,
    refetchRecentlyPlayed,
    isFollowedArtistsError,
    refetchFollowedArtists,
  ]);

  return {
    spotifyProfileData,
    todayStats,
    thisWeekStats,
    recentlyPlayedTracks,
    followedArtists,
    isSpotifyProfileLoading,
    isTodayStatsLoading,
    isThisWeekStatsLoading,
    isRecentlyPlayedLoading,
    isFollowedArtistsLoading,
    isLoading,
    isSpotifyProfileError,
    isTodayStatsError,
    isThisWeekStatsError,
    isRecentlyPlayedError,
    isFollowedArtistsError,
    hasSpotifyConnectionError,
    hasDataErrors,
    spotifyProfileError,
    todayStatsError,
    thisWeekStatsError,
    recentlyPlayedError,
    followedArtistsError,
    isSpotifyConnected,
    isSpotifyDataAvailable,
    retryAll,
    refetchProfile,
    refetchTodayStats,
    refetchThisWeekStats,
    refetchRecentlyPlayed,
    refetchFollowedArtists,
  };
};

export default useSpotify;
