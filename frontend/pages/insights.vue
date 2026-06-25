<template>
  <div>
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-lightbulb text-yellow-400 mr-2" />Pipeline Insights</h1>
        <p class="page-subtitle">Analisis mendalam — apa yang terjadi, kenapa, dan apa yang harus dilakukan</p>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">

      <!-- ═══════════════════════════════════════════════════════════════
           PANEL 1 — APA YANG TERJADI
      ════════════════════════════════════════════════════════════════ -->
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-blue-900/60 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">1</div>
        <div>
          <h2 class="text-base font-bold text-white">Apa yang Terjadi?</h2>
          <p class="text-xs text-gray-500">Gambaran kondisi pipeline saat ini secara menyeluruh</p>
        </div>
      </div>

      <!-- KPI Strip -->
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
        <div class="stat-card">
          <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-briefcase" /></div>
          <div><div class="stat-value">{{ fmt.num(st.total) }}</div><div class="stat-label">Total Leads</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-fire" /></div>
          <div><div class="stat-value text-primary-300">{{ fmt.num(st.aktif) }}</div><div class="stat-label">Aktif</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-trophy" /></div>
          <div>
            <div class="stat-value text-emerald-400">{{ fmt.num(st.won) }}</div>
            <div class="stat-label">Won ({{ winRate }}%)</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange-900/40 text-orange-400"><i class="fa-solid fa-hourglass-half" /></div>
          <div><div class="stat-value text-orange-400">{{ fmt.num(staleCount) }}</div><div class="stat-label">Stale &gt;30hr</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-gray-800 text-gray-400"><i class="fa-solid fa-user-slash" /></div>
          <div><div class="stat-value text-gray-300">{{ fmt.num(st.unassigned) }}</div><div class="stat-label">Unassigned</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-yellow-900/40 text-yellow-400"><i class="fa-solid fa-pause-circle" /></div>
          <div><div class="stat-value text-yellow-400">{{ fmt.num(st.on_hold) }}</div><div class="stat-label">On Hold</div></div>
        </div>
      </div>

      <!-- Pipeline value + stage funnel -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        <!-- Pipeline Value card -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-funnel-dollar mr-1.5 text-primary-400" />Nilai Pipeline</div>
          <div class="space-y-2.5">
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">Total Propose</span>
              <span class="text-sm font-semibold text-white">{{ fmt.rupiah(st.total_pipeline) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">Active Pipeline</span>
              <span class="text-base font-bold text-primary-300">{{ fmt.rupiah(st.active_pipeline) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">Weighted (prob)</span>
              <span class="text-sm font-semibold text-blue-300">{{ fmt.rupiah(st.weighted_pipeline) }}</span>
            </div>
            <div class="h-px bg-navy-700" />
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">Total Won</span>
              <span class="text-sm font-semibold text-emerald-400">{{ fmt.rupiah(st.total_won) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-xs text-gray-500">Avg Days to Close</span>
              <span class="text-sm font-semibold text-gray-300">{{ data.avg_days_close ?? '—' }} hari</span>
            </div>
          </div>
        </div>

        <!-- Stage Funnel -->
        <div class="card lg:col-span-2">
          <div class="section-title mb-3"><i class="fa-solid fa-layer-group mr-1.5" />Funnel per Stage</div>
          <div class="space-y-2.5">
            <div v-for="row in stageFunnel" :key="row.stage" class="flex items-center gap-3">
              <span class="w-28 text-xs text-gray-400 truncate flex-shrink-0">{{ row.stage }}</span>
              <div class="flex-1 h-5 bg-navy-800 rounded overflow-hidden">
                <div class="h-full rounded transition-all duration-700 flex items-center px-2"
                     :style="`width:${row.pct}%; background:${row.color}`">
                  <span v-if="row.pct > 20" class="text-xs font-bold text-white">{{ row.pct }}%</span>
                </div>
              </div>
              <span class="text-xs font-bold w-5 text-right flex-shrink-0 text-white">{{ fmt.num(row.jumlah) }}</span>
              <span class="text-xs text-gray-500 w-20 text-right flex-shrink-0">{{ fmt.rupiah(row.total_nilai) }}</span>
              <span class="text-xs text-blue-400 w-20 text-right flex-shrink-0">{{ fmt.rupiah(row.weighted) }}</span>
            </div>
          </div>
          <div class="flex justify-end gap-4 mt-2 text-xs text-gray-600">
            <span><span class="text-white">█</span> Propose</span>
            <span><span class="text-blue-400">█</span> Weighted</span>
          </div>
        </div>
      </div>

      <!-- Top high-value leads -->
      <div class="card mb-5">
        <div class="section-title mb-3"><i class="fa-solid fa-star mr-1.5 text-yellow-400" />Top 5 Leads High Value (Aktif)</div>
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-500 border-b border-navy-700">
                <th class="text-left pb-2 pr-3">Perusahaan</th>
                <th class="text-left pb-2 pr-3">Stage</th>
                <th class="text-left pb-2 pr-3">Sales</th>
                <th class="text-right pb-2 pr-3">Propose Value</th>
                <th class="text-right pb-2 pr-3">Prob.</th>
                <th class="text-right pb-2">Exp Close</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in data.high_value" :key="l.lead_id" class="border-b border-navy-800/60 hover:bg-navy-800/30 transition-colors">
                <td class="py-2 pr-3">
                  <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-gray-200 hover:text-primary-300 font-medium">
                    {{ l.nama_company }}
                  </NuxtLink>
                </td>
                <td class="py-2 pr-3"><span :class="fmt.stageClass(l.stage)">{{ l.stage }}</span></td>
                <td class="py-2 pr-3 text-gray-400">{{ l.sales_owner || '—' }}</td>
                <td class="py-2 pr-3 text-right font-semibold text-primary-300">{{ fmt.rupiah(l.propose_value) }}</td>
                <td class="py-2 pr-3 text-right text-gray-400">{{ l.probability ?? '—' }}%</td>
                <td class="py-2 text-right text-gray-500">{{ fmt.tgl(l.exp_close_date) }}</td>
              </tr>
              <tr v-if="!data.high_value?.length">
                <td colspan="6" class="py-6 text-center text-gray-600">Belum ada data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Monthly trend -->
      <div class="card mb-8">
        <div class="section-title mb-4"><i class="fa-solid fa-chart-bar mr-1.5 text-blue-400" />Tren Leads Masuk (6 Bulan Terakhir)</div>
        <div v-if="data.monthly_trend?.length" class="flex items-end gap-2 h-32">
          <div v-for="m in data.monthly_trend" :key="m.bulan"
               class="flex-1 flex flex-col items-center justify-end gap-1">
            <div class="text-xs text-gray-500">{{ fmt.num(m.jumlah) }}</div>
            <div class="w-full rounded-t bg-primary-600 transition-all duration-700"
                 :style="`height:${monthlyMax ? Math.max(Math.round(m.jumlah/monthlyMax*96), 4) : 4}px`" />
            <div class="text-xs text-gray-600">{{ m.bulan.slice(5) }}/{{ m.bulan.slice(2,4) }}</div>
          </div>
        </div>
        <div v-else class="text-center py-8 text-gray-600 text-sm">Belum ada data trend</div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════
           PANEL 2 — KENAPA BISA TERJADI
      ════════════════════════════════════════════════════════════════ -->
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-yellow-900/60 flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">2</div>
        <div>
          <h2 class="text-base font-bold text-white">Kenapa Bisa Terjadi?</h2>
          <p class="text-xs text-gray-500">Root cause analysis berdasarkan data pipeline</p>
        </div>
      </div>

      <div v-if="noData" class="card mb-8 text-center py-8">
        <i class="fa-solid fa-database text-3xl text-gray-700 mb-3 block" />
        <div class="text-sm text-gray-500">Tidak ada data lead untuk dianalisis</div>
      </div>

      <!-- Root cause cards + seluruh analisis Panel 2 -->
      <template v-else>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <div v-for="rc in rootCauses" :key="rc.title"
             class="card border-l-4"
             :class="rc.level === 'critical' ? 'border-red-500' : rc.level === 'warning' ? 'border-yellow-500' : 'border-blue-500'">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                 :class="rc.level === 'critical' ? 'bg-red-900/40 text-red-400' : rc.level === 'warning' ? 'bg-yellow-900/40 text-yellow-400' : 'bg-blue-900/40 text-blue-400'">
              <i :class="`fa-solid ${rc.icon} text-sm`" />
            </div>
            <div>
              <div class="text-sm font-semibold text-white mb-1">{{ rc.title }}</div>
              <div class="text-xs text-gray-400">{{ rc.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pipeline Velocity + Source Conversion -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

        <!-- Pipeline Velocity -->
        <div class="card">
          <div class="section-title mb-3">
            <i class="fa-solid fa-gauge-high mr-1.5 text-primary-400" />Pipeline Velocity
            <span class="ml-2 text-xs text-gray-500 font-normal">Rata-rata hari per stage</span>
          </div>
          <div v-if="data.velocity?.length" class="space-y-2.5">
            <div v-for="v in data.velocity" :key="v.stage" class="flex items-center gap-3">
              <span class="w-28 text-xs text-gray-400 truncate flex-shrink-0">{{ v.stage }}</span>
              <div class="flex-1 h-4 bg-navy-800 rounded overflow-hidden">
                <div class="h-full rounded transition-all duration-700"
                     :class="v.avg_days > 90 ? 'bg-red-500' : v.avg_days > 30 ? 'bg-yellow-500' : 'bg-emerald-500'"
                     :style="`width:${velocityMax ? Math.round(v.avg_days/velocityMax*100) : 0}%`" />
              </div>
              <div class="text-right flex-shrink-0 w-16">
                <div class="text-xs font-bold"
                     :class="v.avg_days > 90 ? 'text-red-400' : v.avg_days > 30 ? 'text-yellow-400' : 'text-emerald-400'">
                  {{ v.avg_days }} hr
                </div>
                <div class="text-xs text-gray-600">{{ fmt.num(v.jumlah) }} leads</div>
              </div>
            </div>
            <div class="flex gap-4 pt-2 text-xs text-gray-600">
              <span><span class="text-emerald-400">█</span> ≤30hr</span>
              <span><span class="text-yellow-400">█</span> 31-90hr</span>
              <span><span class="text-red-400">█</span> &gt;90hr</span>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-600 text-sm">Data velocity belum tersedia</div>
        </div>

        <!-- Source Conversion -->
        <div class="card">
          <div class="section-title mb-3">
            <i class="fa-solid fa-share-nodes mr-1.5 text-purple-400" />Konversi per Sumber Lead
          </div>
          <div v-if="data.source_conversion?.length" class="space-y-3">
            <div v-for="src in data.source_conversion" :key="src.source">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs text-gray-300 font-medium">{{ src.source }}</span>
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-emerald-400">{{ fmt.num(src.won) }}W</span>
                  <span class="text-gray-500">/</span>
                  <span class="text-red-400">{{ fmt.num(src.lost) }}L</span>
                  <span class="text-gray-600">of {{ fmt.num(src.total) }}</span>
                  <span class="font-bold text-white ml-1">
                    {{ src.won + src.lost > 0 ? Math.round(src.won/(src.won+src.lost)*100) + '%' : '—' }}
                  </span>
                </div>
              </div>
              <div class="flex h-2.5 rounded overflow-hidden bg-navy-800">
                <div class="bg-emerald-500 transition-all duration-700"
                     :style="`width:${src.total ? src.won/src.total*100 : 0}%`" />
                <div class="bg-red-500 transition-all duration-700"
                     :style="`width:${src.total ? src.lost/src.total*100 : 0}%`" />
              </div>
              <div class="text-xs text-gray-600 mt-0.5">Pipeline: {{ fmt.rupiah(src.pipeline_value) }}</div>
            </div>
          </div>
          <div v-else class="text-center py-6 text-gray-600 text-sm">Data source belum tersedia</div>
        </div>
      </div>

      <!-- Stale leads + Sales distribution -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">

        <div class="card">
          <div class="section-title text-orange-400 mb-3">
            <i class="fa-solid fa-hourglass-end mr-1.5" />Leads Stale Terlama
          </div>
          <div v-if="data.stale_leads?.length" class="space-y-2">
            <div v-for="l in data.stale_leads" :key="l.lead_id"
                 class="flex items-center gap-3 py-1.5 border-b border-navy-800 last:border-0">
              <div class="text-center w-10 flex-shrink-0">
                <div class="text-sm font-bold"
                     :class="l.days_since_fu > 90 ? 'text-red-400' : l.days_since_fu > 60 ? 'text-orange-400' : 'text-yellow-400'">
                  {{ l.days_since_fu >= 9999 ? '∞' : l.days_since_fu }}
                </div>
                <div class="text-xs text-gray-600">hr</div>
              </div>
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-xs font-medium text-gray-300 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <div class="text-xs text-gray-500">{{ l.stage }} · {{ l.sales_owner || 'Unassigned' }}</div>
              </div>
              <div class="text-xs text-gray-500 flex-shrink-0">{{ fmt.rupiah(l.propose_value) }}</div>
            </div>
          </div>
          <div v-else class="text-center py-6">
            <i class="fa-solid fa-check-circle text-emerald-400 text-2xl mb-2 block" />
            <div class="text-sm text-gray-500">Semua leads aktif terjadwal</div>
          </div>
        </div>

        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-users mr-1.5 text-primary-400" />Distribusi per Sales</div>
          <div v-if="data.by_sales?.length" class="space-y-3">
            <div v-for="sl in data.by_sales" :key="sl.sales_owner" class="flex items-center gap-3">
              <div class="w-7 h-7 rounded-full bg-primary-800/50 flex items-center justify-center text-xs font-bold text-primary-300 flex-shrink-0">
                {{ sl.sales_owner?.charAt(0) ?? '?' }}
              </div>
              <div class="flex-1">
                <div class="flex justify-between text-xs mb-1">
                  <span class="text-gray-300">{{ sl.sales_owner }}</span>
                  <span class="text-gray-500">{{ fmt.num(sl.jumlah) }} leads ({{ fmt.num(sl.aktif) }} aktif)</span>
                </div>
                <div class="h-2 bg-navy-800 rounded overflow-hidden">
                  <div class="h-full bg-primary-600 rounded transition-all duration-700"
                       :style="`width:${salesMax ? Math.round(sl.jumlah/salesMax*100) : 0}%`" />
                </div>
              </div>
              <div class="text-xs text-gray-600 flex-shrink-0 w-20 text-right">{{ fmt.rupiah(sl.total_nilai) }}</div>
            </div>
          </div>
        </div>
      </div>

      </template><!-- end v-else noData panel 2 -->

      <!-- ═══════════════════════════════════════════════════════════════
           PANEL 3 — APA YANG HARUS DILAKUKAN
      ════════════════════════════════════════════════════════════════ -->
      <template v-if="!noData">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-emerald-900/60 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">3</div>
        <div>
          <h2 class="text-base font-bold text-white">Apa yang Harus Dilakukan?</h2>
          <p class="text-xs text-gray-500">Rekomendasi aksi prioritas berdasarkan analisis data</p>
        </div>
      </div>

      <!-- Weighted Forecast -->
      <div class="card mb-5">
        <div class="section-title mb-3">
          <i class="fa-solid fa-chart-pie mr-1.5 text-blue-400" />Weighted Pipeline Forecast per Stage
          <span class="ml-auto text-xs text-gray-500 font-normal">Total Weighted: {{ fmt.rupiah(totalWeighted) }}</span>
        </div>
        <div v-if="data.weighted_forecast?.length" class="space-y-3">
          <div v-for="w in data.weighted_forecast" :key="w.stage" class="flex items-center gap-3">
            <span class="w-28 text-xs text-gray-400 flex-shrink-0 truncate">{{ w.stage }}</span>
            <div class="flex-1 flex flex-col gap-1">
              <div class="h-2.5 rounded bg-primary-500/40 overflow-hidden">
                <div class="h-full bg-primary-500 opacity-60 transition-all duration-700"
                     :style="`width:${st.active_pipeline ? Math.min(Math.round(w.propose_value/st.active_pipeline*100),100) : 0}%`" />
              </div>
              <div class="h-2.5 rounded bg-navy-800 overflow-hidden">
                <div class="h-full bg-blue-500 transition-all duration-700"
                     :style="`width:${totalWeighted ? Math.min(Math.round(w.weighted_value/totalWeighted*100),100) : 0}%`" />
              </div>
            </div>
            <div class="text-right flex-shrink-0 w-32">
              <div class="text-xs text-gray-400">{{ fmt.rupiah(w.propose_value) }}</div>
              <div class="text-xs font-semibold text-blue-400">{{ fmt.rupiah(w.weighted_value) }}</div>
            </div>
            <div class="text-xs text-gray-600 w-10 text-right flex-shrink-0">{{ w.avg_probability }}%</div>
          </div>
          <div class="flex justify-end gap-4 text-xs text-gray-600 pt-1">
            <span><span class="text-primary-400 opacity-60">█</span> Propose</span>
            <span><span class="text-blue-400">█</span> Weighted</span>
          </div>
        </div>
        <div v-else class="text-center py-6 text-gray-600 text-sm">Data weighted forecast belum tersedia</div>
      </div>

      <!-- Action Cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        <!-- Hot Stale — urgent action -->
        <div class="card border border-red-900/50">
          <div class="section-title text-red-400 mb-3">
            <i class="fa-solid fa-bolt mr-1.5" />🔴 Hot Leads Terabaikan
          </div>
          <div v-if="data.hot_stale?.length" class="space-y-2 mb-3">
            <div v-for="l in data.hot_stale" :key="l.lead_id"
                 class="flex items-center gap-2 p-2 rounded-lg bg-red-900/10 border border-red-900/30">
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-xs font-medium text-gray-200 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <div class="text-xs text-gray-500">{{ l.stage }} · {{ l.sales_owner || 'Unassigned' }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs font-bold text-red-400">{{ l.days_since_fu >= 9999 ? '∞' : l.days_since_fu + 'hr' }}</div>
                <div class="text-xs text-gray-600">{{ fmt.rupiah(l.propose_value) }}</div>
              </div>
            </div>
          </div>
          <div v-else class="py-3 text-center text-xs text-emerald-400 mb-3">
            <i class="fa-solid fa-circle-check mr-1" />Semua Hot leads ter-follow-up!
          </div>
          <div class="text-xs text-gray-500 bg-navy-800/60 rounded-lg p-2.5">
            <strong class="text-white">Langkah:</strong>
            <ol class="list-decimal list-inside mt-1 space-y-0.5">
              <li>Hubungi via WhatsApp atau telepon hari ini</li>
              <li>Catat hasil follow-up di sistem</li>
              <li>Set jadwal next FU dalam 3-5 hari</li>
            </ol>
          </div>
          <NuxtLink to="/today" class="mt-3 btn-secondary btn-sm w-full justify-center text-xs">
            Buka Agenda Hari Ini
          </NuxtLink>
        </div>

        <!-- Ready to Close -->
        <div class="card border border-emerald-900/50">
          <div class="section-title text-emerald-400 mb-3">
            <i class="fa-solid fa-bullseye mr-1.5" />🟢 Siap Closing
          </div>
          <div v-if="data.ready_to_close?.length" class="space-y-2 mb-3">
            <div v-for="l in data.ready_to_close" :key="l.lead_id"
                 class="flex items-center gap-2 p-2 rounded-lg bg-emerald-900/10 border border-emerald-900/30">
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-xs font-medium text-gray-200 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <div class="text-xs text-gray-500">{{ l.stage }} · {{ l.sales_owner || '—' }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs font-bold text-emerald-400">{{ fmt.rupiah(l.propose_value) }}</div>
                <div class="text-xs text-gray-600">{{ l.probability ?? '—' }}%</div>
              </div>
            </div>
          </div>
          <div v-else class="py-3 text-center text-xs text-gray-600 mb-3">Belum ada leads di tahap Proposal/Negosiasi</div>
          <div class="text-xs text-gray-500 bg-navy-800/60 rounded-lg p-2.5">
            <strong class="text-white">Langkah:</strong>
            <ol class="list-decimal list-inside mt-1 space-y-0.5">
              <li>Review proposal terakhir yang dikirim</li>
              <li>Follow up status keputusan</li>
              <li>Tawarkan solusi untuk hambatan</li>
            </ol>
          </div>
          <NuxtLink to="/pipeline" class="mt-3 btn-secondary btn-sm w-full justify-center text-xs">
            Buka Pipeline
          </NuxtLink>
        </div>

        <!-- On Hold at Risk -->
        <div class="card border border-orange-900/50">
          <div class="section-title text-orange-400 mb-3">
            <i class="fa-solid fa-pause-circle mr-1.5" />🟡 On Hold Bernilai Tinggi
          </div>
          <div v-if="data.onhold_risk?.length" class="space-y-2 mb-3">
            <div v-for="l in data.onhold_risk.slice(0,5)" :key="l.lead_id"
                 class="flex items-center gap-2 p-2 rounded-lg bg-orange-900/10 border border-orange-900/30">
              <div class="flex-1 min-w-0">
                <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-xs font-medium text-gray-200 hover:text-primary-300 truncate block">
                  {{ l.nama_company }}
                </NuxtLink>
                <div class="text-xs text-gray-500">{{ l.segmen || '—' }} · {{ l.sales_owner || 'Unassigned' }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs font-bold text-orange-400">{{ fmt.rupiah(l.propose_value) }}</div>
                <div class="text-xs text-gray-600">{{ l.days_idle >= 9999 ? '∞' : l.days_idle + 'hr' }} idle</div>
              </div>
            </div>
          </div>
          <div v-else class="py-3 text-center text-xs text-gray-600 mb-3">Tidak ada leads On Hold</div>
          <div class="text-xs text-gray-500 bg-navy-800/60 rounded-lg p-2.5">
            <strong class="text-white">Langkah:</strong>
            <ol class="list-decimal list-inside mt-1 space-y-0.5">
              <li>Identifikasi alasan on hold</li>
              <li>Cek apakah kondisi sudah berubah</li>
              <li>Re-aktifkan atau putuskan lanjut/drop</li>
            </ol>
          </div>
        </div>

      </div>

      <!-- Closing Soon timeline -->
      <div class="card mb-5">
        <div class="section-title mb-3">
          <i class="fa-solid fa-calendar-check mr-1.5 text-yellow-400" />Leads dengan Deadline Terdekat
          <span class="ml-auto text-xs text-gray-500 font-normal">(exp_close_date)</span>
        </div>
        <div v-if="data.closing_soon?.length" class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead>
              <tr class="text-gray-500 border-b border-navy-700">
                <th class="text-left pb-2 pr-3">Perusahaan</th>
                <th class="text-left pb-2 pr-3">Stage</th>
                <th class="text-left pb-2 pr-3">Prioritas</th>
                <th class="text-left pb-2 pr-3">Sales</th>
                <th class="text-right pb-2 pr-3">Nilai</th>
                <th class="text-right pb-2 pr-3">Exp Close</th>
                <th class="text-right pb-2">Sisa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="l in data.closing_soon" :key="l.lead_id" class="border-b border-navy-800/60 hover:bg-navy-800/30">
                <td class="py-2 pr-3">
                  <NuxtLink :to="`/pipeline/${l.lead_id}`" class="text-gray-200 hover:text-primary-300 font-medium">{{ l.nama_company }}</NuxtLink>
                </td>
                <td class="py-2 pr-3"><span :class="fmt.stageClass(l.stage)">{{ l.stage }}</span></td>
                <td class="py-2 pr-3"><span :class="fmt.priorityClass(l.prioritas)">{{ l.prioritas }}</span></td>
                <td class="py-2 pr-3 text-gray-400">{{ l.sales_owner || '—' }}</td>
                <td class="py-2 pr-3 text-right font-semibold text-primary-300">{{ fmt.rupiah(l.propose_value) }}</td>
                <td class="py-2 pr-3 text-right text-gray-400">{{ fmt.tgl(l.exp_close_date) }}</td>
                <td class="py-2 text-right font-bold"
                    :class="l.days_until_close <= 7 ? 'text-red-400' : l.days_until_close <= 30 ? 'text-yellow-400' : 'text-gray-400'">
                  {{ l.days_until_close }}hr
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-center py-6 text-gray-600 text-sm">Tidak ada leads dengan exp_close_date</div>
      </div>

      <!-- By Product breakdown -->
      <div class="card">
        <div class="section-title mb-3"><i class="fa-solid fa-box-open mr-1.5 text-primary-400" />Breakdown per Produk</div>
        <div v-if="data.by_product?.length" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div v-for="p in data.by_product" :key="p.product" class="bg-navy-800/60 rounded-lg p-3">
            <div class="text-xs text-gray-500 truncate mb-1">{{ p.product }}</div>
            <div class="text-lg font-bold text-white">{{ fmt.num(p.jumlah) }}</div>
            <div class="text-xs text-primary-300">{{ fmt.rupiah(p.total_nilai) }}</div>
          </div>
        </div>
        <div v-else class="text-center py-6 text-gray-600 text-sm">Data produk belum tersedia</div>
      </div>

      </template><!-- end v-if="!noData" panel 3 -->

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get } = useApi()
const fmt = useFormat()

const { data, pending } = await useAsyncData('insights', () => get('/v1/insights'), { server: false })

// Stats shorthand
const st = computed(() => {
  const s = data.value?.stats ?? {}
  return {
    total:             Number(s.total ?? 0),
    won:               Number(s.won ?? 0),
    lost:              Number(s.lost ?? 0),
    on_hold:           Number(s.on_hold ?? 0),
    aktif:             Number(s.aktif ?? 0),
    unassigned:        Number(s.unassigned ?? 0),
    total_pipeline:    Number(s.total_pipeline ?? 0),
    active_pipeline:   Number(s.active_pipeline ?? 0),
    weighted_pipeline: Number(s.weighted_pipeline ?? 0),
    total_won:         Number(s.total_won ?? 0),
  }
})

const noData  = computed(() => st.value.total === 0)
const winRate = computed(() => {
  const c = st.value.won + st.value.lost
  return c ? Math.round(st.value.won / c * 100) : 0
})
const staleCount = computed(() => data.value?.stale_leads?.length ?? 0)

// Stage funnel
const STAGE_COLORS: Record<string, string> = {
  'New':'#60a5fa','In Progress':'#a78bfa','Demo Scheduled':'#f472b6',
  'Proposal Sent':'#fb923c','Negotiation':'#facc15','Won':'#34d399',
  'On Hold':'#94a3b8','Lost':'#f87171',
}
const stageFunnel = computed(() => {
  const rows = data.value?.by_stage ?? []
  const max = Math.max(...rows.map((r: any) => Number(r.jumlah)), 1)
  return rows.map((r: any) => ({
    ...r,
    pct:   Math.round(Number(r.jumlah) / max * 100),
    color: STAGE_COLORS[r.stage] ?? '#64748b',
  }))
})

const monthlyMax = computed(() =>
  Math.max(...(data.value?.monthly_trend ?? []).map((m: any) => Number(m.jumlah)), 1)
)
const velocityMax = computed(() =>
  Math.max(...(data.value?.velocity ?? []).map((v: any) => Number(v.avg_days)), 1)
)
const salesMax = computed(() =>
  Math.max(...(data.value?.by_sales ?? []).map((s: any) => Number(s.jumlah)), 1)
)
const totalWeighted = computed(() =>
  (data.value?.weighted_forecast ?? []).reduce((sum: number, w: any) => sum + Number(w.weighted_value), 0)
)

// Root cause analysis
const rootCauses = computed(() => {
  const causes: { level: string; icon: string; title: string; desc: string }[] = []
  const s = st.value
  if (s.total === 0) return causes   // noData — tampilkan empty state, bukan rekomendasi palsu
  const total = s.total

  if (s.unassigned > 0) {
    const pct = Math.round(s.unassigned / total * 100)
    causes.push({
      level: pct > 20 ? 'critical' : 'warning',
      icon: 'fa-user-slash',
      title: `${s.unassigned} Leads Belum Ditugaskan`,
      desc: `${pct}% dari total leads tidak memiliki sales owner. Leads tanpa PIC cenderung terabaikan dan tidak termonitoring.`,
    })
  }

  const staleLen = data.value?.stale_leads?.length ?? 0
  if (staleLen > 0) {
    const pct = Math.round(staleLen / total * 100)
    causes.push({
      level: pct > 30 ? 'critical' : pct > 10 ? 'warning' : 'info',
      icon: 'fa-hourglass-end',
      title: `${staleLen} Leads Stale >30 Hari`,
      desc: `${pct}% leads tidak di-follow-up lebih dari 30 hari. Peluang hilang karena tidak dipelihara.`,
    })
  }

  const hotStaleLen = data.value?.hot_stale?.length ?? 0
  if (hotStaleLen > 0) {
    causes.push({
      level: 'critical',
      icon: 'fa-fire-flame-curved',
      title: `${hotStaleLen} Hot Leads Terabaikan`,
      desc: `Hot leads dengan prioritas tinggi tidak di-FU >14 hari. Risiko kehilangan peluang bernilai tinggi.`,
    })
  }

  if (winRate.value < 30 && s.won + s.lost > 2) {
    causes.push({
      level: 'warning',
      icon: 'fa-chart-line',
      title: `Win Rate Rendah (${winRate.value}%)`,
      desc: `Win rate di bawah 30% menunjukkan proses closing perlu diperbaiki atau kualitas lead masuk perlu ditingkatkan.`,
    })
  }

  const velocity = data.value?.velocity ?? []
  const slowStages = velocity.filter((v: any) => Number(v.avg_days) > 30)
  if (slowStages.length > 0) {
    causes.push({
      level: 'warning',
      icon: 'fa-gauge-low',
      title: `Stage Lambat: ${slowStages.map((v: any) => v.stage).slice(0,2).join(', ')}`,
      desc: `Rata-rata >30 hari di stage tersebut menunjukkan bottleneck. Perlu evaluasi proses dan hambatan yang terjadi.`,
    })
  }

  const sourceConv = data.value?.source_conversion ?? []
  const lowConvSrc = sourceConv.filter((s: any) => s.total >= 5 && (s.won + s.lost > 0) && s.won / (s.won + s.lost) < 0.2)
  if (lowConvSrc.length > 0) {
    causes.push({
      level: 'info',
      icon: 'fa-share-nodes',
      title: `Sumber Konversi Rendah`,
      desc: `Sumber ${lowConvSrc.slice(0,2).map((s: any) => s.source).join(', ')} memiliki win rate <20%. Evaluasi kualitas lead dari sumber ini.`,
    })
  }

  const onHoldLen = data.value?.onhold_risk?.length ?? 0
  if (onHoldLen > 0) {
    const onHoldVal = (data.value?.onhold_risk ?? []).reduce((sum: number, l: any) => sum + Number(l.propose_value), 0)
    causes.push({
      level: 'warning',
      icon: 'fa-pause-circle',
      title: `${onHoldLen} Leads On Hold (${fmt.rupiah(onHoldVal)})`,
      desc: `Nilai pipeline tertahan. Re-evaluasi apakah leads ini bisa diaktifkan kembali atau harus di-drop.`,
    })
  }

  if (causes.length === 0) {
    causes.push({
      level: 'info',
      icon: 'fa-circle-check',
      title: 'Pipeline dalam Kondisi Baik',
      desc: 'Tidak ada masalah kritis yang terdeteksi. Pertahankan konsistensi follow-up dan monitoring.',
    })
  }

  return causes
})
</script>
