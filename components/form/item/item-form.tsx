"use client";

import React, { useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useFieldArray,
  useForm,
  useWatch,
  FormProvider,
  useFormContext,
} from "react-hook-form";
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
import { Input } from "../../ui/input";

import { TCategory } from "@/lib/type/type.categories";
import { TItem, TItemSelect } from "@/lib/type/type.item";
import { TUnit } from "@/lib/type/type.unit";
import { CreateItemSchema } from "@/lib/validation/master-validation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { LabelButton, TYPE_ITEM_SELECT } from "@/lib/constant";
import { Separator } from "../../ui/separator";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { CustomSelect } from "../custom-select";
import { createItem, updateItem } from "@/lib/server/action-server/item";
import { FormMode, typeItems } from "@/lib/type/type.helper";

interface IItemForm {
  mode: FormMode;
  data?: TItem;
  units: TUnit[];
  categories: TCategory[];
  rawItems: TItemSelect[];
  onSuccess?: () => void;
  className?: React.ComponentProps<"form">;
}

function transformItemToFormValues(
  item: TItem,
): z.infer<typeof CreateItemSchema> {
  return {
    name: item.name,
    unitId: item.idUnit ?? "",
    categoryId: item.idCategory ?? "",
    type: item.type,
    minStock: item.minStock,
    bomDetails: item.detailItem.map((detail) => ({
      rawItemId: detail.rawItemId,
      qty: detail.qty ?? "",
    })),
  };
}

interface ConfirmChangeProps {
  onCancel: () => void;
  onConfirm: () => void;
  message?: string;
}

export function ConfirmTypeChange({
  onCancel,
  onConfirm,
  message = "Mengubah tipe bahan baku akan mereset semua daftar yang sudah diisi. Lanjutkan?",
}: Readonly<ConfirmChangeProps>) {
  return (
    <div className="flex min-h-45 items-center justify-center p-6">
      <div className="flex flex-col items-center gap-5 text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-destructive" />
        <p className="text-base font-medium leading-relaxed">{message}</p>
        <div className="mt-4 flex gap-4 w-full max-w-xs">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            Batal
          </Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm}>
            Lanjutkan & Reset
          </Button>
        </div>
      </div>
    </div>
  );
}

function BomDetailRow({
  idx,
  rawItems,
  selectedRawItemIds,
  onRemove,
}: Readonly<{
  idx: number;
  rawItems: TItemSelect[];
  selectedRawItemIds: string[];
  onRemove: () => void;
}>) {
  const {
    control,
    formState: { errors },
  } = useFormContext<z.infer<typeof CreateItemSchema>>();

  const selectedId = useWatch({
    control,
    name: `bomDetails.${idx}.rawItemId`,
  });

  const rawItemMap = useMemo(
    () => new Map(rawItems.map((i) => [i.idItem, i])),
    [rawItems],
  );

  const selectedItem = selectedId ? rawItemMap.get(selectedId) : null;

  const availableRawItems = useMemo(() => {
    return rawItems.filter(
      (item) =>
        !selectedRawItemIds.includes(item.idItem) || item.idItem === selectedId,
    );
  }, [rawItems, selectedRawItemIds, selectedId]);

  const fieldError = errors.bomDetails?.[idx];

  return (
    <div className="grid gap-4 rounded-lg border p-4 sm:grid-cols-[2fr,140px,auto] sm:items-end">
      <div className="flex flex-row items-center justify-between gap-2">
        <Controller
          name={`bomDetails.${idx}.rawItemId`}
          control={control}
          render={({ field, fieldState }) => (
            <CustomSelect
              items={availableRawItems}
              valueField="idItem"
              labelField="name"
              label={`Bahan Baku ${idx + 1}`}
              placeholder="Pilih Bahan Baku"
              field={field}
              fieldState={fieldState}
            />
          )}
        />

        <Controller
          name={`bomDetails.${idx}.qty`}
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel>
                Jumlah {selectedItem ? selectedItem.unitName : ""}
              </FieldLabel>
              <Input
                {...field}
                type="number"
                step="0.01"
                min="0.01"
                aria-invalid={fieldState.invalid}
                placeholder="2.5"
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
        className="w-full mb-2 sm:mb-0"
        onClick={onRemove}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      {fieldError && (
        <p className="text-sm text-destructive col-span-full">
          {fieldError.root?.message || fieldError.message}
        </p>
      )}
    </div>
  );
}

