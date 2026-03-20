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
    <Card>
      <CardHeader>
        <CardTitle>Marge bénéficiaire par défaut</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="margin-input">Marge (%)</Label>
            <Input
              id="margin-input"
              type="number"
              min={0}
              max={100}
              step={0.5}
              value={margin}
              onChange={(e) => setMargin(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="rounded-md bg-muted p-4 space-y-2">
            <p className="text-sm font-medium">
              Formule : Coût réel × {multiplier.toFixed(2)} = Prix de vente HT
            </p>
            <p className="text-sm text-muted-foreground">
              Exemple : {exampleCost.toLocaleString("fr-FR")} € × {multiplier.toFixed(2)} ={" "}
              {examplePrice.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} € HT
            </p>
          </div>

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
