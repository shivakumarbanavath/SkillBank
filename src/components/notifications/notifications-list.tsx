"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { markAsRead, markAllAsRead } from "@/actions/notifications";
import {
  Bell,
  Calendar,
  CheckCheck,
  Coins,
  MessageSquare,
  Star,
  CheckCircle,
  AlertTriangle,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
}

interface NotificationsListProps {
  initialNotifications: NotificationItem[];
}

export function NotificationsList({ initialNotifications }: NotificationsListProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [loading, setLoading] = useState(false);

  const filtered = filter === "UNREAD"
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  async function handleMarkOneRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await markAsRead(id);
    router.refresh();
  }

  async function handleMarkAllRead() {
    setLoading(true);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    await markAllAsRead();
    setLoading(false);
    router.refresh();
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case "SESSION_REQUEST":
      case "SESSION_ACCEPTED":
      case "SESSION_DECLINED":
      case "SESSION_CANCELLED":
      case "SESSION_COMPLETED":
        return <Calendar className="w-5 h-5 text-blue-400" />;
      case "NEW_MESSAGE":
        return <MessageSquare className="w-5 h-5 text-indigo-400" />;
      case "NEW_REVIEW":
        return <Star className="w-5 h-5 text-yellow-400" />;
      case "CREDIT_EARNED":
      case "CREDIT_SPENT":
        return <Coins className="w-5 h-5 text-green-400" />;
      case "VERIFICATION_UPDATE":
        return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      default:
        return <Bell className="w-5 h-5 text-slate-400" />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === "ALL"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("UNREAD")}
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === "UNREAD"
                ? "bg-white/10 text-white"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={loading}
            className="btn btn-secondary btn-sm flex items-center gap-1.5 text-xs self-start sm:self-auto"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center text-slate-400 space-y-3">
          <Bell className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-white font-medium text-lg">No notifications</p>
          <p className="text-sm">
            {filter === "UNREAD"
              ? "You have caught up with all your updates!"
              : "When you receive session requests, reviews, or messages, they will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`card p-4 flex items-start gap-4 transition-all ${
                !item.isRead
                  ? "bg-blue-950/20 border-blue-500/30"
                  : "bg-white/[0.02] hover:bg-white/[0.04]"
              }`}
            >
              <div className="p-2 rounded-xl bg-white/5 border border-white/10 shrink-0 mt-0.5">
                {getNotificationIcon(item.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className={`text-sm font-semibold ${!item.isRead ? "text-white" : "text-slate-300"}`}>
                    {item.title}
                  </h3>
                  <span className="text-xs text-slate-500 shrink-0">
                    {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.body}</p>

                <div className="flex items-center gap-3 mt-3">
                  {item.link && (
                    <Link
                      href={item.link}
                      onClick={() => !item.isRead && handleMarkOneRead(item.id)}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
                    >
                      <span>View details</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}

                  {!item.isRead && (
                    <button
                      onClick={() => handleMarkOneRead(item.id)}
                      className="text-xs text-slate-500 hover:text-slate-300"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
