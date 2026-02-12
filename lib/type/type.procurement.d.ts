import { statusProcurement } from "./type.helper";

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
