"use server";

import { CACHE_TAGS } from "@/lib/constant";
import { db } from "@/lib/db";
import { categoryTable } from "@/lib/db/schema";
import { TCategory } from "@/lib/type/type.categories";
import { unstable_cache } from "next/cache";

export const getCategoriesList = unstable_cache(
  async () => {
    try {
      const result = await db.select().from(categoryTable);

      if (result.length > 0) {
        return { ok: true, data: result as TCategory[] };
      } else {
        return { ok: true, data: [] as TCategory[] };
      }
    } catch (error) {
      console.error("error get categories data : ", error);
      return { ok: false, data: null };
    }
  },
  ["get-categories"],
  {
    tags: [CACHE_TAGS.master.categories.list],
    revalidate: 3600,
  },
);
