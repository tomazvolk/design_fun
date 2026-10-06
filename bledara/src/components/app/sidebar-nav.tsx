"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "cn";
import type { NavItem } from "./nav";
import { NavIcon } from "./nav-icon";

export function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="flex flex-col gap-0.5">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm font-medium text-sidebar-foreground/75 outline-none transition-colors",
              "hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:ring-3 focus-visible:ring-sidebar-ring/50",
              active && "bg-sidebar-accent text-sidebar-foreground",
            )}
          >
            <NavIcon name={item.icon} className={cn("size-4 shrink-0", active ? "text-primary" : "text-sidebar-foreground/55 group-hover:text-sidebar-foreground")} />
            <span className="flex-1 truncate">{item.label}</span>
            {item.step && (
              <span
                className="rounded-md border border-dashed px-1.5 py-px font-mono text-[10px] text-muted-foreground"
                title={`Arrives in build step ${item.step}`}
              >
                step {item.step}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
