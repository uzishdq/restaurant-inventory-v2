"use server";

import { db } from "@/lib/db";
import {
  procurementTable,
  purchaseTable,
  purchaseItemTable,
} from "@/lib/db/schema";
import {
  createProcurementSchema,
  type CreateProcurementValues,
} from "@/lib/validation/procurement-validation";
import { revalidatePath } from "next/cache";
import { LABEL, ROUTES } from "@/lib/constant";
import { eq } from "drizzle-orm";
import { requireRole } from "./req-role";

// Generate Procurement ID (format: PR-YYYYMMDD-001)
async function generateProcurementId(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `PR-${dateStr}`;

  const lastProcurement = await db.query.procurementTable.findFirst({
    where: (procurement, { like }) =>
      like(procurement.idProcurement, `${prefix}%`),
    orderBy: (procurement, { desc }) => [desc(procurement.idProcurement)],
  });

  if (!lastProcurement) {
    return `${prefix}-001`;
  }

  const lastNumber = parseInt(lastProcurement.idProcurement.split("-")[2]);
  const newNumber = (lastNumber + 1).toString().padStart(3, "0");
  return `${prefix}-${newNumber}`;
}

// Generate Purchase ID (format: PO-YYYYMMDD-001)
async function generatePurchaseId(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `PO-${dateStr}`;

  const lastPurchase = await db.query.purchaseTable.findFirst({
    where: (purchase, { like }) => like(purchase.idPurchase, `${prefix}%`),
    orderBy: (purchase, { desc }) => [desc(purchase.idPurchase)],
  });

  if (!lastPurchase) {
    return `${prefix}-001`;
  }

  const lastNumber = parseInt(lastPurchase.idPurchase.split("-")[2]);
  const newNumber = (lastNumber + 1).toString().padStart(3, "0");
  return `${prefix}-${newNumber}`;
}

export const createProcurement = async (values: CreateProcurementValues) => {
  try {
    const validated = createProcurementSchema.safeParse(values);

    if (!validated.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    // 2. Auth check
    const authResult = await requireRole("ADMIN_ONLY");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, message: authResult.message };
    }

    // 3. Group items by supplier
    const itemsBySupplier = validated.data.items.reduce(
      (acc, item) => {
        if (!acc[item.supplierId]) {
          acc[item.supplierId] = [];
        }
        acc[item.supplierId].push(item);
        return acc;
      },
      {} as Record<string, typeof validated.data.items>,
    );

    // 4. Transaction
    await db.transaction(async (tx) => {
      // Generate procurement ID
      const procurementId = await generateProcurementId();

      // Insert procurement
      await tx.insert(procurementTable).values({
        idProcurement: procurementId,
        requestedBy: authResult.session.user.id,
        status: "DRAFT",
      });

      // Create purchase orders for each supplier
      for (const [supplierId, items] of Object.entries(itemsBySupplier)) {
        const purchaseId = await generatePurchaseId();

        // Insert purchase
        await tx.insert(purchaseTable).values({
          idPurchase: purchaseId,
          procurementId,
          supplierId,
          status: "DRAFT",
        });

        // Insert purchase items
        const purchaseItems = items.map((item) => ({
          purchaseId,
          itemId: item.itemId,
          qtyOrdered: item.qtyOrdered,
        }));

        await tx.insert(purchaseItemTable).values(purchaseItems);
      }

      // Update procurement status to ON_PROGRESS
      await tx
        .update(procurementTable)
        .set({ status: "ON_PROGRESS" })
        .where(eq(procurementTable.idProcurement, procurementId));
    });

    return {
      ok: true,
      message: "Pengadaan berhasil dibuat",
    };
  } catch (error) {
    console.error("Error create procurement:", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};

export const updatePurchaseStatus = async (
  purchaseId: string,
  status: "DRAFT" | "SENT" | "RECEIVED" | "COMPLETED" | "CANCELLED",
) => {
  try {
    const authResult = await requireRole("ADMIN_ONLY");

    if (!authResult.ok) {
      return { ok: false, message: authResult.message };
    }

    await db
      .update(purchaseTable)
      .set({ status })
      .where(eq(purchaseTable.idPurchase, purchaseId));

    return {
      ok: true,
      message: `Status purchase diubah menjadi ${status}`,
    };
  } catch (error) {
    console.error("Error update purchase status:", error);
    return {
      ok: false,
      message: LABEL.ERROR.SERVER,
    };
  }
};
