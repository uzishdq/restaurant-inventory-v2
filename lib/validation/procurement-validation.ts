import { z } from "zod";
import {
  enumStatusProcurement,
  enumStatusPurchase,
  enumTypeItem,
  IdItemSchema,
  IdProcurementSchema,
  optionalStringSchema,
  scheduledDateSchema,
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

export const deleteProductionSchema = z.object({
  procurementId: IdProcurementSchema,
});

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

export const procurementByIdSchema = z.object({
  id: IdProcurementSchema,
  status: z.enum([...enumStatusProcurement, "ALL"], {
    error: "Status Pengadaan Tidak sesuai",
  }),
  itemType: z.enum([...enumTypeItem, "ALL"]).optional(),
});

// Purchase Schema
export const purchaseByIdSchema = z.object({
  id: IdProcurementSchema,
  status: z.enum([...enumStatusPurchase, "ALL"], {
    error: "Status Pembelian Tidak sesuai",
  }),
});

export const verifyPurchaseSchema = z.object({
  procurementId: IdProcurementSchema,
  purchaseId: IdProcurementSchema,
  items: z
    .array(
      z
        .object({
          itemId: IdItemSchema,
          qtyOrdered: validatedQtySchema("jumlah dipesan"),
          qtyReceived: validatedQtySchema("jumlah diterima", 0),
          qtyDamaged: validatedQtySchema("jumlah tidak sesuai", 0),
        })
        .superRefine((item, ctx) => {
          const received = Number(item.qtyReceived);
          const damaged = Number(item.qtyDamaged);
          const ordered = Number(item.qtyOrdered);

          if (received + damaged > ordered) {
            ctx.addIssue({
              code: "custom",
              message: `Tidak boleh melebihi jumlah dipesan`,
              path: ["qtyReceived"],
            });
            ctx.addIssue({
              code: "custom",
              message: `Tidak boleh melebihi jumlah dipesan`,
              path: ["qtyDamaged"],
            });
          }

          if (received + damaged < ordered) {
            ctx.addIssue({
              code: "custom",
              message: `Tidak boleh kurang dari jumlah dipesan`,
              path: ["qtyReceived"],
            });
            ctx.addIssue({
              code: "custom",
              message: `Tidak boleh kurang dari jumlah dipesan`,
              path: ["qtyDamaged"],
            });
          }
        }),
    )
    .min(1, "Minimal 1 bahan baku"),
});

export type VerifyPurchaseValues = z.infer<typeof verifyPurchaseSchema>;

// Production Schema

export const verifyProductionSchema = z.object({
  procurementId: IdProcurementSchema,
  orders: z
    .array(
      z.object({
        procurementItemId: z.uuid("ID item tidak valid"),
        itemId: IdItemSchema,
        qtyTarget: validatedQtySchema("jumlah target"),
        scheduledDate: scheduledDateSchema,
        notes: z.string().max(255).optional(),
      }),
    )
    .min(1, "Minimal 1 item produksi wajib diisi"),
});

export type VerifyProductionValues = z.infer<typeof verifyProductionSchema>;
