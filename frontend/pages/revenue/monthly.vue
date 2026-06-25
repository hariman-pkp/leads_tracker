<template>
  <div>
    <!-- ── HEADER ─────────────────────────────────────────────────── -->
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title">
          <i class="fa-solid fa-calendar-alt text-primary-400 mr-2" />Monthly Monitoring
        </h1>
        <p class="page-subtitle">Summary Revenue {{ f.tahun }}</p>
      </div>
      <select v-model.number="f.tahun" class="form-select w-24 text-xs" @change="onYearChange">
        <option v-for="y in data?.years || []" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">

      <!-- ── GRAND TOTAL STRIP ───────────────────────────────────── -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">
        <div class="stat-card">
          <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-bullseye" /></div>
          <div>
            <div class="stat-value text-xs">{{ fmt.rupiah(data.grand_target) }}</div>
            <div class="stat-label">Target {{ f.tahun }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-coins" /></div>
          <div>
            <div class="stat-value text-xs text-emerald-400">{{ fmt.rupiah(data.grand_actual) }}</div>
            <div class="stat-label">Total Realisasi</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-hand-holding-dollar" /></div>
          <div>
            <div class="stat-value text-xs text-purple-300">{{ fmt.rupiah(data.grand_coll) }}</div>
            <div class="stat-label">Total Collection</div>
          </div>
        </div>
        <div class="stat-card" :class="data.grand_out > 0 ? 'border border-orange-800/40' : ''">
          <div class="stat-icon"
               :class="data.grand_out > 0 ? 'bg-orange-900/40 text-orange-400' : 'bg-gray-800 text-gray-500'">
            <i class="fa-solid fa-hourglass-half" />
          </div>
          <div>
            <div class="stat-value text-xs"
                 :class="data.grand_out > 0 ? 'text-orange-400' : 'text-gray-500'">
              {{ fmt.rupiah(data.grand_out) }}
            </div>
            <div class="stat-label">Outstanding</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-percent" /></div>
          <div>
            <div class="stat-value"
                 :class="achTextColor(data.grand_ach)">
              {{ data.grand_ach }}%
            </div>
            <div class="stat-label">Achievement YTD</div>
          </div>
        </div>
      </div>

      <!-- ── QUARTER CARDS ──────────────────────────────────────── -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        <div v-for="q in ['Q1','Q2','Q3','Q4']" :key="q"
             class="card border-t-2"
             :class="{
               'border-blue-500':   q === 'Q1',
               'border-purple-500': q === 'Q2',
               'border-amber-500':  q === 'Q3',
               'border-emerald-500':q === 'Q4',
             }">
          <div class="flex items-center justify-between mb-3">
            <span class="text-sm font-bold px-2 py-0.5 rounded"
                  :class="quarterColor(q)">{{ q }}</span>
            <span class="text-xs font-semibold px-2 py-0.5 rounded"
                  :class="quarterSummary[q].ach_pct >= 80 ? 'badge-green' : quarterSummary[q].ach_pct >= 50 ? 'badge-yellow' : 'badge-red'">
              {{ quarterSummary[q].ach_pct >= 80 ? 'On Track' : quarterSummary[q].ach_pct >= 50 ? 'At Risk' : 'Critical' }}
            </span>
          </div>
          <div class="space-y-1.5 mb-3">
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Target</span>
              <span class="text-gray-200 font-medium">{{ fmt.rupiah(quarterSummary[q].target) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Actual</span>
              <span class="font-semibold" :class="achTextColor(quarterSummary[q].ach_pct)">
                {{ fmt.rupiah(quarterSummary[q].actual) }}
              </span>
            </div>
          </div>
          <div class="h-1.5 bg-navy-800 rounded overflow-hidden">
            <div class="h-full rounded transition-all duration-700"
                 :class="achBarColor(quarterSummary[q].ach_pct)"
                 :style="`width:${Math.min(quarterSummary[q].ach_pct, 100)}%`" />
          </div>
          <div class="text-right mt-1">
            <span class="text-xs font-bold" :class="achTextColor(quarterSummary[q].ach_pct)">
              {{ quarterSummary[q].ach_pct }}%
            </span>
          </div>
        </div>
      </div>

      <!-- ── SUMMARY TABLE ───────────────────────────────────────── -->
      <div class="card overflow-x-auto">
        <table class="tbl">
          <thead>
            <tr>
              <th class="w-14 text-center">Quarter</th>
              <th class="w-32">Bulan</th>
              <th class="text-right">Target Revenue</th>
              <th class="text-right">Actual Revenue</th>
              <th class="text-right">Collection</th>
              <th class="text-right">Outstanding</th>
              <th class="w-36">Achievement %</th>
              <th class="w-24">Status</th>
              <th class="w-16 text-center">Detail</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="(row, idx) in data.summary" :key="row.month_num">

              <!-- ── Baris bulan ────────────────────────────────── -->
              <tr class="cursor-pointer select-none transition-colors"
                  :class="[
                    selectedMonth === row.month_num
                      ? 'bg-primary-900/25 border-l-2 border-primary-500'
                      : row.is_current
                        ? 'bg-primary-900/10 hover:bg-primary-900/20'
                        : 'hover:bg-navy-800/60',
                    !row.is_past && !row.is_current ? 'opacity-40' : ''
                  ]"
                  @click="toggleDetail(row.month_num)">

                <!-- Quarter badge — hanya tampil di baris pertama per quarter -->
                <td class="text-center py-3">
                  <span v-if="idx === 0 || data.summary[idx-1].quarter !== row.quarter"
                        class="inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold"
                        :class="quarterColor(row.quarter)">
                    {{ row.quarter }}
                  </span>
                </td>

                <!-- Bulan -->
                <td class="py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                         :class="row.is_current ? 'bg-primary-400 animate-pulse'
                                 : row.is_past ? 'bg-gray-600' : 'bg-navy-700'" />
                    <span class="text-sm font-medium"
                          :class="row.is_current ? 'text-primary-300' : 'text-gray-200'">
                      {{ row.month_name }}
                    </span>
                    <span v-if="row.is_current"
                          class="text-xs px-1.5 py-0.5 rounded-full bg-primary-900/40 text-primary-400
                                 border border-primary-800/50 leading-none">
                      Ini
                    </span>
                  </div>
                </td>

                <!-- Target Revenue -->
                <td class="text-right text-xs text-gray-300 py-3">
                  {{ row.target > 0 ? fmt.rupiah(row.target) : '—' }}
                </td>

                <!-- Actual Revenue -->
                <td class="text-right text-xs font-medium py-3"
                    :class="row.actual > 0 ? 'text-emerald-400' : 'text-gray-600'">
                  {{ row.actual > 0 ? fmt.rupiah(row.actual) : '—' }}
                </td>

                <!-- Collection -->
                <td class="text-right text-xs py-3"
                    :class="row.collection > 0 ? 'text-purple-300' : 'text-gray-600'">
                  {{ row.collection > 0 ? fmt.rupiah(row.collection) : '—' }}
                </td>

                <!-- Outstanding -->
                <td class="text-right text-xs py-3"
                    :class="row.outstanding > 0 ? 'text-orange-400 font-medium' : 'text-gray-600'">
                  {{ row.outstanding > 0 ? fmt.rupiah(row.outstanding) : '—' }}
                </td>

                <!-- Achievement bar + % -->
                <td class="py-3">
                  <div v-if="row.is_past || row.is_current" class="flex items-center gap-1.5">
                    <div class="flex-1 h-1.5 bg-navy-700 rounded overflow-hidden">
                      <div class="h-full rounded transition-all duration-700"
                           :class="achBarColor(row.ach_pct)"
                           :style="`width:${Math.min(row.ach_pct, 100)}%`" />
                    </div>
                    <span class="text-xs w-10 text-right flex-shrink-0 font-medium"
                          :class="achTextColor(row.ach_pct)">
                      {{ row.ach_pct }}%
                    </span>
                  </div>
                  <span v-else class="text-xs text-gray-700">—</span>
                </td>

                <!-- Status -->
                <td class="py-3">
                  <span v-if="row.is_past || row.is_current" :class="statusBadge(row.status)">
                    {{ row.status }}
                  </span>
                  <span v-else class="text-xs text-gray-700 italic">Upcoming</span>
                </td>

                <!-- Chevron + jumlah proyek -->
                <td class="text-center py-3">
                  <button v-if="row.project_count > 0"
                          class="flex items-center gap-1 mx-auto text-xs text-primary-400
                                 hover:text-primary-300 transition-colors">
                    <span class="font-medium">{{ row.project_count }}</span>
                    <i class="fa-solid fa-chevron-down transition-transform duration-200"
                       :class="selectedMonth === row.month_num ? 'rotate-180' : ''" />
                  </button>
                  <span v-else class="text-xs text-gray-700">—</span>
                </td>
              </tr>

              <!-- ── EXPANDED DETAIL ─────────────────────────────── -->
              <tr v-if="selectedMonth === row.month_num">
                <td colspan="9" class="p-0 bg-navy-900/70">
                  <div class="px-6 py-4 border-y border-primary-900/30">

                    <!-- Loading -->
                    <div v-if="detailPending"
                         class="flex items-center gap-2 text-xs text-gray-500 py-3 justify-center">
                      <i class="fa-solid fa-circle-notch fa-spin" />
                      Memuat detail proyek...
                    </div>

                    <template v-else>
                      <!-- Sub-header -->
                      <div class="flex items-center justify-between mb-3">
                        <div class="text-xs font-semibold text-primary-300">
                          <i class="fa-solid fa-folder-open mr-1.5" />
                          Detail Proyek — {{ row.month_name }} {{ f.tahun }}
                        </div>
                        <div class="flex gap-3">
                          <NuxtLink :to="`/revenue/tracker?tahun=${f.tahun}`"
                                    class="text-xs text-gray-400 hover:text-primary-400 transition-colors
                                           flex items-center gap-1">
                            <i class="fa-solid fa-list-check text-xs" />Revenue Tracker
                          </NuxtLink>
                          <NuxtLink :to="`/revenue/invoice?tahun=${f.tahun}`"
                                    class="text-xs text-gray-400 hover:text-primary-400 transition-colors
                                           flex items-center gap-1">
                            <i class="fa-solid fa-file-invoice text-xs" />Invoice & Payment
                          </NuxtLink>
                        </div>
                      </div>

                      <!-- Detail table -->
                      <table v-if="data.detail_rows?.length" class="w-full text-xs">
                        <thead>
                          <tr class="border-b border-navy-700">
                            <th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-28">Project</th>
                            <th class="text-left py-1.5 pr-3 text-gray-500 font-medium">Client</th>
                            <th class="text-left py-1.5 pr-3 text-gray-500 font-medium">Produk</th>
                            <th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-20">Organisasi</th>
                            <th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-20">Kategori</th>
                            <th class="text-right py-1.5 pr-3 text-gray-500 font-medium">Target</th>
                            <th class="text-right py-1.5 pr-3 text-gray-500 font-medium">Actual</th>
                            <th class="text-right py-1.5 pr-3 text-gray-500 font-medium w-16">Ach%</th>
                            <th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-20">Status Bulan</th>
                            <th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-16">Risk</th>
                            <th class="text-center py-1.5 text-gray-500 font-medium w-16">Invoice</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr v-for="dr in detailSlice" :key="dr.project_id"
                              class="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors">
                            <td class="py-2 pr-3 font-medium text-gray-200">{{ dr.project_id }}</td>
                            <td class="py-2 pr-3 text-gray-300 max-w-[160px] truncate">{{ dr.client }}</td>
                            <td class="py-2 pr-3 text-gray-400 max-w-[160px] truncate">{{ dr.product || '—' }}</td>
                            <td class="py-2 pr-3 text-gray-400">{{ dr.organisasi }}</td>
                            <td class="py-2 pr-3">
                              <span :class="dr.kategori === 'Project' ? 'badge-blue' : 'badge-purple'">
                                {{ dr.kategori }}
                              </span>
                            </td>
                            <td class="py-2 pr-3 text-right text-gray-300">{{ fmt.rupiah(dr.target) }}</td>
                            <td class="py-2 pr-3 text-right font-semibold"
                                :class="dr.actual > 0 ? 'text-emerald-400' : 'text-gray-600'">
                              {{ dr.actual > 0 ? fmt.rupiah(dr.actual) : '—' }}
                            </td>
                            <td class="py-2 pr-3 text-right font-medium"
                                :class="fmt.achColor(dr.ach_pct)">
                              {{ dr.ach_pct?.toFixed(0) ?? '—' }}%
                            </td>
                            <td class="py-2 pr-3">
                              <span :class="fmt.statusClass(dr.status)"
                                    :title="`Status berdasarkan kinerja bulan ini: ${dr.ach_pct?.toFixed(0)}%`">
                                {{ dr.status }}
                              </span>
                            </td>
                            <td class="py-2 pr-3">
                              <span :class="fmt.riskClass(dr.risk_level)">{{ dr.risk_level }}</span>
                            </td>
                            <td class="py-2 text-center">
                              <NuxtLink :to="`/revenue/invoice?project=${dr.project_id}`"
                                        class="inline-flex items-center gap-1 text-primary-400
                                               hover:text-primary-300 transition-colors"
                                        title="Lihat invoice proyek ini">
                                <i class="fa-solid fa-file-invoice" />
                              </NuxtLink>
                            </td>
                          </tr>
                        </tbody>
                        <!-- Sub-total -->
                        <tfoot>
                          <tr class="border-t border-navy-600 bg-navy-800/50">
                            <td colspan="5" class="py-2 pr-3 text-gray-400 font-semibold">
                              Total ({{ detailTotal }} proyek)
                            </td>
                            <td class="py-2 pr-3 text-right text-gray-200 font-semibold">
                              {{ fmt.rupiah(detailTotalTarget) }}
                            </td>
                            <td class="py-2 pr-3 text-right text-emerald-400 font-semibold">
                              {{ fmt.rupiah(detailTotalActual) }}
                            </td>
                            <td colspan="3" />
                          </tr>
                        </tfoot>
                      </table>
                      <AppPagination
                        v-if="detailTotalPages > 1"
                        v-model:page="detailPage"
                        :total-pages="detailTotalPages"
                        :total="detailTotal"
                        :per-page="DETAIL_PER_PAGE"
                        class="mt-3"
                      />

                      <div v-else class="text-xs text-gray-600 py-4 text-center">
                        Tidak ada data proyek untuk bulan ini
                      </div>
                    </template>
                  </div>
                </td>
              </tr>

            </template>

            <!-- ── GRAND TOTAL ROW ─────────────────────────────── -->
            <tr class="border-t-2 border-navy-600 bg-navy-800/40 font-semibold">
              <td colspan="2" class="py-3 px-3 text-xs text-gray-300">
                <i class="fa-solid fa-sigma mr-1.5 text-gray-500" />Grand Total {{ f.tahun }}
              </td>
              <td class="text-right text-xs text-gray-200 py-3 pr-3">{{ fmt.rupiah(data.grand_target) }}</td>
              <td class="text-right text-xs text-emerald-400 py-3 pr-3">{{ fmt.rupiah(data.grand_actual) }}</td>
              <td class="text-right text-xs text-purple-300 py-3 pr-3">{{ fmt.rupiah(data.grand_coll) }}</td>
              <td class="text-right text-xs py-3 pr-3"
                  :class="data.grand_out > 0 ? 'text-orange-400' : 'text-gray-600'">
                {{ data.grand_out > 0 ? fmt.rupiah(data.grand_out) : '—' }}
              </td>
              <td class="py-3 pr-3">
                <div class="flex items-center gap-1.5">
                  <div class="flex-1 h-2 bg-navy-700 rounded overflow-hidden">
                    <div class="h-full rounded transition-all duration-700"
                         :class="achBarColor(data.grand_ach)"
                         :style="`width:${Math.min(data.grand_ach, 100)}%`" />
                  </div>
                  <span class="text-xs w-10 text-right flex-shrink-0 font-bold"
                        :class="achTextColor(data.grand_ach)">
                    {{ data.grand_ach }}%
                  </span>
                </div>
              </td>
              <td colspan="2" />
            </tr>
          </tbody>
        </table>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get } = useApi()
