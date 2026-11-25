import type { UserRole } from "@/shared/utils/constants";

export interface ManagedUserBand {
  id: string;
  name: string;
  memberCount: number;
  /** Members able to manage the band (Band Admins and site Admins). */
  managerCount: number;
}

export interface ManagedUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  emailConfirmed: boolean;
  isSuspended: boolean;
  lastActiveDate: string;
  externalProvider: string | null;
  hasProfilePicture: boolean;
  band: ManagedUserBand | null;
}

export interface UserListResponse {
  items: ManagedUser[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface UserStats {
  totalUsers: number;
  suspendedUsers: number;
  usersByRole: Record<UserRole, number>;
}

export type UserStatusFilter = "all" | "active" | "suspended";

export interface UserListFilters {
  search: string;
  role: UserRole | "all";
  status: UserStatusFilter;
  page: number;
  pageSize: number;
}
