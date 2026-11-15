import * as React from "react";
import Image from "next/image";
import fs from "fs";
import path from "path";
import { Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GuestPhotoSlotProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  aspectRatio?: string;
  priority?: boolean;
  slotName: string;
  pixelSize: string;
  subject: string;
  className?: string;
}

export function GuestPhotoSlot({
  src,
  alt,
  width,
  height,
  aspectRatio = "16/10",
  priority = false,
  slotName,
  pixelSize,
  subject,
  className,
}: GuestPhotoSlotProps) {
  // Check if file exists under public/ directory
  let fileExists = false;
  try {
    const cleanSrc = src.startsWith("/") ? src.slice(1) : src;
    const absolutePath = path.join(process.cwd(), "public", cleanSrc);
    fileExists = fs.existsSync(absolutePath);
  } catch {
    fileExists = false;
  }

  if (fileExists) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-md border border-border bg-muted/10",
          className
        )}
        style={{ aspectRatio }}
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          className="h-full w-full object-cover rounded-md"
        />
      </div>
    );
  }

  // Neutral bordered placeholder block until Collins supplies the file
  return (
    <div
      role="img"
      aria-label={`${alt} (Placeholder)`}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-md border border-border bg-muted/20 p-8 text-center text-muted-foreground",
        className
      )}
      style={{ aspectRatio }}
      data-testid="guest-photo-placeholder"
    >
      <div className="flex flex-col items-center gap-2.5 max-w-sm">
        <div className="size-11 rounded-md border border-border bg-background flex items-center justify-center text-muted-foreground shadow-none">
          <ImageIcon className="size-5" aria-hidden="true" />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
            {slotName}
          </p>
          <p className="text-xs text-muted-foreground">
            {pixelSize} · Aspect Ratio {aspectRatio}
          </p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed mt-1">
            {subject}
          </p>
        </div>
        <span className="inline-flex items-center text-[11px] font-medium text-primary border border-primary/20 bg-primary/5 px-2.5 py-0.5 rounded-md mt-1">
          Photo Slot: public/{src.startsWith("/") ? src.slice(1) : src}
        </span>
      </div>
    </div>
  );
}
