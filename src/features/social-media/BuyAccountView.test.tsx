import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BuyAccountView } from "./BuyAccountView";

vi.mock("./api", () => {
  const accounts = [
    {
      id: "acc_ig_01",
      platform: "instagram",
      platform_label: "Instagram",
      handle: "fitglow_daily",
      niche: "Fitness & Wellness",
      followers_count: 24500,
      following_count: 310,
      posts_count: 142,
      creation_year: 2021,
      is_verified: false,
      price: 3800000,
      currency: "NGN",
      status: "available",
      masked_login: "fit••••••••y",
      masked_recovery: "sec••••@gmail.com",
      description: "Organic lifestyle and fitness niche audience.",
    },
    {
      id: "acc_x_02",
      platform: "x_twitter",
      platform_label: "X (Twitter)",
      handle: "techpulse_hub",
      niche: "Technology & AI",
      followers_count: 18200,
      following_count: 420,
      posts_count: 890,
      creation_year: 2020,
      is_verified: true,
      price: 5200000,
      currency: "NGN",
      status: "available",
      masked_login: "tec••••••••b",
      masked_recovery: "kor••••@proton.me",
      description: "Verified X account with active Premium badge history.",
    },
  ];

  return {
    PLATFORM_FILTERS: [
      { id: "all", label: "All Platforms" },
      { id: "instagram", label: "Instagram" },
      { id: "tiktok", label: "TikTok" },
      { id: "x_twitter", label: "X (Twitter)" },
      { id: "youtube", label: "YouTube" },
      { id: "telegram", label: "Telegram" },
    ],
    getAvailableAccounts: vi.fn().mockImplementation(async (filters) => {
      let filtered = [...accounts];
      if (filters?.platform && filters.platform !== "all") {
        filtered = filtered.filter((a) => a.platform === filters.platform);
      }
      if (filters?.search) {
        const q = filters.search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.handle.toLowerCase().includes(q) ||
            a.niche.toLowerCase().includes(q)
        );
      }
      return filtered;
    }),
    buySocialAccount: vi.fn().mockResolvedValue({
      id: "ord_mock_1",
      reference: "SOC-12345678",
      category: "social",
      service_name: "Instagram Account (@fitglow_daily)",
      beneficiary: "@fitglow_daily",
      amount: 3800000,
      currency: "NGN",
      status: "completed",
      created_at: new Date().toISOString(),
      credentials: {
        account_handle: "fitglow_daily",
        login_username: "fitglow_daily",
        login_password: "••••••••••••",
        recovery_email: "sec••••@gmail.com",
        notes: "Account transfer secured.",
      },
    }),
  };
});

describe("BuyAccountView Component (F19.1)", () => {
  it("renders the account listings and platform filters", async () => {
    render(<BuyAccountView />);

    expect(screen.getByText("Buy Verified Accounts")).toBeInTheDocument();
    expect(screen.getByText("Boost & Engagement")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("@fitglow_daily")).toBeInTheDocument();
      expect(screen.getByText("@techpulse_hub")).toBeInTheDocument();
    });
  });

  it("filters accounts by search input", async () => {
    render(<BuyAccountView />);

    await waitFor(() => {
      expect(screen.getByText("@fitglow_daily")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search by handle or niche/i);
    fireEvent.change(searchInput, { target: { value: "techpulse" } });

    await waitFor(() => {
      expect(screen.getByText("@techpulse_hub")).toBeInTheDocument();
      expect(screen.queryByText("@fitglow_daily")).not.toBeInTheDocument();
    });
  });

  it("opens purchase modal when clicking inspect & buy", async () => {
    render(<BuyAccountView />);

    await waitFor(() => {
      expect(screen.getByTestId("buy-button-acc_ig_01")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("buy-button-acc_ig_01"));

    expect(
      await screen.findByTestId("buy-account-modal")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Purchase Social Media Account")
    ).toBeInTheDocument();
  });

  it("completes purchase and displays masked deliverable card", async () => {
    render(<BuyAccountView />);

    await waitFor(() => {
      expect(screen.getByTestId("buy-button-acc_ig_01")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("buy-button-acc_ig_01"));

    const termsCheckbox = await screen.findByTestId("terms-checkbox");
    fireEvent.click(termsCheckbox);

    const payButton = screen.getByTestId("confirm-purchase-button");
    fireEvent.click(payButton);

    await waitFor(() => {
      expect(screen.getByTestId("masked-deliverable-card")).toBeInTheDocument();
    });
  });
});
