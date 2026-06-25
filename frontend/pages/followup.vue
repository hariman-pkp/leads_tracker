<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-phone-alt text-primary-400 mr-2" />Follow-Up Log</h1>
        <p class="page-subtitle">{{ data?.total || 0 }} catatan — halaman {{ data?.page || 1 }} / {{ data?.total_pages || 1 }}</p>
      </div>
    </div>

    <div class="card mb-5 flex flex-wrap gap-3">
      <input v-model="search" class="form-input w-48" placeholder="🔍 Cari company/catatan..." @input="debouncedFetch" />
      <select v-model="leadFilter" class="form-select w-52 text-xs">
        <option value="">Semua Lead</option>
        <option v-for="l in data?.leads || []" :key="l.lead_id" :value="l.lead_id">
          {{ l.lead_id }} — {{ l.nama_company }}
        </option>
      </select>
    </div>

    <div v-if="pending" class="flex justify-center py-16"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" /></div>

    <div v-else-if="!data?.logs?.length" class="empty-state">
      <i class="fa-solid fa-phone-slash empty-icon" /><div class="empty-text">Belum ada log FU</div>
    </div>

    <div v-else class="space-y-3">
      <div v-for="log in data.logs" :key="log.fu_id"
        class="card-sm flex gap-4">
        <div class="flex-shrink-0 text-center w-14">
          <div class="text-xs font-mono text-gray-400">{{ log.fu_id }}</div>
          <div class="text-xs text-gray-500 mt-1">{{ fmt.tgl(log.tgl_fu) }}</div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap mb-1">
            <NuxtLink :to="`/pipeline/${log.lead_id}`" class="text-sm font-medium text-primary-300 hover:text-primary-200">
              {{ log.nama_company }}
            </NuxtLink>
            <span class="badge-blue text-xs">{{ log.metode_fu }}</span>
            <span :class="log.hasil_fu === 'Interested' ? 'badge-green' : 'badge-gray'" class="text-xs">{{ log.hasil_fu }}</span>
            <span v-if="log.stage_saat_fu" class="badge-purple text-xs">{{ log.stage_saat_fu }}</span>
          </div>
          <p v-if="log.catatan_fu" class="text-sm text-gray-300">{{ log.catatan_fu }}</p>
          <div v-if="log.tgl_fu_berikut" class="text-xs text-yellow-400 mt-1">
            <i class="fa-solid fa-calendar-check mr-1" />Next FU: {{ fmt.tgl(log.tgl_fu_berikut) }}
          </div>
        </div>
        <div class="flex-shrink-0 text-xs text-gray-500">{{ log.sales_owner }}</div>
      </div>

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
const { get } = useApi()
const fmt = useFormat()
const search     = ref('')
const leadFilter = ref('')
const page    = ref(1)
const perPage = ref(10)

const { data, pending, refresh } = await useAsyncData(
  'followup',
  () => get('/v1/followup', { search: search.value, lead_id: leadFilter.value, page: page.value, per_page: perPage.value }),
  { server: false, watch: [leadFilter, page, perPage] }
)

let deb: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(deb); deb = setTimeout(() => { page.value = 1; refresh() }, 400) }
</script>
