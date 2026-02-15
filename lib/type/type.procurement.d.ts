import { statusProcurement, statusPurchase } from "./type.helper";

export type TProcerementItem = {
  idProcurementItem: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  unitName: string;
  qtyRequested: string;
  notes: string;
};

export type TProcerement = {
  idProcurement: string;
  requestedBy: string | null;
  status: statusProcurement;
  createdAt: Date;
  procurementItem: TProcerementItem[];
};

export type TPurchase = {
  idPurchase: string;
  procurementId: string;
  supplierId: string;
  supplierName: string;
  supplierStore: string;
  supplierPhone: string | null;
  status: statusPurchase;
  createdAt: Date;
  totalItems: number;
  totalQty: number;
  purchaseItems: TPurchaseItem[];
};

export type TPurchaseItem = {
  idPurchaseItem: string;
  purchaseId: string;
  procurementItemId: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  qtyOrdered: string;
  unitName: string;
};

export type TPurchaseSelect = {
  idPurchase: string;
  procurementId: string;
  supplierId: string;
  status: statusPurchase;
  createdAt: Date;
};

export type TReceipt = {
  idReceipt: string;
  purchaseId: string;
  receivedBy: string;
  receivedByName: string;
  createdAt: Date;
  supplierName: string;
  supplierStore: string;
  procurementId: string;
  totalItems: number;
  totalReceived: number;
  totalDamaged: number;
  receiptItems: TReceiptItem[];
};

export type TReceiptItem = {
  idReceiptItem: string;
  receiptId: string;
  itemId: string;
  itemName: string;
  categoryName: string;
  unitName: string;
  qtyReceived: string;
  qtyDamaged: string;
};
