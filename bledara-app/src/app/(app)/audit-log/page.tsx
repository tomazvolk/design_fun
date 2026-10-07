"use client";

import { useState } from "react";
import { ScrollTextIcon } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDateTime } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/empty-state";
import { Gate } from "@/components/gate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PAGE_SIZE = 25;

export default function AuditLogPage() {
  const { audit } = useStore();
  const [page, setPage] = useState(1);
  const entries = [...audit].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const pages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const slice = entries.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  return (
    <Gate permission="audit:read" what="the audit log">
      <PageHeader title="Audit log" description="Every approval, card action and settings change, who did it and when. Entries are never edited or deleted." />
      {entries.length === 0 ? (
        <EmptyState icon={ScrollTextIcon} title="Nothing recorded yet" description="Change a role or a setting and it shows up here." />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((e) => (
                  <TableRow key={e.id}>
                    <TableCell className="tabular whitespace-nowrap text-muted-foreground">{formatDateTime(e.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap">{e.actorName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[11px]">
                        {e.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md">{e.summary}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {entries.length} {entries.length === 1 ? "entry" : "entries"} · page {current} of {pages}
            </span>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={current <= 1} onClick={() => setPage(current - 1)}>
                Newer
              </Button>
              <Button variant="outline" size="sm" disabled={current >= pages} onClick={() => setPage(current + 1)}>
                Older
              </Button>
            </div>
          </div>
        </>
      )}
    </Gate>
  );
}
