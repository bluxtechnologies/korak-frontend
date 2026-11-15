import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as React from "react";
import { OtpInput } from "./otp-input";

function ControlledOtpInput({
  initialValue = "",
  disabled = false,
  length = 6,
}: {
  initialValue?: string;
  disabled?: boolean;
  length?: number;
}) {
  const [value, setValue] = React.useState(initialValue);
  return (
    <OtpInput
      value={value}
      onChange={setValue}
      disabled={disabled}
      length={length}
    />
  );
}

describe("OtpInput Component (F10.1)", () => {
  it("renders 6 input slots by default with appropriate accessibility labels", () => {
    render(<ControlledOtpInput />);

    const inputs = screen.getAllByRole("textbox");
    expect(inputs).toHaveLength(6);
    expect(screen.getByLabelText(/digit 1 of 6/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/digit 6 of 6/i)).toBeInTheDocument();
  });

  it("advances focus to the next slot when entering a digit", async () => {
    const user = userEvent.setup();
    render(<ControlledOtpInput />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    await user.type(inputs[0], "1");

    expect(inputs[0].value).toBe("1");
    expect(document.activeElement).toBe(inputs[1]);

    await user.type(inputs[1], "2");
    expect(inputs[1].value).toBe("2");
    expect(document.activeElement).toBe(inputs[2]);
  });

  it("handles backspace to clear previous input and navigate back", async () => {
    const user = userEvent.setup();
    render(<ControlledOtpInput initialValue="12" />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    // Focus third slot (which is empty)
    inputs[2].focus();

    await user.keyboard("{Backspace}");
    // Should clear second slot and focus it
    expect(inputs[1].value).toBe("");
    expect(document.activeElement).toBe(inputs[1]);
  });

  it("navigates left and right with arrow keys", async () => {
    const user = userEvent.setup();
    render(<ControlledOtpInput initialValue="123456" />);

    const inputs = screen.getAllByRole("textbox");
    inputs[2].focus();
    expect(document.activeElement).toBe(inputs[2]);

    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(inputs[1]);

    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(inputs[2]);
  });

  it("populates all slots when pasting 6 digits", async () => {
    const user = userEvent.setup();
    render(<ControlledOtpInput />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    inputs[0].focus();

    await user.paste("654321");

    expect(inputs[0].value).toBe("6");
    expect(inputs[1].value).toBe("5");
    expect(inputs[2].value).toBe("4");
    expect(inputs[3].value).toBe("3");
    expect(inputs[4].value).toBe("2");
    expect(inputs[5].value).toBe("1");
  });

  it("ignores non-numeric characters when typing or pasting", async () => {
    const user = userEvent.setup();
    render(<ControlledOtpInput />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    await user.type(inputs[0], "a");

    expect(inputs[0].value).toBe("");
  });

  it("disables all inputs when disabled prop is true", () => {
    render(<ControlledOtpInput disabled />);

    const inputs = screen.getAllByRole("textbox");
    inputs.forEach((input) => {
      expect(input).toBeDisabled();
    });
  });
});
