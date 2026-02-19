"use server";

import { db } from "@/lib/db";
import { productionOrderTable } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const getProductionId = async () => {
  const [result] = await db
    .select({ id: productionOrderTable.idProductionOrder })
    .from(productionOrderTable)
    .orderBy(desc(productionOrderTable.idProductionOrder))
    .limit(1)
    .execute();

  return result ? result.id : null;
};
