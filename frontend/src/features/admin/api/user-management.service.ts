import httpClient from "@/shared/api/http-client";
import { ENDPOINTS, type UserRole } from "@/shared/utils/constants";
import type {
  ManagedUser,
  UserListFilters,
  UserListResponse,
  UserStats,
} from "@/features/admin/types/managed-user";

const USERS = `${ENDPOINTS.ADMIN}/users`;

export const getManagedUsers = async (
  filters: UserListFilters,
): Promise<UserListResponse> => {
  const response = await httpClient.get(USERS, {
    params: {
      search: filters.search.trim() || undefined,
      role: filters.role === "all" ? undefined : filters.role,
      suspended:
        filters.status === "all" ? undefined : filters.status === "suspended",
      page: filters.page,
      pageSize: filters.pageSize,
    },
  });
  return response.data;
};

export const getProfilePictureBlob = async (username: string): Promise<Blob> => {
  const response = await httpClient.get<Blob>(
    `User/${encodeURIComponent(username)}/profile-picture`,
    { responseType: "blob" },
  );
  return response.data;
};

export const getUserStats = async (): Promise<UserStats> => {
  const response = await httpClient.get(`${USERS}/stats`);
  return response.data;
};

export const updateUserRole = async (
  userId: string,
  role: UserRole,
): Promise<ManagedUser> => {
  const response = await httpClient.put(`${USERS}/${userId}/role`, { role });
  return response.data;
};

export const setUserSuspended = async (
  userId: string,
  suspended: boolean,
): Promise<ManagedUser> => {
  const response = await httpClient.post(
    `${USERS}/${userId}/${suspended ? "suspend" : "restore"}`,
  );
  return response.data;
};
