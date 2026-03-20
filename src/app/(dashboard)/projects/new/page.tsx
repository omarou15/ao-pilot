"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { FileDropzone } from "@/components/upload/file-dropzone"
import { FileList } from "@/components/upload/file-list"
import { UploadProgress } from "@/components/upload/upload-progress"
import { useUpload } from "@/lib/hooks/use-upload"
import type { ApiResponse, Project } from "@/lib/types"

type ProjectSource = "public" | "private"

export default function NewProjectPage() {
  const router = useRouter()

  // Step management
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 form state
  const [name, setName] = useState("")
  const [reference, setReference] = useState("")
  const [source, setSource] = useState<ProjectSource>("public")

  // Step 2 upload state
  const [projectId, setProjectId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { files, addFiles, removeFile, uploadAll, isUploading } = useUpload(projectId)

  const canProceedStep1 = name.trim().length > 0
  const hasPendingFiles = files.some((f) => f.status === "pending")
  const isWorking = isCreating || isUploading

  async function handleSubmit() {
    setError(null)
    setIsCreating(true)

    try {
      // 1. Create project
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          reference: reference.trim() || null,
          source,
        }),
      })

      const body: ApiResponse<Project> = await res.json()

      if (!res.ok || !body.data) {
        throw new Error(body.error ?? "Erreur lors de la création du projet")
      }

      const createdId = body.data.id
      setProjectId(createdId)

      // 2. Upload files if any
      if (files.length > 0) {
        // uploadAll uses projectId from state, but we just set it.
        // We need to call uploadAll after state update, so we pass it directly.
        await uploadFilesWithId(createdId)
      }

      // 3. Redirect
      router.push(`/projects/${createdId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue"
      setError(message)
    } finally {
      setIsCreating(false)
    }
  }

  async function uploadFilesWithId(id: string) {
    const pendingFiles = files.filter((f) => f.status === "pending")
    for (const uploadFile of pendingFiles) {
      const formData = new FormData()
      formData.append("file", uploadFile.file)

      await fetch(`/api/projects/${id}/upload`, {
        method: "POST",
        body: formData,
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* Step indicator */}
      <div className="flex items-center gap-3">
        <StepBadge number={1} active={step === 1} completed={step === 2} />
        <div className="h-px flex-1 bg-border" />
        <StepBadge number={2} active={step === 2} completed={false} />
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Nouveau projet</CardTitle>
            <CardDescription>
              Renseignez les informations de votre appel d&apos;offres
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              {/* Nom du projet */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="project-name" className="text-sm font-medium">
                  Nom du projet <span className="text-destructive">*</span>
                </label>
                <Input
                  id="project-name"
                  placeholder="Ex : Construction école Jean Moulin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Référence */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="project-ref" className="text-sm font-medium">
                  R&eacute;f&eacute;rence
                </label>
                <Input
                  id="project-ref"
                  placeholder="Ex : AO-2026-042"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              {/* Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Type de march&eacute;</label>
                <Select value={source} onValueChange={(val) => setSource(val as ProjectSource)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">March&eacute; public</SelectItem>
                    <SelectItem value="private">March&eacute; priv&eacute;</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end pt-2">
                <Button onClick={() => setStep(2)} disabled={!canProceedStep1} size="lg">
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Documents DCE</CardTitle>
            <CardDescription>
              Ajoutez les fichiers du Dossier de Consultation des Entreprises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <FileDropzone onFilesAdded={addFiles} disabled={isWorking} />
              <FileList files={files} onRemove={removeFile} />

              {isUploading && <UploadProgress files={files} />}

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={isWorking}
                >
                  Retour
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isWorking || (!hasPendingFiles && files.length === 0)}
                  size="lg"
                >
                  {isCreating
                    ? "Cr\u00e9ation en cours..."
                    : isUploading
                      ? "Upload en cours..."
                      : "Cr\u00e9er le projet et uploader"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StepBadge({
  number,
  active,
  completed,
}: {
  number: number
  active: boolean
  completed: boolean
}) {
  return (
    <div
      className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
        active
          ? "bg-primary text-primary-foreground"
          : completed
            ? "bg-primary/20 text-primary"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {completed ? "\u2713" : number}
    </div>
  )
}
