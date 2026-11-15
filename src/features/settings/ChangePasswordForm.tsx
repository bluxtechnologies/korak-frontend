"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { KeyRound, ShieldCheck } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SubmitButton,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { ApiClientError } from "@/lib/api/client";
import { changePassword } from "./api";

const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Please enter your current password"),
    password: z
      .string()
      .min(12, "New password must be at least 12 characters long"),
    password_confirmation: z
      .string()
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "New passwords do not match",
    path: ["password_confirmation"],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export interface ChangePasswordFormProps {
  onSuccess?: () => void;
  className?: string;
}

/**
 * ChangePasswordForm (F13.2).
 * Allows users to update their password with mandatory re-authentication
 * (current password check) and a 12-character minimum policy per Doc 08 §1.
 */
export function ChangePasswordForm({
  onSuccess,
  className,
}: ChangePasswordFormProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      current_password: "",
      password: "",
      password_confirmation: "",
    },
    mode: "onTouched",
  });

  const { isSubmitting } = form.formState;

  const onSubmit = async (values: ChangePasswordFormValues) => {
    setServerError(null);

    try {
      await changePassword(values);
      toast.success("Password changed successfully.");
      form.reset();
      onSuccess?.();
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof ChangePasswordFormValues, {
              type: "server",
              message: messages[0],
            });
          }
        });
        const firstField = Object.keys(
          err.errors
        )[0] as keyof ChangePasswordFormValues;
        if (firstField) {
          form.setFocus(firstField);
        }
      } else {
        setServerError(
          getSafeErrorMessage(
            err,
            "Failed to change password. Please check your current password and try again."
          )
        );
      }
    }
  };

  return (
    <Card className={className} data-testid="change-password-card">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-primary"
          >
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Change Password
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Update your account password. Re-authentication with your current password is required.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            id="change-password-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 max-w-md"
            noValidate
          >
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Enter current password"
                      autoComplete="current-password"
                      {...field}
                    />
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
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Minimum 12 characters"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Must be at least 12 characters long.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password_confirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <PasswordInput
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-border/60">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          <span>Passwords are encrypted with bcrypt (cost 12)</span>
        </div>

        <SubmitButton
          form="change-password-form"
          size="sm"
          isLoading={isSubmitting}
          loadingText="Updating..."
        >
          Update Password
        </SubmitButton>
      </CardFooter>
    </Card>
  );
}
