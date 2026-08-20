<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-chart-bar text-primary-400 mr-2" />Revenue Dashboard</h1>
        <p class="page-subtitle">Monitoring revenue {{ data?.cur_year }}</p>
      </div>
      <div class="flex gap-2 items-center">
        <select v-if="data?.years?.length" v-model="selectedYear" class="form-select w-28 text-xs" @change="changeYear">
          <option v-for="y in data.years" :key="y" :value="y">{{ y }}</option>
        </select>
        <button v-if="isAdmin" @click="showShareModal = true" class="btn-secondary btn-sm text-xs">
          <i class="fa-solid fa-share-nodes" /> Share
        </button>
        <button @click="refresh" class="btn-secondary btn-sm"><i class="fa-solid fa-rotate" /></button>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">
      <!-- KPI Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-5">
        <div class="stat-card">
          <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-bullseye" /></div>
          <div>
            <div class="stat-value text-sm text-blue-300">{{ fmt.rupiah(data.total_target) }}</div>
            <div class="stat-label">Target YTD</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-amber-900/40 text-amber-400"><i class="fa-solid fa-file-invoice-dollar" /></div>
          <div>
            <div class="stat-value text-sm text-amber-400">{{ fmt.rupiah(data.total_billed ?? 0) }}</div>
            <div class="stat-label">Billed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-900/40 text-green-400"><i class="fa-solid fa-coins" /></div>
          <div>
            <div class="stat-value text-sm text-green-400">{{ fmt.rupiah(data.total_actual) }}</div>
            <div class="stat-label">Collected</div>
            <div v-if="billedCollectedGap > 0" class="text-[10px] text-amber-400 mt-0.5">
              Gap billed: {{ fmt.rupiah(billedCollectedGap) }}
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-percent" /></div>
          <div>
            <div class="stat-value" :class="data.ach_pct >= 80 ? 'text-green-400' : data.ach_pct >= 50 ? 'text-yellow-400' : 'text-red-400'">
              {{ data.ach_pct }}%
            </div>
            <div class="stat-label">Achievement</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-folder-open" /></div>
          <div>
            <div class="stat-value">{{ data.total_projects }}</div>
            <div class="stat-label">Total Proyek</div>
          </div>
        </div>
        <!-- New vs Existing KPI -->
        <div class="stat-card lg:border-l lg:border-apex-border">
          <div class="stat-icon bg-teal-900/40 text-teal-400"><i class="fa-solid fa-bolt" /></div>
          <div>
            <div class="stat-value text-sm text-teal-400">{{ fmt.rupiah(rtNew?.actual ?? 0) }}</div>
            <div class="stat-label">New Stream</div>
            <div class="text-[10px] text-gray-500 mt-0.5">
              Ach {{ rtNew?.ach_pct ?? 0 }}% · {{ rtNew?.cnt ?? 0 }} proyek
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-rotate" /></div>
          <div>
            <div class="stat-value text-sm text-emerald-400">{{ fmt.rupiah(rtExisting?.actual ?? 0) }}</div>
            <div class="stat-label">Existing Rev</div>
            <div class="text-[10px] text-gray-500 mt-0.5">
              Ach {{ rtExisting?.ach_pct ?? 0 }}% · {{ rtExisting?.cnt ?? 0 }} proyek
            </div>
          </div>
        </div>
      </div>

      <!-- Per Organisasi + Per Kategori & Revenue Type -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <!-- Per Organisasi -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <div class="section-title mb-0">Per Organisasi</div>
            <div class="relative">
              <button @click.stop="toggleInfo('org')" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'org'" @click.stop class="absolute right-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
                <div class="text-xs font-semibold text-gray-300 mb-3">{{ infoContent.org.title }}</div>
                <div class="space-y-2">
                  <div v-for="l in infoContent.org.lines" :key="l.label" class="flex gap-2 text-xs">
                    <span class="text-blue-400 font-medium min-w-[56px]">{{ l.label }}</span>
                    <span class="text-gray-400">{{ l.desc }}</span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-apex-border/60 text-[11px] text-amber-400/80 flex gap-1.5">
                  <i class="fa-solid fa-triangle-exclamation mt-0.5 flex-shrink-0" />
                  <span>{{ infoContent.org.note }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div v-for="org in data.org_breakdown" :key="org.organisasi">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-sm font-medium text-gray-300">{{ org.organisasi || '—' }}</span>
                <span class="text-xs text-gray-500">{{ fmt.rupiah(org.actual) }} / {{ fmt.rupiah(org.target) }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :class="fmt.achBgColor(org.ach)"
                  :style="`width:${Math.min(org.ach, 100)}%`" />
              </div>
              <div class="text-xs mt-0.5 text-right"
                :class="org.ach >= 80 ? 'text-green-400' : org.ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
                {{ org.ach }}%
              </div>
            </div>
            <div v-if="!data.org_breakdown?.length" class="text-xs text-gray-600 text-center py-4">Tidak ada data</div>
          </div>
        </div>

        <!-- Per Kategori + New vs Existing (gabung) -->
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <div class="section-title mb-0">Per Kategori &amp; Revenue Type</div>
            <div class="relative">
              <button @click.stop="toggleInfo('kategori')" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'kategori'" @click.stop class="absolute right-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
                <div class="text-xs font-semibold text-gray-300 mb-3">{{ infoContent.kategori.title }}</div>
                <div class="space-y-2">
                  <div v-for="l in infoContent.kategori.lines" :key="l.label" class="flex gap-2 text-xs">
                    <span class="text-blue-400 font-medium min-w-[56px]">{{ l.label }}</span>
                    <span class="text-gray-400">{{ l.desc }}</span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-apex-border/60 text-[11px] text-amber-400/80 flex gap-1.5">
                  <i class="fa-solid fa-triangle-exclamation mt-0.5 flex-shrink-0" />
                  <span>{{ infoContent.kategori.note }}</span>
                </div>
              </div>
            </div>
          </div>
          <!-- Kategori -->
          <div class="space-y-3 mb-4">
            <div v-for="cat in [
              { label: 'Recurring', target: data.rec_target, actual: data.rec_actual, cls: 'bg-purple-500' },
              { label: 'Project',   target: data.prj_target, actual: data.prj_actual, cls: 'bg-blue-500' },
            ]" :key="cat.label">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-sm font-medium text-gray-300">{{ cat.label }}</span>
                <span class="text-xs"
                  :class="cat.target ? (cat.actual/cat.target*100 >= 80 ? 'text-green-400' : cat.actual/cat.target*100 >= 50 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-500'">
                  {{ cat.target ? (cat.actual/cat.target*100).toFixed(0) : 0 }}%
                </span>
              </div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden">
                <div class="absolute inset-y-0 left-0 rounded" :class="cat.cls"
                  :style="`width:${cat.target ? Math.min(cat.actual/cat.target*100,100) : 0}%`" />
              </div>
              <div class="flex justify-between text-[11px] text-gray-500 mt-0.5">
                <span>{{ fmt.rupiah(cat.actual) }}</span>
                <span>{{ fmt.rupiah(cat.target) }}</span>
              </div>
            </div>
          </div>
          <!-- Divider -->
          <div class="border-t border-apex-border/60 mb-3" />
          <!-- Revenue Type -->
          <div class="space-y-3">
            <div v-for="rt in (data.revenue_type_summary ?? [])" :key="rt.revenue_type">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-sm font-medium" :class="rt.revenue_type === 'New' ? 'text-teal-400' : 'text-emerald-400'">
                  {{ rt.revenue_type === 'New' ? 'New Stream' : 'Existing Rev' }}
                </span>
                <span class="text-xs"
                  :class="rt.ach_pct >= 80 ? 'text-green-400' : rt.ach_pct >= 50 ? 'text-yellow-400' : 'text-red-400'">
                  {{ rt.ach_pct }}%
                </span>
              </div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden">
                <div class="absolute inset-y-0 left-0 rounded"
                  :class="rt.revenue_type === 'New' ? 'bg-teal-500' : 'bg-emerald-500'"
                  :style="`width:${rt.target ? Math.min(rt.actual/rt.target*100,100) : 0}%`" />
              </div>
              <div class="flex justify-between text-[11px] text-gray-500 mt-0.5">
                <span>{{ fmt.rupiah(rt.actual) }} · {{ rt.cnt }} proyek</span>
                <span>{{ fmt.rupiah(rt.target) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Critical projects -->
      <div v-if="data.critical?.length" class="card mb-5">
        <div class="flex items-center justify-between mb-3">
          <div class="section-title text-red-400 mb-0">
            <i class="fa-solid fa-triangle-exclamation mr-1" />Proyek Critical / At Risk ({{ criticalTotal }})
          </div>
          <button @click="showCriticalInfo = true"
            class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-apex-border transition"
            title="Penjelasan kriteria">
            <i class="fa-solid fa-circle-info text-sm" />
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead><tr>
              <th>Proyek</th><th>Client</th><th>Organisasi</th>
              <th>Stream</th>
              <th class="text-right">Target</th>
              <th class="text-right">Actual</th>
              <th>Status</th><th>Risk</th>
            </tr></thead>
            <tbody>
              <tr v-for="p in criticalSlice" :key="p.project_id">
                <td class="text-xs">{{ p.project_id }}<div class="text-gray-400">{{ p.product }}</div></td>
                <td class="text-xs text-gray-300">{{ p.client }}</td>
                <td class="text-xs text-gray-400">{{ p.organisasi }}</td>
                <td>
                  <span v-if="p.revenue_type === 'New'" class="badge-blue text-[10px]">New</span>
                  <span v-else class="text-[11px] text-gray-500">Existing</span>
                </td>
                <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(p.revenue_target) }}</td>
                <td class="text-right text-xs text-green-300">{{ fmt.rupiah(p.actual_revenue) }}</td>
                <td><span :class="fmt.statusClass(p.project_status)">{{ p.project_status }}</span></td>
                <td><span :class="fmt.riskClass(p.risk_label)">{{ p.risk_label }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
        <AppPagination
          v-if="criticalPages > 1"
          v-model:page="criticalPage"
          :total-pages="criticalPages"
          :total="criticalTotal"
          :per-page="criticalPerPage"
          class="mt-3"
        />
      </div>

      <!-- Recurring Behind YTD Target -->
      <div class="card mb-5">
        <div class="flex items-center justify-between mb-3">
          <div class="section-title text-amber-400 mb-0">
            <i class="fa-solid fa-arrow-trend-down mr-1" />Recurring Tertinggal s/d Bulan {{ monthName }}
            <span v-if="data.recurring_behind?.length" class="ml-1">({{ data.recurring_behind.length }})</span>
          </div>
          <button @click="showRecurringInfo = true"
            class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-apex-border transition"
            title="Penjelasan kolom">
            <i class="fa-solid fa-circle-info text-sm" />
          </button>
        </div>
        <template v-if="data.recurring_behind?.length">
          <div class="overflow-x-auto">
            <table class="tbl">
              <thead><tr>
                <th>Project</th><th>Client</th><th>PIC</th>
                <th class="text-right">Target Tahunan</th>
                <th class="text-right">Target s/d {{ monthName }}</th>
                <th class="text-right text-amber-300">Billed</th>
                <th class="text-right text-cyan-300">Paid</th>
                <th class="text-right text-green-300">Collected</th>
                <th class="text-right text-orange-300" title="target_ytd − billed: belum ditagihkan tim project">Kekurangan Billed</th>
                <th class="text-right text-red-300" title="billed − collected: sudah ditagih tapi belum masuk kas">Kekurangan Collect</th>
                <th class="text-right">Ach%</th>
              </tr></thead>
              <tbody>
                <tr v-for="p in recurringBehindSlice" :key="p.project_id">
                  <td class="text-xs">{{ p.project_id }}<div class="text-gray-400">{{ p.product }}</div></td>
                  <td class="text-xs text-gray-300">{{ p.client }}</td>
                  <td class="text-xs text-gray-400">{{ p.pic }}</td>
                  <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(p.revenue_target) }}</td>
                  <td class="text-right text-xs text-blue-300 font-medium">{{ fmt.rupiah(p.target_ytd) }}</td>
                  <td class="text-right text-xs text-amber-300">{{ fmt.rupiah(p.billed) }}</td>
                  <td class="text-right text-xs text-cyan-300">{{ fmt.rupiah(p.paid) }}</td>
                  <td class="text-right text-xs text-green-300">{{ fmt.rupiah(p.collected) }}</td>
                  <td class="text-right text-xs font-medium"
                      :class="p.gap_billed > 0 ? 'text-orange-400' : 'text-emerald-400'">
                    {{ fmt.rupiah(Math.abs(p.gap_billed)) }}
                    <span class="text-[10px] ml-0.5">{{ p.gap_billed > 0 ? '▼' : '✓' }}</span>
                  </td>
                  <td class="text-right text-xs font-medium"
                      :class="p.gap_collected > 0 ? 'text-red-400' : 'text-emerald-400'">
                    {{ fmt.rupiah(Math.abs(p.gap_collected)) }}
                    <span class="text-[10px] ml-0.5">{{ p.gap_collected > 0 ? '▼' : '✓' }}</span>
                  </td>
                  <td class="text-right text-xs">
                    <span :class="p.ach_pct >= 80 ? 'text-green-300' : p.ach_pct >= 50 ? 'text-amber-300' : 'text-red-400'">
                      {{ p.ach_pct }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <AppPagination
            v-if="recurringBehindPages > 1"
            v-model:page="recurringBehindPage"
            :total-pages="recurringBehindPages"
            :total="data.recurring_behind.length"
            :per-page="recurringBehindPerPage"
            class="mt-3"
          />
        </template>
        <div v-else class="text-sm text-gray-500 text-center py-6">
          <i class="fa-solid fa-circle-check text-emerald-500 mr-2" />Semua proyek recurring on track (≥ 90%)
        </div>
      </div>

      <!-- Quarter trend -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="section-title mb-0">Quarter Trend</div>
            <div class="relative">
              <button @click.stop="toggleInfo('quarter')" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'quarter'" @click.stop class="absolute left-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
                <div class="text-xs font-semibold text-gray-300 mb-3">{{ infoContent.quarter.title }}</div>
                <div class="space-y-2">
                  <div v-for="l in infoContent.quarter.lines" :key="l.label" class="flex gap-2 text-xs">
                    <span class="text-blue-400 font-medium min-w-[56px]">{{ l.label }}</span>
                    <span class="text-gray-400">{{ l.desc }}</span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-apex-border/60 text-[11px] text-amber-400/80 flex gap-1.5">
                  <i class="fa-solid fa-triangle-exclamation mt-0.5 flex-shrink-0" />
                  <span>{{ infoContent.quarter.note }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-400">
            <span class="flex items-center gap-1.5"><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Collected</span>
            <span class="flex items-center gap-1.5"><span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>Billed</span>
          </div>
        </div>

        <div v-if="data.quarter_trend?.length">
          <!-- Header row -->
          <div class="grid gap-2 pb-1.5 border-b border-apex-border/60 mb-1"
               style="grid-template-columns: 100px 1fr 1fr 52px 68px 80px;">
            <span class="text-xs text-gray-500">Quarter</span>
            <span class="text-xs text-gray-500">Collected</span>
            <span class="text-xs text-gray-500">Billed</span>
            <span class="text-xs text-gray-500 text-right">Ach%</span>
            <span class="text-xs text-gray-500 text-right">vs Q sblm</span>
            <span class="text-xs text-gray-500 text-right">Status</span>
          </div>

          <div v-for="(q, idx) in data.quarter_trend" :key="q.quarter"
               class="grid gap-2 py-2 border-b border-apex-border/30 last:border-0 items-center rounded-lg"
               :class="Math.ceil(curMonth / 3) === idx + 1 ? 'bg-blue-900/20 px-2 -mx-2' : ''"
               :style="Math.ceil(curMonth / 3) < idx + 1 ? 'opacity:0.45' : ''"
               style="grid-template-columns: 100px 1fr 1fr 52px 68px 80px;">

            <!-- Quarter label -->
            <div>
              <div v-if="Math.ceil(curMonth / 3) === idx + 1" class="text-[10px] text-blue-400 font-medium leading-none mb-0.5">● Berjalan</div>
              <span class="text-sm font-medium" :class="Math.ceil(curMonth / 3) === idx + 1 ? 'text-blue-300' : 'text-gray-300'">{{ q.quarter }}</span>
              <div class="text-[10px] text-gray-500 mt-0.5">{{ ['Jan–Mar','Apr–Jun','Jul–Sep','Okt–Des'][idx] }}</div>
            </div>

            <!-- Collected bar -->
            <div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden mb-0.5">
                <div class="absolute inset-y-0 left-0 rounded"
                     :class="Math.ceil(curMonth / 3) === idx + 1 ? 'bg-blue-500' : 'bg-emerald-500'"
                     :style="`width:${q.target ? Math.min(q.actual / q.target * 100, 100) : 0}%`" />
              </div>
              <span class="text-[11px]" :class="Math.ceil(curMonth / 3) === idx + 1 ? 'text-blue-400' : Math.ceil(curMonth / 3) > idx + 1 ? 'text-emerald-400' : 'text-gray-600'">
                {{ Math.ceil(curMonth / 3) <= idx ? '—' : fmt.rupiah(q.actual) }}
              </span>
            </div>

            <!-- Billed bar -->
            <div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden mb-0.5">
                <div class="absolute inset-y-0 left-0 rounded bg-amber-400"
                     :style="`width:${q.target ? Math.min((q.billed ?? 0) / q.target * 100, 100) : 0}%`" />
              </div>
              <span class="text-[11px] text-amber-400">
                {{ Math.ceil(curMonth / 3) <= idx ? '—' : fmt.rupiah(q.billed ?? 0) }}
              </span>
            </div>

            <!-- Ach% -->
            <div class="text-right">
              <span v-if="Math.ceil(curMonth / 3) <= idx" class="text-xs text-gray-600">—</span>
              <span v-else class="text-xs font-medium"
                    :class="Math.ceil(curMonth / 3) === idx + 1 ? 'text-blue-400' : q.ach >= 100 ? 'text-blue-300' : q.ach >= 80 ? 'text-emerald-400' : q.ach >= 60 ? 'text-yellow-400' : 'text-red-400'">
                {{ q.ach }}%
              </span>
            </div>

            <!-- Delta vs Q sebelumnya -->
            <div class="text-right">
              <template v-if="idx === 0 || Math.ceil(curMonth / 3) <= idx || !data.quarter_trend[idx-1].actual">
                <span class="text-xs text-gray-600">—</span>
              </template>
              <template v-else>
                <span class="text-xs"
                      :class="q.ach > data.quarter_trend[idx-1].ach ? 'text-emerald-400' : q.ach < data.quarter_trend[idx-1].ach ? 'text-red-400' : 'text-gray-500'">
                  {{ q.ach > data.quarter_trend[idx-1].ach ? '▲' : q.ach < data.quarter_trend[idx-1].ach ? '▼' : '' }}
                  {{ Math.abs(q.ach - data.quarter_trend[idx-1].ach).toFixed(0) }}%
                </span>
              </template>
            </div>

            <!-- Status badge -->
            <div class="text-right">
              <span v-if="Math.ceil(curMonth / 3) < idx + 1"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-apex-border/40 text-gray-500">Belum</span>
              <span v-else-if="Math.ceil(curMonth / 3) === idx + 1"
                    class="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/50 text-blue-300 font-medium">Berjalan</span>
              <span v-else class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                    :class="q.ach >= 100 ? 'bg-blue-900/50 text-blue-300' : q.ach >= 80 ? 'bg-emerald-900/50 text-emerald-300' : q.ach >= 60 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-red-900/50 text-red-300'">
                {{ q.ach >= 100 ? 'Achieved' : q.ach >= 80 ? 'On Track' : q.ach >= 60 ? 'Behind' : 'Critical' }}
              </span>
            </div>
          </div>

          <!-- Summary strip -->
          <div class="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-apex-border/40">
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">YTD Collected</div>
              <div class="text-sm font-medium text-emerald-400 mt-0.5">
                {{ fmt.rupiah(data.quarter_trend.filter((_: any, i: number) => i < Math.ceil(curMonth / 3)).reduce((s: number, q: any) => s + q.actual, 0)) }}
              </div>
            </div>
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">YTD Billed</div>
              <div class="text-sm font-medium text-amber-400 mt-0.5">
                {{ fmt.rupiah(data.quarter_trend.filter((_: any, i: number) => i < Math.ceil(curMonth / 3)).reduce((s: number, q: any) => s + (q.billed ?? 0), 0)) }}
              </div>
            </div>
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">Avg Ach%</div>
              <div class="text-sm font-medium mt-0.5"
                   :class="(() => { const past = data.quarter_trend.filter((_: any, i: number) => i < Math.ceil(curMonth / 3)); const t = past.reduce((s: number, q: any) => s + q.target, 0); const a = past.reduce((s: number, q: any) => s + q.actual, 0); const p = t > 0 ? a/t*100 : 0; return p >= 80 ? 'text-emerald-400' : p >= 60 ? 'text-yellow-400' : 'text-red-400' })()">
                {{ (() => { const past = data.quarter_trend.filter((_: any, i: number) => i < Math.ceil(curMonth / 3)); const t = past.reduce((s: number, q: any) => s + q.target, 0); const a = past.reduce((s: number, q: any) => s + q.actual, 0); return t > 0 ? (a/t*100).toFixed(0) + '%' : '0%' })() }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-24 text-gray-600 text-sm">
          Tidak ada data quarter
        </div>
      </div>

      <!-- Monthly trend -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <div class="section-title mb-0">Monthly Trend</div>
            <div class="relative">
              <button @click.stop="toggleInfo('monthly')" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'monthly'" @click.stop class="absolute left-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
                <div class="text-xs font-semibold text-gray-300 mb-3">{{ infoContent.monthly.title }}</div>
                <div class="space-y-2">
                  <div v-for="l in infoContent.monthly.lines" :key="l.label" class="flex gap-2 text-xs">
                    <span class="text-blue-400 font-medium min-w-[56px]">{{ l.label }}</span>
                    <span class="text-gray-400">{{ l.desc }}</span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-apex-border/60 text-[11px] text-amber-400/80 flex gap-1.5">
                  <i class="fa-solid fa-triangle-exclamation mt-0.5 flex-shrink-0" />
                  <span>{{ infoContent.monthly.note }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-400">
            <span class="flex items-center gap-1.5"><span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>Collected</span>
            <span class="flex items-center gap-1.5"><span class="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>Billed</span>
          </div>
        </div>

        <div v-if="data.monthly_trend?.length">
          <!-- Header row -->
          <div class="grid gap-2 pb-1.5 border-b border-apex-border/60 mb-1"
               style="grid-template-columns: 56px 1fr 1fr 52px 68px 80px;">
            <span class="text-xs text-gray-500">Bulan</span>
            <span class="text-xs text-gray-500">Collected</span>
            <span class="text-xs text-gray-500">Billed</span>
            <span class="text-xs text-gray-500 text-right">Ach%</span>
            <span class="text-xs text-gray-500 text-right">vs bln lalu</span>
            <span class="text-xs text-gray-500 text-right">Status</span>
          </div>

          <div v-for="(m, idx) in data.monthly_trend" :key="m.month_num"
               class="grid gap-2 py-2 border-b border-apex-border/30 last:border-0 items-center rounded-lg"
               :class="m.month_num === curMonth ? 'bg-blue-900/20 px-2 -mx-2' : ''"
               style="grid-template-columns: 56px 1fr 1fr 52px 68px 80px;">

            <!-- Bulan -->
            <div>
              <div v-if="m.month_num === curMonth" class="text-[10px] text-blue-400 font-medium leading-none mb-0.5">● Berjalan</div>
              <span class="text-sm font-medium text-gray-300">{{ m.month_name.slice(0, 3) }}</span>
            </div>

            <!-- Collected bar -->
            <div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden mb-0.5">
                <div class="absolute inset-y-0 left-0 rounded bg-emerald-500"
                     :style="`width:${m.total_target ? Math.min(m.total_actual / m.total_target * 100, 100) : 0}%`" />
              </div>
              <span class="text-[11px] text-emerald-400">{{ fmt.rupiah(m.total_actual) }}</span>
            </div>

            <!-- Billed bar -->
            <div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden mb-0.5">
                <div class="absolute inset-y-0 left-0 rounded bg-amber-400"
                     :style="`width:${m.total_target ? Math.min((m.total_billed ?? 0) / m.total_target * 100, 100) : 0}%`" />
              </div>
              <span class="text-[11px] text-amber-400">{{ fmt.rupiah(m.total_billed ?? 0) }}</span>
            </div>

            <!-- Ach% -->
            <div class="text-right">
              <span class="text-xs font-medium"
                    :class="(() => { const p = m.total_target ? m.total_actual / m.total_target * 100 : 0; return p >= 80 ? 'text-emerald-400' : p >= 60 ? 'text-yellow-400' : 'text-red-400' })()">
                {{ m.total_target ? (m.total_actual / m.total_target * 100).toFixed(0) : '0' }}%
              </span>
            </div>

            <!-- Delta vs bulan lalu -->
            <div class="text-right">
              <template v-if="idx === 0 || !data.monthly_trend[idx-1].total_target">
                <span class="text-xs text-gray-600">—</span>
              </template>
              <template v-else>
                <span class="text-xs"
                      :class="(() => {
                        const cur  = m.total_target ? m.total_actual / m.total_target * 100 : 0
                        const prev = data.monthly_trend[idx-1].total_target ? data.monthly_trend[idx-1].total_actual / data.monthly_trend[idx-1].total_target * 100 : 0
                        const d = cur - prev
                        return d > 0 ? 'text-emerald-400' : d < 0 ? 'text-red-400' : 'text-gray-500'
                      })()">
                  {{ (() => {
                      const cur  = m.total_target ? m.total_actual / m.total_target * 100 : 0
                      const prev = data.monthly_trend[idx-1].total_target ? data.monthly_trend[idx-1].total_actual / data.monthly_trend[idx-1].total_target * 100 : 0
                      const d = cur - prev
                      return (d > 0 ? '▲ ' : d < 0 ? '▼ ' : '') + Math.abs(d).toFixed(0) + '%'
                    })() }}
                </span>
              </template>
            </div>

            <!-- Status badge -->
            <div class="text-right">
              <template v-if="m.month_num > curMonth">
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-apex-border/40 text-gray-500">Belum</span>
              </template>
              <template v-else>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      :class="(() => {
                        const p = m.total_target ? m.total_actual / m.total_target * 100 : 0
                        if (p >= 100) return 'bg-blue-900/50 text-blue-300'
                        if (p >= 80)  return 'bg-emerald-900/50 text-emerald-300'
                        if (p >= 60)  return 'bg-yellow-900/50 text-yellow-300'
                        return 'bg-red-900/50 text-red-300'
                      })()">
                  {{ (() => {
                      const p = m.total_target ? m.total_actual / m.total_target * 100 : 0
                      if (p >= 100) return 'Exceeded'
                      if (p >= 80)  return 'On Track'
                      if (p >= 60)  return 'Behind'
                      return 'Critical'
                    })() }}
                </span>
              </template>
            </div>
          </div>

          <!-- Summary strip -->
          <div class="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-apex-border/40">
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">YTD Collected</div>
              <div class="text-sm font-medium text-emerald-400 mt-0.5">
                {{ fmt.rupiah(data.monthly_trend.filter((m: any) => m.month_num <= curMonth).reduce((s: number, m: any) => s + (m.total_actual || 0), 0)) }}
              </div>
            </div>
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">YTD Billed</div>
              <div class="text-sm font-medium text-amber-400 mt-0.5">
                {{ fmt.rupiah(data.monthly_trend.filter((m: any) => m.month_num <= curMonth).reduce((s: number, m: any) => s + (m.total_billed || 0), 0)) }}
              </div>
            </div>
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">Avg Ach%</div>
              <div class="text-sm font-medium text-gray-200 mt-0.5">
                {{ (() => {
                    const past = data.monthly_trend.filter((m: any) => m.month_num <= curMonth && m.total_target > 0)
                    if (!past.length) return '0%'
                    const avg = past.reduce((s: number, m: any) => s + m.total_actual / m.total_target * 100, 0) / past.length
                    return avg.toFixed(0) + '%'
                  })() }}
              </div>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-32 text-gray-600 text-sm">
          Tidak ada data trend
        </div>
      </div>

      <!-- Revenue Insights: lihat halaman Revenue Insights -->
      <div class="card mt-5 flex items-center justify-between gap-4 py-3">
        <div class="flex items-center gap-2 text-sm text-gray-400">
          <i class="fa-solid fa-lightbulb text-cyan-400" />
          Langkah nyata & prioritas terpenting tersedia di halaman
          <span class="text-cyan-300 font-medium">Revenue Insights</span>
        </div>
        <NuxtLink to="/revenue/insights" class="btn-secondary btn-sm text-xs shrink-0">
          Buka Insights <i class="fa-solid fa-arrow-right ml-1" />
        </NuxtLink>
      </div>
    </template>
  </div>

  <!-- Share Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showShareModal = false" />
        <div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-md">
          <div class="flex items-center justify-between px-6 py-4 border-b border-apex-border">
            <h2 class="text-base font-bold text-apex-text">
              <i class="fa-solid fa-share-nodes text-primary-400 mr-2" />Share Revenue Dashboard
            </h2>
            <button @click="showShareModal = false" class="btn-ghost btn-sm rounded-lg">
              <i class="fa-solid fa-xmark text-lg" />
            </button>
          </div>
          <div class="px-6 py-5 space-y-4">
            <p class="text-sm text-apex-muted">Buat link publik yang dapat diakses tanpa login, dilindungi password.</p>
            <div v-if="shareInfo.url" class="p-3 bg-primary-900/20 border border-primary-700/40 rounded-lg">
              <div class="text-xs text-gray-400 mb-1.5">Link aktif:</div>
              <div class="flex items-center gap-2">
                <input :value="shareInfo.url" readonly
                       class="form-input text-xs flex-1 text-primary-300 font-mono bg-primary-900/20" />
                <button @click="copyLink" class="btn-secondary btn-sm flex-shrink-0" title="Copy">
                  <i :class="linkCopied ? 'fa-solid fa-check text-emerald-400' : 'fa-solid fa-copy'" />
                </button>
                <a :href="shareInfo.url" target="_blank" class="btn-secondary btn-sm flex-shrink-0">
                  <i class="fa-solid fa-arrow-up-right-from-square" />
                </a>
              </div>
            </div>
            <div>
              <label class="form-label">{{ shareInfo.url ? 'Generate Ulang dengan Password Baru' : 'Password' }}</label>
              <input v-model="sharePassword" type="text" class="form-input" placeholder="Minimal 4 karakter..." />
            </div>
          </div>
          <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-apex-border">
            <button @click="showShareModal = false" class="btn-secondary text-sm">Tutup</button>
            <button @click="doGenerateShare" :disabled="generatingShare || sharePassword.length < 4" class="btn-primary text-sm">
              <i :class="generatingShare ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-rotate'" />
              {{ shareInfo.url ? 'Generate Ulang' : 'Generate Link' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal: Penjelasan Recurring Tertinggal -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showRecurringInfo"
           class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
           @click.self="showRecurringInfo = false">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showRecurringInfo = false" />
        <div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-apex-border">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-arrow-trend-down text-amber-400" />
              <span class="font-semibold text-apex-text">Penjelasan Kolom — Recurring Tertinggal</span>
            </div>
            <button @click="showRecurringInfo = false"
              class="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-apex-border transition">
              <i class="fa-solid fa-xmark" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-5 py-4 space-y-5 text-sm">

            <!-- Alur -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Alur Tanggung Jawab</div>
              <div class="flex items-center gap-1.5 flex-wrap text-xs">
                <span class="px-2.5 py-1.5 rounded-lg bg-blue-900/40 text-blue-300 font-medium">Target YTD</span>
                <i class="fa-solid fa-arrow-right text-gray-600" />
                <span class="px-2.5 py-1.5 rounded-lg bg-amber-900/40 text-amber-300 font-medium">Billed</span>
                <span class="text-gray-600 text-[10px]">(Tim Project)</span>
                <i class="fa-solid fa-arrow-right text-gray-600" />
                <span class="px-2.5 py-1.5 rounded-lg bg-cyan-900/40 text-cyan-300 font-medium">Paid</span>
                <span class="text-gray-600 text-[10px]">(Klien)</span>
                <i class="fa-solid fa-arrow-right text-gray-600" />
                <span class="px-2.5 py-1.5 rounded-lg bg-green-900/40 text-green-300 font-medium">Collected</span>
                <span class="text-gray-600 text-[10px]">(Finance)</span>
              </div>
            </div>

            <!-- Penjelasan kolom -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Penjelasan Kolom</div>
              <div class="space-y-2 text-xs">
                <div class="p-3 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-blue-300 font-semibold w-28 flex-shrink-0">Target s/d Bulan</span>
                  <span class="text-gray-300">Akumulasi target dari jadwal revenue bulanan s.d. bulan berjalan.</span>
                </div>
                <div class="p-3 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-amber-300 font-semibold w-28 flex-shrink-0">Billed</span>
                  <span class="text-gray-300">Total invoice yang sudah diterbitkan s.d. bulan berjalan. <span class="text-amber-400">Tanggung jawab Tim Project.</span></span>
                </div>
                <div class="p-3 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-cyan-300 font-semibold w-28 flex-shrink-0">Paid</span>
                  <span class="text-gray-300">Total yang sudah dibayarkan oleh klien s.d. bulan berjalan.</span>
                </div>
                <div class="p-3 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-green-300 font-semibold w-28 flex-shrink-0">Collected</span>
                  <span class="text-gray-300">Realisasi revenue yang sudah dicatat s.d. bulan berjalan. <span class="text-green-400">Tanggung jawab Finance.</span></span>
                </div>
              </div>
            </div>

            <!-- Kolom kekurangan -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kolom Kekurangan</div>
              <div class="space-y-2 text-xs">
                <div class="p-3 rounded-lg bg-orange-900/20 border border-orange-700/30 flex gap-3">
                  <span class="text-orange-300 font-semibold w-28 flex-shrink-0">Kekurangan Billed</span>
                  <div class="text-gray-300">
                    <div class="font-mono text-orange-300 mb-1">= Target YTD − Billed</div>
                    Berapa yang <span class="text-white font-medium">belum ditagihkan</span> oleh Tim Project sesuai jadwal. Nilai positif berarti Tim Project perlu segera menerbitkan invoice.
                  </div>
                </div>
                <div class="p-3 rounded-lg bg-red-900/20 border border-red-700/30 flex gap-3">
                  <span class="text-red-300 font-semibold w-28 flex-shrink-0">Kekurangan Collect</span>
                  <div class="text-gray-300">
                    <div class="font-mono text-red-300 mb-1">= Billed − Collected</div>
                    Berapa yang sudah ditagihkan tapi <span class="text-white font-medium">belum masuk kas</span> (piutang outstanding). Finance perlu follow-up pembayaran ke klien.
                  </div>
                </div>
              </div>
            </div>

            <!-- Threshold -->
            <div class="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30 text-xs text-blue-300 flex gap-2">
              <i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0" />
              <span>Card ini hanya menampilkan proyek Recurring dengan achievement <span class="font-semibold">di bawah 90%</span> dari target YTD. Proyek yang sudah ≥ 90% dianggap on track dan tidak ditampilkan.</span>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- Modal: Penjelasan Proyek Critical / At Risk -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showCriticalInfo"
           class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
           @click.self="showCriticalInfo = false">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCriticalInfo = false" />
        <div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-apex-border">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-triangle-exclamation text-red-400" />
              <span class="font-semibold text-apex-text">Kriteria Proyek Critical / At Risk</span>
            </div>
            <button @click="showCriticalInfo = false"
              class="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-apex-border transition">
              <i class="fa-solid fa-xmark" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-5 py-4 space-y-5 text-sm">

            <!-- Basis Penilaian -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Basis Penilaian per Type</div>
              <div class="space-y-2">
                <div class="flex items-start gap-3 p-3 rounded-lg bg-apex-card border border-apex-border">
                  <span class="badge-blue mt-0.5 flex-shrink-0">Bulanan</span>
                  <span class="text-gray-300">Invoice tertagih YTD dibandingkan dengan <span class="text-white font-medium">target s.d. bulan berjalan</span> dari jadwal revenue bulanan.</span>
                </div>
                <div class="flex items-start gap-3 p-3 rounded-lg bg-apex-card border border-apex-border">
                  <span class="badge-yellow mt-0.5 flex-shrink-0">Termin</span>
                  <span class="text-gray-300">Invoice tertagih YTD dibandingkan dengan <span class="text-white font-medium">target termin s.d. bulan berjalan</span> sesuai jadwal milestone.</span>
                </div>
                <div class="flex items-start gap-3 p-3 rounded-lg bg-apex-card border border-apex-border">
                  <span class="badge-purple mt-0.5 flex-shrink-0">One Time</span>
                  <span class="text-gray-300">Invoice tertagih dibandingkan dengan <span class="text-white font-medium">total nilai kontrak</span> (revenue target) — tidak ada jadwal bulanan.</span>
                </div>
                <div class="flex items-start gap-3 p-3 rounded-lg bg-apex-card border border-apex-border">
                  <span class="badge-green mt-0.5 flex-shrink-0">Tahunan</span>
                  <span class="text-gray-300">Sama seperti One Time — invoice tertagih dibandingkan dengan <span class="text-white font-medium">total nilai kontrak</span>.</span>
                </div>
              </div>
            </div>

            <!-- Threshold -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Threshold Penilaian Risiko</div>
              <table class="w-full text-xs rounded-lg overflow-hidden">
                <thead>
                  <tr class="bg-apex-card text-gray-400">
                    <th class="text-left py-2 px-3">Kondisi</th>
                    <th class="text-center py-2 px-3">Label</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-apex-border">
                  <tr>
                    <td class="py-2 px-3 text-gray-300">Project status <span class="text-white font-medium">On Hold</span></td>
                    <td class="py-2 px-3 text-center"><span class="badge-yellow">At Risk</span></td>
                  </tr>
                  <tr>
                    <td class="py-2 px-3 text-gray-300">Invoice tertagih <span class="text-white font-medium">= Rp 0</span> (belum ada invoice)</td>
                    <td class="py-2 px-3 text-center"><span class="badge-red">Critical</span></td>
                  </tr>
                  <tr>
                    <td class="py-2 px-3 text-gray-300">Invoice tertagih <span class="text-white font-medium">&lt; 50%</span> dari target</td>
                    <td class="py-2 px-3 text-center"><span class="badge-red">Critical</span></td>
                  </tr>
                  <tr>
                    <td class="py-2 px-3 text-gray-300">Invoice tertagih <span class="text-white font-medium">50% – 74%</span> dari target</td>
                    <td class="py-2 px-3 text-center"><span class="badge-yellow">At Risk</span></td>
                  </tr>
                  <tr class="bg-emerald-900/10">
                    <td class="py-2 px-3 text-gray-300">Invoice tertagih <span class="text-emerald-400 font-medium">≥ 75%</span> dari target</td>
                    <td class="py-2 px-3 text-center"><span class="badge-green">Aman</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Catatan -->
            <div class="p-3 rounded-lg bg-blue-900/20 border border-blue-700/30 text-xs text-blue-300 flex gap-2">
              <i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0" />
              <span>Penilaian berdasarkan <strong>invoice yang diterbitkan</strong> (billed), bukan pembayaran yang diterima (paid). Proyek dengan status <strong>Failed</strong> dan <strong>Completed</strong> tidak ditampilkan di card ini.</span>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, post: apiPost } = useApi()
const fmt = useFormat()
const route = useRoute()
const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role_id === 1 || authStore.user?.role_id === 2)

