"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserButton } from "@clerk/nextjs"
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  ShieldCheck,
  HardHat,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Projets",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Paramètres",
    href: "/settings",
    icon: Settings,
  },
  {
    label: "Audit",
    href: "/admin/audit",
    icon: ShieldCheck,
  },
]

interface SidebarProps {
  onNavigate?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export function Sidebar({ onNavigate, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-gradient-to-b from-[#1e3a5f] to-[#152d4a] transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
        <Link href="/dashboard" className="flex items-center gap-2 overflow-hidden">
          <HardHat className="h-6 w-6 shrink-0 text-orange-400" />
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight text-white font-[family-name:var(--font-space-grotesk)]">
              AO Pilot
            </span>
          )}
        </Link>
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex rounded-md p-1.5 text-white/50 hover:text-white hover:bg-white/10 transition-colors duration-200"
            aria-label={isCollapsed ? "Déplier le menu" : "Replier le menu"}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-200",
                isActive
                  ? "bg-white/15 text-white border-l-3 border-orange-400"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 text-white" />
              {!isCollapsed && item.label}
            </Link>
          )
        })}
      </nav>

      {/* User button */}
      <div className="border-t border-white/10 px-4 py-4">
        <UserButton
          appearance={{
            elements: {
              rootBox: isCollapsed ? "w-8" : "w-full",
              userButtonTrigger: cn(
                "w-full justify-start",
                isCollapsed && "justify-center"
              ),
              userButtonAvatarBox: "w-8 h-8",
            },
          }}
        />
      </div>
    </div>
  )
}
