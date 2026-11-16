import type { Metadata } from "next";
import { connection } from "next/server";
import {
  getVpnNodes,
  getActiveVpnSubscription,
  getVpnSessionLogs,
} from "@/features/vpn/api";
import { VpnView } from "@/features/vpn";

export const metadata: Metadata = {
  title: "VPN Session Logs & Audit | Korak Digitals",
  description:
    "Review connection sessions, bandwidth usage, and audit logs for your dedicated VPN tunnels.",
};

export default async function VpnLogsPage() {
  await connection();
  const [nodes, subscription, logs] = await Promise.all([
    getVpnNodes(),
    getActiveVpnSubscription(),
    getVpnSessionLogs(),
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <VpnView
        initialTab="logs"
        initialNodes={nodes}
        initialSubscription={subscription}
        initialLogs={logs}
      />
    </div>
  );
}