export default function IItemForm({
  mode,
  data,
  units,
  categories,
  rawItems,
  onSuccess,
  className,
}: Readonly<IItemForm>) {
  const [isPending, startTransition] = React.useTransition();

  const [showTypeChangeConfirm, setShowTypeChangeConfirm] =
    React.useState(false);
  const [pendingType, setPendingType] = React.useState<string | null>(null);

  const form = useForm<z.infer<typeof CreateItemSchema>>({
    resolver: zodResolver(CreateItemSchema),
    defaultValues: data
      ? transformItemToFormValues(data)
      : {
          name: "",
          unitId: "",
          categoryId: "",
          type: "RAW_MATERIAL",
          minStock: "",
          bomDetails: [],
        },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bomDetails",
  });

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });

  const showBomDetails =
    selectedType === "WORK_IN_PROGRESS" || selectedType === "FINISHED_GOOD";

  const bomDetails = useWatch({
    control: form.control,
    name: "bomDetails",
  });

  const selectedRawItemIds = React.useMemo(() => {
    return (bomDetails || []).map((detail) => detail.rawItemId).filter(Boolean);
  }, [bomDetails]);

  const prevTypeRef = React.useRef<string | undefined>(undefined);
  const oldBomDetailsRef = React.useRef<{ rawItemId: string; qty: string }[]>(
    [],
  );

  const handleTypeChange = (newType: string) => {
    const oldType = prevTypeRef.current;
    const currentBomDetails = form.getValues("bomDetails") || [];

    if (currentBomDetails.length === 0 || oldType === newType) {
      prevTypeRef.current = newType;
      form.setValue("type", newType as typeItems);
      return;
    }
    oldBomDetailsRef.current = structuredClone(currentBomDetails);
    setPendingType(newType);
    setShowTypeChangeConfirm(true);
  };

  const handleConfirmChange = () => {
    if (!pendingType) return;

    prevTypeRef.current = pendingType;
    form.setValue("type", pendingType as typeItems);
    form.setValue("bomDetails", [], {
      shouldValidate: true,
      shouldDirty: true,
    });

    setShowTypeChangeConfirm(false);
    setPendingType(null);
    toast.success("Tipe bahan baku diubah. Daftar telah direset.");
  };

  const handleCancelChange = () => {
    form.setValue("type", prevTypeRef.current as typeItems, {
      shouldValidate: false,
    });
    form.setValue("bomDetails", oldBomDetailsRef.current);

    setShowTypeChangeConfirm(false);
    setPendingType(null);
    toast.info("Perubahan tipe dibatalkan.");
  };

  async function onSubmit(values: z.infer<typeof CreateItemSchema>) {
    startTransition(async () => {
      let result;

      if (mode === "edit" && data?.idItem) {
        result = await updateItem(data.idItem, values);
      } else {
        result = await createItem(values);
      }

      if (result.ok) {
        toast.success(result.message);
        onSuccess?.();
        if (mode === "create") {
          form.reset();
        }
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn("flex flex-col gap-6", className)}
      >
        {showTypeChangeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-lg">
            <div className="bg-card border rounded-xl shadow-xl overflow-hidden mx-4">
              <ConfirmTypeChange
                onCancel={handleCancelChange}
                onConfirm={handleConfirmChange}
              />
            </div>
          </div>
        )}
        <FieldGroup>
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field orientation="vertical" data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Tipe Bahan Baku</FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={handleTypeChange}
                  disabled={mode === "edit"}
                >
                  <SelectTrigger aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_ITEM_SELECT.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Nama Bahan Baku</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          <div className="flex flex-row items-center justify-between gap-3">
            <Controller
              name="categoryId"
              control={form.control}
              render={({ field, fieldState }) => (
                <CustomSelect
                  items={categories}
                  valueField="idCategory"
                  labelField="name"
                  label="Kategori"
                  placeholder="Pilih kategori"
                  field={field}
                  fieldState={fieldState}
                />
              )}
            />

            <Controller
              name="unitId"
              control={form.control}
              render={({ field, fieldState }) => (
                <CustomSelect
                  items={units}
                  valueField="idUnit"
                  labelField="name"
                  label="Satuan"
                  placeholder="Pilih satuan"
                  field={field}
                  fieldState={fieldState}
                />
              )}
            />
          </div>

          <Controller
            name="minStock"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Minimal Stok</FieldLabel>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  min="0"
                  aria-invalid={fieldState.invalid}
                  placeholder="0"
                />
                <FieldError
                  errors={fieldState.error ? [fieldState.error] : undefined}
                />
              </Field>
            )}
          />

          {showBomDetails && (
            <>
              <Separator className="my-6" />

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">Daftar Bahan Baku</h3>
                    <p className="text-sm text-muted-foreground">
                      Daftar kebutuhan bahan dan jumlah yang diperlukan.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ rawItemId: "", qty: "" })}
                    disabled={isPending}
                  >
                    <Plus className="h-4 w-4" />
                    Tambah
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                    Belum ada bahan. Klik tombol di atas untuk menambahkan.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {fields.map((fieldItem, idx) => (
                      <BomDetailRow
                        key={fieldItem.id}
                        idx={idx}
                        rawItems={rawItems}
                        selectedRawItemIds={selectedRawItemIds}
                        onRemove={() => remove(idx)}
                      />
                    ))}
                  </div>
                )}

                {form.formState.errors.bomDetails && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.bomDetails?.root?.message ||
                      form.formState.errors.bomDetails?.message}
                  </p>
                )}
              </div>
            </>
          )}

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Menyimpan..." : LabelButton[mode]}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
