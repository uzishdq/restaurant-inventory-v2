import z from "zod";

const allowedRegex = /^[a-zA-Z0-9.,/ \-']+$/;

const regexIdItem = /^BB-(RW|WP|FG)-\d{3}$/;
const regexIdProcurement = /^(PR|PO|GR)-\d{4}$/;

export const enumRole = [
  "SUPER_ADMIN",
  "ADMIN",
  "HEADKITCHEN",
  "KITCHEN",
  "MANAGER",
] as const;

export const enumTypeItem = [
  "RAW_MATERIAL",
  "WORK_IN_PROGRESS",
  "FINISHED_GOOD",
] as const;

export const username = z
  .string()
  .min(5, "Harus memiliki minimal 5 karakter.")
  .max(50, "Tidak boleh melebihi 50 karakter.")
  .regex(
    allowedRegex,
    "Gunakan hanya huruf, angka, spasi, titik, koma, atau garis miring.",
  )
  .refine((username) => !/\s/.test(username), {
    message: "Tidak boleh mengandung spasi.",
  });

export const password = z
  .string()
  .min(6, "Harus memiliki minimal 6 karakter.")
  .max(50, "Tidak boleh melebihi 50 karakter.");

export const IdSchema = z.object({
  id: z.uuid("ID tidak valid."),
});

export const IdItemSchema = z
  .string()
  .min(1, "Pilih bahan baku")
  .max(20, "ID Item maksimal 20 karakter")
  .regex(regexIdItem, "Format: BB-RW-001, BB-WP-001, atau BB-FG-001");

export const IdProcurementSchema = z
  .string()
  .min(1, "Procurement ID wajib diisi")
  .max(20, "ID Procurement maksimal 20 karakter")
  .regex(regexIdProcurement, "Format: PR-0001, PO-0001, atauGR-0001");

export const validatedStringSchema = (min = 5, max = 50) =>
  z
    .string()
    .min(min, `Harus memiliki minimal ${min} karakter.`)
    .max(max, `Tidak boleh melebihi ${max} karakter.`)
    .regex(
      allowedRegex,
      "Gunakan hanya huruf, angka, spasi, titik, koma, atau garis miring.",
    );

export const optionalStringSchema = (min = 5, max = 50) =>
  z
    .string()
    .trim()
    .refine(
      (val) => val === "" || (val.length >= min && val.length <= max),
      `Harus memiliki minimal ${min} dan maksimal ${max} karakter.`,
    )
    .refine(
      (val) => val === "" || allowedRegex.test(val),
      "Gunakan hanya huruf, angka, spasi, titik, koma, atau garis miring.",
    )
    .transform((val) => (val === "" ? "" : val));

export const validatedPhoneSchema = z
  .string()
  .min(10, {
    message: "Nomor telepon harus terdiri minimal 10 digit.",
  })
  .max(15, {
    message: "Nomor telepon tidak boleh melebihi 15 digit.",
  })
  .regex(/^[0-9]+$/, {
    message: "Nomor telepon hanya boleh berisi angka.",
  })
  .refine((value) => value.startsWith("0"), {
    message: "Nomor telepon harus diawali dengan angka 0.",
  });

export const validatedQtySchema = (label: string, min = 0.01, max = 5000) =>
  z
    .string()
    .regex(/^\d+(\.\d+)?$/, `${label} wajib diisi`)
    .refine((val) => Number.parseFloat(val) >= min, {
      message: `${label} minimal ${min}`,
    })
    .refine((val) => Number.parseFloat(val) <= max, {
      message: `${label} maksimal ${max}`,
    });
