import { z } from 'zod'
import type { FileType } from './types'

// ─── Project Creation ───────────────────────────────────────────────

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Le nom du projet est requis'),
  reference: z.string().optional(),
  source: z.enum(['public', 'private']).optional(),
  deadline: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

// ─── File Upload ────────────────────────────────────────────────────

const fileTypeValues = ['cctp', 'dpgf', 'rc', 'plan', 'other'] as const satisfies readonly FileType[]

export const uploadFileSchema = z.object({
  projectId: z.string().uuid('ID de projet invalide'),
  fileType: z.enum(fileTypeValues),
})

export type UploadFileInput = z.infer<typeof uploadFileSchema>

// ─── DPGF Line Update ──────────────────────────────────────────────

export const updateDpgfLineSchema = z.object({
  quantity: z.number().nonnegative().optional(),
  unit_cost_material: z.number().nonnegative().optional(),
  unit_cost_labor: z.number().nonnegative().optional(),
  labor_hours: z.number().nonnegative().optional(),
  margin_pct: z.number().min(0).max(100).optional(),
})

export type UpdateDpgfLineInput = z.infer<typeof updateDpgfLineSchema>

// ─── Memoire Section Update ─────────────────────────────────────────

export const updateMemoireSectionSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
})

export type UpdateMemoireSectionInput = z.infer<typeof updateMemoireSectionSchema>

// ─── Company Settings ───────────────────────────────────────────────

export const companySettingsSchema = z.object({
  name: z.string().min(1, 'Le nom de l\'entreprise est requis'),
  siret: z.string().length(14, 'Le SIRET doit contenir 14 chiffres').optional(),
  address: z.string().optional(),
  default_margin: z.number().min(0).max(100).optional(),
})

export type CompanySettingsInput = z.infer<typeof companySettingsSchema>
