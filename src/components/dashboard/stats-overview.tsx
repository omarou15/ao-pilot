"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Project } from "@/lib/types"
import { FolderOpen, Eye, Clock, CheckCircle } from "lucide-react"

interface StatsOverviewProps {
  projects: Project[]
}

export function StatsOverview({ projects }: StatsOverviewProps) {
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

  const totalProjects = projects.length
  const inReview = projects.filter((p) => p.status === "review").length
  const upcomingDeadline = projects.filter((p) => {
    if (!p.deadline) return false
    const deadline = new Date(p.deadline)
    return deadline >= now && deadline <= sevenDaysFromNow
  }).length
  const validated = projects.filter((p) => p.status === "validated").length

  const stats = [
    {
      label: "Total projets",
      value: totalProjects,
      icon: FolderOpen,
      color: "text-blue-600",
    },
    {
      label: "En cours de revue",
      value: inReview,
      icon: Eye,
      color: "text-orange-600",
    },
    {
      label: "Échéance proche",
      value: upcomingDeadline,
      icon: Clock,
      color: "text-yellow-600",
    },
    {
      label: "Validés",
      value: validated,
      icon: CheckCircle,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <stat.icon className={`size-5 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
