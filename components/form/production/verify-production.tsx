"use client";

import { useCallback, useMemo, useTransition } from "react";
import {
  useFieldArray,
  useForm,
  Controller,
  useWatch,
  UseFormReturn,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Info,
  CookingPot,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BadgeCustom } from "@/components/column/badge-custom";
import { cn } from "@/lib/utils";
import {
  verifyProductionSchema,
  type VerifyProductionValues,
} from "@/lib/validation/procurement-validation";
import type {
  StockCheckResult,
  TProcerement,
  TProcerementItem,
} from "@/lib/type/type.procurement";
import type { TItemSelect } from "@/lib/type/type.item";
import { calculateStockCheck, getSummaryStats } from "@/lib/helper";
import { verifProduction } from "@/lib/server/action-server/production";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constant";

interface VerifyProductionFormProps {
  data: TProcerement;
  items: TItemSelect[];
}

// ════════════════════════════════════════════
// Main Form Component
// ════════════════════════════════════════════
export default function VerifyProductionForm({
  data,
  items,
}: Readonly<VerifyProductionFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const itemMap = useMemo(
    () => new Map(items.map((i) => [i.idItem, i])),
    [items],
  );

  const form = useForm<VerifyProductionValues>({
    resolver: zodResolver(verifyProductionSchema),
    defaultValues: {
      procurementId: data.idProcurement,
      orders: data.procurementItem.map((item) => ({
        procurementItemId: item.idProcurementItem,
        itemId: item.itemId,
        qtyTarget: item.qtyRequested,
        scheduledDate: "",
        notes: item.notes === "-" ? "-" : item.notes,
      })),
    },
    mode: "onChange",
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "orders",
  });

  const watchedOrders = useWatch({
    control: form.control,
    name: "orders",
  });

  // Calculate all stock checks for summary
  const allStockChecks = useMemo(() => {
    return data.procurementItem.map((item, idx) => {
      const itemDetail = itemMap.get(item.itemId);
      const qtyTarget = watchedOrders?.[idx]?.qtyTarget ?? item.qtyRequested;
      return calculateStockCheck(itemDetail, qtyTarget);
    });
  }, [data.procurementItem, itemMap, watchedOrders]);

  const summary = useMemo(
    () => getSummaryStats(allStockChecks),
    [allStockChecks],
  );

  const onSubmit = useCallback(
    (values: VerifyProductionValues) => {
      startTransition(async () => {
        const result = await verifProduction(values);
        if (result.ok) {
          toast.success(result.message, {
            description:
              summary.draft > 0
                ? `${summary.scheduled} SCHEDULED, ${summary.draft} DRAFT (menunggu stock)`
                : `${summary.scheduled} production order siap dijadwalkan`,
          });
          router.push(ROUTES.AUTH.PRODUCTION.INDEX);
        } else {
          toast.error(result.message);
        }
      });
    },
    [summary, router],
  );

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Header Info - simplified */}
      <Alert
        variant="default"
        className="border-blue-500 bg-blue-50 dark:bg-blue-900/10"
      >
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800 dark:text-blue-400 space-y-1">
          <p className="font-medium">Informasi Status Produksi:</p>
          <ul className="text-xs space-y-1 list-disc list-inside">
            <li>
              <Badge className="bg-blue-500 text-xs mr-1">SCHEDULED</Badge>
              Bahan baku mencukupi, siap untuk diproduksi
            </li>
            <li>
              <Badge variant="outline" className="text-xs mr-1">
                DRAFT
              </Badge>
              Bahan baku belum mencukupi, perlu pengadaan tambahan
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Summary Stats */}
      {watchedOrders && watchedOrders.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-3">
            <p className="text-xs text-muted-foreground">Total Order</p>
            <p className="text-2xl font-bold">{data.procurementItem.length}</p>
          </div>
          <div className="rounded-lg border bg-blue-50 dark:bg-blue-900/10 p-3">
            <p className="text-xs text-muted-foreground">Siap SCHEDULED</p>
            <p className="text-2xl font-bold text-blue-600">
              {summary.scheduled}
            </p>
          </div>
          <div className="rounded-lg border bg-orange-50 dark:bg-orange-900/10 p-3">
            <p className="text-xs text-muted-foreground">DRAFT</p>
            <p className="text-2xl font-bold text-orange-600">
              {summary.draft}
            </p>
          </div>
        </div>
      )}

      {/* Production Orders */}
      <div className="space-y-4">
        {fields.map((field, idx) => {
          const procurementItem = data.procurementItem[idx];
          const itemDetail = itemMap.get(procurementItem.itemId);

          return (
            <ProductionOrderCard
              key={field.id}
              idx={idx}
              procurementItem={procurementItem}
              itemDetail={itemDetail}
              form={form}
            />
          );
        })}
      </div>

      {/* Submit */}
      <div className="sticky bottom-0 rounded-lg border bg-background p-4 shadow-lg space-y-2">
        {summary.draft > 0 && (
          <p className="text-xs text-center text-muted-foreground mb-2">
            <span className="text-orange-600 font-medium">
              {summary.draft} order
            </span>{" "}
            memerlukan pengadaan bahan baku tambahan
          </p>
        )}
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          <CookingPot className="mr-2 h-4 w-4" />
          {isPending ? "Loading..." : "Verifikasi Produksi"}
        </Button>
      </div>
    </form>
  );
}

