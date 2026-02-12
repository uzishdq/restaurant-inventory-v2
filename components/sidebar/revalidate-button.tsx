"use client";

import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { revalidateData } from "@/lib/server/action-server/revalidate-data";
import { useState } from "react";
import { DropdownMenuItem } from "../ui/dropdown-menu";

export default function RevalidateButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await revalidateData();

      if (result.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      console.error("Revalidate gagal:", err);
      toast.error("Terjadi kesalahan saat refresh data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DropdownMenuItem
      onClick={handleClick}
      className="cursor-pointer"
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {isLoading ? "Refreshing..." : "Refresh Data"}
    </DropdownMenuItem>
  );
}
