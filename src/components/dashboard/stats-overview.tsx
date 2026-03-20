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
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      cardBg: "bg-blue-50/50",
    },
    {
      label: "En cours de revue",
      value: inReview,
      icon: Eye,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      cardBg: "bg-orange-50/50",
    },
    {
      label: "Échéance proche",
      value: upcomingDeadline,
      icon: Clock,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      cardBg: "bg-amber-50/50",
    },
    {
      label: "Validés",
      value: validated,
      icon: CheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      cardBg: "bg-green-50/50",
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className={`${stat.cardBg} hover:shadow-md transition-shadow duration-200`}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.label}
            </CardTitle>
            <div className={`${stat.iconBg} ${stat.iconColor} p-2.5 rounded-xl`}>
              <stat.icon className="size-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-[family-name:var(--font-space-grotesk)]">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
