import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Clock,
  Star,
  Play,
  Calendar,
  TrendingUp,
  Loader2,
  Music,
  Headphones,
  Heart,
  Activity,
  BarChart3,
  Disc3,
  UserPlus,
  Volume2,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import useAuth from "@/shared/auth/hooks/useAuth";
import useSpotify from "@/shared/spotify/hooks/useSpotify";
import type SpotifyArtist from "@/shared/spotify/types/spotify-artist";
import SpotifyConnectionStatus from "@/shared/spotify/components/spotify-connection-status";
import SpotifyFallback from "@/shared/spotify/components/spotify-fallback";
import useSpotifyErrorHandler from "@/shared/spotify/hooks/useSpotifyErrorHandler";
import { Link } from "react-router";

const HomeDashboard = () => {
  const { auth } = useAuth();

  const {
    spotifyProfileData,
    todayStats,
    thisWeekStats,
    isTodayStatsLoading,
    isThisWeekStatsLoading,
    recentlyPlayedTracks,
    followedArtists,
    isFollowedArtistsLoading,
    hasSpotifyConnectionError,
    isSpotifyDataAvailable,
  } = useSpotify();

  const { isSpotifyConnected } = useSpotifyErrorHandler();

  //TODO: Add more data summary from app
  const getTodayHours = () => todayStats?.totalHoursPlayed || 0;
  const getThisWeekHours = () => thisWeekStats?.totalHoursPlayed || 0;
  const getTodayTracks = () => todayStats?.tracks?.slice(0, 6) || [];

  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000000) {
      return `${(count / 1000000000).toFixed(1)}B followers`;
    }
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M followers`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K followers`;
    }
    if (count > 0) {
      return `${count.toLocaleString()} followers`;
    }
    return "Popular artist";
  };

  return (
    <div className="flex flex-col py-8 gap-6">
      <div className="bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-green-500/10 rounded-xl p-6 border border-purple-200/30 dark:border-purple-800/30">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
          Welcome back, {auth.username}! 🎵
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Ready to discover your next favorite song? Let&apos;s dive into your
          musical journey.
        </p>
        {(getTodayHours() > 0 || getThisWeekHours() > 0) && (
          <div className="flex items-center gap-4 mt-3 text-sm">
            {getTodayHours() > 0 && (
              <Badge
                variant="secondary"
                className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400"
              >
                <Headphones className="h-3 w-3 mr-1" />
                {getTodayHours()}h today
              </Badge>
            )}
            {getThisWeekHours() > 0 && (
              <Badge
                variant="secondary"
                className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400"
              >
                <BarChart3 className="h-3 w-3 mr-1" />
                {getThisWeekHours()}h this week
              </Badge>
            )}
          </div>
        )}
      </div>
      <SpotifyConnectionStatus showFullCard={false} />
      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="recent">This Week</TabsTrigger>
          <TabsTrigger value="recommended">Discover</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <Card className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border-green-200/50 bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-950/50 dark:to-emerald-950/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Headphones className="h-4 w-4 text-green-600 group-hover:animate-pulse" />
                  Today&apos;s Listening
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isTodayStatsLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400 transition-colors duration-300">
                      {getTodayHours()}h
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {todayStats?.totalPlays || 0} tracks played
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border-purple-200/50 bg-gradient-to-br from-purple-50/80 to-violet-50/80 dark:from-purple-950/50 dark:to-violet-950/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BarChart3 className="h-4 w-4 text-purple-600 group-hover:animate-pulse" />
                  This Week
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isThisWeekStatsLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 transition-colors duration-300">
                      {getThisWeekHours()}h
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {thisWeekStats?.uniqueTracksCount || 0} unique tracks
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-cyan-50/80 dark:from-blue-950/50 dark:to-cyan-950/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Heart className="h-4 w-4 text-blue-600 group-hover:animate-pulse" />
                  Following
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isFollowedArtistsLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 transition-colors duration-300">
                      {followedArtists?.length || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      artists you follow
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg hover:scale-105 transition-all duration-300 border-amber-200/50 bg-gradient-to-br from-amber-50/80 to-orange-50/80 dark:from-amber-950/50 dark:to-orange-950/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-amber-600 group-hover:animate-pulse" />
                  Spotify Profile
                </CardTitle>
              </CardHeader>
              <CardContent>
                <>
                  <p className="text-2xl font-bold text-amber-700 dark:text-amber-400 transition-colors duration-300">
                    {spotifyProfileData?.profile?.followerCount || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {spotifyProfileData?.profile?.spotifyPlan || "Free"} •
                    followers
                  </p>
                </>
              </CardContent>
            </Card>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              className="group bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <Link to="/discover">
                <Sparkles className="h-4 w-4 mr-2 group-hover:animate-spin" />
                Discover New Music
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="group hover:bg-purple-50 dark:hover:bg-purple-950/50 hover:border-purple-300 hover:shadow-md transform hover:scale-105 transition-all duration-300"
            >
              <Link to="/events">
                <Calendar className="h-4 w-4 mr-2 group-hover:animate-bounce" />
                Upcoming Events
              </Link>
            </Button>
          </div>
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Play className="h-5 w-5 text-green-500" />
                Today&apos;s Listening
              </h2>
              {getTodayTracks().length > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs bg-green-50 dark:bg-green-950/50 border-green-200 dark:border-green-800"
                >
                  Today&apos;s picks
                </Badge>
              )}
            </div>
            {isTodayStatsLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500 mx-auto mb-3" />
                  <span className="text-muted-foreground">
                    Loading today&apos;s music...
                  </span>
                </div>
              </div>
            ) : getTodayTracks().length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {getTodayTracks().map((track, index) => (
                  <div
                    key={index}
                    className="group transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2 shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                      {track.albumImageUrl ? (
                        <img
                          src={track.albumImageUrl || ""}
                          alt={track.albumName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                          <Play className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                      {track.trackName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artistName}
                    </p>
                    <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {new Date(track.playedAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="bg-gradient-to-r from-blue-50/50 via-purple-50/50 to-green-50/50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-green-950/20 border-dashed border-2 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-600 transition-colors duration-300">
                <CardContent className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <Music className="h-16 w-16 text-muted-foreground animate-pulse" />
                      <div className="absolute inset-0 h-16 w-16 border-4 border-green-200 dark:border-green-800 rounded-full animate-ping"></div>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    Start Your Musical Day! 🌅
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    No tracks played today yet. Begin your listening journey and
                    discover amazing music tailored just for you.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Link to="/discover">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Discover Music
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/events">
                        <Calendar className="h-4 w-4 mr-2" />
                        Find Events
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {hasSpotifyConnectionError || !isSpotifyConnected() ? (
            <SpotifyFallback variant="artists" className="mt-6" />
          ) : spotifyProfileData?.topArtists &&
            spotifyProfileData.topArtists.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Your Top Artists
                </h2>
                <Badge variant="secondary" className="text-xs animate-pulse">
                  Based on recent listening
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {spotifyProfileData.topArtists
                  .slice(0, 5)
                  .map((artist: SpotifyArtist, index: number) => (
                    <div key={index} className="group cursor-pointer">
                      <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all duration-300">
                        {artist.images && artist.images.length > 0 ? (
                          <img
                            src={artist.images[0]?.url || ""}
                            alt={artist.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                            <UserPlus className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Badge className="bg-yellow-500 text-yellow-900 text-xs">
                            #{index + 1}
                          </Badge>
                        </div>
                      </div>
                      <h3 className="font-medium text-sm text-center truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-300">
                        {artist.name}
                      </h3>{" "}
                      <p className="text-xs text-muted-foreground text-center">
                        {artist.followers?.total
                          ? formatFollowerCount(artist.followers.total)
                          : "Popular artist"}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          ) : isSpotifyDataAvailable &&
            (!spotifyProfileData?.topArtists ||
              spotifyProfileData.topArtists.length === 0) ? (
            <SpotifyFallback variant="artists" className="mt-6" />
          ) : null}
          {hasSpotifyConnectionError || !isSpotifyConnected() ? (
            <SpotifyFallback
              variant="artists"
              className="mt-6"
              title="Artists You Follow"
            />
          ) : followedArtists && followedArtists.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Artists You Follow
                </h2>
                <Badge variant="outline" className="text-xs">
                  {followedArtists.length} total
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {followedArtists.slice(0, 8).map((artist, index) => (
                  <div key={artist.id || index} className="group">
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2 shadow-sm group-hover:shadow-md transition-all duration-300">
                      {artist.images && artist.images.length > 0 ? (
                        <img
                          src={artist.images[0]?.url || ""}
                          alt={artist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                          <Heart className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-xs text-center truncate">
                      {artist.name}
                    </h3>
                    <p className="text-xs text-muted-foreground text-center">
                      {artist.popularity}% popularity
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : isSpotifyDataAvailable &&
            (!followedArtists || followedArtists.length === 0) ? (
            <SpotifyFallback
              variant="artists"
              className="mt-6"
              title="Artists You Follow"
            />
          ) : null}
          {hasSpotifyConnectionError || !isSpotifyConnected() ? (
            <SpotifyFallback variant="tracks" className="mt-6" />
          ) : spotifyProfileData?.topSongs &&
            spotifyProfileData.topSongs.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Volume2 className="h-5 w-5 text-green-500" />
                  Your Top Tracks
                </h2>
                <Badge variant="secondary" className="text-xs">
                  Most played recently
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {spotifyProfileData.topSongs.slice(0, 5).map((song, index) => (
                  <Card
                    key={index}
                    className="group hover:shadow-md transition-all duration-300"
                  >
                    <CardContent className="p-3">
                      <div className="relative aspect-square rounded-lg overflow-hidden mb-3">
                        {song.image ? (
                          <img
                            src={song.image || ""}
                            alt={song.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-green-500/20 to-blue-500/20 flex items-center justify-center">
                            <Music className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium text-sm truncate mb-1">
                        {song.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {song.artist}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : isSpotifyDataAvailable &&
            (!spotifyProfileData?.topSongs ||
              spotifyProfileData.topSongs.length === 0) ? (
            <SpotifyFallback variant="tracks" className="mt-6" />
          ) : null}
          {hasSpotifyConnectionError || !isSpotifyConnected() ? (
            <SpotifyFallback variant="recent" className="mt-6" />
          ) : recentlyPlayedTracks && recentlyPlayedTracks.length > 0 ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  Recently Played
                </h2>
                <Badge
                  variant="outline"
                  className="text-xs bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800"
                >
                  Last 50 tracks
                </Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {recentlyPlayedTracks.slice(0, 12).map((track, index) => (
                  <div
                    key={index}
                    className="group transform hover:scale-105 transition-all duration-300"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-2 shadow-sm group-hover:shadow-lg transition-shadow duration-300">
                      {track.albumImageUrl ? (
                        <img
                          src={track.albumImageUrl || ""}
                          alt={track.albumName}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <Disc3 className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                      <div className="absolute top-1 left-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Badge
                          variant="secondary"
                          className="text-xs bg-black/60 text-white border-none"
                        >
                          {new Date(track.playedAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </Badge>
                      </div>
                    </div>
                    <h3 className="font-medium text-xs truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                      {track.trackName}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {track.artistName}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : isSpotifyDataAvailable &&
            (!recentlyPlayedTracks || recentlyPlayedTracks.length === 0) ? (
            <SpotifyFallback variant="recent" className="mt-6" />
          ) : null}
        </TabsContent>
        <TabsContent value="today" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Today&apos;s Listening</h2>
            {todayStats && (
              <div className="text-sm text-muted-foreground">
                {todayStats.totalHoursPlayed}h • {todayStats.totalPlays} plays
              </div>
            )}
          </div>

          {isTodayStatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading today&apos;s statistics...</span>
            </div>
          ) : todayStats?.tracks?.length && todayStats?.tracks?.length > 0 ? (
            <div className="space-y-3">
              {todayStats?.tracks.map((track, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      {track.albumImageUrl ? (
                        <img
                          src={track.albumImageUrl || ""}
                          alt={track.albumName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <Play className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {track.trackName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artistName} • {track.albumName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(track.playedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Math.round(track.durationMinutes)}min
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No music played today yet. Start your listening journey!</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="recent" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">This Week</h2>
            {thisWeekStats && (
              <div className="text-sm text-muted-foreground">
                {thisWeekStats.totalHoursPlayed}h •{" "}
                {thisWeekStats.uniqueTracksCount} unique tracks
              </div>
            )}
          </div>

          {isThisWeekStatsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading this week&apos;s music...</span>
            </div>
          ) : (
            <div className="space-y-3">
              {thisWeekStats?.tracks?.slice(0, 10).map((track, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded-md overflow-hidden">
                      {track.albumImageUrl ? (
                        <img
                          src={track.albumImageUrl || ""}
                          alt={track.albumName || ""}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <Play className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">
                        {track.trackName}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {track.artistName} • {track.albumName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {track.playedAt
                          ? new Date(track.playedAt).toLocaleDateString()
                          : ""}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="recommended" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Discover New Music</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/discover">View All</Link>
            </Button>
          </div>
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50 border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              {/*todo*/}
              {/* <h3 className="text-lg font-semibold mb-2">
                Discovered {stats.discoveredArtistsThisMonth} new artists this
                month!
              </h3> */}
              <p className="text-muted-foreground mb-4">
                Keep exploring to find your next favorite sound
              </p>
              <Button asChild>
                <Link to="/discover">Explore More Artists</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HomeDashboard;
