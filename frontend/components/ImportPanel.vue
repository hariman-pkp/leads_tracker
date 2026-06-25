<template>
  <div>

    <!-- ── SUCCESS STATE ───────────────────────────────────────────────── -->
    <Transition name="slide">
      <div v-if="result" class="space-y-4">

        <!-- Result card -->
        <div class="card border"
             :class="hasError ? 'border-red-700/50' : 'border-emerald-700/40'">

          <!-- Header -->
          <div class="flex items-center gap-4 mb-5">
            <div class="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                 :class="hasError ? 'bg-red-900/40' : 'bg-emerald-900/40'">
              <i class="text-2xl" :class="hasError ? 'fa-solid fa-circle-exclamation text-red-400' : 'fa-solid fa-circle-check text-emerald-400'" />
            </div>
            <div>
              <div class="font-semibold text-lg" :class="hasError ? 'text-red-300' : 'text-emerald-300'">
                {{ hasError ? 'Import Selesai dengan Peringatan' : 'Import Berhasil!' }}
              </div>
              <div class="text-xs text-gray-500 mt-0.5">{{ label }} · {{ new Date().toLocaleString('id-ID') }}</div>
            </div>
          </div>

          <!-- Stats -->
          <div class="grid grid-cols-3 gap-3 mb-5">
            <div class="rounded-xl p-4 text-center border bg-emerald-900/20 border-emerald-800/50">
              <div class="text-3xl font-bold text-emerald-400">{{ result.imported }}</div>
              <div class="text-xs text-emerald-600 mt-1">Data Baru</div>
            </div>
            <div class="rounded-xl p-4 text-center border bg-blue-900/20 border-blue-800/50">
              <div class="text-3xl font-bold text-blue-400">{{ result.updated }}</div>
              <div class="text-xs text-blue-600 mt-1">Diperbarui</div>
            </div>
            <div class="rounded-xl p-4 text-center border"
                 :class="result.skipped > 0 ? 'bg-red-900/20 border-red-800/50' : 'bg-navy-800/40 border-navy-700'">
              <div class="text-3xl font-bold" :class="result.skipped > 0 ? 'text-red-400' : 'text-gray-600'">{{ result.skipped }}</div>
              <div class="text-xs mt-1" :class="result.skipped > 0 ? 'text-red-600' : 'text-gray-600'">Dilewati</div>
            </div>
          </div>

          <!-- Sync info invoice -->
          <div v-if="result.synced_months != null"
               class="flex items-center gap-3 bg-emerald-900/20 border border-emerald-700/40 rounded-xl px-4 py-3 mb-4 text-xs text-emerald-300">
            <i class="fa-solid fa-rotate text-emerald-400 text-lg flex-shrink-0" />
            <div>
              <div class="font-medium">Revenue Tracker otomatis diperbarui</div>
              <div class="text-emerald-400/70 mt-0.5">
                {{ result.synced_months }} termin bulanan & {{ result.synced_projects }} project di-recalculate
              </div>
            </div>
          </div>

          <!-- Errors -->
          <div v-if="result.errors?.length" class="space-y-1 mb-4">
            <div class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2">
              Detail Error ({{ result.errors.length }}):
            </div>
            <div v-for="err in result.errors" :key="err"
                 class="flex items-start gap-2 text-xs text-red-300 bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-1.5">
              <i class="fa-solid fa-circle-exclamation text-red-500 mt-0.5 flex-shrink-0" />
              {{ err }}
            </div>
          </div>

          <!-- CTAs -->
          <div class="flex items-center gap-3 pt-4 border-t border-navy-800">
            <button @click="resetForm" class="btn-primary">
              <i class="fa-solid fa-arrow-up-from-bracket" />Upload File Lain
            </button>
            <NuxtLink v-if="targetUrl" :to="targetUrl"
                      class="btn-secondary">
              <i :class="`fa-solid ${targetIcon}`" />Lihat {{ targetLabel }}
            </NuxtLink>
          </div>
        </div>

      </div>
    </Transition>

    <!-- ── UPLOAD FORM (hidden after success) ─────────────────────────── -->
    <div v-if="!result">

    <!-- Header card -->
    <div class="card mb-5">
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <div :class="`w-8 h-8 rounded-lg bg-${color}-900/40 flex items-center justify-center`">
              <i :class="`fa-solid ${icon} text-${color}-400 text-sm`" />
            </div>
            <h3 class="font-semibold text-gray-100">{{ label }}</h3>
          </div>
          <p class="text-sm text-gray-500">{{ description }}</p>
        </div>
        <!-- Download template -->
        <button @click="downloadTemplate"
                :disabled="downloading"
                class="btn-secondary btn-sm flex-shrink-0">
          <i :class="downloading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-download'" />
          Download Template CSV
        </button>
      </div>
    </div>

    <!-- Drop zone -->
    <div class="card mb-5">
      <div class="section-title mb-4"><i class="fa-solid fa-file-csv mr-1.5 text-primary-400" />Pilih File CSV</div>

      <div
        @dragover.prevent="dragging = true"
        @dragleave.prevent="dragging = false"
        @drop.prevent="onDrop"
        :class="[
          'border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer',
          dragging
            ? 'border-primary-400 bg-primary-900/20'
            : file
              ? 'border-emerald-600 bg-emerald-900/10'
              : 'border-navy-600 hover:border-navy-500 hover:bg-navy-800/40',
        ]"
        @click="fileInput?.click()"
      >
        <input ref="fileInput" type="file" accept=".csv,.txt" class="hidden" @change="onFileChange" />
        <div v-if="!file">
          <i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-600 mb-3 block" />
          <p class="text-gray-400 font-medium">Drag & drop file CSV ke sini</p>
          <p class="text-gray-600 text-sm mt-1">atau klik untuk memilih file</p>
          <p class="text-gray-700 text-xs mt-2">Format: .csv · Maks. 10MB</p>
        </div>
        <div v-else class="flex flex-col items-center gap-2">
          <i class="fa-solid fa-file-csv text-4xl text-emerald-400 mb-1" />
          <p class="text-emerald-300 font-semibold">{{ file.name }}</p>
          <p class="text-gray-500 text-sm">{{ formatSize(file.size) }} · {{ previewRows.length }} baris data</p>
          <button type="button" @click.stop="clearFile"
                  class="mt-1 text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            <i class="fa-solid fa-xmark" />Hapus file
          </button>
        </div>
      </div>

      <!-- Info slot -->
      <slot name="info" />

      <!-- CSV Preview -->
      <div v-if="previewRows.length" class="mt-5">
        <div class="flex items-center justify-between mb-2">
          <p class="text-xs text-gray-500 font-medium uppercase tracking-wider">
            Preview ({{ previewRows.length > 5 ? '5 dari' : '' }} {{ previewRows.length }} baris)
          </p>
          <span class="text-xs text-gray-600">{{ csvHeaders.length }} kolom</span>
        </div>
        <div class="overflow-x-auto rounded-lg border border-navy-700">
          <table class="w-full text-xs">
            <thead>
              <tr class="bg-navy-800">
                <th v-for="col in previewCols" :key="col.key"
                    class="px-3 py-2 text-left text-gray-400 font-medium whitespace-nowrap border-b border-navy-700">
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in previewRows.slice(0,5)" :key="i"
                  class="border-b border-navy-800/60 last:border-0 hover:bg-navy-800/30">
                <td v-for="col in previewCols" :key="col.key"
                    class="px-3 py-1.5 text-gray-300 whitespace-nowrap max-w-32 truncate">
                  {{ row[col.key] || '—' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Options + Upload -->
    <div class="card mb-5">
      <div class="section-title mb-4"><i class="fa-solid fa-sliders mr-1.5" />Opsi Import</div>

      <!-- Danger: clear first -->
      <label class="flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all mb-4"
             :class="clearFirst
               ? 'border-red-700/70 bg-red-900/20'
               : 'border-navy-700 hover:border-navy-600 bg-navy-800/30'">
        <input type="checkbox" v-model="clearFirst" class="mt-0.5 accent-red-500 w-4 h-4 flex-shrink-0" />
        <div>
          <div class="text-sm font-medium" :class="clearFirst ? 'text-red-300' : 'text-gray-300'">
            <i class="fa-solid fa-triangle-exclamation mr-1" :class="clearFirst ? 'text-red-400' : 'text-gray-600'" />
            Hapus data existing sebelum import
          </div>
          <div class="text-xs text-gray-500 mt-0.5">{{ dangerDesc }}</div>
        </div>
      </label>

      <!-- Confirm clear -->
      <Transition name="slide">
        <div v-if="clearFirst"
             class="flex items-center gap-3 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4">
          <i class="fa-solid fa-skull-crossbones text-red-400 text-lg flex-shrink-0" />
          <div class="flex-1 text-xs text-red-300">
            Semua data yang ada akan <strong>dihapus permanen</strong> sebelum import dimulai.
            Pastikan Anda sudah melakukan backup.
          </div>
          <label class="flex items-center gap-2 flex-shrink-0 cursor-pointer">
            <input type="checkbox" v-model="confirmClear" class="accent-red-500 w-4 h-4" />
            <span class="text-xs text-red-300 font-medium">Saya mengerti</span>
          </label>
        </div>
      </Transition>

      <!-- Upload button -->
      <div class="flex items-center gap-3">
        <button @click="doUpload"
                :disabled="!canUpload"
                class="btn-primary disabled:opacity-40 disabled:cursor-not-allowed">
          <i :class="uploading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-file-arrow-up'" />
          {{ uploading ? 'Mengupload...' : 'Mulai Import' }}
        </button>
        <span v-if="!file" class="text-xs text-gray-600">Pilih file CSV terlebih dahulu</span>
        <span v-else-if="clearFirst && !confirmClear" class="text-xs text-red-500">
          Centang konfirmasi untuk melanjutkan
        </span>
      </div>
    </div>

    </div> <!-- end upload form -->

  </div>
</template>

<script setup lang="ts">
interface Col { key: string; label: string }

const props = defineProps<{
  label:        string
  icon:         string
  color:        string
  templateUrl:  string
  uploadUrl:    string
  previewCols:  Col[]
  description:  string
  dangerDesc:   string
  targetUrl?:   string
  targetLabel?: string
  targetIcon?:  string
}>()

const emit = defineEmits<{
  (e: 'done', msg: string, type: 'success' | 'error'): void
}>()

const { getBlob, postForm } = useApi()

const fileInput   = ref<HTMLInputElement | null>(null)
const dragging    = ref(false)
const downloading = ref(false)
const uploading   = ref(false)
const clearFirst  = ref(false)
const confirmClear = ref(false)
const file         = ref<File | null>(null)
const csvHeaders   = ref<string[]>([])
const previewRows  = ref<Record<string, string>[]>([])
const result       = ref<{ imported: number; updated: number; skipped: number; errors: string[] } | null>(null)

const canUpload = computed(() =>
  !!file.value && !uploading.value && (!clearFirst.value || confirmClear.value)
)

const hasError = computed(() =>
  !!(result.value?.skipped && !result.value?.imported && !result.value?.updated)
  || !!(result.value?.errors?.length)
)

function resetForm() {
  result.value      = null
  file.value        = null
  csvHeaders.value  = []
  previewRows.value = []
  clearFirst.value  = false
  confirmClear.value = false
  if (fileInput.value) fileInput.value.value = ''
}

// ── File handling ──────────────────────────────────────────────────────
function onDrop(e: DragEvent) {
  dragging.value = false
  const f = e.dataTransfer?.files?.[0]
  if (f) loadFile(f)
}

function onFileChange(e: Event) {
  const f = (e.target as HTMLInputElement).files?.[0]
  if (f) loadFile(f)
}

function clearFile() {
  file.value      = null
  csvHeaders.value = []
  previewRows.value = []
  result.value    = null
  if (fileInput.value) fileInput.value.value = ''
}

function loadFile(f: File) {
  file.value   = f
  result.value = null
  parseCSVPreview(f)
}

function parseCSVPreview(f: File) {
  const reader = new FileReader()
  reader.onload = (e) => {
    const text    = (e.target?.result as string) || ''
    // Strip UTF-8 BOM (berbagai encoding)
    const cleaned = text.replace(/^﻿/, '')
    // Handle semua jenis line ending: \r\n (Windows), \r (old Mac), \n (Unix)
    const allLines = cleaned.split(/\r\n|\r|\n/)
    const lines    = allLines.filter(l => l.trim() !== '')
    if (!lines.length) return

    // Deteksi separator: coba titik koma dulu (Excel ID), lalu koma
    const firstLine = lines[0]
    const sep = firstLine.includes(';') && !firstLine.includes(',') ? ';' : ','

    const parseRow = (line: string): string[] => {
      const cols: string[] = []
      let cur = '', inQ = false
      for (let i = 0; i < line.length; i++) {
        const c = line[i]
        if (c === '"' && !inQ)  { inQ = true;  continue }
        if (c === '"' && inQ)   { inQ = false; continue }
        if (c === sep && !inQ)  { cols.push(cur.trim()); cur = ''; continue }
        cur += c
      }
      cols.push(cur.trim())
      return cols
    }

    const headers  = parseRow(lines[0])
    csvHeaders.value = headers

    // Ambil baris data: skip baris komentar (#) dan header
    const dataLines = lines.slice(1).filter(l => !l.trimStart().startsWith('#'))
    previewRows.value = dataLines.slice(0, 5).map(line => {
      const cols = parseRow(line)
      const row: Record<string, string> = {}
      headers.forEach((h, i) => { row[h] = cols[i] ?? '' })
      return row
    })
  }
  reader.readAsText(f, 'UTF-8')
}

// ── Download template ──────────────────────────────────────────────────
async function downloadTemplate() {
  downloading.value = true
  try {
    const blob = await getBlob(props.templateUrl)
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    const name = props.templateUrl.split('/').pop() || 'template'
    a.download = name.includes('.csv') ? name : name + '.csv'
    a.click()
    URL.revokeObjectURL(url)
  } catch {
    emit('done', 'Gagal mengunduh template.', 'error')
  } finally {
    downloading.value = false
  }
}

// ── Upload ─────────────────────────────────────────────────────────────
async function doUpload() {
  if (!file.value) return
  uploading.value = true
  result.value    = null
  try {
    const form = new FormData()
    form.append('file', file.value)
    form.append('clear_first', clearFirst.value ? '1' : '0')

    const res = await postForm(props.uploadUrl, form)
    result.value = res

    const total = (res.imported ?? 0) + (res.updated ?? 0)
    emit('done',
      `Import selesai: ${res.imported} baru, ${res.updated} diperbarui, ${res.skipped} dilewati.`,
      res.skipped > 0 && total === 0 ? 'error' : 'success'
    )
  } catch (err: any) {
    const msg = err?.data?.message || err?.message || 'Import gagal.'
    emit('done', msg, 'error')
  } finally {
    uploading.value = false
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}
</script>

<style scoped>
.slide-enter-active, .slide-leave-active { transition: all .3s ease; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
