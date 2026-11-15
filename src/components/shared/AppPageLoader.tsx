"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { BrandPageLoader } from "@/components/shared/BrandPageLoader";
import { cn } from "@/lib/utils";

export interface AppPageLoaderProps {
  /** Minimum time in ms the loader stays visible on initial page load / reload */
  initialDurationMs?: number;
  /** Duration in ms for page transition navigation */
  transitionDurationMs?: number;
}

const emptySubscribe = () => () => {};

/**
 * Global application page loader overlay.
 * Displays the classic arranging 3D isometric cubes animation with 'Korak Digitals' wordmark
 * on initial page visit, page reload, and route transitions.
 */
export function AppPageLoader({
  initialDurationMs = 700,
  transitionDurationMs = 450,
}: AppPageLoaderProps) {
  const pathname = usePathname();
  const [visible, setVisible] = React.useState(true);
  const [fading, setFading] = React.useState(false);

  const mounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Initial page visit or reload: fade out after initial duration
  React.useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFading(true);
      const unmountTimer = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(unmountTimer);
    }, initialDurationMs);

    return () => clearTimeout(fadeTimer);
  }, [initialDurationMs]);

  // Route change navigation
  const prevPathRef = React.useRef(pathname);
  React.useEffect(() => {
    if (!mounted) return;

    if (prevPathRef.current !== pathname) {
      prevPathRef.current = pathname;
      setVisible(true);
      setFading(false);

      const fadeTimer = setTimeout(() => {
        setFading(true);
        const unmountTimer = setTimeout(() => {
          setVisible(false);
        }, 300);
        return () => clearTimeout(unmountTimer);
      }, transitionDurationMs);

      return () => clearTimeout(fadeTimer);
    }
  }, [pathname, mounted, transitionDurationMs]);

  if (!visible) return null;

  return (
    <div
      data-testid="app-page-loader"
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center bg-background transition-opacity duration-300 ease-out",
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
      aria-hidden={fading}
    >
      <BrandPageLoader size="fullscreen" message="Loading Korak Digitals…" />
    </div>
  );
}
