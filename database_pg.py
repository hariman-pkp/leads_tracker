"""
database_pg.py
==============
Modul koneksi database PostgreSQL — menggantikan database.py (SQLite).

Perubahan utama dari SQLite:
  - sqlite3.connect()      → psycopg2.connect()
  - sqlite3.Row factory    → RealDictCursor (akses kolom by name)
  - PRAGMA WAL/FK          → dikonfigurasi di PostgreSQL level DB
  - ?  placeholder         → %s  placeholder
  - INSERT OR IGNORE       → INSERT ... ON CONFLICT DO NOTHING
  - julianday()            → CURRENT_DATE - col  (integer hari)
  - datetime('now',...)    → NOW()
"""

import psycopg2
import psycopg2.extras
import os
import hashlib

# ── Konfigurasi Koneksi ───────────────────────────────────────────────────────
# Bisa juga pakai environment variable untuk keamanan:
#   export CRM_DB_HOST=localhost
#   export CRM_DB_NAME=crm_leads
#   export CRM_DB_USER=crm_user
#   export CRM_DB_PASS=crm_password_2026

PG_CONFIG = {
    'host':     os.getenv('CRM_DB_HOST', 'localhost'),
    'port':     int(os.getenv('CRM_DB_PORT', '5432')),
    'dbname':   os.getenv('CRM_DB_NAME', 'crm_leads'),
    'user':     os.getenv('CRM_DB_USER', 'crm_user'),
    'password': os.getenv('CRM_DB_PASS', 'crm_password_2026'),
}

