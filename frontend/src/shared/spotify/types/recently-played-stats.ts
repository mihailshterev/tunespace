import type RecentlyPlayedTrack from "./recently-played-track";

export default interface RecentlyPlayedStats {
  tracks: RecentlyPlayedTrack[];
  totalHoursPlayed: number;
  uniqueTracksCount: number;
  totalPlays: number;
  timePeriod: string;
}
