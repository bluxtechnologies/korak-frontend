"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Bell,
  Check,
  CheckCheck,
  ShieldCheck,
  ShoppingBag,
  Wallet,
  Smartphone,
  KeyRound,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AppNotification,
  MOCK_NOTIFICATIONS,
} from "./api";
import {
  formatNotificationMessage,
  formatNotificationTime,
} from "./formatters";

export interface NotificationsViewProps {
  initialNotifications?: AppNotification[];
  className?: string;
}

interface NotificationTheme {
  icon: LucideIcon;
  badgeClass: string;
}

function getNotificationTheme(notif: AppNotification): NotificationTheme {
  const type = notif.type.toLowerCase();
  const category = notif.category.toLowerCase();
  const title = notif.title.toLowerCase();

  if (category === "security" || type.includes("device") || type.includes("password")) {
    return {
      icon: type.includes("password") ? KeyRound : ShieldCheck,
      badgeClass:
        "border-amber-500/20 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };
  }

  if (
    type.includes("wallet") ||
    title.includes("wallet") ||
    title.includes("credited") ||
    title.includes("refund")
  ) {
    return {
      icon: Wallet,
      badgeClass:
        "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };
  }

  if (
    type.includes("airtime") ||
    type.includes("data") ||
    title.includes("data") ||
    title.includes("airtime")
  ) {
    return {
      icon: Smartphone,
      badgeClass: "border-primary/20 bg-primary/10 text-primary",
    };
  }

  if (category === "commerce" || type.includes("order")) {
    return {
      icon: ShoppingBag,
      badgeClass: "border-primary/20 bg-primary/10 text-primary",
    };
  }

  return {
    icon: Bell,
    badgeClass: "border-border bg-muted/60 text-muted-foreground",
  };
}

/**
 * NotificationsView (F14.3).
 * Full customer notifications list with tabs for All/Unread,
 * bulk mark-as-read, link actions, and full 4-state lifecycle.
 */
export function NotificationsView({
  initialNotifications,
  className,
}: NotificationsViewProps) {
  const [filter, setFilter] = React.useState<"all" | "unread">("all");
  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    initialNotifications ?? []
  );
  const [isLoading, setIsLoading] = React.useState(!initialNotifications);
  const [error, setError] = React.useState<unknown | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  React.useEffect(() => {
    let ignore = false;
    if (!initialNotifications) {
      const readParam = filter === "unread" ? false : undefined;
      getNotifications({
        page: 1,
        per_page: 50,
        read: readParam,
      })
        .then((res) => {
          if (!ignore) {
            setNotifications(res.data);
            setIsLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            if (process.env.NODE_ENV !== "production") {
              setNotifications(
                readParam === false
                  ? MOCK_NOTIFICATIONS.filter((n) => !n.read_at)
                  : MOCK_NOTIFICATIONS
              );
            } else {
              setError(err);
            }
            setIsLoading(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [filter, initialNotifications]);

  const handleRetry = () => {
    setIsRetrying(true);
    setIsLoading(true);
    setError(null);
    const readParam = filter === "unread" ? false : undefined;
    getNotifications({
      page: 1,
      per_page: 50,
      read: readParam,
    })
      .then((res) => {
        setNotifications(res.data);
      })
      .catch((err: unknown) => {
        if (process.env.NODE_ENV !== "production") {
          setNotifications(
            readParam === false
              ? MOCK_NOTIFICATIONS.filter((n) => !n.read_at)
              : MOCK_NOTIFICATIONS
          );
        } else {
          setError(err);
        }
      })
      .finally(() => {
        setIsLoading(false);
        setIsRetrying(false);
      });
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read_at: new Date().toISOString() }
            : n
        )
      );
      toast.success("Notification marked as read.");
    } catch {
      toast.error("Failed to mark as read.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
      );
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to mark all as read.");
    }
  };

  const displayedNotifications =
    filter === "unread"
      ? notifications.filter((n) => !n.read_at)
      : notifications;

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  return (
    <div className={cn("space-y-6", className)} data-testid="notifications-view">
      {/* Controls & Tab Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filter notifications"
          className="flex items-center gap-1 p-1 border border-border bg-muted/40 rounded-[8px] max-w-fit"
        >
          <button
            role="tab"
            type="button"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-[6px] transition-all",
              filter === "all"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-testid="filter-all-tab"
          >
            All Notifications
          </button>
          <button
            role="tab"
            type="button"
            aria-selected={filter === "unread"}
            onClick={() => setFilter("unread")}
            className={cn(
              "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-[6px] transition-all",
              filter === "unread"
                ? "bg-card text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-testid="filter-unread-tab"
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground flex h-4 min-w-4 items-center justify-center rounded-[4px] px-1 text-[10px] font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {unreadCount > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="text-xs h-8 gap-1.5 rounded-[8px]"
            data-testid="mark-all-read-page-btn"
          >
            <CheckCheck className="size-3.5 text-primary" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3" data-testid="notifications-loading-skeleton">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-none rounded-[10px] border border-border">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="size-9 rounded-[8px]" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-[6px]" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error State */}
      {Boolean(error) && !isLoading && (
        <ErrorState
          title="Unable to load notifications"
          message="Could not retrieve your notifications right now. Please try again."
          onRetry={handleRetry}
          isRetrying={isRetrying}
          className="my-8"
        />
      )}

      {/* Empty State */}
      {!isLoading && !error && displayedNotifications.length === 0 && (
        <Card className="shadow-none rounded-[10px] border border-border">
          <CardContent className="p-0">
            <EmptyState
              icon={Bell}
              title={
                filter === "unread"
                  ? "No unread notifications"
                  : "No notifications"
              }
              description={
                filter === "unread"
                  ? "You have caught up with all your unread alerts and updates."
                  : "You do not have any notifications stored at this time."
              }
              bordered={false}
              className="py-12"
            />
          </CardContent>
        </Card>
      )}

      {/* Notifications List */}
      {!isLoading && !error && displayedNotifications.length > 0 && (
        <div className="space-y-2.5" data-testid="notifications-list">
          {displayedNotifications.map((notif) => {
            const isUnread = !notif.read_at;
            const { icon: Icon, badgeClass } = getNotificationTheme(notif);
            const cleanMessage = formatNotificationMessage(notif.message);
            const relativeTime = formatNotificationTime(notif.created_at);

            return (
              <Card
                key={notif.id}
                className={cn(
                  "shadow-none rounded-[10px] border transition-colors",
                  isUnread
                    ? "border-primary/30 bg-primary/[0.02]"
                    : "border-border bg-card"
                )}
                data-testid={`notification-card-${notif.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        aria-hidden="true"
                        className={cn(
                          "size-9 shrink-0 rounded-[8px] border flex items-center justify-center mt-0.5",
                          badgeClass
                        )}
                      >
                        <Icon className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-foreground">
                            {notif.title}
                          </h4>
                          {isUnread && (
                            <span className="rounded-[4px] bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
                              Unread
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {cleanMessage}
                        </p>
                        <p className="text-[10px] font-medium text-muted-foreground/75">
                          {formatDate(notif.created_at, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })} • {relativeTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {notif.action_url && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-semibold text-primary hover:text-primary gap-1.5 rounded-[6px]"
                        >
                          <Link href={notif.action_url}>
                            <span>View</span>
                            <ArrowRight className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                          </Link>
                        </Button>
                      )}

                      {isUnread && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="h-8 text-xs font-medium gap-1.5 rounded-[6px]"
                          aria-label={`Mark "${notif.title}" as read`}
                        >
                          <Check className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                          <span>Mark read</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
