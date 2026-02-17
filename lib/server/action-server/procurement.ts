"use server";

import { db } from "@/lib/db";
import {
  createProcurementSchema,
  verifyProcurementSchema,
  VerifyProcurementValues,
  verifyPurchaseSchema,
  VerifyPurchaseValues,
  type CreateProcurementValues,
} from "@/lib/validation/procurement-validation";
import { LABEL } from "@/lib/constant";
import { requireRole } from "./req-role";
import { getProcerumentId } from "../data-server/procurement";
import { generateProcurementId, generateSequentialIds } from "@/lib/helper";
import {
  goodsReceiptItemTable,
  goodsReceiptTable,
  itemMovementTable,
  itemTable,
  notificationsTable,
  procurementItemTable,
  procurementTable,
  productionOrderTable,
  purchaseItemTable,
  purchaseTable,
  supplierTable,
  transactionTable,
  unitTable,
} from "@/lib/db/schema";
import { getPurchaseId } from "../data-server/purchase";
import { getReceiptId } from "../data-server/receipt";
import { eq } from "drizzle-orm";
import {
  templateProcurementApproved,
  templatePurchaseRequest,
} from "@/lib/template-notif";
import {
  invalidateItem,
  invalidateItemMov,
  invalidateProcurement,
  invalidateProduction,
  invalidatePurchase,
  invalidateReceipt,
} from "../data-server/revalidate";
import { generateTransactionID } from "../data-server/transaction";
import { AllStatus, statusProcurement } from "@/lib/type/type.helper";

