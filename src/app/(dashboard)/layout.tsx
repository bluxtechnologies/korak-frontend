import type { Metadata } from "next";
import { connection } from "next/server";
import { requireAuthUser } from "@/features/auth/server-session";
import { DashboardShell } from "@/components/layout/DashboardShell";

// Authenticated layout reads cookies/headers per request (Doc 09 §3 / Next.js 16 cacheComponents via connection())
export const instant = false;

export const metadata: Metadata = {
  title: {
    template: "%s — Korak Digitals",
    default: "Dashboard — Korak Digitals",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  // Verify session on the server via /api/v1/auth/me (Doc 04 §6 / F11.2)
  const user = await requireAuthUser();

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
