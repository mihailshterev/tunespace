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
import { Send, ExternalLink, Music, Clock, X, Disc } from "lucide-react";
import { toast } from "sonner";
import useForumCategories from "@/features/forums/hooks/useForumCategories";
import useForumThreads from "@/features/forums/hooks/useForumThreads";
import useForumThread from "@/features/forums/hooks/useForumThread";
import { useNavigate } from "react-router";

interface ShareSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: {
    title: string;
    artist: string;
    album?: string;
    spotifyUrl?: string;
    duration?: number;
    imageUrl?: string;
  };
}

const ShareSongModal = ({ isOpen, onClose, song }: ShareSongModalProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(
    `Check out "${song.title}" by ${song.artist}!`
  );
  const [content, setContent] = useState(generateRichSongPost(song));
  const [categoryId, setCategoryId] = useState("");
  const [shareMode, setShareMode] = useState<"new" | "existing">("new");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [includeTrackInfo, setIncludeTrackInfo] = useState(true);

  const { categories, isLoading: isCategoriesLoading } = useForumCategories();
  const {
    threads,
    createThread,
    isCreating: isCreatingThread,
  } = useForumThreads(categoryId);
  const { createPost, isCreating: isCreatingPost } =
    useForumThread(selectedThreadId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function generateRichSongPost(song: any) {
    let content = `# 🎵 ${song.title}\n### by **${song.artist}**\n\n`;

    if (song.imageUrl) {
      content += `![${song.title}](${song.imageUrl})\n\n`;
    }

    content += `**🔥 Found this incredible track and couldn't keep it to myself!**\n\n`;
    content += `---\n\n`;
    content += `## 📋 Track Details\n\n`;

    if (song.album) {
      content += `💿 **Album:** ${song.album}\n\n`;
    }

    if (song.duration) {
      const minutes = Math.floor(song.duration / 60000);
      const seconds = Math.floor((song.duration % 60000) / 1000);
      content += `⏱️ **Duration:** ${minutes}:${seconds
        .toString()
        .padStart(2, "0")}\n\n`;
    }

    content += `---\n\n`;

    if (song.spotifyUrl) {
      content += `🎧 **Listen Now:** \n\n[🎵 Play on Spotify →](${song.spotifyUrl})\n\n`;
    }

    content += `## 💭 Why I'm Sharing This\n\n`;
    content += `This track completely blew me away! ${song.artist} has such a unique sound that really resonates with me. `;
    content += `Perfect for anyone looking to discover some fresh music.\n\n`;
    content += `**Have you heard this one?** What's your take on it? Let me know! 👇\n\n`;
    content += `*Always excited to share great music with this community!* 🎶`;

    return content;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function generateSimpleSongPost(song: any) {
    let content = `Just discovered "${song.title}" by ${song.artist} and had to share!\n\n`;

    if (song.album) {
      content += `From the album: ${song.album}\n`;
    }

    if (song.spotifyUrl) {
      content += `Listen on Spotify: ${song.spotifyUrl}\n\n`;
    }

    content += `What do you think? Anyone else jamming to this track?`;

    return content;
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
      const finalContent = includeTrackInfo
        ? generateRichSongPost(song)
        : content;

      if (shareMode === "new") {
        await createThread({
          title,
          content: finalContent,
          categoryId,
        });
        toast.success("New thread created and song shared!");
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
    setTitle(`Check out "${song.title}" by ${song.artist}!`);
    setContent(generateRichSongPost(song));
    setCategoryId("");
    setShareMode("new");
    setSelectedThreadId("");
    setIncludeTrackInfo(true);
    onClose();
  };

  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Share Song to Forum
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/30 rounded-lg p-4 border">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {song.imageUrl ? (
                  <img
                    src={song.imageUrl}
                    alt={song.title}
                    className="w-16 h-16 rounded-lg object-cover shadow-md"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Disc className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">{song.title}</h3>
                <p className="text-muted-foreground truncate">
                  by {song.artist}
                </p>

                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  {song.album && (
                    <div className="flex items-center gap-1">
                      <Disc className="h-3 w-3" />
                      <span className="truncate">{song.album}</span>
                    </div>
                  )}

                  {song.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(song.duration)}</span>
                    </div>
                  )}
                </div>
              </div>

              {song.spotifyUrl && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(song.spotifyUrl, "_blank")}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Spotify
                </Button>
              )}
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
                </SelectContent>
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
                      id="new-thread-song"
                      name="shareMode"
                      value="new"
                      checked={shareMode === "new"}
                      onChange={() => setShareMode("new")}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label
                      htmlFor="new-thread-song"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Create new discussion thread
                    </label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="existing-thread-song"
                      name="shareMode"
                      value="existing"
                      checked={shareMode === "existing"}
                      onChange={() => setShareMode("existing")}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                    />
                    <label
                      htmlFor="existing-thread-song"
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
                  value={selectedThreadId}
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
                            <span className="font-medium">{thread.title}</span>
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
                  {shareMode === "new" ? "Thread Content" : "Post Content"}
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIncludeTrackInfo(!includeTrackInfo);
                    setContent(
                      includeTrackInfo
                        ? generateSimpleSongPost(song)
                        : generateRichSongPost(song)
                    );
                  }}
                >
                  {includeTrackInfo ? "Simplify" : "Rich Format"}
                </Button>
              </div>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share your thoughts about this song..."
                className="min-h-[200px] resize-none"
                maxLength={2000}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {content.length}/2000 characters
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
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

export default ShareSongModal;
