import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/shared/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { Textarea } from "@/shared/ui/textarea";
import { MessageSquare, ThumbsUp, Send, X } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import type ThreadPost from "@/features/forums/types/thread-post";
import { useState } from "react";
import MusicShareCard from "./music-share-card";
import EventShareCard from "./event-share-card";

interface ForumPostProps {
  post: ThreadPost;
  isOriginalPost?: boolean;
  depth?: number;
  onLike: (postId: string) => void;
  onDislike: (postId: string) => void;
  onReply?: (content: string, parentPostId: string) => void;
}

const ForumPost = ({
  post,
  isOriginalPost = false,
  depth = 0,
  onLike,
  onDislike,
  onReply,
}: ForumPostProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const {
    authorName,
    authorAvatar,
    authorRole,
    content,
    createdAt,
    likesCount,
    userHasLiked,
    replies = [],
  } = post;

  const handleReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(replyContent.trim(), post.id);
      setReplyContent("");
      setIsReplying(false);
    }
  };

  const handleCancelReply = () => {
    setReplyContent("");
    setIsReplying(false);
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "band":
        return "bg-blue-500 text-white";
      case "admin":
        return "bg-red-500 text-white";
      case "moderator":
        return "bg-green-500 text-white";
      default:
        return "";
    }
  };

  return (
    <div className="relative">
      {depth > 0 && (
        <>
          <div className="absolute left-4 top-0 h-6 w-0.5 bg-border opacity-60"></div>
          <div
            className="absolute left-2 top-5 w-4 h-4 border-l-2 border-b-2 border-border opacity-60 transition-opacity duration-200"
            style={{
              borderBottomLeftRadius: "8px",
              borderColor: "hsl(var(--border))",
            }}
          ></div>
        </>
      )}
      <div className={`relative ${depth > 0 ? "ml-8" : ""}`}>
        <Card
          className={`${isOriginalPost ? "border-primary/30" : ""} ${
            depth > 0 ? "mt-3" : ""
          } ${
            depth > 0
              ? "border-l-2 border-l-primary/20 shadow-sm bg-background/50"
              : "shadow-md"
          } transition-all duration-200 hover:shadow-lg`}
        >
          <CardHeader className="flex flex-row gap-4 pb-2">
            <div>
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={`data:image/png;base64,${authorAvatar}`}
                  className="object-cover"
                />
                <AvatarFallback>{authorName?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{authorName ?? ""}</span>
                {authorRole && authorRole !== "user" && (
                  <Badge className={getRoleBadgeColor(authorRole)}>
                    {authorRole.charAt(0).toUpperCase() + authorRole.slice(1)}
                  </Badge>
                )}
                {isOriginalPost && (
                  <Badge variant="outline">Original Poster</Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
                {" • "}
                {format(new Date(createdAt), "MMM d, yyyy 'at' HH:mm")}
              </span>
            </div>
          </CardHeader>{" "}
          <CardContent className="pt-2 pb-4">
            {content.includes("🎵") &&
            (content.includes("# 🎵") || content.includes("🎧")) ? (
              content.includes("# 🎵 Event Announcement:") ? (
                <EventShareCard content={content} />
              ) : (
                <MusicShareCard content={content} />
              )
            ) : (
              <div className="prose dark:prose-invert max-w-none">
                <p style={{ whiteSpace: "pre-wrap" }}>{content}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="border-t pt-3 flex flex-col gap-3">
            <div className="flex justify-between w-full">
              <div className="flex items-center gap-4">
                {" "}
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() =>
                    userHasLiked ? onDislike(post.id) : onLike(post.id)
                  }
                >
                  <ThumbsUp
                    className={`h-4 w-4 ${
                      userHasLiked ? "fill-primary text-primary" : ""
                    }`}
                  />
                  <span>{likesCount || ""}</span>
                </Button>
                {onReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setIsReplying(!isReplying)}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Reply</span>
                  </Button>
                )}
              </div>
            </div>
            {isReplying && onReply && (
              <div className="w-full space-y-3">
                <Textarea
                  placeholder="Write your reply..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelReply}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                  >
                    <Send className="h-4 w-4 mr-1" />
                    Reply
                  </Button>
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
        {replies && replies.length > 0 && (
          <div className="relative ml-4 mt-2">
            {depth > 0 && (
              <div className="absolute -left-4 top-0 bottom-4 w-0.5 bg-border opacity-40"></div>
            )}
            {replies.map((reply) => (
              <ForumPost
                key={reply.id}
                post={reply}
                isOriginalPost={false}
                depth={depth + 1}
                onLike={onLike}
                onDislike={onDislike}
                onReply={onReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForumPost;
