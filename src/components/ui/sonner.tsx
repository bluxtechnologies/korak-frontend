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
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-red-500/15 text-red-600 dark:bg-red-500/25 dark:text-red-400 border border-red-500/20"
          >
            <AlertCircle className="size-[17px]" strokeWidth={2.2} />
          </div>
        ),
        warning: (
          <div
            data-testid="toast-icon-warning"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20"
          >
            <AlertTriangle className="size-[17px]" strokeWidth={2.2} />
          </div>
        ),
        info: (
          <div
            data-testid="toast-icon-info"
            className="flex size-[34px] shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-blue-600 dark:bg-blue-500/25 dark:text-blue-400 border border-blue-500/20"
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
            "group-[.toaster]:border-emerald-500/30 dark:group-[.toaster]:border-emerald-500/35 group-[.toaster]:bg-white dark:group-[.toaster]:bg-card",
          error:
            "group-[.toaster]:border-red-500/35 dark:group-[.toaster]:border-red-500/40 group-[.toaster]:bg-red-50/20 dark:group-[.toaster]:bg-red-950/10",
          warning:
            "group-[.toaster]:border-amber-500/30 dark:group-[.toaster]:border-amber-500/35 group-[.toaster]:bg-white dark:group-[.toaster]:bg-card",
          info:
            "group-[.toaster]:border-blue-500/30 dark:group-[.toaster]:border-blue-500/35 group-[.toaster]:bg-white dark:group-[.toaster]:bg-card",
        },
      }}
      {...props}
    />
  );
};

type ToastInput = string | { title: string; message?: string; description?: string };

function parseToastArgs(
  titleOrPayload: ToastInput,
  messageOrOptions?: string | ShowToastOptions,
  variant?: "success" | "error" | "warning" | "info" | "loading"
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

  const rawTitle = titleOrPayload;
  if (typeof messageOrOptions === "string") {
    return {
      title: rawTitle,
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

  // Ensure toasts have both title and message when single string is provided
  let finalTitle = rawTitle;
  let finalDesc = opts.description;

  if (!finalDesc) {
    if (/session (ended|expired)/i.test(rawTitle)) {
      finalTitle = "Session Ended";
      finalDesc = "Your session has ended. Please sign in again to continue.";
    } else if (variant === "error") {
      if (rawTitle.length > 25 || /\.\s*$/.test(rawTitle) || /failed|error|unable|could not|invalid/i.test(rawTitle)) {
        finalTitle = "Action Failed";
        finalDesc = rawTitle;
      }
    }
  }

  return {
    title: finalTitle,
    options: {
      ...opts,
      description: finalDesc,
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
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions, "success");
    return sonnerToast.success(title, options);
  },

  error: (titleOrPayload: ToastInput, messageOrOptions?: string | ShowToastOptions) => {
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions, "error");
    return sonnerToast.error(title, options);
  },

  warning: (titleOrPayload: ToastInput, messageOrOptions?: string | ShowToastOptions) => {
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions, "warning");
    return sonnerToast.warning(title, options);
  },

  info: (titleOrPayload: ToastInput, messageOrOptions?: string | ShowToastOptions) => {
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions, "info");
    return sonnerToast.info(title, options);
  },

  loading: (titleOrPayload: ToastInput, messageOrOptions?: string | ShowToastOptions) => {
    const { title, options } = parseToastArgs(titleOrPayload, messageOrOptions, "loading");
    return sonnerToast.loading(title, options);
  },

  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};

const smartToast = Object.assign(
  (message: any, options?: any) => sonnerToast(message, options),
  sonnerToast,
  {
    success: (titleOrMsg: any, options?: any) => showToast.success(titleOrMsg, options),
    error: (titleOrMsg: any, options?: any) => showToast.error(titleOrMsg, options),
    warning: (titleOrMsg: any, options?: any) => showToast.warning(titleOrMsg, options),
    info: (titleOrMsg: any, options?: any) => showToast.info(titleOrMsg, options),
    loading: (titleOrMsg: any, options?: any) => showToast.loading(titleOrMsg, options),
  }
);

export { smartToast as toast };
