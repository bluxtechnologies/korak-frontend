import type { Metadata } from "next";
import { BrandLogoIcon } from "@/components/shared/BrandLogo";
import { AuthHeroShowcase } from "@/components/layout/AuthHeroShowcase";
import Link from "next/link";

export const metadata: Metadata = {
  title: {
    template: "%s — Korak Digitals",
    default: "Korak Digitals",
  },
  description: "Sign in to manage your Korak Digitals account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Left column: Brand Hero Showcase (Desktop only) */}
        <section
          aria-label="Platform overview"
          className="bg-muted/40 border-border/80 relative hidden flex-col justify-between border-r p-10 lg:flex xl:p-14"
        >
          <AuthHeroShowcase />
        </section>

        {/* Right column: Form container */}
        <main className="flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16">
          {/* Centered card container (420px) */}
          <div className="mx-auto my-auto w-full max-w-[420px] space-y-6">
            {/* Brand Logo Header (centered above the form) */}
            <div className="text-center">
              <Link
                href="/"
                className="focus-visible:ring-ring inline-block rounded-md focus-visible:ring-1 focus-visible:outline-none"
                aria-label="Korak Digitals home"
              >
                <div className="flex flex-col items-center gap-2">
                  <BrandLogoIcon className="size-11" />
                  <span className="sr-only">Korak Digitals</span>
                </div>
              </Link>
            </div>

            {/* Form Content */}
            <div>{children}</div>
          </div>

          {/* Footer note */}
          <p className="text-muted-foreground mt-8 text-center text-xs">
            &copy; 2026 Korak Digitals. All rights reserved.
          </p>
        </main>
      </div>
    </div>
  );
}
