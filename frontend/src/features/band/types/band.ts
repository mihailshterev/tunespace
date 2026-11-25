import { UserRole } from "@/shared/utils/constants";

/** Roles a band manager can assign within their band. */
export type BandRole = typeof UserRole.BandAdmin | typeof UserRole.BandMember;

export interface BandMember {
  id: string;
  name: string;
  profilePicture?: string;
  role: UserRole;
}

/** Band admins and site admins can manage a band they belong to. */
export const isBandManagerRole = (role: string | undefined) =>
  role === UserRole.BandAdmin || role === UserRole.Admin;

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
  members?: BandMember[];
}
