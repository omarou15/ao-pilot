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
          ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
          : "border-[#1e3a5f]/30 text-muted-foreground hover:border-[#1e3a5f]/60",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <Upload className="w-12 h-12 text-[#1e3a5f]" />
      <div>
        <p className="text-sm font-medium">
          Glissez-d&eacute;posez vos fichiers DCE ici
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, Excel, Word — 50 Mo max par fichier
        </p>
      </div>
      {/* File type badges */}
      <div className="flex items-center gap-2 mt-1">
        <span className="inline-flex items-center rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-700">
          PDF
        </span>
        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
          Excel
        </span>
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          Word
        </span>
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
