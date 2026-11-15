"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface BrandPageLoaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Size variant of the favicon loader */
  size?: "sm" | "md" | "lg" | "fullscreen";
  /** Optional loading message displayed underneath */
  message?: string;
  /** Whether to show the Korak Digitals wordmark underneath */
  showWordmark?: boolean;
}

/**
 * Brand Page Loader featuring the animated Korak Digitals favicon.
 * Animates with a gentle floating bounce and synchronous dynamic floor shadow,
 * supporting automatic dual-theme switching between light and dark modes.
 */
export function BrandPageLoader({
  size = "md",
  message = "Loading your workspace…",
  showWordmark = true,
  className,
  ...props
}: BrandPageLoaderProps) {
  const isFullscreen = size === "fullscreen";

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-[46px] h-[46px]",
    lg: "w-16 h-16",
    fullscreen: "w-[46px] h-[46px]",
  };

  const imageDimensions = {
    sm: { width: 32, height: 32 },
    md: { width: 46, height: 46 },
    lg: { width: 64, height: 64 },
    fullscreen: { width: 46, height: 46 },
  };

  const shadowSizes = {
    sm: "w-6 h-1",
    md: "w-9 h-1.5",
    lg: "w-12 h-2",
    fullscreen: "w-9 h-1.5",
  };

  const { width, height } = imageDimensions[size];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading Korak Digitals"
      className={cn(
        "flex flex-col items-center justify-center select-none",
        isFullscreen
          ? "fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
          : "py-10",
        className
      )}
      {...props}
    >
      {/* Floating Favicon & Synchronized Floor Shadow */}
      <div className="relative flex flex-col items-center justify-center">
        <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
          {/* Light Theme Favicon */}
          <Image
            src="/logos/favicon-primary.png"
            alt="Korak Digitals"
            width={width}
            height={height}
            priority
            className="loader-favicon h-full w-full object-contain dark:hidden"
          />
          {/* Dark Theme Favicon */}
          <Image
            src="/logos/favicon-light.png"
            alt="Korak Digitals"
            width={width}
            height={height}
            priority
            className="loader-favicon hidden h-full w-full object-contain dark:block"
          />
        </div>

        {/* Dynamic Floor Shadow */}
        <div
          aria-hidden="true"
          className={cn(
            "loader-shadow mt-3 rounded-full bg-primary/25 blur-[2px]",
            shadowSizes[size]
          )}
        />
      </div>

      {/* Brand Wordmark & Dynamic Status Message */}
      <div className="mt-5 space-y-1 text-center">
        {showWordmark && (
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-sm tracking-widest uppercase text-foreground">
              Korak Digitals
            </span>
          </div>
        )}
        {message && (
          <p className="text-muted-foreground text-xs font-medium tracking-wide">
            {message}
          </p>
        )}
      </div>

      {/* Keyframe Styles for Floating Bounce & Ground Shadow */}
      <style>{`
        @keyframes faviconFloat {
          0%, 100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-5px) scale(1.02);
          }
        }

        @keyframes shadowPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.35;
          }
          50% {
            transform: scale(0.7);
            opacity: 0.15;
          }
        }

        .loader-favicon {
          animation: faviconFloat 1.8s ease-in-out infinite;
          will-change: transform;
        }

        .loader-shadow {
          animation: shadowPulse 1.8s ease-in-out infinite;
          will-change: transform, opacity;
        }

        @media (prefers-reduced-motion: reduce) {
          .loader-favicon,
          .loader-shadow {
            animation: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
