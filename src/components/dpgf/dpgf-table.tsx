"use client"

import { useState, useCallback, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { DpgfLine, PricingConfidence } from "@/lib/types"
import { ChevronDown, ChevronRight, Calculator, Loader2 } from "lucide-react"
import { DpgfLineDetail } from "./dpgf-line-detail"

interface DpgfTableProps {
  lines: DpgfLine[]
  onUpdateLine: (lineId: string, updates: Partial<DpgfLine>) => Promise<void>
  onTriggerPricing: () => void
  isPricing: boolean
}

type EditingCell = {
  lineId: string
  field: "quantity" | "unit_cost_material" | "unit_cost_labor" | "margin_pct"
} | null

const confidenceConfig: Record<
  PricingConfidence,
  { label: string; dotColor: string; tooltip?: string }
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
    tooltip: "Prix estimé par l'IA sans référence directe",
  },
}

function formatEuro(value: number | null): string {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return "—"
  return new Intl.NumberFormat("fr-FR", {
    maximumFractionDigits: 2,
  }).format(value)
}

function ConfidenceBadge({ confidence }: { confidence: PricingConfidence }) {
  const config = confidenceConfig[confidence]

  const badge = (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className={cn("w-2 h-2 rounded-full", config.dotColor)} />
      {config.label}
    </span>
  )

  if (config.tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>{badge}</TooltipTrigger>
          <TooltipContent>{config.tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badge
}

function EditableCell({
  value,
  lineId,
  field,
  editingCell,
  onStartEdit,
  onSave,
  isCurrency,
}: {
  value: number | null
  lineId: string
  field: EditingCell extends null ? never : NonNullable<EditingCell>["field"]
  editingCell: EditingCell
  onStartEdit: (lineId: string, field: NonNullable<EditingCell>["field"]) => void
  onSave: (lineId: string, field: NonNullable<EditingCell>["field"], value: string) => void
  isCurrency?: boolean
}) {
  const isEditing =
    editingCell?.lineId === lineId && editingCell?.field === field

  if (isEditing) {
    return (
      <Input
        type="number"
        step="any"
        defaultValue={value ?? ""}
        className="h-7 w-24 text-right text-xs"
        autoFocus
        onBlur={(e) => onSave(lineId, field, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const target = e.target as HTMLInputElement
            onSave(lineId, field, target.value)
          }
          if (e.key === "Escape") {
            onSave(lineId, field, String(value ?? ""))
          }
        }}
      />
    )
  }

  return (
    <span
      className="cursor-pointer rounded px-1 py-0.5 hover:bg-muted"
      onClick={() => onStartEdit(lineId, field)}
    >
      {isCurrency ? formatEuro(value) : formatNumber(value)}
    </span>
  )
}

export function DpgfTable({
  lines,
  onUpdateLine,
  onTriggerPricing,
  isPricing,
}: DpgfTableProps) {
  const [editingCell, setEditingCell] = useState<EditingCell>(null)
  const [expandedLine, setExpandedLine] = useState<string | null>(null)
  const [collapsedLots, setCollapsedLots] = useState<Set<string>>(new Set())

  const lotGroups = useMemo(() => {
    const groups = new Map<string, DpgfLine[]>()
    const sorted = [...lines].sort((a, b) => a.sort_order - b.sort_order)
    for (const line of sorted) {
      const lot = line.lot ?? "Sans lot"
      const group = groups.get(lot)
      if (group) {
        group.push(line)
      } else {
        groups.set(lot, [line])
      }
    }
    return groups
  }, [lines])

  const grandTotal = useMemo(
    () => lines.reduce((sum, line) => sum + (line.total_price_sale ?? 0), 0),
    [lines]
  )

  const handleStartEdit = useCallback(
    (lineId: string, field: NonNullable<EditingCell>["field"]) => {
      setEditingCell({ lineId, field })
    },
    []
  )

  const handleSave = useCallback(
    (lineId: string, field: NonNullable<EditingCell>["field"], value: string) => {
      setEditingCell(null)
      const numValue = value === "" ? null : parseFloat(value)
      if (isNaN(numValue as number)) return
      onUpdateLine(lineId, { [field]: numValue })
    },
    [onUpdateLine]
  )

  const toggleLot = useCallback((lot: string) => {
    setCollapsedLots((prev) => {
      const next = new Set(prev)
      if (next.has(lot)) {
        next.delete(lot)
      } else {
        next.add(lot)
      }
      return next
    })
  }, [])

  const toggleLineDetail = useCallback((lineId: string) => {
    setExpandedLine((prev) => (prev === lineId ? null : lineId))
  }, [])

  function getConfidence(line: DpgfLine): PricingConfidence | null {
    const detail = line.source_detail
    if (!detail) return null
    if (typeof detail === "object" && "confidence" in detail) {
      return (detail as { confidence: PricingConfidence }).confidence
    }
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Détail par poste</h2>
        <Button
          size="sm"
          className="bg-[#e67e22] text-white hover:bg-[#d35400]"
          onClick={onTriggerPricing}
          disabled={isPricing}
        >
          {isPricing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Calculator className="size-4" />
          )}
          Chiffrer tout
        </Button>
      </div>

      <div className="rounded-lg border overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
            <TableRow>
              <TableHead className="w-8" />
              <TableHead className="min-w-[200px]">Désignation</TableHead>
              <TableHead className="text-center">Unité</TableHead>
              <TableHead className="text-right">Qté</TableHead>
              <TableHead className="text-right">PU Matériau</TableHead>
              <TableHead className="text-right">PU MO</TableHead>
              <TableHead className="text-right">Coût réel</TableHead>
              <TableHead className="text-right">Marge %</TableHead>
              <TableHead className="text-right">PV HT</TableHead>
              <TableHead className="text-right">Total HT</TableHead>
              <TableHead className="text-center">Confiance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from(lotGroups.entries()).map(([lot, lotLines]) => {
              const isCollapsed = collapsedLots.has(lot)
              const lotSubtotal = lotLines.reduce(
                (sum, line) => sum + (line.total_price_sale ?? 0),
                0
              )

              return (
                <LotGroup
                  key={lot}
                  lot={lot}
                  lotLines={lotLines}
                  isCollapsed={isCollapsed}
                  lotSubtotal={lotSubtotal}
                  expandedLine={expandedLine}
                  editingCell={editingCell}
                  onToggleLot={toggleLot}
                  onToggleLineDetail={toggleLineDetail}
                  onStartEdit={handleStartEdit}
                  onSave={handleSave}
                  getConfidence={getConfidence}
                />
              )
            })}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-[#1e3a5f]/5">
              <TableCell colSpan={9} className="text-right font-bold text-[#1e3a5f]">
                Total général HT
              </TableCell>
              <TableCell className="text-right font-bold text-[#1e3a5f] text-base">
                {formatEuro(grandTotal)}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  )
}

