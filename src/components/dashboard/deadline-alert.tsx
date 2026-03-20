"use client"

import { cn } from "@/lib/utils"
import type { Project } from "@/lib/types"
import { AlertTriangle } from "lucide-react"

interface DeadlineAlertProps {
  projects: Project[]
}

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function DeadlineAlert({ projects }: DeadlineAlertProps) {
  const urgentProjects = projects
    .filter((p) => {
      if (!p.deadline) return false
      const days = getDaysUntilDeadline(p.deadline)
      return days >= 0 && days <= 3
    })
    .map((p) => ({
      ...p,
      daysLeft: getDaysUntilDeadline(p.deadline!),
    }))
    .sort((a, b) => a.daysLeft - b.daysLeft)

  if (urgentProjects.length === 0) return null

  const hasCritical = urgentProjects.some((p) => p.daysLeft <= 1)

  return (
    <div
      className={cn(
        "rounded-lg px-4 py-3",
        hasCritical
          ? "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100"
          : "bg-orange-50 text-orange-900 dark:bg-orange-950 dark:text-orange-100"
      )}
    >
      <div className="flex items-center gap-2 font-semibold">
        <AlertTriangle className="size-4" />
        <span>
          {urgentProjects.length === 1
            ? "1 projet avec échéance imminente"
            : `${urgentProjects.length} projets avec échéance imminente`}
        </span>
      </div>
      <ul className="mt-2 space-y-1 text-sm">
        {urgentProjects.map((p) => (
          <li key={p.id} className="flex items-center justify-between">
            <span className="truncate">{p.name}</span>
            <span
              className={cn(
                "ml-2 shrink-0 font-semibold",
                p.daysLeft <= 1 ? "text-red-700 dark:text-red-300" : "text-orange-700 dark:text-orange-300"
              )}
            >
              {p.daysLeft === 0
                ? "Aujourd'hui"
                : p.daysLeft === 1
                  ? "J-1"
                  : `J-${p.daysLeft}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
