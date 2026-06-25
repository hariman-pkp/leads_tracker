<template>
  <div class="min-h-screen bg-apex-bg text-apex-text p-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-apex-text">
          <i class="fa-solid fa-receipt text-primary-400 mr-2" />Klaim Entertain
        </h1>
        <p class="text-sm text-apex-muted mt-0.5">
          {{ canApprove ? 'Semua klaim entertain' : 'Klaim entertain saya' }}
        </p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <select v-model="filterTahun" @change="load(true)" class="form-select text-sm w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="filterBulan" @change="load(true)" class="form-select text-sm w-36">
          <option :value="0">Semua Bulan</option>
          <option v-for="m in 12" :key="m" :value="m">{{ monthName(m) }}</option>
        </select>
        <select v-if="canApprove" v-model="filterUserId" @change="load(true)" class="form-select text-sm w-40">
          <option :value="0">Semua Sales</option>
          <option v-for="s in salesList" :key="s.id" :value="s.id">{{ s.nama }}</option>
        </select>
        <select v-model="filterStatus" @change="load(true)" class="form-select text-sm w-36">
          <option value="">Semua Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <button @click="openAdd" class="btn-primary flex items-center gap-2 text-sm">
          <i class="fa-solid fa-plus" /> Ajukan Klaim
        </button>
        <NuxtLink to="/entertain" class="btn-ghost flex items-center gap-2 text-sm">
          <i class="fa-solid fa-chart-bar" /> Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Summary mini -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="apex-card">
        <div class="text-xs text-apex-muted mb-1">Total Diajukan</div>
        <div class="text-xl font-bold text-apex-text">{{ fmt.rupiah(summary.total_bulan || 0) }}</div>
        <div class="text-xs text-apex-faint mt-0.5">{{ filterBulan ? monthName(filterBulan) : 'Tahun ' + filterTahun }}</div>
        <div v-if="limitPerBulan > 0 && !canApprove" class="mt-2">
          <div class="h-1.5 bg-apex-border/30 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all"
                 :class="pctLimit > 100 ? 'bg-red-500' : pctLimit > 75 ? 'bg-yellow-500' : 'bg-emerald-500'"
                 :style="`width:${Math.min(pctLimit,100)}%`" />
          </div>
          <div class="text-xs text-apex-faint mt-0.5">{{ pctLimit.toFixed(0) }}% dari {{ fmt.rupiah(limitPerBulan) }}</div>
        </div>
      </div>
      <div class="apex-card">
        <div class="text-xs text-apex-muted mb-1">Pending</div>
        <div class="text-2xl font-bold text-yellow-400">{{ summary.pending || 0 }}</div>
      </div>
      <div class="apex-card">
        <div class="text-xs text-apex-muted mb-1">Approved</div>
        <div class="text-2xl font-bold text-emerald-400">{{ summary.approved || 0 }}</div>
      </div>
      <div class="apex-card">
        <div class="text-xs text-apex-muted mb-1">Rejected</div>
        <div class="text-2xl font-bold text-red-400">{{ summary.rejected || 0 }}</div>
      </div>
    </div>

    <!-- Tabel -->
    <div v-if="loading" class="flex justify-center py-20 text-apex-muted">
      <i class="fa-solid fa-spinner fa-spin mr-2" />Memuat data...
    </div>

    <div v-else class="apex-card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-apex-border">
            <th class="text-left py-3 px-3 text-apex-muted font-medium">No. Klaim</th>
            <th v-if="canApprove" class="text-left py-3 px-3 text-apex-muted font-medium">Sales</th>
            <th class="text-left py-3 px-3 text-apex-muted font-medium">Tanggal</th>
            <th class="text-left py-3 px-3 text-apex-muted font-medium">Nama Klien</th>
            <th class="text-left py-3 px-3 text-apex-muted font-medium">Leads</th>
            <th class="text-left py-3 px-3 text-apex-muted font-medium">Lokasi</th>
            <th class="text-center py-3 px-3 text-apex-muted font-medium w-16">Foto</th>
            <th class="text-right py-3 px-3 text-apex-muted font-medium">Jumlah</th>
            <th class="text-center py-3 px-3 text-apex-muted font-medium">Status</th>
            <th class="text-center py-3 px-3 text-apex-muted font-medium w-24">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="claims.length === 0">
            <td :colspan="canApprove ? 10 : 9" class="text-center py-12 text-apex-faint">
              Belum ada klaim untuk periode ini.
            </td>
          </tr>

          <tr v-for="c in claims" :key="c.id"
              class="border-b border-apex-border hover:bg-apex-card/30 transition-colors">
            <td class="py-2.5 px-3">
              <span class="font-mono text-xs text-primary-400">{{ c.claim_no }}</span>
              <i v-if="c.limit_warning" class="fa-solid fa-triangle-exclamation text-yellow-400 ml-1.5 text-xs"
                 title="Melebihi limit bulan ini" />
            </td>
            <td v-if="canApprove" class="py-2.5 px-3 font-medium text-apex-text">{{ c.sales_nama }}</td>
            <td class="py-2.5 px-3 text-apex-muted whitespace-nowrap">{{ fmt.tgl(c.tgl_klaim) }}</td>
            <td class="py-2.5 px-3 text-apex-text">{{ c.nama_klien }}</td>
            <td class="py-2.5 px-3 text-xs text-apex-muted">{{ c.lead_nama || '—' }}</td>
            <td class="py-2.5 px-3">
              <div v-if="c.lat && c.lng" class="flex items-center gap-1.5">
                <span class="text-xs text-apex-muted truncate max-w-[100px]" :title="c.lokasi">
                  {{ c.lokasi || `${Number(c.lat).toFixed(4)}, ${Number(c.lng).toFixed(4)}` }}
                </span>
                <button @click="openMap(c)" class="text-primary-400 hover:text-primary-300 flex-shrink-0" title="Lihat di peta">
                  <i class="fa-solid fa-map-location-dot text-xs" />
                </button>
              </div>
              <span v-else-if="c.lokasi" class="text-xs text-apex-muted">{{ c.lokasi }}</span>
              <span v-else class="text-xs text-apex-faint">—</span>
            </td>
            <!-- Kolom Foto -->
            <td class="py-2 px-3 text-center">
              <button v-if="c.foto_bukti" @click="openPhoto(c)"
                      class="block mx-auto rounded-lg overflow-hidden border border-apex-border hover:border-primary-500 transition-colors focus:outline-none"
                      title="Lihat foto bukti">
                <img :src="photoUrl(c.foto_bukti)"
                     class="w-10 h-10 object-cover" />
              </button>
              <span v-else class="text-apex-faint text-xs">—</span>
            </td>
            <td class="py-2.5 px-3 text-right font-semibold text-apex-text">{{ fmt.rupiah(c.jumlah) }}</td>
            <td class="py-2.5 px-3 text-center">
              <span :class="statusBadge(c.status)">{{ c.status }}</span>
            </td>
            <td class="py-2.5 px-3 text-center">
              <button @click="openDetail(c.id)" class="text-primary-400 hover:text-primary-300 mr-2" title="Detail">
                <i class="fa-solid fa-eye" />
              </button>
              <button v-if="c.status === 'Pending' && c.user_id === myId"
                      @click="openEdit(c)" class="text-amber-400 hover:text-amber-300 mr-2" title="Edit">
                <i class="fa-solid fa-pen" />
              </button>
              <button v-if="c.status === 'Pending' && c.user_id === myId"
                      @click="cancelClaim(c)" class="text-red-400 hover:text-red-300" title="Batalkan">
                <i class="fa-solid fa-xmark" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <AppPagination
        v-model:page="page"
        v-model:per-page="perPage"
        :total="totalCount"
        :total-pages="totalPages"
        :per-page-options="[10, 25, 50]"
      />
    </div>

    <!-- ─── Modal Form ──────────────────────────────────────────────── -->
    <div v-if="formModal.open"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-5 border-b border-apex-border sticky top-0 bg-apex-surface z-10">
          <h2 class="text-lg font-semibold text-apex-text">
            {{ formModal.isNew ? 'Ajukan Klaim Entertain' : 'Edit Klaim' }}
          </h2>
          <button @click="formModal.open = false" class="text-apex-muted hover:text-apex-text">
            <i class="fa-solid fa-xmark text-xl" />
          </button>
        </div>
        <div class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Tanggal <span class="text-red-400">*</span></label>
              <input v-model="formModal.form.tgl_klaim" type="date" class="form-input" />
            </div>
            <div>
              <label class="form-label">Jumlah (Rp) <span class="text-red-400">*</span></label>
              <NumericInput v-model="formModal.form.jumlah" class="form-input" />
            </div>
          </div>
          <div>
            <label class="form-label">Nama Klien <span class="text-red-400">*</span></label>
            <input v-model="formModal.form.nama_klien" class="form-input"
                   placeholder="Nama individu / perusahaan klien" />
          </div>
          <div>
            <label class="form-label">Lokasi</label>
            <div class="flex gap-2">
              <input v-model="formModal.form.lokasi" class="form-input flex-1"
                     placeholder="Nama restoran / tempat..." />
              <button @click="captureLocation" :disabled="locating"
                      class="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors"
                      :class="formModal.form.lat ? 'border-emerald-600 bg-emerald-900/30 text-emerald-400' : 'border-apex-border bg-apex-card text-apex-muted hover:text-apex-text'"
                      title="Ambil lokasi GPS saat ini">
                <i v-if="locating" class="fa-solid fa-spinner fa-spin text-xs" />
                <i v-else class="fa-solid fa-location-crosshairs text-xs" />
                <span class="text-xs">{{ locating ? 'Detecting...' : formModal.form.lat ? 'GPS OK' : 'GPS' }}</span>
              </button>
            </div>
            <div v-if="formModal.form.lat && formModal.form.lng"
                 class="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400">
              <i class="fa-solid fa-circle-check" />
              {{ Number(formModal.form.lat).toFixed(6) }}, {{ Number(formModal.form.lng).toFixed(6) }}
            </div>
            <div v-if="locError" class="mt-1 text-xs text-red-400">{{ locError }}</div>
          </div>
          <div>
            <label class="form-label">Leads Terkait</label>
            <select v-model="formModal.form.lead_id" class="form-select">
              <option value="">— Tidak terkait leads —</option>
              <option v-for="l in leads" :key="l.lead_id" :value="l.lead_id">
                {{ l.nama_company }} ({{ l.stage }})
              </option>
            </select>
          </div>
          <div>
            <label class="form-label">Keterangan</label>
            <textarea v-model="formModal.form.keterangan" rows="2" class="form-input resize-none"
                      placeholder="Tujuan entertain, agenda..." />
          </div>

          <!-- Upload Foto dengan GPS Stamp -->
          <div class="border border-apex-border rounded-xl p-4 space-y-3">
            <label class="form-label mb-0">
              <i class="fa-solid fa-camera mr-1 text-primary-400" />Foto Bukti / Struk
            </label>
            <p class="text-xs text-apex-muted -mt-1">Foto akan distamp dengan tanggal, jam, dan koordinat GPS.</p>
            <div v-if="formModal.form.foto_bukti && !photoPreview" class="relative w-fit">
              <img :src="photoUrl(formModal.form.foto_bukti)"
                   class="w-40 h-40 object-cover rounded-lg border border-apex-border" />
            </div>
            <div v-if="photoPreview" class="relative w-fit">
              <img :src="photoPreview" class="w-40 h-40 object-cover rounded-lg border border-emerald-600" />
              <button @click="clearPhoto"
                      class="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                <i class="fa-solid fa-xmark text-white text-[10px]" />
              </button>
            </div>
            <div class="flex items-center gap-2 flex-wrap">
              <label class="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border border-apex-border bg-apex-card hover:bg-apex-card/80 text-sm text-apex-muted transition-colors">
                <i class="fa-solid fa-image text-xs" />
                <span class="text-xs">{{ photoFile ? photoFile.name : 'Pilih Foto' }}</span>
                <input type="file" accept="image/*" class="hidden" @change="onPhotoSelected" />
              </label>
              <button v-if="photoFile" @click="stampAndPreview" :disabled="stamping"
                      class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-600 bg-primary-900/30 text-primary-400 text-xs transition-colors">
                <i v-if="stamping" class="fa-solid fa-spinner fa-spin" />
                <i v-else class="fa-solid fa-stamp" />
                {{ stamping ? 'Memproses...' : 'Preview Stamp' }}
              </button>
            </div>
          </div>

          <div v-if="formModal.error" class="text-xs text-red-400 flex items-center gap-1.5">
            <i class="fa-solid fa-circle-exclamation" />{{ formModal.error }}
          </div>
        </div>
        <div class="flex justify-end gap-3 p-5 border-t border-apex-border sticky bottom-0 bg-apex-surface">
          <button @click="formModal.open = false" class="btn-ghost">Batal</button>
          <button @click="saveClaim" :disabled="saving" class="btn-primary">
            <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-1" />
            {{ formModal.isNew ? 'Ajukan Klaim' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Modal Detail ────────────────────────────────────────────── -->
    <div v-if="detailModal.open"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between p-5 border-b border-apex-border">
          <h2 class="text-lg font-semibold text-apex-text">
            Detail — <span class="font-mono text-primary-400">{{ detailModal.claim?.claim_no }}</span>
          </h2>
          <button @click="detailModal.open = false" class="text-apex-muted hover:text-apex-text">
            <i class="fa-solid fa-xmark text-xl" />
          </button>
        </div>
        <div v-if="detailModal.loading" class="flex justify-center py-10 text-apex-muted">
          <i class="fa-solid fa-spinner fa-spin" />
        </div>
        <div v-else-if="detailModal.claim" class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3 text-sm">
            <div><div class="text-xs text-apex-muted">Sales</div><div class="font-medium">{{ detailModal.claim.sales_nama }}</div></div>
            <div><div class="text-xs text-apex-muted">Status</div><span :class="statusBadge(detailModal.claim.status)">{{ detailModal.claim.status }}</span></div>
            <div><div class="text-xs text-apex-muted">Tanggal</div><div>{{ fmt.tgl(detailModal.claim.tgl_klaim) }}</div></div>
            <div><div class="text-xs text-apex-muted">Jumlah</div><div class="font-bold text-base">{{ fmt.rupiah(detailModal.claim.jumlah) }}</div></div>
            <div><div class="text-xs text-apex-muted">Nama Klien</div><div>{{ detailModal.claim.nama_klien }}</div></div>
            <div>
              <div class="text-xs text-apex-muted">Lokasi</div>
              <div class="flex items-center gap-1.5">
                <span>{{ detailModal.claim.lokasi || '—' }}</span>
                <button v-if="detailModal.claim.lat && detailModal.claim.lng"
                        @click="openMap(detailModal.claim)" class="text-primary-400 text-xs">
                  <i class="fa-solid fa-map-location-dot" />
                </button>
              </div>
              <div v-if="detailModal.claim.lat" class="text-xs text-apex-faint mt-0.5">
                {{ Number(detailModal.claim.lat).toFixed(6) }}, {{ Number(detailModal.claim.lng).toFixed(6) }}
              </div>
            </div>
            <div class="col-span-2"><div class="text-xs text-apex-muted">Leads</div><div>{{ detailModal.claim.lead_nama || '—' }}</div></div>
            <div class="col-span-2"><div class="text-xs text-apex-muted">Keterangan</div><div>{{ detailModal.claim.keterangan || '—' }}</div></div>
          </div>
          <div v-if="detailModal.claim.foto_bukti">
            <div class="text-xs text-apex-muted mb-2">Bukti / Struk</div>
            <img :src="photoUrl(detailModal.claim.foto_bukti)"
                 class="max-w-full max-h-52 rounded-xl border border-apex-border object-contain" />
          </div>
          <div v-if="detailModal.approvals.length">
            <div class="text-xs text-apex-muted mb-2">Riwayat Approval</div>
            <div class="space-y-2">
              <div v-for="a in detailModal.approvals" :key="a.id" class="flex items-start gap-3 text-sm">
                <div :class="a.action === 'Approved' ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'"
                     class="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                  <i :class="a.action === 'Approved' ? 'fa-solid fa-check' : 'fa-solid fa-xmark'" class="text-xs" />
                </div>
                <div>
                  <div class="font-medium">{{ a.approver_nama }}
                    <span :class="a.action === 'Approved' ? 'text-emerald-400' : 'text-red-400'">{{ a.action }}</span>
                  </div>
                  <div v-if="a.catatan" class="text-apex-muted text-xs">{{ a.catatan }}</div>
                  <div class="text-apex-faint text-xs">{{ fmt.tgl(a.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-5 border-t border-apex-border">
          <button @click="detailModal.open = false" class="btn-ghost">Tutup</button>
        </div>
      </div>
    </div>

    <!-- ─── Modal Map ────────────────────────────────────────────────── -->
    <div v-if="mapModal.open"
         class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-xl shadow-2xl">
        <div class="flex items-center justify-between p-4 border-b border-apex-border">
          <div>
            <h2 class="text-base font-semibold text-apex-text">
              <i class="fa-solid fa-map-location-dot text-primary-400 mr-2" />Lokasi Klaim
            </h2>
            <p class="text-xs text-apex-muted mt-0.5">{{ mapModal.claim?.nama_klien }} · {{ fmt.tgl(mapModal.claim?.tgl_klaim) }}</p>
          </div>
          <button @click="mapModal.open = false" class="text-apex-muted hover:text-apex-text">
            <i class="fa-solid fa-xmark text-xl" />
          </button>
        </div>
        <div class="p-4 space-y-3">
          <div class="text-xs text-apex-muted">{{ mapModal.claim?.lokasi }} · <span class="font-mono">{{ mapModal.lat?.toFixed(6) }}, {{ mapModal.lng?.toFixed(6) }}</span></div>
          <div id="claims-map" class="w-full h-72 rounded-xl border border-apex-border overflow-hidden z-0" />
          <a :href="`https://www.google.com/maps?q=${mapModal.lat},${mapModal.lng}`"
             target="_blank"
             class="flex items-center gap-2 text-xs text-primary-400 hover:text-primary-300">
            <i class="fa-solid fa-arrow-up-right-from-square" />Buka di Google Maps
          </a>
        </div>
      </div>
    </div>

    <!-- ─── Lightbox Foto ────────────────────────────────────────────── -->
    <Transition name="fade">
      <div v-if="photoModal.open"
           class="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-4"
           @click.self="photoModal.open = false">
        <div class="w-full max-w-2xl">
          <!-- header -->
          <div class="flex items-center justify-between mb-3 px-1">
            <div>
              <div class="font-mono text-xs text-primary-400">{{ photoModal.claim?.claim_no }}</div>
              <div class="text-sm font-medium text-white">{{ photoModal.claim?.nama_klien }}</div>
              <div class="text-xs text-gray-400">{{ fmt.tgl(photoModal.claim?.tgl_klaim) }} · {{ photoModal.claim?.sales_nama }}</div>
            </div>
            <button @click="photoModal.open = false"
                    class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <i class="fa-solid fa-xmark text-white" />
            </button>
          </div>
          <!-- gambar -->
          <img :src="photoUrl(photoModal.claim?.foto_bukti)"
               class="w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" />
          <!-- footer -->
          <div class="flex justify-center mt-3">
            <a :href="photoUrl(photoModal.claim?.foto_bukti)"
               target="_blank"
               class="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors">
              <i class="fa-solid fa-arrow-up-right-from-square" />Buka di tab baru
            </a>
          </div>
        </div>
      </div>
    </Transition>

    <canvas ref="stampCanvas" class="hidden" />

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show"
           :class="toast.type === 'success' ? 'bg-green-800 border-green-600' : 'bg-red-900 border-red-600'"
           class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-green-400' : 'fa-solid fa-circle-exclamation text-red-400'" />
        {{ toast.msg }}
      </div>
    </Transition>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get, post, put, apiFetch } = useApi()
const fmt  = useFormat()
const auth = useAuthStore()
function photoUrl(path: string | null | undefined) {
  if (!path) return ''
  const fname = path.split('/').pop() ?? ''
  if (fname.startsWith('ent_')) {
    // File dari mobile — tersimpan di laravel public/uploads
    return `/laravel-uploads/${path.replace(/^uploads\//, '')}`
  }
  return `/storage/${path}`
}

const canApprove = computed(() => [1, 2].includes(auth.user?.role_id ?? 0))
const myId       = computed(() => auth.user?.id)

const loading      = ref(true)
const saving       = ref(false)
const locating     = ref(false)
const stamping     = ref(false)
const locError     = ref('')
const filterTahun  = ref(new Date().getFullYear())
const filterBulan  = ref(new Date().getMonth() + 1)
const filterStatus = ref('')
const filterUserId = ref(0)
const years        = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i)
const page         = ref(1)
const perPage      = ref(10)
const totalCount   = ref(0)
const totalPages   = ref(1)

const claims        = ref<any[]>([])
const summary       = ref<any>({})
const limitPerBulan = ref(0)
const leads         = ref<any[]>([])
const salesList     = ref<any[]>([])

const stampCanvas  = ref<HTMLCanvasElement | null>(null)
const photoFile    = ref<File | null>(null)
const photoPreview = ref('')
const stampedBlob  = ref<Blob | null>(null)

const toast = reactive({ show: false, msg: '', type: 'success' as 'success' | 'error' })
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

const formModal   = reactive({ open: false, isNew: true, error: '', form: {} as any })
const detailModal = reactive({ open: false, loading: false, claim: null as any, approvals: [] as any[] })
const mapModal    = reactive({ open: false, claim: null as any, lat: 0, lng: 0 })
const photoModal  = reactive({ open: false, claim: null as any })

function openPhoto(c: any) { photoModal.claim = c; photoModal.open = true }

const pctLimit = computed(() =>
  limitPerBulan.value ? ((summary.value.total_bulan || 0) / limitPerBulan.value) * 100 : 0
)

// ── Load ──────────────────────────────────────────────────────────────────
async function load(resetPage = false) {
  if (resetPage) page.value = 1
  loading.value = true
  try {
    const params: any = { tahun: filterTahun.value, page: page.value, per_page: perPage.value }
    if (filterBulan.value) params.bulan = filterBulan.value
    if (filterStatus.value) params.status = filterStatus.value
    if (filterUserId.value) params.user_id = filterUserId.value
    const res = await get('/v1/entertain/claims', params)
    claims.value        = res.claims || []
    summary.value       = res.summary || {}
    limitPerBulan.value = res.limit_per_bulan || 0
    totalCount.value    = res.total || 0
    totalPages.value    = res.total_pages || 1
  } finally {
    loading.value = false
  }
}

watch([page, perPage], () => load())

async function loadSupport() {
  const [leadsRes, salesArr] = await Promise.all([
    get('/v1/pipeline', { limit: 200 }).catch(() => ({ leads: [] })),
    canApprove.value ? get('/v1/master/sales').catch(() => []) : Promise.resolve([]),
  ])
  leads.value     = leadsRes.leads || []
  salesList.value = Array.isArray(salesArr) ? salesArr : []
}

// ── GPS ───────────────────────────────────────────────────────────────────
function captureLocation() {
  locError.value = ''
  if (!navigator.geolocation) { locError.value = 'Browser tidak mendukung geolocation.'; return }
  locating.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => { formModal.form.lat = pos.coords.latitude; formModal.form.lng = pos.coords.longitude; locating.value = false },
    (err) => { locError.value = err.code === 1 ? 'Izin lokasi ditolak.' : 'Gagal mendapatkan lokasi.'; locating.value = false },
    { timeout: 10000, enableHighAccuracy: true }
  )
}

// ── Foto stamp ────────────────────────────────────────────────────────────
function onPhotoSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  photoFile.value = file; photoPreview.value = ''; stampedBlob.value = null
}
function clearPhoto() { photoFile.value = null; photoPreview.value = ''; stampedBlob.value = null }

async function stampAndPreview() {
  if (!photoFile.value) return
  stamping.value = true
  try {
    const blob = await stampPhoto(photoFile.value)
    stampedBlob.value = blob
    photoPreview.value = URL.createObjectURL(blob)
  } finally { stamping.value = false }
}

async function stampPhoto(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = stampCanvas.value!
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0)
      const now = new Date()
      const lines = [
        now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }),
        now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        formModal.form.lat ? `GPS: ${Number(formModal.form.lat).toFixed(6)}, ${Number(formModal.form.lng).toFixed(6)}` : '',
        formModal.form.lokasi || '',
      ].filter(Boolean)
      const fs = Math.max(18, Math.round(canvas.width * 0.022))
      const pad = Math.round(fs * 0.6), lineH = Math.round(fs * 1.5)
      const boxH = lines.length * lineH + pad * 2
      const boxY = canvas.height - boxH - Math.round(canvas.height * 0.02)
      const boxX = Math.round(canvas.width * 0.02)
      ctx.fillStyle = 'rgba(0,0,0,0.55)'
      ctx.fillRect(boxX, boxY, canvas.width - boxX * 2, boxH)
      ctx.font = `bold ${fs}px monospace`; ctx.fillStyle = '#fff'; ctx.shadowColor = '#000'; ctx.shadowBlur = 4
      lines.forEach((l, i) => ctx.fillText(l, boxX + pad, boxY + pad + fs + i * lineH))
      canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/jpeg', 0.92)
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

