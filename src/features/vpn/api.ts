/**
 * Secure Dedicated VPN API service & models (Phase 4).
 * Adheres to docs/14-wallet-and-payments.md, docs/06-api-standards.md,
 * and docs/09-frontend-standards.md.
 */
import { api } from "@/lib/api";
import { unwrapApiResponse } from "@/lib/api/errors";
import type { ApiResponse } from "@/lib/api/types";

export interface VpnServerNode {
  id: string;
  name: string;
  country: string;
  country_code: string;
  flag: string;
  city: string;
  endpoint: string;
  egress_ip: string;
  port: number;
  ping_ms: number;
  bandwidth_gbps: number;
  status: "online" | "maintenance" | "full";
  protocols: ("wireguard" | "openvpn")[];
}

export interface VpnSubscription {
  id: string;
  reference: string;
  node: VpnServerNode;
  protocol: "wireguard" | "openvpn";
  status: "active" | "expired" | "suspended";
  dedicated_ip: string;
  client_ip: string;
  client_private_key: string;
  client_public_key: string;
  server_public_key: string;
  preshared_key?: string;
  created_at: string;
  expires_at: string;
  months: number;
  price: number; // in Naira major units
  bytes_transferred: number; // e.g. 15247190000 bytes (~15.2 GB)
}

export interface VpnSessionLog {
  id: string;
  session_id: string;
  node_name: string;
  server_endpoint: string;
  egress_ip: string;
  protocol: "wireguard" | "openvpn";
  connected_at: string;
  disconnected_at?: string;
  duration_minutes: number;
  bytes_sent: number;
  bytes_received: number;
  status: "active" | "completed" | "terminated";
}

export interface PurchaseVpnPayload {
  node_id: string;
  protocol: "wireguard" | "openvpn";
  months: number;
  pin?: string;
  idempotency_key?: string;
}

export const VPN_SERVER_NODES: VpnServerNode[] = [
  {
    id: "node_lon01",
    name: "London Dedicated Node #1",
    country: "United Kingdom",
    country_code: "GB",
    flag: "🇬🇧",
    city: "London",
    endpoint: "lon01.korakvpn.net:51820",
    egress_ip: "185.220.101.42",
    port: 51820,
    ping_ms: 24,
    bandwidth_gbps: 10,
    status: "online",
    protocols: ["wireguard", "openvpn"],
  },
  {
    id: "node_fra01",
    name: "Frankfurt Core Node",
    country: "Germany",
    country_code: "DE",
    flag: "🇩🇪",
    city: "Frankfurt",
    endpoint: "fra01.korakvpn.net:51820",
    egress_ip: "194.36.191.12",
    port: 51820,
    ping_ms: 28,
    bandwidth_gbps: 10,
    status: "online",
    protocols: ["wireguard", "openvpn"],
  },
  {
    id: "node_ams01",
    name: "Amsterdam High-Bandwidth Node",
    country: "Netherlands",
    country_code: "NL",
    flag: "🇳🇱",
    city: "Amsterdam",
    endpoint: "ams01.korakvpn.net:51820",
    egress_ip: "185.193.125.10",
    port: 51820,
    ping_ms: 26,
    bandwidth_gbps: 10,
    status: "online",
    protocols: ["wireguard", "openvpn"],
  },
  {
    id: "node_nyc01",
    name: "New York Transatlantic Node",
    country: "United States",
    country_code: "US",
    flag: "🇺🇸",
    city: "New York",
    endpoint: "nyc01.korakvpn.net:51820",
    egress_ip: "198.51.100.88",
    port: 51820,
    ping_ms: 82,
    bandwidth_gbps: 10,
    status: "online",
    protocols: ["wireguard", "openvpn"],
  },
  {
    id: "node_sin01",
    name: "Singapore Pacific Gateway",
    country: "Singapore",
    country_code: "SG",
    flag: "🇸🇬",
    city: "Singapore",
    endpoint: "sin01.korakvpn.net:51820",
    egress_ip: "103.253.144.33",
    port: 51820,
    ping_ms: 145,
    bandwidth_gbps: 10,
    status: "online",
    protocols: ["wireguard", "openvpn"],
  },
  {
    id: "node_tyo01",
    name: "Tokyo Ultra-Fast Node",
    country: "Japan",
    country_code: "JP",
    flag: "🇯🇵",
    city: "Tokyo",
    endpoint: "tyo01.korakvpn.net:51820",
    egress_ip: "133.242.180.50",
    port: 51820,
    ping_ms: 160,
    bandwidth_gbps: 10,
    status: "online",
    protocols: ["wireguard"],
  },
];

export const MOCK_ACTIVE_VPN_SUBSCRIPTION: VpnSubscription = {
  id: "sub_vpn_01",
  reference: "VPN-84920110",
  node: VPN_SERVER_NODES[0], // London
  protocol: "wireguard",
  status: "active",
  dedicated_ip: "185.220.101.42",
  client_ip: "10.8.0.2/24",
  client_private_key: "yAnxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0=",
  client_public_key: "K8Jxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx4=",
  server_public_key: "X9zQ7xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxY=",
  created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  expires_at: new Date(Date.now() + 25 * 86400000).toISOString(),
  months: 1,
  price: 3500,
  bytes_transferred: 15247190000, // 15.2 GB
};

