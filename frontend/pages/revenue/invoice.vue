<template>
  <div>
    <!-- ── HEADER ─────────────────────────────────────────────────── -->
    <div class="page-header mb-4">
      <div class="flex items-center gap-3">
        <!-- Tombol back ke tracker jika filter by project -->
        <NuxtLink v-if="projectFilter" to="/revenue/tracker"
                  class="btn-ghost btn-sm flex items-center gap-1.5 text-gray-400 hover:text-white">
          <i class="fa-solid fa-arrow-left text-xs" />
          <span class="text-xs">Tracker</span>
        </NuxtLink>
        <div>
          <h1 class="page-title">
            <i class="fa-solid fa-file-invoice text-primary-400 mr-2" />Invoice & Payment
          </h1>
          <p class="page-subtitle">
            <span v-if="projectFilter" class="text-primary-400 font-medium">
              {{ data?.project_info?.project_id }} · {{ data?.project_info?.client }}
            </span>
            <span v-else>{{ data?.total || 0 }} invoice</span>
          </p>
        </div>
      </div>
      <button @click="showForm = true" class="btn-primary btn-sm">
        <i class="fa-solid fa-plus" />Tambah Invoice
      </button>
    </div>

    <!-- ── PROJECT INFO BANNER (saat filter by project) ─────────── -->
    <div v-if="projectFilter && data?.project_info" class="card mb-4 border border-primary-800/50">
      <div class="flex flex-wrap items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-900/50 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-folder-open text-primary-400" />
          </div>
          <div>
            <div class="text-sm font-semibold text-white">{{ data.project_info.project_id }}</div>
            <div class="text-xs text-gray-400">{{ data.project_info.product }} · {{ data.project_info.organisasi }}</div>
          </div>
        </div>
        <div class="flex gap-6 flex-wrap">
          <div>
            <div class="text-xs text-gray-500">Target Revenue</div>
            <div class="text-sm font-semibold text-gray-200">{{ fmt.rupiah(data.project_info.revenue_target) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Realisasi</div>
            <div class="text-sm font-semibold text-emerald-400">{{ fmt.rupiah(data.project_info.actual_revenue) }}</div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Achievement</div>
            <div class="text-sm font-semibold"
                 :class="data.project_info.achievement_pct*100>=80?'text-emerald-400':data.project_info.achievement_pct*100>=50?'text-yellow-400':'text-red-400'">
              {{ (data.project_info.achievement_pct * 100).toFixed(1) }}%
            </div>
          </div>
          <div>
            <div class="text-xs text-gray-500">Status</div>
            <span :class="fmt.statusClass(data.project_info.status)">{{ data.project_info.status }}</span>
          </div>
        </div>
        <div class="ml-auto">
          <NuxtLink to="/revenue/tracker" class="btn-secondary btn-sm text-xs">
            <i class="fa-solid fa-list-check" />Semua Proyek
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- ── INVOICE SUMMARY STRIP ─────────────────────────────────── -->
    <div v-if="data?.inv_summary" class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
      <div class="stat-card">
        <div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-file-invoice-dollar" /></div>
        <div>
          <div class="stat-value text-xs text-purple-300">{{ fmt.rupiah(data.inv_summary.total_amount) }}</div>
          <div class="stat-label">Total Invoiced</div>
          <div class="text-xs text-gray-600 mt-0.5">{{ data.inv_summary.total_inv }} invoice</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-circle-check" /></div>
        <div>
          <div class="stat-value text-xs text-emerald-400">{{ fmt.rupiah(data.inv_summary.total_paid) }}</div>
          <div class="stat-label">Terbayar</div>
          <div class="text-xs text-gray-600 mt-0.5">{{ data.inv_summary.lunas_count }} lunas</div>
        </div>
      </div>
      <div class="stat-card" :class="data.inv_summary.outstanding > 0 ? 'border border-orange-800/40' : ''">
        <div class="stat-icon" :class="data.inv_summary.outstanding > 0 ? 'bg-orange-900/40 text-orange-400' : 'bg-gray-800 text-gray-500'">
          <i class="fa-solid fa-hourglass-half" />
        </div>
        <div>
          <div class="stat-value text-xs" :class="data.inv_summary.outstanding > 0 ? 'text-orange-400' : 'text-gray-500'">
            {{ fmt.rupiah(data.inv_summary.outstanding) }}
          </div>
          <div class="stat-label">Outstanding</div>
          <div class="text-xs mt-0.5" :class="data.inv_summary.outstanding > 0 ? 'text-orange-500/70' : 'text-gray-600'">
            {{ data.inv_summary.belum_count }} belum lunas
          </div>
        </div>
      </div>
      <!-- Collection Rate gauge (compact) -->
      <div class="stat-card xl:col-span-3">
        <div class="flex items-center gap-3 w-full">
          <div class="relative w-14 h-14 flex-shrink-0">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="20" fill="none" stroke="#1e293b" stroke-width="7"/>
              <circle cx="28" cy="28" r="20" fill="none"
                      :stroke="data.inv_summary.collection_rate>=90?'#34d399':data.inv_summary.collection_rate>=70?'#facc15':'#f87171'"
                      stroke-width="7" stroke-linecap="round"
                      :stroke-dasharray="`${data.inv_summary.collection_rate * 1.257} 125.7`"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xs font-bold text-white">{{ data.inv_summary.collection_rate }}%</span>
            </div>
          </div>
          <div class="flex-1">
            <div class="text-xs font-semibold text-gray-200 mb-1">Collection Rate</div>
            <div class="w-full bg-navy-800 h-2 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                   :class="data.inv_summary.collection_rate>=90?'bg-emerald-500':data.inv_summary.collection_rate>=70?'bg-yellow-500':'bg-red-500'"
                   :style="`width:${data.inv_summary.collection_rate}%`" />
            </div>
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>Bayar: {{ fmt.rupiah(data.inv_summary.total_paid) }}</span>
              <span>Sisa: {{ fmt.rupiah(data.inv_summary.outstanding) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ── FILTERS ───────────────────────────────────────────────── -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3 items-center">
        <!-- Badge project filter aktif -->
        <div v-if="projectFilter"
             class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-900/30 border border-primary-700/50 text-xs text-primary-300">
          <i class="fa-solid fa-filter text-xs" />
          <span>{{ projectFilter }}</span>
          <button @click="clearProjectFilter" class="hover:text-white transition-colors ml-0.5">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>

        <input v-model="f.search" class="form-input w-44" placeholder="🔍 Client / No. Invoice" @input="debouncedFetch" />
        <select v-model="f.status" class="form-select w-36" @change="fetchData">
          <option value="">Semua Status</option>
          <option>Lunas</option><option>Belum</option>
        </select>
        <div class="flex items-center gap-2">
          <input v-model="f.date_from" type="date" class="form-input w-36 text-xs" @change="fetchData" />
          <span class="text-gray-500 text-xs">s/d</span>
          <input v-model="f.date_to" type="date" class="form-input w-36 text-xs" @change="fetchData" />
        </div>
        <button v-if="f.search || f.status || f.date_from || f.date_to" @click="resetFilters" class="btn-ghost btn-sm text-gray-500">
          <i class="fa-solid fa-xmark" />Reset
        </button>
      </div>
    </div>

    <!-- ── TABLE ─────────────────────────────────────────────────── -->
    <div v-if="pending" class="flex justify-center py-16">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <div v-else class="card overflow-x-auto">
      <table class="tbl">
        <thead>
          <tr>
            <th>No. Invoice</th>
            <th v-if="!projectFilter">Proyek</th>
            <th>Client</th>
            <th v-if="!projectFilter">Produk</th>
            <th>Periode</th>
            <th class="text-right">Nominal</th>
            <th class="text-right">Terbayar</th>
            <th class="text-right">Outstanding</th>
            <th>Tgl Invoice</th>
            <th>Tgl Bayar</th>
            <th>Status</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="inv in data?.invoices" :key="inv.id">
            <td class="text-xs font-medium text-gray-200">{{ inv.invoice_no || '—' }}</td>
            <td v-if="!projectFilter" class="text-xs">
              <NuxtLink :to="`/revenue/invoice?project=${inv.project_id}`"
                        class="text-primary-400 hover:text-primary-300 font-medium">
                {{ inv.project_id }}
              </NuxtLink>
            </td>
            <td class="text-xs text-gray-300">{{ inv.client }}</td>
            <td v-if="!projectFilter" class="text-xs text-gray-400 max-w-32 truncate">{{ inv.product }}</td>
            <td class="text-xs text-gray-400">{{ inv.period }}</td>
            <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(inv.invoice_amount) }}</td>
            <td class="text-right text-xs text-emerald-400">{{ fmt.rupiah(inv.paid_amount) }}</td>
            <td class="text-right text-xs"
                :class="(inv.invoice_amount - inv.paid_amount) > 0 ? 'text-orange-400 font-medium' : 'text-gray-600'">
              {{ (inv.invoice_amount - inv.paid_amount) > 0 ? fmt.rupiah(inv.invoice_amount - inv.paid_amount) : '—' }}
            </td>
            <td class="text-xs text-gray-400">{{ fmt.tgl(inv.invoice_date) }}</td>
            <td class="text-xs text-gray-400">{{ inv.paid_date ? fmt.tgl(inv.paid_date) : '—' }}</td>
            <td>
              <span :class="inv.display_status==='Lunas'?'badge-green':inv.display_status==='Partial'?'badge-yellow':'badge-red'">
                {{ inv.display_status }}
              </span>
            </td>
            <td class="text-center">
              <div class="flex items-center justify-center gap-1.5">
                <button v-if="inv.display_status !== 'Lunas'" @click="openPay(inv)" class="btn-primary btn-xs">
                  <i class="fa-solid fa-money-bill" />Bayar
                </button>
                <button @click="openEdit(inv)" class="btn-secondary btn-xs" title="Edit">
                  <i class="fa-solid fa-pen" />
                </button>
                <button v-if="isAdmin" @click="openDelete(inv)"
                        class="btn-xs bg-red-900/40 hover:bg-red-800/60 text-red-400 border border-red-800/50 rounded px-2 py-1"
                        title="Hapus">
                  <i class="fa-solid fa-trash" />
                </button>
              </div>
            </td>
          </tr>
          <tr v-if="!data?.invoices?.length">
            <td :colspan="projectFilter ? 10 : 12" class="py-8 text-center">
              <div class="text-gray-500 text-sm">
                <i class="fa-solid fa-file-invoice text-2xl block mb-2 text-gray-700" />
                <div v-if="projectFilter">Belum ada invoice untuk proyek {{ projectFilter }}</div>
                <div v-else>Tidak ada invoice ditemukan</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <AppPagination
        v-model:page="page"
        v-model:per-page="perPage"
        :total="data?.total ?? 0"
        :total-pages="data?.total_pages ?? 1"
        :per-page-options="[10, 25, 50, 100]"
      />
    </div>

    <!-- ── PAY MODAL ─────────────────────────────────────────────── -->
    <div v-if="payModal.show" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-sm shadow-2xl p-5">
        <h3 class="font-semibold text-white mb-1">Konfirmasi Pembayaran</h3>
        <div class="mb-4 p-3 rounded-lg bg-navy-800 space-y-1">
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Invoice</span>
            <span class="text-white">{{ payModal.inv?.invoice_no || '—' }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Client</span>
            <span class="text-gray-200">{{ payModal.inv?.client }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Nominal Invoice</span>
            <span class="text-gray-200">{{ fmt.rupiah(payModal.inv?.invoice_amount) }}</span>
          </div>
          <div class="flex justify-between text-xs">
            <span class="text-gray-500">Sudah Dibayar</span>
            <span class="text-emerald-400">{{ fmt.rupiah(payModal.inv?.paid_amount) }}</span>
          </div>
          <div class="h-px bg-navy-700 my-1" />
          <div class="flex justify-between text-xs font-semibold">
            <span class="text-gray-400">Sisa Tagihan</span>
            <span class="text-orange-400">{{ fmt.rupiah((payModal.inv?.invoice_amount||0) - (payModal.inv?.paid_amount||0)) }}</span>
          </div>
        </div>
        <div class="space-y-3">
          <div>
            <label class="form-label">Jumlah Bayar (Rp)</label>
            <NumericInput v-model="payModal.paid_amount" class="form-input" />
          </div>
          <div>
            <label class="form-label">Tanggal Bayar</label>
            <input v-model="payModal.paid_date" type="date" class="form-input" />
          </div>
        </div>
        <div v-if="payError"
             class="mt-3 flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300">
          <i class="fa-solid fa-circle-exclamation text-red-400 shrink-0"></i>
          {{ payError }}
        </div>
        <div class="flex gap-2 justify-end mt-4">
          <button @click="payModal.show = false" class="btn-secondary">Batal</button>
          <button @click="submitPay" class="btn-primary" :disabled="savingPay">
            <i v-if="savingPay" class="fa-solid fa-circle-notch fa-spin" />Konfirmasi Bayar
          </button>
        </div>
      </div>
    </div>

    <!-- ── EDIT INVOICE MODAL ────────────────────────────────────── -->
    <div v-if="showEditForm" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-lg shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-navy-800">
          <h3 class="font-semibold text-white"><i class="fa-solid fa-pen mr-2 text-primary-400" />Edit Invoice</h3>
          <button @click="showEditForm = false" class="btn-ghost btn-xs"><i class="fa-solid fa-xmark" /></button>
        </div>
        <form @submit.prevent="submitEdit" class="p-5 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Proyek</label>
              <select v-model="editInv.project_id" class="form-select text-xs">
                <option value="">— Tanpa Proyek —</option>
                <option v-for="p in data?.rev_projects || []" :key="p.project_id" :value="p.project_id">
                  {{ p.project_id }} — {{ p.client }}
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">No. Invoice</label>
              <input v-model="editInv.invoice_no" class="form-input" placeholder="INV-2026-001" />
            </div>
            <div>
              <label class="form-label">Tgl Invoice</label>
              <input v-model="editInv.invoice_date" type="date" class="form-input" required />
            </div>
            <div>
              <label class="form-label">Periode</label>
              <select v-model="editInv.period" class="form-select">
                <option v-for="m in months" :key="m">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Nominal (Rp)</label>
              <NumericInput v-model="editInv.invoice_amount" class="form-input" />
            </div>
            <div>
              <label class="form-label">Tahun</label>
              <input v-model.number="editInv.tahun" type="number" class="form-input" />
            </div>
          </div>
          <div v-if="editError"
               class="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300">
            <i class="fa-solid fa-circle-exclamation text-red-400 shrink-0"></i>
            {{ editError }}
          </div>
          <div class="flex gap-2 justify-end pt-2">
            <button type="button" @click="showEditForm = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="savingEdit">
              <i v-if="savingEdit" class="fa-solid fa-circle-notch fa-spin" />Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── DELETE CONFIRM MODAL (Admin only) ──────────────────────── -->
    <div v-if="deleteModal.show" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-red-800/50 rounded-xl w-full max-w-sm shadow-2xl p-5">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-triangle-exclamation text-red-400 text-lg" />
          </div>
          <div>
            <h3 class="font-semibold text-white">Hapus Invoice</h3>
            <p class="text-xs text-gray-400">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        </div>
        <div class="bg-navy-800 rounded-lg p-3 mb-4 space-y-1.5 text-xs">
          <div class="flex justify-between">
            <span class="text-gray-500">No. Invoice</span>
            <span class="text-white font-medium">{{ deleteModal.inv?.invoice_no || '—' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Client</span>
            <span class="text-gray-200">{{ deleteModal.inv?.client }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Nominal</span>
            <span class="text-gray-200">{{ fmt.rupiah(deleteModal.inv?.invoice_amount) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Status</span>
            <span :class="deleteModal.inv?.display_status==='Lunas'?'text-emerald-400':deleteModal.inv?.display_status==='Partial'?'text-yellow-400':'text-red-400'">
              {{ deleteModal.inv?.display_status }}
            </span>
          </div>
        </div>
        <div v-if="deleteError"
             class="mb-3 flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300">
          <i class="fa-solid fa-circle-exclamation text-red-400 shrink-0"></i>
          {{ deleteError }}
        </div>
        <div class="flex gap-2 justify-end">
          <button @click="deleteModal.show = false" class="btn-secondary">Batal</button>
          <button @click="confirmDelete" class="btn-xs bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"
                  :disabled="deletingInv">
            <i v-if="deletingInv" class="fa-solid fa-circle-notch fa-spin mr-1" />
            <i v-else class="fa-solid fa-trash mr-1" />Hapus Invoice
          </button>
        </div>
      </div>
    </div>

    <!-- ── NEW INVOICE MODAL ─────────────────────────────────────── -->
    <div v-if="showForm" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-lg shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-navy-800">
          <h3 class="font-semibold text-white">Tambah Invoice</h3>
          <button @click="showForm = false" class="btn-ghost btn-xs"><i class="fa-solid fa-xmark" /></button>
        </div>
        <form @submit.prevent="submitInvoice" class="p-5 space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Proyek</label>
              <select v-model="newInv.project_id" class="form-select text-xs">
                <option value="">— Tanpa Proyek —</option>
                <option v-for="p in data?.rev_projects || []" :key="p.project_id" :value="p.project_id">
                  {{ p.project_id }} — {{ p.client }}
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">No. Invoice</label>
              <input v-model="newInv.invoice_no" class="form-input" placeholder="INV-2026-001" />
            </div>
            <div>
              <label class="form-label">Tgl Invoice</label>
              <input v-model="newInv.invoice_date" type="date" class="form-input" required />
            </div>
            <div>
              <label class="form-label">Periode</label>
              <select v-model="newInv.period" class="form-select">
                <option v-for="m in months" :key="m">{{ m }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Nominal (Rp)</label>
              <NumericInput v-model="newInv.invoice_amount" class="form-input" />
            </div>
            <div>
              <label class="form-label">Tahun</label>
              <input v-model.number="newInv.tahun" type="number" class="form-input" />
            </div>
          </div>
          <!-- Error message -->
          <div v-if="invError"
               class="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300">
            <i class="fa-solid fa-circle-exclamation text-red-400 shrink-0"></i>
            {{ invError }}
          </div>
          <div class="flex gap-2 justify-end pt-2">
            <button type="button" @click="showForm = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="savingInv">
              <i v-if="savingInv" class="fa-solid fa-circle-notch fa-spin" />Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, post, put, del } = useApi()
const fmt  = useFormat()
const auth = useAuthStore()
const isAdmin = computed(() => auth.user?.role_id === 1)
const route  = useRoute()
const router = useRouter()

const months = ['January','February','March','April','May','June',
                'July','August','September','October','November','December']

// Baca project filter dari query param URL (?project=xxx)
const projectFilter = ref((route.query.project as string) || '')

const f = reactive({
  search    : '',
  status    : (route.query.status as string) || '',
  date_from : '',
  date_to   : '',
})


const page    = ref(1)
const perPage = ref(10)

const { data, pending, refresh } = await useAsyncData(
  'invoices',
  () => get('/v1/revenue/invoices', {
    status    : f.status,
    search    : f.search,
    date_from : f.date_from || undefined,
    date_to   : f.date_to   || undefined,
    project_id: projectFilter.value,
    page      : page.value,
    per_page  : perPage.value,
  }),
  { server: false, watch: [page, perPage] }
)

// Saat project filter berubah (misal dari Link di tabel), update URL dan refresh
watch(() => route.query.project, (val) => {
  projectFilter.value = (val as string) || ''
  refresh()
})

let deb: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(deb); deb = setTimeout(fetchData, 400) }
async function fetchData() { page.value = 1; await refresh() }

function clearProjectFilter() {
  projectFilter.value = ''
  router.push('/revenue/invoice')
  refresh()
}

function resetFilters() {
  f.search    = ''
  f.status    = ''
  f.date_from = ''
  f.date_to   = ''
  fetchData()
}

// Form invoice baru — pre-fill project_id jika sedang filter by project
const showForm    = ref(false)
const savingInv   = ref(false)
const invError    = ref('')
const newInv      = reactive({
  project_id    : projectFilter.value,
  invoice_no    : '',
  invoice_date  : new Date().toISOString().slice(0, 10),
  period        : months[new Date().getMonth()],
  invoice_amount: 0,
  tahun         : new Date().getFullYear(),
  paid_amount   : 0,
})

// Update project_id default ketika projectFilter berubah
watch(projectFilter, (val) => { newInv.project_id = val })

watch(showForm, (val) => {
  if (val) invError.value = ''
})

async function submitInvoice() {
  invError.value = ''
  if (!newInv.invoice_date) { invError.value = 'Tanggal invoice wajib diisi.'; return }
  if (!newInv.invoice_amount || newInv.invoice_amount <= 0) { invError.value = 'Nominal invoice harus lebih dari 0.'; return }

  savingInv.value = true
  try {
    await post('/v1/revenue/invoices', { ...newInv })
    showForm.value = false
    Object.assign(newInv, {
      invoice_no: '', invoice_date: new Date().toISOString().slice(0, 10),
      period: months[new Date().getMonth()], invoice_amount: 0,
      tahun: new Date().getFullYear(), paid_amount: 0,
    })
    await refresh()
  } catch (e: any) {
    invError.value = e?.data?.message || e?.message || 'Gagal menyimpan invoice.'
  } finally {
    savingInv.value = false
  }
}

// ── Edit invoice ────────────────────────────────────────────────────────
const showEditForm = ref(false)
const savingEdit   = ref(false)
const editError    = ref('')
const editInv      = reactive({
  id            : 0,
  project_id    : '',
  invoice_no    : '',
  invoice_date  : '',
  period        : '',
  invoice_amount: 0,
  tahun         : new Date().getFullYear(),
})

function openEdit(inv: any) {
  Object.assign(editInv, {
    id            : inv.id,
    project_id    : inv.project_id || '',
    invoice_no    : inv.invoice_no || '',
    invoice_date  : inv.invoice_date ? inv.invoice_date.slice(0, 10) : '',
    period        : inv.period || months[new Date().getMonth()],
    invoice_amount: inv.invoice_amount || 0,
    tahun         : inv.tahun || new Date().getFullYear(),
  })
  editError.value   = ''
  showEditForm.value = true
}

async function submitEdit() {
  editError.value = ''
  if (!editInv.invoice_date) { editError.value = 'Tanggal invoice wajib diisi.'; return }
  if (!editInv.invoice_amount || editInv.invoice_amount <= 0) { editError.value = 'Nominal harus lebih dari 0.'; return }
  savingEdit.value = true
  try {
    await put(`/v1/revenue/invoices/${editInv.id}`, { ...editInv })
    showEditForm.value = false
    await refresh()
  } catch (e: any) {
    editError.value = e?.data?.message || e?.message || 'Gagal memperbarui invoice.'
  } finally {
    savingEdit.value = false
  }
}

// ── Delete invoice (Admin only) ─────────────────────────────────────────
const deleteModal = reactive({ show: false, inv: null as any })
const deletingInv = ref(false)
const deleteError = ref('')

function openDelete(inv: any) {
  deleteModal.inv  = inv
  deleteError.value = ''
  deleteModal.show = true
}

async function confirmDelete() {
  deletingInv.value = true
  deleteError.value = ''
  try {
    await del(`/v1/revenue/invoices/${deleteModal.inv.id}`)
    deleteModal.show = false
    await refresh()
  } catch (e: any) {
    deleteError.value = e?.data?.message || e?.message || 'Gagal menghapus invoice.'
  } finally {
    deletingInv.value = false
  }
}

// Pay modal
const savingPay = ref(false)
const payError  = ref('')
const payModal  = reactive({
  show        : false,
  inv         : null as any,
  paid_amount : 0,
  paid_date   : new Date().toISOString().slice(0, 10),
})

function openPay(inv: any) {
  payModal.inv         = inv
  payModal.paid_amount = inv.invoice_amount - (inv.paid_amount || 0)
  payModal.paid_date   = new Date().toISOString().slice(0, 10)
  payError.value       = ''
  payModal.show        = true
}

async function submitPay() {
  payError.value  = ''
  savingPay.value = true
  try {
    await post(`/v1/revenue/invoices/${payModal.inv.id}/pay`, {
      paid_amount: payModal.paid_amount,
      paid_date  : payModal.paid_date,
    })
    payModal.show = false
    await refresh()
  } catch (e: any) {
    payError.value = e?.data?.message || e?.message || 'Gagal mencatat pembayaran.'
  } finally {
    savingPay.value = false
  }
}

// alias agar template lama tetap jalan
const saving = computed(() => savingInv.value || savingPay.value)
</script>
