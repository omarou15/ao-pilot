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
  if (!details || Object.keys(details).length === 0) return "\u2014"
  try {
    return JSON.stringify(details, null, 0).slice(0, 120)
  } catch {
    return "\u2014"
  }
}

function getActionDotColor(action: string): string {
  if (action.startsWith("project.")) return "bg-blue-500"
  if (action.startsWith("files.")) return "bg-green-500"
  if (action.startsWith("company.")) return "bg-[#e67e22]"
  if (action.startsWith("audit.")) return "bg-slate-500"
  return "bg-slate-400"
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

  // Generate page numbers to display (show up to 5 around current)
  const pageNumbers: number[] = []
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i)
  }

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
            <TableRow className="bg-slate-50">
              <TableHead className="text-slate-600 font-medium">Date</TableHead>
              <TableHead className="text-slate-600 font-medium">Utilisateur</TableHead>
              <TableHead className="text-slate-600 font-medium">Projet</TableHead>
              <TableHead className="text-slate-600 font-medium">Action</TableHead>
              <TableHead className="text-slate-600 font-medium">D&eacute;tails</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Aucune entr&eacute;e trouv&eacute;e.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.created_at)}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.user_id ? entry.user_id.slice(0, 8) + "..." : "\u2014"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {entry.project_id ? entry.project_id.slice(0, 8) + "..." : "\u2014"}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 rounded bg-muted px-2 py-0.5 text-xs font-medium">
                      <span className={`w-2 h-2 rounded-full ${getActionDotColor(entry.action)}`} />
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
          {total} entr&eacute;e{total !== 1 ? "s" : ""} au total &mdash; Page {page} / {totalPages}
        </p>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            Pr&eacute;c&eacute;dent
          </Button>
          {startPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(1)}
                className="w-9 px-0"
              >
                1
              </Button>
              {startPage > 2 && (
                <span className="px-1 text-muted-foreground text-sm">...</span>
              )}
            </>
          )}
          {pageNumbers.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(p)}
              className={`w-9 px-0 ${p === page ? "bg-[#1e3a5f] text-white hover:bg-[#1e3a5f]/90" : ""}`}
            >
              {p}
            </Button>
          ))}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <span className="px-1 text-muted-foreground text-sm">...</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(totalPages)}
                className="w-9 px-0"
              >
                {totalPages}
              </Button>
            </>
          )}
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
