"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MemoireSection } from "@/lib/types"

interface SectionEditorProps {
  section: MemoireSection
  onUpdate: (sectionId: string, updates: Partial<MemoireSection>) => void
}

export function SectionEditor({ section, onUpdate }: SectionEditorProps) {
  const [title, setTitle] = useState(section.title)
  const [content, setContent] = useState(section.content ?? "")

  const handleSave = () => {
    onUpdate(section.id, { title, content })
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-3">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titre de la section"
          className="font-semibold"
        />
        {section.is_validated && (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700 shrink-0">
            Validé
          </Badge>
        )}
      </div>

      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Contenu de la section..."
        className="min-h-[200px] resize-y"
      />

      <div className="flex justify-end">
        <Button onClick={handleSave}>Sauvegarder</Button>
      </div>
    </div>
  )
}
