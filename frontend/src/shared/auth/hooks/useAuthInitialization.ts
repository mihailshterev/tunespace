import { useEffect, useState } from "react";
import useAuth from "./useAuth";
import useRefreshToken from "./useRefreshToken";
import { checkCurrentUser } from "@/shared/auth/api/auth.service";

/**
 * Custom hook to handle authentication initialization
 * Attempts to restore auth state from HTTP-only cookies on app load
 */
const useAuthInitialization = () => {
  const { auth, updateAuth, clearAuth, isLoggingOut } = useAuth();
  const { refresh, refreshSpotifyToken, isRefreshing, isRefreshingSpotify } =
    useRefreshToken();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        if (auth?.accessToken && auth?.username) {
          if (isMounted) {
            setIsInitialized(true);
          }
          return;
        }

        const currentUser = await checkCurrentUser();

        if (currentUser && currentUser.username) {
          try {
            const refreshResult = await refresh();
            updateAuth({
              id: currentUser.id,
              username: currentUser.username,
              email: currentUser.email,
              accessToken: refreshResult.accessToken,
              role: currentUser.role,
              isExternalProvider: currentUser.isExternalProvider,
            });

            try {
              await refreshSpotifyToken();
            } catch {
              console.log(
                "Spotify token refresh failed, continuing without it"
              );
            }
          } catch (refreshError) {
            console.error(
              "Token refresh failed during initialization:",
              refreshError
            );
            clearAuth();
          }
        } else {
          try {
            await refresh();

            try {
              await refreshSpotifyToken();
            } catch {
              console.log(
                "Spotify token refresh failed, continuing without it"
              );
            }
          } catch {
            console.log(
              "Authentication initialization failed, user needs to login"
            );
            clearAuth();
          }
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        clearAuth();
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    if (!isInitialized) {
      initializeAuth();
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialized]);

  return {
    isInitialized,
    isInitializing:
      !isInitialized || isRefreshing || isRefreshingSpotify || isLoggingOut,
    hasValidAuth: Boolean(auth?.accessToken && auth?.username && !isLoggingOut),
  };
};

export default useAuthInitialization;
