import { Skeleton } from "@/shared/ui/skeleton";

const ProfileSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="relative">
        <div className="h-48 w-full overflow-hidden relative bg-muted">
          <div className="absolute inset-0 bg-gradient-to-r dark:from-blue-900/40 dark:to-purple-900/40 from-blue-500/20 to-purple-500/20 z-10"></div>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-end px-6 -mt-16 relative z-20">
          <div className="rounded-full w-32 h-32 bg-muted"></div>
          <div className="md:ml-6 mt-4 md:mt-0 mb-4 text-center md:text-left">
            <Skeleton className="h-8 w-48 mb-2" />
            <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
              <Skeleton className="h-4 w-36" />
              <span className="mx-2">•</span>
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden shadow-lg border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2 text-card-foreground">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </h2>
            </div>
            <div className="p-5">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 mb-4 p-2 rounded-lg"
                >
                  <Skeleton className="rounded-full w-16 h-16" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden shadow-lg border border-border">
            <div className="p-5 border-b border-border">
              <h2 className="text-xl font-bold flex items-center gap-2 text-card-foreground">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-6 w-32" />
              </h2>
            </div>
            <div className="p-5">
              {[1, 2, 3].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 mb-4 p-2 rounded-lg"
                >
                  <Skeleton className="rounded-md w-16 h-16" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl overflow-hidden shadow-lg border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2 text-card-foreground">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-36" />
            </h2>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg"
                >
                  <Skeleton className="w-16 h-16 rounded" />
                  <div className="flex flex-col w-full">
                    <Skeleton className="h-5 w-full max-w-[160px] mb-2" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 bg-card bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-xl p-6 shadow-lg border border-border">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-card-foreground">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-32" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="bg-accent p-4 rounded-lg text-center">
                <Skeleton className="h-4 w-20 mx-auto mb-2" />
                <Skeleton className="h-8 w-16 mx-auto" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
