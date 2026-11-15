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
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { AlertCircle, ArrowRight } from "lucide-react";
import { SocialAuthButtons } from "@/components/shared/SocialAuthButtons";
import { login } from "@/features/auth/api";

// ---------------------------------------------------------------------------
// Schema — Doc 09 §6: client validation is a usability aid, server re-validates
// ---------------------------------------------------------------------------
const loginSchema = z.object({
  login: z
    .string()
    .min(1, "Please enter your username or email.")
    .max(254, "Username or email is too long."),
  password: z.string().min(1, "Please enter your password."),
  remember_me: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
export function getSafeRedirectPath(intended: string | null): string {
  if (
    intended &&
    intended.startsWith("/") &&
    !intended.startsWith("//") &&
    !intended.startsWith("/\\")
  ) {
    return intended;
  }
  return ROUTES.OVERVIEW;
}

// ---------------------------------------------------------------------------
// Login Form Component
// ---------------------------------------------------------------------------
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rootError, setRootError] = React.useState<string | undefined>();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { login: "", password: "", remember_me: false },
  });

  const onSubmit = async (data: LoginFormData) => {
    setRootError(undefined);
    try {
      const result = await login(data);

      if (result.requires_device_verification) {
        // F10: Verify device flow — navigate to OTP screen forwarding challenge_token
        const intended = searchParams?.get("intended");
        const params = new URLSearchParams();
        if (result.challenge_token) params.set("token", result.challenge_token);
        if (intended) params.set("intended", intended);
        const query = params.toString();
        router.push(query ? `${ROUTES.VERIFY_DEVICE}?${query}` : ROUTES.VERIFY_DEVICE);
        return;
      }

      const displayName = result.user?.name || result.user?.username || "back";
      toast.success(`Welcome back, ${displayName}!`);
      const destination = getSafeRedirectPath(searchParams?.get("intended") ?? null);
      router.push(destination);
    } catch (err) {
      const { rootError: msg } = setServerFormErrors(form, err);
      if (msg) {
        setRootError(msg);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        aria-label="Sign in form"
        noValidate
      >
        {/* Root / server error banner */}
        {rootError && (
          <Alert variant="destructive" className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="text-sm">{rootError}</span>
          </Alert>
        )}

        {/* Username or email */}
        <FormField
          control={form.control}
          name="login"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username or email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="you@example.com"
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="current-password"
                  placeholder="••••••••"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember me & Forgot password row */}
        <div className="flex items-center justify-between pt-1">
          <FormField
            control={form.control}
            name="remember_me"
            render={({ field }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember_me"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
                <FormLabel
                  htmlFor="remember_me"
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-normal"
                >
                  Remember me
                </FormLabel>
              </div>
            )}
          />

          <Link
            href={ROUTES.FORGOT_PASSWORD}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-sm text-xs transition-colors hover:underline focus-visible:ring-1 focus-visible:outline-none"
          >
            Forgot password?
          </Link>
        </div>

        <SubmitButton
          className="h-11 w-full font-medium"
          loadingText="Signing in…"
        >
          <span>Sign in</span>
          <ArrowRight className="ml-2 size-4" aria-hidden="true" />
        </SubmitButton>

        {/* Divider & Social Auth */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="border-border w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <SocialAuthButtons />

        {/* Terms & Privacy disclaimer */}
        <p className="text-muted-foreground mt-6 text-center text-xs leading-relaxed">
          By signing in, you agree to our{" "}
          <Link
            href="#"
            className="hover:text-foreground underline underline-offset-4"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="hover:text-foreground underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </Form>
  );
}
