# Panduan Instalasi PostgreSQL di macOS

## Opsi 1: Via Homebrew (Disarankan)

### Install Homebrew dulu (jika belum ada)
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Setelah install, tambahkan ke PATH (ikuti instruksi yang muncul di terminal, biasanya):
```bash
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

### Install PostgreSQL
```bash
brew install postgresql@16
brew services start postgresql@16
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

### Verifikasi
```bash
psql --version
# postgresql 16.x
```

---

## Opsi 2: Installer GUI (Tanpa Terminal)

1. Download dari: https://www.postgresql.org/download/macosx/
2. Klik **"Download the installer"** (EDB installer)
3. Pilih versi **PostgreSQL 16** untuk macOS
4. Jalankan installer `.dmg`, ikuti wizard
5. Catat password superuser (postgres) yang Anda buat
6. Port default: **5432**

Setelah install, tambahkan ke PATH:
```bash
echo 'export PATH="/Library/PostgreSQL/16/bin:$PATH"' >> ~/.zprofile
source ~/.zprofile
```

---

## Setelah PostgreSQL Terinstall

### Langkah 1: Buat database & user
```bash
psql -U postgres -f migrate/00_setup_db.sql
```

Atau manual:
```bash
psql -U postgres
```
```sql
CREATE USER crm_user WITH PASSWORD 'crm_password_2026';
CREATE DATABASE crm_leads OWNER crm_user ENCODING 'UTF8';
GRANT ALL PRIVILEGES ON DATABASE crm_leads TO crm_user;
\c crm_leads
GRANT ALL ON SCHEMA public TO crm_user;
\q
```

### Langkah 2: Buat tabel (schema)
```bash
cd /Users/hariman/Library/CloudStorage/OneDrive-Personal/PKP/Project/Leads_tracker
psql -U crm_user -d crm_leads -f migrate/01_schema_postgres.sql
```

### Langkah 3: Migrasi data dari SQLite
```bash
python3 migrate/02_migrate_data.py
```

### Langkah 4: Verifikasi
```bash
python3 migrate/03_verify.py
```

Output yang diharapkan:
```
Tabel                  SQLite   PostgreSQL   Status
-------------------------------------------------------
  roles                     3            3    ✅ OK
  role_menus               45           45    ✅ OK
  users                     5            5    ✅ OK
  leads                    23           23    ✅ OK
  ...
✅ Semua tabel cocok! Migrasi berhasil.
```

### Langkah 5: Patch main.py (otomatis)
```bash
python3 migrate/04_main_sql_patch.py
```

### Langkah 6: Jalankan server dengan PostgreSQL
```bash
python3 -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

---

## Konfigurasi via Environment Variable (Opsional)

Anda bisa menggunakan environment variable agar password tidak hardcode:
```bash
export CRM_DB_HOST=localhost
export CRM_DB_PORT=5432
export CRM_DB_NAME=crm_leads
export CRM_DB_USER=crm_user
export CRM_DB_PASS=crm_password_2026
```

Tambahkan ke `~/.zprofile` agar persisten.

---

## Troubleshooting

**Error: `could not connect to server`**
```bash
brew services restart postgresql@16
# atau
pg_ctl -D /opt/homebrew/var/postgresql@16 start
```

**Error: `role "crm_user" does not exist`**
```bash
psql -U postgres -c "CREATE USER crm_user WITH PASSWORD 'crm_password_2026';"
```

**Error: `database "crm_leads" does not exist`**
```bash
psql -U postgres -c "CREATE DATABASE crm_leads OWNER crm_user;"
```

**Lihat status PostgreSQL**
```bash
brew services list | grep postgresql
```
