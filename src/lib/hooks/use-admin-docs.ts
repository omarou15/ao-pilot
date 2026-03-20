"use client"

import { useState, useEffect, useCallback } from "react"
import type { AdminDoc, ApiResponse } from "@/lib/types"

export function useAdminDocs(projectId: string) {
  const [docs, setDocs] = useState<AdminDoc[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDocs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/projects/${projectId}/admin-docs`)
      const json: ApiResponse<AdminDoc[]> = await res.json()

      if (json.error) {
        setError(json.error)
        setDocs([])
      } else {
        setDocs(json.data ?? [])
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement des documents"
      )
      setDocs([])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchDocs()
  }, [fetchDocs])

  const generate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch(`/api/projects/${projectId}/admin-docs`, {
        method: "POST",
      })
      const json: ApiResponse<AdminDoc[]> = await res.json()

      if (json.error) {
        setError(json.error)
      } else {
        setDocs(json.data ?? [])
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Erreur lors de la génération des documents"
      )
    } finally {
      setIsGenerating(false)
    }
  }, [projectId])

  const updateDoc = useCallback(
    async (docId: string, updates: Partial<AdminDoc>) => {
      setError(null)

      try {
        const res = await fetch(`/api/projects/${projectId}/admin-docs`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ docId, ...updates }),
        })
        const json: ApiResponse<AdminDoc> = await res.json()

        if (json.error) {
          setError(json.error)
        } else if (json.data) {
          setDocs((prev) =>
            prev.map((d) => (d.id === docId ? { ...d, ...json.data } : d))
          )
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors de la mise à jour"
        )
      }
    },
    [projectId]
  )

  return { docs, isLoading, generate, updateDoc, isGenerating, error }
}
