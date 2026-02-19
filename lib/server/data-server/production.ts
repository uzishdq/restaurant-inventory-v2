"use server";

import { CACHE_TAGS } from "@/lib/constant";
import { db } from "@/lib/db";
import {
  categoryTable,
  itemTable,
  productionMaterialTable,
  productionOrderTable,
  productionRecordTable,
  unitTable,
  userTable,
} from "@/lib/db/schema";
import {
  TProductionMaterial,
  TProductionOrder,
  TProductionRecord,
} from "@/lib/type/type.production";
import { desc, eq, inArray } from "drizzle-orm";
import { unstable_cache } from "next/cache";

export const getProductionId = async () => {
  const [result] = await db
    .select({ id: productionOrderTable.idProductionOrder })
    .from(productionOrderTable)
    .orderBy(desc(productionOrderTable.idProductionOrder))
    .limit(1)
    .execute();

  return result ? result.id : null;
};

export const getProductionList = unstable_cache(
  async () => {
    try {
      // Get all production orders with item details
      const productionOrders = await db
        .select({
          idProductionOrder: productionOrderTable.idProductionOrder,
          procurementId: productionOrderTable.procurementId,
          itemId: productionOrderTable.itemId,
          itemName: itemTable.name,
          itemType: itemTable.type,
          categoryName: categoryTable.name,
          unitName: unitTable.name,
          qtyTarget: productionOrderTable.qtyTarget,
          qtyProduced: productionOrderTable.qtyProduced,
          status: productionOrderTable.status,
          scheduledDate: productionOrderTable.scheduledDate,
          completedDate: productionOrderTable.completedDate,
          notes: productionOrderTable.notes,
          createdAt: productionOrderTable.createdAt,
        })
        .from(productionOrderTable)
        .leftJoin(itemTable, eq(productionOrderTable.itemId, itemTable.idItem))
        .leftJoin(
          categoryTable,
          eq(itemTable.categoryId, categoryTable.idCategory),
        )
        .leftJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit))
        .orderBy(desc(productionOrderTable.createdAt));

      if (productionOrders.length === 0) {
        return { ok: true, data: [] };
      }

      const productionOrderIds = productionOrders.map(
        (po) => po.idProductionOrder,
      );

      // Get all materials for these orders
      const materials = await db
        .select({
          idProductionMaterial: productionMaterialTable.idProductionMaterial,
          productionOrderId: productionMaterialTable.productionOrderId,
          itemId: productionMaterialTable.itemId,
          itemName: itemTable.name,
          unitName: unitTable.name,
          qtyRequired: productionMaterialTable.qtyRequired,
          qtyUsed: productionMaterialTable.qtyUsed,
        })
        .from(productionMaterialTable)
        .leftJoin(
          itemTable,
          eq(productionMaterialTable.itemId, itemTable.idItem),
        )
        .leftJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit))
        .where(
          inArray(
            productionMaterialTable.productionOrderId,
            productionOrderIds,
          ),
        );

      // Get all records for these orders
      const records = await db
        .select({
          idProductionRecord: productionRecordTable.idProductionRecord,
          productionOrderId: productionRecordTable.productionOrderId,
          producedBy: productionRecordTable.producedBy,
          producerName: userTable.name,
          qtyProduced: productionRecordTable.qtyProduced,
          notes: productionRecordTable.notes,
          createdAt: productionRecordTable.createdAt,
        })
        .from(productionRecordTable)
        .leftJoin(
          userTable,
          eq(productionRecordTable.producedBy, userTable.idUser),
        )
        .where(
          inArray(productionRecordTable.productionOrderId, productionOrderIds),
        );

      // Group materials by production order
      const materialsByOrder = materials.reduce<
        Record<string, TProductionMaterial[]>
      >((acc, material) => {
        if (!acc[material.productionOrderId]) {
          acc[material.productionOrderId] = [];
        }
        acc[material.productionOrderId].push({
          idProductionMaterial: material.idProductionMaterial,
          itemId: material.itemId,
          itemName: material.itemName ?? "-",
          unitName: material.unitName,
          qtyRequired: material.qtyRequired,
          qtyUsed: material.qtyUsed,
        });
        return acc;
      }, {});

      // Group records by production order
      const recordsByOrder = records.reduce<
        Record<string, TProductionRecord[]>
      >((acc, record) => {
        if (!acc[record.productionOrderId]) {
          acc[record.productionOrderId] = [];
        }
        acc[record.productionOrderId].push({
          idProductionRecord: record.idProductionRecord,
          producedBy: record.producedBy,
          producerName: record.producerName ?? "-",
          qtyProduced: record.qtyProduced,
          notes: record.notes,
          createdAt: record.createdAt,
        });
        return acc;
      }, {});

      // Combine all data
      const result: TProductionOrder[] = productionOrders.map((order) => {
        const qtyTarget = Number.parseFloat(order.qtyTarget);
        const qtyProduced = Number.parseFloat(order.qtyProduced);
        const progressPercentage =
          qtyTarget > 0 ? Math.round((qtyProduced / qtyTarget) * 100) : 0;

        return {
          idProductionOrder: order.idProductionOrder,
          procurementId: order.procurementId,
          itemId: order.itemId,
          itemName: order.itemName ?? "-",
          itemType: order.itemType ?? "WORK_IN_PROGRESS",
          categoryName: order.categoryName,
          unitName: order.unitName,
          qtyTarget: order.qtyTarget,
          qtyProduced: order.qtyProduced,
          status: order.status,
          scheduledDate: order.scheduledDate,
          completedDate: order.completedDate,
          notes: order.notes,
          createdAt: order.createdAt,
          materials: materialsByOrder[order.idProductionOrder] ?? [],
          records: recordsByOrder[order.idProductionOrder] ?? [],
          progressPercentage,
        };
      });

      return { ok: true, data: result };
    } catch (error) {
      console.error("error get production data : ", error);
      return { ok: false, data: null };
    }
  },
  ["get-production"],
  {
    tags: [CACHE_TAGS.transaction.production.list],
    revalidate: 3600,
  },
);
