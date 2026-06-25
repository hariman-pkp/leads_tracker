<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-fire text-orange-400 mr-2" />Activity Heatmap</h1>
        <p class="page-subtitle">Pola aktivitas sales berdasarkan jam & hari dalam seminggu</p>
      </div>
      <div class="flex gap-3 flex-wrap">
        <select v-if="isAdminOrManager" v-model="filterSales" @change="load" class="form-select text-sm w-40">
          <option value="">Semua Sales</option>
          <option v-for="s in salesList" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="filterTahun" @change="load" class="form-select text-sm w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-24 text-apex-muted">
      <i class="fa-solid fa-circle-notch fa-spin text-2xl mr-2" />Memuat data...
    </div>

    <template v-else-if="data">

      <!-- Summary strip -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="card text-center py-4">
          <div class="text-2xl font-bold text-primary-300">{{ fmt.num(totalActivity) }}</div>
          <div class="text-xs text-gray-500 mt-1">Total Aktivitas</div>
        </div>
        <div class="card text-center py-4">
          <div class="text-2xl font-bold text-emerald-300">{{ peakHourLabel }}</div>
          <div class="text-xs text-gray-500 mt-1">Jam Paling Aktif</div>
        </div>
        <div class="card text-center py-4">
          <div class="text-2xl font-bold text-yellow-300">{{ peakDowLabel }}</div>
          <div class="text-xs text-gray-500 mt-1">Hari Paling Aktif</div>
        </div>
        <div class="card text-center py-4">
          <div class="text-2xl font-bold text-orange-300">{{ totalActivity > 0 ? fmt.num(data.max_count) : '—' }}</div>
          <div class="text-xs text-gray-500 mt-1">Peak / Slot</div>
        </div>
      </div>

      <!-- Heatmap grid -->
      <div class="card mb-6 overflow-x-auto">
        <div class="section-title mb-4"><i class="fa-solid fa-th mr-1 text-orange-400" />Heatmap Jam × Hari</div>

        <div class="min-w-[700px]">
          <!-- Hour labels (top) -->
          <div class="flex mb-1 ml-10">
            <div v-for="h in 24" :key="h"
                 class="text-center text-[9px] text-gray-600 flex-1">
              {{ (h-1) % 3 === 0 ? `${String(h-1).padStart(2,'0')}` : '' }}
            </div>
          </div>

          <!-- Rows per day -->
          <div v-for="(dow, di) in data.dow_labels" :key="dow" class="flex items-center mb-1">
            <div class="w-10 text-xs text-gray-500 text-right pr-2 flex-shrink-0">{{ dow }}</div>
            <div v-for="h in 24" :key="h"
                 class="flex-1 h-7 rounded-sm mx-px transition-all cursor-default relative group"
                 :style="cellStyle(di, h-1)">
              <!-- Tooltip -->
              <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10
                          bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-xl pointer-events-none">
                <span class="font-semibold text-gray-200">{{ dow }}</span>
                <span class="text-gray-400 mx-1">·</span>
                <span class="text-gray-300">{{ String(h-1).padStart(2,'0') }}:00</span>
                <span class="ml-2 text-orange-300 font-bold">{{ cellCount(di, h-1) }} aktivitas</span>
              </div>
            </div>
          </div>

          <!-- Legend -->
          <div class="flex items-center gap-2 mt-3 justify-end">
            <span class="text-xs text-gray-600">Rendah</span>
            <div v-for="l in legendSteps" :key="l"
                 class="w-5 h-4 rounded-sm"
                 :style="`background:${heatColor(l, 1)}`" />
            <span class="text-xs text-gray-600">Tinggi</span>
          </div>
        </div>
      </div>

      <!-- Bar charts -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

        <!-- By hour -->
        <div class="card">
          <div class="section-title mb-4"><i class="fa-solid fa-clock mr-1 text-blue-400" />Distribusi per Jam</div>
          <div class="space-y-1">
            <div v-for="(cnt, h) in data.by_hour" :key="h" class="flex items-center gap-2">
              <div class="w-10 text-xs text-gray-500 text-right flex-shrink-0">{{ String(h).padStart(2,'0') }}:00</div>
              <div class="flex-1 h-5 bg-navy-800 rounded overflow-hidden">
                <div class="h-full rounded transition-all duration-500"
                     :style="`width:${maxHour ? cnt/maxHour*100 : 0}%;background:${heatColor(cnt, maxHour)}`" />
              </div>
              <div class="w-8 text-xs text-gray-400 text-right flex-shrink-0">{{ cnt || '' }}</div>
            </div>
          </div>
        </div>

        <!-- By day of week -->
        <div class="card">
          <div class="section-title mb-4"><i class="fa-solid fa-calendar-week mr-1 text-purple-400" />Distribusi per Hari</div>
          <div class="space-y-3">
            <div v-for="(cnt, di) in data.by_dow" :key="di" class="flex items-center gap-3">
              <div class="w-10 text-xs text-gray-500 text-right flex-shrink-0">{{ data.dow_labels[di] }}</div>
              <div class="flex-1 h-7 bg-navy-800 rounded overflow-hidden">
                <div class="h-full rounded transition-all duration-500"
                     :style="`width:${maxDow ? cnt/maxDow*100 : 0}%;background:${heatColor(cnt, maxDow)}`" />
              </div>
              <div class="w-10 text-xs text-gray-400 text-right flex-shrink-0">{{ fmt.num(cnt) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Source note -->
      <div class="p-3 rounded-lg border border-navy-700 bg-navy-800/30 text-xs text-gray-500">
        <i class="fa-solid fa-circle-info mr-1.5 text-gray-600" />
        Data menggabungkan: <span class="text-gray-400">Follow-Up Log</span>,
        <span class="text-gray-400">Field Activity (check-in)</span>, dan
        <span class="text-gray-400">Laporan Harian (waktu kirim)</span> — tahun {{ data.tahun }}.
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get }   = useApi()
const fmt       = useFormat()
const auth      = useAuthStore()

const isAdminOrManager = computed(() => (auth.user?.role_id ?? 3) < 3)

const curYear   = new Date().getFullYear()
const years     = Array.from({ length: 4 }, (_, i) => curYear - i)
const filterTahun = ref(curYear)
const filterSales = ref('')
const salesList   = ref<string[]>([])
const loading     = ref(false)
const data        = ref<any>(null)

// ── Computed ──────────────────────────────────────────────────────────────
const cellMap = computed(() => {
  const m: Record<string, number> = {}
  if (!data.value) return m
  for (const c of data.value.cells) m[`${c.dow}_${c.hour}`] = c.count
  return m
})

function cellCount(dow: number, hour: number) {
  return cellMap.value[`${dow}_${hour}`] ?? 0
}

const totalActivity = computed(() => data.value?.by_hour?.reduce((a: number, b: number) => a + b, 0) ?? 0)
const maxHour = computed(() => Math.max(...(data.value?.by_hour ?? [0])))
const maxDow  = computed(() => Math.max(...(data.value?.by_dow  ?? [0])))

const peakHourLabel = computed(() => {
  if (!data.value || maxHour.value === 0) return '—'
  const h = data.value.by_hour.indexOf(maxHour.value)
  return `${String(h).padStart(2,'0')}:00`
})

const peakDowLabel = computed(() => {
  if (!data.value || maxDow.value === 0) return '—'
  const d = data.value.by_dow.indexOf(maxDow.value)
  return data.value.dow_labels[d] ?? '—'
})

const legendSteps = [0.1, 0.25, 0.5, 0.75, 1.0]

// ── Color scale (dark navy → orange → red) ───────────────────────────────
function heatColor(val: number, max: number): string {
  if (!max || !val) return '#1e2d42'
  const ratio = Math.min(val / max, 1)
  if (ratio < 0.01) return '#1e2d42'
  // Gradient: navy → blue → orange → red
  const stops = [
    [0.0,  [30,  45,  66]],
    [0.25, [29,  78,  216]],
    [0.5,  [234, 88,  12]],
    [0.75, [234, 179, 8]],
    [1.0,  [239, 68,  68]],
  ] as [number, number[]][]

  let lo = stops[0], hi = stops[stops.length - 1]
  for (let i = 0; i < stops.length - 1; i++) {
    if (ratio >= stops[i][0] && ratio <= stops[i+1][0]) {
      lo = stops[i]; hi = stops[i+1]; break
    }
  }
  const t = lo[0] === hi[0] ? 1 : (ratio - lo[0]) / (hi[0] - lo[0])
  const r = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * t)
  const g = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * t)
  const b = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * t)
  return `rgb(${r},${g},${b})`
}

function cellStyle(dow: number, hour: number) {
  const cnt = cellCount(dow, hour)
  const max = data.value?.max_count ?? 1
  return `background:${heatColor(cnt, max)}`
}

// ── Data fetch ────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const params: any = { tahun: filterTahun.value }
    if (filterSales.value) params.sales = filterSales.value
    data.value = await get('/v1/activity-heatmap', params)
  } catch {}
  finally { loading.value = false }
}

async function loadSales() {
  try {
    const res = await get('/v1/sales')
    salesList.value = (res.sales || []).map((s: any) => s.nama)
  } catch {}
}

onMounted(() => {
  load()
  if (isAdminOrManager.value) loadSales()
})
</script>
