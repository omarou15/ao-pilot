"use client"

import { useMemo } from "react"
import { Progress } from "@/components/ui/progress"
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
    <div className="flex flex-col gap-2">
      <Progress value={stats.percent} />
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {stats.success}/{stats.total} fichiers upload&eacute;s
        </span>
        {stats.errors > 0 && (
          <span className="text-destructive">
            {stats.errors} erreur{stats.errors > 1 ? "s" : ""}
          </span>
        )}
      </div>
    </div>
  )
}
