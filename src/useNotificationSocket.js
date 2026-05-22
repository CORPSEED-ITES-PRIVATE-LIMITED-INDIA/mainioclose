import { useCallback, useEffect, useRef, useState } from "react";
import { Client } from "@stomp/stompjs";

export default function useNotificationSocket(userId, autoConnect = false) {
  const clientRef = useRef(null);

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [notifications, setNotifications] = useState([]);

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

      onConnect: () => {
        console.log("WebSocket connected");
        setConnected(true);
        setConnecting(false);

        client.subscribe(`/topic/notifications/${userId}`, (message) => {
          try {
            const data = JSON.parse(message.body);
            setNotifications((prev) => [data, ...prev]);
          } catch (error) {
            console.error("Invalid notification payload:", error);
          }
        });

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
  }, [userId]);

  useEffect(() => {
    if (autoConnect && userId) {
      connectSocket();
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
    connectSocket,
    disconnectSocket,
  };
}
