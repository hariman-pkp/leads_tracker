<template>
  <div>
    <div class="page-header mb-6">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-broom text-orange-400 mr-2" />Data Cleansing</h1>
        <p class="page-subtitle">Hapus data operasional dan kembalikan sistem ke kondisi awal</p>
      </div>
      <button @click="openLogs" class="btn-secondary btn-sm">
        <i class="fa-solid fa-clock-rotate-left mr-1.5" />Riwayat Cleansing
      </button>
    </div>

    <!-- Warning banner -->
    <div class="flex items-start gap-3 p-4 rounded-lg border border-red-700/50 bg-red-900/10 mb-6">
      <i class="fa-solid fa-triangle-exclamation text-red-400 text-xl flex-shrink-0 mt-0.5" />
      <div>
        <div class="text-sm font-semibold text-red-300 mb-1">Tindakan ini tidak dapat dibatalkan</div>
        <div class="text-xs text-red-400/80">
          Seluruh data bisnis akan dihapus secara permanen. Hanya data konfigurasi dan akun admin yang akan dipertahankan.
          Pastikan sudah melakukan backup sebelum melanjutkan.
        </div>
      </div>
    </div>

    <!-- Preview data -->
    <div v-if="loadingPreview" class="flex justify-center py-16">
      <i class="fa-solid fa-circle-notch fa-spin text-2xl text-primary-400" />
    </div>

    <template v-else-if="preview">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

        <!-- Data bisnis -->
        <div class="card lg:col-span-2">
          <div class="flex items-center justify-between mb-3">
            <div class="section-title text-red-400 mb-0">
              <i class="fa-solid fa-trash-can mr-1.5" />Data yang Akan Dihapus
            </div>
            <span class="text-xs text-gray-500">{{ businessAll.length }} tabel</span>
          </div>
          <div class="space-y-1.5 mb-4">
            <div v-for="t in businessPage" :key="t.table"
                 class="flex items-center justify-between py-1.5 px-3 rounded-lg bg-red-900/10 border border-red-900/20">
              <span class="text-xs font-mono text-gray-300">{{ t.table }}</span>
              <span class="text-xs font-bold" :class="t.count > 0 ? 'text-red-400' : 'text-gray-600'">
                {{ fmt.num(t.count) }} record
              </span>
            </div>
          </div>

          <!-- Pagination bisnis -->
          <div v-if="businessTotalPages > 1" class="flex items-center justify-between pt-2 border-t border-navy-700">
            <button @click="bizPage--" :disabled="bizPage === 1"
                    class="text-xs px-2 py-1 rounded border border-navy-600 text-gray-400 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <i class="fa-solid fa-chevron-left" />
            </button>
            <span class="text-xs text-gray-500">{{ bizPage }} / {{ businessTotalPages }}</span>
            <button @click="bizPage++" :disabled="bizPage === businessTotalPages"
                    class="text-xs px-2 py-1 rounded border border-navy-600 text-gray-400 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <i class="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>

        <!-- Config & preserve -->
        <div class="space-y-4">
          <!-- Dipertahankan -->
          <div class="card border border-emerald-800/40">
            <div class="section-title text-emerald-400 mb-3">
              <i class="fa-solid fa-shield-check mr-1.5" />Selalu Dipertahankan
            </div>
            <div class="space-y-1">
              <div v-for="t in ['roles', 'role_menus', 'users (admin)']" :key="t"
                   class="flex items-center gap-2 text-xs text-emerald-300/80">
                <i class="fa-solid fa-check text-emerald-500 w-3" />{{ t }}
              </div>
            </div>
          </div>

          <!-- Config checklist -->
          <div class="card border border-navy-700">
            <div class="flex items-center justify-between mb-3">
              <div class="section-title mb-0 text-gray-300">
                <i class="fa-solid fa-sliders mr-1.5 text-blue-400" />Data Konfigurasi
              </div>
              <div class="flex gap-1.5">
                <button @click="selectAllConfig" class="text-xs px-2 py-0.5 rounded border border-yellow-800 text-yellow-400 hover:bg-yellow-900/20 transition-colors">
                  Hapus Semua
                </button>
                <button @click="deleteConfig = []" class="text-xs px-2 py-0.5 rounded border border-navy-600 text-gray-500 hover:bg-navy-700 transition-colors">
                  Reset
                </button>
              </div>
            </div>
            <div class="space-y-1.5">
              <label v-for="t in configPage" :key="t.table"
                     class="flex items-center justify-between gap-2 cursor-pointer group py-1 px-1.5 rounded-lg transition-colors"
                     :class="deleteConfig.includes(t.table) ? 'bg-yellow-900/10 border border-yellow-900/30' : 'hover:bg-navy-800/40 border border-transparent'">
                <div class="flex items-center gap-2 min-w-0">
                  <input type="checkbox" :value="t.table" v-model="deleteConfig"
                         class="flex-shrink-0 accent-yellow-500 w-3.5 h-3.5" />
                  <span class="text-xs font-mono"
                        :class="deleteConfig.includes(t.table) ? 'text-yellow-300' : 'text-gray-400 group-hover:text-gray-300'">
                    {{ t.table }}
                  </span>
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="text-xs" :class="deleteConfig.includes(t.table) ? 'text-yellow-500' : 'text-gray-600'">
                    {{ fmt.num(t.count) }}
                  </span>
                  <span v-if="deleteConfig.includes(t.table)" class="text-xs text-yellow-600">akan dihapus</span>
                  <span v-else class="text-xs text-emerald-700">dipertahankan</span>
                </div>
              </label>
            </div>

            <!-- Pagination config -->
            <div v-if="configTotalPages > 1" class="flex items-center justify-between pt-2 mt-2 border-t border-navy-700">
              <button @click="cfgPage--" :disabled="cfgPage === 1"
                      class="text-xs px-2 py-1 rounded border border-navy-600 text-gray-400 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <i class="fa-solid fa-chevron-left" />
              </button>
              <span class="text-xs text-gray-500">{{ cfgPage }} / {{ configTotalPages }}</span>
              <button @click="cfgPage++" :disabled="cfgPage === configTotalPages"
                      class="text-xs px-2 py-1 rounded border border-navy-600 text-gray-400 hover:bg-navy-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                <i class="fa-solid fa-chevron-right" />
              </button>
            </div>

            <div v-if="deleteConfig.length" class="mt-2 pt-2 border-t border-navy-700 text-xs text-yellow-500">
              <i class="fa-solid fa-triangle-exclamation mr-1" />{{ deleteConfig.length }} tabel akan dihapus
            </div>
          </div>
        </div>
      </div>

      <!-- Konfirmasi form -->
      <div class="card border border-red-800/50 max-w-lg">
        <div class="section-title text-red-400 mb-4">
          <i class="fa-solid fa-key mr-1.5" />Konfirmasi Reset
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Ketik <span class="font-mono font-bold text-red-300">RESET</span> untuk melanjutkan</label>
            <input v-model="confirmText" class="form-input w-full font-mono tracking-widest"
                   placeholder="RESET" autocomplete="off" spellcheck="false" />
          </div>
          <div>
            <label class="block text-xs text-gray-400 mb-1.5">Password admin Anda</label>
            <input v-model="adminPassword" type="password" class="form-input w-full"
                   placeholder="••••••••" autocomplete="current-password" />
          </div>

          <button @click="doReset"
                  :disabled="confirmText !== 'RESET' || !adminPassword || resetting"
                  class="w-full py-2.5 rounded-lg font-semibold text-sm transition-all
                         disabled:opacity-40 disabled:cursor-not-allowed
                         enabled:bg-red-700 enabled:hover:bg-red-600 enabled:text-white">
            <i :class="`fa-solid ${resetting ? 'fa-circle-notch fa-spin' : 'fa-trash-can'} mr-2`" />
            {{ resetting ? 'Menghapus data...' : 'Reset Semua Data' }}
          </button>
        </div>
      </div>
    </template>

    <!-- Log modal -->
    <div v-if="showLogs" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="card w-full max-w-2xl border border-navy-600 flex flex-col" style="max-height:80vh">
        <div class="flex items-center justify-between mb-4 flex-shrink-0">
          <div class="section-title mb-0">
            <i class="fa-solid fa-clock-rotate-left mr-1.5 text-gray-400" />Riwayat Cleansing
          </div>
          <div class="flex items-center gap-2">
            <button @click="loadLogs" class="btn-secondary btn-sm" :disabled="loadingLogs">
              <i :class="`fa-solid fa-rotate ${loadingLogs ? 'fa-spin' : ''}`" />
            </button>
            <button @click="showLogs = false" class="btn-secondary btn-sm">
              <i class="fa-solid fa-xmark" />
            </button>
          </div>
        </div>

        <div class="overflow-y-auto flex-1">
          <div v-if="loadingLogs" class="flex justify-center py-10">
            <i class="fa-solid fa-circle-notch fa-spin text-primary-400 text-2xl" />
          </div>
          <div v-else-if="!logs.length" class="text-center py-10 text-sm text-gray-600">
            <i class="fa-solid fa-inbox text-3xl mb-3 block text-gray-700" />
            Belum ada riwayat cleansing
          </div>
          <div v-else class="space-y-3">
            <div v-for="log in logSlice" :key="log.id"
                 class="p-3 rounded-lg bg-navy-800/40 border border-navy-700">
              <div class="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div class="text-sm font-medium text-gray-200">
                    <i class="fa-solid fa-user-shield text-orange-400 mr-1.5" />{{ log.executed_by }}
                  </div>
                  <div class="text-xs text-gray-500 mt-0.5">{{ fmt.datetime(log.executed_at) }}</div>
                </div>
                <div class="text-right flex-shrink-0">
                  <div class="text-sm font-bold text-red-400">-{{ fmt.num(log.total_deleted) }} record</div>
                </div>
              </div>
              <div class="grid grid-cols-3 gap-x-4 gap-y-0.5 pt-2 border-t border-navy-700">
                <div v-for="(cnt, tbl) in log.deleted" :key="tbl"
                     class="flex justify-between text-xs" v-show="cnt > 0">
                  <span class="font-mono text-gray-500 truncate">{{ tbl }}</span>
                  <span class="text-red-400/80 ml-1 flex-shrink-0">{{ fmt.num(cnt) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="logTotalPages > 1" class="flex items-center justify-between px-1 pt-3 mt-3 border-t border-navy-700 flex-shrink-0">
          <span class="text-xs text-gray-500">{{ logs.length }} riwayat · halaman {{ logPage }}/{{ logTotalPages }}</span>
          <div class="flex gap-1">
            <button @click="logPage--" :disabled="logPage <= 1"
                    class="btn-secondary btn-sm" :class="logPage <= 1 ? 'opacity-40 cursor-not-allowed' : ''">
              <i class="fa-solid fa-chevron-left text-xs" />
            </button>
            <button @click="logPage++" :disabled="logPage >= logTotalPages"
                    class="btn-secondary btn-sm" :class="logPage >= logTotalPages ? 'opacity-40 cursor-not-allowed' : ''">
              <i class="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Result modal -->
    <div v-if="result" class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="card max-w-md w-full border border-emerald-700/50">
        <div class="text-center mb-5">
          <i class="fa-solid fa-circle-check text-emerald-400 text-4xl mb-3 block" />
          <div class="text-lg font-bold text-emerald-300">Reset Berhasil</div>
          <div class="text-xs text-gray-500 mt-1">Data operasional telah dihapus</div>
        </div>

        <div class="space-y-1 mb-5 max-h-60 overflow-y-auto">
          <div v-for="(cnt, tbl) in result.deleted" :key="tbl"
               class="flex justify-between text-xs py-1 border-b border-navy-800">
            <span class="font-mono text-gray-400">{{ tbl }}</span>
            <span class="text-red-400 font-semibold">-{{ fmt.num(cnt) }}</span>
          </div>
        </div>

        <button @click="handleDone" class="w-full btn-primary">
          <i class="fa-solid fa-arrow-right-from-bracket mr-2" />Selesai & Logout
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, post } = useApi()
const fmt  = useFormat()
const auth = useAuthStore()
const router = useRouter()

// Hanya admin
if ((auth.user?.role_id ?? 0) !== 1) {
  await navigateTo('/')
}

const loadingPreview = ref(true)
const preview  = ref<any>(null)
const deleteConfig = ref<string[]>([])

const BIZ_PER_PAGE = 13
const CFG_PER_PAGE = 10

// Pagination — bisnis
const bizPage = ref(1)
const businessAll = computed(() => preview.value?.business ?? [])
const businessTotalPages = computed(() => Math.max(1, Math.ceil(businessAll.value.length / BIZ_PER_PAGE)))
const businessPage = computed(() => {
  const start = (bizPage.value - 1) * BIZ_PER_PAGE
  return businessAll.value.slice(start, start + BIZ_PER_PAGE)
})

// Pagination — config
const cfgPage = ref(1)
const configAll = computed(() => {
  const cfg = preview.value?.config ?? []
  const users = preview.value?.users ? [{ table: 'users (non-admin)', count: preview.value.users.will_delete }] : []
  return [...cfg, ...users]
})
const configTotalPages = computed(() => Math.max(1, Math.ceil(configAll.value.length / CFG_PER_PAGE)))
const configPage = computed(() => {
  const start = (cfgPage.value - 1) * CFG_PER_PAGE
  return configAll.value.slice(start, start + CFG_PER_PAGE)
})

function selectAllConfig() {
  deleteConfig.value = (preview.value?.config ?? []).map((t: any) => t.table)
}
const confirmText     = ref('')
const adminPassword   = ref('')
const resetting = ref(false)
const result    = ref<any>(null)

const logs        = ref<any[]>([])
const loadingLogs = ref(false)
const showLogs    = ref(false)
const logPage     = ref(1)
const LOG_PER_PAGE = 5
const logTotalPages = computed(() => Math.ceil(logs.value.length / LOG_PER_PAGE) || 1)
const logSlice      = computed(() => logs.value.slice((logPage.value - 1) * LOG_PER_PAGE, logPage.value * LOG_PER_PAGE))

async function loadLogs() {
  loadingLogs.value = true
  logPage.value = 1
  try { const r = await get('/v1/admin/cleansing/logs'); logs.value = r.logs ?? [] }
  catch { }
  finally { loadingLogs.value = false }
}

function openLogs() {
  showLogs.value = true
  loadLogs()
}

onMounted(async () => {
  try { preview.value = await get('/v1/admin/cleansing/preview') }
  catch { }
  finally { loadingPreview.value = false }
})

async function doReset() {
  if (confirmText.value !== 'RESET' || !adminPassword.value) return
  resetting.value = true
  try {
    result.value = await post('/v1/admin/cleansing/reset', {
      confirm_text: confirmText.value,
      password: adminPassword.value,
      delete_config: deleteConfig.value,
    })
  } catch (e: any) {
    alert(e?.data?.detail || 'Reset gagal. Periksa password Anda.')
  } finally {
    resetting.value = false
  }
}

async function handleDone() {
  auth.logout?.()
  await router.push('/login')
}
</script>
