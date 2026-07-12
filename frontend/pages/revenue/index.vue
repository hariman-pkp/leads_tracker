<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-chart-bar text-primary-400 mr-2" />Revenue Dashboard</h1>
        <p class="page-subtitle">Monitoring revenue {{ data?.cur_year }}</p>
      </div>
      <div class="flex gap-2 items-center">
        <select v-if="data?.years?.length" v-model="selectedYear" class="form-select w-28 text-xs" @change="changeYear">
          <option v-for="y in data.years" :key="y" :value="y">{{ y }}</option>
        </select>
        <button @click="refresh" class="btn-secondary btn-sm"><i class="fa-solid fa-rotate" /></button>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">
      <!-- KPI Cards -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="stat-card">
          <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-bullseye" /></div>
          <div>
            <div class="stat-value text-sm">{{ fmt.rupiah(data.total_target) }}</div>
            <div class="stat-label">Total Target</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-amber-900/40 text-amber-400"><i class="fa-solid fa-file-invoice-dollar" /></div>
          <div>
            <div class="stat-value text-sm text-amber-400">{{ fmt.rupiah(data.total_billed ?? 0) }}</div>
            <div class="stat-label">Billed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-900/40 text-green-400"><i class="fa-solid fa-coins" /></div>
          <div>
            <div class="stat-value text-sm text-green-400">{{ fmt.rupiah(data.total_actual) }}</div>
            <div class="stat-label">Collected</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-percent" /></div>
          <div>
            <div class="stat-value" :class="data.ach_pct >= 80 ? 'text-green-400' : data.ach_pct >= 50 ? 'text-yellow-400' : 'text-red-400'">
              {{ data.ach_pct }}%
            </div>
            <div class="stat-label">Achievement</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-folder-open" /></div>
          <div>
            <div class="stat-value">{{ data.total_projects }}</div>
            <div class="stat-label">Total Proyek</div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
      <!-- Monthly Trend Line Chart (SVG) -->
      <div class="card lg:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <div class="section-title mb-0">Monthly Trend — Target vs Billed vs Collected</div>
          <div class="flex items-center gap-4 text-xs text-gray-400">
            <span class="flex items-center gap-1.5">
              <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#818cf8" stroke-width="2" stroke-dasharray="4,3"/></svg>Target
            </span>
            <span class="flex items-center gap-1.5">
              <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#fbbf24" stroke-width="2" stroke-dasharray="2,2"/></svg>Billed
            </span>
            <span class="flex items-center gap-1.5">
              <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#34d399" stroke-width="2"/></svg>Collected
            </span>
          </div>
        </div>
        <svg v-if="trendPointsScaled.length" :viewBox="`0 0 ${svgW} ${svgH}`" class="w-full" :style="`height:${svgH}px`" preserveAspectRatio="none">
          <defs>
            <linearGradient id="gradAch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#34d399" stop-opacity="0.22"/>
              <stop offset="100%" stop-color="#34d399" stop-opacity="0.01"/>
            </linearGradient>
            <linearGradient id="gradTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#818cf8" stop-opacity="0.10"/>
              <stop offset="100%" stop-color="#818cf8" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line v-for="i in 4" :key="'h'+i"
            :x1="padL" :y1="padT + (svgH - padT - padB) * i / 4"
            :x2="svgW - padR" :y2="padT + (svgH - padT - padB) * i / 4"
            stroke="#1e3a5f" stroke-width="0.5"/>
          <!-- Y labels -->
          <text v-for="i in 5" :key="'yl'+i"
            :x="padL - 6"
            :y="padT + (svgH - padT - padB) * (i-1) / 4 + 4"
            text-anchor="end" fill="#475569" font-size="10">
            {{ fmt.rupiah(yMax - (yMax - yMin) * (i-1) / 4) }}
          </text>
          <!-- Target area fill -->
          <path :d="targetFillPath" fill="url(#gradTarget)"/>
          <!-- Achievement area fill -->
          <path :d="achFillPath" fill="url(#gradAch)"/>
          <!-- Target line dashed -->
          <path :d="svgTargetLine" fill="none" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="5,4"/>
          <!-- Billed line dashed amber -->
          <path v-if="svgBilledLine" :d="svgBilledLine" fill="none" stroke="#fbbf24" stroke-width="1.5" stroke-dasharray="2,2"/>
          <!-- Collected line solid -->
          <path :d="svgAchLine" fill="none" stroke="#34d399" stroke-width="2.5"/>
          <!-- Dots target -->
          <circle v-for="p in trendPointsScaled" :key="'t'+p.label" :cx="p.x" :cy="p.ty" r="2.5" fill="#818cf8"/>
          <!-- Dots billed -->
          <circle v-for="p in trendPointsScaled" :key="'b'+p.label" :cx="p.x" :cy="p.by" r="3" fill="#fbbf24" opacity="0.85"/>
          <!-- Dots collected (hollow ring) -->
          <circle v-for="p in trendPointsScaled" :key="'a'+p.label" :cx="p.x" :cy="p.ay" r="4" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
          <!-- X labels -->
          <text v-for="p in trendPointsScaled" :key="'xl'+p.label"
            :x="p.x" :y="svgH - 4"
            text-anchor="middle" fill="#475569" font-size="10">{{ p.label }}</text>
        </svg>
        <div v-else class="flex items-center justify-center h-40 text-gray-600 text-sm">Tidak ada data trend</div>
      </div>

      <!-- Quarter Trend Bar Chart (SVG) -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="section-title mb-0">Quarter Trend — Target vs Achievement</div>
          <div class="flex items-center gap-4 text-xs text-gray-400">
            <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded-sm bg-indigo-400 opacity-60"></span>Target</span>
            <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded-sm bg-emerald-400"></span>Achievement</span>
          </div>
        </div>
        <svg v-if="qtrPoints.length" :viewBox="`0 0 ${qsvgW} ${qsvgH}`" class="w-full" :style="`height:${qsvgH}px`" preserveAspectRatio="none">
          <!-- Grid lines -->
          <line v-for="i in 4" :key="'qh'+i"
            :x1="qpadL" :y1="qpadT + (qsvgH - qpadT - qpadB) * i / 4"
            :x2="qsvgW - qpadR" :y2="qpadT + (qsvgH - qpadT - qpadB) * i / 4"
            stroke="#1e3a5f" stroke-width="0.5"/>
          <!-- Y labels -->
          <text v-for="i in 5" :key="'qyl'+i"
            :x="qpadL - 6"
            :y="qpadT + (qsvgH - qpadT - qpadB) * (i-1) / 4 + 4"
            text-anchor="end" fill="#475569" font-size="11">
            {{ fmt.rupiah(qyMax - qyMax * (i-1) / 4) }}
          </text>
          <!-- Bars -->
          <g v-for="p in qtrPoints" :key="p.label">
            <!-- Target bar -->
            <rect :x="p.tx" :y="p.ty" :width="qBarW" :height="p.th"
              fill="#818cf8" opacity="0.35" rx="2"/>
            <!-- Achievement bar -->
            <rect :x="p.ax" :y="p.ay" :width="qBarW" :height="p.ah"
              fill="#34d399" opacity="0.9" rx="2"/>

            <!-- Ach % label above bar -->
            <text :x="p.ax + qBarW / 2" :y="p.ay - 4"
              text-anchor="middle" fill="#34d399" font-size="10" font-weight="bold">
              {{ p.ach }}%
            </text>
            <!-- X label -->
            <text :x="p.cx" :y="qsvgH - 4"
              text-anchor="middle" fill="#475569" font-size="11">{{ p.label }}</text>
          </g>
        </svg>
        <div v-else class="flex items-center justify-center h-40 text-gray-600 text-sm">Tidak ada data quarter</div>
      </div>
      </div><!-- end grid -->

      <!-- Achievement bar -->
      <div class="card mb-5">
        <div class="flex justify-between items-center mb-2">
          <span class="text-sm font-medium text-gray-300">Achievement YTD</span>
          <span class="text-sm font-bold" :class="data.ach_pct >= 80 ? 'text-green-400' : 'text-red-400'">
            {{ data.ach_pct }}%
          </span>
        </div>
        <div class="progress-bar h-3">
          <div class="progress-fill h-3" :class="fmt.achBgColor(data.ach_pct)"
            :style="`width:${Math.min(data.ach_pct, 100)}%`" />
        </div>
        <div class="flex justify-between text-xs text-gray-500 mt-1">
          <span>Rp 0</span>
          <span>{{ fmt.rupiah(data.total_actual) }} / {{ fmt.rupiah(data.total_target) }}</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        <!-- By kategori -->
        <div class="card">
          <div class="section-title">Per Kategori</div>
          <div class="space-y-4">
            <div v-for="cat in [
              { label: 'Recurring', target: data.rec_target, actual: data.rec_actual },
              { label: 'Project',   target: data.prj_target, actual: data.prj_actual },
            ]" :key="cat.label">
              <div class="flex justify-between text-sm mb-1">
                <span class="text-gray-300 font-medium">{{ cat.label }}</span>
                <span class="text-xs text-gray-400">
                  {{ fmt.rupiah(cat.actual) }} / {{ fmt.rupiah(cat.target) }}
                </span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill"
                  :class="fmt.achBgColor(cat.target ? cat.actual / cat.target * 100 : 0)"
                  :style="`width:${cat.target ? Math.min(cat.actual / cat.target * 100, 100) : 0}%`" />
              </div>
              <div class="text-xs text-gray-500 mt-0.5 text-right">
                {{ cat.target ? (cat.actual / cat.target * 100).toFixed(1) : 0 }}%
              </div>
            </div>
          </div>
        </div>

        <!-- Status breakdown -->
        <div class="card">
          <div class="section-title">Status Proyek</div>
          <table class="tbl">
            <thead><tr>
              <th>Status</th><th class="text-center">Proyek</th>
              <th class="text-right">Target</th><th class="text-right">Realisasi</th>
            </tr></thead>
            <tbody>
              <tr v-for="[status, s] in statusSummaryEntries" :key="status"
                  :class="status === 'Failed' ? 'bg-red-900/20' : ''">
                <td><span :class="fmt.statusClass(status)">{{ status }}</span></td>
                <td class="text-center text-xs text-gray-300">{{ s.cnt }}</td>
                <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(s.target) }}</td>
                <td class="text-right text-xs text-green-300">{{ fmt.rupiah(s.actual) }}</td>
              </tr>
            </tbody>
          </table>
          <!-- Highlight Failed -->
          <div v-if="failedGap < 0" class="mt-3 rounded-lg bg-red-900/30 border border-red-700/40 px-3 py-2 text-xs text-red-300">
            <i class="fa-solid fa-circle-xmark mr-1" />
            Revenue tidak tercapai dari proyek Failed:
            <span class="font-semibold text-red-200 ml-1">{{ fmt.rupiah(failedGap) }}</span>
          </div>
        </div>

        <!-- Per Organisasi -->
        <div class="card">
          <div class="section-title">Per Organisasi</div>
          <div class="space-y-4">
            <div v-for="org in data.org_breakdown" :key="org.organisasi">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-sm font-medium text-gray-300">{{ org.organisasi || '—' }}</span>
                <span class="text-xs text-gray-500">{{ fmt.rupiah(org.actual) }} / {{ fmt.rupiah(org.target) }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill"
                  :class="fmt.achBgColor(org.ach)"
                  :style="`width:${Math.min(org.ach, 100)}%`" />
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-0.5">
                <span :class="org.ach >= 80 ? 'text-green-400' : org.ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
                  {{ org.ach }}%
                </span>
              </div>
            </div>
            <div v-if="!data.org_breakdown?.length" class="text-xs text-gray-600 text-center py-4">
              Tidak ada data
            </div>
          </div>
          <!-- Failed per org highlight -->
          <div v-if="data.failed_by_org?.length" class="mt-3 space-y-1.5">
            <div class="text-xs text-red-400 font-medium mb-1">
              <i class="fa-solid fa-circle-xmark mr-1" />Proyek Failed per Organisasi
            </div>
            <div v-for="f in data.failed_by_org" :key="f.organisasi"
                 class="flex items-center justify-between rounded bg-red-900/20 border border-red-800/30 px-2.5 py-1.5 text-xs">
              <span class="text-gray-300">{{ f.organisasi || '—' }}</span>
              <span class="text-gray-500 mx-2">{{ f.cnt }} proyek</span>
              <span class="text-red-300 font-medium">Gap {{ fmt.rupiah(f.gap) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Critical projects -->
      <div v-if="data.critical?.length" class="card mb-5">
        <div class="section-title text-red-400">
          <i class="fa-solid fa-triangle-exclamation mr-1" />Proyek Critical / At Risk ({{ criticalTotal }})
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Project</th><th>Client</th><th>Organisasi</th><th class="text-right">Target</th>
              <th class="text-right">Actual</th><th>Status</th><th>Risk</th>
            </tr></thead>
            <tbody>
              <tr v-for="p in criticalSlice" :key="p.project_id">
                <td class="text-xs">{{ p.project_id }}<div class="text-gray-400">{{ p.product }}</div></td>
                <td class="text-xs text-gray-300">{{ p.client }}</td>
                <td class="text-xs text-gray-400">{{ p.organisasi }}</td>
                <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(p.revenue_target) }}</td>
                <td class="text-right text-xs text-green-300">{{ fmt.rupiah(p.actual_revenue) }}</td>
                <td><span :class="fmt.statusClass(p.project_status)">{{ p.project_status }}</span></td>
                <td><span :class="fmt.riskClass(p.risk_label)">{{ p.risk_label }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <AppPagination
          v-if="criticalPages > 1"
          v-model:page="criticalPage"
          :total-pages="criticalPages"
          :total="criticalTotal"
          :per-page="criticalPerPage"
          class="mt-3"
        />
      </div>

      <!-- Recurring Behind YTD Target -->
      <div v-if="data.recurring_behind?.length" class="card mb-5">
        <div class="section-title text-amber-400">
          <i class="fa-solid fa-arrow-trend-down mr-1" />Recurring Tertinggal s/d Bulan {{ monthName }} ({{ data.recurring_behind.length }})
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Project</th><th>Client</th><th>PIC</th>
              <th class="text-right">Target Tahunan</th>
              <th class="text-right">Target s/d {{ monthName }}</th>
              <th class="text-right text-amber-300">Billed</th>
              <th class="text-right text-cyan-300">Paid</th>
              <th class="text-right text-green-300">Collected</th>
              <th class="text-right text-red-300">Kekurangan Collect</th>
              <th class="text-right text-orange-300">Kekurangan Billed</th>
              <th class="text-right">Ach%</th>
            </tr></thead>
            <tbody>
              <tr v-for="p in recurringBehindSlice" :key="p.project_id">
                <td class="text-xs">{{ p.project_id }}<div class="text-gray-400">{{ p.product }}</div></td>
                <td class="text-xs text-gray-300">{{ p.client }}</td>
                <td class="text-xs text-gray-400">{{ p.pic }}</td>
                <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(p.revenue_target) }}</td>
                <td class="text-right text-xs text-blue-300 font-medium">{{ fmt.rupiah(p.target_ytd) }}</td>
                <td class="text-right text-xs text-amber-300">{{ fmt.rupiah(p.billed) }}</td>
                <td class="text-right text-xs text-cyan-300">{{ fmt.rupiah(p.paid) }}</td>
                <td class="text-right text-xs text-green-300">{{ fmt.rupiah(p.collected) }}</td>
                <td class="text-right text-xs text-red-300 font-medium">{{ fmt.rupiah(p.gap_collected) }}</td>
                <td class="text-right text-xs text-orange-300">{{ fmt.rupiah(p.gap_billed) }}</td>
                <td class="text-right text-xs">
                  <span :class="p.ach_pct >= 80 ? 'text-green-300' : p.ach_pct >= 50 ? 'text-amber-300' : 'text-red-400'">
                    {{ p.ach_pct }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <AppPagination
          v-if="recurringBehindPages > 1"
          v-model:page="recurringBehindPage"
          :total-pages="recurringBehindPages"
          :total="data.recurring_behind.length"
          :per-page="recurringBehindPerPage"
          class="mt-3"
        />
      </div>

      <!-- Monthly trend -->
      <div class="card">
        <div class="section-title">Monthly Trend</div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Bulan</th><th class="text-right">Target</th><th class="text-right">Billed</th><th class="text-right">Collected</th><th>Progress</th>
            </tr></thead>
            <tbody>
              <tr v-for="m in data.monthly_trend" :key="m.month_num">
                <td class="text-sm">{{ m.month_name }}</td>
                <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(m.total_target) }}</td>
                <td class="text-right text-xs text-amber-300">{{ fmt.rupiah(m.total_billed ?? 0) }}</td>
                <td class="text-right text-xs text-green-300">{{ fmt.rupiah(m.total_actual) }}</td>
                <td class="w-32">
                  <div class="progress-bar">
                    <div class="progress-fill"
                      :class="fmt.achBgColor(m.total_target ? m.total_actual / m.total_target * 100 : 0)"
                      :style="`width:${m.total_target ? Math.min(m.total_actual / m.total_target * 100, 100) : 0}%`" />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Revenue Insights: lihat halaman Revenue Insights -->
      <div class="card mt-5 flex items-center justify-between gap-4 py-3">
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <i class="fa-solid fa-lightbulb text-cyan-400" />
          Langkah nyata & prioritas terpenting tersedia di halaman
          <span class="text-cyan-300 font-medium">Revenue Insights</span>
        </div>
        <NuxtLink to="/revenue/insights" class="btn-secondary btn-sm text-xs shrink-0">
          Buka Insights <i class="fa-solid fa-arrow-right ml-1" />
        </NuxtLink>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get } = useApi()
