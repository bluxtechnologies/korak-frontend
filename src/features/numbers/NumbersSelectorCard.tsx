"use client";

import * as React from "react";
import {
  Search,
  Check,
  ChevronDown,
  Globe,
  ShieldCheck,
  Sparkles,
  Wallet,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formatters";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  PLATFORMS,
  orderOtpNumber,
  rentNumber,
  type NumberCountry,
  type VerificationPlatform,
  type ActiveOtpOrder,
  type RentalNumberRecord,
} from "./api";

export interface NumbersSelectorCardProps {
  mode: "otp" | "rental";
  walletBalance?: number; // minor units (e.g. 500000 = ₦5,000.00)
  onOtpOrderCreated?: (order: ActiveOtpOrder) => void;
  onRentalCreated?: (rental: RentalNumberRecord) => void;
  className?: string;
}

const RENTAL_DURATIONS = [
  { days: 1, label: "1 Day", multiplier: 1, discountLabel: "Standard" },
  { days: 3, label: "3 Days", multiplier: 2.7, discountLabel: "10% Off" },
  { days: 7, label: "7 Days", multiplier: 5.6, discountLabel: "20% Off" },
  { days: 30, label: "30 Days", multiplier: 18, discountLabel: "40% Off" },
];

export function NumbersSelectorCard({
  mode,
  walletBalance = 500000,
  onOtpOrderCreated,
  onRentalCreated,
  className,
}: NumbersSelectorCardProps) {
  const [selectedCountryId, setSelectedCountryId] = React.useState<string>("us");
  const [selectedPlatformId, setSelectedPlatformId] = React.useState<string>("whatsapp");
  const [rentalDays, setRentalDays] = React.useState<number>(7);
  const [autoRenew, setAutoRenew] = React.useState<boolean>(false);
  const [platformQuery, setPlatformQuery] = React.useState<string>("");
  const [countryQuery, setCountryQuery] = React.useState<string>("");
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = React.useState<boolean>(false);

  // Modal & PIN state
  const [isConfirmOpen, setIsConfirmOpen] = React.useState<boolean>(false);
  const [pin, setPin] = React.useState<string>("1234");
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  const selectedCountry = COUNTRIES.find((c) => c.id === selectedCountryId) || COUNTRIES[0];
  const selectedPlatform = PLATFORMS.find((p) => p.id === selectedPlatformId) || PLATFORMS[0];

  // Pricing calculations
  const basePrice = selectedPlatform.price; // in Naira
  const durationMultiplier = RENTAL_DURATIONS.find((d) => d.days === rentalDays)?.multiplier || 1;
  const totalPriceNaira = mode === "otp" ? basePrice : Math.round(basePrice * durationMultiplier);
  const totalPriceMinor = totalPriceNaira * 100;
  const isBalanceSufficient = walletBalance >= totalPriceMinor;

  // Filtered platforms
  const filteredPlatforms = React.useMemo(() => {
    if (!platformQuery.trim()) return PLATFORMS;
    const q = platformQuery.toLowerCase();
    return PLATFORMS.filter((p) => p.name.toLowerCase().includes(q));
  }, [platformQuery]);

  // Filtered countries
  const filteredCountries = React.useMemo(() => {
    if (!countryQuery.trim()) return COUNTRIES;
    const q = countryQuery.toLowerCase();
    return COUNTRIES.filter(
      (c) => c.name.toLowerCase().includes(q) || c.dial_code.includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [countryQuery]);

  const handleExecutePurchase = async () => {
    setIsSubmitting(true);
    try {
      if (mode === "otp") {
        const order = await orderOtpNumber({
          country_id: selectedCountryId,
          platform_id: selectedPlatformId,
          pin,
        });
        setIsConfirmOpen(false);
        onOtpOrderCreated?.(order);
      } else {
        const rental = await rentNumber({
          country_id: selectedCountryId,
          platform_id: selectedPlatformId,
          rental_days: rentalDays,
          auto_renew: autoRenew,
          pin,
        });
        setIsConfirmOpen(false);
        onRentalCreated?.(rental);
      }
    } catch {
      // In dev fallback or on error
      setIsConfirmOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card
      className={cn("rounded-2xl border-border/80 shadow-xs", className)}
      data-testid="numbers-selector-card"
    >
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              {mode === "otp" ? "Get One-Time OTP Number" : "Rent Virtual Phone Line"}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {mode === "otp"
                ? "Dedicated 20-minute line with live automated SMS code polling"
                : "Dedicated private number reserved exclusively for your account"}
            </CardDescription>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-muted-foreground block">Wallet Balance</span>
            <span className="font-mono text-xs font-bold text-foreground">
              {formatCurrency(walletBalance, "NGN")}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 p-6">
        {/* 1. Country Selector */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground">
            1. Select Country & Carrier Region
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsCountryDropdownOpen((prev) => !prev)}
              className="flex w-full items-center justify-between rounded-xl border border-border/80 bg-surface px-4 py-3 text-xs font-semibold text-foreground hover:border-primary/50 transition-colors"
              aria-expanded={isCountryDropdownOpen}
              aria-label="Select Country"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{selectedCountry.flag}</span>
                <span className="font-bold">{selectedCountry.name}</span>
                <span className="font-mono text-muted-foreground">({selectedCountry.dial_code})</span>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="success" className="text-[10px] px-2 py-0.5">
                  ● In Stock
                </Badge>
                <ChevronDown className="size-4 text-muted-foreground" />
              </div>
            </button>

            {/* Country Dropdown Panel */}
            {isCountryDropdownOpen && (
              <div className="absolute z-20 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border/80 bg-card p-2 shadow-lg space-y-1">
                <div className="sticky top-0 bg-card pb-1">
                  <Input
                    type="search"
                    placeholder="Search countries..."
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    className="h-8 text-xs rounded-lg"
                  />
                </div>

                {filteredCountries.map((country) => {
                  const isSelected = country.id === selectedCountryId;
                  return (
                    <button
                      key={country.id}
                      type="button"
                      onClick={() => {
                        setSelectedCountryId(country.id);
                        setIsCountryDropdownOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-foreground hover:bg-muted/60"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{country.flag}</span>
                        <span>{country.name}</span>
                        <span className={isSelected ? "text-primary-foreground/80 font-mono" : "text-muted-foreground font-mono"}>
                          {country.dial_code}
                        </span>
                      </div>
                      {isSelected && <Check className="size-3.5" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 2. Platform / Target Service Selection */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-foreground">
              2. Choose Target Platform / Service
            </label>
            <div className="relative w-44">
              <Search className="absolute left-2.5 top-1/2 size-3 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search platforms..."
                value={platformQuery}
                onChange={(e) => setPlatformQuery(e.target.value)}
                className="h-7 rounded-lg pl-7 text-[11px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
            {filteredPlatforms.map((platform) => {
              const isSelected = selectedPlatformId === platform.id;
              return (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => setSelectedPlatformId(platform.id)}
                  className={cn(
                    "relative flex flex-col items-start rounded-xl border p-3 text-left transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary shadow-xs"
                      : "border-border/80 bg-surface hover:bg-muted/40 text-foreground"
                  )}
                  aria-pressed={isSelected}
                >
                  <div className="flex w-full items-center justify-between">
                    <span className="font-bold text-xs line-clamp-1">{platform.name}</span>
                    {isSelected && <Check className="size-3.5 text-primary shrink-0" />}
                  </div>

                  <div className="mt-2 flex w-full items-baseline justify-between">
                    <span className="font-mono text-xs font-extrabold text-foreground">
                      ₦{platform.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      {platform.sms_success_rate}%
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Rental Duration (If Rental Mode) */}
        {mode === "rental" && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-foreground">
              3. Rental Period Duration
            </label>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {RENTAL_DURATIONS.map((dur) => {
                const isSelected = rentalDays === dur.days;
                return (
                  <button
                    key={dur.days}
                    type="button"
                    onClick={() => setRentalDays(dur.days)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
                        : "border-border/80 bg-surface text-foreground hover:bg-muted/40"
                    )}
                  >
                    <span className="text-xs font-bold">{dur.label}</span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      {dur.discountLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Pricing & Checkout Action Card */}
        <div className="space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Country & Platform</span>
            <span className="font-semibold text-foreground">
              {selectedCountry.flag} {selectedCountry.name} · {selectedPlatform.name}
            </span>
          </div>

          {mode === "rental" && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold text-foreground">{rentalDays} Days</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border/70 pt-3 text-sm font-bold">
            <span className="text-foreground">Total Fee</span>
            <span className="font-mono text-primary text-base">
              ₦{totalPriceNaira.toLocaleString()}
            </span>
          </div>

          <Button
            type="button"
            onClick={() => setIsConfirmOpen(true)}
            disabled={!isBalanceSufficient}
            className="h-11 w-full gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/95"
          >
            <span>{mode === "otp" ? "Get Verification Number" : "Rent Virtual Line"}</span>
            <ArrowRight className="size-4" />
          </Button>

          {!isBalanceSufficient && (
            <p className="text-center text-xs text-rose-600 dark:text-rose-400 font-semibold">
              Insufficient wallet balance. Please fund your wallet.
            </p>
          )}
        </div>
      </CardContent>

      {/* Confirmation & PIN Dialog */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title={mode === "otp" ? "Confirm One-Time OTP Number" : "Confirm Number Rental"}
        variant="default"
        confirmText={isSubmitting ? "Processing…" : `Pay ₦${totalPriceNaira.toLocaleString()}`}
        isLoading={isSubmitting}
        onConfirm={handleExecutePurchase}
        description="Funds will be debited from your wallet. If no SMS arrives within the 20-minute window, full refund is guaranteed."
      >
        <div className="space-y-3 pt-1">
          <div className="border-border bg-surface space-y-2 rounded-xl border p-3.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Country:</span>
              <span className="text-foreground font-semibold">
                {selectedCountry.flag} {selectedCountry.name} ({selectedCountry.dial_code})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Service:</span>
              <span className="text-foreground font-semibold">{selectedPlatform.name}</span>
            </div>
            {mode === "rental" && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="text-foreground font-semibold">{rentalDays} Days</span>
              </div>
            )}
            <div className="border-border flex justify-between border-t pt-1.5 font-bold">
              <span className="text-foreground">Net Wallet Debit:</span>
              <span className="text-primary font-mono text-sm">
                ₦{totalPriceNaira.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Wallet Balance Impact */}
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-border/80 bg-muted/20 p-2.5 text-[11px]">
            <div>
              <span className="text-muted-foreground block">Current Balance</span>
              <span className="font-mono font-bold text-foreground">
                {formatCurrency(walletBalance, "NGN")}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Balance After</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(Math.max(0, walletBalance - totalPriceMinor), "NGN")}
              </span>
            </div>
          </div>

          {/* 4-Digit Transaction PIN Input */}
          <div className="space-y-1.5 rounded-xl border border-border/70 bg-surface p-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Lock className="size-3 text-primary" />
                <span>Transaction PIN</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                Default: 1234
              </span>
            </div>
            <Input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
              placeholder="••••"
              className="font-mono text-center text-lg tracking-widest h-9 rounded-lg"
              aria-label="Transaction PIN"
            />
          </div>
        </div>
      </ConfirmDialog>
    </Card>
  );
}
