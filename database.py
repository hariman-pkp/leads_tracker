import sqlite3
import os
import hashlib

DB_PATH = os.path.join(os.path.dirname(__file__), "data", "leads.db")

# ── Semua menu yang ada di aplikasi ──────────────────────────────────────────
ALL_MENUS = [
    # Aktivitas
    {"key": "today",        "label": "Hari Ini",            "url": "/today",           "icon": "fa-bolt",           "group": "Aktivitas"},
    {"key": "schedule",     "label": "FU Schedule",          "url": "/schedule",        "icon": "fa-calendar-check", "group": "Aktivitas"},
    {"key": "followup",     "label": "Follow-Up Log",        "url": "/followup",        "icon": "fa-phone-alt",      "group": "Aktivitas"},
    # Pipeline CRM
    {"key": "dashboard",    "label": "Dashboard",            "url": "/",                "icon": "fa-tachometer-alt", "group": "Pipeline CRM"},
    {"key": "pipeline",     "label": "Pipeline",             "url": "/pipeline",        "icon": "fa-funnel-dollar",  "group": "Pipeline CRM"},
    {"key": "contacts",     "label": "Contacts",             "url": "/contacts",        "icon": "fa-address-book",   "group": "Pipeline CRM"},
    {"key": "winloss",      "label": "Win / Loss",           "url": "/winloss",         "icon": "fa-trophy",         "group": "Pipeline CRM"},
    {"key": "insights",     "label": "Pipeline Insights",    "url": "/insights",        "icon": "fa-lightbulb",      "group": "Pipeline CRM"},
    {"key": "export",       "label": "Export Excel",         "url": "/export",          "icon": "fa-file-excel",     "group": "Pipeline CRM"},
    # Revenue LOB
    {"key": "rev_dashboard","label": "Revenue Dashboard",    "url": "/revenue",         "icon": "fa-chart-bar",      "group": "Revenue LOB"},
    {"key": "rev_insights", "label": "Revenue Insights",     "url": "/revenue/insights","icon": "fa-lightbulb",      "group": "Revenue LOB"},
    {"key": "rev_tracker",  "label": "Revenue Tracker",      "url": "/revenue/tracker", "icon": "fa-tasks",          "group": "Revenue LOB"},
    {"key": "rev_monthly",  "label": "Monthly Monitoring",   "url": "/revenue/monthly", "icon": "fa-calendar-alt",   "group": "Revenue LOB"},
    {"key": "rev_invoice",  "label": "Invoice & Payment",    "url": "/revenue/invoice", "icon": "fa-file-invoice",   "group": "Revenue LOB"},
    {"key": "rev_kpi",      "label": "KPI Prospecting",      "url": "/revenue/kpi",     "icon": "fa-bullseye",       "group": "Revenue LOB"},
    {"key": "rev_budget",   "label": "Budget Monitoring",    "url": "/revenue/budget",  "icon": "fa-wallet",         "group": "Revenue LOB"},
    # Master Data
    {"key": "sales",        "label": "Master Sales",         "url": "/sales",           "icon": "fa-users",          "group": "Master Data"},
    {"key": "roles",        "label": "Role & Menu",          "url": "/roles",           "icon": "fa-shield-alt",     "group": "Master Data"},
    {"key": "users",        "label": "Master Users",         "url": "/users",           "icon": "fa-user-cog",       "group": "Master Data"},
]

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

