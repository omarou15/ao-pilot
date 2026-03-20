"use client"

import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MarginConfigProps {
  defaultMargin: number
  onSave: (margin: number) => void
  isSaving: boolean
}

export function MarginConfig({ defaultMargin, onSave, isSaving }: MarginConfigProps) {
  const [margin, setMargin] = useState(defaultMargin)

  const multiplier = 1 + margin / 100
  const exampleCost = 1000
  const examplePrice = exampleCost * multiplier

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave(margin)
  }

  return (
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle>Marge b&eacute;n&eacute;ficiaire par d&eacute;faut</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="margin-input">Marge (%)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="margin-input"
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={margin}
                onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                className="w-28"
              />
              <input
                type="range"
                min={0}
                max={100}
                step={0.5}
                value={margin}
                onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
                className="flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-[#e67e22]"
                aria-label="Marge en pourcentage"
              />
              <span className="text-sm font-semibold text-[#e67e22] w-14 text-right">
                {margin.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Visual formula */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 space-y-3">
            <p className="text-sm font-semibold text-slate-700">Formule de calcul</p>
            <div className="flex items-center justify-center gap-2 flex-wrap text-base">
              <span className="inline-flex items-center rounded-lg bg-slate-200 px-3 py-1.5 font-semibold text-slate-700">
                Co&ucirc;t r&eacute;el
              </span>
              <span className="text-slate-400 font-bold text-lg">&times;</span>
              <span className="inline-flex items-center rounded-lg bg-[#1e3a5f] px-3 py-1.5 font-bold text-white">
                {multiplier.toFixed(2)}
              </span>
              <span className="text-slate-400 font-bold text-lg">=</span>
              <span className="inline-flex items-center rounded-lg bg-[#27ae60] px-3 py-1.5 font-bold text-white">
                Prix de vente HT
              </span>
            </div>

            {/* Animated example */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-sm mt-2">
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 font-medium text-slate-600">
                {exampleCost.toLocaleString("fr-FR")} &euro;
              </span>
              <span className="text-slate-400 font-bold">&times;</span>
              <span className="inline-flex items-center rounded-md bg-[#1e3a5f]/10 px-2.5 py-1 font-bold text-[#1e3a5f] transition-all duration-300">
                {multiplier.toFixed(2)}
              </span>
              <span className="text-slate-400 font-bold">=</span>
              <span className="inline-flex items-center rounded-md bg-[#27ae60]/10 px-2.5 py-1 font-bold text-[#27ae60] transition-all duration-300">
                {examplePrice.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} &euro; HT
              </span>
            </div>
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
