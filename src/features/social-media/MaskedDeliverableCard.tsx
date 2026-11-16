"use client";

import * as React from "react";
import {
  Eye,
  EyeOff,
  Copy,
  Check,
  ShieldCheck,
  KeyRound,
  Mail,
  User,
  AlertTriangle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { revealSocialCredentials } from "./api";
import type { CredentialRevealResult } from "./types";

export interface MaskedDeliverableCardProps {
  orderId: string;
  accountHandle: string;
  maskedLogin?: string;
  maskedRecovery?: string;
  onRevealed?: (credentials: CredentialRevealResult) => void;
  className?: string;
}

export function MaskedDeliverableCard({
  orderId,
  accountHandle,
  maskedLogin = "creator_••••••",
  maskedRecovery = "sec••••@gmail.com",
  onRevealed,
  className,
}: MaskedDeliverableCardProps) {
  const [credentials, setCredentials] =
    React.useState<CredentialRevealResult | null>(null);
  const [isRevealing, setIsRevealing] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  const handleConfirmReveal = async () => {
    setIsRevealing(true);
    try {
      const data = await revealSocialCredentials(orderId);
      setCredentials(data);
      onRevealed?.(data);
      toast.success("Credentials revealed. Security audit record created.");
      setConfirmOpen(false);
    } catch {
      toast.error("Failed to reveal credentials. Please verify your session.");
    } finally {
      setIsRevealing(false);
    }
  };

  const copyToClipboard = async (text: string, keyName: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopiedKey(keyName);
        toast.success(`${keyName} copied to clipboard!`);
        setTimeout(() => setCopiedKey(null), 2000);
      }
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <div
      className={`rounded-xl border border-border bg-card p-5 ${className ?? ""}`}
      data-testid="masked-deliverable-card"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Account Transfer Deliverables
            </h3>
            <Badge variant="outline" className="text-[11px]">
              @{accountHandle}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Encrypted credentials delivered for this order. Masked by default per Doc 08 & Doc 12.
          </p>
        </div>

        {!credentials ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            className="gap-1.5 text-xs font-semibold"
            data-testid="reveal-credentials-button"
          >
            <Eye className="size-3.5" />
            <span>Reveal Credentials</span>
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="success" className="text-[11px]">
              Audit Verified
            </Badge>
          </div>
        )}
      </div>

      {/* Credential Data Rows */}
      <div className="mt-4 space-y-3">
        {/* Username / Handle */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="size-3.5" />
            <span className="font-medium">Username</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-foreground">
              {credentials ? credentials.username : maskedLogin}
            </span>
            {credentials && (
              <button
                type="button"
                onClick={() => copyToClipboard(credentials.username, "Username")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy username"
              >
                {copiedKey === "Username" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Password */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <KeyRound className="size-3.5" />
            <span className="font-medium">Access Password</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-foreground">
              {credentials ? credentials.password : "••••••••••••••••"}
            </span>
            {credentials && (
              <button
                type="button"
                onClick={() => copyToClipboard(credentials.password, "Password")}
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy password"
              >
                {copiedKey === "Password" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Recovery Email */}
        <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-xs">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="size-3.5" />
            <span className="font-medium">Security Email</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-foreground">
              {credentials ? credentials.recovery_email : maskedRecovery}
            </span>
            {credentials && (
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(credentials.recovery_email, "Recovery Email")
                }
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy recovery email"
              >
                {copiedKey === "Recovery Email" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* 2FA Backup Key (if available) */}
        {credentials?.two_factor_backup_key && (
          <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/30 px-3.5 py-2.5 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              <span className="font-medium">2FA Recovery Key</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-foreground">
                {credentials.two_factor_backup_key}
              </span>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    credentials.two_factor_backup_key!,
                    "2FA Recovery Key"
                  )
                }
                className="text-muted-foreground hover:text-foreground"
                aria-label="Copy 2FA key"
              >
                {copiedKey === "2FA Recovery Key" ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Security Advisory / Audit Status */}
      {credentials ? (
        <div className="mt-4 rounded-lg border border-warning-border bg-warning-surface p-3 text-xs text-warning">
          <div className="flex items-start gap-2">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Urgent Security Recommendations:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li>Sign in immediately and change this master password.</li>
                <li>Link your own two-factor authentication authenticator app.</li>
                <li>Audit ID logged: <code className="font-mono">{credentials.audit_id}</code></li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Protected by audit log: Every reveal request is permanently time-stamped with your session IP and user account identifier.
        </p>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Reveal Account Access Credentials"
        description="Revealing these deliverables will log a permanent security audit record in your account history. Are you ready to inspect and transfer this account now?"
        confirmText="Confirm & Reveal"
        variant="default"
        isLoading={isRevealing}
        onConfirm={handleConfirmReveal}
      />
    </div>
  );
}
