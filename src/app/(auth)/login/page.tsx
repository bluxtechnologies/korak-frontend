import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ROUTES } from "@/config/navigation";
import { LoginForm } from "@/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your Korak Digitals account to manage airtime, data, VPN, and social media services.",
};

export default function LoginPage() {
  return (
    <>
      {/* Page heading */}
      <div className="mb-6 space-y-1.5 text-center">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">
          Welcome Back!
        </h1>
        <p className="text-muted-foreground text-sm text-pretty">
          Sign in to manage your digital services, wallet balance, and active orders.
        </p>
      </div>

      <Suspense fallback={<div className="h-48 animate-pulse rounded-md bg-muted/30" />}>
        <LoginForm />
      </Suspense>

      {/* Register link */}
      <p className="text-muted-foreground mt-6 text-center text-sm">
        Don&apos;t have an account?{" "}
        <Link
          href={ROUTES.REGISTER}
          className="text-primary hover:text-primary/80 focus-visible:ring-ring rounded-sm font-semibold underline-offset-4 transition-colors hover:underline focus-visible:ring-1 focus-visible:outline-none"
        >
          Sign Up
        </Link>
      </p>
    </>
  );
}