export const createProcurement = async (values: CreateProcurementValues) => {
  try {
    const validated = createProcurementSchema.safeParse(values);

    if (!validated.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ADMIN_KITCHEN");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, message: authResult.message };
    }

    const lastId = await getProcerumentId();
    const newProcurementId = generateProcurementId("PR", lastId);

    await db.transaction(async (tx) => {
      await tx.insert(procurementTable).values({
        idProcurement: newProcurementId,
        requestedBy: authResult.session.user.id,
      });

      const procurementValues = validated.data.items.map((item) => ({
        procurementId: newProcurementId,
        itemId: item.itemId,
        qtyRequested: item.qtyRequested,
        notes: item.notes,
      }));

      await tx.insert(procurementItemTable).values(procurementValues);
    });

    invalidateProcurement();
    invalidateProduction();

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("Error create procurement:", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export async function updateProcurementStatus(
  tx: typeof db,
  procurementId: string,
): Promise<statusProcurement | null> {
  // Get all purchases and production orders in one query
  const rows = await tx
    .select({
      purchaseStatus: purchaseTable.status,
      productionStatus: productionOrderTable.status,
    })
    .from(procurementTable)
    .leftJoin(
      purchaseTable,
      eq(procurementTable.idProcurement, purchaseTable.procurementId),
    )
    .leftJoin(
      productionOrderTable,
      eq(procurementTable.idProcurement, productionOrderTable.procurementId),
    )
    .where(eq(procurementTable.idProcurement, procurementId));

  // Collect unique statuses
  const allStatuses: Array<AllStatus> = [];

  rows.forEach((row) => {
    if (row.purchaseStatus) {
      allStatuses.push(row.purchaseStatus);
    }
    if (row.productionStatus) {
      allStatuses.push(row.productionStatus);
    }
  });

  // No orders = no update
  if (allStatuses.length === 0) {
    return null;
  }

  // Check if all orders are done
  const allDone = allStatuses.every(
    (status) => status === "COMPLETED" || status === "CANCELLED",
  );

  if (!allDone) {
    return null;
  }

  // Check if at least one is completed (use .includes() instead of .some())
  const hasCompleted = allStatuses.includes("COMPLETED");

  const newStatus: statusProcurement = hasCompleted ? "COMPLETED" : "CANCELLED";

  // Update procurement
  await tx
    .update(procurementTable)
    .set({ status: newStatus })
    .where(eq(procurementTable.idProcurement, procurementId));

  return newStatus;
}

export const verifProcurement = async (values: VerifyProcurementValues) => {
  try {
    const validated = verifyProcurementSchema.safeParse(values);

    if (!validated.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ADMIN_KITCHEN");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, message: authResult.message };
    }

    await db.transaction(async (tx) => {
      const lastId = await getPurchaseId();
      const purchaseIds = generateSequentialIds(
        "PO",
        lastId,
        validated.data.assignments.length,
      );

      const procurement = await tx.query.procurementTable.findFirst({
        where: eq(procurementTable.idProcurement, validated.data.procurementId),
        with: {
          requester: true,
        },
      });

      if (!procurement) {
        throw new Error(
          `Procurement ${validated.data.procurementId} not found`,
        );
      }

      const purchaseOrdersInfo: Array<{
        purchaseId: string;
        supplierName: string;
        itemCount: number;
        items: Array<{
          nameItem: string;
          qty: string;
          nameUnit: string;
        }>;
      }> = [];

      for (const [index, assignment] of validated.data.assignments.entries()) {
        const newPurchaseId = purchaseIds[index];

        await tx.insert(purchaseTable).values({
          idPurchase: newPurchaseId,
          procurementId: validated.data.procurementId,
          supplierId: assignment.supplierId,
          status: "SENT",
        });

        const purchaseItems = assignment.items.map((item) => ({
          purchaseId: newPurchaseId,
          procurementItemId: item.procurementItemId,
          itemId: item.itemId,
          qtyOrdered: item.qtyOrdered,
        }));

        await tx.insert(purchaseItemTable).values(purchaseItems);

        const supplier = await tx.query.supplierTable.findFirst({
          where: eq(supplierTable.idSupplier, assignment.supplierId),
        });

        if (!supplier) {
          throw new Error(`Supplier ${assignment.supplierId} not found`);
        }

        const itemsForNotif = await tx
          .select({
            nameItem: itemTable.name,
            qty: purchaseItemTable.qtyOrdered,
            nameUnit: unitTable.name,
          })
          .from(purchaseItemTable)
          .innerJoin(itemTable, eq(purchaseItemTable.itemId, itemTable.idItem))
          .innerJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit))
          .where(eq(purchaseItemTable.purchaseId, newPurchaseId));

        // Create SUPPLIER notification
        const supplierNotifMessage = templatePurchaseRequest({
          nameSupplier: supplier.name,
          store_name: supplier.store,
          items: itemsForNotif,
        });

        await tx.insert(notificationsTable).values({
          recipientType: "SUPPLIER",
          supplierId: assignment.supplierId,
          refType: "PURCHASE",
          refId: newPurchaseId,
          message: supplierNotifMessage,
          status: "PENDING",
        });

        // 🔥 Store PO info WITH ITEMS for user notification
        purchaseOrdersInfo.push({
          purchaseId: newPurchaseId,
          supplierName: supplier.store,
          itemCount: assignment.items.length,
          items: itemsForNotif, // 🔥 ADD THIS
        });
      }

      await tx
        .update(procurementTable)
        .set({
          status: "ON_PROGRESS",
          // updatedAt: new Date(),
        })
        .where(
          eq(procurementTable.idProcurement, validated.data.procurementId),
        );

      // Create USER notification
      const userNotifMessage = templateProcurementApproved({
        userName: procurement.requester.name,
        procurementId: validated.data.procurementId,
        totalSuppliers: validated.data.assignments.length,
        totalItems: validated.data.assignments.reduce(
          (sum, a) => sum + a.items.length,
          0,
        ),
        purchaseOrders: purchaseOrdersInfo,
      });

      await tx.insert(notificationsTable).values({
        recipientType: "USER",
        userId: procurement.requester.idUser,
        refType: "PROCUREMENT",
        refId: validated.data.procurementId,
        message: userNotifMessage,
        status: "PENDING",
      });
    });

    invalidateProcurement();
    invalidatePurchase();

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("Error verif procurement:", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const verifPurchase = async (values: VerifyPurchaseValues) => {
  try {
    const validated = verifyPurchaseSchema.safeParse(values);

    if (!validated.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ADMIN_KITCHEN");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, message: authResult.message };
    }

    const currentUserId = authResult.session.user.id;

    await db.transaction(async (tx) => {
      const [lastReceiptId, lastTransactionId] = await Promise.all([
        getReceiptId(),
        generateTransactionID("PURCHASE"),
      ]);

      const newReceiptId = generateProcurementId("GR", lastReceiptId);

      // 1. Verify purchase exists and status
      const purchase = await tx.query.purchaseTable.findFirst({
        where: eq(purchaseTable.idPurchase, validated.data.purchaseId),
        columns: {
          idPurchase: true,
          status: true,
          procurementId: true,
        },
      });

      if (!purchase) {
        throw new Error(`Purchase ${validated.data.purchaseId} not found`);
      }

      if (purchase.status !== "SENT") {
        throw new Error(
          `Purchase ${validated.data.purchaseId} status bukan SENT`,
        );
      }

      // 2. Create goods receipt
      await tx.insert(goodsReceiptTable).values({
        idReceipt: newReceiptId,
        purchaseId: validated.data.purchaseId,
        receivedBy: currentUserId,
      });

      // 3. Create transaction
      await tx.insert(transactionTable).values({
        idTransaction: lastTransactionId,
        type: "PURCHASE",
        status: "COMPLETED",
        userId: currentUserId,
      });

      // 4. Batch insert goods receipt items and item movements
      const receiptItems = [];
      const movements = [];

      for (const item of validated.data.items) {
        receiptItems.push({
          receiptId: newReceiptId,
          itemId: item.itemId,
          qtyReceived: item.qtyReceived,
          qtyDamaged: item.qtyDamaged,
        });

        if (Number(item.qtyReceived) > 0) {
          movements.push({
            transactionId: lastTransactionId,
            itemId: item.itemId,
            type: "IN" as const,
            quantity: item.qtyReceived,
          });
        }
      }

      // 🔥 Batch insert (2 queries instead of N queries)
      await Promise.all([
        tx.insert(goodsReceiptItemTable).values(receiptItems),
        movements.length > 0
          ? tx.insert(itemMovementTable).values(movements)
          : Promise.resolve(),
      ]);

      // 5. Update purchase status
      await tx
        .update(purchaseTable)
        .set({ status: "COMPLETED" })
        .where(eq(purchaseTable.idPurchase, validated.data.purchaseId));
    });

    invalidateItem();
    invalidateItemMov();
    invalidateProcurement();
    invalidatePurchase();
    invalidateReceipt();

    return {
      ok: true,
      message: LABEL.INPUT.SUCCESS.SAVED,
    };
  } catch (error) {
    console.error("Error verif procurement:", error);

    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        purchaseId: values.purchaseId,
      });
    }

    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};
