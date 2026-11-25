import { UserRole } from "@/shared/utils/constants";
import { isBandManagerRole } from "@/features/band/types/band";
import type { ManagedUser } from "@/features/admin/types/managed-user";

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.Admin]: "Admin",
  [UserRole.BandAdmin]: "Band Admin",
  [UserRole.BandMember]: "Band Member",
  [UserRole.Listener]: "Listener",
};

/**
 * What choosing a role in the admin table does. Mirrors the server's band membership rules so
 * blocked options are explained up front; the server enforces them regardless.
 */
export type RoleOption =
  | { kind: "current" }
  | { kind: "blocked"; reason: string }
  | { kind: "apply" }
  | { kind: "confirm-admin" }
  | { kind: "confirm-remove-from-band" }
  | { kind: "confirm-delete-band" };

export const isSoleManager = (user: ManagedUser) =>
  !!user.band && isBandManagerRole(user.role) && user.band.managerCount <= 1;

export const getRoleOption = (user: ManagedUser, role: UserRole): RoleOption => {
  if (role === user.role) return { kind: "current" };
  if (role === UserRole.Admin) return { kind: "confirm-admin" };

  const band = user.band;
  const isBandRole = role === UserRole.BandAdmin || role === UserRole.BandMember;

  if (!band) {
    return isBandRole
      ? { kind: "blocked", reason: "Not in a band. Add them from a band's dashboard." }
      : { kind: "apply" };
  }

  if (role === UserRole.Listener) {
    if (band.memberCount <= 1) return { kind: "confirm-delete-band" };
    if (isSoleManager(user)) {
      return { kind: "blocked", reason: `Only manager of ${band.name}. Promote another member first.` };
    }
    return { kind: "confirm-remove-from-band" };
  }

  if (role === UserRole.BandMember && isSoleManager(user)) {
    return { kind: "blocked", reason: `Only manager of ${band.name}. Promote another member first.` };
  }

  return { kind: "apply" };
};

const relativeTime = new Intl.RelativeTimeFormat(undefined, {
  numeric: "auto",
});

const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 60 * 60 * 1000],
  ["month", 30 * 24 * 60 * 60 * 1000],
  ["day", 24 * 60 * 60 * 1000],
  ["hour", 60 * 60 * 1000],
  ["minute", 60 * 1000],
];

export const formatLastActive = (isoDate: string): string => {
  const diff = new Date(isoDate).getTime() - Date.now();
  for (const [unit, ms] of UNITS) {
    if (Math.abs(diff) >= ms) {
      return relativeTime.format(Math.round(diff / ms), unit);
    }
  }
  return "Just now";
};
