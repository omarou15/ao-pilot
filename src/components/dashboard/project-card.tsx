"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Project, ProjectStatus } from "@/lib/types"
import { Calendar, Clock } from "lucide-react"

interface ProjectCardProps {
  project: Project
}

const statusConfig: Record<ProjectStatus, { label: string; badgeClassName: string; borderClassName: string }> = {
  draft: {
    label: "Brouillon",
    badgeClassName: "bg-slate-500 text-white hover:bg-slate-600",
    borderClassName: "border-l-4 border-slate-300",
  },
  processing: {
    label: "En traitement",
    badgeClassName: "bg-blue-500 text-white hover:bg-blue-600",
    borderClassName: "border-l-4 border-blue-500",
  },
  review: {
    label: "En revue",
    badgeClassName: "bg-orange-500 text-white hover:bg-orange-600",
    borderClassName: "border-l-4 border-orange-500",
  },
  validated: {
    label: "Validé",
    badgeClassName: "bg-green-500 text-white hover:bg-green-600",
    borderClassName: "border-l-4 border-green-500",
  },
  submitted: {
    label: "Soumis",
    badgeClassName: "bg-purple-500 text-white hover:bg-purple-600",
    borderClassName: "border-l-4 border-purple-500",
  },
}

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

function getDeadlinePillColor(days: number): string {
  if (days <= 1) return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
  if (days <= 3) return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
  if (days <= 7) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
  return "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status]
  const daysLeft = project.deadline ? getDaysUntilDeadline(project.deadline) : null

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className={cn(
        status.borderClassName,
        "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
      )}>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <CardTitle className="truncate font-bold">{project.name}</CardTitle>
              {project.reference && (
                <p className="mt-1 text-xs text-muted-foreground truncate">
                  Réf. {project.reference}
                </p>
              )}
            </div>
            <Badge className={cn("shrink-0", status.badgeClassName)}>
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="size-3.5" />
              <span>
                {new Date(project.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>

            {project.deadline && daysLeft !== null && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-xs",
                  getDeadlinePillColor(daysLeft)
                )}
              >
                <Clock className="size-3" />
                {daysLeft < 0
                  ? "Dépassé"
                  : daysLeft === 0
                    ? "Aujourd'hui"
                    : `J-${daysLeft}`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