# ── Semua menu yang ada di aplikasi ──────────────────────────────────────────
ALL_MENUS = [
    # Aktivitas
    {"key": "today",           "label": "Hari Ini",            "url": "/today",            "icon": "fa-bolt",           "group": "Aktivitas"},
    {"key": "schedule",        "label": "FU Schedule",          "url": "/schedule",         "icon": "fa-calendar-check", "group": "Aktivitas"},
    {"key": "followup",        "label": "Follow-Up Log",        "url": "/followup",         "icon": "fa-phone-alt",      "group": "Aktivitas"},
    {"key": "field_activity",  "label": "Field Activity",       "url": "/field-activity",   "icon": "fa-map-marker-alt", "group": "Aktivitas"},
    {"key": "daily_report",    "label": "Laporan Harian",       "url": "/daily-report",     "icon": "fa-clipboard-list", "group": "Aktivitas"},
    # Pipeline CRM
    {"key": "dashboard",    "label": "Dashboard",            "url": "/",                "icon": "fa-tachometer-alt", "group": "Pipeline CRM"},
    {"key": "pipeline",     "label": "Pipeline",             "url": "/pipeline",        "icon": "fa-funnel-dollar",  "group": "Pipeline CRM"},
    {"key": "contacts",     "label": "Contacts",             "url": "/contacts",        "icon": "fa-address-book",   "group": "Pipeline CRM"},
    {"key": "winloss",      "label": "Win / Loss",           "url": "/winloss",         "icon": "fa-trophy",         "group": "Pipeline CRM"},
    {"key": "insights",     "label": "Pipeline Insights",    "url": "/insights",        "icon": "fa-lightbulb",      "group": "Pipeline CRM"},
    {"key": "forecast",     "label": "Pipeline Forecast",    "url": "/forecast",        "icon": "fa-chart-line",     "group": "Pipeline CRM"},
    {"key": "heatmap",      "label": "Activity Heatmap",     "url": "/heatmap",         "icon": "fa-fire",           "group": "Pipeline CRM"},
    {"key": "sales_target", "label": "Target Sales",         "url": "/sales-target",    "icon": "fa-bullseye",       "group": "Pipeline CRM"},
    {"key": "export",       "label": "Export Data",          "url": "/export",          "icon": "fa-file-excel",     "group": "Pipeline CRM"},
    {"key": "import",       "label": "Import Excel",         "url": "/import",          "icon": "fa-file-upload",    "group": "Pipeline CRM"},
    # Revenue LOB
    {"key": "rev_dashboard","label": "Revenue Dashboard",    "url": "/revenue",         "icon": "fa-chart-bar",      "group": "Revenue LOB"},
    {"key": "rev_insights", "label": "Revenue Insights",     "url": "/revenue/insights","icon": "fa-lightbulb",      "group": "Revenue LOB"},
    {"key": "rev_tracker",  "label": "Revenue Tracker",      "url": "/revenue/tracker", "icon": "fa-tasks",          "group": "Revenue LOB"},
    {"key": "rev_monthly",  "label": "Monthly Monitoring",   "url": "/revenue/monthly", "icon": "fa-calendar-alt",   "group": "Revenue LOB"},
    {"key": "rev_proj_view","label": "Project View",          "url": "/revenue/project-view","icon": "fa-table-cells",  "group": "Revenue LOB"},
    {"key": "rev_invoice",  "label": "Invoice & Payment",    "url": "/revenue/invoice", "icon": "fa-file-invoice",   "group": "Revenue LOB"},
    {"key": "rev_kpi",      "label": "KPI Prospecting",      "url": "/revenue/kpi",     "icon": "fa-bullseye",       "group": "Revenue LOB"},
    {"key": "rev_budget",        "label": "Budget Monitoring", "url": "/revenue/budget",         "icon": "fa-wallet",           "group": "Revenue LOB"},
    {"key": "rev_annual_target", "label": "Annual Target",    "url": "/revenue/annual-target",  "icon": "fa-flag-checkered",   "group": "Revenue LOB"},
    # Entertain
    {"key": "entertain",          "label": "Dashboard Entertain", "url": "/entertain",          "icon": "fa-utensils",       "group": "Entertain"},
    {"key": "entertain_claims",   "label": "Klaim Saya",          "url": "/entertain/claims",   "icon": "fa-receipt",        "group": "Entertain"},
    {"key": "entertain_approval", "label": "Approval Klaim",      "url": "/entertain/approval", "icon": "fa-check-circle",   "group": "Entertain"},
    # Master Data
    {"key": "sales",        "label": "Master Sales",         "url": "/sales",           "icon": "fa-users",          "group": "Master Data"},
    {"key": "roles",        "label": "Role & Menu",          "url": "/roles",           "icon": "fa-shield-alt",     "group": "Master Data"},
    {"key": "users",        "label": "Master Users",         "url": "/users",           "icon": "fa-user-cog",       "group": "Master Data"},
    {"key": "cleansing",   "label": "Data Cleansing",       "url": "/admin/cleansing", "icon": "fa-broom",          "group": "Master Data"},
]

# ── Password Hashing ──────────────────────────────────────────────────────────
def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

