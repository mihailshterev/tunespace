import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Share2 } from "lucide-react";
import ShareArtistModal from "./share-artist-modal";
import ShareSongModal from "./share-song-modal";

interface QuickShareButtonProps {
  artist?: {
    id?: string;
    name: string;
    location?: string;
    genres?: string[];
    listeners?: number;
    playCount?: number;
    imageUrl?: string;
    externalUrl?: string;
    coverImage?: Uint8Array | string;
    popularity?: number;
    relevanceScore?: number;
    similarArtists?: string[];
    isRegistered?: boolean;
    followers?: number;
  };
  song?: {
    title: string;
    artist: string;
    album?: string;
    spotifyUrl?: string;
    duration?: number;
    imageUrl?: string;
  };
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "sm" | "default" | "lg";
  className?: string;
  children?: React.ReactNode;
}

const QuickShareButton = ({
  artist,
  song,
  variant = "ghost",
  size = "sm",
  className = "",
  children,
}: QuickShareButtonProps) => {
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [isSongModalOpen, setIsSongModalOpen] = useState(false);

  const handleShare = () => {
    if (song) {
      setIsSongModalOpen(true);
    } else if (artist) {
      setIsArtistModalOpen(true);
    }
  };

  const shareableArtist = artist
    ? {
        id: artist.id,
        name: artist.name,
        location: artist.location || "",
        genres: artist.genres || [],
        listeners: artist.listeners,
        playCount: artist.playCount,
        imageUrl: artist.imageUrl,
        externalUrl: artist.externalUrl,
        coverImage: artist.coverImage,
        popularity: artist.popularity,
        relevanceScore: artist.relevanceScore,
        similarArtists: artist.similarArtists || [],
        isRegistered: artist.isRegistered || false,
        followers: artist.followers,
      }
    : null;

  const shareableSong = song
    ? {
        title: song.title,
        artist: song.artist,
        album: song.album,
        spotifyUrl: song.spotifyUrl,
        duration: song.duration,
        imageUrl: song.imageUrl,
      }
    : null;

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleShare}
        className={`flex items-center gap-2 ${className}`}
        disabled={!artist && !song}
      >
        <Share2 className="w-4 h-4" />
        {children || "Share"}
      </Button>

      {shareableArtist && (
        <ShareArtistModal
          isOpen={isArtistModalOpen}
          onClose={() => setIsArtistModalOpen(false)}
          artist={shareableArtist}
        />
      )}

      {shareableSong && (
        <ShareSongModal
          isOpen={isSongModalOpen}
          onClose={() => setIsSongModalOpen(false)}
          song={shareableSong}
        />
      )}
    </>
  );
};

export default QuickShareButton;
