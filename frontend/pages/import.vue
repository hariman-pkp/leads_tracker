<template>
  <div>
    <div class="page-header mb-6">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-file-arrow-up text-primary-400 mr-2" />Upload Data</h1>
        <p class="page-subtitle">Import data Pipeline dan Revenue dari file CSV</p>
      </div>
    </div>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-navy-900 rounded-xl p-1 w-fit border border-navy-700">
      <button v-for="tab in tabs" :key="tab.key"
              @click="activeTab = tab.key"
              :class="activeTab === tab.key
                ? 'bg-primary-600 text-white shadow-lg'
                : 'text-gray-400 hover:text-gray-200'"
              class="px-5 py-2 rounded-lg text-sm font-medium transition-all">
        <i :class="`fa-solid ${tab.icon} mr-1.5`" />{{ tab.label }}
      </button>
    </div>

    <!-- Info alur invoice -->
    <Transition name="toast">
      <div v-if="activeTab === 'invoice'"
           class="flex items-start gap-3 bg-emerald-900/20 border border-emerald-700/40 rounded-xl px-4 py-3 mb-5 text-sm text-emerald-300">
        <i class="fa-solid fa-circle-info text-emerald-400 mt-0.5 flex-shrink-0" />
        <div>
          <strong>Upload Invoice & Payment</strong> akan otomatis memperbarui nilai
          <span class="font-mono text-emerald-200">actual</span> pada Revenue Tracker.
          <span class="text-emerald-400/70 text-xs block mt-0.5">
            Alur: CSV → upsert tabel invoices → recalculate realisasi bulanan per project → update status & achievement project
          </span>
        </div>
      </div>
    </Transition>

    <!-- ── PIPELINE TAB ─────────────────────────────────────────────── -->
    <div v-show="activeTab === 'pipeline'" class="space-y-5">
      <ImportPanel
        label="Pipeline / Leads"
        icon="fa-funnel-dollar"
        color="primary"
        template-url="/v1/import/template/pipeline"
        upload-url="/v1/import/pipeline"
        :preview-cols="pipelineCols"
        description="Data leads pipeline: nama company, stage, prioritas, propose value, dst."
        :danger-desc="`Hapus SEMUA leads, follow-up log, dan kontak sebelum import. Data tidak bisa dikembalikan.`"
        target-url="/pipeline"
        target-label="Pipeline"
        target-icon="fa-funnel-dollar"
        @done="handleDone"
      >
        <template #info>
          <div class="mt-4 p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl text-xs text-blue-300">
            <i class="fa-solid fa-circle-info mr-1.5 text-blue-400" />
            <strong>Kolom <code class="bg-blue-900/40 px-1 rounded">probability</code> bisa dikosongkan</strong>
            — sistem akan mengisi otomatis berdasarkan Stage:
            <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-blue-400/80 font-mono">
              <span>New → <strong class="text-white">10%</strong></span>
              <span>In Progress → <strong class="text-white">25%</strong></span>
              <span>Demo Scheduled → <strong class="text-white">40%</strong></span>
              <span>Proposal Sent → <strong class="text-white">60%</strong></span>
              <span>Negotiation → <strong class="text-white">80%</strong></span>
              <span>Won → <strong class="text-white">100%</strong></span>
              <span>On Hold → <strong class="text-white">20%</strong></span>
              <span>Lost → <strong class="text-white">0%</strong></span>
            </div>
          </div>
        </template>
      </ImportPanel>
    </div>

    <!-- ── INVOICE TAB ─────────────────────────────────────────────── -->
    <div v-show="activeTab === 'invoice'" class="space-y-5">
      <div class="flex items-center gap-2 text-sm text-gray-400">
        <i class="fa-solid fa-calendar-days text-primary-400" />
        <span>Tahun:</span>
        <select v-model.number="selectedYear" class="form-select w-24">
          <option v-for="y in [2024,2025,2026,2027]" :key="y" :value="y">{{ y }}</option>
        </select>
        <span class="text-gray-500">— template CSV akan berisi data proyek tahun tersebut</span>
      </div>
      <ImportPanel
        label="Invoice & Payment"
        icon="fa-file-invoice-dollar"
        color="emerald"
        :template-url="invoiceTemplateUrl"
        upload-url="/v1/import/invoice"
        :preview-cols="invoiceCols"
        description="Upload data invoice dan pembayaran. Realisasi revenue bulanan akan otomatis diperbarui."
        :danger-desc="`Hapus SEMUA data invoice sebelum import. Revenue aktual tetap aman — akan di-recalculate ulang dari data baru.`"
        target-url="/revenue/tracker"
        target-label="Revenue Tracker"
        target-icon="fa-chart-line"
        @done="handleDone"
      >
        <template #info>
          <div class="mt-4 space-y-2">
            <!-- Kolom wajib -->
            <div class="p-3 bg-navy-800/60 border border-navy-700 rounded-xl text-xs text-gray-400">
              <div class="font-medium text-gray-300 mb-1.5">
                <i class="fa-solid fa-table-columns mr-1 text-primary-400" />Kolom CSV
              </div>
              <div class="grid grid-cols-2 gap-x-6 gap-y-1">
                <div><span class="text-red-400">*</span> <code class="text-primary-300">invoice_no</code> — nomor invoice (unik, wajib)</div>
                <div><span class="text-red-400">*</span> <code class="text-primary-300">project_id</code> — harus cocok dengan revenue project</div>
                <div><span class="text-red-400">*</span> <code class="text-primary-300">invoice_date</code> — format YYYY-MM-DD</div>
                <div><span class="text-red-400">*</span> <code class="text-primary-300">invoice_amount</code> — nilai invoice (Rp)</div>
                <div><span class="text-gray-500">○</span> <code class="text-gray-400">paid_amount</code> — nilai terbayar (default 0)</div>
                <div><span class="text-gray-500">○</span> <code class="text-gray-400">paid_date</code> — tanggal bayar (opsional)</div>
                <div><span class="text-gray-500">○</span> <code class="text-gray-400">status</code> — otomatis: Lunas / Partial / Unpaid</div>
                <div><span class="text-gray-500">○</span> <code class="text-gray-400">notes</code> — catatan (opsional)</div>
              </div>
            </div>
            <!-- Alur update -->
            <div class="p-3 bg-emerald-900/20 border border-emerald-700/40 rounded-xl text-xs text-emerald-300">
              <i class="fa-solid fa-arrow-right-arrow-left mr-1.5 text-emerald-400" />
              <strong>Yang otomatis diperbarui setelah upload:</strong>
              <ol class="mt-1.5 ml-4 list-decimal space-y-0.5 text-emerald-400/80">
                <li>Realisasi bulanan (<code>revenue_monthly.actual</code>) = SUM paid_amount per project per bulan</li>
                <li>Total realisasi project (<code>revenue_projects.actual_revenue</code>) = SUM semua bulan</li>
                <li>Status & Risk Level project (On Track / At Risk / Critical)</li>
                <li>Achievement % project</li>
              </ol>
            </div>
          </div>
        </template>
      </ImportPanel>
    </div>

    <!-- ── REVENUE TAB ──────────────────────────────────────────────── -->
    <div v-show="activeTab === 'revenue'" class="space-y-5">
      <ImportPanel
        label="Revenue Projects"
        icon="fa-chart-line"
        color="emerald"
        template-url="/v1/import/template/revenue"
        upload-url="/v1/import/revenue"
        :preview-cols="revenueCols"
        description="Data revenue project beserta target & aktual per bulan (Jan–Des)."
        :danger-desc="`Hapus SEMUA data revenue_projects dan revenue_monthly sebelum import.`"
        target-url="/revenue/tracker"
        target-label="Revenue Tracker"
        target-icon="fa-chart-line"
        @done="handleDone"
      />
    </div>

    <!-- Global result toast -->
    <Transition name="toast">
      <div v-if="toast.show"
           :class="toast.type === 'success' ? 'bg-emerald-900 border-emerald-600' : 'bg-red-900 border-red-700'"
           class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm text-white max-w-sm">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-emerald-400' : 'fa-solid fa-circle-exclamation text-red-400'" />
        {{ toast.msg }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const activeTab = ref<'pipeline'|'invoice'|'revenue'>('pipeline')
const selectedYear = ref(new Date().getFullYear())
const invoiceTemplateUrl = computed(() => `/v1/import/template/invoice?tahun=${selectedYear.value}`)

const tabs = [
  { key: 'pipeline', label: 'Pipeline',         icon: 'fa-funnel-dollar'        },
  { key: 'invoice',  label: 'Invoice & Payment', icon: 'fa-file-invoice-dollar' },
  { key: 'revenue',  label: 'Revenue Projects',  icon: 'fa-chart-line'          },
]

const pipelineCols = [
  { key: 'lead_id',        label: 'Lead ID'       },
  { key: 'nama_company',   label: 'Company'       },
  { key: 'stage',          label: 'Stage'         },
  { key: 'prioritas',      label: 'Prioritas'     },
  { key: 'propose_value',  label: 'Propose Value' },
  { key: 'sales_owner',    label: 'Sales'         },
  { key: 'organisasi',     label: 'Organisasi'    },
  { key: 'exp_close_date', label: 'Exp. Close'    },
]

const invoiceCols = [
  { key: 'invoice_no',     label: 'No. Invoice'   },
  { key: 'project_id',     label: 'Project ID'    },
  { key: 'invoice_date',   label: 'Tgl Invoice'   },
  { key: 'invoice_amount', label: 'Nilai Invoice'  },
  { key: 'paid_amount',    label: 'Terbayar'       },
  { key: 'paid_date',      label: 'Tgl Bayar'      },
  { key: 'status',         label: 'Status'         },
  { key: 'notes',          label: 'Catatan'        },
]

const revenueCols = [
  { key: 'project_id',  label: 'Project ID'   },
  { key: 'client',      label: 'Client'       },
  { key: 'product',     label: 'Product'      },
  { key: 'organisasi',  label: 'Organisasi'   },
  { key: 'type',        label: 'Type'         },
  { key: 'tahun',       label: 'Tahun'        },
  { key: 'target_1',    label: 'Target Jan'   },
  { key: 'actual_1',    label: 'Aktual Jan'   },
]

const toast = reactive({ show: false, msg: '', type: 'success' as 'success' | 'error' })

function handleDone(msg: string, type: 'success' | 'error') {
  toast.msg  = msg
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 4000)
}
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateY(8px); }
</style>
