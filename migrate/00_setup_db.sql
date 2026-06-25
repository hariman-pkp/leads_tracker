-- ============================================================
-- 00_setup_db.sql
-- Jalankan sebagai superuser postgres:
--   psql -U postgres -f migrate/00_setup_db.sql
-- ============================================================

-- Buat user untuk aplikasi CRM
CREATE USER crm_user WITH PASSWORD 'crm_password_2026';

-- Buat database
CREATE DATABASE crm_leads OWNER crm_user ENCODING 'UTF8';

-- Beri hak akses
GRANT ALL PRIVILEGES ON DATABASE crm_leads TO crm_user;

-- Koneksi ke database crm_leads, lalu beri hak pada schema
\c crm_leads
GRANT ALL ON SCHEMA public TO crm_user;

-- Setelah ini jalankan:
-- psql -U crm_user -d crm_leads -f migrate/01_schema_postgres.sql
