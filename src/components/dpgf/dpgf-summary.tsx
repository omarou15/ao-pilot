"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import type { DpgfLine } from "@/lib/types"

interface DpgfSummaryProps {
  lines: DpgfLine[]
}

function formatEuro(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value)
}

export function DpgfSummary({ lines }: DpgfSummaryProps) {
  const stats = useMemo(() => {
    const lots = new Set(lines.map((l) => l.lot ?? "Sans lot"))
    const totalLines = lines.length
    const pricedLines = lines.filter(
      (l) => l.total_price_sale !== null && l.total_price_sale > 0
    ).length
    const totalCostReal = lines.reduce(
      (sum, l) => sum + (l.total_cost ?? 0),
      0
    )
    const totalPriceSale = lines.reduce(
      (sum, l) => sum + (l.total_price_sale ?? 0),
      0
    )
    const totalMargin = totalCostReal > 0 ? totalPriceSale - totalCostReal : 0
    const marginPct =
      totalCostReal > 0
        ? ((totalPriceSale - totalCostReal) / totalCostReal) * 100
        : 0
    const progressPct = totalLines > 0 ? (pricedLines / totalLines) * 100 : 0

    return {
      lotCount: lots.size,
      totalLines,
      pricedLines,
      totalCostReal,
      totalMargin,
      marginPct,
      totalPriceSale,
      progressPct,
    }
  }, [lines])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Synthèse DPGF</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          <div>
            <p className="text-xs text-muted-foreground">Lots</p>
            <p className="text-lg font-semibold">{stats.lotCount}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Lignes</p>
            <p className="text-lg font-semibold">{stats.totalLines}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Coût réel</p>
            <p className="text-lg font-semibold">
              {formatEuro(stats.totalCostReal)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">
              Marge ({stats.marginPct.toFixed(1)}%)
            </p>
            <p className="text-lg font-semibold">
              {formatEuro(stats.totalMargin)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prix vente HT</p>
            <p className="text-lg font-bold">{formatEuro(stats.totalPriceSale)}</p>
          </div>
        </div>

        <Progress value={stats.progressPct}>
          <ProgressLabel>Avancement chiffrage</ProgressLabel>
          <ProgressValue>
            {() => `${stats.pricedLines}/${stats.totalLines} lignes chiffrées`}
          </ProgressValue>
        </Progress>
      </CardContent>
    </Card>
  )
}
