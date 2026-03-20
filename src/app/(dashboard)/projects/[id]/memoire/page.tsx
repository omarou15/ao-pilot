"use client"

import { useParams } from "next/navigation"
import { useMemoire } from "@/lib/hooks/use-memoire"
import { SectionList } from "@/components/memoire/section-list"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function MemoirePage() {
  const { id } = useParams<{ id: string }>()
  const { sections, isLoading, generate, updateSection, isGenerating } = useMemoire(id)

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
  }

  if (sections.length === 0 && !isGenerating) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Aucune section. Générez le mémoire technique.
          </p>
          <Button onClick={generate}>Générer le mémoire technique</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Mémoire technique</h1>
      <SectionList
        sections={sections}
        onGenerate={generate}
        onUpdateSection={updateSection}
        isGenerating={isGenerating}
      />
    </div>
  )
}
