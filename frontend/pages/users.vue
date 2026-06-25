<template>
  <div class="max-w-6xl">
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-user-cog text-primary-400 mr-2" />Master Users</h1>
        <p class="page-subtitle">{{ data?.length || 0 }} user terdaftar</p>
      </div>
      <button @click="showAdd = true" class="btn-primary">
        <i class="fa-solid fa-plus" />Tambah User
      </button>
    </div>

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show"
           :class="toast.type === 'success' ? 'bg-green-800 border-green-600' : 'bg-red-900 border-red-600'"
           class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-green-400' : 'fa-solid fa-circle-exclamation text-red-400'" />
        {{ toast.msg }}
      </div>
    </Transition>

    <!-- Modal Tambah User -->
    <div v-if="showAdd" class="fixed inset-0 z-40 flex items-center justify-center bg-black/60">
      <div class="bg-navy-900 border border-navy-700 rounded-xl p-6 w-full max-w-md shadow-2xl">
        <h2 class="text-lg font-semibold text-gray-100 mb-4">Tambah User Baru</h2>
        <div class="space-y-3">
          <div>
            <label class="form-label">Nama</label>
            <input v-model="addForm.nama" class="form-input" placeholder="Nama lengkap" />
          </div>
          <div>
            <label class="form-label">Email</label>
            <input v-model="addForm.email" type="email" class="form-input" placeholder="email@pkp.co.id" />
          </div>
          <div>
            <label class="form-label">Password</label>
            <input v-model="addForm.password" type="password" class="form-input" placeholder="Min. 6 karakter" />
          </div>
          <div>
            <label class="form-label">Role</label>
            <select v-model="addForm.role_id" class="form-select">
              <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nama }}</option>
            </select>
          </div>
          <div v-if="addErr" class="text-red-400 text-sm">{{ addErr }}</div>
        </div>
        <div class="flex gap-3 mt-5 justify-end">
          <button @click="showAdd = false; addErr = ''" class="btn-secondary">Batal</button>
          <button @click="createUser" class="btn-primary" :disabled="saving">
            <i :class="saving ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-plus'" />
            Simpan
          </button>
        </div>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <div v-else class="card overflow-x-auto">
      <table class="tbl">
        <thead>
          <tr>
            <th>Nama</th>
            <th>Email</th>
            <th>Role</th>
            <th class="text-center">Status</th>
            <th class="text-center">
              <div class="flex items-center justify-center gap-1">
                <i class="fa-solid fa-location-dot text-primary-400" />
                Location Tracking
              </div>
            </th>
            <th class="text-center">Reset Password</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="u in data" :key="u.id">
            <template v-if="editing === u.id">
              <td><input v-model="editForm.nama" class="form-input py-1 text-sm" /></td>
              <td><input v-model="editForm.email" class="form-input py-1 text-sm" /></td>
              <td>
                <select v-model="editForm.role_id" class="form-select py-1 text-sm">
                  <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nama }}</option>
                </select>
              </td>
              <td class="text-center">
                <select v-model="editForm.is_active" class="form-select py-1 text-sm w-24">
                  <option :value="1">Aktif</option>
                  <option :value="0">Nonaktif</option>
                </select>
              </td>
              <td class="text-center">
                <!-- Tidak perlu diubah saat inline edit; ada toggle langsung di view mode -->
                <span class="text-gray-500 text-xs">via toggle</span>
              </td>
              <td class="text-center">
                <input v-model="editForm.password" type="password" class="form-input py-1 text-sm" placeholder="Kosongkan jika tidak diubah" />
              </td>
              <td class="text-center">
                <div class="flex justify-center gap-1">
                  <button @click="saveUser(u.id)" class="btn-primary btn-xs rounded" :disabled="saving">
                    <i :class="saving ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-check'" />
                  </button>
                  <button @click="editing = null" class="btn-secondary btn-xs rounded">
                    <i class="fa-solid fa-xmark" />
                  </button>
                </div>
              </td>
            </template>
            <template v-else>
              <td class="font-medium text-gray-200">{{ u.nama }}</td>
              <td class="text-gray-400 text-sm">{{ u.email }}</td>
              <td>
                <span class="badge" :class="u.role_nama === 'Admin' ? 'badge-blue' : u.role_nama === 'Manager' ? 'badge-yellow' : 'badge-gray'">
                  {{ u.role_nama }}
                </span>
              </td>
              <td class="text-center">
                <span :class="u.is_active ? 'badge badge-green' : 'badge badge-red'">
                  {{ u.is_active ? 'Aktif' : 'Nonaktif' }}
                </span>
              </td>
              <!-- ── Location Tracking Toggle ─────────────────────────── -->
              <td class="text-center">
                <button @click="toggleTracking(u)"
                        :disabled="togglingId === u.id"
                        :title="u.location_tracking_enabled ? 'Klik untuk menonaktifkan tracking' : 'Klik untuk mengaktifkan tracking'"
                        :class="u.location_tracking_enabled
                          ? 'tracking-on'
                          : 'tracking-off'"
                        class="tracking-toggle">
                  <i v-if="togglingId === u.id" class="fa-solid fa-circle-notch fa-spin text-xs" />
                  <template v-else>
                    <i :class="u.location_tracking_enabled ? 'fa-solid fa-location-dot' : 'fa-solid fa-location-slash'" class="text-xs mr-1" />
                    {{ u.location_tracking_enabled ? 'ON' : 'OFF' }}
                  </template>
                </button>
              </td>
              <td class="text-center text-gray-600 text-xs">••••••••</td>
              <td class="text-center">
                <div class="flex justify-center gap-1">
                  <button @click="startEdit(u)" class="btn-ghost btn-xs rounded" title="Edit">
                    <i class="fa-solid fa-pen text-xs" />
                  </button>
                  <button @click="deleteUser(u.id, u.nama)"
                          class="btn-ghost btn-xs rounded text-red-400 hover:text-red-300"
                          title="Hapus" :disabled="deleting === u.id">
                    <i :class="deleting === u.id ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-trash'" class="text-xs" />
                  </button>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Info box -->
    <div class="mt-4 p-4 rounded-xl bg-navy-900 border border-navy-700 flex gap-3 text-sm text-gray-400">
      <i class="fa-solid fa-circle-info text-primary-400 mt-0.5 flex-shrink-0" />
      <div>
        <span class="font-medium text-gray-300">Location Tracking</span> mengontrol apakah mobile app sales mengirimkan posisi GPS ke server secara real-time.
        Saat <span class="text-emerald-400 font-medium">ON</span>, posisi dikirim setiap 5 menit saat aplikasi aktif dan dapat dipantau melalui halaman
        <NuxtLink to="/field-monitor" class="text-primary-400 underline">Field Monitor</NuxtLink>.
        Saat <span class="text-red-400 font-medium">OFF</span>, aplikasi tidak mengirim data posisi sama sekali — privasi terjaga.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, put, post, del } = useApi()

