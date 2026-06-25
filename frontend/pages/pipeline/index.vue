<template>
  <div>
    <!-- Toast Notification -->
    <Transition name="toast">
      <div v-if="toast.show"
           :class="toast.type === 'success' ? 'bg-green-800 border-green-600' : 'bg-red-900 border-red-600'"
           class="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-green-400' : 'fa-solid fa-circle-exclamation text-red-400'" />
        {{ toast.msg }}
      </div>
    </Transition>

    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-funnel-dollar text-primary-400 mr-2" />Pipeline</h1>
        <p class="page-subtitle">{{ data?.total || 0 }} leads ditemukan — halaman {{ data?.page || 1 }} / {{ data?.total_pages || 1 }}</p>
      </div>
      <NuxtLink to="/pipeline/new" class="btn-primary">
        <i class="fa-solid fa-plus" />Tambah Lead
      </NuxtLink>
    </div>

    <!-- Filter bar -->
    <div class="card mb-5">
      <div class="flex flex-wrap gap-3">
        <input v-model="filters.search" class="form-input w-48" placeholder="🔍 Cari company..." @input="debouncedFetch" />
        <select v-model="filters.stage" class="form-select w-40" @change="fetchData">
          <option value="">Semua Stage</option>
          <option v-for="s in stages" :key="s">{{ s }}</option>
        </select>
        <select v-model="filters.segmen" class="form-select w-40" @change="fetchData">
          <option value="">Semua Segmen</option>
          <option v-for="s in segmens" :key="s">{{ s }}</option>
        </select>
        <select v-model="filters.sales" class="form-select w-40" @change="fetchData">
          <option value="">Semua Sales</option>
          <option v-for="s in salesList" :key="s.id" :value="s.nama">{{ s.nama }}</option>
        </select>
        <select v-model="filters.organisasi" class="form-select w-44" @change="fetchData">
          <option value="">Semua Organisasi</option>
          <option v-for="o in orgList" :key="o.kode" :value="o.kode">{{ o.kode }} — {{ o.nama }}</option>
        </select>
        <select v-model="filters.product" class="form-select w-44" @change="fetchData">
          <option value="">Semua Produk</option>
          <option v-for="p in productList" :key="p.kode" :value="p.nama">{{ p.nama }}</option>
        </select>
        <button @click="resetFilters" class="btn-secondary btn-sm ml-auto">
          <i class="fa-solid fa-xmark" />Reset
        </button>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <div v-else-if="data?.leads?.length === 0" class="empty-state">
      <i class="fa-solid fa-inbox empty-icon" />
      <div class="empty-text">Tidak ada lead ditemukan</div>
    </div>

    <div v-else class="card overflow-x-auto">
      <table class="tbl">
        <thead>
          <tr>
            <th>Company</th>
            <th>Produk</th>
            <th>Stage</th>
            <th>Prioritas</th>
            <th class="text-right">Propose Value</th>
            <th>Sales</th>
            <th>Organisasi</th>
            <th>Next FU</th>
            <th>Stale</th>
            <th class="text-center">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="l in data?.leads" :key="l.lead_id">
            <td>
              <NuxtLink :to="`/pipeline/${l.lead_id}`" class="font-medium text-primary-300 hover:text-primary-200">
                {{ l.nama_company }}
              </NuxtLink>
              <div class="text-xs text-gray-500">{{ l.lead_id }}</div>
            </td>
            <td class="text-gray-300 max-w-32 truncate">{{ l.product || '—' }}</td>
            <td><span :class="fmt.stageClass(l.stage)">{{ l.stage }}</span></td>
            <td><span :class="fmt.priorityClass(l.prioritas)">{{ l.prioritas }}</span></td>
            <td class="text-right font-medium text-primary-200">{{ fmt.rupiah(l.propose_value) }}</td>
            <td class="text-gray-400 text-xs">{{ l.sales_owner || '—' }}</td>
            <td class="text-xs">
              <span v-if="l.organisasi" class="font-mono text-primary-300 bg-navy-800 px-1.5 py-0.5 rounded text-[11px]">
                {{ l.organisasi }}
              </span>
              <span v-else class="text-gray-600">—</span>
            </td>
            <td class="text-xs" :class="isOverdue(l.next_fu_date) ? 'text-red-400' : 'text-gray-400'">
              {{ fmt.tgl(l.next_fu_date) }}
            </td>
            <td>
              <span v-if="l.stale_flag && l.stale_flag !== 'OK'" :class="fmt.staleClass(l.stale_flag)" class="text-xs">
                {{ l.stale_flag }}
              </span>
              <span v-else class="text-gray-600 text-xs">—</span>
            </td>
            <td class="text-center">
              <div class="flex items-center justify-center gap-1">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="btn-ghost btn-xs rounded" title="Detail">
                  <i class="fa-solid fa-eye text-xs" />
                </NuxtLink>
                <NuxtLink :to="`/pipeline/${l.lead_id}/edit`" class="btn-ghost btn-xs rounded" title="Edit">
                  <i class="fa-solid fa-pen text-xs" />
                </NuxtLink>
                <button @click="deleteLead(l.lead_id, l.nama_company)"
                        :disabled="deleting === l.lead_id"
                        class="btn-ghost btn-xs rounded text-red-400 hover:text-red-300 disabled:opacity-50" title="Hapus">
                  <i :class="deleting === l.lead_id ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-trash'" class="text-xs" />
                </button>
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
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get, del } = useApi()
const fmt = useFormat()

