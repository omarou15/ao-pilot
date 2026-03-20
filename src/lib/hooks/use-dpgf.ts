"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import type { DpgfLine, ApiResponse } from "@/lib/types"

export function useDpgf(projectId: string) {
  const [lines, setLines] = useState<DpgfLine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPricing, setIsPricing] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/projects/${projectId}/dpgf`)
      const json: ApiResponse<DpgfLine[]> = await res.json()

      if (json.error) {
        setError(json.error)
        setLines([])
      } else {
        setLines(json.data ?? [])
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement du DPGF"
      )
      setLines([])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    refresh()
  }, [refresh])

  const updateLine = useCallback(
    async (lineId: string, updates: Partial<DpgfLine>) => {
      try {
        const res = await fetch(`/api/projects/${projectId}/dpgf`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ lineId, updates }),
        })
        const json: ApiResponse<DpgfLine> = await res.json()

        if (json.error) {
          setError(json.error)
        } else if (json.data) {
          setLines((prev) =>
            prev.map((line) => (line.id === lineId ? { ...line, ...json.data } : line))
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

  const triggerPricing = useCallback(async () => {
    setIsPricing(true)
    setError(null)

    try {
      const res = await fetch(`/api/projects/${projectId}/pricing`, {
        method: "POST",
      })
      const json: ApiResponse<DpgfLine[]> = await res.json()

      if (json.error) {
        setError(json.error)
      } else {
        await refresh()
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chiffrage"
      )
    } finally {
      setIsPricing(false)
    }
  }, [projectId, refresh])

  const triggerAnalysis = useCallback(async () => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const res = await fetch(`/api/projects/${projectId}/analyze`, {
        method: "POST",
      })
      const json: ApiResponse<DpgfLine[]> = await res.json()

      if (json.error) {
        setError(json.error)
      } else {
        await refresh()
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'analyse"
      )
    } finally {
      setIsAnalyzing(false)
    }
  }, [projectId, refresh])

  const grandTotal = useMemo(
    () =>
      lines.reduce((sum, line) => sum + (line.total_price_sale ?? 0), 0),
    [lines]
  )

  return {
    lines,
    isLoading,
    error,
    updateLine,
    triggerPricing,
    triggerAnalysis,
    isPricing,
    isAnalyzing,
    grandTotal,
    refresh,
  }
}
