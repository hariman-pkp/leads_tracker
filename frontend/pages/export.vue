<template>
  <div class="min-h-screen bg-apex-bg text-apex-text p-6">

    <div class="mb-6">
      <h1 class="text-2xl font-bold text-apex-text">
        <i class="fa-solid fa-file-arrow-down text-emerald-400 mr-2" />Export Data
      </h1>
      <p class="text-sm text-apex-muted mt-0.5">Download data ke format CSV yang dapat dibuka di Excel</p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

      <!-- Export Pipeline -->
      <div class="apex-card">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-primary-900/50 flex items-center justify-center text-primary-400">
            <i class="fa-solid fa-funnel-dollar text-lg" />
          </div>
          <div>
            <h2 class="font-semibold text-apex-text">Pipeline</h2>
            <p class="text-xs text-apex-muted">Semua leads beserta status & nilai</p>
          </div>
        </div>

        <div class="space-y-3 mb-4">
          <div>
            <label class="text-xs text-apex-muted mb-1 block">Filter Stage</label>
            <select v-model="pipeFilter.stage" class="form-select text-sm w-full">
              <option value="">Semua Stage</option>
              <option v-for="s in stages" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-apex-muted mb-1 block">Filter Sales</label>
            <select v-model="pipeFilter.sales" class="form-select text-sm w-full">
              <option value="">Semua Sales</option>
              <option v-for="s in salesList" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="downloadPipeline" :disabled="downloading.pipeline"
                  class="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            <i :class="downloading.pipeline ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-csv'" />
            {{ downloading.pipeline ? 'Menyiapkan...' : 'CSV' }}
          </button>
          <button @click="downloadPipelinePdf" :disabled="downloading.pipelinePdf"
                  class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
            <i :class="downloading.pipelinePdf ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-pdf'" />
            {{ downloading.pipelinePdf ? 'Menyiapkan...' : 'PDF' }}
          </button>
        </div>
      </div>

      <!-- Export Daily Reports -->
      <div class="apex-card">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-blue-900/50 flex items-center justify-center text-blue-400">
            <i class="fa-solid fa-clipboard-list text-lg" />
          </div>
          <div>
            <h2 class="font-semibold text-apex-text">Laporan Harian</h2>
            <p class="text-xs text-apex-muted">Laporan harian sales per bulan</p>
          </div>
        </div>

        <div class="space-y-3 mb-4">
          <div>
            <label class="text-xs text-apex-muted mb-1 block">Bulan</label>
            <input v-model="reportFilter.month" type="month"
                   class="form-input text-sm w-full" />
          </div>
          <div>
            <label class="text-xs text-apex-muted mb-1 block">Filter Sales</label>
            <select v-model="reportFilter.sales" class="form-select text-sm w-full">
              <option value="">Semua Sales</option>
              <option v-for="s in salesList" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="downloadReports" :disabled="downloading.reports"
                  class="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            <i :class="downloading.reports ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-csv'" />
            {{ downloading.reports ? 'Menyiapkan...' : 'CSV' }}
          </button>
          <button @click="downloadReportsPdf" :disabled="downloading.reportsPdf"
                  class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
            <i :class="downloading.reportsPdf ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-pdf'" />
            {{ downloading.reportsPdf ? 'Menyiapkan...' : 'PDF' }}
          </button>
        </div>
      </div>

      <!-- Export Analytics -->
      <div class="apex-card">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-xl bg-yellow-900/50 flex items-center justify-center text-yellow-400">
            <i class="fa-solid fa-chart-bar text-lg" />
          </div>
          <div>
            <h2 class="font-semibold text-apex-text">Analytics per Sales</h2>
            <p class="text-xs text-apex-muted">Ringkasan kinerja setiap sales per tahun</p>
          </div>
        </div>

        <div class="space-y-3 mb-4">
          <div>
            <label class="text-xs text-apex-muted mb-1 block">Tahun</label>
            <select v-model="analyticsFilter.tahun" class="form-select text-sm w-full">
              <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>
          <div class="h-[60px] flex items-center">
            <p class="text-xs text-apex-muted">Kolom: Sales, Total Leads, Won, Lost, Total Deal, Win Rate, Avg Probability</p>
          </div>
        </div>

        <div class="flex gap-2">
          <button @click="downloadAnalytics" :disabled="downloading.analytics"
                  class="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            <i :class="downloading.analytics ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-csv'" />
            {{ downloading.analytics ? 'Menyiapkan...' : 'CSV' }}
          </button>
          <button @click="downloadAnalyticsPdf" :disabled="downloading.analyticsPdf"
                  class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm">
            <i :class="downloading.analyticsPdf ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-file-pdf'" />
            {{ downloading.analyticsPdf ? 'Menyiapkan...' : 'PDF' }}
          </button>
        </div>
      </div>

    </div>

    <!-- Info -->
    <div class="mt-6 p-4 rounded-xl border border-blue-500/30 bg-blue-900/10 text-sm text-blue-300">
      <i class="fa-solid fa-circle-info mr-2" />
      <strong>CSV</strong> — dapat dibuka di Microsoft Excel (pilih encoding UTF-8 saat import).
      <strong class="ml-3">PDF</strong> — format landscape A4, siap cetak atau kirim via email.
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get }   = useApi()
const auth      = useAuthStore()
const config    = useRuntimeConfig()
const authToken = computed(() => auth.token)

