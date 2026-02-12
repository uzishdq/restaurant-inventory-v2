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
  PasswordUpdateSchema,
  ProfileUpdateSchema,
  RoleUpdateSchema,
  UsernameUpdateSchema,
} from "@/lib/validation/master-validation";
import {
  createUser,
  updateAccount,
  updatePassword,
  updateRole,
  updateUsername,
} from "@/lib/server/action-server/user";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ROLE_SELECT } from "@/lib/constant";
import { TUser } from "@/lib/type/type.user";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { signOut } from "next-auth/react";

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
                type="tel"
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

function AccountForm({ data }: Readonly<{ data: TUser }>) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof ProfileUpdateSchema>>({
    resolver: zodResolver(ProfileUpdateSchema),
    defaultValues: {
      name: data.name,
      phone: data.phone,
    },
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof ProfileUpdateSchema>) => {
    startTransition(() => {
      updateAccount(values).then((data) => {
        if (data.ok) {
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      });
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Akun</CardTitle>
        <CardDescription>
          Periksa kembali data akun Anda. Jika sudah benar, tidak perlu
          melakukan pengeditan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="username">Username</FieldLabel>
                <Input
                  id="username"
                  autoComplete="off"
                  value={data.username}
                  disabled
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="role">Role</FieldLabel>
                <Input
                  id="role"
                  autoComplete="off"
                  value={data.role}
                  disabled
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
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
                      type="tel"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Field>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Loading..." : "Update"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function AccountResetUsername() {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof UsernameUpdateSchema>>({
    resolver: zodResolver(UsernameUpdateSchema),
    defaultValues: {
      oldUsername: "",
      newUsername: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof UsernameUpdateSchema>) => {
    startTransition(() => {
      updateUsername(values).then((data) => {
        if (data.ok) {
          form.reset();
          toast.success(data.message);
          setTimeout(() => {
            signOut();
          }, 500);
        } else {
          toast.error(data.message);
        }
      });
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Username</CardTitle>
        <CardDescription>
          Masukkan username saat ini dan username baru untuk memperbarui
          informasi akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="oldUsername"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Username Saat ini
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="on"
                      type="text"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="newUsername"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Username Baru</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="on"
                      type="text"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Field>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Loading..." : "Update Username"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

function AccountResetPassword() {
  const [showPasswords, setShowPasswords] = React.useState<boolean>(false);
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<z.infer<typeof PasswordUpdateSchema>>({
    resolver: zodResolver(PasswordUpdateSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      newConfirmPassword: "",
    },
    mode: "onChange",
  });

  const onSubmit = (values: z.infer<typeof PasswordUpdateSchema>) => {
    startTransition(() => {
      updatePassword(values).then((data) => {
        if (data.ok) {
          form.reset();
          toast.success(data.message);
          setTimeout(() => {
            signOut();
          }, 500);
        } else {
          toast.error(data.message);
        }
      });
    });
  };
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Password</CardTitle>
        <CardDescription>
          Masukkan password saat ini dan password baru untuk memperbarui
          keamanan akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-6"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              name="oldPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Password Saat ini
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    autoComplete="on"
                    type={showPasswords ? "text" : "password"}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Controller
                name="newPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Password Baru</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="on"
                      type={showPasswords ? "text" : "password"}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="newConfirmPassword"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Konfirmasi Password Baru
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      autoComplete="on"
                      type={showPasswords ? "text" : "password"}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="show-password"
                type="checkbox"
                className="h-4 w-4"
                onChange={(e) => setShowPasswords(e.target.checked)}
              />
              <Label htmlFor="show-password" className="text-sm">
                Tampilkan password
              </Label>
            </div>

            <Field>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending ? "Loading..." : "Reset Password"}
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}

export {
  CreateUserForm,
  UpdateRoleForm,
  AccountForm,
  AccountResetUsername,
  AccountResetPassword,
};
