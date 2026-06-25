<template>
  <input
    ref="inputRef"
    type="text"
    inputmode="numeric"
    :value="displayValue"
    :placeholder="placeholder || '0'"
    :class="inputClass"
    :disabled="disabled"
    :required="required"
    autocomplete="off"
    @focus="onFocus"
    @blur="onBlur"
    @input="onInput"
    @keydown="onKeydown"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue  : number | null | undefined
  placeholder ?: string
  class       ?: string
  disabled    ?: boolean
  required    ?: boolean
  min         ?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: number): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

// Format angka dengan separator ribuan (id-ID: titik sebagai separator)
function formatNumber(n: number): string {
  if (!n && n !== 0) return ''
  return new Intl.NumberFormat('id-ID').format(n)
}

// Strip semua non-digit lalu parse
function parseRaw(s: string): number {
  const clean = s.replace(/\D/g, '')
  return clean === '' ? 0 : parseInt(clean, 10)
}

// Saat tidak fokus: tampil formatted. Saat fokus: tampil angka mentah tanpa separator
const displayValue = computed(() => {
  const v = props.modelValue ?? 0
  if (isFocused.value) {
    return v === 0 ? '' : String(v)
  }
  return v === 0 ? '' : formatNumber(v)
})

function onFocus() {
  isFocused.value = true
  // Pindahkan cursor ke akhir setelah render
  nextTick(() => {
    inputRef.value?.select()
  })
}

function onBlur(e: FocusEvent) {
  isFocused.value = false
  const raw = (e.target as HTMLInputElement).value
  const num = parseRaw(raw)
  emit('update:modelValue', num)
}

function onInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value
  // Hanya izinkan digit dan separator
  const num = parseRaw(raw)
  emit('update:modelValue', num)
}

function onKeydown(e: KeyboardEvent) {
  // Izinkan: digit, backspace, delete, arrow, tab, home, end, ctrl+a/c/v/x
  const allowed = [
    'Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown',
    'Tab','Home','End','Enter',
  ]
  if (allowed.includes(e.key)) return
  if (e.ctrlKey || e.metaKey) return
  // Hanya izinkan digit
  if (!/^\d$/.test(e.key)) e.preventDefault()
}

// Class passthrough
const inputClass = computed(() => props.class ?? 'form-input')
</script>
