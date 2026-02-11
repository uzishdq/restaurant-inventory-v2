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
  createdAt: Date;
  detailItem: TDetailItem[];
};

export type TItemSelect = {
  idItem: string;
  name: string;
  unitName: string | null;
};
