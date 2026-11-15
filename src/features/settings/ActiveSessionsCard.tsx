"use client";

import * as React from "react";
import { toast } from "sonner";
import { Laptop, Smartphone, Tablet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { formatDate } from "@/lib/formatters";
import { revokeOtherSessions, type ActiveSession } from "./api";

export interface ActiveSessionsCardProps {
  sessions: ActiveSession[];
  onSessionsRevoked?: () => void;
  className?: string;
}

const DEVICE_ICONS = {
  desktop: Laptop,
  mobile: Smartphone,
  tablet: Tablet,
};

/**
 * ActiveSessionsCard (F13.3).
 * Lists active sessions and allows customers to sign out other devices,
 * with destructive confirmation per Doc 05 §4 & Doc 08 §3.
 */
export function ActiveSessionsCard({
  sessions: initialSessions,
  onSessionsRevoked,
  className,
}: ActiveSessionsCardProps) {
  const [revokedIds, setRevokedIds] = React.useState<string[]>([]);
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [isRevoking, setIsRevoking] = React.useState(false);

  const sessions = initialSessions.filter((s) => !revokedIds.includes(s.id));
  const otherSessionsCount = sessions.filter((s) => !s.is_current).length;

  const handleRevokeOthers = async () => {
    setIsRevoking(true);
    try {
      await revokeOtherSessions();
      toast.success("All other active sessions have been signed out.");
      setRevokedIds((prev) => [
        ...prev,
        ...initialSessions.filter((s) => !s.is_current).map((s) => s.id),
      ]);
      setIsConfirmOpen(false);
      onSessionsRevoked?.();
    } catch {
      toast.error("Failed to sign out other sessions. Please try again.");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <>
      <Card className={className} data-testid="active-sessions-card">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 space-y-2 sm:space-y-0 border-b border-border/60">
          <div>
            <CardTitle className="text-base font-semibold text-foreground">
              Active Sessions
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Devices currently signed in to your Korak Digitals account
            </CardDescription>
          </div>

          {otherSessionsCount > 0 && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
              className="text-destructive hover:bg-destructive-surface hover:text-destructive text-xs h-8"
              data-testid="revoke-others-button"
            >
              Sign out other sessions
            </Button>
          )}
        </CardHeader>

        <CardContent className="pt-4 divide-y divide-border/60">
          {sessions.map((session) => {
            const Icon = DEVICE_ICONS[session.device_type] ?? Laptop;

            return (
              <div
                key={session.id}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                data-testid={`session-item-${session.id}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-muted-foreground"
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-foreground">
                        {session.browser}
                      </p>
                      {session.is_current && (
                        <Badge variant="success">Current Session</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {session.ip_address}
                      {session.location ? ` • ${session.location}` : ""}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted-foreground block">
                    {session.is_current
                      ? "Active now"
                      : `Last active ${formatDate(session.last_active_at, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Destructive Confirm Dialog per F13 requirement */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Sign out other active sessions?"
        description="Are you sure you want to sign out all other devices? Any session on other phones, laptops, or browsers will be terminated immediately. You will remain signed in on this current browser."
        confirmText="Sign out other sessions"
        variant="destructive"
        isLoading={isRevoking}
        onConfirm={handleRevokeOthers}
      />
    </>
  );
}
