import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";
import { api } from "./httpRequest";

export default function useNotificationSocket(userId, autoConnect = false) {
  const clientRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const extractUnreadCount = (responseData) => {
  if (typeof responseData === "number") {
    return responseData;
  }

  if (typeof responseData === "string") {
    const parsed = Number(responseData);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof responseData?.unreadCount === "number") {
    return responseData.unreadCount;
  }

  if (typeof responseData?.data === "number") {
    return responseData.data;
  }

  if (typeof responseData?.data?.unreadCount === "number") {
    return responseData.data.unreadCount;
  }

  if (typeof responseData?.count === "number") {
    return responseData.count;
  }

  return 0;
};

  const fetchUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const response = await api.get(
        `http://localhost:9001/api/notifications/unread-count?userId=${userId}`,
      );

      const count = extractUnreadCount(response?.data);

      

      console.log("Initial unread count:", count, response?.data);

      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  }, [userId]);

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

      onConnect: async () => {
        console.log("WebSocket connected");

        setConnected(true);
        setConnecting(false);

        // Load unread count immediately after socket connects
        await fetchUnreadCount();

        client.subscribe(`/topic/notifications/${userId}`, (message) => {
          try {
            const data = JSON.parse(message.body);

            setNotifications((prev) => [data, ...prev]);
          } catch (error) {
            console.error("Invalid notification payload:", error);
          }
        });

        client.subscribe(
          `/topic/notifications/${userId}/unread-count`,
          (message) => {
            try {
              const data = JSON.parse(message.body);
              const count = extractUnreadCount(data);

              console.log("Live unread count:", count, data);

              setUnreadCount(count);
            } catch (error) {
              console.error("Invalid unread count payload:", error);
            }
          },
        );

        client.subscribe("/topic/notifications", (message) => {
          try {
            const data = JSON.parse(message.body);

            setNotifications((prev) => [data, ...prev]);
          } catch (error) {
            console.error("Invalid global notification payload:", error);
          }
        });
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
  }, [userId, fetchUnreadCount]);

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
    fetchUnreadCount,

    connectSocket,
    disconnectSocket,
  };
}