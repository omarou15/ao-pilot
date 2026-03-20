"use client"

import { useState, useEffect, useCallback } from "react"
import type { AuditLogEntry } from "@/lib/types"
import { AuditTable } from "@/components/audit/audit-table"
import { Skeleton } from "@/components/ui/skeleton"

interface AuditData {
  entries: AuditLogEntry[]
  total: number
  page: number
}

export default function AuditPage() {
  const [data, setData] = useState<AuditData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isForbidden, setIsForbidden] = useState(false)
  const [page, setPage] = useState(1)
  const [projectFilter, setProjectFilter] = useState("")

  const fetchAudit = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({ page: String(page), limit: "50" })
      if (projectFilter.trim()) {
        params.set("projectId", projectFilter.trim())
      }

      const res = await fetch(`/api/admin/audit?${params.toString()}`)

      if (res.status === 403) {
        setIsForbidden(true)
        setIsLoading(false)
        return
      }

      const json = await res.json()

      if (json.error) {
        setError(json.error)
        setData(null)
      } else {
        setData(json.data)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement du journal d'audit"
      )
      setData(null)
    } finally {
      setIsLoading(false)
    }
  }, [page, projectFilter])

  useEffect(() => {
    fetchAudit()
  }, [fetchAudit])

  if (isForbidden) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Journal d&apos;audit</h1>
        <p className="mt-4 text-destructive">
          Accès non autorisé — cette page est réservée aux administrateurs.
        </p>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Journal d&apos;audit</h1>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Journal d&apos;audit</h1>
        <p className="mt-4 text-destructive">
          {error ?? "Impossible de charger le journal d'audit."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Journal d&apos;audit</h1>
      <AuditTable
        entries={data.entries}
        total={data.total}
        page={data.page}
        onPageChange={setPage}
        projectFilter={projectFilter}
        onProjectFilterChange={(value) => {
          setProjectFilter(value)
          setPage(1)
        }}
      />
    </div>
  )
}
