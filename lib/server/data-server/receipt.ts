"use server";

import { CACHE_TAGS } from "@/lib/constant";
import { db } from "@/lib/db";
import {
  categoryTable,
  goodsReceiptItemTable,
  goodsReceiptTable,
  itemTable,
  purchaseTable,
  supplierTable,
  unitTable,
  userTable,
} from "@/lib/db/schema";
import { isProcurementId } from "@/lib/helper";
import { TReceipt, TReceiptItem } from "@/lib/type/type.procurement";
import { desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getReceiptId = async () => {
  const [result] = await db
    .select({ id: goodsReceiptTable.idReceipt })
    .from(goodsReceiptTable)
    .orderBy(desc(goodsReceiptTable.idReceipt))
    .limit(1)
    .execute();

  return result ? result.id : null;
};

export const getReceiptList = unstable_cache(
  async () => {
    try {
      const rows = await db
        .select({
          // Receipt fields
          idReceipt: goodsReceiptTable.idReceipt,
          purchaseId: goodsReceiptTable.purchaseId,
          receivedBy: goodsReceiptTable.receivedBy,
          createdAt: goodsReceiptTable.createdAt,

          // User info
          receivedByName: userTable.name,

          // Purchase & Supplier info
          supplierName: supplierTable.name,
          supplierStore: supplierTable.store,
          procurementId: purchaseTable.procurementId,

          // Receipt item fields
          idReceiptItem: goodsReceiptItemTable.idReceiptItem,
          itemId: goodsReceiptItemTable.itemId,
          itemName: itemTable.name,
          categoryName: categoryTable.name,
          unitName: unitTable.name,
          qtyReceived: goodsReceiptItemTable.qtyReceived,
          qtyDamaged: goodsReceiptItemTable.qtyDamaged,
        })
        .from(goodsReceiptTable)
        .leftJoin(userTable, eq(goodsReceiptTable.receivedBy, userTable.idUser))
        .leftJoin(
          purchaseTable,
          eq(goodsReceiptTable.purchaseId, purchaseTable.idPurchase),
        )
        .leftJoin(
          supplierTable,
          eq(purchaseTable.supplierId, supplierTable.idSupplier),
        )
        .leftJoin(
          goodsReceiptItemTable,
          eq(goodsReceiptTable.idReceipt, goodsReceiptItemTable.receiptId),
        )
        .leftJoin(itemTable, eq(goodsReceiptItemTable.itemId, itemTable.idItem))
        .leftJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit))
        .leftJoin(
          categoryTable,
          eq(itemTable.categoryId, categoryTable.idCategory),
        )
        .orderBy(desc(goodsReceiptTable.createdAt));

      // Group by receipt ID
      const grouped = rows.reduce<Record<string, TReceipt>>((acc, row) => {
        const receiptId = row.idReceipt;

        if (!acc[receiptId]) {
          acc[receiptId] = {
            idReceipt: row.idReceipt,
            purchaseId: row.purchaseId,
            receivedBy: row.receivedBy,
            receivedByName: row.receivedByName ?? "",
            createdAt: row.createdAt,
            supplierName: row.supplierName ?? "",
            supplierStore: row.supplierStore ?? "",
            procurementId: row.procurementId ?? "",
            totalItems: 0,
            totalReceived: 0,
            totalDamaged: 0,
            receiptItems: [],
          };
        }

        if (row.idReceiptItem) {
          const receiptItem: TReceiptItem = {
            idReceiptItem: row.idReceiptItem,
            receiptId: row.idReceipt,
            itemId: row.itemId!,
            itemName: row.itemName ?? "",
            categoryName: row.categoryName ?? "",
            unitName: row.unitName ?? "",
            qtyReceived: row.qtyReceived!,
            qtyDamaged: row.qtyDamaged!,
          };

          acc[receiptId].receiptItems.push(receiptItem);
          acc[receiptId].totalItems = acc[receiptId].receiptItems.length;
          acc[receiptId].totalReceived += Number(row.qtyReceived);
          acc[receiptId].totalDamaged += Number(row.qtyDamaged);
        }

        return acc;
      }, {});

      const result = Object.values(grouped);

      if (result.length > 0) {
        return { ok: true, data: result };
      } else {
        return { ok: true, data: [] };
      }
    } catch (error) {
      console.error("Error get receipt data:", error);
      return { ok: false, data: null };
    }
  },
  ["get-receipt-list"],
  {
    tags: [CACHE_TAGS.transaction.receipt.list],
    revalidate: 3600,
  },
);

