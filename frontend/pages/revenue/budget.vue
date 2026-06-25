<template>
  <div class="min-h-screen bg-apex-bg text-apex-text p-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-apex-text">Budget Monitoring</h1>
        <p class="text-sm text-apex-muted mt-0.5">Pantau realisasi anggaran vs RKAP per perspektif BSC</p>
      </div>
      <div class="flex items-center gap-3">
        <select v-model="selectedYear" @change="loadData" class="form-select text-sm w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="filterBsc" class="form-select text-sm w-44">
          <option value="">Semua Perspektif</option>
          <option v-for="p in perspectives" :key="p" :value="p">{{ p }}</option>
        </select>
        <button @click="openAdd"
                class="btn-primary flex items-center gap-2 text-sm">
          <i class="fa-solid fa-plus" /> Tambah Item
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20 text-apex-muted">
      <i class="fa-solid fa-spinner fa-spin mr-2" /> Memuat data...
    </div>

    <template v-else>
      <!-- Summary cards per perspektif BSC -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div v-for="s in summaryData" :key="s.perspektif_bsc"
             class="card cursor-pointer transition-all hover:border-primary-600/50"
             :class="filterBsc === s.perspektif_bsc ? 'border-primary-500' : ''"
             @click="filterBsc = filterBsc === s.perspektif_bsc ? '' : s.perspektif_bsc">
          <div class="text-xs text-apex-muted font-medium mb-1 truncate">{{ s.perspektif_bsc }}</div>
          <div class="text-lg font-bold text-apex-text">{{ fmt.rupiahFull(s.actual) }}</div>
          <div class="text-xs text-apex-faint mt-0.5">dari {{ fmt.rupiahFull(s.budget) }}</div>
          <!-- Progress bar -->
          <div class="mt-2 h-1.5 bg-apex-card rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all"
                 :class="achBarColor(s.ach_pct)"
                 :style="`width: ${Math.min(s.ach_pct, 100)}%`" />
          </div>
          <div class="text-xs font-semibold mt-1" :class="fmt.achColor(s.ach_pct)">
            {{ s.ach_pct.toFixed(1) }}%
          </div>
        </div>
      </div>

      <!-- Total summary bar -->
      <div class="card mb-6 flex flex-wrap items-center gap-6">
        <div>
          <div class="text-xs text-apex-muted">Total Budget</div>
          <div class="text-xl font-bold text-apex-text">{{ fmt.rupiahFull(totalBudget) }}</div>
        </div>
        <div class="h-8 w-px bg-apex-card" />
        <div>
          <div class="text-xs text-apex-muted">Total Aktual</div>
          <div class="text-xl font-bold text-emerald-400">{{ fmt.rupiahFull(totalActual) }}</div>
        </div>
        <div class="h-8 w-px bg-apex-card" />
        <div>
          <div class="text-xs text-apex-muted">Sisa Budget</div>
          <div class="text-xl font-bold" :class="totalBudget - totalActual >= 0 ? 'text-blue-400' : 'text-red-400'">
            {{ fmt.rupiahFull(totalBudget - totalActual) }}
          </div>
        </div>
        <div class="h-8 w-px bg-apex-card" />
        <div class="flex-1 min-w-[120px]">
          <div class="text-xs text-apex-muted mb-1">Realisasi Keseluruhan</div>
          <div class="flex items-center gap-2">
            <div class="flex-1 h-2 bg-apex-card rounded-full overflow-hidden">
              <div class="h-full rounded-full"
                   :class="achBarColor(totalAchPct)"
                   :style="`width: ${Math.min(totalAchPct, 100)}%`" />
            </div>
            <span class="text-sm font-bold" :class="fmt.achColor(totalAchPct)">
              {{ totalAchPct.toFixed(1) }}%
            </span>
          </div>
        </div>
      </div>

      <!-- Tabel detail -->
      <div class="card overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-apex-border">
              <th class="text-left py-3 px-3 text-apex-muted font-medium">Perspektif BSC</th>
              <th class="text-left py-3 px-3 text-apex-muted font-medium">Kategori</th>
              <th class="text-left py-3 px-3 text-apex-muted font-medium">Sub Kategori</th>
              <th class="text-right py-3 px-3 text-apex-muted font-medium">Budget</th>
              <th class="text-right py-3 px-3 text-apex-muted font-medium">Aktual</th>
              <th class="text-right py-3 px-3 text-apex-muted font-medium w-20">Ach%</th>
              <th class="text-center py-3 px-3 text-apex-muted font-medium w-24">Status</th>
              <th class="text-left py-3 px-3 text-apex-muted font-medium">Catatan</th>
              <th class="text-center py-3 px-3 text-apex-muted font-medium w-20">Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredItems.length === 0">
              <td colspan="9" class="text-center py-10 text-apex-faint">
                Belum ada data budget untuk tahun {{ selectedYear }}
              </td>
            </tr>
            <tr v-for="item in filteredItems" :key="item.id"
                class="border-b border-apex-border hover:bg-apex-card/30 transition-colors">
              <td class="py-2.5 px-3">
                <span :class="bscBadge(item.perspektif_bsc)">{{ item.perspektif_bsc }}</span>
              </td>
              <td class="py-2.5 px-3 text-apex-text font-medium">{{ item.category }}</td>
              <td class="py-2.5 px-3 text-apex-muted">{{ item.sub_category || '—' }}</td>
              <td class="py-2.5 px-3 text-right text-apex-muted">{{ fmt.rupiah(item.budget_amount) }}</td>
              <td class="py-2.5 px-3 text-right font-semibold"
                  :class="item.actual_amount > 0 ? 'text-emerald-400' : 'text-apex-faint'">
                {{ item.actual_amount > 0 ? fmt.rupiah(item.actual_amount) : '—' }}
              </td>
              <td class="py-2.5 px-3 text-right font-bold"
                  :class="fmt.achColor(item.ach_pct)">
                {{ item.ach_pct > 0 ? item.ach_pct.toFixed(1) + '%' : '—' }}
              </td>
              <td class="py-2.5 px-3 text-center">
                <span :class="statusBadge(item.status)">{{ item.status }}</span>
              </td>
              <td class="py-2.5 px-3 text-apex-muted text-xs max-w-[200px] truncate">
                {{ item.notes || '—' }}
              </td>
              <td class="py-2.5 px-3 text-center">
                <button @click="openEdit(item)"
                        class="text-primary-400 hover:text-primary-300 transition-colors mr-2"
                        title="Edit">
                  <i class="fa-solid fa-pen-to-square" />
                </button>
                <button @click="confirmDelete(item)"
                        class="text-red-400 hover:text-red-300 transition-colors"
                        title="Hapus">
                  <i class="fa-solid fa-trash" />
                </button>
              </td>
            </tr>
          </tbody>
          <!-- Footer total -->
          <tfoot v-if="filteredItems.length > 0">
            <tr class="border-t-2 border-apex-border2 bg-apex-card/30">
              <td colspan="3" class="py-2.5 px-3 text-xs font-bold text-apex-muted uppercase tracking-wide">
                Total ({{ filterBsc || 'Semua' }})
              </td>
              <td class="py-2.5 px-3 text-right font-bold text-apex-text">
                {{ fmt.rupiah(filteredBudget) }}
              </td>
              <td class="py-2.5 px-3 text-right font-bold text-emerald-400">
                {{ fmt.rupiah(filteredActual) }}
              </td>
              <td class="py-2.5 px-3 text-right font-bold"
                  :class="fmt.achColor(filteredAchPct)">
                {{ filteredAchPct.toFixed(1) }}%
              </td>
              <td colspan="3" />
            </tr>
          </tfoot>
        </table>
      </div>
    </template>

    <!-- ─── Modal Add/Edit ──────────────────────────────────────────────── -->
    <div v-if="formModal.open"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-lg shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-apex-border">
          <h2 class="text-lg font-semibold text-apex-text">
            {{ formModal.isNew ? 'Tambah Budget Item' : 'Edit Budget Item' }}
          </h2>
          <button @click="formModal.open = false" class="text-apex-muted hover:text-apex-text">
            <i class="fa-solid fa-xmark text-xl" />
          </button>
        </div>
        <div class="p-5 space-y-4">
          <!-- Perspektif BSC -->
          <div>
            <label class="form-label">Perspektif BSC <span class="text-red-400">*</span></label>
            <input v-model="formModal.form.perspektif_bsc" class="form-input"
                   list="bsc-list" placeholder="Financial / Customer / Internal..." />
            <datalist id="bsc-list">
              <option v-for="p in perspectives" :key="p" :value="p" />
              <option value="Financial" />
              <option value="Customer" />
              <option value="Internal Process" />
              <option value="Learning & Growth" />
            </datalist>
          </div>
          <!-- Kategori & Sub Kategori -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Kategori <span class="text-red-400">*</span></label>
              <input v-model="formModal.form.category" class="form-input"
                     list="cat-budget-list" placeholder="Nama kategori..." />
              <datalist id="cat-budget-list">
                <option v-for="c in allCategories" :key="c" :value="c" />
              </datalist>
            </div>
            <div>
              <label class="form-label">Sub Kategori</label>
              <input v-model="formModal.form.sub_category" class="form-input"
                     placeholder="Opsional..." />
            </div>
          </div>
          <!-- Budget & Aktual -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Budget (Rp)</label>
              <NumericInput v-model="formModal.form.budget_amount" class="form-input" />
            </div>
            <div>
              <label class="form-label">Aktual (Rp)</label>
              <NumericInput v-model="formModal.form.actual_amount" class="form-input" />
            </div>
          </div>
          <!-- Status & Catatan -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Status</label>
              <select v-model="formModal.form.status" class="form-select">
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="Over Budget">Over Budget</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label class="form-label">Bulan (0 = tahunan)</label>
              <select v-model.number="formModal.form.month_num" class="form-select">
                <option :value="0">Tahunan</option>
                <option v-for="m in 12" :key="m" :value="m">{{ monthName(m) }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="form-label">Catatan</label>
            <textarea v-model="formModal.form.notes" rows="2"
                      class="form-input resize-none" placeholder="Keterangan tambahan..." />
          </div>
        </div>
        <div v-if="saveError" class="mx-5 mb-1 text-xs text-red-400 flex items-center gap-1.5">
          <i class="fa-solid fa-circle-exclamation" />{{ saveError }}
        </div>
        <div class="flex justify-end gap-3 p-5 border-t border-apex-border">
          <button @click="formModal.open = false" class="btn-ghost">Batal</button>
          <button @click="saveBudget" :disabled="saving" class="btn-primary">
            <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-1" />
            {{ formModal.isNew ? 'Tambah' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Toast ──────────────────────────────────────────────────────── -->
    <Transition name="toast">
      <div v-if="toast.show"
           :class="toast.type === 'success' ? 'bg-green-800 border-green-600' : 'bg-red-900 border-red-600'"
           class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-green-400' : 'fa-solid fa-circle-exclamation text-red-400'" />
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- ─── Modal Konfirmasi Delete ─────────────────────────────────────── -->
    <div v-if="deleteModal.open"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-apex-surface border border-red-900/50 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center">
            <i class="fa-solid fa-trash text-red-400" />
          </div>
          <h2 class="text-lg font-semibold text-apex-text">Hapus Budget Item</h2>
        </div>
        <p class="text-sm text-apex-muted mb-1">
          Hapus item <strong class="text-apex-text">{{ deleteModal.item?.category }}</strong>?
        </p>
        <p v-if="deleteModal.item?.sub_category" class="text-xs text-apex-faint mb-4">
          {{ deleteModal.item.sub_category }}
        </p>
        <div class="flex justify-end gap-3">
          <button @click="deleteModal.open = false" class="btn-ghost">Batal</button>
          <button @click="doDelete" :disabled="saving"
                  class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-apex-text text-sm
                         font-medium transition-colors">
            <i v-if="saving" class="fa-solid fa-spinner fa-spin mr-1" />
            Hapus
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { get, post, put, del } = useApi()
const fmt = useFormat()

const loading      = ref(true)
const saving       = ref(false)
const selectedYear = ref(new Date().getFullYear())
const years        = ref<number[]>([])
const budgetData   = ref<any[]>([])
const summaryData  = ref<any[]>([])
const perspectives = ref<string[]>([])
const filterBsc    = ref('')

const formModal   = reactive({ open: false, isNew: false, form: {} as any })
const deleteModal = reactive({ open: false, item: null as any })
const saveError   = ref('')
const toast       = reactive({ show: false, msg: '', type: 'success' as 'success' | 'error' })

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

async function loadData() {
  loading.value = true
  try {
    const res     = await get(`/v1/budget?tahun=${selectedYear.value}`)
    budgetData.value  = res.data        || []
    summaryData.value = res.summary     || []
    perspectives.value= res.perspectives|| []
    years.value       = res.years       || [new Date().getFullYear()]
  } finally {
    loading.value = false
  }
}

const filteredItems = computed(() =>
  filterBsc.value
    ? budgetData.value.filter((i: any) => i.perspektif_bsc === filterBsc.value)
    : budgetData.value
)

const filteredBudget = computed(() =>
  filteredItems.value.reduce((s: number, i: any) => s + i.budget_amount, 0)
)
const filteredActual = computed(() =>
  filteredItems.value.reduce((s: number, i: any) => s + i.actual_amount, 0)
)
const filteredAchPct = computed(() =>
  filteredBudget.value > 0
    ? Math.round(filteredActual.value / filteredBudget.value * 1000) / 10
    : 0
)

const totalBudget = computed(() =>
  budgetData.value.reduce((s: number, i: any) => s + i.budget_amount, 0)
)
const totalActual = computed(() =>
  budgetData.value.reduce((s: number, i: any) => s + i.actual_amount, 0)
)
const totalAchPct = computed(() =>
  totalBudget.value > 0
    ? Math.round(totalActual.value / totalBudget.value * 1000) / 10
    : 0
)

// Semua kategori unik untuk datalist
const allCategories = computed(() =>
  [...new Set(budgetData.value.map((i: any) => i.category))]
)

function bscBadge(bsc: string): string {
  const map: Record<string, string> = {
    'Financial':        'badge-emerald',
    'Customer':         'badge-blue',
    'Internal Process': 'badge-purple',
    'Learning & Growth':'badge-yellow',
  }
  return map[bsc] ?? 'badge-gray'
}

function statusBadge(status: string): string {
  const map: Record<string, string> = {
    'Planning':    'badge-gray',
    'Active':      'badge-blue',
    'Over Budget': 'badge-red',
    'Completed':   'badge-emerald',
    'Cancelled':   'badge-gray',
  }
  return map[status] ?? 'badge-gray'
}

function achBarColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

function monthName(m: number): string {
  return new Date(2000, m - 1, 1).toLocaleString('id-ID', { month: 'long' })
}

function openAdd() {
  formModal.isNew = true
  formModal.form  = {
    perspektif_bsc: '', category: '', sub_category: '',
    budget_amount: 0, actual_amount: 0,
    month_num: 0, status: 'Planning', notes: '',
  }
  formModal.open = true
}

function openEdit(item: any) {
  formModal.isNew = false
  formModal.form  = { ...item }
  formModal.open  = true
}

async function saveBudget() {
  saving.value = true
  saveError.value = ''
  const isNew = formModal.isNew
  try {
    if (isNew) {
      await post('/v1/budget', { ...formModal.form, tahun: selectedYear.value })
    } else {
      await put(`/v1/budget/${formModal.form.id}`, formModal.form)
    }
    formModal.open = false
    await loadData()
    showToast(isNew ? 'Budget item berhasil ditambahkan.' : 'Budget item berhasil disimpan.')
  } catch (err: any) {
    saveError.value = err?.data?.detail || err?.message || 'Gagal menyimpan. Cek koneksi ke server.'
  } finally {
    saving.value = false
  }
}

function confirmDelete(item: any) {
  deleteModal.item = item
  deleteModal.open = true
}

async function doDelete() {
  saving.value = true
  try {
    await del(`/v1/budget/${deleteModal.item.id}`)
    deleteModal.open = false
    await loadData()
    showToast('Budget item berhasil dihapus.')
  } catch (err: any) {
    showToast(err?.data?.detail || 'Gagal menghapus item.', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(loadData)
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
