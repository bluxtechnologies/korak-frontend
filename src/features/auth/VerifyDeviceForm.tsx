"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ROUTES } from "@/config/navigation";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SubmitButton,
  setServerFormErrors,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { OtpInput } from "@/components/ui/otp-input";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, ShieldCheck } from "lucide-react";
import { verifyDevice, resendVerificationCode } from "@/features/auth/api";
import { getSafeRedirectPath } from "./LoginForm";

// ---------------------------------------------------------------------------
// Schema — Doc 09 §6: 6-digit code, optional remember device boolean
// ---------------------------------------------------------------------------
export const verifyDeviceSchema = z.object({
  code: z
    .string()
    .min(1, "Please enter the verification code.")
    .length(6, "Please enter all 6 digits of the verification code.")
    .regex(/^\d+$/, "Verification code must contain only numbers."),
  remember_device: z.boolean(),
});

export type VerifyDeviceFormData = z.infer<typeof verifyDeviceSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function VerifyDeviceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken =
    searchParams?.get("challenge") || searchParams?.get("token") || "";
  const [currentToken, setCurrentToken] = React.useState<string>(initialToken);

  React.useEffect(() => {
    const t = searchParams?.get("challenge") || searchParams?.get("token") || "";
    if (t) setCurrentToken(t);
  }, [searchParams]);

  const [rootError, setRootError] = React.useState<string | undefined>();
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [isResending, setIsResending] = React.useState(false);

  const form = useForm<VerifyDeviceFormData>({
    resolver: zodResolver(verifyDeviceSchema),
    defaultValues: {
      code: "",
      remember_device: false,
    },
  });

  // Countdown timer for resend button
  React.useEffect(() => {
    if (resendCooldown <= 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = async (data: VerifyDeviceFormData) => {
    setRootError(undefined);
    if (!currentToken) {
      setRootError("Verification session expired or missing token. Please sign in again.");
      return;
    }
    try {
      await verifyDevice({
        challenge_token: currentToken,
        code: data.code,
        remember_device: data.remember_device,
      });

      toast.success("Device verified successfully!");
      const intended = searchParams?.get("intended") ?? null;
      const destination = getSafeRedirectPath(intended);
      router.push(destination);
    } catch (err: unknown) {
      const apiErr = err as { code?: string; status?: number };
      if (apiErr?.code === "invalid_or_expired_challenge" || apiErr?.status === 400) {
        toast.error("Invalid or expired verification challenge. Please log in again.");
        router.push(ROUTES.LOGIN);
        return;
      }
      const { rootError: msg } = setServerFormErrors(form, err);
      if (msg) {
        setRootError(msg);
      }
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setRootError(undefined);
    try {
      const email = searchParams?.get("email") || undefined;
      const login = searchParams?.get("login") || undefined;
      const res = await resendVerificationCode({
        ...(currentToken ? { challenge_token: currentToken } : {}),
        ...(email ? { email } : {}),
        ...(login ? { login } : {}),
      });

      if (res?.challenge_token) {
        setCurrentToken(res.challenge_token);
      }
      toast.success(res.message || "Verification code resent successfully.");
      setResendCooldown(60);
      form.setValue("code", "");
    } catch (err: unknown) {
      const apiErr = err as { code?: string; status?: number; retryAfter?: number };
      if (apiErr?.code === "invalid_or_expired_challenge" || apiErr?.status === 400) {
        toast.error("Invalid or expired verification challenge. Please log in again.");
        router.push(ROUTES.LOGIN);
        return;
      }
      if (apiErr?.status === 429 || apiErr?.code === "too_many_requests") {
        const cooldown = apiErr.retryAfter || 60;
        setResendCooldown(cooldown);
        setRootError(`Too many requests. Please try again in ${cooldown} seconds.`);
        return;
      }
      const { rootError: msg } = setServerFormErrors(form, err);
      if (msg) {
        setRootError(msg);
      } else {
        toast.error("Unable to resend code. Please try again shortly.");
      }
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
        aria-label="Verify device form"
        noValidate
      >
        {/* Header icon and instructions */}
        <div className="space-y-2 text-center">
          <div className="bg-primary/10 text-primary mx-auto flex size-12 items-center justify-center rounded-full">
            <ShieldCheck className="size-6" aria-hidden />
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed">
            We noticed a login from an unrecognised device. A 6-digit verification
            code was sent to your registered email.
          </p>
        </div>

        {/* Root / server error banner */}
        {rootError && (
          <Alert variant="destructive" className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="text-sm">
              <span>{rootError}</span>
              {rootError.toLowerCase().includes("attempt") && (
                <p className="mt-2 text-xs">
                  If you are having trouble receiving codes, please sign in again
                  or wait before requesting another code.
                </p>
              )}
            </div>
          </Alert>
        )}

        {/* 6-digit OTP code */}
        <FormField
          control={form.control}
          name="code"
          render={({ fieldState }) => (
            <FormItem className="space-y-2">
              <div className="flex items-center justify-between">
                <FormLabel>Verification code</FormLabel>
                <span className="text-muted-foreground text-xs">6 digits</span>
              </div>
              <Controller
                control={form.control}
                name="code"
                render={({ field: controllerField }) => (
                  <OtpInput
                    value={controllerField.value}
                    onChange={controllerField.onChange}
                    hasError={!!fieldState.error}
                    disabled={form.formState.isSubmitting}
                  />
                )}
              />
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Remember this device checkbox (F10.2) */}
        <FormField
          control={form.control}
          name="remember_device"
          render={({ field }) => (
            <FormItem className="border-border/60 bg-muted/30 flex flex-row items-start space-y-0 space-x-3 rounded-md border p-3">
              <Checkbox
                id="remember_device"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="mt-0.5"
              />
              <div className="space-y-1 leading-none">
                <FormLabel htmlFor="remember_device" className="cursor-pointer text-xs font-medium">
                  Remember this device for 30 days
                </FormLabel>
                <p className="text-muted-foreground text-[11px] leading-tight">
                  Only choose this on personal devices. Do not check this on shared computers.
                </p>
              </div>
            </FormItem>
          )}
        />

        {/* Submit button */}
        <SubmitButton className="w-full" loadingText="Verifying device…">
          Verify and continue
        </SubmitButton>

        {/* Resend code & back to sign in (F10.3) */}
        <div className="space-y-2 text-center text-xs">
          <p className="text-muted-foreground">
            Didn&apos;t receive the code?{" "}
            {resendCooldown > 0 ? (
              <span className="text-muted-foreground font-medium">
                Resend in {resendCooldown}s
              </span>
            ) : (
              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                disabled={isResending}
                className="text-primary hover:text-primary/80 h-auto p-0 font-medium underline-offset-4 hover:underline"
              >
                {isResending ? "Resending…" : "Resend code"}
              </Button>
            )}
          </p>

          <Link
            href={ROUTES.LOGIN}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring block transition-colors focus-visible:ring-1 focus-visible:outline-none"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </Form>
  );
}
