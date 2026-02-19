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
import { deleteProductionSchema } from "@/lib/validation/procurement-validation";
import { TProcerement } from "@/lib/type/type.procurement";
import { deleteProcurement } from "@/lib/server/action-server/procurement";

function ProcurementDeteleForm({
  data,
  onSuccess,
  className,
  ...props
}: React.ComponentProps<"form"> & {
  data: TProcerement;
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof deleteProductionSchema>>({
    resolver: zodResolver(deleteProductionSchema),
    defaultValues: {
      procurementId: data.idProcurement,
    },
    mode: "onChange",
  });

  function onSubmit(values: z.infer<typeof deleteProductionSchema>) {
    startTransition(async () => {
      const result = await deleteProcurement(values);

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
          name="procurementId"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>No Pengadaan</FieldLabel>
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
          <FieldLabel>Nama</FieldLabel>
          <Input defaultValue={data.requestedBy || ""} disabled />
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

export { ProcurementDeteleForm };
