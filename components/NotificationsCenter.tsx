"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Notification {
  id: string;
  notificationType: string;
  title: string;
  message: string;
  isRead: boolean;
  actionUrl: string | null;
  createdAt: string;
}

export default function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      const response = await fetch("/api/notifications?unread=false", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationIds }),
      });

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          notificationIds.includes(n.id) ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - notificationIds.length));
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "CLASS_REMINDER":
        return "🔔";
      case "CREDIT_LOW":
        return "💰";
      case "MEMBERSHIP_EXPIRING":
        return "⏰";
      case "PROGRESS_REPORT":
        return "📊";
      case "CHECKPOINT_ACHIEVED":
        return "🏆";
      default:
        return "📬";
    }
  };

  const unreadNotifications = notifications.filter((n) => !n.isRead);
  const readNotifications = notifications.filter((n) => n.isRead);

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-accent text-white text-xs font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-card border border-neutral-200 z-50 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b border-neutral-200 flex justify-between items-center">
              <h3 className="font-semibold text-primary">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-accent hover:text-accent-dark font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-4 text-center text-neutral-600">
                  Loading notifications...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-neutral-600">
                  <p>No notifications</p>
                </div>
              ) : (
                <>
                  {unreadNotifications.length > 0 && (
                    <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200">
                      <p className="text-xs font-semibold text-neutral-600 uppercase">
                        New
                      </p>
                    </div>
                  )}
                  {unreadNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={() => markAsRead([notification.id])}
                    />
                  ))}

                  {readNotifications.length > 0 && unreadNotifications.length > 0 && (
                    <div className="px-4 py-2 bg-neutral-50 border-b border-neutral-200">
                      <p className="text-xs font-semibold text-neutral-600 uppercase">
                        Earlier
                      </p>
                    </div>
                  )}
                  {readNotifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkRead={() => markAsRead([notification.id])}
                    />
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function NotificationItem({
  notification,
  onMarkRead,
}: {
  notification: Notification;
  onMarkRead: () => void;
}) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "CLASS_REMINDER":
        return "🔔";
      case "CREDIT_LOW":
        return "💰";
      case "MEMBERSHIP_EXPIRING":
        return "⏰";
      case "PROGRESS_REPORT":
        return "📊";
      case "CHECKPOINT_ACHIEVED":
        return "🏆";
      default:
        return "📬";
    }
  };

  return (
    <Link
      href={notification.actionUrl || "#"}
      onClick={() => {
        if (!notification.isRead) {
          onMarkRead();
        }
      }}
      className={`block px-4 py-3 hover:bg-neutral-50 transition-colors border-b border-neutral-100 last:border-b-0 ${
        !notification.isRead ? "bg-accent/5" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{getNotificationIcon(notification.notificationType)}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${!notification.isRead ? "text-primary" : "text-neutral-700"}`}>
            {notification.title}
          </p>
          <p className="text-sm text-neutral-600 mt-1">{notification.message}</p>
          <p className="text-xs text-neutral-500 mt-1">
            {new Date(notification.createdAt).toLocaleDateString()}{" "}
            {new Date(notification.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </p>
        </div>
        {!notification.isRead && (
          <span className="h-2 w-2 bg-accent rounded-full mt-2 flex-shrink-0" />
        )}
      </div>
    </Link>
  );
}
