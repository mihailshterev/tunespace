import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import { SPOTIFY_ENDPOINTS } from "@/shared/utils/constants";
import httpClient from "@/shared/api/http-client";
import Profile from "@/features/profile/components/profile";
import type RecentlyPlayedTrack from "@/shared/spotify/types/recently-played-track";

// Spotify data is optional: without a connected account these requests fail and the profile renders without it.
const fetchSpotifyProfile = async () => {
  try {
    return (await httpClient.get(SPOTIFY_ENDPOINTS.PROFILE)).data;
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return null;
  }
};

const fetchRecentlyPlayed = async (): Promise<RecentlyPlayedTrack[]> => {
  try {
    return (await httpClient.get(SPOTIFY_ENDPOINTS.RECENTLY_PLAYED)).data || [];
  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return [];
  }
};

export function ProfileView() {
  const { username = "" } = useParams<{ username: string }>();

  const { data: spotifyProfileData = null } = useQuery({
    queryKey: ["profile-spotify-profile"],
    queryFn: fetchSpotifyProfile,
    retry: false,
  });

  const { data: recentlyPlayedTracks = [] } = useQuery({
    queryKey: ["profile-spotify-recently-played"],
    queryFn: fetchRecentlyPlayed,
    retry: false,
  });

  return (
    <Profile
      username={username}
      spotifyProfileData={spotifyProfileData}
      recentlyPlayedTracks={recentlyPlayedTracks}
    />
  );
}
