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
import { useState } from "react";
import { extractArtistIdFromSpotifyLink } from "@/shared/utils/helpers";

interface ConnectSpotifyDialogProps {
  handleSpotifyIdUpdate: (spotifyId: string) => Promise<void>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const ConnectSpotifyDialog = ({
  handleSpotifyIdUpdate,
  open,
  onOpenChange,
  trigger,
}: ConnectSpotifyDialogProps) => {
  const [spotifyArtistLink, setSpotifyArtistLink] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpotifyArtistLink(e.target.value);
  };

  const handleSpotifyLinkSubmit = async () => {
    const spotifyId = extractArtistIdFromSpotifyLink(spotifyArtistLink);
    if (spotifyId) {
      await handleSpotifyIdUpdate(spotifyId);
      setSpotifyArtistLink("");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSpotifyArtistLink("");
    }
    onOpenChange?.(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect Spotify Artist</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            type="text"
            placeholder="Enter Spotify Artist Link..."
            value={spotifyArtistLink}
            onChange={handleInputChange}
            className="border p-2 w-full max-w-md rounded"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="submit" onClick={handleSpotifyLinkSubmit}>
              Confirm
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConnectSpotifyDialog;
