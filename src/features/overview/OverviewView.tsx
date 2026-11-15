"use client";

import * as React from "react";
import { ErrorState } from "@/components/shared/ErrorState";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { SummaryCards } from "./SummaryCards";
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
 * Handles the complete lifecycle of the Account Overview page:
 * loading, error (with retry), empty, and populated states.
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
            // In development or when backend endpoint is not yet mounted (Roadmap B13/B17.6),
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
    <div className="space-y-6" data-testid="overview-view">
      {/* 1. Summary Cards Grid (F12.1 & F12.2) */}
      <SummaryCards wallet={data.wallet} metrics={data.metrics} />

      {/* 2. Recent Activity Grids (F12.3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentOrdersCard orders={data.recent_orders} />
        <RecentTransactionsCard transactions={data.recent_transactions} />
      </div>
    </div>
  );
}
