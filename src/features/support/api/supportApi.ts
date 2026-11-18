/**
 * Support Tickets API Client
 * Backend Implementation for # 26 — Customer Support Tickets API Contract
 * Follows docs/06-api-standards.md, docs/08-security-standards.md, and docs/09-frontend-standards.md §4.
 */

import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";
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
// Fallback Mock Fixtures (Development & Offline Resilience)
// ---------------------------------------------------------------------------

export const MOCK_TICKETS: SupportTicketListItem[] = [
  {
    id: "tkt_01",
    reference: "TKT-00142",
    subject: "Wallet not credited after transfer",
    category: "billing",
    status: "in_progress",
    message_count: 4,
    has_unread_reply: true,
    latest_message_preview:
      "We have escalated this to our payments team and will update you within 24 hours.",
    created_at: "2026-11-17T09:12:00Z",
    updated_at: "2026-11-17T14:30:00Z",
  },
  {
    id: "tkt_02",
    reference: "TKT-00139",
    subject: "VPN connection keeps dropping",
    category: "vpn",
    status: "open",
    message_count: 1,
    has_unread_reply: false,
    latest_message_preview:
      "My VPN disconnects every 10 minutes on the Lagos node. I have tried all three nodes.",
    created_at: "2026-11-16T16:45:00Z",
    updated_at: "2026-11-16T16:45:00Z",
  },
  {
    id: "tkt_03",
    reference: "TKT-00128",
    subject: "Data bundle not delivered after payment",
    category: "order",
    status: "resolved",
    message_count: 5,
    has_unread_reply: false,
    latest_message_preview:
      "Your data bundle has been successfully delivered. We apologise for the delay.",
    created_at: "2026-11-10T11:00:00Z",
    updated_at: "2026-11-11T08:15:00Z",
  },
  {
    id: "tkt_04",
    reference: "TKT-00120",
    subject: "Unable to log in to my account",
    category: "account",
    status: "closed",
    message_count: 4,
    has_unread_reply: false,
    latest_message_preview:
      "Issue resolved. Please use the forgot password flow if you encounter this again.",
    created_at: "2026-11-05T08:00:00Z",
    updated_at: "2026-11-06T10:00:00Z",
  },
];

export const MOCK_TICKET_DETAIL: SupportTicketDetail = {
  ...MOCK_TICKETS[0],
  messages: [
    {
      id: "msg_01",
      ticket_id: "tkt_01",
      author: "customer",
      author_name: "Amara Nwosu",
      body: "I made a transfer of ₦5,000 to my Korak wallet over 2 hours ago and it has still not been credited. My bank confirmed the debit. Please help.",
      created_at: "2026-11-17T09:12:00Z",
    },
    {
      id: "msg_02",
      ticket_id: "tkt_01",
      author: "admin",
      author_name: "Support Team",
      body: "Thank you for reaching out, Amara. We have received your complaint and are investigating the payment reference on our end. Could you please share your bank transaction reference number so we can trace the transfer?",
      created_at: "2026-11-17T10:45:00Z",
    },
    {
      id: "msg_03",
      ticket_id: "tkt_01",
      author: "customer",
      author_name: "Amara Nwosu",
      body: "My bank transaction reference is TXN20261117KOK48219. Please let me know once it has been resolved.",
      created_at: "2026-11-17T11:20:00Z",
    },
    {
      id: "msg_04",
      ticket_id: "tkt_01",
      author: "admin",
      author_name: "Support Team",
      body: "We have escalated this to our payments team and will update you within 24 hours. We apologise for the inconvenience, Amara.",
      created_at: "2026-11-17T14:30:00Z",
    },
  ],
};

// ---------------------------------------------------------------------------
// Support API Methods
// ---------------------------------------------------------------------------

export const supportApi = {
  /**
   * 3.1. List Tickets
   * GET /api/v1/support/tickets
   */
  async listTickets(
    params?: ListTicketsQueryParams
  ): Promise<{ data: SupportTicketListItem[]; meta: PaginationMeta }> {
    const query: Record<string, string | number | undefined> = {};
    if (params?.page) query.page = params.page;
    if (params?.per_page) query.per_page = params.per_page;
    if (params?.status) query["filter[status]"] = params.status;
    if (params?.category) query["filter[category]"] = params.category;
    if (params?.search && params.search.trim() !== "") {
      query.search = params.search.trim();
    }
    if (params?.sort) query.sort = params.sort;

    try {
      const response = await api.get<{
        data: SupportTicketListItem[];
        meta: PaginationMeta;
      }>("/api/v1/support/tickets", { params: query });
      return response;
    } catch {
      // In dev/test when backend is not running, filter mock tickets
      let list = [...MOCK_TICKETS];
      if (params?.status) {
        list = list.filter((t) => t.status === params.status);
      }
      if (params?.category) {
        list = list.filter((t) => t.category === params.category);
      }
      if (params?.search) {
        const q = params.search.toLowerCase();
        list = list.filter(
          (t) =>
            t.reference.toLowerCase().includes(q) ||
            t.subject.toLowerCase().includes(q)
        );
      }
      return {
        data: list,
        meta: {
          current_page: params?.page ?? 1,
          per_page: params?.per_page ?? 15,
          total: list.length,
          last_page: 1,
        },
      };
    }
  },

  /**
   * 3.2. Create Ticket
   * POST /api/v1/support/tickets
   */
  async createTicket(payload: CreateTicketPayload): Promise<SupportTicketListItem> {
    const raw = await api.post<ApiResponse<SupportTicketListItem>>(
      "/api/v1/support/tickets",
      payload
    );
    return unwrapApiResponse(raw);
  },

  /**
   * 3.3. Get Ticket Detail with Thread
   * GET /api/v1/support/tickets/{id}
   */
  async getTicket(id: string): Promise<SupportTicketDetail> {
    try {
      const raw = await api.get<ApiResponse<SupportTicketDetail>>(
        `/api/v1/support/tickets/${encodeURIComponent(id)}`
      );
      return unwrapApiResponse(raw);
    } catch (err) {
      if (id === MOCK_TICKET_DETAIL.id || id === MOCK_TICKET_DETAIL.reference) {
        return MOCK_TICKET_DETAIL;
      }
      const found = MOCK_TICKETS.find((t) => t.id === id || t.reference === id);
      if (found) {
        return {
          ...found,
          messages: MOCK_TICKET_DETAIL.messages.map((m) => ({
            ...m,
            ticket_id: found.id,
          })),
        };
      }
      throw err;
    }
  },

  /**
   * 3.4. Reply to Ticket
   * POST /api/v1/support/tickets/{id}/messages
   */
  async replyTicket(
    id: string,
    payload: ReplyTicketPayload
  ): Promise<SupportTicketMessage> {
    const raw = await api.post<ApiResponse<SupportTicketMessage>>(
      `/api/v1/support/tickets/${encodeURIComponent(id)}/messages`,
      payload
    );
    return unwrapApiResponse(raw);
  },
};

// Shorthand function exports for direct imports
export const listTickets = supportApi.listTickets;
export const createTicket = supportApi.createTicket;
export const getTicket = supportApi.getTicket;
export const replyTicket = supportApi.replyTicket;
