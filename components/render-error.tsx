import { AlertTriangle } from "lucide-react";

export function RenderError(message: string) {
  return (
    <div className="flex min-h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}
