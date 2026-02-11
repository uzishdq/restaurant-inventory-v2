import { LucideIcon } from "lucide-react";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface ISectionCard {
  title: string;
  value: string | number;
  Icon: LucideIcon;
}

export default function SectionCard({
  title,
  value,
  Icon,
}: Readonly<ISectionCard>) {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <CardAction>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </CardAction>
      </CardHeader>
    </Card>
  );
}
