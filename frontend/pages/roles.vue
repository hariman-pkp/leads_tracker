<template>
  <div class="max-w-5xl">
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-shield-alt text-primary-400 mr-2" />Role & Menu</h1>
        <p class="page-subtitle">Kelola role dan hak akses menu</p>
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

    <div v-else class="space-y-5">
      <!-- Per-role card -->
      <div v-for="role in roles" :key="role.id" class="card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <span class="badge" :class="role.nama === 'Admin' ? 'badge-blue' : role.nama === 'Manager' ? 'badge-yellow' : 'badge-gray'">
              {{ role.nama }}
            </span>
            <span class="text-gray-500 text-sm">{{ role.deskripsi }}</span>
          </div>
          <button @click="saveMenus(role.id)" class="btn-primary btn-sm" :disabled="saving === role.id">
            <i :class="saving === role.id ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-floppy-disk'" />
            Simpan
          </button>
        </div>

        <!-- Menu checkboxes grouped -->
        <div v-for="(items, group) in menuGroups" :key="group" class="mb-4">
          <div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{{ group }}</div>
          <div class="flex flex-wrap gap-2">
            <label v-for="m in items" :key="m.key"
                   class="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border text-sm transition-colors"
                   :class="roleMenus[role.id]?.has(m.key)
                     ? 'border-primary-600 bg-primary-900/30 text-primary-300'
                     : 'border-navy-700 bg-navy-800/50 text-gray-500 hover:border-navy-600'">
              <input type="checkbox"
                     :checked="roleMenus[role.id]?.has(m.key)"
                     @change="toggleMenu(role.id, m.key)"
                     class="accent-primary-500" />
              <i :class="`fa-solid ${m.icon} text-xs`" />
              {{ m.label }}
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, put } = useApi()

const saving = ref<number|null>(null)
const toast  = reactive({ show: false, msg: '', type: 'success' as 'success'|'error' })

// Load roles, all menus definition, and role_menus per role
const { data: roles, pending } = await useAsyncData('roles-data', () => get('/v1/master/roles'), { server: false })
const { data: allMenus }       = await useAsyncData('all-menus',  () => get('/v1/master/menus'), { server: false })

// roleMenus: Map<role_id, Set<menu_key>>
const roleMenus = reactive<Record<number, Set<string>>>({})

// Load menu assignments for each role
if (roles.value) {
  await Promise.all(
    (roles.value as any[]).map(async (r: any) => {
      const keys = await get(`/v1/master/roles/${r.id}/menus`)
      roleMenus[r.id] = new Set(Array.isArray(keys) ? keys : [])
    })
  )
}

// Group menus by group
const menuGroups = computed(() => {
  const groups: Record<string, any[]> = {}
  if (!allMenus.value) return groups
  for (const m of allMenus.value as any[]) {
    if (!groups[m.group]) groups[m.group] = []
    groups[m.group].push(m)
  }
  return groups
})

function showToast(msg: string, type: 'success'|'error' = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => { toast.show = false }, 3000)
}

function toggleMenu(roleId: number, key: string) {
  if (!roleMenus[roleId]) roleMenus[roleId] = new Set()
  if (roleMenus[roleId].has(key)) roleMenus[roleId].delete(key)
  else roleMenus[roleId].add(key)
}

async function saveMenus(roleId: number) {
  saving.value = roleId
  try {
    const menus = Array.from(roleMenus[roleId] || [])
    await put(`/v1/master/roles/${roleId}/menus`, { menus })
    showToast('Hak akses berhasil disimpan.')
  } catch (err: any) {
    showToast(err?.data?.detail || 'Gagal menyimpan.', 'error')
  } finally { saving.value = null }
}
</script>

<style scoped>
.badge { @apply inline-block px-2 py-0.5 rounded text-xs font-medium; }
.badge-blue   { @apply bg-blue-900/50 text-blue-300; }
.badge-yellow { @apply bg-yellow-900/50 text-yellow-300; }
.badge-gray   { @apply bg-gray-800 text-gray-400; }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
