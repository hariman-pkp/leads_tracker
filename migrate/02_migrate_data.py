"""
migrate/02_migrate_data.py
==========================
Migrasi data dari SQLite3 → PostgreSQL

Cara pakai:
    python3 migrate/02_migrate_data.py

Sebelum dijalankan:
    1. PostgreSQL sudah berjalan (lihat INSTALL_POSTGRES.md)
    2. Database & user sudah dibuat (lihat 00_setup_db.sql)
    3. Schema sudah dibuat: psql -U crm_user -d crm_leads -f migrate/01_schema_postgres.sql
    4. Edit variabel PG_DSN di bawah sesuai konfigurasi PostgreSQL Anda
"""

import sqlite3
import psycopg2
import psycopg2.extras
import os
import sys

# ── Konfigurasi ───────────────────────────────────────────────────────────────
SQLITE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'leads.db')

PG_DSN = {
    'host':     'localhost',
    'port':     5432,
    'dbname':   'crm_leads',
    'user':     'crm_user',
    'password': 'crm_password_2026',   # ← Sesuaikan dengan password Anda
}

# ── Helper ────────────────────────────────────────────────────────────────────
def to_date(val):
    """Konversi TEXT date SQLite → None jika kosong, biarkan jika valid."""
    if val is None or val == '' or val == 'None':
        return None
    # Ambil 10 karakter pertama (YYYY-MM-DD)
    return val[:10] if len(val) >= 10 else None

def to_num(val, default=0):
    """Konversi ke float, return default jika None/kosong."""
    if val is None or val == '':
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

def to_int(val, default=0):
    if val is None or val == '':
        return default
    try:
        return int(val)
    except (ValueError, TypeError):
        return default

def to_str(val):
    """Konversi ke string, None jika kosong."""
    if val is None or val == '':
        return None
    return str(val)

