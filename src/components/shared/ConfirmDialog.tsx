"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  /** Controls dialog open state */
  open: boolean;
  /** Callback fired when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Primary title of the confirmation modal */
  title: React.ReactNode;
  /** Detailed description of consequences (Doc 05 §4: naming the consequence) */
  description: React.ReactNode;
  /** Action confirmation button label (defaults to "Delete" for destructive, "Confirm" for default) */
  confirmText?: string;
  /** Cancel button label (defaults to "Cancel") */
  cancelText?: string;
  /** Styling variant for the confirm button ("destructive" | "default", defaults to "destructive") */
  variant?: "destructive" | "default";
  /** Optional controlled loading state */
  isLoading?: boolean;
  /** Callback executed on confirmation. If it returns a Promise, loading state is tracked automatically */
  onConfirm: () => void | Promise<void>;
  /** Optional callback executed when user cancels or dismisses */
  onCancel?: () => void;
  /** Optional trigger element */
  trigger?: React.ReactNode;
  /** Optional additional content rendered between description and action buttons */
  children?: React.ReactNode;
  /** Custom className for the dialog content wrapper */
  contentClassName?: string;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText = "Cancel",
  variant = "destructive",
  isLoading,
  onConfirm,
  onCancel,
  trigger,
  children,
  contentClassName,
}: ConfirmDialogProps) {
  const [internalLoading, setInternalLoading] = React.useState(false);
  const loading = isLoading ?? internalLoading;

  const defaultConfirmText = variant === "destructive" ? "Delete" : "Confirm";
  const resolvedConfirmText = confirmText ?? defaultConfirmText;

  const handleOpenChange = (nextOpen: boolean) => {
    if (loading) return;
    if (!nextOpen) {
      onCancel?.();
    }
    onOpenChange(nextOpen);
  };

  const handleConfirm = async () => {
    if (loading) return;
    const result = onConfirm();
    if (result instanceof Promise) {
      try {
        setInternalLoading(true);
        await result;
        onOpenChange(false);
      } catch {
        // Leave dialog open on error so user can retry or cancel
      } finally {
        setInternalLoading(false);
      }
    } else {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    if (loading) return;
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        role="alertdialog"
        hideCloseButton
        className={cn("sm:max-w-[425px]", contentClassName)}
        onEscapeKeyDown={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
        onPointerDownOutside={(e) => {
          if (loading) {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {children && <div className="py-2">{children}</div>}

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            variant={variant}
            onClick={handleConfirm}
            isLoading={loading}
            disabled={loading}
          >
            {resolvedConfirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
