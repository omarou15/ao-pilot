"use client"

import { useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import type { DpgfLine, PricingDetail, PricingConfidence } from "@/lib/types"

interface DpgfLineDetailProps {
  line: DpgfLine
}

const confidenceConfig: Record<
  PricingConfidence,
  { label: string; dotColor: string }
> = {
  high: {
    label: "Référencé",
    dotColor: "bg-green-500",
  },
  medium: {
    label: "Estimé",
    dotColor: "bg-blue-500",
  },
  low: {
    label: "À vérifier",
    dotColor: "bg-orange-500",
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
    <div className="px-6 py-5 space-y-5">
      {/* Source and confidence badges — prominent */}
      <div className="flex items-center gap-3">
        <Badge className={cn("shrink-0 text-sm px-3 py-1", sourceInfo.className)}>
          {sourceInfo.label}
        </Badge>
        {confidenceInfo && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium">
            <span className={cn("w-2.5 h-2.5 rounded-full", confidenceInfo.dotColor)} />
            {confidenceInfo.label}
          </span>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-6 text-sm">
        {/* Materiaux — slate/gray section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-slate-400" />
            <h4 className="font-semibold text-slate-700">Matériaux</h4>
          </div>
          <div className="space-y-1.5 text-muted-foreground pl-3">
            <div className="flex justify-between">
              <span>Désignation</span>
              <span className="text-foreground font-medium">{detail.materialName}</span>
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
            <Separator />
            <div className="flex justify-between font-medium pt-1">
              <span className="text-slate-600">Sous-total matériaux</span>
              <span className="text-slate-800">{formatEuro(coutMateriau)}</span>
            </div>
          </div>
        </div>

        {/* Main d'oeuvre — blue section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-1 h-5 rounded-full bg-blue-400" />
            <h4 className="font-semibold text-blue-700">Main d&apos;oeuvre</h4>
          </div>
          <div className="space-y-1.5 text-muted-foreground pl-3">
            <div className="flex justify-between">
              <span>Catégorie</span>
              <span className="text-foreground font-medium">{detail.laborCategory}</span>
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
            <Separator />
            <div className="flex justify-between font-medium pt-1">
              <span className="text-blue-600">Sous-total MO</span>
              <span className="text-blue-800">{formatEuro(coutMO)}</span>
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Calcul final — color-coded breakdown */}
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        {/* Cout reel — navy section */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-[#1e3a5f]/5">
          <span className="text-sm text-[#1e3a5f] font-medium">
            Coût réel (matériaux + MO)
          </span>
          <span className="font-semibold text-[#1e3a5f]">
            {formatEuro(coutReel)}
          </span>
        </div>

        {/* Marge — orange section */}
        <div className="flex justify-between items-center px-4 py-2.5 bg-[#e67e22]/5 border-t border-slate-200">
          <span className="text-sm text-[#e67e22] font-medium">
            Marge ({detail.marginPct}%)
          </span>
          <span className="font-semibold text-[#e67e22]">
            + {formatEuro(coutReel * detail.marginPct / 100)}
          </span>
        </div>

        {/* Prix de vente — green section */}
        <div className="flex justify-between items-center px-4 py-3 bg-green-50 border-t border-slate-200">
          <span className="text-sm text-green-700 font-semibold">
            Prix de vente HT
          </span>
          <span className="font-bold text-green-700 text-lg">
            {formatEuro(prixVente)}
          </span>
        </div>
      </div>
    </div>
  )
}