# ── Koneksi ───────────────────────────────────────────────────────────────────
def get_sqlite():
    conn = sqlite3.connect(SQLITE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def get_pg():
    conn = psycopg2.connect(**PG_DSN)
    return conn

# ── Fungsi migrasi per tabel ──────────────────────────────────────────────────

def migrate_roles(sq, pg):
    print("  → roles ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("SELECT id, nama, deskripsi, created_at FROM roles")
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO roles (id, nama, deskripsi, created_at)
            VALUES (%s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (r['id'], r['nama'], to_str(r['deskripsi']), r['created_at']))
    # Reset sequence
    c_pg.execute("SELECT setval('roles_id_seq', (SELECT MAX(id) FROM roles))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_role_menus(sq, pg):
    print("  → role_menus ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("SELECT role_id, menu_key FROM role_menus")
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO role_menus (role_id, menu_key)
            VALUES (%s, %s)
            ON CONFLICT DO NOTHING
        """, (r['role_id'], r['menu_key']))
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_users(sq, pg):
    print("  → users ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("SELECT id, nama, email, password, role, role_id, is_active, created_at FROM users")
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO users (id, nama, email, password, role, role_id, is_active, created_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (id) DO NOTHING
        """, (
            r['id'], r['nama'], r['email'], r['password'],
            to_str(r['role']) or 'sales',
            r['role_id'],
            to_int(r['is_active'], 1),
            r['created_at']
        ))
    c_pg.execute("SELECT setval('users_id_seq', (SELECT MAX(id) FROM users))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_leads(sq, pg):
    print("  → leads ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("""
        SELECT id, lead_id, nama_company, product, contact_person,
               segmen, sub_segmen, source, stage, prioritas, tgl_masuk,
               propose_value, deal_value, probability, exp_close_date,
               weighted_value, sales_owner, next_fu_date, last_fu_date,
               last_fu_notes, fu_count, days_in_stage, remarks,
               created_at, updated_at
        FROM leads
    """)
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO leads (
                id, lead_id, nama_company, product, contact_person,
                segmen, sub_segmen, source, stage, prioritas, tgl_masuk,
                propose_value, deal_value, probability, exp_close_date,
                weighted_value, sales_owner, next_fu_date, last_fu_date,
                last_fu_notes, fu_count, days_in_stage, remarks,
                created_at, updated_at
            ) VALUES (
                %s, %s, %s, %s, %s,
                %s, %s, %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s, %s, %s,
                %s, %s
            )
            ON CONFLICT (lead_id) DO NOTHING
        """, (
            r['id'], r['lead_id'], r['nama_company'], to_str(r['product']),
            to_str(r['contact_person']),
            to_str(r['segmen']), to_str(r['sub_segmen']), to_str(r['source']),
            r['stage'] or 'New', r['prioritas'] or 'Warm',
            to_date(r['tgl_masuk']),
            to_num(r['propose_value']), to_num(r['deal_value']),
            to_num(r['probability']), to_date(r['exp_close_date']),
            to_num(r['weighted_value']), to_str(r['sales_owner']),
            to_date(r['next_fu_date']), to_date(r['last_fu_date']),
            to_str(r['last_fu_notes']),
            to_int(r['fu_count']), to_int(r['days_in_stage']),
            to_str(r['remarks']),
            r['created_at'], r['updated_at']
        ))
    c_pg.execute("SELECT setval('leads_id_seq', (SELECT MAX(id) FROM leads))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_follow_up_log(sq, pg):
    print("  → follow_up_log ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("""
        SELECT id, fu_id, lead_id, tgl_fu, nama_company, sales_owner,
               metode_fu, kontak, hasil_fu, catatan_fu, stage_saat_fu,
               next_action, tgl_fu_berikut, status, created_at
        FROM follow_up_log
    """)
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO follow_up_log (
                id, fu_id, lead_id, tgl_fu, nama_company, sales_owner,
                metode_fu, kontak, hasil_fu, catatan_fu, stage_saat_fu,
                next_action, tgl_fu_berikut, status, created_at
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (fu_id) DO NOTHING
        """, (
            r['id'], r['fu_id'], r['lead_id'],
            to_date(r['tgl_fu']), to_str(r['nama_company']),
            to_str(r['sales_owner']), to_str(r['metode_fu']),
            to_str(r['kontak']), to_str(r['hasil_fu']),
            to_str(r['catatan_fu']), to_str(r['stage_saat_fu']),
            to_str(r['next_action']), to_date(r['tgl_fu_berikut']),
            r['status'] or 'Done', r['created_at']
        ))
    if rows:
        c_pg.execute("SELECT setval('follow_up_log_id_seq', (SELECT MAX(id) FROM follow_up_log))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_contacts(sq, pg):
    print("  → contacts ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("""
        SELECT id, lead_id, nama_company, nama_contact, jabatan, dept,
               role, no_hp, email, telepon, linkedin, preferensi_kontak, catatan
        FROM contacts
    """)
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO contacts (
                id, lead_id, nama_company, nama_contact, jabatan, dept,
                role, no_hp, email, telepon, linkedin, preferensi_kontak, catatan
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO NOTHING
        """, (
            r['id'], r['lead_id'], to_str(r['nama_company']),
            r['nama_contact'], to_str(r['jabatan']), to_str(r['dept']),
            to_str(r['role']), to_str(r['no_hp']), to_str(r['email']),
            to_str(r['telepon']), to_str(r['linkedin']),
            to_str(r['preferensi_kontak']), to_str(r['catatan'])
        ))
    if rows:
        c_pg.execute("SELECT setval('contacts_id_seq', (SELECT MAX(id) FROM contacts))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_win_loss(sq, pg):
    print("  → win_loss ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("""
        SELECT id, lead_id, nama_company, segmen, hasil, deal_value,
               tgl_masuk, tgl_close, sales_cycle, sales_owner,
               alasan, kompetitor, lesson_learned
        FROM win_loss
    """)
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO win_loss (
                id, lead_id, nama_company, segmen, hasil, deal_value,
                tgl_masuk, tgl_close, sales_cycle, sales_owner,
                alasan, kompetitor, lesson_learned
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO NOTHING
        """, (
            r['id'], r['lead_id'], to_str(r['nama_company']),
            to_str(r['segmen']), to_str(r['hasil']),
            to_num(r['deal_value']), to_date(r['tgl_masuk']),
            to_date(r['tgl_close']), to_int(r['sales_cycle']),
            to_str(r['sales_owner']), to_str(r['alasan']),
            to_str(r['kompetitor']), to_str(r['lesson_learned'])
        ))
    if rows:
        c_pg.execute("SELECT setval('win_loss_id_seq', GREATEST((SELECT MAX(id) FROM win_loss), 1))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_revenue_projects(sq, pg):
    print("  → revenue_projects ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("""
        SELECT id, project_id, lob, owner, product, client, kategori, type,
               target_month, revenue_target, actual_revenue, status,
               invoice_date, payment_date, notes, risk_level,
               action_required, pic, is_active, tahun, created_at, updated_at
        FROM revenue_projects
    """)
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO revenue_projects (
                id, project_id, lob, owner, product, client, kategori, type,
                target_month, revenue_target, actual_revenue, status,
                invoice_date, payment_date, notes, risk_level,
                action_required, pic, is_active, tahun, created_at, updated_at
            ) VALUES (
                %s,%s,%s,%s,%s,%s,%s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,
                %s,%s,%s,%s,%s,%s
            )
            ON CONFLICT (project_id) DO NOTHING
        """, (
            r['id'], r['project_id'], to_str(r['lob']) or 'DCSS',
            to_str(r['owner']), to_str(r['product']), to_str(r['client']),
            to_str(r['kategori']), to_str(r['type']),
            to_str(r['target_month']),
            to_num(r['revenue_target']), to_num(r['actual_revenue']),
            to_str(r['status']) or 'Critical',
            to_date(r['invoice_date']), to_date(r['payment_date']),
            to_str(r['notes']), to_str(r['risk_level']) or 'HIGH',
            to_str(r['action_required']), to_str(r['pic']),
            to_int(r['is_active'], 1), to_int(r['tahun'], 2026),
            r['created_at'], r['updated_at']
        ))
    c_pg.execute("SELECT setval('revenue_projects_id_seq', (SELECT MAX(id) FROM revenue_projects))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_revenue_monthly(sq, pg):
    print("  → revenue_monthly ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("""
        SELECT id, project_id, month_num, month_name, target, actual, status
        FROM revenue_monthly
    """)
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO revenue_monthly (id, project_id, month_num, month_name, target, actual, status)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (project_id, month_num) DO NOTHING
        """, (
            r['id'], r['project_id'], r['month_num'], to_str(r['month_name']),
            to_num(r['target']), to_num(r['actual']),
            to_str(r['status']) or 'Pending'
        ))
    c_pg.execute("SELECT setval('revenue_monthly_id_seq', (SELECT MAX(id) FROM revenue_monthly))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_invoices(sq, pg):
    print("  → invoices ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("""
        SELECT id, project_id, lob, owner, product, client,
               invoice_no, invoice_date, period, invoice_amount,
               paid_amount, paid_date, notes, tahun, created_at
        FROM invoices
    """)
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO invoices (
                id, project_id, lob, owner, product, client,
                invoice_no, invoice_date, period, invoice_amount,
                paid_amount, paid_date, notes, tahun, created_at
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO NOTHING
        """, (
            r['id'], to_str(r['project_id']), to_str(r['lob']) or 'DCSS',
            to_str(r['owner']), to_str(r['product']), to_str(r['client']),
            to_str(r['invoice_no']), to_date(r['invoice_date']),
            to_str(r['period']),
            to_num(r['invoice_amount']), to_num(r['paid_amount']),
            to_date(r['paid_date']), to_str(r['notes']),
            to_int(r['tahun'], 2026), r['created_at']
        ))
    c_pg.execute("SELECT setval('invoices_id_seq', (SELECT MAX(id) FROM invoices))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_kpi_prospecting(sq, pg):
    print("  → kpi_prospecting ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("""
        SELECT id, kpi_category, kpi_name, unit, target_annual,
               q1_target, q1_actual, q2_target, q2_actual,
               q3_target, q3_actual, q4_target, q4_actual,
               sort_order, created_at
        FROM kpi_prospecting
    """)
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO kpi_prospecting (
                id, kpi_category, kpi_name, unit, target_annual,
                q1_target, q1_actual, q2_target, q2_actual,
                q3_target, q3_actual, q4_target, q4_actual,
                sort_order, created_at
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO NOTHING
        """, (
            r['id'], to_str(r['kpi_category']), to_str(r['kpi_name']),
            to_str(r['unit']) or 'Count', to_num(r['target_annual']),
            to_num(r['q1_target']), to_num(r['q1_actual']),
            to_num(r['q2_target']), to_num(r['q2_actual']),
            to_num(r['q3_target']), to_num(r['q3_actual']),
            to_num(r['q4_target']), to_num(r['q4_actual']),
            to_int(r['sort_order']), r['created_at']
        ))
    if rows:
        c_pg.execute("SELECT setval('kpi_prospecting_id_seq', (SELECT MAX(id) FROM kpi_prospecting))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


def migrate_budget_items(sq, pg):
    print("  → budget_items ...", end=' ')
    c_sq = sq.cursor()
    c_pg = pg.cursor()
    c_sq.execute("""
        SELECT id, perspektif_bsc, category, sub_category,
               budget_amount, actual_amount, month_num, notes, status, created_at
        FROM budget_items
    """)
    rows = c_sq.fetchall()
    for r in rows:
        c_pg.execute("""
            INSERT INTO budget_items (
                id, perspektif_bsc, category, sub_category,
                budget_amount, actual_amount, month_num, notes, status, created_at
            ) VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ON CONFLICT (id) DO NOTHING
        """, (
            r['id'], to_str(r['perspektif_bsc']), to_str(r['category']),
            to_str(r['sub_category']),
            to_num(r['budget_amount']), to_num(r['actual_amount']),
            to_int(r['month_num']), to_str(r['notes']),
            to_str(r['status']) or 'Planning', r['created_at']
        ))
    if rows:
        c_pg.execute("SELECT setval('budget_items_id_seq', (SELECT MAX(id) FROM budget_items))")
    pg.commit()
    print(f"✅ {len(rows)} baris")


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("  MIGRASI DATA: SQLite3 → PostgreSQL")
    print("=" * 60)
    print(f"\nSumber  : {SQLITE_PATH}")
    print(f"Tujuan  : postgresql://{PG_DSN['user']}@{PG_DSN['host']}:{PG_DSN['port']}/{PG_DSN['dbname']}")

    # Test koneksi
    print("\n[1/2] Test koneksi...")
    try:
        sq = get_sqlite()
        print("  ✅ SQLite terhubung")
    except Exception as e:
        print(f"  ❌ SQLite error: {e}")
        sys.exit(1)

    try:
        pg = get_pg()
        print("  ✅ PostgreSQL terhubung")
    except Exception as e:
        print(f"  ❌ PostgreSQL error: {e}")
        print("\n  Pastikan:")
        print("  - PostgreSQL sudah berjalan")
        print("  - Database 'crm_leads' sudah dibuat")
        print("  - User 'crm_user' sudah dibuat dengan password yang benar")
        print("  - Edit variabel PG_DSN di file ini sesuai konfigurasi Anda")
        sys.exit(1)

    print("\n[2/2] Migrasi tabel...")
    # Urutan penting: parent table dulu sebelum child
    migrate_roles(sq, pg)
    migrate_role_menus(sq, pg)
    migrate_users(sq, pg)
    migrate_leads(sq, pg)
    migrate_follow_up_log(sq, pg)
    migrate_contacts(sq, pg)
    migrate_win_loss(sq, pg)
    migrate_revenue_projects(sq, pg)
    migrate_revenue_monthly(sq, pg)
    migrate_invoices(sq, pg)
    migrate_kpi_prospecting(sq, pg)
    migrate_budget_items(sq, pg)

    sq.close()
    pg.close()

    print("\n" + "=" * 60)
    print("  ✅ MIGRASI SELESAI!")
    print("  Jalankan 03_verify.py untuk verifikasi jumlah baris.")
    print("=" * 60)


if __name__ == '__main__':
    main()
