"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SubmitButton,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getSafeErrorMessage } from "@/lib/api/errors";
import { ApiClientError } from "@/lib/api/client";
import { formatDate } from "@/lib/formatters";
import { updateProfile, type UserProfile } from "./api";

const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(100, "Full name cannot exceed 100 characters"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, underscores, and hyphens"
    ),
  email: z.string().trim().email("Please enter a valid email address"),
  phone: z.string().trim().optional(),
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

export interface ProfileEditFormProps {
  profile: UserProfile;
  onProfileUpdated?: (updated: UserProfile) => void;
  className?: string;
}

/**
 * ProfileEditForm (F13.1).
 * Profile view and self-service edit form adhering to Doc 09 §6 rules.
 */
export function ProfileEditForm({
  profile,
  onProfileUpdated,
  className,
}: ProfileEditFormProps) {
  const [serverError, setServerError] = React.useState<string | null>(null);

  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: profile?.name ?? profile?.username ?? "",
      username: profile?.username ?? "",
      email: profile?.email ?? "",
      phone: profile?.phone ?? "",
    },
    mode: "onTouched",
  });

  const { isSubmitting, isDirty } = form.formState;

  const onSubmit = async (values: UpdateProfileFormValues) => {
    setServerError(null);

    try {
      const updated = await updateProfile(values);
      toast.success("Profile updated successfully.");
      form.reset({
        name: updated?.name ?? updated?.username ?? "",
        username: updated?.username ?? "",
        email: updated?.email ?? "",
        phone: updated?.phone ?? "",
      });
      onProfileUpdated?.(updated);
    } catch (err: unknown) {
      if (err instanceof ApiClientError && err.errors) {
        Object.entries(err.errors).forEach(([field, messages]) => {
          if (messages?.[0]) {
            form.setError(field as keyof UpdateProfileFormValues, {
              type: "server",
              message: messages[0],
            });
          }
        });
        const firstField = Object.keys(
          err.errors
        )[0] as keyof UpdateProfileFormValues;
        if (firstField) {
          form.setFocus(firstField);
        }
      } else {
        setServerError(
          getSafeErrorMessage(err, "Failed to update profile. Please try again.")
        );
      }
    }
  };

  // Compute user initials for avatar safely
  const displayName = profile?.name || profile?.username || "Account";
  const nameToSplit = (profile?.name || profile?.username || "").trim();
  const initials = nameToSplit
    ? nameToSplit
        .split(/\s+/)
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  const isVerified = Boolean(profile?.email_verified_at);

  return (
    <Card className={className} data-testid="profile-edit-form-card">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-primary font-semibold text-lg"
            >
              {initials || <User className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-semibold text-foreground">
                  {displayName}
                </CardTitle>
                <Badge variant={isVerified ? "success" : "warning"}>
                  {isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Member since {profile?.created_at ? formatDate(profile.created_at, { year: "numeric", month: "short" }) : "Recently"} • ID: {profile?.id || "N/A"}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form
            id="profile-edit-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            noValidate
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Amara Nwosu"
                        autoComplete="name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. amaranwosu"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Public unique identifier on Korak Digitals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        autoComplete="email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="e.g. 08023456789"
                        autoComplete="tel"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Used for delivery notifications and SMS alerts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t border-border/60">
        <p className="text-xs text-muted-foreground">
          {isDirty ? "You have unsaved changes." : "Profile information is up to date."}
        </p>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => form.reset()}
            >
              Discard
            </Button>
          )}
          <SubmitButton
            form="profile-edit-form"
            size="sm"
            isLoading={isSubmitting}
            loadingText="Saving changes..."
            disabled={!isDirty || isSubmitting}
          >
            Save Changes
          </SubmitButton>
        </div>
      </CardFooter>
    </Card>
  );
}
