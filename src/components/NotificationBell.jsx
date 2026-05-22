import { useState } from "react";
import {
  Badge,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/react";
import { BellRing, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useNotificationSocket from "../useNotificationSocket";

export default function NotificationBell({ userId }) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const {
    connected,
    connecting,
    notifications,
    setNotifications,
    connectSocket,
    disconnectSocket,
  } = useNotificationSocket(userId, false);

  const notificationCount = notifications?.length || 0;

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
        content={notificationCount > 99 ? "99+" : notificationCount}
        isInvisible={notificationCount === 0}
        shape="circle"
        size="sm"
      >
        <Button
          size="sm"
          variant="light"
          isIconOnly
          radius="full"
          onPress={() => setIsOpen(true)}
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
              <DrawerHeader className="flex items-start gap-5 border-b border-gray-200 px-5 py-4 dark:border-neutral-800">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Notifications
                  </h3>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {notificationCount > 0
                      ? `${notificationCount} notification${
                          notificationCount > 1 ? "s" : ""
                        } received`
                      : "No new notifications"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      connected
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {connected ? "Live" : "Offline"}
                  </span>

                  <Button
                    size="sm"
                    variant="flat"
                    color={connected ? "danger" : "success"}
                    isLoading={connecting}
                    onPress={connected ? disconnectSocket : connectSocket}
                  >
                    {connecting
                      ? "Connecting..."
                      : connected
                        ? "Stop Live"
                        : "Start Live"}
                  </Button>
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
                        notification.timestamp || notification.createdAt,
                      );

                      return (
                        <button
                          key={notification.id || index}
                          type="button"
                          onClick={() => handleNotificationClick(notification)}
                          className="w-full px-5 py-4 text-left transition hover:bg-gray-50 dark:hover:bg-neutral-900"
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

                                {notification.type && (
                                  <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600 dark:bg-neutral-800 dark:text-gray-300">
                                    {notification.type}
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

                                {notification.redirectUrl && (
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    View
                                  </span>
                                )}
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
                <Button
                  variant="flat"
                  className="flex-1"
                  onPress={() => setNotifications([])}
                  isDisabled={notificationCount === 0}
                >
                  Clear All
                </Button>

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
