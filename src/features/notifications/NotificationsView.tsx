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
  Card,
  CardContent,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AppNotification,
  MOCK_NOTIFICATIONS,
} from "./api";

export interface NotificationsViewProps {
  initialNotifications?: AppNotification[];
  className?: string;
}

const CATEGORY_ICONS = {
  security: Shield,
  commerce: ShoppingBag,
  system: Bell,
};

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
          className="flex items-center gap-1.5 p-1 border border-border bg-surface rounded-md max-w-fit"
        >
          <button
            role="tab"
            type="button"
            aria-selected={filter === "all"}
            onClick={() => setFilter("all")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors",
              filter === "all"
                ? "bg-card text-foreground border border-border/80 font-semibold"
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
              "flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors",
              filter === "unread"
                ? "bg-card text-foreground border border-border/80 font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
            data-testid="filter-unread-tab"
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground flex h-4 min-w-4 items-center justify-center rounded-md px-1 text-[10px] font-semibold">
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
            className="text-xs h-8 gap-1.5"
            data-testid="mark-all-read-page-btn"
          >
            <CheckCheck className="h-3.5 w-3.5 text-primary" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3" data-testid="notifications-loading-skeleton">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="shadow-none">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-9 w-9 rounded-md" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-64" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16 rounded-md" />
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
        <Card className="shadow-none">
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
        <div className="space-y-3" data-testid="notifications-list">
          {displayedNotifications.map((notif) => {
            const isUnread = !notif.read_at;
            const Icon = CATEGORY_ICONS[notif.category] ?? Bell;

            return (
              <Card
                key={notif.id}
                className={cn(
                  "shadow-none transition-colors",
                  isUnread && "border-primary/40 bg-surface/60"
                )}
                data-testid={`notification-card-${notif.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        aria-hidden="true"
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-md border mt-0.5",
                          isUnread
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-surface text-muted-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-foreground">
                            {notif.title}
                          </h4>
                          <Badge variant={isUnread ? "info" : "outline"}>
                            {isUnread ? "Unread" : "Read"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/80">
                          {formatDate(notif.created_at, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {notif.action_url && (
                        <Button
                          asChild
                          variant="ghost"
                          size="sm"
                          className="h-8 text-xs font-medium text-primary hover:text-primary gap-1"
                        >
                          <Link href={notif.action_url}>
                            <span>View</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}

                      {isUnread && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notif.id)}
                          className="h-8 text-xs gap-1"
                          aria-label={`Mark "${notif.title}" as read`}
                        >
                          <Check className="h-3.5 w-3.5" />
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
