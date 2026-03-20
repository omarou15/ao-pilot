"use client"

import { useState, useCallback, useMemo } from "react"

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]

const ACCEPTED_EXTENSIONS = [".pdf", ".xlsx", ".xls", ".docx", ".doc"]
const MAX_SIZE_BYTES = 50 * 1024 * 1024 // 50 Mo

export interface UploadFile {
  file: File
  id: string
  status: "pending" | "uploading" | "success" | "error"
  progress: number
  error?: string
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function getFileExtension(name: string): string {
  const idx = name.lastIndexOf(".")
  return idx >= 0 ? name.slice(idx).toLowerCase() : ""
}

function validateFile(file: File): string | null {
  const ext = getFileExtension(file.name)
  if (!ACCEPTED_EXTENSIONS.includes(ext) && !ACCEPTED_TYPES.includes(file.type)) {
    return `Type de fichier non accepté : ${ext || file.type}`
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : 50 Mo`
  }
  return null
}

export function useUpload(projectId: string | null) {
  const [files, setFiles] = useState<UploadFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const addFiles = useCallback((newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map((file) => {
      const validationError = validateFile(file)
      return {
        file,
        id: generateId(),
        status: validationError ? "error" as const : "pending" as const,
        progress: 0,
        error: validationError ?? undefined,
      }
    })
    setFiles((prev) => [...prev, ...uploadFiles])
  }, [])

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }, [])

  const uploadAll = useCallback(async () => {
    if (!projectId) return

    const pendingFiles = files.filter((f) => f.status === "pending")
    if (pendingFiles.length === 0) return

    setIsUploading(true)

    for (const uploadFile of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === uploadFile.id ? { ...f, status: "uploading" as const, progress: 0 } : f
        )
      )

      try {
        const formData = new FormData()
        formData.append("file", uploadFile.file)

        const response = await fetch(`/api/projects/${projectId}/upload`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const body = await response.json().catch(() => ({ error: "Erreur serveur" }))
          throw new Error(body.error || `Erreur ${response.status}`)
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id ? { ...f, status: "success" as const, progress: 100 } : f
          )
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erreur inconnue"
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadFile.id
              ? { ...f, status: "error" as const, progress: 0, error: message }
              : f
          )
        )
      }
    }

    setIsUploading(false)
  }, [projectId, files])

  const overallProgress = useMemo(() => {
    if (files.length === 0) return 0
    const total = files.filter((f) => f.status !== "error" || f.progress > 0).length
    if (total === 0) return 0
    const completed = files.filter((f) => f.status === "success").length
    return Math.round((completed / total) * 100)
  }, [files])

  return { files, addFiles, removeFile, uploadAll, isUploading, overallProgress }
}
