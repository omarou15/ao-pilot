"use client"

import { useRouter, usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface ProjectTabsProps {
  projectId: string
  activeTab: string
  counts?: {
    dpgf?: number
    memoire?: number
    "admin-docs"?: number
    export?: number
  }
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

export function ProjectTabs({ projectId, counts }: ProjectTabsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const currentTab = resolveActiveTab(pathname, projectId)

  function handleTabClick(value: string) {
    const tab = tabs.find((t) => t.value === value)
    if (tab) {
      router.push(`/projects/${projectId}${tab.path}`)
    }
  }

  return (
    <div className="border-b border-slate-200">
      <nav className="-mb-px flex gap-6" aria-label="Onglets du projet">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.value
          const count = counts?.[tab.value as keyof NonNullable<typeof counts>]

          return (
            <button
              key={tab.value}
              onClick={() => handleTabClick(tab.value)}
              className={cn(
                "inline-flex items-center pb-3 pt-1 text-sm font-medium transition-colors border-b-2",
                isActive
                  ? "border-[#1e3a5f] text-[#1e3a5f]"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              )}
            >
              {tab.label}
              {count !== undefined && count !== null && (
                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full ml-2">
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
