"use client"

import { useCallback, useRef, useState } from "react"
import { Upload } from "lucide-react"
import { cn } from "@/lib/utils"

interface FileDropzoneProps {
  onFilesAdded: (files: File[]) => void
  disabled?: boolean
}

export function FileDropzone({ onFilesAdded, disabled = false }: FileDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setIsDragOver(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      if (disabled) return

      const droppedFiles = Array.from(e.dataTransfer.files)
      if (droppedFiles.length > 0) {
        onFilesAdded(droppedFiles)
      }
    },
    [disabled, onFilesAdded]
  )

  const handleClick = useCallback(() => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }, [disabled])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files ?? [])
      if (selectedFiles.length > 0) {
        onFilesAdded(selectedFiles)
      }
      // Reset input so re-selecting same file works
      e.target.value = ""
    },
    [onFilesAdded]
  )

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") handleClick()
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-8 text-center transition-colors cursor-pointer",
        isDragOver
          ? "border-primary bg-primary/5 text-primary"
          : "border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <Upload className="size-8" />
      <div>
        <p className="text-sm font-medium">
          Glissez-d&eacute;posez vos fichiers DCE ici
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, Excel, Word — 50 Mo max par fichier
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".pdf,.xlsx,.xls,.docx,.doc"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Sélectionner des fichiers"
      />
    </div>
  )
}
