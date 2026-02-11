"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import { ROUTES } from "@/lib/constant";

export function SignOutItem() {
  const [isPending, startTransition] = useTransition();

  const handleSignOut = () => {
    startTransition(() => {
      signOut({
        callbackUrl: ROUTES.PUBLIC.LOGIN,
      });
    });
  };

  return (
    <DropdownMenuItem
      onClick={handleSignOut}
      disabled={isPending}
      variant="destructive"
    >
      <LogOut className="mr-2 h-4 w-4" />
      {isPending ? "Logging out..." : "Log out"}
    </DropdownMenuItem>
  );
}
