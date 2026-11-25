import { cn } from "@/shared/utils/cn";
import { Card, CardContent } from "@/shared/ui/card";
import { useState, useEffect } from "react";
import Register from "./register-form";
import Login from "./login-form";
import {
  Music,
  Headphones,
  AudioLines,
  Radio,
  Disc,
  Waves,
} from "lucide-react";
import { Link } from "react-router";

const AuthForm = ({
  className,
  type,
  ...props
}: React.ComponentProps<"div"> & { type: "login" | "register" }) => {
  const [isLogin, setIsLogin] = useState(type === "login");

  useEffect(() => {
    setIsLogin(type === "login");
  }, [type]);

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {isLogin ? (
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <Login />
            <div className="relative hidden bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30 dark:from-blue-600/50 dark:via-purple-600/50 dark:to-pink-600/50 md:flex md:items-center md:justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 dark:from-blue-400/30 dark:via-purple-400/30 dark:to-pink-400/30" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.blue.500/20),transparent_70%)]" />
              <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-8 flex space-x-4">
                  <div className="animate-pulse">
                    <Music className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="animate-pulse delay-150">
                    <Headphones className="h-12 w-12 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="animate-pulse delay-300">
                    <AudioLines className="h-12 w-12 text-pink-600 dark:text-pink-400" />
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">
                  Welcome Back to TuneSpace
                </h3>
                <p className="text-foreground/80 font-medium">
                  Continue your musical journey with artists and music lovers
                  worldwide.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="grid p-0 md:grid-cols-2">
            <div className="relative hidden bg-gradient-to-br from-purple-600/30 via-blue-600/30 to-cyan-600/30 dark:from-purple-600/50 dark:via-blue-600/50 dark:to-cyan-600/50 md:flex md:items-center md:justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 dark:from-purple-400/30 dark:via-blue-400/30 dark:to-cyan-400/30" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,theme(colors.purple.500/20),transparent_70%)]" />
              <div className="relative z-10 flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-8 grid grid-cols-2 gap-6">
                  <div className="animate-bounce">
                    <Radio className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="animate-bounce delay-100">
                    <Disc className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="animate-bounce delay-200">
                    <Waves className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  <div className="animate-bounce delay-300">
                    <Music className="h-10 w-10 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>
                <h3 className="mb-4 text-2xl font-bold text-foreground">
                  Join TuneSpace Today
                </h3>
                <p className="text-foreground/80 font-medium">
                  Discover new music, connect with artists, and become part of
                  our vibrant community.
                </p>
              </div>
            </div>
            <Register />
          </CardContent>
        </Card>
      )}
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By continuing, you agree to our{" "}
        <Link to="/terms">Terms of Service</Link> and{" "}
        <Link to="/privacy">Privacy Policy</Link>.
      </div>
    </div>
  );
};

export default AuthForm;
