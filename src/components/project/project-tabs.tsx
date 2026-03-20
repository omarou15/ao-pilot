"use client"

import { useRouter, usePathname } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProjectTabsProps {
  projectId: string
  activeTab: string
}

const tabs = [
  { value: "dpgf", label: "DPGF", path: "" },
  { value: "memoire", label: "Mémoire technique", path: "/memoire" },
  { value: "admin-docs", label: "Documents admin", path: "/admin-docs" },
  { value: "export", label: "Export", path: "/export" },
] as const

function resolveActiveTab(pathname: string, projectId: string): string {
  const base = `/projects/${projectId}`
  if (pathname === base || pathname === `${base}/`) return "dpgf"
  for (const tab of tabs) {
    if (tab.path && pathname.startsWith(`${base}${tab.path}`)) return tab.value
  }
  return "dpgf"
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentTab = resolveActiveTab(pathname, projectId)

  function handleTabChange(value: string | number) {
    const tab = tabs.find((t) => t.value === String(value))
    if (tab) {
      router.push(`/projects/${projectId}${tab.path}`)
    }
  }

  return (
    <Tabs value={currentTab} onValueChange={handleTabChange}>
      <TabsList variant="line">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
