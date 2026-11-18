import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TicketThreadView } from "./TicketThreadView";
import { MOCK_TICKET_DETAIL } from "./api";

vi.mock("@/features/support/api", async () => {
  const actual = await vi.importActual<typeof import("@/features/support/api")>(
    "@/features/support/api"
  );
  return {
    ...actual,
    getTicket: vi.fn(),
    replyToTicket: vi.fn(),
  };
});
import { getTicket, replyToTicket } from "@/features/support/api";
const mockGetTicket = vi.mocked(getTicket);
const mockReplyToTicket = vi.mocked(replyToTicket);

vi.mock("@/components/ui/sonner", () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("TicketThreadView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetTicket.mockResolvedValue(MOCK_TICKET_DETAIL);
  });

  it("renders ticket header details and status", () => {
    render(
      <TicketThreadView ticketId="tkt_01" initialData={MOCK_TICKET_DETAIL} />
    );

    expect(screen.getByText("TKT-00142")).toBeInTheDocument();
    expect(screen.getByText("Wallet not credited after transfer")).toBeInTheDocument();
    expect(screen.getByText(/billing & payments/i)).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders all chronological messages in the thread", () => {
    render(
      <TicketThreadView ticketId="tkt_01" initialData={MOCK_TICKET_DETAIL} />
    );

    expect(
      screen.getByText(/i made a transfer of ₦5,000 to my korak wallet/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/thank you for reaching out, amara/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/my bank transaction reference is txn20261117kok48219/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/we have escalated this to our payments team/i)
    ).toBeInTheDocument();
  });

  it("sends a reply and appends it to the conversation thread", async () => {
    const user = userEvent.setup();
    const newMsg = {
      id: "msg_new",
      ticket_id: "tkt_01",
      author: "customer" as const,
      author_name: "Amara Nwosu",
      body: "Any update on this issue?",
      created_at: new Date().toISOString(),
    };
    mockReplyToTicket.mockResolvedValueOnce(newMsg);

    render(
      <TicketThreadView ticketId="tkt_01" initialData={MOCK_TICKET_DETAIL} />
    );

    const textarea = screen.getByPlaceholderText(/type your reply…/i);
    await user.type(textarea, "Any update on this issue?");

    const sendBtn = screen.getByRole("button", { name: /send reply/i });
    await user.click(sendBtn);

    await waitFor(() => {
      expect(mockReplyToTicket).toHaveBeenCalledWith("tkt_01", {
        message: "Any update on this issue?",
      });
      expect(screen.getByText("Any update on this issue?")).toBeInTheDocument();
    });
  });

  it("shows closed banner and hides reply textarea when ticket is closed/resolved", () => {
    render(
      <TicketThreadView
        ticketId="tkt_04"
        initialData={{
          ...MOCK_TICKET_DETAIL,
          id: "tkt_04",
          status: "closed",
        }}
      />
    );

    expect(
      screen.getByText(
        /this ticket has been marked as closed and is closed for further replies/i
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByPlaceholderText(/type your reply…/i)
    ).not.toBeInTheDocument();
  });
});
