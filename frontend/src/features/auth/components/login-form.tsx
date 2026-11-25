import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@/shared/forms/zod-resolver";
import FormInput from "@/shared/ui/form-input";
import { type LoginInputs, loginSchema } from "@/features/auth/schemas/login.schema";
import { BASE_URL, SPOTIFY_ENDPOINTS } from "@/shared/utils/constants";
import { Button } from "@/shared/ui/button";
import { FaSpotify } from "react-icons/fa";
import useAuth from "@/shared/auth/hooks/useAuth";
import useLogin from "@/features/auth/hooks/useLogin";
import { Link, useNavigate } from "react-router";

const Login = () => {
  const { updateAuth } = useAuth();
  const { login } = useLogin();

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSpotifyLogin = () => {
    navigate(`${BASE_URL}/${SPOTIFY_ENDPOINTS.LOGIN}`);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginInputs>({
    resolver: zodResolver(loginSchema),
  });

  const watchEmail = watch("email");
  const watchPassword = watch("password");

  useEffect(() => {
    setError("");
  }, [watchEmail, watchPassword]);

  const onSubmit = async (data: LoginInputs) => {
    try {
      const userData = await login(data);

      updateAuth({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        accessToken: userData.accessToken,
        role: userData.role,
        isExternalProvider: userData.isExternalProvider,
      });

      navigate("/home");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      handleRequestError(error);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleRequestError = (error: any) => {
    if (!error?.response) {
      setError("No response from server");
    } else {
      switch (error.response.status) {
        case 401: {
          const errorMessage =
            error.response.data?.message || error.response.data;
          if (
            typeof errorMessage === "string" &&
            errorMessage.includes("confirm your email")
          ) {
            setError(
              "Please confirm your email address before logging in. Check your inbox for the confirmation link."
            );
          } else {
            setError("Incorrect email or password");
          }
          break;
        }
        case 400:
          setError("An error occurred");
          break;
        default:
          setError("Unexpected error occurred");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 md:p-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-balance text-muted-foreground">
            Login to your TuneSpace account
          </p>
        </div>
        <FormInput
          type="email"
          placeholder="Email"
          register={register}
          name="email"
          error={errors.email?.message}
        />
        <FormInput
          type="password"
          placeholder="Password"
          register={register}
          name="password"
          error={errors.password?.message}
        />
        <div className="text-left">
          <Link
            to="/auth/forgot-password"
            className="text-sm text-muted-foreground hover:text-primary underline underline-offset-4"
          >
            Forgot your password?
          </Link>
        </div>
        <Button type="submit" className="w-full">
          Login
        </Button>
        <p className="text-orange-600">{error}</p>
        <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
          <span className="relative z-10 bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleSpotifyLogin}
          >
            <FaSpotify className="text-[#1DB954]" size={25} />
            <span className="sr-only">Login with Spotify</span>
          </Button>
        </div>
        <div className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </div>
      </div>
    </form>
  );
};

export default Login;
