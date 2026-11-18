/**
 * Support Tickets API service and data models.
 * Re-exports supportApi and types for backwards compatibility.
 */

export * from "./types";
export * from "./api/supportApi";

import { supportApi } from "./api/supportApi";
import type {
  CreateTicketPayload,
  ListTicketsQueryParams,
  ReplyTicketPayload,
  SupportTicketDetail,
  SupportTicketListItem,
  SupportTicketMessage,
} from "./types";

/**
 * Lists the authenticated customer's support tickets.
 * GET /api/v1/support/tickets
 */
export async function getTickets(
  params?: ListTicketsQueryParams
): Promise<SupportTicketListItem[]> {
  const res = await supportApi.listTickets(params);
  return res.data;
}

/**
 * Fetches a single ticket with its full message thread.
 * GET /api/v1/support/tickets/:id
 */
export async function getTicket(id: string): Promise<SupportTicketDetail> {
  return supportApi.getTicket(id);
}

/**
 * Creates a new support ticket.
 * POST /api/v1/support/tickets
 */
export async function createTicket(
  payload: CreateTicketPayload
): Promise<SupportTicketListItem> {
  return supportApi.createTicket(payload);
}

/**
 * Sends a follow-up reply on an existing ticket.
 * POST /api/v1/support/tickets/:id/messages
 */
export async function replyToTicket(
  ticketId: string,
  payload: ReplyTicketPayload
): Promise<SupportTicketMessage> {
  return supportApi.replyTicket(ticketId, payload);
}
