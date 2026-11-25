import useProfileData from "@/features/profile/hooks/useProfileData";
import useAuth from "@/shared/auth/hooks/useAuth";
import { formatDate } from "@/shared/utils/helpers";
import {
  FaSpotify,
  FaGuitar,
  FaHistory,
  FaUserPlus,
  FaUserMinus,
  FaUsers,
} from "react-icons/fa";
import { IoMusicalNote } from "react-icons/io5";
import ProfilePictureUpload from "./profile-picture-upload";
import ProfileSkeleton from "./profile-skeleton";
import ProfileSettings from "./profile-settings";
import useFollow from "@/features/profile/hooks/useFollow";
import { Button } from "@/shared/ui/button";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Disc, User as LucideUser, Settings } from "lucide-react";
import SpotifyConnectionStatus from "@/shared/spotify/components/spotify-connection-status";
import SpotifyFallback from "@/shared/spotify/components/spotify-fallback";
import type SpotifyArtist from "@/shared/spotify/types/spotify-artist";
import QuickShareButton from "@/features/discovery/components/quick-share-button";
import { Link } from "react-router";

interface ProfileProps {
  username: string;
  spotifyProfileData: {
    profile: {
      followerCount: number;
      spotifyPlan: string;
      profilePicture?: string;
    };
    topArtists?: Array<SpotifyArtist>;
    topSongs?: Array<{
      name: string;
      artist: string;
      image: string;
    }>;
  } | null;
  recentlyPlayedTracks: Array<{
    trackName: string;
    artistName: string;
    albumName: string;
    albumImageUrl: string;
    playedAt: string;
  }>;
}

