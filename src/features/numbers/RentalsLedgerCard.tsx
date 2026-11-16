"use client";

import * as React from "react";
import {
  MessageSquare,
  Copy,
  Check,
  Clock,
  RotateCw,
  Phone,
  Shield,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { RentalNumberRecord } from "./api";

export interface RentalsLedgerCardProps {
  rentals: RentalNumberRecord[];
  onRenewRental?: (rentalId: string) => void;
  className?: string;
}

export function RentalsLedgerCard({
  rentals: initialRentals,
  onRenewRental,
  className,
}: RentalsLedgerCardProps) {
  const [rentals] = React.useState<RentalNumberRecord[]>(initialRentals);
  const [selectedRental, setSelectedRental] = React.useState<RentalNumberRecord | null>(null);
  const [copiedCodeId, setCopiedCodeId] = React.useState<string | null>(null);
  const [copiedPhoneId, setCopiedPhoneId] = React.useState<string | null>(null);

  const handleCopyCode = async (code: string, id: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(id);
      toast.success("Code copied!");
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch {
      toast.error("Failed to copy code");
    }
  };

  const handleCopyPhone = async (phone: string, id: string) => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopiedPhoneId(id);
      toast.success("Phone number copied!");
      setTimeout(() => setCopiedPhoneId(null), 2000);
    } catch {
      toast.error("Failed to copy phone");
    }
  };

  return (
    <Card
      className={cn("rounded-2xl border-border/80 shadow-xs", className)}
      data-testid="rentals-ledger-card"
    >
      <CardHeader className="border-b border-border/70 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold text-foreground">
              Active Rental Lines
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Long-term dedicated virtual numbers receiving incoming SMS messages
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            {rentals.length} Active Lines
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {rentals.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <Phone className="mx-auto size-8 text-muted-foreground/60 mb-2" />
            <p className="font-semibold text-foreground">No active rental numbers</p>
            <p className="mt-1">Rent a dedicated private line from 1 to 30 days above.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {rentals.map((rental) => {
              const platformLabel =
                rental.platform === "all_services"
                  ? "All Services"
                  : rental.platform.name;

              const isPhoneCopied = copiedPhoneId === rental.id;

              return (
                <div
                  key={rental.id}
                  className="flex flex-col gap-4 p-4 transition-colors hover:bg-muted/20 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl" role="img" aria-label={rental.country.name}>
                      {rental.country.flag}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-foreground">
                          {rental.phone_number}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyPhone(rental.phone_number, rental.id)}
                          aria-label="Copy phone number"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {isPhoneCopied ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="font-semibold text-foreground">{platformLabel}</span>
                        <span>•</span>
                        <span>Expires {formatDate(rental.expires_at)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="size-3" />
                          <span>{rental.messages.length} SMS Received</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedRental(rental)}
                      className="h-8 gap-1.5 rounded-lg text-xs"
                    >
                      <MessageSquare className="size-3.5 text-muted-foreground" />
                      <span>View SMS Log ({rental.messages.length})</span>
                    </Button>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onRenewRental?.(rental.id)}
                      className="h-8 gap-1 rounded-lg bg-primary text-xs font-semibold text-primary-foreground shadow-xs hover:bg-primary/95"
                    >
                      <RotateCw className="size-3" />
                      <span>Renew</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* SMS Messages Modal */}
      {selectedRental && (
        <Dialog open={Boolean(selectedRental)} onOpenChange={(open) => !open && setSelectedRental(null)}>
          <DialogContent className="max-w-md rounded-2xl p-6 shadow-lg">
            <DialogHeader className="text-left space-y-1">
              <DialogTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <span>{selectedRental.country.flag}</span>
                <span className="font-mono">{selectedRental.phone_number}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Live SMS message history for this dedicated rented line
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2 max-h-80 overflow-y-auto">
              {selectedRental.messages.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No incoming SMS messages received yet.
                </div>
              ) : (
                selectedRental.messages.map((msg) => {
                  const isCopied = copiedCodeId === msg.id;
                  return (
                    <div
                      key={msg.id}
                      className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <span className="text-foreground">{msg.sender}</span>
                        <span className="text-[10px] text-muted-foreground font-normal">
                          {formatDate(msg.received_at)}
                        </span>
                      </div>

                      {msg.code && (
                        <div className="flex items-center justify-between rounded-lg bg-surface border border-border/70 p-2">
                          <span className="font-mono text-sm font-bold text-primary">
                            {msg.code}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyCode(msg.code!, msg.id)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                          >
                            {isCopied ? (
                              <>
                                <Check className="size-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="size-3" />
                                <span>Copy Code</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}
