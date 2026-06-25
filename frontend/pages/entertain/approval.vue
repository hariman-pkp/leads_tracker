<template>
  <div class="min-h-screen bg-apex-bg text-apex-text p-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-apex-text">
          <i class="fa-solid fa-circle-check text-emerald-400 mr-2" />Approval Klaim Entertain
        </h1>
        <p class="text-sm text-apex-muted mt-0.5">Review dan setujui pengajuan klaim dari tim sales</p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <select v-model="filterTahun" @change="load(true)" class="form-select text-sm w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="filterBulan" @change="load(true)" class="form-select text-sm w-36">
          <option :value="0">Semua Bulan</option>
          <option v-for="m in 12" :key="m" :value="m">{{ monthName(m) }}</option>
        </select>
        <select v-model="filterStatus" @change="load(true)" class="form-select text-sm w-36">
          <option value="Pending">Pending</option>
          <option value="">Semua Status</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <NuxtLink to="/entertain" class="btn-ghost flex items-center gap-2 text-sm">
          <i class="fa-solid fa-chart-bar" /> Dashboard
        </NuxtLink>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="apex-card border-yellow-700/40">
        <div class="text-xs text-apex-muted mb-1">Menunggu Approval</div>
        <div class="text-3xl font-bold text-yellow-400">{{ summary.pending || 0 }}</div>
        <div class="text-xs text-apex-faint mt-0.5">klaim pending</div>
      </div>
      <div class="apex-card">
        <div class="text-xs text-apex-muted mb-1">Total Diajukan</div>
        <div class="text-2xl font-bold text-apex-text">{{ fmt.rupiah(summary.total_bulan || 0) }}</div>
        <div class="text-xs text-apex-faint mt-0.5">{{ filterBulan ? monthName(filterBulan) : 'Tahun ' + filterTahun }}</div>
      </div>
      <div class="apex-card border-emerald-700/40">
        <div class="text-xs text-apex-muted mb-1">Approved</div>
        <div class="text-2xl font-bold text-emerald-400">{{ summary.approved || 0 }}</div>
      </div>
      <div class="apex-card border-red-700/40">
        <div class="text-xs text-apex-muted mb-1">Rejected</div>
        <div class="text-2xl font-bold text-red-400">{{ summary.rejected || 0 }}</div>
      </div>
    </div>

    <!-- Tabel klaim -->
    <div v-if="loading" class="flex justify-center py-20 text-apex-muted">
      <i class="fa-solid fa-spinner fa-spin mr-2" />Memuat data...
    </div>

    <div v-else class="apex-card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-apex-border">
            <th class="text-left py-3 px-3 text-apex-muted font-medium">No. Klaim</th>
            <th class="text-left py-3 px-3 text-apex-muted font-medium">Sales</th>
            <th class="text-left py-3 px-3 text-apex-muted font-medium">Tanggal</th>
            <th class="text-left py-3 px-3 text-apex-muted font-medium">Nama Klien</th>
            <th class="text-left py-3 px-3 text-apex-muted font-medium">Lokasi</th>
            <th class="text-left py-3 px-3 text-apex-muted font-medium">Leads</th>
            <th class="text-center py-3 px-3 text-apex-muted font-medium w-16">Foto</th>
            <th class="text-right py-3 px-3 text-apex-muted font-medium">Jumlah</th>
            <th class="text-center py-3 px-3 text-apex-muted font-medium">Status</th>
            <th class="text-center py-3 px-3 text-apex-muted font-medium w-28">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="claims.length === 0">
            <td colspan="10" class="text-center py-12 text-apex-faint">
              Tidak ada klaim untuk filter ini.
            </td>
          </tr>
          <tr v-for="c in claims" :key="c.id"
              class="border-b border-apex-border hover:bg-apex-card/30 transition-colors">
            <td class="py-2.5 px-3">
              <span class="font-mono text-xs text-primary-400">{{ c.claim_no }}</span>
              <i v-if="c.limit_warning" class="fa-solid fa-triangle-exclamation text-yellow-400 ml-1.5 text-xs"
                 title="Melebihi limit bulanan" />
            </td>
            <td class="py-2.5 px-3 font-medium text-apex-text">{{ c.sales_nama }}</td>
            <td class="py-2.5 px-3 text-apex-muted whitespace-nowrap">{{ fmt.tgl(c.tgl_klaim) }}</td>
            <td class="py-2.5 px-3 text-apex-text">{{ c.nama_klien }}</td>
            <td class="py-2.5 px-3">
              <div v-if="c.lat && c.lng" class="flex items-center gap-1.5">
                <span class="text-xs text-apex-muted truncate max-w-[90px]" :title="c.lokasi">
                  {{ c.lokasi || `${Number(c.lat).toFixed(4)},${Number(c.lng).toFixed(4)}` }}
                </span>
                <button @click="openMap(c)" class="text-primary-400 hover:text-primary-300 flex-shrink-0" title="Lihat peta">
                  <i class="fa-solid fa-map-location-dot text-xs" />
                </button>
              </div>
              <span v-else-if="c.lokasi" class="text-xs text-apex-muted">{{ c.lokasi }}</span>
              <span v-else class="text-xs text-apex-faint">—</span>
            </td>
            <td class="py-2.5 px-3 text-xs text-apex-muted">{{ c.lead_nama || '—' }}</td>
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
              <button @click="openDetail(c.id)"
                      class="text-primary-400 hover:text-primary-300 transition-colors mr-1" title="Detail">
                <i class="fa-solid fa-eye" />
              </button>
              <template v-if="c.status === 'Pending'">
                <button @click="openApprove(c, 'Approved')"
                        class="text-emerald-400 hover:text-emerald-300 mr-1" title="Approve">
                  <i class="fa-solid fa-check" />
                </button>
                <button @click="openApprove(c, 'Rejected')"
                        class="text-red-400 hover:text-red-300" title="Reject">
                  <i class="fa-solid fa-xmark" />
                </button>
              </template>
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
          <button v-if="detailModal.claim?.status === 'Pending'"
                  @click="openApprove(detailModal.claim, 'Approved'); detailModal.open = false"
                  class="btn-primary">
            <i class="fa-solid fa-check mr-1" />Approve
          </button>
          <button v-if="detailModal.claim?.status === 'Pending'"
                  @click="openApprove(detailModal.claim, 'Rejected'); detailModal.open = false"
                  class="btn-danger">
            <i class="fa-solid fa-xmark mr-1" />Reject
          </button>
          <button @click="detailModal.open = false" class="btn-ghost">Tutup</button>
        </div>
      </div>
    </div>

    <!-- ─── Modal Approve / Reject ──────────────────────────────────── -->
    <div v-if="approveModal.open"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-apex-border">
          <h2 class="text-lg font-semibold"
              :class="approveModal.action === 'Approved' ? 'text-emerald-400' : 'text-red-400'">
            <i :class="approveModal.action === 'Approved' ? 'fa-solid fa-check mr-2' : 'fa-solid fa-xmark mr-2'" />
            {{ approveModal.action === 'Approved' ? 'Setujui' : 'Tolak' }} Klaim
          </h2>
          <button @click="approveModal.open = false" class="text-apex-muted hover:text-apex-text">
            <i class="fa-solid fa-xmark text-xl" />
          </button>
        </div>
        <div class="p-5 space-y-4">
          <div class="bg-apex-card rounded-xl p-3 text-sm">
            <div class="font-mono text-primary-400 text-xs mb-1">{{ approveModal.claim?.claim_no }}</div>
            <div class="font-medium text-apex-text">{{ approveModal.claim?.nama_klien }}</div>
            <div class="text-apex-muted">{{ approveModal.claim?.sales_nama }} · {{ fmt.rupiah(approveModal.claim?.jumlah) }}</div>
          </div>
          <div>
            <label class="form-label">
              Catatan <span v-if="approveModal.action === 'Rejected'" class="text-red-400">*</span>
              <span v-else class="text-apex-muted text-xs">(opsional)</span>
            </label>
            <textarea v-model="approveModal.catatan" rows="3" class="form-input resize-none"
                      :placeholder="approveModal.action === 'Rejected' ? 'Alasan penolakan...' : 'Catatan tambahan (opsional)'" />
          </div>
          <div v-if="approveModal.error" class="text-xs text-red-400">
            <i class="fa-solid fa-circle-exclamation mr-1" />{{ approveModal.error }}
          </div>
        </div>
        <div class="flex justify-end gap-3 p-5 border-t border-apex-border">
          <button @click="approveModal.open = false" class="btn-ghost">Batal</button>
          <button @click="submitApproval" :disabled="saving"
                  :class="approveModal.action === 'Approved' ? 'btn-primary' : 'btn-danger'">
            <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-1" />
            {{ approveModal.action === 'Approved' ? 'Setujui' : 'Tolak' }}
          </button>
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
          <div class="text-xs text-apex-muted">
            {{ mapModal.claim?.lokasi }} · <span class="font-mono">{{ mapModal.lat?.toFixed(6) }}, {{ mapModal.lng?.toFixed(6) }}</span>
          </div>
          <div id="approval-map" class="w-full h-64 rounded-xl border border-apex-border overflow-hidden z-0" />
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
          <img :src="photoUrl(photoModal.claim?.foto_bukti)"
               class="w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" />
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

