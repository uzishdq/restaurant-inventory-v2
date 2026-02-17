import { CACHE_TAGS, ROUTES } from "@/lib/constant";
import { revalidateTag, revalidatePath } from "next/cache";

export function invalidateUnit() {
  revalidateTag(CACHE_TAGS.master.unit.list, { expire: 0 });
  revalidatePath(ROUTES.AUTH.MASTER.UNIT);
  revalidatePath(ROUTES.AUTH.MASTER.ITEMS);
}

export function invalidateCategories() {
  revalidateTag(CACHE_TAGS.master.categories.list, { expire: 0 });
  revalidatePath(ROUTES.AUTH.MASTER.CATEGORY);
  revalidatePath(ROUTES.AUTH.MASTER.ITEMS);
}

export function invalidateSupplier() {
  revalidateTag(CACHE_TAGS.master.supplier.list, { expire: 0 });
  revalidatePath(ROUTES.AUTH.MASTER.SUPPLIER);
}

export function invalidateItem() {
  revalidateTag(CACHE_TAGS.master.item.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.master.item.select, { expire: 0 });
  revalidatePath(ROUTES.AUTH.MASTER.ITEMS);
  revalidatePath(ROUTES.AUTH.PROCUREMENT.CREATE);
}

export function invalidateUser() {
  revalidateTag(CACHE_TAGS.master.user.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.master.user.detail, { expire: 0 });
  revalidatePath(ROUTES.AUTH.MASTER.USERS);
}

export function invalidateProcurement() {
  revalidateTag(CACHE_TAGS.transaction.procurement.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.transaction.procurement.detail, { expire: 0 });
  revalidatePath(ROUTES.AUTH.PROCUREMENT.INDEX);
}

export function invalidatePurchase() {
  revalidateTag(CACHE_TAGS.transaction.purchase.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.transaction.purchase.detail, { expire: 0 });
  revalidatePath(ROUTES.AUTH.PURCHASE.INDEX);
}

export function invalidateReceipt() {
  revalidateTag(CACHE_TAGS.transaction.receipt.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.transaction.receipt.detail, { expire: 0 });
  revalidatePath(ROUTES.AUTH.RECEIPT.INDEX);
}

export function invalidateProduction() {
  revalidateTag(CACHE_TAGS.transaction.production.list, { expire: 0 });
  revalidateTag(CACHE_TAGS.transaction.production.detail, { expire: 0 });
  revalidatePath(ROUTES.AUTH.PRODUCTION.INDEX);
}

export function invalidateItemMov() {
  revalidateTag(CACHE_TAGS.transaction.itemMov.list, { expire: 0 });
  revalidatePath(ROUTES.AUTH.TRANSACTION.MOVEMENT);
}
