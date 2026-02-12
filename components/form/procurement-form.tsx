"use client";

import React, { useMemo, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
  FormProvider,
  useFormContext,
} from "react-hook-form";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { CustomSelect } from "./custom-select";
import { createProcurement } from "@/lib/server/action-server/procurement";
import {
  createProcurementSchema,
  type CreateProcurementValues,
} from "@/lib/validation/procurement-validation";
import type { TItemSelect } from "@/lib/type/type.item";
import type { TSupplier } from "@/lib/type/type.supplier";

interface IProcurementForm {
  items: TItemSelect[];
  suppliers: TSupplier[];
  onSuccess?: () => void;
  className?: React.ComponentProps<"form">["className"];
}

interface ProcurementItemRowProps {
  idx: number;
  items: TItemSelect[];
  selectedItemIds: string[];
  onRemove: () => void;
}

interface SupplierGroupProps {
  supplierId: string;
  suppliers: TSupplier[];
  items: TItemSelect[];
  formItems: CreateProcurementValues["items"];
  selectedItemIds: string[];
  onRemoveGroup: () => void;
}

function ProcurementItemRow({
  idx,
  items,
  selectedItemIds,
  onRemove,
}: Readonly<ProcurementItemRowProps>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<CreateProcurementValues>();

  const selectedItemId = useWatch({
    control,
    name: `items.${idx}.itemId`,
  });

  const itemMap = useMemo(
    () => new Map(items.map((i) => [i.idItem, i])),
    [items],
  );

  const selectedItem = selectedItemId ? itemMap.get(selectedItemId) : null;

  const availableItems = useMemo(() => {
    return items.filter(
      (item) =>
        !selectedItemIds.includes(item.idItem) ||
        item.idItem === selectedItemId,
    );
  }, [items, selectedItemIds, selectedItemId]);

  const fieldError = errors.items?.[idx];

  return (
    <div className="grid gap-4 rounded-lg border p-2 sm:grid-cols-[2fr,140px,auto] sm:items-end">
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <Controller
          name={`items.${idx}.itemId`}
          control={control}
          render={({ field, fieldState }) => (
            <CustomSelect
              items={availableItems}
              valueField="idItem"
              labelField="name"
              label="Bahan Baku"
              placeholder="Pilih Bahan Baku"
              field={field}
              fieldState={fieldState}
            />
          )}
        />

        <Controller
          name={`items.${idx}.qtyOrdered`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Jumlah Pesanan{" "}
                {selectedItem ? `(${selectedItem.unitName})` : ""}
              </FieldLabel>
              <Input
                {...field}
                type="number"
                step="0.01"
                min="0.01"
                aria-invalid={fieldState.invalid}
                placeholder="0"
              />
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />
      </div>

      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="w-full mt-2"
        onClick={onRemove}
        aria-label="Hapus item"
      >
        <Trash2 className="h-4 w-4" /> Hapus
      </Button>

      {fieldError && (
        <p className="text-sm text-destructive col-span-full">
          {fieldError.root?.message || fieldError.message}
        </p>
      )}
    </div>
  );
}

function SupplierGroup({
  supplierId,
  suppliers,
  items,
  formItems,
  selectedItemIds,
  onRemoveGroup,
}: Readonly<SupplierGroupProps>) {
  const { setValue } = useFormContext<CreateProcurementValues>();

  const supplier = useMemo(
    () => suppliers.find((s) => s.idSupplier === supplierId),
    [suppliers, supplierId],
  );

  const groupIndices = useMemo(() => {
    return formItems
      .map((item, idx) => (item.supplierId === supplierId ? idx : -1))
      .filter((idx) => idx !== -1);
  }, [formItems, supplierId]);

  const addItemToGroup = () => {
    const newItem = {
      itemId: "",
      supplierId: supplierId,
      qtyOrdered: "",
    };
    setValue("items", [...formItems, newItem]);
  };

  const removeItemFromGroup = (itemIdx: number) => {
    const newItems = formItems.filter((_, idx) => idx !== itemIdx);
    setValue("items", newItems);
  };

  const supplierInitial = supplier?.store?.[0]?.toUpperCase() || "?";
  const supplierName = supplier?.store || "Supplier";
  const itemCount = groupIndices.length;

  return (
    <div className="space-y-4 rounded-lg border-2 border-primary/20 p-5 bg-primary/5">
      <div className="flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="hidden md:flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <span className="text-lg font-semibold text-primary">
              {supplierInitial}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-base">{supplierName}</h4>
            <p className="text-sm text-muted-foreground">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItemToGroup}
          >
            <Plus className="h-4 w-4" />
            <span className="hidden md:block">Tambah</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onRemoveGroup}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden md:block">Hapus</span>
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {groupIndices.map((itemIdx) => (
          <ProcurementItemRow
            key={itemIdx}
            idx={itemIdx}
            items={items}
            selectedItemIds={selectedItemIds}
            onRemove={() => removeItemFromGroup(itemIdx)}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProcurementForm({
  items,
  suppliers,
  onSuccess,
  className,
}: Readonly<IProcurementForm>) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateProcurementValues>({
    resolver: zodResolver(createProcurementSchema),
    defaultValues: {
      items: [],
    },
    mode: "onChange",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  });

  const formItems = useMemo(() => {
    return watchedItems || [];
  }, [watchedItems]);

  const selectedItemIds = useMemo(() => {
    return formItems.map((item) => item.itemId).filter(Boolean);
  }, [formItems]);

  const groupedBySupplier = useMemo(() => {
    const groups = new Map<string, number[]>();
    formItems.forEach((item, idx) => {
      if (item.supplierId) {
        if (!groups.has(item.supplierId)) {
          groups.set(item.supplierId, []);
        }
        const group = groups.get(item.supplierId);
        if (group) {
          group.push(idx);
        }
      }
    });
    return groups;
  }, [formItems]);

  const addNewSupplierGroup = () => {
    const newItem = {
      itemId: "",
      supplierId: "",
      qtyOrdered: "",
    };
    form.setValue("items", [...formItems, newItem]);
  };

  const removeSupplierGroup = (supplierId: string) => {
    const newItems = formItems.filter((item) => item.supplierId !== supplierId);
    form.setValue("items", newItems);
  };

  const onSubmit = async (values: CreateProcurementValues) => {
    startTransition(async () => {
      const result = await createProcurement(values);

      if (result.ok) {
        toast.success(result.message);
        if (onSuccess) {
          onSuccess();
        }
        form.reset();
      } else {
        toast.error(result.message);
      }
    });
  };

  const supplierIds = Array.from(groupedBySupplier.keys());
  const itemsWithoutSupplier = formItems
    .map((item, idx) => (item.supplierId ? -1 : idx))
    .filter((idx) => idx !== -1);

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
      >
        <FieldGroup>
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-medium">Detail Bahan Baku</h3>
              </div>
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={addNewSupplierGroup}
                disabled={isPending}
              >
                <Plus className="h-4 w-4" />
                Tambah Supplier
              </Button>
            </div>

            {formItems.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground bg-muted">
                Belum ada supplier. Klik tombol di atas untuk menambahkan.
              </div>
            ) : (
              <div className="space-y-5">
                {itemsWithoutSupplier.map((itemIdx) => (
                  <div
                    key={itemIdx}
                    className="space-y-3 rounded-lg border-2 border-dashed border-muted-foreground/30 p-5"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-muted-foreground">
                        Pilih Supplier
                      </p>
                    </div>
                    <Controller
                      name={`items.${itemIdx}.supplierId`}
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <CustomSelect
                          items={suppliers}
                          valueField="idSupplier"
                          labelField="store"
                          label="Supplier"
                          placeholder="Pilih Supplier"
                          field={field}
                          fieldState={fieldState}
                        />
                      )}
                    />
                  </div>
                ))}

                {supplierIds.map((supplierId) => (
                  <SupplierGroup
                    key={supplierId}
                    supplierId={supplierId}
                    suppliers={suppliers}
                    items={items}
                    formItems={formItems}
                    selectedItemIds={selectedItemIds}
                    onRemoveGroup={() => removeSupplierGroup(supplierId)}
                  />
                ))}
              </div>
            )}

            {form.formState.errors.items && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.items.root?.message ||
                  form.formState.errors.items.message}
              </p>
            )}
          </div>

          <Separator className="my-3" />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Membuat Pengadaan..." : "Buat Pengadaan"}
          </Button>
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