const { get, post } = useApi()
const fmt  = useFormat()
const auth = useAuthStore()
function photoUrl(path: string | null | undefined) {
  if (!path) return ''
  const fname = path.split('/').pop() ?? ''
  if (fname.startsWith('ent_')) {
    return `/laravel-uploads/${path.replace(/^uploads\//, '')}`
  }
  return `/storage/${path}`
}

onMounted(() => {
  const allowed = auth.user?.allowed_menus ?? []
  const isAdmin = auth.user?.role_id === 1
  if (!isAdmin && !allowed.includes('entertain_approval')) {
    navigateTo('/entertain')
  }
})

const loading      = ref(true)
const saving       = ref(false)
const filterTahun  = ref(new Date().getFullYear())
const filterBulan  = ref(0)
const filterStatus = ref('Pending')
const years        = Array.from({ length: 3 }, (_, i) => new Date().getFullYear() - i)

const claims     = ref<any[]>([])
const summary    = ref<any>({})
const page       = ref(1)
const perPage    = ref(10)
const totalCount = ref(0)
const totalPages = ref(1)

const toast = reactive({ show: false, msg: '', type: 'success' as 'success' | 'error' })
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

const detailModal  = reactive({ open: false, loading: false, claim: null as any, approvals: [] as any[] })
const approveModal = reactive({ open: false, action: '', catatan: '', claim: null as any, error: '' })
const mapModal     = reactive({ open: false, claim: null as any, lat: 0, lng: 0 })
const photoModal   = reactive({ open: false, claim: null as any })

