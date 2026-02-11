"use server";

import { CACHE_TAGS } from "@/lib/constant";
import { db } from "@/lib/db";
import { supplierTable } from "@/lib/db/schema";
import { TSupplier } from "@/lib/type/type.supplier";
import { unstable_cache } from "next/cache";

export const getSupplierList = unstable_cache(
  async () => {
    try {
      const result = await db.select().from(supplierTable);

      if (result.length > 0) {
        return { ok: true, data: result as TSupplier[] };
      } else {
        return { ok: true, data: [] as TSupplier[] };
      }
    } catch (error) {
      console.error("error get unit data : ", error);
      return { ok: false, data: null };
    }
  },
  ["get-supplier"],
  {
    tags: [CACHE_TAGS.master.supplier.list],
    revalidate: 3600,
  },
);
