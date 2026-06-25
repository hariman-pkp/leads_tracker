<template>
  <div class="max-w-5xl">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">
          <i class="fa-solid fa-sitemap text-primary-400 mr-2" />Master Organisasi
        </h1>
        <p class="page-subtitle">{{ list.length }} organisasi terdaftar</p>
      </div>
      <button @click="openAdd" class="btn-primary">
        <i class="fa-solid fa-plus" /> Tambah Organisasi
      </button>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show"
           :class="toast.type === 'success'
             ? 'bg-green-800 border-green-600'
             : 'bg-red-900 border-red-600'"
           class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3
                  rounded-lg border shadow-xl text-sm text-white max-w-sm">
        <i :class="toast.type === 'success'
          ? 'fa-solid fa-circle-check text-green-400'
          : 'fa-solid fa-circle-exclamation text-red-400'" />
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <!-- Tabel -->
    <div v-else class="card overflow-x-auto">
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-navy-700">
            <th class="text-left py-3 px-4 text-gray-400 font-medium w-32">Kode</th>
            <th class="text-left py-3 px-4 text-gray-400 font-medium">Nama Organisasi</th>
            <th class="text-left py-3 px-4 text-gray-400 font-medium">Parent Organisasi</th>
            <th class="text-left py-3 px-4 text-gray-400 font-medium">Head</th>
            <th class="text-center py-3 px-4 text-gray-400 font-medium w-24">Status</th>
            <th class="text-center py-3 px-4 text-gray-400 font-medium w-24">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="list.length === 0">
            <td colspan="6" class="text-center py-16 text-gray-500">
              <i class="fa-solid fa-sitemap text-4xl block mb-3 opacity-30" />
              Belum ada data organisasi
            </td>
          </tr>
          <tr v-for="org in list" :key="org.id"
              class="border-b border-navy-800/50 hover:bg-navy-800/30 transition-colors">
            <!-- Kode -->
            <td class="py-3 px-4">
              <span class="font-mono text-xs bg-navy-800 text-primary-300 px-2 py-1 rounded">
                {{ org.kode }}
              </span>
            </td>
            <!-- Nama + indikator hirarki -->
            <td class="py-3 px-4">
              <div class="flex items-center gap-2">
                <i v-if="hasChildren(org.id)"
                   class="fa-solid fa-sitemap text-xs text-gray-500"
                   title="Memiliki sub-organisasi" />
                <span class="font-medium text-gray-100">{{ org.nama }}</span>
              </div>
            </td>
            <!-- Parent -->
            <td class="py-3 px-4">
              <span v-if="org.parent_kode"
                    class="inline-flex items-center gap-1.5 text-gray-300 text-xs">
                <i class="fa-solid fa-arrow-up text-[10px] text-gray-500" />
                <span class="font-mono text-primary-400">{{ org.parent_kode }}</span>
                <span class="text-gray-400">{{ org.parent_nama }}</span>
              </span>
              <span v-else class="text-gray-600 text-xs">— (Root)</span>
            </td>
            <!-- Head -->
            <td class="py-3 px-4 text-gray-300">
              <span v-if="org.head" class="flex items-center gap-1.5">
                <i class="fa-solid fa-user-tie text-xs text-gray-500" />
                {{ org.head }}
              </span>
              <span v-else class="text-gray-600 text-xs">—</span>
            </td>
            <!-- Status -->
            <td class="py-3 px-4 text-center">
              <span :class="org.is_active ? 'badge-emerald' : 'badge-gray'">
                {{ org.is_active ? 'Aktif' : 'Non-aktif' }}
              </span>
            </td>
            <!-- Aksi -->
            <td class="py-3 px-4 text-center">
              <button @click="openEdit(org)"
                      class="text-primary-400 hover:text-primary-300 transition-colors mr-3"
                      title="Edit">
                <i class="fa-solid fa-pen-to-square" />
              </button>
              <button @click="confirmDelete(org)"
                      class="text-red-400 hover:text-red-300 transition-colors"
                      :title="hasChildren(org.id) ? 'Tidak dapat dihapus — memiliki sub-organisasi' : 'Hapus'"
                      :class="hasChildren(org.id) ? 'opacity-30 cursor-not-allowed' : ''">
                <i class="fa-solid fa-trash" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ─── Tampilan Hierarki (Tree) ─────────────────────────────────────── -->
    <div v-if="!loading && list.length > 0" class="card mt-4">
      <div class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
        <i class="fa-solid fa-sitemap mr-1.5" /> Struktur Hierarki
      </div>
      <div class="space-y-1 text-sm">
        <OrgTreeNode
          v-for="root in rootOrgs"
          :key="root.id"
          :node="root"
          :all="list"
          :depth="0" />
      </div>
    </div>

    <!-- ─── Modal Add / Edit ──────────────────────────────────────────────── -->
    <div v-if="modal.open"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-navy-700">
          <h2 class="text-lg font-semibold text-white">
            <i class="fa-solid fa-sitemap text-primary-400 mr-2" />
            {{ modal.isNew ? 'Tambah Organisasi' : 'Edit Organisasi' }}
          </h2>
          <button @click="modal.open = false" class="text-gray-400 hover:text-white">
            <i class="fa-solid fa-xmark text-xl" />
          </button>
        </div>

        <div class="p-5 space-y-4">
          <!-- Kode Organisasi -->
          <div>
            <label class="form-label">
              Kode Organisasi <span class="text-red-400">*</span>
            </label>
            <input v-model="modal.form.kode"
                   class="form-input font-mono uppercase"
                   placeholder="Contoh: DIR, DIV-IT, DEPT-HR"
                   @input="modal.form.kode = modal.form.kode.toUpperCase()" />
            <p class="text-xs text-gray-500 mt-1">Kode unik, otomatis diubah ke huruf kapital</p>
          </div>

          <!-- Nama Organisasi -->
          <div>
            <label class="form-label">
              Nama Organisasi <span class="text-red-400">*</span>
            </label>
            <input v-model="modal.form.nama"
                   class="form-input"
                   placeholder="Contoh: Direktorat Utama" />
          </div>

          <!-- Parent Organisasi -->
          <div>
            <label class="form-label">Parent Organisasi</label>
            <select v-model="modal.form.parent_id" class="form-select">
              <option :value="null">— Tidak ada (Root) —</option>
              <option
                v-for="org in parentOptions"
                :key="org.id"
                :value="org.id">
                {{ org.kode }} — {{ org.nama }}
              </option>
            </select>
          </div>

          <!-- Head -->
          <div>
            <label class="form-label">Head / Kepala Organisasi</label>
            <input v-model="modal.form.head"
                   class="form-input"
                   list="head-list"
                   placeholder="Nama penanggung jawab..." />
            <datalist id="head-list">
              <option v-for="u in users" :key="u.id" :value="u.nama" />
            </datalist>
          </div>

          <!-- Status (hanya saat edit) -->
          <div v-if="!modal.isNew">
            <label class="form-label">Status</label>
            <select v-model="modal.form.is_active" class="form-select">
              <option :value="1">Aktif</option>
              <option :value="0">Non-aktif</option>
            </select>
          </div>

          <!-- Error -->
          <div v-if="modal.error"
               class="flex items-center gap-2 bg-red-900/30 border border-red-700/50
                      rounded-lg px-3 py-2.5 text-sm text-red-300">
            <i class="fa-solid fa-circle-exclamation" />
            {{ modal.error }}
          </div>
        </div>

        <div class="flex justify-end gap-3 p-5 border-t border-navy-700">
          <button @click="modal.open = false" class="btn-ghost">Batal</button>
          <button @click="save" :disabled="saving" class="btn-primary">
            <i :class="saving ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-floppy-disk'" />
            {{ modal.isNew ? 'Tambah' : 'Simpan' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── Modal Konfirmasi Delete ─────────────────────────────────────── -->
    <div v-if="delModal.open"
         class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-navy-900 border border-red-900/50 rounded-2xl w-full max-w-sm shadow-2xl p-6">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center">
            <i class="fa-solid fa-trash text-red-400" />
          </div>
          <h2 class="text-lg font-semibold text-white">Hapus Organisasi</h2>
        </div>
        <p class="text-sm text-gray-300 mb-1">
          Hapus <strong class="text-white">{{ delModal.org?.nama }}</strong>?
        </p>
        <p class="text-xs text-gray-500 mb-5">
          Kode: <span class="font-mono text-gray-400">{{ delModal.org?.kode }}</span>
        </p>
        <div v-if="delModal.error"
             class="flex items-center gap-2 bg-red-900/30 border border-red-700/50
                    rounded-lg px-3 py-2.5 text-sm text-red-300 mb-4">
          <i class="fa-solid fa-circle-exclamation" />
          {{ delModal.error }}
        </div>
        <div class="flex justify-end gap-3">
          <button @click="delModal.open = false" class="btn-ghost">Batal</button>
          <button @click="doDelete" :disabled="saving"
                  class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white
                         text-sm font-medium transition-colors">
            <i v-if="saving" class="fa-solid fa-circle-notch fa-spin mr-1" />
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

// ── State ──────────────────────────────────────────────────────────────────
const loading = ref(true)
const saving  = ref(false)
const list    = ref<any[]>([])
const users   = ref<any[]>([])

const toast   = reactive({ show: false, type: 'success', msg: '' })
const modal   = reactive({
  open: false, isNew: false, error: '',
  form: { kode: '', nama: '', parent_id: null as number | null, head: '', is_active: 1 },
})
const delModal = reactive({ open: false, org: null as any, error: '' })

// ── Data fetching ──────────────────────────────────────────────────────────
async function loadData() {
  loading.value = true
  try {
    const [orgs, usersData] = await Promise.all([
      get('/v1/master/organizations'),
      get('/v1/master/users'),
    ])
    list.value  = orgs  || []
    users.value = usersData || []
  } finally {
    loading.value = false
  }
}

// ── Computed ───────────────────────────────────────────────────────────────
const rootOrgs = computed(() => list.value.filter((o: any) => !o.parent_id))

// Opsi parent dropdown (exclude diri sendiri saat edit)
const parentOptions = computed(() =>
  list.value.filter((o: any) => o.id !== modal.form['id'])
)

function hasChildren(id: number): boolean {
  return list.value.some((o: any) => o.parent_id === id)
}

// ── Modal helpers ──────────────────────────────────────────────────────────
function openAdd() {
  modal.isNew  = true
  modal.error  = ''
  modal.form   = { kode: '', nama: '', parent_id: null, head: '', is_active: 1 }
  modal.open   = true
}

function openEdit(org: any) {
  modal.isNew = false
  modal.error = ''
  modal.form  = {
    id: org.id,
    kode: org.kode,
    nama: org.nama,
    parent_id: org.parent_id,
    head: org.head || '',
    is_active: org.is_active,
  }
  modal.open = true
}

async function save() {
  if (!modal.form.kode || !modal.form.nama) {
    modal.error = 'Kode dan Nama wajib diisi'
    return
  }
  saving.value = true
  modal.error  = ''
  try {
    if (modal.isNew) {
      await post('/v1/master/organizations', modal.form)
    } else {
      await put(`/v1/master/organizations/${(modal.form as any).id}`, modal.form)
    }
    modal.open = false
    showToast('success', modal.isNew ? 'Organisasi berhasil ditambahkan' : 'Data berhasil diperbarui')
    await loadData()
  } catch (e: any) {
    modal.error = e?.data?.message || 'Terjadi kesalahan'
  } finally {
    saving.value = false
  }
}

function confirmDelete(org: any) {
  if (hasChildren(org.id)) return   // tombol disabled
  delModal.org   = org
  delModal.error = ''
  delModal.open  = true
}

async function doDelete() {
  saving.value   = true
  delModal.error = ''
  try {
    await del(`/v1/master/organizations/${delModal.org.id}`)
    delModal.open = false
    showToast('success', 'Organisasi berhasil dihapus')
    await loadData()
  } catch (e: any) {
    delModal.error = e?.data?.message || 'Gagal menghapus'
  } finally {
    saving.value = false
  }
}

// ── Toast ──────────────────────────────────────────────────────────────────
function showToast(type: 'success' | 'error', msg: string) {
  toast.type = type
  toast.msg  = msg
  toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

onMounted(loadData)
</script>