// ── Map ───────────────────────────────────────────────────────────────────
let leafletMap: any = null

async function openMap(claim: any) {
  mapModal.claim = claim; mapModal.lat = Number(claim.lat); mapModal.lng = Number(claim.lng); mapModal.open = true
  await nextTick(); await nextTick()
  if (import.meta.client) {
    const L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')
    const container = document.getElementById('claims-map')
    if (!container) return
    if (leafletMap) { leafletMap.remove(); leafletMap = null }
    leafletMap = L.map('claims-map').setView([mapModal.lat, mapModal.lng], 16)
    await addTileLayer(L, leafletMap)
    const icon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
    })
    L.marker([mapModal.lat, mapModal.lng], { icon }).addTo(leafletMap)
      .bindPopup(`<b>${claim.nama_klien}</b><br>${claim.lokasi || ''}`).openPopup()
  }
}
watch(() => mapModal.open, v => { if (!v && leafletMap) { leafletMap.remove(); leafletMap = null } })

// ── CRUD ──────────────────────────────────────────────────────────────────
function openAdd() {
  formModal.isNew = true; formModal.error = ''
  formModal.form  = { tgl_klaim: new Date().toISOString().slice(0, 10), nama_klien: '', lokasi: '', jumlah: 0, keterangan: '', lead_id: '', lat: null, lng: null }
  photoFile.value = null; photoPreview.value = ''; stampedBlob.value = null; locError.value = ''
  formModal.open = true
}

