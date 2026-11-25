import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCcw,
  ExternalLink,
  Wifi,
  WifiOff,
  Info,
} from "lucide-react";
import { FaSpotify } from "react-icons/fa";
import useSpotifyErrorHandler from "@/shared/spotify/hooks/useSpotifyErrorHandler";
import useSpotify from "@/shared/spotify/hooks/useSpotify";

interface SpotifyConnectionStatusProps {
  showFullCard?: boolean;
  className?: string;
  onConnectClick?: () => void;
  hideExploreButton?: boolean;
}

const SpotifyConnectionStatus = ({
  showFullCard = false,
  className = "",
  onConnectClick,
  hideExploreButton = false,
}: SpotifyConnectionStatusProps) => {
  const { isSpotifyConnected, handleSpotifyError } = useSpotifyErrorHandler();
  const {
    spotifyProfileData,
    isSpotifyProfileLoading,
    isSpotifyProfileError,
    spotifyProfileError,
    hasSpotifyConnectionError,
    hasDataErrors,
    retryAll,
    refetchProfile,
  } = useSpotify();

  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      if (hasSpotifyConnectionError) {
        await refetchProfile();
      } else if (hasDataErrors) {
        retryAll();
      }
    } finally {
      setIsRetrying(false);
    }
  };
  const handleReconnect = () => {
    if (onConnectClick) {
      onConnectClick();
    } else {
      window.location.href = "/api/spotify/auth";
    }
  };

  const getConnectionStatus = () => {
    if (isSpotifyProfileLoading) {
      return {
        status: "loading",
        icon: <RefreshCcw className="h-4 w-4 animate-spin" />,
        text: "Checking connection...",
        variant: "secondary" as const,
      };
    }

    if (hasSpotifyConnectionError || !isSpotifyConnected()) {
      return {
        status: "disconnected",
        icon: <XCircle className="h-4 w-4" />,
        text: "Not connected",
        variant: "destructive" as const,
      };
    }

    if (hasDataErrors) {
      return {
        status: "partial",
        icon: <AlertCircle className="h-4 w-4" />,
        text: "Partial connection",
        variant: "secondary" as const,
      };
    }

    if (spotifyProfileData) {
      return {
        status: "connected",
        icon: <CheckCircle className="h-4 w-4" />,
        text: "Connected",
        variant: "default" as const,
      };
    }

    return {
      status: "unknown",
      icon: <WifiOff className="h-4 w-4" />,
      text: "Unknown",
      variant: "outline" as const,
    };
  };

  const connectionStatus = getConnectionStatus();

  if (!showFullCard) {
    return (
      <Badge
        variant={connectionStatus.variant}
        className={`flex items-center gap-2 ${className}`}
      >
        <FaSpotify className="h-3 w-3" />
        {connectionStatus.icon}
        {connectionStatus.text}
      </Badge>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FaSpotify className="h-5 w-5 text-[#1ed760]" />
          Spotify Connection
          <Badge variant={connectionStatus.variant} className="ml-auto">
            {connectionStatus.icon}
            {connectionStatus.text}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {spotifyProfileData && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Account:</span>
              <span className="font-medium">
                {spotifyProfileData.profile?.spotifyPlan || "Free"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Followers:</span>
              <span className="font-medium">
                {spotifyProfileData.profile?.followerCount || 0}
              </span>
            </div>
          </div>
        )}
        {hasSpotifyConnectionError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your Spotify account is not connected or the connection has
              expired. Please reconnect to access your music data.
            </AlertDescription>
          </Alert>
        )}
        {hasDataErrors && !hasSpotifyConnectionError && (
          <Alert>
            <Wifi className="h-4 w-4" />
            <AlertDescription>
              Some Spotify data couldn&apos;t be loaded. This might be due to
              network issues or temporary Spotify API problems.
            </AlertDescription>
          </Alert>
        )}
        {isSpotifyProfileError && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              {handleSpotifyError(spotifyProfileError).message}
            </AlertDescription>
          </Alert>
        )}{" "}
        <div className="flex gap-2">
          {hasSpotifyConnectionError ? (
            <Button
              onClick={handleReconnect}
              className="flex items-center gap-2"
              size="sm"
            >
              <FaSpotify className="h-4 w-4" />
              Connect Spotify
              {!onConnectClick && <ExternalLink className="h-3 w-3" />}
            </Button>
          ) : hasDataErrors ? (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCcw
                className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              Retry
            </Button>
          ) : !hideExploreButton ? (
            <Button
              onClick={() => window.open("https://open.spotify.com", "_blank")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <FaSpotify className="h-4 w-4" />
              Open Spotify
              <ExternalLink className="h-3 w-3" />
            </Button>
          ) : null}

          {spotifyProfileData && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCcw
                className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          )}
        </div>
        <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
          <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <p className="text-xs text-muted-foreground">
            Spotify data is used to enhance your experience with personalized
            recommendations, listening stats, and music discovery features.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpotifyConnectionStatus;
