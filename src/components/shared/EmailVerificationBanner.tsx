"use client";

import * as React from "react";
import { Mail, Send, Clock, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/components/ui/sonner";
import { NAV_ICON_STROKE_WIDTH } from "@/config/navigation";
import { useOptionalAuthUser } from "@/components/layout/DashboardShell";
import { resendEmailVerification, type AuthUser } from "@/features/auth/api";
import { customerApi } from "@/lib/api/customer";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

export interface EmailVerificationBannerProps {
  /** Optional user override */
  user?: AuthUser | null;
  /** Optional email override */
  email?: string | null;
  /** Custom additional CSS classes */
  className?: string;
}

/**
 * EmailVerificationBanner.
 * Displays a persistent alert banner reminding the customer to verify their email address.
 * Automatically hides when the user's email is verified (email_verified_at is set).
 */
export function EmailVerificationBanner({
  user: propUser,
  email: propEmail,
  className,
}: EmailVerificationBannerProps) {
  const contextUser = useOptionalAuthUser();
  const effectiveUser = propUser !== undefined ? propUser : contextUser;

  const [isVerified, setIsVerified] = React.useState<boolean>(() => {
    if (effectiveUser) {
      return Boolean(effectiveUser.email_verified_at);
    }
    // If explicit email is passed but no user, treat as unverified
    if (propEmail) {
      return false;
    }
    return true;
  });

  const [userEmail, setUserEmail] = React.useState<string>(() => {
    return propEmail || effectiveUser?.email || "";
  });

  const [isSending, setIsSending] = React.useState(false);
  const [isChecking, setIsChecking] = React.useState(false);
  const [cooldown, setCooldown] = React.useState(0);

  // Sync state if user prop or context updates
  React.useEffect(() => {
    if (effectiveUser) {
      setIsVerified(Boolean(effectiveUser.email_verified_at));
      if (effectiveUser.email) {
        setUserEmail(effectiveUser.email);
      }
    } else if (propEmail) {
      setIsVerified(false);
      setUserEmail(propEmail);
    }
  }, [effectiveUser, propEmail]);

  // Fallback check: if no context user is present, attempt fetching profile once
  React.useEffect(() => {
    let ignore = false;
    if (effectiveUser === undefined && !propEmail) {
      customerApi
        .getProfile()
        .then((profile) => {
          if (!ignore && profile) {
            setIsVerified(Boolean(profile.email_verified_at));
            if (profile.email) {
              setUserEmail(profile.email);
            }
          }
        })
        .catch(() => {
          // Fail silently if guest or unauthenticated
        });
    }
    return () => {
      ignore = true;
    };
  }, [effectiveUser, propEmail]);

  // Countdown timer for resend button cooldown
  React.useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleResend = async () => {
    if (isSending || cooldown > 0) return;

    setIsSending(true);
    try {
      const res = await resendEmailVerification();
      showToast.success(
        "Verification Email Sent",
        res.message || "A new verification link has been sent to your email address."
      );
      setCooldown(60);
    } catch (err: unknown) {
      showToast.error(
        "Failed to Send",
        getSafeErrorMessage(err, "Unable to send verification email. Please try again later.")
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckStatus = async () => {
    if (isChecking) return;

    setIsChecking(true);
    try {
      const profile = await customerApi.getProfile();
      if (profile && profile.email_verified_at) {
        setIsVerified(true);
        showToast.success(
          "Email Verified",
          "Your email address has been verified successfully. Thank you!"
        );
      } else {
        showToast.info(
          "Not Yet Verified",
          "We haven't received confirmation for this email yet. Please check your inbox or spam folder."
        );
      }
    } catch {
      showToast.error(
        "Verification Check Failed",
        "Unable to confirm email verification status right now. Please try again."
      );
    } finally {
      setIsChecking(false);
    }
  };

  // If already verified, do not render banner
  if (isVerified) {
    return null;
  }

  return (
    <div
      role="alert"
      data-testid="email-verification-banner"
      className={cn(
        "relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[10px] border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/15 p-4 text-foreground shadow-none",
        className
      )}
    >
      <div className="flex items-start gap-3 sm:gap-3.5">
        <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-[8px] border border-amber-500/30 bg-amber-500/20 text-amber-700 dark:text-amber-400">
          <Mail className="size-4 sm:size-4.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-100">
              Please verify your email address
            </h4>
            <span className="rounded-[4px] border border-amber-500/30 bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Action Required
            </span>
          </div>
          <p className="text-xs text-amber-900/90 dark:text-amber-200/90 leading-relaxed">
            {userEmail ? (
              <>
                We sent a verification link to{" "}
                <strong className="font-semibold text-foreground underline decoration-amber-500/40">
                  {userEmail}
                </strong>
                . Please verify your email to secure your account and maintain uninterrupted access to all wallet and payment services.
              </>
            ) : (
              "Please verify your email address to secure your account and maintain uninterrupted access to all wallet and payment services."
            )}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1 md:pt-0 shrink-0">
        <Button
          type="button"
          size="sm"
          onClick={handleResend}
          disabled={isSending || cooldown > 0}
          className="h-8.5 rounded-[8px] bg-amber-700 hover:bg-amber-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 text-xs font-semibold px-3 shadow-none transition-colors"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              <span>Sending...</span>
            </>
          ) : cooldown > 0 ? (
            <>
              <Clock className="mr-1.5 size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span>Resend in {cooldown}s</span>
            </>
          ) : (
            <>
              <Send className="mr-1.5 size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span>Resend Email</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCheckStatus}
          disabled={isChecking}
          className="h-8.5 rounded-[8px] border-amber-600/30 text-amber-900 dark:text-amber-200 hover:bg-amber-500/10 text-xs font-medium px-3 shadow-none transition-colors"
        >
          {isChecking ? (
            <>
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <RefreshCw className="mr-1.5 size-3.5" strokeWidth={NAV_ICON_STROKE_WIDTH} />
              <span>I&apos;ve Verified</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
