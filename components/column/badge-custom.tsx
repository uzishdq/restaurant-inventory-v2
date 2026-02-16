import { Badge } from "@/components/ui/badge";
import { getBadgeConfig, type BadgeCategory } from "@/lib/type/bandage-config";
import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface BadgeCustomProps {
  value: string;
  category: BadgeCategory;
  className?: string;
}

const STOCK_STATUS_ICONS = {
  OUT_OF_STOCK: XCircle,
  LOW_STOCK: AlertTriangle,
  SUFFICIENT: CheckCircle2,
};

export function BadgeCustom({
  value,
  category,
  className,
}: Readonly<BadgeCustomProps>) {
  const badgeConfig = getBadgeConfig(category, value);

  if (!badgeConfig) {
    return (
      <Badge variant="outline" className={className}>
        {value}
      </Badge>
    );
  }

  const Icon =
    category === "stockStatus"
      ? STOCK_STATUS_ICONS[value as keyof typeof STOCK_STATUS_ICONS]
      : null;

  return (
    <Badge className={cn(badgeConfig.color, "text-white", className)}>
      <div className="flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />}
        <span>{badgeConfig.label}</span>
      </div>
    </Badge>
  );
}
