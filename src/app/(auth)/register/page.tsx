import type { Metadata } from "next";
import Link from "next/link";
import { ROUTES } from "@/config/navigation";
import { RegisterForm } from "@/features/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Create account",
  description:
    "Create your Korak Digitals account to get started with airtime, data, VPN, and social media services.",
};

export default function RegisterPage() {
  return (
    <>
      {/* Page heading */}
      <div className="mb-6 space-y-1 text-center">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">
          Create account
        </h1>
        <p className="text-muted-foreground text-sm">
          Fill in your details to get started.
        </p>
      </div>

      <RegisterForm />

      {/* Sign-in link */}
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Already have an account?{" "}
        <Link
          href={ROUTES.LOGIN}
          className="text-primary hover:text-primary/80 focus-visible:ring-ring rounded-sm font-medium underline-offset-4 transition-colors hover:underline focus-visible:ring-1 focus-visible:outline-none"
        >
          Sign in
        </Link>
      </p>
    </>
  );
}
