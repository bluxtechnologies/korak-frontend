"use client";

import * as React from "react";
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  Loader2,
  X,
} from "lucide-react";
import { Toaster as Sonner, toast as sonnerToast, type ExternalToast } from "sonner";
import { useTheme } from "@/components/shared/theme-provider";
import { cn } from "@/lib/utils";

type ToasterProps = React.ComponentProps<typeof Sonner>;
export type ShowToastOptions = ExternalToast;

/**
 * KORAK Standardized Global Toast Notification System.
 * Inspired by classic Toastr notifications with a modern, elegant aesthetic:
 * - Crisp white / neutral background (never solid colored backgrounds)
 * - 10px corner radius
 * - 1px subtle neutral border
 * - Very soft, polished elevation shadow
 * - 16px internal padding
 * - Compact horizontal layout with circular tinted icon container
 * - Thin bottom progress indicator per variant (green, burgundy, amber, brand)
 * - 12px vertical spacing between stacked top-right toasts
 * - Auto-dismissal in 4.5 seconds with pause-on-hover
 */
export const Toaster = ({
  position = "top-right",
  expand = false,
  closeButton = true,
  visibleToasts = 4,
  gap = 12,
  duration = 4500,
  offset = 28,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      expand={expand}
      closeButton={closeButton}
      visibleToasts={visibleToasts}
      gap={gap}
      offset={offset}
      duration={duration}
      className="toaster group font-sans"
      icons={{
        success: (
          <div
            data-testid="toast-icon-success"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-[17px]" strokeWidth={2.2} />
          </div>
        ),
        error: (
          <div
            data-testid="toast-icon-error"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#7A1F3D]/10 text-[#7A1F3D] dark:bg-[#7A1F3D]/25 dark:text-[#E892A8]"
          >
            <AlertCircle className="size-[17px]" strokeWidth={2.2} />
          </div>
        ),
        warning: (
          <div
            data-testid="toast-icon-warning"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
          >
            <AlertTriangle className="size-[17px]" strokeWidth={2.2} />
          </div>
        ),
        info: (
          <div
            data-testid="toast-icon-info"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-[#7A1F3D]/10 text-[#7A1F3D] dark:bg-[#7A1F3D]/25 dark:text-[#E892A8]"
          >
            <Info className="size-[17px]" strokeWidth={2.2} />
          </div>
        ),
        loading: (
          <div
            data-testid="toast-icon-loading"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300"
          >
            <Loader2 className="size-[17px] animate-spin" strokeWidth={2.2} />
          </div>
        ),
        close: (
          <X className="size-3.5" strokeWidth={2} aria-hidden="true" />
        ),
      }}
      toastOptions={{
        duration: 4500,
        classNames: {
          toast: cn(
            "group toast group-[.toaster]:bg-white dark:group-[.toaster]:bg-card",
            "group-[.toaster]:text-foreground group-[.toaster]:border-border/80 dark:group-[.toaster]:border-border",
            "group-[.toaster]:shadow-[0_4px_16px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)]",
            "group-[.toaster]:rounded-[10px] group-[.toaster]:border",
            "group-[.toaster]:p-[16px_18px] group-[.toaster]:items-start font-sans",
            "group-[.toaster]:w-[380px] group-[.toaster]:max-w-[calc(100vw-32px)] overflow-hidden relative"
          ),
          title: "group-[.toast]:text-xs sm:group-[.toast]:text-sm group-[.toast]:font-bold group-[.toast]:text-foreground leading-snug tracking-tight",
          description: "group-[.toast]:text-xs group-[.toast]:text-muted-foreground group-[.toast]:mt-1 leading-relaxed",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-[8px] font-semibold text-xs h-7 px-3 transition-colors hover:bg-primary/90",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-foreground group-[.toast]:rounded-[8px] font-medium text-xs h-7 px-3 hover:bg-muted/80",
          closeButton:
            "!top-3.5 !right-3.5 !left-auto !bottom-auto !size-[22px] !rounded-[6px] !border !border-border/60 !bg-background/80 hover:!bg-muted !text-muted-foreground hover:!text-foreground !transition-colors !opacity-70 hover:!opacity-100 flex items-center justify-center",
          content: "flex flex-col gap-0.5 flex-1 min-w-0 !pr-8",
          icon: "!shrink-0 !mt-0.5 !mr-3.5",
          success:
            "group-[.toaster]:border-border/80 dark:group-[.toaster]:border-border group-[.toaster]:bg-white dark:group-[.toaster]:bg-card",
          error:
            "group-[.toaster]:border-border/80 dark:group-[.toaster]:border-border group-[.toaster]:bg-white dark:group-[.toaster]:bg-card",
          warning:
            "group-[.toaster]:border-border/80 dark:group-[.toaster]:border-border group-[.toaster]:bg-white dark:group-[.toaster]:bg-card",
          info:
            "group-[.toaster]:border-border/80 dark:group-[.toaster]:border-border group-[.toaster]:bg-white dark:group-[.toaster]:bg-card",
        },
      }}
      {...props}
    />
  );
};

type ToastInput = string | { title: string; message?: string; description?: string };

function parseToastArgs(
  titleOrPayload: ToastInput,
  messageOrOptions?: string | ShowToastOptions
): { title: string; options?: ShowToastOptions } {
  if (typeof titleOrPayload === "object" && titleOrPayload !== null) {
    const title = titleOrPayload.title;
    const desc = titleOrPayload.message ?? titleOrPayload.description;
    const opts = typeof messageOrOptions === "object" ? messageOrOptions : {};
    const duration = opts?.duration ?? 4500;
    return {
      title,
      options: {
        ...opts,
        description: desc,
        style: {
          "--toast-duration": `${duration}ms`,
          ...(opts.style || {}),
        } as React.CSSProperties,
      },
    };
  }

  const title = titleOrPayload;
  if (typeof messageOrOptions === "string") {
    return {
      title,
      options: {
        description: messageOrOptions,
        style: {
          "--toast-duration": "4500ms",
        } as React.CSSProperties,
      },
    };
  }

  const opts = messageOrOptions || {};
  const duration = opts?.duration ?? 4500;
  return {
    title,
    options: {
      ...opts,
      style: {
        "--toast-duration": `${duration}ms`,
        ...(opts.style || {}),
      } as React.CSSProperties,
    },
  };
}

/**
 * Standardized High-Trust Alert Helper.
 * Automatically accepts both:
 *   showToast.success("Title", "Detailed message goes here")
 *   showToast.success({ title: "Title", message: "Detailed message" })
 *   showToast.success("Title", { description: "Message", action: { ... } })
 */
export const showToast = {
  success: (titleOrPayload: ToastInput, messageOrOptions?: string | ShowToastOptions) => {
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions);
    return sonnerToast.success(title, options);
  },

  error: (titleOrPayload: ToastInput, messageOrOptions?: string | ShowToastOptions) => {
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions);
    return sonnerToast.error(title, options);
  },

  warning: (titleOrPayload: ToastInput, messageOrOptions?: string | ShowToastOptions) => {
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions);
    return sonnerToast.warning(title, options);
  },

  info: (titleOrPayload: ToastInput, messageOrOptions?: string | ShowToastOptions) => {
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions);
    return sonnerToast.info(title, options);
  },

  loading: (titleOrPayload: ToastInput, messageOrOptions?: string | ShowToastOptions) => {
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions);
    return sonnerToast.loading(title, options);
  },

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};

export { sonnerToast as toast };
