export interface BandChat {
  id: string;
  userId: string;
  userName: string;
  userAvatar: Uint8Array;
  bandId: string;
  bandName: string;
  bandAvatar: Uint8Array;
  lastMessage: string;
  lastMessageTime?: string;
  unreadCount: number;
  createdAt: string;
}

export interface BandMessage {
  id: string;
  bandChatId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isFromBand: boolean;
  senderId?: string;
  senderName?: string;
  senderAvatar?: Uint8Array;
  bandId?: string;
  bandName?: string;
  bandAvatar?: Uint8Array;
}
