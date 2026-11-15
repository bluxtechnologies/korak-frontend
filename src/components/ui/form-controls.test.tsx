import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Label } from "./label";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Checkbox } from "./checkbox";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Switch } from "./switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

describe("Form Controls UI Components", () => {
  describe("Label", () => {
    it("renders text and associates with an input via htmlFor", () => {
      render(
        <div>
          <Label htmlFor="test-input">Test Label</Label>
          <Input id="test-input" />
        </div>
      );
      expect(screen.getByText("Test Label")).toBeInTheDocument();
      expect(screen.getByLabelText("Test Label")).toBeInTheDocument();
    });
  });

  describe("Input", () => {
    it("renders with placeholder and handles text input", async () => {
      const user = userEvent.setup();
      render(<Input placeholder="Enter username" />);
      const input = screen.getByPlaceholderText("Enter username");
      expect(input).toBeInTheDocument();
      expect(input).toHaveClass("h-11 rounded-md border-input");

      await user.type(input, "korak");
      expect(input).toHaveValue("korak");
    });

    it("respects disabled state", () => {
      render(<Input disabled placeholder="Disabled input" />);
      const input = screen.getByPlaceholderText("Disabled input");
      expect(input).toBeDisabled();
      expect(input).toHaveClass(
        "disabled:cursor-not-allowed disabled:opacity-50"
      );
    });
  });

  describe("Textarea", () => {
    it("renders with placeholder and accepts multiline input", async () => {
      const user = userEvent.setup();
      render(<Textarea placeholder="Enter details" />);
      const textarea = screen.getByPlaceholderText("Enter details");
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveClass("min-h-[80px] rounded-md");

      await user.type(textarea, "Line 1\nLine 2");
      expect(textarea).toHaveValue("Line 1\nLine 2");
    });

    it("respects disabled state", () => {
      render(<Textarea disabled placeholder="Disabled textarea" />);
      expect(screen.getByPlaceholderText("Disabled textarea")).toBeDisabled();
    });
  });

  describe("Checkbox", () => {
    it("renders and toggles state when clicked", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Checkbox aria-label="Accept terms" onCheckedChange={onCheckedChange} />
      );
      const checkbox = screen.getByRole("checkbox", { name: /accept terms/i });
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it("respects disabled state", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Checkbox
          disabled
          aria-label="Disabled option"
          onCheckedChange={onCheckedChange}
        />
      );
      const checkbox = screen.getByRole("checkbox", {
        name: /disabled option/i,
      });
      expect(checkbox).toBeDisabled();

      await user.click(checkbox);
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe("RadioGroup", () => {
    it("renders radio options and selects clicked item", async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      render(
        <RadioGroup defaultValue="airtime" onValueChange={onValueChange}>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="airtime" id="r1" />
            <Label htmlFor="r1">Airtime</Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="data" id="r2" />
            <Label htmlFor="r2">Data</Label>
          </div>
        </RadioGroup>
      );

      const airtime = screen.getByRole("radio", { name: /airtime/i });
      const data = screen.getByRole("radio", { name: /data/i });
      expect(airtime).toBeChecked();
      expect(data).not.toBeChecked();

      await user.click(data);
      expect(onValueChange).toHaveBeenCalledWith("data");
    });
  });

  describe("Switch", () => {
    it("renders and toggles on click", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Switch
          aria-label="Toggle notifications"
          onCheckedChange={onCheckedChange}
        />
      );
      const switchControl = screen.getByRole("switch", {
        name: /toggle notifications/i,
      });
      expect(switchControl).toBeInTheDocument();
      expect(switchControl).not.toBeChecked();

      await user.click(switchControl);
      expect(onCheckedChange).toHaveBeenCalledWith(true);
    });

    it("respects disabled state", async () => {
      const user = userEvent.setup();
      const onCheckedChange = vi.fn();
      render(
        <Switch
          disabled
          aria-label="Disabled switch"
          onCheckedChange={onCheckedChange}
        />
      );
      const switchControl = screen.getByRole("switch", {
        name: /disabled switch/i,
      });
      expect(switchControl).toBeDisabled();

      await user.click(switchControl);
      expect(onCheckedChange).not.toHaveBeenCalled();
    });
  });

  describe("Select", () => {
    it("renders select trigger with placeholder and displays value", () => {
      render(
        <Select defaultValue="mtn">
          <SelectTrigger aria-label="Network Provider">
            <SelectValue placeholder="Select network" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mtn">MTN</SelectItem>
            <SelectItem value="airtel">Airtel</SelectItem>
          </SelectContent>
        </Select>
      );

      const trigger = screen.getByRole("combobox", {
        name: /network provider/i,
      });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveTextContent("MTN");
      expect(trigger).toHaveClass("h-11 rounded-md border-input");
    });
  });
});
