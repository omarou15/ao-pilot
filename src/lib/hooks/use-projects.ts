"use client"

import { useState, useEffect, useCallback } from "react"
import type { Project, ApiResponse } from "@/lib/types"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/projects")
      const json: ApiResponse<Project[]> = await res.json()

      if (json.error) {
        setError(json.error)
        setProjects([])
      } else {
        setProjects(json.data ?? [])
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement des projets"
      )
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { projects, isLoading, error, refresh }
}
