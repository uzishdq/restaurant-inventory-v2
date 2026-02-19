import { typeItems } from "./type.helper";

export type TDetailItem = {
  idBom: string;
  rawItemId: string;
  name: string;
  categoryName: string | null;
  unitName: string | null;
  type: typeItems;
  qty: string | null;
};

export type TItem = {
  idItem: string;
  name: string;
  idCategory: string | null;
  categoryName: string | null;
  idUnit: string | null;
  unitName: string | null;
  type: typeItems;
  minStock: string;
  currentStock: string;
  lastMovementDate: Date | null;
  createdAt: Date;
  detailItem: TDetailItem[];
};

export type TItemSelect = {
  idItem: string;
  name: string;
  unitName: string | null;
  minStock: string;
  type: typeItems;
  currentStock: string;
  bomDetails: Array<{
    rawItemId: string;
    rawItemName: string;
    qty: string;
    currentStock: string;
    unitName: string | null;
  }>;
};

export type TItemMovement = {
  idMovement: string;
  transactionId: string | null;
  transactionType: "PURCHASE" | "PRODUCTION" | "SALES" | "ADJUSTMENT" | null;
  transactionStatus: "PENDING" | "COMPLETED" | "CANCELLED" | null;
  itemId: string;
  itemName: string;
  categoryName: string | null;
  unitName: string | null;
  movementType: "IN" | "OUT";
  quantity: string;
  userName: string | null;
  createdAt: Date;
};

export type TBomDetails = {
  itemId: string;
  bomDetailId: string;
  rawItemId: string;
  qtyPerUnit: string;
};