const fmt = useFormat()
const route = useRoute()

const selectedYear = ref(Number(route.query.tahun) || 0)
const { data, pending, refresh } = await useAsyncData('revenue-summary',
  () => get('/v1/revenue/summary', { tahun: selectedYear.value || undefined }),
  { server: false }
)

// ── SVG Trend Chart ───────────────────────────────────────────────────────
const svgW = 800
const svgH = 220
const padL = 72
const padR = 16
const padT = 16
const padB = 28

const trendPoints = computed(() => {
  const trend = data.value?.monthly_trend
  if (!trend?.length) return []
  const n    = trend.length
  const step = (svgW - padL - padR) / Math.max(n - 1, 1)
  return trend.map((m: any, i: number) => ({
    label : m.month_name.slice(0, 3),
    target: m.total_target  || 0,
    actual: m.total_actual  || 0,
    billed: m.total_billed  || 0,
    x: padL + i * step,
    ty: 0, ay: 0, by: 0,
  }))
})

const yMin = computed(() => 0)
const yMax = computed(() => {
  const pts = trendPoints.value
  if (!pts.length) return 1
  return Math.max(...pts.map(p => Math.max(p.target, p.actual, p.billed))) * 1.1 || 1
})

const trendPointsScaled = computed(() => {
  const range = yMax.value - yMin.value || 1
  const h     = svgH - padT - padB
  return trendPoints.value.map(p => ({
    ...p,
    ty: padT + h * (1 - (p.target - yMin.value) / range),
    ay: padT + h * (1 - (p.actual - yMin.value) / range),
    by: padT + h * (1 - (p.billed - yMin.value) / range),
  }))
})

