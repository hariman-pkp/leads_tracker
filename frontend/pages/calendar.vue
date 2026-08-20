<template>
  <div class="p-4 space-y-4">
    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-white flex items-center gap-2">
        <i class="fa-solid fa-calendar-days text-blue-400"></i>
        Kalender Follow-Up
      </h1>

      <!-- View toggle -->
      <div class="flex rounded-lg overflow-hidden border border-slate-600">
        <button
          v-for="v in VIEWS"
          :key="v.key"
          @click="view = v.key"
          :class="view === v.key
            ? 'bg-blue-600 text-white'
            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'"
          class="px-3 py-1.5 text-sm font-medium transition-colors"
        >{{ v.label }}</button>
      </div>
    </div>

    <!-- Controls row -->
    <div class="flex flex-wrap items-center gap-3">
      <!-- Sales filter (admin/manager only) -->
      <div v-if="!isSalesOnly" class="flex items-center gap-2">
        <label class="text-sm text-slate-400">Sales:</label>
        <select v-model="filterSales" @change="load"
          class="bg-slate-800 border border-slate-600 text-white text-sm rounded-lg px-3 py-1.5">
          <option value="">Semua Sales</option>
          <option v-for="s in salesList" :key="s" :value="s">{{ s }}</option>
        </select>
      </div>

      <!-- Toggle FU selesai -->
      <button @click="toggleShowDone"
        :class="showDone
          ? 'bg-emerald-700 text-white border-emerald-600'
          : 'bg-slate-800 text-slate-400 border-slate-600 hover:border-slate-400'"
        class="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg border transition-colors">
        <i class="fa-solid fa-circle-check"></i>
        FU Selesai
        <span v-if="showDone && doneTotal > 0"
          class="bg-emerald-600 text-white text-xs rounded-full px-1.5 py-0.5">{{ doneTotal }}</span>
      </button>

      <!-- Legend -->
      <div class="flex items-center gap-3 text-xs text-slate-400 ml-auto">
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-yellow-400 inline-block"></span>Jadwal</span>
        <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-orange-400 inline-block"></span>Jadwal</span>
        <span v-if="showDone" class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>Selesai</span>
      </div>
    </div>

    <!-- Nav row (prev / current label / next) -->
    <div class="flex items-center justify-between">
      <button @click="shiftPeriod(-1)"
        class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
        <i class="fa-solid fa-chevron-left"></i>
      </button>
      <span class="text-base font-semibold text-white">{{ periodLabel }}</span>
      <button @click="shiftPeriod(1)"
        class="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300">
        <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>

    <div v-if="loading" class="text-center text-slate-400 py-10">
      <i class="fa-solid fa-spinner fa-spin mr-2"></i>Memuat...
    </div>

    <!-- ── MONTH VIEW ─────────────────────────────────────────── -->
    <template v-else-if="view === 'month'">
      <!-- Day-of-week headers -->
      <div class="grid grid-cols-7 gap-px text-center text-xs font-medium text-slate-400 mb-1">
        <div v-for="d in DAY_LABELS" :key="d">{{ d }}</div>
      </div>
      <!-- Calendar grid -->
      <div class="grid grid-cols-7 gap-px bg-slate-700 rounded-xl overflow-hidden">
        <div
          v-for="cell in monthCells"
          :key="cell.key"
          @click="cell.date && selectDay(cell.date)"
          :class="[
            'bg-slate-900 min-h-[70px] p-1 flex flex-col',
            cell.date ? 'cursor-pointer hover:bg-slate-800' : 'opacity-30',
            cell.date === selectedDay ? 'ring-2 ring-blue-500 ring-inset' : '',
            cell.isToday ? 'bg-slate-800' : '',
          ]"
        >
          <span
            :class="[
              'text-xs font-semibold self-start w-6 h-6 flex items-center justify-center rounded-full',
              cell.isToday ? 'bg-blue-600 text-white' : 'text-slate-300',
            ]"
          >{{ cell.dayNum }}</span>
          <!-- Badges jadwal mendatang -->
          <div class="flex flex-wrap gap-0.5 mt-0.5">
            <span
              v-for="item in (byDate[cell.date] ?? []).slice(0,3)"
              :key="item.lead_id"
              class="w-2 h-2 rounded-full bg-orange-400"
            ></span>
            <!-- Dot FU selesai -->
            <span
              v-if="showDone"
              v-for="d in (doneByDate[cell.date] ?? []).slice(0, 3)"
              :key="'d'+d.fu_id"
              class="w-2 h-2 rounded-full bg-emerald-400"
            ></span>
          </div>
          <span v-if="(byDate[cell.date] ?? []).length || (showDone && (doneByDate[cell.date] ?? []).length)"
            class="text-[10px] text-slate-400 mt-auto">
            <template v-if="(byDate[cell.date] ?? []).length">{{ (byDate[cell.date] ?? []).length }} jadwal</template>
            <template v-if="showDone && (doneByDate[cell.date] ?? []).length">
              {{ (byDate[cell.date] ?? []).length ? ' · ' : '' }}{{ (doneByDate[cell.date] ?? []).length }} selesai
            </template>
          </span>
        </div>
      </div>

      <!-- Day detail panel (if day selected) -->
      <DayPanel v-if="selectedDay" :date="selectedDay"
        :leads="byDate[selectedDay] ?? []"
        :done-leads="showDone ? (doneByDate[selectedDay] ?? []) : []" />
    </template>

    <!-- ── WEEK VIEW ──────────────────────────────────────────── -->
    <template v-else-if="view === 'week'">
      <div class="grid grid-cols-7 gap-2">
        <div v-for="day in weekDays" :key="day.date" class="flex flex-col gap-1">
          <div
            :class="[
              'text-center py-1 rounded-lg text-xs font-medium',
              day.isToday ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300',
            ]"
          >
            <div>{{ day.label }}</div>
            <div class="text-lg font-bold">{{ day.num }}</div>
          </div>
          <div
            v-for="lead in byDate[day.date] ?? []"
            :key="lead.lead_id"
            @click="goLead(lead.lead_id)"
            class="bg-slate-800 rounded-lg p-1.5 cursor-pointer hover:bg-slate-700 text-xs space-y-0.5"
          >
            <div class="flex items-center gap-1">
              <i :class="FU_TYPE_ICON[lead.next_fu_type] ?? FU_TYPE_ICON.call" class="text-[10px]"></i>
              <span class="text-slate-200 truncate leading-tight">{{ lead.nama_company }}</span>
            </div>
            <PriorityBadge :p="lead.prioritas" />
          </div>
          <div v-if="!(byDate[day.date] ?? []).length"
            class="text-center text-slate-600 text-xs py-3">—</div>
        </div>
      </div>
    </template>

    <!-- ── DAY VIEW ───────────────────────────────────────────── -->
    <template v-else>
      <DayPanel :date="cursor" :leads="byDate[cursor] ?? []"
        :done-leads="showDone ? (doneByDate[cursor] ?? []) : []" />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, defineComponent, h, type PropType } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useApi } from '~/composables/useApi'

