import type { Metadata } from "next";
import { connection } from "next/server";
import { requireAuthUser } from "@/features/auth/server-session";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { serverApi } from "@/lib/api/server";
import { unwrapApiResponse } from "@/lib/api/errors";
import type { ApiResponse, Wallet } from "@/lib/api/types";

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

  let initialWallet: Wallet | null = null;
  try {
    const walletRes = await serverApi.get<ApiResponse<Wallet>>("/api/v1/wallet");
    initialWallet = unwrapApiResponse(walletRes);
  } catch {
    // Non-blocking: client-side WalletProvider will hydrate on mount
  }

  return (
    <DashboardShell user={user} initialWallet={initialWallet}>
      {children}
    </DashboardShell>
  );
}
