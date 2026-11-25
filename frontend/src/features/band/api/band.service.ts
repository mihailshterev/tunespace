import type Band from "@/features/band/types/band";
import type { BandRole } from "@/features/band/types/band";
import { ENDPOINTS } from "@/shared/utils/constants";
import httpClient from "@/shared/api/http-client";

export const getBand = async (userId: string): Promise<Band> => {
  return (await httpClient.get(`${ENDPOINTS.BAND}/user/${userId}`)).data;
};

export const getBandById = async (bandId: string): Promise<Band> => {
  return (await httpClient.get(`${ENDPOINTS.BAND}/${bandId}`)).data;
};

export const updateBand = async (updateData: FormData) => {
  await httpClient.put(`${ENDPOINTS.BANDUPDATE}`, updateData);
};

export const addMemberToBand = async (bandId: string, userId: string) => {
  await httpClient.post(`${ENDPOINTS.BAND}/add-member`, {
    bandId,
    userId,
  });
};

export const removeBandMember = async (bandId: string, userId: string) => {
  await httpClient.delete(`${ENDPOINTS.BAND}/${bandId}/members/${userId}`);
};

export const setBandMemberRole = async (
  bandId: string,
  userId: string,
  role: BandRole,
) => {
  await httpClient.put(`${ENDPOINTS.BAND}/${bandId}/members/${userId}/role`, {
    role,
  });
};

export const deleteBand = async (bandId: string) => {
  await httpClient.delete(`${ENDPOINTS.BAND}/${bandId}`);
};

export const followBand = async (bandId: string) => {
  await httpClient.post(`${ENDPOINTS.BAND}/${bandId}/follow`);
};

export const unfollowBand = async (bandId: string) => {
  await httpClient.delete(`${ENDPOINTS.BAND}/${bandId}/unfollow`);
};

export const isFollowingBand = async (bandId: string): Promise<boolean> => {
  return (await httpClient.get(`${ENDPOINTS.BAND}/${bandId}/is-following`))
    .data;
};

export const getBandFollowers = async (bandId: string) => {
  return (await httpClient.get(`${ENDPOINTS.BAND}/${bandId}/followers`)).data;
};

export const getBandFollowerCount = async (bandId: string): Promise<number> => {
  return (await httpClient.get(`${ENDPOINTS.BAND}/${bandId}/follower-count`))
    .data;
};

export const getUserFollowedBands = async (userId: string) => {
  return (
    await httpClient.get(`${ENDPOINTS.BAND}/user/${userId}/followed-bands`)
  ).data;
};

export const getUserFollowedBandsCount = async (
  userId: string
): Promise<number> => {
  return (
    await httpClient.get(
      `${ENDPOINTS.BAND}/user/${userId}/followed-bands-count`
    )
  ).data;
};
