import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import httpClient from "@/shared/api/http-client";
import useSocket from "@/shared/realtime/useSocket";
import useAuth from "@/shared/auth/hooks/useAuth";
import { getUserNotifications } from "@/features/notifications/api/notification.service";

const useNotifications = () => {
  const queryClient = useQueryClient();
  const { auth, isAuthenticated } = useAuth();
  const { setUserNotifications } = useSocket();

  const {
    data: notifications,
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
    error: notificationsError,
    refetch,
  } = useQuery({
    queryKey: ["notifications", auth.username],
    queryFn: () => getUserNotifications(auth.username!),
    enabled: isAuthenticated && !!auth.username,
  });

  useEffect(() => {
    if (notifications) {
      setUserNotifications(notifications);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      return httpClient.put(`/Notification/mark-as-read/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", auth.username],
      });
    },
  });

  const markAllAsRead = useMutation({
    mutationFn: async () => {
      return httpClient.put(`/Notification/mark-all-as-read/${auth.username}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", auth.username],
      });
    },
  });

  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      return httpClient.delete(`/Notification/${notificationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["notifications", auth.username],
      });
    },
  });

  const handleMarkAsRead = useCallback(
    (notificationId: string) => {
      markAsRead.mutate(notificationId);
    },
    [markAsRead]
  );

  const handleMarkAllAsRead = useCallback(() => {
    markAllAsRead.mutate();
  }, [markAllAsRead]);

  const handleDeleteNotification = useCallback(
    (notificationId: string) => {
      deleteNotification.mutate(notificationId);
    },
    [deleteNotification]
  );

  return {
    notifications,
    unreadCount,
    isLoading: isNotificationsLoading,
    isError: isNotificationsError,
    error: notificationsError,
    refetch,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    deleteNotification: handleDeleteNotification,
  };
};

export default useNotifications;
