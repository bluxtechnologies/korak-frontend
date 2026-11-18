import { renderHook, act, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  queryClient,
  SUPPORT_QUERY_KEYS,
  useCreateTicket,
  useReplyTicket,
  useSupportTicket,
  useSupportTickets,
} from "./useSupportTickets";
import { supportApi } from "../api/supportApi";
import { MOCK_TICKETS, MOCK_TICKET_DETAIL } from "../api/supportApi";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("../api/supportApi", () => ({
  supportApi: {
    listTickets: vi.fn(),
    getTicket: vi.fn(),
    createTicket: vi.fn(),
    replyTicket: vi.fn(),
  },
  MOCK_TICKETS: [
    {
      id: "tkt_01",
      reference: "TKT-00142",
      subject: "Wallet not credited",
      category: "billing",
      status: "in_progress",
      message_count: 4,
      has_unread_reply: true,
      latest_message_preview: "Escalated",
      created_at: "2026-11-17T09:12:00Z",
      updated_at: "2026-11-17T14:30:00Z",
    },
  ],
  MOCK_TICKET_DETAIL: {
    id: "tkt_01",
    reference: "TKT-00142",
    subject: "Wallet not credited",
    category: "billing",
    status: "in_progress",
    message_count: 1,
    has_unread_reply: false,
    latest_message_preview: "Escalated",
    created_at: "2026-11-17T09:12:00Z",
    updated_at: "2026-11-17T14:30:00Z",
    messages: [
      {
        id: "msg_01",
        ticket_id: "tkt_01",
        author: "customer",
        author_name: "Customer",
        body: "Help with wallet",
        created_at: "2026-11-17T09:12:00Z",
      },
    ],
  },
}));

describe("useSupportTickets Hooks & Query Client (#26)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("SUPPORT_QUERY_KEYS", () => {
    it("returns correct key tuples", () => {
      expect(SUPPORT_QUERY_KEYS.tickets()).toEqual(["support-tickets"]);
      expect(SUPPORT_QUERY_KEYS.ticket("tkt_123")).toEqual([
        "support-ticket",
        "tkt_123",
      ]);
    });
  });

  describe("queryClient event bus", () => {
    it("notifies listeners on invalidateQueries", () => {
      const listener = vi.fn();
      const unsubscribe = queryClient.subscribe(listener);

      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.tickets(),
      });

      expect(listener).toHaveBeenCalledWith(["support-tickets"]);

      unsubscribe();

      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.tickets(),
      });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe("useSupportTickets", () => {
    it("fetches tickets on mount", async () => {
      vi.mocked(supportApi.listTickets).mockResolvedValueOnce({
        data: MOCK_TICKETS,
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      });

      const { result } = renderHook(() => useSupportTickets());

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.tickets).toEqual(MOCK_TICKETS);
      expect(supportApi.listTickets).toHaveBeenCalled();
    });

    it("refetches tickets when ['support-tickets'] is invalidated", async () => {
      vi.mocked(supportApi.listTickets).mockResolvedValue({
        data: MOCK_TICKETS,
        meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
      });

      const { result } = renderHook(() =>
        useSupportTickets(undefined, {
          data: MOCK_TICKETS,
          meta: { current_page: 1, per_page: 15, total: 1, last_page: 1 },
        })
      );

      expect(result.current.tickets).toEqual(MOCK_TICKETS);

      act(() => {
        queryClient.invalidateQueries({
          queryKey: SUPPORT_QUERY_KEYS.tickets(),
        });
      });

      await waitFor(() => {
        expect(supportApi.listTickets).toHaveBeenCalled();
      });
    });
  });

  describe("useSupportTicket", () => {
    it("fetches ticket details on mount", async () => {
      vi.mocked(supportApi.getTicket).mockResolvedValueOnce(MOCK_TICKET_DETAIL);

      const { result } = renderHook(() => useSupportTicket("tkt_01"));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.ticket).toEqual(MOCK_TICKET_DETAIL);
      expect(supportApi.getTicket).toHaveBeenCalledWith("tkt_01");
    });
  });

  describe("useCreateTicket", () => {
    it("creates ticket, invalidates tickets query, and redirects to detail page", async () => {
      const createdTicket = {
        ...MOCK_TICKETS[0],
        id: "tkt_new_99",
      };
      vi.mocked(supportApi.createTicket).mockResolvedValueOnce(createdTicket);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useCreateTicket());

      let created;
      await act(async () => {
        created = await result.current.mutateAsync({
          subject: "Test Ticket",
          category: "general",
          message: "Please help me resolve this issue in detail.",
        });
      });

      expect(created).toEqual(createdTicket);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["support-tickets"],
      });
      expect(mockPush).toHaveBeenCalledWith("/support/tkt_new_99");
    });
  });

  describe("useReplyTicket", () => {
    it("replies to ticket, invalidates both ticket and tickets queries", async () => {
      const newMsg = {
        id: "msg_new",
        ticket_id: "tkt_01",
        author: "customer" as const,
        author_name: "Customer",
        body: "Here is an update.",
        created_at: new Date().toISOString(),
      };
      vi.mocked(supportApi.replyTicket).mockResolvedValueOnce(newMsg);

      const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

      const { result } = renderHook(() => useReplyTicket("tkt_01"));

      let reply;
      await act(async () => {
        reply = await result.current.mutateAsync({
          message: "Here is an update.",
        });
      });

      expect(reply).toEqual(newMsg);
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["support-ticket", "tkt_01"],
      });
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["support-tickets"],
      });
    });
  });
});
