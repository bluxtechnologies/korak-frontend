import * as React from "react";
import {
  Phone,
  Wifi,
  Shield,
  Users,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GUEST_CONTENT } from "@/config/guest-content";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  Phone,
  Wifi,
  Shield,
  Users,
  TrendingUp,
};

export function ServicesSection({ className }: { className?: string }) {
  const services = GUEST_CONTENT.services;

  return (
    <section
      id="services"
      aria-labelledby="services-heading"
      className={cn(
        "border-b border-border bg-background py-16 sm:py-20",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-2 mb-12">
          <h2
            id="services-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {services.sectionTitle}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            {services.sectionDescription}
          </p>
        </div>

        {/* 5 Service Cards Grid: 3 top row, 2 centered bottom row on desktop */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.items.slice(0, 3).map((item) => {
            const Icon = ICON_MAP[item.iconName] ?? Shield;
            return (
              <Card
                key={item.id}
                className="rounded-md border border-border bg-surface/50 shadow-none hover:border-primary/40 transition-colors"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="size-10 rounded-md border border-border bg-background flex items-center justify-center text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Second row: 2 cards centered */}
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:mx-auto lg:max-w-4xl">
          {services.items.slice(3).map((item) => {
            const Icon = ICON_MAP[item.iconName] ?? Shield;
            return (
              <Card
                key={item.id}
                className="rounded-md border border-border bg-surface/50 shadow-none hover:border-primary/40 transition-colors"
              >
                <CardHeader className="space-y-3 pb-3">
                  <div className="size-10 rounded-md border border-border bg-background flex items-center justify-center text-primary">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
