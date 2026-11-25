export default interface UserProfile {
  username: string;
  followerCount: number;
  followingCount: number;
  postsCount: number;
  playlistsCount: number;
  favoriteSong: string;
  favoriteBand: string;
  profilePicture?: string;
}
