import { z } from "zod";
import {
  IdItemSchema,
  IdProcurementSchema,
  optionalStringSchema,
  validatedQtySchema,
} from "./validation-helper";

// Procurement Schema
export const createProcurementSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: IdItemSchema,
        qtyRequested: validatedQtySchema("jumlah pesanan"),
        notes: optionalStringSchema(5, 255),
      }),
    )
    .min(1, "Detail bahan baku wajib diisi"),
});

export type CreateProcurementValues = z.infer<typeof createProcurementSchema>;

// Verif Procurement Schema
export const verifyProcurementSchema = z.object({
  procurementId: IdProcurementSchema,
  assignments: z
    .array(
      z.object({
        supplierId: z.uuid("Pilih Supplier"),
        items: z
          .array(
            z.object({
              procurementItemId: z.uuid("Procurement item ID wajib"),
              itemId: IdItemSchema,
              qtyOrdered: validatedQtySchema("jumlah dipesan"),
            }),
          )
          .min(1, "Minimal 1 item per supplier"),
      }),
    )
    .min(1, "Minimal 1 supplier harus dipilih"),
});

export type VerifyProcurementValues = z.infer<typeof verifyProcurementSchema>;
