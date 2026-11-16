import type { Metadata } from "next";
import { connection } from "next/server";
import {
  getVpnNodes,
  getActiveVpnSubscription,
  getVpnSessionLogs,
} from "@/features/vpn/api";
import { VpnView } from "@/features/vpn";

export const metadata: Metadata = {
  title: "Secure Dedicated VPN | Korak Digitals",
  description:
    "Provision dedicated 10 Gbps WireGuard & OpenVPN tunnels with static residential egress IPs.",
};

export default async function VpnPage() {
  await connection();
  const [nodes, subscription, logs] = await Promise.all([
    getVpnNodes(),
    getActiveVpnSubscription(),
    getVpnSessionLogs(),
  ]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <VpnView
        initialTab="manager"
        initialNodes={nodes}
        initialSubscription={subscription}
        initialLogs={logs}
      />
    </div>
  );
}