export const getReceiptById = unstable_cache(
  async (id: string) => {
    try {
      if (!isProcurementId(id)) {
        return { ok: true, data: null };
      }
      const rows = await db
        .select({
          idReceipt: goodsReceiptTable.idReceipt,
          purchaseId: goodsReceiptTable.purchaseId,
          receivedBy: goodsReceiptTable.receivedBy,
          createdAt: goodsReceiptTable.createdAt,
          receivedByName: userTable.name,
          supplierName: supplierTable.name,
          supplierStore: supplierTable.store,
          procurementId: purchaseTable.procurementId,
          idReceiptItem: goodsReceiptItemTable.idReceiptItem,
          itemId: goodsReceiptItemTable.itemId,
          itemName: itemTable.name,
          categoryName: categoryTable.name,
          unitName: unitTable.name,
          qtyReceived: goodsReceiptItemTable.qtyReceived,
          qtyDamaged: goodsReceiptItemTable.qtyDamaged,
        })
        .from(goodsReceiptTable)
        .leftJoin(userTable, eq(goodsReceiptTable.receivedBy, userTable.idUser))
        .leftJoin(
          purchaseTable,
          eq(goodsReceiptTable.purchaseId, purchaseTable.idPurchase),
        )
        .leftJoin(
          supplierTable,
          eq(purchaseTable.supplierId, supplierTable.idSupplier),
        )
        .leftJoin(
          goodsReceiptItemTable,
          eq(goodsReceiptTable.idReceipt, goodsReceiptItemTable.receiptId),
        )
        .leftJoin(itemTable, eq(goodsReceiptItemTable.itemId, itemTable.idItem))
        .leftJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit))
        .leftJoin(
          categoryTable,
          eq(itemTable.categoryId, categoryTable.idCategory),
        )
        .where(eq(goodsReceiptTable.idReceipt, id));

      if (rows.length === 0) {
        return { ok: true, data: null };
      }

      const firstRow = rows[0];
      const receiptItems: TReceiptItem[] = rows
        .filter((row) => row.idReceiptItem !== null)
        .map((row) => ({
          idReceiptItem: row.idReceiptItem!,
          receiptId: row.idReceipt,
          itemId: row.itemId!,
          itemName: row.itemName ?? "",
          categoryName: row.categoryName ?? "",
          unitName: row.unitName ?? "",
          qtyReceived: row.qtyReceived!,
          qtyDamaged: row.qtyDamaged!,
        }));

      const totalReceived = receiptItems.reduce(
        (sum, item) => sum + Number(item.qtyReceived),
        0,
      );
      const totalDamaged = receiptItems.reduce(
        (sum, item) => sum + Number(item.qtyDamaged),
        0,
      );

      const result: TReceipt = {
        idReceipt: firstRow.idReceipt,
        purchaseId: firstRow.purchaseId,
        receivedBy: firstRow.receivedBy,
        receivedByName: firstRow.receivedByName ?? "",
        createdAt: firstRow.createdAt,
        supplierName: firstRow.supplierName ?? "",
        supplierStore: firstRow.supplierStore ?? "",
        procurementId: firstRow.procurementId ?? "",
        totalItems: receiptItems.length,
        totalReceived,
        totalDamaged,
        receiptItems,
      };

      return {
        ok: true,
        data: result,
      };
    } catch (error) {
      console.error("Error get receipt data by id:", error);
      return { ok: false, data: null };
    }
  },
  ["get-detail-receipt"],
  {
    tags: [CACHE_TAGS.transaction.receipt.detail],
    revalidate: 3600,
  },
);
