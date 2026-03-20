"use client"

import { useMemo } from "react"
import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import type { UploadFile } from "@/lib/hooks/use-upload"

interface UploadProgressProps {
  files: UploadFile[]
}

export function UploadProgress({ files }: UploadProgressProps) {
  const stats = useMemo(() => {
    const total = files.length
    const success = files.filter((f) => f.status === "success").length
    const errors = files.filter((f) => f.status === "error").length
    const percent = total > 0 ? Math.round((success / total) * 100) : 0
    return { total, success, errors, percent }
  }, [files])

  if (files.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {/* Progress bar */}
      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-[#e67e22] transition-all duration-300"
          style={{ width: `${stats.percent}%` }}
        />
      </div>

      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#1e3a5f] font-medium">
          {stats.success}/{stats.total} fichiers upload&eacute;s
        </span>
        {stats.errors > 0 && (
          <span className="text-red-600 font-medium">
            {stats.errors} erreur{stats.errors > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Per-file status */}
      <div className="space-y-1.5">
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-2 text-sm">
            {file.status === "success" && (
              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
            )}
            {file.status === "uploading" && (
              <Loader2 className="w-4 h-4 text-[#e67e22] animate-spin shrink-0" />
            )}
            {file.status === "error" && (
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            {file.status === "pending" && (
              <div className="w-4 h-4 rounded-full border-2 border-slate-300 shrink-0" />
            )}
            <span className={
              file.status === "error"
                ? "text-red-600 truncate"
                : file.status === "success"
                  ? "text-green-700 truncate"
                  : "text-slate-600 truncate"
            }>
              {file.file.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
