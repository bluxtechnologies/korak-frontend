"use client";

import * as React from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { useAuthUser } from "@/components/layout/DashboardShell";
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
    const currentUser = useAuthUser();
    if (currentUser?.name) {
      userFirstName = currentUser.name.trim().split(/\s+/)[0];
    } else if (currentUser?.username) {
      userFirstName = currentUser.username;
    }
  } catch {
    userFirstName = "there";
  }

  const greeting = getGreeting();

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
    <div
      className="mx-auto max-w-7xl space-y-6 sm:space-y-8"
      data-testid="overview-view"
    >
      {/* 1. Welcome Section */}
      <div className="flex items-center gap-3">
        <div className="border-border/60 flex size-11 shrink-0 items-center justify-center rounded-full border bg-gradient-to-br from-[#7A1F3D]/20 to-[#7A1F3D]/40 text-sm font-bold text-[#7A1F3D] shadow-2xs sm:size-12 sm:text-base dark:from-[#7A1F3D]/40 dark:to-[#7A1F3D]/60 dark:text-rose-200">
          {userFirstName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-foreground flex items-center gap-1.5 text-lg font-bold tracking-tight sm:text-xl">
            <span>
              {greeting}, {userFirstName}
            </span>
            <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Your digital services, all in one place.
          </p>
        </div>
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
