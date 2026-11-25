import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { ModeToggle } from "@/shared/ui/mode-toggle";
import { Link, Outlet, useNavigate } from "react-router";

export function LandingLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src="/logo.png" alt="TuneSpace" />
              <AvatarFallback className="bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500">
                TS
              </AvatarFallback>
            </Avatar>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              TuneSpace
            </span>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/about"
                className="text-sm font-medium hover:text-primary"
              >
                About
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <ModeToggle />
              <Button variant="outline" asChild className="hidden md:flex">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t py-12 bg-gradient-to-r from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-8">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/logo.png" alt="TuneSpace" />
                <AvatarFallback className="bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 text-xs">
                  TS
                </AvatarFallback>
              </Avatar>
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                TuneSpace
              </span>
            </div>{" "}
            <div className="flex flex-wrap justify-center gap-8 text-sm">
              <Link
                to="/about"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link
                to="/terms"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Terms of Service
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link
                to="/privacy"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link
                to="/copyright"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Copyright Policy
              </Link>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              <p>
                Copyright © {new Date().getFullYear()} TuneSpace. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
