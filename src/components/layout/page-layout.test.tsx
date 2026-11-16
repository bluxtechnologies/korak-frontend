import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getBreadcrumbs } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { DashboardGrid } from "./DashboardGrid";
import { PageContainer } from "./PageContainer";
import { PageHeader } from "./PageHeader";

describe("Page Layout Components (F5.4)", () => {
  describe("PageContainer", () => {
    it("renders children with default max-width and responsive padding", () => {
      const { container } = render(
        <PageContainer>
          <p>Page body</p>
        </PageContainer>
      );

      expect(screen.getByText("Page body")).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("max-w-7xl");
      expect(container.firstChild).toHaveClass("px-4");
    });

    it("supports custom maxWidth and semantic element tag", () => {
      render(
        <PageContainer as="main" maxWidth="narrow" data-testid="page-main">
          <p>Narrow content</p>
        </PageContainer>
      );

      const mainEl = screen.getByTestId("page-main");
      expect(mainEl.tagName).toBe("MAIN");
      expect(mainEl).toHaveClass("max-w-3xl");
    });
  });

  describe("PageHeader", () => {
    it("renders title as h1, description, action, and bottom border", () => {
      const { container } = render(
        <PageHeader
          title="Orders"
          description="Track your digital service purchases."
          action={<Button>New Order</Button>}
        />
      );

      const heading = screen.getByRole("heading", { level: 1, name: "Orders" });
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass("font-semibold");
      expect(
        screen.getByText("Track your digital service purchases.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /new order/i })
      ).toBeInTheDocument();
      expect(container.firstChild).toHaveClass("border-b");
    });

    it("renders accessible breadcrumbs from getBreadcrumbs with aria-current='page'", () => {
      const crumbs = getBreadcrumbs("/airtime");
      render(<PageHeader title="Airtime" breadcrumbs={crumbs} />);

      const nav = screen.getByRole("navigation", { name: /breadcrumb/i });
      expect(nav).toBeInTheDocument();

      const overviewCrumb = screen.getByRole("link", { name: "Overview" });
      expect(overviewCrumb).toHaveAttribute("href", "/overview");

      const currentCrumb = screen.getByText("Airtime", { selector: "span" });
      expect(currentCrumb).toHaveAttribute("aria-current", "page");
    });

    it("prefers custom breadcrumb slot and allows disabling bottom border", () => {
      const { container } = render(
        <PageHeader
          title="Profile"
          bordered={false}
          breadcrumb={<div data-testid="custom-crumb">Custom Crumb</div>}
          breadcrumbs={getBreadcrumbs("/profile")}
        />
      );

      expect(screen.getByTestId("custom-crumb")).toBeInTheDocument();
      expect(
        screen.queryByRole("navigation", { name: /breadcrumb/i })
      ).not.toBeInTheDocument();
      expect(container.firstChild).not.toHaveClass("border-b");
    });
  });

  describe("DashboardGrid", () => {
    it("renders grid with configurable columns and gap classes", () => {
      const { rerender } = render(
        <DashboardGrid data-testid="dash-grid">
          <div>Card 1</div>
          <div>Card 2</div>
          <div>Card 3</div>
        </DashboardGrid>
      );

      const grid = screen.getByTestId("dash-grid");
      expect(grid).toHaveClass("grid", "lg:grid-cols-3", "sm:gap-6");

      rerender(
        <DashboardGrid columns={4} gap="lg" data-testid="dash-grid">
          <div>Card 1</div>
        </DashboardGrid>
      );

      expect(grid).toHaveClass("lg:grid-cols-4", "sm:gap-8");
    });
  });
});
