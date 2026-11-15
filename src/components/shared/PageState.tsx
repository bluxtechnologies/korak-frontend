import * as React from "react";
import { PageLoadingState } from "./PageLoadingState";
import { EmptyState, type EmptyStateProps } from "./EmptyState";
import { ErrorState, type ErrorStateProps } from "./ErrorState";

export type PageStatus = "loading" | "error" | "empty" | "success";

export interface PageStateProps {
  /** The current lifecycle status of the page or section */
  status: PageStatus;
  /** Custom node to render when status is 'loading'. Defaults to <PageLoadingState /> */
  loadingFallback?: React.ReactNode;
  /** Custom node to render when status is 'error'. Overrides errorProps */
  errorFallback?: React.ReactNode;
  /** Props forwarded to <ErrorState /> when errorFallback is not provided */
  errorProps?: ErrorStateProps;
  /** Custom node to render when status is 'empty'. Overrides emptyProps */
  emptyFallback?: React.ReactNode;
  /** Props forwarded to <EmptyState /> when emptyFallback is not provided */
  emptyProps?: EmptyStateProps;
  /** Primary content rendered when status is 'success' */
  children: React.ReactNode;
}

/**
 * Page-level state container ensuring strict adherence to Doc 09 §8:
 * "Every data view handles four states: loading (skeleton), empty (explanation + next action), error (safe message + retry), success."
 */
export function PageState({
  status,
  loadingFallback,
  errorFallback,
  errorProps,
  emptyFallback,
  emptyProps,
  children,
}: PageStateProps) {
  if (status === "loading") {
    return <>{loadingFallback ?? <PageLoadingState />}</>;
  }

  if (status === "error") {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }
    return <ErrorState {...errorProps} />;
  }

  if (status === "empty") {
    if (emptyFallback) {
      return <>{emptyFallback}</>;
    }
    return (
      <EmptyState
        title={emptyProps?.title ?? "No records found"}
        description={
          emptyProps?.description ??
          "There are no items to display in this view."
        }
        {...emptyProps}
      />
    );
  }

  return <>{children}</>;
}
