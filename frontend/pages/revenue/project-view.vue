<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-table-cells text-primary-400 mr-2" />Project View</h1>
        <p class="page-subtitle">Revenue per proyek setiap bulan — {{ data?.cur_year }}</p>
      </div>
      <div class="flex gap-2 items-center flex-wrap">
        <select v-model.number="f.tahun" class="form-select w-24 text-xs" @change="fetchData">
          <option v-for="y in data?.years" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="f.organisasi" class="form-select w-32 text-xs" @change="fetchData">
          <option value="">Semua Org</option>
          <option v-for="o in data?.org_list" :key="o" :value="o">{{ o }}</option>
        </select>
        <select v-model="f.kategori" class="form-select w-32 text-xs" @change="fetchData">
          <option value="">Semua Kategori</option>
          <option>Project</option>
          <option>Recurring</option>
        </select>
        <input v-model="f.search" class="form-input w-40 text-xs" placeholder="Cari proyek/client..." @input="debouncedFetch" />
        <button @click="fetchData" class="btn-secondary btn-sm"><i class="fa-solid fa-rotate" /></button>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div class="stat-card">
          <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-folder-open" /></div>
          <div>
            <div class="stat-value">{{ data.projects.length }}</div>
            <div class="stat-label">Total Proyek</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-indigo-900/40 text-indigo-400"><i class="fa-solid fa-bullseye" /></div>
          <div>
            <div class="stat-value text-sm">{{ fmt.rupiah(data.grand_target) }}</div>
            <div class="stat-label">Grand Target</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-900/40 text-green-400"><i class="fa-solid fa-coins" /></div>
          <div>
            <div class="stat-value text-sm text-green-400">{{ fmt.rupiah(data.grand_actual) }}</div>
            <div class="stat-label">Total Realisasi</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-percent" /></div>
          <div>
            <div class="stat-value" :class="data.grand_ach >= 80 ? 'text-green-400' : data.grand_ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
              {{ data.grand_ach }}%
            </div>
            <div class="stat-label">Achievement</div>
          </div>
        </div>
      </div>

      <!-- Bar Chart: Monthly Aggregate -->
      <div class="card mb-5">
        <div class="flex justify-between items-center mb-3">
          <div class="section-title mb-0">Trend Bulanan — Semua Proyek</div>
          <div class="flex items-center gap-4 text-xs text-gray-400">
            <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-2 rounded-sm bg-indigo-400 opacity-50"></span>Target</span>
            <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-2 rounded-sm bg-emerald-400"></span>Realisasi</span>
          </div>
        </div>
        <svg v-if="chartPoints.length" viewBox="0 0 760 160" class="w-full" style="height:160px" preserveAspectRatio="none">
          <line v-for="i in 4" :key="i" x1="60" :y1="16 + 116 * i / 4" x2="752" :y2="16 + 116 * i / 4" stroke="#1e3a5f" stroke-width="0.5"/>
          <text v-for="i in 5" :key="'y'+i" x="56" :y="16 + 116 * (i-1) / 4 + 4" text-anchor="end" fill="#475569" font-size="9">
            {{ fmt.rupiah(chartYMax - chartYMax * (i-1) / 4) }}
          </text>
          <g v-for="p in chartPoints" :key="p.label">
            <rect :x="p.tx" :y="p.ty" :width="barW" :height="p.th" fill="#818cf8" opacity="0.35" rx="1"/>
            <rect :x="p.ax" :y="p.ay" :width="barW" :height="p.ah" fill="#34d399" opacity="0.85" rx="1"/>
            <text :x="p.cx" y="153" text-anchor="middle" fill="#475569" font-size="9">{{ p.label }}</text>
            <rect v-if="p.isCurrent" :x="p.cx - barW" y="14" :width="barW * 2 + 4" height="118" fill="#818cf8" opacity="0.04" rx="2"/>
          </g>
        </svg>
      </div>

      <!-- Heatmap Table -->
      <div class="card overflow-x-auto">
        <div class="flex justify-between items-center mb-3">
          <div class="section-title mb-0">Rincian Per Proyek</div>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full bg-green-500 opacity-80"></span>≥80%</span>
            <span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full bg-yellow-500 opacity-80"></span>50–79%</span>
            <span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full bg-red-500 opacity-80"></span>&lt;50%</span>
            <span class="flex items-center gap-1"><span class="inline-block w-2 h-2 rounded-full bg-gray-700"></span>—</span>
          </div>
        </div>
        <table class="w-full text-xs border-collapse min-w-max">
          <thead>
            <tr class="border-b border-navy-700">
              <th class="text-left py-2 px-3 text-gray-400 font-medium w-44 sticky left-0 bg-navy-900 z-10">Proyek</th>
              <th class="text-left py-2 px-2 text-gray-400 font-medium w-24">Client</th>
              <th v-for="(m, i) in data.months" :key="m"
                  class="text-center py-2 px-1 font-medium w-16"
                  :class="i + 1 === data.cur_month ? 'text-primary-400' : 'text-gray-500'">
                {{ m }}
              </th>
              <th class="text-center py-2 px-2 text-gray-400 font-medium w-20">Total</th>
            </tr>
            <!-- Row total aggregate -->
            <tr class="border-b border-navy-700 bg-navy-800/50">
              <td class="py-1.5 px-3 text-gray-400 font-medium sticky left-0 bg-navy-800/80 z-10">Total</td>
              <td class="py-1.5 px-2 text-gray-600">—</td>
              <td v-for="mt in data.month_totals" :key="mt.month_num" class="py-1.5 px-1 text-center">
                <div v-if="mt.target > 0">
                  <div :class="mt.ach >= 80 ? 'text-green-400' : mt.ach >= 50 ? 'text-yellow-400' : mt.is_past || mt.is_current ? 'text-red-400' : 'text-gray-600'"
                       class="font-semibold">{{ mt.ach }}%</div>
                  <div class="text-gray-600 leading-tight">{{ fmt.compact(mt.actual) }}</div>
                </div>
                <span v-else class="text-gray-700">—</span>
              </td>
              <td class="py-1.5 px-2 text-center">
                <div :class="data.grand_ach >= 80 ? 'text-green-400' : data.grand_ach >= 50 ? 'text-yellow-400' : 'text-red-400'" class="font-semibold">
                  {{ data.grand_ach }}%
                </div>
                <div class="text-gray-500">{{ fmt.compact(data.grand_actual) }}</div>
              </td>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in projSlice" :key="p.project_id"
                class="border-b border-navy-800 hover:bg-navy-800/40 transition-colors">
              <td class="py-2 px-3 sticky left-0 bg-navy-900 hover:bg-navy-800 z-10 transition-colors">
                <div class="font-medium text-gray-200 truncate max-w-[10rem]" :title="p.product">{{ p.product }}</div>
                <div class="text-gray-600 text-xs mt-0.5 flex items-center gap-1.5">
                  <span :class="p.kategori === 'Project' ? 'text-blue-400' : 'text-purple-400'">{{ p.kategori }}</span>
                  <span class="text-gray-700">·</span>
                  <span>{{ p.organisasi }}</span>
                </div>
              </td>
              <td class="py-2 px-2 text-gray-500 truncate max-w-[6rem]" :title="p.client">{{ p.client }}</td>
              <td v-for="m in p.months" :key="m.month_num" class="py-1.5 px-1">
                <div v-if="m.target > 0" class="rounded text-center px-0.5 py-0.5 min-w-[3.5rem]"
                     :class="cellBg(m.ach, m.month_num <= data.cur_month)">
                  <div class="font-semibold leading-tight" :class="cellText(m.ach, m.month_num <= data.cur_month)">
                    {{ m.ach }}%
                  </div>
                  <div class="text-gray-500 leading-tight text-[9px]">{{ fmt.compact(m.actual) }}</div>
                </div>
                <div v-else class="text-center text-gray-800 select-none">·</div>
              </td>
              <td class="py-2 px-2 text-center">
                <div v-if="p.total_target > 0">
                  <div class="font-semibold" :class="p.total_ach >= 80 ? 'text-green-400' : p.total_ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
                    {{ p.total_ach }}%
                  </div>
                  <div class="text-gray-600 text-[10px]">{{ fmt.compact(p.total_actual) }}</div>
                </div>
                <span v-else class="text-gray-700">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="!data.projects.length" class="text-center py-10 text-gray-600 text-sm">Tidak ada proyek ditemukan</div>
        <AppPagination
          v-if="projPages > 1"
          v-model:page="projPage"
          :total-pages="projPages"
          :total="data.projects.length"
          :per-page="projPerPage"
          class="mt-3"
        />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get } = useApi()
