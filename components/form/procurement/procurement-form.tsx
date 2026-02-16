"use client";

import React, { useMemo, useTransition, useCallback } from "react";
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, AlertCircle, Package } from "lucide-react";
import type { TItemSelect } from "@/lib/type/type.item";
import {
  createProcurementSchema,
  CreateProcurementValues,
} from "@/lib/validation/procurement-validation";
import { createProcurement } from "@/lib/server/action-server/procurement";
import { CustomSelect } from "../custom-select";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constant";

interface IProcurementForm {
  items: TItemSelect[];
  className?: React.ComponentProps<"form">["className"];
}

interface ProcurementItemRowProps {
  idx: number;
  items: TItemSelect[];
  selectedItemIds: string[];
  onRemove: () => void;
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

  const isLowStock =
    selectedItem && Number.parseFloat(selectedItem.currentStock || "0") === 0;

  const fieldError = errors.items?.[idx];

  return (
    <div className="group relative rounded-lg border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-sm">
      <div className="space-y-4">
        {/* Item Selection */}
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name={`items.${idx}.itemId`}
            control={control}
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <CustomSelect
                  items={availableItems}
                  valueField="idItem"
                  labelField="name"
                  label="Bahan Baku"
                  placeholder="Pilih Bahan Baku"
                  field={field}
                  fieldState={fieldState}
                />
                {selectedItem && (
                  <div className="flex items-center gap-2 text-xs">
                    <Package className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      Stok saat ini:{" "}
                      <span
                        className={cn(
                          "font-medium",
                          isLowStock ? "text-destructive" : "text-foreground",
                        )}
                      >
                        {selectedItem.currentStock || "0"}{" "}
                        {selectedItem.unitName || "unit"}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}
          />

          <Controller
            name={`items.${idx}.qtyRequested`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>
                  Jumlah Pesanan{" "}
                  {selectedItem?.unitName ? `(${selectedItem.unitName})` : ""}
                </FieldLabel>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0.01"
                  aria-invalid={fieldState.invalid}
                  placeholder="0.00"
                  className="font-mono"
                />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />
        </div>

        {/* Notes */}
        <Controller
          name={`items.${idx}.notes`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>Catatan (Opsional)</FieldLabel>
              <Textarea
                {...field}
                placeholder="Tambahkan catatan untuk item ini..."
                className="resize-none"
                rows={2}
              />
              <FieldError
                errors={fieldState.error ? [fieldState.error] : undefined}
              />
            </Field>
          )}
        />

        {/* Low Stock Alert */}
        {isLowStock && (
          <div className="flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Stok bahan baku ini habis. Pastikan jumlah pesanan sudah sesuai
              kebutuhan.
            </p>
          </div>
        )}

        {/* Error Message */}
        {fieldError && (
          <p className="text-sm text-destructive">
            {fieldError.root?.message || fieldError.message}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <Button
        type="button"
        variant="destructive"
        size="icon"
        className="absolute -right-2 -top-2 h-10 w-10 rounded-full border"
        onClick={onRemove}
        aria-label="Hapus item"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default function ProcurementForm({
  items,
  className,
}: Readonly<IProcurementForm>) {
  const router = useRouter();
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

  // Filter items with low/zero stock
  const lowStockItems = useMemo(() => {
    return items.filter((item) => {
      const currentStock = Number.parseFloat(item.currentStock || "0");
      const minStock = Number.parseFloat(item.minStock || "0");

      // Include items that are out of stock OR below minimum
      return currentStock === 0 || currentStock < minStock;
    });
  }, [items]);

  const addNewItem = useCallback(() => {
    const newItem = {
      itemId: "",
      qtyRequested: "",
      notes: "",
    };
    form.setValue("items", [...formItems, newItem]);
  }, [form, formItems]);

  const addLowStockItems = useCallback(() => {
    const lowStockItemsToAdd = lowStockItems
      .filter((item) => !selectedItemIds.includes(item.idItem))
      .map((item) => {
        const currentStock = Number.parseFloat(item.currentStock || "0");
        const minStock = Number.parseFloat(item.minStock || "0");

        // Calculate suggested quantity (difference to reach min stock)
        const suggestedQty =
          currentStock === 0
            ? minStock.toString()
            : (minStock - currentStock).toString();

        return {
          itemId: item.idItem,
          qtyRequested: suggestedQty,
          notes:
            currentStock === 0
              ? "Stok habis"
              : `Stok rendah (${currentStock}/${minStock}) ${item.unitName}`,
        };
      });

    if (lowStockItemsToAdd.length === 0) {
      toast.info(
        "Semua bahan baku dengan stok rendah/kosong sudah ditambahkan",
      );
      return;
    }

    form.setValue("items", [...formItems, ...lowStockItemsToAdd]);
    toast.success(
      `${lowStockItemsToAdd.length} bahan baku dengan stok rendah/kosong ditambahkan`,
    );
  }, [lowStockItems, selectedItemIds, form, formItems]);

  const removeItem = useCallback(
    (itemIdx: number) => {
      const newItems = formItems.filter((_, idx) => idx !== itemIdx);
      form.setValue("items", newItems);
    },
    [form, formItems],
  );

  const onSubmit = async (values: CreateProcurementValues) => {
    startTransition(async () => {
      const result = await createProcurement(values);
      if (result.ok) {
        toast.success(result.message);
        form.reset();
        router.push(ROUTES.AUTH.PROCUREMENT.INDEX);
      } else {
        toast.error(result.message);
      }
    });
  };

  const availableLowStockCount = lowStockItems.filter(
    (item) => !selectedItemIds.includes(item.idItem),
  ).length;

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
      >
        {/* Header Section */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row  items-center justify-center sm:justify-between gap-3">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-semibold">Pengadaan Bahan Baku</h3>
              <p className="text-sm text-muted-foreground">
                Tambahkan bahan baku yang akan dipesan
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableLowStockCount > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addLowStockItems}
                  disabled={isPending}
                  className="border-destructive/50 text-destructive hover:bg-destructive/10"
                >
                  <AlertCircle className="h-4 w-4" />
                  Tambah Stok Rendah/Habis ({availableLowStockCount})
                </Button>
              )}
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={addNewItem}
                disabled={isPending}
              >
                <Plus className="h-4 w-4" />
                Tambah Item
              </Button>
            </div>
          </div>

          {/* Summary Stats */}
          {formItems.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="rounded-lg border bg-card p-3">
                <p className="text-xs text-muted-foreground">Total Pengajuan</p>
                <p className="text-2xl font-semibold">{formItems.length}</p>
              </div>
              <div className="rounded-lg border bg-destructive/10 p-3">
                <p className="text-xs text-muted-foreground">Stok Habis</p>
                <p className="text-2xl font-semibold text-destructive">
                  {
                    formItems.filter((item) => {
                      const selected = items.find(
                        (i) => i.idItem === item.itemId,
                      );
                      return (
                        selected &&
                        Number.parseFloat(selected.currentStock || "0") === 0
                      );
                    }).length
                  }
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="space-y-4">
          {formItems.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed bg-muted/50 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h4 className="mt-4 text-sm font-medium">
                Belum ada data yang ditambahkan
              </h4>
              <p className="mt-2 text-sm text-muted-foreground">
                Klik tombol di atas untuk menambahkan bahan baku
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {formItems.map((_, idx) => (
                <ProcurementItemRow
                  key={`${idx}-item-${_.itemId}`}
                  idx={idx}
                  items={items}
                  selectedItemIds={selectedItemIds}
                  onRemove={() => removeItem(idx)}
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

        {/* Submit Button */}
        <div className="sticky bottom-0 rounded-lg border bg-background p-4 shadow-lg">
          <Button
            type="submit"
            className="w-full"
            disabled={isPending || formItems.length === 0}
            size="lg"
          >
            {isPending ? "Loading..." : "Ajukan Pengadaan Bahan Baku"}
          </Button>
          {formItems.length === 0 && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Tambahkan minimal 1 pengajuan untuk melanjutkan
            </p>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
