"use client"

import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { ExportPanel } from "@/components/export/export-panel"
import { Skeleton } from "@/components/ui/skeleton"
import type { ApiResponse, DpgfLine, MemoireSection, AdminDoc } from "@/lib/types"

export default function ExportPage() {
  const { id } = useParams<{ id: string }>()
  const [dpgfCount, setDpgfCount] = useState(0)
  const [memoireCount, setMemoireCount] = useState(0)
  const [adminDocsCount, setAdminDocsCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchCounts() {
      setIsLoading(true)

      try {
        const [dpgfRes, memoireRes, adminRes] = await Promise.all([
          fetch(`/api/projects/${id}/dpgf`),
          fetch(`/api/projects/${id}/memoire`),
          fetch(`/api/projects/${id}/admin-docs`),
        ])

        const dpgfJson: ApiResponse<DpgfLine[]> = await dpgfRes.json()
        const memoireJson: ApiResponse<MemoireSection[]> = await memoireRes.json()
        const adminJson: ApiResponse<AdminDoc[]> = await adminRes.json()

        setDpgfCount(dpgfJson.data?.length ?? 0)
        setMemoireCount(memoireJson.data?.length ?? 0)
        setAdminDocsCount(adminJson.data?.length ?? 0)
      } catch {
        // Counts stay at 0 on error
      } finally {
        setIsLoading(false)
      }
    }

    fetchCounts()
  }, [id])

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Export du dossier</h1>
      <ExportPanel
        projectId={id}
        dpgfCount={dpgfCount}
        memoireCount={memoireCount}
        adminDocsCount={adminDocsCount}
      />
    </div>
  )
}
