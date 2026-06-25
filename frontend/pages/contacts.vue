<template>
  <div>
    <!-- ── HEADER ─────────────────────────────────────────────────── -->
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title">
          <i class="fa-solid fa-address-book text-primary-400 mr-2" />Contacts
        </h1>
        <p class="page-subtitle">{{ data?.total || 0 }} kontak terdaftar</p>
      </div>
      <button @click="openAdd" class="btn-primary btn-sm">
        <i class="fa-solid fa-plus" />Tambah Kontak
      </button>
    </div>

    <!-- ── SEARCH ─────────────────────────────────────────────────── -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3 items-center">
        <input v-model="search" class="form-input w-64"
               placeholder="🔍 Nama / company / HP / email..."
               @input="debouncedFetch" />
        <span class="text-xs text-gray-500">
          {{ data?.total || 0 }} hasil
        </span>
        <button v-if="search" @click="search=''; refresh()"
                class="btn-ghost btn-xs text-gray-500 hover:text-gray-200">
          <i class="fa-solid fa-xmark" />Reset
        </button>
      </div>
    </div>

    <!-- hidden file input untuk upload foto — harus di luar rantai v-if -->
    <input ref="fotoInput" type="file" accept="image/*" class="hidden" @change="onFotoSelected" />

    <!-- ── TABLE ──────────────────────────────────────────────────── -->
    <div v-if="pending" class="flex justify-center py-16">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <!-- Empty state -->
    <div v-else-if="!data?.contacts?.length" class="card py-16 text-center text-gray-600">
      <i class="fa-solid fa-address-book text-4xl mb-3 block text-gray-700" />
      Tidak ada kontak ditemukan
    </div>

    <!-- Card grid: 1 col mobile → 2 tablet → 4 desktop -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="c in data?.contacts" :key="c.id"
           class="card flex flex-col gap-3 hover:border-primary-700/50 transition-colors border border-transparent">

        <!-- Avatar + aksi -->
        <div class="flex items-start justify-between">
          <!-- Foto / avatar dengan tombol ganti -->
          <div class="relative group flex-shrink-0">
            <img v-if="c.foto"
                 :src="`/storage/${c.foto}`"
                 :alt="c.nama_contact"
                 class="w-14 h-14 rounded-full object-cover ring-2 ring-primary-700/40" />
            <div v-else
                 class="w-14 h-14 rounded-full bg-primary-900/60 text-primary-300 flex items-center justify-center text-xl font-bold ring-2 ring-primary-700/30">
              {{ c.nama_contact?.charAt(0)?.toUpperCase() ?? '?' }}
            </div>
            <!-- overlay ganti foto -->
            <button @click="triggerFotoUpload(c)"
                    class="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    :class="uploadingFotoId === c.id ? 'opacity-100' : ''"
                    title="Ganti foto">
              <i v-if="uploadingFotoId === c.id" class="fa-solid fa-circle-notch fa-spin text-white text-sm" />
              <i v-else class="fa-solid fa-camera text-white text-sm" />
            </button>
          </div>

          <div class="flex gap-1">
            <button @click="openEdit(c)"
                    class="btn-ghost btn-xs text-gray-500 hover:text-primary-400"
                    title="Edit">
              <i class="fa-solid fa-pen text-xs" />
            </button>
            <button @click="openDelete(c)"
                    class="btn-ghost btn-xs text-gray-600 hover:text-red-400"
                    title="Hapus">
              <i class="fa-solid fa-trash text-xs" />
            </button>
          </div>
        </div>

        <!-- Info utama -->
        <div class="min-w-0">
          <p class="font-semibold text-gray-100 text-sm truncate">{{ c.nama_contact }}</p>
          <p class="text-xs text-gray-500 truncate mt-0.5">{{ c.jabatan || '—' }}</p>
        </div>

        <!-- Company -->
        <div class="flex items-center gap-1.5 min-w-0">
          <i class="fa-solid fa-building text-[10px] text-gray-600 flex-shrink-0" />
          <NuxtLink v-if="c.lead_id" :to="`/pipeline/${c.lead_id}`"
                    class="text-xs text-primary-400 hover:text-primary-300 truncate">
            {{ c.nama_company || '—' }}
          </NuxtLink>
          <span v-else class="text-xs text-gray-500 truncate">{{ c.nama_company || '—' }}</span>
        </div>

        <!-- No HP -->
        <div class="flex items-center gap-1.5">
          <i class="fa-solid fa-phone text-[10px] text-gray-600 flex-shrink-0" />
          <a v-if="c.no_hp" :href="`tel:${c.no_hp}`"
             class="text-xs text-primary-400 hover:text-primary-300">
            {{ c.no_hp }}
          </a>
          <span v-else class="text-xs text-gray-600">—</span>
        </div>

        <!-- Role badge -->
        <div v-if="c.role">
          <span :class="roleBadge(c.role)" class="text-xs">{{ c.role }}</span>
        </div>
      </div>
    </div>

    <div v-if="data?.contacts?.length" class="mt-4">
      <AppPagination
        v-model:page="page"
        v-model:per-page="perPage"
        :total="data?.total ?? 0"
        :total-pages="data?.total_pages ?? 1"
        :per-page-options="[10, 25, 50, 100]"
      />
    </div>

    <!-- ── ADD / EDIT MODAL ───────────────────────────────────────── -->
    <div v-if="formModal.show"
         class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-navy-800 flex-shrink-0">
          <div>
            <h3 class="font-semibold text-white">
              {{ formModal.mode === 'add' ? 'Tambah Kontak' : 'Edit Kontak' }}
            </h3>
            <p v-if="formModal.mode === 'edit'" class="text-xs text-gray-500 mt-0.5">
              ID {{ formModal.id }} · {{ formModal.nama_company }}
            </p>
          </div>
          <button @click="formModal.show = false" class="btn-ghost btn-xs">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Body -->
        <form @submit.prevent="submitForm" class="p-5 overflow-y-auto flex-1">
          <div class="grid grid-cols-2 gap-3">

            <!-- Nama Kontak -->
            <div class="col-span-2">
              <label class="form-label">Nama Kontak <span class="text-red-400">*</span></label>
              <input v-model="formModal.nama_contact" class="form-input" required
                     placeholder="Nama lengkap kontak" />
            </div>

            <!-- Link ke Lead -->
            <div class="col-span-2">
              <label class="form-label">Link ke Pipeline (opsional)</label>
              <select v-model="formModal.lead_id" class="form-select"
                      @change="onLeadChange">
                <option value="">— Tidak ada / Mandiri —</option>
                <option v-for="l in data?.leads || []" :key="l.lead_id" :value="l.lead_id">
                  {{ l.lead_id }} · {{ l.nama_company }}
                </option>
              </select>
              <p class="text-xs text-gray-600 mt-1">Jika dipilih, nama company akan otomatis terisi</p>
            </div>

            <!-- Company -->
            <div class="col-span-2">
              <label class="form-label">Nama Company</label>
              <input v-model="formModal.nama_company" class="form-input"
                     placeholder="PT / CV / Instansi..." />
            </div>

            <!-- Jabatan + Dept -->
            <div>
              <label class="form-label">Jabatan</label>
              <input v-model="formModal.jabatan" class="form-input"
                     placeholder="Direktur, Manager, Staff..." />
            </div>
            <div>
              <label class="form-label">Departemen</label>
              <input v-model="formModal.dept" class="form-input"
                     placeholder="IT, Finance, HRD..." />
            </div>

            <!-- Role -->
            <div>
              <label class="form-label">Role dalam Deal</label>
              <select v-model="formModal.role" class="form-select">
                <option value="">— Pilih role —</option>
                <option>Decision Maker</option>
                <option>Influencer</option>
                <option>User</option>
                <option>Technical</option>
                <option>Champion</option>
                <option>Gatekeeper</option>
              </select>
            </div>

            <!-- Preferensi Kontak -->
            <div>
              <label class="form-label">Preferensi Kontak</label>
              <select v-model="formModal.preferensi_kontak" class="form-select">
                <option value="">— Pilih —</option>
                <option>WhatsApp</option>
                <option>Email</option>
                <option>Telepon</option>
                <option>Meeting</option>
              </select>
            </div>

            <!-- HP + Telepon -->
            <div>
              <label class="form-label">No. HP / WhatsApp</label>
              <input v-model="formModal.no_hp" class="form-input"
                     placeholder="+62 8xx-xxxx-xxxx" />
            </div>
            <div>
              <label class="form-label">No. Telepon Kantor</label>
              <input v-model="formModal.telepon" class="form-input"
                     placeholder="021-xxxxxxx" />
            </div>

            <!-- Email -->
            <div>
              <label class="form-label">Email</label>
              <input v-model="formModal.email" class="form-input" type="email"
                     placeholder="nama@company.com" />
            </div>

            <!-- LinkedIn -->
            <div>
              <label class="form-label">LinkedIn</label>
              <input v-model="formModal.linkedin" class="form-input"
                     placeholder="linkedin.com/in/..." />
            </div>

            <!-- Catatan -->
            <div class="col-span-2">
              <label class="form-label">Catatan</label>
              <textarea v-model="formModal.catatan" class="form-textarea h-16"
                        placeholder="Catatan tambahan tentang kontak ini..." />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex gap-2 justify-end pt-4 mt-2 border-t border-navy-800">
            <button type="button" @click="formModal.show = false" class="btn-secondary">
              Batal
            </button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <i v-if="saving" class="fa-solid fa-circle-notch fa-spin" />
              <i v-else class="fa-solid fa-floppy-disk" />
              {{ formModal.mode === 'add' ? 'Simpan' : 'Update' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── DELETE KONFIRMASI ──────────────────────────────────────── -->
    <div v-if="deleteModal.show"
         class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-red-900/50 rounded-xl w-full max-w-sm shadow-2xl">
        <div class="flex items-center gap-3 p-5 border-b border-navy-800">
          <div class="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-triangle-exclamation text-red-400" />
          </div>
          <div>
            <h3 class="font-semibold text-white">Hapus Kontak</h3>
            <p class="text-xs text-gray-500 mt-0.5">Kontak akan dipindahkan ke recycle bin</p>
          </div>
        </div>
        <div class="p-5">
          <div class="p-3 rounded-lg bg-navy-800 border border-navy-700 space-y-1.5 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-500">Nama</span>
              <span class="text-gray-200 font-medium">{{ deleteModal.nama_contact }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Company</span>
              <span class="text-gray-400">{{ deleteModal.nama_company || '—' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Jabatan</span>
              <span class="text-gray-400">{{ deleteModal.jabatan || '—' }}</span>
            </div>
          </div>
        </div>
        <div class="flex gap-2 justify-end p-5 pt-0">
          <button @click="deleteModal.show = false" class="btn-secondary" :disabled="deleting">
            Batal
          </button>
          <button @click="submitDelete" class="btn-danger" :disabled="deleting">
            <i v-if="deleting" class="fa-solid fa-circle-notch fa-spin" />
            <i v-else class="fa-solid fa-trash" />
            Hapus
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, post, put, del, postForm } = useApi()
const authStore = useAuthStore()
const isAdmin   = computed(() => authStore.user?.role_id === 1)

const search  = ref('')
const page    = ref(1)
const perPage = ref(10)

// ── Foto upload ────────────────────────────────────────────────────────────
const fotoInput       = ref<HTMLInputElement | null>(null)
const uploadingFotoId = ref<number | null>(null)
let   fotoTargetId    = 0

function triggerFotoUpload(c: any) {
  fotoTargetId = c.id
  fotoInput.value?.click()
}

async function onFotoSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file || !fotoTargetId) return
  uploadingFotoId.value = fotoTargetId
  try {
    const fd = new FormData()
    fd.append('file', file)
    const res = await postForm<{ foto: string }>(`/v1/contacts/${fotoTargetId}/foto`, fd)
    // Update foto di data lokal tanpa reload penuh
    const contact = data.value?.contacts?.find((c: any) => c.id === fotoTargetId)
    if (contact) contact.foto = res.foto
  } catch (err) {
    console.error('Upload foto gagal:', err)
  } finally {
    uploadingFotoId.value = null
    fotoTargetId = 0
    if (fotoInput.value) fotoInput.value.value = ''
  }
}

const { data, pending, refresh } = await useAsyncData(
  'contacts',
  () => get('/v1/contacts', { q: search.value, page: page.value, per_page: perPage.value }),
  { server: false, watch: [page, perPage] }
)

let deb: ReturnType<typeof setTimeout>
function debouncedFetch() {
  clearTimeout(deb)
  deb = setTimeout(() => { page.value = 1; refresh() }, 400)
}

// ── ROLE BADGE ───────────────────────────────────────────────────
function roleBadge(role: string): string {
  const map: Record<string, string> = {
    'Decision Maker': 'badge-purple',
    'Influencer'    : 'badge-blue',
    'User'          : 'badge-gray',
    'Technical'     : 'badge-yellow',
    'Champion'      : 'badge-green',
    'Gatekeeper'    : 'badge-red',
  }
  return map[role] ?? 'badge-gray'
}

// ── ADD / EDIT FORM ──────────────────────────────────────────────
const saving = ref(false)
const formModal = reactive({
  show: false, mode: 'add' as 'add' | 'edit',
  id: 0,
  lead_id: '', nama_company: '', nama_contact: '',
  jabatan: '', dept: '', role: '',
  no_hp: '', email: '', telepon: '', linkedin: '',
  preferensi_kontak: '', catatan: '',
})

function resetForm() {
  Object.assign(formModal, {
    id: 0, lead_id: '', nama_company: '', nama_contact: '',
    jabatan: '', dept: '', role: '',
    no_hp: '', email: '', telepon: '', linkedin: '',
    preferensi_kontak: '', catatan: '',
  })
}

function openAdd() {
  resetForm()
  formModal.mode = 'add'
  formModal.show = true
}

function openEdit(c: any) {
  Object.assign(formModal, {
    show             : true,
    mode             : 'edit',
    id               : c.id,
    lead_id          : c.lead_id          ?? '',
    nama_company     : c.nama_company     ?? '',
    nama_contact     : c.nama_contact     ?? '',
    jabatan          : c.jabatan          ?? '',
    dept             : c.dept             ?? '',
    role             : c.role             ?? '',
    no_hp            : c.no_hp            ?? '',
    email            : c.email            ?? '',
    telepon          : c.telepon          ?? '',
    linkedin         : c.linkedin         ?? '',
    preferensi_kontak: c.preferensi_kontak ?? '',
    catatan          : c.catatan          ?? '',
  })
}

function onLeadChange() {
  if (!formModal.lead_id) return
  const lead = data.value?.leads?.find((l: any) => l.lead_id === formModal.lead_id)
  if (lead && !formModal.nama_company) {
    formModal.nama_company = lead.nama_company
  }
}

async function submitForm() {
  saving.value = true
  try {
    const { show, mode, id, ...payload } = formModal
    // Bersihkan string kosong jadi null agar DB bersih
    const clean: any = {}
    for (const [k, v] of Object.entries(payload)) {
      clean[k] = v === '' ? null : v
    }

    if (mode === 'add') {
      await post('/v1/contacts', clean)
    } else {
      await put(`/v1/contacts/${id}`, clean)
    }
    formModal.show = false
    await refresh()
  } finally {
    saving.value = false
  }
}

// ── DELETE ───────────────────────────────────────────────────────
const deleting = ref(false)
const deleteModal = reactive({
  show: false, id: 0,
  nama_contact: '', nama_company: '', jabatan: '',
})

function openDelete(c: any) {
  Object.assign(deleteModal, {
    show        : true,
    id          : c.id,
    nama_contact: c.nama_contact  ?? '',
    nama_company: c.nama_company  ?? '',
    jabatan     : c.jabatan       ?? '',
  })
}

async function submitDelete() {
  deleting.value = true
  try {
    await del(`/v1/contacts/${deleteModal.id}`)
    deleteModal.show = false
    await refresh()
  } finally {
    deleting.value = false
  }
}
</script>