function smoothLine(pts: {x: number, y: number}[]): string {
  if (!pts.length) return ''
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`
  const t = 0.4
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 2] ?? pts[i - 1]
    const p1 = pts[i - 1]
    const p2 = pts[i]
    const p3 = pts[i + 1] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) * t / 2
    const cp1y = p1.y + (p2.y - p0.y) * t / 2
    const cp2x = p2.x - (p3.x - p1.x) * t / 2
    const cp2y = p2.y - (p3.y - p1.y) * t / 2
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }
  return d
}

const svgAchLine = computed(() => {
  const pts = trendPointsScaled.value.map(p => ({ x: p.x, y: p.ay }))
  return smoothLine(pts)
})

const svgTargetLine = computed(() => {
  const pts = trendPointsScaled.value.map(p => ({ x: p.x, y: p.ty }))
  return smoothLine(pts)
})

const svgBilledLine = computed(() => {
  const pts = trendPointsScaled.value.map(p => ({ x: p.x, y: p.by }))
  return smoothLine(pts)
})

const achFillPath = computed(() => {
  const pts = trendPointsScaled.value
  if (!pts.length) return ''
  const base = padT + (svgH - padT - padB)
  const line = svgAchLine.value
  return `${line} L${pts[pts.length-1].x},${base} L${pts[0].x},${base} Z`
})

const targetFillPath = computed(() => {
  const pts = trendPointsScaled.value
  if (!pts.length) return ''
  const base = padT + (svgH - padT - padB)
  const line = svgTargetLine.value
  return `${line} L${pts[pts.length-1].x},${base} L${pts[0].x},${base} Z`
})

// ── Quarter Bar Chart ─────────────────────────────────────────────────────
const qsvgW = 400
const qsvgH = 220
const qpadL = 72
const qpadR = 16
const qpadT = 24
const qpadB = 28

const qyMax = computed(() => {
  const qt = data.value?.quarter_trend
  if (!qt?.length) return 1
  return Math.max(...qt.map((q: any) => Math.max(q.target, q.actual))) * 1.1 || 1
})

const qtrPoints = computed(() => {
  const qt = data.value?.quarter_trend
  if (!qt?.length) return []
  const n       = qt.length
  const areaW   = qsvgW - qpadL - qpadR
  const slotW   = areaW / n
  const qBarW_  = Math.min(slotW * 0.32, 40)
  const gap     = qBarW_ * 0.4
  const h       = qsvgH - qpadT - qpadB
  const range   = qyMax.value || 1
  return qt.map((q: any, i: number) => {
    const cx   = qpadL + slotW * i + slotW / 2
    const th   = (q.target / range) * h
    const ah   = (q.actual / range) * h
    return {
      label: q.quarter,
      ach:   q.ach,
      cx,
      tx: cx - gap / 2 - qBarW_,
      ty: qpadT + h - th,
      th,
      ax: cx + gap / 2,
      ay: qpadT + h - ah,
      ah,
    }
  })
})

const qBarW = computed(() => {
  const qt = data.value?.quarter_trend
  if (!qt?.length) return 30
  const slotW = (qsvgW - qpadL - qpadR) / qt.length
  return Math.min(slotW * 0.32, 40)
})

const statusEntries = computed(() =>
  Object.entries(data.value?.by_status || {}) as [string, number][]
)

const STATUS_ORDER = ['Active', 'On Hold', 'Completed', 'Failed']
const statusSummaryEntries = computed(() => {
  const summary = data.value?.project_status_summary || {}
  return STATUS_ORDER
    .filter(s => summary[s])
    .map(s => [s, summary[s]] as [string, any])
})
const failedGap = computed(() => {
  const f = data.value?.project_status_summary?.['Failed']
  return f ? f.actual - f.target : 0
})

const criticalPage    = ref(1)
const criticalPerPage = 5
const criticalTotal   = computed(() => data.value?.critical?.length ?? 0)
const criticalPages   = computed(() => Math.ceil(criticalTotal.value / criticalPerPage) || 1)
const criticalSlice   = computed(() => {
  const all = data.value?.critical ?? []
  const start = (criticalPage.value - 1) * criticalPerPage
  return all.slice(start, start + criticalPerPage)
})

const recurringBehindPage    = ref(1)
const recurringBehindPerPage = 10
const recurringBehindPages   = computed(() => Math.ceil((data.value?.recurring_behind?.length ?? 0) / recurringBehindPerPage) || 1)
const recurringBehindSlice   = computed(() => {
  const all = data.value?.recurring_behind ?? []
  const start = (recurringBehindPage.value - 1) * recurringBehindPerPage
  return all.slice(start, start + recurringBehindPerPage)
})

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const monthName = computed(() => {
  const m = data.value?.cur_month
  return m ? MONTH_NAMES[m - 1] : ''
})

async function changeYear() {
  await navigateTo({ query: { tahun: selectedYear.value } })
  await refresh()
}

</script>
