import * as React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  SubmitButton,
  setServerFormErrors,
} from "./form";
import { Input } from "./input";
import { PasswordInput } from "./password-input";
import { ApiClientError } from "@/lib/api/client";

const testSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type TestFormData = z.infer<typeof testSchema>;

function TestFormComponent({
  onSubmit = () => {},
  onFormReady,
}: {
  onSubmit?: (data: TestFormData) => void | Promise<void>;
  onFormReady?: (form: ReturnType<typeof useForm<TestFormData>>) => void;
}) {
  const form = useForm<TestFormData>({
    resolver: zodResolver(testSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  React.useEffect(() => {
    onFormReady?.(form);
  }, [form, onFormReady]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {form.formState.errors.root?.serverError && (
          <div role="alert" data-testid="root-error">
            {form.formState.errors.root.serverError.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Enter username" {...field} />
              </FormControl>
              <FormDescription>Your public profile name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter email" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput placeholder="Enter password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton loadingText="Submitting...">Submit</SubmitButton>
      </form>
    </Form>
  );
}

describe("Form Foundation Components (F7)", () => {
  it("renders accessible labels, descriptions, and inputs", () => {
    render(<TestFormComponent />);

    const usernameLabel = screen.getByText("Username");
    const usernameInput = screen.getByPlaceholderText("Enter username");
    expect(usernameLabel).toHaveAttribute("for", usernameInput.id);

    const description = screen.getByText("Your public profile name.");
    expect(usernameInput).toHaveAttribute(
      "aria-describedby",
      expect.stringContaining(description.id)
    );
    expect(usernameInput).toHaveAttribute("aria-invalid", "false");
  });

  it("validates with Zod on submit, moves focus to the first invalid field, and shows error messages", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<TestFormComponent onSubmit={handleSubmit} />);

    await user.click(screen.getByRole("button", { name: "Submit" }));

    // Handler should not be called due to validation failure
    expect(handleSubmit).not.toHaveBeenCalled();

    // First invalid field (username) should receive focus per Doc 09 §6
    const usernameInput = screen.getByPlaceholderText("Enter username");
    expect(usernameInput).toHaveFocus();
    expect(usernameInput).toHaveAttribute("aria-invalid", "true");

    // FormMessage elements should render accessible alert messages
    expect(
      screen.getByText("Username must be at least 3 characters")
    ).toBeInTheDocument();
    expect(screen.getByText("Invalid email address")).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters")
    ).toBeInTheDocument();
  });

  it("disables SubmitButton and shows loading state while form is submitting", async () => {
    const user = userEvent.setup();
    let resolveSubmit: () => void = () => {};
    const asyncSubmit = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveSubmit = resolve;
        })
    );

    render(<TestFormComponent onSubmit={asyncSubmit} />);

    await user.type(screen.getByPlaceholderText("Enter username"), "validuser");
    await user.type(
      screen.getByPlaceholderText("Enter email"),
      "user@example.com"
    );
    await user.type(
      screen.getByPlaceholderText("Enter password"),
      "securepassword123"
    );

    const submitBtn = screen.getByRole("button", { name: "Submit" });
    await user.click(submitBtn);

    // During async submit
    await waitFor(() => {
      const submitLoadingBtn = screen.getByRole("button", {
        name: /submitting/i,
      });
      expect(submitLoadingBtn).toBeDisabled();
      expect(submitLoadingBtn).toHaveAttribute("aria-busy", "true");
    });

    // Resolve submission
    resolveSubmit();

    await waitFor(() => {
      const submitReadyBtn = screen.getByRole("button", { name: "Submit" });
      expect(submitReadyBtn).not.toBeDisabled();
    });
  });

  it("maps Laravel validation errors to fields and focuses the first invalid field using setServerFormErrors", async () => {
    let formRef: ReturnType<typeof useForm<TestFormData>> | undefined;

    render(
      <TestFormComponent
        onFormReady={(form) => {
          formRef = form;
        }}
      />
    );

    expect(formRef).toBeDefined();

    // Simulate API 422 Unprocessable Entity
    const apiError = new ApiClientError(
      "The given data was invalid.",
      422,
      "validation_error",
      {
        email: ["The email has already been taken."],
        password: ["The password is too weak."],
      }
    );

    await React.act(async () => {
      setServerFormErrors(formRef!, apiError, { focusFirst: true });
    });

    await waitFor(() => {
      expect(
        screen.getByText("The email has already been taken.")
      ).toBeInTheDocument();
      expect(screen.getByText("The password is too weak.")).toBeInTheDocument();
    });

    // Email was the first error key, so it should receive focus
    const emailInput = screen.getByPlaceholderText("Enter email");
    expect(emailInput).toHaveFocus();
    expect(emailInput).toHaveAttribute("aria-invalid", "true");
  });

  it("handles generic server errors and sets root error", async () => {
    let formRef: ReturnType<typeof useForm<TestFormData>> | undefined;

    render(
      <TestFormComponent
        onFormReady={(form) => {
          formRef = form;
        }}
      />
    );

    // Generic 500 server error
    const genericError = new ApiClientError(
      "Something went wrong on the server",
      500
    );

    let result: { rootError?: string } = {};
    await React.act(async () => {
      result = setServerFormErrors(formRef!, genericError);
    });
    expect(result.rootError).toBeDefined();

    await waitFor(() => {
      expect(screen.getByTestId("root-error")).toHaveTextContent(
        "An unexpected error occurred on our servers. Please try again later."
      );
    });
  });
});
