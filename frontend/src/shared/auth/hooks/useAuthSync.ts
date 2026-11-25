import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkCurrentUser } from "@/shared/auth/api/auth.service";
import useAuth from "./useAuth";

export const CURRENT_USER_QUERY_KEY = ["auth", "current-user"] as const;

/**
 * Keeps the signed-in user's role in step with the server. Roles change outside this session:
 * an admin may promote or demote the user, and joining, leaving or deleting a band changes it too.
 * The server already enforces the current role; this updates what the UI shows and allows.
 * Suspended users are signed out by the HTTP client when their token refresh is refused.
 */
const useAuthSync = () => {
  const queryClient = useQueryClient();
  const { auth, isAuthenticated, updateAuth } = useAuth();

  const { data: currentUser } = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: checkCurrentUser,
    enabled: isAuthenticated,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const serverRole = currentUser?.role;

  useEffect(() => {
    if (!serverRole || serverRole === auth?.role) return;

    updateAuth({ role: serverRole });
    // Band and dashboard data depend on the role, so fetch them again under the new one.
    queryClient.invalidateQueries({
      predicate: (query) => query.queryKey[0] !== CURRENT_USER_QUERY_KEY[0],
    });
  }, [serverRole, auth?.role, updateAuth, queryClient]);
};

export default useAuthSync;