// ── sub-components (inline) ──────────────────────────────────────────────────
const DayPanel = defineComponent({
  props: {
    date:      { type: String, required: true },
    leads:     { type: Array as PropType<any[]>, default: () => [] },
    doneLeads: { type: Array as PropType<any[]>, default: () => [] },
  },
  setup(props) {
    const router = useRouter()

    const leadCard = (lead: any) => h('div', {
      key: lead.lead_id,
      class: 'bg-slate-800 rounded-xl p-3 cursor-pointer hover:bg-slate-700 flex items-start gap-3',
      onClick: () => router.push(`/pipeline/${lead.lead_id}`),
    }, [
      h('i', { class: (FU_TYPE_ICON as any)[lead.next_fu_type] ?? (FU_TYPE_ICON as any).call }),
      h('div', { class: 'flex-1 min-w-0' }, [
        h('p', { class: 'text-white font-medium truncate' }, lead.nama_company),
        h('div', { class: 'flex items-center gap-2 mt-0.5 flex-wrap' }, [
          h('span', { class: 'text-xs text-slate-400' }, lead.stage ?? ''),
          lead.prioritas && h('span', {
            class: `text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PRIO_COLOR[lead.prioritas] ?? 'bg-slate-700 text-slate-300'}`,
          }, lead.prioritas),
          lead.sales_owner && h('span', { class: 'text-xs text-slate-500' }, `· ${lead.sales_owner}`),
        ]),
        lead.last_fu_notes && h('p', { class: 'text-xs text-slate-500 mt-1 line-clamp-2' }, lead.last_fu_notes),
      ]),
      lead.fu_status === 'Overdue' && h('span', {
        class: 'text-[10px] bg-red-900 text-red-300 rounded-full px-1.5 py-0.5 shrink-0',
      }, `${lead.days_overdue}h`),
    ])

    const doneCard = (log: any) => h('div', {
      key: log.fu_id,
      class: 'bg-slate-800/60 rounded-xl p-3 cursor-pointer hover:bg-slate-700 flex items-start gap-3 border border-emerald-900/40',
      onClick: () => router.push(`/pipeline/${log.lead_id}`),
    }, [
      h('i', { class: 'fa-solid fa-circle-check text-emerald-400 mt-0.5' }),
      h('div', { class: 'flex-1 min-w-0' }, [
        h('p', { class: 'text-white font-medium truncate' }, log.nama_company),
        h('div', { class: 'flex items-center gap-2 mt-0.5 flex-wrap' }, [
          log.metode_fu && h('span', { class: 'text-xs text-emerald-400' }, log.metode_fu),
          log.hasil_fu  && h('span', { class: 'text-xs text-slate-400' }, `· ${log.hasil_fu}`),
          log.sales_owner && h('span', { class: 'text-xs text-slate-500' }, `· ${log.sales_owner}`),
        ]),
        log.catatan_fu && h('p', { class: 'text-xs text-slate-500 mt-1 line-clamp-2' }, log.catatan_fu),
        log.tgl_fu_berikut && h('p', { class: 'text-xs text-yellow-500 mt-1' },
          `→ Next: ${fmt(log.tgl_fu_berikut)}${log.next_fu_type ? ` (${log.next_fu_type})` : ''}`
        ),
      ]),
    ])

    return () => h('div', { class: 'space-y-3' }, [
      // Jadwal section
      props.leads.length && h('div', { class: 'space-y-2' }, [
        h('p', { class: 'text-xs font-semibold text-slate-400 uppercase tracking-wide' },
          `${props.leads.length} jadwal — ${fmt(props.date)}`),
        ...props.leads.map(leadCard),
      ]),
      // Selesai section
      props.doneLeads.length && h('div', { class: 'space-y-2' }, [
        h('p', { class: 'text-xs font-semibold text-emerald-500 uppercase tracking-wide' },
          `${props.doneLeads.length} selesai — ${fmt(props.date)}`),
        ...props.doneLeads.map(doneCard),
      ]),
      // Empty state
      !props.leads.length && !props.doneLeads.length && h('p', {
        class: 'text-sm text-slate-500 text-center py-4',
      }, `Tidak ada jadwal — ${fmt(props.date)}`),
    ])
  },
})

