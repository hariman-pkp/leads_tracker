<template>
  <div>
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-bolt text-yellow-400 mr-2" />Hari Ini</h1>
        <p class="page-subtitle">{{ data?.date ? fmt.tgl(data.date) : '' }} — Agenda Follow-Up</p>
      </div>
      <button @click="refresh" class="btn-secondary btn-sm">
        <i class="fa-solid fa-rotate" />Refresh
      </button>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">
      <!-- Summary chips -->
      <div class="flex flex-wrap gap-3 mb-6">
        <div class="card-sm flex items-center gap-2.5 px-4 border"
             :class="data.overdue?.length ? 'border-red-700/50 bg-red-900/10' : 'border-navy-700'">
          <i class="fa-solid fa-circle-exclamation" :class="data.overdue?.length ? 'text-red-400' : 'text-gray-600'" />
          <div>
            <div class="text-sm font-bold" :class="data.overdue?.length ? 'text-red-300' : 'text-gray-500'">
              {{ data.overdue?.length }} Overdue
            </div>
            <div class="text-xs text-gray-600">Melewati jadwal</div>
          </div>
        </div>
        <div class="card-sm flex items-center gap-2.5 px-4 border"
             :class="data.due_today?.length ? 'border-yellow-700/50 bg-yellow-900/10' : 'border-navy-700'">
          <i class="fa-solid fa-calendar-day" :class="data.due_today?.length ? 'text-yellow-400' : 'text-gray-600'" />
          <div>
            <div class="text-sm font-bold" :class="data.due_today?.length ? 'text-yellow-300' : 'text-gray-500'">
              {{ data.due_today?.length }} Hari Ini
            </div>
            <div class="text-xs text-gray-600">Jadwal hari ini</div>
          </div>
        </div>
        <div class="card-sm flex items-center gap-2.5 px-4 border border-navy-700">
          <i class="fa-solid fa-calendar-week text-blue-400" />
          <div>
            <div class="text-sm font-bold text-blue-300">{{ data.upcoming?.length }} Mendatang</div>
            <div class="text-xs text-gray-600">7 hari ke depan</div>
          </div>
        </div>
        <div class="card-sm flex items-center gap-2.5 px-4 border border-navy-700">
          <i class="fa-solid fa-hourglass-half text-orange-400" />
          <div>
            <div class="text-sm font-bold text-orange-300">{{ data.stale?.length }} Stale</div>
            <div class="text-xs text-gray-600">&gt;30 hari tanpa FU</div>
          </div>
        </div>
        <div class="card-sm flex items-center gap-2.5 px-4 border border-emerald-700/40 bg-emerald-900/10 ml-auto">
          <i class="fa-solid fa-check-circle text-emerald-400" />
          <div>
            <div class="text-sm font-bold text-emerald-300">{{ data.fu_done_today }} FU Selesai</div>
            <div class="text-xs text-gray-600">Hari ini</div>
          </div>
        </div>
      </div>

      <!-- REKOMENDASI AKSI -->
      <div v-if="rekom" class="card mb-5">
        <div class="section-title text-primary-400 mb-3">
          <i class="fa-solid fa-crosshairs mr-1.5" />Rekomendasi Aksi
          <span class="ml-2 text-xs text-apex-muted font-normal">({{ rekom.items?.length }} item)</span>
        </div>
        <div v-if="rekom.items?.length" class="space-y-2">
          <NuxtLink v-for="(item, i) in rekom.items" :key="i"
            :to="`/pipeline/${item.lead_id}`"
            class="flex items-center gap-3 p-2.5 rounded-lg bg-navy-800/40 hover:bg-navy-700/50 transition-colors cursor-pointer">
            <div :class="[
              'w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0',
              item.priority === 'critical' ? 'bg-red-900/60' :
              item.priority === 'high'     ? 'bg-orange-900/60' :
              item.priority === 'medium'   ? 'bg-amber-900/60' : 'bg-blue-900/60'
            ]">
              <i :class="`fa-solid ${item.icon} ${item.color}`" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span :class="[
                  'text-xs px-1.5 py-0.5 rounded font-medium',
                  item.priority === 'critical' ? 'bg-red-900/50 text-red-300' :
                  item.priority === 'high'     ? 'bg-orange-900/50 text-orange-300' :
                  item.priority === 'medium'   ? 'bg-amber-900/50 text-amber-300' : 'bg-blue-900/50 text-blue-300'
                ]">{{ item.label }}</span>
                <span :class="fmt.priorityClass(item.prioritas)" class="text-xs">{{ item.prioritas }}</span>
                <span class="text-sm font-medium text-gray-200 truncate">{{ item.nama_company }}</span>
              </div>
              <div class="text-xs text-apex-muted">{{ item.action }}</div>
            </div>
            <i class="fa-solid fa-chevron-right text-xs text-apex-muted flex-shrink-0" />
          </NuxtLink>
        </div>
        <div v-else class="flex items-center gap-3 py-4">
          <i class="fa-solid fa-circle-check text-emerald-400 text-xl" />
          <span class="text-sm text-gray-400">Tidak ada item yang perlu perhatian hari ini.</span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">

        <!-- OVERDUE -->
        <div class="card">
          <div class="section-title text-red-400 mb-3">
            <i class="fa-solid fa-circle-exclamation mr-1.5" />Overdue ({{ data.overdue?.length }})
          </div>
          <div v-if="data.overdue?.length" class="space-y-2">
            <div v-for="l in overdueSlice" :key="l.lead_id"
                 class="flex items-center gap-3 p-2.5 rounded-lg bg-red-900/10 border border-red-900/30 hover:border-red-700/50 transition-colors">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span :class="fmt.priorityClass(l.prioritas)" class="flex-shrink-0">{{ l.prioritas }}</span>
                  <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-sm font-medium text-gray-200 hover:text-primary-300 truncate">
                    {{ l.nama_company }}
                  </NuxtLink>
                </div>
                <div class="text-xs text-gray-500">{{ l.stage }} · {{ l.sales_owner || 'Unassigned' }}</div>
                <div v-if="l.last_fu_notes" class="text-xs text-gray-600 truncate mt-0.5 italic">"{{ l.last_fu_notes }}"</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs font-bold text-red-400">{{ l.days_overdue }}h lalu</div>
                <div class="text-xs text-gray-600">{{ fmt.rupiah(l.propose_value) }}</div>
              </div>
            </div>
            <AppPagination v-if="overduePages > 1" v-model:page="overduePage"
              :total-pages="overduePages" :total="data.overdue.length" :per-page="PER" class="mt-2"/>
          </div>
          <div v-else class="text-center py-8">
            <i class="fa-solid fa-circle-check text-emerald-400 text-2xl mb-2 block" />
            <div class="text-sm text-gray-500">Tidak ada FU yang overdue 🎉</div>
          </div>
        </div>

        <!-- DUE TODAY -->
        <div class="card">
          <div class="section-title text-yellow-400 mb-3">
            <i class="fa-solid fa-calendar-day mr-1.5" />Jadwal Hari Ini ({{ data.due_today?.length }})
          </div>
          <div v-if="data.due_today?.length" class="space-y-2">
            <div v-for="l in dueTodaySlice" :key="l.lead_id"
                 class="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-900/10 border border-yellow-900/30 hover:border-yellow-700/50 transition-colors">
              <i :class="fuTypeIcon(l.next_fu_type)" class="text-base flex-shrink-0 w-4 text-center" :title="fuTypeLabel(l.next_fu_type)" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-0.5">
                  <span :class="fmt.priorityClass(l.prioritas)" class="flex-shrink-0">{{ l.prioritas }}</span>
                  <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-sm font-medium text-gray-200 hover:text-primary-300 truncate">
                    {{ l.nama_company }}
                  </NuxtLink>
                </div>
                <div class="text-xs text-gray-500">{{ l.stage }} · {{ l.sales_owner || 'Unassigned' }}</div>
                <div v-if="l.last_fu_notes" class="text-xs text-gray-600 truncate mt-0.5 italic">"{{ l.last_fu_notes }}"</div>
              </div>
              <div class="text-right flex-shrink-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-xs text-primary-400 hover:text-primary-300 block mb-1">
                  FU Now →
                </NuxtLink>
                <div class="text-xs text-gray-600">{{ fmt.rupiah(l.propose_value) }}</div>
              </div>
            </div>
            <AppPagination v-if="dueTodayPages > 1" v-model:page="dueTodayPage"
              :total-pages="dueTodayPages" :total="data.due_today.length" :per-page="PER" class="mt-2"/>
          </div>
          <div v-else class="text-center py-8">
            <i class="fa-solid fa-inbox text-gray-600 text-2xl mb-2 block" />
            <div class="text-sm text-gray-500">Tidak ada jadwal FU hari ini</div>
          </div>
        </div>

        <!-- UPCOMING 7 DAYS -->
        <div class="card">
          <div class="section-title text-blue-400 mb-3">
            <i class="fa-solid fa-calendar-week mr-1.5" />7 Hari ke Depan ({{ data.upcoming?.length }})
          </div>
          <div v-if="data.upcoming?.length" class="space-y-1.5">
            <div v-for="l in upcomingSlice" :key="l.lead_id"
                 class="flex items-center gap-3 py-2 border-b border-navy-800 last:border-0">
              <i :class="fuTypeIcon(l.next_fu_type)" class="text-sm flex-shrink-0 w-4 text-center" :title="fuTypeLabel(l.next_fu_type)" />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span :class="fmt.priorityClass(l.prioritas)" class="flex-shrink-0">{{ l.prioritas }}</span>
                  <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-sm text-gray-300 hover:text-primary-300 truncate">
                    {{ l.nama_company }}
                  </NuxtLink>
                </div>
                <div class="text-xs text-gray-500 mt-0.5">{{ l.stage }} · {{ l.sales_owner || '—' }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs font-medium text-blue-300">{{ fmt.tgl(l.next_fu_date) }}</div>
                <div class="text-xs text-gray-600">{{ fmt.rupiah(l.propose_value) }}</div>
              </div>
            </div>
            <AppPagination v-if="upcomingPages > 1" v-model:page="upcomingPage"
              :total-pages="upcomingPages" :total="data.upcoming.length" :per-page="PER" class="mt-2"/>
          </div>
          <div v-else class="text-center py-8 text-sm text-gray-500">
            Tidak ada jadwal FU minggu ini
          </div>
        </div>

        <!-- STALE -->
        <div class="card">
          <div class="section-title text-orange-400 mb-3">
            <i class="fa-solid fa-hourglass-half mr-1.5" />Perlu Direaktivasi ({{ data.stale?.length }})
          </div>
          <div v-if="data.stale?.length" class="space-y-1.5">
            <div v-for="l in staleSlice" :key="l.lead_id"
                 class="flex items-center gap-3 py-2 border-b border-navy-800 last:border-0">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span :class="fmt.stageClass(l.stage)" class="flex-shrink-0">{{ l.stage }}</span>
                  <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-sm text-gray-300 hover:text-primary-300 truncate">
                    {{ l.nama_company }}
                  </NuxtLink>
                </div>
                <div class="text-xs text-gray-500 mt-0.5">{{ l.sales_owner || 'Unassigned' }} · {{ fmt.rupiah(l.propose_value) }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-sm font-bold"
                     :class="l.days_since_fu > 90 ? 'text-red-400' : l.days_since_fu > 60 ? 'text-orange-400' : 'text-yellow-400'">
                  {{ l.days_since_fu >= 9999 ? '∞' : l.days_since_fu + ' hr' }}
                </div>
                <div class="text-xs text-gray-600">tanpa FU</div>
              </div>
            </div>
            <AppPagination v-if="stalePages > 1" v-model:page="stalePage"
              :total-pages="stalePages" :total="data.stale.length" :per-page="PER" class="mt-2"/>
          </div>
          <div v-else class="text-center py-8">
            <i class="fa-solid fa-check-circle text-emerald-400 text-2xl mb-2 block" />
            <div class="text-sm text-gray-500">Semua lead aktif terjadwal 👍</div>
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get } = useApi()
const fmt = useFormat()

const FU_TYPE_ICON: Record<string, string> = {
  kunjungan: 'fa-solid fa-car text-emerald-400',
  meeting:   'fa-solid fa-handshake text-blue-400',
  online:    'fa-solid fa-video text-purple-400',
  whatsapp:  'fa-brands fa-whatsapp text-green-400',
  call:      'fa-solid fa-phone text-yellow-400',
}
const FU_TYPE_LABEL: Record<string, string> = {
  kunjungan: 'Kunjungan', meeting: 'Meeting', online: 'Online',
  whatsapp: 'WhatsApp', call: 'Call',
}
function fuTypeIcon(t: string) { return FU_TYPE_ICON[t] ?? FU_TYPE_ICON.call }
function fuTypeLabel(t: string) { return FU_TYPE_LABEL[t] ?? t }
const { data, pending, refresh: refreshToday } = await useAsyncData('today', () => get('/v1/today'), { server: false })
const { data: rekom, refresh: refreshRekom } = await useAsyncData('fokus', () => get('/v1/recommendations/daily'), { server: false })

async function refresh() {
  await Promise.all([refreshToday(), refreshRekom()])
}

const PER = 5

const overduePage   = ref(1)
const dueTodayPage  = ref(1)
const upcomingPage  = ref(1)
const stalePage     = ref(1)

const overduePages   = computed(() => Math.ceil((data.value?.overdue?.length  ?? 0) / PER) || 1)
const dueTodayPages  = computed(() => Math.ceil((data.value?.due_today?.length ?? 0) / PER) || 1)
const upcomingPages  = computed(() => Math.ceil((data.value?.upcoming?.length  ?? 0) / PER) || 1)
const stalePages     = computed(() => Math.ceil((data.value?.stale?.length     ?? 0) / PER) || 1)

function slice(arr: any[] | undefined, page: number) {
  const start = (page - 1) * PER
  return (arr ?? []).slice(start, start + PER)
}

const overdueSlice  = computed(() => slice(data.value?.overdue,   overduePage.value))
const dueTodaySlice = computed(() => slice(data.value?.due_today, dueTodayPage.value))
const upcomingSlice = computed(() => slice(data.value?.upcoming,  upcomingPage.value))
const staleSlice    = computed(() => slice(data.value?.stale,     stalePage.value))
</script>
