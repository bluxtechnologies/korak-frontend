import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { supportApi, MOCK_TICKETS, MOCK_TICKET_DETAIL } from "./supportApi";

vi.mock("@/lib/api", () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe("supportApi Client (#26)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("listTickets", () => {
    it("calls GET /api/v1/support/tickets with correctly mapped query params", async () => {
      const mockResponse = {
        data: MOCK_TICKETS,
        meta: {
          current_page: 1,
          per_page: 15,
          total: MOCK_TICKETS.length,
          last_page: 1,
        },
      };
      vi.mocked(api.get).mockResolvedValueOnce(mockResponse);

      const res = await supportApi.listTickets({
        page: 2,
        per_page: 10,
        status: "open",
        category: "vpn",
        search: "connection",
      });

      expect(api.get).toHaveBeenCalledWith("/api/v1/support/tickets", {
        params: {
          page: 2,
          per_page: 10,
          "filter[status]": "open",
          "filter[category]": "vpn",
          search: "connection",
        },
      });
      expect(res).toEqual(mockResponse);
    });

    it("falls back to filtered mock fixtures if the backend request fails", async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error("Network Error"));

      const res = await supportApi.listTickets({
        status: "open",
      });

      expect(res.data.length).toBeGreaterThan(0);
      expect(res.data.every((t) => t.status === "open")).toBe(true);
    });
  });

  describe("createTicket", () => {
    it("posts payload to /api/v1/support/tickets and unwraps response", async () => {
      const created = {
        id: "tkt_new_123",
        reference: "TKT-00999",
        subject: "Airtime failed",
        category: "airtime_data" as const,
        status: "open" as const,
        message_count: 1,
        has_unread_reply: false,
        latest_message_preview: "My airtime was not delivered.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: created,
        meta: {},
      });

      const res = await supportApi.createTicket({
        subject: "Airtime failed",
        category: "airtime_data",
        message: "My airtime was not delivered after debit.",
      });

      expect(api.post).toHaveBeenCalledWith("/api/v1/support/tickets", {
        subject: "Airtime failed",
        category: "airtime_data",
        message: "My airtime was not delivered after debit.",
      });
      expect(res).toEqual(created);
    });
  });

  describe("getTicket", () => {
    it("fetches ticket by ID from /api/v1/support/tickets/{id}", async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: MOCK_TICKET_DETAIL,
        meta: {},
      });

      const res = await supportApi.getTicket("tkt_01");

      expect(api.get).toHaveBeenCalledWith("/api/v1/support/tickets/tkt_01");
      expect(res).toEqual(MOCK_TICKET_DETAIL);
    });

    it("falls back to mock detail when network fails and ID matches", async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error("404 Not Found"));

      const res = await supportApi.getTicket("tkt_01");
      expect(res.id).toBe("tkt_01");
      expect(res.messages.length).toBeGreaterThan(0);
    });
  });

  describe("replyTicket", () => {
    it("posts message to /api/v1/support/tickets/{id}/messages and unwraps response", async () => {
      const newMsg = {
        id: "msg_reply_99",
        ticket_id: "tkt_01",
        author: "customer" as const,
        author_name: "Customer",
        body: "Checking in on this issue.",
        created_at: new Date().toISOString(),
      };
      vi.mocked(api.post).mockResolvedValueOnce({
        data: newMsg,
        meta: {},
      });

      const res = await supportApi.replyTicket("tkt_01", {
        message: "Checking in on this issue.",
      });

      expect(api.post).toHaveBeenCalledWith(
        "/api/v1/support/tickets/tkt_01/messages",
        {
          message: "Checking in on this issue.",
        }
      );
      expect(res).toEqual(newMsg);
    });
  });
});
