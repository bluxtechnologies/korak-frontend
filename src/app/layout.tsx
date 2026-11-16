import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "@/components/shared/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { SessionEventListener } from "@/features/auth/SessionEventListener";
import { AppPageLoader } from "@/components/shared/AppPageLoader";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    template: "%s — Korak Digitals",
    default: "Korak Digitals — Digital Services & Marketplace",
  },
  description:
    "Customer marketplace for mobile airtime, data bundles, secure VPN bandwidth, and social media account services.",
  icons: {
    icon: [
      {
        url: "/logos/favicon-primary.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logos/favicon-light.png",
        media: "(prefers-color-scheme: dark)",
      },
    ],
    shortcut: "/logos/favicon-primary.png",
    apple: "/logos/favicon-primary.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="flex min-h-full flex-col font-sans"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AppPageLoader />
          <SessionEventListener />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
