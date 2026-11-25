import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserBandChats,
  getBandChats,
  getChatMessages,
  getUnreadCount,
  startBandChat,
  sendMessageToBand,
  sendMessageFromBand,
  markMessageAsRead,
  deleteMessage,
  deleteBandChat,
  checkBandChat,
  getBandChatById,
  type BandChat,
  type BandMessage,
} from "@/features/band/api/band-chat.service";
import { getBandById } from "@/features/band/api/band.service";
import { useEffect, useMemo, useState } from "react";
import useSocket from "@/shared/realtime/useSocket";
import useAuth from "@/shared/auth/hooks/useAuth";

interface UseBandChatOptions {
  bandId?: string;
  chatId?: string;
  autoStart?: boolean;
}

const useBandChat = (options: UseBandChatOptions) => {
  const { bandId, chatId } = options;
  const queryClient = useQueryClient();
  const { bandMessages } = useSocket();
  const { isAuthenticated } = useAuth();

  const [actualChatId, setActualChatId] = useState<string | null>(
    chatId || null
  );
  const [isStartingChat, setIsStartingChat] = useState(false);

  const isSpecificChat = !!chatId && chatId !== "new";
  const isNewChat = chatId === "new";

  const {
    data: bandData,
    isLoading: isBandLoading,
    isError: isBandError,
    error: bandError,
  } = useQuery({
    queryKey: ["band", bandId],
    queryFn: () => getBandById(bandId!),
    enabled: isAuthenticated && !!bandId,
  });

  const {
    data: userChats,
    isLoading: isUserChatsLoading,
    isError: isUserChatsError,
    error: userChatsError,
  } = useQuery({
    queryKey: ["bandChats", "user"],
    queryFn: () => getUserBandChats(),
    enabled: isAuthenticated,
  });

  const {
    data: bandChats,
    isLoading: isBandChatsLoading,
    isError: isBandChatsError,
    error: bandChatsError,
  } = useQuery({
    queryKey: ["bandChats", "band", bandId],
    queryFn: () => getBandChats(bandId!),
    enabled: isAuthenticated && !!bandId,
  });

  const {
    data: chatInfo,
    isLoading: isChatInfoLoading,
    isError: isChatInfoError,
    error: chatInfoError,
  } = useQuery({
    queryKey: ["bandChat", "info", bandId, chatId],
    queryFn: () => {
      if (isSpecificChat) {
        return getBandChatById(chatId);
      }
      if (bandId && isNewChat) {
        return checkBandChat(bandId);
      }
      return null;
    },
    enabled: isAuthenticated && !!bandId && (isSpecificChat || isNewChat),
    staleTime: 30 * 1000,
  });

  const currentChatId = useMemo(() => {
    if (isSpecificChat) return chatId;
    if (chatInfo?.id) return chatInfo.id;
    if (actualChatId) return actualChatId;
    return null;
  }, [isSpecificChat, chatId, chatInfo?.id, actualChatId]);

  const {
    data: messages,
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
  } = useQuery({
    queryKey: ["bandChats", "messages", currentChatId],
    queryFn: () => getChatMessages(currentChatId!, 0, 50),
    enabled: isAuthenticated && !!currentChatId && !isNewChat,
  });

  const {
    data: unreadCount,
    isLoading: isUnreadCountLoading,
    isError: isUnreadCountError,
    error: unreadCountError,
  } = useQuery({
    queryKey: ["bandChats", "unread", currentChatId],
    queryFn: () => getUnreadCount(currentChatId!),
    enabled: isAuthenticated && !!currentChatId && !isNewChat,
  });

  const mergedMessages = useMemo(() => {
    if (!currentChatId) return messages || [];

    const liveMessages = bandMessages.filter(
      (msg) => msg.bandChatId === currentChatId
    );

    const combined = [...(messages || []), ...liveMessages];
    const deduped = Array.from(
      new Map(combined.map((msg) => [msg.id, msg])).values()
    );

    return deduped.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  }, [messages, bandMessages, currentChatId]);

  useEffect(() => {
    if (isNewChat && chatInfo?.id && chatInfo.id !== chatId) {
      setActualChatId(chatInfo.id);
    }
  }, [isNewChat, chatInfo?.id, chatId]);

  const invalidateChatQueries = (
    targetBandId?: string,
    targetChatId?: string
  ) => {
    queryClient.invalidateQueries({ queryKey: ["bandChats", "user"] });
    if (targetBandId) {
      queryClient.invalidateQueries({
        queryKey: ["bandChats", "band", targetBandId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bandChat", "info", targetBandId],
      });
    }
    if (targetChatId) {
      queryClient.invalidateQueries({
        queryKey: ["bandChats", "messages", targetChatId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bandChats", "unread", targetChatId],
      });
    }
  };

  const { mutateAsync: startBandChatMutation } = useMutation({
    mutationFn: (targetBandId: string) => startBandChat(targetBandId),
    onSuccess: (data: BandChat) => {
      setActualChatId(data.id);
      invalidateChatQueries(data.bandId, data.id);
    },
  });

  const handleStartNewChat = async () => {
    if (!bandId) throw new Error("Band ID is required");

    setIsStartingChat(true);
    try {
      const newChat = await startBandChatMutation(bandId);
      return newChat;
    } finally {
      setIsStartingChat(false);
    }
  };

  const { mutateAsync: sendMessageToBandMutation } = useMutation({
    mutationFn: ({
      targetBandId,
      content,
    }: {
      targetBandId?: string;
      content: string;
    }) => {
      const bandIdToUse = targetBandId || bandId || chatInfo?.bandId;
      if (!bandIdToUse) throw new Error("Band ID not found");
      return sendMessageToBand(bandIdToUse, content);
    },
    onSuccess: (data: BandMessage) => {
      invalidateChatQueries(data.bandId, data.bandChatId);
    },
  });

  const { mutateAsync: sendMessageFromBandMutation } = useMutation({
    mutationFn: ({
      targetBandId,
      userId,
      content,
    }: {
      targetBandId?: string;
      userId: string;
      content: string;
    }) => {
      const bandIdToUse = targetBandId || bandId || chatInfo?.bandId;
      if (!bandIdToUse) throw new Error("Band ID not found");
      return sendMessageFromBand(bandIdToUse, userId, content);
    },
    onSuccess: (data: BandMessage) => {
      invalidateChatQueries(data.bandId, data.bandChatId);
    },
  });

  const { mutateAsync: markMessageAsReadMutation } = useMutation({
    mutationFn: (messageId: string) => markMessageAsRead(messageId),
    onSuccess: () => {
      invalidateChatQueries(bandId, currentChatId || undefined);
    },
  });

  const { mutateAsync: deleteMessageMutation } = useMutation({
    mutationFn: (messageId: string) => deleteMessage(messageId),
    onSuccess: () => {
      invalidateChatQueries(bandId, currentChatId || undefined);
    },
  });

  const { mutateAsync: deleteChatMutation } = useMutation({
    mutationFn: (targetChatId?: string) => {
      const chatIdToDelete = targetChatId || currentChatId;
      if (!chatIdToDelete) throw new Error("Chat ID not found");
      return deleteBandChat(chatIdToDelete);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bandChats"] });
    },
  });

  const isLoading =
    isBandLoading ||
    isUserChatsLoading ||
    isBandChatsLoading ||
    isMessagesLoading ||
    isUnreadCountLoading ||
    isChatInfoLoading;

  const isError =
    isBandError ||
    isUserChatsError ||
    isBandChatsError ||
    isMessagesError ||
    isUnreadCountError ||
    isChatInfoError;

  const error =
    bandError ||
    userChatsError ||
    bandChatsError ||
    messagesError ||
    unreadCountError ||
    chatInfoError;

  return {
    chatData: {
      userChats: userChats || [],
      bandChats: bandChats || [],
      messages: mergedMessages || [],
      unreadCount: unreadCount || 0,
      chatId: currentChatId,
      chatInfo: chatInfo,
      actualChatId,
    },
    bandData,
    isStartingChat,
    isNewChat,
    hasExistingChat: !!chatInfo?.id,
    handleStartNewChat,
    mutations: {
      startBandChatMutation,
      sendMessageToBandMutation,
      sendMessageFromBandMutation,
      markMessageAsReadMutation,
      deleteMessageMutation,
      deleteChatMutation,
    },
    isLoading,
    isError,
    error,
  };
};

export default useBandChat;
