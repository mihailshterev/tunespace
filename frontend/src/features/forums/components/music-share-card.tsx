import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import {
  Music,
  ExternalLink,
  MapPin,
  Users,
  Star,
  Disc,
  Clock,
  Sparkles,
  Play,
} from "lucide-react";
import { FaSpotify } from "react-icons/fa";

interface MusicShareCardProps {
  content: string;
}

const MusicShareCard = ({ content }: MusicShareCardProps) => {
  if (!content || typeof content !== "string") {
    return null;
  }

  const parseMusicShare = (content: string) => {
    const isMusicShare =
      content.includes("🎵") &&
      (content.includes("# 🎵") || content.includes("🎧"));

    if (!isMusicShare) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = { type: "unknown" };

    if (content.includes("## 📋 Artist Info")) {
      result.type = "artist";

      const titleMatch = content.match(/# 🎵 (.+?)(?:\n|$)/);
      if (titleMatch) {
        result.name = titleMatch[1].trim();
      }

      const imageMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imageMatch) {
        result.imageUrl = imageMatch[2];
        result.imageAlt = imageMatch[1];
      }

      const genresMatch = content.match(/🎼 \*\*Genres:\*\* (.+?)(?:\n|$)/);
      if (genresMatch) {
        result.genres = genresMatch[1].split(" • ").map((g) => g.trim());
      }

      const locationMatch = content.match(/📍 \*\*Location:\*\* (.+?)(?:\n|$)/);
      if (locationMatch) {
        result.location = locationMatch[1].trim();
      }

      const followersMatch = content.match(
        /👥 \*\*Followers:\*\* (.+?)(?:\n|$)/
      );

      if (followersMatch) {
        result.followers = followersMatch[1].trim();
      }

      const popularityMatch = content.match(/⭐ \*\*Popularity:\*\* (\d+)%/);
      if (popularityMatch) {
        result.popularity = parseInt(popularityMatch[1]);
      }

      const matchMatch = content.match(
        /🎯 \*\*Recommendation Match:\*\* (\d+)%/
      );

      if (matchMatch) {
        result.matchScore = parseInt(matchMatch[1]);
      }

      const spotifyMatch = content.match(/\[🎵 .+? on Spotify →\]\(([^)]+)\)/);

      if (spotifyMatch) {
        result.spotifyUrl = spotifyMatch[1];
      }

      const profileMatch = content.match(
        /\[🔗 Check out their profile here →\]\(([^)]+)\)/
      );

      if (profileMatch) {
        result.profileUrl = profileMatch[1];
      }

      const takeMatch = content.match(/## 💭 My Take\n\n([\s\S]*?)(?:\n\*|$)/);
      if (takeMatch) {
        result.userComment = takeMatch[1].trim();
      }
    } else if (content.includes("## 📋 Track Details")) {
      result.type = "song";

      const titleMatch = content.match(/# 🎵 (.+?)\n### by \*\*(.+?)\*\*/);
      if (titleMatch) {
        result.title = titleMatch[1].trim();
        result.artist = titleMatch[2].trim();
      }

      const imageMatch = content.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imageMatch) {
        result.imageUrl = imageMatch[2];
        result.imageAlt = imageMatch[1];
      }

      const albumMatch = content.match(/💿 \*\*Album:\*\* (.+?)(?:\n|$)/);
      if (albumMatch) {
        result.album = albumMatch[1].trim();
      }

      const durationMatch = content.match(/⏱️ \*\*Duration:\*\* (.+?)(?:\n|$)/);
      if (durationMatch) {
        result.duration = durationMatch[1].trim();
      }

      const spotifyMatch = content.match(/\[🎵 Play on Spotify →\]\(([^)]+)\)/);
      if (spotifyMatch) {
        result.spotifyUrl = spotifyMatch[1];
      }

      const takeMatch = content.match(
        /## 💭 Why I'm Sharing This\n\n([\s\S]*?)(?:\n\*|$)/
      );

      if (takeMatch) {
        result.userComment = takeMatch[1].trim();
      }
    }

    return result.name || result.title ? result : null;
  };

  const musicData = parseMusicShare(content);

  if (!musicData || (!musicData.name && !musicData.title)) {
    return null;
  }

  if (musicData.type === "artist") {
    return (
      <Card className="mb-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-l-4 border-l-blue-500 dark:border-l-blue-400 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {" "}
              {musicData.imageUrl ? (
                <img
                  src={musicData.imageUrl}
                  alt={musicData.imageAlt || musicData.name}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shadow-md ring-2 ring-background"
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center shadow-md">
                  <Music className="h-10 w-10 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {" "}
                  <Music className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="text-xl font-bold text-foreground truncate">
                    {musicData.name}
                  </h3>
                </div>
                {musicData.profileUrl && (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                  >
                    TuneSpace Artist
                  </Badge>
                )}
              </div>{" "}
              <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                {musicData.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{musicData.location}</span>
                  </div>
                )}
                {musicData.followers && (
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{musicData.followers} followers</span>
                  </div>
                )}
                {musicData.popularity && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />
                    <span>{musicData.popularity}% popularity</span>
                  </div>
                )}
                {musicData.matchScore && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    <span>{musicData.matchScore}% match</span>
                  </div>
                )}
              </div>
              {musicData.genres && musicData.genres.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {musicData.genres
                    .slice(0, 4)
                    .map((genre: string, index: number) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {genre}
                      </Badge>
                    ))}
                  {musicData.genres.length > 4 && (
                    <Badge variant="secondary" className="text-xs">
                      +{musicData.genres.length - 4} more
                    </Badge>
                  )}
                </div>
              )}
              <div className="flex gap-2 pt-2">
                {musicData.spotifyUrl && (
                  <Button
                    size="sm"
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
                    onClick={() => window.open(musicData.spotifyUrl, "_blank")}
                  >
                    <FaSpotify className="h-4 w-4 mr-2" />
                    Listen on Spotify
                  </Button>
                )}
                {musicData.profileUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(musicData.profileUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                )}
              </div>
            </div>
          </div>

          {musicData.userComment && (
            <div className="mt-4 p-4 bg-card rounded-lg shadow-sm border-l-2 border-l-blue-300 dark:border-l-blue-600">
              <p className="text-muted-foreground italic">
                &quot;{musicData.userComment}&quot;
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  if (musicData.type === "song") {
    return (
      <Card className="mb-4 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-950/20 dark:to-teal-950/20 border-l-4 border-l-green-500 dark:border-l-green-400 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              {" "}
              {musicData.imageUrl ? (
                <img
                  src={musicData.imageUrl}
                  alt={musicData.imageAlt || musicData.title}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover shadow-md ring-2 ring-background"
                />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700 flex items-center justify-center shadow-md">
                  <Disc className="h-10 w-10 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-2">
                {" "}
                <Disc className="h-5 w-5 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {musicData.title}
                  </h3>
                  <p className="text-lg text-muted-foreground">
                    by {musicData.artist}
                  </p>
                </div>
              </div>{" "}
              <div className="flex items-center gap-4 flex-wrap text-sm text-muted-foreground">
                {musicData.album && (
                  <div className="flex items-center gap-1">
                    <Disc className="h-4 w-4" />
                    <span>{musicData.album}</span>
                  </div>
                )}
                {musicData.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{musicData.duration}</span>
                  </div>
                )}
              </div>
              <div className="pt-2">
                {musicData.spotifyUrl && (
                  <Button
                    size="sm"
                    className="bg-[#1DB954] hover:bg-[#1ed760] text-white"
                    onClick={() => window.open(musicData.spotifyUrl, "_blank")}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Play on Spotify
                  </Button>
                )}
              </div>
            </div>
          </div>{" "}
          {musicData.userComment && (
            <div className="mt-4 p-4 bg-card rounded-lg shadow-sm border-l-2 border-l-green-300 dark:border-l-green-600">
              <p className="text-muted-foreground italic">
                &quot;{musicData.userComment}&quot;
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
};

export default MusicShareCard;
