"use client"

import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Project, ProjectStatus } from "@/lib/types"
import { FileSearch, Calculator, Download, Loader2, Check } from "lucide-react"

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

const statusOrder: ProjectStatus[] = ["draft", "processing", "review", "validated", "submitted"]
const statusStepLabels: Record<ProjectStatus, string> = {
  draft: "Brouillon",
  processing: "Traitement",
  review: "Revue",
  validated: "Validé",
  submitted: "Soumis",
}

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function getDeadlinePill(days: number): { text: string; className: string } {
  const text =
    days < 0
      ? "Délai dépassé"
      : days === 0
        ? "Échéance aujourd'hui"
        : `J-${days}`

  if (days < 3) {
    return { text, className: "bg-red-100 text-red-700 border-red-200" }
  }
  if (days < 7) {
    return { text, className: "bg-orange-100 text-orange-700 border-orange-200" }
  }
  return { text, className: "bg-green-100 text-green-700 border-green-200" }
}

function StatusTimeline({ currentStatus }: { currentStatus: ProjectStatus }) {
  const currentIndex = statusOrder.indexOf(currentStatus)

  return (
    <div className="flex items-center w-full max-w-2xl">
      {statusOrder.map((step, index) => {
        const isCompleted = index < currentIndex
        const isCurrent = index === currentIndex
        const isFuture = index > currentIndex
        const isLast = index === statusOrder.length - 1

        return (
          <div key={step} className="flex items-center flex-1 last:flex-none">
            {/* Step circle + label */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-xs font-semibold transition-colors shrink-0",
                  isCompleted && "bg-[#1e3a5f] text-white",
                  isCurrent && "bg-[#e67e22] text-white ring-2 ring-[#e67e22]/30",
                  isFuture && "bg-gray-200 text-gray-500"
                )}
              >
                {isCompleted ? <Check className="size-4" /> : index + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  isCompleted && "text-[#1e3a5f]",
                  isCurrent && "text-[#e67e22]",
                  isFuture && "text-gray-400"
                )}
              >
                {statusStepLabels[step]}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 mt-[-1.25rem]",
                  index < currentIndex ? "bg-[#1e3a5f]" : "bg-gray-200"
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
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
  const deadlinePill = daysLeft !== null ? getDeadlinePill(daysLeft) : null

  return (
    <div className="flex flex-col gap-5">
      {/* Title row */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight truncate font-[family-name:var(--font-space-grotesk)]">
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

        {deadlinePill && (
          <span
            className={cn(
              "shrink-0 text-sm font-semibold px-3 py-1 rounded-full border",
              deadlinePill.className
            )}
          >
            {deadlinePill.text}
          </span>
        )}
      </div>

      {/* Status timeline */}
      <StatusTimeline currentStatus={project.status} />

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          size="sm"
          className="bg-[#1e3a5f] text-white hover:bg-[#152d4a]"
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
          size="sm"
          className="bg-[#e67e22] text-white hover:bg-[#d35400]"
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
          <Button size="sm" className="bg-[#27ae60] text-white hover:bg-[#1e8449]">
            <Download className="size-4" />
            Exporter le dossier
          </Button>
        </Link>
      </div>
    </div>
  )
}
