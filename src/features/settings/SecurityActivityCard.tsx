"use client";

import * as React from "react";
import { History, ShieldCheck, ShieldAlert, KeyRound, Smartphone } from "lucide-react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/formatters";
import type { SecurityActivity } from "./api";

export interface SecurityActivityCardProps {
  activities: SecurityActivity[];
  className?: string;
}

const EVENT_ICONS: Record<
  SecurityActivity["event"],
  React.ComponentType<{ className?: string }>
> = {
  login_success: ShieldCheck,
  login_failed: ShieldAlert,
  password_changed: KeyRound,
  device_verified: Smartphone,
  session_revoked: ShieldAlert,
  device_revoked: ShieldAlert,
};

const STATUS_BADGE_VARIANTS: Record<
  SecurityActivity["status"],
  BadgeProps["variant"]
> = {
  success: "success",
  warning: "warning",
  info: "info",
};

/**
 * SecurityActivityCard (F13.5).
 * Audit trail of authentication events and account security modifications
 * per Doc 08 §3 & Doc 12 audit logging principles.
 */
export function SecurityActivityCard({
  activities,
  className,
}: SecurityActivityCardProps) {
  return (
    <Card className={className} data-testid="security-activity-card">
      <CardHeader className="pb-4 border-b border-border/60">
        <CardTitle className="text-base font-semibold text-foreground">
          Recent Security Activity
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground mt-0.5">
          Audit history of logins, password updates, and device verifications
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {activities.length === 0 ? (
          <EmptyState
            icon={History}
            title="No recent security activity"
            description="Your security activity log is currently clear. Key events like logins and password updates will be logged here."
            bordered={false}
            className="py-10"
          />
        ) : (
          <div className="divide-y divide-border/60">
            {activities.map((activity) => {
              const Icon = EVENT_ICONS[activity.event] ?? ShieldCheck;
              const badgeVariant =
                STATUS_BADGE_VARIANTS[activity.status] ?? "secondary";

              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-3.5 first:pt-4"
                  data-testid={`activity-item-${activity.id}`}
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
                          {activity.description}
                        </p>
                        <Badge variant={badgeVariant} className="capitalize">
                          {activity.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {activity.ip_address}
                        {activity.user_agent ? ` • ${activity.user_agent}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">
                      {formatDate(activity.created_at, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
