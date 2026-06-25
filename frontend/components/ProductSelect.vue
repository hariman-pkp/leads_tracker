<template>
  <div class="relative">
    <input
      :id="inputId"
      ref="inputRef"
      v-model="inputVal"
      :list="listId"
      :placeholder="placeholder"
      :class="inputClass"
      autocomplete="off"
      @input="onInput"
      @change="onInput"
      @blur="onBlur"
    />
    <datalist :id="listId">
      <option v-for="p in products" :key="p.kode" :value="p.nama">
        {{ p.kode }} — {{ p.nama }}
      </option>
    </datalist>
    <!-- Badge kategori jika produk dipilih dari master -->
    <span v-if="matchedKategori"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-navy-700 text-primary-400 pointer-events-none">
      {{ matchedKategori }}
    </span>
  </div>
</template>

<script setup lang="ts">
interface Product {
  kode: string
  nama: string
  kategori?: string
}

const props = withDefaults(defineProps<{
  modelValue?: string
  products?: Product[]
  placeholder?: string
  inputClass?: string
  inputId?: string
}>(), {
  products:    () => [],
  placeholder: 'Pilih atau ketik produk...',
  inputClass:  'form-input',
  inputId:     undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
}>()

const listId  = `prod-list-${Math.random().toString(36).slice(2)}`
const inputRef = ref<HTMLInputElement | null>(null)

const inputVal = ref(props.modelValue ?? '')

watch(() => props.modelValue, (v) => {
  if (v !== inputVal.value) inputVal.value = v ?? ''
})

function onInput() {
  emit('update:modelValue', inputVal.value)
}

function onBlur() {
  // Jika yang diketik cocok dengan salah satu nama produk (case-insensitive), normalize
  const match = props.products.find(
    p => p.nama.toLowerCase() === inputVal.value.toLowerCase()
  )
  if (match && match.nama !== inputVal.value) {
    inputVal.value = match.nama
    emit('update:modelValue', match.nama)
  }
}

const matchedKategori = computed(() => {
  if (!inputVal.value) return ''
  const match = props.products.find(
    p => p.nama.toLowerCase() === inputVal.value.toLowerCase()
  )
  return match?.kategori ?? ''
})
</script>