function openEdit(c: any) {
  formModal.isNew = false; formModal.error = ''
  formModal.form  = { ...c, tgl_klaim: c.tgl_klaim?.slice(0, 10), lead_id: c.lead_id || '' }
  photoFile.value = null; photoPreview.value = ''; stampedBlob.value = null; locError.value = ''
  formModal.open = true
}

async function saveClaim() {
  if (!formModal.form.nama_klien || !formModal.form.tgl_klaim || !formModal.form.jumlah) {
    formModal.error = 'Tanggal, nama klien, dan jumlah wajib diisi.'; return
  }
  saving.value = true; formModal.error = ''
  try {
    const payload = {
      tgl_klaim: formModal.form.tgl_klaim, nama_klien: formModal.form.nama_klien,
      lokasi: formModal.form.lokasi || '', lat: formModal.form.lat || null, lng: formModal.form.lng || null,
      jumlah: formModal.form.jumlah, keterangan: formModal.form.keterangan || '',
      lead_id: formModal.form.lead_id || null,
    }
    let claimId: number
    if (formModal.isNew) {
      const res = await post('/v1/entertain/claims', payload)
      claimId = res.id
      if (res.limit_warning) showToast('Klaim diajukan. Peringatan: melebihi limit bulanan!', 'error')
      else showToast(`Klaim ${res.claim_no} berhasil diajukan.`)
    } else {
      await put(`/v1/entertain/claims/${formModal.form.id}`, payload)
      claimId = formModal.form.id
      showToast('Klaim berhasil diupdate.')
    }
    const blobToUpload = stampedBlob.value || (photoFile.value ? new Blob([await photoFile.value.arrayBuffer()], { type: photoFile.value.type }) : null)
    if (blobToUpload) {
      const fd = new FormData()
      fd.append('file', blobToUpload, 'foto_entertain.jpg')
      await apiFetch(`/v1/entertain/claims/${claimId}/photo`, { method: 'POST', body: fd })
    }
    formModal.open = false
    await load()
  } catch (err: any) {
    formModal.error = err?.data?.detail || 'Gagal menyimpan klaim.'
  } finally { saving.value = false }
}

async function openDetail(id: number) {
  detailModal.open = true; detailModal.loading = true; detailModal.claim = null; detailModal.approvals = []
  try {
    const res = await get(`/v1/entertain/claims/${id}`)
    detailModal.claim = res.claim; detailModal.approvals = res.approvals || []
  } finally { detailModal.loading = false }
}

async function cancelClaim(c: any) {
  if (!confirm(`Batalkan klaim ${c.claim_no}?`)) return
  try {
    await apiFetch(`/v1/entertain/claims/${c.id}/cancel`, { method: 'PATCH' })
    showToast('Klaim dibatalkan.')
    await load()
  } catch (err: any) {
    showToast(err?.data?.detail || 'Gagal membatalkan.', 'error')
  }
}

function statusBadge(s: string): string {
  const map: Record<string, string> = {
    'Pending':   'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/50 text-yellow-300',
    'Approved':  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-300',
    'Rejected':  'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400',
    'Cancelled': 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-500',
  }
  return map[s] ?? 'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400'
}
function monthName(m: number): string {
  return new Date(2000, m - 1, 1).toLocaleString('id-ID', { month: 'long' })
}

onMounted(() => { load(); loadSupport() })
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
