<template>
  <div>
    <!-- Header -->
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-tachometer-alt text-primary-400 mr-2" />Dashboard</h1>
        <p class="page-subtitle">{{ todayLabel }}</p>
      </div>
      <button @click="refresh" class="btn-secondary btn-sm" :disabled="pending">
        <i :class="`fa-solid fa-rotate ${pending ? 'fa-spin' : ''}`" />Refresh
      </button>
    </div>

    <div v-if="pending" class="flex justify-center py-24">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">

      <!-- ── ROW 1: KPI Strip ───────────────────────────────────────── -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5">

        <!-- Total Leads -->
        <div class="stat-card">
          <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-briefcase" /></div>
          <div>
            <div class="stat-value">{{ fmt.num(s.total) }}</div>
            <div class="stat-label">Total Leads</div>
          </div>
        </div>

        <!-- Aktif -->
        <div class="stat-card">
          <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-fire" /></div>
          <div>
            <div class="stat-value text-primary-300">{{ fmt.num(s.aktif) }}</div>
            <div class="stat-label">Aktif</div>
          </div>
        </div>

        <!-- Won -->
        <div class="stat-card">
          <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-trophy" /></div>
          <div>
            <div class="stat-value text-emerald-400">{{ fmt.num(s.won) }}</div>
            <div class="stat-label">Won ({{ winRate }}%)</div>
          </div>
        </div>

        <!-- On Hold -->
        <div class="stat-card">
          <div class="stat-icon bg-yellow-900/40 text-yellow-400"><i class="fa-solid fa-pause-circle" /></div>
          <div>
            <div class="stat-value text-yellow-400">{{ fmt.num(s.on_hold) }}</div>
            <div class="stat-label">On Hold</div>
          </div>
        </div>

        <!-- Stale -->
        <div class="stat-card">
          <div class="stat-icon bg-orange-900/40 text-orange-400"><i class="fa-solid fa-hourglass-half" /></div>
          <div>
            <div class="stat-value text-orange-400">{{ fmt.num(s.stale) }}</div>
            <div class="stat-label">Stale &gt;30hr</div>
          </div>
        </div>

        <!-- Unassigned -->
        <div class="stat-card">
          <div class="stat-icon bg-gray-800 text-gray-400"><i class="fa-solid fa-user-slash" /></div>
          <div>
            <div class="stat-value text-gray-300">{{ fmt.num(s.unassigned) }}</div>
            <div class="stat-label">Unassigned</div>
          </div>
        </div>

      </div>

      <!-- ── ROW 2: Pipeline Value + Health Score + Revenue ────────── -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">

        <!-- Pipeline Value -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-funnel-dollar mr-1.5 text-primary-400" />Nilai Pipeline</div>
          <div class="space-y-2.5">
            <div class="flex justify-between items-end">
              <span class="text-xs text-gray-500">Total Propose</span>
              <span class="text-sm font-semibold text-white">{{ fmt.rupiah(s.total_pipeline) }}</span>
            </div>
            <div class="flex justify-between items-end">
              <span class="text-xs text-gray-500">Active Pipeline</span>
              <span class="text-base font-bold text-primary-300">{{ fmt.rupiah(s.active_pipeline) }}</span>
            </div>
            <div class="flex justify-between items-end">
              <span class="text-xs text-gray-500">Weighted (prob)</span>
              <span class="text-sm font-semibold text-blue-300">{{ fmt.rupiah(s.weighted_pipeline) }}</span>
            </div>
            <div class="h-px bg-navy-700 my-1" />
            <div class="flex justify-between items-end">
              <span class="text-xs text-gray-500">Total Won</span>
              <span class="text-sm font-semibold text-emerald-400">{{ fmt.rupiah(s.total_won) }}</span>
            </div>
          </div>
        </div>

        <!-- Pipeline Health Score -->
        <div class="card flex flex-col items-center justify-center text-center">
          <div class="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Pipeline Health Score</div>
          <!-- Circle gauge -->
          <div v-if="data.health_score === 0 && (data.stats?.total ?? 0) === 0" class="flex flex-col items-center justify-center w-28 h-28 mb-3">
            <i class="fa-solid fa-circle-question text-4xl text-gray-700 mb-1" />
            <span class="text-xs text-gray-600 text-center">Belum ada<br>data lead</span>
          </div>
          <div v-else class="relative w-28 h-28 mb-3">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" stroke-width="10"/>
              <circle cx="50" cy="50" r="40" fill="none"
                      :stroke="healthColor" stroke-width="10"
                      stroke-linecap="round"
                      :stroke-dasharray="`${data.health_score * 2.51} 251`"
                      style="transition:stroke-dasharray 1s ease"/>
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span class="text-3xl font-bold text-white">{{ data.health_score }}</span>
              <span class="text-xs text-gray-500">/ 100</span>
            </div>
          </div>
          <div v-if="data.health_score === 0 && (data.stats?.total ?? 0) === 0" class="text-sm text-gray-600">
            Tidak ada data
          </div>
          <template v-else-if="data.health_score > 0 || (data.stats?.total ?? 0) > 0">
            <div class="text-sm font-semibold" :class="healthColor === '#34d399' ? 'text-emerald-400' : healthColor === '#facc15' ? 'text-yellow-400' : 'text-red-400'">
              {{ healthLabel }}
            </div>
            <p class="text-xs text-gray-500 mt-1 max-w-36">{{ healthDesc }}</p>
          </template>
        </div>

        <!-- Revenue Achievement -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-chart-line mr-1.5 text-emerald-400" />Revenue Bulan Ini</div>
          <div class="mb-3">
            <div class="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Aktual</span>
              <span>Target</span>
            </div>
            <div class="flex justify-between text-sm font-semibold mb-2">
              <span class="text-white">{{ fmt.rupiah(data.rev_actual) }}</span>
              <span class="text-gray-400">{{ fmt.rupiah(data.rev_target) }}</span>
            </div>
            <div class="h-3 bg-navy-800 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                   :class="data.rev_ach >= 80 ? 'bg-emerald-500' : data.rev_ach >= 50 ? 'bg-yellow-500' : 'bg-red-500'"
                   :style="`width: ${Math.min(data.rev_ach, 100)}%`" />
            </div>
            <div class="flex justify-between mt-2">
              <span class="text-xs text-gray-500">Pencapaian</span>
              <span class="text-sm font-bold" :class="data.rev_ach >= 80 ? 'text-emerald-400' : data.rev_ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
                {{ data.rev_ach }}%
              </span>
            </div>
          </div>
          <div class="h-px bg-navy-700/60 my-3" />
          <NuxtLink to="/revenue" class="btn-secondary btn-sm w-full justify-center text-xs">
            Detail Revenue <i class="fa-solid fa-arrow-right ml-1" />
          </NuxtLink>
        </div>
      </div>

      <!-- ── ROW 3: Stage Funnel + Segmen + Priority ───────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        <!-- Stage Funnel -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-layer-group mr-1.5" />Pipeline per Stage</div>
          <div class="space-y-2">
            <div v-for="s in stageFunnel" :key="s.stage" class="flex items-center gap-2">
              <span class="w-24 text-xs text-gray-300 truncate flex-shrink-0">{{ s.stage }}</span>
              <div class="flex-1 h-4 bg-navy-800 rounded overflow-hidden">
                <div class="h-full rounded" :style="`width:${s.pct}%; background:${s.color}`" />
              </div>
              <span class="text-xs font-semibold w-8 text-right flex-shrink-0" :style="`color:${s.color}`">{{ fmt.num(s.jumlah) }}</span>
              <span class="text-xs text-gray-600 w-16 text-right flex-shrink-0">{{ fmt.rupiah(s.total_nilai) }}</span>
            </div>
          </div>
        </div>

        <!-- By Segmen -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-building mr-1.5" />Per Segmen</div>
          <div class="space-y-2.5">
            <div v-for="sg in data.by_segmen" :key="sg.segmen" class="flex items-center gap-2">
              <span class="w-24 text-xs text-gray-300 truncate flex-shrink-0">{{ sg.segmen }}</span>
              <div class="flex-1 h-3 bg-navy-800 rounded overflow-hidden">
                <div class="h-full rounded bg-primary-600"
                     :style="`width:${Math.round(sg.jumlah/s.total*100)}%`" />
              </div>
              <span class="text-xs text-gray-400 w-8 text-right flex-shrink-0">{{ fmt.num(sg.jumlah) }}</span>
              <span class="text-xs text-gray-600 w-14 text-right flex-shrink-0">{{ fmt.rupiah(sg.total_nilai) }}</span>
            </div>
          </div>
          <div class="mt-4 pt-3 border-t border-navy-800">
            <div class="section-title mb-2 text-xs"><i class="fa-solid fa-share-nodes mr-1" />Sumber Lead</div>
            <div class="flex flex-wrap gap-2">
              <div v-for="src in data.by_source" :key="src.source"
                   class="flex-1 min-w-0 bg-navy-800/60 rounded-lg px-2 py-1.5 text-center">
                <div class="text-sm font-bold text-white">{{ src.jumlah }}</div>
                <div class="text-xs text-gray-500 truncate">{{ src.source }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Priority + Upcoming FU -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-fire mr-1.5 text-orange-400" />Per Prioritas</div>
          <div class="flex gap-3 mb-4">
            <div v-for="p in data.by_priority" :key="p.prioritas"
                 class="flex-1 rounded-lg p-3 text-center border"
                 :class="p.prioritas==='Hot' ? 'border-red-700/50 bg-red-900/20'
                       : p.prioritas==='Warm' ? 'border-yellow-700/50 bg-yellow-900/20'
                       : 'border-blue-700/50 bg-blue-900/20'">
              <div class="text-xl font-bold"
                   :class="p.prioritas==='Hot' ? 'text-red-400' : p.prioritas==='Warm' ? 'text-yellow-400' : 'text-blue-400'">
                {{ fmt.num(p.jumlah) }}
              </div>
              <div class="text-xs text-gray-400 mt-0.5">{{ p.prioritas }}</div>
              <div class="text-xs text-gray-600">{{ fmt.rupiah(p.total_nilai) }}</div>
            </div>
          </div>
          <div class="section-title mb-2 text-xs"><i class="fa-solid fa-calendar-check mr-1 text-blue-400" />FU Mendatang</div>
          <div class="space-y-1.5">
            <div v-for="fu in data.upcoming_fu" :key="fu.lead_id"
                 class="flex items-center gap-2 py-1 border-b border-navy-800/60 last:border-0">
              <NuxtLink :to="`/pipeline/${fu.lead_id}`" class="flex-1 text-xs text-gray-300 hover:text-primary-300 truncate">
                {{ fu.nama_company }}
              </NuxtLink>
              <span class="text-xs text-gray-500 flex-shrink-0">{{ fmt.tgl(fu.next_fu_date) }}</span>
            </div>
            <div v-if="!data.upcoming_fu?.length" class="text-xs text-gray-600 py-2 text-center">
              Tidak ada jadwal FU minggu ini
            </div>
          </div>
        </div>

      </div>

      <!-- ── ROW 3b: Per Organisasi ────────────────────────────────── -->
      <div v-if="data.by_organisasi?.length" class="card mb-5">
        <div class="section-title mb-3"><i class="fa-solid fa-sitemap mr-1.5 text-primary-400" />Per Organisasi</div>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          <div v-for="org in data.by_organisasi" :key="org.organisasi"
               class="bg-navy-800/50 rounded-lg p-3 border border-navy-700/50">
            <div class="flex items-center justify-between mb-2">
              <span class="font-mono text-xs bg-navy-700 text-primary-300 px-2 py-0.5 rounded font-semibold">
                {{ org.organisasi }}
              </span>
              <span class="text-xs text-gray-500">{{ org.jumlah }} leads</span>
            </div>
            <div class="text-sm font-bold text-white mb-1">{{ fmt.rupiah(org.total_nilai) }}</div>
            <div class="h-px bg-navy-700/60 my-1.5" />
            <div class="flex items-center justify-between text-xs text-gray-500">
              <span>Aktif: <span class="text-primary-300 font-medium">{{ org.aktif }}</span></span>
              <span>Won: <span class="text-emerald-400 font-medium">{{ org.won }}</span></span>
            </div>
            <div class="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden">
              <div class="h-full rounded-full bg-primary-600 transition-all"
                   :style="`width:${s.total > 0 ? Math.round(org.jumlah/s.total*100) : 0}%`" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── ROW 4: Strategic Insights ──────────────────────────────── -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">

        <!-- Ready to Close -->
        <div class="card">
          <div class="section-title text-emerald-400 mb-3">
            <i class="fa-solid fa-bullseye mr-1.5" />Siap Closing
            <span class="ml-auto text-xs text-gray-600 font-normal">(Proposal/Negosiasi)</span>
          </div>
          <div v-if="data.ready_to_close?.length" class="space-y-2">
            <div v-for="l in data.ready_to_close.slice(0,5)" :key="l.lead_id"
                 class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0">
              <span :class="fmt.priorityClass(l.prioritas)" class="flex-shrink-0 text-xs">{{ l.prioritas }}</span>
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-xs text-gray-300 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <span v-if="l.organisasi" class="font-mono text-[10px] text-primary-400">{{ l.organisasi }}</span>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs font-semibold text-emerald-400">{{ fmt.rupiah(l.propose_value) }}</div>
                <div class="text-xs text-gray-600">{{ l.probability ?? '—' }}%</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-xs text-gray-600">Belum ada leads di tahap ini</div>
          <NuxtLink to="/insights" class="mt-3 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1">
            Lihat semua <i class="fa-solid fa-arrow-right text-xs" />
          </NuxtLink>
        </div>

        <!-- Hot Stale -->
        <div class="card">
          <div class="section-title text-red-400 mb-3">
            <i class="fa-solid fa-fire-flame-curved mr-1.5" />Hot Terabaikan
            <span class="ml-auto text-xs text-gray-600 font-normal">(&gt;14 hr tanpa FU)</span>
          </div>
          <div v-if="data.hot_stale?.length" class="space-y-2">
            <div v-for="l in data.hot_stale.slice(0,5)" :key="l.lead_id"
                 class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0">
              <div class="w-6 h-6 rounded-full bg-red-900/40 flex items-center justify-center flex-shrink-0">
                <i class="fa-solid fa-fire text-red-400 text-xs" />
              </div>
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-xs text-gray-300 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <span v-if="l.organisasi" class="font-mono text-[10px] text-primary-400">{{ l.organisasi }}</span>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs font-bold text-red-400">{{ l.days_since_fu >= 9999 ? '∞' : l.days_since_fu + 'hr' }}</div>
                <div class="text-xs text-gray-600">{{ fmt.rupiah(l.propose_value) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6">
            <i class="fa-solid fa-circle-check text-emerald-400 text-xl mb-1.5 block" />
            <div class="text-xs text-gray-600">Semua Hot leads ter-follow-up</div>
          </div>
          <NuxtLink to="/today" class="mt-3 text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
            Follow up sekarang <i class="fa-solid fa-arrow-right text-xs" />
          </NuxtLink>
        </div>

        <!-- Closing Soon -->
        <div class="card">
          <div class="section-title text-yellow-400 mb-3">
            <i class="fa-solid fa-calendar-check mr-1.5" />Deadline Terdekat
          </div>
          <div v-if="data.closing_soon?.length" class="space-y-2">
            <div v-for="l in data.closing_soon.slice(0,5)" :key="l.lead_id"
                 class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0">
              <div class="w-8 text-center flex-shrink-0">
                <div class="text-sm font-bold" :class="l.days_until_close <= 7 ? 'text-red-400' : l.days_until_close <= 30 ? 'text-yellow-400' : 'text-gray-400'">
                  {{ l.days_until_close }}
                </div>
                <div class="text-xs text-gray-600">hr</div>
              </div>
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-xs text-gray-300 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <span v-if="l.organisasi" class="font-mono text-[10px] text-primary-400">{{ l.organisasi }}</span>
              </div>
              <div class="text-xs text-gray-500 flex-shrink-0">{{ fmt.rupiah(l.propose_value) }}</div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-xs text-gray-600">Tidak ada deadline terdekat</div>
        </div>

        <!-- On Hold at Risk -->
        <div class="card">
          <div class="section-title text-orange-400 mb-3">
            <i class="fa-solid fa-pause-circle mr-1.5" />On Hold at Risk
            <span class="ml-auto text-xs text-gray-600 font-normal">{{ fmt.rupiah(s.onhold_value) }}</span>
          </div>
          <div v-if="data.onhold_at_risk?.length" class="space-y-2">
            <div v-for="l in data.onhold_at_risk.slice(0,5)" :key="l.lead_id"
                 class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0">
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-xs text-gray-300 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs text-gray-600">{{ l.sales_owner || 'Unassigned' }}</span>
                  <span v-if="l.organisasi" class="font-mono text-[10px] text-primary-400">· {{ l.organisasi }}</span>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs font-semibold text-orange-400">{{ fmt.rupiah(l.propose_value) }}</div>
                <div class="text-xs text-gray-600">{{ l.days_idle >= 9999 ? '∞' : l.days_idle + 'hr' }} idle</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-xs text-gray-600">Tidak ada leads On Hold</div>
        </div>

      </div>

      <!-- ── ROW 5: Overdue Alert + Recent Activity ────────────────── -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

        <!-- Alert: Overdue / Unassigned -->
        <div class="card">
          <div class="section-title mb-3">
            <i class="fa-solid fa-triangle-exclamation text-yellow-400 mr-1.5" />Yang Perlu Perhatian Segera
          </div>

          <!-- Unassigned alert -->
          <div v-if="s.unassigned > 0"
               class="flex items-center gap-3 bg-orange-900/20 border border-orange-700/40 rounded-lg px-3 py-2.5 mb-3">
            <i class="fa-solid fa-user-slash text-orange-400 text-sm flex-shrink-0" />
            <div class="flex-1 text-xs text-orange-300">
              <strong>{{ s.unassigned }} leads</strong> belum ditugaskan ke sales
            </div>
            <NuxtLink to="/pipeline" class="btn-sm text-xs border border-orange-700/50 text-orange-300 rounded px-2 py-1 hover:bg-orange-900/30 flex-shrink-0">
              Assign
            </NuxtLink>
          </div>

          <!-- Stale alert -->
          <div v-if="s.stale > 0"
               class="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-3 py-2.5 mb-3">
            <i class="fa-solid fa-hourglass-end text-yellow-400 text-sm flex-shrink-0" />
            <div class="flex-1 text-xs text-yellow-300">
              <strong>{{ s.stale }} leads</strong> tanpa follow-up lebih dari 30 hari
            </div>
            <NuxtLink to="/today" class="btn-sm text-xs border border-yellow-700/50 text-yellow-300 rounded px-2 py-1 hover:bg-yellow-900/30 flex-shrink-0">
              Lihat
            </NuxtLink>
          </div>

          <!-- Overdue FU list with pagination -->
          <div v-if="overdue.data?.length">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs text-gray-500">Overdue Follow-Up</span>
              <span class="text-xs text-red-400">{{ fmt.num(overdue.total) }} total</span>
            </div>
            <div v-for="l in overdue.data" :key="l.lead_id"
                 class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0">
              <span :class="fmt.priorityClass(l.prioritas)" class="flex-shrink-0">{{ l.prioritas }}</span>
              <NuxtLink :to="`/pipeline/${l.lead_id}`" class="flex-1 text-xs text-gray-300 hover:text-primary-300 truncate">
                {{ l.nama_company }}
              </NuxtLink>
              <span class="text-xs text-red-400 flex-shrink-0">{{ l.days_overdue }}h lalu</span>
            </div>
            <AppPagination
              v-if="overdue.total_pages > 1"
              class="mt-3"
              :page="overduePage" :per-page="overduePerPage"
              :total="overdue.total" :total-pages="overdue.total_pages"
              :per-page-options="[5, 10]"
              @update:page="overduePage = $event; loadOverdue()"
              @update:per-page="overduePerPage = $event; overduePage = 1; loadOverdue()"
            />
          </div>

          <div v-if="!s.unassigned && !s.stale && !overdue.data?.length"
               class="text-center py-6 text-gray-500 text-sm">
            <i class="fa-solid fa-circle-check text-emerald-500 text-2xl mb-2 block" />
            Pipeline dalam kondisi baik!
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="section-title mb-3">
            <i class="fa-solid fa-clock-rotate-left text-primary-400 mr-1.5" />Aktivitas Terbaru
            <span class="ml-auto text-xs text-gray-600 font-normal">{{ fmt.num(activity.total) }} aktivitas</span>
          </div>
          <div v-if="activity.data?.length" class="space-y-2">
            <div v-for="a in activity.data" :key="`${a.lead_id}-${a.tgl_fu}`"
                 class="flex items-start gap-3 p-2.5 rounded-lg bg-navy-800/40 hover:bg-navy-800/70 transition-colors">
              <div class="w-8 h-8 rounded-full bg-primary-800/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <i :class="`fa-solid ${metodeIcon(a.metode_fu)} text-xs text-primary-400`" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between gap-2">
                  <NuxtLink :to="`/pipeline/${a.lead_id}`" class="text-xs font-medium text-gray-200 hover:text-primary-300 truncate">
                    {{ a.nama_company }}
                  </NuxtLink>
                  <span class="text-xs text-gray-600 flex-shrink-0">{{ fmt.tgl(a.tgl_fu) }}</span>
                </div>
                <div class="text-xs text-gray-500 mt-0.5">{{ a.metode_fu }} · {{ a.hasil_fu }}</div>
                <div v-if="a.catatan_fu" class="text-xs text-gray-600 truncate mt-0.5">{{ a.catatan_fu }}</div>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-600 text-sm">
            <i class="fa-solid fa-inbox text-2xl mb-2 block" />
            Belum ada aktivitas follow-up
          </div>
          <AppPagination
            v-if="activity.total_pages > 1"
            class="mt-3"
            :page="activityPage" :per-page="activityPerPage"
            :total="activity.total" :total-pages="activity.total_pages"
            :per-page-options="[5, 10, 25]"
            @update:page="activityPage = $event; loadActivity()"
            @update:per-page="activityPerPage = $event; activityPage = 1; loadActivity()"
          />
        </div>

      </div>

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get } = useApi()
const fmt = useFormat()

const { data, pending, refresh } = await useAsyncData('dashboard', () => get('/v1/dashboard'), { server: false })

// ── Overdue FU pagination ─────────────────────────────────────────────────
const overduePage    = ref(1)
const overduePerPage = ref(10)
const overdue        = ref<any>({ data: [], total: 0, total_pages: 1 })

async function loadOverdue() {
  overdue.value = await get('/v1/dashboard/overdue-fu', { page: overduePage.value, per_page: overduePerPage.value })
}

// ── Recent Activity pagination ────────────────────────────────────────────
const activityPage    = ref(1)
const activityPerPage = ref(10)
const activity        = ref<any>({ data: [], total: 0, total_pages: 1 })

async function loadActivity() {
  activity.value = await get('/v1/dashboard/recent-activity', { page: activityPage.value, per_page: activityPerPage.value })
}

onMounted(() => { loadOverdue(); loadActivity() })

const todayLabel = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
)

const s = computed(() => {
  const st = data.value?.stats ?? {}
  return {
    total:            Number(st.total ?? 0),
    won:              Number(st.won ?? 0),
    lost:             Number(st.lost ?? 0),
    on_hold:          Number(st.on_hold ?? 0),
    aktif:            Number(st.aktif ?? 0),
    unassigned:       Number(st.unassigned ?? 0),
    stale:            Number(st.stale ?? 0),
    overdue_fu:       Number(st.overdue_fu ?? 0),
    total_pipeline:   Number(st.total_pipeline ?? 0),
    active_pipeline:  Number(st.active_pipeline ?? 0),
    weighted_pipeline:Number(st.weighted_pipeline ?? 0),
    total_won:        Number(st.total_won ?? 0),
    onhold_value:     Number(st.onhold_value ?? 0),
  }
})

const winRate = computed(() => {
  const closed = s.value.won + s.value.lost
  return closed ? Math.round(s.value.won / closed * 100) : 0
})

const STAGE_COLORS: Record<string, string> = {
  'New':'#60a5fa','In Progress':'#a78bfa','Demo Scheduled':'#f472b6',
  'Proposal Sent':'#fb923c','Negotiation':'#facc15','Won':'#34d399',
  'On Hold':'#94a3b8','Lost':'#f87171',
}
const stageFunnel = computed(() => {
  const rows = data.value?.by_stage ?? []
  const max  = Math.max(...rows.map((r: any) => Number(r.jumlah)), 1)
  return rows.map((r: any) => ({
    ...r,
    pct:   Math.round(Number(r.jumlah) / max * 100),
    color: STAGE_COLORS[r.stage] ?? '#64748b',
  }))
})

const healthColor = computed(() => {
  const h = data.value?.health_score ?? 0
  return h >= 70 ? '#34d399' : h >= 40 ? '#facc15' : '#f87171'
})
const healthLabel = computed(() => {
  const h = data.value?.health_score ?? 0
  return h >= 70 ? 'Sehat' : h >= 40 ? 'Perlu Perhatian' : 'Kritis'
})
const healthDesc = computed(() => {
  const h = data.value?.health_score ?? 0
  return h >= 70 ? 'Pipeline berjalan baik'
       : h >= 40 ? 'Ada beberapa masalah yang perlu ditangani'
       : 'Pipeline butuh intervensi segera'
})

function metodeIcon(m: string) {
  const map: Record<string, string> = {
    'WhatsApp':'fa-whatsapp','Email':'fa-envelope','Telepon':'fa-phone',
    'Meeting':'fa-handshake','Demo':'fa-desktop',
  }
  return map[m] ?? 'fa-comment'
}
</script>
