"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Check, Package, CheckSquare, Square } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { TProcerementItem } from "@/lib/type/type.procurement";

interface DialogAssignItemsProps {
  supplierId: string;
  supplierName: string;
  availableItems: TProcerementItem[];
  onAssign: (itemIds: string[]) => void;
}

interface ItemCardProps {
  item: TProcerementItem;
  isSelected: boolean;
  onToggle: () => void;
}

const ItemCard = ({ item, isSelected, onToggle }: ItemCardProps) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-border bg-card hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox Icon */}
        <div className="mt-0.5 shrink-0">
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-primary" />
          ) : (
            <Square className="h-5 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Item Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-sm leading-tight">
                {item.itemName}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  {item.categoryName}
                </span>
                <span>•</span>
                <span>{item.unitName}</span>
              </div>
            </div>

            {/* Quantity Badge */}
            <Badge
              variant={isSelected ? "default" : "secondary"}
              className="ml-2 shrink-0 font-semibold"
            >
              {item.qtyRequested} {item.unitName}
            </Badge>
          </div>

          {/* Notes */}
          {item.notes && (
            <p className="mt-2 text-xs italic text-muted-foreground line-clamp-2">
              💬 {item.notes}
            </p>
          )}
        </div>
      </div>
    </button>
  );
};

export function DialogAssignItems({
  supplierId,
  supplierName,
  availableItems,
  onAssign,
}: Readonly<DialogAssignItemsProps>) {
  const [open, setOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Reset selection when dialog state changes
  const handleOpenChange = useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setSelectedIds(new Set());
    }
  }, []);

  const toggleItem = useCallback((itemId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }, []);

  const handleSelectAll = useCallback(() => {
    if (selectedIds.size === availableItems.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(
        new Set(availableItems.map((item) => item.idProcurementItem)),
      );
    }
  }, [availableItems, selectedIds.size]);

  const handleAssign = useCallback(() => {
    if (selectedIds.size === 0) {
      return;
    }

    onAssign(Array.from(selectedIds));
    setSelectedIds(new Set());
    setOpen(false);
  }, [selectedIds, onAssign]);

  const isAllSelected = useMemo(() => {
    return (
      availableItems.length > 0 && selectedIds.size === availableItems.length
    );
  }, [availableItems.length, selectedIds.size]);

  const hasItems = availableItems.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button type="button" size="sm" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Assign Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Items ke {supplierName}</DialogTitle>
          <DialogDescription>
            Pilih item yang akan dibeli dari supplier ini. Item yang sudah
            diassign ke supplier lain tidak akan muncul di list.
          </DialogDescription>
        </DialogHeader>

        {hasItems ? (
          <>
            {/* Select All Button */}
            {availableItems.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="w-full"
              >
                {isAllSelected ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Batalkan Semua
                  </>
                ) : (
                  <>
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Pilih Semua ({availableItems.length})
                  </>
                )}
              </Button>
            )}

            {/* Items List */}
            <div className="h-100 overflow-y-auto space-y-3">
              {availableItems.map((item) => (
                <ItemCard
                  key={item.idProcurementItem}
                  item={item}
                  isSelected={selectedIds.has(item.idProcurementItem)}
                  onToggle={() => toggleItem(item.idProcurementItem)}
                />
              ))}
            </div>
          </>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 p-12 text-center">
            <Package className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="mb-1 text-sm font-medium text-muted-foreground">
              Tidak ada item tersedia
            </p>
            <p className="text-xs text-muted-foreground">
              Semua item sudah diassign ke supplier lain
            </p>
          </div>
        )}

        <DialogFooter className="flex-col gap-3 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedIds.size > 0 ? (
              <>
                <strong className="text-foreground">{selectedIds.size}</strong>{" "}
                item dipilih dari {availableItems.length} tersedia
              </>
            ) : (
              <>Belum ada item dipilih</>
            )}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={selectedIds.size === 0}
            >
              <Check className="h-4 w-4" />
              Assign ({selectedIds.size})
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
