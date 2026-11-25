import { useState } from "react";
import { Input } from "@/shared/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Search, MessageSquarePlus, MessageSquare } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { format } from "date-fns";
import { toast } from "sonner";
import useChats from "@/features/messages/hooks/useChats";
import useAuth from "@/shared/auth/hooks/useAuth";
import type UserType from "@/features/profile/types/user";
import UserSearchDialog from "@/features/profile/components/user-search-dialog";
import { Link } from "react-router";

const ChatList = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const { auth } = useAuth();

  const { chats, addChatMutation } = useChats(auth?.username);

  const filteredChats = chats.filter((chat) =>
    chat.user2Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const startConversation = async (user: UserType) => {
    try {
      if (!auth?.username) {
        toast("You need to be logged in to start a conversation.");
        return;
      }

      addChatMutation({ user1: auth.username, user2: user.name });
      toast(`Started a conversation with ${user.name}`);
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast("Failed to start conversation. Please try again.");
    }
  };
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            {filteredChats.length} conversation
            {filteredChats.length !== 1 ? "s" : ""}
          </span>
          <UserSearchDialog
            trigger={
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <MessageSquarePlus className="h-4 w-4" />
              </Button>
            }
            title="New Conversation"
            onSelectUser={startConversation}
            buttonText="Start Chat"
          />
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-hidden px-2">
        {filteredChats.length > 0 ? (
          <div className="space-y-1 h-full overflow-y-auto">
            {filteredChats.map((chat) => (
              <Link
                key={chat.id}
                to={`/messages/${chat.id}`}
                className="block"
              >
                <div
                  className={`flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors border border-transparent hover:border-border ${
                    chat.unreadCount > 0 ? "bg-accent/30 border-primary/20" : ""
                  }`}
                >
                  <Avatar className="h-12 w-12 ring-2 ring-primary/10">
                    <AvatarImage
                      src={`data:image/png;base64,${
                        auth?.username === chat.user1Name
                          ? chat.user2Avatar
                          : chat.user1Avatar
                      }`}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-accent to-muted font-semibold">
                      {chat.user2Name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-semibold text-sm truncate">
                        {chat.user2Name}
                      </h4>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(chat.lastMessageTime), "HH:mm")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                    {chat.unreadCount > 0 && (
                      <Badge className="mt-1 bg-primary text-primary-foreground text-xs px-2 py-0.5">
                        {chat.unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-xs">
              <div className="mx-auto bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <MessageSquare className="h-8 w-8 text-primary/60" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No conversations yet. Start chatting with other music lovers!
              </p>
              <UserSearchDialog
                trigger={
                  <Button variant="outline" size="sm">
                    <MessageSquarePlus className="h-4 w-4 mr-2" />
                    Start Conversation
                  </Button>
                }
                title="New Conversation"
                onSelectUser={startConversation}
                buttonText="Start Chat"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
