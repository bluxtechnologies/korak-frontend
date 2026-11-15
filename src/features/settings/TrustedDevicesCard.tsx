"use client";

import * as React from "react";
import { toast } from "sonner";
import { Shield, Trash2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDate } from "@/lib/formatters";
import { revokeTrustedDevice, type TrustedDevice } from "./api";

export interface TrustedDevicesCardProps {
  devices: TrustedDevice[];
  onDeviceRevoked?: (deviceId: string) => void;
  className?: string;
}

/**
 * TrustedDevicesCard (F13.4).
 * Lists recognized customer devices and provides verified revocation
 * with destructive confirmation per Doc 04 §5 and Doc 08 §4.
 */
export function TrustedDevicesCard({
  devices: initialDevices,
  onDeviceRevoked,
  className,
}: TrustedDevicesCardProps) {
  const [revokedDeviceIds, setRevokedDeviceIds] = React.useState<string[]>([]);
  const [targetDevice, setTargetDevice] = React.useState<TrustedDevice | null>(
    null
  );
  const [isRevoking, setIsRevoking] = React.useState(false);

  const devices = initialDevices.filter(
    (d) => !revokedDeviceIds.includes(d.id)
  );

  const handleRevoke = async () => {
    if (!targetDevice) return;

    setIsRevoking(true);
    try {
      await revokeTrustedDevice(targetDevice.id);
      toast.success(`Revoked trust for ${targetDevice.device_name}.`);
      setRevokedDeviceIds((prev) => [...prev, targetDevice.id]);
      onDeviceRevoked?.(targetDevice.id);
      setTargetDevice(null);
    } catch {
      toast.error("Failed to revoke device. Please try again.");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <>
      <Card className={className} data-testid="trusted-devices-card">
        <CardHeader className="pb-4 border-b border-border/60">
          <CardTitle className="text-base font-semibold text-foreground">
            Trusted Devices
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground mt-0.5">
            Recognized browsers and devices that bypass the secondary OTP verification prompt
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          {devices.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="No trusted devices"
              description="You have no saved trusted devices. Each login from an unrecognised browser will prompt for an email OTP."
              bordered={false}
              className="py-10"
            />
          ) : (
            <div className="divide-y divide-border/60">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between py-3.5 first:pt-4"
                  data-testid={`trusted-device-${device.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground"
                    >
                      <Smartphone className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">
                        {device.device_name}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {device.ip_address} • Trusted on{" "}
                        {formatDate(device.trusted_at, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTargetDevice(device)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive-surface h-8 px-2 text-xs gap-1.5"
                    aria-label={`Revoke ${device.device_name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Revoke</span>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Destructive Confirm Dialog per F13 requirement */}
      <ConfirmDialog
        open={Boolean(targetDevice)}
        onOpenChange={(open) => {
          if (!open) setTargetDevice(null);
        }}
        title="Revoke trusted device?"
        description={
          targetDevice
            ? `Are you sure you want to revoke trust for "${targetDevice.device_name}"? The next time you sign in from this device, you will be required to enter an OTP verification code sent to your email.`
            : ""
        }
        confirmText="Revoke device"
        variant="destructive"
        isLoading={isRevoking}
        onConfirm={handleRevoke}
      />
    </>
  );
}
