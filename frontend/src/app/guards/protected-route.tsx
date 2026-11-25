import type { ReactNode } from "react";
import { Navigate } from "react-router";
import Loading from "@/shared/ui/loading";
import useAuth from "@/shared/auth/hooks/useAuth";
import useAuthInitialization from "@/shared/auth/hooks/useAuthInitialization";
import { ROUTES } from "@/shared/utils/constants";

// Restores the session from the HTTP-only cookies, then lets authenticated users through and sends everyone else to login.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoggingOut, isAuthenticated } = useAuth();
  const { isInitializing } = useAuthInitialization();

  if (isInitializing && !isLoggingOut) {
    return <Loading />;
  }

  // While logging out the layout stays mounted so its overlay can play; the logout flow navigates away itself.
  if (!isAuthenticated && !isLoggingOut) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
