import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Share2 } from "lucide-react";
import ShareEventModal from "./share-event-modal";
import type MusicEvent from "@/features/events/types/music-event";

interface QuickShareEventButtonProps {
  event: MusicEvent;
  variant?:
    | "ghost"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "link";
  size?: "sm" | "default" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

const QuickShareEventButton = ({
  event,
  variant = "ghost",
  size = "sm",
  className = "",
  children,
}: QuickShareEventButtonProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleShare = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        className={`flex items-center gap-2 ${className}`}
      >
        <Share2 className="w-4 h-4" />
        {children || "Share"}
      </Button>

      <ShareEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        event={event}
      />
    </>
  );
};

export default QuickShareEventButton;
