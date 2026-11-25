import { useAuthStore } from "@/shared/auth/state/auth-store";

const useAuth = () => {
  const auth = useAuthStore((state) => state.auth);
  const isLoggingOut = useAuthStore((state) => state.isLoggingOut);
  const setAuth = useAuthStore((state) => state.setAuth);
  const updateAuth = useAuthStore((state) => state.updateAuth);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const setLoggingOut = useAuthStore((state) => state.setLoggingOut);

  const isAuthenticated = Boolean(
    auth?.id && auth?.accessToken && !isLoggingOut
  );

  return {
    auth,
    isLoggingOut,
    isAuthenticated,
    setAuth,
    updateAuth,
    clearAuth,
    setLoggingOut,
  };
};

export default useAuth;
