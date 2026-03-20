"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Bell, ChevronRight } from "lucide-react"

const segmentLabels: Record<string, string> = {
  dashboard: "Tableau de bord",
  projects: "Projets",
  settings: "Paramètres",
  admin: "Administration",
  audit: "Audit",
  new: "Nouveau",
}

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  // Build breadcrumb items with cumulative paths
  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/")
    const label = segmentLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)
    return { href, label }
  })

  // Page title is the last breadcrumb label
  const pageTitle = breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].label : ""

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white shadow-sm px-4 lg:px-6">
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Breadcrumbs and page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-lg font-semibold text-[#1e3a5f] font-[family-name:var(--font-space-grotesk)] truncate">
          {pageTitle}
        </h1>
        {breadcrumbs.length > 1 && (
          <nav className="flex items-center gap-1 text-xs text-slate-500" aria-label="Fil d'Ariane">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="flex items-center gap-1">
                {index > 0 && <ChevronRight className="h-3 w-3 text-slate-400" />}
                {index < breadcrumbs.length - 1 ? (
                  <Link
                    href={crumb.href}
                    className="hover:text-[#1e3a5f] transition-colors duration-200"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-700 font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right side actions */}
      <button
        type="button"
        className="relative rounded-md p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
      </button>
    </header>
  )
}
