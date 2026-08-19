<template>
  <div>
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-gauge-high text-primary-400 mr-2" />Command Center</h1>
        <p class="page-subtitle">{{ data?.period }} · Ringkasan untuk Manager & Owner</p>
      </div>
      <button @click="refresh" class="btn-secondary btn-sm" :disabled="pending">
        <i :class="`fa-solid fa-rotate ${pending ? 'fa-spin' : ''}`" />Refresh
      </button>
    </div>

    <div v-if="pending" class="flex justify-center py-24">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <div v-else-if="data" class="space-y-5">

      <!-- ── 1. REVENUE PULSE ──────────────────────────────────────────── -->
      <div class="card">
        <div class="section-title text-primary-400 mb-4">
          <i class="fa-solid fa-chart-line mr-1.5" />Revenue Pulse — {{ data.period }}
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div class="bg-navy-800/50 rounded-xl p-3">
            <div class="text-xs text-apex-muted mb-1">Target Bulan Ini</div>
            <div class="text-lg font-bold text-gray-100">{{ fmt.rupiah(data.revenue_pulse.target_monthly) }}</div>
          </div>
          <div class="bg-navy-800/50 rounded-xl p-3">
            <div class="text-xs text-apex-muted mb-1">Realisasi</div>
            <div class="text-lg font-bold text-emerald-400">{{ fmt.rupiah(data.revenue_pulse.realisasi) }}</div>
            <div class="text-xs mt-0.5" :class="data.revenue_pulse.achievement_pct >= 80 ? 'text-emerald-400' : data.revenue_pulse.achievement_pct >= 50 ? 'text-yellow-400' : 'text-red-400'">
              {{ data.revenue_pulse.achievement_pct }}% achievement
            </div>
          </div>
          <div class="bg-navy-800/50 rounded-xl p-3">
            <div class="text-xs text-apex-muted mb-1">Gap to Target</div>
            <div class="text-lg font-bold" :class="data.revenue_pulse.gap_to_target > 0 ? 'text-red-400' : 'text-emerald-400'">
              {{ data.revenue_pulse.gap_to_target > 0 ? fmt.rupiah(data.revenue_pulse.gap_to_target) : '✓ Tercapai' }}
            </div>
          </div>
          <div class="bg-navy-800/50 rounded-xl p-3">
            <div class="text-xs text-apex-muted mb-1">Outstanding Invoice</div>
            <div class="text-lg font-bold text-orange-400">{{ fmt.rupiah(data.revenue_pulse.outstanding) }}</div>
          </div>
        </div>

        <!-- Progress bar -->
        <div class="mb-4">
          <div class="flex justify-between text-xs text-apex-muted mb-1">
            <span>Progress Bulan Ini</span>
            <span>{{ data.revenue_pulse.achievement_pct }}%</span>
          </div>
          <div class="h-2 bg-navy-800 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all"
                 :class="data.revenue_pulse.achievement_pct >= 80 ? 'bg-emerald-500' : data.revenue_pulse.achievement_pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                 :style="`width: ${Math.min(data.revenue_pulse.achievement_pct, 100)}%`" />
          </div>
        </div>

        <!-- Closing this month -->
        <div v-if="data.revenue_pulse.closing_this_month?.length">
          <div class="text-xs font-semibold text-gray-400 mb-2">
            <i class="fa-solid fa-bullseye mr-1 text-yellow-400" />
            {{ data.revenue_pulse.closing_this_month.length }} Lead Target Closing Bulan Ini
          </div>
          <div class="space-y-1.5">
            <NuxtLink v-for="l in data.revenue_pulse.closing_this_month" :key="l.lead_id"
              :to="`/pipeline/${l.lead_id}`"
              class="flex items-center gap-2 p-2 rounded-lg bg-yellow-900/10 hover:bg-yellow-900/20 transition-colors">
              <span :class="fmt.priorityClass(l.prioritas)" class="text-xs flex-shrink-0">{{ l.prioritas }}</span>
              <span class="flex-1 text-sm text-gray-200 truncate">{{ l.nama_company }}</span>
              <span :class="fmt.stageClass(l.stage)" class="text-xs flex-shrink-0">{{ l.stage }}</span>
              <span class="text-xs text-emerald-400 flex-shrink-0">{{ fmt.rupiah(l.propose_value) }}</span>
              <span class="text-xs text-yellow-400 flex-shrink-0">{{ fmt.tgl(l.exp_close_date) }}</span>
            </NuxtLink>
          </div>
        </div>
        <div v-else class="text-xs text-apex-muted italic">Tidak ada lead target closing bulan ini.</div>
      </div>

      <!-- ── 2. INVOICE ALERTS ──────────────────────────────────────────── -->
      <div class="card">
        <div class="section-title text-orange-400 mb-4">
          <i class="fa-solid fa-file-invoice-dollar mr-1.5" />Invoice Alerts
          <span v-if="totalInvoiceAlert > 0" class="ml-2 bg-orange-900/50 text-orange-300 text-xs px-2 py-0.5 rounded-full">
            {{ totalInvoiceAlert }} item
          </span>
        </div>

        <!-- Summary chips -->
        <div class="flex flex-wrap gap-2 mb-4">
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
               :class="data.invoice_alerts.summary.no_invoice_count ? 'bg-red-900/30 text-red-300' : 'bg-navy-800/50 text-gray-500'">
            <i class="fa-solid fa-file-circle-xmark" />
            {{ data.invoice_alerts.summary.no_invoice_count }} Belum Invoice Bulan Ini
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
               :class="data.invoice_alerts.summary.overdue_count ? 'bg-red-900/30 text-red-300' : 'bg-navy-800/50 text-gray-500'">
            <i class="fa-solid fa-clock" />
            {{ data.invoice_alerts.summary.overdue_count }} Overdue >30 hari
            <span v-if="data.invoice_alerts.summary.overdue_amount" class="text-xs opacity-75">
              ({{ fmt.rupiah(data.invoice_alerts.summary.overdue_amount) }})
            </span>
          </div>
          <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm"
               :class="data.invoice_alerts.summary.due_soon_count ? 'bg-yellow-900/30 text-yellow-300' : 'bg-navy-800/50 text-gray-500'">
            <i class="fa-solid fa-calendar-exclamation" />
            {{ data.invoice_alerts.summary.due_soon_count }} Jatuh Tempo Minggu Ini
          </div>
        </div>

        <!-- Belum invoice bulan ini -->
        <div v-if="data.invoice_alerts.no_invoice_this_month?.length" class="mb-4">
          <div class="text-xs font-semibold text-red-400 mb-2">
            <i class="fa-solid fa-file-circle-xmark mr-1" />Project Belum Terbitkan Invoice Bulan Ini
          </div>
          <div class="space-y-1.5">
            <div v-for="p in data.invoice_alerts.no_invoice_this_month" :key="p.project_id"
                 class="flex items-center gap-2 p-2 rounded-lg bg-red-900/10 border border-red-900/20">
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-200 truncate">{{ p.client }}</div>
                <div class="text-xs text-apex-muted">{{ p.project_id }} · {{ p.product }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs text-emerald-400">{{ fmt.rupiah(p.revenue_target) }}</div>
                <div class="text-xs text-red-400">
                  {{ p.last_invoice_date ? `Terakhir: ${fmt.tgl(p.last_invoice_date)}` : 'Belum pernah invoice' }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Invoice overdue -->
        <div v-if="data.invoice_alerts.overdue_invoice?.length" class="mb-4">
          <div class="text-xs font-semibold text-red-400 mb-2">
            <i class="fa-solid fa-clock mr-1" />Invoice Belum Dibayar >30 Hari
          </div>
          <div class="space-y-1.5">
            <NuxtLink v-for="inv in data.invoice_alerts.overdue_invoice" :key="inv.id"
              to="/revenue/invoice"
              class="flex items-center gap-2 p-2 rounded-lg bg-red-900/10 border border-red-900/20 hover:bg-red-900/20 transition-colors">
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-200 truncate">{{ inv.client }}</div>
                <div class="text-xs text-apex-muted">{{ inv.invoice_no }} · {{ fmt.tgl(inv.invoice_date) }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs text-red-400 font-medium">{{ fmt.rupiah(inv.remaining) }}</div>
                <div class="text-xs text-red-300">{{ inv.days_overdue }} hari</div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Jatuh tempo minggu ini -->
        <div v-if="data.invoice_alerts.due_soon?.length">
          <div class="text-xs font-semibold text-yellow-400 mb-2">
            <i class="fa-solid fa-calendar-exclamation mr-1" />Target Invoice Jatuh Tempo Minggu Ini
          </div>
          <div class="space-y-1.5">
            <div v-for="p in data.invoice_alerts.due_soon" :key="p.project_id"
                 class="flex items-center gap-2 p-2 rounded-lg bg-yellow-900/10 border border-yellow-900/20">
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-200 truncate">{{ p.client }}</div>
                <div class="text-xs text-apex-muted">{{ p.project_id }} · {{ p.organisasi }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs text-yellow-400">{{ fmt.tgl(p.target_invoice_date) }}</div>
                <div class="text-xs text-apex-muted">{{ p.days_until_due }} hari lagi</div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="totalInvoiceAlert === 0" class="flex items-center gap-3 py-4">
          <i class="fa-solid fa-circle-check text-emerald-400 text-xl" />
          <span class="text-sm text-gray-400">Semua invoice beres. Tidak ada yang perlu ditindaklanjuti.</span>
        </div>
      </div>

      <!-- ── 3. PIPELINE DECISIONS ──────────────────────────────────────── -->
      <div class="card">
        <div class="section-title text-purple-400 mb-4">
          <i class="fa-solid fa-code-branch mr-1.5" />Pipeline Decisions
          <span v-if="totalPipelineAlert > 0" class="ml-2 bg-purple-900/50 text-purple-300 text-xs px-2 py-0.5 rounded-full">
            {{ totalPipelineAlert }} item perlu perhatian
          </span>
        </div>

        <!-- Stale pipeline -->
        <div v-if="data.pipeline_decisions.stale_pipeline?.length" class="mb-4">
          <div class="text-xs font-semibold text-amber-400 mb-2">
            <i class="fa-solid fa-triangle-exclamation mr-1" />Negotiation/Proposal Tanpa Update >30 Hari — Lanjut atau Lepas?
          </div>
          <div class="space-y-1.5">
            <NuxtLink v-for="l in data.pipeline_decisions.stale_pipeline" :key="l.lead_id"
              :to="`/pipeline/${l.lead_id}`"
              class="flex items-center gap-2 p-2 rounded-lg bg-amber-900/10 border border-amber-900/20 hover:bg-amber-900/20 transition-colors">
              <span :class="fmt.priorityClass(l.prioritas)" class="text-xs flex-shrink-0">{{ l.prioritas }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-200 truncate">{{ l.nama_company }}</div>
                <div class="text-xs text-apex-muted">{{ l.stage }} · {{ l.sales_owner }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs text-emerald-400">{{ fmt.rupiah(l.propose_value) }}</div>
                <div class="text-xs text-amber-400">{{ l.days_stale }} hari stale</div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Hot no proposal -->
        <div v-if="data.pipeline_decisions.hot_no_proposal?.length" class="mb-4">
          <div class="text-xs font-semibold text-orange-400 mb-2">
            <i class="fa-solid fa-fire mr-1" />Lead Hot >14 Hari Belum Ada Proposal
          </div>
          <div class="space-y-1.5">
            <NuxtLink v-for="l in data.pipeline_decisions.hot_no_proposal" :key="l.lead_id"
              :to="`/pipeline/${l.lead_id}`"
              class="flex items-center gap-2 p-2 rounded-lg bg-orange-900/10 border border-orange-900/20 hover:bg-orange-900/20 transition-colors">
              <span :class="fmt.priorityClass(l.prioritas)" class="text-xs flex-shrink-0">{{ l.prioritas }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-200 truncate">{{ l.nama_company }}</div>
                <div class="text-xs text-apex-muted">{{ l.stage }} · {{ l.sales_owner }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs text-emerald-400">{{ fmt.rupiah(l.propose_value) }}</div>
                <div class="text-xs text-orange-400">{{ l.days_in_pipe }} hari di pipe</div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <!-- Missed close date -->
        <div v-if="data.pipeline_decisions.missed_close?.length" class="mb-4">
          <div class="text-xs font-semibold text-red-400 mb-2">
            <i class="fa-solid fa-calendar-xmark mr-1" />Target Close Terlewat — Perlu Evaluasi
          </div>
          <div class="space-y-1.5">
            <NuxtLink v-for="l in data.pipeline_decisions.missed_close" :key="l.lead_id"
              :to="`/pipeline/${l.lead_id}`"
              class="flex items-center gap-2 p-2 rounded-lg bg-red-900/10 border border-red-900/20 hover:bg-red-900/20 transition-colors">
              <span :class="fmt.priorityClass(l.prioritas)" class="text-xs flex-shrink-0">{{ l.prioritas }}</span>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-200 truncate">{{ l.nama_company }}</div>
                <div class="text-xs text-apex-muted">{{ l.stage }} · exp. close: {{ fmt.tgl(l.exp_close_date) }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs text-emerald-400">{{ fmt.rupiah(l.propose_value) }}</div>
                <div class="text-xs text-red-400">+{{ l.days_overdue }} hari</div>
              </div>
            </NuxtLink>
          </div>
        </div>

        <div v-if="totalPipelineAlert === 0" class="flex items-center gap-3 py-4">
          <i class="fa-solid fa-circle-check text-emerald-400 text-xl" />
          <span class="text-sm text-gray-400">Pipeline dalam kondisi baik. Tidak ada keputusan mendesak.</span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get } = useApi()
const fmt = useFormat()

const { data, pending, refresh } = await useAsyncData(
  'command-center',
  () => get('/v1/command-center'),
  { server: false }
)

const totalInvoiceAlert = computed(() => {
  const s = data.value?.invoice_alerts?.summary
  if (!s) return 0
  return s.no_invoice_count + s.overdue_count + s.due_soon_count
})

const totalPipelineAlert = computed(() => {
  const s = data.value?.pipeline_decisions?.summary
  if (!s) return 0
  return s.stale_count + s.hot_no_prop_count + s.missed_close_count
})
</script>
