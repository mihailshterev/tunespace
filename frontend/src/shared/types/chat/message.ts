export default interface Message {
  id: string;
  senderName: string;
  senderId: string;
  senderAvatar?: string;
  recipientName: string;
  recipientId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
}
