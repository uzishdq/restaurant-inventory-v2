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
  CreateAccountSchema,
  RoleUpdateSchema,
} from "@/lib/validation/master-validation";
import { createUser, updateRole } from "@/lib/server/action-server/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ROLE_SELECT } from "@/lib/constant";
import { TUser } from "@/lib/type/type.user";

function CreateUserForm({
  onSuccess,
  className,
  ...props
}: React.ComponentProps<"form"> & {
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof CreateAccountSchema>>({
    resolver: zodResolver(CreateAccountSchema),
    defaultValues: {
      username: "",
      name: "",
      phone: "",
    },
    mode: "onChange",
  });

  function onSubmit(values: z.infer<typeof CreateAccountSchema>) {
    startTransition(async () => {
      const result = await createUser(values);

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
          name="username"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Username</FieldLabel>
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

        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>No.Telp</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                autoComplete="on"
                type="number"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="responsive" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Role</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {ROLE_SELECT.map((item, index) => (
                    <SelectItem
                      key={`role-${index}-${item.name}`}
                      value={item.value}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

function UpdateRoleForm({
  data,
  onSuccess,
  className,
  ...props
}: React.ComponentProps<"form"> & {
  data: TUser;
  onSuccess?: () => void;
}) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof RoleUpdateSchema>>({
    resolver: zodResolver(RoleUpdateSchema),
    defaultValues: {
      id: data.idUser,
      role: data.role,
    },
    mode: "onChange",
  });

  function onSubmit(values: z.infer<typeof RoleUpdateSchema>) {
    startTransition(async () => {
      const result = await updateRole(values);

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

        <Controller
          name="role"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field orientation="responsive" data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Role</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  aria-invalid={fieldState.invalid}
                  className="min-w-30"
                >
                  <SelectValue placeholder="Pilih role" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {ROLE_SELECT.map((item, index) => (
                    <SelectItem
                      key={`role-${index}-${item.name}`}
                      value={item.value}
                    >
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export { CreateUserForm, UpdateRoleForm };
