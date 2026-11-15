import * as React from "react";
import { GuestNavbar } from "@/components/layout/GuestNavbar";
import { GuestFooter } from "@/components/layout/GuestFooter";

export default function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <GuestNavbar />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <GuestFooter />
    </div>
  );
}
