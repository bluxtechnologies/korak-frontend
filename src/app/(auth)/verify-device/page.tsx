import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyDeviceForm } from "@/features/auth/VerifyDeviceForm";

export const metadata: Metadata = {
  title: "Verify Device",
  description: "Verify your unrecognised device with the one-time code sent to your email.",
};

export default function VerifyDevicePage() {
  return (
    <>
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Verify device
        </h1>
        <p className="text-muted-foreground text-sm">
          Confirm your identity to finish signing in.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-48 animate-pulse rounded-md bg-muted/30" />
        }
      >
        <VerifyDeviceForm />
      </Suspense>
    </>
  );
}
