import { useCallback } from "react";
import { HttpError } from "@/services/http-client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getSpotifyConnectionStatus } from "@/services/spotify-service";
import useAuth from "@/hooks/auth/useAuth";
import { BASE_URL, SPOTIFY_ENDPOINTS } from "@/utils/constants";

export interface SpotifyError {
  type:
    | "UNAUTHORIZED"
    | "NOT_CONNECTED"
    | "RATE_LIMITED"
    | "NETWORK_ERROR"
    | "UNKNOWN";
  message: string;
  action?: "RECONNECT" | "RETRY" | "WAIT" | "NONE";
  retryAfter?: number;
}

export const useSpotifyErrorHandler = () => {
  const router = useRouter();
  const { isAuthenticated, isLoggingOut } = useAuth();

  const { data: connectionStatus, refetch: refetchConnectionStatus } = useQuery(
    {
      queryKey: ["spotify-connection-status"],
      queryFn: getSpotifyConnectionStatus,
      staleTime: 5 * 60 * 1000,
      retry: false,
      enabled: isAuthenticated,
    },
  );

  const parseSpotifyError = useCallback((error: unknown): SpotifyError => {
    if (error instanceof HttpError) {
      const status = error.response?.status;
      const responseData = error.response?.data;

      switch (status) {
        case 401:
          return {
            type: "UNAUTHORIZED",
            message:
              "Your Spotify session has expired. Please reconnect your account.",
            action: "RECONNECT",
          };

        case 403:
          if (
            responseData?.error?.message?.includes("insufficient client scope")
          ) {
            return {
              type: "NOT_CONNECTED",
              message:
                "Additional Spotify permissions required. Please reconnect your account.",
              action: "RECONNECT",
            };
          }
          return {
            type: "UNAUTHORIZED",
            message: "Access to this Spotify feature is restricted.",
            action: "NONE",
          };

        case 429:
          const retryAfter = parseInt(
            error.response?.headers["retry-after"] || "60",
          );
          return {
            type: "RATE_LIMITED",
            message: `Spotify rate limit exceeded. Please wait ${retryAfter} seconds before trying again.`,
            action: "WAIT",
            retryAfter,
          };

        case 500:
        case 502:
        case 503:
        case 504:
          return {
            type: "NETWORK_ERROR",
            message:
              "Spotify services are temporarily unavailable. Please try again later.",
            action: "RETRY",
          };

        default:
          if (!status || status >= 500) {
            return {
              type: "NETWORK_ERROR",
              message:
                "Unable to connect to Spotify. Please check your internet connection.",
              action: "RETRY",
            };
          }
      }
    }

    if (error instanceof Error) {
      if (
        error.message.includes("Network Error") ||
        error.message.includes("timeout")
      ) {
        return {
          type: "NETWORK_ERROR",
          message:
            "Connection to Spotify failed. Please check your internet connection.",
          action: "RETRY",
        };
      }
    }

    return {
      type: "UNKNOWN",
      message: "An unexpected error occurred while connecting to Spotify.",
      action: "RETRY",
    };
  }, []);

  const handleSpotifyError = useCallback(
    (error: unknown, customMessage?: string, showToast: boolean = true) => {
      const spotifyError = parseSpotifyError(error);

      const message = customMessage || spotifyError.message;

      if (!isLoggingOut && isAuthenticated && showToast) {
        switch (spotifyError.type) {
          case "UNAUTHORIZED":
          case "NOT_CONNECTED":
            toast.warning(message, {
              action:
                spotifyError.action === "RECONNECT"
                  ? {
                      label: "Reconnect Spotify",
                      onClick: () =>
                        router.push(`${BASE_URL}/${SPOTIFY_ENDPOINTS.CONNECT}`),
                    }
                  : undefined,
            });
            break;

          case "RATE_LIMITED":
            toast.warning(message, {
              description: "This is temporary and will resolve automatically.",
            });
            break;

          case "NETWORK_ERROR":
            toast.error(message, {
              action: {
                label: "Retry",
                onClick: () => window.location.reload(),
              },
            });
            break;

          default:
            toast.error(message);
            break;
        }
      }
      return spotifyError;
    },
    [parseSpotifyError, router, isLoggingOut, isAuthenticated],
  );

  const isSpotifyConnected = useCallback(() => {
    if (!isAuthenticated) {
      return false;
    }
    return Boolean(connectionStatus?.isConnected);
  }, [connectionStatus?.isConnected, isAuthenticated]);

  const parseSpotifyErrorSilent = useCallback(
    (error: unknown): SpotifyError => {
      return parseSpotifyError(error);
    },
    [parseSpotifyError],
  );

  return {
    handleSpotifyError,
    parseSpotifyError,
    parseSpotifyErrorSilent,
    isSpotifyConnected,
    refetchConnectionStatus,
  };
};

export default useSpotifyErrorHandler;
