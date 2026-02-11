import { z } from "zod";
import { validatedQtySchema } from "./validation-helper";

// Procurement Schema
export const createProcurementSchema = z.object({
  items: z
    .array(
      z.object({
        itemId: z.string().min(1, "Pilih bahan baku"),
        supplierId: z.uuid("Pilih supplier"),
        qtyOrdered: validatedQtySchema("jumlah pesanan"),
      }),
    )
    .min(1, "Minimal 1 bahan baku harus dipilih"),
});

export type CreateProcurementValues = z.infer<typeof createProcurementSchema>;

// Goods Receipt Schema
export const createGoodsReceiptSchema = z
  .object({
    purchaseId: z.string().min(1, "Purchase ID diperlukan"),
    items: z
      .array(
        z.object({
          itemId: z.string().min(1, "Item ID diperlukan"),
          qtyReceived: z
            .string()
            .regex(/^\d+(\.\d+)?$/, "Qty harus berupa angka")
            .refine(
              (val) => Number.parseFloat(val) >= 0,
              "Qty tidak boleh negatif",
            ),
          qtyDamaged: z
            .string()
            .regex(/^\d+(\.\d+)?$/, "Qty harus berupa angka")
            .refine(
              (val) => Number.parseFloat(val) >= 0,
              "Qty tidak boleh negatif",
            )
            .default("0"),
          qtyOrdered: z.string(), // untuk validasi
        }),
      )
      .min(1, "Minimal 1 item"),
  })
  .refine(
    (data) => {
      // Validasi: qtyReceived + qtyDamaged tidak boleh > qtyOrdered
      return data.items.every((item) => {
        const received = Number.parseFloat(item.qtyReceived);
        const damaged = Number.parseFloat(item.qtyDamaged);
        const ordered = Number.parseFloat(item.qtyOrdered);
        return received + damaged <= ordered;
      });
    },
    {
      message: "Total qty received + damaged tidak boleh melebihi qty ordered",
      path: ["items"],
    },
  );

export type CreateGoodsReceiptValues = z.infer<typeof createGoodsReceiptSchema>;
