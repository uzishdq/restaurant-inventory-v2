import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "lucide-react";

interface BadgeCustomProps {
  value: string;
  category:
    | "role"
    | "statusDetailTransaction"
    | "typeTransaction"
    | "statusTransaction"
    | "stockStatus"
    | "typeItem";
}

const statusStyleMap: Record<
  BadgeCustomProps["category"],
  Record<
    string,
    {
      variant?: "default" | "secondary" | "destructive" | "outline";
      className?: string;
    }
  >
> = {
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
    PENDING: {
      className: "bg-gray-100 text-gray-800",
    },
    ORDERED: {
      className: "bg-blue-100 text-blue-800",
    },
    RECEIVED: {
      className: "bg-yellow-100 text-yellow-800",
    },
    COMPLETED: {
      className: "bg-green-100 text-green-800",
    },
    CANCELLED: {
      className: "bg-red-100 text-red-800",
    },
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
  const categoryMap = statusStyleMap[category] || {};
  const style = categoryMap[value] || { variant: "secondary" };

  return (
    <Badge
      variant={style.variant}
      className={`capitalize ${style.className ?? ""}`}
    >
      {category === "role" && <BadgeCheck data-icon="inline-start" />}
      {value}
    </Badge>
  );
}
