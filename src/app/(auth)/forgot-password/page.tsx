import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Korak Digitals account password.",
};

export default function ForgotPasswordPage() {
  return (
    <>
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Forgot password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      <ForgotPasswordForm />
    </>
  );
}
