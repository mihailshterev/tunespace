import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Badge } from "@/shared/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import {
  Share2,
  Send,
  ExternalLink,
  Music,
  MapPin,
  Users,
  Star,
  X,
} from "lucide-react";
import { toast } from "sonner";
import useForumCategories from "@/features/forums/hooks/useForumCategories";
import useForumThreads from "@/features/forums/hooks/useForumThreads";
import useForumThread from "@/features/forums/hooks/useForumThread";
import { useNavigate } from "react-router";

interface ShareArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: {
    id?: string;
    name: string;
    location?: string;
    genres: string[];
    listeners?: number;
    playCount?: number;
    imageUrl?: string;
    externalUrl?: string;
    coverImage?: Uint8Array | string;
    popularity?: number;
    relevanceScore?: number;
    similarArtists?: string[];
    isRegistered: boolean;
    followers?: number;
  };
}

const ShareArtistModal = ({
  isOpen,
  onClose,
  artist,
}: ShareArtistModalProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(`Check out ${artist.name}!`);
  const [content, setContent] = useState(generateDefaultContent(artist));
  const [categoryId, setCategoryId] = useState("");
  const [shareMode, setShareMode] = useState<"new" | "existing">("new");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [includeArtistInfo, setIncludeArtistInfo] = useState(true);

  const { categories, isLoading: isCategoriesLoading } = useForumCategories();
  const {
    threads,
    createThread,
    isCreating: isCreatingThread,
  } = useForumThreads(categoryId);

  const { createPost, isCreating: isCreatingPost } =
    useForumThread(selectedThreadId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function generateDefaultContent(artist: any) {
    let content = `I just discovered ${artist.name} and wanted to share them with the community!\n\n`;

    if (artist.genres?.length > 0) {
      content += `🎵 **Genres:** ${artist.genres.slice(0, 3).join(", ")}\n`;
    }

    if (artist.location) {
      content += `📍 **Location:** ${artist.location}\n`;
    }

    if (artist.relevanceScore && artist.relevanceScore > 80) {
      content += `⭐ **High relevance match** (${artist.relevanceScore}% match)\n`;
    }

    if (artist.listeners || artist.followers) {
      const count = artist.listeners || artist.followers || 0;
      if (count > 0) {
        content += `👥 **Followers:** ${formatNumber(count)}\n`;
      }
    }

    if (artist.similarArtists && artist.similarArtists.length > 0) {
      content += `🎯 **Similar to:** ${artist.similarArtists
        .slice(0, 2)
        .join(", ")}\n`;
    }

    content += `\n`;

    if (artist.isRegistered && artist.id) {
      content += `This is a registered band on TuneSpace! Check out their profile.\n\n`;
    } else if (artist.externalUrl) {
      content += `You can find them on Spotify: ${artist.externalUrl}\n\n`;
    }

    content += `What do you think? Anyone else listening to them?`;

    return content;
  }

  function formatNumber(num: number): string {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }

  const handleSubmit = async () => {
    if (shareMode === "new") {
      if (!title.trim() || !content.trim() || !categoryId) {
        toast.error("Please fill in all fields and select a category");
        return;
      }
    } else {
      if (!content.trim() || !selectedThreadId) {
        toast.error("Please write your post and select a thread");
        return;
      }
    }

    try {
      const finalContent = includeArtistInfo
        ? generateRichArtistPost(artist)
        : content;

      if (shareMode === "new") {
        await createThread({
          title,
          content: finalContent,
          categoryId,
        });

        toast.success("New thread created and artist shared!");
        navigate(`/forums/${categoryId}`);
      } else {
        await createPost({
          content: finalContent,
          threadId: selectedThreadId,
        });
        toast.success("Posted to thread successfully!");
        navigate(`/forums/thread/${selectedThreadId}`);
      }

      onClose();
    } catch {
      toast.error(
        `Failed to ${
          shareMode === "new" ? "create thread" : "post to thread"
        }. Please try again.`
      );
    }
  };

  const handleClose = () => {
    setTitle(`Check out ${artist.name}!`);
    setContent(generateDefaultContent(artist));
    setCategoryId("");
    setShareMode("new");
    setSelectedThreadId("");
    setIncludeArtistInfo(true);
    onClose();
  };

  const getArtistImage = () => {
    if (artist.imageUrl) return artist.imageUrl;
    if (artist.coverImage) {
      if (typeof artist.coverImage === "string") {
        return `data:image/jpeg;base64,${artist.coverImage}`;
      } else if (
        artist.coverImage instanceof Uint8Array &&
        artist.coverImage.length > 0
      ) {
        const base64String = btoa(
          String.fromCharCode(...Array.from(artist.coverImage))
        );
        return `data:image/jpeg;base64,${base64String}`;
      }
    }
    return null;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function generateRichArtistPost(artist: any) {
    let content = `# 🎵 ${artist.name}\n\n`;

    if (artist.imageUrl) {
      content += `![${artist.name}](${artist.imageUrl})\n\n`;
    }

    content += `**✨ Just discovered this amazing artist and had to share!**\n\n`;
    content += `---\n\n`;
    content += `## 📋 Artist Info\n\n`;

    if (artist.genres?.length > 0) {
      content += `🎼 **Genres:** ${artist.genres.slice(0, 3).join(" • ")}\n\n`;
    }

    if (artist.location) {
      content += `📍 **Location:** ${artist.location}\n\n`;
    }

    if (artist.followers || artist.listeners) {
      const count = artist.followers || artist.listeners || 0;
      if (count > 0) {
        content += `👥 **Followers:** ${formatNumber(count)}\n\n`;
      }
    }

    if (artist.popularity) {
      content += `⭐ **Popularity:** ${artist.popularity}% on Spotify\n\n`;
    }

    if (artist.relevanceScore && artist.relevanceScore > 80) {
      content += `🎯 **Recommendation Match:** ${artist.relevanceScore}% - *Highly recommended for you!*\n\n`;
    }

    if (artist.similarArtists && artist.similarArtists.length > 0) {
      content += `🔗 **Similar Artists:** ${artist.similarArtists
        .slice(0, 2)
        .join(" • ")}\n\n`;
    }

    content += `---\n\n`;

    if (artist.isRegistered && artist.id) {
      content += `🌟 **This is a verified TuneSpace band!** \n\n[🔗 Check out their profile here →](/band/${artist.id})\n\n`;
    } else if (artist.externalUrl) {
      content += `🎧 **Listen on Spotify:** \n\n[🎵 ${artist.name} on Spotify →](${artist.externalUrl})\n\n`;
    }

    content += `## 💭 My Take\n\n`;
    content += `I stumbled upon ${artist.name} and I'm completely hooked! `;

    if (artist.genres?.length > 0) {
      content += `Their ${artist.genres[0].toLowerCase()} sound is absolutely captivating. `;
    }

    content += `The way they craft their music really speaks to me.\n\n`;
    content += `**What do you all think?** Have you heard of them before? Drop your thoughts below! 👇\n\n`;
    content += `*Let's discuss and discover more music together!* 🎶`;

    return content;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Artist to Forum
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 border">
            <div className="flex items-start gap-4">
              <div className="relative">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={getArtistImage() || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/20">
                    <Music className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                {artist.isRegistered && (
                  <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                    TS
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-lg">{artist.name}</h3>
                  {artist.relevanceScore && artist.relevanceScore > 80 && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      <Star className="h-3 w-3 mr-1" />
                      {artist.relevanceScore}% match
                    </Badge>
                  )}
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  {artist.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{artist.location}</span>
                    </div>
                  )}

                  {(artist.listeners || artist.followers) && (
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>
                        {formatNumber(
                          artist.listeners || artist.followers || 0
                        )}{" "}
                        followers
                      </span>
                    </div>
                  )}
                </div>

                {artist.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {artist.genres.slice(0, 4).map((genre) => (
                      <Badge key={genre} variant="outline" className="text-xs">
                        {genre}
                      </Badge>
                    ))}
                    {artist.genres.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{artist.genres.length - 4} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {artist.isRegistered && artist.id ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/band/${artist.id}`)}
                  >
                    View Profile
                  </Button>
                ) : artist.externalUrl ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(artist.externalUrl, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Spotify
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a forum category" />
                </SelectTrigger>
                <SelectContent>
                  {isCategoriesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading categories...
                    </SelectItem>
                  ) : categories && categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No categories found
                    </SelectItem>
                  )}
                </SelectContent>{" "}
              </Select>
            </div>

            {categoryId && (
              <div>
                <label className="block text-sm font-medium mb-3">
                  How would you like to share?
                </label>
                <div className="flex gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="new-thread"
                      name="shareMode"
                      value="new"
                      checked={shareMode === "new"}
                      onChange={() => setShareMode("new")}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label
                      htmlFor="new-thread"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Create new discussion thread
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="existing-thread"
                      name="shareMode"
                      value="existing"
                      checked={shareMode === "existing"}
                      onChange={() => setShareMode("existing")}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label
                      htmlFor="existing-thread"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Post to existing thread
                    </label>
                  </div>
                </div>
              </div>
            )}

            {shareMode === "existing" && categoryId && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Thread
                </label>
                <Select
                  value={selectedThreadId ?? ""}
                  onValueChange={setSelectedThreadId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose an existing thread" />
                  </SelectTrigger>
                  <SelectContent>
                    {threads && threads.length > 0 ? (
                      threads.map((thread) => (
                        <SelectItem key={thread.id} value={thread.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{thread.title}</span>{" "}
                            <span className="text-xs text-muted-foreground">
                              by {thread.authorName}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-threads" disabled>
                        No threads found in this category
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {shareMode === "new" && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Thread Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a catchy title for your thread"
                  maxLength={100}
                />
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">
                  Post Content
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIncludeArtistInfo(!includeArtistInfo);
                    setContent(
                      includeArtistInfo
                        ? content
                            .split("\n")
                            .filter(
                              (line) =>
                                !line.includes("**") &&
                                !line.includes("🎵") &&
                                !line.includes("📍") &&
                                !line.includes("⭐") &&
                                !line.includes("👥") &&
                                !line.includes("🎯")
                            )
                            .join("\n")
                        : generateDefaultContent(artist)
                    );
                  }}
                >
                  {includeArtistInfo ? "Remove" : "Add"} Artist Info
                </Button>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts about this artist..."
                className="min-h-[150px]"
                maxLength={2000}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {content.length}/2000 characters
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>{" "}
          <Button
            onClick={handleSubmit}
            disabled={
              isCreatingThread ||
              isCreatingPost ||
              !content.trim() ||
              (shareMode === "new" && (!title.trim() || !categoryId)) ||
              (shareMode === "existing" && !selectedThreadId)
            }
          >
            {isCreatingThread || isCreatingPost ? (
              "Sharing..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {shareMode === "new" ? "Create & Share" : "Add to Thread"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareArtistModal;
