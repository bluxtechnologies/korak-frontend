import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { NewTicketForm } from "./NewTicketForm";

vi.mock("@/features/support/api", async () => {
  const actual = await vi.importActual<typeof import("@/features/support/api")>(
    "@/features/support/api"
  );
  return {
    ...actual,
    createTicket: vi.fn(),
  };
});
import { createTicket } from "@/features/support/api";
const mockCreateTicket = vi.mocked(createTicket);

vi.mock("@/components/ui/sonner", () => ({
  showToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("NewTicketForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields and submit button", () => {
    render(<NewTicketForm onSuccess={vi.fn()} />);

    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit ticket/i })
    ).toBeInTheDocument();
  });

  it("validates fields on empty submit", async () => {
    const user = userEvent.setup();
    render(<NewTicketForm onSuccess={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /submit ticket/i }));

    expect(mockCreateTicket).not.toHaveBeenCalled();
    expect(
      screen.getByText(/subject must be at least 5 characters/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/please describe your issue in at least 20 characters/i)
    ).toBeInTheDocument();
  });

  it("successfully submits ticket and triggers onSuccess callback", async () => {
    const user = userEvent.setup();
    const handleSuccess = vi.fn();

    const createdTicket = {
      id: "tkt_new",
      reference: "TKT-00999",
      subject: "Airtime purchase pending",
      category: "airtime_data" as const,
      status: "open" as const,
      message_count: 1,
      has_unread_reply: false,
      latest_message_preview: "I purchased ₦2,000 airtime for 08012345678 and have not received it yet.",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    mockCreateTicket.mockResolvedValueOnce(createdTicket);

    render(<NewTicketForm onSuccess={handleSuccess} />);

    // Fill in subject
    await user.type(screen.getByLabelText(/subject/i), "Airtime purchase pending");

    // Select category (radix select)
    await user.click(screen.getByRole("combobox", { name: /category/i }));
    await user.click(await screen.findByRole("option", { name: /airtime & data/i }));

    // Fill in message
    await user.type(
      screen.getByLabelText(/message/i),
      "I purchased ₦2,000 airtime for 08012345678 and have not received it yet."
    );

    // Submit
    await user.click(screen.getByRole("button", { name: /submit ticket/i }));

    await waitFor(() => {
      expect(mockCreateTicket).toHaveBeenCalledWith({
        subject: "Airtime purchase pending",
        category: "airtime_data",
        message:
          "I purchased ₦2,000 airtime for 08012345678 and have not received it yet.",
      });
      expect(handleSuccess).toHaveBeenCalledWith(createdTicket);
    });
  });
});
