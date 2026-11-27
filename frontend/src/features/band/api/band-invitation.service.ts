import type BandInvitation from "@/features/band/types/band-invitation";
import { ENDPOINTS } from "@/shared/utils/constants";
import httpClient from "@/shared/api/http-client";

export const getMyBandInvitations = async (): Promise<BandInvitation[]> => {
  return (await httpClient.get(`${ENDPOINTS.BAND_INVITATION}/mine`)).data;
};

export const acceptBandInvitation = async (
  invitationId: string,
): Promise<BandInvitation> => {
  return (
    await httpClient.post(`${ENDPOINTS.BAND_INVITATION}/${invitationId}/accept`)
  ).data;
};

export const declineBandInvitation = async (invitationId: string) => {
  await httpClient.post(`${ENDPOINTS.BAND_INVITATION}/${invitationId}/decline`);
};

export const getBandInvitations = async (
  bandId: string,
): Promise<BandInvitation[]> => {
  return (await httpClient.get(`${ENDPOINTS.BAND_INVITATION}/band/${bandId}`))
    .data;
};

export const inviteBandMember = async (
  bandId: string,
  userId: string,
): Promise<BandInvitation> => {
  return (
    await httpClient.post(`${ENDPOINTS.BAND_INVITATION}/band/${bandId}`, {
      userId,
    })
  ).data;
};

export const cancelBandInvitation = async (
  bandId: string,
  invitationId: string,
) => {
  await httpClient.delete(
    `${ENDPOINTS.BAND_INVITATION}/band/${bandId}/${invitationId}`,
  );
};
