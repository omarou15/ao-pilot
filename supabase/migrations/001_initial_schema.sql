-- AO Pilot - Schema initial
-- Tables principales pour la gestion des appels d'offres BTP

-- Companies (multi-tenant)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  siret TEXT,
  address TEXT,
  logo_url TEXT,
  default_margin NUMERIC(5,2) DEFAULT 30.00,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Projects (1 project = 1 appel d'offres)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES users(id),
  name TEXT NOT NULL,
  reference TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'review', 'validated', 'submitted')),
  deadline TIMESTAMPTZ,
  source TEXT DEFAULT 'public' CHECK (source IN ('public', 'private')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Project files (fichiers du DCE uploadés)
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL CHECK (file_type IN ('cctp', 'dpgf', 'rc', 'plan', 'other')),
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  parsed_content JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- DPGF lines (coeur du chiffrage)
CREATE TABLE dpgf_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  lot TEXT,
  sub_lot TEXT,
  designation TEXT NOT NULL,
  unit TEXT,
  quantity NUMERIC(12,3),
  unit_cost_material NUMERIC(12,2),
  unit_cost_labor NUMERIC(12,2),
  labor_hours NUMERIC(8,2),
  total_cost NUMERIC(14,2),
  margin_pct NUMERIC(5,2) DEFAULT 30.00,
  unit_price_sale NUMERIC(12,2),
  total_price_sale NUMERIC(14,2),
  source_detail JSONB DEFAULT '{}',
  is_validated BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Memoire technique sections
CREATE TABLE memoire_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Documents administratifs
CREATE TABLE admin_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  doc_name TEXT NOT NULL,
  storage_path TEXT,
  is_generated BOOLEAN DEFAULT false,
  is_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Reminders
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  reminder_date TIMESTAMPTZ NOT NULL,
  reminder_type TEXT NOT NULL DEFAULT 'deadline' CHECK (reminder_type IN ('deadline', 'review')),
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_deadline ON projects(deadline);
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_dpgf_lines_project_id ON dpgf_lines(project_id);
CREATE INDEX idx_memoire_sections_project_id ON memoire_sections(project_id);
CREATE INDEX idx_admin_docs_project_id ON admin_docs(project_id);
CREATE INDEX idx_audit_log_company_id ON audit_log(company_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX idx_reminders_project_id ON reminders(project_id);
CREATE INDEX idx_reminders_date ON reminders(reminder_date);

-- RLS (Row Level Security) - activé sur toutes les tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE dpgf_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE memoire_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Policies RLS basiques (filtre par company_id via le user connecté)
-- Note: ces policies seront affinées avec Clerk JWT claims

-- Service role bypass pour les API routes
CREATE POLICY "Service role full access" ON companies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON project_files FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON dpgf_lines FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON memoire_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON admin_docs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON audit_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reminders FOR ALL USING (true) WITH CHECK (true);
