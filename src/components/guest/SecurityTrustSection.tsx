import * as React from "react";
import { ShieldCheck, KeyRound, EyeOff, type LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { GUEST_CONTENT } from "@/config/guest-content";
import { cn } from "@/lib/utils";

const SECURITY_ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck,
  KeyRound,
  EyeOff,
};

export function SecurityTrustSection({ className }: { className?: string }) {
  const security = GUEST_CONTENT.security;

  return (
    <section
      id="security"
      aria-labelledby="security-heading"
      className={cn(
        "border-b border-border bg-background py-16 sm:py-20",
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl text-left space-y-2 mb-12">
          <h2
            id="security-heading"
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            {security.sectionTitle}
          </h2>
          <p className="text-sm text-muted-foreground sm:text-base leading-relaxed">
            {security.sectionDescription}
          </p>
        </div>

        {/* 3 Security Protections Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {security.items.map((item) => {
            const Icon = SECURITY_ICON_MAP[item.iconName] ?? ShieldCheck;
            return (
              <Card
                key={item.id}
                className="rounded-md border border-border bg-surface/40 shadow-none hover:border-primary/40 transition-colors"
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
