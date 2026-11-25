export default interface RecentlyPlayedTrack {
  trackName: string;
  artistName: string;
  artistId: string;
  albumName: string;
  albumImageUrl: string;
  playedAt: string;
  durationMs: number;
  durationMinutes: number;
}
