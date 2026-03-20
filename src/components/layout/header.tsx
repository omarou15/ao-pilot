"use client"

import { Menu, Bell } from "lucide-react"

interface HeaderProps {
  onMenuToggle: () => void
}

export function Header({ onMenuToggle }: HeaderProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-zinc-200 bg-white px-4 lg:px-6">
      {/* Mobile menu toggle */}
      <button
        type="button"
        onClick={onMenuToggle}
        className="rounded-md p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title / breadcrumbs area */}
      <div className="flex-1" />

      {/* Right side actions */}
      <button
        type="button"
        className="relative rounded-md p-2 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
      </button>
    </header>
  )
}
