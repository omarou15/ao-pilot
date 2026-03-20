"use client"

import Link from "next/link"
import { useProjects } from "@/lib/hooks/use-projects"
import { StatsOverview } from "@/components/dashboard/stats-overview"
import { DeadlineAlert } from "@/components/dashboard/deadline-alert"
import { ProjectCard } from "@/components/dashboard/project-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, FolderOpen } from "lucide-react"

function getDaysUntilDeadline(deadline: string): number {
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export default function DashboardPage() {
  const { projects, isLoading, error } = useProjects()

  const sortedProjects = [...projects].sort((a, b) => {
    if (!a.deadline && !b.deadline) return 0
    if (!a.deadline) return 1
    if (!b.deadline) return -1
    return getDaysUntilDeadline(a.deadline) - getDaysUntilDeadline(b.deadline)
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-36" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <Link href="/projects/new">
          <Button>
            <Plus className="size-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      <StatsOverview projects={projects} />

      <DeadlineAlert projects={projects} />

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 text-center">
          <FolderOpen className="size-12 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Aucun projet</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Créez votre premier appel d&apos;offres.
          </p>
          <Link href="/projects/new" className="mt-4">
            <Button>
              <Plus className="size-4" />
              Nouveau projet
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  )
}
