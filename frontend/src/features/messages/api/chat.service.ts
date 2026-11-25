import type ChatPreview from "@/shared/types/chat/chat-preview";
import httpClient from "@/shared/api/http-client";
import type Message from "@/shared/types/chat/message";

export const getChats = async (
  username: string | undefined
): Promise<ChatPreview[]> => {
  const response = await httpClient.get(
    `Chat/get-user-chats?username=${username}`
  );
  return response.data;
};

export const getChat = async (
  chatId: string | undefined
): Promise<ChatPreview> => {
  const response = await httpClient.get(`Chat/get-chat/${chatId}`);
  return response.data;
};

export const getMessages = async (
  chatId: string | undefined
): Promise<Message[]> => {
  const response = await httpClient.get(`Chat/get-messages/${chatId}`);
  return response.data;
};

export const markMessagesAsRead = async (
  chatId: string | undefined,
  username: string | undefined
): Promise<void> => {
  if (!chatId || !username) return;

  await httpClient.post("Chat/mark-as-read", {
    chatId,
    username,
  });
};
