export default interface ChatPreview {
  id: string;
  user1Id: string;
  user1Name: string;
  user1Avatar?: string;
  user2Id: string;
  user2Name: string;
  user2Avatar?: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
}
