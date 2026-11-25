import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import useSocket from "@/shared/realtime/useSocket";
import { getChats } from "@/features/messages/api/chat.service";
import useAuth from "@/shared/auth/hooks/useAuth";

const useChats = (user: string | undefined) => {
  const { createChat, setUserChats, chats } = useSocket();
  const { isAuthenticated } = useAuth();

  const queryClient = useQueryClient();

  const {
    data: chatsData,
    isLoading: isChatsLoading,
    isError: isChatsError,
    error: chatsError,
  } = useQuery({
    queryKey: ["chats", user],
    queryFn: () => getChats(user),
    enabled: isAuthenticated && !!user,
  });

  const { mutateAsync: addChatMutation } = useMutation({
    mutationFn: createChat,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["chats", user],
      });
    },
  });

  useEffect(() => {
    if (chatsData) {
      setUserChats(chatsData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatsData]);

  return {
    chats,
    isChatsLoading,
    isChatsError,
    chatsError,
    addChatMutation,
  };
};

export default useChats;
