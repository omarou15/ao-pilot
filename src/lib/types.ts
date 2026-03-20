// AO Pilot — TypeScript types matching supabase/migrations/001_initial_schema.sql

// ─── Enum / Union Types ─────────────────────────────────────────────

export type ProjectStatus = 'draft' | 'processing' | 'review' | 'validated' | 'submitted'
export type FileType = 'cctp' | 'dpgf' | 'rc' | 'plan' | 'other'
export type UserRole = 'admin' | 'user'
export type ReminderType = 'deadline' | 'review'
export type PricingConfidence = 'high' | 'medium' | 'low'

// ─── API Response Wrapper ───────────────────────────────────────────

export type ApiResponse<T> = {
  data: T | null
  error: string | null
}

// ─── Database Table Interfaces (snake_case matching SQL columns) ────

export interface Company {
  id: string
  name: string
  siret: string | null
  address: string | null
  logo_url: string | null
  default_margin: number
  created_at: string
}

export interface User {
  id: string
  clerk_id: string
  email: string
  name: string
  role: UserRole
  company_id: string | null
  created_at: string
}

export interface Project {
  id: string
  company_id: string
  created_by: string | null
  name: string
  reference: string | null
  status: ProjectStatus
  deadline: string | null
  source: 'public' | 'private'
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ProjectFile {
  id: string
  project_id: string
  file_type: FileType
  file_name: string
  storage_path: string
  mime_type: string | null
  parsed_content: Record<string, unknown> | null
  created_at: string
}

export interface DpgfLine {
  id: string
  project_id: string
  lot: string | null
  sub_lot: string | null
  designation: string
  unit: string | null
  quantity: number | null
  unit_cost_material: number | null
  unit_cost_labor: number | null
  labor_hours: number | null
  total_cost: number | null
  margin_pct: number
  unit_price_sale: number | null
  total_price_sale: number | null
  source_detail: Record<string, unknown>
  is_validated: boolean
  sort_order: number
  created_at: string
}

export interface MemoireSection {
  id: string
  project_id: string
  section_order: number
  title: string
  content: string | null
  is_validated: boolean
  created_at: string
}

export interface AdminDoc {
  id: string
  project_id: string
  doc_type: string
  doc_name: string
  storage_path: string | null
  is_generated: boolean
  is_validated: boolean
  created_at: string
}

export interface AuditLogEntry {
  id: string
  company_id: string
  user_id: string | null
  project_id: string | null
  action: string
  details: Record<string, unknown>
  created_at: string
}

export interface Reminder {
  id: string
  project_id: string
  reminder_date: string
  reminder_type: ReminderType
  sent_at: string | null
  created_at: string
}

// ─── Pricing Detail (used in DPGF source_detail) ───────────────────

export interface PricingDetail {
  materialName: string
  materialUnitPrice: number
  materialQuantity: number
  materialTotal: number
  laborCategory: string
  laborHourlyRate: number
  laborHours: number
  laborTotal: number
  totalCost: number
  marginPct: number
  salePrice: number
  confidence: PricingConfidence
  source: string // 'reference_table' | 'ai_estimate' | 'manual'
}
