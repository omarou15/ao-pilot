"use client"

import { useState, useEffect, useCallback } from "react"
import type { MemoireSection, ApiResponse } from "@/lib/types"

export function useMemoire(projectId: string) {
  const [sections, setSections] = useState<MemoireSection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSections = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/projects/${projectId}/memoire`)
      const json: ApiResponse<MemoireSection[]> = await res.json()

      if (json.error) {
        setError(json.error)
        setSections([])
      } else {
        setSections(json.data ?? [])
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement du mémoire"
      )
      setSections([])
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    fetchSections()
  }, [fetchSections])

  const generate = useCallback(async () => {
    setIsGenerating(true)
    setError(null)

    try {
      const res = await fetch(`/api/projects/${projectId}/memoire`, {
        method: "POST",
      })
      const json: ApiResponse<MemoireSection[]> = await res.json()

      if (json.error) {
        setError(json.error)
      } else {
        setSections(json.data ?? [])
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de la génération du mémoire"
      )
    } finally {
      setIsGenerating(false)
    }
  }, [projectId])

  const updateSection = useCallback(
    async (sectionId: string, updates: Partial<MemoireSection>) => {
      setError(null)

      try {
        const res = await fetch(`/api/projects/${projectId}/memoire`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sectionId, ...updates }),
        })
        const json: ApiResponse<MemoireSection> = await res.json()

        if (json.error) {
          setError(json.error)
        } else if (json.data) {
          setSections((prev) =>
            prev.map((s) => (s.id === sectionId ? { ...s, ...json.data } : s))
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

  return { sections, isLoading, generate, updateSection, isGenerating, error }
}