const selectedYear = ref(Number(route.query.tahun) || 0)
const { data, pending, refresh } = await useAsyncData('revenue-summary',
  () => get('/v1/revenue/summary', { tahun: selectedYear.value || undefined }),
  { server: false }
)

// Revenue type computed
const rtNew      = computed(() => data.value?.revenue_type_summary?.find((r: any) => r.revenue_type === 'New'))
const rtExisting = computed(() => data.value?.revenue_type_summary?.find((r: any) => r.revenue_type === 'Existing'))
const billedCollectedGap = computed(() => Math.max((data.value?.total_billed ?? 0) - (data.value?.total_actual ?? 0), 0))

const showCriticalInfo   = ref(false)
const showRecurringInfo  = ref(false)

// Share
const showShareModal  = ref(false)
const shareInfo       = reactive({ token: null as string | null, url: null as string | null })
const sharePassword   = ref('')
const generatingShare = ref(false)
const linkCopied      = ref(false)

async function loadShareInfo() {
  try {
    const res: any = await get('/v1/share-links/revenue-dashboard')
    shareInfo.token = res.token
    shareInfo.url   = res.url
  } catch {}
}

async function doGenerateShare() {
  if (sharePassword.value.length < 4) return
  if (shareInfo.url && !confirm('Generate ulang akan menonaktifkan link lama. Lanjutkan?')) return
  generatingShare.value = true
  try {
    const res: any = await apiPost('/v1/share-links/revenue-dashboard/generate', { password: sharePassword.value })
    shareInfo.token = res.token
    shareInfo.url   = res.url
    sharePassword.value = ''
  } catch {
    alert('Gagal membuat share link.')
  } finally {
    generatingShare.value = false
  }
}