def init_db():
    conn = get_conn()
    c = conn.cursor()

    c.executescript("""
    CREATE TABLE IF NOT EXISTS roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT UNIQUE NOT NULL,
        deskripsi TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS role_menus (
        role_id INTEGER NOT NULL,
        menu_key TEXT NOT NULL,
        PRIMARY KEY (role_id, menu_key),
        FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role_id INTEGER REFERENCES roles(id),
        is_active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id TEXT UNIQUE NOT NULL,
        nama_company TEXT NOT NULL,
        product TEXT,
        contact_person TEXT,
        segmen TEXT,
        sub_segmen TEXT,
        source TEXT,
        stage TEXT DEFAULT 'New',
        prioritas TEXT DEFAULT 'Warm',
        tgl_masuk TEXT,
        propose_value REAL DEFAULT 0,
        deal_value REAL DEFAULT 0,
        probability REAL DEFAULT 0,
        exp_close_date TEXT,
        weighted_value REAL DEFAULT 0,
        sales_owner TEXT,
        next_fu_date TEXT,
        last_fu_date TEXT,
        last_fu_notes TEXT,
        fu_count INTEGER DEFAULT 0,
        days_in_stage INTEGER DEFAULT 0,
        remarks TEXT,
        created_at TEXT DEFAULT (datetime('now','localtime')),
        updated_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS follow_up_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fu_id TEXT UNIQUE NOT NULL,
        lead_id TEXT NOT NULL,
        tgl_fu TEXT NOT NULL,
        nama_company TEXT,
        sales_owner TEXT,
        metode_fu TEXT,
        kontak TEXT,
        hasil_fu TEXT,
        catatan_fu TEXT,
        stage_saat_fu TEXT,
        next_action TEXT,
        tgl_fu_berikut TEXT,
        status TEXT DEFAULT 'Done',
        created_at TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
    );

    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id TEXT NOT NULL,
        nama_company TEXT,
        nama_contact TEXT NOT NULL,
        jabatan TEXT,
        dept TEXT,
        role TEXT,
        no_hp TEXT,
        email TEXT,
        telepon TEXT,
        linkedin TEXT,
        preferensi_kontak TEXT,
        catatan TEXT,
        FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
    );

    CREATE TABLE IF NOT EXISTS win_loss (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id TEXT NOT NULL,
        nama_company TEXT,
        segmen TEXT,
        hasil TEXT,
        deal_value REAL,
        tgl_masuk TEXT,
        tgl_close TEXT,
        sales_cycle INTEGER,
        sales_owner TEXT,
        alasan TEXT,
        kompetitor TEXT,
        lesson_learned TEXT,
        FOREIGN KEY (lead_id) REFERENCES leads(lead_id)
    );
    """)

    # Seed roles
    c.execute("SELECT COUNT(*) FROM roles")
    if c.fetchone()[0] == 0:
        all_menu_keys = [m["key"] for m in ALL_MENUS]
        sales_menus   = ["today","schedule","followup","dashboard","pipeline","contacts","winloss","insights","export"]

        c.execute("INSERT INTO roles (nama, deskripsi) VALUES (?,?)", ("Admin", "Akses penuh ke semua menu"))
        admin_id = c.lastrowid
        c.execute("INSERT INTO roles (nama, deskripsi) VALUES (?,?)", ("Manager", "Akses pipeline dan laporan, tidak bisa manage master"))
        mgr_id = c.lastrowid
        c.execute("INSERT INTO roles (nama, deskripsi) VALUES (?,?)", ("Sales", "Akses aktivitas dan pipeline saja"))
        sales_id = c.lastrowid

        # Admin → semua menu
        c.executemany("INSERT OR IGNORE INTO role_menus VALUES (?,?)",
                      [(admin_id, k) for k in all_menu_keys])
        # Manager → semua kecuali master data
        mgr_menus = ["today","schedule","followup","dashboard","pipeline","contacts","winloss","insights","export"]
        c.executemany("INSERT OR IGNORE INTO role_menus VALUES (?,?)",
                      [(mgr_id, k) for k in mgr_menus])
        # Sales → aktivitas + pipeline dasar
        c.executemany("INSERT OR IGNORE INTO role_menus VALUES (?,?)",
                      [(sales_id, k) for k in sales_menus])

    # Seed users
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] == 0:
        c.execute("SELECT id FROM roles WHERE nama='Admin'")
        admin_id = c.fetchone()["id"]
        c.execute("SELECT id FROM roles WHERE nama='Sales'")
        sales_id = c.fetchone()["id"]

        users = [
            ("Hariman",      "hariman@pkp.co.id",       hash_pw("pkp2026"), admin_id),
            ("Endy",         "endy@pkp.co.id",          hash_pw("pkp2026"), admin_id),
            ("Aji",          "aji.maulana@pkp.co.id",   hash_pw("pkp2026"), sales_id),
            ("Djoni",        "djoni@pkp.co.id",         hash_pw("pkp2026"), sales_id),
            ("Hary Priyono", "hary@pkp.co.id",          hash_pw("pkp2026"), sales_id),
        ]
        c.executemany("INSERT OR IGNORE INTO users (nama,email,password,role_id) VALUES (?,?,?,?)", users)

    conn.commit()
    conn.close()

def get_user_menus(role_id: int) -> list[str]:
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT menu_key FROM role_menus WHERE role_id=?", (role_id,))
    keys = {r["menu_key"] for r in c.fetchall()}
    conn.close()
    return keys

def next_lead_id():
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT lead_id FROM leads ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    conn.close()
    if row:
        num = int(row[0].replace("LD-", "")) + 1
    else:
        num = 1
    return f"LD-{num:03d}"

def next_fu_id():
    conn = get_conn()
    c = conn.cursor()
    c.execute("SELECT fu_id FROM follow_up_log ORDER BY id DESC LIMIT 1")
    row = c.fetchone()
    conn.close()
    if row:
        num = int(row[0].replace("FU-", "")) + 1
    else:
        num = 1
    return f"FU-{num:03d}"
