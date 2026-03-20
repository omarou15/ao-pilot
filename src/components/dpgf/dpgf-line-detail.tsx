"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DpgfLine, PricingDetail, PricingConfidence } from "@/lib/types"

interface DpgfLineDetailProps {
  line: DpgfLine
}

const confidenceConfig: Record<
  PricingConfidence,
  { label: string; className: string }
> = {
  high: {
    label: "Référencé",
    className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  },
  medium: {
    label: "Estimé",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  },
  low: {
    label: "À vérifier",
    className: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
  },
}

function formatEuro(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value)
}

function parseSourceDetail(
  sourceDetail: Record<string, unknown> | string | null
): PricingDetail | null {
  if (!sourceDetail) return null

  let parsed: Record<string, unknown>
  if (typeof sourceDetail === "string") {
    try {
      parsed = JSON.parse(sourceDetail) as Record<string, unknown>
    } catch {
      return null
    }
  } else {
    parsed = sourceDetail
  }

  if (!parsed.materialName && !parsed.laborCategory) return null

  return parsed as unknown as PricingDetail
}

function getSourceLabel(source: string): { label: string; className: string } {
  if (source === "reference_table") {
    return {
      label: "Table de référence",
      className: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    }
  }
  return {
    label: "Estimation IA",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
  }
}

export function DpgfLineDetail({ line }: DpgfLineDetailProps) {
  const detail = useMemo(
    () => parseSourceDetail(line.source_detail as Record<string, unknown> | string | null),
    [line.source_detail]
  )

  if (!detail) {
    return (
      <div className="px-6 py-4 text-sm text-muted-foreground">
        Aucun détail de chiffrage disponible pour ce poste.
      </div>
    )
  }

  const coutMateriau = detail.materialUnitPrice * detail.materialQuantity
  const coutMO = detail.laborHourlyRate * detail.laborHours
  const coutReel = coutMateriau + coutMO
  const prixVente = coutReel * (1 + detail.marginPct / 100)

  const sourceInfo = getSourceLabel(detail.source)
  const confidenceInfo = detail.confidence
    ? confidenceConfig[detail.confidence]
    : null

  return (
    <div className="px-6 py-4 space-y-4">
      <div className="flex items-center gap-2">
        <Badge className={cn("shrink-0", sourceInfo.className)}>
          {sourceInfo.label}
        </Badge>
        {confidenceInfo && (
          <Badge className={cn("shrink-0", confidenceInfo.className)}>
            {confidenceInfo.label}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6 text-sm">
        {/* Matériaux */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Matériaux</h4>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Désignation</span>
              <span className="text-foreground">{detail.materialName}</span>
            </div>
            <div className="flex justify-between">
              <span>Prix unitaire</span>
              <span className="text-foreground">
                {formatEuro(detail.materialUnitPrice)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Quantité</span>
              <span className="text-foreground">{detail.materialQuantity}</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-medium">
              <span>Sous-total matériaux</span>
              <span className="text-foreground">{formatEuro(coutMateriau)}</span>
            </div>
          </div>
        </div>

        {/* Main d'oeuvre */}
        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Main d&apos;oeuvre</h4>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between">
              <span>Catégorie</span>
              <span className="text-foreground">{detail.laborCategory}</span>
            </div>
            <div className="flex justify-between">
              <span>Taux horaire</span>
              <span className="text-foreground">
                {formatEuro(detail.laborHourlyRate)}/h
              </span>
            </div>
            <div className="flex justify-between">
              <span>Heures</span>
              <span className="text-foreground">{detail.laborHours}h</span>
            </div>
            <div className="flex justify-between border-t pt-1 font-medium">
              <span>Sous-total MO</span>
              <span className="text-foreground">{formatEuro(coutMO)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calcul final */}
      <div className="rounded-md bg-muted/50 p-3 text-sm space-y-1">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Coût matériau + Coût MO = Coût réel
          </span>
          <span className="font-medium">
            {formatEuro(coutMateriau)} + {formatEuro(coutMO)} ={" "}
            {formatEuro(coutReel)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Coût réel x (1 + {detail.marginPct}%) = Prix de vente
          </span>
          <span className="font-bold text-foreground">
            {formatEuro(prixVente)}
          </span>
        </div>
      </div>
    </div>
  )
}
