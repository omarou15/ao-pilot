"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import type { DpgfLine } from "@/lib/types"
import { Layers, List, Wallet, TrendingUp } from "lucide-react"

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
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
          {/* Lots */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#1e3a5f]/10 shrink-0">
              <Layers className="size-4 text-[#1e3a5f]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lots</p>
              <p className="text-lg font-semibold">{stats.lotCount}</p>
            </div>
          </div>

          {/* Lignes */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-500/10 shrink-0">
              <List className="size-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Lignes</p>
              <p className="text-lg font-semibold">{stats.totalLines}</p>
            </div>
          </div>

          {/* Cout reel */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-slate-500/10 shrink-0">
              <Wallet className="size-4 text-slate-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Coût réel</p>
              <p className="text-lg font-semibold">
                {formatEuro(stats.totalCostReal)}
              </p>
            </div>
          </div>

          {/* Marge */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[#e67e22]/10 shrink-0">
              <TrendingUp className="size-4 text-[#e67e22]" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Marge ({stats.marginPct.toFixed(1)}%)
              </p>
              <p className="text-lg font-semibold">
                {formatEuro(stats.totalMargin)}
              </p>
            </div>
          </div>

          {/* Prix vente HT — prominent */}
          <div className="flex items-start gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-green-500/10 shrink-0">
              <span className="text-green-600 font-bold text-sm">HT</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Prix de vente HT</p>
              <p className="text-2xl font-bold text-green-700 font-[family-name:var(--font-space-grotesk)]">
                {formatEuro(stats.totalPriceSale)}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar with branded colors */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Avancement chiffrage</span>
            <span className="font-medium">{stats.pricedLines}/{stats.totalLines} lignes chiffrées</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#e67e22] transition-all duration-500"
              style={{ width: `${stats.progressPct}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
