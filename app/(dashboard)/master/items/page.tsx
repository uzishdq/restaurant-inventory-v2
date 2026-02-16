import DialogForm from "@/components/form/dialog-form";
import IItemForm from "@/components/form/item/item-form";
import { RenderError } from "@/components/render-error";
import SectionCard from "@/components/section/section-card";
import ItemTableClient from "@/components/table/item-table-client";
import { LABEL } from "@/lib/constant";
import { getCategoriesList } from "@/lib/server/data-server/categories";
import { getItemList } from "@/lib/server/data-server/item";
import { getUnitList } from "@/lib/server/data-server/unit";
import { TItemSelect } from "@/lib/type/type.item";
import { Package } from "lucide-react";

export default async function ItemsPage() {
  const [result, units, categories] = await Promise.all([
    getItemList(),
    getUnitList(),
    getCategoriesList(),
  ]);

  if (!result.ok || !result.data || !units.data || !categories.data) {
    return RenderError(LABEL.ERROR.DESCRIPTION);
  }

  // Ambil hanya item bertipe RAW_MATERIAL
  const rawItems: TItemSelect[] = result.data
    .filter((item) => item.type === "RAW_MATERIAL")
    .map((item) => ({
      idItem: item.idItem,
      name: item.name,
      minStock: item.minStock,
      currentStock: item.currentStock,
      unitName: item.unitName ?? null,
    }));

  return (
    <section className=" space-y-4">
      <SectionCard
        title="Total Bahan Baku"
        value={result.data.length}
        Icon={Package}
      />
      <div className="relative">
        <ItemTableClient
          data={result.data}
          units={units.data}
          categories={categories.data}
          rawItems={rawItems}
        />
        <div className="absolute top-4 right-4 z-10">
          <DialogForm type="create" title="Tambah Bahan Baku">
            <IItemForm
              mode="create"
              units={units.data}
              categories={categories.data}
              rawItems={rawItems}
            />
          </DialogForm>
        </div>
      </div>
    </section>
  );
}
