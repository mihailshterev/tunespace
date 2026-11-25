import { useQuery } from "@tanstack/react-query";
import {
  BASE_URL,
  ENDPOINTS,
  SPOTIFY_ENDPOINTS,
} from "@/shared/utils/constants";
import Loading from "@/shared/ui/loading";
import { useState, useEffect } from "react";
import httpClient from "@/shared/api/http-client";
import {
  Music,
  MapPin,
  Users,
  Play,
  ExternalLink,
  Star,
  Headphones,
  TrendingUp,
  Volume2,
  Radio,
  Disc3,
  Waves,
  Earth,
  AudioWaveform,
  Share2,
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip";
import ExternalArtistModal from "./external-artist-modal";
import ShareArtistModal from "./share-artist-modal";
import PreferencesModal from "./preferences-modal";
import useSpotifyErrorHandler from "@/shared/spotify/hooks/useSpotifyErrorHandler";
import useAuth from "@/shared/auth/hooks/useAuth";
import useAuthInitialization from "@/shared/auth/hooks/useAuthInitialization";
import { getRecommendationsByPreferences } from "@/features/discovery/api/music-discovery.service";
import type { UserPreferences } from "@/features/discovery/types";
import { useNavigate } from "react-router";

interface DiscoveryArtist {
  id?: string;
  name: string;
  location: string;
  genres: string[];
  listeners: number;
  playCount: number;
  imageUrl: string;
  externalUrl?: string;
  coverImage?: Uint8Array | string;
  popularity: number;
  relevanceScore: number;
  similarArtists: string[];
  isRegistered: boolean;
}

const fetchDiscover = async (
  genreSet: Set<string>,
  useLocation: boolean,
  location: string = "BG",
) => {
  const genresParam = Array.from(genreSet).join(",");
  let url = `${ENDPOINTS.RECOMMENDATIONS}?genres=${encodeURIComponent(
    genresParam,
  )}`;

  if (useLocation) {
    url += `&location=${encodeURIComponent(location ?? "")}`;
  }

  const response = await httpClient.get(url);
  return response.data;
};

const DiscoveryList = () => {
  const { isAuthenticated, isLoggingOut, auth } = useAuth();
  const [useLocation, setUseLocation] = useState(true);
  const [isExternalModalOpen, setIsExternalModalOpen] = useState(false);
  const [selectedExternalArtist, setSelectedExternalArtist] =
    useState<string>("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedArtistToShare, setSelectedArtistToShare] =
    useState<DiscoveryArtist | null>(null);
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);
  const [useManualPreferences, setUseManualPreferences] = useState(() => {
    return !isAuthenticated || !auth?.isExternalProvider;
  });
  const [currentPreferences, setCurrentPreferences] =
    useState<UserPreferences | null>(() => {
      if (typeof window !== "undefined") {
        const savedPreferences = localStorage.getItem(
          "tuneSpaceManualPreferences",
        );
        return savedPreferences ? JSON.parse(savedPreferences) : null;
      }
      return null;
    });
  const navigate = useNavigate();
  const { handleSpotifyError, parseSpotifyErrorSilent } =
    useSpotifyErrorHandler();
  const { isInitializing } = useAuthInitialization();

  useEffect(() => {
    const hasSavedPreferences =
      typeof window !== "undefined" &&
      localStorage.getItem("tuneSpaceManualPreferences") !== null;

    const shouldUseManual =
      !isAuthenticated || !auth?.isExternalProvider || hasSavedPreferences;
    setUseManualPreferences(shouldUseManual);
  }, [isAuthenticated, auth?.isExternalProvider]);

  useEffect(() => {
    if (!isAuthenticated && isLoggingOut) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("tuneSpaceManualPreferences");
      }
      setCurrentPreferences(null);
    }
  }, [isAuthenticated, isLoggingOut]);

  const getGenreColor = (genres: string[]) => {
    const primaryGenre = genres[0]?.toLowerCase() || "";

    if (primaryGenre.includes("rock"))
      return "from-red-500/20 to-orange-500/20 border-red-200/30";
    if (primaryGenre.includes("metal"))
      return "from-gray-600/20 to-slate-800/20 border-gray-300/30";
    if (primaryGenre.includes("pop"))
      return "from-pink-500/20 to-purple-500/20 border-pink-200/30";
    if (primaryGenre.includes("jazz"))
      return "from-amber-500/20 to-yellow-500/20 border-amber-200/30";
    if (primaryGenre.includes("blues"))
      return "from-blue-500/20 to-indigo-500/20 border-blue-200/30";
    if (primaryGenre.includes("folk"))
      return "from-green-500/20 to-emerald-500/20 border-green-200/30";
    if (primaryGenre.includes("electronic"))
      return "from-cyan-500/20 to-teal-500/20 border-cyan-200/30";

    return "from-primary/10 to-primary/20 border-primary/20";
  };

  const getGenreIcon = (genres: string[]) => {
    const primaryGenre = genres[0]?.toLowerCase() || "";

    if (primaryGenre.includes("rock") || primaryGenre.includes("metal"))
      return <Volume2 className="w-5 h-5" />;
    if (primaryGenre.includes("jazz") || primaryGenre.includes("blues"))
      return <Music className="w-5 h-5" />;
    if (primaryGenre.includes("electronic"))
      return <Radio className="w-5 h-5" />;
    if (primaryGenre.includes("folk")) return <Disc3 className="w-5 h-5" />;

    return <Music className="w-5 h-5" />;
  };

  const handleExploreClick = (artist: DiscoveryArtist) => {
    if (artist.isRegistered && artist.id) {
      navigate(`/band/${artist.id}`);
    } else {
      setSelectedExternalArtist(artist.name);
      setIsExternalModalOpen(true);
    }
  };

  const handleShareClick = (artist: DiscoveryArtist) => {
    setSelectedArtistToShare(artist);
    setIsShareModalOpen(true);
  };

  const handlePreferencesSubmit = async (preferences: UserPreferences) => {
    setCurrentPreferences(preferences);
    setUseManualPreferences(true);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "tuneSpaceManualPreferences",
        JSON.stringify(preferences),
      );
    }

    setIsPreferencesModalOpen(false);
    refetch();
  };
  const handleUseSpotify = () => {
    setUseManualPreferences(false);
    setCurrentPreferences(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem("tuneSpaceManualPreferences");
    }

    refetch();
  };

  const {
    data: discovery,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      "discoveryBands",
      useLocation,
      useManualPreferences,
      currentPreferences,
    ],
    queryFn: async () => {
      if (useManualPreferences && currentPreferences) {
        const response =
          await getRecommendationsByPreferences(currentPreferences);
        return response.recommendations || response;
      } else {
        const genreSet = new Set(["metal", "rock"]);
        return fetchDiscover(genreSet, useLocation);
      }
    },
    enabled:
      !isInitializing &&
      (!useManualPreferences ? isAuthenticated && !isLoggingOut : true),
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      const spotifyError = parseSpotifyErrorSilent(error);
      return spotifyError.type === "NETWORK_ERROR" && failureCount < 2;
    },
  });

  const handleLocationToggle = () => {
    setUseLocation(!useLocation);
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <Headphones className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-primary/90 mb-2">
              Initializing...
            </div>
          </div>
          <Loading />
        </div>
      </div>
    );
  }

  if (
    (!isAuthenticated || !auth?.isExternalProvider) &&
    !currentPreferences &&
    !isLoggingOut
  ) {
    return (
      <div className="p-8 bg-secondary/20 rounded-2xl text-center my-6 border border-border/50">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
            <Headphones className="w-8 h-8 text-primary/60" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Get Music Recommendations
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              {!isAuthenticated
                ? "Choose how you'd like to discover new music. Sign in with Spotify for personalized recommendations based on your listening history, or set your preferences manually."
                : "To get personalized recommendations, you can connect Spotify for automatic preferences or set them up manually."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={() => (window.location.href = "/login")}>
                {!isAuthenticated ? "Sign In with Spotify" : "Connect Spotify"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsPreferencesModalOpen(true)}
              >
                Set Preferences Manually
              </Button>
            </div>
          </div>
        </div>
        <PreferencesModal
          isOpen={isPreferencesModalOpen}
          onClose={() => setIsPreferencesModalOpen(false)}
          onSubmit={handlePreferencesSubmit}
          isLoading={isLoading}
          initialPreferences={currentPreferences}
        />
      </div>
    );
  }

  if (isLoggingOut) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <Headphones className="w-8 h-8 text-primary animate-pulse" />
            </div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-primary/90 mb-2">
              Logging out...
            </div>
          </div>
          <Loading />
        </div>
      </div>
    );
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="p-4 bg-primary/10 rounded-2xl border border-primary/20">
              <Headphones className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-ping"></div>
          </div>
          <div className="text-center">
            <div className="text-xl font-semibold text-primary/90 mb-2">
              Discovering new artists
            </div>
            <div className="text-sm text-muted-foreground">
              Finding music that matches your taste...
            </div>
          </div>
          <Loading />
        </div>
      </div>
    );
  }

  if (error && !isLoggingOut) {
    const spotifyError = handleSpotifyError(error, undefined, false);

    return (
      <div className="p-8 text-destructive bg-destructive/10 rounded-2xl text-center my-6 border border-destructive/20">
        <div className="flex flex-col items-center gap-3">
          <div className="p-3 bg-destructive/10 rounded-xl">
            <Volume2 className="w-6 h-6 text-destructive" />
          </div>
          <div>
            <div className="font-semibold mb-1">
              {spotifyError.type === "UNAUTHORIZED" ||
              spotifyError.type === "NOT_CONNECTED"
                ? "Spotify Connection Issue"
                : "Unable to load recommendations"}
            </div>
            <div className="text-sm text-muted-foreground">
              {spotifyError.type === "UNAUTHORIZED" ||
              spotifyError.type === "NOT_CONNECTED"
                ? "You can connect your Spotify account for personalized recommendations, or set your preferences manually."
                : spotifyError.message}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            {(spotifyError.type === "UNAUTHORIZED" ||
              spotifyError.type === "NOT_CONNECTED") && (
              <>
                <Button
                  size="sm"
                  onClick={() =>
                    window.location.assign(
                      `${BASE_URL}/${SPOTIFY_ENDPOINTS.CONNECT}`,
                    )
                  }
                >
                  Connect Spotify
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreferencesModalOpen(true)}
                >
                  Set Preferences Manually
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <div className="relative mb-8">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
                <Headphones className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                  Discover New Artists
                </h2>{" "}
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-muted-foreground">
                    Explore fresh sounds and hidden gems based on your musical
                    preferences
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {discovery && Array.isArray(discovery) && (
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Music className="w-4 h-4" />
                  <span>{discovery.length} artists</span>
                </div>
              </div>
            )}{" "}
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-card hover:bg-accent transition-colors"
              disabled={isLoading}
            >
              <TrendingUp
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            {useManualPreferences && currentPreferences && (
              <Button
                onClick={() => setIsPreferencesModalOpen(true)}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 bg-card hover:bg-accent transition-colors"
              >
                <Music className="w-4 h-4" />
                <span className="hidden sm:inline">Update Preferences</span>
              </Button>
            )}
            {isAuthenticated && (
              <div className="flex items-center gap-2 bg-card p-2 rounded-xl shadow-sm border border-border/40">
                <span className="text-sm text-muted-foreground">Mode:</span>
                <div className="flex gap-1">
                  <Button
                    onClick={handleUseSpotify}
                    variant={!useManualPreferences ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                  >
                    Spotify
                  </Button>
                  <Button
                    onClick={() => setIsPreferencesModalOpen(true)}
                    variant={useManualPreferences ? "default" : "outline"}
                    size="sm"
                    className="text-xs h-7"
                  >
                    Manual
                  </Button>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2 bg-card p-2 rounded-xl shadow-sm border border-border/40">
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {useLocation ? "Location: On" : "Location: Off"}
              </span>
              <button
                onClick={handleLocationToggle}
                className="flex items-center"
                aria-label="Toggle location-based recommendations"
              >
                <div
                  className={`w-10 h-5 rounded-full p-0.5 transition-all duration-200 ${
                    useLocation ? "bg-primary shadow-md" : "bg-muted"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-sm ${
                      useLocation ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-2">
          <div className="h-1 w-20 bg-gradient-to-r from-primary to-primary/50 rounded-full"></div>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse"></div>
            <div
              className="w-2 h-2 bg-primary/40 rounded-full animate-pulse"
              style={{ animationDelay: "0.2s" }}
            ></div>
            <div
              className="w-2 h-2 bg-primary/20 rounded-full animate-pulse"
              style={{ animationDelay: "0.4s" }}
            ></div>
          </div>
        </div>
      </div>
      {discovery && Array.isArray(discovery) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {discovery.map((artist: DiscoveryArtist, index: number) => (
            <TooltipProvider key={index}>
              <div
                className={`group relative bg-gradient-to-br ${getGenreColor(
                  artist.genres,
                )} backdrop-blur-sm rounded-2xl border transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:shadow-primary/10 flex flex-col h-full`}
              >
                <div className="relative h-32 overflow-hidden rounded-t-2xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5">
                    <div className="absolute inset-0 opacity-30">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 100 20"
                        preserveAspectRatio="none"
                      >
                        <defs>
                          <pattern
                            id={`waves-${index}`}
                            x="0"
                            y="0"
                            width="20"
                            height="20"
                            patternUnits="userSpaceOnUse"
                          >
                            <rect
                              width="1"
                              height="20"
                              x="1"
                              fill="currentColor"
                              opacity="0.1"
                            >
                              <animate
                                attributeName="height"
                                values="5;20;5"
                                dur="1.5s"
                                repeatCount="indefinite"
                                begin={`${index * 0.2}s`}
                              />
                            </rect>
                            <rect
                              width="1"
                              height="20"
                              x="3"
                              fill="currentColor"
                              opacity="0.1"
                            >
                              <animate
                                attributeName="height"
                                values="15;5;15"
                                dur="1.5s"
                                repeatCount="indefinite"
                                begin={`${index * 0.2 + 0.3}s`}
                              />
                            </rect>
                            <rect
                              width="1"
                              height="20"
                              x="5"
                              fill="currentColor"
                              opacity="0.1"
                            >
                              <animate
                                attributeName="height"
                                values="8;18;8"
                                dur="1.5s"
                                repeatCount="indefinite"
                                begin={`${index * 0.2 + 0.6}s`}
                              />
                            </rect>
                          </pattern>
                        </defs>
                        <rect
                          width="100%"
                          height="100%"
                          fill={`url(#waves-${index})`}
                          className="text-primary"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 z-10">
                    {(artist.isRegistered && artist.coverImage) ||
                    artist.imageUrl ? (
                      <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-white/50 shadow-lg bg-card/80 backdrop-blur-sm">
                        <img
                          src={
                            artist.isRegistered && artist.coverImage
                              ? `data:image/jpeg;base64,${artist.coverImage}`
                              : artist.imageUrl
                          }
                          alt={artist.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="fallback-icon hidden w-full h-full items-center justify-center bg-card/80 backdrop-blur-sm rounded-lg border border-border/50">
                          {getGenreIcon(artist.genres)}
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 bg-card/80 backdrop-blur-sm rounded-full border border-border/50">
                        {getGenreIcon(artist.genres)}
                      </div>
                    )}
                  </div>
                  {artist.relevanceScore > 75 && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge
                        variant="default"
                        className="bg-primary/90 text-primary-foreground border-0 gap-1.5"
                      >
                        <Star className="w-3 h-3 fill-current" />
                        Rising
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                    <Tooltip>
                      <TooltipTrigger>
                        <div
                          className={`flex items-center gap-1.5 px-2 py-1 rounded-full ${
                            artist.isRegistered
                              ? "bg-green-500"
                              : "bg-orange-500"
                          } shadow-lg`}
                        >
                          {artist.isRegistered ? (
                            <AudioWaveform className="w-3 h-3 text-white" />
                          ) : (
                            <Earth className="w-3 h-3 text-white" />
                          )}
                          <span className="text-xs text-white font-medium">
                            {artist.isRegistered
                              ? "TuneSpace Artist"
                              : "External Artist"}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {artist.isRegistered
                            ? "Registered on TuneSpace platform"
                            : "Found from external sources"}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                    {artist.externalUrl && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <a
                            href={artist.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full bg-blue-500 hover:bg-blue-600 shadow-lg transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3 text-white" />
                          </a>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Visit External Link</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="p-5 space-y-4 flex-1 flex flex-col">
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {artist.name}
                        </h3>
                        {artist.popularity > 0 && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <TrendingUp className="w-3 h-3" />
                            {artist.popularity}%
                          </div>
                        )}
                      </div>

                      {artist.location && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 text-primary/70" />
                          <span>{artist.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      {artist.listeners > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>{artist.listeners.toLocaleString()}</span>
                        </div>
                      )}
                      {artist.playCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Play className="w-3.5 h-3.5" />
                          <span>{artist.playCount.toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {artist.genres.slice(0, 3).map((genre, idx) => (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className="text-xs px-2 py-0.5 bg-secondary/50 hover:bg-secondary/70 transition-colors"
                        >
                          {genre}
                        </Badge>
                      ))}
                      {artist.genres.length > 3 && (
                        <Badge
                          variant="outline"
                          className="text-xs px-2 py-0.5"
                        >
                          +{artist.genres.length - 3}
                        </Badge>
                      )}
                    </div>

                    {artist.similarArtists &&
                      artist.similarArtists.length > 0 && (
                        <div className="p-3 bg-secondary/20 rounded-lg border border-border/30">
                          <div className="text-xs font-medium text-primary/80 mb-1 flex items-center gap-1">
                            <Waves className="w-3 h-3" />
                            Similar to:
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {artist.similarArtists.slice(0, 2).join(", ")}
                            {artist.similarArtists.length > 2 && "..."}
                          </p>
                        </div>
                      )}
                  </div>{" "}
                  <div className="pt-2 mt-auto space-y-2">
                    <Button
                      onClick={() => handleExploreClick(artist)}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 group-hover:shadow-md"
                      size="sm"
                    >
                      <div className="flex items-center gap-2">
                        {artist.isRegistered ? (
                          <>
                            <Music className="w-4 h-4" />
                            <span>Explore Artist</span>
                          </>
                        ) : (
                          <>
                            <ExternalLink className="w-4 h-4" />
                            <span>Find in Spotify</span>
                          </>
                        )}
                      </div>
                    </Button>

                    <Button
                      onClick={() => handleShareClick(artist)}
                      variant="outline"
                      className="w-full rounded-lg transition-all duration-200 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
                      size="sm"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        <span>Share to Forum</span>
                      </div>
                    </Button>
                  </div>
                </div>
                {artist.relevanceScore > 0 && (
                  <div className="absolute top-2 left-2">
                    <div
                      className="w-2 h-2 rounded-full bg-primary shadow-lg"
                      style={{
                        opacity: artist.relevanceScore / 100,
                        boxShadow: `0 0 8px hsla(var(--primary), ${
                          artist.relevanceScore / 100
                        })`,
                      }}
                    />
                  </div>
                )}
              </div>
            </TooltipProvider>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-secondary/20 rounded-2xl border border-border/50">
          <div className="flex flex-col items-center gap-4 text-center max-w-md">
            <div className="p-4 bg-muted/50 rounded-2xl">
              <Music className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No recommendations found
              </h3>
              <p className="text-muted-foreground text-sm">
                We couldn&apos;t find any artist recommendations at the moment.
                Try adjusting your preferences or check back later.
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )}{" "}
      <ExternalArtistModal
        isOpen={isExternalModalOpen}
        onClose={() => setIsExternalModalOpen(false)}
        artistName={selectedExternalArtist}
      />
      {selectedArtistToShare && (
        <ShareArtistModal
          isOpen={isShareModalOpen}
          onClose={() => {
            setIsShareModalOpen(false);
            setSelectedArtistToShare(null);
          }}
          artist={selectedArtistToShare}
        />
      )}{" "}
      <PreferencesModal
        isOpen={isPreferencesModalOpen}
        onClose={() => setIsPreferencesModalOpen(false)}
        onSubmit={handlePreferencesSubmit}
        isLoading={isLoading}
        initialPreferences={currentPreferences}
      />
    </div>
  );
};

export default DiscoveryList;
