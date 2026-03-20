"use client"

import { useParams } from "next/navigation"
import { useProject } from "@/lib/hooks/use-project"
import { useDpgf } from "@/lib/hooks/use-dpgf"
import { ProjectHeader } from "@/components/project/project-header"
import { DpgfSummary } from "@/components/dpgf/dpgf-summary"
import { DpgfTable } from "@/components/dpgf/dpgf-table"
import { Skeleton } from "@/components/ui/skeleton"
import { FileSearch } from "lucide-react"

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const projectId = params.id

  const { project, isLoading: projectLoading, error: projectError } = useProject(projectId)
  const {
    lines,
    isLoading: dpgfLoading,
    updateLine,
    triggerPricing,
    triggerAnalysis,
    isPricing,
    isAnalyzing,
  } = useDpgf(projectId)

  if (projectLoading || dpgfLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <Skeleton className="h-8 w-96" />
          <Skeleton className="h-5 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-36" />
            <Skeleton className="h-8 w-36" />
          </div>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-destructive">
          {projectError ?? "Projet introuvable."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ProjectHeader
        project={project}
        onAnalyze={triggerAnalysis}
        onPrice={triggerPricing}
        isAnalyzing={isAnalyzing}
        isPricing={isPricing}
        hasLines={lines.length > 0}
      />

      {lines.length > 0 ? (
        <>
          <DpgfSummary lines={lines} />
          <DpgfTable
            lines={lines}
            onUpdateLine={updateLine}
            onTriggerPricing={triggerPricing}
            isPricing={isPricing}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <FileSearch className="size-12 text-muted-foreground/50" />
          <h3 className="mt-4 text-lg font-semibold">Aucune ligne DPGF</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Analysez d&apos;abord le DCE pour extraire les lignes du DPGF.
          </p>
        </div>
      )}
    </div>
  )
}
