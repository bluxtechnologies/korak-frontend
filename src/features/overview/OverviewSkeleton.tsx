import * as React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewSkeleton() {
  return (
    <div
      className="mx-auto max-w-7xl space-y-6 sm:space-y-8"
      data-testid="overview-loading-skeleton"
    >
      {/* 1. Welcome Greeting Skeleton */}
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full sm:size-12" />
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-44 sm:w-56" />
          <Skeleton className="h-3.5 w-60 sm:w-72" />
        </div>
      </div>

      {/* 2. Wallet & Support 2-Column Row Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-12">
        {/* Wallet Balance Card Skeleton */}
        <div className="lg:col-span-7 xl:col-span-8">
          <Card className="bg-muted/40 border-border/80 flex min-h-[220px] flex-col justify-between rounded-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32 rounded-md" />
              <Skeleton className="size-8 rounded-full" />
            </div>
            <div className="my-4 space-y-2">
              <Skeleton className="h-9 w-48 rounded-md" />
              <Skeleton className="h-3.5 w-36 rounded-md" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-28 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </Card>
        </div>

        {/* Support Card Skeleton */}
        <div className="lg:col-span-5 xl:col-span-4">
          <Card className="bg-card border-border/80 flex min-h-[140px] flex-col justify-between rounded-2xl p-5 sm:p-6 lg:min-h-[220px]">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-40" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Skeleton className="h-9 w-full rounded-full" />
              <Skeleton className="mx-auto h-4 w-20" />
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Popular Services Grid Skeleton */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-3.5 w-56" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="border-border/80 bg-card space-y-3 rounded-2xl p-4 sm:p-5"
            >
              <Skeleton className="size-9 rounded-xl sm:size-10" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-32" />
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Recent Transactions Card Skeleton */}
      <Card className="border-border/80 bg-card rounded-2xl p-0">
        <CardHeader className="border-border/60 flex flex-row items-center justify-between space-y-0 border-b px-5 py-4 sm:px-6">
          <div className="space-y-1">
            <Skeleton className="h-5 w-36" />
            <Skeleton className="h-3.5 w-48" />
          </div>
          <Skeleton className="h-6 w-16" />
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:p-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-3">
                <Skeleton className="size-8 rounded-full sm:size-10" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-28 sm:w-36" />
                  <Skeleton className="h-3 w-20 sm:w-24" />
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <Skeleton className="h-4 w-16 sm:w-20" />
                <Skeleton className="h-3 w-12 rounded-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
