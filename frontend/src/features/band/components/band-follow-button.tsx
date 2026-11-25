import { Button } from "@/shared/ui/button";
import { UserPlus, UserMinus } from "lucide-react";
import { useBandFollow } from "@/features/band/hooks/useBandFollow";
import useAuth from "@/shared/auth/hooks/useAuth";

interface BandFollowButtonProps {
  bandId: string;
  onFollowChange?: (isFollowing: boolean) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showText?: boolean;
}

const BandFollowButton = ({
  bandId,
  onFollowChange,
  variant = "default",
  size = "default",
  showText = true,
}: BandFollowButtonProps) => {
  const { auth } = useAuth();
  const { isFollowing, isLoading, toggleFollow } = useBandFollow(bandId);

  const handleFollowToggle = () => {
    toggleFollow();
    onFollowChange?.(isFollowing);
  };

  if (!auth?.id) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "outline" : variant}
      size={size}
      onClick={handleFollowToggle}
      disabled={isLoading}
      className={`gap-2 ${
        isFollowing ? "text-red-500 border-red-200 hover:bg-red-50" : ""
      }`}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          {showText && "Unfollow"}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          {showText && "Follow"}
        </>
      )}
    </Button>
  );
};

export default BandFollowButton;