const PriorityBadge = defineComponent({
  props: { p: String },
  setup(props) {
    return () => props.p
      ? h('span', {
          class: `text-[9px] font-semibold px-1 py-0.5 rounded-full ${PRIO_COLOR[props.p!] ?? 'bg-slate-700 text-slate-300'}`,
        }, props.p)
      : null
  },
})

// ── constants ────────────────────────────────────────────────────────────────
const VIEWS       = [{ key: 'month', label: 'Bulan' }, { key: 'week', label: 'Minggu' }, { key: 'day', label: 'Hari' }]
const DAY_LABELS  = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const FU_TYPE_ICON: Record<string, string> = {
  kunjungan: 'fa-solid fa-car text-emerald-400',
  meeting:   'fa-solid fa-handshake text-blue-400',
  online:    'fa-solid fa-video text-purple-400',
  whatsapp:  'fa-brands fa-whatsapp text-green-400',
  call:      'fa-solid fa-phone text-yellow-400',
}
const PRIO_COLOR: Record<string, string> = {
  High:   'bg-red-900 text-red-300',
  Medium: 'bg-yellow-900 text-yellow-300',
  Low:    'bg-slate-700 text-slate-400',
}


// ── setup ────────────────────────────────────────────────────────────────────
const router = useRouter()
const auth   = useAuthStore()
const { get } = useApi()

const isSalesOnly = computed(() => auth.user?.is_sales_only ?? false)
const view        = ref<'month'|'week'|'day'>('month')
const loading     = ref(false)
const filterSales = ref('')
const salesList   = ref<string[]>([])
const byDate      = ref<Record<string, any[]>>({})
const doneByDate  = ref<Record<string, any[]>>({})
const doneTotal   = ref(0)
const showDone    = ref(false)
const selectedDay = ref<string | null>(null)

// cursor = anchor date (first day of month for month view, first day of week for week view, day for day)
const today  = new Date()
const cursor = ref(startOfMonth(toISO(today)))

function toISO(d: Date) {
  // Gunakan local date parts agar tidak shift di timezone UTC+x
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
function addDays(iso: string, n: number) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toISO(d)
}
function startOfMonth(iso: string) {
  return iso.slice(0, 7) + '-01'
}
function startOfWeek(iso: string) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() - d.getDay())
  return toISO(d)
}