const editing   = ref<number|null>(null)
const saving    = ref(false)
const deleting  = ref<number|null>(null)
const togglingId = ref<number|null>(null)
const showAdd   = ref(false)
const addErr    = ref('')
const toast     = reactive({ show: false, msg: '', type: 'success' as 'success'|'error' })

const editForm = reactive({ nama: '', email: '', role_id: 3, is_active: 1, password: '' })
const addForm  = reactive({ nama: '', email: '', password: '', role_id: 3 })

const { data, pending, refresh } = await useAsyncData('users-master', () => get('/v1/master/users'), { server: false })
const { data: roles } = await useAsyncData('roles-for-users', () => get('/v1/master/roles'), { server: false })

function showToast(msg: string, type: 'success'|'error' = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

function startEdit(u: any) {
  editing.value = u.id
  editForm.nama = u.nama; editForm.email = u.email
  editForm.role_id = u.role_id; editForm.is_active = u.is_active
  editForm.password = ''
}

async function saveUser(id: number) {
  saving.value = true
  try {
    const payload: any = { nama: editForm.nama, email: editForm.email, role_id: editForm.role_id, is_active: editForm.is_active }
    if (editForm.password) payload.password = editForm.password
    await put(`/v1/master/users/${id}`, payload)
    showToast('User berhasil diupdate.')
    editing.value = null
    await refresh()
  } catch (err: any) {
    showToast(err?.data?.detail || 'Gagal menyimpan.', 'error')
  } finally { saving.value = false }
}

async function toggleTracking(u: any) {
  togglingId.value = u.id
  const newVal = u.location_tracking_enabled ? 0 : 1
  try {
    await put(`/v1/master/users/${u.id}`, { location_tracking_enabled: newVal })
    u.location_tracking_enabled = newVal
    showToast(
      newVal
        ? `Location tracking ${u.nama} diaktifkan.`
        : `Location tracking ${u.nama} dinonaktifkan.`
    )
  } catch (err: any) {
    showToast(err?.data?.detail || 'Gagal mengubah setting.', 'error')
  } finally { togglingId.value = null }
}

async function createUser() {
  addErr.value = ''
  if (!addForm.nama || !addForm.email || !addForm.password) {
    addErr.value = 'Nama, email, dan password wajib diisi.'; return
  }
  saving.value = true
  try {
    await post('/v1/master/users', { ...addForm })
    showToast('User berhasil dibuat.')
    showAdd.value = false
    addForm.nama = addForm.email = addForm.password = ''
    addForm.role_id = 3
    await refresh()
  } catch (err: any) {
    addErr.value = err?.data?.detail || 'Gagal membuat user.'
  } finally { saving.value = false }
}

async function deleteUser(id: number, nama: string) {
  if (!confirm(`Hapus user "${nama}"?`)) return
  deleting.value = id
  try {
    await del(`/v1/master/users/${id}`)
    showToast(`User "${nama}" dihapus.`)
    await refresh()
  } catch (err: any) {
    showToast(err?.data?.detail || 'Gagal menghapus.', 'error')
  } finally { deleting.value = null }
}
</script>

<style scoped>
.badge { @apply inline-block px-2 py-0.5 rounded text-xs font-medium; }
.badge-blue   { @apply bg-blue-900/50 text-blue-300; }
.badge-yellow { @apply bg-yellow-900/50 text-yellow-300; }
.badge-gray   { @apply bg-gray-800 text-gray-400; }
.badge-green  { @apply bg-green-900/50 text-green-300; }
.badge-red    { @apply bg-red-900/50 text-red-400; }

.tracking-toggle {
  @apply inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
         transition-all duration-200 cursor-pointer border;
}
.tracking-on  { @apply bg-emerald-900/50 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/80; }
.tracking-off { @apply bg-gray-800 text-gray-500 border-gray-700 hover:bg-gray-700; }

.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
