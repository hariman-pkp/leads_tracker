<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-5">
      <NuxtLink :to="`/pipeline/${route.params.id}`" class="btn-ghost btn-sm rounded-lg">
        <i class="fa-solid fa-arrow-left" />
      </NuxtLink>
      <div>
        <h1 class="page-title">Edit Lead</h1>
        <p class="page-subtitle">{{ leadData?.lead?.lead_id || leadData?.lead_id }}</p>
      </div>
    </div>
    <!-- Error alert -->
    <div v-if="errMsg" class="mb-4 flex items-center gap-3 bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300">
      <i class="fa-solid fa-circle-exclamation" />
      {{ errMsg }}
    </div>

    <div v-if="leadError" class="card text-center text-red-400 py-10">
      <i class="fa-solid fa-triangle-exclamation text-3xl mb-3" />
      <div>Lead tidak ditemukan.</div>
      <NuxtLink to="/pipeline" class="btn-secondary btn-sm mt-4">← Kembali ke Pipeline</NuxtLink>
    </div>

    <LeadForm
      v-else-if="leadData"
      :initial="leadData?.lead ?? leadData"
      :sales-list="salesList"
      :org-list="orgList"
      :product-list="productList"
      @submit="updateLead"
      :loading="loading"
    />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const route   = useRoute()
const { get, put } = useApi()
const loading = ref(false)
const errMsg  = ref('')
const leadId  = route.params.id as string

const { data: leadData, error: leadError } = await useAsyncData(
  `lead-edit-${leadId}`,
  () => get(`/v1/pipeline/${leadId}`),
  { server: false }
)
const { data: salesData } = await useAsyncData(
  'sales-edit',
  () => get('/v1/master/sales').catch(() => []),
  { server: false }
)
const salesList = computed(() =>
  Array.isArray(salesData.value) ? salesData.value.map((s: any) => s.nama) : []
)

const orgList     = ref<{kode: string, nama: string}[]>([])
const productList = ref<{kode: string, nama: string, kategori?: string}[]>([])
onMounted(async () => {
  try { orgList.value     = await get('/v1/master/organizations/dropdown') } catch {}
  try { productList.value = await get('/v1/master/products/dropdown') } catch {}
})

async function updateLead(form: any) {
  loading.value = true
  errMsg.value  = ''
  try {
    await put(`/v1/pipeline/${leadId}`, form)
    // Hapus cache detail supaya halaman detail load data terbaru
    clearNuxtData(`lead-${leadId}`)
    await navigateTo(`/pipeline/${leadId}`)
  } catch (err: any) {
    errMsg.value = err?.data?.detail || err?.data?.message || err?.message || 'Gagal menyimpan perubahan.'
    console.error('[edit lead]', err)
  } finally {
    loading.value = false
  }
}
</script>
