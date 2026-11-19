"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ROUTES } from "@/config/navigation";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  SubmitButton,
  setServerFormErrors,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { register } from "@/features/auth/api";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Full name is too long."),
    email: z
      .string()
      .min(1, "Please enter your email address.")
      .email("Please enter a valid email address.")
      .max(254, "Email address is too long."),
    phone_number: z
      .string()
      .min(7, "Phone number must be at least 7 digits.")
      .max(20, "Phone number is too long.")
      .regex(
        /^\+?[0-9\s\-().]+$/,
        "Please enter a valid phone number."
      ),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .max(128, "Password is too long."),
    password_confirmation: z.string().min(1, "Please confirm your password."),
    terms: z
      .boolean()
      .refine(
        (val) => val === true,
        "You must accept the terms and conditions to continue."
      ),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match.",
    path: ["password_confirmation"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Register Form Component
// ---------------------------------------------------------------------------
export function RegisterForm() {
  const router = useRouter();
  const [rootError, setRootError] = React.useState<string | undefined>();

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone_number: "",
      password: "",
      password_confirmation: "",
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setRootError(undefined);
    try {
      const result = await register(data);

      if (result.requires_device_verification) {
        const params = new URLSearchParams();
        if (result.challenge_token) params.set("token", result.challenge_token);
        const query = params.toString();
        router.push(query ? `${ROUTES.VERIFY_DEVICE}?${query}` : ROUTES.VERIFY_DEVICE);
        return;
      }

      const displayName = result.user?.name || result.user?.username || "there";
      toast.success(`Welcome to Korak Digitals, ${displayName}!`);
      router.push(ROUTES.OVERVIEW);
    } catch (err) {
      const { rootError: msg } = setServerFormErrors(form, err);
      if (msg) {
        setRootError(msg);
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
        aria-label="Create account form"
        noValidate
      >
        {/* Root / server error banner */}
        {rootError && (
          <Alert variant="destructive" className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="text-sm">{rootError}</span>
          </Alert>
        )}

        {/* Full name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="Jane Smith"
                  autoComplete="name"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  inputMode="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Phone number */}
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone number</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="tel"
                  placeholder="+234 801 234 5678"
                  autoComplete="tel"
                  inputMode="tel"
                />
              </FormControl>
              <FormDescription>
                Include your country code (e.g. +234 for Nigeria).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm password */}
        <FormField
          control={form.control}
          name="password_confirmation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Terms */}
        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-2">
                <FormControl>
                  <Checkbox
                    id="register-terms"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-describedby="register-terms-desc"
                    className="mt-0.5"
                  />
                </FormControl>
                <label
                  htmlFor="register-terms"
                  id="register-terms-desc"
                  className="text-muted-foreground cursor-pointer text-sm leading-snug"
                >
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:text-primary/80 focus-visible:ring-ring rounded-sm underline-offset-4 transition-colors hover:underline focus-visible:ring-1 focus-visible:outline-none"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:text-primary/80 focus-visible:ring-ring rounded-sm underline-offset-4 transition-colors hover:underline focus-visible:ring-1 focus-visible:outline-none"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <SubmitButton className="w-full" loadingText="Creating account…">
          Create account
        </SubmitButton>
      </form>
    </Form>
  );
}