const stages  = ['New','In Progress','Demo Scheduled','Proposal Sent','Negotiation','Won','On Hold','Lost']
const { segmens } = useSegmen()

const filters     = reactive({ search: '', stage: '', segmen: '', sales: '', organisasi: '', product: '' })
const orgList     = ref<{kode: string, nama: string}[]>([])
const productList = ref<{kode: string, nama: string}[]>([])
const salesList   = ref<{id: number, nama: string}[]>([])
const toast    = reactive({ show: false, msg: '', type: 'success' as 'success'|'error' })
const deleting = ref<string | null>(null)
const page    = ref(1)
const perPage = ref(10)

const { data, pending, refresh } = await useAsyncData('pipeline', () =>
  get('/v1/pipeline', { ...filters, page: page.value, per_page: perPage.value }),
  { server: false }
)

watch([page, perPage], () => refresh())

function showToast(msg: string, type: 'success'|'error' = 'success') {
  toast.msg  = msg
  toast.type = type
  toast.show = true
  setTimeout(() => { toast.show = false }, 3500)
}

async function fetchData() {
  page.value = 1
  await refresh()
}

let debTimer: ReturnType<typeof setTimeout>
function debouncedFetch() {
  clearTimeout(debTimer)
  debTimer = setTimeout(() => fetchData(), 400)
}

function resetFilters() {
  filters.search = filters.stage = filters.segmen = filters.sales = filters.organisasi = filters.product = ''
  fetchData()
}

function isOverdue(d: string | null) {
  if (!d) return false
  return d < new Date().toISOString().slice(0,10)
}

async function deleteLead(leadId: string, nama: string) {
  if (!confirm(`Hapus lead "${nama}"?\nData follow-up dan kontak terkait juga akan dihapus.`)) return
  deleting.value = leadId
  try {
    await del(`/v1/pipeline/${leadId}`)
    showToast(`Lead "${nama}" berhasil dihapus.`, 'success')
    await refresh()
  } catch (err: any) {
    const msg = err?.data?.detail || err?.data?.message || err?.message || 'Gagal menghapus lead.'
    showToast(msg, 'error')
  } finally {
    deleting.value = null
  }
}

onMounted(async () => {
  try { orgList.value     = await get('/v1/master/organizations/dropdown') || [] } catch {}
  try { productList.value = await get('/v1/master/products/dropdown') || [] } catch {}
  try {
    const all = await get('/v1/master/sales') || []
    salesList.value = (Array.isArray(all) ? all : []).filter((u: any) => u.is_active == 1 || u.is_active === true)
  } catch {}
})
</script>

<style scoped>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translateX(20px); }
</style>
