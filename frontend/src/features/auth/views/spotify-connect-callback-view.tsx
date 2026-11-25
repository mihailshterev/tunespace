import { Suspense, useEffect, useState } from "react";
import { connectSpotifyAccount } from "@/shared/spotify/api/spotify.service";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";

function SpotifyConnectCallbackContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSpotifyConnect = async () => {
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

        const response = await connectSpotifyAccount(code, state);

        if (response.success) {
          toast.success("Spotify account connected successfully!");
          navigate("/home?spotify-connected=true");
        } else {
          throw new Error("Failed to connect Spotify account");
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error("Spotify connect error:", error);

        let errorMessage =
          "An error occurred while connecting your Spotify account";

        if (error.response?.status === 409) {
          errorMessage =
            error.response.data ||
            "This Spotify account is already linked to another user";
        } else if (error.response?.data) {
          errorMessage = error.response.data;
        } else if (error.message) {
          errorMessage = error.message;
        }

        setError(errorMessage);
        setLoading(false);
      }
    };

    handleSpotifyConnect();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Connecting your Spotify account...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-4">
            Connection Error
          </h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => navigate("/home")}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
            >
              Back to Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
            >
              Try Again
            </button>
          </div>
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

export function SpotifyConnectCallbackView() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SpotifyConnectCallbackContent />
    </Suspense>
  );
}
