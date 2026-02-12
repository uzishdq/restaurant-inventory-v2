import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "lucide-react";

type Category =
  | "role"
  | "statusDetailTransaction"
  | "typeTransaction"
  | "statusTransaction"
  | "stockStatus"
  | "typeItem"
  | "statusProcurement";

interface BadgeCustomProps {
  value: string;
  category: Category;
}

type StyleConfig = {
  variant?: "default" | "secondary" | "destructive" | "outline";
  className?: string;
};

const badgeStyles: Record<Category, Record<string, StyleConfig>> = {
  role: {
    SUPER_ADMIN: { variant: "destructive" },
    ADMIN: { variant: "outline" },
    MANAGER: { variant: "secondary" },
    HEADKITCHEN: { variant: "default" },
    KITCHEN: { variant: "secondary" },
  },

  statusDetailTransaction: {
    PENDING: { variant: "default" },
    ACCEPTED: { variant: "secondary" },
    CANCELLED: { variant: "destructive" },
  },

  typeTransaction: {
    CHECK: { variant: "secondary" },
    IN: { variant: "default" },
    OUT: { variant: "destructive" },
  },

  statusTransaction: {
    PENDING: { className: "bg-gray-100 text-gray-800" },
    ORDERED: { className: "bg-blue-100 text-blue-800" },
    RECEIVED: { className: "bg-yellow-100 text-yellow-800" },
    COMPLETED: { className: "bg-green-100 text-green-800" },
    CANCELLED: { className: "bg-red-100 text-red-800" },
  },

  statusProcurement: {
    DRAFT: { className: "bg-gray-100 text-gray-800" },
    ON_PROGRESS: { className: "bg-yellow-100 text-yellow-800" },
    COMPLETED: { className: "bg-green-100 text-green-800" },
    CANCELLED: { className: "bg-red-100 text-red-800" },
  },

  stockStatus: {
    LOW_STOCK: { className: "bg-red-100 text-red-800" },
    NORMAL: { className: "bg-green-100 text-green-800" },
  },

  typeItem: {
    RAW_MATERIAL: { className: "bg-blue-100 text-blue-800" },
    WORK_IN_PROGRESS: { className: "bg-yellow-100 text-yellow-800" },
    FINISHED_GOOD: { className: "bg-green-100 text-green-800" },
  },
};

export function BadgeCustom({ value, category }: Readonly<BadgeCustomProps>) {
  const stylesForCategory = badgeStyles[category] ?? {};
  const style = stylesForCategory[value] ?? { variant: "secondary" };

  const shouldShowCheckIcon = category === "role";

  return (
    <Badge
      variant={style.variant}
      className={`capitalize ${style.className ?? ""}`}
    >
      {shouldShowCheckIcon && <BadgeCheck className="mr-1 h-3.5 w-3.5" />}
      {value}
    </Badge>
  );
}
