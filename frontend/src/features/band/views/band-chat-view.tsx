import { Button } from "@/shared/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import BandChatInterface from "@/features/band/components/band-chat-interface";
import useAuth from "@/shared/auth/hooks/useAuth";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/ui/avatar";
import { Badge } from "@/shared/ui/badge";
import { useEffect } from "react";
import useBandChat from "@/features/band/hooks/useBandChat";
import { useNavigate, useParams } from "react-router";

export function BandChatView() {
  const params = useParams();
  const navigate = useNavigate();

  const bandId = params.bandId as string;
  const chatId = params.id as string;

  const { auth, isAuthenticated } = useAuth();

  const {
    chatData,
    bandData,
    isNewChat,
    hasExistingChat,
    isStartingChat,
    handleStartNewChat,
    isLoading,
    isError,
  } = useBandChat({
    bandId,
    chatId,
    autoStart: false,
  });

  const isUserBandMember =
    bandData?.members?.some((member) => member.id === auth?.id) || false;

  useEffect(() => {
    if (isNewChat && hasExistingChat && chatData.actualChatId) {
      navigate(`/band/${bandId}/chat/${chatData.actualChatId}`, { replace: true });
    }
  }, [isNewChat, hasExistingChat, chatData.actualChatId, navigate, bandId]);

  const handleStartNewChatWithRedirect = async () => {
    try {
      const newChat = await handleStartNewChat();
      navigate(`/band/${bandId}/chat/${newChat.id}`, { replace: true });
    } catch (error) {
      console.error("Failed to start band chat:", error);
    }
  };

  const chatUser = isUserBandMember
    ? chatData?.messages?.find((msg) => !msg.isFromBand && msg.senderName)
    : null;

  const handleBack = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading chat...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isError || !bandData) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">
              {isError ? "Error loading chat" : "Band not found"}
            </p>
            <p className="text-muted-foreground mb-4">
              {isError
                ? "There was an error loading the chat. Please try again."
                : "The band you're looking for doesn't exist or has been removed."}
            </p>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Please log in</p>
            <p className="text-muted-foreground mb-4">
              You need to be logged in to access this chat.
            </p>
            <Button
              onClick={() => navigate("/auth/login")}
              variant="default"
            >
              Log In
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isUserBandMember && isNewChat) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg font-medium mb-2">Band member access</p>
            <p className="text-muted-foreground mb-4">
              As a member of this band, you can&apos;t start a chat with your
              own band. You can use the band dashboard to communicate with fans
              instead.
            </p>
            <Button
              onClick={() => navigate(`/band/dashboard`)}
              variant="default"
              className="mr-2"
            >
              Go to Band Dashboard
            </Button>
            <Button onClick={handleBack} variant="outline">
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isNewChat && !hasExistingChat) {
    return (
      <div className="container max-w-4xl mx-auto py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage
                src={
                  bandData.coverImage
                    ? `data:image/jpeg;base64,${bandData.coverImage}`
                    : undefined
                }
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {bandData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="text-lg font-semibold">
                Start chat with {bandData.name}
              </h2>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {isUserBandMember ? (
                  "Band Member"
                ) : (
                  <>
                    {bandData.members && (
                      <span>
                        {bandData.members.length} member
                        {bandData.members.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </>
                )}
                {bandData.genre && (
                  <>
                    <span className="mx-1">•</span>
                    <Badge variant="secondary" className="text-xs">
                      {bandData.genre}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-lg font-medium mb-4">
              Start a conversation with {bandData.name}
            </p>
            <Button
              onClick={handleStartNewChatWithRedirect}
              disabled={isStartingChat}
              className="min-w-32"
            >
              {isStartingChat ? "Starting..." : "Start Chat"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-border">
              <AvatarImage
                src={
                  isUserBandMember
                    ? chatUser?.senderAvatar
                      ? `data:image/jpeg;base64,${chatUser.senderAvatar}`
                      : undefined
                    : bandData.coverImage
                    ? `data:image/jpeg;base64,${bandData.coverImage}`
                    : undefined
                }
                className="object-cover"
              />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {isUserBandMember && chatUser?.senderName
                  ? chatUser.senderName.charAt(0).toUpperCase()
                  : bandData.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">
                {isUserBandMember && chatUser?.senderName
                  ? `Chat with ${chatUser.senderName}`
                  : `Chat with ${bandData.name}`}
              </h2>
              <div className="text-sm text-muted-foreground flex items-center gap-1">
                <Users className="h-3 w-3" />
                {isUserBandMember ? (
                  "Fan"
                ) : (
                  <>
                    {bandData.members && (
                      <span>
                        {bandData.members.length} member
                        {bandData.members.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </>
                )}
                {bandData.genre && !isUserBandMember && (
                  <>
                    <span className="mx-1">•</span>
                    <Badge variant="secondary" className="text-xs">
                      {bandData.genre}
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <BandChatInterface chatId={chatData.chatId || chatId} band={bandData} />
    </div>
  );
}
