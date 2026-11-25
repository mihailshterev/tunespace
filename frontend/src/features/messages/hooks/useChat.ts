import { getChat } from "@/features/messages/api/chat.service";
import { useQuery } from "@tanstack/react-query";

const useChat = (chatId: string | undefined) => {
  const {
    data: chat,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => getChat(chatId),
    enabled: !!chatId,
  });

  return {
    chat,
    isLoading,
    isError,
    error,
  };
};

export default useChat;
