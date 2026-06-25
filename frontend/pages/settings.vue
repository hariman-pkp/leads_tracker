<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-gear text-primary-400 mr-2" />Pengaturan Aplikasi</h1>
        <p class="page-subtitle">Konfigurasi sistem APEX — hanya dapat diubah oleh Admin</p>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-24 text-apex-muted">
      <i class="fa-solid fa-spinner fa-spin mr-2" />Memuat pengaturan...
    </div>

    <template v-else>

      <!-- Target Sales -->
      <div class="card mb-5">
        <div class="section-title mb-4">
          <i class="fa-solid fa-bullseye mr-1.5 text-yellow-400" />Pengaturan Target Sales
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

          <!-- Target Lock Date -->
          <div>
            <label class="form-label">Tanggal Kunci Target Sales</label>
            <p class="text-xs text-apex-muted mb-2">
              Setelah tanggal ini, target sales tidak bisa diubah oleh Manager/Sales.
              Biarkan kosong jika target selalu terbuka.
            </p>
            <div class="flex gap-2">
              <input v-model="form.target_lock_date" type="date" class="form-input flex-1" />
              <button @click="saveSetting('target_lock_date', form.target_lock_date)"
                      :disabled="saving === 'target_lock_date'"
                      class="btn-primary btn-sm">
                <i :class="saving === 'target_lock_date' ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'" />
                Simpan
              </button>
              <button v-if="form.target_lock_date" @click="clearSetting('target_lock_date')"
                      :disabled="saving === 'target_lock_date'"
                      class="btn-secondary btn-sm" title="Hapus lock date">
                <i class="fa-solid fa-xmark" />
              </button>
            </div>
            <div v-if="current.target_lock_date" class="mt-2 text-xs"
                 :class="isLocked ? 'text-red-400' : 'text-emerald-400'">
              <i :class="isLocked ? 'fa-solid fa-lock mr-1' : 'fa-solid fa-lock-open mr-1'" />
              {{ isLocked ? 'Target saat ini TERKUNCI' : 'Target saat ini TERBUKA' }}
              — dikunci pada {{ fmt.tgl(current.target_lock_date) }}
            </div>
            <div v-else class="mt-2 text-xs text-apex-muted">
              <i class="fa-solid fa-lock-open mr-1" />Target tidak dikunci (tidak ada lock date)
            </div>
          </div>

        </div>
      </div>

      <!-- Map Tile -->
      <div class="card mb-5">
        <div class="section-title mb-1">
          <i class="fa-solid fa-map mr-1.5 text-blue-400" />Tampilan Peta
        </div>
        <p class="text-xs text-gray-500 mb-4">Berlaku di semua fitur yang menampilkan peta. Semua opsi menggunakan data <span class="text-gray-300 font-medium">OpenStreetMap</span>.</p>

        <!-- Pilihan tile -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <label v-for="opt in mapTileOptions" :key="opt.key"
                 :class="form.map_tile === opt.key ? 'border-primary-500 bg-primary-900/20' : 'border-navy-600 hover:border-navy-500'"
                 class="relative flex flex-col gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all">
            <input type="radio" v-model="form.map_tile" :value="opt.key" class="sr-only" />
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-sm font-medium text-white">{{ opt.label }}</span>
              <span v-if="opt.recommended" class="text-xs px-2 py-0.5 rounded-full bg-primary-900/60 text-primary-300 border border-primary-700/50">Rekomendasi</span>
              <span v-if="opt.key === 'osm'" class="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400">Default</span>
            </div>
            <p class="text-xs text-gray-500 leading-relaxed">{{ opt.desc }}</p>
            <div v-if="form.map_tile === opt.key" class="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
              <i class="fa-solid fa-check text-white" style="font-size:8px" />
            </div>
          </label>
        </div>

        <!-- Comparison table -->
        <div class="mb-5">
          <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Perbandingan Opsi</div>
          <div class="overflow-x-auto rounded-xl border border-navy-700">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-navy-700 bg-navy-800/60">
                  <th class="text-left px-3 py-2 text-gray-500 font-medium">Aspek</th>
                  <th v-for="opt in mapTileOptions" :key="opt.key"
                      class="text-center px-3 py-2 font-medium"
                      :class="form.map_tile === opt.key ? 'text-primary-300' : 'text-gray-400'">
                    {{ opt.label }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-navy-800/60">
                <tr v-for="row in tileComparison" :key="row.aspect" class="hover:bg-navy-800/30 transition-colors">
                  <td class="px-3 py-2 text-gray-400">{{ row.aspect }}</td>
                  <td v-for="(val, i) in row.values" :key="i"
                      class="px-3 py-2 text-center"
                      :class="[val.color, form.map_tile === mapTileOptions[i].key ? 'bg-primary-900/10' : '']">
                    <span v-html="val.text" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Usage monitor -->
        <div class="mb-5 p-4 rounded-xl border border-navy-700 bg-navy-800/30">
          <div class="flex items-center justify-between mb-3">
            <div class="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <i class="fa-solid fa-chart-simple mr-1.5 text-blue-400" />Penggunaan Tile Bulan Ini
            </div>
            <button @click="loadTileUsage" class="text-xs text-gray-500 hover:text-gray-300 transition">
              <i class="fa-solid fa-rotate" /> Refresh
            </button>
          </div>
          <div v-if="loadingUsage" class="text-xs text-gray-600 py-2">Memuat...</div>
          <template v-else>
            <!-- Current month -->
            <div class="mb-3">
              <div class="flex items-center justify-between mb-1.5">
                <span class="text-xs text-gray-400">{{ currentMonthLabel }}</span>
                <span class="text-sm font-bold" :class="usagePct >= 90 ? 'text-red-400' : usagePct >= 70 ? 'text-yellow-400' : 'text-emerald-400'">
                  {{ fmt.num(currentUsage) }}
                  <span class="text-xs font-normal text-gray-500">
                    {{ tileLimit > 0 ? `/ ${fmt.num(tileLimit)} req` : 'req (no limit)' }}
                  </span>
                </span>
              </div>
              <div v-if="tileLimit > 0" class="h-2.5 rounded-full bg-navy-700 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700"
                     :class="usagePct >= 90 ? 'bg-red-500' : usagePct >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'"
                     :style="`width:${Math.min(usagePct, 100)}%`" />
              </div>
              <div v-if="tileLimit > 0" class="flex justify-between mt-1 text-xs text-gray-600">
                <span>{{ usagePct.toFixed(1) }}% dari batas gratis</span>
                <span :class="tileLimit - currentUsage < 10000 ? 'text-red-400' : 'text-gray-500'">
                  Sisa {{ fmt.num(tileLimit - currentUsage) }} req
                </span>
              </div>
              <p v-if="tileLimit === 0" class="text-xs text-gray-600 mt-1">
                OSM Standard & HOT tidak memiliki limit angka pasti — gunakan dengan wajar sesuai fair-use policy.
              </p>
            </div>
            <!-- History 3 bulan -->
            <div v-if="usageHistory.length > 1">
              <div class="text-xs text-gray-600 mb-1.5">Riwayat 3 bulan terakhir</div>
              <div class="flex gap-2">
                <div v-for="h in usageHistory.slice(0,3)" :key="h.month"
                     class="flex-1 bg-navy-800/60 rounded-lg px-2.5 py-2 text-center">
                  <div class="text-xs text-gray-500">{{ h.month }}</div>
                  <div class="text-sm font-semibold text-gray-300 mt-0.5">{{ fmt.num(h.count) }}</div>
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="flex items-center gap-3">
          <button @click="saveSetting('map_tile', form.map_tile)"
                  :disabled="saving === 'map_tile'"
                  class="btn-primary btn-sm">
            <i :class="saving === 'map_tile' ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'" />
            Simpan Pilihan Peta
          </button>
          <span v-if="current.map_tile" class="text-xs text-gray-500">
            Aktif: <span class="text-gray-300">{{ mapTileOptions.find(o => o.key === current.map_tile)?.label ?? current.map_tile }}</span>
          </span>
        </div>
      </div>

      <!-- Template Follow-Up -->
      <div class="card mb-5">
        <div class="section-title mb-4">
          <i class="fa-solid fa-comment-dots mr-1.5 text-blue-400" />Template Follow-Up
        </div>
        <p class="text-xs text-gray-500 mb-4">Preset catatan FU yang bisa dipilih cepat saat mencatat follow-up di detail lead.</p>

        <!-- Form tambah -->
        <form @submit.prevent="addFuTemplate" class="mb-4 p-3 bg-navy-800/50 rounded-lg border border-navy-700 space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label class="form-label">Nama Template</label>
              <input v-model="tplForm.nama" class="form-input" placeholder="cth: Tidak Ada Respons" required />
            </div>
            <div>
              <label class="form-label">Hasil FU (opsional)</label>
              <select v-model="tplForm.hasil_fu" class="form-select">
                <option value="">— tidak di-set —</option>
                <option>Interested</option><option>Follow Up Later</option>
                <option>Send Proposal</option><option>Not Interested</option><option>No Response</option>
              </select>
            </div>
            <div>
              <label class="form-label">Metode FU (opsional)</label>
              <select v-model="tplForm.metode_fu" class="form-select">
                <option value="">— tidak di-set —</option>
                <option>Phone</option><option>WhatsApp</option><option>Email</option>
                <option>Meeting</option><option>Video Call</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label">Isi Catatan</label>
            <textarea v-model="tplForm.catatan" class="form-textarea h-16" placeholder="Teks catatan default..." required />
          </div>
          <div class="flex justify-end">
            <button type="submit" class="btn-primary btn-sm" :disabled="savingTpl">
              <i :class="savingTpl ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-plus'" />
              Tambah Template
            </button>
          </div>
        </form>

        <!-- List template -->
        <div v-if="!fuTemplates.length" class="text-xs text-gray-600 py-4 text-center">Belum ada template.</div>
        <div v-else class="space-y-2">
          <div v-for="t in fuTemplates" :key="t.id"
               class="flex gap-3 items-start p-3 bg-navy-800/30 rounded-lg border border-navy-700/40">
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-200">{{ t.nama }}</div>
              <div class="flex gap-2 mt-0.5">
                <span v-if="t.hasil_fu" class="text-xs text-primary-400">{{ t.hasil_fu }}</span>
                <span v-if="t.metode_fu" class="text-xs text-gray-500">{{ t.metode_fu }}</span>
              </div>
              <div class="text-xs text-gray-400 mt-1 line-clamp-2">{{ t.catatan }}</div>
            </div>
            <button @click="deleteFuTemplate(t.id)" class="text-red-400 hover:text-red-300 text-xs flex-shrink-0 mt-0.5">
              <i class="fa-solid fa-trash" />
            </button>
          </div>
        </div>
      </div>

      <!-- Toast -->
      <Transition name="toast">
        <div v-if="toast.show"
             :class="toast.type === 'success' ? 'bg-green-800 border-green-600' : 'bg-red-900 border-red-600'"
             class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm">
          <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-green-400' : 'fa-solid fa-circle-exclamation text-red-400'" />
          {{ toast.msg }}
        </div>
      </Transition>

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get, put } = useApi()
const fmt = useFormat()
const auth = useAuthStore()

