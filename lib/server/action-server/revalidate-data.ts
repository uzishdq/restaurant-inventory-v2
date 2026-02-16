"use server";

import { CACHE_TAGS, LABEL } from "@/lib/constant";
import { revalidateTag } from "next/cache";

export const revalidateData = async () => {
  try {
    const groups = Object.values(CACHE_TAGS);

    for (const group of groups) {
      Object.values(group).forEach((tags) => {
        if (tags.kode) revalidateTag(tags.kode, { expire: 0 });
        if (tags.list) revalidateTag(tags.list, { expire: 0 });
        if (tags.detail) revalidateTag(tags.detail, { expire: 0 });
        if (tags.select) revalidateTag(tags.select, { expire: 0 });
      });
    }
    return {
      ok: true,
      message: LABEL.SUCCESS.REVALIDATE,
    };
  } catch (error) {
    console.error("error revalidate data : ", error);
    return {
      ok: false,
      message: LABEL.ERROR.DESCRIPTION,
    };
  }
};
