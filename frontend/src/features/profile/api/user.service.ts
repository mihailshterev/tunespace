import type UserProfile from "@/features/profile/types/user-profile";
import httpClient from "@/shared/api/http-client";
import type UserType from "@/features/profile/types/user";

export const getUserProfile = async (
  username: string
): Promise<UserProfile> => {
  const response = await httpClient.get(`/User/${username}/profile`);
  return response.data;
};

export const getUserByName = async (username: string) => {
  const response = await httpClient.get(`User/${username}`);
  return response.data;
};

export const getUsersByNameSearch = async (
  username: string
): Promise<UserType[]> => {
  const response = await httpClient.get(`/User/search/${username}`);
  return response.data;
};

export const getProfilePicture = async (username: string): Promise<string> => {
  const response = await httpClient.get(`/User/${username}/profile-picture`);
  return response.data;
};

export const uploadProfilePicture = async (file: File, username: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("username", username);

  const response = await httpClient.post(
    "/User/upload-profile-picture",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};
