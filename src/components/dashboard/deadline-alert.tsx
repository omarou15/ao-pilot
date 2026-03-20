"use client"

import Link from "next/link"
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
        "rounded-lg px-4 py-3 text-white",
        hasCritical
          ? "bg-gradient-to-r from-red-500 to-red-600"
          : "bg-gradient-to-r from-orange-400 to-orange-500"
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
        {urgentProjects.map((p, index) => (
          <li key={p.id} className="flex items-center justify-between">
            <Link
              href={`/projects/${p.id}`}
              className="truncate hover:underline"
            >
              {p.name}
            </Link>
            <span className="ml-2 shrink-0 font-semibold flex items-center gap-2">
              {index === 0 && (
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
              )}
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