if (auth.user?.role_id !== 1) {
  await navigateTo('/')
}

const loading = ref(true)
const saving  = ref<string | null>(null)
const current = ref<Record<string, string>>({})
const form    = reactive({ target_lock_date: '', map_tile: 'osm' })
const toast   = reactive({ show: false, msg: '', type: 'success' as 'success' | 'error' })

const mapTileOptions = [
  { key: 'osm',             label: 'OSM Standard',       recommended: true,  desc: 'Tampilan OpenStreetMap default. Berwarna dan detail.' },
  { key: 'voyager',         label: 'CartoDB Voyager',    recommended: false, desc: 'Data OSM, rendering bersih & modern.' },
  { key: 'hot',             label: 'OSM Humanitarian',   recommended: false, desc: 'Variant OSM dengan skema warna lebih terang.' },
  { key: 'voyager_nolabel', label: 'Voyager No Label',   recommended: false, desc: 'Paling minimal — tanpa label jalan, fokus ke marker.' },
]

type CellVal = { text: string; color: string }
const tileComparison: { aspect: string; values: CellVal[] }[] = [
  {
    aspect: 'Biaya',
    values: [
      { text: 'Gratis', color: 'text-emerald-400' },
      { text: 'Gratis &lt;75k/bln', color: 'text-emerald-400' },
      { text: 'Gratis', color: 'text-emerald-400' },
      { text: 'Gratis &lt;75k/bln', color: 'text-emerald-400' },
    ],
  },
  {
    aspect: 'Limit request',
    values: [
      { text: 'Fair use*', color: 'text-yellow-400' },
      { text: '75.000/bln', color: 'text-blue-300' },
      { text: 'Fair use*', color: 'text-yellow-400' },
      { text: '75.000/bln', color: 'text-blue-300' },
    ],
  },
  {
    aspect: 'Sumber data',
    values: [
      { text: 'OSM', color: 'text-gray-300' },
      { text: 'OSM + CartoDB', color: 'text-gray-300' },
      { text: 'OSM', color: 'text-gray-300' },
      { text: 'OSM + CartoDB', color: 'text-gray-300' },
    ],
  },
  {
    aspect: 'Tampilan',
    values: [
      { text: 'Ramai, berwarna', color: 'text-gray-400' },
      { text: 'Bersih, modern', color: 'text-primary-300' },
      { text: 'Cerah, terang', color: 'text-gray-400' },
      { text: 'Minimal', color: 'text-gray-400' },
    ],
  },
  {
    aspect: 'Label jalan',
    values: [
      { text: '✓ Ada', color: 'text-gray-300' },
      { text: '✓ Ada', color: 'text-gray-300' },
      { text: '✓ Ada', color: 'text-gray-300' },
      { text: '✗ Tidak ada', color: 'text-gray-500' },
    ],
  },
  {
    aspect: 'Update peta',
    values: [
      { text: 'Real-time', color: 'text-emerald-400' },
      { text: '~1 minggu', color: 'text-gray-400' },
      { text: 'Real-time', color: 'text-emerald-400' },
      { text: '~1 minggu', color: 'text-gray-400' },
    ],
  },
  {
    aspect: 'Penggunaan komersial',
    values: [
      { text: 'Tidak dianjurkan', color: 'text-red-400' },
      { text: 'OK (s/d limit)', color: 'text-emerald-400' },
      { text: 'Non-komersial', color: 'text-yellow-400' },
      { text: 'OK (s/d limit)', color: 'text-emerald-400' },
    ],
  },
]

