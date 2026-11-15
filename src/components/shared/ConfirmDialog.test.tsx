import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "./ConfirmDialog";

describe("ConfirmDialog", () => {
  it("renders title, description, and buttons when open", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Revoke active session"
        description="This will immediately sign out the selected device."
        onConfirm={() => {}}
      />
    );

    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText("Revoke active session")).toBeInTheDocument();
    expect(
      screen.getByText("This will immediately sign out the selected device.")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("does not render dialog content when open is false", () => {
    render(
      <ConfirmDialog
        open={false}
        onOpenChange={() => {}}
        title="Hidden title"
        description="Hidden description"
        onConfirm={() => {}}
      />
    );

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("defaults to Delete for destructive variant and Confirm for default variant", () => {
    const { rerender } = render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Destructive action"
        description="Are you sure?"
        variant="destructive"
        onConfirm={() => {}}
      />
    );

    const deleteBtn = screen.getByRole("button", { name: "Delete" });
    expect(deleteBtn).toHaveClass("bg-destructive");

    rerender(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Default action"
        description="Are you sure?"
        variant="default"
        onConfirm={() => {}}
      />
    );

    const confirmBtn = screen.getByRole("button", { name: "Confirm" });
    expect(confirmBtn).toHaveClass("bg-primary");
  });

  it("supports custom button labels", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Revoke Key"
        description="This will invalidate API access."
        confirmText="Revoke"
        cancelText="Keep"
        onConfirm={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: "Revoke" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Keep" })).toBeInTheDocument();
  });

  it("calls onConfirm and onOpenChange(false) on confirm click", async () => {
    const user = userEvent.setup();
    const handleConfirm = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Confirm action"
        description="Proceed with deletion?"
        onConfirm={handleConfirm}
      />
    );

    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(handleConfirm).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onCancel and onOpenChange(false) on cancel click", async () => {
    const user = userEvent.setup();
    const handleCancel = vi.fn();
    const handleOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Confirm action"
        description="Proceed with deletion?"
        onConfirm={() => {}}
        onCancel={handleCancel}
      />
    );

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(handleCancel).toHaveBeenCalledTimes(1);
    expect(handleOpenChange).toHaveBeenCalledWith(false);
  });

  it("handles async onConfirm and manages loading state", async () => {
    const user = userEvent.setup();
    let resolvePromise: () => void = () => {};
    const asyncConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolvePromise = resolve;
        })
    );
    const handleOpenChange = vi.fn();

    render(
      <ConfirmDialog
        open={true}
        onOpenChange={handleOpenChange}
        title="Async action"
        description="Processing async request."
        onConfirm={asyncConfirm}
      />
    );

    const confirmButton = screen.getByRole("button", { name: "Delete" });
    const cancelButton = screen.getByRole("button", { name: "Cancel" });

    await user.click(confirmButton);

    expect(asyncConfirm).toHaveBeenCalledTimes(1);
    // Button should be disabled during execution
    expect(confirmButton).toBeDisabled();
    expect(cancelButton).toBeDisabled();
    expect(handleOpenChange).not.toHaveBeenCalled();

    // Resolve the promise
    resolvePromise();

    await waitFor(() => {
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it("disables buttons when isLoading is explicitly true", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Loading state"
        description="Action in progress."
        isLoading={true}
        onConfirm={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: "Delete" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeDisabled();
  });

  it("renders additional children content", () => {
    render(
      <ConfirmDialog
        open={true}
        onOpenChange={() => {}}
        title="Delete Item"
        description="Please confirm."
        onConfirm={() => {}}
      >
        <div data-testid="item-summary">Order ID: #1042 - $45.00</div>
      </ConfirmDialog>
    );

    expect(screen.getByTestId("item-summary")).toHaveTextContent(
      "Order ID: #1042 - $45.00"
    );
  });
});
