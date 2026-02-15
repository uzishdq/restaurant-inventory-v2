// components/forms/purchase-qc-form.tsx
"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useFieldArray,
  useForm,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ShoppingCart,
} from "lucide-react";
import { formatDateWIB } from "@/lib/helper";
import { TPurchase, TPurchaseItem } from "@/lib/type/type.procurement";
import {
  verifyPurchaseSchema,
  VerifyPurchaseValues,
} from "@/lib/validation/procurement-validation";
import { verifPurchase } from "@/lib/server/action-server/procurement";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constant";

interface PurchaseQCFormProps {
  purchase: TPurchase;
  className?: string;
}

// ============================================================================
// QC ITEM ROW COMPONENT
// ============================================================================
interface QCItemRowProps {
  itemIndex: number;
  purchaseItem: TPurchaseItem;
}

const QCItemRow = React.memo<QCItemRowProps>(({ itemIndex, purchaseItem }) => {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<VerifyPurchaseValues>();

  const fieldPath = `items.${itemIndex}` as const;
  const fieldError = errors.items?.[itemIndex];

  // Watch quantities
  const qtyReceived = Number.parseFloat(watch(`${fieldPath}.qtyReceived`)) || 0;
  const qtyDamaged = Number.parseFloat(watch(`${fieldPath}.qtyDamaged`)) || 0;
  const qtyOrdered = Number.parseFloat(purchaseItem.qtyOrdered);

  // Calculate status
  const totalProcessed = qtyReceived + qtyDamaged;
  const isComplete = totalProcessed === qtyOrdered;
  const isOverReceived = totalProcessed > qtyOrdered;
  const isUnderReceived = totalProcessed < qtyOrdered && totalProcessed > 0;

  const getStatusBadge = () => {
    if (isOverReceived) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          Kelebihan
        </Badge>
      );
    }
    if (isComplete && qtyDamaged === 0) {
      return (
        <Badge variant="default" className="gap-1 bg-green-100 text-green-800">
          <CheckCircle2 className="h-3 w-3" />
          Sesuai
        </Badge>
      );
    }
    if (isComplete && qtyDamaged > 0) {
      return (
        <Badge variant="secondary" className="gap-1">
          <AlertCircle className="h-3 w-3" />
          Ada Rusak
        </Badge>
      );
    }
    if (isUnderReceived) {
      return (
        <Badge
          variant="outline"
          className="gap-1 text-orange-600 border-orange-300"
        >
          <AlertCircle className="h-3 w-3" />
          Kurang
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        Belum Diisi
      </Badge>
    );
  };

  return (
    <div
      className={cn(
        "group relative rounded-lg border bg-card p-4 transition-all",
        isOverReceived &&
          "border-destructive bg-destructive/5 dark:bg-destructive/10",
        isComplete &&
          qtyDamaged === 0 &&
          "border-green-300 bg-green-50/50 dark:border-green-700 dark:bg-green-950/30",
        isComplete &&
          qtyDamaged > 0 &&
          "border-yellow-300 bg-yellow-50/50 dark:border-yellow-700 dark:bg-yellow-950/30",
        !isComplete &&
          totalProcessed > 0 &&
          "border-orange-300 bg-orange-50/50 dark:border-orange-700 dark:bg-orange-950/30",
      )}
    >
      {/* Hidden Fields */}
      <Controller
        name={`${fieldPath}.itemId`}
        control={control}
        defaultValue={purchaseItem.itemId}
        render={({ field }) => <input type="hidden" {...field} />}
      />

      <div className="space-y-4">
        {/* Item Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-semibold text-sm leading-tight">
                {purchaseItem.itemName}
              </h4>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {purchaseItem.categoryName}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Dipesan: {Number(purchaseItem.qtyOrdered).toFixed(2)}{" "}
                  {purchaseItem.unitName}
                </span>
              </div>
            </div>
          </div>
          {getStatusBadge()}
        </div>

        {/* QC Inputs */}
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Qty Ordered (Read-only) */}
          <Field>
            <FieldLabel className="text-xs">Jumlah Dipesan</FieldLabel>
            <div className="relative">
              <Input
                value={Number(purchaseItem.qtyOrdered).toFixed(2)}
                disabled
                className="bg-muted/50 pr-16"
              />
              <span className="absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                {purchaseItem.unitName}
              </span>
            </div>
          </Field>

          {/* Qty Received */}
          <Controller
            name={`${fieldPath}.qtyReceived`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs">
                  Diterima Baik <span className="text-destructive">*</span>
                </FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    className={cn(
                      "pr-16 font-mono",
                      fieldState.invalid && "border-destructive",
                    )}
                    placeholder="0.00"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                    {purchaseItem.unitName}
                  </span>
                </div>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          {/* Qty Damaged */}
          <Controller
            name={`${fieldPath}.qtyDamaged`}
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel className="text-xs">
                  Rusak / Tidak Sesuai{" "}
                  <span className="text-destructive">*</span>
                </FieldLabel>
                <div className="relative">
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    min="0"
                    className={cn(
                      "pr-16 font-mono",
                      fieldState.invalid && "border-destructive",
                    )}
                    placeholder="0.00"
                  />
                  <span className="absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
                    {purchaseItem.unitName}
                  </span>
                </div>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />
        </div>

        {/* Summary Info */}
        <div className="rounded-md bg-muted/50 px-3 py-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total Diperiksa:</span>
            <span className="font-semibold">
              {totalProcessed.toFixed(2)} / {qtyOrdered.toFixed(2)}{" "}
              {purchaseItem.unitName}
            </span>
          </div>
          {isOverReceived && (
            <p className="mt-1 text-destructive">
              ⚠️ Total melebihi pesanan (+
              {(totalProcessed - qtyOrdered).toFixed(2)}){" "}
              {purchaseItem.unitName}
            </p>
          )}
          {isUnderReceived && totalProcessed > 0 && (
            <p className="mt-1 text-orange-600">
              ⚠️ Total kurang dari pesanan (-
              {(qtyOrdered - totalProcessed).toFixed(2)}){" "}
              {purchaseItem.unitName}
            </p>
          )}
        </div>

        {fieldError?.root && (
          <p className="text-sm text-destructive">{fieldError.root.message}</p>
        )}
      </div>
    </div>
  );
});

