import { NotificationTypes } from "@/shared/utils/constants";

export default interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  type: NotificationTypes;
  source: string;
  recipientName?: string;
  timestamp: string;
}
