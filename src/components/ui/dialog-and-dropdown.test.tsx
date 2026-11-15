import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./dropdown-menu";
import { Button } from "./button";

describe("Dialog and Dropdown Menu Components", () => {
  describe("Dialog (Modal)", () => {
    it("renders trigger and opens dialog content on click", async () => {
      const user = userEvent.setup();
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Open Modal</Button>
          </DialogTrigger>
          <DialogContent data-testid="dialog-content">
            <DialogHeader>
              <DialogTitle>Confirm Transaction</DialogTitle>
              <DialogDescription>
                Are you sure you want to proceed?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button>Confirm</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );

      const trigger = screen.getByRole("button", { name: /open modal/i });
      expect(trigger).toBeInTheDocument();
      expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();

      await user.click(trigger);

      const content = screen.getByTestId("dialog-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass(
        "rounded-md border border-border bg-background shadow-lg"
      );
      expect(screen.getByText("Confirm Transaction")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to proceed?")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /confirm/i })
      ).toBeInTheDocument();

      const cancelBtn = screen.getByRole("button", { name: /cancel/i });
      await user.click(cancelBtn);
      expect(screen.queryByTestId("dialog-content")).not.toBeInTheDocument();
    });
  });

  describe("DropdownMenu", () => {
    it("opens menu on trigger click and fires item actions", async () => {
      const user = userEvent.setup();
      const handleProfileClick = vi.fn();

      render(
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Account</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent data-testid="dropdown-content">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );

      const trigger = screen.getByRole("button", { name: /account/i });
      expect(trigger).toBeInTheDocument();
      expect(screen.queryByTestId("dropdown-content")).not.toBeInTheDocument();

      await user.click(trigger);

      const content = screen.getByTestId("dropdown-content");
      expect(content).toBeInTheDocument();
      expect(content).toHaveClass(
        "rounded-md border border-border bg-popover shadow-lg"
      );
      expect(screen.getByText("My Account")).toBeInTheDocument();

      const profileItem = screen.getByText("Profile Settings");
      await user.click(profileItem);
      expect(handleProfileClick).toHaveBeenCalledTimes(1);
    });
  });
});
