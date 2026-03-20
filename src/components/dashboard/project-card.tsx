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

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  draft: { label: "Brouillon", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300" },
  processing: { label: "En traitement", className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" },
  review: { label: "En revue", className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300" },
  validated: { label: "Validé", className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" },
  submitted: { label: "Soumis", className: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300" },
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

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status]
  const daysLeft = project.deadline ? getDaysUntilDeadline(project.deadline) : null

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <Card className="transition-shadow hover:ring-2 hover:ring-primary/20 cursor-pointer">
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
            <Badge className={cn("shrink-0", status.className)}>
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
              <div
                className={cn(
                  "flex items-center gap-1 font-semibold",
                  getDeadlineColor(daysLeft)
                )}
              >
                <Clock className="size-3.5" />
                <span>
                  {daysLeft < 0
                    ? "Dépassé"
                    : daysLeft === 0
                      ? "Aujourd'hui"
                      : `J-${daysLeft}`}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
