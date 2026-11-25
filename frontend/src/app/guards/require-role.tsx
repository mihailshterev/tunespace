import type { ReactNode } from "react";
import { Navigate } from "react-router";
import useAuth from "@/shared/auth/hooks/useAuth";
import { hasRole } from "@/shared/auth/permissions";
import type { UserRole } from "@/shared/utils/constants";

interface RequireRoleProps {
  roles: readonly UserRole[];
  redirectTo: string;
  children: ReactNode;
}

// Must sit inside ProtectedRoute, which restores the session (and with it the role) before rendering children.
export function RequireRole({ roles, redirectTo, children }: RequireRoleProps) {
  const { auth } = useAuth();

  if (!hasRole(auth?.role, roles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
