/**
 * Support Ticket Domain Types
 * Based on # 26 — Customer Support Tickets API Contract
 */

export type TicketCategory =
  | "billing"
  | "order"
  | "vpn"
  | "airtime_data"
  | "account"
  | "general";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";

export interface SupportTicketMessage {
  id: string; // e.g. "msg_01h8q7v9a"
  ticket_id: string; // e.g. "tkt_01h8q7v9"
  author: "customer" | "admin";
  author_name: string;
  body: string;
  created_at: string; // ISO 8601
}

export interface SupportTicketListItem {
  id: string; // e.g. "tkt_01h8q7v9"
  reference: string; // e.g. "TKT-00142"
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  message_count: number;
  has_unread_reply: boolean;
  latest_message_preview: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketDetail extends SupportTicketListItem {
  messages: SupportTicketMessage[];
}

export interface CreateTicketPayload {
  subject: string; // min: 5, max: 120
  category: TicketCategory;
  message: string; // min: 20, max: 2000
}

export interface ReplyTicketPayload {
  message: string; // min: 1, max: 2000
}

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ListTicketsQueryParams {
  page?: number;
  per_page?: number;
  status?: TicketStatus;
  category?: TicketCategory;
  search?: string;
  sort?: string;
}

// Backwards-compatible aliases for existing codebase
export type SupportTicket = SupportTicketListItem;
export type TicketMessage = SupportTicketMessage;
export type MessageAuthor = "customer" | "admin";
export type TicketsQueryParams = ListTicketsQueryParams;
