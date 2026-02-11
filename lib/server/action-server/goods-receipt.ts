"use server";

import { db } from "@/lib/db";
import {
  goodsReceiptTable,
  goodsReceiptItemTable,
  purchaseTable,
  itemMovementTable,
  transactionTable,
} from "@/lib/db/schema";
import {
  createGoodsReceiptSchema,
  type CreateGoodsReceiptValues,
} from "@/lib/validation/procurement-validation";
import { revalidatePath } from "next/cache";
import { LABEL, ROUTES } from "@/lib/constant";
import { eq } from "drizzle-orm";
import { requireRole } from "./req-role";

// Generate Receipt ID (format: GR-YYYYMMDD-001)
async function generateReceiptId(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `GR-${dateStr}`;

  const lastReceipt = await db.query.goodsReceiptTable.findFirst({
    where: (receipt, { like }) => like(receipt.idReceipt, `${prefix}%`),
    orderBy: (receipt, { desc }) => [desc(receipt.idReceipt)],
  });

  if (!lastReceipt) {
    return `${prefix}-001`;
  }

  const lastNumber = parseInt(lastReceipt.idReceipt.split("-")[2]);
  const newNumber = (lastNumber + 1).toString().padStart(3, "0");
  return `${prefix}-${newNumber}`;
}

// Generate Transaction ID (format: TRX-YYYYMMDD-001)
async function generateTransactionId(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `TRX-${dateStr}`;

  const lastTransaction = await db.query.transactionTable.findFirst({
    where: (trx, { like }) => like(trx.idTransaction, `${prefix}%`),
    orderBy: (trx, { desc }) => [desc(trx.idTransaction)],
  });

  if (!lastTransaction) {
    return `${prefix}-001`;
  }

  const lastNumber = parseInt(lastTransaction.idTransaction.split("-")[2]);
  const newNumber = (lastNumber + 1).toString().padStart(3, "0");
  return `${prefix}-${newNumber}`;
}

export const createGoodsReceipt = async (values: CreateGoodsReceiptValues) => {
  try {
    // 1. Validate
    const validated = createGoodsReceiptSchema.safeParse(values);

    if (!validated.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    // 2. Auth check
    const authResult = await requireRole("ALL");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, message: authResult.message };
    }

    // 3. Transaction
    await db.transaction(async (tx) => {
      // Generate receipt ID
      const receiptId = await generateReceiptId();

      // Insert goods receipt
      await tx.insert(goodsReceiptTable).values({
        idReceipt: receiptId,
        purchaseId: validated.data.purchaseId,
        receivedBy: authResult.session.user.id,
      });

      // Insert goods receipt items
      const receiptItems = validated.data.items.map((item) => ({
        receiptId,
        itemId: item.itemId,
        qtyReceived: item.qtyReceived,
        qtyDamaged: item.qtyDamaged,
      }));

      await tx.insert(goodsReceiptItemTable).values(receiptItems);

      // Create transaction for stock movement
      const transactionId = await generateTransactionId();

      await tx.insert(transactionTable).values({
        idTransaction: transactionId,
        type: "PURCHASE",
        status: "COMPLETED",
        userId: authResult.session.user.id,
      });

      // Create item movements (IN) for received items
      const movements = validated.data.items
        .filter((item) => parseFloat(item.qtyReceived) > 0)
        .map((item) => ({
          transactionId,
          itemId: item.itemId,
          type: "IN" as const,
          quantity: item.qtyReceived,
        }));

      if (movements.length > 0) {
        await tx.insert(itemMovementTable).values(movements);
      }

      // Update purchase status to RECEIVED
      await tx
        .update(purchaseTable)
        .set({ status: "RECEIVED" })
        .where(eq(purchaseTable.idPurchase, validated.data.purchaseId));
    });

    return {
      ok: true,
      message: "Penerimaan barang berhasil dicatat",
    };
  } catch (error) {
    console.error("Error create goods receipt:", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};
