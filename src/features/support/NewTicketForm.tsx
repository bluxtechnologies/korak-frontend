"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SubmitButton,
  setServerFormErrors,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { showToast } from "@/components/ui/sonner";
import { createTicket, type SupportTicket, type TicketCategory } from "./api";
import { queryClient, SUPPORT_QUERY_KEYS } from "./hooks/useSupportTickets";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const newTicketSchema = z.object({
  subject: z
    .string()
    .min(5, "Subject must be at least 5 characters.")
    .max(120, "Subject must be 120 characters or fewer."),
  category: z.enum(
    ["billing", "order", "vpn", "airtime_data", "account", "general"],
    { message: "Please select a category." }
  ),
  message: z
    .string()
    .min(20, "Please describe your issue in at least 20 characters.")
    .max(2000, "Message is too long (max 2000 characters)."),
});

type NewTicketFormData = z.infer<typeof newTicketSchema>;

const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: "billing", label: "Billing & Payments" },
  { value: "order", label: "Orders & Deliveries" },
  { value: "vpn", label: "VPN" },
  { value: "airtime_data", label: "Airtime & Data" },
  { value: "account", label: "Account & Security" },
  { value: "general", label: "General Enquiry" },
];

export interface NewTicketFormProps {
  onSuccess: (ticket: SupportTicket) => void;
}

/**
 * NewTicketForm — Subject + Category + Message body.
 * On success, calls onSuccess with the created ticket so the
 * parent can redirect to /support/[id].
 */
export function NewTicketForm({ onSuccess }: NewTicketFormProps) {
  const [rootError, setRootError] = React.useState<string | undefined>();

  const form = useForm<NewTicketFormData>({
    resolver: zodResolver(newTicketSchema),
    defaultValues: {
      subject: "",
      category: "" as unknown as TicketCategory,
      message: "",
    },
  });

  const subjectValue = form.watch("subject") || "";
  const messageValue = form.watch("message") || "";

  const onSubmit = async (data: NewTicketFormData) => {
    setRootError(undefined);
    try {
      const ticket = await createTicket(data);
      queryClient.invalidateQueries({
        queryKey: SUPPORT_QUERY_KEYS.tickets(),
      });
      showToast.success("Ticket submitted", {
        description: `Your ticket ${ticket.reference} has been created. We'll get back to you soon.`,
      });
      onSuccess(ticket);
    } catch (err) {
      const { rootError: msg } = setServerFormErrors(form, err);
      if (msg) setRootError(msg);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        aria-label="New support ticket form"
        noValidate
      >
        {rootError && (
          <Alert variant="destructive" className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="text-sm">{rootError}</span>
          </Alert>
        )}

        {/* Subject */}
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Brief description of your issue"
                  autoComplete="off"
                />
              </FormControl>
              <div className="flex justify-between items-center">
                <FormMessage />
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {subjectValue.length}/120
                </span>
              </div>
            </FormItem>
          )}
        />

        {/* Category */}
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} value={field.value || ""}>
                <FormControl>
                  <SelectTrigger className="rounded-[8px]">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="rounded-[8px]">
                  {CATEGORY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Message */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Describe your issue in detail — the more information you provide, the faster we can help you."
                  className="min-h-[120px] resize-y rounded-[8px] text-sm leading-relaxed"
                />
              </FormControl>
              <div className="flex justify-between">
                <FormMessage />
                <span className="ml-auto text-[11px] text-muted-foreground">
                  {messageValue.length}/2000
                </span>
              </div>
            </FormItem>
          )}
        />

        <SubmitButton className="w-full" loadingText="Submitting ticket…">
          Submit Ticket
        </SubmitButton>
      </form>
    </Form>
  );
}
