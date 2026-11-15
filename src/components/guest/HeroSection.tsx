import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestPhotoSlot } from "@/components/shared/GuestPhotoSlot";
import { GUEST_CONTENT } from "@/config/guest-content";
import { cn } from "@/lib/utils";

export function HeroSection({ className }: { className?: string }) {
  const hero = GUEST_CONTENT.hero;

  return (
    <section
      aria-labelledby="hero-heading"
      className={cn(
        "relative overflow-hidden border-b border-border bg-background py-16 sm:py-24 lg:py-28",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Heading, Support Line, Buttons */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <h1
              id="hero-heading"
              className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl lg:leading-[1.15]"
            >
              {hero.h1}
            </h1>

            <p className="text-base text-muted-foreground sm:text-lg leading-relaxed">
              {hero.support}
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button size="lg" asChild className="h-11 px-6">
                <Link href="/register">
                  {hero.ctaPrimary}
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-11 px-6 border-border"
              >
                <Link href="/login">{hero.ctaSecondary}</Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Hero Photo Slot */}
          <div className="lg:col-span-6">
            <GuestPhotoSlot
              src={`/images/guest/${hero.photoSlot.fileName}`}
              alt={hero.photoSlot.altText}
              width={1280}
              height={800}
              aspectRatio={hero.photoSlot.aspectRatio.replace(":", "/")}
              priority={true}
              slotName="Hero Photo Slot"
              pixelSize={hero.photoSlot.pixelSize}
              subject={hero.photoSlot.subject}
              className="w-full shadow-none"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