function LotGroup({
  lot,
  lotLines,
  isCollapsed,
  lotSubtotal,
  expandedLine,
  editingCell,
  onToggleLot,
  onToggleLineDetail,
  onStartEdit,
  onSave,
  getConfidence,
}: {
  lot: string
  lotLines: DpgfLine[]
  isCollapsed: boolean
  lotSubtotal: number
  expandedLine: string | null
  editingCell: EditingCell
  onToggleLot: (lot: string) => void
  onToggleLineDetail: (lineId: string) => void
  onStartEdit: (lineId: string, field: NonNullable<EditingCell>["field"]) => void
  onSave: (lineId: string, field: NonNullable<EditingCell>["field"], value: string) => void
  getConfidence: (line: DpgfLine) => PricingConfidence | null
}) {
  return (
    <>
      {/* Lot header row */}
      <TableRow
        className="cursor-pointer bg-[#1e3a5f]/5 hover:bg-[#1e3a5f]/10"
        onClick={() => onToggleLot(lot)}
      >
        <TableCell>
          {isCollapsed ? (
            <ChevronRight className="size-4 text-[#1e3a5f]" />
          ) : (
            <ChevronDown className="size-4 text-[#1e3a5f]" />
          )}
        </TableCell>
        <TableCell colSpan={8} className="font-semibold text-[#1e3a5f]">
          {lot}
        </TableCell>
        <TableCell className="text-right font-semibold text-[#1e3a5f]">
          {formatEuro(lotSubtotal)}
        </TableCell>
        <TableCell />
      </TableRow>

      {/* Line rows */}
      {!isCollapsed &&
        lotLines.map((line, index) => {
          const confidence = getConfidence(line)
          const isExpanded = expandedLine === line.id

          return (
            <LineRows
              key={line.id}
              line={line}
              confidence={confidence}
              isExpanded={isExpanded}
              editingCell={editingCell}
              onToggleLineDetail={onToggleLineDetail}
              onStartEdit={onStartEdit}
              onSave={onSave}
              isEven={index % 2 === 1}
            />
          )
        })}
    </>
  )
}