const fmt = useFormat()

const f = reactive({ tahun: new Date().getFullYear(), organisasi: '', kategori: '', search: '' })
const { data, pending, refresh } = await useAsyncData('rev-proj-view',
  () => get('/v1/revenue/project-monthly', { ...f }),
  { server: false, watch: [f] }
)

let debTimer: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(debTimer); debTimer = setTimeout(() => refresh(), 400) }
async function fetchData() { await refresh() }

// ── Project pagination ────────────────────────────────────────────────────────
const projPage    = ref(1)
const projPerPage = 10
const projPages   = computed(() => Math.ceil((data.value?.projects?.length ?? 0) / projPerPage) || 1)
const projSlice   = computed(() => {
  const all = data.value?.projects ?? []
  const start = (projPage.value - 1) * projPerPage
  return all.slice(start, start + projPerPage)
})
watch(() => f, () => { projPage.value = 1 }, { deep: true })

// ── Bar Chart ─────────────────────────────────────────────────────────────────
const chartYMax = computed(() => {
  const mt = data.value?.month_totals
  if (!mt?.length) return 1
  return Math.max(...mt.map((m: any) => Math.max(m.target, m.actual))) * 1.1 || 1
})

const barW = computed(() => {
  const n = data.value?.month_totals?.length ?? 12
  const slotW = (752 - 60) / n
  return Math.min(slotW * 0.32, 28)
})

const chartPoints = computed(() => {
  const mt = data.value?.month_totals
  if (!mt?.length) return []
  const n = mt.length
  const slotW = (752 - 60) / n
  const h = 116; const top = 16; const range = chartYMax.value || 1
  const bw = barW.value; const gap = bw * 0.35
  return mt.map((m: any, i: number) => {
    const cx = 60 + slotW * i + slotW / 2
    const th = (m.target / range) * h
    const ah = (m.actual / range) * h
    return { label: m.label, isCurrent: m.is_current, cx,
             tx: cx - gap / 2 - bw, ty: top + h - th, th,
             ax: cx + gap / 2,      ay: top + h - ah, ah }
  })
})

// ── Heatmap cell helpers ──────────────────────────────────────────────────────
function cellBg(ach: number, isPastOrCurrent: boolean) {
  if (!isPastOrCurrent) return 'bg-navy-800/30'
  if (ach >= 80)  return 'bg-green-900/30'
  if (ach >= 50)  return 'bg-yellow-900/25'
  return 'bg-red-900/20'
}
function cellText(ach: number, isPastOrCurrent: boolean) {
  if (!isPastOrCurrent) return 'text-gray-500'
  if (ach >= 80)  return 'text-green-400'
  if (ach >= 50)  return 'text-yellow-400'
  return 'text-red-400'
}
</script>