function openPhoto(c: any) { photoModal.claim = c; photoModal.open = true }

async function load(resetPage = false) {
  if (resetPage) page.value = 1
  loading.value = true
  try {
    const params: any = { tahun: filterTahun.value, page: page.value, per_page: perPage.value }
    if (filterBulan.value) params.bulan = filterBulan.value
    if (filterStatus.value) params.status = filterStatus.value
    const res = await get('/v1/entertain/claims', params)
    claims.value     = res.claims || []
    summary.value    = res.summary || {}
    totalCount.value = res.total || 0
    totalPages.value = res.total_pages || 1
  } finally {
    loading.value = false
  }
}

watch([page, perPage], () => load())

async function openDetail(id: number) {
  detailModal.open = true; detailModal.loading = true; detailModal.claim = null; detailModal.approvals = []
  try {
    const res = await get(`/v1/entertain/claims/${id}`)
    detailModal.claim = res.claim; detailModal.approvals = res.approvals || []
  } finally { detailModal.loading = false }
}

function openApprove(claim: any, action: string) {
  approveModal.claim = claim; approveModal.action = action; approveModal.catatan = ''; approveModal.error = ''; approveModal.open = true
}

async function submitApproval() {
  if (approveModal.action === 'Rejected' && !approveModal.catatan.trim()) {
    approveModal.error = 'Catatan wajib diisi untuk penolakan.'; return
  }
  saving.value = true; approveModal.error = ''
  try {
    await post(`/v1/entertain/claims/${approveModal.claim.id}/approve`, {
      action: approveModal.action, catatan: approveModal.catatan,
    })
    approveModal.open = false
    showToast(approveModal.action === 'Approved' ? 'Klaim disetujui.' : 'Klaim ditolak.')
    await load()
  } catch (err: any) {
    approveModal.error = err?.data?.detail || 'Gagal memproses approval.'
  } finally { saving.value = false }
}

// Map
let leafletMap: any = null
async function openMap(claim: any) {
  mapModal.claim = claim; mapModal.lat = Number(claim.lat); mapModal.lng = Number(claim.lng); mapModal.open = true
  await nextTick(); await nextTick()
  if (import.meta.client) {
    const L = (await import('leaflet')).default
    await import('leaflet/dist/leaflet.css')
    const container = document.getElementById('approval-map')
    if (!container) return
    if (leafletMap) { leafletMap.remove(); leafletMap = null }
    leafletMap = L.map('approval-map').setView([mapModal.lat, mapModal.lng], 16)
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

onMounted(load)
</script>

<style scoped>
.btn-danger { @apply px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors flex items-center gap-1; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
