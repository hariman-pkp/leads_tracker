<template>
  <div class="max-w-2xl">
    <div class="flex items-center gap-3 mb-5">
      <NuxtLink to="/pipeline" class="btn-ghost btn-sm rounded-lg"><i class="fa-solid fa-arrow-left" /></NuxtLink>
      <div>
        <h1 class="page-title">Tambah Lead Baru</h1>
        <p class="page-subtitle">Isi informasi lead pipeline</p>
      </div>
    </div>
    <div v-if="errMsg" class="mb-4 flex items-center gap-3 bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300">
      <i class="fa-solid fa-circle-exclamation" />
      {{ errMsg }}
    </div>
    <LeadForm :sales-list="salesList" :org-list="orgList" :product-list="productList" @submit="createLead" :loading="loading" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, post } = useApi()
const loading = ref(false)
const errMsg  = ref('')

const { data: salesData } = await useAsyncData(
  'sales-new',
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

async function createLead(form: any) {
  loading.value = true
  errMsg.value  = ''
  try {
    await post('/v1/pipeline', form)
    await navigateTo('/pipeline')
  } catch (err: any) {
    errMsg.value = err?.data?.detail || err?.data?.message || err?.message || 'Gagal membuat lead.'
  } finally {
    loading.value = false
  }
}
</script>
