import * as React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GUEST_CONTENT } from "@/config/guest-content";
import { cn } from "@/lib/utils";

export function HowItWorksSection({ className }: { className?: string }) {
  const howItWorks = GUEST_CONTENT.howItWorks;

  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className={cn(
        "border-b border-border bg-background py-16 sm:py-20",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-2 mb-12">
          <h2
            id="how-it-works-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {howItWorks.sectionTitle}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            {howItWorks.sectionDescription}
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {howItWorks.steps.map((step) => (
            <Card
              key={step.step}
              className="relative rounded-md border border-border bg-surface/40 shadow-none"
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="size-9 rounded-md border border-primary/30 bg-primary/10 text-primary font-semibold text-sm flex items-center justify-center">
                  0{step.step}
                </div>
                <CardTitle className="text-lg font-semibold text-foreground">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
