"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bell,
  Check,
  CheckCheck,
  Shield,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ROUTES } from "@/config/navigation";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AppNotification,
  MOCK_NOTIFICATIONS,
} from "./api";
import { useNotificationCount } from "./useNotificationCount";

export interface NotificationBellDropdownProps {
  initialNotifications?: AppNotification[];
  initialUnreadCount?: number;
  className?: string;
}

const CATEGORY_ICONS = {
  security: Shield,
  commerce: ShoppingBag,
  system: Bell,
};

/**
 * NotificationBellDropdown (F14.1 & F14.2).
 * Interactive Topbar bell widget showing unread badge count and a dropdown
 * preview list with quick mark-as-read and link to full notifications view.
 */
export function NotificationBellDropdown({
  initialNotifications,
  initialUnreadCount = 0,
  className,
}: NotificationBellDropdownProps) {
  const { unreadCount, decrementCount, resetCount } = useNotificationCount({
    initialCount: initialUnreadCount,
  });

  const [isOpen, setIsOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    initialNotifications ?? []
  );
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;
    if (isOpen) {
      getNotifications({ page: 1, per_page: 5 })
        .then((res) => {
          if (!ignore) {
            setNotifications(res.data);
            setIsLoading(false);
          }
        })
        .catch(() => {
          if (!ignore) {
            setNotifications(MOCK_NOTIFICATIONS);
            setIsLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen]);

  const handleMarkAsRead = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      decrementCount(1);
      toast.success("Notification marked as read.");
    } catch {
      toast.error("Failed to mark notification as read.");
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      resetCount();
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  const formattedUnread = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-muted-foreground hover:text-foreground relative h-9 w-9",
            className
          )}
          aria-label={
            unreadCount > 0
              ? `Notifications (${unreadCount} unread)`
              : "Notifications"
          }
          data-testid="notification-bell-trigger"
        >
          <Bell className="h-4 w-4" aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-md px-1 text-[10px] leading-none font-semibold"
              data-testid="notification-badge-count"
            >
              {formattedUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 sm:w-96 p-0 rounded-md border-border bg-card shadow-md"
        data-testid="notification-dropdown-content"
      >
        {/* Header */}
        <DropdownMenuLabel className="p-3 border-b border-border/60 font-normal">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                Notifications
              </span>
              {unreadCount > 0 && (
                <Badge variant="info">{unreadCount} new</Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-7 px-2 text-xs text-primary hover:text-primary gap-1"
                data-testid="mark-all-read-btn"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all read</span>
              </Button>
            )}
          </div>
        </DropdownMenuLabel>

        {/* Notification items preview list */}
        <div className="max-h-[340px] overflow-y-auto divide-y divide-border/40">
          {isLoading && notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-xs text-muted-foreground">
              You have no notifications right now.
            </div>
          ) : (
            notifications.slice(0, 5).map((notif) => {
              const isUnread = !notif.read_at;
              const Icon = CATEGORY_ICONS[notif.category] ?? Bell;

              return (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-3 p-3 transition-colors hover:bg-muted/50 cursor-pointer",
                    isUnread && "bg-surface"
                  )}
                  onClick={() => setIsOpen(false)}
                  data-testid={`notification-preview-${notif.id}`}
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-md border mt-0.5",
                      isUnread
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-border bg-surface text-muted-foreground"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={cn(
                          "text-xs truncate",
                          isUnread
                            ? "font-semibold text-foreground"
                            : "font-medium text-foreground"
                        )}
                      >
                        {notif.title}
                      </p>
                      {isUnread && (
                        <span
                          className="h-2 w-2 rounded-full bg-primary shrink-0"
                          aria-label="Unread"
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-muted-foreground/80 mt-1 block">
                      {formatDate(notif.created_at, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {isUnread && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMarkAsRead(e, notif.id)}
                      className="h-6 w-6 text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
                      aria-label={`Mark "${notif.title}" as read`}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="m-0" />

        {/* Footer */}
        <div className="p-2 bg-surface rounded-b-md">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-center h-8 text-xs font-medium text-primary hover:text-primary gap-1.5"
            onClick={() => setIsOpen(false)}
          >
            <Link href={ROUTES.NOTIFICATIONS}>
              <span>View all notifications</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
