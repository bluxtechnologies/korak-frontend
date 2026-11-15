"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { Slot } from "@radix-ui/react-slot";
import {
  Controller,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
  FormProvider,
  useFormContext,
  type UseFormReturn,
  type Path,
} from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Button, type ButtonProps } from "@/components/ui/button";
import { getFieldErrors, getSafeErrorMessage } from "@/lib/api/errors";
import { cn } from "@/lib/utils";

const Form = FormProvider;

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue
);

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const formContext = useFormContext();

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>");
  }

  if (!itemContext) {
    throw new Error("useFormField should be used within <FormItem>");
  }

  const { id } = itemContext;

  if (!formContext) {
    return {
      id,
      name: fieldContext.name,
      formItemId: `${id}-form-item`,
      formDescriptionId: `${id}-form-item-description`,
      formMessageId: `${id}-form-item-message`,
      error: undefined,
      isDirty: false,
      isTouched: false,
      invalid: false,
    };
  }

  const fieldState = formContext.getFieldState(
    fieldContext.name,
    formContext.formState
  );

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn("space-y-2", className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn(error && "text-destructive", className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = "FormLabel";

const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = "FormControl";

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn("text-muted-foreground text-xs", className)}
      {...props}
    />
  );
});
FormDescription.displayName = "FormDescription";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message ?? "") : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      role="alert"
      className={cn("text-destructive text-xs font-medium", className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export interface SubmitButtonProps extends ButtonProps {
  /** Optional loading text displayed during submit */
  loadingText?: React.ReactNode;
}

/**
 * Submit button that automatically binds to React Hook Form's isSubmitting state.
 * Disables button and displays Loader2 spinner to prevent double submits per Doc 09 §6.
 */
const SubmitButton = React.forwardRef<HTMLButtonElement, SubmitButtonProps>(
  (
    { children, loadingText, disabled, isLoading, type = "submit", ...props },
    ref
  ) => {
    const form = useFormContext();
    const isSubmitting = form?.formState?.isSubmitting ?? false;

    const resolvedLoading = isLoading ?? isSubmitting;
    const resolvedDisabled = disabled ?? isSubmitting;

    return (
      <Button
        ref={ref}
        type={type}
        disabled={resolvedDisabled}
        isLoading={resolvedLoading}
        {...props}
      >
        {resolvedLoading && loadingText ? loadingText : children}
      </Button>
    );
  }
);
SubmitButton.displayName = "SubmitButton";

export interface SetServerFormErrorsOptions {
  /**
   * Whether to move focus to the first invalid field upon setting errors.
   * Defaults to true per Doc 09 §6.
   */
  focusFirst?: boolean;
}

/**
 * Maps server-side API validation errors onto React Hook Form fields.
 * Follows Doc 09 §6:
 * - Focus moves to the first invalid field
 * - Server field errors are mapped to fields
 * - Unknown or general errors return a safe user-facing message
 */
export function setServerFormErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
  error: unknown,
  options: SetServerFormErrorsOptions = {}
): { rootError?: string; fieldErrors: Record<string, string> } {
  const { focusFirst = true } = options;
  const fieldErrors = getFieldErrors(error) ?? {};
  const errorKeys = Object.keys(fieldErrors);

  let hasFocused = false;

  for (const field of errorKeys) {
    const message = fieldErrors[field];
    if (message) {
      const shouldFocus = !hasFocused && focusFirst;
      form.setError(
        field as Path<TFieldValues>,
        {
          type: "server",
          message,
        },
        { shouldFocus }
      );
      if (shouldFocus) {
        hasFocused = true;
      }
    }
  }

  const rootError =
    errorKeys.length === 0 ? getSafeErrorMessage(error) : undefined;

  if (rootError) {
    form.setError("root.serverError" as Path<TFieldValues>, {
      type: "server",
      message: rootError,
    });
  }

  return { rootError, fieldErrors };
}

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  SubmitButton,
};
