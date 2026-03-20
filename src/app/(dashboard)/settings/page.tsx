"use client"

import { useCompany } from "@/lib/hooks/use-company"
import { CompanyForm } from "@/components/settings/company-form"
import { MarginConfig } from "@/components/settings/margin-config"
import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPage() {
  const { company, isLoading, updateCompany, isSaving, error } = useCompany()

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <h1 className="text-2xl font-bold">Paramètres de l&apos;entreprise</h1>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-64" />
        </div>
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Paramètres de l&apos;entreprise</h1>
        <p className="mt-4 text-destructive">
          {error ?? "Impossible de charger les paramètres de l'entreprise."}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Paramètres de l&apos;entreprise</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <CompanyForm
          company={company}
          onSave={updateCompany}
          isSaving={isSaving}
        />
        <MarginConfig
          defaultMargin={company.default_margin}
          onSave={(margin) => updateCompany({ default_margin: margin })}
          isSaving={isSaving}
        />
      </div>
    </div>
  )
}
