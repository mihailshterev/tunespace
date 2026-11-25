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
import { CalendarDays, Send, X } from "lucide-react";
import { toast } from "sonner";
import useForumCategories from "@/features/forums/hooks/useForumCategories";
import useForumThreads from "@/features/forums/hooks/useForumThreads";
import useForumThread from "@/features/forums/hooks/useForumThread";
import type MusicEvent from "@/features/events/types/music-event";
import { formatDate2, extractTimeFromDate } from "@/shared/utils/helpers";
import { useNavigate } from "react-router";

interface ShareEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: MusicEvent;
}

const ShareEventModal = ({ isOpen, onClose, event }: ShareEventModalProps) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(`Check out this event: ${event.title}!`);
  const [content, setContent] = useState(generateRichEventPost(event));
  const [categoryId, setCategoryId] = useState("");
  const [shareMode, setShareMode] = useState<"new" | "existing">("new");
  const [selectedThreadId, setSelectedThreadId] = useState("");
  const [includeEventInfo, setIncludeEventInfo] = useState(true);

  const { categories, isLoading: isCategoriesLoading } = useForumCategories();
  const {
    threads,
    createThread,
    isCreating: isCreatingThread,
  } = useForumThreads(categoryId);
  const { createPost, isCreating: isCreatingPost } =
    useForumThread(selectedThreadId);

  function generateRichEventPost(event: MusicEvent) {
    let content = `# 🎵 Event Announcement: ${event.title}\n\n`;

    content += `## 📅 Event Details\n\n`;
    content += `🎤 **Band:** ${event.bandName}\n`;
    content += `📅 **Date:** ${formatDate2(event.date)}\n`;
    content += `⏰ **Time:** ${extractTimeFromDate(event.date)}\n`;
    content += `📍 **Location:** ${event.city}, ${event.country}\n`;

    if (event.venueAddress) {
      content += `🏢 **Venue:** ${event.venueAddress.split(",")[0]}\n`;
    }

    if (event.address) {
      content += `🗺️ **Address:** ${event.address}\n`;
    }

    if (event.ticketPrice) {
      content += `🎫 **Ticket Price:** $${event.ticketPrice.toFixed(2)}\n`;
    }

    if (event.ticketUrl) {
      content += `🎟️ **Get Tickets:** [Buy Tickets Here](${event.ticketUrl})\n`;
    }

    content += `\n## 📝 Event Description\n\n`;
    content += `${
      event.description || "Join us for an amazing live music experience!"
    }\n\n`;

    content += `## 💭 Why I'm Sharing This\n\n`;
    content += `This looks like an incredible event! ${event.bandName} always puts on an amazing show. `;
    content += `Perfect for anyone looking for some great live music in ${event.city}.\n\n`;
    content += `**Are you planning to attend?** Let me know if you're going! 🎶\n\n`;
    content += `*Always excited to share great music events with this community!* 🎵`;

    return content;
  }

  function generateSimpleEventPost(event: MusicEvent) {
    let content = `Just found out about "${event.title}" by ${event.bandName} and had to share!\n\n`;

    content += `📅 Date: ${formatDate2(event.date)} at ${extractTimeFromDate(
      event.date
    )}\n`;
    content += `📍 Location: ${event.city}, ${event.country}\n`;

    if (event.venue) {
      content += `🏢 Venue: ${event.venue}\n`;
    }

    if (event.ticketUrl) {
      content += `🎫 Tickets: ${event.ticketUrl}\n\n`;
    }

    content += `Anyone else planning to go? Would love to meet up!`;

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
      const finalContent = includeEventInfo
        ? generateRichEventPost(event)
        : content;

      if (shareMode === "new") {
        await createThread({
          title,
          content: finalContent,
          categoryId,
        });
        toast.success("New thread created and event shared!");
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
    } catch (error) {
      console.error("Failed to share event:", error);
      toast.error(
        `Failed to ${
          shareMode === "new" ? "create thread" : "post to thread"
        }. Please try again.`
      );
    }
  };

  const handleClose = () => {
    setTitle(`Check out this event: ${event.title}!`);
    setContent(generateRichEventPost(event));
    setCategoryId("");
    setShareMode("new");
    setSelectedThreadId("");
    setIncludeEventInfo(true);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto z-50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Share Event to Forum
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-card rounded-lg p-4 border">
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-muted-foreground">
                  by {event.bandName}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                📅 {formatDate2(event.date)} at{" "}
                {extractTimeFromDate(event.date)}
              </p>
              <p>
                📍 {event.city}, {event.country}
              </p>
              {event.venueAddress && (
                <p>🏢 {event.venueAddress.split(",")[0]}</p>
              )}
              {event.ticketPrice && <p>🎫 ${event.ticketPrice.toFixed(2)}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-3">Share Mode</label>
            <div className="flex flex-col gap-3">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-thread-event"
                  name="shareMode"
                  value="new"
                  checked={shareMode === "new"}
                  onChange={() => setShareMode("new")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label
                  htmlFor="new-thread-event"
                  className="text-sm font-normal cursor-pointer"
                >
                  Create new discussion thread
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="existing-thread-event"
                  name="shareMode"
                  value="existing"
                  checked={shareMode === "existing"}
                  onChange={() => setShareMode("existing")}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                />
                <label
                  htmlFor="existing-thread-event"
                  className="text-sm font-normal cursor-pointer"
                >
                  Post to existing thread
                </label>
              </div>
            </div>
          </div>{" "}
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {isCategoriesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading categories...
                  </SelectItem>
                ) : (
                  categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          {shareMode === "new" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Thread Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter thread title..."
                maxLength={200}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {title.length}/200 characters
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
                  <SelectValue placeholder="Select a thread" />
                </SelectTrigger>
                <SelectContent>
                  {threads?.map((thread) => (
                    <SelectItem key={thread.id} value={thread.id}>
                      {thread.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  setIncludeEventInfo(!includeEventInfo);
                  setContent(
                    includeEventInfo
                      ? generateSimpleEventPost(event)
                      : generateRichEventPost(event)
                  );
                }}
              >
                {includeEventInfo ? "Simplify" : "Rich Format"}
              </Button>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your thoughts about this event..."
              className="min-h-[200px] resize-none"
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {content.length}/2000 characters
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

export default ShareEventModal;
