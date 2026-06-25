<template>
  <div>
    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show"
           :class="toast.type === 'success' ? 'bg-emerald-900 border-emerald-600' : 'bg-red-900 border-red-700'"
           class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm text-white max-w-sm">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-emerald-400' : 'fa-solid fa-circle-exclamation text-red-400'" />
        {{ toast.msg }}
      </div>
    </Transition>

    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-box-open text-primary-400 mr-2" />Master Produk</h1>
        <p class="page-subtitle">{{ rows.length }} produk terdaftar</p>
      </div>
      <div class="flex gap-2">
        <button @click="exportXlsx" :disabled="exporting" class="btn-secondary">
          <i :class="`fa-solid ${exporting ? 'fa-circle-notch fa-spin' : 'fa-file-excel'}`" />
          {{ exporting ? 'Exporting...' : 'Export .xlsx' }}
        </button>
        <button @click="openAdd" class="btn-primary">
          <i class="fa-solid fa-plus" />Tambah Produk
        </button>
      </div>
    </div>

    <!-- Filter + Search -->
    <div class="card mb-5">
      <div class="flex flex-wrap gap-3 items-center">
        <input v-model="search" class="form-input w-56" placeholder="🔍 Cari nama / kode..." />
        <select v-model="filterKat" class="form-select w-40">
          <option value="">Semua Kategori</option>
          <option v-for="k in kategoriList" :key="k">{{ k }}</option>
        </select>
        <select v-model="filterActive" class="form-select w-36">
          <option value="">Semua Status</option>
          <option value="1">Aktif</option>
          <option value="0">Non-aktif</option>
        </select>
        <span class="ml-auto text-xs text-gray-500">{{ filtered.length }} hasil</span>
        <button v-if="filtered.length !== rows.length" @click="resetFilter"
                class="text-xs text-primary-400 hover:text-primary-300">
          Reset filter
        </button>
      </div>
    </div>

    <!-- Tabel -->
    <div class="card overflow-x-auto">
      <div v-if="pending" class="flex justify-center py-16">
        <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
      </div>
      <table v-else class="tbl">
        <thead>
          <tr>
            <th>Kode</th>
            <th>Nama Produk</th>
            <th>Kategori</th>
            <th>Deskripsi</th>
            <th>Status</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!filtered.length">
            <td colspan="6" class="text-center py-12 text-gray-600">
              <i class="fa-solid fa-box-open text-3xl mb-2 block opacity-30" />
              Tidak ada data
            </td>
          </tr>
          <tr v-for="p in paginated" :key="p.id">
            <td>
              <span class="font-mono text-xs bg-navy-800 text-primary-300 px-2 py-0.5 rounded font-semibold">
                {{ p.kode }}
              </span>
            </td>
            <td class="font-medium text-gray-200">{{ p.nama }}</td>
            <td>
              <span v-if="p.kategori" :class="katClass(p.kategori)" class="text-xs px-2 py-0.5 rounded-full font-medium">
                {{ p.kategori }}
              </span>
              <span v-else class="text-gray-600 text-xs">—</span>
            </td>
            <td class="text-xs text-gray-500 max-w-56 truncate">{{ p.deskripsi || '—' }}</td>
            <td>
              <span :class="p.is_active ? 'badge-green' : 'bg-gray-800 text-gray-500'"
                    class="text-xs px-2 py-0.5 rounded-full font-medium">
                {{ p.is_active ? 'Aktif' : 'Non-aktif' }}
              </span>
            </td>
            <td class="text-center">
              <div class="flex items-center justify-center gap-1">
                <button @click="openEdit(p)" class="btn-ghost btn-xs rounded" title="Edit">
                  <i class="fa-solid fa-pen text-xs" />
                </button>
                <button @click="confirmDelete(p)"
                        :disabled="deleting === p.id"
                        class="btn-ghost btn-xs rounded text-red-400 hover:text-red-300 disabled:opacity-40">
                  <i :class="deleting === p.id ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-trash'" class="text-xs" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex items-center justify-between pt-4 mt-2 border-t border-navy-800">
        <span class="text-xs text-gray-500">
          {{ (page - 1) * PAGE_SIZE + 1 }}–{{ Math.min(page * PAGE_SIZE, filtered.length) }} dari {{ filtered.length }}
        </span>
        <div class="flex items-center gap-1">
          <button @click="page = 1" :disabled="page === 1"
                  class="text-xs px-2 py-1 rounded border border-navy-700 text-gray-400 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <i class="fa-solid fa-angles-left" />
          </button>
          <button @click="page--" :disabled="page === 1"
                  class="text-xs px-2 py-1 rounded border border-navy-700 text-gray-400 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <i class="fa-solid fa-chevron-left" />
          </button>
          <span class="text-xs text-gray-400 px-3">{{ page }} / {{ totalPages }}</span>
          <button @click="page++" :disabled="page === totalPages"
                  class="text-xs px-2 py-1 rounded border border-navy-700 text-gray-400 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <i class="fa-solid fa-chevron-right" />
          </button>
          <button @click="page = totalPages" :disabled="page === totalPages"
                  class="text-xs px-2 py-1 rounded border border-navy-700 text-gray-400 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            <i class="fa-solid fa-angles-right" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Add / Edit -->
    <Transition name="modal">
      <div v-if="modal.show"
           class="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4"
           @click.self="modal.show = false">
        <div class="card w-full max-w-lg relative" @click.stop>
          <button @click="modal.show = false" class="absolute top-4 right-4 btn-ghost btn-xs rounded-lg">
            <i class="fa-solid fa-xmark" />
          </button>
          <h3 class="section-title mb-5">
            <i class="fa-solid fa-box-open text-primary-400 mr-1.5" />
            {{ modal.isEdit ? 'Edit Produk' : 'Tambah Produk' }}
          </h3>

          <form @submit.prevent="submitModal" class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <!-- Kode -->
              <div>
                <label class="form-label">Kode <span class="text-red-400">*</span></label>
                <input v-model="modal.kode"
                       class="form-input font-mono uppercase"
                       placeholder="Contoh: FINCORE"
                       required
                       maxlength="20"
                       @input="modal.kode = modal.kode.toUpperCase()" />
                <p class="text-xs text-gray-600 mt-1">Unik, max 20 karakter</p>
              </div>
              <!-- Kategori -->
              <div>
                <label class="form-label">Kategori</label>
                <select v-model="modal.kategori" class="form-select">
                  <option value="">— Pilih —</option>
                  <option>Software Product</option>
                  <option>System Development</option>
                  <option>Managed Services</option>
                  <option>Professional Services</option>
                  <option>Infrastructure & Third-Party</option>
                  <option>Membership</option>
                </select>
              </div>
            </div>
            <!-- Nama -->
            <div>
              <label class="form-label">Nama Produk <span class="text-red-400">*</span></label>
              <input v-model="modal.nama" class="form-input" placeholder="Nama lengkap produk" required />
            </div>
            <!-- Deskripsi -->
            <div>
              <label class="form-label">Deskripsi</label>
              <textarea v-model="modal.deskripsi" class="form-textarea h-20"
                        placeholder="Keterangan singkat produk (opsional)..." />
            </div>
            <!-- Status -->
            <div class="flex items-center gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" v-model="modal.is_active" class="w-4 h-4 accent-primary-500" />
                <span class="text-sm text-gray-300">Produk Aktif</span>
              </label>
              <span class="text-xs text-gray-600">(non-aktif = tidak muncul di dropdown form)</span>
            </div>

            <div v-if="modalErr" class="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300">
              <i class="fa-solid fa-circle-exclamation text-red-400" />{{ modalErr }}
            </div>

            <div class="flex gap-3 justify-end pt-2 border-t border-navy-800">
              <button type="button" @click="modal.show = false" class="btn-secondary">Batal</button>
              <button type="submit" class="btn-primary" :disabled="modalLoading">
                <i :class="modalLoading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-floppy-disk'" />
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, post, put, del } = useApi()

