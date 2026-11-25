import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { MessageCircle, Clock } from "lucide-react";
import useBandChat from "@/features/band/hooks/useBandChat";
import { useNavigate } from "react-router";

interface BandMessagingDashboardProps {
  bandId: string;
}

const BandMessagingDashboard = ({ bandId }: BandMessagingDashboardProps) => {
  const { chatData, isLoading: loading } = useBandChat({
    bandId,
  });
  const chats = chatData.bandChats || [];

  const navigate = useNavigate();

  const formatLastMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-900/20 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Fan Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-center py-8">
            <MessageCircle className="h-8 w-8 animate-pulse mx-auto mb-4 opacity-50" />
            <p>Loading messages...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-green-900/20 to-transparent">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          <span>Fan Messages</span>
          {chats.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {chats.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {chats.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No messages yet</p>
            <p className="text-sm">
              When fans message your band, conversations will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer border border-border/50"
                onClick={() => {
                  navigate(`/band/${chat.bandId}/chat/${chat.id}`);
                }}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      chat.userAvatar
                        ? `data:image/jpeg;base64,${chat.userAvatar}`
                        : undefined
                    }
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {chat.userName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-foreground truncate">
                      {chat.userName || "Anonymous User"}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatLastMessageTime(chat.lastMessageTime!)}
                    </div>
                  </div>{" "}
                  {chat.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BandMessagingDashboard;
