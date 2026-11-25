import { useMutation } from "@tanstack/react-query";
import { refreshToken } from "@/shared/auth/api/auth.service";
import { refreshSpotifyToken } from "@/shared/spotify/api/spotify.service";
import useAuth from "./useAuth";
import { ROUTES } from "@/shared/utils/constants";
import { useNavigate } from "react-router";

const useRefreshToken = () => {
  const { updateAuth, clearAuth } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = useMutation({
    mutationFn: async () => {
      const userData = await refreshToken();
      return userData;
    },
    onSuccess: (userData) => {
      updateAuth({
        id: userData.id,
        username: userData.username,
        accessToken: userData.accessToken,
        role: userData.role,
      });
    },
    onError: (error) => {
      console.error("Failed to refresh access token:", error);
      clearAuth();
      navigate(ROUTES.LOGIN);
    },
  });

  const handleRefreshSpotify = useMutation({
    mutationFn: async () => {
      const data = await refreshSpotifyToken();
      return data;
    },
    onSuccess: () => {
      console.log("Spotify token refreshed successfully");
    },
    onError: (error) => {
      console.error("Failed to refresh Spotify token:", error);
    },
  });

  return {
    refresh: handleRefresh.mutateAsync,
    refreshSpotifyToken: handleRefreshSpotify.mutateAsync,
    isRefreshing: handleRefresh.isPending,
    isRefreshingSpotify: handleRefreshSpotify.isPending,
    refreshError: handleRefresh.error,
    spotifyRefreshError: handleRefreshSpotify.error,
  };
};

export default useRefreshToken;
