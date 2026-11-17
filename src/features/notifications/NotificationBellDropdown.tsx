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
  ArrowRight,
  Smartphone,
  KeyRound,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { cn } from "@/lib/utils";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type AppNotification,
  MOCK_NOTIFICATIONS,
} from "./api";
import { useNotificationCount } from "./useNotificationCount";
import {
  formatNotificationMessage,
  formatNotificationTime,
} from "./formatters";

export interface NotificationBellDropdownProps {
  initialNotifications?: AppNotification[];
  initialUnreadCount?: number;
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
 * NotificationBellDropdown (F14.1 & F14.2).
 * Refined notification center dropdown:
 * - 100% opaque surface (no bleed-through from background)
 * - Human-readable messages with user-agent sanitization (Doc 11 §7)
 * - Quick "All" vs "Unread" tab switcher
 * - Locked 10px radius and sleek typography
 * - Single-click navigation and mark-as-read
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
  const [activeTab, setActiveTab] = React.useState<"all" | "unread">("all");
  const [notifications, setNotifications] = React.useState<AppNotification[]>(
    initialNotifications ?? []
  );
  const [isLoading, setIsLoading] = React.useState(false);

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      setIsOpen(open);
      if (open) {
        setIsLoading(true);
        getNotifications({ page: 1, per_page: 8 })
          .then((res) => {
            setNotifications(res.data);
            setIsLoading(false);
          })
          .catch(() => {
            setNotifications(MOCK_NOTIFICATIONS);
            setIsLoading(false);
          });
      }
    },
    []
  );

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

  const handleItemClick = async (notif: AppNotification) => {
    if (!notif.read_at) {
      try {
        await markNotificationAsRead(notif.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notif.id
              ? { ...n, read_at: new Date().toISOString() }
              : n
          )
        );
        decrementCount(1);
      } catch {
        // Continue even if marking read fails
      }
    }
    setIsOpen(false);
  };

  const formattedUnread = unreadCount > 99 ? "99+" : String(unreadCount);

  const displayedNotifications = React.useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.read_at);
    }
    return notifications;
  }, [notifications, activeTab]);

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "text-muted-foreground hover:text-foreground hover:bg-muted/70 relative size-9 rounded-[8px] transition-colors data-[state=open]:bg-muted/80 data-[state=open]:text-foreground",
            className
          )}
          aria-label={
            unreadCount > 0
              ? `Notifications (${unreadCount} unread)`
              : "Notifications"
          }
          data-testid="notification-bell-trigger"
        >
          <Bell className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} aria-hidden="true" />
          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="bg-primary text-primary-foreground absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-[5px] px-1 text-[10px] leading-none font-bold shadow-xs"
              data-testid="notification-badge-count"
            >
              {formattedUnread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[360px] sm:w-[400px] p-0 rounded-[10px] border border-border bg-card text-card-foreground shadow-xl shadow-black/8 overflow-hidden z-50"
        data-testid="notification-dropdown-content"
      >
        {/* Header */}
        <DropdownMenuLabel className="p-3.5 border-b border-border bg-card font-normal">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-foreground">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="rounded-[6px] bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary border border-primary/20">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors py-1 px-2 rounded-[6px] hover:bg-muted/60"
                data-testid="mark-all-read-btn"
              >
                <CheckCheck className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Quick Filter Switcher */}
          <div className="flex items-center gap-1 mt-2.5 p-1 bg-muted/40 rounded-[8px] border border-border/60">
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className={cn(
                "flex-1 py-1 text-xs font-semibold rounded-[6px] transition-all text-center",
                activeTab === "all"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("unread")}
              className={cn(
                "flex-1 py-1 text-xs font-semibold rounded-[6px] transition-all text-center",
                activeTab === "unread"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Unread ({unreadCount})
            </button>
          </div>
        </DropdownMenuLabel>

        {/* Notifications preview list */}
        <div className="max-h-[360px] overflow-y-auto divide-y divide-border/50">
          {isLoading && notifications.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              Loading notifications...
            </div>
          ) : displayedNotifications.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
              <div className="size-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCheck className="size-4.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              </div>
              <p className="text-xs font-semibold text-foreground">
                {activeTab === "unread"
                  ? "All caught up"
                  : "No notifications"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {activeTab === "unread"
                  ? "You have reviewed all your alerts and activity."
                  : "You do not have any notifications stored at this time."}
              </p>
            </div>
          ) : (
            displayedNotifications.slice(0, 6).map((notif) => {
              const isUnread = !notif.read_at;
              const { icon: Icon, badgeClass } = getNotificationTheme(notif);
              const cleanMessage = formatNotificationMessage(notif.message);
              const relativeTime = formatNotificationTime(notif.created_at);

              const innerContent = (
                <>
                  {/* Category icon box */}
                  <div
                    aria-hidden="true"
                    className={cn(
                      "size-9 shrink-0 rounded-[8px] border flex items-center justify-center mt-0.5",
                      badgeClass
                    )}
                  >
                    <Icon className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                  </div>

                  {/* Body Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className={cn(
                          "text-xs truncate font-semibold text-foreground",
                          isUnread ? "text-foreground" : "text-foreground/80 font-medium"
                        )}
                      >
                        {notif.title}
                      </p>
                      <span className="text-[10px] font-medium text-muted-foreground shrink-0">
                        {relativeTime}
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mt-0.5">
                      {cleanMessage}
                    </p>
                  </div>

                  {/* Unread dot & Mark-read hover action */}
                  <div className="flex items-center gap-1 shrink-0 self-center">
                    {isUnread && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleMarkAsRead(e, notif.id)}
                          className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity size-6 rounded-[6px] hover:bg-muted inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                          aria-label={`Mark "${notif.title}" as read`}
                        >
                          <Check className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                        </button>
                        <span
                          className="size-2 rounded-full bg-primary shrink-0"
                          aria-label="Unread"
                        />
                      </>
                    )}
                  </div>
                </>
              );

              if (notif.action_url) {
                return (
                  <Link
                    key={notif.id}
                    href={notif.action_url}
                    onClick={() => handleItemClick(notif)}
                    className={cn(
                      "group relative flex items-start gap-3 p-3 transition-colors hover:bg-muted/40 cursor-pointer text-left focus:outline-none focus-visible:bg-muted/50",
                      isUnread && "bg-primary/[0.03]"
                    )}
                    data-testid={`notification-preview-${notif.id}`}
                  >
                    {innerContent}
                  </Link>
                );
              }

              return (
                <div
                  key={notif.id}
                  onClick={() => handleItemClick(notif)}
                  className={cn(
                    "group relative flex items-start gap-3 p-3 transition-colors hover:bg-muted/40 cursor-pointer text-left focus:outline-none focus-visible:bg-muted/50",
                    isUnread && "bg-primary/[0.03]"
                  )}
                  data-testid={`notification-preview-${notif.id}`}
                >
                  {innerContent}
                </div>
              );
            })
          )}
        </div>

        <DropdownMenuSeparator className="m-0 border-border" />

        {/* Footer */}
        <div className="p-2 bg-muted/20">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="w-full justify-center h-8 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 gap-1.5 rounded-[8px]"
            onClick={() => setIsOpen(false)}
          >
            <Link href={ROUTES.NOTIFICATIONS}>
              <span>View all notifications</span>
              <ArrowRight className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
            </Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
