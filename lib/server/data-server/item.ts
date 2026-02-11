"use server";

import { CACHE_TAGS } from "@/lib/constant";
import { db } from "@/lib/db";
import {
  categoryTable,
  itemBomDetailTable,
  itemBomTable,
  itemTable,
  unitTable,
} from "@/lib/db/schema";
import { typeItems } from "@/lib/type/type.helper";
import { TItem, TItemSelect } from "@/lib/type/type.item";
import { desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { unstable_cache } from "next/cache";

export const getItemId = async (type: typeItems) => {
  const [result] = await db
    .select({ id: itemTable.idItem })
    .from(itemTable)
    .where(eq(itemTable.type, type))
    .orderBy(desc(itemTable.idItem))
    .limit(1)
    .execute();

  return result ? result.id : null;
};

export const getItemList = unstable_cache(
  async () => {
    try {
      const rawResult = await db
        .select({
          idItem: itemTable.idItem,
          name: itemTable.name,
          idCategory: categoryTable.idCategory,
          categoryName: categoryTable.name,
          idUnit: unitTable.idUnit,
          unitName: unitTable.name,
          type: itemTable.type,
          minStock: itemTable.minStock,
          createdAt: itemTable.createdAt,
          // BOM details (akan null jika tidak ada)
          bomId: itemBomDetailTable.bomId,
          rawItemId: itemBomDetailTable.rawItemId,
          rawItemName: sql<string>`raw_item.name`.as("raw_item_name"),
          rawCategoryName: sql<string | null>`raw_category.name`.as(
            "raw_category_name",
          ),
          rawUnitName: sql<string | null>`raw_unit.name`.as("raw_unit_name"),
          rawType: sql<typeItems>`raw_item.type_item`.as("raw_type"),
          qty: itemBomDetailTable.qty,
        })
        .from(itemTable)
        .leftJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit))
        .leftJoin(
          categoryTable,
          eq(itemTable.categoryId, categoryTable.idCategory),
        )
        .leftJoin(itemBomTable, eq(itemTable.idItem, itemBomTable.itemId))
        .leftJoin(
          itemBomDetailTable,
          eq(itemBomTable.idBom, itemBomDetailTable.bomId),
        )
        .leftJoin(
          alias(itemTable, "raw_item"),
          eq(itemBomDetailTable.rawItemId, sql`raw_item.id_item`),
        )
        .leftJoin(
          alias(unitTable, "raw_unit"),
          eq(sql`raw_item.unit_id`, sql`raw_unit.id_unit`),
        )
        .leftJoin(
          alias(categoryTable, "raw_category"),
          eq(sql`raw_item.category_id`, sql`raw_category.id_category`),
        );

      // Transform ke TItem[]
      const itemMap = new Map<string, TItem>();

      rawResult.forEach((row) => {
        if (!itemMap.has(row.idItem)) {
          itemMap.set(row.idItem, {
            idItem: row.idItem,
            name: row.name,
            idCategory: row.idCategory,
            categoryName: row.categoryName,
            idUnit: row.idUnit,
            unitName: row.unitName,
            type: row.type,
            minStock: row.minStock,
            createdAt: row.createdAt,
            detailItem: [],
          });
        }

        // Tambahkan detail jika ada
        if (row.bomId && row.rawItemId) {
          itemMap.get(row.idItem)!.detailItem.push({
            idBom: row.bomId,
            rawItemId: row.rawItemId,
            name: row.rawItemName,
            categoryName: row.rawCategoryName,
            unitName: row.rawUnitName,
            type: row.rawType,
            qty: row.qty,
          });
        }
      });

      const result: TItem[] = Array.from(itemMap.values());

      if (result.length > 0) {
        return { ok: true, data: result };
      } else {
        return { ok: true, data: [] };
      }
    } catch (error) {
      console.error("error get item data : ", error);
      return { ok: false, data: null };
    }
  },
  ["get-item"],
  {
    tags: [CACHE_TAGS.master.item.list],
    revalidate: 3600,
  },
);

export const getSelectItem = unstable_cache(
  async () => {
    try {
      const result = await db
        .select({
          idItem: itemTable.idItem,
          name: itemTable.name,
          unitName: unitTable.name,
        })
        .from(itemTable)
        .leftJoin(unitTable, eq(itemTable.unitId, unitTable.idUnit));

      if (result.length > 0) {
        return { ok: true, data: result as TItemSelect[] };
      } else {
        return { ok: true, data: [] };
      }
    } catch (error) {
      console.error("error get item data : ", error);
      return { ok: false, data: null };
    }
  },
  ["get-item-select"],
  {
    tags: [CACHE_TAGS.master.item.select],
    revalidate: 3600,
  },
);
