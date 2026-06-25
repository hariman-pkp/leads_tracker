<template>
  <div>
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-trophy text-yellow-400 mr-2" />Win / Loss</h1>
        <p class="page-subtitle">Analisis closed deals — {{ data?.tahun }}</p>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-16">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">

      <!-- ── KPI Row ──────────────────────────────────────────────────── -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5">

        <!-- Win Rate gauge -->
        <div class="card col-span-2 md:col-span-1 flex flex-col items-center justify-center py-4">
          <div class="text-xs text-gray-500 uppercase tracking-wider mb-2">Win Rate</div>
          <div class="relative w-20 h-20 mb-2">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" stroke-width="12"/>
              <circle cx="50" cy="50" r="38" fill="none"
                      :stroke="data.summary.win_rate >= 50 ? '#34d399' : data.summary.win_rate >= 30 ? '#facc15' : '#f87171'"
                      stroke-width="12" stroke-linecap="round"
                      :stroke-dasharray="`${data.summary.win_rate * 2.39} 239`" />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-xl font-bold text-white">{{ data.summary.win_rate }}%</span>
            </div>
          </div>
          <div class="text-xs" :class="data.summary.win_rate >= 50 ? 'text-emerald-400' : data.summary.win_rate >= 30 ? 'text-yellow-400' : 'text-red-400'">
            {{ data.summary.win_rate >= 50 ? 'Baik' : data.summary.win_rate >= 30 ? 'Cukup' : 'Perlu Ditingkatkan' }}
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-trophy" /></div>
          <div>
            <div class="stat-value text-emerald-400">{{ data.summary.won }}</div>
            <div class="stat-label">Total Won</div>
            <div class="text-xs text-emerald-300/70 mt-0.5">{{ fmt.rupiah(data.summary.won_value) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-red-900/40 text-red-400"><i class="fa-solid fa-times-circle" /></div>
          <div>
            <div class="stat-value text-red-400">{{ data.summary.lost }}</div>
            <div class="stat-label">Total Lost</div>
            <div class="text-xs text-red-300/70 mt-0.5">{{ fmt.rupiah(data.summary.lost_value) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-coins" /></div>
          <div>
            <div class="stat-value text-primary-300">{{ fmt.rupiah(data.summary.avg_deal) }}</div>
            <div class="stat-label">Avg Deal Won</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-scale-balanced" /></div>
          <div>
            <div class="stat-value text-white">{{ data.summary.won + data.summary.lost }}</div>
            <div class="stat-label">Total Closed</div>
          </div>
        </div>
      </div>

      <!-- ── Won vs Lost visual comparison ──────────────────────────── -->
      <div class="card mb-5">
        <div class="section-title mb-3"><i class="fa-solid fa-scale-balanced mr-1.5" />Perbandingan Won vs Lost</div>
        <div class="flex items-center gap-3 mb-2">
          <span class="text-xs text-emerald-400 w-8 text-right">{{ data.summary.won }}</span>
          <div class="flex-1 flex h-6 rounded-full overflow-hidden bg-apex-card">
            <div class="bg-emerald-500 transition-all duration-700 flex items-center justify-center"
                 :style="`width:${wonPct}%`">
              <span v-if="wonPct > 15" class="text-xs font-bold text-white">{{ wonPct }}%</span>
            </div>
            <div class="bg-red-500 transition-all duration-700 flex items-center justify-center"
                 :style="`width:${lostPct}%`">
              <span v-if="lostPct > 15" class="text-xs font-bold text-white">{{ lostPct }}%</span>
            </div>
          </div>
          <span class="text-xs text-red-400 w-8">{{ data.summary.lost }}</span>
        </div>
        <div class="flex justify-between text-xs text-gray-600 px-8">
          <span>Won ({{ fmt.rupiah(data.summary.won_value) }})</span>
          <span>Lost ({{ fmt.rupiah(data.summary.lost_value) }})</span>
        </div>
      </div>

      <!-- ── By Product + By Segmen + By Sales ─────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

        <!-- By Product -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-box-open mr-1.5 text-primary-400" />Per Produk</div>
          <div class="space-y-2.5">
            <div v-for="p in data.by_product" :key="p.product" class="flex items-center gap-2">
              <span class="text-xs text-gray-400 truncate flex-1">{{ p.product }}</span>
              <div class="flex items-center gap-1 flex-shrink-0">
                <span v-if="p.won" class="text-xs px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300">{{ p.won }}W</span>
                <span v-if="p.lost" class="text-xs px-1.5 py-0.5 rounded bg-red-900/50 text-red-300">{{ p.lost }}L</span>
              </div>
            </div>
          </div>
        </div>

        <!-- By Segmen -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-building mr-1.5 text-primary-400" />Per Segmen</div>
          <div class="space-y-2.5">
            <div v-for="sg in data.by_segmen" :key="sg.segmen">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-400">{{ sg.segmen }}</span>
                <div class="flex items-center gap-1">
                  <span v-if="sg.won" class="text-xs px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300">{{ sg.won }}W</span>
                  <span v-if="sg.lost" class="text-xs px-1.5 py-0.5 rounded bg-red-900/50 text-red-300">{{ sg.lost }}L</span>
                </div>
              </div>
              <div class="flex h-2 rounded overflow-hidden bg-apex-card">
                <div class="bg-emerald-500"
                     :style="`width:${sg.won+sg.lost ? sg.won/(sg.won+sg.lost)*100 : 0}%`" />
                <div class="bg-red-500"
                     :style="`width:${sg.won+sg.lost ? sg.lost/(sg.won+sg.lost)*100 : 0}%`" />
              </div>
            </div>
          </div>
        </div>

        <!-- By Sales -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-user-tie mr-1.5 text-primary-400" />Per Sales</div>
          <div class="space-y-3">
            <div v-for="s in data.by_sales" :key="s.sales_owner" class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-full bg-primary-800/50 flex items-center justify-center text-xs font-bold text-primary-300 flex-shrink-0">
                {{ s.sales_owner.charAt(0) }}
              </div>
              <div class="flex-1">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-300">{{ s.sales_owner }}</span>
                  <span class="text-gray-500">{{ s.won + s.lost }} closed</span>
                </div>
                <div class="flex h-2 rounded overflow-hidden bg-apex-card">
                  <div class="bg-emerald-500" :style="`width:${s.won+s.lost ? s.won/(s.won+s.lost)*100 : 0}%`" />
                  <div class="bg-red-500" :style="`width:${s.won+s.lost ? s.lost/(s.won+s.lost)*100 : 0}%`" />
                </div>
              </div>
              <div class="text-xs text-gray-500 flex-shrink-0 text-right">
                <span class="text-emerald-400">{{ s.won }}W</span>/<span class="text-red-400">{{ s.lost }}L</span>
              </div>
            </div>
            <div v-if="!data.by_sales?.length" class="text-center text-gray-600 text-sm py-4">Belum ada data</div>
          </div>
        </div>
      </div>

      <!-- ── Detail Tabel Won + Lost ────────────────────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Won -->
        <div class="card">
          <div class="section-title text-emerald-400 mb-3">
            <i class="fa-solid fa-trophy mr-1.5" />Deals Won ({{ data.won_leads?.length }})
          </div>
          <div v-if="data.won_leads?.length" class="space-y-2">
            <div v-for="l in data.won_leads" :key="l.lead_id"
                 class="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-900/10 border border-emerald-900/30">
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`"
                          class="text-sm font-medium text-gray-200 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <div class="text-xs text-gray-500 mt-0.5">
                  {{ l.product || '—' }} · {{ l.segmen || '—' }} · {{ l.sales_owner || '—' }}
                </div>
              </div>
              <div class="text-right flex-shrink-0 flex flex-col items-end gap-1">
                <div class="text-sm font-bold text-emerald-400">{{ fmt.rupiah(l.deal_value || l.propose_value) }}</div>
                <div class="text-xs text-gray-600">{{ fmt.tgl(l.exp_close_date || l.updated_at) }}</div>
                <button @click="openAlasan(l)" class="text-xs px-2 py-0.5 rounded bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-700/60 transition-colors">
                  Catat Alasan
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-600 text-sm">Belum ada deal yang Won</div>
        </div>

        <!-- Lost -->
        <div class="card">
          <div class="section-title text-red-400 mb-3">
            <i class="fa-solid fa-times-circle mr-1.5" />Deals Lost ({{ data.lost_leads?.length }})
          </div>
          <div v-if="data.lost_leads?.length" class="space-y-2">
            <div v-for="l in data.lost_leads" :key="l.lead_id"
                 class="flex items-center gap-3 p-2.5 rounded-lg bg-red-900/10 border border-red-900/30">
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`"
                          class="text-sm font-medium text-gray-200 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <div class="text-xs text-gray-500 mt-0.5">
                  {{ l.product || '—' }} · {{ l.segmen || '—' }} · {{ l.sales_owner || '—' }}
                </div>
                <div v-if="l.last_fu_notes" class="text-xs text-gray-600 truncate italic mt-0.5">"{{ l.last_fu_notes }}"</div>
              </div>
              <div class="text-right flex-shrink-0 flex flex-col items-end gap-1">
                <div class="text-sm font-bold text-red-400">{{ fmt.rupiah(l.propose_value) }}</div>
                <div class="text-xs text-gray-600">{{ fmt.tgl(l.updated_at) }}</div>
                <button @click="openAlasan(l)" class="text-xs px-2 py-0.5 rounded bg-red-800/60 border border-red-700/50 text-red-300 hover:bg-red-700/60 transition-colors">
                  Catat Alasan
                </button>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-600 text-sm">Belum ada deals yang Lost</div>
        </div>
      </div>

    </template>
  </div>

  <!-- Modal Catat Alasan -->
  <Teleport to="body">
    <div v-if="modal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4" @click.self="closeModal">
      <div class="bg-apex-surface border border-apex-border rounded-xl w-full max-w-lg p-6 shadow-2xl">
        <div class="flex items-start justify-between mb-4">
          <div>
            <h3 class="text-base font-bold text-gray-100">Catat Alasan {{ modal.lead?.stage }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ modal.lead?.nama_company }}</p>
          </div>
          <button @click="closeModal" class="text-gray-500 hover:text-gray-300 text-xl leading-none">&times;</button>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Alasan {{ modal.lead?.stage }} <span class="text-red-400">*</span></label>
            <textarea v-model="form.alasan" rows="3" placeholder="Jelaskan alasan utama..."
              class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-primary-500 resize-none" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Kompetitor (jika ada)</label>
            <input v-model="form.kompetitor" type="text" placeholder="Nama kompetitor..."
              class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-primary-500" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-400 mb-1">Lesson Learned</label>
            <textarea v-model="form.lesson_learned" rows="2" placeholder="Apa yang bisa dipelajari..."
              class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-primary-500 resize-none" />
          </div>
        </div>

        <div class="flex gap-3 mt-5">
          <button @click="closeModal" class="flex-1 px-4 py-2 rounded-lg border border-apex-border text-sm text-apex-muted hover:bg-apex-card transition-colors">Batal</button>
          <button @click="saveAlasan" :disabled="saving || !form.alasan.trim()"
            class="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
            {{ saving ? 'Menyimpan...' : 'Simpan' }}
          </button>
        </div>

        <p v-if="saveError" class="text-xs text-red-400 mt-3 text-center">{{ saveError }}</p>
        <p v-if="saveSuccess" class="text-xs text-emerald-400 mt-3 text-center">Alasan berhasil disimpan!</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, post } = useApi()
const fmt = useFormat()
const { data, pending } = await useAsyncData('winloss', () => get('/v1/winloss'), { server: false })

const total   = computed(() => (data.value?.summary?.won ?? 0) + (data.value?.summary?.lost ?? 0))
const wonPct  = computed(() => total.value ? Math.round((data.value?.summary?.won ?? 0) / total.value * 100) : 0)
const lostPct = computed(() => total.value ? Math.round((data.value?.summary?.lost ?? 0) / total.value * 100) : 0)

// Modal state
const modal = reactive({ open: false, lead: null as any })
const form  = reactive({ alasan: '', kompetitor: '', lesson_learned: '' })
const saving = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)

async function openAlasan(lead: any) {
  modal.lead = lead
  modal.open = true
  form.alasan = ''
  form.kompetitor = ''
  form.lesson_learned = ''
  saveError.value = ''
  saveSuccess.value = false
  // Prefill existing reason if any
  try {
    const existing = await get(`/v1/winloss/reason/${lead.lead_id}`)
    if (existing) {
      form.alasan = existing.alasan || ''
      form.kompetitor = existing.kompetitor || ''
      form.lesson_learned = existing.lesson_learned || ''
    }
  } catch {}
}

function closeModal() {
  modal.open = false
}

async function saveAlasan() {
  if (!form.alasan.trim()) return
  saving.value = true
  saveError.value = ''
  saveSuccess.value = false
  try {
    await post('/v1/winloss/reason', {
      lead_id: modal.lead.lead_id,
      alasan: form.alasan,
      kompetitor: form.kompetitor,
      lesson_learned: form.lesson_learned,
    })
    saveSuccess.value = true
    setTimeout(() => closeModal(), 1200)
  } catch (e: any) {
    saveError.value = e?.data?.detail || 'Gagal menyimpan. Coba lagi.'
  } finally {
    saving.value = false
  }
}
</script>