const periodLabel = computed(() => {
  const d = new Date(cursor.value + 'T00:00:00')
  if (view.value === 'month') {
    return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  }
  if (view.value === 'week') {
    const end = addDays(cursor.value, 6)
    return `${fmt(cursor.value)} – ${fmt(end)}`
  }
  return fmt(cursor.value)
})

function fmt(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function shiftPeriod(dir: number) {
  const d = new Date(cursor.value + 'T00:00:00')
  if (view.value === 'month') {
    d.setMonth(d.getMonth() + dir)
    cursor.value = startOfMonth(toISO(d))
  } else if (view.value === 'week') {
    cursor.value = addDays(cursor.value, dir * 7)
  } else {
    cursor.value = addDays(cursor.value, dir)
  }
}

function selectDay(date: string) {
  selectedDay.value = selectedDay.value === date ? null : date
}

function goLead(id: string | number) {
  router.push(`/pipeline/${id}`)
}

// ── computed cells ────────────────────────────────────────────────────────────
const monthCells = computed(() => {
  const anchor = new Date(cursor.value + 'T00:00:00')
  const year   = anchor.getFullYear()
  const month  = anchor.getMonth()
  const first  = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: Array<{ key: string; date: string; dayNum: number | null; isToday: boolean }> = []

  for (let i = 0; i < first; i++) {
    cells.push({ key: `e${i}`, date: '', dayNum: null, isToday: false })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ key: iso, date: iso, dayNum: d, isToday: iso === toISO(today) })
  }
  // pad to fill last row
  while (cells.length % 7 !== 0) {
    cells.push({ key: `t${cells.length}`, date: '', dayNum: null, isToday: false })
  }
  return cells
})

const weekDays = computed(() => {
  const days = []
  const weekStart = view.value === 'week' ? cursor.value : startOfWeek(cursor.value)
  for (let i = 0; i < 7; i++) {
    const iso = addDays(weekStart, i)
    const d   = new Date(iso + 'T00:00:00')
    days.push({
      date: iso,
      label: DAY_LABELS[d.getDay()],
      num: d.getDate(),
      isToday: iso === toISO(today),
    })
  }
  return days
})

// ── data fetch ────────────────────────────────────────────────────────────────
async function load() {
  loading.value = true
  try {
    const { dateFrom, dateTo } = getDateRange()
    const params: Record<string, string> = { date_from: dateFrom, date_to: dateTo }
    if (filterSales.value) params.sales_owner = filterSales.value

    const res: any = await get('/v1/schedule', params)
    byDate.value = res?.by_date ?? {}

    if (showDone.value) await loadDone(dateFrom, dateTo)
  } finally {
    loading.value = false
  }
}

// Re-align cursor when view changes
async function loadDone(dateFrom: string, dateTo: string) {
  const params: Record<string, string> = { date_from: dateFrom, date_to: dateTo, per_page: '200', page: '1' }
  if (filterSales.value) params.sales_owner = filterSales.value
  try {
    const res: any = await get('/v1/followup', params)
    doneByDate.value = res?.by_date ?? {}
    doneTotal.value  = res?.total ?? 0
  } catch {
    doneByDate.value = {}
    doneTotal.value  = 0
  }
}

async function toggleShowDone() {
  showDone.value = !showDone.value
  if (showDone.value) {
    const { dateFrom, dateTo } = getDateRange()
    await loadDone(dateFrom, dateTo)
  } else {
    doneByDate.value = {}
    doneTotal.value  = 0
  }
}

function getDateRange() {
  let dateFrom: string
  let dateTo: string
  if (view.value === 'month') {
    const d = new Date(cursor.value + 'T00:00:00')
    dateFrom = startOfMonth(cursor.value)
    dateTo   = toISO(new Date(d.getFullYear(), d.getMonth() + 1, 0))
  } else if (view.value === 'week') {
    dateFrom = cursor.value
    dateTo   = addDays(cursor.value, 6)
  } else {
    dateFrom = cursor.value
    dateTo   = cursor.value
  }
  return { dateFrom, dateTo }
}

async function loadSalesList() {
  if (isSalesOnly.value) return
  try {
    const res: any = await get('/v1/master/sales')
    salesList.value = (res as any[])
      .filter((u: any) => u.is_active)
      .map((u: any) => u.nama)
      .sort()
  } catch {}
}

watch(view, (v) => {
  if (v === 'month')      cursor.value = startOfMonth(toISO(today))
  else if (v === 'week')  cursor.value = startOfWeek(toISO(today))
  else                    cursor.value = toISO(today)
  selectedDay.value = null
  load()
})

watch(cursor, load)
onMounted(() => { load(); loadSalesList() })
</script>
