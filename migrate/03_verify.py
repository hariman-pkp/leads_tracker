"""
migrate/03_verify.py
====================
Verifikasi jumlah baris SQLite vs PostgreSQL setelah migrasi.

Cara pakai:
    python3 migrate/03_verify.py
"""

import sqlite3
import psycopg2
import os
import sys

SQLITE_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'leads.db')

PG_DSN = {
    'host':     'localhost',
    'port':     5432,
    'dbname':   'crm_leads',
    'user':     'crm_user',
    'password': 'crm_password_2026',   # ← Sesuaikan
}

TABLES = [
    'roles', 'role_menus', 'users', 'leads',
    'follow_up_log', 'contacts', 'win_loss',
    'revenue_projects', 'revenue_monthly', 'invoices',
    'kpi_prospecting', 'budget_items',
]

def main():
    print("=" * 55)
    print("  VERIFIKASI MIGRASI DATA")
    print("=" * 55)

    try:
        sq = sqlite3.connect(SQLITE_PATH)
        pg = psycopg2.connect(**PG_DSN)
    except Exception as e:
        print(f"❌ Koneksi error: {e}")
        sys.exit(1)

    c_sq = sq.cursor()
    c_pg = pg.cursor()

    print(f"\n{'Tabel':<22} {'SQLite':>8} {'PostgreSQL':>12} {'Status':>8}")
    print("-" * 55)

    all_ok = True
    for table in TABLES:
        try:
            c_sq.execute(f"SELECT COUNT(*) FROM {table}")
            sq_cnt = c_sq.fetchone()[0]
        except Exception:
            sq_cnt = 0

        try:
            c_pg.execute(f"SELECT COUNT(*) FROM {table}")
            pg_cnt = c_pg.fetchone()[0]
        except Exception:
            pg_cnt = -1

        ok = sq_cnt == pg_cnt
        if not ok:
            all_ok = False
        status = "✅ OK" if ok else "❌ BEDA"
        print(f"  {table:<20} {sq_cnt:>8,} {pg_cnt:>12,} {status:>8}")

    print("-" * 55)
    if all_ok:
        print("\n✅ Semua tabel cocok! Migrasi berhasil.\n")
    else:
        print("\n⚠️  Ada perbedaan jumlah baris. Cek log migrasi.\n")

    sq.close()
    pg.close()

if __name__ == '__main__':
    main()
