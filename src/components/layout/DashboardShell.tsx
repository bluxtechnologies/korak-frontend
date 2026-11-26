"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { showToast } from "@/components/ui/sonner";
import { ROUTES } from "@/config/navigation";
import { AppShell, type AppShellProps } from "./AppShell";
import type { AuthUser } from "@/features/auth/api";
import { logout } from "@/features/auth/api";
import { NotificationBellDropdown } from "@/features/notifications";
import { WalletProvider, useWallet } from "@/features/wallet/context";
import type { Wallet } from "@/lib/api/types";

export { useWallet } from "@/features/wallet/context";

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
  initialWallet?: Wallet | null;
}

/**
 * Dashboard Shell (F11.2 & F11.3).
 * Wraps AppShell with authenticated customer context, live wallet context, and wired logout flow.
 */
export function DashboardShell({
  children,
  user,
  initialWallet,
  ...props
}: DashboardShellProps) {
  return (
    <AuthUserContext.Provider value={user}>
      <WalletProvider initialWallet={initialWallet}>
        <DashboardShellInner user={user} {...props}>
          {children}
        </DashboardShellInner>
      </WalletProvider>
    </AuthUserContext.Provider>
  );
}

function DashboardShellInner({
  children,
  user,
  ...props
}: DashboardShellProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const { balanceFormatted } = useWallet();

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    try {
      await logout();
      showToast.success(
        "Signed Out",
        "You have been successfully signed out of your account."
      );
    } catch {
      // Per Doc 04 §4: even if API fails, ensure client logout completes
      showToast.error(
        "Session Ended",
        "Your session has ended. Please sign in again to continue."
      );
    } finally {
      router.push(ROUTES.LOGIN);
    }
  };

  return (
    <AppShell
      user={user}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
      walletBalance={props.walletBalance ?? balanceFormatted}
      notificationsSlot={props.notificationsSlot ?? <NotificationBellDropdown />}
      {...props}
    >
      {children}
    </AppShell>
  );
}