// ── Tile Usage ───────────────────────────────────────────────────
const loadingUsage  = ref(false)
const usageData     = ref<Record<string, number>>({})

const TILE_LIMITS: Record<string, number> = {
  osm: 0, hot: 0, voyager: 75000, voyager_nolabel: 75000,
}
const tileLimit = computed(() => TILE_LIMITS[form.map_tile] ?? 0)

const currentMonthKey = computed(() => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
})
const currentUsage  = computed(() => usageData.value[currentMonthKey.value] ?? 0)
const usagePct      = computed(() => tileLimit.value > 0 ? currentUsage.value / tileLimit.value * 100 : 0)
const currentMonthLabel = computed(() => {
  const [y, m] = currentMonthKey.value.split('-')
  const names = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
  return `${names[Number(m) - 1]} ${y}`
})
const usageHistory = computed(() =>
  Object.entries(usageData.value)
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, count]) => {
      const [y, m] = month.split('-')
      const names = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
      return { month: `${names[Number(m) - 1]} ${y}`, count }
    })
)

async function loadTileUsage() {
  loadingUsage.value = true
  try {
    usageData.value = await get('/v1/tile-usage')
  } catch { /* ignore */ }
  finally { loadingUsage.value = false }
}

const isLocked = computed(() => {
  if (!current.value.target_lock_date) return false
  return new Date() > new Date(current.value.target_lock_date)
})

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.msg  = msg
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

