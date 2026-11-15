import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GUEST_CONTENT } from "@/config/guest-content";
import { cn } from "@/lib/utils";

export function ClosingCtaSection({ className }: { className?: string }) {
  const closing = GUEST_CONTENT.closingCta;

  return (
    <section
      aria-labelledby="cta-heading"
      className={cn("bg-background py-16 sm:py-24", className)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Card className="rounded-md border border-border bg-surface/50 shadow-none p-8 sm:p-12 lg:p-16 text-center">
          <CardContent className="p-0 max-w-2xl mx-auto space-y-6">
            <h2
              id="cta-heading"
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl lg:text-4xl"
            >
              {closing.title}
            </h2>

            <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
              {closing.description}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button size="lg" asChild className="h-11 px-8 w-full sm:w-auto">
                <Link href="/register">
                  {closing.ctaPrimary}
                  <ArrowRight className="ml-2 size-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="h-11 px-8 w-full sm:w-auto border-border"
              >
                <Link href="/login">{closing.ctaSecondary}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
