"use client"

import { useState, useEffect, useCallback } from "react"
import type { Company, ApiResponse } from "@/lib/types"

export function useCompany() {
  const [company, setCompany] = useState<Company | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCompany = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/settings")
      const json: ApiResponse<Company> = await res.json()

      if (json.error) {
        setError(json.error)
        setCompany(null)
      } else {
        setCompany(json.data)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur lors du chargement des paramètres"
      )
      setCompany(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompany()
  }, [fetchCompany])

  const updateCompany = useCallback(
    async (updates: Partial<Company>) => {
      setIsSaving(true)
      setError(null)

      try {
        const res = await fetch("/api/settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        })
        const json: ApiResponse<Company> = await res.json()

        if (json.error) {
          setError(json.error)
          return false
        }

        setCompany(json.data)
        return true
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erreur lors de la sauvegarde"
        )
        return false
      } finally {
        setIsSaving(false)
      }
    },
    []
  )

  return { company, isLoading, updateCompany, isSaving, error }
}
