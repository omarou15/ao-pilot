"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useProjects } from "@/lib/hooks/use-projects"
import { ProjectCard } from "@/components/dashboard/project-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ProjectStatus } from "@/lib/types"
import { Plus, Search, FolderOpen } from "lucide-react"

type SortOption = "created" | "deadline" | "name"

const statusTabs: { value: string; label: string; status?: ProjectStatus }[] = [
  { value: "all", label: "Tous" },
  { value: "draft", label: "Brouillon", status: "draft" },
  { value: "processing", label: "En traitement", status: "processing" },
  { value: "review", label: "En revue", status: "review" },
  { value: "validated", label: "Validés", status: "validated" },
  { value: "submitted", label: "Soumis", status: "submitted" },
]

const emptyMessages: Record<string, string> = {
  all: "Aucun projet trouvé",
  draft: "Aucun projet en brouillon",
  processing: "Aucun projet en traitement",
  review: "Aucun projet en revue",
  validated: "Aucun projet validé",
  submitted: "Aucun projet soumis",
}

export default function ProjectsPage() {
  const { projects, isLoading, error, refresh } = useProjects()
  const [search, setSearch] = useState("")
  const [sort, setSort] = useState<SortOption>("created")
  const [activeTab, setActiveTab] = useState("all")

  const filteredAndSorted = useMemo(() => {
    let result = [...projects]

    // Filter by status
    const tab = statusTabs.find((t) => t.value === activeTab)
    if (tab?.status) {
      result = result.filter((p) => p.status === tab.status)
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.reference && p.reference.toLowerCase().includes(q))
      )
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case "deadline":
          if (!a.deadline && !b.deadline) return 0
          if (!a.deadline) return 1
          if (!b.deadline) return -1
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
        case "name":
          return a.name.localeCompare(b.name, "fr")
        case "created":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return result
  }, [projects, activeTab, search, sort])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => refresh()}>
          Réessayer
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight font-[family-name:var(--font-space-grotesk)]">
          Projets
        </h1>
        <Link href="/projects/new">
          <Button className="bg-[#e67e22] hover:bg-[#d35400] text-white">
            <Plus className="size-4" />
            Nouveau projet
          </Button>
        </Link>
      </div>

      {/* Search and sort controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par nom ou référence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[220px]">
            <SelectValue placeholder="Trier par" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Par date de création</SelectItem>
            <SelectItem value="deadline">Par échéance</SelectItem>
            <SelectItem value="name">Par nom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {statusTabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {statusTabs.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className="mt-4">
            {filteredAndSorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
                <FolderOpen className="size-12 text-[#1e3a5f]" />
                <h2 className="mt-4 text-lg font-semibold font-[family-name:var(--font-space-grotesk)]">
                  {emptyMessages[activeTab]}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {search.trim()
                    ? "Essayez de modifier votre recherche."
                    : "Créez un nouveau projet pour commencer."}
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredAndSorted.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
