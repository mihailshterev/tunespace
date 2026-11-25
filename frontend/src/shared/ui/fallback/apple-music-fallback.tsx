import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import {
  Music,
  TrendingUp,
  Headphones,
  ExternalLink,
  Sparkles,
  Volume2,
  Star,
  Clock,
} from "lucide-react";
import { SiApplemusic } from "react-icons/si";
import { Link } from "react-router";

interface AppleMusicFallbackProps {
  variant: "artists" | "tracks" | "recent" | "stats" | "full-dashboard";
  className?: string;
  title?: string;
  description?: string;
  showExploreButton?: boolean;
  onConnectAppleMusic?: () => void;
}

const AppleMusicFallback = ({
  variant,
  className = "",
  title,
  description,
  showExploreButton = true,
  onConnectAppleMusic,
}: AppleMusicFallbackProps) => {
  const handleAppleMusicConnect = () => {
    if (onConnectAppleMusic) {
      onConnectAppleMusic();
    } else {
      console.log("Apple Music integration not yet implemented");
    }
  };

  const fallbackContent = {
    artists: {
      icon: <Star className="h-6 w-6 text-pink-500" />,
      title: title || "Your Top Artists",
      description:
        description ||
        "Connect Apple Music to see your favorite artists and discover new music based on your listening habits. (Integration coming soon!)",
      mockData: [
        { name: "Artist 1", placeholder: true },
        { name: "Artist 2", placeholder: true },
        { name: "Artist 3", placeholder: true },
        { name: "Artist 4", placeholder: true },
        { name: "Artist 5", placeholder: true },
      ],
    },
    tracks: {
      icon: <Volume2 className="h-6 w-6 text-red-500" />,
      title: title || "Your Top Tracks",
      description:
        description ||
        "Connect Apple Music to see your most played songs and discover music that matches your taste. (Integration coming soon!)",
      mockData: [
        { name: "Track 1", artist: "Artist", placeholder: true },
        { name: "Track 2", artist: "Artist", placeholder: true },
        { name: "Track 3", artist: "Artist", placeholder: true },
        { name: "Track 4", artist: "Artist", placeholder: true },
        { name: "Track 5", artist: "Artist", placeholder: true },
      ],
    },
    recent: {
      icon: <Clock className="h-6 w-6 text-blue-500" />,
      title: title || "Recently Played",
      description:
        description ||
        "Connect Apple Music to see your listening history and track your music journey. (Integration coming soon!)",
      mockData: Array.from({ length: 6 }, (_, i) => ({
        name: `Recent Track ${i + 1}`,
        artist: "Artist",
        placeholder: true,
      })),
    },
    stats: {
      icon: <TrendingUp className="h-6 w-6 text-pink-500" />,
      title: title || "Apple Music Stats",
      description:
        description ||
        "Connect Apple Music to track your listening habits and see detailed statistics about your music consumption. (Integration coming soon!)",
      mockData: [],
    },
    "full-dashboard": {
      icon: <Headphones className="h-6 w-6 text-pink-500" />,
      title: title || "Apple Music Dashboard",
      description:
        description ||
        "Connect your Apple Music account to unlock personalized music insights, discover new artists, and track your listening habits. Apple Music integration is coming soon!",
      mockData: [],
    },
  };

  const content = fallbackContent[variant];

  if (variant === "full-dashboard") {
    return (
      <Card
        className={`bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-950/20 dark:to-red-950/20 border-pink-200 dark:border-pink-800 ${className}`}
      >
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
                <SiApplemusic className="h-10 w-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <ExternalLink className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="space-y-4 max-w-md">
              <div className="flex items-center justify-center gap-2">
                {content.icon}
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {content.title}
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-center">
                {content.description}
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Music className="h-3 w-3" />
                  Lossless Audio
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Music Discovery
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Coming Soon
                </Badge>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleAppleMusicConnect}
                disabled
                className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white flex items-center gap-2 opacity-50 cursor-not-allowed"
              >
                <SiApplemusic className="h-4 w-4" />
                Connect Apple Music
              </Button>

              {showExploreButton && (
                <Button variant="outline" asChild>
                  <Link to="/discover">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Explore Music
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-dashed border-gray-300 dark:border-gray-700 ${className}`}
    >
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          {content.icon}
          {content.title}
          <Badge variant="outline" className="ml-auto text-xs">
            <SiApplemusic className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{content.description}</p>
        {content.mockData.length > 0 && (
          <div
            className={`grid gap-3 ${
              variant === "artists"
                ? "grid-cols-5"
                : variant === "tracks"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-6"
            }`}
          >
            {content.mockData.map((_item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse"
              >
                <div
                  className={`${
                    variant === "tracks" ? "aspect-square" : "aspect-square"
                  } bg-gradient-to-br from-pink-300 to-red-400 dark:from-pink-600 dark:to-red-700`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="h-6 w-6 text-white" />
                  </div>
                </div>
                {variant !== "artists" && (
                  <div className="p-2 space-y-1">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                )}
                {variant === "artists" && (
                  <div className="mt-2">
                    <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded mx-auto w-3/4"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleAppleMusicConnect}
            size="sm"
            disabled
            className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 opacity-50 cursor-not-allowed"
          >
            <SiApplemusic className="h-4 w-4" />
            Connect Apple Music
          </Button>

          {showExploreButton && (
            <Button variant="outline" size="sm" asChild>
              <Link to="/discover">
                <Sparkles className="h-4 w-4 mr-2" />
                Explore
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AppleMusicFallback;
