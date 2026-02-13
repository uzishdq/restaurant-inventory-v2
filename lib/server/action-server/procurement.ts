"use server";

import { db } from "@/lib/db";
import {
  createProcurementSchema,
  verifyProcurementSchema,
  VerifyProcurementValues,
  type CreateProcurementValues,
} from "@/lib/validation/procurement-validation";
import { LABEL, ROUTES } from "@/lib/constant";
import { requireRole } from "./req-role";
import { getProcerumentId } from "../data-server/procurement";
import { generateProcurementId, generateSequentialIds } from "@/lib/helper";
import {
  itemTable,
  notificationsTable,
  procurementItemTable,
  procurementTable,
  purchaseItemTable,
  purchaseTable,
  supplierTable,
  unitTable,
} from "@/lib/db/schema";
import { getPurchaseId } from "../data-server/purchase";
import { eq } from "drizzle-orm";
import {
  templateProcurementApproved,
  templatePurchaseRequest,
} from "@/lib/template-notif";
import { revalidatePath } from "next/cache";
import {
  invalidateProcurement,
  invalidatePurchase,
} from "../data-server/revalidate";

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
    revalidatePath(ROUTES.AUTH.PROCUREMENT.INDEX);

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
    revalidatePath(ROUTES.AUTH.PROCUREMENT.INDEX);

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
