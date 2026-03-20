"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { AdminDoc } from "@/lib/types"

interface DocChecklistProps {
  docs: AdminDoc[]
  onGenerate: () => void
  onUpdateDoc: (docId: string, updates: Partial<AdminDoc>) => void
  isGenerating: boolean
}

export function DocChecklist({
  docs,
  onGenerate,
  onUpdateDoc,
  isGenerating,
}: DocChecklistProps) {
  const handleToggleValidation = (doc: AdminDoc) => {
    onUpdateDoc(doc.id, { is_validated: !doc.is_validated })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Documents administratifs</h2>
        <Button onClick={onGenerate} disabled={isGenerating}>
          Générer les documents
        </Button>
      </div>

      {isGenerating && (
        <Card className="p-4 space-y-2">
          <p className="text-sm text-muted-foreground">Génération en cours...</p>
          <Progress value={0} className="animate-pulse" />
        </Card>
      )}

      <div className="space-y-2">
        {docs.map((doc) => (
          <Card key={doc.id} className="flex items-center gap-3 px-4 py-3">
            <input
              type="checkbox"
              checked={doc.is_validated}
              onChange={() => handleToggleValidation(doc)}
              className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
            />
            <span className="flex-1 font-medium">{doc.doc_name}</span>
            {doc.is_generated ? (
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                Généré
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                À fournir
              </Badge>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
