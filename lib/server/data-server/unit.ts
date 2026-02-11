"use server";

import { CACHE_TAGS } from "@/lib/constant";
import { db } from "@/lib/db";
import { unitTable } from "@/lib/db/schema";
import { TUnit } from "@/lib/type/type.unit";
import { unstable_cache } from "next/cache";

export const getUnitList = unstable_cache(
  async () => {
    try {
      const result = await db.select().from(unitTable);

      if (result.length > 0) {
        return { ok: true, data: result as TUnit[] };
      } else {
        return { ok: true, data: [] as TUnit[] };
      }
    } catch (error) {
      console.error("error get unit data : ", error);
      return { ok: false, data: null };
    }
  },
  ["get-unit"],
  {
    tags: [CACHE_TAGS.master.unit.list],
    revalidate: 3600,
  },
);