async function load() {
  loading.value = true
  try {
    const res = await get('/v1/app-settings')
    current.value = res ?? {}
    form.target_lock_date = current.value.target_lock_date ?? ''
    form.map_tile         = current.value.map_tile ?? 'osm'
  } finally {
    loading.value = false
  }
}

async function saveSetting(key: string, value: string) {
  saving.value = key
  try {
    await put(`/v1/app-settings/${key}`, { value: value || '' })
    current.value[key] = value
    if (key === 'map_tile') resetMapTileCache()
    showToast('Pengaturan berhasil disimpan.')
  } catch (err: any) {
    showToast(err?.data?.detail || 'Gagal menyimpan pengaturan.', 'error')
  } finally {
    saving.value = null
  }
}

async function clearSetting(key: string) {
  form.target_lock_date = ''
  await saveSetting(key, '')
  current.value[key] = ''
}

// ── FU Templates ─────────────────────────────────────────────────────────
const fuTemplates = ref<any[]>([])
const savingTpl   = ref(false)
const tplForm     = reactive({ nama: '', catatan: '', hasil_fu: '', metode_fu: '' })

const { post: apiPost, del: apiDel } = useApi()

async function loadFuTemplates() {
  try { fuTemplates.value = await get('/v1/fu-templates') } catch {}
}

async function addFuTemplate() {
  savingTpl.value = true
  try {
    await apiPost('/v1/fu-templates', { ...tplForm })
    Object.assign(tplForm, { nama: '', catatan: '', hasil_fu: '', metode_fu: '' })
    await loadFuTemplates()
  } catch {}
  finally { savingTpl.value = false }
}

async function deleteFuTemplate(id: number) {
  if (!confirm('Hapus template ini?')) return
  try { await apiDel(`/v1/fu-templates/${id}`); await loadFuTemplates() } catch {}
}

onMounted(async () => {
  await load()
  loadTileUsage()
  loadFuTemplates()
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
