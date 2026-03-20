"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { SectionEditor } from "@/components/memoire/section-editor"
import type { MemoireSection } from "@/lib/types"

interface SectionListProps {
  sections: MemoireSection[]
  onGenerate: () => void
  onUpdateSection: (sectionId: string, updates: Partial<MemoireSection>) => void
  isGenerating: boolean
}

export function SectionList({
  sections,
  onGenerate,
  onUpdateSection,
  isGenerating,
}: SectionListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleSection = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Sections du mémoire</h2>
        <Button onClick={onGenerate} disabled={isGenerating}>
          Générer le mémoire technique
        </Button>
      </div>

      {isGenerating && (
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Génération en cours...</p>
          <Progress value={0} className="animate-pulse" />
        </Card>
      )}

      <div className="space-y-2">
        {sections.map((section, index) => (
          <Card key={section.id} className="overflow-hidden">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {index + 1}
              </span>
              <span className="font-medium flex-1">{section.title}</span>
              {section.is_validated && (
                <span className="text-green-600 text-sm">Validé</span>
              )}
              <span className="text-muted-foreground text-sm">
                {expandedId === section.id ? "▲" : "▼"}
              </span>
            </button>

            {expandedId === section.id && (
              <SectionEditor section={section} onUpdate={onUpdateSection} />
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
