"use client";

import { useState } from "react";
import { MenuIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Wordmark } from "@/components/brand/logo";
import type { NavItem } from "./nav";
import { SidebarNav } from "./sidebar-nav";

export function MobileNav({ items, orgName }: { items: NavItem[]; orgName: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation" />}>
        <MenuIcon />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 bg-sidebar p-0">
        <SheetHeader className="border-b px-4 py-4 text-left">
          <SheetTitle>
            <Wordmark />
          </SheetTitle>
          <p className="truncate text-xs text-muted-foreground">{orgName}</p>
        </SheetHeader>
        <div className="p-3">
          <SidebarNav items={items} onNavigate={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
