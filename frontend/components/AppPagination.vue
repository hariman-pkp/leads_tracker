<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between gap-4 mt-4 px-1">
    <!-- Info -->
    <div class="text-xs text-gray-500">
      {{ from }}–{{ to }} dari {{ total }} data
    </div>

    <!-- Controls -->
    <div class="flex items-center gap-1">
      <!-- First -->
      <button @click="go(1)" :disabled="page === 1" class="pg-btn">
        <i class="fa-solid fa-angles-left text-[10px]" />
      </button>
      <!-- Prev -->
      <button @click="go(page - 1)" :disabled="page === 1" class="pg-btn">
        <i class="fa-solid fa-angle-left text-[10px]" />
      </button>

      <!-- Page numbers -->
      <template v-for="p in pages" :key="p">
        <span v-if="p === '...'" class="px-1 text-gray-600 text-xs select-none">…</span>
        <button v-else @click="go(p as number)"
                :class="p === page ? 'pg-btn-active' : 'pg-btn'">
          {{ p }}
        </button>
      </template>

      <!-- Next -->
      <button @click="go(page + 1)" :disabled="page === totalPages" class="pg-btn">
        <i class="fa-solid fa-angle-right text-[10px]" />
      </button>
      <!-- Last -->
      <button @click="go(totalPages)" :disabled="page === totalPages" class="pg-btn">
        <i class="fa-solid fa-angles-right text-[10px]" />
      </button>
    </div>

    <!-- Per page selector -->
    <div class="flex items-center gap-2 text-xs text-gray-500">
      <span>Per halaman</span>
      <select :value="perPage" @change="changePerPage" class="form-select text-xs py-1 w-16">
        <option v-for="n in perPageOptions" :key="n" :value="n">{{ n }}</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: number
  perPage: number
  total: number
  totalPages: number
  perPageOptions?: number[]
}>()

const emit = defineEmits<{
  (e: 'update:page', v: number): void
  (e: 'update:perPage', v: number): void
}>()

const options = computed(() => props.perPageOptions ?? [10, 20, 25, 50])

const from = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.perPage + 1)
const to   = computed(() => Math.min(props.page * props.perPage, props.total))

function go(p: number) {
  if (p < 1 || p > props.totalPages || p === props.page) return
  emit('update:page', p)
}

function changePerPage(e: Event) {
  emit('update:perPage', Number((e.target as HTMLSelectElement).value))
  emit('update:page', 1)
}

const pages = computed(() => {
  const total = props.totalPages
  const cur   = props.page
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const result: (number | string)[] = [1]
  if (cur > 3) result.push('...')
  for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) result.push(p)
  if (cur < total - 2) result.push('...')
  result.push(total)
  return result
})
</script>

<style scoped>
.pg-btn {
  @apply flex items-center justify-center w-7 h-7 rounded text-xs text-gray-400
         hover:bg-gray-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed
         transition-colors;
}
.pg-btn-active {
  @apply flex items-center justify-center w-7 h-7 rounded text-xs font-bold
         bg-primary-600 text-white;
}
</style>
