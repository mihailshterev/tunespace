import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Send, Music } from "lucide-react";
import type Band from "@/features/band/types/band";
import useBandChat from "@/features/band/hooks/useBandChat";
import useAuth from "@/shared/auth/hooks/useAuth";
import { startBandChat, type BandMessage } from "@/features/band/api/band-chat.service";

interface BandChatInterfaceProps {
  chatId: string;
  band: Band;
}

const BandChatInterface = ({ chatId, band }: BandChatInterfaceProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [isStartingChat, setIsStartingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { auth } = useAuth();

  const {
    chatData,
    mutations: { sendMessageToBandMutation, sendMessageFromBandMutation },
    isLoading,
  } = useBandChat({
    bandId: band.id || "",
    chatId,
  });

  const messages = useMemo(
    () => chatData?.messages || [],
    [chatData?.messages]
  );
  const hasChat = !!chatData?.chatInfo;

  const isUserBandMember =
    band.members?.some((member) => member.id === auth.id) || false;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleStartChat = async () => {
    if (!auth?.id) {
      console.error("User not authenticated");
      return;
    }

    setIsStartingChat(true);
    try {
      await startBandChat(band.id!);
    } catch (error) {
      console.error("Error starting chat:", error);
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) {
      return;
    }

    try {
      if (isUserBandMember) {
        const targetUserId = messages.find(
          (msg: BandMessage) => !msg.isFromBand
        )?.senderId;

        if (targetUserId) {
          await sendMessageFromBandMutation({
            userId: targetUserId,
            content: newMessage.trim(),
          });
        } else {
          await sendMessageToBandMutation({
            content: newMessage.trim(),
          });
        }
      } else {
        await sendMessageToBandMutation({
          content: newMessage.trim(),
        });
      }
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Music className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  const placeholderText = isUserBandMember
    ? `Reply as ${band.name}...`
    : `Message ${band.name}...`;

  return (
    <div className="flex flex-col h-[600px] bg-background overflow-hidden">
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full">
          <div className="p-4">
            {" "}
            <div className="space-y-4">
              {!hasChat && !isUserBandMember ? (
                <div className="text-center py-8">
                  <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-semibold mb-2">
                    Connect with {band.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                    Start a conversation with {band.name} to ask questions,
                    share your thoughts, or just say hello!
                  </p>
                  <Button
                    onClick={handleStartChat}
                    disabled={isStartingChat}
                    className="min-w-32"
                  >
                    {isStartingChat ? (
                      <>
                        <Music className="h-4 w-4 mr-2 animate-spin" />
                        Starting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Start Chat
                      </>
                    )}
                  </Button>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">
                    Start the conversation
                  </p>
                  <p className="text-sm">
                    {isUserBandMember
                      ? `Reply to fans as ${band.name}`
                      : `Send a message to ${band.name}`}
                  </p>
                </div>
              ) : (
                messages.map((message: BandMessage) => {
                  const isCurrentUserMessage = isUserBandMember
                    ? message.isFromBand
                    : !message.isFromBand;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isCurrentUserMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isCurrentUserMessage
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isCurrentUserMessage
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground/70"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </ScrollArea>{" "}
      </div>
      {hasChat && (
        <div className="border-t border-border p-4 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholderText}
              className="flex-1"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BandChatInterface;
