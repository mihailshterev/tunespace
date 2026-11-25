export default interface SpotifyArtist {
  id: string;
  name: string;
  popularity: number;
  genres: string[];
  followers: {
    total: number;
  };
  images: {
    url: string;
    height: number;
    width: number;
  }[];
}
