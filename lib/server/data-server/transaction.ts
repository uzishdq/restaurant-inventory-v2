"use server";

import { db } from "@/lib/db";
import { transactionTable } from "@/lib/db/schema";
import { typeTransactionType } from "@/lib/type/type.helper";
import { like, sql } from "drizzle-orm";

export async function generateTransactionID(type: typeTransactionType) {
  const typeMap: Record<string, string> = {
    PURCHASE: "IN",
    PRODUCTION: "PR",
    SALES: "OUT",
    ADJUSTMENT: "CHK",
  };

  const prefix = typeMap[type] ?? type;
  const keyword = `TRX-${prefix}-%`;

  const [result] = await db
    .select({ maxNo: sql<string>`max(${transactionTable.idTransaction})` })
    .from(transactionTable)
    .where(like(transactionTable.idTransaction, keyword))
    .limit(1);

  const lastNumber = result?.maxNo
    ? Number(result.maxNo.split("-").pop()) || 0
    : 0;

  // Buat nomor berikutnya
  const nextNumber = lastNumber + 1;
  const formattedNumber = nextNumber.toString().padStart(4, "0");
  const nextID = `TRX-${prefix}-${formattedNumber}`;

  return nextID;
}
