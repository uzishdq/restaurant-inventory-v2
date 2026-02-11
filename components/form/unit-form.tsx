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
import { Input } from "../ui/input";
import {
  CreateUnitSchema,
  UpdateUnitSchema,
} from "@/lib/validation/master-validation";
import {
  createUnit,
  deleteUnit,
  updateUnit,
} from "@/lib/server/action-server/unit";
import { TUnit } from "@/lib/type/type.unit";
import { IdSchema } from "@/lib/validation/validation-helper";

function UnitForm({
  onSuccess,
  className,
  ...props
}: React.ComponentProps<"form"> & {
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof CreateUnitSchema>>({
    resolver: zodResolver(CreateUnitSchema),
    defaultValues: {
      name: "",
    },
    mode: "onChange",
  });

  function onSubmit(values: z.infer<typeof CreateUnitSchema>) {
    startTransition(async () => {
      const result = await createUnit(values);

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
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="on"
                type="text"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Loading..." : "Tambah"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

function UnitUpdateForm({
  data,
  onSuccess,
  className,
  ...props
}: React.ComponentProps<"form"> & {
  data: TUnit;
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof UpdateUnitSchema>>({
    resolver: zodResolver(UpdateUnitSchema),
    defaultValues: {
      id: data.idUnit,
      name: data.name,
    },
    mode: "onChange",
  });

  function onSubmit(values: z.infer<typeof UpdateUnitSchema>) {
    startTransition(async () => {
      const result = await updateUnit(values);

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
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nama</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="on"
                type="text"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Field>
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Loading..." : "Update"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}

function UnitDeteleForm({
  data,
  onSuccess,
  className,
  ...props
}: React.ComponentProps<"form"> & {
  data: TUnit;
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof IdSchema>>({
    resolver: zodResolver(IdSchema),
    defaultValues: {
      id: data.idUnit,
    },
    mode: "onChange",
  });

  function onSubmit(values: z.infer<typeof IdSchema>) {
    startTransition(async () => {
      const result = await deleteUnit(values);

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
          render={({ fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="name">Nama</FieldLabel>
              <Input id="name" autoComplete="off" value={data.name} disabled />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

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

export { UnitForm, UnitUpdateForm, UnitDeteleForm };
