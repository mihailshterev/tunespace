import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import useSocket from "@/shared/realtime/useSocket";
import { getMessages, markMessagesAsRead } from "@/features/messages/api/chat.service";
import useAuth from "@/shared/auth/hooks/useAuth";

const useMessages = (chatId: string | undefined) => {
  const queryClient = useQueryClient();
  const { auth, isAuthenticated } = useAuth();
  const { sendMessage, setChatMessages, messages } = useSocket();

  const {
    data: messagesData,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
  } = useQuery({
    queryKey: ["messages", chatId],
    queryFn: () => getMessages(chatId),
    enabled: isAuthenticated && !!chatId,
  });
  useEffect(() => {
    if (chatId && auth?.username && isAuthenticated) {
      markMessagesAsRead(chatId, auth.username).then(() => {
        queryClient.invalidateQueries({
          queryKey: ["chats"],
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, auth?.username, isAuthenticated]);

  const { mutateAsync: sendMessageMutation } = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["messages", chatId],
      });
    },
  });

  useEffect(() => {
    if (messagesData) {
      setChatMessages(messagesData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messagesData]);

  return {
    messages,
    isMessagesLoading,
    isMessagesError,
    messagesError,
    sendMessageMutation,
  };
};

export default useMessages;
