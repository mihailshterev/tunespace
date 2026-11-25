import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "react-router";
import Loading from "@/shared/ui/loading";
import useAuth from "@/shared/auth/hooks/useAuth";
import { checkCurrentUser } from "@/shared/auth/api/auth.service";
import { ROUTES } from "@/shared/utils/constants";

// Signed-in users skip the landing page and go straight to their home feed.
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const { data: currentUser, isPending } = useQuery({
    queryKey: ["auth", "current-user"],
    queryFn: checkCurrentUser,
    enabled: !isAuthenticated,
    retry: false,
    // Checked on every visit, so a session that ended meanwhile is never mistaken for a live one.
    gcTime: 0,
  });

  if (isAuthenticated || currentUser) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  if (isPending) {
    return <Loading />;
  }

  return <>{children}</>;
}
