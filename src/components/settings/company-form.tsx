"use client"

import { useState, type FormEvent } from "react"
import type { Company } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CompanyFormProps {
  company: Company
  onSave: (updates: Partial<Company>) => Promise<boolean>
  isSaving: boolean
}

export function CompanyForm({ company, onSave, isSaving }: CompanyFormProps) {
  const [name, setName] = useState(company.name)
  const [siret, setSiret] = useState(company.siret ?? "")
  const [address, setAddress] = useState(company.address ?? "")
  const [siretError, setSiretError] = useState<string | null>(null)

  function handleSiretChange(value: string) {
    const cleaned = value.replace(/\D/g, "")
    setSiret(cleaned)
    if (cleaned.length > 0 && cleaned.length !== 14) {
      setSiretError("Le SIRET doit contenir exactement 14 chiffres")
    } else {
      setSiretError(null)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (siret.length > 0 && siret.length !== 14) {
      setSiretError("Le SIRET doit contenir exactement 14 chiffres")
      return
    }

    await onSave({
      name,
      siret: siret || null,
      address: address || null,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de l&apos;entreprise</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nom de l&apos;entreprise *</Label>
            <Input
              id="company-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Nom de votre entreprise"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-siret">SIRET</Label>
            <Input
              id="company-siret"
              value={siret}
              onChange={(e) => handleSiretChange(e.target.value)}
              placeholder="14 chiffres"
              maxLength={14}
              pattern="\d{14}"
            />
            {siretError && (
              <p className="text-sm text-destructive">{siretError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-address">Adresse</Label>
            <Textarea
              id="company-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Adresse de l'entreprise"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company-logo">Logo</Label>
            <Input
              id="company-logo"
              disabled
              placeholder="Upload logo — à venir"
            />
            <p className="text-xs text-muted-foreground">
              La fonctionnalité d&apos;upload de logo sera disponible prochainement.
            </p>
          </div>

          <Button type="submit" disabled={isSaving || !name.trim()}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
