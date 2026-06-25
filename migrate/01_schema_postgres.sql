-- ============================================================
-- CRM Leads Tracker DCSS — PostgreSQL Schema
-- Converted from SQLite3
-- Jalankan sebagai: psql -U crm_user -d crm_leads -f 01_schema_postgres.sql
-- ============================================================

-- ── Roles ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roles (
    id          SERIAL PRIMARY KEY,
    nama        TEXT UNIQUE NOT NULL,
    deskripsi   TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Role Menus (RBAC) ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS role_menus (
    role_id     INTEGER NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    menu_key    TEXT NOT NULL,
    PRIMARY KEY (role_id, menu_key)
);

-- ── Users ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    nama        TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    password    TEXT NOT NULL,
    role        TEXT DEFAULT 'sales',
    role_id     INTEGER REFERENCES roles(id),
    is_active   INTEGER DEFAULT 1,
    created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Leads (Pipeline CRM) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    id              SERIAL PRIMARY KEY,
    lead_id         TEXT UNIQUE NOT NULL,
    nama_company    TEXT NOT NULL,
    product         TEXT,
    contact_person  TEXT,
    segmen          TEXT,
    sub_segmen      TEXT,
    source          TEXT,
    stage           TEXT DEFAULT 'New',
    prioritas       TEXT DEFAULT 'Warm',
    tgl_masuk       DATE,
    propose_value   NUMERIC DEFAULT 0,
    deal_value      NUMERIC DEFAULT 0,
    probability     NUMERIC DEFAULT 0,
    exp_close_date  DATE,
    weighted_value  NUMERIC DEFAULT 0,
    sales_owner     TEXT,
    next_fu_date    DATE,
    last_fu_date    DATE,
    last_fu_notes   TEXT,
    fu_count        INTEGER DEFAULT 0,
    days_in_stage   INTEGER DEFAULT 0,
    remarks         TEXT,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ── Follow-Up Log ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS follow_up_log (
    id              SERIAL PRIMARY KEY,
    fu_id           TEXT UNIQUE NOT NULL,
    lead_id         TEXT NOT NULL REFERENCES leads(lead_id),
    tgl_fu          DATE NOT NULL,
    nama_company    TEXT,
    sales_owner     TEXT,
    metode_fu       TEXT,
    kontak          TEXT,
    hasil_fu        TEXT,
    catatan_fu      TEXT,
    stage_saat_fu   TEXT,
    next_action     TEXT,
    tgl_fu_berikut  DATE,
    status          TEXT DEFAULT 'Done',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Contacts ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contacts (
    id                  SERIAL PRIMARY KEY,
    lead_id             TEXT NOT NULL REFERENCES leads(lead_id),
    nama_company        TEXT,
    nama_contact        TEXT NOT NULL,
    jabatan             TEXT,
    dept                TEXT,
    role                TEXT,
    no_hp               TEXT,
    email               TEXT,
    telepon             TEXT,
    linkedin            TEXT,
    preferensi_kontak   TEXT,
    catatan             TEXT
);

-- ── Win / Loss ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS win_loss (
    id              SERIAL PRIMARY KEY,
    lead_id         TEXT NOT NULL REFERENCES leads(lead_id),
    nama_company    TEXT,
    segmen          TEXT,
    hasil           TEXT,
    deal_value      NUMERIC,
    tgl_masuk       DATE,
    tgl_close       DATE,
    sales_cycle     INTEGER,
    sales_owner     TEXT,
    alasan          TEXT,
    kompetitor      TEXT,
    lesson_learned  TEXT
);

-- ── Revenue Projects ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue_projects (
    id              SERIAL PRIMARY KEY,
    project_id      TEXT UNIQUE NOT NULL,
    lob             TEXT DEFAULT 'DCSS',
    owner           TEXT,
    product         TEXT,
    client          TEXT,
    kategori        TEXT,
    type            TEXT,
    target_month    TEXT,
    revenue_target  NUMERIC DEFAULT 0,
    actual_revenue  NUMERIC DEFAULT 0,
    achievement_pct NUMERIC GENERATED ALWAYS AS (
        CASE WHEN revenue_target > 0
             THEN ROUND((actual_revenue * 1.0 / revenue_target)::NUMERIC, 4)
             ELSE 0
        END
    ) STORED,
    status          TEXT DEFAULT 'Critical',
    invoice_date    DATE,
    payment_date    DATE,
    notes           TEXT,
    risk_level      TEXT DEFAULT 'HIGH',
    action_required TEXT,
    pic             TEXT,
    is_active       INTEGER DEFAULT 1,
    tahun           INTEGER DEFAULT 2026,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ── Revenue Monthly Breakdown ─────────────────────────────────
CREATE TABLE IF NOT EXISTS revenue_monthly (
    id          SERIAL PRIMARY KEY,
    project_id  TEXT NOT NULL REFERENCES revenue_projects(project_id),
    month_num   INTEGER NOT NULL,
    month_name  TEXT,
    target      NUMERIC DEFAULT 0,
    actual      NUMERIC DEFAULT 0,
    status      TEXT DEFAULT 'Pending',
    UNIQUE (project_id, month_num)
);

-- ── Invoices & Payment ────────────────────────────────────────
-- Catatan: status dihitung otomatis via PostgreSQL GENERATED ALWAYS
CREATE TABLE IF NOT EXISTS invoices (
    id              SERIAL PRIMARY KEY,
    project_id      TEXT,
    lob             TEXT DEFAULT 'DCSS',
    owner           TEXT,
    product         TEXT,
    client          TEXT,
    invoice_no      TEXT,
    invoice_date    DATE,
    period          TEXT,
    invoice_amount  NUMERIC DEFAULT 0,
    paid_amount     NUMERIC DEFAULT 0,
    paid_date       DATE,
    notes           TEXT,
    status          TEXT GENERATED ALWAYS AS (
        CASE
            WHEN paid_amount >= invoice_amount AND invoice_amount > 0 THEN 'Lunas'
            WHEN paid_date IS NULL THEN 'Belum Dibayar'
            ELSE 'Partial'
        END
    ) STORED,
    tahun           INTEGER DEFAULT 2026,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ── KPI Prospecting ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS kpi_prospecting (
    id              SERIAL PRIMARY KEY,
    kpi_category    TEXT,
    kpi_name        TEXT,
    unit            TEXT DEFAULT 'Count',
    target_annual   NUMERIC DEFAULT 0,
    q1_target       NUMERIC DEFAULT 0,
    q1_actual       NUMERIC DEFAULT 0,
    q2_target       NUMERIC DEFAULT 0,
    q2_actual       NUMERIC DEFAULT 0,
    q3_target       NUMERIC DEFAULT 0,
    q3_actual       NUMERIC DEFAULT 0,
    q4_target       NUMERIC DEFAULT 0,
    q4_actual       NUMERIC DEFAULT 0,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Budget Monitoring ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budget_items (
    id              SERIAL PRIMARY KEY,
    perspektif_bsc  TEXT,
    category        TEXT,
    sub_category    TEXT,
    budget_amount   NUMERIC DEFAULT 0,
    actual_amount   NUMERIC DEFAULT 0,
    month_num       INTEGER DEFAULT 0,
    notes           TEXT,
    status          TEXT DEFAULT 'Planning',
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Index untuk performa query ────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_stage        ON leads(stage);
CREATE INDEX IF NOT EXISTS idx_leads_sales_owner  ON leads(sales_owner);
CREATE INDEX IF NOT EXISTS idx_leads_next_fu_date ON leads(next_fu_date);
CREATE INDEX IF NOT EXISTS idx_fu_log_lead_id     ON follow_up_log(lead_id);
CREATE INDEX IF NOT EXISTS idx_fu_log_tgl_fu      ON follow_up_log(tgl_fu);
CREATE INDEX IF NOT EXISTS idx_invoices_project   ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_tahun     ON invoices(tahun);
CREATE INDEX IF NOT EXISTS idx_rev_monthly_proj   ON revenue_monthly(project_id);