interface Product {
  id: number
  kode: string
  nama: string
  kategori: string | null
  deskripsi: string | null
  is_active: boolean
  created_at: string
}

// ── Data ────────────────────────────────────────────────────────────────
const rows   = ref<Product[]>([])
const pending = ref(true)
const toast   = reactive({ show: false, msg: '', type: 'success' as 'success' | 'error' })
const deleting = ref<number | null>(null)

async function loadData() {
  pending.value = true
  try { rows.value = await get('/v1/master/products') } finally { pending.value = false }
}
onMounted(loadData)

// ── Filter ──────────────────────────────────────────────────────────────
const search      = ref('')
const filterKat   = ref('')
const filterActive = ref('')

const kategoriList = [
  'Software Product', 'System Development', 'Managed Services',
  'Professional Services', 'Infrastructure & Third-Party', 'Membership',
]

const filtered = computed(() => rows.value.filter(p => {
  const q = search.value.toLowerCase()
  if (q && !p.nama.toLowerCase().includes(q) && !p.kode.toLowerCase().includes(q)) return false
  if (filterKat.value && p.kategori !== filterKat.value) return false
  if (filterActive.value === '1' && !p.is_active) return false
  if (filterActive.value === '0' && p.is_active) return false
  return true
}))

// ── Pagination ───────────────────────────────────────────────────────────
const PAGE_SIZE  = 10
const page       = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))
const paginated  = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  return filtered.value.slice(start, start + PAGE_SIZE)
})

