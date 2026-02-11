"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { TItem } from "@/lib/type/type.item";

import { DeleteItemSchema } from "@/lib/validation/master-validation";
import { deleteItem } from "@/lib/server/action-server/item";

function ItemDeteleForm({
  data,
  onSuccess,
  className,
  ...props
}: React.ComponentProps<"form"> & {
  data: TItem;
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof DeleteItemSchema>>({
    resolver: zodResolver(DeleteItemSchema),
    defaultValues: {
      id: data.idItem,
    },
    mode: "onChange",
  });

  function onSubmit(values: z.infer<typeof DeleteItemSchema>) {
    startTransition(async () => {
      const result = await deleteItem(values);

      if (result.ok) {
        toast.success(result.message);
        onSuccess?.();
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup>
        <Controller
          name="id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>No Bahan Baku</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                disabled
              />
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />

        <Field>
          <FieldLabel>Nama Bahan Baku</FieldLabel>
          <Input defaultValue={data.name} disabled />
        </Field>

        <Field>
          <Button
            type="submit"
            className="w-full"
            variant="destructive"
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Delete"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

export { ItemDeteleForm };
