"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UserRound,
  Headphones,
  Send,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ErrorState } from "@/components/shared/ErrorState";
import { NAV_ICON_STROKE_WIDTH, ROUTES } from "@/config/navigation";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { showToast } from "@/components/ui/sonner";
import {
  getTicket,
  replyToTicket,
  type SupportTicketDetail,
  type TicketMessage,
} from "./api";
import { queryClient, SUPPORT_QUERY_KEYS } from "./hooks/useSupportTickets";
import { getStatusBadge } from "./SupportView";

export interface TicketThreadViewProps {
  ticketId: string;
  initialData?: SupportTicketDetail;
  className?: string;
}

function getCategoryLabel(category: SupportTicketDetail["category"]): string {
  const map: Record<SupportTicketDetail["category"], string> = {
    billing: "Billing & Payments",
    order: "Orders & Deliveries",
    vpn: "VPN",
    airtime_data: "Airtime & Data",
    account: "Account & Security",
    general: "General Enquiry",
  };
  return map[category] ?? category;
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const isAdmin = message.author === "admin";

  return (
    <div
      className={cn(
        "flex gap-3",
        isAdmin ? "flex-row" : "flex-row-reverse"
      )}
      data-testid={`message-${message.id}`}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold mt-0.5",
          isAdmin
            ? "border-primary/20 bg-primary/10 text-primary"
            : "border-border bg-muted text-muted-foreground"
        )}
        aria-hidden="true"
      >
        {isAdmin ? (
          <Headphones className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
        ) : (
          <UserRound className="size-4" strokeWidth={NAV_ICON_STROKE_WIDTH} />
        )}
      </div>

      {/* Bubble */}
      <div className={cn("max-w-[85%] space-y-1", isAdmin ? "items-start" : "items-end flex flex-col")}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-foreground">
            {message.author_name}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {formatDate(message.created_at)}
          </span>
        </div>
        <div
          className={cn(
            "rounded-[10px] px-4 py-3 text-sm leading-relaxed",
            isAdmin
              ? "bg-muted/60 border border-border text-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {message.body}
        </div>
      </div>
    </div>
  );
}

/**
 * TicketThreadView — full ticket detail page with chronological message thread
 * and customer reply input at the bottom.
 */
