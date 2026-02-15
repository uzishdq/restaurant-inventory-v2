import { Badge } from "@/components/ui/badge";
import { getBadgeConfig, type BadgeCategory } from "@/lib/type/bandage-config";
import { cn } from "@/lib/utils";

interface BadgeCustomProps {
  value: string;
  category: BadgeCategory;
  className?: string;
}

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

  return (
    <Badge className={cn(badgeConfig.color, "text-white", className)}>
      {badgeConfig.label}
    </Badge>
  );
}