const fmt = useFormat()

const f = reactive({ tahun: new Date().getFullYear() })
const selectedMonth = ref(0)
const detailPending = ref(false)

const { data, pending, refresh } = await useAsyncData(
  'rev-monthly',
  () => get('/v1/revenue/monthly', {
    tahun: f.tahun,
    month: selectedMonth.value,
  }),
  { server: false }
)

async function onYearChange() {
  selectedMonth.value = 0
  await refresh()
}

async function toggleDetail(monthNum: number) {
  if (selectedMonth.value === monthNum) {
    selectedMonth.value = 0
    await refresh()
    return
  }
  selectedMonth.value = monthNum
  detailPage.value    = 1
  detailPending.value = true
  await refresh()
  detailPending.value = false
}

const detailTotalTarget = computed(() =>
  (data.value?.detail_rows ?? []).reduce((s: number, r: any) => s + (r.target ?? 0), 0)
)
const detailTotalActual = computed(() =>
  (data.value?.detail_rows ?? []).reduce((s: number, r: any) => s + (r.actual ?? 0), 0)
)

const DETAIL_PER_PAGE  = 5
const detailPage       = ref(1)
const detailTotal      = computed(() => data.value?.detail_rows?.length ?? 0)
const detailTotalPages = computed(() => Math.ceil(detailTotal.value / DETAIL_PER_PAGE) || 1)
const detailSlice      = computed(() => {
  const all   = data.value?.detail_rows ?? []
  const start = (detailPage.value - 1) * DETAIL_PER_PAGE
  return all.slice(start, start + DETAIL_PER_PAGE)
})

