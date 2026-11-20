"use client";

import * as React from "react";
import { User, Shield, Laptop } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "motion/react";
import { MOTION_VARIANTS } from "@/lib/motion";
import { ProfileEditForm } from "./ProfileEditForm";
import { ChangePasswordForm } from "./ChangePasswordForm";
import { ActiveSessionsCard } from "./ActiveSessionsCard";
import { TrustedDevicesCard } from "./TrustedDevicesCard";
import { SecurityActivityCard } from "./SecurityActivityCard";
import { DeviceVerificationCard } from "./DeviceVerificationCard";
import {
  getProfile,
  getActiveSessions,
  getTrustedDevices,
  getSecurityActivity,
  type UserProfile,
  type ActiveSession,
  type TrustedDevice,
  type SecurityActivity,
  MOCK_PROFILE,
  MOCK_SESSIONS,
  MOCK_TRUSTED_DEVICES,
  MOCK_SECURITY_ACTIVITY,
} from "./api";

export type SettingsTab = "profile" | "security" | "sessions";

export interface SettingsViewProps {
  defaultTab?: SettingsTab;
  initialProfile?: UserProfile;
  initialSessions?: ActiveSession[];
  initialDevices?: TrustedDevice[];
  initialActivities?: SecurityActivity[];
  className?: string;
}

interface TabItem {
  id: SettingsTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const TABS: TabItem[] = [
  { id: "profile", label: "General Profile", icon: User },
  { id: "security", label: "Password & Security", icon: Shield },
  { id: "sessions", label: "Sessions & Devices", icon: Laptop },
];

/**
 * SettingsView (F13).
 * Centralized settings and security management view with accessible tabs
 * covering Profile (F13.1), Password (F13.2), Sessions (F13.3), Devices (F13.4),
 * and Security Activity (F13.5).
 */
export function SettingsView({
  defaultTab = "profile",
  initialProfile,
  initialSessions,
  initialDevices,
  initialActivities,
  className,
}: SettingsViewProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>(defaultTab);

  const [profile, setProfile] = React.useState<UserProfile | null>(
    initialProfile ?? null
  );
  const [sessions, setSessions] = React.useState<ActiveSession[] | null>(
    initialSessions ?? null
  );
  const [devices, setDevices] = React.useState<TrustedDevice[] | null>(
    initialDevices ?? null
  );
  const [activities, setActivities] = React.useState<SecurityActivity[] | null>(
    initialActivities ?? null
  );
  const [isLoading, setIsLoading] = React.useState(!initialProfile);

  React.useEffect(() => {
    let ignore = false;

    if (!initialProfile) {
      Promise.allSettled([
        getProfile(),
        getActiveSessions(),
        getTrustedDevices(),
        getSecurityActivity(),
      ]).then(([profRes, sessRes, devRes, actRes]) => {
        if (ignore) return;

        if (profRes.status === "fulfilled") {
          setProfile(profRes.value);
        }
        setSessions(sessRes.status === "fulfilled" ? sessRes.value : []);
        setDevices(devRes.status === "fulfilled" ? devRes.value : []);
        setActivities(actRes.status === "fulfilled" ? actRes.value : []);
        setIsLoading(false);
      });
    }

    return () => {
      ignore = true;
    };
  }, [initialProfile]);

  return (
    <div className={cn("space-y-6", className)} data-testid="settings-view">
      {/* Tab Navigation Navigation Controls with Spring Sliding Pill Indicator */}
      <div
        role="tablist"
        aria-label="Settings sections"
        className="flex flex-wrap gap-1 p-1 border border-border bg-surface rounded-md max-w-fit"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={isSelected}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                isSelected
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isSelected && (
                <motion.span
                  layoutId="settingsActiveTabPill"
                  className="absolute inset-0 rounded-md bg-card border border-border/80 shadow-xs"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                />
              )}
              <Icon className="h-3.5 w-3.5 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-4" data-testid="settings-loading-skeleton">
          <Skeleton className="h-64 w-full rounded-md" />
        </div>
      )}

      {/* Tab Panels */}
      {!isLoading && (
        <div className="space-y-6">
          {/* Profile Tab Panel (F13.1) */}
          <div
            role="tabpanel"
            id="panel-profile"
            aria-labelledby="tab-profile"
            hidden={activeTab !== "profile"}
          >
            {activeTab === "profile" && profile && (
              <ProfileEditForm
                profile={profile}
                onProfileUpdated={(updated) => setProfile(updated)}
              />
            )}
          </div>

          {/* Security Tab Panel (F13.2 & F13.5) */}
          <div
            role="tabpanel"
            id="panel-security"
            aria-labelledby="tab-security"
            hidden={activeTab !== "security"}
          >
            {activeTab === "security" && (
              <div className="space-y-6">
                <DeviceVerificationCard
                  enabled={profile?.device_verification_enabled ?? false}
                  onStatusChanged={(newVal) => {
                    if (profile) {
                      setProfile({
                        ...profile,
                        device_verification_enabled: newVal,
                      });
                    }
                  }}
                />
                <ChangePasswordForm />
                {activities && (
                  <SecurityActivityCard activities={activities} />
                )}
              </div>
            )}
          </div>

          {/* Sessions & Devices Tab Panel (F13.3 & F13.4) */}
          <div
            role="tabpanel"
            id="panel-sessions"
            aria-labelledby="tab-sessions"
            hidden={activeTab !== "sessions"}
          >
            {activeTab === "sessions" && (
              <div className="space-y-6">
                {sessions && <ActiveSessionsCard sessions={sessions} />}
                {devices && <TrustedDevicesCard devices={devices} />}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
