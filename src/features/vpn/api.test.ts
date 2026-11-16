import { describe, expect, it } from "vitest";
import {
  VPN_SERVER_NODES,
  MOCK_ACTIVE_VPN_SUBSCRIPTION,
  MOCK_VPN_SESSION_LOGS,
  getVpnNodes,
  getActiveVpnSubscription,
  purchaseVpnNode,
  getVpnSessionLogs,
  regenerateVpnKeys,
  buildWireguardConfig,
} from "./api";

describe("VPN API & Configuration Utilities (Phase 4)", () => {
  it("provides 6 high-speed global server nodes", async () => {
    const nodes = await getVpnNodes();
    expect(nodes.length).toBe(6);
    expect(nodes.map((n) => n.city)).toEqual([
      "London",
      "Frankfurt",
      "Amsterdam",
      "New York",
      "Singapore",
      "Tokyo",
    ]);
    nodes.forEach((node) => {
      expect(node.ping_ms).toBeGreaterThan(0);
      expect(node.bandwidth_gbps).toBe(10);
      expect(node.protocols.length).toBeGreaterThan(0);
      expect(node.endpoint).toContain(".korakvpn.net");
    });
  });

  it("retrieves the active VPN subscription", async () => {
    const sub = await getActiveVpnSubscription();
    expect(sub).not.toBeNull();
    expect(sub?.status).toBe("active");
    expect(sub?.dedicated_ip).toBe("185.220.101.42");
    expect(sub?.protocol).toBe("wireguard");
  });

  it("generates a syntactically valid WireGuard configuration file", () => {
    const config = buildWireguardConfig(MOCK_ACTIVE_VPN_SUBSCRIPTION);
    expect(config).toContain("[Interface]");
    expect(config).toContain(`PrivateKey = ${MOCK_ACTIVE_VPN_SUBSCRIPTION.client_private_key}`);
    expect(config).toContain(`Address = ${MOCK_ACTIVE_VPN_SUBSCRIPTION.client_ip}`);
    expect(config).toContain("DNS = 1.1.1.1, 1.0.0.1");
    expect(config).toContain("[Peer]");
    expect(config).toContain(`PublicKey = ${MOCK_ACTIVE_VPN_SUBSCRIPTION.server_public_key}`);
    expect(config).toContain(`Endpoint = ${MOCK_ACTIVE_VPN_SUBSCRIPTION.node.endpoint}`);
    expect(config).toContain("AllowedIPs = 0.0.0.0/0, ::/0");
    expect(config).toContain("PersistentKeepalive = 25");
  });

  it("handles provisioning a new VPN node subscription with duration and pricing", async () => {
    const newSub = await purchaseVpnNode({
      node_id: "node_fra01",
      protocol: "wireguard",
      months: 3,
      pin: "1234",
    });

    expect(newSub.node.id).toBe("node_fra01");
    expect(newSub.months).toBe(3);
    expect(newSub.price).toBe(3 * 3500);
    expect(newSub.status).toBe("active");
    expect(newSub.dedicated_ip).toBe("194.36.191.12");
  });

  it("retrieves VPN connection session logs", async () => {
    const logs = await getVpnSessionLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].session_id).toBeDefined();
    expect(logs[0].egress_ip).toBeDefined();
    expect(logs[0].bytes_sent).toBeGreaterThan(0);
  });

  it("regenerates client private and public keys", async () => {
    const updated = await regenerateVpnKeys("sub_vpn_01");
    expect(updated.client_private_key).toBeDefined();
    expect(updated.client_public_key).toBeDefined();
  });
});
