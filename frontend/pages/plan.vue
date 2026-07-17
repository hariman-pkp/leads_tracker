<template>
  <div>
    <!-- Header -->
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-table-columns text-primary-400 mr-2" />Weekly Planner</h1>
        <p class="page-subtitle">{{ weekLabel }}</p>
      </div>
      <div class="flex items-center gap-2">
        <button @click="prevWeek" class="btn-secondary btn-sm"><i class="fa-solid fa-chevron-left" /></button>
        <button @click="goToday"  class="btn-secondary btn-sm">Hari Ini</button>
        <button @click="nextWeek" class="btn-secondary btn-sm"><i class="fa-solid fa-chevron-right" /></button>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <div v-else-if="data">

      <!-- ── MOBILE: vertical day cards ───────────────────────── -->
      <div class="md:hidden space-y-3 pb-28">

        <!-- Overdue chip -->
        <button v-if="data.overdue?.length"
                @click="showOverdue = !showOverdue"
                class="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-red-900/20 border border-red-700/40 text-left">
          <span class="text-sm font-semibold text-red-400">
            <i class="fa-solid fa-circle-exclamation mr-1.5" />{{ data.overdue.length }} Lead Overdue
          </span>
          <i :class="showOverdue ? 'fa-chevron-up' : 'fa-chevron-down'" class="fa-solid text-red-500 text-xs" />
        </button>
        <div v-if="showOverdue && data.overdue?.length" class="space-y-1.5 -mt-1">
          <div v-for="l in data.overdue" :key="l.lead_id"
               class="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-900/10 border border-red-900/30">
            <span :class="fmt.priorityClass(l.prioritas)" class="flex-shrink-0 text-xs">{{ l.prioritas }}</span>
            <span class="flex-1 text-sm text-gray-200 truncate">{{ l.nama_company }}</span>
            <span class="text-xs text-red-400 flex-shrink-0">+{{ l.days_overdue }}h</span>
            <button @click="openModal(l, null)"
                    class="w-7 h-7 rounded-full bg-primary-700 flex items-center justify-center flex-shrink-0">
              <i class="fa-solid fa-calendar-plus text-white text-xs" />
            </button>
          </div>
        </div>

        <!-- Day cards -->
        <div v-for="day in weekDays" :key="day.iso"
             class="card"
             :class="day.iso === data.today ? 'border-primary-500/60 bg-primary-900/5' : ''">
          <!-- Day header -->
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-2">
              <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                   :class="day.iso === data.today ? 'bg-primary-600 text-white' : 'bg-navy-700 text-apex-muted'">
                <span class="text-sm font-bold">{{ day.dayNum }}</span>
              </div>
              <div>
                <div class="text-sm font-semibold" :class="day.iso === data.today ? 'text-primary-300' : 'text-apex-text'">
                  {{ day.label }}
                </div>
                <div class="text-[10px] text-apex-muted">{{ day.monthLabel }}</div>
              </div>
              <span v-if="day.iso === data.today"
                    class="text-[10px] bg-primary-700 text-white px-1.5 py-0.5 rounded-full font-medium">Today</span>
            </div>
            <button @click="openModal(null, day.iso)"
                    class="w-8 h-8 rounded-full bg-primary-700/80 hover:bg-primary-600 flex items-center justify-center transition-colors">
              <i class="fa-solid fa-plus text-white text-sm" />
            </button>
          </div>

          <!-- Scheduled leads -->
          <div v-if="leadsForDay(day.iso).length" class="space-y-1.5">
            <div v-for="l in leadsForDay(day.iso)" :key="l.lead_id"
                 class="flex items-center gap-2 p-2.5 rounded-xl bg-navy-800/60 active:bg-navy-700 transition-colors">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-1.5 mb-0.5">
                  <span :class="fmt.priorityClass(l.prioritas)" class="text-[10px] flex-shrink-0">{{ l.prioritas }}</span>
                  <NuxtLink :to="`/pipeline/${l.lead_id}`"
                            class="text-sm font-medium text-gray-200 hover:text-primary-300 truncate">
                    {{ l.nama_company }}
                  </NuxtLink>
                </div>
                <div class="flex items-center gap-1.5">
                  <span :class="fuTypeBg(l.next_fu_type)"
                        class="text-[10px] px-1.5 py-0.5 rounded-full font-medium">
                    {{ FU_LABEL[l.next_fu_type] || l.next_fu_type || 'Call' }}
                  </span>
                  <span class="text-[10px] text-apex-muted truncate">{{ l.sales_owner }}</span>
                </div>
              </div>
              <button @click="openModal(l, day.iso)"
                      class="w-7 h-7 rounded-full bg-navy-700 hover:bg-navy-600 flex items-center justify-center flex-shrink-0 transition-colors">
                <i class="fa-solid fa-pen text-gray-400 text-[10px]" />
              </button>
            </div>
          </div>
          <div v-else class="text-xs text-apex-muted text-center py-2 italic">Belum ada rencana</div>
        </div>

        <!-- Unscheduled pool -->
        <div v-if="data.unscheduled?.length" class="card">
          <button @click="showUnscheduled = !showUnscheduled"
                  class="w-full flex items-center justify-between">
            <span class="section-title text-gray-400 mb-0">
              <i class="fa-solid fa-inbox mr-1.5" />Belum Dijadwalkan ({{ filteredUnscheduled.length }}/{{ data.unscheduled.length }})
            </span>
            <i :class="showUnscheduled ? 'fa-chevron-up' : 'fa-chevron-down'" class="fa-solid text-gray-500 text-xs" />
          </button>
          <div v-if="showUnscheduled" class="mt-3">
            <div class="relative mb-2">
              <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-apex-muted text-xs" />
              <input v-model="unscheduledSearch" class="form-input w-full pl-8 text-sm py-1.5" placeholder="Cari company..." />
            </div>
            <div class="space-y-1.5">
            <div v-for="l in filteredUnscheduled" :key="l.lead_id"
                 class="flex items-center gap-2 p-2.5 rounded-xl bg-navy-800/40">
              <span :class="fmt.priorityClass(l.prioritas)" class="flex-shrink-0 text-xs">{{ l.prioritas }}</span>
              <span class="flex-1 text-sm text-gray-300 truncate">{{ l.nama_company }}</span>
              <span :class="fmt.stageClass(l.stage)" class="text-xs flex-shrink-0">{{ l.stage }}</span>
              <button @click="openModal(l, null)"
                      class="w-7 h-7 rounded-full bg-primary-700/60 hover:bg-primary-600 flex items-center justify-center flex-shrink-0 transition-colors">
                <i class="fa-solid fa-calendar-plus text-white text-xs" />
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>

      <!-- ── DESKTOP: horizontal columns ──────────────────────── -->
      <div class="hidden md:grid md:grid-cols-7 gap-2 mb-5">
        <div v-for="day in weekDays" :key="day.iso"
             class="card p-3 min-h-[320px] flex flex-col"
             :class="day.iso === data.today ? 'border-primary-500/60' : ''">
          <!-- Day header -->
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-xs font-semibold uppercase tracking-wider"
                   :class="day.iso === data.today ? 'text-primary-300' : 'text-apex-muted'">
                {{ day.label }}
              </div>
              <div class="text-lg font-bold mt-0.5"
                   :class="day.iso === data.today ? 'text-primary-300' : 'text-apex-text'">
                {{ day.dayNum }}
              </div>
            </div>
            <button @click="openModal(null, day.iso)"
                    class="w-7 h-7 rounded-full bg-primary-700/60 hover:bg-primary-600 flex items-center justify-center transition-colors"
                    title="Tambah rencana">
              <i class="fa-solid fa-plus text-white text-xs" />
            </button>
          </div>

          <!-- Scheduled leads -->
          <div class="flex-1 space-y-1.5">
            <div v-for="l in leadsForDay(day.iso)" :key="l.lead_id"
                 class="p-2 rounded-lg bg-navy-800/60 hover:bg-navy-700/60 cursor-pointer transition-colors group"
                 @click="openModal(l, day.iso)">
              <div class="text-xs font-medium text-gray-200 group-hover:text-primary-300 truncate mb-1">
                {{ l.nama_company }}
              </div>
              <div class="flex items-center gap-1">
                <span :class="fmt.priorityClass(l.prioritas)" class="text-[9px]">{{ l.prioritas }}</span>
                <span :class="fuTypeBg(l.next_fu_type)"
                      class="text-[9px] px-1 py-0.5 rounded-full">
                  {{ FU_LABEL[l.next_fu_type] || 'Call' }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="!leadsForDay(day.iso).length"
               class="flex-1 flex items-center justify-center text-xs text-apex-muted italic">
            Kosong
          </div>
        </div>
      </div>

      <!-- Desktop: pool panel -->
      <div class="hidden md:grid md:grid-cols-2 gap-4 mb-6">
        <div v-if="data.overdue?.length" class="card border-red-700/30">
          <div class="section-title text-red-400 mb-3">
            <i class="fa-solid fa-circle-exclamation mr-1.5" />Overdue ({{ data.overdue.length }})
          </div>
          <div class="space-y-1.5 max-h-48 overflow-y-auto">
            <div v-for="l in data.overdue" :key="l.lead_id"
                 class="flex items-center gap-2 p-2 rounded-lg bg-red-900/10 hover:bg-red-900/20 cursor-pointer transition-colors"
                 @click="openModal(l, null)">
              <span :class="fmt.priorityClass(l.prioritas)" class="text-xs flex-shrink-0">{{ l.prioritas }}</span>
              <span class="flex-1 text-sm text-gray-200 truncate">{{ l.nama_company }}</span>
              <span class="text-xs text-red-400 flex-shrink-0">+{{ l.days_overdue }}h</span>
              <i class="fa-solid fa-calendar-plus text-primary-400 text-xs flex-shrink-0" />
            </div>
          </div>
        </div>
        <div v-if="data.unscheduled?.length" class="card">
          <div class="flex items-center justify-between mb-3">
            <div class="section-title text-gray-400 mb-0">
              <i class="fa-solid fa-inbox mr-1.5" />Belum Dijadwalkan ({{ filteredUnscheduled.length }}/{{ data.unscheduled.length }})
            </div>
          </div>
          <div class="relative mb-2">
            <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-apex-muted text-xs" />
            <input v-model="unscheduledSearch" class="form-input w-full pl-8 text-sm py-1.5" placeholder="Cari company..." />
          </div>
          <div class="space-y-1.5 max-h-48 overflow-y-auto">
            <div v-for="l in filteredUnscheduled" :key="l.lead_id"
                 class="flex items-center gap-2 p-2 rounded-lg bg-navy-800/40 hover:bg-navy-700/50 cursor-pointer transition-colors"
                 @click="openModal(l, null)">
              <span :class="fmt.priorityClass(l.prioritas)" class="text-xs flex-shrink-0">{{ l.prioritas }}</span>
              <span class="flex-1 text-sm text-gray-300 truncate">{{ l.nama_company }}</span>
              <span :class="fmt.stageClass(l.stage)" class="text-xs flex-shrink-0">{{ l.stage }}</span>
              <i class="fa-solid fa-calendar-plus text-primary-400 text-xs flex-shrink-0" />
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ── Modal Jadwalkan ───────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="slide-up">
        <div v-if="modal.open" class="fixed inset-0 z-[9999] flex items-end md:items-center justify-center">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeModal" />
          <div class="relative w-full md:max-w-md bg-[#161b22] rounded-t-3xl md:rounded-2xl border border-slate-700 p-5 z-10"
               style="max-height: 90vh; overflow-y: auto">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-base font-semibold text-white">
                {{ modal.leadFixed ? 'Jadwalkan Lead' : 'Tambah Rencana' }}
              </h3>
              <button @click="closeModal" class="text-slate-500 hover:text-white">
                <i class="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <!-- Tab switcher (hanya jika lead belum fix) -->
            <div v-if="!modal.leadFixed" class="flex gap-1 mb-4 bg-navy-900 p-1 rounded-xl">
              <button @click="modal.tab = 'pool'; modal.lead = null"
                      :class="modal.tab === 'pool' ? 'bg-navy-700 text-white' : 'text-apex-muted hover:text-gray-300'"
                      class="flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors">
                <i class="fa-solid fa-list mr-1.5" />Dari Pool
              </button>
              <button @click="modal.tab = 'new'"
                      :class="modal.tab === 'new' ? 'bg-primary-700/80 text-white' : 'text-apex-muted hover:text-gray-300'"
                      class="flex-1 text-sm font-medium py-1.5 rounded-lg transition-colors">
                <i class="fa-solid fa-plus mr-1.5" />Lead Baru
              </button>
            </div>

            <!-- ── TAB: Dari Pool ── -->
            <div v-if="modal.tab === 'pool'">
              <!-- Lead selector (jika belum dipilih) -->
              <div v-if="!modal.lead" class="mb-4">
                <label class="form-label">Pilih Lead</label>
                <input v-model="leadSearch" class="form-input w-full mb-2" placeholder="Cari nama company..." />
                <div class="max-h-52 overflow-y-auto space-y-1 rounded-xl border border-slate-700 bg-navy-900 p-2">
                  <div v-if="!filteredLeadPool.length" class="text-xs text-apex-muted text-center py-3">
                    Tidak ada hasil
                  </div>
                  <button v-for="l in filteredLeadPool" :key="l.lead_id"
                          @click="modal.lead = l; leadSearch = ''"
                          class="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-navy-700 text-left transition-colors">
                    <span :class="fmt.priorityClass(l.prioritas)" class="text-xs flex-shrink-0">{{ l.prioritas }}</span>
                    <span class="flex-1 text-sm text-gray-200 truncate">{{ l.nama_company }}</span>
                    <span :class="fmt.stageClass(l.stage)" class="text-xs flex-shrink-0">{{ l.stage }}</span>
                  </button>
                </div>
              </div>

              <!-- Lead terpilih -->
              <div v-if="modal.lead" class="mb-4 p-3 rounded-xl bg-navy-800 flex items-center gap-3">
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-sm text-white truncate">{{ modal.lead.nama_company }}</div>
                  <div class="text-xs text-apex-muted mt-0.5">{{ modal.lead.stage }} · {{ modal.lead.sales_owner }}</div>
                </div>
                <button v-if="!modal.leadFixed" @click="modal.lead = null"
                        class="text-slate-500 hover:text-white text-xs">
                  <i class="fa-solid fa-xmark" />
                </button>
              </div>
            </div>

            <!-- ── TAB: Lead Baru ── -->
            <div v-if="modal.tab === 'new'" class="mb-4 space-y-3">
              <div>
                <label class="form-label">Nama Company <span class="text-red-400">*</span></label>
                <input v-model="newLead.nama_company" class="form-input w-full" placeholder="PT. ..." />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="form-label">Prioritas</label>
                  <select v-model="newLead.prioritas" class="form-select w-full">
                    <option>Hot</option>
                    <option>Warm</option>
                    <option>Cold</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Segmen</label>
                  <select v-model="newLead.segmen" class="form-select w-full">
                    <option value="">— Pilih —</option>
                    <option v-for="s in segmens" :key="s">{{ s }}</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="form-label">Contact Person</label>
                <input v-model="newLead.contact_person" class="form-input w-full" placeholder="Nama PIC" />
              </div>
              <div>
                <label class="form-label">No. Telepon</label>
                <input v-model="newLead.phone" class="form-input w-full" placeholder="08xx..." type="tel" />
              </div>
            </div>

            <!-- Tanggal -->
            <div class="mb-4">
              <label class="form-label">Tanggal Rencana</label>
              <input v-model="modal.date" type="date" class="form-input w-full" />
            </div>

            <!-- Jenis FU -->
            <div class="mb-5">
              <label class="form-label">Jenis Aktivitas</label>
              <div class="grid grid-cols-2 gap-2">
                <button v-for="ft in FU_TYPES" :key="ft.value"
                        @click="modal.fuType = ft.value"
                        :class="modal.fuType === ft.value
                          ? 'border-primary-500 bg-primary-900/40 text-primary-300'
                          : 'border-slate-700 bg-navy-800 text-slate-400 hover:border-slate-500'"
                        class="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors">
                  <i :class="`${ft.brand ? 'fa-brands' : 'fa-solid'} ${ft.icon} text-base`" :style="`color:${modal.fuType === ft.value ? '' : ft.color}`" />
                  {{ ft.label }}
                </button>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-3">
              <button v-if="modal.lead && modal.hasExisting"
                      @click="hapusJadwal"
                      :disabled="modal.saving"
                      class="btn-secondary flex-1 text-red-400 hover:text-red-300 border-red-900/50">
                <i class="fa-solid fa-calendar-xmark mr-1" />Hapus Jadwal
              </button>
              <button @click="simpanJadwal"
                      :disabled="(modal.tab === 'pool' ? (!modal.lead || !modal.date) : !newLead.nama_company.trim()) || modal.saving"
                      class="btn-primary flex-1">
                <i :class="modal.saving ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-calendar-check'" class="mr-1" />
                {{ modal.saving ? 'Menyimpan...' : 'Simpan' }}
              </button>
            </div>

            <p v-if="modal.err" class="text-red-400 text-xs mt-2 text-center">{{ modal.err }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get, patch, post } = useApi()
const { segmens } = useSegmen()
const fmt = useFormat()

// ── Week navigation ────────────────────────────────────────────
const weekStart = ref(getMonday(new Date()))

function getMonday(d: Date) {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(d.getDate() + diff)
  return m.toISOString().slice(0, 10)
}

function addDays(iso: string, n: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}

function prevWeek() { weekStart.value = addDays(weekStart.value, -7) }
function nextWeek() { weekStart.value = addDays(weekStart.value, 7) }
function goToday()  { weekStart.value = getMonday(new Date()) }

// ── Data ───────────────────────────────────────────────────────
const { data, pending, refresh } = await useAsyncData(
  () => `plan-${weekStart.value}`,
  () => get('/v1/plan/weekly', { week_start: weekStart.value }),
  { watch: [weekStart], server: false }
)

// ── Days ───────────────────────────────────────────────────────
const DAY_NAMES  = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']
const weekDays = computed(() =>
  Array.from({ length: 7 }, (_, i) => {
    const iso = addDays(weekStart.value, i)
    const d   = new Date(iso)
    return {
      iso,
      label:      DAY_NAMES[i],
      dayNum:     d.getDate(),
      monthLabel: d.toLocaleDateString('id-ID', { month: 'short' }),
    }
  })
)

const weekLabel = computed(() => {
  const s = new Date(weekStart.value)
  const e = new Date(addDays(weekStart.value, 6))
  return `${s.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} – ${e.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
})

function leadsForDay(iso: string): any[] {
  return (data.value?.by_date as any)?.[iso] ?? []
}

// ── FU type config ─────────────────────────────────────────────
const FU_TYPES = [
  { value: 'kunjungan', label: 'Kunjungan',  icon: 'fa-car',         color: '#34d399' },
  { value: 'meeting',   label: 'Meeting',    icon: 'fa-handshake',   color: '#60a5fa' },
  { value: 'whatsapp',  label: 'WhatsApp',   icon: 'fa-whatsapp',    color: '#4ade80', brand: true },
  { value: 'call',      label: 'Telepon',    icon: 'fa-phone',       color: '#facc15' },
  { value: 'online',    label: 'Online',     icon: 'fa-video',       color: '#c084fc' },
  { value: 'email',     label: 'Email',      icon: 'fa-envelope',    color: '#94a3b8' },
]
const FU_LABEL: Record<string, string> = Object.fromEntries(FU_TYPES.map(f => [f.value, f.label]))

const FU_TYPE_BG: Record<string, string> = {
  kunjungan: 'bg-emerald-900/60 text-emerald-400',
  meeting:   'bg-blue-900/60 text-blue-400',
  online:    'bg-purple-900/60 text-purple-400',
  whatsapp:  'bg-green-900/60 text-green-400',
  call:      'bg-yellow-900/60 text-yellow-400',
  email:     'bg-slate-700/60 text-slate-400',
}
function fuTypeBg(t: string) { return FU_TYPE_BG[t] ?? FU_TYPE_BG.call }

// ── UI toggles ─────────────────────────────────────────────────
const showOverdue       = ref(false)
const showUnscheduled   = ref(false)
const unscheduledSearch = ref('')

const filteredUnscheduled = computed(() => {
  const q = unscheduledSearch.value.toLowerCase()
  const list = (data.value?.unscheduled ?? []) as any[]
  return q ? list.filter(l => l.nama_company.toLowerCase().includes(q)) : list
})

// ── Lead pool for picker ───────────────────────────────────────
const leadPool = computed<any[]>(() => {
  const overdue     = (data.value?.overdue      ?? []) as any[]
  const unscheduled = (data.value?.unscheduled  ?? []) as any[]
  const scheduled: any[] = Object.values((data.value?.by_date as any) ?? {}).flat()
  const seen = new Set<string>()
  const all: any[] = []
  for (const l of [...overdue, ...unscheduled, ...scheduled]) {
    if (!seen.has(l.lead_id)) { seen.add(l.lead_id); all.push(l) }
  }
  return all
})

const leadSearch = ref('')
const filteredLeadPool = computed(() => {
  const q = leadSearch.value.toLowerCase()
  return q ? leadPool.value.filter(l => l.nama_company.toLowerCase().includes(q)) : leadPool.value
})

// ── Modal ──────────────────────────────────────────────────────
const modal = reactive({
  open:        false,
  tab:         'pool' as 'pool' | 'new',
  lead:        null as any,
  leadFixed:   false,
  date:        '',
  fuType:      'kunjungan',
  hasExisting: false,
  saving:      false,
  err:         '',
})

const newLead = reactive({
  nama_company:   '',
  prioritas:      'Warm',
  segmen:         '',
  contact_person: '',
  phone:          '',
})

function openModal(lead: any | null, date: string | null) {
  modal.lead        = lead
  modal.leadFixed   = !!lead
  modal.date        = date ?? lead?.next_fu_date ?? ''
  modal.fuType      = lead?.next_fu_type ?? 'kunjungan'
  modal.hasExisting = !!lead?.next_fu_date
  modal.saving      = false
  modal.err         = ''
  modal.tab         = 'pool'
  modal.open        = true
  leadSearch.value  = ''
  newLead.nama_company   = ''
  newLead.prioritas      = 'Warm'
  newLead.segmen         = ''
  newLead.contact_person = ''
  newLead.phone          = ''
}

function closeModal() { modal.open = false }

async function simpanJadwal() {
  modal.saving = true
  modal.err    = ''
  try {
    if (modal.tab === 'new') {
      if (!newLead.nama_company.trim()) { modal.err = 'Nama company wajib diisi.'; return }
      const res = await post('/v1/pipeline', {
        nama_company:   newLead.nama_company.trim(),
        prioritas:      newLead.prioritas,
        segmen:         newLead.segmen,
        contact_person: newLead.contact_person.trim(),
        phone:          newLead.phone.trim(),
      }) as any
      if (modal.date) {
        await patch('/v1/plan/assign', {
          lead_id:      res.lead_id,
          next_fu_date: modal.date,
          next_fu_type: modal.fuType,
        })
      }
    } else {
      if (!modal.lead || !modal.date) return
      await patch('/v1/plan/assign', {
        lead_id:      modal.lead.lead_id,
        next_fu_date: modal.date,
        next_fu_type: modal.fuType,
      })
    }
    closeModal()
    await refresh()
  } catch (e: any) {
    modal.err = e?.data?.detail || 'Gagal menyimpan.'
  } finally {
    modal.saving = false
  }
}

async function hapusJadwal() {
  if (!modal.lead) return
  modal.saving = true
  modal.err    = ''
  try {
    await patch('/v1/plan/assign', {
      lead_id:      modal.lead.lead_id,
      next_fu_date: null,
      next_fu_type: null,
    })
    closeModal()
    await refresh()
  } catch (e: any) {
    modal.err = e?.data?.detail || 'Gagal menghapus jadwal.'
  } finally {
    modal.saving = false
  }
}
</script>

<style scoped>
.slide-up-enter-active { transition: transform 0.3s ease; }
.slide-up-enter-from   { transform: translateY(100%); }
.slide-up-leave-active { transition: transform 0.25s ease; }
.slide-up-leave-to     { transform: translateY(100%); }
</style>
