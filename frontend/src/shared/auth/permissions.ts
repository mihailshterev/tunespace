import { UserRole } from "@/shared/utils/constants";

// Roles that may open the band dashboard at all.
export const BAND_DASHBOARD_ROLES: readonly UserRole[] = [
  UserRole.Admin,
  UserRole.BandAdmin,
  UserRole.BandMember,
];

// Roles that may change the band itself: profile, linked media and membership.
export const BAND_MANAGER_ROLES: readonly UserRole[] = [
  UserRole.Admin,
  UserRole.BandAdmin,
];

export const hasRole = (
  role: string | undefined,
  allowedRoles: readonly UserRole[],
): boolean => !!role && (allowedRoles as readonly string[]).includes(role);

// Roles that may manage other users' accounts.
export const ADMIN_ROLES: readonly UserRole[] = [UserRole.Admin];
