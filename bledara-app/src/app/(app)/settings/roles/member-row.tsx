"use client";

import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import type { Role } from "@/data/types";
import { useStore } from "@/lib/store";
import { ROLE_LABELS, ROLES } from "@/lib/permissions";
import { initials } from "@/lib/format";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";

export function MemberRow({
  membershipId,
  name,
  email,
  role,
  isSelf,
  isLastAdmin,
  editable,
}: {
  membershipId: string;
  name: string;
  email: string;
  role: Role;
  isSelf: boolean;
  isLastAdmin: boolean;
  editable: boolean;
}) {
  const store = useStore();
  const canChange = editable && !isLastAdmin;

  function changeRole(next: Role) {
    const res = store.updateMemberRole(membershipId, next);
    if (res.ok) {
      if (res.message) toast.success(res.message);
    } else toast.error(res.error);
  }

  function remove() {
    if (!confirm(`Remove ${name} from the organisation? They lose access.`)) return;
    const res = store.removeMember(membershipId);
    if (res.ok) {
      if (res.message) toast.success(res.message);
    } else toast.error(res.error);
  }

  return (
    <TableRow>
      <TableCell className="pl-4">
        <div className="flex items-center gap-3">
          <Avatar className="size-8">
            <AvatarFallback className="text-[11px]">{initials(name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">
              {name}
              {isSelf && <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span>}
            </p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        {canChange ? (
          <>
            <label className="sr-only" htmlFor={`role-${membershipId}`}>
              Role for {name}
            </label>
            <select
              id={`role-${membershipId}`}
              value={role}
              onChange={(e) => changeRole(e.target.value as Role)}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </>
        ) : (
          <Badge variant="secondary" title={isLastAdmin ? "The only admin cannot be changed" : undefined}>
            {ROLE_LABELS[role]}
          </Badge>
        )}
      </TableCell>
      <TableCell className="pr-4 text-right">
        {editable && !isSelf && !isLastAdmin && (
          <Button type="button" variant="ghost" size="icon-sm" aria-label={`Remove ${name}`} onClick={remove}>
            <Trash2Icon />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}
