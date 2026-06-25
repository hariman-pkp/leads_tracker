<template>
  <div class="min-h-screen bg-apex-bg text-apex-text p-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-apex-text">
          <i class="fa-solid fa-chart-line text-primary-400 mr-2" />Pipeline Forecast
        </h1>
        <p class="text-sm text-apex-muted mt-0.5">Proyeksi pipeline berdasarkan weighted value & exp. close date</p>
      </div>
      <select v-model="selectedYear" @change="load"
              class="form-select text-sm w-28">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <div v-if="loading" class="flex justify-center py-24 text-apex-muted">
      <i class="fa-solid fa-spinner fa-spin mr-2" />Memuat forecast...
    </div>

    <template v-else-if="data">

      <!-- Summary cards -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div class="apex-card text-center">
          <p class="text-xs text-apex-muted mb-1">Total Weighted Pipeline</p>
          <p class="text-xl font-bold text-primary-400">{{ fmt.rupiah(data.summary.total_weighted) }}</p>
        </div>
        <div class="apex-card text-center">
          <p class="text-xs text-apex-muted mb-1">Actual Won YTD</p>
          <p class="text-xl font-bold text-emerald-400">{{ fmt.rupiah(data.summary.total_won) }}</p>
        </div>
        <div class="apex-card text-center">
          <p class="text-xs text-apex-muted mb-1">Leads di Forecast</p>
          <p class="text-xl font-bold text-apex-text">{{ data.summary.total_leads }}</p>
        </div>
        <div class="apex-card text-center">
          <p class="text-xs text-apex-muted mb-1">Closing Rate</p>
          <p class="text-xl font-bold"
             :class="closingRate >= 30 ? 'text-emerald-400' : closingRate >= 15 ? 'text-yellow-400' : 'text-red-400'">
            {{ closingRate }}%
          </p>
        </div>
      </div>

      <!-- Monthly forecast chart -->
      <div class="apex-card mb-6">
        <h2 class="text-sm font-semibold text-apex-text mb-4">Forecast per Bulan</h2>
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="text-xs text-apex-muted border-b border-apex-border">
                <th class="text-left py-2 pr-4 font-medium">Bulan</th>
                <th class="text-right py-2 px-4 font-medium">Jumlah Lead</th>
                <th class="text-right py-2 px-4 font-medium">Total Propose</th>
                <th class="text-right py-2 px-4 font-medium">Weighted Value</th>
                <th class="text-right py-2 pl-4 font-medium">Actual Won</th>
                <th class="text-left py-2 pl-4 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in data.monthly_forecast" :key="row.bulan"
                  class="border-b border-apex-border/40 hover:bg-apex-card/30 transition-colors">
                <td class="py-3 pr-4 font-medium text-apex-text">{{ row.bulan_label }}</td>
                <td class="py-3 px-4 text-right text-apex-muted">{{ row.jumlah_lead }}</td>
                <td class="py-3 px-4 text-right text-apex-muted">{{ fmt.rupiah(row.total_propose) }}</td>
                <td class="py-3 px-4 text-right font-semibold text-primary-400">{{ fmt.rupiah(row.total_weighted) }}</td>
                <td class="py-3 pl-4 text-right text-emerald-400 font-semibold">{{ fmt.rupiah(row.actual_won) }}</td>
                <td class="py-3 pl-4 w-32">
                  <div class="h-2 bg-apex-border/30 rounded-full overflow-hidden">
                    <div class="h-2 rounded-full bg-emerald-500 transition-all"
                         :style="{ width: wonPct(row) + '%' }" />
                  </div>
                  <span class="text-xs text-apex-muted">{{ wonPct(row) }}% closed</span>
                </td>
              </tr>
              <tr v-if="!data.monthly_forecast.length">
                <td colspan="6" class="py-8 text-center text-apex-muted text-sm">
                  Belum ada lead dengan exp. close date di tahun {{ selectedYear }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Per-sales breakdown -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div class="apex-card">
          <h2 class="text-sm font-semibold text-apex-text mb-4">Pipeline per Sales</h2>
          <div class="space-y-3">
            <div v-for="s in data.by_sales" :key="s.sales_owner"
                 class="flex items-center gap-3">
              <div class="w-28 text-xs text-apex-muted truncate">{{ s.sales_owner }}</div>
              <div class="flex-1">
                <div class="h-2 bg-apex-border/30 rounded-full overflow-hidden">
                  <div class="h-2 bg-primary-500 rounded-full transition-all"
                       :style="{ width: salesBarPct(s) + '%' }" />
                </div>
              </div>
              <div class="text-right w-24 text-xs">
                <span class="text-primary-400 font-semibold">{{ fmt.rupiah(s.total_weighted) }}</span>
              </div>
              <div class="text-right w-16 text-xs text-apex-muted">
                {{ s.jumlah_lead }} lead
              </div>
            </div>
            <p v-if="!data.by_sales.length" class="text-sm text-apex-muted text-center py-4">
              Tidak ada data
            </p>
          </div>
        </div>

        <!-- Loss reason analysis -->
        <div class="apex-card">
          <h2 class="text-sm font-semibold text-apex-text mb-4">
            <i class="fa-solid fa-circle-xmark text-red-400 mr-1" />Analisa Loss Reason
          </h2>
          <div class="space-y-3">
            <div v-for="(lr, i) in data.loss_analysis" :key="i"
                 class="p-3 rounded-lg bg-apex-bg border border-apex-border/40">
              <div class="flex items-start justify-between gap-2 mb-1">
                <span class="text-sm text-apex-text font-medium">{{ lr.reason }}</span>
                <span class="badge badge-red text-xs flex-shrink-0">{{ lr.jumlah }}x</span>
              </div>
              <p class="text-xs text-red-400">Nilai hilang: {{ fmt.rupiah(lr.nilai_hilang) }}</p>
            </div>
            <p v-if="!data.loss_analysis.length" class="text-sm text-apex-muted text-center py-4">
              Belum ada lead Lost tahun ini
            </p>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get }  = useApi()
const fmt      = useFormat()
const curYear  = new Date().getFullYear()
const selectedYear = ref(curYear)
const years    = Array.from({ length: 4 }, (_, i) => curYear - i)
const loading  = ref(false)
const data     = ref<any>(null)

async function load() {
  loading.value = true
  try {
    data.value = await get(`/v1/pipeline/forecast?tahun=${selectedYear.value}`)
  } finally {
    loading.value = false
  }
}

const closingRate = computed(() => {
  if (!data.value) return 0
  const t = data.value.summary.total_leads
  const w = data.value.summary.total_won_count
  return t > 0 ? Math.round(w / t * 100) : 0
})

const maxWeighted = computed(() =>
  Math.max(...(data.value?.by_sales || []).map((s: any) => s.total_weighted), 1)
)

function salesBarPct(s: any) {
  return Math.round(s.total_weighted / maxWeighted.value * 100)
}

function wonPct(row: any) {
  if (!row.total_weighted) return 0
  return Math.min(100, Math.round(row.actual_won / row.total_weighted * 100))
}

onMounted(load)
</script>
