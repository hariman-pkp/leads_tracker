# APEX CRM — Leads Tracker

Aplikasi CRM internal PT PKP untuk manajemen leads, revenue, invoice, dan laporan lapangan.

## Stack

| Layer | Tech | Port |
|---|---|---|
| Frontend | Nuxt 3 / Vue 3 | 3000 (dev), `.output/` (prod) |
| Backend | Laravel PHP 8.4 | 8002 |
| Database | PostgreSQL 16 | DB: `crm_leads`, user: `crm_user` |

## VPS Production

- **IP**: `103.253.213.183` (Rumahweb) — SSH alias `apex-vps-new`
- **Nginx** melayani semua traffic; Apache2 sudah di-disable permanen
- **Cloudflare**: SSL mode = **Flexible** (origin hanya HTTP, tidak HTTPS)
- **Systemd services**: `apex-nuxt`, `apex-laravel`, `nginx`
- **Path di VPS**: `/var/www/apex/repo/`

## Deploy ke VPS

```bash
# 1. Build frontend
cd frontend && npm run build

# 2. Rsync frontend build
rsync -az --delete frontend/.output/ apex-vps-new:/var/www/apex/repo/frontend/.output/

# 3. Rsync Laravel (jika ada perubahan)
rsync -az laravel-api/app/ apex-vps-new:/var/www/apex/repo/laravel-api/app/
rsync -az laravel-api/routes/ apex-vps-new:/var/www/apex/repo/laravel-api/routes/

# 4. Restart service
ssh apex-vps-new "systemctl restart apex-nuxt"
# jika ada perubahan Laravel:
ssh apex-vps-new "systemctl restart apex-laravel && php /var/www/apex/repo/laravel-api/artisan config:cache"
```

## Struktur Direktori Penting

```
frontend/
  pages/           # Halaman Nuxt
  composables/
    useNavMenus.ts # Definisi menu sidebar (hardcoded, sync dengan role_menus DB)
    useFormat.ts   # useFormat() — format angka, tanggal, warna prioritas
  components/

laravel-api/
  app/Http/Controllers/Api/
    DashboardController.php   # dailyRecommendations()
    CommandCenterController.php
    RevenueController.php     # updateInvoice() — paid_amount, paid_date
  routes/api.php              # semua route API
```

## Pola Pengembangan

### Fetch data di Nuxt page
```ts
const { get } = useApi()
const { data, refresh } = await useAsyncData('key', () => get('/v1/endpoint'), { server: false })
```
- Jangan gunakan `useApiFetch` (tidak ada)
- Format: `useFormat()`, bukan `useFmt`

### Tambah menu baru
1. Tambah entry di `frontend/composables/useNavMenus.ts`
2. Insert ke tabel `role_menus` di DB untuk setiap role yang berhak
```sql
INSERT INTO role_menus (role_id, menu_key) VALUES (2,'key_baru'), (3,'key_baru');
```

### PostgreSQL generated column
Kolom `status` di tabel `invoices` adalah **generated column** — tidak boleh di-update manual di query.

## Fitur yang Sudah Ada

| Halaman | URL | Keterangan |
|---|---|---|
| Hari Ini | `/today` | Summary FU + Rekomendasi Aksi harian |
| Weekly Planner | `/plan` | Overdue & Belum Dijadwalkan (ada nama produk) |
| Command Center | `/command-center` | Revenue Pulse, Invoice Alerts, Pipeline Decisions |
| Invoice & Payment | `/revenue/invoice` | Edit paid_amount & paid_date |
| Field Activity | `/field-activity` | Foto dari storage Laravel |
| Dashboard | `/` | Overview pipeline |

## RBAC

- `role_menus` di DB mengontrol menu yang tampil per role
- Role 1 = Admin (akses semua)
- `allowed_menus` array dari `/v1/auth/me` dipakai oleh `useNavMenus.ts`

## Catatan Penting

- **Storage foto**: symlink `/var/www/apex/repo/laravel-api/public/storage` → `../storage/app/public`
- **Cache table**: tabel `cache` harus ada di PostgreSQL (JWT middleware membutuhkannya)
- **Foto lama**: masih di VPS lama `187.77.115.39` (Hostinger) — belum sepenuhnya dimigrasikan
- **Bahasa**: request dari user dalam Bahasa Indonesia, kode dalam Bahasa Inggris
