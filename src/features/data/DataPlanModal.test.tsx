import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DataPlanModal } from "./DataPlanModal";
import { MOCK_DATA_PLANS } from "./api";

const mockMtnPlans = MOCK_DATA_PLANS.filter((p) => p.network === "mtn");

describe("DataPlanModal", () => {
  it("renders when open with dynamic heading and category filters", () => {
    render(
      <DataPlanModal
        isOpen={true}
        onClose={vi.fn()}
        plans={mockMtnPlans}
        selectedPlanId="mtn_daily_45mb"
        onSelectPlan={vi.fn()}
        networkName="MTN Nigeria"
        networkLogo="/vtu-logos/mtn-seeklogo.svg"
      />
    );

    expect(
      screen.getByRole("heading", { name: /Select MTN Nigeria Data Plan/i })
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search data plans\.\.\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^All$/i })).toBeInTheDocument();
  });

  it("filters plans based on search input", async () => {
    const user = userEvent.setup();
    render(
      <DataPlanModal
        isOpen={true}
        onClose={vi.fn()}
        plans={mockMtnPlans}
        selectedPlanId="mtn_daily_45mb"
        onSelectPlan={vi.fn()}
        networkName="MTN Nigeria"
      />
    );

    const searchInput = screen.getByPlaceholderText(/Search data plans\.\.\./i);
    await user.type(searchInput, "Night Bonus");

    expect(screen.getByText(/40MB \+ 5MB Night Bonus/i)).toBeInTheDocument();
  });

  it("selects a plan and calls onSelectPlan", async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();
    const handleClose = vi.fn();

    render(
      <DataPlanModal
        isOpen={true}
        onClose={handleClose}
        plans={mockMtnPlans}
        selectedPlanId="mtn_daily_45mb"
        onSelectPlan={handleSelect}
        networkName="MTN Nigeria"
      />
    );

    const planButton = screen.getByText(/40MB \+ 5MB Night Bonus/i).closest("button");
    expect(planButton).toBeInTheDocument();
    if (planButton) {
      await user.click(planButton);
    }

    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "mtn_daily_45mb" })
    );
    expect(handleClose).toHaveBeenCalled();
  });

  it("does not render content when isOpen is false", () => {
    render(
      <DataPlanModal
        isOpen={false}
        onClose={vi.fn()}
        plans={mockMtnPlans}
        selectedPlanId="mtn_daily_45mb"
        onSelectPlan={vi.fn()}
        networkName="MTN Nigeria"
      />
    );

    expect(
      screen.queryByRole("heading", { name: /Select MTN Nigeria Data Plan/i })
    ).not.toBeInTheDocument();
  });
});
