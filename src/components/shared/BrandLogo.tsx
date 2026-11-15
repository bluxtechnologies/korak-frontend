import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface BrandLogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  href?: string;
  variant?: "inline" | "full";
  priority?: boolean;
}

export function BrandLogoIcon({
  className,
  priority = false,
  alt = "Korak Digitals icon",
}: {
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden",
        className ?? "size-8"
      )}
    >
      <Image
        src="/logos/favicon-primary.png"
        alt={alt}
        width={48}
        height={32}
        priority={priority}
        className="h-full w-full object-contain dark:hidden"
      />
      <Image
        src="/logos/favicon-light.png"
        alt={alt}
        width={48}
        height={32}
        priority={priority}
        className="hidden h-full w-full object-contain dark:block"
      />
    </span>
  );
}

export function BrandLogoImage({
  className,
  priority = false,
  alt = "Korak Digitals",
}: {
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center",
        className ?? "aspect-[3/1] h-8 w-auto"
      )}
    >
      <Image
        src="/logos/logo-primary.png"
        alt={alt}
        width={216}
        height={72}
        priority={priority}
        className="h-full w-auto object-contain dark:hidden"
      />
      <Image
        src="/logos/logo-light.png"
        alt={alt}
        width={216}
        height={72}
        priority={priority}
        className="hidden h-full w-auto object-contain dark:block"
      />
    </span>
  );
}

export function BrandLogo({
  className,
  showWordmark = true,
  size = "md",
  href = "/",
  variant = "inline",
  priority = false,
}: BrandLogoProps) {
  const sizeClasses = {
    sm: "gap-2 text-base",
    md: "gap-2.5 text-lg",
    lg: "gap-3 text-xl",
    xl: "gap-3.5 text-2xl",
  };

  const iconSizes = {
    sm: "size-6",
    md: "size-8",
    lg: "size-10",
    xl: "size-12",
  };

  const fullLogoSizes = {
    sm: "h-6 w-auto",
    md: "h-8 w-auto",
    lg: "h-10 w-auto",
    xl: "h-12 w-auto",
  };

  const content =
    variant === "full" ? (
      <div className={cn("inline-flex items-center", className)}>
        <BrandLogoImage className={fullLogoSizes[size]} priority={priority} />
        <span className="sr-only">Korak Digitals</span>
      </div>
    ) : (
      <div
        className={cn("inline-flex items-center", sizeClasses[size], className)}
      >
        <BrandLogoIcon className={iconSizes[size]} priority={priority} />
        {showWordmark && (
          <span className="text-foreground font-semibold tracking-tight">
            Korak Digitals
          </span>
        )}
      </div>
    );

  if (!href) {
    return content;
  }

  return (
    <Link
      href={href}
      className="focus-visible:ring-ring inline-flex items-center rounded-md focus-visible:ring-1 focus-visible:outline-none"
      aria-label="Korak Digitals home"
    >
      {content}
    </Link>
  );
}