export function TicketThreadView({
  ticketId,
  initialData,
  className,
}: TicketThreadViewProps) {
  const [ticket, setTicket] = React.useState<SupportTicketDetail | null>(
    initialData ?? null
  );
  const [isLoading, setIsLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<unknown | null>(null);
  const [isRetrying, setIsRetrying] = React.useState(false);

  const [replyBody, setReplyBody] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [replyError, setReplyError] = React.useState<string | undefined>();

  const bottomRef = React.useRef<HTMLDivElement>(null);

  const fetchTicket = React.useCallback(async () => {
    try {
      const data = await getTicket(ticketId);
      if (data) {
        setTicket((prev) => {
          if (!prev) return data;
          const existingIds = new Set(data.messages.map((m) => m.id));
          const missing = prev.messages.filter((m) => !existingIds.has(m.id));
          return {
            ...data,
            messages: [...data.messages, ...missing],
          };
        });
      }
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
      setIsRetrying(false);
    }
  }, [ticketId]);

  React.useEffect(() => {
    let ignore = false;
    if (!initialData) {
      getTicket(ticketId)
        .then((data) => {
          if (!ignore) {
            setTicket(data);
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
  }, [initialData, ticketId]);

  React.useEffect(() => {
    const unsubscribe = queryClient.subscribe((invalidatedKey) => {
      const isCurrentTicketKey =
        Array.isArray(invalidatedKey) &&
        invalidatedKey.length >= 2 &&
        invalidatedKey[0] === "support-ticket" &&
        invalidatedKey[1] === ticketId;
      if (isCurrentTicketKey) {
        fetchTicket();
      }
    });
    return unsubscribe;
  }, [ticketId, fetchTicket]);

  // Scroll to bottom when messages load / change
  React.useEffect(() => {
    if (ticket?.messages.length) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [ticket?.messages.length]);

  const handleRetry = () => {
    setIsRetrying(true);
    setIsLoading(true);
    setError(null);
    fetchTicket();
  };

  const handleSendReply = async () => {
    if (!replyBody.trim()) {
      setReplyError("Please enter a message before sending.");
      return;
    }
    setReplyError(undefined);
    setIsSending(true);
    try {
      const newMessage = await replyToTicket(ticketId, {
        message: replyBody.trim(),
      });
      setTicket((prev) =>
        prev
          ? { ...prev, messages: [...prev.messages, newMessage] }
          : prev
      );
      setReplyBody("");
      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.ticket(ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.tickets(),
      });
      showToast.success("Reply sent", {
        description: "Your message has been sent to our support team.",
      });
    } catch {
      setReplyError("Failed to send reply. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const isClosed =
    ticket?.status === "resolved" || ticket?.status === "closed";

  return (
    <div className={cn("space-y-6", className)} data-testid="ticket-thread-view">
      {/* Back link */}
      <div>
        <Link
          href={ROUTES.SUPPORT}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
          Back to Support
        </Link>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="space-y-4" data-testid="thread-loading-skeleton">
          <div className="space-y-2">
            <Skeleton className="h-6 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Card className="rounded-[10px] border border-border shadow-none">
            <CardContent className="space-y-4 p-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={cn("flex gap-3", i % 2 === 1 && "flex-row-reverse")}>
                  <Skeleton className="size-8 rounded-full shrink-0" />
                  <div className="space-y-1.5 max-w-[70%]">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-16 w-full rounded-[10px]" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Error state */}
      {Boolean(error) && !isLoading && (
        <ErrorState
          title="Unable to load ticket"
          message="We could not load this support ticket. Please try again."
          onRetry={handleRetry}
          isRetrying={isRetrying}
          className="my-8"
        />
      )}

      {/* Thread content */}
      {!isLoading && !error && ticket && (
        <>
          {/* Ticket header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span className="font-mono font-bold">{ticket.reference}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>{getCategoryLabel(ticket.category)}</span>
                <span className="text-muted-foreground/40">·</span>
                <span>Opened {formatDate(ticket.created_at)}</span>
              </div>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                {ticket.subject}
              </h1>
            </div>
            {getStatusBadge(ticket.status)}
          </div>

          {/* Message thread */}
          <Card className="rounded-[10px] border border-border shadow-none overflow-hidden">
            <CardContent className="p-0">
              {/* Messages */}
              <div className="space-y-5 p-5 sm:p-6" data-testid="message-thread">
                {ticket.messages.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={bottomRef} />
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Reply input or closed banner */}
              {isClosed ? (
                <div
                  className="rounded-b-[10px] bg-muted/30 p-5 border-t border-border"
                  data-testid="ticket-closed-banner"
                >
                  <div className="flex items-start gap-3 rounded-[8px] border border-border/80 bg-background/80 p-4 text-xs text-muted-foreground">
                    <AlertCircle
                      className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                      strokeWidth={NAV_ICON_STROKE_WIDTH}
                    />
                    <p className="leading-relaxed">
                      This ticket has been marked as {ticket.status} and is closed
                      for further replies. If you still need help, please{" "}
                      <Link
                        href={ROUTES.SUPPORT}
                        className="font-semibold text-primary underline underline-offset-2 hover:text-primary/90"
                      >
                        create a new ticket
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 sm:p-5 space-y-3">
                  <Textarea
                    value={replyBody}
                    onChange={(e) => {
                      setReplyBody(e.target.value);
                      if (replyError) setReplyError(undefined);
                    }}
                    placeholder="Type your reply…"
                    maxLength={2000}
                    className="min-h-[90px] resize-y rounded-[8px] text-sm leading-relaxed border-border/80"
                    aria-label="Reply message"
                    disabled={isSending}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleSendReply();
                      }
                    }}
                  />
                  {replyError && (
                    <p className="flex items-center gap-1.5 text-xs text-destructive">
                      <AlertCircle className="size-3.5 shrink-0" />
                      {replyError}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-muted-foreground">
                        Press Ctrl+Enter to send
                      </span>
                      <span className="text-[11px] text-muted-foreground/80 font-mono">
                        {replyBody.length}/2000
                      </span>
                    </div>
                    <Button
                      type="button"
                      onClick={handleSendReply}
                      disabled={isSending || !replyBody.trim()}
                      className="h-9 gap-1.5 rounded-[8px] bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/95"
                      aria-label="Send reply"
                      data-testid="send-reply-btn"
                    >
                      {isSending ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Send className="size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
                      )}
                      {isSending ? "Sending…" : "Send Reply"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
