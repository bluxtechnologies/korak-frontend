"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { supportApi } from "../api/supportApi";
import type {
  CreateTicketPayload,
  ListTicketsQueryParams,
  PaginationMeta,
  ReplyTicketPayload,
  SupportTicketDetail,
  SupportTicketListItem,
  SupportTicketMessage,
} from "../types";

// ---------------------------------------------------------------------------
// Query Keys & Invalidation Event Bus
// ---------------------------------------------------------------------------

export const SUPPORT_QUERY_KEYS = {
  tickets: () => ["support-tickets"] as const,
  ticket: (id: string) => ["support-ticket", id] as const,
};

type QueryKey = readonly unknown[] | unknown[];

type InvalidationListener = (key: QueryKey) => void;

class SupportQueryClient {
  private listeners: Set<InvalidationListener> = new Set();

  subscribe(listener: InvalidationListener) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  invalidateQueries({ queryKey }: { queryKey: QueryKey }) {
    for (const listener of this.listeners) {
      try {
        listener(queryKey);
      } catch (err) {
        console.error("Error in query invalidation listener:", err);
      }
    }
  }
}

export const queryClient = new SupportQueryClient();

function matchesKey(pattern: QueryKey, target: QueryKey): boolean {
  if (pattern.length > target.length) return false;
  return pattern.every((part, idx) => part === target[idx]);
}

// ---------------------------------------------------------------------------
// 1. useSupportTickets hook
// ---------------------------------------------------------------------------

export interface UseSupportTicketsResult {
  tickets: SupportTicketListItem[];
  meta: PaginationMeta;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useSupportTickets(
  params?: ListTicketsQueryParams,
  initialData?: { data: SupportTicketListItem[]; meta: PaginationMeta }
): UseSupportTicketsResult {
  const [tickets, setTickets] = React.useState<SupportTicketListItem[]>(
    initialData?.data ?? []
  );
  const [meta, setMeta] = React.useState<PaginationMeta>(
    initialData?.meta ?? {
      current_page: 1,
      per_page: 15,
      total: initialData?.data.length ?? 0,
      last_page: 1,
    }
  );
  const [isLoading, setIsLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<unknown | null>(null);

  const page = params?.page;
  const per_page = params?.per_page;
  const status = params?.status;
  const category = params?.category;
  const search = params?.search;
  const sort = params?.sort;

  const fetchTickets = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await supportApi.listTickets({
        page,
        per_page,
        status,
        category,
        search,
        sort,
      });
      setTickets(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, per_page, status, category, search, sort]);

  // Initial fetch using promise callbacks to avoid synchronous setState in effect
  React.useEffect(() => {
    let ignore = false;
    supportApi
      .listTickets({ page, per_page, status, category, search, sort })
      .then((res) => {
        if (!ignore) {
          setTickets(res.data);
          setMeta(res.meta);
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
    return () => {
      ignore = true;
    };
  }, [page, per_page, status, category, search, sort]);

  // Listen for invalidations of ['support-tickets']
  React.useEffect(() => {
    const unsubscribe = queryClient.subscribe((invalidatedKey) => {
      if (matchesKey(["support-tickets"], invalidatedKey)) {
        fetchTickets();
      }
    });
    return unsubscribe;
  }, [fetchTickets]);

  return {
    tickets,
    meta,
    isLoading,
    error,
    refetch: fetchTickets,
  };
}

// ---------------------------------------------------------------------------
// 2. useSupportTicket hook
// ---------------------------------------------------------------------------

export interface UseSupportTicketResult {
  ticket: SupportTicketDetail | null;
  isLoading: boolean;
  error: unknown;
  refetch: () => Promise<void>;
}

export function useSupportTicket(
  ticketId: string,
  initialData?: SupportTicketDetail
): UseSupportTicketResult {
  const [ticket, setTicket] = React.useState<SupportTicketDetail | null>(
    initialData ?? null
  );
  const [isLoading, setIsLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<unknown | null>(null);

  const fetchTicket = React.useCallback(async () => {
    if (!ticketId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await supportApi.getTicket(ticketId);
      setTicket(res);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  React.useEffect(() => {
    let ignore = false;
    if (ticketId) {
      supportApi
        .getTicket(ticketId)
        .then((res) => {
          if (!ignore) {
            setTicket(res);
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
  }, [ticketId]);

  // Listen for invalidations of ['support-ticket', ticketId]
  React.useEffect(() => {
    const unsubscribe = queryClient.subscribe((invalidatedKey) => {
      if (matchesKey(["support-ticket", ticketId], invalidatedKey)) {
        fetchTicket();
      }
    });
    return unsubscribe;
  }, [ticketId, fetchTicket]);

  return {
    ticket,
    isLoading,
    error,
    refetch: fetchTicket,
  };
}

// ---------------------------------------------------------------------------
// 3. useCreateTicket hook
// ---------------------------------------------------------------------------

export interface UseCreateTicketOptions {
  onSuccess?: (ticket: SupportTicketListItem) => void;
  onError?: (error: unknown) => void;
  redirectToDetail?: boolean;
}

export function useCreateTicket(options: UseCreateTicketOptions = {}) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<unknown | null>(null);

  const mutateAsync = async (
    payload: CreateTicketPayload
  ): Promise<SupportTicketListItem> => {
    setIsPending(true);
    setError(null);
    try {
      const createdTicket = await supportApi.createTicket(payload);

      // Invalidate ['support-tickets']
      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.tickets(),
      });

      if (options.onSuccess) {
        options.onSuccess(createdTicket);
      }

      if (options.redirectToDetail !== false) {
        router.push(`/support/${encodeURIComponent(createdTicket.id)}`);
      }

      return createdTicket;
    } catch (err) {
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const mutate = (payload: CreateTicketPayload) => {
    mutateAsync(payload).catch(() => {});
  };

  return {
    mutate,
    mutateAsync,
    isPending,
    error,
  };
}

// ---------------------------------------------------------------------------
// 4. useReplyTicket hook
// ---------------------------------------------------------------------------

export interface UseReplyTicketOptions {
  onSuccess?: (message: SupportTicketMessage) => void;
  onError?: (error: unknown) => void;
}

export function useReplyTicket(
  ticketId: string,
  options: UseReplyTicketOptions = {}
) {
  const [isPending, setIsPending] = React.useState(false);
  const [error, setError] = React.useState<unknown | null>(null);

  const mutateAsync = async (
    payload: ReplyTicketPayload
  ): Promise<SupportTicketMessage> => {
    setIsPending(true);
    setError(null);
    try {
      const newMsg = await supportApi.replyTicket(ticketId, payload);

      // Invalidate ['support-ticket', ticketId] and ['support-tickets']
      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.ticket(ticketId),
      });
      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.tickets(),
      });

      if (options.onSuccess) {
        options.onSuccess(newMsg);
      }

      return newMsg;
    } catch (err) {
      setError(err);
      if (options.onError) {
        options.onError(err);
      }
      throw err;
    } finally {
      setIsPending(false);
    }
  };

  const mutate = (payload: ReplyTicketPayload) => {
    mutateAsync(payload).catch(() => {});
  };

  return {
    mutate,
    mutateAsync,
    isPending,
    error,
  };
}
