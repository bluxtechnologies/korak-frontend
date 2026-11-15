"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AlertLevel = "info" | "warning" | "destructive";

export interface DashboardAlertBannerProps {
  level?: AlertLevel;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const LEVEL_ICONS = {
  info: Info,
  warning: AlertTriangle,
  destructive: AlertCircle,
};

/**
 * DashboardAlertBanner (F14.4).
 * Persistent or dismissible condition banner for account states
 * (e.g. unverified email, password expiry) per docs/11-notification-system.md §3.
 */
export function DashboardAlertBanner({
  level = "warning",
  title,
  description,
  action,
  dismissible = false,
  onDismiss,
  className,
}: DashboardAlertBannerProps) {
  const [isDismissed, setIsDismissed] = React.useState(false);

  if (isDismissed) {
    return null;
  }

  const Icon = LEVEL_ICONS[level] ?? AlertTriangle;

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Alert
      variant={level}
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-none",
        className
      )}
      data-testid="dashboard-alert-banner"
    >
      <div className="flex items-start gap-3">
        <Icon className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-0.5">
          <AlertTitle className="text-xs font-semibold">{title}</AlertTitle>
          <AlertDescription className="text-xs opacity-90 leading-relaxed">
            {description}
          </AlertDescription>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
        {action && (
          action.href ? (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="h-7 text-xs px-2.5 font-medium"
            >
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="h-7 text-xs px-2.5 font-medium"
            >
              {action.label}
            </Button>
          )
        )}

        {dismissible && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            aria-label="Dismiss alert"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </Alert>
  );
}
