import { useMutation } from "@tanstack/react-query";
import { login, type LoginData } from "@/shared/auth/api/auth.service";
import useAuth from "@/shared/auth/hooks/useAuth";

const useLogin = () => {
  const { setAuth } = useAuth();

  const handleLogin = useMutation({
    mutationFn: (data: LoginData) => login(data),
    onSuccess: (userData) => {
      setAuth(userData);
    },
  });

  return {
    login: handleLogin.mutateAsync,
    isLoading: handleLogin.isPending,
    error: handleLogin.error,
  };
};

export default useLogin;
