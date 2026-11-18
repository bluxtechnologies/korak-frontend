"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  LifeBuoy,
  ChevronRight,
  MessageSquare,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { ErrorState } from "@/components/shared/ErrorState";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  getTickets,
  type SupportTicket,
  type TicketStatus,
} from "./api";
import { queryClient } from "./hooks/useSupportTickets";
import { NewTicketForm } from "./NewTicketForm";

export interface SupportViewProps {
  initialTickets?: SupportTicket[];
  className?: string;
}

type FilterTab = "all" | TicketStatus;

const STATUS_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "open", label: "Open" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
  { key: "closed", label: "Closed" },
];

export function getStatusBadge(status: TicketStatus) {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />
          Open
        </span>
      );
    case "in_progress":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          <Loader2 className="size-3 animate-spin" />
          In Progress
        </span>
      );
    case "resolved":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="size-3" />
          Resolved
        </span>
      );
    case "closed":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-muted-foreground/20 bg-muted/60 px-2.5 py-0.5 text-[11px] font-semibold text-muted-foreground">
          <XCircle className="size-3" />
          Closed
        </span>
      );
  }
}

function getCategoryLabel(category: SupportTicket["category"]): string {
  const map: Record<SupportTicket["category"], string> = {
    billing: "Billing",
    order: "Order",
    vpn: "VPN",
    airtime_data: "Airtime & Data",
    account: "Account",
    general: "General",
  };
  return map[category] ?? category;
}

/**
 * SupportView — ticket list with status filter tabs, search, and "New Ticket" sheet.
 */
