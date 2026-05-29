"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import useNotificationSocket from "../useNotificationSocket";

export default function NotificationSocketProvider() {
  const user = useSelector((state) => state.auth?.user);

  const userId = user?.id;

  const { connected, connecting, notifications, disconnectSocket } =
    useNotificationSocket(userId, !!userId);

  useEffect(() => {
    console.log("Socket status:", {
      userId,
      connected,
      connecting,
      notificationCount: notifications.length,
    });
  }, [userId, connected, connecting, notifications.length]);

  useEffect(() => {
    if (!userId) {
      disconnectSocket();
    }
  }, [userId, disconnectSocket]);

  return null;
}
