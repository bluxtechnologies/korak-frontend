import type { Metadata } from "next";
import Link from "next/link";
import {
  Smartphone,
  Wifi,
  Hash,
  Shield,
  Users,
  Sparkles,
  Wallet,
  Package,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ROUTES, getBreadcrumbs } from "@/config/navigation";

export const metadata: Metadata = {
  title: "All Digital Services | Korak Digitals",
  description:
    "Explore the full catalog of Korak Digitals telecom, numbers, VPN, and social marketplace services.",
};

interface ServiceCatalogItem {
  id: string;
  title: string;
  category: string;
  description: string;
  href: string;
  icon: typeof Smartphone;
  badgeText?: string;
}

const ALL_SERVICES: ServiceCatalogItem[] = [
  {
    id: "airtime",
    title: "Airtime Recharge",
    category: "Telecom VTU",
    description: "Instant automated airtime top-up for MTN, Airtel, Glo, and 9mobile with up to 3% cashback.",
    href: ROUTES.AIRTIME,
    icon: Smartphone,
    badgeText: "Instant",
  },
  {
    id: "data",
    title: "Data Bundles",
    category: "Telecom SME",
    description: "Affordable SME, corporate gifting, and direct data bundles with instant SIM loading.",
    href: ROUTES.DATA,
    icon: Wifi,
    badgeText: "Best Value",
  },
  {
    id: "numbers",
    title: "Virtual Numbers & OTP",
    category: "Verification",
    description: "One-time SMS activation numbers and long-term rental lines for WhatsApp, Telegram, and Google.",
    href: ROUTES.NUMBERS,
    icon: Hash,
    badgeText: "Automated",
  },
  {
    id: "vpn",
    title: "WireGuard & OpenVPN",
    category: "Privacy & Tunnel",
    description: "Encrypted, dedicated egress gateways with WireGuard config files and QR mobile setup.",
    href: ROUTES.VPN,
    icon: Shield,
    badgeText: "Dedicated",
  },
  {
    id: "social-buy",
    title: "Buy Verified Accounts",
    category: "Social Marketplace",
    description: "Acquire organic, aged creator accounts on Instagram, X, TikTok, and YouTube with audited credential transfer.",
    href: ROUTES.SOCIAL_MEDIA_BUY,
    icon: Users,
    badgeText: "Escrow Protected",
  },
  {
    id: "social-boost",
    title: "Social Growth & Boosting",
    category: "Social Engagement",
    description: "High-retention followers, post likes, video views, and impressions with gradual drip-feed options.",
    href: ROUTES.SOCIAL_MEDIA_BOOST,
    icon: Sparkles,
    badgeText: "High Retention",
  },
  {
    id: "wallet",
    title: "Wallet Management",
    category: "Fintech",
    description: "View real-time balance, statement ledgers, currency conversions, and automated audit trails.",
    href: ROUTES.WALLET,
    icon: Wallet,
  },
  {
    id: "orders",
    title: "Orders & Receipts",
    category: "History",
    description: "Access official digital receipts, delivered verification codes, and unmasked credentials.",
    href: ROUTES.ORDERS,
    icon: Package,
  },
];

export default function ServicesCatalogPage() {
  const breadcrumbs = getBreadcrumbs(ROUTES.SERVICES);

  return (
    <PageContainer>
      <PageHeader
        title="Services Catalog"
        description="Comprehensive directory of telecom, privacy, verification, and digital social services."
        breadcrumbs={breadcrumbs}
      />

      <div className="mt-6 space-y-6">
        {/* Trust Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="size-5 text-primary" />
            <div>
              <h3 className="text-xs font-bold text-foreground">
                Automated Infrastructure & Escrow Protection
              </h3>
              <p className="text-[11px] text-muted-foreground">
                All transactions are processed through authenticated APIs with instant wallet debits and automatic refunds on provider timeout.
              </p>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ALL_SERVICES.map((srv) => {
            const Icon = srv.icon;
            return (
              <Link
                key={srv.id}
                href={srv.href}
                className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:bg-muted/10"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-muted/30 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-4" />
                    </div>
                    {srv.badgeText && (
                      <Badge variant="outline" className="text-[11px]">
                        {srv.badgeText}
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-primary">
                      {srv.category}
                    </span>
                    <h4 className="mt-0.5 text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                      {srv.title}
                    </h4>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed line-clamp-2">
                      {srv.description}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-primary border-t border-border/40 pt-3">
                  <span>Open Service</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </PageContainer>
  );
}
