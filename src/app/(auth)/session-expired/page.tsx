import type { Metadata } from "next";
import { Suspense } from "react";
import { SessionExpiredCard } from "@/features/auth/SessionExpiredCard";

export const metadata: Metadata = {
  title: "Session expired",
  description: "Your session has expired. Please sign in again to continue.",
};

export default function SessionExpiredPage() {
  return (
    <Suspense
      fallback={
        <div className="h-48 animate-pulse rounded-md bg-muted/30" />
      }
    >
      <SessionExpiredCard />
    </Suspense>
  );
}
