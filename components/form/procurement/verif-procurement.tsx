"use client";

import React, { useMemo, useCallback } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useFieldArray,
  useForm,
  FormProvider,
  useFormContext,
  useWatch,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Store,
  Trash2,
  Package,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
} from "lucide-react";
import type { TSupplier } from "@/lib/type/type.supplier";
import type {
  TProcerement,
  TProcerementItem,
} from "@/lib/type/type.procurement";
import {
  verifyProcurementSchema,
  VerifyProcurementValues,
} from "@/lib/validation/procurement-validation";
import { CustomSelect } from "../custom-select";
import { DialogAssignItems } from "./dialog-assign-procurement";
import { formatDateWIB } from "@/lib/helper";

interface ProcurementApprovalFormProps {
  procurement: TProcerement;
  suppliers: TSupplier[];
  className?: string;
}

// ============================================================================
// SUPPLIER ITEM ROW COMPONENT
// ============================================================================
interface SupplierItemRowProps {
  supplierIndex: number;
  itemIndex: number;
  procurementItem: TProcerementItem;
  onRemove: () => void;
}

const SupplierItemRow = React.memo<SupplierItemRowProps>(
  ({ supplierIndex, itemIndex, procurementItem, onRemove }) => {
    const {
      control,
      formState: { errors },
    } = useFormContext<VerifyProcurementValues>();

    const fieldPath =
      `assignments.${supplierIndex}.items.${itemIndex}` as const;
    const fieldError = errors.assignments?.[supplierIndex]?.items?.[itemIndex];

    return (
      <div className="group relative rounded-lg border bg-card p-4 transition-colors hover:border-primary/50">
        {/* Hidden Fields */}
        <Controller
          name={`${fieldPath}.itemId`}
          control={control}
          render={({ field }) => <input type="hidden" {...field} />}
        />
        <Controller
          name={`${fieldPath}.procurementItemId`}
          control={control}
          render={({ field }) => <input type="hidden" {...field} />}
        />

        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          {/* ITEM INFORMATION */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <p className="font-medium text-sm leading-tight">
                  {procurementItem.itemName}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <span className="font-medium">Kategori:</span>
                    {procurementItem.categoryName}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="font-medium">Diminta:</span>
                    <Badge variant="outline" className="h-5 px-1.5 text-xs">
                      {procurementItem.qtyRequested} {procurementItem.unitName}
                    </Badge>
                  </span>
                </div>
                {procurementItem.notes && (
                  <p className="mt-2 text-xs italic text-muted-foreground">
                    💬 {procurementItem.notes}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* QUANTITY INPUT + REMOVE */}
          <div className="flex items-end gap-2 shrink-0">
            <Controller
              name={`${fieldPath}.qtyOrdered`}
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel className="text-xs">
                    Jumlah Pesanan {`(${procurementItem.unitName})`}
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
        </div>

        {fieldError?.root && (
          <p className="mt-2 text-sm text-destructive">
            {fieldError.root.message}
          </p>
        )}
      </div>
    );
  },
);

SupplierItemRow.displayName = "SupplierItemRow";

// ============================================================================
// SUPPLIER GROUP CARD COMPONENT
// ============================================================================
interface SupplierGroupCardProps {
  supplierIndex: number;
  suppliers: TSupplier[];
  procurementItems: TProcerementItem[];
  onRemove: () => void;
}

const SupplierGroupCard = React.memo<SupplierGroupCardProps>(
  ({ supplierIndex, suppliers, procurementItems, onRemove }) => {
    const { control } = useFormContext<VerifyProcurementValues>();

    const { fields, append, remove } = useFieldArray({
      control,
      name: `assignments.${supplierIndex}.items`,
    });

    const selectedSupplierId = useWatch({
      control,
      name: `assignments.${supplierIndex}.supplierId`,
    });

    const allAssignments = useWatch({
      control,
      name: "assignments",
    });

    // Get all assigned item IDs (including current supplier)
    const assignedItemIds = useMemo(() => {
      const ids = new Set<string>();

      if (!Array.isArray(allAssignments)) {
        return ids;
      }

      allAssignments.forEach((assignment) => {
        if (assignment?.items && Array.isArray(assignment.items)) {
          assignment.items.forEach((item) => {
            if (item?.procurementItemId) {
              ids.add(item.procurementItemId);
            }
          });
        }
      });

      return ids;
    }, [allAssignments]); // Remove supplierIndex dari dependencies

    // Get available items for this supplier
    const availableItems = useMemo(() => {
      if (!Array.isArray(procurementItems)) {
        return [];
      }

      return procurementItems.filter((item) => {
        if (!item?.idProcurementItem) {
          return false;
        }

        // Item is available if it's not assigned to ANY supplier (including current)
        return !assignedItemIds.has(item.idProcurementItem);
      });
    }, [procurementItems, assignedItemIds]);

    const selectedSupplier = useMemo(() => {
      if (!selectedSupplierId || !Array.isArray(suppliers)) {
        return null;
      }
      return suppliers.find((s) => s.idSupplier === selectedSupplierId) ?? null;
    }, [selectedSupplierId, suppliers]);

    const handleAssignItems = useCallback(
      (itemIds: string[]) => {
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
          return;
        }

        let successCount = 0;

        itemIds.forEach((itemId) => {
          const procItem = procurementItems.find(
            (i) => i.idProcurementItem === itemId,
          );

          if (procItem) {
            append({
              procurementItemId: itemId,
              itemId: procItem.itemId,
              qtyOrdered: procItem.qtyRequested,
            });
            successCount++;
          }
        });

        if (successCount > 0) {
          toast.success(
            `${successCount} item berhasil ditambahkan ke ${selectedSupplier?.store ?? "supplier"}`,
          );
        }
      },
      [procurementItems, append, selectedSupplier?.store],
    );

    return (
      <Card className="overflow-hidden border-2">
        {selectedSupplier ? (
          <CardHeader className="border-b bg-muted/30 py-4">
            <div className="flex flex-row items-center justify-between gap-6">
              {/* LEFT */}
              <div className="min-w-0 space-y-1">
                {/* Store (utama) */}
                <CardTitle className="text-base font-semibold truncate">
                  {selectedSupplier.store}
                </CardTitle>

                {/* Name */}
                <p className="text-sm text-muted-foreground truncate">
                  {selectedSupplier.name}
                </p>

                {/* Address + Phone dalam 1 baris kecil */}
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  {selectedSupplier.address && (
                    <span className="truncate max-w-75">
                      {selectedSupplier.address}
                    </span>
                  )}

                  {selectedSupplier.phone && (
                    <span className="whitespace-nowrap">
                      • {selectedSupplier.phone}
                    </span>
                  )}
                </div>
              </div>

              {/* RIGHT */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={onRemove}
                className="shrink-0 self-start"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </Button>
            </div>
          </CardHeader>
        ) : (
          <CardContent className="space-y-4">
            {/* Supplier Selection */}
            <Controller
              name={`assignments.${supplierIndex}.supplierId`}
              control={control}
              render={({ field, fieldState }) => (
                <CustomSelect
                  items={suppliers}
                  valueField="idSupplier"
                  labelField="store"
                  label="Pilih Supplier"
                  placeholder="Pilih supplier untuk purchase order"
                  field={field}
                  fieldState={fieldState}
                />
              )}
            />
          </CardContent>
        )}

        <CardContent className="space-y-4">
          {/* Items Section */}
          {selectedSupplierId && (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">Daftar Bahan Baku</p>
                  <p className="text-xs text-muted-foreground">
                    {fields.length} item dipilih • {availableItems.length}{" "}
                    tersedia
                  </p>
                </div>
                <DialogAssignItems
                  supplierId={selectedSupplierId}
                  supplierName={selectedSupplier?.store ?? "Supplier"}
                  availableItems={availableItems}
                  onAssign={handleAssignItems}
                />
              </div>

              {/* Items List */}
              {fields.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                  <ShoppingCart className="mb-3 h-8 w-8 text-muted-foreground/50" />
                  <p className="mb-1 text-sm font-medium text-muted-foreground">
                    Belum ada item
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Klik tombol Assign Item untuk menambahkan
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {fields.map((field, itemIndex) => {
                    const procItem = procurementItems.find(
                      (i) => i.idProcurementItem === field.procurementItemId,
                    );

                    if (!procItem) {
                      return null;
                    }

                    return (
                      <SupplierItemRow
                        key={field.id}
                        supplierIndex={supplierIndex}
                        itemIndex={itemIndex}
                        procurementItem={procItem}
                        onRemove={() => remove(itemIndex)}
                      />
                    );
                  })}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  },
);

SupplierGroupCard.displayName = "SupplierGroupCard";

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================
export default function ProcurementApprovalForm({
  procurement,
  suppliers = [],
  className,
}: Readonly<ProcurementApprovalFormProps>) {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<VerifyProcurementValues>({
    resolver: zodResolver(verifyProcurementSchema),
    defaultValues: {
      procurementId: procurement.idProcurement,
      assignments: [],
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "assignments",
  });

  const watchedAssignments = useWatch({
    control: form.control,
    name: "assignments",
  });

  // Calculate assignment statistics
  const stats = useMemo(() => {
    const totalItems = procurement.procurementItem.length;
    const assignedIds = new Set<string>();

    if (Array.isArray(watchedAssignments)) {
      watchedAssignments.forEach((assignment) => {
        if (assignment?.items && Array.isArray(assignment.items)) {
          assignment.items.forEach((item) => {
            if (item?.procurementItemId) {
              assignedIds.add(item.procurementItemId);
            }
          });
        }
      });
    }

    const assignedCount = assignedIds.size;
    const unassignedCount = totalItems - assignedCount;
    const completionPercentage =
      totalItems > 0 ? Math.round((assignedCount / totalItems) * 100) : 0;

    return {
      totalItems,
      assignedCount,
      unassignedCount,
      completionPercentage,
      isComplete: unassignedCount === 0 && totalItems > 0,
    };
  }, [procurement.procurementItem.length, watchedAssignments]);

  const handleSubmit = useCallback(
    (values: VerifyProcurementValues) => {
      const flatAssignments = values.assignments.flatMap((assignment) =>
        assignment.items.map((item) => ({
          procurementItemId: item.procurementItemId,
          supplierId: assignment.supplierId,
          qtyOrdered: item.qtyOrdered,
        })),
      );

      startTransition(async () => {
        console.log("📦 Procurement Approval Submitted:", {
          procurementId: values.procurementId,
          totalAssignments: flatAssignments.length,
          assignments: flatAssignments,
        });

        // TODO: Uncomment when API is ready
        // const result = await approveProcurement({
        //   procurementId: values.procurementId,
        //   assignments: flatAssignments,
        // });

        // if (result.ok) {
        //   toast.success(result.message);
        //   onSuccess?.();
        //   form.reset();
        // } else {
        //   toast.error(result.message);
        // }
      });
    },
    [form],
  );

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-6", className)}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold">
              Verifikasi Pengadaan Bahan Baku
            </h3>
            <p className="text-sm text-muted-foreground">
              Tetapkan supplier untuk bahan baku dan buat pesanan pembelian.
            </p>
          </div>
          {!stats.isComplete && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  supplierId: "",
                  items: [],
                })
              }
            >
              <Store className="mr-2 h-4 w-4" />
              Tambah Supplier
            </Button>
          )}
        </div>
        {/* Progress Indicator */}
        {stats.totalItems > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {stats.isComplete ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                  )}
                  <span className="text-sm font-medium">
                    Progress Verifikasi
                  </span>
                </div>
                <Badge
                  variant={stats.isComplete ? "default" : "secondary"}
                  className="font-semibold"
                >
                  {stats.assignedCount} / {stats.totalItems}
                </Badge>
              </div>

              <div className="relative h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className={cn(
                    "h-full transition-all duration-500",
                    (() => {
                      if (stats.isComplete) return "bg-green-500";
                      if (stats.assignedCount > 0) return "bg-primary";
                      return "bg-muted-foreground/20";
                    })(),
                  )}
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {stats.isComplete ? (
                  <span className="text-green-600 font-medium">
                    ✓ Semua bahan baku sudah diverifikasi
                  </span>
                ) : (
                  <span>
                    {stats.unassignedCount} bahan baku belum diverifikasi
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" /> Detail Pengadaan
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">No.Pengadaan</span>
              <p className="font-medium">{procurement.idProcurement}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tanggal</span>
              <p className="font-medium">
                {formatDateWIB(procurement.createdAt)}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Pemohon</span>
              <p className="font-medium">{procurement.requestedBy}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total</span>
              <p className="font-medium">
                {procurement.procurementItem.length}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Supplier Cards */}
        <FieldGroup>
          {fields.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-12 text-center">
              <Store className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Belum ada supplier
              </p>
              <p className="mb-4 text-xs text-muted-foreground">
                Klik tombol Tambah Supplier untuk mulai
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({
                    supplierId: "",
                    items: [],
                  })
                }
              >
                <Store className="mr-2 h-4 w-4" />
                Tambah Supplier
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <SupplierGroupCard
                  key={field.id}
                  supplierIndex={index}
                  suppliers={suppliers}
                  procurementItems={procurement.procurementItem}
                  onRemove={() => remove(index)}
                />
              ))}
            </div>
          )}

          {form.formState.errors.assignments && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {form.formState.errors.assignments.root?.message ||
                  form.formState.errors.assignments.message ||
                  "Terdapat kesalahan pada assignment"}
              </p>
            </div>
          )}
        </FieldGroup>

        <Separator />

        {/* Submit Section */}
        <div className="sticky bottom-0 rounded-lg border bg-background p-4 shadow-lg space-y-3">
          {!stats.isComplete && stats.totalItems > 0 && fields.length > 0 && (
            <div className="rounded-md border border-orange-200 bg-orange-50 p-3">
              <div className="flex items-center justify-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-orange-600" />
                <p className="text-sm text-orange-800">
                  Masih ada <strong>{stats.unassignedCount} bahan baku</strong>{" "}
                  yang belum diverifikasi.
                </p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || !stats.isComplete}
          >
            {isPending ? (
              <span className="mr-2">Loading...</span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Setujui & Buat Pesanan Pembelian
              </span>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
