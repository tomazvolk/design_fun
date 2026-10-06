"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Trash2Icon } from "lucide-react";
import type { Role } from "@prisma/client";
import { removeMember, updateMemberRole, type ActionState } from "@/lib/actions/org";
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
  const formRef = useRef<HTMLFormElement>(null);
  const [roleState, roleAction, rolePending] = useActionState<ActionState, FormData>(updateMemberRole, { ok: false });
  const [removeState, removeAction, removePending] = useActionState<ActionState, FormData>(removeMember, { ok: false });

  useEffect(() => {
    if (roleState.message && roleState.ok) toast.success(roleState.message);
    if (roleState.error) toast.error(roleState.error);
  }, [roleState]);
  useEffect(() => {
    if (removeState.message && removeState.ok) toast.success(removeState.message);
    if (removeState.error) toast.error(removeState.error);
  }, [removeState]);

  const canChange = editable && !isLastAdmin;

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
          <form ref={formRef} action={roleAction}>
            <input type="hidden" name="membershipId" value={membershipId} />
            <label className="sr-only" htmlFor={`role-${membershipId}`}>
              Role for {name}
            </label>
            <select
              id={`role-${membershipId}`}
              name="role"
              defaultValue={role}
              disabled={rolePending}
              onChange={() => formRef.current?.requestSubmit()}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-input/30"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {ROLE_LABELS[r]}
                </option>
              ))}
            </select>
          </form>
        ) : (
          <Badge variant="secondary" title={isLastAdmin ? "The only admin cannot be changed" : undefined}>
            {ROLE_LABELS[role]}
          </Badge>
        )}
      </TableCell>
      <TableCell className="pr-4 text-right">
        {editable && !isSelf && !isLastAdmin && (
          <form
            action={removeAction}
            onSubmit={(e) => {
              if (!confirm(`Remove ${name} from the organisation? They keep their account but lose access.`)) e.preventDefault();
            }}
          >
            <input type="hidden" name="membershipId" value={membershipId} />
            <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Remove ${name}`} disabled={removePending}>
              <Trash2Icon />
            </Button>
          </form>
        )}
      </TableCell>
    </TableRow>
  );
}
