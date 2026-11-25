import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useEffect, useState } from "react";
import { getYouTubeVideoId } from "@/shared/utils/helpers";

interface YouTubeEmbedDialogProps {
  handleYouTubeEmbedIdUpdate: (youTubeEmbedId: string) => Promise<void>;
}

const YouTubeEmbedDialog = ({
  handleYouTubeEmbedIdUpdate,
}: YouTubeEmbedDialogProps) => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVideoUrl(e.target.value);
  };

  const handleEmbed = () => {
    const id = getYouTubeVideoId(videoUrl);
    setVideoId(id);
  };

  const sanitizeVideoId = (id: string): string => {
    const sanitized = id.replace(/[^a-zA-Z0-9_-]/g, "");
    return sanitized.length === 11 ? sanitized : "";
  };

  const handleYouTubeEmbedSubmit = async () => {
    if (videoId) {
      const sanitizedId = sanitizeVideoId(videoId);
      if (sanitizedId) {
        await handleYouTubeEmbedIdUpdate(sanitizedId);
      }
    }
  };

  useEffect(() => {
    if (videoUrl) {
      handleEmbed();
    } else {
      setVideoId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoUrl]);

  return (
    <Dialog onOpenChange={() => setVideoUrl("")}>
      <DialogTrigger asChild>
        <Button variant="outline">Embed YouTube Video</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Embed YouTube Video</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="text"
            placeholder="Enter YouTube URL..."
            value={videoUrl}
            onChange={handleInputChange}
            className="border p-2 w-full max-w-md rounded"
          />
          {videoId && (
            <div className="mt-4">
              <iframe
                className="w-full aspect-video"
                src={`https://www.youtube.com/embed/${encodeURIComponent(
                  sanitizeVideoId(videoId)
                )}`}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" onClick={handleYouTubeEmbedSubmit}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubeEmbedDialog;
