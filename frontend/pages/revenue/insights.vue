<template>
  <div>
    <!-- Header -->
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-lightbulb text-yellow-400 mr-2" />Revenue Insights</h1>
        <p class="page-subtitle">Analisis mendalam revenue {{ selectedYear }} — apa yang terjadi, kenapa, dan apa yang harus dilakukan</p>
      </div>
      <select v-if="data?.years" v-model.number="selectedYear" class="form-select w-28 text-xs" @change="refresh">
        <option v-for="y in data.years" :key="y" :value="y">{{ y }}</option>
      </select>
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
          <p class="text-xs text-gray-500">Kondisi revenue saat ini secara menyeluruh</p>
        </div>
      </div>

      <!-- KPI Strip -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <div class="card text-center py-4">
          <div class="text-3xl font-bold mb-1"
               :class="data.ach_pct >= 80 ? 'text-emerald-400' : data.ach_pct >= 50 ? 'text-yellow-400' : 'text-red-400'">
            {{ data.ach_pct }}%
          </div>
          <div class="text-xs text-gray-400">Achievement YTD</div>
          <div class="text-xs mt-1"
               :class="data.ach_pct >= 80 ? 'text-emerald-500' : data.ach_pct >= 50 ? 'text-yellow-500' : 'text-red-500'">
            {{ data.ach_pct >= 80 ? '✓ On Track' : data.ach_pct >= 50 ? '⚠ Perlu Upaya' : '✗ Jauh dari Target' }}
          </div>
        </div>
        <div class="card text-center py-4">
          <div class="text-3xl font-bold text-red-400 mb-1">{{ data.critical_count }}</div>
          <div class="text-xs text-gray-400">Proyek Critical/High Risk</div>
          <div class="text-xs text-red-500 mt-1">dari {{ totalProjects }} proyek aktif</div>
        </div>
        <div class="card text-center py-4">
          <div class="text-3xl font-bold text-yellow-400 mb-1">{{ data.zero_count }}</div>
          <div class="text-xs text-gray-400">Proyek Nol Realisasi</div>
          <div class="text-xs text-yellow-500 mt-1">{{ fmt.rupiah(zeroValue) }} tertahan</div>
        </div>
        <div class="card text-center py-4">
          <div class="text-xl font-bold text-orange-400 mb-1">{{ fmt.rupiah(data.outstanding_amount) }}</div>
          <div class="text-xs text-gray-400">Invoice Outstanding</div>
          <div class="text-xs text-orange-500 mt-1">{{ data.outstanding_count }} invoice belum lunas</div>
        </div>
      </div>

      <!-- Monthly trend chart -->
      <div class="card mb-5">
        <div class="section-title mb-4">
          <i class="fa-solid fa-chart-bar mr-1.5 text-primary-400" />Realisasi vs Target per Bulan
          <span class="ml-auto text-xs text-gray-500 font-normal">
            {{ data.ach_months_count }}/{{ data.past_months_count }} bulan achieve target
          </span>
        </div>
        <div class="flex items-end gap-1.5 mb-2" style="height:156px">
          <div v-for="m in data.monthly" :key="m.month_num"
               class="flex-1 flex flex-col items-center justify-end">
            <!-- Label ach% di atas bar -->
            <div class="w-full text-center mb-0.5" style="min-height:18px">
              <span v-if="m.is_past && Number(m.target) > 0"
                    class="text-[9px] font-bold leading-none"
                    :class="Number(m.actual) >= Number(m.target) ? 'text-emerald-400'
                           : Number(m.actual) >= Number(m.target)*0.8 ? 'text-yellow-400'
                           : 'text-red-400'">
                {{ Math.round(Number(m.actual) / Number(m.target) * 100) }}%
              </span>
            </div>
            <!-- Bar area -->
            <div class="w-full relative flex flex-col justify-end" style="height:120px">
              <div class="w-full rounded-t opacity-20 absolute bottom-0"
                   :class="m.is_past ? 'bg-gray-400' : 'bg-gray-700'"
                   :style="`height:${monthlyMax ? Math.round(Number(m.target)/monthlyMax*100) : 0}%`" />
              <div class="w-full rounded-t absolute bottom-0 transition-all duration-700"
                   :class="!m.is_past ? 'bg-navy-700' : Number(m.actual) >= Number(m.target) ? 'bg-emerald-500' : Number(m.actual) >= Number(m.target)*0.8 ? 'bg-yellow-500' : 'bg-red-500'"
                   :style="`height:${monthlyMax ? Math.round(Number(m.actual)/monthlyMax*100) : 0}%`" />
            </div>
            <div class="text-xs text-gray-600 mt-1">{{ m.month_name.slice(0,3) }}</div>
          </div>
        </div>
        <div class="flex justify-end gap-4 text-xs text-gray-600">
          <span><span class="text-gray-400 opacity-40">█</span> Target</span>
          <span><span class="text-emerald-400">█</span> Achieve</span>
          <span><span class="text-yellow-400">█</span> &gt;80%</span>
          <span><span class="text-red-400">█</span> Miss</span>
        </div>
      </div>

      <!-- Gap & Run Rate + By Kategori + By Owner -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        <!-- Gap & Proyeksi -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-calculator mr-1.5 text-primary-400" />Proyeksi & Gap</div>
          <div class="space-y-3">
            <div class="flex justify-between items-end border-b border-navy-800 pb-2">
              <span class="text-xs text-gray-500">Realisasi YTD (s/d bln {{ data.cur_month }})</span>
              <span class="text-sm font-bold text-white">{{ fmt.rupiah(ytdActual) }}</span>
            </div>
            <div class="flex justify-between items-end border-b border-navy-800 pb-2">
              <span class="text-xs text-gray-500">Target s/d bln {{ data.cur_month }}</span>
              <span class="text-sm font-semibold text-gray-300">{{ fmt.rupiah(curTarget) }}</span>
            </div>
            <div class="flex justify-between items-end border-b border-navy-800 pb-2">
              <span class="text-xs text-gray-500">Gap dari target berjalan</span>
              <span class="text-sm font-bold" :class="data.gap_ytd > 0 ? 'text-red-400' : 'text-emerald-400'">
                {{ data.gap_ytd > 0 ? '-' : '+' }}{{ fmt.rupiah(Math.abs(data.gap_ytd)) }}
              </span>
            </div>
            <div class="flex justify-between items-end border-b border-navy-800 pb-2">
              <span class="text-xs text-gray-500">Run Rate / bulan</span>
              <span class="text-sm font-semibold text-blue-300">{{ fmt.rupiah(data.run_rate) }}</span>
            </div>
            <div class="flex justify-between items-end border-b border-navy-800 pb-2">
              <span class="text-xs text-gray-500">Proyeksi Akhir Tahun</span>
              <span class="text-sm font-bold" :class="data.projected_ach >= 80 ? 'text-emerald-400' : data.projected_ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
                {{ fmt.rupiah(data.projected_eoy) }}
              </span>
            </div>
            <div class="flex justify-between items-end">
              <span class="text-xs text-gray-500">Est. Achievement EOY</span>
              <span class="text-base font-bold"
                    :class="data.projected_ach >= 80 ? 'text-emerald-400' : data.projected_ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
                {{ data.projected_ach }}%
              </span>
            </div>
          </div>
        </div>

        <!-- By Kategori -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-tags mr-1.5" />Per Kategori</div>
          <div class="space-y-4">
            <div v-for="item in kategoriItems" :key="item.label">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-200">{{ item.label }}</span>
                <span class="text-xs font-bold"
                      :class="item.ach >= 80 ? 'text-emerald-400' : item.ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
                  {{ item.ach }}%
                </span>
              </div>
              <div class="h-2.5 bg-navy-800 rounded overflow-hidden mb-1">
                <div class="h-full rounded transition-all duration-700"
                     :class="fmt.achColor(item.ach)"
                     :style="`width:${Math.min(item.ach, 100)}%`" />
              </div>
              <div class="flex justify-between text-xs text-gray-500">
                <span class="text-white">{{ fmt.rupiah(item.actual) }}</span>
                <span>dari {{ fmt.rupiah(item.target) }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-navy-800">
            <div class="section-title text-xs mb-2"><i class="fa-solid fa-shapes mr-1" />Per Type Kontrak</div>
            <div class="space-y-1.5">
              <div v-for="t in data.by_type" :key="t.type" class="flex items-center gap-2">
                <span class="text-xs text-gray-400 w-20 truncate flex-shrink-0">{{ t.type }}</span>
                <div class="flex-1 h-2 bg-navy-800 rounded overflow-hidden">
                  <div class="h-full bg-primary-600 rounded transition-all duration-700"
                       :style="`width:${typeMax ? Math.round(t.actual/typeMax*100) : 0}%`" />
                </div>
                <span class="text-xs text-gray-400 flex-shrink-0 w-24 text-right">{{ fmt.rupiah(t.actual) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- By Owner -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-user-tie mr-1.5" />Per Organisasi</div>
          <div class="space-y-4">
            <div v-for="item in ownerItems" :key="item.label">
              <div class="flex justify-between mb-1">
                <span class="text-sm font-medium text-gray-200">{{ item.label }}</span>
                <span class="text-xs font-bold"
                      :class="item.ach >= 80 ? 'text-emerald-400' : item.ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
                  {{ item.ach }}%
                </span>
              </div>
              <div class="h-2.5 bg-navy-800 rounded overflow-hidden mb-1">
                <div class="h-full rounded transition-all duration-700"
                     :class="fmt.achColor(item.ach)"
                     :style="`width:${Math.min(item.ach, 100)}%`" />
              </div>
              <div class="flex justify-between text-xs text-gray-500">
                <span class="text-white">{{ fmt.rupiah(item.actual) }}</span>
                <span>dari {{ fmt.rupiah(item.target) }}</span>
              </div>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-navy-800">
            <div class="section-title text-xs mb-2"><i class="fa-solid fa-shield-alt mr-1" />Risk Level Proyek</div>
            <div class="space-y-1.5">
              <div v-for="r in data.by_risk" :key="r.risk_level" class="flex items-center gap-2">
                <span class="text-xs w-16 flex-shrink-0" :class="r.risk_level==='HIGH'?'text-red-400':r.risk_level==='MEDIUM'?'text-yellow-400':'text-emerald-400'">
                  {{ r.risk_level }}
                </span>
                <div class="flex-1 h-2 bg-navy-800 rounded overflow-hidden">
                  <div class="h-full rounded transition-all duration-700"
                       :class="r.risk_level==='HIGH'?'bg-red-500':r.risk_level==='MEDIUM'?'bg-yellow-500':'bg-emerald-500'"
                       :style="`width:${riskMax ? Math.round(r.target/riskMax*100) : 0}%`" />
                </div>
                <span class="text-xs text-gray-500 flex-shrink-0 w-4 text-right">{{ r.cnt }}</span>
                <span class="text-xs text-gray-600 flex-shrink-0 w-24 text-right">{{ fmt.rupiah(r.target) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Top Contributors -->
      <div class="card mb-8">
        <div class="section-title mb-3"><i class="fa-solid fa-star mr-1.5 text-yellow-400" />Top 5 Kontributor Realisasi</div>
        <div class="space-y-2.5">
          <div v-for="(p, i) in data.top_contributors" :key="p.project_id"
               class="flex items-center gap-3 p-2.5 rounded-lg bg-navy-800/40">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                 :class="i===0?'bg-yellow-900/60 text-yellow-400':i===1?'bg-gray-700 text-gray-300':'bg-navy-700 text-gray-500'">
              {{ i+1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-200 truncate">{{ p.client }}</div>
              <div class="text-xs text-gray-500">{{ p.project_id }} · {{ p.product }} · {{ p.organisasi }}</div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-sm font-bold text-emerald-400">{{ fmt.rupiah(p.actual_revenue) }}</div>
              <div class="text-xs text-gray-600">dari {{ fmt.rupiah(p.revenue_target) }}</div>
            </div>
            <div class="w-20 flex-shrink-0">
              <div class="h-1.5 bg-navy-700 rounded overflow-hidden">
                <div class="h-full bg-emerald-500 rounded"
                     :style="`width:${p.revenue_target ? Math.min(p.actual_revenue/p.revenue_target*100,100) : 0}%`" />
              </div>
              <div class="text-xs text-gray-600 text-right mt-0.5">
                {{ p.revenue_target ? Math.round(p.actual_revenue/p.revenue_target*100) : 0 }}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════
           PANEL 2 — KENAPA BISA TERJADI
      ════════════════════════════════════════════════════════════════ -->
      <div class="flex items-center gap-3 mb-4">
        <div class="w-8 h-8 rounded-full bg-yellow-900/60 flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">2</div>
        <div>
          <h2 class="text-base font-bold text-white">Kenapa Bisa Terjadi?</h2>
          <p class="text-xs text-gray-500">Root cause analysis berdasarkan data revenue</p>
        </div>
      </div>

      <div v-if="noData" class="card mb-8 text-center py-8">
        <i class="fa-solid fa-database text-3xl text-gray-700 mb-3 block" />
        <div class="text-sm text-gray-500">Tidak ada data proyek revenue untuk dianalisis</div>
      </div>

      <template v-else>

      <!-- Root cause cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        <div v-for="rc in rootCauses" :key="rc.title"
             class="card border-l-4"
             :class="rc.level==='critical'?'border-red-500':rc.level==='warning'?'border-yellow-500':'border-blue-500'">
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                 :class="rc.level==='critical'?'bg-red-900/40 text-red-400':rc.level==='warning'?'bg-yellow-900/40 text-yellow-400':'bg-blue-900/40 text-blue-400'">
              <i :class="`fa-solid ${rc.icon} text-sm`" />
            </div>
            <div>
              <div class="text-sm font-semibold text-white mb-1">{{ rc.title }}</div>
              <div class="text-xs text-gray-400 leading-relaxed">{{ rc.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Proyek Critical/At Risk detail -->
      <div class="card mb-5">
        <div class="section-title text-red-400 mb-3">
          <i class="fa-solid fa-triangle-exclamation mr-1.5" />Proyek Critical & At Risk — Perlu Tindakan Segera
        </div>
        <div v-if="data.at_risk_projects?.length" class="overflow-x-auto">
          <table class="tbl">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Organisasi</th>
                <th class="text-right">Target</th>
                <th class="text-right">Realisasi</th>
                <th class="text-right">Gap</th>
                <th>Status</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in atRiskSlice" :key="p.project_id">
                <td>
                  <div class="text-xs font-medium text-gray-200">{{ p.project_id }}</div>
                  <div class="text-xs text-gray-500 max-w-28 truncate">{{ p.product }}</div>
                </td>
                <td class="text-xs text-gray-300 max-w-32 truncate">{{ p.client }}</td>
                <td class="text-xs text-gray-400">{{ p.organisasi }}</td>
                <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(p.revenue_target) }}</td>
                <td class="text-right text-xs text-emerald-300">{{ fmt.rupiah(p.actual_revenue) }}</td>
                <td class="text-right text-xs font-semibold text-red-400">
                  -{{ fmt.rupiah(p.revenue_target - p.actual_revenue) }}
                </td>
                <td><span :class="fmt.statusClass(p.status)">{{ p.status }}</span></td>
                <td><span :class="fmt.riskClass(p.risk_level)">{{ p.risk_level }}</span></td>
              </tr>
            </tbody>
          </table>
          <AppPagination
            v-if="atRiskPages > 1"
            v-model:page="atRiskPage"
            :total-pages="atRiskPages"
            :total="atRiskTotal"
            :per-page="INSIGHT_PER_PAGE"
            class="mt-3"
          />
        </div>
        <div v-else class="text-center py-6 text-emerald-400 text-sm">
          <i class="fa-solid fa-circle-check mr-1" />Tidak ada proyek Critical atau At Risk
        </div>
      </div>

      <!-- Proyek Zero Realisasi -->
      <div v-if="data.zero_projects?.length" class="card mb-8">
        <div class="section-title text-yellow-400 mb-3">
          <i class="fa-solid fa-circle-xmark mr-1.5" />Proyek Nol Realisasi ({{ data.zero_count }}) — Total {{ fmt.rupiah(zeroValue) }}
        </div>
        <div class="overflow-x-auto">
          <table class="tbl">
            <thead>
              <tr>
                <th>Project</th><th>Client</th><th>Organisasi</th>
                <th class="text-right">Target</th><th>Type</th><th>Risk</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in zeroSlice" :key="p.project_id">
                <td class="text-xs">
                  {{ p.project_id }}
                  <div class="text-gray-500 max-w-28 truncate">{{ p.product }}</div>
                </td>
                <td class="text-xs text-gray-300">{{ p.client }}</td>
                <td class="text-xs text-gray-400">{{ p.organisasi }}</td>
                <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(p.revenue_target) }}</td>
                <td class="text-xs text-gray-400">{{ p.type }}</td>
                <td><span :class="fmt.riskClass(p.risk_level)">{{ p.risk_level }}</span></td>
              </tr>
            </tbody>
          </table>
          <AppPagination
            v-if="zeroPages > 1"
            v-model:page="zeroPage"
            :total-pages="zeroPages"
            :total="zeroTotal"
            :per-page="INSIGHT_PER_PAGE"
            class="mt-3"
          />
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
          <p class="text-xs text-gray-500">Rekomendasi aksi prioritas untuk menutup gap revenue</p>
        </div>
      </div>

      <!-- Action cards -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

        <!-- Akselerasi Proyek Kritis -->
        <div class="card border border-red-900/50">
          <div class="section-title text-red-400 mb-3">
            <i class="fa-solid fa-bolt mr-1.5" />🔴 Akselerasi Proyek Critical
          </div>
          <div class="text-xs text-gray-400 mb-3 leading-relaxed">
            <strong class="text-red-300">{{ data.critical_count }} proyek</strong> dalam status Critical/High Risk
            dengan total nilai <strong class="text-white">{{ fmt.rupiah(criticalValue) }}</strong> terancam tidak terealisasi tahun ini.
          </div>
          <div v-if="data.at_risk_projects?.length" class="space-y-2 mb-3">
            <div v-for="p in data.at_risk_projects.slice(0,3)" :key="p.project_id"
                 class="flex items-center gap-2 p-2 rounded bg-red-900/10 border border-red-900/20">
              <div class="flex-1 min-w-0">
                <div class="text-xs font-medium text-gray-200 truncate">{{ p.client }}</div>
                <div class="text-xs text-gray-500">{{ p.organisasi }} · {{ p.status }}</div>
              </div>
              <div class="text-xs font-semibold text-red-400 flex-shrink-0">{{ fmt.rupiah(p.revenue_target) }}</div>
            </div>
          </div>
          <div class="bg-navy-800/60 rounded-lg p-2.5 text-xs text-gray-400">
            <strong class="text-white block mb-1">Langkah:</strong>
            <ol class="list-decimal list-inside space-y-0.5">
              <li>Review progress setiap proyek minggu ini</li>
              <li>Identifikasi hambatan teknis/komersial</li>
              <li>Eskalasi ke manajemen jika ada hambatan serius</li>
              <li>Update action plan dalam sistem</li>
            </ol>
          </div>
          <NuxtLink to="/revenue/tracker?status=Critical" class="mt-3 btn-secondary btn-sm w-full justify-center text-xs">
            Buka Revenue Tracker <i class="fa-solid fa-arrow-right ml-1" />
          </NuxtLink>
        </div>

        <!-- Kejar Gap Bulan Berjalan -->
        <div class="card border border-yellow-900/50">
          <div class="section-title text-yellow-400 mb-3">
            <i class="fa-solid fa-chart-line mr-1.5" />🟡 Kejar Gap Bulan Berjalan
          </div>
          <div class="text-xs text-gray-400 mb-3 leading-relaxed">
            Gap dari target berjalan sebesar
            <strong class="text-red-300">{{ fmt.rupiah(data.gap_ytd) }}</strong>.
            Dengan run rate {{ fmt.rupiah(data.run_rate) }}/bulan, proyeksi akhir tahun
            <strong :class="data.projected_ach >= 80 ? 'text-emerald-300' : 'text-red-300'">{{ data.projected_ach }}%</strong>
            dari target.
          </div>
          <div class="space-y-2 mb-3">
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Target EOY</span>
              <span class="font-semibold text-gray-200">{{ fmt.rupiah(data.projected_eoy > 0 ? (data.projected_eoy / (data.projected_ach/100)) : 0) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Proyeksi EOY</span>
              <span class="font-semibold" :class="data.projected_ach>=80?'text-emerald-400':'text-red-400'">{{ fmt.rupiah(data.projected_eoy) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Sisa target (bln {{ data.cur_month+1 }}-12)</span>
              <span class="font-semibold text-primary-300">{{ fmt.rupiah(data.remain_target) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Bulan miss target</span>
              <span class="font-semibold text-red-400">{{ data.miss_months_count }} dari {{ data.past_months_count }} bulan</span>
            </div>
          </div>
          <div class="bg-navy-800/60 rounded-lg p-2.5 text-xs text-gray-400">
            <strong class="text-white block mb-1">Langkah:</strong>
            <ol class="list-decimal list-inside space-y-0.5">
              <li>Fokus akselerasi bulan-bulan sisa tahun</li>
              <li>Pastikan milestone proyek termin sesuai jadwal</li>
              <li>Push closing proyek yang sudah di tahap akhir</li>
              <li>Review kembali target yang realistis</li>
            </ol>
          </div>
          <NuxtLink to="/revenue" class="mt-3 btn-secondary btn-sm w-full justify-center text-xs">
            Buka Revenue Dashboard <i class="fa-solid fa-arrow-right ml-1" />
          </NuxtLink>
        </div>

        <!-- Tagih Invoice Outstanding -->
        <div class="card border border-orange-900/50">
          <div class="section-title text-orange-400 mb-3">
            <i class="fa-solid fa-file-invoice-dollar mr-1.5" />🟠 Tagih Invoice Outstanding
          </div>
          <div class="text-xs text-gray-400 mb-3 leading-relaxed">
            Ada <strong class="text-orange-300">{{ data.outstanding_count }} invoice</strong> belum lunas
            senilai <strong class="text-white">{{ fmt.rupiah(data.outstanding_amount) }}</strong>.
            Pembayaran invoice akan langsung menambah realisasi bulan ini.
          </div>
          <div class="bg-navy-800/60 rounded-lg p-2.5 text-xs text-gray-400 mb-3">
            <strong class="text-white block mb-1">Langkah:</strong>
            <ol class="list-decimal list-inside space-y-0.5">
              <li>Kirim reminder ke client dengan invoice outstanding</li>
              <li>Cek jadwal jatuh tempo setiap invoice</li>
              <li>Eskalasi ke finance jika sudah lewat jatuh tempo</li>
              <li>Catat pembayaran segera setelah diterima</li>
            </ol>
          </div>
          <div v-if="data.zero_count > 0" class="text-xs text-yellow-400/80 bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-2.5 mb-3">
            <i class="fa-solid fa-triangle-exclamation mr-1" />
            <strong>{{ data.zero_count }} proyek</strong> senilai {{ fmt.rupiah(zeroValue) }} belum ada realisasi sama sekali — perlu diprioritaskan untuk invoicing.
          </div>
          <NuxtLink to="/revenue/invoice" class="mt-1 btn-secondary btn-sm w-full justify-center text-xs">
            Buka Invoice & Payment <i class="fa-solid fa-arrow-right ml-1" />
          </NuxtLink>
        </div>

      </div>

      <!-- Status summary bar -->
      <div class="card">
        <div class="section-title mb-3"><i class="fa-solid fa-layer-group mr-1.5" />Status Seluruh Proyek</div>
        <div class="space-y-2.5">
          <div v-for="s in data.by_status" :key="s.status" class="flex items-center gap-3">
            <span class="w-20 text-xs flex-shrink-0" :class="fmt.statusClass(s.status)">{{ s.status }}</span>
            <div class="flex-1 h-4 bg-navy-800 rounded overflow-hidden">
              <div class="h-full rounded transition-all duration-700 flex items-center px-2"
                   :class="s.status==='On Track'?'bg-emerald-600':s.status==='At Risk'?'bg-yellow-600':'bg-red-600'"
                   :style="`width:${totalProjects ? Math.round(s.cnt/totalProjects*100) : 0}%`">
                <span v-if="s.cnt/totalProjects*100 > 15" class="text-xs font-bold text-white">
                  {{ Math.round(s.cnt/totalProjects*100) }}%
                </span>
              </div>
            </div>
            <span class="text-xs text-gray-400 flex-shrink-0 w-4 text-right">{{ s.cnt }}</span>
            <span class="text-xs text-gray-600 flex-shrink-0 w-28 text-right">{{ fmt.rupiah(s.target) }}</span>
            <span class="text-xs flex-shrink-0 w-28 text-right"
                  :class="s.status==='On Track'?'text-emerald-400':'text-red-400'">
              {{ fmt.rupiah(s.actual) }}
            </span>
          </div>
        </div>
        <div class="flex justify-end gap-4 mt-2 text-xs text-gray-600">
          <span>Target</span><span>Realisasi</span>
        </div>
      </div>

      </template><!-- end v-if="!noData" panel 3 -->

      <!-- ═══════════════════════════════════════════════════════════════
           PANEL 4 — LANGKAH NYATA & PRIORITAS TERPENTING
      ════════════════════════════════════════════════════════════════ -->
      <template v-if="!noData && insights.steps.length">
      <div class="flex items-center gap-3 mb-4 mt-6">
        <div class="w-8 h-8 rounded-full bg-cyan-900/60 flex items-center justify-center text-cyan-400 font-bold text-sm flex-shrink-0">4</div>
        <div>
          <h2 class="text-base font-bold text-white">Langkah Nyata yang Harus Dilakukan</h2>
          <p class="text-xs text-gray-500">Diurutkan berdasarkan urgensi — digenerate otomatis dari kondisi data saat ini</p>
        </div>
      </div>

      <!-- Prioritas Terpenting -->
      <div v-if="insights.topPriority" class="mb-4 rounded-lg border border-red-500/40 bg-red-950/30 p-4">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 shrink-0 text-red-400 text-lg"><i class="fa-solid fa-circle-exclamation" /></div>
          <div>
            <div class="mb-1 text-xs font-bold tracking-widest text-red-400 uppercase">Satu Prioritas Terpenting</div>
            <div class="text-sm font-semibold text-red-200">{{ insights.topPriority.title }}</div>
            <div class="mt-1.5 text-xs text-gray-400 leading-relaxed">{{ insights.topPriority.body }}</div>
          </div>
        </div>
      </div>

      <!-- Langkah-langkah -->
      <div class="space-y-2">
        <div
          v-for="(step, i) in insights.steps"
          :key="i"
          class="flex items-start gap-3 rounded-lg border p-3.5"
          :class="step.borderClass"
        >
          <div class="shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center text-sm" :class="step.iconBgClass">
            <i :class="[step.icon, step.iconClass]" />
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-2 flex-wrap mb-0.5">
              <span class="text-xs font-bold px-2 py-0.5 rounded-full" :class="step.pillClass">{{ step.period }}</span>
              <span class="text-sm font-semibold text-gray-100">{{ step.title }}</span>
            </div>
            <div class="text-xs text-gray-400 leading-relaxed">{{ step.body }}</div>
          </div>
          <div v-if="step.amount" class="shrink-0 text-right ml-2">
            <span class="text-sm font-bold" :class="step.amountClass">{{ step.amount }}</span>
          </div>
        </div>
      </div>
      </template><!-- end panel 4 -->

    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get } = useApi()
const fmt = useFormat()

const selectedYear = ref(new Date().getFullYear())
const { data, pending, refresh } = await useAsyncData('rev-insights',
  () => get('/v1/revenue/insights', { tahun: selectedYear.value }),
  { server: false }
)

// ── Computed ──────────────────────────────────────────────────────
const totalProjects = computed(() =>
  (data.value?.by_status ?? []).reduce((s: number, r: any) => s + r.cnt, 0)
)

const zeroValue = computed(() =>
  (data.value?.zero_projects ?? []).reduce((s: number, p: any) => s + Number(p.revenue_target), 0)
)

const criticalValue = computed(() =>
  (data.value?.at_risk_projects ?? []).reduce((s: number, p: any) => s + Number(p.revenue_target), 0)
)

const INSIGHT_PER_PAGE = 5

const atRiskPage  = ref(1)
const atRiskTotal = computed(() => data.value?.at_risk_projects?.length ?? 0)
const atRiskPages = computed(() => Math.ceil(atRiskTotal.value / INSIGHT_PER_PAGE) || 1)
const atRiskSlice = computed(() => {
  const all = data.value?.at_risk_projects ?? []
  const start = (atRiskPage.value - 1) * INSIGHT_PER_PAGE
  return all.slice(start, start + INSIGHT_PER_PAGE)
})

const zeroPage  = ref(1)
const zeroTotal = computed(() => data.value?.zero_projects?.length ?? 0)
const zeroPages = computed(() => Math.ceil(zeroTotal.value / INSIGHT_PER_PAGE) || 1)
const zeroSlice = computed(() => {
  const all = data.value?.zero_projects ?? []
  const start = (zeroPage.value - 1) * INSIGHT_PER_PAGE
  return all.slice(start, start + INSIGHT_PER_PAGE)
})

const ytdActual = computed(() => {
  const m = data.value?.monthly ?? []
  const cur = data.value?.cur_month ?? 0
  return m.filter((x: any) => x.month_num <= cur).reduce((s: number, x: any) => s + Number(x.actual), 0)
})

const curTarget = computed(() => {
  const m = data.value?.monthly ?? []
  const cur = data.value?.cur_month ?? 0
  return m.filter((x: any) => x.month_num <= cur).reduce((s: number, x: any) => s + Number(x.target), 0)
})

const monthlyMax = computed(() =>
  Math.max(...(data.value?.monthly ?? []).map((m: any) => Math.max(Number(m.target), Number(m.actual))), 1)
)

// ── Langkah Nyata (Panel 4) ───────────────────────────────────────────────────
const insights = computed(() => {
  const d = data.value
  if (!d) return { topPriority: null, steps: [] }

  const f = (n: number) => {
    if (n >= 1_000_000_000) return `Rp ${(n / 1_000_000_000).toFixed(1)} M`
    if (n >= 1_000_000)     return `Rp ${Math.round(n / 1_000_000)} jt`
    return `Rp ${n.toLocaleString('id-ID')}`
  }

  const totalTarget    = d.total_target    ?? 0
  const totalActual    = d.total_actual    ?? 0
  const outstanding    = d.outstanding_amount ?? 0
  const outCount       = d.outstanding_count  ?? 0
  const runRate        = d.run_rate        ?? 0
  const curMonth       = d.cur_month       ?? 1
  const remainMonths   = 12 - curMonth
  const neededRate     = remainMonths > 0 ? (totalTarget - totalActual) / remainMonths : 0
  const zeroProjects   = d.zero_projects   ?? []
  const recurringBehind = d.recurring_behind ?? []

  const bigTermin    = zeroProjects.filter((p: any) => p.kategori === 'Project')
  const zeroRecurring = zeroProjects.filter((p: any) => p.kategori === 'Recurring')
  const bigTerminTotal = bigTermin.reduce((s: number, p: any) => s + Number(p.revenue_target), 0)

  const topPriority = bigTermin.length > 0
    ? {
        title: `${bigTermin.length} proyek termin besar senilai ${f(bigTerminTotal)} — semua belum ada realisasi`,
        body: bigTermin.slice(0, 4).map((p: any) => `${p.project_id} ${p.client} (${f(Number(p.revenue_target))})`).join(' · ')
          + `. Audit milestone segera — jika 25% saja bisa diinvoice bulan ini = ${f(bigTerminTotal * 0.25)} masuk kas.`,
      }
    : null

  const steps: any[] = []

  if (outCount > 0) {
    steps.push({
      period: 'Segera',
      icon: 'fa-solid fa-file-invoice-dollar',
      iconClass: 'text-red-400', iconBgClass: 'bg-red-950/60',
      borderClass: 'border-red-500/25 bg-red-950/15',
      pillClass: 'bg-red-500/20 text-red-300',
      labelClass: 'text-red-400',
      title: `Kejar pembayaran ${outCount} invoice outstanding`,
      body: `Total ${f(outstanding)} invoice sudah terbit tapi belum dibayar. Hubungi Finance klien hari ini — prioritaskan nominal terbesar terlebih dahulu.`,
      amount: f(outstanding), amountClass: 'text-red-300',
    })
  }

  if (zeroRecurring.length > 0) {
    const recTotal = zeroRecurring.reduce((s: number, p: any) => s + Number(p.revenue_target), 0)
    steps.push({
      period: 'Segera',
      icon: 'fa-solid fa-rotate',
      iconClass: 'text-amber-400', iconBgClass: 'bg-amber-950/60',
      borderClass: 'border-amber-500/25 bg-amber-950/15',
      pillClass: 'bg-amber-500/20 text-amber-300',
      title: `Terbitkan invoice ${zeroRecurring.length} recurring yang belum pernah ditagihkan`,
      body: zeroRecurring.slice(0, 4).map((p: any) => `${p.project_id} ${p.client} — ${p.product}`).join(' · ')
        + (zeroRecurring.length > 4 ? ` + ${zeroRecurring.length - 4} lainnya` : ''),
      amount: f(recTotal), amountClass: 'text-amber-300',
    })
  }

  if (bigTermin.length > 0) {
    steps.push({
      period: 'Bulan Ini',
      icon: 'fa-solid fa-magnifying-glass-chart',
      iconClass: 'text-orange-400', iconBgClass: 'bg-orange-950/60',
      borderClass: 'border-orange-500/25 bg-orange-950/15',
      pillClass: 'bg-orange-500/20 text-orange-300',
      title: `Audit milestone ${bigTermin.length} proyek termin besar`,
      body: `Total target ${f(bigTerminTotal)}. Tanyakan tim delivery: deliverable mana yang sudah selesai dan bisa diinvoice? Target: minimal 1 termin per proyek sebelum akhir bulan.`,
      amount: `Potensi ${f(bigTerminTotal * 0.25)}`, amountClass: 'text-orange-300',
    })
  }

  if (recurringBehind.length > 0) {
    const behindGap = recurringBehind.reduce((s: number, p: any) => s + Number(p.gap_collected ?? 0), 0)
    steps.push({
      period: 'Bulan Ini',
      icon: 'fa-solid fa-arrow-trend-up',
      iconClass: 'text-cyan-400', iconBgClass: 'bg-cyan-950/60',
      borderClass: 'border-cyan-500/25 bg-cyan-950/15',
      pillClass: 'bg-cyan-500/20 text-cyan-300',
      title: `Akselerasi ${recurringBehind.length} recurring yang tertinggal dari target YTD`,
      body: `Gap collected kumulatif ${f(behindGap)}. Susun jadwal invoicing bulanan per proyek — recurring seharusnya bisa diprediksi dan ditagihkan tepat waktu.`,
      amount: f(behindGap), amountClass: 'text-cyan-300',
    })
  }

  if (neededRate > runRate * 1.5) {
    steps.push({
      period: 'Ags–Sep',
      icon: 'fa-solid fa-bullseye',
      iconClass: 'text-blue-400', iconBgClass: 'bg-blue-950/60',
      borderClass: 'border-blue-500/25 bg-blue-950/15',
      pillClass: 'bg-blue-500/20 text-blue-300',
      title: 'Masukkan pipeline proyek baru untuk menutup gap run rate',
      body: `Run rate saat ini ${f(runRate)}/bulan, dibutuhkan ${f(neededRate)}/bulan. Gap tidak bisa ditutup dari portofolio eksisting — perlu deal baru Q3 minimal ${f(neededRate - runRate)}/bulan tambahan.`,
      amount: `${(neededRate / Math.max(runRate, 1)).toFixed(1)}× run rate`, amountClass: 'text-blue-300',
    })
  }

  steps.push({
    period: 'Review Rutin',
    icon: 'fa-solid fa-calendar-check',
    iconClass: 'text-slate-400', iconBgClass: 'bg-slate-800/60',
    borderClass: 'border-slate-600/25 bg-slate-800/15',
    pillClass: 'bg-slate-700/40 text-slate-300',
    title: 'Tetapkan target invoice mingguan & review proyeksi EOY setiap Jumat',
    body: `Proyeksi EOY saat ini ${f(d.projected_eoy ?? 0)} (${d.projected_ach ?? 0}% dari target). Assign PIC per proyek, monitor progres mingguan, update status di Revenue Tracker.`,
    amount: null, amountClass: '',
  })

  return { topPriority, steps }
})

const typeMax = computed(() =>
  Math.max(...(data.value?.by_type ?? []).map((t: any) => Number(t.actual)), 1)
)

const riskMax = computed(() =>
  Math.max(...(data.value?.by_risk ?? []).map((r: any) => Number(r.target)), 1)
)

const kategoriItems = computed(() => [
  { label: 'Project',   ach: data.value?.project_ach ?? 0,   actual: data.value?.project_actual ?? 0,   target: data.value?.project_target ?? 0 },
  { label: 'Recurring', ach: data.value?.recurring_ach ?? 0, actual: data.value?.recurring_actual ?? 0, target: data.value?.recurring_target ?? 0 },
])

const ownerItems = computed(() => [
  { label: 'FSP-ECO',  ach: data.value?.fsp_eco_ach  ?? 0, actual: data.value?.fsp_eco_actual  ?? 0, target: data.value?.fsp_eco_target  ?? 0 },
  { label: 'FSP-CORE', ach: data.value?.fsp_core_ach ?? 0, actual: data.value?.fsp_core_actual ?? 0, target: data.value?.fsp_core_target ?? 0 },
])

const noData = computed(() => totalProjects.value === 0)

// ── Root cause analysis ───────────────────────────────────────────
const rootCauses = computed(() => {
  if (!data.value || noData.value) return []
  const d = data.value
  const causes: any[] = []

  // Achievement rendah
  if (d.ach_pct < 50) {
    causes.push({
      level: 'critical', icon: 'fa-chart-line',
      title: `Achievement Sangat Rendah (${d.ach_pct}%)`,
      desc: `Realisasi hanya ${d.ach_pct}% dari target YTD. Dengan run rate saat ini, proyeksi akhir tahun hanya ${d.projected_ach}% — jauh dari target 100%.`,
    })
  } else if (d.ach_pct < 80) {
    causes.push({
      level: 'warning', icon: 'fa-chart-line',
      title: `Achievement Di Bawah Target (${d.ach_pct}%)`,
      desc: `Realisasi belum mencapai 80% dari target berjalan. Proyeksi akhir tahun ${d.projected_ach}% — perlu akselerasi signifikan.`,
    })
  }

  // Banyak proyek critical
  if (d.critical_count > 0) {
    const pct = totalProjects.value > 0 ? Math.round(d.critical_count / totalProjects.value * 100) : 0
    causes.push({
      level: 'critical', icon: 'fa-triangle-exclamation',
      title: `${d.critical_count} Proyek Critical/High Risk (${pct}%)`,
      desc: `${pct}% dari total proyek dalam kondisi Critical atau High Risk. Proyek-proyek ini berisiko tinggi tidak terealisasi dan menyumbang gap besar terhadap target.`,
    })
  }

  // Banyak proyek nol realisasi
  if (d.zero_count > 0) {
    causes.push({
      level: d.zero_count > 5 ? 'critical' : 'warning', icon: 'fa-circle-xmark',
      title: `${d.zero_count} Proyek Belum Ada Realisasi`,
      desc: `Proyek senilai ${fmt.rupiah(zeroValue.value)} sama sekali belum ada realisasi. Kemungkinan: proyek belum kick-off, hambatan kontrak, atau pending invoicing.`,
    })
  }

  // Miss target berturut-turut
  if (d.miss_months_count >= 3) {
    causes.push({
      level: 'critical', icon: 'fa-calendar-xmark',
      title: `Miss Target ${d.miss_months_count} Bulan Berturut`,
      desc: `${d.miss_months_count} dari ${d.past_months_count} bulan realisasi di bawah 80% target. Pola ini menunjukkan masalah sistemik, bukan hanya faktor temporer.`,
    })
  } else if (d.miss_months_count > 0) {
    causes.push({
      level: 'warning', icon: 'fa-calendar-minus',
      title: `${d.miss_months_count} Bulan Miss Target`,
      desc: `${d.miss_months_count} bulan tidak mencapai target meskipun ada beberapa bulan yang achieve. Perlu dievaluasi penyebab di bulan-bulan tersebut.`,
    })
  }

  // Invoice outstanding
  if (d.outstanding_amount > 0) {
    causes.push({
      level: 'warning', icon: 'fa-file-invoice',
      title: `Invoice Outstanding ${fmt.rupiah(d.outstanding_amount)}`,
      desc: `${d.outstanding_count} invoice senilai ${fmt.rupiah(d.outstanding_amount)} belum dibayarkan. Realisasi bisa langsung meningkat jika pembayaran masuk.`,
    })
  }

  // Project vs Recurring imbalance
  if (d.project_ach < 30 && d.recurring_ach > 70) {
    causes.push({
      level: 'warning', icon: 'fa-scale-unbalanced',
      title: 'Project Revenue Jauh di Bawah Recurring',
      desc: `Recurring mencapai ${d.recurring_ach}% namun Project hanya ${d.project_ach}%. Revenue project one-time lebih sulit diprediksi dan sering terlambat karena dependency project delivery.`,
    })
  }

  if (causes.length === 0) {
    causes.push({
      level: 'info', icon: 'fa-circle-check',
      title: 'Revenue Dalam Kondisi Baik',
      desc: 'Tidak ada masalah kritis yang terdeteksi. Pertahankan konsistensi pengiriman dan invoicing.',
    })
  }

  return causes
})
</script>
