"use client"

import { useState, useEffect, useCallback } from "react"
import type { Project, ApiResponse } from "@/lib/types"

export function useProject(projectId: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/projects/${projectId}`)
      const json: ApiResponse<Project> = await res.json()

      if (json.error) {
        setError(json.error)
        setProject(null)
      } else {
        setProject(json.data)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement du projet"
      )
      setProject(null)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { project, isLoading, error, refresh }
}
