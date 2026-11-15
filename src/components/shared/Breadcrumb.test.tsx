import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Breadcrumb,
  BreadcrumbRoot,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./Breadcrumb";

describe("Breadcrumb", () => {
  it("renders an array of items with links and current page", () => {
    const items = [
      { label: "Overview", href: "/overview", isCurrent: false },
      { label: "Services", href: "/services", isCurrent: false },
      { label: "Airtime", isCurrent: true },
    ];

    render(<Breadcrumb items={items} />);

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();

    const overviewLink = screen.getByRole("link", { name: "Overview" });
    expect(overviewLink).toHaveAttribute("href", "/overview");

    const servicesLink = screen.getByRole("link", { name: "Services" });
    expect(servicesLink).toHaveAttribute("href", "/services");

    const currentPage = screen.getByText("Airtime");
    expect(currentPage).toHaveAttribute("aria-current", "page");
  });

  it("auto-resolves breadcrumbs from pathname", () => {
    render(<Breadcrumb pathname="/vpn/logs" />);

    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "VPN" })).toBeInTheDocument();
    expect(screen.getByText("VPN Logs")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("supports detailLabel for dynamic detail routes", () => {
    render(
      <Breadcrumb pathname="/orders/ORD-9988" detailLabel="Order #ORD-9988" />
    );

    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Orders" })).toBeInTheDocument();
    expect(screen.getByText("Order #ORD-9988")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("returns null when items is empty and no pathname provided", () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders compound primitives correctly", () => {
    render(
      <BreadcrumbRoot>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbEllipsis />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Current</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </BreadcrumbRoot>
    );

    expect(screen.getByRole("navigation")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText("More")).toBeInTheDocument(); // sr-only
    expect(screen.getByText("Current")).toHaveAttribute("aria-current", "page");
  });
});