QCItemRow.displayName = "QCItemRow";

// ============================================================================
// MAIN FORM COMPONENT
// ============================================================================
export default function PurchaseQCForm({
  purchase,
  className,
}: Readonly<PurchaseQCFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<VerifyPurchaseValues>({
    resolver: zodResolver(verifyPurchaseSchema),
    defaultValues: {
      purchaseId: purchase.idPurchase,
      items: purchase.purchaseItems.map((item) => ({
        itemId: item.itemId,
        qtyOrdered: item.qtyOrdered,
        qtyReceived: item.qtyOrdered,
        qtyDamaged: "0",
      })),
    },
    mode: "onChange",
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const onSubmit = async (values: VerifyPurchaseValues) => {
    startTransition(async () => {
      const result = await verifPurchase(values);
      if (result.ok) {
        toast.success(result.message);
        form.reset();
        router.push(ROUTES.AUTH.PURCHASE.INDEX);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("space-y-6", className)}
      >
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold">
              Quality Control Penerimaan
            </h3>
            <p className="text-sm text-muted-foreground">
              Periksa dan input jumlah barang yang diterima
            </p>
          </div>
        </div>

        {/* Purchase Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Informasi Purchase Order
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">No. PO</span>
              <p className="font-medium">{purchase.idPurchase}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Supplier</span>
              <p className="font-medium">{purchase.supplierStore}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Tanggal PO</span>
              <p className="font-medium">{formatDateWIB(purchase.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Total Bahan baku</span>
              <p className="font-medium">{purchase.totalItems}</p>
            </div>
          </CardContent>
        </Card>

        {/* QC Items */}
        <FieldGroup>
          <div className="space-y-3">
            {fields.map((field, index) => {
              const purchaseItem = purchase.purchaseItems[index];
              return (
                <QCItemRow
                  key={field.id}
                  itemIndex={index}
                  purchaseItem={purchaseItem}
                />
              );
            })}
          </div>

          {form.formState.errors.items && (
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3">
              <p className="text-sm text-destructive">
                {form.formState.errors.items.root?.message ||
                  form.formState.errors.items.message ||
                  "Terdapat kesalahan pada data QC"}
              </p>
            </div>
          )}
        </FieldGroup>

        <Separator />

        {/* Submit Section */}
        <div className="sticky bottom-0 rounded-lg bg-background p-4 shadow-lg dark:shadow-gray-900/50 space-y-3 border dark:border-gray-800">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="flex gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium">Catatan Penting:</p>
                <ul className="mt-1 list-inside list-disc space-y-0.5 text-xs">
                  <li>
                    Pastikan jumlah yang diterima + rusak sesuai dengan pesanan
                  </li>
                  <li>Data QC tidak dapat diubah setelah disimpan</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isPending || !form.formState.isValid}
          >
            {isPending ? (
              <span className="mr-2">Loading...</span>
            ) : (
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Simpan Hasil QC
              </span>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
