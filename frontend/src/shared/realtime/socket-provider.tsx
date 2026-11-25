import { type ReactNode, useEffect, useState } from "react";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import useAuth from "@/shared/auth/hooks/useAuth";
import type SocketContextType from "./types";
import { SocketContext } from "./socket-context";
import httpClient from "@/shared/api/http-client";
import type Message from "@/shared/types/chat/message";
import { SIGNALR_HUB_URL } from "@/shared/utils/constants";
import type Notification from "@/shared/types/notification";
import type Chat from "@/shared/types/chat/chat";
import type ChatPreview from "@/shared/types/chat/chat-preview";
import type { BandChat, BandMessage } from "@/shared/types/band-chat";

interface SocketProviderProps {
  children: ReactNode;
}


const SocketProvider = ({ children }: SocketProviderProps) => {
  const [connection, setConnection] = useState<HubConnection | null>(null);

  const { auth } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [bandMessages, setBandMessages] = useState<BandMessage[]>([]);
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [bandChats, setBandChats] = useState<BandChat[]>([]);

  const createHubConnection = () => {
    if (!auth.accessToken) {
      console.log("No access token available, skipping SignalR connection");
      return;
    }

    const newConnection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        withCredentials: true,
        accessTokenFactory: () => auth.accessToken || "",
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  };

  const disconnectFromHub = () => {
    if (connection) {
      connection.stop();
      setConnection(null);
      console.log("Disconnected from SignalR hub");
    }
  };

  useEffect(() => {
    if (
      auth.username !== undefined &&
      auth.accessToken &&
      connection === null
    ) {
      createHubConnection();
    } else if (!auth.accessToken && connection) {
      disconnectFromHub();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.username, auth.accessToken]);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("SignalR Connected");

          connection.on("ReceiveMessage", onMessageReceived);
          connection.on("ChatCreated", onChatCreated);
          connection.on("ReceiveNotification", onNotificationReceived);
          connection.on("ReceiveBandMessage", onBandMessageReceived);
          connection.on("BandChatCreated", onBandChatCreated);
        })
        .catch((error) => {
          console.error("SignalR Connection Error: ", error);
          setConnection(null);
        });

      return () => {
        if (connection) {
          connection.off("ReceiveMessage");
          connection.off("ChatCreated");
          connection.off("ReceiveNotification");
          connection.off("ReceiveBandMessage");
          connection.off("BandChatCreated");
        }
      };
    }
  }, [connection]);

  // Chats
  const onMessageReceived = (message: Message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  const sendMessage = async ({
    message,
    sender,
    receiver,
  }: {
    message: string;
    sender: string;
    receiver: string;
  }) => {
    try {
      const chatMessage = {
        sender: sender,
        content: message,
        receiver: receiver,
      };

      await httpClient.post("Chat/send-private-message", chatMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const setChatMessages = (newMessages: Message[]) => {
    setMessages(newMessages);
  };

  const onChatCreated = (chat: ChatPreview) => {
    setChats((prevChats) => [...prevChats, chat]);
  };

  const createChat = async (chat: Chat) => {
    try {
      const newChat = {
        user1Name: chat.user1,
        user2Name: chat.user2,
      };
      await httpClient.post("Chat/create-chat", newChat);
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const setUserChats = (newUserChats: ChatPreview[]) => {
    setChats(newUserChats);
  };

  // Band Chats
  const onBandMessageReceived = (message: BandMessage) => {
    setBandMessages((prevMessages) => [...prevMessages, message]);
  };

  const onBandChatCreated = (chat: BandChat) => {
    setBandChats((prevChats) => [...prevChats, chat]);
  };

  const setBandChatMessages = (newMessages: BandMessage[]) => {
    setBandMessages(newMessages);
  };

  // Notifications
  const sendNotification = async ({
    message,
    type,
    source,
    recipientName,
  }: {
    message: string;
    type: string;
    source: string;
    recipientName: string;
  }) => {
    try {
      const notification = {
        message,
        type,
        source,
        recipientName,
      };

      await httpClient.post("Notification/send-notification", notification);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  const onNotificationReceived = (notification: Notification) => {
    setNotifications((prevNotifications) => [
      ...prevNotifications,
      notification,
    ]);
  };

  const setUserNotifications = (newNotifications: Notification[]) => {
    setNotifications(newNotifications);
  };

  const contextValue: SocketContextType = {
    notifications,
    sendNotification,
    setUserNotifications,
    createHubConnection,
    disconnectFromHub,
    messages,
    bandMessages,
    sendMessage,
    setChatMessages,
    setBandChatMessages,
    createChat,
    setUserChats,
    chats,
    bandChats,
    setBandChats,
  };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