function LineRows({
  line,
  confidence,
  isExpanded,
  editingCell,
  onToggleLineDetail,
  onStartEdit,
  onSave,
  isEven,
}: {
  line: DpgfLine
  confidence: PricingConfidence | null
  isExpanded: boolean
  editingCell: EditingCell
  onToggleLineDetail: (lineId: string) => void
  onStartEdit: (lineId: string, field: NonNullable<EditingCell>["field"]) => void
  onSave: (lineId: string, field: NonNullable<EditingCell>["field"], value: string) => void
  isEven: boolean
}) {
  return (
    <>
      <TableRow
        className={cn(
          "cursor-pointer hover:bg-blue-50/50 transition-colors",
          isExpanded && "bg-blue-50/30",
          isEven && !isExpanded && "bg-slate-50/50"
        )}
        onClick={() => onToggleLineDetail(line.id)}
      >
        <TableCell>
          {isExpanded ? (
            <ChevronDown className="size-3 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-3 text-muted-foreground" />
          )}
        </TableCell>
        <TableCell className="max-w-[300px] truncate">
          {line.designation}
        </TableCell>
        <TableCell className="text-center text-muted-foreground">
          {line.unit ?? "—"}
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <EditableCell
            value={line.quantity}
            lineId={line.id}
            field="quantity"
            editingCell={editingCell}
            onStartEdit={onStartEdit}
            onSave={onSave}
          />
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <EditableCell
            value={line.unit_cost_material}
            lineId={line.id}
            field="unit_cost_material"
            editingCell={editingCell}
            onStartEdit={onStartEdit}
            onSave={onSave}
            isCurrency
          />
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <EditableCell
            value={line.unit_cost_labor}
            lineId={line.id}
            field="unit_cost_labor"
            editingCell={editingCell}
            onStartEdit={onStartEdit}
            onSave={onSave}
            isCurrency
          />
        </TableCell>
        <TableCell className="text-right text-muted-foreground">
          {formatEuro(line.total_cost)}
        </TableCell>
        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
          <EditableCell
            value={line.margin_pct}
            lineId={line.id}
            field="margin_pct"
            editingCell={editingCell}
            onStartEdit={onStartEdit}
            onSave={onSave}
          />
        </TableCell>
        <TableCell className="text-right">
          {formatEuro(line.unit_price_sale)}
        </TableCell>
        <TableCell className="text-right font-medium">
          {formatEuro(line.total_price_sale)}
        </TableCell>
        <TableCell className="text-center">
          {confidence && <ConfidenceBadge confidence={confidence} />}
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow>
          <TableCell colSpan={11} className="bg-muted/10 p-0">
            <DpgfLineDetail line={line} />
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
