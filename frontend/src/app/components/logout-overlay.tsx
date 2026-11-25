import { Loader2 } from "lucide-react";
import { cn } from "@/shared/utils/cn";

interface LogoutOverlayProps {
  isVisible: boolean;
}

const LogoutOverlay = ({ isVisible }: LogoutOverlayProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        "transition-opacity duration-200"
      )}
    >
      <div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border shadow-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground">
            Logging out...
          </h3>
          <p className="text-sm text-muted-foreground">
            Please wait while we sign you out securely
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoutOverlay;