watch(filtered, () => { page.value = 1 })

function resetFilter() {
  search.value = ''; filterKat.value = ''; filterActive.value = ''
}

// ── Modal ───────────────────────────────────────────────────────────────
const modal = reactive({
  show: false, isEdit: false, id: 0,
  kode: '', nama: '', kategori: '', deskripsi: '', is_active: true,
})
const modalErr    = ref('')
const modalLoading = ref(false)

function openAdd() {
  Object.assign(modal, { show: true, isEdit: false, id: 0, kode: '', nama: '', kategori: '', deskripsi: '', is_active: true })
  modalErr.value = ''
}

function openEdit(p: Product) {
  Object.assign(modal, {
    show: true, isEdit: true, id: p.id,
    kode: p.kode, nama: p.nama,
    kategori: p.kategori ?? '', deskripsi: p.deskripsi ?? '',
    is_active: p.is_active,
  })
  modalErr.value = ''
}

async function submitModal() {
  modalLoading.value = true
  modalErr.value     = ''
  try {
    const body = {
      kode: modal.kode, nama: modal.nama,
      kategori: modal.kategori || null, deskripsi: modal.deskripsi || null,
      is_active: modal.is_active,
    }
    if (modal.isEdit) {
      await put(`/v1/master/products/${modal.id}`, body)
      showToast('Produk berhasil diperbarui.')
    } else {
      await post('/v1/master/products', body)
      showToast('Produk berhasil ditambahkan.')
    }
    modal.show = false
    await loadData()
  } catch (err: any) {
    modalErr.value = err?.data?.message || err?.message || 'Gagal menyimpan.'
  } finally {
    modalLoading.value = false
  }
}

// ── Export ──────────────────────────────────────────────────────────────
const exporting = ref(false)

async function exportXlsx() {
  exporting.value = true
  try {
    const auth  = useAuthStore()
    const token = auth.token
    const res   = await fetch('/api/v1/master/products/export', {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!res.ok) throw new Error('Export gagal')
    const blob = await res.blob()
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `master_produk_${new Date().toISOString().slice(0,10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    showToast('Gagal mengunduh file export.', 'error')
  } finally {
    exporting.value = false
  }
}

// ── Delete ──────────────────────────────────────────────────────────────
async function confirmDelete(p: Product) {
  if (!confirm(`Hapus produk "${p.nama}" (${p.kode})?`)) return
  deleting.value = p.id
  try {
    await del(`/v1/master/products/${p.id}`)
    showToast(`Produk "${p.nama}" berhasil dihapus.`)
    await loadData()
  } catch (err: any) {
    showToast(err?.data?.message || 'Gagal menghapus.', 'error')
  } finally {
    deleting.value = null
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────
function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

function katClass(k: string) {
  return {
    'Software Product':      'bg-blue-900/40 text-blue-300',
    'System Development':   'bg-purple-900/40 text-purple-300',
    'Managed Services':     'bg-emerald-900/40 text-emerald-300',
    'Professional Services':'bg-yellow-900/40 text-yellow-300',
    'Infrastructure & Third-Party':       'bg-red-900/40 text-red-300',
    'Membership':           'bg-gray-800 text-gray-400',
  }[k] ?? 'bg-gray-800 text-gray-400'
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: all .2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(.95); }
.toast-enter-active, .toast-leave-active { transition: all .3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