// ════════════════════════════════════════════
// Helper Render Functions
// ════════════════════════════════════════════
function renderStockStatusIndicator(
  stockCheck: StockCheckResult | null,
): React.ReactNode {
  if (!stockCheck) return null;

  if (stockCheck.noBom) {
    return (
      <div className="flex items-center gap-1 text-yellow-600 text-xs font-medium">
        <AlertTriangle className="h-4 w-4" />
        <span>Tidak ada BOM</span>
      </div>
    );
  }

  if (stockCheck.canSchedule) {
    return (
      <div className="flex items-center gap-1 text-green-600 text-xs font-medium">
        <CheckCircle2 className="h-4 w-4" />
        <span>Siap Dijadwalkan</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-orange-600 text-xs font-medium">
      <AlertTriangle className="h-4 w-4" />
      <span>Stok Tidak Cukup</span>
    </div>
  );
}

function renderStatusPreview(
  stockCheck: StockCheckResult | null,
): React.ReactNode {
  if (!stockCheck) {
    return (
      <Badge variant="outline" className="text-muted-foreground">
        Masukkan jumlah target
      </Badge>
    );
  }

  if (stockCheck.noBom) {
    return (
      <div className="flex items-center gap-1.5">
        <Badge variant="outline">DRAFT</Badge>
        <span className="text-xs text-muted-foreground">(tidak ada BOM)</span>
      </div>
    );
  }

  if (stockCheck.canSchedule) {
    return <Badge className="bg-blue-500">SCHEDULED</Badge>;
  }

  // Stock tidak cukup → hanya DRAFT, tanpa keterangan otomatis
  return <Badge variant="outline">DRAFT</Badge>;
}

// ════════════════════════════════════════════
// Production Order Card Component
// ════════════════════════════════════════════
interface ProductionOrderCardProps {
  idx: number;
  procurementItem: TProcerementItem;
  itemDetail: TItemSelect | undefined;
  form: UseFormReturn<VerifyProductionValues>;
}

function ProductionOrderCard({
  idx,
  procurementItem,
  itemDetail,
  form,
}: Readonly<ProductionOrderCardProps>) {
  const {
    control,
    formState: { errors },
  } = form;

  const qtyTarget = useWatch({
    control,
    name: `orders.${idx}.qtyTarget`,
  });

  const stockCheck = useMemo(
    () => calculateStockCheck(itemDetail, qtyTarget),
    [itemDetail, qtyTarget],
  );

  const fieldError = (errors.orders ?? [])[idx];

  const cardBorderClass = useMemo(() => {
    if (!stockCheck) return "border";
    if (stockCheck.noBom) return "border-yellow-400";
    if (stockCheck.canSchedule) return "border-green-400";
    return "border-orange-400";
  }, [stockCheck]);

  const stockStatusIndicator = renderStockStatusIndicator(stockCheck);
  const statusPreview = renderStatusPreview(stockCheck);

  // ← Scheduled date only enabled if stock is enough
  const isScheduleDateEnabled = stockCheck?.canSchedule === true;

  return (
    <div className={cn("rounded-lg bg-card p-4 space-y-4", cardBorderClass)}>
      {/* Item Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-2">
            <CookingPot className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{procurementItem.itemName}</span>
              <BadgeCustom
                value={procurementItem.itemType}
                category="typeItem"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              {procurementItem.categoryName}
            </p>
          </div>
        </div>

        {/* Stock Status Indicator */}
        <div className="shrink-0">{stockStatusIndicator}</div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Qty Target */}
        <Controller
          name={`orders.${idx}.qtyTarget`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Jumlah Target{" "}
                {procurementItem.unitName
                  ? `(${procurementItem.unitName})`
                  : ""}
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

        {/* Scheduled Date - Only enabled if stock is enough */}
        <Controller
          name={`orders.${idx}.scheduledDate`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Tanggal & Waktu Jadwal{" "}
                {!isScheduleDateEnabled && (
                  <span className="text-xs text-muted-foreground font-normal">
                    (tidak tersedia)
                  </span>
                )}
              </FieldLabel>
              <Input
                {...field}
                type="datetime-local"
                disabled={!isScheduleDateEnabled}
                min={new Date().toISOString().slice(0, 16)}
                aria-invalid={fieldState.invalid}
                className={cn(
                  "font-mono",
                  !isScheduleDateEnabled && "opacity-50 cursor-not-allowed",
                )}
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
        name={`orders.${idx}.notes`}
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel>Catatan (Opsional)</FieldLabel>
            <Textarea
              {...field}
              placeholder="Tambahkan catatan untuk produksi ini..."
              className="resize-none"
              rows={2}
            />
            <FieldError
              errors={fieldState.error ? [fieldState.error] : undefined}
            />
          </Field>
        )}
      />

      {/* Status Preview */}
      <div className="flex items-center gap-2 text-sm border-t pt-3">
        <Package className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">
          Status setelah verifikasi:
        </span>
        {statusPreview}
      </div>

      {/* Missing Materials Warning Table */}
      {stockCheck &&
        !stockCheck.noBom &&
        stockCheck.missingMaterials.length > 0 && (
          <div className="rounded-lg border-2 border-orange-600 bg-orange-50 dark:bg-orange-900/10 p-4">
            <div className="flex items-start gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <p className="font-semibold text-sm text-orange-900 dark:text-orange-100">
                Bahan baku tidak mencukupi untuk {procurementItem.itemName}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b-2 border-orange-200">
                  <tr>
                    <th className="pb-2 text-left font-semibold text-orange-900 dark:text-orange-100">
                      Bahan Baku
                    </th>
                    <th className="pb-2 text-right font-semibold text-orange-900 dark:text-orange-100">
                      Tersedia
                    </th>
                    <th className="pb-2 text-right font-semibold text-orange-900 dark:text-orange-100">
                      Dibutuhkan
                    </th>
                    <th className="pb-2 text-right font-semibold text-orange-700">
                      Kurang
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-200">
                  {stockCheck.missingMaterials.map((material) => (
                    <tr key={material.itemName}>
                      <td className="py-2 font-medium text-orange-900 dark:text-orange-100">
                        {material.itemName}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {material.available.toFixed(2)} {material.unitName}
                      </td>
                      <td className="py-2 text-right text-muted-foreground">
                        {material.required.toFixed(2)} {material.unitName}
                      </td>
                      <td className="py-2 text-right font-bold text-orange-700">
                        {material.deficit.toFixed(2)} {material.unitName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Simple note - no mention of auto schedule */}
            <div className="mt-3 pt-3 border-t border-orange-200">
              <p className="text-xs font-medium text-orange-800 dark:text-orange-200 flex items-center gap-1.5">
                <span>💡</span>
                <span>
                  Lengkapi pengadaan bahan baku terlebih dahulu sebelum memulai
                  produksi
                </span>
              </p>
            </div>
          </div>
        )}

      {/* No BOM Warning */}
      {stockCheck?.noBom && (
        <Alert
          variant="default"
          className="border-yellow-600 bg-yellow-50 dark:bg-yellow-900/10"
        >
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-500">
            Item ini belum memiliki BOM. Harap tambahkan BOM terlebih dahulu
            agar produksi bisa dijadwalkan.
          </AlertDescription>
        </Alert>
      )}

      {/* Field Error */}
      {fieldError && (
        <p className="text-sm text-destructive">
          {fieldError.root?.message ?? fieldError.message}
        </p>
      )}
    </div>
  );
}
