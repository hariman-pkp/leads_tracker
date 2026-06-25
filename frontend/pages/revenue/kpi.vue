<template>
  <div class="min-h-screen bg-apex-bg text-apex-text p-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-apex-text">KPI Prospecting</h1>
        <p class="text-sm text-apex-muted mt-0.5">Monitoring kinerja prospecting & pipeline penjualan</p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <!-- Lock status badge -->
        <div v-if="lockDate" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
             :class="isTargetLocked ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50'">
          <i :class="isTargetLocked ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open'" />
          {{ isTargetLocked ? 'Target Terkunci' : 'Target Terbuka' }}
          <span class="opacity-70">· s/d {{ new Date(lockDate).toLocaleDateString('id-ID', {day:'numeric',month:'short',year:'numeric'}) }}</span>
        </div>
        <!-- Filter Tahun -->
        <select v-model="selectedYear" @change="loadData"
                class="form-select text-sm w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <!-- Tambah KPI (admin, hanya jika tidak locked) -->
        <button v-if="isAdmin" @click="openAdd"
                class="btn-primary flex items-center gap-2 text-sm">
          <i class="fa-solid fa-plus" /> Tambah KPI
        </button>
      </div>
    </div>

    <!-- Admin: panel pengaturan lock date -->
    <div v-if="isAdmin" class="mb-5 card flex flex-wrap items-center gap-4">
      <div class="flex items-center gap-2 text-sm font-medium text-apex-muted">
        <i class="fa-solid fa-calendar-lock text-primary-400" />
        Kunci Target Setelah Tanggal:
      </div>
      <input v-model="lockInput" type="date" class="form-input w-44 text-sm" />
      <button @click="saveLockDate" :disabled="lockSaving" class="btn-primary btn-sm">
        <i v-if="lockSaving" class="fa-solid fa-spinner fa-spin" />
        <i v-else class="fa-solid fa-floppy-disk" />
        Simpan
      </button>
      <p class="text-xs text-apex-muted">
        Setelah tanggal ini, non-admin tidak dapat mengubah nilai target.
        Admin tetap bisa edit kapan saja.
      </p>
    </div>

    <!-- Banner: target locked (non-admin) -->
    <div v-if="isTargetLocked && !isAdmin"
         class="mb-5 flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-xl px-4 py-3 text-sm text-red-300">
      <i class="fa-solid fa-lock text-red-400 text-base" />
      <span>Target tahun {{ selectedYear }} sudah dikunci sejak
        <strong>{{ new Date(lockDate).toLocaleDateString('id-ID', {day:'numeric',month:'long',year:'numeric'}) }}</strong>.
        Hubungi admin untuk perubahan target.
      </span>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20 text-apex-muted">
      <i class="fa-solid fa-spinner fa-spin mr-2" /> Memuat data...
    </div>

    <template v-else>
      <!-- Summary cards per Q -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div v-for="q in [1,2,3,4]" :key="q"
             :class="['rounded-xl border p-4 transition-all',
                      curQ === q ? 'border-primary-500 bg-primary-900/20' : 'border-apex-border bg-apex-surface']">
          <div class="text-xs text-apex-muted font-medium mb-1">
            Q{{ q }}
            <span v-if="curQ === q" class="ml-1 text-primary-400 text-[10px]">● Berjalan</span>
          </div>
          <div class="text-sm font-semibold text-apex-text">
            {{ qLabel(q) }}
          </div>
          <div class="mt-2 text-xs text-apex-faint">
            {{ qKpiCount(q) }} KPI terpantau
          </div>
        </div>
      </div>

      <!-- Tabel per kategori -->
      <div v-for="cat in categories" :key="cat" class="mb-6">
        <div class="flex items-center gap-2 mb-2">
          <span class="text-xs font-bold uppercase tracking-widest text-primary-400">{{ cat }}</span>
          <div class="flex-1 h-px bg-apex-card" />
        </div>
        <div class="card overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-apex-border">
                <th class="text-left py-2.5 px-3 text-apex-muted font-medium w-64">Indikator</th>
                <th class="text-center py-2.5 px-2 text-apex-muted font-medium w-16">Unit</th>
                <th class="text-center py-2.5 px-2 text-apex-muted font-medium w-12">Auto</th>
                <!-- Q1 -->
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24 border-l border-apex-border">
                  Q1 Target
                </th>
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24">Q1 Aktual</th>
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-16">Ach%</th>
                <!-- Q2 -->
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24 border-l border-apex-border">
                  Q2 Target
                </th>
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24">Q2 Aktual</th>
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-16">Ach%</th>
                <!-- Q3 -->
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24 border-l border-apex-border">
                  Q3 Target
                </th>
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24">Q3 Aktual</th>
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-16">Ach%</th>
                <!-- Q4 -->
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24 border-l border-apex-border">
                  Q4 Target
                </th>
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24">Q4 Aktual</th>
                <th class="text-right py-2.5 px-2 text-apex-faint font-medium w-16">Ach%</th>
                <!-- Actions -->
                <th class="py-2.5 px-3 w-20 text-center text-apex-muted font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="kpi in kpiByCategory(cat)" :key="kpi.id"
                  class="border-b border-apex-border hover:bg-apex-card/30 transition-colors">
                <td class="py-2.5 px-3 font-medium text-apex-text">{{ kpi.kpi_name }}</td>
                <td class="py-2.5 px-2 text-center text-xs text-apex-muted">{{ kpi.unit }}</td>
                <td class="py-2.5 px-2 text-center">
                  <span v-if="kpi.is_auto" title="Dihitung otomatis dari database"
                        class="inline-flex items-center justify-center w-5 h-5 rounded-full
                               bg-emerald-900/50 text-emerald-400 text-[10px]">
                    <i class="fa-solid fa-bolt" />
                  </span>
                  <span v-else title="Entry manual"
                        class="inline-flex items-center justify-center w-5 h-5 rounded-full
                               bg-apex-card text-apex-faint text-[10px]">
                    <i class="fa-solid fa-pen" />
                  </span>
                </td>
                <!-- Q1 -->
                <td class="py-2.5 px-2 text-right text-apex-muted border-l border-apex-border">
                  {{ fmtVal(kpi.q1_target, kpi.unit) }}
                </td>
                <td class="py-2.5 px-2 text-right font-medium"
                    :class="curQ >= 1 ? fmt.achColor(achPct(kpi.q1_actual, kpi.q1_target)) : 'text-apex-faint'">
                  {{ curQ >= 1 ? fmtVal(kpi.q1_actual, kpi.unit) : '—' }}
                </td>
                <td class="py-2.5 px-2 text-right text-xs font-bold"
                    :class="curQ >= 1 ? fmt.achColor(achPct(kpi.q1_actual, kpi.q1_target)) : 'text-apex-faint'">
                  {{ curQ >= 1 ? achPct(kpi.q1_actual, kpi.q1_target).toFixed(0) + '%' : '—' }}
                </td>
                <!-- Q2 -->
                <td class="py-2.5 px-2 text-right text-apex-muted border-l border-apex-border">
                  {{ fmtVal(kpi.q2_target, kpi.unit) }}
                </td>
                <td class="py-2.5 px-2 text-right font-medium"
                    :class="curQ >= 2 ? fmt.achColor(achPct(kpi.q2_actual, kpi.q2_target)) : 'text-apex-faint'">
                  {{ curQ >= 2 ? fmtVal(kpi.q2_actual, kpi.unit) : '—' }}
                </td>
                <td class="py-2.5 px-2 text-right text-xs font-bold"
                    :class="curQ >= 2 ? fmt.achColor(achPct(kpi.q2_actual, kpi.q2_target)) : 'text-apex-faint'">
                  {{ curQ >= 2 ? achPct(kpi.q2_actual, kpi.q2_target).toFixed(0) + '%' : '—' }}
                </td>
                <!-- Q3 -->
                <td class="py-2.5 px-2 text-right text-apex-muted border-l border-apex-border">
                  {{ fmtVal(kpi.q3_target, kpi.unit) }}
                </td>
                <td class="py-2.5 px-2 text-right font-medium"
                    :class="curQ >= 3 ? fmt.achColor(achPct(kpi.q3_actual, kpi.q3_target)) : 'text-apex-faint'">
                  {{ curQ >= 3 ? fmtVal(kpi.q3_actual, kpi.unit) : '—' }}
                </td>
                <td class="py-2.5 px-2 text-right text-xs font-bold"
                    :class="curQ >= 3 ? fmt.achColor(achPct(kpi.q3_actual, kpi.q3_target)) : 'text-apex-faint'">
                  {{ curQ >= 3 ? achPct(kpi.q3_actual, kpi.q3_target).toFixed(0) + '%' : '—' }}
                </td>
                <!-- Q4 -->
                <td class="py-2.5 px-2 text-right text-apex-muted border-l border-apex-border">
                  {{ fmtVal(kpi.q4_target, kpi.unit) }}
                </td>
                <td class="py-2.5 px-2 text-right font-medium"
                    :class="curQ >= 4 ? fmt.achColor(achPct(kpi.q4_actual, kpi.q4_target)) : 'text-apex-faint'">
                  {{ curQ >= 4 ? fmtVal(kpi.q4_actual, kpi.unit) : '—' }}
                </td>
                <td class="py-2.5 px-2 text-right text-xs font-bold"
                    :class="curQ >= 4 ? fmt.achColor(achPct(kpi.q4_actual, kpi.q4_target)) : 'text-apex-faint'">
                  {{ curQ >= 4 ? achPct(kpi.q4_actual, kpi.q4_target).toFixed(0) + '%' : '—' }}
                </td>
                <!-- Aksi -->
                <td class="py-2.5 px-3 text-center">
                  <button @click="openEdit(kpi)"
                          :disabled="isTargetLocked && !isAdmin"
                          :title="isTargetLocked && !isAdmin ? 'Target dikunci' : 'Edit target / aktual'"
                          :class="isTargetLocked && !isAdmin ? 'text-apex-faint cursor-not-allowed' : 'text-primary-400 hover:text-primary-300 transition-colors'"
                          class="mr-2">
                    <i :class="isTargetLocked && !isAdmin ? 'fa-solid fa-lock' : 'fa-solid fa-pen-to-square'" />
                  </button>
                  <button v-if="isAdmin" @click="confirmDelete(kpi)"
                          class="text-red-400 hover:text-red-300 transition-colors"
                          title="Hapus KPI">
                    <i class="fa-solid fa-trash" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- ─── Modal Edit KPI ──────────────────────────────────────────────── -->
    <div v-if="editModal.open"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-2xl shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-apex-border">
          <h2 class="text-lg font-semibold text-apex-text">
            {{ editModal.isNew ? 'Tambah KPI' : 'Edit KPI' }}
          </h2>
          <button @click="editModal.open = false" class="text-apex-muted hover:text-apex-text">
            <i class="fa-solid fa-xmark text-xl" />
          </button>
        </div>
        <div class="p-5 space-y-4">
          <!-- Kategori & Nama -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Kategori</label>
              <input v-model="editModal.form.kpi_category" class="form-input"
                     list="cat-list" placeholder="Pilih atau ketik kategori..." />
              <datalist id="cat-list">
                <option v-for="c in categories" :key="c" :value="c" />
              </datalist>
            </div>
            <div>
              <label class="form-label">Nama KPI</label>
              <input v-model="editModal.form.kpi_name" class="form-input" placeholder="Nama indikator..." />
            </div>
          </div>
          <div>
            <label class="form-label">Unit</label>
            <input v-model="editModal.form.unit" class="form-input w-40"
                   list="unit-list" placeholder="Count / % / Miliar Rp..." />
            <datalist id="unit-list">
              <option value="Count" />
              <option value="%" />
              <option value="Miliar Rp" />
              <option value="Juta Rp" />
              <option value="Days" />
              <option value="Score" />
            </datalist>
          </div>

          <!-- Note jika auto -->
          <div v-if="editModal.form.is_auto"
               class="flex items-start gap-2 bg-emerald-900/20 border border-emerald-700/50
                      rounded-lg p-3 text-xs text-emerald-300">
            <i class="fa-solid fa-bolt mt-0.5" />
            <span>
              Aktual KPI ini dihitung <strong>otomatis</strong> dari database. Hanya target yang bisa diubah.
            </span>
          </div>

          <!-- Banner lock di modal -->
          <div v-if="isTargetLocked && !isAdmin"
               class="flex items-center gap-2 bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-xs text-red-300">
            <i class="fa-solid fa-lock" />
            Target dikunci. Hanya aktual yang dapat diubah.
          </div>

          <!-- Target per Q -->
          <div>
            <label class="form-label">Target per Kuartal (kumulatif)</label>
            <div class="grid grid-cols-4 gap-3">
              <div v-for="q in [1,2,3,4]" :key="q">
                <label class="text-xs text-apex-muted mb-1 block">Q{{ q }}</label>
                <input v-model.number="editModal.form[`q${q}_target`]"
                       type="number" min="0" class="form-input text-sm" placeholder="0"
                       :disabled="isTargetLocked && !isAdmin"
                       :class="isTargetLocked && !isAdmin ? 'opacity-50 cursor-not-allowed' : ''" />
              </div>
            </div>
          </div>

          <!-- Aktual per Q (hanya jika manual) -->
          <div v-if="!editModal.form.is_auto">
            <label class="form-label">Aktual per Kuartal (entry manual)</label>
            <div class="grid grid-cols-4 gap-3">
              <div v-for="q in [1,2,3,4]" :key="q">
                <label class="text-xs text-apex-muted mb-1 block">Q{{ q }}</label>
                <input v-model.number="editModal.form[`q${q}_actual`]"
                       type="number" min="0" class="form-input text-sm" placeholder="0" />
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-3 p-5 border-t border-apex-border">
          <button @click="editModal.open = false" class="btn-ghost">Batal</button>
          <button @click="saveKpi" :disabled="saving" class="btn-primary">
            <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-1" />
            {{ editModal.isNew ? 'Tambah' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Modal Konfirmasi Delete ─────────────────────────────────────── -->
    <div v-if="deleteModal.open"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-apex-surface border border-red-900/50 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center">
            <i class="fa-solid fa-trash text-red-400" />
          </div>
          <h2 class="text-lg font-semibold text-apex-text">Hapus KPI</h2>
        </div>
        <p class="text-sm text-apex-muted mb-5">
          Hapus <strong class="text-apex-text">{{ deleteModal.kpi?.kpi_name }}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="deleteModal.open = false" class="btn-ghost">Batal</button>
          <button @click="doDelete" :disabled="saving"
                  class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-apex-text text-sm font-medium transition-colors">
            <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-1" />
            Hapus
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { get, post, put, del } = useApi()
const fmt      = useFormat()
const authStore = useAuthStore()

const isAdmin = computed(() => authStore.user?.role_id === 1)

const loading      = ref(true)
const saving       = ref(false)
const selectedYear = ref(new Date().getFullYear())
const years        = ref<number[]>([])
const kpiData      = ref<any[]>([])
const curQ         = ref(Math.ceil(new Date().getMonth() + 1) / 3 | 0 || 1)

// Lock target
const lockDate     = ref<string>('')   // ISO date string, e.g. '2026-01-31'
const isTargetLocked = computed(() => {
  if (!lockDate.value) return false
  if (isAdmin.value) return false
  const today = new Date().toISOString().slice(0, 10)
  return today >= lockDate.value
})
const lockSaving   = ref(false)
const lockInput    = ref('')

async function loadLockSetting() {
  try {
    const s = await get('/v1/app-settings')
    lockDate.value  = s['target_lock_date'] ?? ''
    lockInput.value = lockDate.value
  } catch {}
}

async function saveLockDate() {
  lockSaving.value = true
  try {
    await put('/v1/app-settings/target_lock_date', { value: lockInput.value })
    lockDate.value = lockInput.value
  } finally {
    lockSaving.value = false
  }
}

const editModal = reactive({
  open: false,
  isNew: false,
  form: {} as any,
})
const deleteModal = reactive({ open: false, kpi: null as any })

// Ambil tahun tersedia
async function loadYears() {
  const data = await get('/v1/kpi/prospecting/years')
  years.value = data || [new Date().getFullYear()]
}

async function loadData() {
  loading.value = true
  try {
    const res = await get(`/v1/kpi/prospecting?tahun=${selectedYear.value}`)
    kpiData.value = res.data || []
    curQ.value    = res.cur_q || Math.ceil((new Date().getMonth() + 1) / 3)
  } finally {
    loading.value = false
  }
}

// Distinct categories (urutan tampil)
const CAT_ORDER = ['Lead Generation', 'Activity', 'Conversion', 'Pipeline', 'Quality', 'Revenue']
const categories = computed(() => {
  const cats = [...new Set(kpiData.value.map((k: any) => k.kpi_category))]
  return cats.sort((a, b) => {
    const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b)
    if (ia === -1 && ib === -1) return a.localeCompare(b)
    if (ia === -1) return 1
    if (ib === -1) return -1
    return ia - ib
  })
})

function kpiByCategory(cat: string) {
  return kpiData.value.filter((k: any) => k.kpi_category === cat)
}

function qLabel(q: number) {
  const map: Record<number, string> = { 1: 'Jan – Mar', 2: 'Apr – Jun', 3: 'Jul – Sep', 4: 'Okt – Des' }
  return map[q]
}

function qKpiCount(q: number) {
  return kpiData.value.filter((k: any) => k[`q${q}_target`] > 0).length
}

// Format nilai sesuai unit
function fmtVal(val: number, unit: string): string {
  if (val === 0) return '0'
  if (unit === '%') return val.toFixed(1) + '%'
  if (unit === 'Miliar Rp') return val.toFixed(2) + ' M'
  if (unit === 'Juta Rp') return val.toFixed(1) + ' jt'
  if (unit === 'Days') return val.toFixed(1) + ' hr'
  return new Intl.NumberFormat('id-ID').format(Math.round(val))
}

function achPct(actual: number, target: number): number {
  if (!target) return 0
  return Math.round(actual / target * 100)
}

// Modal tambah
function openAdd() {
  editModal.isNew = true
  editModal.form  = {
    kpi_category: '', kpi_name: '', unit: 'Count', is_auto: false,
    q1_target: 0, q2_target: 0, q3_target: 0, q4_target: 0,
    q1_actual: 0, q2_actual: 0, q3_actual: 0, q4_actual: 0,
  }
  editModal.open = true
}

// Modal edit
function openEdit(kpi: any) {
  editModal.isNew = false
  editModal.form  = { ...kpi }
  editModal.open  = true
}

async function saveKpi() {
  saving.value = true
  try {
    if (editModal.isNew) {
      await post('/v1/kpi/prospecting', { ...editModal.form, tahun: selectedYear.value })
    } else {
      await put(`/v1/kpi/prospecting/${editModal.form.id}`, editModal.form)
    }
    editModal.open = false
    await loadData()
  } finally {
    saving.value = false
  }
}

function confirmDelete(kpi: any) {
  deleteModal.kpi  = kpi
  deleteModal.open = true
}

async function doDelete() {
  saving.value = true
  try {
    await del(`/v1/kpi/prospecting/${deleteModal.kpi.id}`)
    deleteModal.open = false
    await loadData()
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadYears(), loadData(), loadLockSetting()])
})
</script>
