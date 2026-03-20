"use client"

import { FileText, FileSpreadsheet, File, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UploadFile } from "@/lib/hooks/use-upload"

interface FileListProps {
  files: UploadFile[]
  onRemove: (id: string) => void
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

function getFileExtension(name: string): string {
  const idx = name.lastIndexOf(".")
  return idx >= 0 ? name.slice(idx + 1).toLowerCase() : ""
}

function FileIcon({ fileName }: { fileName: string }) {
  const ext = getFileExtension(fileName)

  if (ext === "pdf") {
    return <FileText className="size-5 shrink-0 text-red-500" />
  }
  if (ext === "xlsx" || ext === "xls") {
    return <FileSpreadsheet className="size-5 shrink-0 text-green-600" />
  }
  if (ext === "docx" || ext === "doc") {
    return <FileText className="size-5 shrink-0 text-blue-500" />
  }
  return <File className="size-5 shrink-0 text-muted-foreground" />
}

function StatusIndicator({ status, error }: { status: UploadFile["status"]; error?: string }) {
  switch (status) {
    case "pending":
      return <span className="text-xs text-muted-foreground">En attente</span>
    case "uploading":
      return (
        <span className="flex items-center gap-1 text-xs text-primary">
          <Loader2 className="size-3.5 animate-spin" />
          Upload en cours
        </span>
      )
    case "success":
      return (
        <span className="flex items-center gap-1 text-xs text-green-600">
          <CheckCircle2 className="size-3.5" />
          Termin&eacute;
        </span>
      )
    case "error":
      return (
        <span className="flex items-center gap-1 text-xs text-destructive" title={error}>
          <AlertCircle className="size-3.5" />
          {error ?? "Erreur"}
        </span>
      )
  }
}

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null

  return (
    <ul className="divide-y divide-border rounded-lg border">
      {files.map((uploadFile) => (
        <li
          key={uploadFile.id}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5",
            uploadFile.status === "error" && "bg-destructive/5"
          )}
        >
          <FileIcon fileName={uploadFile.file.name} />

          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-sm font-medium">{uploadFile.file.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {formatSize(uploadFile.file.size)}
              </span>
              <StatusIndicator status={uploadFile.status} error={uploadFile.error} />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(uploadFile.id)}
            disabled={uploadFile.status === "uploading"}
            aria-label={`Supprimer ${uploadFile.file.name}`}
          >
            <X className="size-3.5" />
          </Button>
        </li>
      ))}
    </ul>
  )
}
