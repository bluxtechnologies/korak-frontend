"use client";

import * as React from "react";
import { toast } from "sonner";
import { ShieldCheck, Smartphone, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { toggleDeviceVerification } from "./api";

export interface DeviceVerificationCardProps {
  /** Initial enabled state from customer profile */
  enabled?: boolean;
  /** Callback fired after verification setting is successfully toggled */
  onStatusChanged?: (enabled: boolean) => void;
  className?: string;
}

/**
 * DeviceVerificationCard.
 * Opt-in toggle allowing customers to enable or disable email OTP challenges
 * for unrecognized devices and browsers per Backend Handoff.
 */
export function DeviceVerificationCard({
  enabled: initialEnabled = false,
  onStatusChanged,
  className,
}: DeviceVerificationCardProps) {
  const [enabled, setEnabled] = React.useState<boolean>(initialEnabled);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  // Sync state if initialEnabled prop changes
  React.useEffect(() => {
    setEnabled(initialEnabled);
  }, [initialEnabled]);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    // Optimistically update
    setEnabled(checked);

    try {
      const updated = await toggleDeviceVerification(checked);
      const newStatus = updated.device_verification_enabled ?? checked;
      setEnabled(newStatus);
      toast.success(
        newStatus
          ? "Device verification enabled. You will receive an OTP when logging in from new devices."
          : "Device verification disabled."
      );
      onStatusChanged?.(newStatus);
    } catch (err: unknown) {
      // Revert switch state on error
      setEnabled(!checked);
      const safeMessage = getSafeErrorMessage(
        err,
        "Failed to update security settings."
      );
      toast.error(safeMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className} data-testid="device-verification-card">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-primary"
            >
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
                Device Verification (OTP)
                <Badge
                  variant={enabled ? "success" : "secondary"}
                  className="text-[10px] font-medium tracking-tight uppercase"
                >
                  {enabled ? "Active" : "Disabled"}
                </Badge>
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Require an email verification code whenever you log in from an unrecognized device or browser
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
            )}
            <Switch
              id="device-verification-toggle"
              aria-label="Toggle device verification"
              checked={enabled}
              disabled={isLoading}
              onCheckedChange={handleToggle}
              data-testid="device-verification-switch"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4 text-xs text-muted-foreground space-y-2">
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            When turned <strong>ON</strong>, any login from a new computer, phone, or browser will send a secure 6-digit confirmation code to your email address before granting access.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
