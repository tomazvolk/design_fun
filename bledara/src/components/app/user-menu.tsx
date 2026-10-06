"use client";

import { useRouter } from "next/navigation";
import { ChevronsUpDownIcon, LogOutIcon } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { initials } from "@/lib/format";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu({ name, email, image, roleLabel }: { name: string; email: string; image?: string | null; roleLabel: string }) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="ghost" className="h-9 gap-2 px-1.5" aria-label={`Account menu for ${name}`} />}
      >
        <Avatar className="size-7">
          {image && <AvatarImage src={image} alt="" />}
          <AvatarFallback className="text-[11px]">{initials(name)}</AvatarFallback>
        </Avatar>
        <span className="hidden max-w-32 truncate text-sm sm:inline">{name}</span>
        <ChevronsUpDownIcon className="size-3.5 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="truncate font-medium">{name}</span>
          <span className="truncate text-xs font-normal text-muted-foreground">{email}</span>
          <span className="mt-1 w-fit rounded-md bg-muted px-1.5 py-px text-[11px] font-normal text-muted-foreground">{roleLabel}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await authClient.signOut();
            router.push("/login");
            router.refresh();
          }}
        >
          <LogOutIcon />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
