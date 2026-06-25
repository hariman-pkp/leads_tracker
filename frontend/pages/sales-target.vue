<template>
  <div class="min-h-screen bg-apex-bg text-apex-text p-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-apex-text">
          <i class="fa-solid fa-bullseye text-yellow-400 mr-2" />Target Sales Individu
        </h1>
        <p class="text-sm text-apex-muted mt-0.5">Target deal per sales per bulan vs pencapaian aktual</p>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="selectedYear" @change="load" class="form-select text-sm w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <!-- Lock badge -->
        <div v-if="lockDate" class="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"
             :class="isTargetLocked ? 'bg-red-900/30 text-red-400 border border-red-800/50' : 'bg-emerald-900/30 text-emerald-400 border border-emerald-800/50'">
          <i :class="isTargetLocked ? 'fa-solid fa-lock' : 'fa-solid fa-lock-open'" />
          {{ isTargetLocked ? 'Target Terkunci' : 'Target Terbuka' }}
        </div>
        <button v-if="canSetTarget" @click="editMode = !editMode"
                :class="editMode ? 'btn-danger' : 'btn-primary'"
                class="flex items-center gap-2 text-sm">
          <i :class="editMode ? 'fa-solid fa-xmark' : 'fa-solid fa-pen'" />
          {{ editMode ? 'Batal Edit' : 'Set Target' }}
        </button>
        <button v-else-if="isTargetLocked && !isAdmin" disabled
                class="btn-secondary btn-sm opacity-50 cursor-not-allowed flex items-center gap-2 text-sm">
          <i class="fa-solid fa-lock" /> Target Terkunci
        </button>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-24 text-apex-muted">
      <i class="fa-solid fa-spinner fa-spin mr-2" />Memuat data...
    </div>

    <template v-else-if="rows.length">
      <!-- Legend -->
      <div class="flex items-center gap-4 mb-4 text-xs text-apex-muted">
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500 inline-block" />≥ 80% target</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-yellow-500/30 border border-yellow-500 inline-block" />50–79%</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500 inline-block" />&lt; 50%</span>
        <span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-apex-border/30 border border-apex-border inline-block" />Belum ada target</span>
      </div>

      <div class="space-y-6">
        <div v-for="row in rows" :key="row.sales_nama" class="apex-card">
          <!-- Sales header -->
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-full bg-primary-900/50 text-primary-400 flex items-center justify-center text-sm font-bold">
                {{ row.sales_nama[0] }}
              </div>
              <div>
                <p class="font-semibold text-apex-text">{{ row.sales_nama }}</p>
                <p class="text-xs text-apex-muted">
                  YTD: {{ fmt.rupiah(row.ytd_actual) }}
                  <span v-if="row.ytd_target > 0">
                    / {{ fmt.rupiah(row.ytd_target) }}
                    <span :class="achColor(row.ytd_achievement_pct)" class="font-semibold ml-1">
                      ({{ row.ytd_achievement_pct ?? '—' }}%)
                    </span>
                  </span>
                  <span v-else class="text-apex-muted ml-1">(target belum diset)</span>
                </p>
              </div>
            </div>
            <!-- YTD progress bar -->
            <div v-if="row.ytd_target > 0" class="w-32 hidden md:block">
              <div class="h-2 bg-apex-border/30 rounded-full overflow-hidden">
                <div class="h-2 rounded-full transition-all"
                     :class="achBg(row.ytd_achievement_pct)"
                     :style="{ width: Math.min(100, row.ytd_achievement_pct ?? 0) + '%' }" />
              </div>
            </div>
          </div>

          <!-- Monthly grid -->
          <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
            <div v-for="m in row.bulan" :key="m.bulan"
                 class="rounded-lg p-2 border text-center transition-colors"
                 :class="cellClass(m)">
              <p class="text-xs font-medium text-apex-muted mb-1">{{ m.bulan_label }}</p>

              <!-- Edit mode -->
              <template v-if="editMode">
                <input
                  type="text"
                  inputmode="numeric"
                  class="w-full text-center text-xs bg-transparent border-b border-apex-border focus:outline-none focus:border-primary-400 text-apex-text"
                  :value="gridDisplay(m.target)"
                  @focus="($event.target as HTMLInputElement).value = m.target > 0 ? String(m.target) : ''"
                  @blur="onGridBlur($event, row.sales_nama, m.bulan)"
                  @input="onGridInput($event as InputEvent)"
                  placeholder="0"
                />
              </template>

              <!-- View mode -->
              <template v-else>
                <p class="text-xs font-semibold" :class="m.target > 0 ? 'text-apex-text' : 'text-apex-muted'">
                  {{ m.target > 0 ? fmt.rupiah(m.target) : '—' }}
                </p>
                <p class="text-xs text-emerald-400 font-semibold mt-0.5" v-if="m.actual > 0">
                  {{ fmt.rupiah(m.actual) }}
                </p>
                <p class="text-xs text-apex-muted mt-0.5" v-else-if="m.target > 0">-</p>
                <p v-if="m.achievement_pct !== null" class="text-xs font-bold mt-0.5"
                   :class="achColor(m.achievement_pct)">
                  {{ m.achievement_pct }}%
                </p>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- Save button in edit mode -->
      <div v-if="editMode && pendingChanges.length" class="fixed bottom-6 right-6 flex flex-col items-end gap-2">
        <div v-if="saveError" class="bg-red-900/90 text-red-200 text-sm px-4 py-2 rounded-lg max-w-xs text-right">
          <i class="fa-solid fa-circle-exclamation mr-1" />{{ saveError }}
        </div>
        <button @click="saveAll" :disabled="saving"
                class="btn-primary flex items-center gap-2 shadow-lg px-6 py-3">
          <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'" />
          {{ saving ? 'Menyimpan...' : `Simpan ${pendingChanges.length} perubahan` }}
        </button>
      </div>
    </template>

    <div v-else class="apex-card text-center py-12 text-apex-muted">
      Belum ada data sales. Tambahkan user dengan role Sales terlebih dahulu.
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get } = useApi()
const fmt      = useFormat()
const auth     = useAuthStore()

