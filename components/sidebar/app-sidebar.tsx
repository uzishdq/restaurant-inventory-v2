"use client";

import * as React from "react";
import { Warehouse } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import Link from "next/link";
import { Session } from "next-auth";
import { getFilteredNav } from "@/lib/helper";
import { roleType } from "@/lib/type/type.helper";

export function AppSidebar({
  session,
  ...props
}: React.ComponentProps<typeof Sidebar> & { session: Session | null }) {
  const role = session?.user.role as roleType | undefined;

  const user = {
    name: session?.user.name ?? "Guest",
    email: session?.user.email ?? "notLogin",
    avatar: "/avatars/shadcn.jpg",
  };

  const navMain = getFilteredNav(role);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <Link href="#">
                <Warehouse className="size-10" />
                <span className="text-base font-semibold">
                  Gang Nikmat Inventory
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
