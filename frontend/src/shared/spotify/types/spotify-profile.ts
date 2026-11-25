import type SpotifyArtist from "./spotify-artist";
import type Song from "./song";
import type SpotifyUserInfo from "./spotify-user-info";

export default interface SpotifyProfile {
  profile: SpotifyUserInfo;
  topArtists: SpotifyArtist[];
  topSongs: Song[];
}
