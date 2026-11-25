import { useState, useEffect, useRef } from "react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Send, Paperclip } from "lucide-react";
import ChatMessage from "./chat-message";
import type ChatPreview from "@/shared/types/chat/chat-preview";
import useMessages from "@/features/messages/hooks/useMessages";
import useAuth from "@/shared/auth/hooks/useAuth";
import { Skeleton } from "@/shared/ui/skeleton";

interface ChatInterfaceProps {
  chat: ChatPreview | undefined;
}

const ChatInterface = ({ chat }: ChatInterfaceProps) => {
  const { messages, sendMessageMutation, isMessagesLoading } = useMessages(
    chat?.id
  );

  const { auth } = useAuth();

  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatUser =
    auth.username == chat?.user1Name ? chat?.user2Name : chat?.user1Name;
  const chatUserInitial = chatUser?.charAt(0).toUpperCase();

  const chatUserAvatar =
    auth.username == chat?.user1Name ? chat?.user2Avatar : chat?.user1Avatar;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (
      newMessage.trim() === "" ||
      auth?.id === undefined ||
      auth?.username === undefined
    ) {
      return;
    }

    sendMessageMutation({
      sender: auth.username,
      message: newMessage,
      receiver: chatUser!,
    });
    setNewMessage("");
  };

  if (isMessagesLoading || !chat) {
    return (
      <Card className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] shadow-md">
        <CardHeader className="border-b py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-6 w-28" />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-4 flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[70%] ${i % 2 === 0 ? "ml-auto" : "mr-auto"}`}
              >
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            </div>
          ))}
        </CardContent>
        <div className="border-t p-3 flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-20" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[calc(100vh-14rem)] min-h-[500px] shadow-md">
      <CardHeader className="border-b py-3">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={`data:image/png;base64,${chatUserAvatar}`}
              className="object-cover"
            />
            <AvatarFallback>{chatUserInitial}</AvatarFallback>
          </Avatar>
          <CardTitle>{chatUser}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        <div ref={messagesEndRef} />
      </CardContent>
      <div className="border-t p-3 flex gap-2">
        <Button variant="ghost" size="icon" className="shrink-0">
          <Paperclip className="h-5 w-5" />
        </Button>
        <Input
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          className="flex-1"
        />
        <Button onClick={handleSendMessage} disabled={newMessage.trim() === ""}>
          <Send className="h-5 w-5 mr-2" />
          Send
        </Button>
      </div>
    </Card>
  );
};

export default ChatInterface;
