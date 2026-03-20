"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Project, ProjectStatus } from "@/lib/types"
import { FileSearch, Calculator, Download, Loader2 } from "lucide-react"

interface ProjectHeaderProps {
  project: Project
  onAnalyze: () => void
  onPrice: () => void
  isAnalyzing: boolean
  isPricing: boolean
  hasLines: boolean
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft: {
    label: "Brouillon",
    className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  },
  processing: {
    label: "En traitement",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  review: {
    label: "En revue",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
  validated: {
    label: "Validé",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  submitted: {
    label: "Soumis",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
  },
}

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function getDeadlineColor(days: number): string {
  if (days <= 1) return "text-red-600 dark:text-red-400"
  if (days <= 3) return "text-orange-600 dark:text-orange-400"
  if (days <= 7) return "text-yellow-600 dark:text-yellow-400"
  return "text-muted-foreground"
}

export function ProjectHeader({
  project,
  onAnalyze,
  onPrice,
  isAnalyzing,
  isPricing,
  hasLines,
}: ProjectHeaderProps) {
  const status = statusConfig[project.status]
  const daysLeft = project.deadline ? getDaysUntilDeadline(project.deadline) : null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate">
              {project.name}
            </h1>
            <Badge className={cn("shrink-0", status.className)}>
              {status.label}
            </Badge>
          </div>
          {project.reference && (
            <p className="mt-1 text-sm text-muted-foreground">
              Réf. {project.reference}
            </p>
          )}
        </div>

        {project.deadline && daysLeft !== null && (
          <div
            className={cn(
              "shrink-0 text-sm font-semibold",
              getDeadlineColor(daysLeft)
            )}
          >
            {daysLeft < 0
              ? "Délai dépassé"
              : daysLeft === 0
                ? "Échéance aujourd'hui"
                : `J-${daysLeft}`}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAnalyze}
          disabled={project.status !== "draft" || isAnalyzing}
        >
          {isAnalyzing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <FileSearch className="size-4" />
          )}
          Analyser le DCE
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onPrice}
          disabled={!hasLines || project.status === "draft" || isPricing}
        >
          {isPricing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Calculator className="size-4" />
          )}
          Chiffrer le DPGF
        </Button>

        <Link href={`/projects/${project.id}/export`}>
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            Exporter le dossier
          </Button>
        </Link>
      </div>
    </div>
  )
}