export function SupportView({ initialTickets, className }: SupportViewProps) {
  const router = useRouter();
  const [tickets, setTickets] = React.useState<SupportTicket[]>(
    initialTickets ?? []
  );
  const [isLoading, setIsLoading] = React.useState(!initialTickets);
  const [error, setError] = React.useState<unknown | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showNewTicket, setShowNewTicket] = React.useState(false);

  const fetchTickets = React.useCallback(async () => {
    try {
      const data = await getTickets({ per_page: 50 });
      setTickets(data);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;
    if (!initialTickets) {
      getTickets({ per_page: 50 })
        .then((data) => {
          if (!ignore) {
            setTickets(data);
            setError(null);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err);
            setIsLoading(false);
          }
        });
    }
    return () => {
      ignore = true;
    };
  }, [initialTickets]);

  React.useEffect(() => {
    const unsubscribe = queryClient.subscribe((invalidatedKey) => {
      const isTicketsKey =
        Array.isArray(invalidatedKey) &&
        invalidatedKey.length > 0 &&
        invalidatedKey[0] === "support-tickets";
      if (isTicketsKey) {
        fetchTickets();
      }
    });
    return unsubscribe;
  }, [fetchTickets]);

  const handleRetry = () => {
    setIsRetrying(true);
    setIsLoading(true);
    setError(null);
    fetchTickets();
  };

  const handleTicketCreated = (ticket: SupportTicket) => {
    setTickets((prev) => [ticket, ...prev]);
    setShowNewTicket(false);
    router.push(`${ROUTES.SUPPORT}/${ticket.id}`);
  };

  // Filtered list
  const filtered = React.useMemo(() => {
    let list = tickets;
    if (activeTab !== "all") {
      list = list.filter((t) => t.status === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (t) =>
          t.reference.toLowerCase().includes(q) ||
          t.subject.toLowerCase().includes(q) ||
          getCategoryLabel(t.category).toLowerCase().includes(q)
      );
    }
    return list;
  }, [tickets, activeTab, searchQuery]);

  const counts = React.useMemo(
    () => ({
      all: tickets.length,
      open: tickets.filter((t) => t.status === "open").length,
      in_progress: tickets.filter((t) => t.status === "in_progress").length,
      resolved: tickets.filter((t) => t.status === "resolved").length,
      closed: tickets.filter((t) => t.status === "closed").length,
    }),
    [tickets]
  );

  const unreadCount = tickets.filter((t) => t.has_unread_reply).length;

  return (
    <div className={cn("space-y-6", className)} data-testid="support-view">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Support
          </h1>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Raise a ticket and track admin replies for all your service issues.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[11px] font-bold text-primary">
                {unreadCount} unread {unreadCount === 1 ? "reply" : "replies"}
              </span>
            )}
          </p>
        </div>

        <Button
          type="button"
          onClick={() => setShowNewTicket(true)}
          className="h-9 gap-1.5 rounded-[8px] bg-primary text-primary-foreground text-xs font-bold shadow-xs hover:bg-primary/95 self-start sm:self-auto"
          data-testid="new-ticket-btn"
        >
          <Plus className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          New Ticket
        </Button>
      </div>

      {/* ── New Ticket Form (inline card) ── */}
      {showNewTicket && (
        <Card className="rounded-[10px] border border-primary/30 bg-primary/[0.02] shadow-xs">
          <CardContent className="p-5 sm:p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">
                Submit a new ticket
              </h2>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowNewTicket(false)}
                className="h-7 rounded-[6px] text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </div>
            <NewTicketForm onSuccess={handleTicketCreated} />
          </CardContent>
        </Card>
      )}

      {/* ── Status Filter Tabs ── */}
      <div
        role="tablist"
        aria-label="Filter tickets by status"
        className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-3"
      >
        {STATUS_TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={activeTab === key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors",
              activeTab === key
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border/70 bg-surface text-muted-foreground hover:bg-muted"
            )}
          >
            {label} ({counts[key]})
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search by reference, subject, or category…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-10 rounded-[8px] bg-surface pl-10 text-xs sm:text-sm border-border/80"
        />
      </div>

      {/* ── Loading skeleton ── */}
      {isLoading && (
        <div className="space-y-3" data-testid="support-loading-skeleton">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="rounded-[10px] border border-border shadow-none">
              <CardContent className="flex items-center gap-4 p-4">
                <Skeleton className="size-9 rounded-[8px] shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-48" />
                  <Skeleton className="h-3 w-72" />
                </div>
                <Skeleton className="h-6 w-20 rounded-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Error state ── */}
      {Boolean(error) && !isLoading && (
        <ErrorState
          title="Unable to load tickets"
          message="We could not retrieve your support tickets right now. Please try again."
          onRetry={handleRetry}
          isRetrying={isRetrying}
          className="my-8"
        />
      )}

      {/* ── Empty state ── */}
      {!isLoading && !error && filtered.length === 0 && (
        <Card className="rounded-[10px] border border-border shadow-none">
          <CardContent className="p-0">
            <EmptyState
              icon={LifeBuoy}
              title={
                searchQuery || activeTab !== "all"
                  ? "No tickets match your filter"
                  : "No support tickets yet"
              }
              description={
                searchQuery || activeTab !== "all"
                  ? "Try a different search term or status filter."
                  : "When you submit a ticket, it will appear here. Use the \"New Ticket\" button to get started."
              }
              bordered={false}
              className="py-14"
            />
          </CardContent>
        </Card>
      )}

      {/* ── Ticket list ── */}
      {!isLoading && !error && filtered.length > 0 && (
        <div className="space-y-3" data-testid="ticket-list">
          {filtered.map((ticket) => (
            <Link
              key={ticket.id}
              href={`${ROUTES.SUPPORT}/${ticket.id}`}
              className="block"
              data-testid={`ticket-row-${ticket.id}`}
            >
              <Card
                className={cn(
                  "rounded-[10px] border shadow-none transition-all hover:border-primary/40 hover:shadow-xs cursor-pointer",
                  ticket.has_unread_reply
                    ? "border-primary/30 bg-primary/[0.02]"
                    : "border-border bg-card"
                )}
              >
                <CardContent className="flex items-start gap-3 p-4 sm:items-center sm:gap-4">
                  {/* Icon */}
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-[8px] border border-border bg-muted/40 text-muted-foreground mt-0.5 sm:mt-0">
                    <MessageSquare
                      className="size-4"
                      strokeWidth={NAV_ICON_STROKE_WIDTH}
                    />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-mono text-[11px] font-bold text-muted-foreground">
                        {ticket.reference}
                      </span>
                      <span className="text-muted-foreground/40 select-none">
                        ·
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {getCategoryLabel(ticket.category)}
                      </span>
                      {ticket.has_unread_reply && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                          Unread reply
                        </span>
                      )}
                    </div>

                    <p className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      {ticket.subject}
                    </p>

                    {ticket.latest_message_preview && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {ticket.latest_message_preview}
                      </p>
                    )}

                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="size-3 shrink-0" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                      <span>{formatDate(ticket.updated_at)}</span>
                      <span className="text-muted-foreground/40">·</span>
                      <span>{ticket.message_count} {ticket.message_count === 1 ? "message" : "messages"}</span>
                    </div>
                  </div>

                  {/* Status + chevron */}
                  <div className="flex shrink-0 flex-col items-end gap-2 sm:flex-row sm:items-center">
                    {getStatusBadge(ticket.status)}
                    <ChevronRight
                      className="size-4 text-muted-foreground"
                      strokeWidth={NAV_ICON_STROKE_WIDTH}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
