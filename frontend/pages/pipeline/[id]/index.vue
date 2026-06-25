<template>
  <div>
    <div class="flex items-center gap-3 mb-5">
      <NuxtLink to="/pipeline" class="btn-ghost btn-sm rounded-lg">
        <i class="fa-solid fa-arrow-left" />
      </NuxtLink>
      <div>
        <h1 class="page-title">{{ data?.lead?.nama_company }}</h1>
        <p class="page-subtitle">{{ data?.lead?.lead_id }} · {{ data?.lead?.product }}</p>
      </div>
      <div class="ml-auto flex gap-2">
        <NuxtLink :to="`/pipeline/${route.params.id}/edit`" class="btn-secondary btn-sm">
          <i class="fa-solid fa-pen" />Edit
        </NuxtLink>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Detail card -->
        <div class="lg:col-span-2 space-y-5">
          <div class="card">
            <div class="section-title">Informasi Lead</div>
            <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <InfoRow label="Stage">
                <span :class="fmt.stageClass(data.lead.stage)">{{ data.lead.stage }}</span>
              </InfoRow>
              <InfoRow label="Prioritas">
                <span :class="fmt.priorityClass(data.lead.prioritas)">{{ data.lead.prioritas }}</span>
              </InfoRow>
              <InfoRow label="Segmen" :val="data.lead.segmen" />
              <InfoRow label="Sub Segmen" :val="data.lead.sub_segmen" />
              <InfoRow label="Contact Person" :val="data.lead.contact_person" />
              <InfoRow label="Sales Owner" :val="data.lead.sales_owner" />
              <InfoRow label="Organisasi">
                <span v-if="data.lead.organisasi"
                      class="font-mono text-xs bg-navy-800 text-primary-300 px-2 py-0.5 rounded">
                  {{ data.lead.organisasi }}
                </span>
                <span v-else class="text-gray-600">—</span>
              </InfoRow>
              <InfoRow label="Tanggal Masuk" :val="fmt.tgl(data.lead.tgl_masuk)" />
              <InfoRow label="Exp. Close" :val="fmt.tgl(data.lead.exp_close_date)" />
              <InfoRow label="Propose Value">
                <span class="text-primary-300 font-medium">{{ fmt.rupiahFull(data.lead.propose_value) }}</span>
              </InfoRow>
              <InfoRow label="Deal Value">
                <span class="text-green-300 font-medium">{{ fmt.rupiahFull(data.lead.deal_value) }}</span>
              </InfoRow>
              <InfoRow label="Probability" :val="`${data.lead.probability}%`" />
              <InfoRow label="Weighted Value">
                <span class="text-yellow-300">{{ fmt.rupiahFull(data.lead.weighted_value) }}</span>
              </InfoRow>
            </div>
            <div v-if="data.lead.remarks" class="mt-4 pt-4 border-t border-navy-800 text-sm text-gray-400">
              <span class="text-gray-500 text-xs uppercase tracking-wider">Remarks: </span>
              {{ data.lead.remarks }}
            </div>
          </div>

          <!-- FU Log -->
          <div class="card">
            <div class="flex items-center justify-between mb-3">
              <div class="section-title mb-0"><i class="fa-solid fa-phone-alt mr-1" />Follow-Up Log ({{ data.fu_logs?.length || 0 }})</div>
              <button @click="showFuForm = !showFuForm" class="btn-secondary btn-sm">
                <i class="fa-solid fa-plus" />Catat FU
              </button>
            </div>

            <!-- FU Form -->
            <form v-if="showFuForm" @submit.prevent="submitFu" class="mb-4 p-4 bg-navy-800/50 rounded-lg space-y-3 border border-navy-700">
              <!-- Template picker -->
              <div v-if="fuTemplates.length" class="flex gap-2 flex-wrap">
                <span class="text-xs text-gray-500 self-center">Template:</span>
                <button v-for="t in fuTemplates" :key="t.id" type="button"
                        @click="applyTemplate(t)"
                        class="text-xs px-2.5 py-1 rounded-full bg-navy-700 hover:bg-primary-800/60 border border-navy-600 hover:border-primary-600 text-gray-300 hover:text-primary-200 transition-colors">
                  {{ t.nama }}
                </button>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="form-label">Tanggal FU</label>
                  <input v-model="fuForm.tgl_fu" type="date" class="form-input" required />
                </div>
                <div>
                  <label class="form-label">Metode</label>
                  <select v-model="fuForm.metode_fu" class="form-select">
                    <option>Phone</option><option>WhatsApp</option><option>Email</option>
                    <option>Meeting</option><option>Video Call</option>
                  </select>
                </div>
              </div>
              <div>
                <label class="form-label">Hasil FU</label>
                <select v-model="fuForm.hasil_fu" class="form-select">
                  <option>Interested</option><option>Follow Up Later</option>
                  <option>Send Proposal</option><option>Not Interested</option><option>No Response</option>
                </select>
              </div>
              <div>
                <label class="form-label">Catatan</label>
                <textarea v-model="fuForm.catatan_fu" class="form-textarea h-20" placeholder="Hasil diskusi, kesepakatan, next step..." />
              </div>
              <div>
                <label class="form-label">Next FU Date</label>
                <input v-model="fuForm.tgl_fu_berikut" type="date" class="form-input" />
              </div>
              <div class="flex gap-2 justify-end">
                <button type="button" @click="showFuForm = false" class="btn-ghost btn-sm">Batal</button>
                <button type="submit" class="btn-primary btn-sm" :disabled="submitting">
                  <i v-if="submitting" class="fa-solid fa-circle-notch fa-spin" />
                  Simpan FU
                </button>
              </div>
            </form>

            <div v-if="!data.fu_logs?.length" class="empty-state py-8">
              <i class="fa-solid fa-phone-slash empty-icon" />
              <div class="empty-text">Belum ada catatan follow-up</div>
            </div>
            <div v-else class="space-y-3">
              <div v-for="log in data.fu_logs" :key="log.fu_id"
                class="p-3 bg-navy-800/40 rounded-lg border border-navy-700/50">
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-xs font-medium text-gray-200">{{ fmt.tgl(log.tgl_fu) }}</span>
                    <span class="badge-blue text-xs">{{ log.metode_fu }}</span>
                    <span :class="log.hasil_fu === 'Interested' ? 'badge-green' : 'badge-gray'" class="text-xs">
                      {{ log.hasil_fu }}
                    </span>
                  </div>
                  <span class="text-xs text-gray-500 flex-shrink-0">{{ log.fu_id }}</span>
                </div>
                <p v-if="log.catatan_fu" class="text-sm text-gray-300 mt-2">{{ log.catatan_fu }}</p>
                <p v-if="log.tgl_fu_berikut" class="text-xs text-yellow-400 mt-1">
                  <i class="fa-solid fa-calendar-check mr-1" />Next FU: {{ fmt.tgl(log.tgl_fu_berikut) }}
                </p>
              </div>
            </div>
          </div>
          <!-- Riwayat Perubahan -->
          <div class="card">
            <button class="w-full flex items-center justify-between" @click="showHistory = !showHistory">
              <div class="section-title mb-0">
                <i class="fa-solid fa-clock-rotate-left mr-1 text-primary-400" />Riwayat Perubahan
                <span v-if="history.length" class="ml-2 text-xs text-gray-500 font-normal">({{ history.length }})</span>
              </div>
              <i class="fa-solid text-gray-500 text-xs" :class="showHistory ? 'fa-chevron-up' : 'fa-chevron-down'" />
            </button>
            <template v-if="showHistory">
              <div v-if="historyLoading" class="pt-4 text-center text-xs text-gray-600">
                <i class="fa-solid fa-circle-notch fa-spin mr-1" />Memuat...
              </div>
              <div v-else-if="!history.length" class="pt-4 text-center text-xs text-gray-600">
                Belum ada riwayat perubahan.
              </div>
              <div v-else class="mt-3 space-y-0 divide-y divide-navy-800/60">
                <div v-for="h in history" :key="h.id" class="py-2.5 flex gap-3 items-start text-xs">
                  <div class="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 flex-shrink-0" />
                  <div class="flex-1 min-w-0">
                    <span class="text-gray-400">{{ h.field_name }}</span>
                    <span class="mx-1.5 text-gray-600">·</span>
                    <span v-if="h.old_value" class="line-through text-gray-600">{{ h.old_value }}</span>
                    <span v-if="h.old_value && h.new_value" class="mx-1 text-gray-600">→</span>
                    <span class="text-gray-200">{{ h.new_value || '—' }}</span>
                  </div>
                  <div class="flex-shrink-0 text-right text-gray-600">
                    <div>{{ fmt.tgl(h.changed_at) }}</div>
                    <div class="text-[10px]">{{ h.changed_by }}</div>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- Right col: FU status + Contacts -->
        <div class="space-y-5">
          <div class="card">
            <div class="section-title"><i class="fa-solid fa-calendar-check mr-1" />Status Follow-Up</div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-400">Last FU</span>
                <span class="text-gray-200">{{ fmt.tgl(data.lead.last_fu_date) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Next FU</span>
                <span :class="isOverdue(data.lead.next_fu_date) ? 'text-red-400' : 'text-gray-200'">
                  {{ fmt.tgl(data.lead.next_fu_date) }}
                </span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Total FU</span>
                <span class="text-gray-200">{{ data.lead.fu_count || 0 }}x</span>
              </div>
              <div v-if="data.lead.last_fu_notes" class="pt-2 text-xs text-gray-400 border-t border-navy-800">
                {{ data.lead.last_fu_notes }}
              </div>
            </div>
          </div>

          <div class="card">
            <div class="section-title"><i class="fa-solid fa-address-book mr-1" />Contacts ({{ data.contacts?.length || 0 }})</div>
            <div v-if="!data.contacts?.length" class="empty-state py-6">
              <i class="fa-solid fa-user-slash empty-icon" />
              <div class="empty-text">Belum ada kontak</div>
            </div>
            <div v-else class="grid grid-cols-2 gap-2">
              <div v-for="c in data.contacts" :key="c.id"
                   class="p-3 bg-navy-800/40 rounded-xl border border-navy-700/50 flex flex-col gap-2 hover:border-primary-700/50 transition-colors">
                <!-- Avatar / foto -->
                <div class="flex items-center gap-2">
                  <img v-if="c.foto" :src="`/storage/${c.foto}`" :alt="c.nama_contact"
                       class="w-10 h-10 rounded-full object-cover ring-2 ring-primary-700/30 flex-shrink-0" />
                  <div v-else
                       class="w-10 h-10 rounded-full bg-primary-900/60 text-primary-300 flex items-center justify-center text-sm font-bold flex-shrink-0 ring-2 ring-primary-700/30">
                    {{ c.nama_contact?.charAt(0)?.toUpperCase() ?? '?' }}
                  </div>
                  <div class="min-w-0">
                    <div class="font-semibold text-xs text-gray-100 truncate">{{ c.nama_contact }}</div>
                    <div class="text-[11px] text-gray-500 truncate">{{ c.jabatan || '—' }}</div>
                  </div>
                </div>
                <!-- No HP -->
                <div v-if="c.no_hp" class="flex items-center gap-1.5">
                  <i class="fa-solid fa-phone text-[10px] text-gray-600 flex-shrink-0" />
                  <a :href="`tel:${c.no_hp}`" class="text-[11px] text-primary-400 hover:text-primary-300 truncate">
                    {{ c.no_hp }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { get, post } = useApi()
const fmt = useFormat()

const leadId = route.params.id as string
const { data, pending, refresh } = await useAsyncData(`lead-${leadId}`, () =>
  get(`/v1/pipeline/${leadId}`),
  { server: false }
)

// ── FU Form ───────────────────────────────────────────────────────────────
const showFuForm = ref(false)
const submitting  = ref(false)
const fuForm = reactive({
  lead_id: leadId,
  tgl_fu: fmt.todayStr(),
  metode_fu: 'Phone',
  hasil_fu: 'Interested',
  catatan_fu: '',
  tgl_fu_berikut: '',
  status: 'Done',
})

async function submitFu() {
  submitting.value = true
  try {
    await post('/v1/followup', { ...fuForm })
    showFuForm.value = false
    fuForm.catatan_fu = ''
    fuForm.tgl_fu_berikut = ''
    await refresh()
  } finally {
    submitting.value = false
  }
}

// ── FU Templates ──────────────────────────────────────────────────────────
const fuTemplates = ref<any[]>([])

async function loadTemplates() {
  try { fuTemplates.value = await get('/v1/fu-templates') } catch {}
}

function applyTemplate(t: any) {
  fuForm.catatan_fu = t.catatan
  if (t.hasil_fu)  fuForm.hasil_fu  = t.hasil_fu
  if (t.metode_fu) fuForm.metode_fu = t.metode_fu
}

// ── Riwayat Perubahan ─────────────────────────────────────────────────────
const showHistory   = ref(false)
const historyLoading = ref(false)
const history       = ref<any[]>([])

watch(showHistory, async (v) => {
  if (v && !history.value.length) {
    historyLoading.value = true
    try { history.value = (await get(`/v1/pipeline/${leadId}/history`)).history }
    catch {}
    finally { historyLoading.value = false }
  }
})

function isOverdue(d: string | null) {
  if (!d) return false
  return d < fmt.todayStr()
}

onMounted(loadTemplates)
</script>
