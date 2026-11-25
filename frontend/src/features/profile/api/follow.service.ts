import httpClient from "@/shared/api/http-client";

export interface FollowData {
  loggedInUser: string;
  profileUser: string;
}

export interface UserSearchResultResponse {
  id: string;
  name: string;
  profilePicture?: string;
}

export const checkFollowing = async (profileUser: string): Promise<boolean> => {
  try {
    const response = await httpClient.get(
      `/Follow/${profileUser}/is-following`
    );
    return response.data;
  } catch (error) {
    console.error("Error checking follow status:", error);
    return false;
  }
};

export const followUser = async (data: FollowData): Promise<void> => {
  try {
    await httpClient.post(`/Follow/${data.profileUser}`);
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

export const unfollowUser = async (data: FollowData): Promise<void> => {
  try {
    await httpClient.delete(`/Follow/${data.profileUser}`);
  } catch (error) {
    console.error("Error unfollowing user:", error);
    throw error;
  }
};

export const getUserFollowers = async (
  username: string
): Promise<UserSearchResultResponse[]> => {
  try {
    const response = await httpClient.get(`/Follow/${username}/followers`);
    return response.data;
  } catch (error) {
    console.error("Error getting user followers:", error);
    return [];
  }
};

export const getUserFollowing = async (
  username: string
): Promise<UserSearchResultResponse[]> => {
  try {
    const response = await httpClient.get(`/Follow/${username}/following`);
    return response.data;
  } catch (error) {
    console.error("Error getting user following:", error);
    return [];
  }
};

export const getFollowerCount = async (username: string): Promise<number> => {
  try {
    const response = await httpClient.get(`/Follow/${username}/follower-count`);
    return response.data;
  } catch (error) {
    console.error("Error getting follower count:", error);
    return 0;
  }
};

export const getFollowingCount = async (username: string): Promise<number> => {
  try {
    const response = await httpClient.get(
      `/Follow/${username}/following-count`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting following count:", error);
    return 0;
  }
};
