import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

export default function useNotificationSocket(
  userId,
  autoConnect = false,
  options = {},
) {
  const clientRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const initialNotifications = options.initialNotifications || [];
  const initialUnreadCount = options.initialUnreadCount || 0;

  const isNotificationUnseen = (notification) => {
    if (!notification) return true;

    const seenValue =
      notification.seen ??
      notification.isSeen ??
      notification.read ??
      notification.isRead;

    return seenValue === undefined || seenValue === null || seenValue === false;
  };

  // ✅ Store initial Redux data into socket hook state
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (Array.isArray(initialNotifications)) {
      setNotifications(initialNotifications);
    }

    setUnreadCount(Number(initialUnreadCount || 0));
  }, [userId, initialNotifications, initialUnreadCount]);

  const disconnectSocket = useCallback(async () => {
    if (clientRef.current) {
      try {
        await clientRef.current.deactivate();
      } catch (error) {
        console.error("Error while disconnecting WebSocket:", error);
      }

      clientRef.current = null;
    }

    setConnected(false);
    setConnecting(false);
    console.log("WebSocket stopped");
  }, []);

  const addLiveNotification = useCallback((notification) => {
    if (!notification) return;

    setNotifications((prev) => {
      const alreadyExists =
        notification.id &&
        prev.some((item) => item?.id && item.id === notification.id);

      if (alreadyExists) {
        return prev;
      }

      if (isNotificationUnseen(notification)) {
        setUnreadCount((prevCount) => Number(prevCount || 0) + 1);
      }

      return [notification, ...prev];
    });
  }, []);

  const connectSocket = useCallback(() => {
    if (!userId) {
      console.warn("User ID missing. WebSocket not started.");
      return;
    }

    if (clientRef.current?.active || clientRef.current?.connected) {
      console.log("WebSocket already active");
      return;
    }

    setConnecting(true);

    const client = new Client({
      brokerURL: "ws://localhost:9010/ws-native",

      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,

      debug: (str) => {
        console.log("STOMP:", str);
      },

      onConnect: () => {
        console.log("WebSocket connected");

        setConnected(true);
        setConnecting(false);

        // ✅ Live user notification listener
        client.subscribe(`/topic/notifications/${userId}`, (message) => {
          try {
            const data = JSON.parse(message.body);

            console.log("Live user notification:", data);

            addLiveNotification(data);
          } catch (error) {
            console.error("Invalid notification payload:", error);
          }
        });

        // ✅ Live global notification listener
        client.subscribe("/topic/notifications", (message) => {
          try {
            const data = JSON.parse(message.body);

            console.log("Live global notification:", data);

            addLiveNotification(data);
          } catch (error) {
            console.error("Invalid global notification payload:", error);
          }
        });

        // ❌ Removed from socket:
        // fetchUnreadCount()
        // /topic/notifications/${userId}/unread-count
      },

      onDisconnect: () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        setConnecting(false);
      },

      onWebSocketClose: () => {
        console.log("WebSocket closed");
        setConnected(false);
        setConnecting(false);
      },

      onWebSocketError: (error) => {
        console.error("WebSocket error:", error);
        setConnected(false);
        setConnecting(false);
      },

      onStompError: (frame) => {
        console.error("STOMP error:", frame.headers["message"]);
        console.error("Details:", frame.body);
        setConnected(false);
        setConnecting(false);
      },
    });

    clientRef.current = client;
    client.activate();
  }, [userId, addLiveNotification]);

  useEffect(() => {
    if (autoConnect && userId) {
      connectSocket();
    }

    if (!userId) {
      setUnreadCount(0);
      setNotifications([]);
    }

    return () => {
      disconnectSocket();
    };
  }, [autoConnect, userId, connectSocket, disconnectSocket]);

  return {
    connected,
    connecting,

    notifications,
    setNotifications,

    unreadCount,
    setUnreadCount,

    connectSocket,
    disconnectSocket,
  };
}