const quarterSummary = computed(() => {
  const summary = data.value?.summary ?? []
  const result: Record<string, { target: number; actual: number; collection: number; outstanding: number; ach_pct: number }> = {}
  for (const q of ['Q1','Q2','Q3','Q4']) {
    const rows = summary.filter((r: any) => r.quarter === q)
    const target     = rows.reduce((s: number, r: any) => s + r.target, 0)
    const actual     = rows.reduce((s: number, r: any) => s + r.actual, 0)
    const collection = rows.reduce((s: number, r: any) => s + r.collection, 0)
    const outstanding= rows.reduce((s: number, r: any) => s + r.outstanding, 0)
    const ach_pct    = target > 0 ? Math.round(actual / target * 100 * 10) / 10 : 0
    result[q] = { target, actual, collection, outstanding, ach_pct }
  }
  return result
})

function isLastMonthOfQuarter(monthNum: number): boolean {
  return [3, 6, 9, 12].includes(monthNum)
}

function quarterColor(q: string): string {
  const map: Record<string, string> = {
    Q1: 'bg-blue-900/50 text-blue-300',
    Q2: 'bg-purple-900/50 text-purple-300',
    Q3: 'bg-amber-900/50 text-amber-300',
    Q4: 'bg-emerald-900/50 text-emerald-300',
  }
  return map[q] ?? 'bg-navy-700 text-gray-400'
}

function achBarColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

function achTextColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-400'
  if (pct >= 50) return 'text-yellow-400'
  return 'text-red-400'
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    'On Track': 'badge-green',
    'At Risk':  'badge-yellow',
    'Critical': 'badge-red',
  }
  return map[status] ?? 'badge-gray'
}
</script>
