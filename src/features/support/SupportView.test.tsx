import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { SupportView } from "./SupportView";
import { MOCK_TICKETS } from "./api";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("SupportView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the heading and filter tabs with correct counts", () => {
    render(<SupportView initialTickets={MOCK_TICKETS} />);

    expect(screen.getByRole("heading", { name: "Support" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /all \(4\)/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /open \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /in progress \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /resolved \(1\)/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /closed \(1\)/i })).toBeInTheDocument();
  });

  it("renders all initial tickets in the list", () => {
    render(<SupportView initialTickets={MOCK_TICKETS} />);

    expect(screen.getByText("TKT-00142")).toBeInTheDocument();
    expect(screen.getByText("Wallet not credited after transfer")).toBeInTheDocument();
    expect(screen.getByText("TKT-00139")).toBeInTheDocument();
    expect(screen.getByText("VPN connection keeps dropping")).toBeInTheDocument();
  });

  it("filters tickets by status when tab is clicked", async () => {
    const user = userEvent.setup();
    render(<SupportView initialTickets={MOCK_TICKETS} />);

    // Click Open tab
    await user.click(screen.getByRole("tab", { name: /open/i }));

    expect(screen.getByText("TKT-00139")).toBeInTheDocument();
    expect(screen.queryByText("TKT-00142")).not.toBeInTheDocument();
    expect(screen.queryByText("TKT-00128")).not.toBeInTheDocument();
  });

  it("filters tickets by search query", async () => {
    const user = userEvent.setup();
    render(<SupportView initialTickets={MOCK_TICKETS} />);

    const searchInput = screen.getByPlaceholderText(/search by reference/i);
    await user.type(searchInput, "VPN");

    expect(screen.getByText("TKT-00139")).toBeInTheDocument();
    expect(screen.queryByText("TKT-00142")).not.toBeInTheDocument();
  });

  it("shows empty state when no tickets match filter", async () => {
    const user = userEvent.setup();
    render(<SupportView initialTickets={MOCK_TICKETS} />);

    const searchInput = screen.getByPlaceholderText(/search by reference/i);
    await user.type(searchInput, "NonexistentQuery123");

    expect(screen.getByText(/no tickets match your filter/i)).toBeInTheDocument();
  });

  it("toggles the new ticket form when clicking New Ticket and Cancel", async () => {
    const user = userEvent.setup();
    render(<SupportView initialTickets={MOCK_TICKETS} />);

    const newTicketBtn = screen.getByTestId("new-ticket-btn");
    await user.click(newTicketBtn);

    expect(screen.getByText("Submit a new ticket")).toBeInTheDocument();

    const cancelBtn = screen.getByRole("button", { name: /cancel/i });
    await user.click(cancelBtn);

    expect(screen.queryByText("Submit a new ticket")).not.toBeInTheDocument();
  });

  it("navigates to ticket detail link when ticket row is clicked", () => {
    render(<SupportView initialTickets={MOCK_TICKETS} />);

    const ticketLink = screen.getByTestId("ticket-row-tkt_01");
    expect(ticketLink).toHaveAttribute("href", "/support/tkt_01");
  });
});
