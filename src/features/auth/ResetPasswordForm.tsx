"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ROUTES } from "@/config/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SubmitButton,
  setServerFormErrors,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { resetPassword } from "@/features/auth/api";

// ---------------------------------------------------------------------------
// Schema — Doc 08 §2: minimum 8 characters, password confirmation matching
// ---------------------------------------------------------------------------
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    email: z
      .string()
      .min(1, "Please enter your email address.")
      .email("Please enter a valid email address.")
      .max(254, "Email address is too long."),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long."),
    password_confirmation: z
      .string()
      .min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export interface ResetPasswordFormProps {
  initialToken?: string | null;
  initialEmail?: string | null;
}

export function ResetPasswordForm({
  initialToken,
  initialEmail,
}: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = initialToken ?? searchParams?.get("token") ?? "";
  const email = initialEmail ?? searchParams?.get("email") ?? "";

  const [rootError, setRootError] = React.useState<string | undefined>();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token,
      email: email,
      password: "",
      password_confirmation: "",
    },
  });

  // Keep form values synced if token or email arrive via searchParams
  React.useEffect(() => {
    if (token && !form.getValues("token")) {
      form.setValue("token", token);
    }
    if (email && !form.getValues("email")) {
      form.setValue("email", email);
    }
  }, [token, email, form]);

  if (!token) {
    return (
      <div className="space-y-5">
        <Alert variant="destructive" className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="text-sm">
            <p className="font-medium">Invalid or missing reset link</p>
            <p className="mt-1 text-xs leading-relaxed">
              This password reset link is invalid or has expired. Password reset links
              are single-use and expire after a short time.
            </p>
          </div>
        </Alert>

        <div className="space-y-2 pt-2">
          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring block w-full rounded-md py-2 text-center text-sm font-medium transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            Request a new reset link
          </Link>

          <Link
            href={ROUTES.LOGIN}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring block text-center text-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    setRootError(undefined);
    try {
      await resetPassword(data);
      toast.success("Password reset successfully. Please sign in with your new password.");
      router.push(ROUTES.LOGIN);
    } catch (err) {
      const { rootError: msg, fieldErrors } = setServerFormErrors(form, err);
      if (msg) {
        setRootError(msg);
      } else if (fieldErrors?.token) {
        setRootError(fieldErrors.token);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        aria-label="Reset password form"
        noValidate
      >
        {/* Root / server error banner */}
        {rootError && (
          <Alert variant="destructive" className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="text-sm">
              <span>{rootError}</span>
              {rootError.toLowerCase().includes("token") && (
                <p className="mt-2 text-xs">
                  <Link
                    href={ROUTES.FORGOT_PASSWORD}
                    className="underline underline-offset-4 hover:opacity-80"
                  >
                    Request a new password reset link
                  </Link>
                </p>
              )}
            </div>
          </Alert>
        )}

        {/* Hidden token field */}
        <input type="hidden" {...form.register("token")} />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm Password */}
        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="Repeat new password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton className="w-full" loadingText="Resetting password…">
          Reset password
        </SubmitButton>

        <p className="text-muted-foreground text-center text-xs">
          Remember your password?{" "}
          <Link
            href={ROUTES.LOGIN}
            className="text-primary hover:text-primary/80 focus-visible:ring-ring rounded-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:ring-1 focus-visible:outline-none"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Form>
  );
}
