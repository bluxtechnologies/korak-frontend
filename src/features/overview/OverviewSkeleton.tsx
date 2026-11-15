import * as React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function OverviewSkeleton() {
  return (
    <div className="space-y-6" data-testid="overview-loading-skeleton">
      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <div className="space-y-1">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="h-2.5 w-28" />
                </div>
              </div>
              <Skeleton className="h-6 w-6 rounded-md" />
            </CardHeader>
            <CardContent className="pt-2">
              <Skeleton className="h-7 w-32" />
              <Skeleton className="mt-2 h-3 w-40" />
            </CardContent>
            <CardFooter className="pt-2 border-t border-border/60">
              <Skeleton className="h-8 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between pb-4 space-y-0 border-b border-border/60">
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-7 w-16 rounded-md" />
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, row) => (
                <div key={row} className="flex items-center justify-between py-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
