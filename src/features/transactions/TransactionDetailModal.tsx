"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TransactionDetailCard } from "./TransactionDetailCard";
import type { TransactionRecord } from "./api";

export interface TransactionDetailModalProps {
  transaction: TransactionRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onViewReceipt?: (transaction: TransactionRecord) => void;
}

/**
 * TransactionDetailModal (F15.2).
 * Accessible modal displaying full immutable details of an append-only ledger transaction.
 */
export function TransactionDetailModal({
  transaction,
  open,
  onOpenChange,
  onViewReceipt,
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        data-testid="transaction-detail-modal"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            Transaction Details - {transaction.reference}
          </DialogTitle>
          <DialogDescription>
            Audit ledger breakdown for transaction {transaction.reference}
          </DialogDescription>
        </DialogHeader>

        <TransactionDetailCard
          transaction={transaction}
          className="border-0 shadow-none p-0"
          onViewReceipt={() => {
            onOpenChange(false);
            onViewReceipt?.(transaction);
          }}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
