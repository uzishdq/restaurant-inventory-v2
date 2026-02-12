import z from "zod";
import {
  enumRole,
  enumTypeItem,
  IdItemSchema,
  IdSchema,
  password,
  username,
  validatedPhoneSchema,
  validatedQtySchema,
  validatedStringSchema,
} from "./validation-helper";

/* -------- UNIT & CATEGORIES --------  */
const MasterBaseSchema = (min: number, max: number) =>
  z.object({
    name: validatedStringSchema(min, max),
  });

export const CreateUnitSchema = MasterBaseSchema(2, 10);
export const UpdateUnitSchema = CreateUnitSchema.extend(IdSchema.shape);

export const CreateCategoriesSchema = MasterBaseSchema(5, 10);
export const UpdateCategoriesSchema = CreateCategoriesSchema.extend(
  IdSchema.shape,
);

/* -------- SUPPLIER --------  */
export const CreateSupplierSchema = z.object({
  store: validatedStringSchema(5, 50),
  name: validatedStringSchema(5, 50),
  phone: validatedPhoneSchema,
  address: validatedStringSchema(5, 255),
});

export const UpdateSupplierSchema = CreateSupplierSchema.extend(IdSchema.shape);

/* -------- ACCOUNT / USER --------  */
export const CreateAccountSchema = z.object({
  name: validatedStringSchema(5, 50),
  username: username,
  phone: validatedPhoneSchema,
  role: z.enum(enumRole, { error: "Tidak Boleh Kosong" }),
});

export const RoleUpdateSchema = IdSchema.extend({
  role: z.enum(enumRole, { error: "Tidak Boleh Kosong" }),
});

export const ProfileUpdateSchema = z.object({
  name: validatedStringSchema(5, 50),
  phone: validatedPhoneSchema,
});

export const UsernameUpdateSchema = z
  .object({
    oldUsername: username,
    newUsername: username,
  })
  .refine((data) => data.oldUsername !== data.newUsername, {
    message: "Username baru harus berbeda dari username saat ini.",
    path: ["newUsername"],
  });

export const PasswordUpdateSchema = z
  .object({
    oldPassword: password,
    newPassword: password,
    newConfirmPassword: password,
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "Password baru harus berbeda dari password saat ini.",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.newConfirmPassword, {
    message: "Passwords tidak cocok",
    path: ["newConfirmPassword"],
  });

/* -------- BAHAN BAKU --------  */

const DetailItemSchema = z.object({
  rawItemId: IdItemSchema,
  qty: validatedQtySchema("jumlah"),
});

export const CreateItemSchema = z
  .object({
    name: validatedStringSchema(5, 255),
    unitId: z.uuid("Pilih satuan yang valid"),
    categoryId: z.uuid("Pilih kategori yang valid"),
    type: z.enum(enumTypeItem, {
      error: "Pilih tipe item",
    }),
    minStock: validatedQtySchema("Minimal Stock"),
    bomDetails: z.array(DetailItemSchema).optional(),
  })
  .refine(
    (data) => {
      // Jika type WIP atau FG, bomDetails wajib diisi minimal 1
      if (
        (data.type === "WORK_IN_PROGRESS" || data.type === "FINISHED_GOOD") &&
        (!data.bomDetails || data.bomDetails.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Daftar Bahan Baku wajib diisi untuk WP dan FG",
      path: ["bomDetails"],
    },
  );

export const DeleteItemSchema = z.object({
  id: IdItemSchema,
});

export const TypeItemSchema = z.object({
  type: z.enum([...enumTypeItem, "ALL"], {
    error: "Pilih tipe item",
  }),
});
