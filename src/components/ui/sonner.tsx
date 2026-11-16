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
 * High-Trust Fintech Toast Provider.
 * Customizes Sonner with high-contrast semantic icons, clear title + message typography,
 * subtle 1px borders, and 8px radii adhering to the design system tokens.
 */
export const Toaster = ({
  position = "top-right",
  expand = false,
  closeButton = true,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position={position}
      expand={expand}
      closeButton={closeButton}
      className="toaster group font-sans"
      icons={{
        success: (
          <div
            data-testid="toast-icon-success"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
          >
            <CheckCircle2 className="size-4" strokeWidth={2.25} />
          </div>
        ),
        error: (
          <div
            data-testid="toast-icon-error"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400"
          >
            <AlertCircle className="size-4" strokeWidth={2.25} />
          </div>
        ),
        warning: (
          <div
            data-testid="toast-icon-warning"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
          >
            <AlertTriangle className="size-4" strokeWidth={2.25} />
          </div>
        ),
        info: (
          <div
            data-testid="toast-icon-info"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand dark:bg-brand/20 dark:text-brand"
          >
            <Info className="size-4" strokeWidth={2.25} />
          </div>
        ),
        loading: (
          <div
            data-testid="toast-icon-loading"
            className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300"
          >
            <Loader2 className="size-4 animate-spin" strokeWidth={2.25} />
          </div>
        ),
      }}
      toastOptions={{
        duration: 4500,
        classNames: {
          toast: cn(
            "group toast group-[.toaster]:bg-bg-surface group-[.toaster]:text-text-primary",
            "group-[.toaster]:border-border-subtle group-[.toaster]:shadow-lg group-[.toaster]:rounded-md group-[.toaster]:border",
            "group-[.toaster]:p-3.5 group-[.toaster]:gap-3 group-[.toaster]:items-start font-sans"
          ),
          title: "group-[.toast]:text-xs group-[.toast]:font-semibold group-[.toast]:text-text-primary leading-tight tracking-tight",
          description: "group-[.toast]:text-xs group-[.toast]:text-text-secondary group-[.toast]:mt-1 leading-relaxed",
          actionButton:
            "group-[.toast]:bg-brand group-[.toast]:text-brand-foreground group-[.toast]:rounded-md font-medium text-xs h-7 px-3 transition-colors hover:bg-brand-hover",
          cancelButton:
            "group-[.toast]:bg-slate-100 dark:group-[.toast]:bg-slate-800 group-[.toast]:text-text-secondary group-[.toast]:rounded-md font-medium text-xs h-7 px-3",
          closeButton:
            "group-[.toast]:border-border-subtle group-[.toast]:bg-bg-surface group-[.toast]:text-text-muted hover:group-[.toast]:text-text-primary group-[.toast]:size-5 group-[.toast]:rounded-sm group-[.toast]:top-3 group-[.toast]:right-3",
          success:
            "group-[.toaster]:border-emerald-500/20 group-[.toaster]:bg-bg-surface dark:group-[.toaster]:border-emerald-500/30",
          error:
            "group-[.toaster]:border-rose-500/20 group-[.toaster]:bg-bg-surface dark:group-[.toaster]:border-rose-500/30",
          warning:
            "group-[.toaster]:border-amber-500/20 group-[.toaster]:bg-bg-surface dark:group-[.toaster]:border-amber-500/30",
          info:
            "group-[.toaster]:border-brand/20 group-[.toaster]:bg-bg-surface dark:group-[.toaster]:border-brand/30",
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
    return {
      title,
      options: desc ? { ...opts, description: desc } : opts,
    };
  }

  const title = titleOrPayload;
  if (typeof messageOrOptions === "string") {
    return {
      title,
      options: { description: messageOrOptions },
    };
  }

  return {
    title,
    options: messageOrOptions,
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