async function copyLink() {
  if (!shareInfo.url) return
  await navigator.clipboard.writeText(shareInfo.url)
  linkCopied.value = true
  setTimeout(() => linkCopied.value = false, 2000)
}

const activeInfo = ref<string | null>(null)
const infoContent: Record<string, { title: string; lines: { label: string; desc: string }[]; note?: string }> = {
  org: {
    title: 'Per Organisasi',
    lines: [
      { label: 'Target', desc: 'Dari revenue_target di tabel revenue_projects, dikelompokkan per organisasi.' },
      { label: 'Actual', desc: 'Dari actual_revenue di tabel revenue_projects (agregat realisasi tahunan per proyek).' },
    ],
    note: 'Semua proyek aktif kecuali status Failed. Tidak terbatas pada LOB yang dikonfigurasi di Annual Target.',
  },
  kategori: {
    title: 'Per Kategori & Revenue Type',
    lines: [
      { label: 'Target', desc: 'Dari revenue_target di revenue_projects, dikelompokkan per kategori dan per revenue_type.' },
      { label: 'Actual', desc: 'Dari actual_revenue di revenue_projects.' },
    ],
    note: 'Semua proyek aktif (is_active=1) tanpa filter project_status. Proyek tanpa revenue_type dianggap "Existing".',
  },
  quarter: {
    title: 'Quarter Trend',
    lines: [
      { label: 'Target', desc: 'Dari revenue_monthly.target — rencana billing per proyek per bulan, diagregasi per quarter.' },
      { label: 'Collected', desc: 'Dari revenue_monthly.actual — realisasi pembayaran diterima per proyek per bulan.' },
      { label: 'Billed', desc: 'Dari invoices.invoice_amount — invoice yang sudah diterbitkan, diagregasi per quarter.' },
    ],
    note: 'Sumber berbeda dengan Per Organisasi. revenue_monthly memiliki dimensi waktu (bulan), sedangkan revenue_projects hanya menyimpan total tahunan.',
  },
  monthly: {
    title: 'Monthly Trend',
    lines: [
      { label: 'Target', desc: 'Dari revenue_monthly.target — rencana billing per proyek per bulan.' },
      { label: 'Collected', desc: 'Dari revenue_monthly.actual — realisasi pembayaran diterima per bulan.' },
      { label: 'Billed', desc: 'Dari invoices.invoice_amount — invoice diterbitkan, di-join per bulan (invoice_date).' },
    ],
    note: 'Granularitas per bulan. Angka Collected bisa berbeda dengan actual di Per Organisasi karena revenue_monthly.actual dan revenue_projects.actual_revenue diupdate secara terpisah.',
  },
}
function toggleInfo(key: string) {
  activeInfo.value = activeInfo.value === key ? null : key
}

