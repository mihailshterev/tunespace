import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "@/shared/auth/api/auth.service";
import useAuth from "./useAuth";
import { useNavigate } from "react-router";

const useLogout = () => {
  const { clearAuth, setLoggingOut } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = useMutation({
    mutationFn: async () => {
      setLoggingOut(true);

      try {
        await queryClient.cancelQueries();

        await logout();

        queryClient.clear();
      } catch (error) {
        console.error(
          "Logout request failed, but clearing local state:",
          error
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));

      clearAuth();

      navigate("/login");
    },
  });

  return {
    logout: handleLogout.mutateAsync,
    isLoading: handleLogout.isPending,
    error: handleLogout.error,
  };
};

export default useLogout;
