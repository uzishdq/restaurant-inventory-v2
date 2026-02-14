import ProcurementForm from "@/components/form/procurement-form";
import { RenderError } from "@/components/render-error";
import { LABEL } from "@/lib/constant";
import { getSelectItem } from "@/lib/server/data-server/item";
import { getSupplierList } from "@/lib/server/data-server/supplier";
import React from "react";
import Loading from "../../loading";

export default async function CreateTransaction() {
  return <Loading />;
}
