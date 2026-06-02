import { useCallback, useEffect, useState } from "react";
import {
  addToast,
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/react";
import { BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";

import useNotificationSocket from "../useNotificationSocket";

const API_BASE_URL = "http://localhost:9010";

const getAllNotificationsUrl = (userId) =>
  `${API_BASE_URL}/api/notifications?userId=${userId}&page=0&size=20`;

const getUnseenCountUrl = (userId) =>
  `${API_BASE_URL}/api/notifications/unread-count?userId=${userId}`;

const fetchJson = async (url) => {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      data?.message || `API failed with status ${response.status}`,
    );
  }

  return data;
};

const extractNotificationList = (responseData) => {
  if (Array.isArray(responseData)) return responseData;

  if (Array.isArray(responseData?.data)) return responseData.data;

  if (Array.isArray(responseData?.content)) return responseData.content;

  if (Array.isArray(responseData?.data?.content)) {
    return responseData.data.content;
  }

  if (Array.isArray(responseData?.notifications)) {
    return responseData.notifications;
  }

  if (Array.isArray(responseData?.notificationList)) {
    return responseData.notificationList;
  }

  return [];
};

const extractUnseenCount = (responseData) => {
  if (typeof responseData === "number") return responseData;

  if (typeof responseData === "string") {
    const parsed = Number(responseData);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  if (typeof responseData?.data === "number") return responseData.data;

  if (typeof responseData?.count === "number") return responseData.count;

  if (typeof responseData?.unseenCount === "number") {
    return responseData.unseenCount;
  }

  if (typeof responseData?.unreadCount === "number") {
    return responseData.unreadCount;
  }

  if (typeof responseData?.data?.count === "number") {
    return responseData.data.count;
  }

  if (typeof responseData?.data?.unseenCount === "number") {
    return responseData.data.unseenCount;
  }

  if (typeof responseData?.data?.unreadCount === "number") {
    return responseData.data.unreadCount;
  }

  return 0;
};

export default function NotificationBell({ userId }) {
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [initialNotifications, setInitialNotifications] = useState([]);
  const [initialUnreadCount, setInitialUnreadCount] = useState(0);
  const [initialLoading, setInitialLoading] = useState(false);

  const fetchInitialNotifications = useCallback(async () => {
    if (!userId) {
      setInitialNotifications([]);
      setInitialUnreadCount(0);
      return;
    }

    setInitialLoading(true);

    try {
      const [countData, notificationsData] = await Promise.all([
        fetchJson(getUnseenCountUrl(userId)),
        fetchJson(getAllNotificationsUrl(userId)),
      ]);

      const count = extractUnseenCount(countData);
      const list = extractNotificationList(notificationsData);

      console.log("Initial unseen count:", count, countData);
      console.log("Initial notifications:", list, notificationsData);

      setInitialUnreadCount(count);
      setInitialNotifications(list);
    } catch (error) {
      console.error("Failed to fetch initial notifications:", error);

      setInitialUnreadCount(0);
      setInitialNotifications([]);
    } finally {
      setInitialLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchInitialNotifications();
  }, [fetchInitialNotifications]);

  const { connected, connecting, notifications, unreadCount } =
    useNotificationSocket(userId, Boolean(userId), {
      initialNotifications,
      initialUnreadCount,
    });

  const notificationCount = notifications?.length || 0;
  const unreadBadgeCount = Number(unreadCount || 0);

  const [lastToastNotificationId, setLastToastNotificationId] = useState(null);

  useEffect(() => {
    if (!notifications || notifications.length === 0) return;

    const latestNotification = notifications[0];

    const notificationId =
      latestNotification?.id ||
      latestNotification?.notificationId ||
      latestNotification?.createdAt ||
      latestNotification?.timestamp;

    if (!notificationId) return;

    if (lastToastNotificationId === null) {
      setLastToastNotificationId(notificationId);
      return;
    }

    if (lastToastNotificationId !== notificationId) {
      addToast({
        title: latestNotification?.title || "New Notification",
        description:
          latestNotification?.message ||
          "You have received a new notification.",
        color: "primary",
      });

      setLastToastNotificationId(notificationId);
    }
  }, [notifications, lastToastNotificationId]);

  const handleOpenNotifications = () => {
    setIsOpen(true);

    fetchInitialNotifications();
  };

  const handleNotificationClick = (notification) => {
    if (notification?.redirectUrl) {
      setIsOpen(false);
      navigate(notification.redirectUrl);
    }
  };

  const formatDateTime = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  return (
    <>
      <Badge
        color="danger"
        content={unreadBadgeCount > 99 ? "99+" : unreadBadgeCount}
        isInvisible={unreadBadgeCount === 0}
        shape="circle"
        size="sm"
      >
        <Button
          size="sm"
          variant="light"
          isIconOnly
          radius="full"
          onPress={handleOpenNotifications}
          className="min-w-8 h-8 w-8 text-gray-600 dark:text-gray-300"
          aria-label="Open notifications"
        >
          <BellRing size={19} strokeWidth={2} />
        </Button>
      </Badge>

      <Drawer
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="right"
        size="md"
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex items-start justify-between gap-5 border-b border-gray-200 px-5 py-4 dark:border-neutral-800">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {initialLoading
                      ? "Loading notifications..."
                      : unreadBadgeCount > 0
                        ? `${unreadBadgeCount} unseen notification${
                            unreadBadgeCount > 1 ? "s" : ""
                          }`
                        : "No unseen notifications"}
                  </p>
                </div>

                <div className="flex items-center gap-2 pr-5">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      connected
                        ? "bg-green-100 text-green-700"
                        : connecting
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {connected
                      ? "Live"
                      : connecting
                        ? "Connecting..."
                        : "Offline"}
                  </span>
                </div>
              </DrawerHeader>

              <DrawerBody className="p-0">
                {notificationCount === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-8 py-16 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400 dark:bg-neutral-800 dark:text-gray-500">
                      <BellRing size={30} strokeWidth={1.8} />
                    </div>

                    <h4 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
                      No notifications yet
                    </h4>

                    <p className="mt-2 max-w-xs text-sm text-gray-500 dark:text-gray-400">
                      New lead, proposal, approval, or task updates will appear
                      here automatically.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-neutral-800">
                    {notifications.map((notification, index) => {
                      const dateText = formatDateTime(
                        notification.timestamp ||
                          notification.createdAt ||
                          notification.createdDate,
                      );

                      return (
                        <button
                          key={notification.id || index}
                          type="button"
                          // onClick={() => handleNotificationClick(notification)}
                          className={`w-full px-5 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-neutral-900 ${notification.read ? "" : "bg-slate-500/20"}`}
                        >
                          <div className="flex gap-3">
                            <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
                              <BellRing size={18} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-3">
                                <h4 className="line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white">
                                  {notification.title || "New Notification"}
                                </h4>

                                {(notification.type ||
                                  notification.eventType ||
                                  notification.module) && (
                                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
                                    {notification.type ||
                                      notification.eventType ||
                                      notification.module}
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 line-clamp-2 text-sm leading-5 text-gray-600 dark:text-gray-400">
                                {notification.message ||
                                  "You have a new update."}
                              </p>

                              <div className="mt-2 flex items-center justify-between gap-3">
                                {dateText && (
                                  <span className="text-xs text-gray-400">
                                    {dateText}
                                  </span>
                                )}

                                {/* {notification.redirectUrl && (
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    View
                                  </span>
                                )} */}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </DrawerBody>

              <DrawerFooter className="border-t border-gray-200 px-5 py-4 dark:border-neutral-800">
                <Button color="primary" className="flex-1" onPress={onClose}>
                  Close
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
