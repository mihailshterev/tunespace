/** A pending invitation for a user to join a band. */
export default interface BandInvitation {
  id: string;
  bandId: string;
  bandName: string;
  /** Base64-encoded image. */
  bandCoverImage?: string | null;
  userId: string;
  userName: string;
  /** Base64-encoded image. */
  userProfilePicture?: string | null;
  invitedById?: string | null;
  invitedByName?: string | null;
  createdAt: string;
}
