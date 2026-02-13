"use server";

import { CACHE_TAGS } from "@/lib/constant";
import { db } from "@/lib/db";
import {
  categoryTable,
  itemTable,
  purchaseItemTable,
  purchaseTable,
  supplierTable,
  unitTable,
} from "@/lib/db/schema";
import { TPurchase, TPurchaseItem } from "@/lib/type/type.procurement";
import { desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getPurchaseId = async () => {
  const [result] = await db
    .select({ id: purchaseTable.idPurchase })
    .from(purchaseTable)
    .orderBy(desc(purchaseTable.idPurchase))
    .limit(1)
    .execute();

  return result ? result.id : null;
};

export const getPurchaseList = unstable_cache(
  async () => {
    try {
      const rows = await db
        .select({
          // Purchase fields
          idPurchase: purchaseTable.idPurchase,
          procurementId: purchaseTable.procurementId,
          supplierId: purchaseTable.supplierId,
          status: purchaseTable.status,
          createdAt: purchaseTable.createdAt,

          // Supplier fields
          supplierName: supplierTable.name,
          supplierStore: supplierTable.store,
          supplierPhone: supplierTable.phone,

          // Purchase item fields
          idPurchaseItem: purchaseItemTable.idPurchaseItem,
          itemId: purchaseItemTable.itemId,
          procurementItemId: purchaseItemTable.procurementItemId,
          itemName: itemTable.name,
          categoryName: categoryTable.name,
          unitName: unitTable.name,
          qtyOrdered: purchaseItemTable.qtyOrdered,
        })
        .from(purchaseTable)
        .leftJoin(
          supplierTable,
          eq(purchaseTable.supplierId, supplierTable.idSupplier),
        )
        .leftJoin(
          purchaseItemTable,
          eq(purchaseTable.idPurchase, purchaseItemTable.purchaseId),
        )
        .leftJoin(itemTable, eq(purchaseItemTable.itemId, itemTable.idItem))
        .leftJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit))
        .leftJoin(
          categoryTable,
          eq(itemTable.categoryId, categoryTable.idCategory),
        )
        .orderBy(desc(purchaseTable.createdAt));

      // Group by purchase ID
      const grouped = rows.reduce<Record<string, TPurchase>>((acc, row) => {
        const purchaseId = row.idPurchase;

        // Initialize purchase if not exists
        if (!acc[purchaseId]) {
          acc[purchaseId] = {
            idPurchase: row.idPurchase,
            procurementId: row.procurementId,
            supplierId: row.supplierId,
            supplierName: row.supplierName ?? "",
            supplierStore: row.supplierStore ?? "",
            supplierPhone: row.supplierPhone,
            status: row.status,
            createdAt: row.createdAt,
            totalItems: 0,
            totalQty: 0,
            purchaseItems: [],
          };
        }

        // Add purchase item if exists
        if (row.idPurchaseItem) {
          const purchaseItem: TPurchaseItem = {
            idPurchaseItem: row.idPurchaseItem,
            purchaseId: row.idPurchase,
            procurementItemId: row.procurementItemId!,
            itemId: row.itemId!,
            itemName: row.itemName ?? "",
            categoryName: row.categoryName ?? "",
            qtyOrdered: row.qtyOrdered!,
            unitName: row.unitName ?? "",
          };

          acc[purchaseId].purchaseItems.push(purchaseItem);
          acc[purchaseId].totalItems = acc[purchaseId].purchaseItems.length;
          acc[purchaseId].totalQty += Number(row.qtyOrdered);
        }

        return acc;
      }, {});

      // Convert to array
      const result = Object.values(grouped);

      if (result.length > 0) {
        return { ok: true, data: result };
      } else {
        return { ok: true, data: [] as TPurchase[] };
      }
    } catch (error) {
      console.error("Error get purchase data:", error);
      return { ok: false, data: null };
    }
  },
  ["get-purchase-list"],
  {
    tags: [CACHE_TAGS.transaction.purchase.list],
    revalidate: 3600,
  },
);
