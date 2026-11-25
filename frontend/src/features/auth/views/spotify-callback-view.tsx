import { Suspense, useEffect, useState } from "react";
import useAuth from "@/shared/auth/hooks/useAuth";
import { ENDPOINTS } from "@/shared/utils/constants";
import httpClient from "@/shared/api/http-client";
import { useNavigate, useSearchParams } from "react-router";

function SpotifyCallbackContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updateAuth } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSpotifyCallback = async () => {
      try {
        const code = searchParams.get("code");
        const state = searchParams.get("state");

        if (!code) {
          setError("No authorization code received from Spotify");
          setLoading(false);
          return;
        }

        if (!state) {
          setError("No state parameter received from Spotify");
          setLoading(false);
          return;
        }

        const response = await httpClient.post(ENDPOINTS.SPOTIFY_OAUTH, {
          code,
          state,
        });

        if (response.status !== 200) {
          throw new Error(`Authentication failed: ${response.statusText}`);
        }

        const userData = response.data;

        updateAuth({
          id: userData.id,
          username: userData.username,
          accessToken: userData.accessToken,
          role: userData.role,
          isExternalProvider: true,
        });

        navigate("/home");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Spotify OAuth error:", error);
        setError(
          error.message || "An error occurred during Spotify authentication"
        );
        setLoading(false);
      }
    };

    handleSpotifyCallback();
  }, [searchParams, updateAuth, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Completing Spotify authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Authentication Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }
  return null;
}

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-lg">Loading...</p>
      </div>
    </div>
  );
}

export function SpotifyCallbackView() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SpotifyCallbackContent />
    </Suspense>
  );
}
