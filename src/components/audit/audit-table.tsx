"use client"

import type { AuditLogEntry } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface AuditTableProps {
  entries: AuditLogEntry[]
  total: number
  page: number
  onPageChange: (page: number) => void
  projectFilter: string
  onProjectFilterChange: (projectId: string) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function formatDetails(details: Record<string, unknown>): string {
  if (!details || Object.keys(details).length === 0) return "—"
  try {
    return JSON.stringify(details, null, 0).slice(0, 120)
  } catch {
    return "—"
  }
}

export function AuditTable({
  entries,
  total,
  page,
  onPageChange,
  projectFilter,
  onProjectFilterChange,
}: AuditTableProps) {
  const limit = 50
  const totalPages = Math.max(1, Math.ceil(total / limit))

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="space-y-1">
          <Label htmlFor="project-filter">Filtrer par projet</Label>
          <Input
            id="project-filter"
            value={projectFilter}
            onChange={(e) => onProjectFilterChange(e.target.value)}
            placeholder="ID du projet (optionnel)"
            className="w-64"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Projet</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Détails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucune entrée trouvée.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.created_at)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.user_id ? entry.user_id.slice(0, 8) + "..." : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.project_id ? entry.project_id.slice(0, 8) + "..." : "—"}
                  </TableCell>
                  <TableCell>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                      {entry.action}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                    {formatDetails(entry.details)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} entrée{total !== 1 ? "s" : ""} au total — Page {page} / {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