const curYear = new Date().getFullYear()
const years   = Array.from({ length: 5 }, (_, i) => curYear - i)

const stages    = ['New','In Progress','Prospect','Qualified','Proposal','Proposal Sent','Negotiation','On Hold','Won','Lost']
const salesList = ref<string[]>([])

const pipeFilter      = reactive({ stage: '', sales: '' })
const { todayStr: _todayStr } = useFormat()
const reportFilter    = reactive({ month: _todayStr().slice(0, 7), sales: '' })
const analyticsFilter = reactive({ tahun: curYear })

const downloading = reactive({
  pipeline: false, pipelinePdf: false,
  reports: false,  reportsPdf: false,
  analytics: false, analyticsPdf: false,
})

async function loadSales() {
  try {
    const res = await get('/v1/sales')
    salesList.value = (res.sales || []).map((s: any) => s.nama)
  } catch {}
}

async function downloadFile(url: string, filename: string) {
  const baseURL = (config.public.apiBase as string)
  const headers: Record<string, string> = {}
  if (authToken.value) headers['Authorization'] = `Bearer ${authToken.value}`
  const res = await fetch(`${baseURL}${url}`, { headers })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const blob = await res.blob()
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

async function downloadPipeline() {
  downloading.pipeline = true
  try {
    const params = new URLSearchParams()
    if (pipeFilter.stage) params.set('stage', pipeFilter.stage)
    if (pipeFilter.sales) params.set('sales', pipeFilter.sales)
    await downloadFile(`/v1/export/pipeline?${params}`, 'pipeline_export.csv')
  } finally { downloading.pipeline = false }
}

async function downloadReports() {
  downloading.reports = true
  try {
    const params = new URLSearchParams()
    if (reportFilter.month) params.set('month', reportFilter.month)
    if (reportFilter.sales) params.set('sales', reportFilter.sales)
    await downloadFile(`/v1/export/daily-reports?${params}`, `laporan_harian_${reportFilter.month}.csv`)
  } finally { downloading.reports = false }
}

async function downloadAnalytics() {
  downloading.analytics = true
  try {
    await downloadFile(`/v1/export/analytics?tahun=${analyticsFilter.tahun}`, `analytics_${analyticsFilter.tahun}.csv`)
  } finally { downloading.analytics = false }
}

async function downloadPipelinePdf() {
  downloading.pipelinePdf = true
  try {
    const params = new URLSearchParams()
    if (pipeFilter.stage) params.set('stage', pipeFilter.stage)
    if (pipeFilter.sales) params.set('sales', pipeFilter.sales)
    await downloadFile(`/v1/export/pipeline/pdf?${params}`, 'pipeline_report.pdf')
  } finally { downloading.pipelinePdf = false }
}

async function downloadReportsPdf() {
  downloading.reportsPdf = true
  try {
    const params = new URLSearchParams()
    if (reportFilter.month) params.set('month', reportFilter.month)
    if (reportFilter.sales) params.set('sales', reportFilter.sales)
    await downloadFile(`/v1/export/daily-reports/pdf?${params}`, `laporan_harian_${reportFilter.month}.pdf`)
  } finally { downloading.reportsPdf = false }
}

async function downloadAnalyticsPdf() {
  downloading.analyticsPdf = true
  try {
    await downloadFile(`/v1/export/analytics/pdf?tahun=${analyticsFilter.tahun}`, `analytics_${analyticsFilter.tahun}.pdf`)
  } finally { downloading.analyticsPdf = false }
}

onMounted(loadSales)
</script>
