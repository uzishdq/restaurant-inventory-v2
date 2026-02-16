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

// ══════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════

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

// PRODUCTION STATUS
export const productionStatusEnum = pgEnum("production_status", [
  "DRAFT",
  "SCHEDULED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

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

// ══════════════════════════════════════════════════════════
// TABLES
// ══════════════════════════════════════════════════════════

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
    .references(() => unitTable.idUnit, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  categoryId: uuid("category_id")
    .references(() => categoryTable.idCategory, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  type: typeItemEnum("type_item").default("RAW_MATERIAL").notNull(),
  minStock: numeric("min_stock").default("0").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// BOM HEADER (untuk WIP / FG)
export const itemBomTable = pgTable("item_bom", {
  idBom: uuid("id_bom").defaultRandom().primaryKey(),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// BOM DETAIL (RAW)
export const itemBomDetailTable = pgTable("item_bom_detail", {
  idBomDetail: uuid("id_bom_detail").defaultRandom().primaryKey(),
  bomId: uuid("bom_id")
    .references(() => itemBomTable.idBom, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  rawItemId: varchar("raw_item_id", { length: 20 })
    .references(() => itemTable.idItem)
    .notNull(),
  qty: numeric("qty").notNull(),
});

// ══════════════════════════════════════════════════════════
// PROCUREMENT FLOW
// ══════════════════════════════════════════════════════════

export const procurementTable = pgTable("procurement", {
  idProcurement: varchar("id_procurement", { length: 20 }).primaryKey(),
  requestedBy: uuid("requested_by")
    .references(() => userTable.idUser, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  status: procurementStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const procurementItemTable = pgTable("procurement_item", {
  idProcurementItem: uuid("id_procurement_item").defaultRandom().primaryKey(),
  procurementId: varchar("procurement_id", { length: 20 })
    .references(() => procurementTable.idProcurement, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  qtyRequested: numeric("qty_requested").notNull(),
  notes: text("notes"),
});

export const purchaseTable = pgTable("purchase", {
  idPurchase: varchar("id_purchase", { length: 20 }).primaryKey(),
  procurementId: varchar("procurement_id", { length: 20 })
    .references(() => procurementTable.idProcurement, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  supplierId: uuid("supplier_id")
    .references(() => supplierTable.idSupplier, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  status: purchaseStatusEnum("status").default("DRAFT").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const purchaseItemTable = pgTable("purchase_item", {
  idPurchaseItem: uuid("id_purchase_item").defaultRandom().primaryKey(),
  purchaseId: varchar("purchase_id", { length: 20 })
    .references(() => purchaseTable.idPurchase, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  procurementItemId: uuid("procurement_item_id")
    .references(() => procurementItemTable.idProcurementItem, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem)
    .notNull(),
  qtyOrdered: numeric("qty_ordered").notNull(),
});

export const goodsReceiptTable = pgTable("goods_receipt", {
  idReceipt: varchar("id_receipt", { length: 20 }).primaryKey(),
  purchaseId: varchar("purchase_id", { length: 20 })
    .references(() => purchaseTable.idPurchase)
    .notNull(),
  receivedBy: uuid("received_by")
    .references(() => userTable.idUser)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const goodsReceiptItemTable = pgTable("goods_receipt_item", {
  idReceiptItem: uuid("id_receipt_item").defaultRandom().primaryKey(),
  receiptId: varchar("receipt_id", { length: 20 })
    .references(() => goodsReceiptTable.idReceipt, { onDelete: "cascade" })
    .notNull(),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem)
    .notNull(),
  qtyReceived: numeric("qty_received").notNull(),
  qtyDamaged: numeric("qty_damaged").default("0").notNull(),
  notes: text("notes"),
});

export const productionOrderTable = pgTable("production_order", {
  idProductionOrder: varchar("id_production_order", {
    length: 20,
  }).primaryKey(),
  procurementId: varchar("procurement_id", { length: 20 })
    .references(() => procurementTable.idProcurement, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  procurementItemId: uuid("procurement_item_id")
    .references(() => procurementItemTable.idProcurementItem, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem, {
      onDelete: "restrict",
      onUpdate: "cascade",
    })
    .notNull(),
  qtyTarget: numeric("qty_target").notNull(),
  qtyProduced: numeric("qty_produced").default("0").notNull(),
  status: productionStatusEnum("status").default("DRAFT").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  completedDate: timestamp("completed_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// PRODUCTION MATERIAL (BOM materials yang dibutuhkan)
export const productionMaterialTable = pgTable("production_material", {
  idProductionMaterial: uuid("id_production_material")
    .defaultRandom()
    .primaryKey(),
  productionOrderId: varchar("production_order_id", { length: 20 })
    .references(() => productionOrderTable.idProductionOrder, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  bomDetailId: uuid("bom_detail_id")
    .references(() => itemBomDetailTable.idBomDetail, {
      onDelete: "restrict",
      onUpdate: "cascade",
    })
    .notNull(),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem, {
      onDelete: "restrict",
      onUpdate: "cascade",
    })
    .notNull(),
  qtyRequired: numeric("qty_required").notNull(),
  qtyUsed: numeric("qty_used").default("0").notNull(),
});

// PRODUCTION RECORD (Actual production activity/batch)
export const productionRecordTable = pgTable("production_record", {
  idProductionRecord: varchar("id_production_record", {
    length: 20,
  }).primaryKey(),
  productionOrderId: varchar("production_order_id", { length: 20 })
    .references(() => productionOrderTable.idProductionOrder, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  producedBy: uuid("produced_by")
    .references(() => userTable.idUser, {
      onDelete: "restrict",
      onUpdate: "cascade",
    })
    .notNull(),
  qtyProduced: numeric("qty_produced").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionTable = pgTable("transaction", {
  idTransaction: varchar("id_transaction", { length: 20 }).primaryKey(),
  type: typeTransactionEnum("type_transaction").notNull(),
  status: statusTransactionEnum("status_transaction")
    .default("PENDING")
    .notNull(),
  userId: uuid("user_id")
    .references(() => userTable.idUser, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const itemMovementTable = pgTable("item_movement", {
  idMovement: uuid("id_movement").defaultRandom().primaryKey(),
  transactionId: varchar("transaction_id", { length: 20 }).references(
    () => transactionTable.idTransaction,
  ),
  itemId: varchar("item_id", { length: 20 })
    .references(() => itemTable.idItem, {
      onDelete: "cascade",
      onUpdate: "cascade",
    })
    .notNull(),
  type: typeMovementEnum("type_movement").notNull(),
  quantity: numeric("quantity").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsTable = pgTable("notifications", {
  idNotification: uuid("id_notification").defaultRandom().primaryKey(),
  recipientType: notificationRecipientEnum("recipient_type").notNull(),
  userId: uuid("user_id").references(() => userTable.idUser, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  supplierId: uuid("supplier_id").references(() => supplierTable.idSupplier, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  refType: notificationRefEnum("ref_type").notNull(),
  refId: varchar("ref_id", { length: 20 }).notNull(),
  message: text("message").notNull(),
  status: statusNotificationEnum("status").default("PENDING").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ══════════════════════════════════════════════════════════
// RELATIONS
// ══════════════════════════════════════════════════════════

export const userRelations = relations(userTable, ({ many }) => ({
  transactions: many(transactionTable),
  procurements: many(procurementTable),
  goodsReceipts: many(goodsReceiptTable),
  productionRecords: many(productionRecordTable),
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
  procurementItems: many(procurementItemTable),
  purchaseItems: many(purchaseItemTable),
  goodsReceiptItems: many(goodsReceiptItemTable),
  productionOrders: many(productionOrderTable),
  productionMaterials: many(productionMaterialTable),
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
  ({ one, many }) => ({
    bom: one(itemBomTable, {
      fields: [itemBomDetailTable.bomId],
      references: [itemBomTable.idBom],
    }),
    rawItem: one(itemTable, {
      fields: [itemBomDetailTable.rawItemId],
      references: [itemTable.idItem],
    }),
    productionMaterials: many(productionMaterialTable),
  }),
);

export const procurementRelations = relations(
  procurementTable,
  ({ one, many }) => ({
    requester: one(userTable, {
      fields: [procurementTable.requestedBy],
      references: [userTable.idUser],
    }),
    items: many(procurementItemTable),
    purchases: many(purchaseTable),
    productionOrders: many(productionOrderTable),
    notifications: many(notificationsTable),
  }),
);

export const procurementItemRelations = relations(
  procurementItemTable,
  ({ one, many }) => ({
    procurement: one(procurementTable, {
      fields: [procurementItemTable.procurementId],
      references: [procurementTable.idProcurement],
    }),
    item: one(itemTable, {
      fields: [procurementItemTable.itemId],
      references: [itemTable.idItem],
    }),
    purchaseItems: many(purchaseItemTable),
    productionOrders: many(productionOrderTable),
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
    procurementItem: one(procurementItemTable, {
      fields: [purchaseItemTable.procurementItemId],
      references: [procurementItemTable.idProcurementItem],
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
    notifications: many(notificationsTable),
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

export const productionOrderRelations = relations(
  productionOrderTable,
  ({ one, many }) => ({
    procurement: one(procurementTable, {
      fields: [productionOrderTable.procurementId],
      references: [procurementTable.idProcurement],
    }),
    procurementItem: one(procurementItemTable, {
      fields: [productionOrderTable.procurementItemId],
      references: [procurementItemTable.idProcurementItem],
    }),
    item: one(itemTable, {
      fields: [productionOrderTable.itemId],
      references: [itemTable.idItem],
    }),
    materials: many(productionMaterialTable),
    records: many(productionRecordTable),
  }),
);

export const productionMaterialRelations = relations(
  productionMaterialTable,
  ({ one }) => ({
    productionOrder: one(productionOrderTable, {
      fields: [productionMaterialTable.productionOrderId],
      references: [productionOrderTable.idProductionOrder],
    }),
    bomDetail: one(itemBomDetailTable, {
      fields: [productionMaterialTable.bomDetailId],
      references: [itemBomDetailTable.idBomDetail],
    }),
    item: one(itemTable, {
      fields: [productionMaterialTable.itemId],
      references: [itemTable.idItem],
    }),
  }),
);

export const productionRecordRelations = relations(
  productionRecordTable,
  ({ one }) => ({
    productionOrder: one(productionOrderTable, {
      fields: [productionRecordTable.productionOrderId],
      references: [productionOrderTable.idProductionOrder],
    }),
    producer: one(userTable, {
      fields: [productionRecordTable.producedBy],
      references: [userTable.idUser],
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