onMounted(() => {
  if (isAdmin.value) loadShareInfo()
  document.addEventListener('click', () => { activeInfo.value = null })
})
const criticalPage    = ref(1)
const criticalPerPage = 5
const criticalTotal   = computed(() => data.value?.critical?.length ?? 0)
const criticalPages   = computed(() => Math.ceil(criticalTotal.value / criticalPerPage) || 1)
const criticalSlice   = computed(() => {
  const all = data.value?.critical ?? []
  const start = (criticalPage.value - 1) * criticalPerPage
  return all.slice(start, start + criticalPerPage)
})

const recurringBehindPage    = ref(1)
const recurringBehindPerPage = 10
const recurringBehindPages   = computed(() => Math.ceil((data.value?.recurring_behind?.length ?? 0) / recurringBehindPerPage) || 1)
const recurringBehindSlice   = computed(() => {
  const all = data.value?.recurring_behind ?? []
  const start = (recurringBehindPage.value - 1) * recurringBehindPerPage
  return all.slice(start, start + recurringBehindPerPage)
})

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const curMonth = computed(() => data.value?.cur_month ?? new Date().getMonth() + 1)
const monthName = computed(() => {
  const m = data.value?.cur_month
  return m ? MONTH_NAMES[m - 1] : ''
})

async function changeYear() {
  await navigateTo({ query: { tahun: selectedYear.value } })
  await refresh()
}

</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