const Profile = ({
  username,
  spotifyProfileData,
  recentlyPlayedTracks,
}: ProfileProps) => {
  const { auth } = useAuth();
  const loggedInUsername = auth?.username;
  const isOwnProfile = loggedInUsername === username;
  const [activeTab, setActiveTab] = useState("activity");

  const {
    profile,
    isProfileLoading,
    isProfileError,
    uploadProfilePictureMutation,
  } = useProfileData(username, loggedInUsername!);

  const {
    followers,
    following,
    isFollowing,
    followerCount,
    followingCount,
    handleFollow,
    handleUnfollow,
    isLoading: isFollowLoading,
  } = useFollow(username, loggedInUsername);

  if (isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (isProfileError) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive mb-2">
          Error loading profile
        </h2>
        <p className="text-muted-foreground">Please try again later</p>
      </div>
    );
  }

  const handleProfilePictureUpload = async (file: File) => {
    try {
      await uploadProfilePictureMutation(file);
    } catch (error) {
      console.error("Error uploading profile picture:", error);
    }
  };

  const getProfilePictureUrl = (picture: string | undefined) => {
    if (!picture) {
      return "https://via.placeholder.com/200";
    }

    return `data:image/png;base64,${picture}`;
  };

  return (
    <div className="text-foreground min-h-screen bg-gradient-to-b dark:from-gray-900 dark:to-black from-gray-100 to-white">
      <div className="relative">
        <div className="h-64 w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br dark:from-indigo-900 dark:via-purple-900 dark:to-pink-800 from-blue-400 via-purple-500 to-pink-500 animate-gradient-x"></div>

          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-8 left-8 w-4 h-4 bg-white/20 rounded-full animate-pulse"></div>
            <div className="absolute top-16 right-16 w-6 h-6 bg-white/15 rounded-full animate-bounce delay-100"></div>
            <div className="absolute bottom-12 left-1/4 w-3 h-3 bg-white/25 rounded-full animate-ping delay-200"></div>
            <div className="absolute bottom-8 right-1/3 w-5 h-5 bg-white/20 rounded-full animate-pulse delay-300"></div>
            <div className="absolute top-12 left-1/3 w-2 h-2 bg-white/30 rounded-full animate-bounce delay-500"></div>
            <div className="absolute top-20 right-1/4 w-4 h-4 bg-white/15 rounded-full animate-ping delay-700"></div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 flex items-end justify-center space-x-1 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-white/40 rounded-t-full animate-pulse"
                style={{
                  height: `${Math.random() * 40 + 20}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${Math.random() * 1 + 0.5}s`,
                }}
              ></div>
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-10"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-end px-6 -mt-16 relative z-20">
          {isOwnProfile ? (
            <ProfilePictureUpload
              currentImage={getProfilePictureUrl(
                profile?.profilePicture ||
                  spotifyProfileData?.profile?.profilePicture
              )}
              username={profile?.username || username}
              onUpload={handleProfilePictureUpload}
            />
          ) : (
            <img
              className="rounded-full w-32 h-32 border-4 border-background object-cover shadow-xl"
              src={getProfilePictureUrl(
                profile?.profilePicture ||
                  spotifyProfileData?.profile?.profilePicture
              )}
              alt={profile?.username || "Profile picture"}
            />
          )}
          <div className="md:ml-6 mt-4 md:mt-0 mb-4 text-center md:text-left">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{profile?.username}</h1>
              {!isOwnProfile && loggedInUsername && (
                <div className="ml-4">
                  {isFollowing ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleUnfollow}
                      disabled={isFollowLoading}
                      className="flex items-center gap-1"
                    >
                      <FaUserMinus className="mr-1" /> Unfollow
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleFollow}
                      disabled={isFollowLoading}
                      className="flex items-center gap-1"
                    >
                      <FaUserPlus className="mr-1" /> Follow
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground mt-1 justify-center md:justify-start">
              {spotifyProfileData?.profile?.spotifyPlan && (
                <>
                  <FaSpotify className="text-[#1ed760]" />
                  {spotifyProfileData.profile.spotifyPlan === "premium" ? (
                    <span className="text-green-500">Premium</span>
                  ) : (
                    <span className="text-yellow-500">
                      {spotifyProfileData.profile.spotifyPlan
                        .charAt(0)
                        .toUpperCase() +
                        spotifyProfileData.profile.spotifyPlan.slice(1)}
                    </span>
                  )}
                  <span className="mx-2">•</span>
                </>
              )}
              <span
                className="flex items-center cursor-pointer hover:text-primary transition-colors"
                onClick={() => setActiveTab("followers")}
              >
                <FaUsers className="mr-1" /> {followerCount} followers
              </span>
              <span className="mx-2">•</span>
              <span
                className="cursor-pointer hover:text-primary transition-colors"
                onClick={() => setActiveTab("following")}
              >
                {followingCount} following
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs
          defaultValue="activity"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList
            className={`grid w-full ${
              isOwnProfile ? "grid-cols-4" : "grid-cols-3"
            } mb-8`}
          >
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="followers">Followers</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            {isOwnProfile && (
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="activity" className="space-y-6">
            {isOwnProfile ? (
              <>
                <SpotifyConnectionStatus />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden shadow-lg border border-border">
                    <div className="p-5 border-b border-border">
                      <h2 className="text-xl font-bold flex items-center gap-2 text-card-foreground">
                        <FaGuitar className="text-primary" /> Top Artists
                      </h2>
                    </div>
                    <div className="p-5">
                      {spotifyProfileData?.topArtists?.length ? (
                        spotifyProfileData.topArtists.map((artist, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 mb-4 hover:bg-accent p-2 rounded-lg transition-all group"
                          >
                            <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                              <AvatarImage
                                src={artist.images?.[0]?.url || ""}
                                alt={artist.name}
                                className="object-cover"
                              />
                              <AvatarFallback>
                                <LucideUser className="w-6 h-6 text-muted-foreground" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium text-lg text-card-foreground">
                                {artist.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Artist
                              </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {" "}
                              <QuickShareButton
                                artist={{
                                  name: artist.name,
                                  genres: artist.genres || [],
                                  imageUrl: artist.images?.[0]?.url,
                                  externalUrl: `https://open.spotify.com/artist/${artist.id}`,
                                  followers: artist.followers?.total,
                                  popularity: artist.popularity,
                                  isRegistered: false,
                                }}
                                variant="ghost"
                                size="sm"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <SpotifyFallback
                          variant="artists"
                          title="No Top Artists"
                          description="Connect your Spotify account to see your top artists"
                        />
                      )}
                    </div>
                  </div>

                  <div className="bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden shadow-lg border border-border">
                    <div className="p-5 border-b border-border">
                      <h2 className="text-xl font-bold flex items-center gap-2 text-card-foreground">
                        <IoMusicalNote className="text-primary" /> Top Songs
                      </h2>
                    </div>
                    <div className="p-5">
                      {spotifyProfileData?.topSongs?.length ? (
                        spotifyProfileData.topSongs.map((song, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4 mb-4 hover:bg-accent p-2 rounded-lg transition-all group"
                          >
                            {song.image ? (
                              <img
                                className="rounded-md w-16 h-16 object-cover shadow-md"
                                src={song.image}
                                alt={song.name}
                              />
                            ) : (
                              <div className="flex items-center justify-center rounded-md w-16 h-16 bg-muted shadow-md">
                                <Disc className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex flex-col flex-1">
                              <p className="font-medium text-lg text-card-foreground">
                                {song.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {song.artist}
                              </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <QuickShareButton
                                song={{
                                  title: song.name,
                                  artist: song.artist,
                                  imageUrl: song.image,
                                }}
                                variant="ghost"
                                size="sm"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <SpotifyFallback
                          variant="tracks"
                          title="No Top Songs"
                          description="Connect your Spotify account to see your top songs"
                        />
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden shadow-lg border border-border">
                  <div className="p-5 border-b border-border">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-card-foreground">
                      <FaHistory className="text-primary" /> Recently Played
                    </h2>
                  </div>
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {recentlyPlayedTracks?.length > 0 ? (
                        recentlyPlayedTracks.map((track, index) => (
                          <div
                            key={`${track.trackName}-${index}`}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-all group"
                          >
                            {track.albumImageUrl ? (
                              <img
                                src={track.albumImageUrl}
                                alt={track.albumName}
                                className="w-16 h-16 object-cover rounded shadow-md"
                              />
                            ) : (
                              <div className="flex items-center justify-center rounded w-16 h-16 bg-muted shadow-md">
                                <Disc className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="flex flex-col overflow-hidden flex-1">
                              <p className="font-medium text-card-foreground truncate">
                                {track.trackName}
                              </p>
                              <p className="text-sm text-muted-foreground truncate">
                                {track.artistName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(track.playedAt)}
                              </p>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <QuickShareButton
                                song={{
                                  title: track.trackName,
                                  artist: track.artistName,
                                  album: track.albumName,
                                  imageUrl: track.albumImageUrl,
                                }}
                                variant="ghost"
                                size="sm"
                              />
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full">
                          <SpotifyFallback
                            variant="recent"
                            title="No Recently Played Tracks"
                            description="Connect your Spotify account to see your listening history"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg border border-border">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-card-foreground">
                    <FaSpotify className="text-[#1ed760]" /> Spotify Profile
                  </h2>
                  {spotifyProfileData?.profile ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-accent p-4 rounded-lg text-center">
                        <p className="text-muted-foreground text-sm">
                          Spotify Followers
                        </p>
                        <p className="text-2xl font-bold text-accent-foreground">
                          {spotifyProfileData.profile.followerCount || 0}
                        </p>
                      </div>
                      <div
                        className="bg-accent p-4 rounded-lg text-center cursor-pointer hover:bg-accent/80 transition-colors"
                        onClick={() => setActiveTab("followers")}
                      >
                        <p className="text-muted-foreground text-sm">
                          TuneSpace Followers
                        </p>
                        <p className="text-2xl font-bold text-accent-foreground">
                          {followerCount}
                        </p>
                      </div>
                      <div
                        className="bg-accent p-4 rounded-lg text-center cursor-pointer hover:bg-accent/80 transition-colors"
                        onClick={() => setActiveTab("following")}
                      >
                        <p className="text-muted-foreground text-sm">
                          Following
                        </p>
                        <p className="text-2xl font-bold text-accent-foreground">
                          {followingCount}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <SpotifyFallback
                      variant="stats"
                      title="Spotify Not Connected"
                      description="Connect your Spotify account to see your profile stats and music data"
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg border border-border">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-card-foreground">
                    <FaSpotify className="text-[#1ed760]" /> Public Profile
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div
                      className="bg-accent p-4 rounded-lg text-center cursor-pointer hover:bg-accent/80 transition-colors"
                      onClick={() => setActiveTab("followers")}
                    >
                      <p className="text-muted-foreground text-sm">
                        TuneSpace Followers
                      </p>
                      <p className="text-2xl font-bold text-accent-foreground">
                        {followerCount}
                      </p>
                    </div>
                    <div
                      className="bg-accent p-4 rounded-lg text-center cursor-pointer hover:bg-accent/80 transition-colors"
                      onClick={() => setActiveTab("following")}
                    >
                      <p className="text-muted-foreground text-sm">Following</p>
                      <p className="text-2xl font-bold text-accent-foreground">
                        {followingCount}
                      </p>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg text-center">
                    <p className="text-muted-foreground text-sm">
                      Music preferences and listening history are private and
                      only visible to the profile owner.
                    </p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          <TabsContent value="followers">
            <div className="bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg border border-border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-card-foreground">
                <FaUsers className="text-primary" /> Followers ({followerCount})
              </h2>

              {followers && followers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {followers.map((follower) => (
                    <div
                      key={follower?.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                    >
                      <Link
                        to={`/profile/${follower?.name}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarImage
                            src={
                              follower.profilePicture
                                ? `data:image/png;base64,${follower.profilePicture}`
                                : "https://via.placeholder.com/40"
                            }
                            alt={follower?.name}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {follower?.name?.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{follower?.name}</p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  No followers yet
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="following">
            <div className="bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg border border-border">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-card-foreground">
                <FaUsers className="text-primary" /> Following ({followingCount}
                )
              </h2>

              {following && following.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {following.map((follower) => (
                    <div
                      key={follower.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors"
                    >
                      <Link
                        to={`/profile/${follower.name}`}
                        className="flex items-center gap-3 flex-1"
                      >
                        <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarImage
                            src={
                              follower.profilePicture
                                ? `data:image/png;base64,${follower.profilePicture}`
                                : "https://via.placeholder.com/40"
                            }
                            alt={follower.name}
                            className="object-cover"
                          />
                          <AvatarFallback>
                            {follower.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{follower.name}</p>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  Not following anyone yet
                </div>
              )}
            </div>
          </TabsContent>
          {isOwnProfile && (
            <TabsContent value="settings">
              <ProfileSettings
                userEmail={auth?.email || ""}
                isExternalProvider={auth?.isExternalProvider || false}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
