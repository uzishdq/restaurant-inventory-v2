import { relations } from "drizzle-orm";
import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

// USER ROLE
export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "ADMIN",
  "HEADKITCHEN",
  "KITCHEN",
  "MANAGER",
]);

// ITEM TYPE
export const typeItemEnum = pgEnum("type_item", [
  "RAW_MATERIAL",
  "WORK_IN_PROGRESS",
  "FINISHED_GOOD",
]);

// TRANSACTION TYPE (STOCK CONTEXT)
export const typeTransactionEnum = pgEnum("type_transaction", [
  "PURCHASE",
  "PRODUCTION",
  "SALES",
  "ADJUSTMENT",
]);

// MOVEMENT TYPE
export const typeMovementEnum = pgEnum("type_movement", ["IN", "OUT"]);

// TRANSACTION STATUS
export const statusTransactionEnum = pgEnum("status_transaction", [
  "PENDING",
  "COMPLETED",
  "CANCELLED",
]);

// PROCUREMENT STATUS
export const procurementStatusEnum = pgEnum("procurement_status", [
  "DRAFT",
  "ON_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

// PURCHASE STATUS
export const purchaseStatusEnum = pgEnum("purchase_status", [
  "DRAFT",
  "SENT",
  "RECEIVED",
  "COMPLETED",
  "CANCELLED",
]);

export const userTable = pgTable("user", {
  idUser: uuid("id_user").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  username: varchar("username", { length: 255 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).unique().notNull(),
  role: userRoleEnum("role").default("HEADKITCHEN").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const unitTable = pgTable("unit", {
  idUnit: uuid("id_unit").defaultRandom().primaryKey(),
  name: varchar("name", { length: 50 }).unique().notNull(),
});

export const categoryTable = pgTable("category", {
  idCategory: uuid("id_category").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
});

export const supplierTable = pgTable("supplier", {
  idSupplier: uuid("id_supplier").defaultRandom().primaryKey(),
  store: varchar("store", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).unique(),
  address: text("address"),
});

export const itemTable = pgTable("item", {
  idItem: varchar("id_item", { length: 20 }).primaryKey(),
  name: varchar("name", { length: 255 }).unique().notNull(),
  unitId: uuid("unit_id")
    .references(() => unitTable.idUnit)
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => categoryTable.idCategory)
    .notNull(),
  type: typeItemEnum("type_item").default("RAW_MATERIAL").notNull(),
  minStock: numeric("min_stock").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// BOM HEADER (untuk WIP / FG)
export const itemBomTable = pgTable("item_bom", {
  idBom: uuid("id_bom").defaultRandom().primaryKey(),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// BOM DETAIL (RAW)
export const itemBomDetailTable = pgTable("item_bom_detail", {
  idBomDetail: uuid("id_bom_detail").defaultRandom().primaryKey(),
  bomId: uuid("bom_id")
    .references(() => itemBomTable.idBom, { onDelete: "cascade" })
    .notNull(),
  rawItemId: varchar("raw_item_id", { length: 20 })
    .references(() => itemTable.idItem)
    .notNull(),
  qty: numeric("qty").notNull(),
});

export const procurementTable = pgTable("procurement", {
  idProcurement: varchar("id_procurement", { length: 20 }).primaryKey(),
  requestedBy: uuid("requested_by")
    .references(() => userTable.idUser)
    .notNull(),
  status: procurementStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseTable = pgTable("purchase", {
  idPurchase: varchar("id_purchase", { length: 20 }).primaryKey(),
  procurementId: varchar("procurement_id")
    .references(() => procurementTable.idProcurement)
    .notNull(),
  supplierId: uuid("supplier_id")
    .references(() => supplierTable.idSupplier)
    .notNull(),
  status: purchaseStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseItemTable = pgTable("purchase_item", {
  idPurchaseItem: uuid("id_purchase_item").defaultRandom().primaryKey(),
  purchaseId: varchar("purchase_id")
    .references(() => purchaseTable.idPurchase)
    .notNull(),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem)
    .notNull(),
  qtyOrdered: numeric("qty_ordered").notNull(),
});

export const goodsReceiptTable = pgTable("goods_receipt", {
  idReceipt: varchar("id_receipt", { length: 20 }).primaryKey(),
  purchaseId: varchar("purchase_id")
    .references(() => purchaseTable.idPurchase)
    .notNull(),
  receivedBy: uuid("received_by")
    .references(() => userTable.idUser)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goodsReceiptItemTable = pgTable("goods_receipt_item", {
  idReceiptItem: uuid("id_receipt_item").defaultRandom().primaryKey(),
  receiptId: varchar("receipt_id")
    .references(() => goodsReceiptTable.idReceipt)
    .notNull(),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem)
    .notNull(),
  qtyReceived: numeric("qty_received").notNull(),
  qtyDamaged: numeric("qty_damaged").default("0").notNull(),
});

export const transactionTable = pgTable("transaction", {
  idTransaction: varchar("id_transaction", { length: 20 }).primaryKey(),
  type: typeTransactionEnum("type_transaction").notNull(),
  status: statusTransactionEnum("status_transaction")
    .default("PENDING")
    .notNull(),
  userId: uuid("user_id")
    .references(() => userTable.idUser)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const itemMovementTable = pgTable("item_movement", {
  idMovement: uuid("id_movement").defaultRandom().primaryKey(),
  transactionId: varchar("transaction_id", { length: 20 }).references(
    () => transactionTable.idTransaction,
  ),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem)
    .notNull(),
  type: typeMovementEnum("type_movement").notNull(),
  quantity: numeric("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationRecipientEnum = pgEnum("notification_recipient", [
  "USER",
  "SUPPLIER",
]);

export const notificationRefEnum = pgEnum("notification_ref", [
  "PROCUREMENT",
  "PURCHASE",
  "RECEIPT",
  "RETURN",
]);

export const statusNotificationEnum = pgEnum("status_notification", [
  "PENDING",
  "ONPROGRESS",
  "SENT",
  "FAILED",
]);

export const notificationsTable = pgTable("notifications", {
  idNotification: uuid("id_notification").defaultRandom().primaryKey(),
  recipientType: notificationRecipientEnum("recipient_type").notNull(),
  userId: uuid("user_id").references(() => userTable.idUser),
  supplierId: uuid("supplier_id").references(() => supplierTable.idSupplier),
  refType: notificationRefEnum("ref_type").notNull(),
  refId: varchar("ref_id", { length: 20 }).notNull(),
  message: text("message").notNull(),
  status: statusNotificationEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// RELATIONS

export const userRelations = relations(userTable, ({ many }) => ({
  transactions: many(transactionTable),
  procurements: many(procurementTable),
  goodsReceipts: many(goodsReceiptTable),
  notifications: many(notificationsTable),
}));

export const unitRelations = relations(unitTable, ({ many }) => ({
  items: many(itemTable),
}));

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  items: many(itemTable),
}));

export const supplierRelations = relations(supplierTable, ({ many }) => ({
  purchases: many(purchaseTable),
  notifications: many(notificationsTable),
}));

export const itemRelations = relations(itemTable, ({ one, many }) => ({
  unit: one(unitTable, {
    fields: [itemTable.unitId],
    references: [unitTable.idUnit],
  }),
  category: one(categoryTable, {
    fields: [itemTable.categoryId],
    references: [categoryTable.idCategory],
  }),
  movements: many(itemMovementTable),
  boms: many(itemBomTable),
  bomDetails: many(itemBomDetailTable),
  purchaseItems: many(purchaseItemTable),
  goodsReceiptItems: many(goodsReceiptItemTable),
}));

export const itemBomRelations = relations(itemBomTable, ({ one, many }) => ({
  item: one(itemTable, {
    fields: [itemBomTable.itemId],
    references: [itemTable.idItem],
  }),
  details: many(itemBomDetailTable),
}));

export const itemBomDetailRelations = relations(
  itemBomDetailTable,
  ({ one }) => ({
    bom: one(itemBomTable, {
      fields: [itemBomDetailTable.bomId],
      references: [itemBomTable.idBom],
    }),
    rawItem: one(itemTable, {
      fields: [itemBomDetailTable.rawItemId],
      references: [itemTable.idItem],
    }),
  }),
);

export const procurementRelations = relations(
  procurementTable,
  ({ one, many }) => ({
    requester: one(userTable, {
      fields: [procurementTable.requestedBy],
      references: [userTable.idUser],
    }),
    purchases: many(purchaseTable),
    notifications: many(notificationsTable),
  }),
);

export const purchaseRelations = relations(purchaseTable, ({ one, many }) => ({
  procurement: one(procurementTable, {
    fields: [purchaseTable.procurementId],
    references: [procurementTable.idProcurement],
  }),
  supplier: one(supplierTable, {
    fields: [purchaseTable.supplierId],
    references: [supplierTable.idSupplier],
  }),
  items: many(purchaseItemTable),
  goodsReceipts: many(goodsReceiptTable),
  notifications: many(notificationsTable),
}));

export const purchaseItemRelations = relations(
  purchaseItemTable,
  ({ one }) => ({
    purchase: one(purchaseTable, {
      fields: [purchaseItemTable.purchaseId],
      references: [purchaseTable.idPurchase],
    }),
    item: one(itemTable, {
      fields: [purchaseItemTable.itemId],
      references: [itemTable.idItem],
    }),
  }),
);

export const goodsReceiptRelations = relations(
  goodsReceiptTable,
  ({ one, many }) => ({
    purchase: one(purchaseTable, {
      fields: [goodsReceiptTable.purchaseId],
      references: [purchaseTable.idPurchase],
    }),
    receiver: one(userTable, {
      fields: [goodsReceiptTable.receivedBy],
      references: [userTable.idUser],
    }),
    items: many(goodsReceiptItemTable),
    notifications: many(notificationsTable), // TAMBAHKAN
  }),
);

export const goodsReceiptItemRelations = relations(
  goodsReceiptItemTable,
  ({ one }) => ({
    receipt: one(goodsReceiptTable, {
      fields: [goodsReceiptItemTable.receiptId],
      references: [goodsReceiptTable.idReceipt],
    }),
    item: one(itemTable, {
      fields: [goodsReceiptItemTable.itemId],
      references: [itemTable.idItem],
    }),
  }),
);

export const transactionRelations = relations(
  transactionTable,
  ({ one, many }) => ({
    user: one(userTable, {
      fields: [transactionTable.userId],
      references: [userTable.idUser],
    }),
    movements: many(itemMovementTable),
  }),
);

export const itemMovementRelations = relations(
  itemMovementTable,
  ({ one }) => ({
    transaction: one(transactionTable, {
      fields: [itemMovementTable.transactionId],
      references: [transactionTable.idTransaction],
    }),
    item: one(itemTable, {
      fields: [itemMovementTable.itemId],
      references: [itemTable.idItem],
    }),
  }),
);

export const notificationRelations = relations(
  notificationsTable,
  ({ one }) => ({
    user: one(userTable, {
      fields: [notificationsTable.userId],
      references: [userTable.idUser],
    }),
    supplier: one(supplierTable, {
      fields: [notificationsTable.supplierId],
      references: [supplierTable.idSupplier],
    }),
  }),
);