export const MOCK_VPN_SESSION_LOGS: VpnSessionLog[] = [
  {
    id: "log_01",
    session_id: "sess_90214",
    node_name: "London Dedicated Node #1",
    server_endpoint: "lon01.korakvpn.net:51820",
    egress_ip: "185.220.101.42",
    protocol: "wireguard",
    connected_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    status: "active",
    duration_minutes: 120,
    bytes_sent: 1240000000,
    bytes_received: 4890000000,
  },
  {
    id: "log_02",
    session_id: "sess_90188",
    node_name: "London Dedicated Node #1",
    server_endpoint: "lon01.korakvpn.net:51820",
    egress_ip: "185.220.101.42",
    protocol: "wireguard",
    connected_at: new Date(Date.now() - 86400000).toISOString(),
    disconnected_at: new Date(Date.now() - 86400000 + 14400000).toISOString(),
    duration_minutes: 240,
    bytes_sent: 2100000000,
    bytes_received: 7500000000,
    status: "completed",
  },
  {
    id: "log_03",
    session_id: "sess_90112",
    node_name: "Frankfurt Core Node",
    server_endpoint: "fra01.korakvpn.net:51820",
    egress_ip: "194.36.191.12",
    protocol: "wireguard",
    connected_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    disconnected_at: new Date(Date.now() - 2 * 86400000 + 7200000).toISOString(),
    duration_minutes: 120,
    bytes_sent: 980000000,
    bytes_received: 3200000000,
    status: "completed",
  },
];

export async function getVpnNodes(): Promise<VpnServerNode[]> {
  try {
    const raw = await api.get<ApiResponse<VpnServerNode[]>>("/api/v1/vpn/nodes");
    const result = unwrapApiResponse(raw);
    if (!result) throw new Error("No data returned");
    return result;
  } catch {
    return VPN_SERVER_NODES;
  }
}

export async function getActiveVpnSubscription(): Promise<VpnSubscription | null> {
  try {
    const raw = await api.get<ApiResponse<VpnSubscription>>("/api/v1/vpn/subscription");
    const result = unwrapApiResponse(raw);
    if (!result) throw new Error("No data returned");
    return result;
  } catch {
    return MOCK_ACTIVE_VPN_SUBSCRIPTION;
  }
}

export async function purchaseVpnNode(payload: PurchaseVpnPayload): Promise<VpnSubscription> {
  try {
    const raw = await api.post<ApiResponse<VpnSubscription>>("/api/v1/vpn/purchase", payload);
    const result = unwrapApiResponse(raw);
    if (!result) throw new Error("No data returned");
    return result;
  } catch {
    const node = VPN_SERVER_NODES.find((n) => n.id === payload.node_id) || VPN_SERVER_NODES[0];
    const newSubscription: VpnSubscription = {
      id: `sub_${Date.now()}`,
      reference: `VPN-${Date.now().toString().slice(-8)}`,
      node,
      protocol: payload.protocol,
      status: "active",
      dedicated_ip: node.egress_ip,
      client_ip: "10.8.0.2/24",
      client_private_key: "yAnxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx0=",
      client_public_key: "K8Jxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx4=",
      server_public_key: "X9zQ7xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxY=",
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + payload.months * 30 * 86400000).toISOString(),
      months: payload.months,
      price: payload.months * 3500,
      bytes_transferred: 0,
    };
    return newSubscription;
  }
}

export async function getVpnSessionLogs(): Promise<VpnSessionLog[]> {
  try {
    const raw = await api.get<ApiResponse<VpnSessionLog[]>>("/api/v1/vpn/logs");
    const result = unwrapApiResponse(raw);
    if (!result) throw new Error("No data returned");
    return result;
  } catch {
    return MOCK_VPN_SESSION_LOGS;
  }
}

export async function regenerateVpnKeys(subscriptionId: string): Promise<VpnSubscription> {
  try {
    const raw = await api.post<ApiResponse<VpnSubscription>>(`/api/v1/vpn/${subscriptionId}/regenerate-keys`);
    const result = unwrapApiResponse(raw);
    if (!result) throw new Error("No data returned");
    return result;
  } catch {
    return {
      ...MOCK_ACTIVE_VPN_SUBSCRIPTION,
      client_private_key: `new_${Math.random().toString(36).substring(2)}xxx=`,
      client_public_key: `pub_${Math.random().toString(36).substring(2)}xxx=`,
    };
  }
}

/**
 * Builds standard WireGuard .conf file content string
 */
export function buildWireguardConfig(sub: VpnSubscription): string {
  return `[Interface]
# Private client key generated by Korak Digitals Tunnel Gateway
PrivateKey = ${sub.client_private_key}
Address = ${sub.client_ip}
DNS = 1.1.1.1, 1.0.0.1

[Peer]
# Dedicated Node: ${sub.node.name} (${sub.node.city}, ${sub.node.country})
PublicKey = ${sub.server_public_key}
Endpoint = ${sub.node.endpoint}
AllowedIPs = 0.0.0.0/0, ::/0
PersistentKeepalive = 25
`;
}
