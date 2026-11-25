import { Music, Headphones, AudioLines, Home, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";

const musicIcons = [Music, Headphones, AudioLines];

export function NotFoundPage() {
  const navigate = useNavigate();

  const [currentIcon, setCurrentIcon] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIcon((prev) => (prev + 1) % musicIcons.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const CurrentIcon = musicIcons[currentIcon];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <CurrentIcon className="h-32 w-32 mx-auto text-indigo-500/20" />
          </div>
          <CurrentIcon className="h-32 w-32 mx-auto text-indigo-500 relative z-10 transition-all duration-500 transform hover:scale-110" />
        </div>

        <div className="space-y-4">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white">
            Track Not Found
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-md mx-auto">
            Looks like this song skipped to a different playlist. The page
            you&apos;re looking for doesn&apos;t exist in our music library.
          </p>
        </div>

        <div className="relative h-24 overflow-hidden">
          <div className="absolute inset-0">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-bounce text-indigo-400/60 text-2xl"
                style={{
                  left: `${20 + i * 15}%`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: `${2 + i * 0.2}s`,
                }}
              >
                ♪
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Home className="h-5 w-5" />
            Back to Home
          </Link>

          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
            Go Back
          </button>
        </div>

        <div className="relative mt-12">
          <div className="flex justify-center space-x-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-purple-600 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.sin(i * 0.5) * 15}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: "1.5s",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
