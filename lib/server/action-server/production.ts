"use server";

import { LABEL } from "@/lib/constant";
import {
  verifyProductionSchema,
  VerifyProductionValues,
} from "@/lib/validation/procurement-validation";
import { requireRole } from "./req-role";
import { db } from "@/lib/db";
import { getProductionId } from "../data-server/production";
import { generateSequentialIds } from "@/lib/helper";
import {
  itemBomDetailTable,
  itemBomTable,
  itemMovementTable,
  procurementTable,
  productionMaterialTable,
  productionOrderTable,
} from "@/lib/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import {
  invalidateProcurement,
  invalidateProduction,
} from "../data-server/revalidate";
import { updateProcurementAfterVerify } from "./procurement";

export const verifProduction = async (values: VerifyProductionValues) => {
  try {
    const validated = verifyProductionSchema.safeParse(values);

    if (!validated.success) {
      return { ok: false, message: LABEL.ERROR.INVALID_FIELD };
    }

    const authResult = await requireRole("ADMIN_KITCHEN");

    if (!authResult.ok || !authResult.session) {
      return { ok: false, message: authResult.message };
    }

    await db.transaction(async (tx) => {
      // ════════════════════════════════════════════
      // 1. Generate sequential production order IDs
      // ════════════════════════════════════════════
      const lastId = await getProductionId();
      const productionIds = generateSequentialIds(
        "PD",
        lastId,
        validated.data.orders.length,
      );

      // ════════════════════════════════════════════
      // 2. Validate procurement
      // ════════════════════════════════════════════
      const [procurement] = await tx
        .select({
          idProcurement: procurementTable.idProcurement,
          status: procurementTable.status,
        })
        .from(procurementTable)
        .where(
          eq(procurementTable.idProcurement, validated.data.procurementId),
        );

      if (!procurement) {
        throw new Error("Procurement tidak ditemukan");
      }

      if (procurement.status !== "DRAFT") {
        throw new Error("Procurement sudah diverifikasi sebelumnya");
      }

      // ════════════════════════════════════════════
      // 3. Get BOM details for all items
      // ════════════════════════════════════════════
      const itemIds = validated.data.orders.map((o) => o.itemId);

      const bomDetails = await tx
        .select({
          itemId: itemBomTable.itemId,
          bomDetailId: itemBomDetailTable.idBomDetail,
          rawItemId: itemBomDetailTable.rawItemId,
          qtyPerUnit: itemBomDetailTable.qty,
        })
        .from(itemBomTable)
        .innerJoin(
          itemBomDetailTable,
          eq(itemBomTable.idBom, itemBomDetailTable.bomId),
        )
        .where(inArray(itemBomTable.itemId, itemIds));

      // Group BOM by itemId
      const bomByItemId = bomDetails.reduce<
        Record<string, Array<(typeof bomDetails)[number]>>
      >((acc, bom) => {
        if (!acc[bom.itemId]) {
          acc[bom.itemId] = [];
        }
        acc[bom.itemId].push(bom);
        return acc;
      }, {});

      // ════════════════════════════════════════════
      // 4. Get current stock for raw materials
      // ════════════════════════════════════════════
      const rawItemIds = [...new Set(bomDetails.map((b) => b.rawItemId))];
      const stockMap = new Map<string, number>();

      if (rawItemIds.length > 0) {
        const stockSummary = await tx
          .select({
            itemId: itemMovementTable.itemId,
            currentStock: sql<string>`
              COALESCE(
                SUM(
                  CASE
                    WHEN ${itemMovementTable.type} = 'IN' THEN ${itemMovementTable.quantity}::numeric
                    WHEN ${itemMovementTable.type} = 'OUT' THEN -${itemMovementTable.quantity}::numeric
                    ELSE 0
                  END
                ), 0
              )
            `.as("current_stock"),
          })
          .from(itemMovementTable)
          .where(inArray(itemMovementTable.itemId, rawItemIds))
          .groupBy(itemMovementTable.itemId);

        stockSummary.forEach((s) => {
          stockMap.set(s.itemId, Number.parseFloat(s.currentStock));
        });
      }

      // ════════════════════════════════════════════
      // 5. Create production orders
      // ════════════════════════════════════════════
      for (const [index, order] of validated.data.orders.entries()) {
        const productionOrderId = productionIds[index];
        const orderBomDetails = bomByItemId[order.itemId] ?? [];
        const qtyTarget = Number.parseFloat(order.qtyTarget);

        // Check if all materials are sufficient
        const allMaterialsEnough =
          orderBomDetails.length > 0 &&
          orderBomDetails.every((bom) => {
            const required = Number.parseFloat(bom.qtyPerUnit) * qtyTarget;
            const available = stockMap.get(bom.rawItemId) ?? 0;
            return available >= required;
          });

        // Determine status and scheduled date
        const status = allMaterialsEnough ? "SCHEDULED" : "DRAFT";
        const scheduledDate =
          allMaterialsEnough && order.scheduledDate
            ? new Date(order.scheduledDate)
            : null;

        // Insert production order
        await tx.insert(productionOrderTable).values({
          idProductionOrder: productionOrderId,
          procurementId: validated.data.procurementId,
          procurementItemId: order.procurementItemId,
          itemId: order.itemId,
          qtyTarget: order.qtyTarget,
          qtyProduced: "0",
          status,
          scheduledDate,
          notes: order.notes ?? null,
        });

        // Insert production materials from BOM
        if (orderBomDetails.length > 0) {
          const materials = orderBomDetails.map((bom) => ({
            productionOrderId,
            bomDetailId: bom.bomDetailId,
            itemId: bom.rawItemId,
            qtyRequired: (
              Number.parseFloat(bom.qtyPerUnit) * qtyTarget
            ).toString(),
            qtyUsed: "0",
          }));

          await tx.insert(productionMaterialTable).values(materials);
        }
      }

      // ════════════════════════════════════════════
      // 6. Update procurement status
      // ════════════════════════════════════════════
      await updateProcurementAfterVerify(tx, validated.data.procurementId);
    });

    invalidateProcurement();
    invalidateProduction();

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
