<template>
  <div class="max-w-4xl">
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-users text-primary-400 mr-2" />Master Sales</h1>
        <p class="page-subtitle">Daftar user sales & manager</p>
      </div>
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
            <th class="text-right">Limit Entertain/Bln</th>
            <th class="text-center">Tgl Bergabung</th>
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
              <td class="text-right">
                <NumericInput v-model="editForm.entertain_limit" class="form-input py-1 text-sm w-36 text-right" />
              </td>
              <td class="text-center">
                <input type="date" v-model="editForm.join_date" class="form-input py-1 text-sm w-36" />
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
              <td class="text-right text-sm text-gray-400">
                {{ u.entertain_limit > 0 ? fmtRupiah(u.entertain_limit) : '—' }}
              </td>
              <td class="text-center text-sm text-gray-400">
                {{ u.join_date ? u.join_date.slice(0,10) : '—' }}
              </td>
              <td class="text-center">
                <button @click="startEdit(u)" class="btn-ghost btn-xs rounded" title="Edit">
                  <i class="fa-solid fa-pen text-xs" />
                </button>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, put } = useApi()

const editing  = ref<number|null>(null)
const saving   = ref(false)
const editForm = reactive({ nama: '', email: '', role_id: 3, is_active: 1, entertain_limit: 0, join_date: '' })

function fmtRupiah(v: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(v)
}
const toast    = reactive({ show: false, msg: '', type: 'success' as 'success'|'error' })

const { data, pending, refresh } = await useAsyncData('sales-master', () => get('/v1/master/sales'), { server: false })
const { data: roles } = await useAsyncData('roles-list', () => get('/v1/master/roles'), { server: false })

function showToast(msg: string, type: 'success'|'error' = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

function startEdit(u: any) {
  editing.value = u.id
  editForm.nama = u.nama
  editForm.email = u.email
  editForm.role_id = u.role_id
  editForm.is_active = u.is_active
  editForm.entertain_limit = u.entertain_limit || 0
  editForm.join_date = u.join_date ? u.join_date.slice(0, 10) : ''
}

async function saveUser(id: number) {
  saving.value = true
  try {
    await put(`/v1/master/users/${id}`, { ...editForm })
    showToast('User berhasil diupdate.')
    editing.value = null
    await refresh()
  } catch (err: any) {
    showToast(err?.data?.detail || 'Gagal menyimpan.', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.badge { @apply inline-block px-2 py-0.5 rounded text-xs font-medium; }
.badge-blue   { @apply bg-blue-900/50 text-blue-300; }
.badge-yellow { @apply bg-yellow-900/50 text-yellow-300; }
.badge-gray   { @apply bg-gray-800 text-gray-400; }
.badge-green  { @apply bg-green-900/50 text-green-300; }
.badge-red    { @apply bg-red-900/50 text-red-400; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
