import type UserType from "@/features/profile/types/user";

export default interface Band {
  id?: string;
  name: string;
  description?: string;
  genre?: string;
  coverImage?: Uint8Array;
  country?: string;
  city?: string;
  userId: string;
  spotifyId?: string;
  youTubeEmbedId?: string;
  members?: UserType[];
}
