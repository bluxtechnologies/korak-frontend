"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/config/navigation";
import { AppShell, type AppShellProps } from "./AppShell";
import type { AuthUser } from "@/features/auth/api";
import { logout } from "@/features/auth/api";
import { NotificationBellDropdown } from "@/features/notifications";

// ---------------------------------------------------------------------------
// AuthUser Context
// ---------------------------------------------------------------------------
const AuthUserContext = React.createContext<AuthUser | null>(null);

/**
 * Hook to access the currently authenticated user in dashboard components.
 */
export function useAuthUser(): AuthUser {
  const user = React.useContext(AuthUserContext);
  if (!user) {
    throw new Error("useAuthUser must be used within a DashboardShell");
  }
  return user;
}

export interface DashboardShellProps
  extends Omit<AppShellProps, "onLogout" | "isLoggingOut" | "user"> {
  user: AuthUser;
}

/**
 * Dashboard Shell (F11.2 & F11.3).
 * Wraps AppShell with authenticated customer context and wired logout flow.
 */
export function DashboardShell({
  children,
  user,
  ...props
}: DashboardShellProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      toast.success("You have been signed out.");
    } catch {
      // Per Doc 04 §4: even if API fails, ensure client logout completes
      toast.info("Session ended.");
    } finally {
      router.push(ROUTES.LOGIN);
    }
  };

  return (
    <AuthUserContext.Provider value={user}>
      <AppShell
        user={user}
        onLogout={handleLogout}
        isLoggingOut={isLoggingOut}
        notificationsSlot={props.notificationsSlot ?? <NotificationBellDropdown />}
        {...props}
      >
        {children}
      </AppShell>
    </AuthUserContext.Provider>
  );
}
