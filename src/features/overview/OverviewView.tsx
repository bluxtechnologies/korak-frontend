"use client";

import * as React from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { useAuthUser } from "@/components/layout/DashboardShell";
import { WalletSummaryCard } from "./WalletSummaryCard";
import { NeedHelpCard } from "./NeedHelpCard";
import { QuickServiceShortcuts } from "./QuickServiceShortcuts";
import { RecentOrdersCard } from "./RecentOrdersCard";
import { RecentTransactionsCard } from "./RecentTransactionsCard";
import { OverviewSkeleton } from "./OverviewSkeleton";
import { getOverviewData, type OverviewData, MOCK_OVERVIEW_DATA } from "./api";

export interface OverviewViewProps {
  /** Optional pre-fetched data from Server Component */
  initialData?: OverviewData | null;
  /** Whether to fallback to mock fixture on 404 / endpoint pending implementation */
  enableFallbackMock?: boolean;
}

/**
 * OverviewView (F12).
 * Implements the dashboard overview layout matching the legacy design reference:
 * personalized greeting, available balance card with watermark, need help card,
 * quick service shortcuts grid, and full-width recent transactions table.
 */
export function OverviewView({
  initialData,
  enableFallbackMock = true,
}: OverviewViewProps) {
  const [data, setData] = React.useState<OverviewData | null>(
    initialData ?? null
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(!initialData);
  const [error, setError] = React.useState<unknown | null>(null);
  const [isRetrying, setIsRetrying] = React.useState<boolean>(false);

  // Safely extract authenticated customer name for greeting banner
  let userFirstName = "there";
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const currentUser = useAuthUser();
    if (currentUser?.name) {
      userFirstName = currentUser.name.trim().split(/\s+/)[0];
    } else if (currentUser?.username) {
      userFirstName = currentUser.username;
    }
  } catch {
    userFirstName = "there";
  }

  // Time-aware greeting
  const [greeting, setGreeting] = React.useState("Good day");
  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good morning");
    } else if (hour < 18) {
      setGreeting("Good afternoon");
    } else {
      setGreeting("Good evening");
    }
  }, []);

  React.useEffect(() => {
    let ignore = false;

    if (!initialData) {
      getOverviewData()
        .then((response) => {
          if (!ignore) {
            setData(response);
            setIsLoading(false);
          }
        })
        .catch((err: unknown) => {
          if (!ignore) {
            // In development or when backend endpoint is not yet mounted,
            // allow fallback to mock fixture if requested
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

  return (
    <div className="space-y-8" data-testid="overview-view">
      {/* 1. Dynamic Greeting Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          <span>
            {greeting}, {userFirstName}
          </span>
          <span aria-hidden="true">👏</span>
        </h1>
        <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
          Your digital services, all in one place.
        </p>
      </div>

      {/* 2. Top 2-Column Hero Row matching legacy layout reference */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="lg:col-span-7 xl:col-span-8">
          <WalletSummaryCard wallet={data.wallet} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <NeedHelpCard />
        </div>
      </div>

      {/* 3. Quick Access Grid ("What do you need today?") */}
      <QuickServiceShortcuts />

      {/* 4. Full-Width Recent Transactions Table */}
      <RecentTransactionsCard transactions={data.recent_transactions} />

      {/* 5. Recent Orders Activity */}
      <RecentOrdersCard orders={data.recent_orders} />
    </div>
  );
}