# ── Koneksi Database ──────────────────────────────────────────────────────────
def get_conn():
    """
    Buka koneksi PostgreSQL dan return connection dengan RealDictCursor.
    RealDictCursor memungkinkan akses kolom by name (mirip sqlite3.Row).

    Penggunaan:
        conn = get_conn()
        c = conn.cursor()
        c.execute("SELECT * FROM leads WHERE lead_id = %s", (lead_id,))
        row = c.fetchone()   # → dict {'lead_id': 'LD-001', ...}
        conn.commit()        # perlu eksplisit commit untuk INSERT/UPDATE/DELETE
        conn.close()
    """
    conn = psycopg2.connect(
        **PG_CONFIG,
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn

# ── Inisialisasi Database ─────────────────────────────────────────────────────
def init_db():
    """
    Buat tabel jika belum ada dan seed data default.
    Pada PostgreSQL, tabel dibuat via 01_schema_postgres.sql.
    Fungsi ini hanya mengisi data default (roles, users) jika kosong.
    """
    conn = get_conn()
    c = conn.cursor()

    # Seed roles jika kosong
    c.execute("SELECT COUNT(*) as cnt FROM roles")
    if c.fetchone()['cnt'] == 0:
        all_menu_keys = [m["key"] for m in ALL_MENUS]
        sales_menus   = ["today","schedule","followup","dashboard","pipeline",
                         "contacts","winloss","insights","export","rev_kpi","entertain","entertain_claims"]

        c.execute("INSERT INTO roles (nama, deskripsi) VALUES (%s,%s) RETURNING id",
                  ("Admin", "Akses penuh ke semua menu"))
        admin_id = c.fetchone()['id']

        c.execute("INSERT INTO roles (nama, deskripsi) VALUES (%s,%s) RETURNING id",
                  ("Manager", "Akses pipeline dan laporan"))
        mgr_id = c.fetchone()['id']

        c.execute("INSERT INTO roles (nama, deskripsi) VALUES (%s,%s) RETURNING id",
                  ("Sales", "Akses aktivitas dan pipeline saja"))
        sales_id = c.fetchone()['id']

        # Admin → semua menu
        c.executemany("INSERT INTO role_menus (role_id, menu_key) VALUES (%s,%s) ON CONFLICT DO NOTHING",
                      [(admin_id, k) for k in all_menu_keys])
        # Manager → revenue + pipeline (tidak master data)
        mgr_menus = ["today","schedule","followup","dashboard","pipeline","contacts",
                     "winloss","insights","forecast","heatmap","sales_target","export",
                     "rev_dashboard","rev_insights","rev_tracker","rev_monthly","rev_proj_view",
                     "rev_invoice","rev_kpi","rev_budget","rev_annual_target",
                     "entertain","entertain_claims","entertain_approval"]
        c.executemany("INSERT INTO role_menus (role_id, menu_key) VALUES (%s,%s) ON CONFLICT DO NOTHING",
                      [(mgr_id, k) for k in mgr_menus])
        # Sales → aktivitas + pipeline dasar
        c.executemany("INSERT INTO role_menus (role_id, menu_key) VALUES (%s,%s) ON CONFLICT DO NOTHING",
                      [(sales_id, k) for k in sales_menus])

    # Seed users jika kosong
    c.execute("SELECT COUNT(*) as cnt FROM users")
    if c.fetchone()['cnt'] == 0:
        c.execute("SELECT id FROM roles WHERE nama='Admin'")
        admin_id = c.fetchone()['id']
        c.execute("SELECT id FROM roles WHERE nama='Sales'")
        sales_id = c.fetchone()['id']

        users = [
            ("Hariman",      "hariman@pkp.co.id",       hash_pw("pkp2026"), admin_id),
            ("Endy",         "endy@pkp.co.id",          hash_pw("pkp2026"), admin_id),
            ("Aji",          "aji.maulana@pkp.co.id",   hash_pw("pkp2026"), sales_id),
            ("Djoni",        "djoni@pkp.co.id",         hash_pw("pkp2026"), sales_id),
            ("Hary Priyono", "hary@pkp.co.id",          hash_pw("pkp2026"), sales_id),
        ]
        c.executemany(
            "INSERT INTO users (nama, email, password, role_id) VALUES (%s,%s,%s,%s) ON CONFLICT DO NOTHING",
            users
        )

    conn.commit()
    conn.close()

# ── Helper Functions ──────────────────────────────────────────────────────────
def get_user_menus(role_id: int) -> set:
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT menu_key FROM role_menus WHERE role_id = %s", (role_id,))
    keys = {r['menu_key'] for r in c.fetchall()}
    conn.close()
    return keys

def next_lead_id() -> str:
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT lead_id FROM leads ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    conn.close()
    if row:
        num = int(row['lead_id'].replace("LD-", "")) + 1
    else:
        num = 1
    return f"LD-{num:03d}"

def next_fu_id(conn=None, inserted_id: int = None) -> str:
    """Generate fu_id dari inserted_id jika tersedia (race-condition-free)."""
    if inserted_id:
        return f"FU-{inserted_id:03d}"
    _conn = conn or get_conn()
    c = _conn.cursor()
    c.execute("SELECT fu_id FROM follow_up_log ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    if not conn:
        _conn.close()
    num = int(row['fu_id'].replace("FU-", "")) + 1 if row else 1
    return f"FU-{num:03d}"