const curYear      = new Date().getFullYear()
const selectedYear = ref(curYear)
const years        = Array.from({ length: 4 }, (_, i) => curYear - i)
const loading      = ref(false)
const editMode     = ref(false)
const saving       = ref(false)
const rows         = ref<any[]>([])

const isAdmin  = computed(() => auth.user?.role_id === 1)
const canEdit  = computed(() => [1, 2].includes(auth.user?.role_id ?? 0))

const lockDate       = ref('')
const isTargetLocked = computed(() => {
  if (!lockDate.value) return false
  if (isAdmin.value) return false
  return fmt.todayStr() >= lockDate.value
})
const canSetTarget = computed(() => canEdit.value && !isTargetLocked.value)

interface PendingChange { sales_nama: string; tahun: number; bulan: number; target_deal: number }
const pendingChanges = ref<PendingChange[]>([])

async function load() {
  loading.value = true
  editMode.value = false
  pendingChanges.value = []
  try {
    const [res, settings] = await Promise.all([
      get(`/v1/sales-targets?tahun=${selectedYear.value}`),
      get('/v1/app-settings').catch(() => ({})),
    ])
    rows.value    = res.data ?? []
    lockDate.value = settings['target_lock_date'] ?? ''
  } catch (err: any) {
    console.error('[sales-target] load error:', err?.data ?? err)
    rows.value = []
  } finally {
    loading.value = false
  }
}

function setTarget(salesNama: string, bulan: number, value: number) {
  if (isNaN(value)) value = 0
  // Update local view
  const row = rows.value.find(r => r.sales_nama === salesNama)
  if (!row) return
  const m = row.bulan.find((b: any) => b.bulan === bulan)
  if (m) m.target = value

  // Track pending
  const existing = pendingChanges.value.find(
    p => p.sales_nama === salesNama && p.bulan === bulan
  )
  if (existing) { existing.target_deal = value }
  else { pendingChanges.value.push({ sales_nama: salesNama, tahun: selectedYear.value, bulan, target_deal: value }) }
}

const saveError = ref('')

async function saveAll() {
  saving.value = true
  saveError.value = ''
  try {
    for (const p of pendingChanges.value) {
      const res = await fetch('/api-proxy/v1/sales-targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth.token ? { 'Authorization': `Bearer ${auth.token}` } : {}),
        },
        body: JSON.stringify(p),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        let detail = `HTTP ${res.status}`
        try { detail = JSON.parse(text)?.detail || detail } catch {}
        console.error('[sales-target] POST error', res.status, text)
        throw new Error(detail)
      }
    }
    pendingChanges.value = []
    editMode.value = false
    await load()
  } catch (err: any) {
    saveError.value = err?.message || 'Gagal menyimpan target.'
  } finally {
    saving.value = false
  }
}

function gridDisplay(target: number) {
  if (!target) return ''
  return target.toLocaleString('id-ID')
}

function onGridInput(e: InputEvent) {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\./g, '').replace(/[^\d]/g, '')
  const num = parseInt(digits, 10)
  el.value = isNaN(num) ? '' : num.toLocaleString('id-ID')
}

function onGridBlur(e: FocusEvent, salesNama: string, bulan: number) {
  const el = e.target as HTMLInputElement
  const digits = el.value.replace(/\./g, '').replace(/[^\d]/g, '')
  const value = digits ? parseInt(digits, 10) : 0
  setTarget(salesNama, bulan, isNaN(value) ? 0 : value)
  el.value = value > 0 ? value.toLocaleString('id-ID') : ''
}

function achColor(pct: number | null) {
  if (pct === null) return 'text-apex-muted'
  if (pct >= 80) return 'text-emerald-400'
  if (pct >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

function achBg(pct: number | null) {
  if (pct === null) return 'bg-apex-border'
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function cellClass(m: any) {
  if (m.target <= 0) return 'border-apex-border/30 bg-apex-bg'
  if (m.achievement_pct === null) return 'border-apex-border bg-apex-card'
  if (m.achievement_pct >= 80) return 'border-emerald-500 bg-emerald-500/10'
  if (m.achievement_pct >= 50) return 'border-yellow-500 bg-yellow-500/10'
  return 'border-red-500 bg-red-500/10'
}

onMounted(load)
</script>
