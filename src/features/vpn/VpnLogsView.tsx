"use client";

import * as React from "react";
import {
  Download,
  Search,
  Activity,
  FileSpreadsheet,
  Globe2,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { type VpnSessionLog, getVpnSessionLogs } from "./api";

interface VpnLogsViewProps {
  initialLogs?: VpnSessionLog[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hrs}h ${mins}m`;
}

export function VpnLogsView({ initialLogs = [] }: VpnLogsViewProps) {
  const [logs, setLogs] = React.useState<VpnSessionLog[]>(initialLogs);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [loading, setLoading] = React.useState(initialLogs.length === 0);

  React.useEffect(() => {
    if (initialLogs.length === 0) {
      getVpnSessionLogs()
        .then((data) => setLogs(data))
        .finally(() => setLoading(false));
    }
  }, [initialLogs.length]);

  const filteredLogs = React.useMemo(() => {
    if (!searchTerm.trim()) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter(
      (log) =>
        log.session_id.toLowerCase().includes(term) ||
        log.node_name.toLowerCase().includes(term) ||
        log.egress_ip.toLowerCase().includes(term) ||
        log.status.toLowerCase().includes(term)
    );
  }, [logs, searchTerm]);

  const handleExportCsv = () => {
    try {
      const headers = [
        "Session ID",
        "Node",
        "Egress IP",
        "Protocol",
        "Connected At",
        "Duration Minutes",
        "Bytes Sent",
        "Bytes Received",
        "Status",
      ];
      const rows = logs.map((log) => [
        log.session_id,
        `"${log.node_name}"`,
        log.egress_ip,
        log.protocol,
        log.connected_at,
        log.duration_minutes,
        log.bytes_sent,
        log.bytes_received,
        log.status,
      ]);

      const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join(
        "\n"
      );
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `vpn-sessions-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("VPN audit logs exported to CSV");
    } catch {
      toast.error("Failed to export logs");
    }
  };

  return (
    <div className="space-y-4">
      {/* Top search & export bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="size-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by session ID, node, or IP..."
            className="pl-9 h-9 text-xs border-border-subtle rounded-md bg-bg-surface"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleExportCsv}
          className="text-xs font-medium border-border-subtle flex items-center gap-1.5 h-9 shrink-0"
        >
          <FileSpreadsheet className="size-3.5 text-brand" />
          Export Audit Logs (.csv)
        </Button>
      </div>

      {/* Logs Table */}
      <div className="rounded-md border border-border-subtle bg-bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-slate-50 dark:bg-slate-900/50 text-text-secondary font-medium">
                <th className="py-3 px-4 font-semibold">Session ID</th>
                <th className="py-3 px-4 font-semibold">Node & Endpoint</th>
                <th className="py-3 px-4 font-semibold">Dedicated Egress IP</th>
                <th className="py-3 px-4 font-semibold">Duration</th>
                <th className="py-3 px-4 font-semibold">Traffic (Sent / Rcvd)</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Connected At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    Loading session audit logs...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No VPN connection sessions found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isActive = log.status === "active";
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      {/* Session ID */}
                      <td className="py-3 px-4 font-mono font-medium text-text-primary">
                        {log.session_id}
                      </td>

                      {/* Node & Endpoint */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-text-primary">
                          {log.node_name}
                        </div>
                        <div className="text-[11px] font-mono text-text-muted truncate">
                          {log.server_endpoint}
                        </div>
                      </td>

                      {/* Dedicated IP */}
                      <td className="py-3 px-4 font-mono text-text-secondary">
                        {log.egress_ip}
                      </td>

                      {/* Duration */}
                      <td className="py-3 px-4 font-mono text-text-secondary flex items-center gap-1.5 pt-4">
                        <Clock className="size-3 text-text-muted" />
                        {formatDuration(log.duration_minutes)}
                      </td>

                      {/* Traffic */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <ArrowDownLeft className="size-3" />
                          <span>{formatBytes(log.bytes_received)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                          <ArrowUpRight className="size-3" />
                          <span>{formatBytes(log.bytes_sent)}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800"
                              : "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                          }`}
                        >
                          {isActive && (
                            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          <span className="capitalize">{log.status}</span>
                        </span>
                      </td>

                      {/* Connected At */}
                      <td className="py-3 px-4 text-text-muted text-[11px]">
                        {new Date(log.connected_at).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
