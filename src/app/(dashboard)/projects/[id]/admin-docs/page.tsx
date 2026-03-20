"use client"

import { useParams } from "next/navigation"
import { useAdminDocs } from "@/lib/hooks/use-admin-docs"
import { DocChecklist } from "@/components/admin-docs/doc-checklist"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDocsPage() {
  const { id } = useParams<{ id: string }>()
  const { docs, isLoading, generate, updateDoc, isGenerating } = useAdminDocs(id)

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (docs.length === 0 && !isGenerating) {
    return (
      <div className="p-6">
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-muted-foreground mb-4">
            Aucun document. Générez les documents administratifs.
          </p>
          <Button onClick={generate}>Générer les documents administratifs</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Documents administratifs</h1>
      <DocChecklist
        docs={docs}
        onGenerate={generate}
        onUpdateDoc={updateDoc}
        isGenerating={isGenerating}
      />
    </div>
  )
}
