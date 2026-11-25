import type Notification from "@/shared/types/notification";
import type Chat from "@/shared/types/chat/chat";
import type ChatPreview from "@/shared/types/chat/chat-preview";
import type Message from "@/shared/types/chat/message";
import type { BandChat, BandMessage } from "@/shared/types/band-chat";

export default interface SocketContextType {
  notifications: Notification[];
  messages: Message[];
  bandMessages: BandMessage[];
  sendNotification: ({
    message,
    type,
    source,
    recipientName,
  }: {
    message: string;
    type: string;
    source: string;
    recipientName: string;
  }) => Promise<void>;
  setUserNotifications: (notifications: Notification[]) => void;
  setUserChats: (newUserChats: ChatPreview[]) => void;
  setBandChats: (newBandChats: BandChat[]) => void;
  createHubConnection: () => void;
  disconnectFromHub: () => void;
  setChatMessages: (newMessages: Message[]) => void;
  setBandChatMessages: (newMessages: BandMessage[]) => void;
  sendMessage: ({
    message,
    sender,
    receiver,
  }: {
    message: string;
    sender: string;
    receiver: string;
  }) => Promise<void>;
  createChat: (chat: Chat) => Promise<void>;
  chats: ChatPreview[];
  bandChats: BandChat[];
}
