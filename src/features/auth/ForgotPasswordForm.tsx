"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "@/features/auth/api";

// ---------------------------------------------------------------------------
// Schema — Doc 09 §6: client validation is a usability aid, server re-validates
// ---------------------------------------------------------------------------
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .max(254, "Email address is too long."),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function ForgotPasswordForm() {
  const [rootError, setRootError] = React.useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState<string>("");

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setRootError(undefined);
    try {
      await forgotPassword({ email: data.email });
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (err) {
      const { rootError: msg } = setServerFormErrors(form, err);
      if (msg) {
        setRootError(msg);
      }
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-5" role="status" aria-live="polite">
        <Alert variant="info" className="flex items-start gap-2 border-primary/20 bg-primary/5">
          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <div className="text-sm">
            <p className="font-medium text-foreground">Check your email</p>
            <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
              If an account exists for{" "}
              <strong className="text-foreground">{submittedEmail}</strong>, we have
              sent a password reset link. Please check your inbox and spam folder.
            </p>
          </div>
        </Alert>

        <div className="space-y-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => {
              setIsSubmitted(false);
              form.reset({ email: "" });
            }}
          >
            Try another email
          </Button>

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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        aria-label="Forgot password form"
        noValidate
      >
        {/* Root / server error banner */}
        {rootError && (
          <Alert variant="destructive" className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="text-sm">{rootError}</span>
          </Alert>
        )}

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

        <SubmitButton className="w-full" loadingText="Sending instructions…">
          Send reset instructions
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
