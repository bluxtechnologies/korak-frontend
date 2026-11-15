import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button component", () => {
  it("renders with children correctly", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("applies default variant and size classes", () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole("button", { name: /default/i });
    expect(button).toHaveClass("bg-primary text-primary-foreground");
    expect(button).toHaveClass("h-11 rounded-md");
  });

  it("applies variant classes correctly", () => {
    const { rerender } = render(
      <Button variant="destructive">Destructive</Button>
    );
    expect(screen.getByRole("button")).toHaveClass(
      "bg-destructive text-destructive-foreground"
    );

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "border border-border bg-transparent"
    );

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "bg-secondary text-secondary-foreground"
    );

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveClass("hover:bg-muted");

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveClass(
      "text-primary underline-offset-4"
    );
  });

  it("applies size classes correctly", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-9 px-3.5 text-xs");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("h-12 px-6 text-base");

    rerender(
      <Button size="icon" aria-label="Icon button">
        Icon
      </Button>
    );
    expect(screen.getByRole("button")).toHaveClass("h-11 w-11 p-0");
  });

  it("handles native disabled state", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      "disabled:pointer-events-none disabled:opacity-50"
    );
  });

  it("displays spinner and sets aria-busy and disabled when isLoading is true", () => {
    render(<Button isLoading>Processing</Button>);
    const button = screen.getByRole("button", { name: /processing/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(screen.getByTestId("button-spinner")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Action</Button>);

    await user.click(screen.getByRole("button", { name: /action/i }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled or loading", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    const { rerender } = render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    await user.click(screen.getByRole("button", { name: /disabled/i }));
    expect(handleClick).not.toHaveBeenCalled();

    rerender(
      <Button isLoading onClick={handleClick}>
        Loading
      </Button>
    );

    await user.click(screen.getByRole("button", { name: /loading/i }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/login">Login link</a>
      </Button>
    );
    const link = screen.getByRole("link", { name: /login link/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/login");
    expect(link).toHaveClass("bg-primary text-primary-foreground");
  });
});
