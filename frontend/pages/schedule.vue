<template>
  <div>
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-calendar-check text-primary-400 mr-2" />FU Schedule</h1>
        <p class="page-subtitle">{{ data?.total ?? 0 }} lead terjadwal · {{ data?.from }} s/d {{ data?.to }}</p>
      </div>
      <button @click="refresh" class="btn-secondary btn-sm" :disabled="pending">
        <i :class="`fa-solid fa-rotate ${pending ? 'fa-spin' : ''}`" />Refresh
      </button>
    </div>

    <div v-if="pending" class="flex justify-center py-16">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">

      <!-- Summary chips -->
      <div class="flex flex-wrap gap-3 mb-5">
        <div class="card-sm flex items-center gap-2.5 px-4 border"
             :class="overdueItems.length ? 'border-red-700/50 bg-red-900/10' : 'border-navy-700'">
          <i class="fa-solid fa-circle-exclamation" :class="overdueItems.length ? 'text-red-400' : 'text-gray-600'" />
          <div>
            <div class="text-sm font-bold" :class="overdueItems.length ? 'text-red-300' : 'text-gray-500'">
              {{ overdueItems.length }} Overdue
            </div>
            <div class="text-xs text-gray-600">Melewati jadwal</div>
          </div>
        </div>
        <div class="card-sm flex items-center gap-2.5 px-4 border"
             :class="todayItems.length ? 'border-yellow-700/50 bg-yellow-900/10' : 'border-navy-700'">
          <i class="fa-solid fa-calendar-day" :class="todayItems.length ? 'text-yellow-400' : 'text-gray-600'" />
          <div>
            <div class="text-sm font-bold" :class="todayItems.length ? 'text-yellow-300' : 'text-gray-500'">
              {{ todayItems.length }} Hari Ini
            </div>
            <div class="text-xs text-gray-600">Jadwal hari ini</div>
          </div>
        </div>
        <div class="card-sm flex items-center gap-2.5 px-4 border border-navy-700">
          <i class="fa-solid fa-calendar-week text-blue-400" />
          <div>
            <div class="text-sm font-bold text-blue-300">{{ upcomingItems.length }} Mendatang</div>
            <div class="text-xs text-gray-600">{{ data.days }} hari ke depan</div>
          </div>
        </div>
      </div>

      <!-- Groups -->
      <template v-for="group in scheduleGroups" :key="group.status">
        <div v-if="group.items.length" class="mb-6">
          <div class="section-title mb-3"
               :class="group.status === 'Overdue' ? 'text-red-400' : group.status === 'Today' ? 'text-yellow-400' : 'text-blue-400'">
            <i :class="`fa-solid ${group.icon} mr-1.5`" />
            {{ group.label }} ({{ group.items.length }})
          </div>
          <div class="card overflow-x-auto">
            <table class="tbl">
              <thead>
                <tr>
                  <th>Perusahaan</th>
                  <th>Stage</th>
                  <th>Prioritas</th>
                  <th>Next FU</th>
                  <th>Sales</th>
                  <th class="text-right">Nilai</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in group.slice" :key="l.lead_id"
                    :class="group.status === 'Overdue' ? 'bg-red-900/5' : group.status === 'Today' ? 'bg-yellow-900/5' : ''">
                  <td>
                    <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-primary-300 hover:text-primary-200 font-medium">
                      {{ l.nama_company }}
                    </NuxtLink>
                    <div v-if="l.product" class="text-xs text-gray-600 mt-0.5">{{ l.product }}</div>
                  </td>
                  <td><span :class="fmt.stageClass(l.stage)">{{ l.stage }}</span></td>
                  <td><span :class="fmt.priorityClass(l.prioritas)">{{ l.prioritas }}</span></td>
                  <td class="text-xs font-medium"
                      :class="group.status === 'Overdue' ? 'text-red-400' : group.status === 'Today' ? 'text-yellow-400' : 'text-blue-400'">
                    {{ fmt.tgl(l.next_fu_date) }}
                    <span v-if="group.status === 'Overdue'" class="block text-red-500/70">
                      {{ overdayCount(l.next_fu_date) }} hari lalu
                    </span>
                  </td>
                  <td class="text-xs text-gray-400">{{ l.sales_owner || '—' }}</td>
                  <td class="text-right text-xs text-primary-300 font-medium">{{ fmt.rupiah(l.propose_value) }}</td>
                  <td class="text-right">
                    <NuxtLink :to="`/pipeline/${l.lead_id}`"
                              class="text-xs text-primary-400 hover:text-primary-300 whitespace-nowrap">
                      FU →
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
            <AppPagination v-if="group.pages > 1"
              :page="group.page" :total-pages="group.pages"
              :total="group.items.length" :per-page="PER"
              class="mt-3"
              @update:page="group.setPage($event)" />
          </div>
        </div>
      </template>

      <!-- Empty state -->
      <div v-if="!data.total" class="card text-center py-12">
        <i class="fa-solid fa-calendar-check text-emerald-400 text-4xl mb-3 block" />
        <div class="text-base font-semibold text-gray-300 mb-1">Tidak ada jadwal FU</div>
        <div class="text-sm text-gray-500">Semua follow-up sudah terlaksana atau belum ada yang dijadwalkan</div>
      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get } = useApi()
const fmt = useFormat()
const { data, pending, refresh } = await useAsyncData('schedule', () => get('/v1/schedule'), { server: false })

const PER = 5

const allItems      = computed(() => data.value?.schedule ?? [])
const overdueItems  = computed(() => allItems.value.filter((l: any) => l.fu_status === 'Overdue'))
const todayItems    = computed(() => allItems.value.filter((l: any) => l.fu_status === 'Today'))
const upcomingItems = computed(() => allItems.value.filter((l: any) => l.fu_status === 'Upcoming'))

const overduePage  = ref(1)
const todayPage    = ref(1)
const upcomingPage = ref(1)

function mkGroup(status: string, label: string, icon: string, items: any[], page: Ref<number>) {
  const pages = computed(() => Math.ceil(items.length / PER) || 1)
  const slice = computed(() => items.slice((page.value - 1) * PER, page.value * PER))
  return { status, label, icon, items, page: page.value, pages: pages.value, slice: slice.value, setPage: (p: number) => { page.value = p } }
}

const scheduleGroups = computed(() => [
  mkGroup('Overdue',  'Overdue',        'fa-circle-exclamation', overdueItems.value,  overduePage),
  mkGroup('Today',    'Jadwal Hari Ini', 'fa-calendar-day',       todayItems.value,    todayPage),
  mkGroup('Upcoming', 'Mendatang',       'fa-calendar-week',      upcomingItems.value, upcomingPage),
])

function overdayCount(dateStr: string) {
  if (!dateStr) return 0
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  return diff > 0 ? diff : 0
}
</script>
