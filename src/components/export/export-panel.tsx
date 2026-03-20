"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface ExportPanelProps {
  projectId: string
  dpgfCount: number
  memoireCount: number
  adminDocsCount: number
}

interface CheckItem {
  label: string
  ready: boolean
}

export function ExportPanel({
  projectId,
  dpgfCount,
  memoireCount,
  adminDocsCount,
}: ExportPanelProps) {
  const checks: CheckItem[] = [
    { label: "DPGF chiffré", ready: dpgfCount > 0 },
    { label: "Mémoire technique", ready: memoireCount > 0 },
    { label: "Documents administratifs", ready: adminDocsCount > 0 },
  ]

  const readyCount = checks.filter((c) => c.ready).length
  const readinessPercent = Math.round((readyCount / checks.length) * 100)
  const isReady = readinessPercent === 100

  const handleExport = () => {
    window.open(`/api/projects/${projectId}/export`)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">État de préparation du dossier</h2>

      <Card className="p-6 space-y-4">
        <div className="space-y-3">
          {checks.map((check) => (
            <div key={check.label} className="flex items-center gap-3">
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                  check.ready ? "bg-green-600" : "bg-red-500"
                }`}
              >
                {check.ready ? "\u2713" : "\u2717"}
              </span>
              <span className="text-sm font-medium">{check.label}</span>
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progression</span>
            <span className="font-semibold">{readinessPercent}%</span>
          </div>
          <Progress value={readinessPercent} />
        </div>

        <Button onClick={handleExport} disabled={!isReady} className="w-full">
          Valider et télécharger le dossier
        </Button>

        <p className="text-xs text-muted-foreground">
          Le dossier sera exporté au format ZIP contenant DPGF.xlsx, Mémoire_technique.docx
          et les documents administratifs.
        </p>
      </Card>
    </div>
  )
}
