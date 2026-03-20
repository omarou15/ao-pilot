"use client"

import { useState, type FormEvent } from "react"
import type { Company } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Camera } from "lucide-react"

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
    <Card className="shadow-md rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#1e3a5f]" />
          Informations de l&apos;entreprise
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Logo area */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center shrink-0">
              <Camera className="w-6 h-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">Logo de l&apos;entreprise</p>
              <p className="text-xs text-muted-foreground">
                La fonctionnalit&eacute; d&apos;upload de logo sera disponible prochainement.
              </p>
            </div>
          </div>

          <div className="space-y-4">
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
          </div>

          <Button type="submit" disabled={isSaving || !name.trim()}>
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
