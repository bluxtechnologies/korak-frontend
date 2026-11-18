"use client";

import * as React from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { useAuthUser } from "@/components/layout/DashboardShell";
import { resolveRealName } from "@/features/auth/api";
import { customerApi } from "@/lib/api/customer";
import { WalletSummaryCard } from "./WalletSummaryCard";
import { NeedHelpCard } from "./NeedHelpCard";
import { QuickServiceShortcuts } from "./QuickServiceShortcuts";
import { RecentTransactionsCard } from "./RecentTransactionsCard";
import { OverviewSkeleton } from "./OverviewSkeleton";
import { getOverviewData, type OverviewData, MOCK_OVERVIEW_DATA } from "./api";

export interface OverviewViewProps {
  /** Optional pre-fetched data from Server Component */
  initialData?: OverviewData | null;
  /** Whether to fallback to mock fixture on 404 / endpoint pending implementation */
  enableFallbackMock?: boolean;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

/**
 * OverviewView (F12).
 * KORAK Customer Dashboard interface strictly maintaining the 4-part hierarchy:
 * 1. Welcome greeting ("Good morning, {name}" + "Your digital services, all in one place.")
 * 2. Wallet balance (larger column) & Support (smaller column) 2-column section
 * 3. Popular services (4-column grid on desktop, 2-column on mobile)
 * 4. Recent transactions (~4 recent transactions in minimal table / responsive list)
 *
 * Design system rules (Doc 05):
 * - 10px radius (rounded-md), no pill shapes.
 * - Semantic tokens only (no raw colors or gradients).
 * - Thin 1px neutral borders, no heavy shadows.
 */
export function OverviewView({
  initialData,
  enableFallbackMock = false,
}: OverviewViewProps) {
  const [data, setData] = React.useState<OverviewData | null>(
    initialData ?? null
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(!initialData);
  const [error, setError] = React.useState<unknown | null>(null);
  const [isRetrying, setIsRetrying] = React.useState<boolean>(false);

  // Safely extract authenticated customer name for greeting banner, strictly prioritizing real user name over username
  let initialCustomerName = "";
  let currentUsername = "";
  try {
    const currentUser = useAuthUser();
    currentUsername = currentUser?.username?.trim() || "";
    const resolved = resolveRealName(currentUser);
    if (resolved && (!currentUsername || resolved.toLowerCase() !== currentUsername.toLowerCase())) {
      initialCustomerName = resolved;
    }
  } catch {
    initialCustomerName = "";
  }

  const [customerName, setCustomerName] = React.useState<string>(() => {
    if (initialCustomerName) return initialCustomerName;
    if (initialData?.user) {
      const resolved = resolveRealName(initialData.user);
      if (resolved && (!initialData.user.username || resolved.toLowerCase() !== initialData.user.username.toLowerCase())) {
        return resolved;
      }
    }
    return "";
  });

  const greeting = getGreeting();

  // 1. Fetch overview aggregated data
  React.useEffect(() => {
    let ignore = false;

    if (!initialData) {
      getOverviewData()
        .then((response) => {
          if (!ignore && response) {
            setData(response);
            if (response.user) {
              const resolved = resolveRealName(response.user);
              if (resolved && (!response.user.username || resolved.toLowerCase() !== response.user.username.toLowerCase())) {
                setCustomerName(resolved);
              }
            }
            setIsLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            if (
              enableFallbackMock &&
              (process.env.NODE_ENV !== "production" ||
                (err as { status?: number })?.status === 404)
            ) {
              setData(MOCK_OVERVIEW_DATA);
            } else {
              setError(err);
            }
            setIsLoading(false);
          }
        });
    }

    return () => {
      ignore = true;
    };
  }, [initialData, enableFallbackMock]);

  // 2. Dynamically fetch profile if real customer name (first/last/full name) is not yet resolved
  React.useEffect(() => {
    let ignore = false;

    if (!initialCustomerName || (currentUsername && initialCustomerName.toLowerCase() === currentUsername.toLowerCase())) {
      customerApi
        .getProfile()
        .then((profile) => {
          if (!ignore && profile) {
            const resolved = resolveRealName(profile);
            if (resolved && (!profile.username || resolved.toLowerCase() !== profile.username.toLowerCase())) {
              setCustomerName(resolved);
            }
          }
        })
        .catch(() => {
          // Non-blocking: fail gracefully if offline or unauthenticated
        });
    }

    return () => {
      ignore = true;
    };
  }, [initialCustomerName, currentUsername]);

  const handleRetry = () => {
    setIsRetrying(true);
    setIsLoading(true);
    setError(null);

    getOverviewData()
      .then((response) => {
        setData(response);
      })
      .catch((err: unknown) => {
        if (
          enableFallbackMock &&
          (process.env.NODE_ENV !== "production" ||
            (err as { status?: number })?.status === 404)
        ) {
          setData(MOCK_OVERVIEW_DATA);
        } else {
          setError(err);
        }
      })
      .finally(() => {
        setIsLoading(false);
        setIsRetrying(false);
      });
  };

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  if (error && !data) {
    return (
      <ErrorState
        title="Unable to load account overview"
        message={getSafeErrorMessage(
          error,
          "Failed to load your wallet balance and recent activity. Please try again."
        )}
        onRetry={handleRetry}
        isRetrying={isRetrying}
        className="my-8"
      />
    );
  }

  if (!data) {
    return null;
  }

  const displayName = customerName.trim() || "there";

  return (
    <div
      className="mx-auto max-w-7xl space-y-6 sm:space-y-8"
      data-testid="overview-view"
    >
      {/* 1. Welcome Section */}
      <div className="space-y-1">
        <h1 className="text-foreground flex items-center gap-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          <span>
            {greeting}, {displayName}
          </span>
          <span aria-hidden="true">👋</span>
        </h1>
        <p className="text-muted-foreground text-sm">
          Your digital services, all in one place.
        </p>
      </div>

      {/* 2. Wallet & Support Section (2-Column Grid on Desktop, Stacked on Mobile) */}
      <div className="grid grid-cols-1 items-stretch gap-4 sm:gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <WalletSummaryCard wallet={data.wallet} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <NeedHelpCard />
        </div>
      </div>

      {/* 3. Popular Services Grid */}
      <QuickServiceShortcuts />

      {/* 4. Recent Transactions Section (~4 records) */}
      <RecentTransactionsCard transactions={data.recent_transactions} />
    </div>
  );
}
