import { CACHE_TAGS } from "@/lib/constant";
import { revalidateTag } from "next/cache";

export function invalidateUnit() {
  revalidateTag(CACHE_TAGS.master.unit.list, { expire: 0 });
}

export function invalidateCategories() {
  revalidateTag(CACHE_TAGS.master.categories.list, { expire: 0 });
}

export function invalidateSupplier() {
  revalidateTag(CACHE_TAGS.master.supplier.list, { expire: 0 });
}

export function invalidateItem() {
  revalidateTag(CACHE_TAGS.master.item.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.master.item.select, { expire: 0 });
}

export function invalidateUser() {
  revalidateTag(CACHE_TAGS.master.user.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.master.user.detail, { expire: 0 });
}

export function invalidateProcurement() {
  revalidateTag(CACHE_TAGS.transaction.procurement.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.transaction.procurement.detail, { expire: 0 });
}

export function invalidatePurchase() {
  revalidateTag(CACHE_TAGS.transaction.purchase.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.transaction.purchase.detail, { expire: 0 });
}
