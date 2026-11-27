import { formatDistanceToNow } from "date-fns";
import { cn } from "@/shared/utils/cn";
import {
  Bell,
  Heart,
  User,
  Music2,
  Calendar,
  MessageSquare,
  Guitar,
} from "lucide-react";
import type Notification from "@/shared/types/notification";
import { NotificationTypes } from "@/shared/utils/constants";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}

const NotificationItem = ({
  notification,
  onMarkAsRead,
  onDelete,
}: NotificationItemProps) => {
  const getNotificationIcon = () => {
    switch (notification.type) {
      case NotificationTypes.Like:
        return <Heart className="h-5 w-5 text-red-500" />;
      case NotificationTypes.Follow:
        return <User className="h-5 w-5 text-blue-500" />;
      case NotificationTypes.Message:
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case NotificationTypes.Event:
        return <Calendar className="h-5 w-5 text-purple-500" />;
      case NotificationTypes.Music:
        return <Music2 className="h-5 w-5 text-amber-500" />;
      case NotificationTypes.BandInvite:
        return <Guitar className="h-5 w-5 text-primary" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formattedTime = notification.timestamp
    ? formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })
    : "Recently";

  return (
    <div
      className={cn(
        "flex items-start space-x-4 p-4 rounded-lg transition-colors",
        notification.isRead
          ? "bg-card hover:bg-card/80"
          : "bg-primary/5 hover:bg-primary/10"
      )}
    >
      <div className="rounded-full bg-secondary p-2">
        {getNotificationIcon()}
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium">{notification.message}</p>
        <p className="text-xs text-muted-foreground">{formattedTime}</p>
      </div>
      <div className="flex space-x-2">
        {!notification.isRead && (
          <button
            onClick={() => onMarkAsRead(notification.id)}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            Mark as read
          </button>
        )}
        <button
          onClick={() => onDelete(notification.id)}
          className="text-xs text-destructive hover:text-destructive/70"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default NotificationItem;
