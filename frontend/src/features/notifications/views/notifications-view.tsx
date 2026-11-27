import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/ui/tabs";
import { Button } from "@/shared/ui/button";
import { Bell, CheckSquare } from "lucide-react";
import NotificationItem from "@/features/notifications/components/notification-item";
import Loading from "@/shared/ui/loading";
import useNotifications from "@/features/notifications/hooks/useNotifications";
import { Separator } from "@/shared/ui/separator";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Alert, AlertDescription } from "@/shared/ui/alert";
import type Notification from "@/shared/types/notification";
import { BandInvitationsCard } from "@/features/band";

export function NotificationsView() {
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const {
    notifications,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const filteredNotifications =
    notifications?.filter((notification) => {
      if (activeTab === "unread") {
        return !notification.isRead;
      }
      return true;
    }) || [];

  const unreadCount = notifications?.filter((n) => !n.isRead).length || 0;

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl my-8">
        <Bell className="h-4 w-4" />
        <AlertDescription>
          Failed to load notifications. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground mt-1">
            Stay updated with your music community
          </p>
        </div>

        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckSquare className="h-4 w-4" />
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <BandInvitationsCard />

      <Tabs
        defaultValue="all"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "all" | "unread")}
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="all" className="relative">
              All
            </TabsTrigger>
            <TabsTrigger value="unread" className="relative">
              Unread
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground h-5 w-5 rounded-full text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <Separator className="my-4" />

        <TabsContent value="all" className="mt-2 space-y-4">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>

        <TabsContent value="unread" className="mt-2 space-y-4">
          {renderNotificationsList(filteredNotifications)}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderNotificationsList(notifications: Notification[]) {
    if (notifications.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted/30 rounded-full p-4 mb-4">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">No notifications</h3>
          <p className="text-muted-foreground mt-1">
            {activeTab === "unread"
              ? "You've read all your notifications."
              : "You don't have any notifications yet."}
          </p>
        </div>
      );
    }

    return (
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-2">
          {notifications.map((notification, index) => (
            <NotificationItem
              key={index}
              notification={notification}
              onMarkAsRead={markAsRead}
              onDelete={deleteNotification}
            />
          ))}
        </div>
      </ScrollArea>
    );
  }
}
