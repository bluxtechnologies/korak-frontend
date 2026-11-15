import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/features/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset password",
  description: "Set a new password for your Korak Digitals account.",
};

export default function ResetPasswordPage() {
  return (
    <>
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Reset password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter and confirm your new password below.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="h-48 animate-pulse rounded-md bg-muted/30" />
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </>
  );
}
