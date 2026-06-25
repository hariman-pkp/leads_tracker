<template>
  <div>
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-utensils text-yellow-400 mr-2" />Dashboard Entertain</h1>
        <p class="page-subtitle">ROI & produktivitas biaya entertain per sales — {{ filterTahun }}</p>
      </div>
      <div class="flex items-center gap-3 flex-wrap">
        <select v-if="canApprove" v-model="filterSales" @change="loadRoi" class="form-select text-sm w-40">
          <option value="">Semua Sales</option>
          <option v-for="s in salesList" :key="s" :value="s">{{ s }}</option>
        </select>
        <select v-model="filterTahun" @change="load" class="form-select text-sm w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <select v-model="filterBulan" @change="loadClaims" class="form-select text-sm w-36">
          <option :value="0">Semua Bulan</option>
          <option v-for="m in 12" :key="m" :value="m">{{ monthName(m) }}</option>
        </select>
        <NuxtLink to="/entertain/claims" class="btn-primary btn-sm">
          <i class="fa-solid fa-receipt" /> Klaim Saya
        </NuxtLink>
        <NuxtLink v-if="canApprove" to="/entertain/approval" class="btn-secondary btn-sm">
          <i class="fa-solid fa-circle-check" /> Approval
          <span v-if="pendingCount > 0"
                class="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-px">
            {{ pendingCount }}
          </span>
        </NuxtLink>
      </div>
    </div>

    <!-- KPI strip -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
      <!-- Card 1: dari summaryAll (claims endpoint — selalu ada) -->
      <div class="card text-center py-3">
        <div class="text-xs text-gray-500 mb-1">Total Entertain Disetujui</div>
        <div class="text-xl font-bold text-apex-text">{{ fmt.rupiah(summaryAll.approved_amount || 0) }}</div>
        <div class="text-xs text-gray-600 mt-0.5">{{ filterBulan ? monthName(filterBulan) + ' ' : '' }}{{ filterTahun }}</div>
      </div>
      <!-- Card 2: dari rekapSales (rekap endpoint — selalu ada) -->
      <div class="card text-center py-3">
        <div class="text-xs text-gray-500 mb-1">Budget Tahunan</div>
        <div class="text-xl font-bold text-blue-300">{{ fmt.rupiah(totalBudgetFromRekap) }}</div>
        <div class="text-xs text-gray-600 mt-0.5">
          {{ totalBudgetFromRekap > 0 ? ((summaryAll.approved_amount || 0) / totalBudgetFromRekap * 100).toFixed(0) + '% terpakai' : 'limit belum diatur' }}
        </div>
      </div>
      <div class="card text-center py-3">
        <div class="text-xs text-gray-500 mb-1">Total Won (Pipeline)</div>
        <div class="text-xl font-bold text-emerald-400">{{ fmt.rupiah(totalWon) }}</div>
        <div class="text-xs text-gray-600 mt-0.5">dari pipeline {{ filterTahun }}</div>
      </div>
      <div class="card text-center py-3 border"
           :class="totalRoi >= 10 ? 'border-emerald-700/60 bg-emerald-900/10'
                 : totalRoi >= 3  ? 'border-yellow-700/60 bg-yellow-900/10'
                 : 'border-navy-700'">
        <div class="text-xs text-gray-500 mb-1">ROI Keseluruhan</div>
        <div class="text-2xl font-bold"
             :class="totalRoi >= 10 ? 'text-emerald-400'
                   : totalRoi >= 3  ? 'text-yellow-400' : 'text-red-400'">
          {{ totalEntertain > 0 ? totalRoi.toFixed(1) + '×' : '—' }}
        </div>
        <div class="text-xs text-gray-600 mt-0.5">deal won per Rp entertain</div>
      </div>
    </div>

    <div v-if="loading" class="flex justify-center py-20 text-gray-500">
      <i class="fa-solid fa-circle-notch fa-spin text-2xl mr-2" />Memuat...
    </div>

    <template v-else>

      <!-- ══ LEADERBOARD LIMIT & PENGGUNAAN ══════════════════════════ -->
      <div v-if="canApprove && rekapSales.length" class="card mb-5">
        <div class="flex items-center justify-between mb-1">
          <div>
            <div class="section-title mb-0">
              <i class="fa-solid fa-ranking-star text-yellow-400 mr-1.5" />Limit & Penggunaan Entertain
            </div>
            <div class="text-xs text-gray-500 mt-0.5">
              {{ filterBulan ? monthName(filterBulan) + ' ' + filterTahun : 'Tahun ' + filterTahun }}
              · diurutkan berdasarkan total disetujui
            </div>
          </div>
          <div class="flex items-center gap-6">
            <div class="hidden md:block text-right">
              <div class="text-xs text-gray-500">Total Disetujui</div>
              <div class="text-sm font-semibold text-emerald-400">
                {{ fmt.rupiah(rekapSales.reduce((s, r) => s + (r.total_approved || 0), 0)) }}
              </div>
            </div>
            <div class="hidden md:block text-right">
              <div class="text-xs text-gray-500">Total Limit/Bln</div>
              <div class="text-sm font-semibold text-apex-text">
                {{ fmt.rupiah(rekapSales.reduce((s, r) => s + (r.entertain_limit || 0), 0)) }}
              </div>
            </div>
            <NuxtLink to="/sales" class="text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1.5 border border-primary-400/30 rounded-lg px-3 py-1.5">
              <i class="fa-solid fa-sliders text-[10px]" />Kelola Limit
            </NuxtLink>
          </div>
        </div>

        <!-- Table header -->
        <div class="grid leaderboard-grid gap-3 px-3 py-2 mt-3 border-b border-navy-700 text-[11px] text-gray-500 font-medium uppercase tracking-wide">
          <div class="text-center">#</div>
          <div>Sales</div>
          <div class="text-right">Disetujui</div>
          <div>Penggunaan limit</div>
          <div class="text-right">%</div>
        </div>

        <div v-for="(r, idx) in leaderboard" :key="r.user_id"
             class="grid leaderboard-grid gap-3 px-3 py-2.5 items-center border-b border-navy-700/40 hover:bg-navy-800/30 transition-colors last:border-0">
          <!-- Rank -->
          <div class="text-center">
            <span v-if="idx === 0" class="text-base">🥇</span>
            <span v-else-if="idx === 1" class="text-base">🥈</span>
            <span v-else-if="idx === 2" class="text-base">🥉</span>
            <span v-else class="text-xs text-gray-500 font-medium tabular-nums">{{ idx + 1 }}</span>
          </div>
          <!-- Avatar + nama -->
          <div class="flex items-center gap-2.5 min-w-0">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"
                 :class="pct(r) > 100 ? 'bg-red-900/50 text-red-300' : pct(r) > 75 ? 'bg-yellow-900/50 text-yellow-300' : 'bg-primary-900/50 text-primary-300'">
              {{ initials(r.sales_nama) }}
            </div>
            <div class="min-w-0">
              <div class="text-sm font-medium text-apex-text truncate">{{ r.sales_nama }}</div>
              <div class="text-[11px] text-gray-500">{{ r.jumlah_klaim || 0 }} klaim</div>
            </div>
            <span v-if="pct(r) > 100" class="ml-1 text-[10px] font-medium bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full flex-shrink-0">Melebihi</span>
            <span v-else-if="pct(r) > 75" class="ml-1 text-[10px] font-medium bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full flex-shrink-0">Hampir</span>
          </div>
          <!-- Amount approved -->
          <div class="text-right">
            <div class="text-sm font-semibold tabular-nums"
                 :class="pct(r) > 100 ? 'text-red-400' : pct(r) > 75 ? 'text-yellow-400' : 'text-emerald-400'">
              {{ fmt.rupiah(r.total_approved || 0) }}
            </div>
            <div class="text-[11px] text-gray-500 tabular-nums">
              / {{ r.entertain_limit > 0
                    ? fmt.rupiah(filterBulan ? r.entertain_limit : r.entertain_limit * proRataMonths(r.join_date))
                      + (filterBulan ? '/bln' : `/${proRataMonths(r.join_date)}bln`)
                    : '—' }}
            </div>
          </div>
          <!-- Progress bar -->
          <div v-if="r.entertain_limit > 0">
            <div class="h-1.5 bg-navy-700 rounded-full overflow-hidden mb-1">
              <div class="h-full rounded-full transition-all duration-700"
                   :class="pct(r) > 100 ? 'bg-red-500' : pct(r) > 75 ? 'bg-yellow-500' : 'bg-emerald-500'"
                   :style="`width:${Math.min(pct(r), 100)}%`" />
            </div>
            <div class="text-[10px] text-gray-600">{{ fmt.rupiah(r.total || 0) }} diajukan</div>
          </div>
          <div v-else class="text-[11px] text-gray-600 italic">Limit belum diatur</div>
          <!-- Percent -->
          <div class="text-right">
            <span v-if="r.entertain_limit > 0" class="text-sm font-semibold tabular-nums"
                  :class="pct(r) > 100 ? 'text-red-400' : pct(r) > 75 ? 'text-yellow-400' : 'text-emerald-400'">
              {{ pct(r).toFixed(0) }}%
            </span>
            <span v-else class="text-gray-500 text-xs">—</span>
          </div>
        </div>
      </div>

      <!-- Limit saya (Sales role) -->
      <div v-if="!canApprove && myLimit > 0" class="card mb-5">
        <div class="section-title mb-3">
          <i class="fa-solid fa-wallet text-primary-400 mr-1.5" />Limit Entertain Saya —
          {{ filterBulan ? monthName(filterBulan) : 'Tahun ' + filterTahun }}
        </div>
        <div class="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div class="flex-1">
            <div class="flex justify-between text-xs mb-2">
              <span class="text-gray-500">Terpakai: <strong class="text-apex-text">{{ fmt.rupiah(summaryAll.total_amount || 0) }}</strong></span>
              <span :class="myPct > 100 ? 'text-red-400 font-semibold' : 'text-gray-500'">{{ myPct.toFixed(0) }}%</span>
            </div>
            <div class="h-3 bg-navy-700 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                   :class="myPct > 100 ? 'bg-red-500' : myPct > 75 ? 'bg-yellow-500' : 'bg-emerald-500'"
                   :style="`width:${Math.min(myPct, 100)}%`" />
            </div>
            <div class="flex justify-between text-xs mt-1.5 text-gray-600">
              <span>Rp 0</span>
              <span>Limit: {{ fmt.rupiah(myLimit) }}/bln</span>
            </div>
          </div>
          <div class="text-center md:text-right flex-shrink-0">
            <div class="text-2xl font-bold" :class="myPct > 100 ? 'text-red-400' : 'text-emerald-400'">
              {{ fmt.rupiah(Math.max(myLimit - (summaryAll.total_amount || 0), 0)) }}
            </div>
            <div class="text-xs text-gray-500">sisa limit {{ filterBulan ? 'bulan ini' : 'rata-rata/bln' }}</div>
          </div>
        </div>
      </div>

      <!-- ══ ROI CARDS PER SALES ══════════════════════════════════════ -->
      <div v-if="canApprove && roiRows.length" class="mb-5">
        <div class="flex items-center justify-between mb-3">
          <div class="section-title mb-0">
            <i class="fa-solid fa-scale-balanced mr-1.5 text-blue-400" />Produktivitas Entertain per Sales
          </div>
          <div class="flex items-center gap-3 text-xs text-gray-500">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />≥10× efisien</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" />3–10× cukup</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />&lt;3× perlu evaluasi</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
          <div v-for="r in roiRows" :key="r.user_id"
               class="card border-l-4 transition-all hover:shadow-lg"
               :class="roiColor(r).border">

            <!-- Card header: nama + ROI badge -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                     :class="roiColor(r).avatar">
                  {{ initials(r.sales_nama) }}
                </div>
                <div>
                  <div class="font-semibold text-sm text-apex-text">{{ r.sales_nama }}</div>
                  <div class="text-xs text-gray-500">{{ r.jumlah_klaim }} klaim</div>
                </div>
              </div>
              <!-- ROI Badge besar -->
              <div class="text-right">
                <div class="text-2xl font-black leading-none"
                     :class="roiColor(r).text">
                  {{ r.roi_pipeline !== null ? r.roi_pipeline + '×' : '—' }}
                </div>
                <div class="text-[10px] text-gray-500">ROI Pipeline</div>
              </div>
            </div>

            <!-- Entertain vs Budget bar -->
            <div class="mb-3">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-gray-500">Entertain terpakai</span>
                <span class="font-medium" :class="r.usage_pct > 100 ? 'text-red-400' : 'text-gray-300'">
                  {{ r.usage_pct.toFixed(0) }}%
                </span>
              </div>
              <div class="h-2 rounded-full bg-navy-700 overflow-hidden">
                <div class="h-full rounded-full transition-all duration-700"
                     :class="r.usage_pct > 100 ? 'bg-red-500' : r.usage_pct > 75 ? 'bg-yellow-500' : 'bg-emerald-500'"
                     :style="`width:${Math.min(r.usage_pct, 100)}%`" />
              </div>
              <div class="flex justify-between text-[10px] mt-1 text-gray-600">
                <span>{{ fmt.rupiah(r.entertain_approved) }}</span>
                <span>Budget: {{ r.budget_tahunan > 0 ? fmt.rupiah(r.budget_tahunan) : 'no limit' }}</span>
              </div>
            </div>

            <!-- Tiga metrik bawah -->
            <div class="grid grid-cols-3 gap-2 pt-3 border-t border-navy-700/60">
              <!-- Deal Won -->
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-0.5">Won</div>
                <div class="text-sm font-bold text-emerald-400">{{ fmt.rupiah(r.won_value) }}</div>
                <div class="text-[10px] text-gray-600">{{ r.won_count }} deal</div>
              </div>
              <!-- Revenue -->
              <div class="text-center border-x border-navy-700/60">
                <div class="text-xs text-gray-500 mb-0.5">Revenue</div>
                <div class="text-sm font-bold text-blue-300">{{ fmt.rupiah(r.revenue_actual) }}</div>
                <div v-if="r.revenue_target > 0" class="text-[10px] text-gray-600">
                  / {{ fmt.rupiah(r.revenue_target) }}
                </div>
                <div v-else class="text-[10px] text-gray-600">—</div>
              </div>
              <!-- Sisa Budget -->
              <div class="text-center">
                <div class="text-xs text-gray-500 mb-0.5">Sisa</div>
                <div class="text-sm font-bold" :class="r.sisa_budget <= 0 ? 'text-red-400' : 'text-gray-300'">
                  {{ fmt.rupiah(r.sisa_budget) }}
                </div>
                <div class="text-[10px]" :class="r.sisa_budget <= 0 ? 'text-red-500' : 'text-gray-600'">
                  {{ r.sisa_budget <= 0 ? 'habis' : 'budget sisa' }}
                </div>
              </div>
            </div>

            <!-- ROI Revenue (jika ada) -->
            <div v-if="r.roi_revenue !== null" class="mt-2.5 pt-2.5 border-t border-navy-700/60 flex items-center justify-between text-xs">
              <span class="text-gray-500">ROI Revenue</span>
              <span class="font-bold" :class="roiColor(r).text">{{ r.roi_revenue }}×</span>
            </div>
          </div>
        </div>

        <!-- ── Ranking Bar Chart ──────────────────────────────── -->
        <div class="card mb-5">
          <div class="section-title mb-4">
            <i class="fa-solid fa-ranking-star mr-1.5 text-yellow-400" />Ranking Efisiensi — ROI Pipeline
          </div>
          <div class="space-y-3">
            <div v-for="r in roiRanked" :key="r.user_id" class="flex items-center gap-3">
              <div class="w-24 text-xs text-gray-400 text-right flex-shrink-0 truncate">{{ r.sales_nama }}</div>
              <div class="flex-1 flex items-center gap-2">
                <!-- Bar entertain (cost) -->
                <div class="relative h-5 flex-1 rounded bg-navy-800 overflow-hidden">
                  <!-- Entertain bar (merah/oranye) -->
                  <div class="absolute left-0 top-0 h-full rounded transition-all duration-700 opacity-80"
                       style="background:#f97316"
                       :style="`width:${maxEntertain > 0 ? r.entertain_approved/maxEntertain*100 : 0}%`" />
                  <!-- Won bar (hijau, stacked/overlay) -->
                  <div class="absolute left-0 top-0 h-full rounded transition-all duration-700"
                       style="background:#22c55e; opacity:0.35"
                       :style="`width:${maxWon > 0 ? r.won_value/maxWon*100 : 0}%`" />
                </div>
                <div class="w-16 text-xs font-bold text-right flex-shrink-0"
                     :class="roiColor(r).text">
                  {{ r.roi_pipeline !== null ? r.roi_pipeline + '×' : '—' }}
                </div>
              </div>
              <div class="w-28 text-xs text-gray-500 flex-shrink-0 hidden lg:block">
                <span style="color:#f97316">■</span> {{ fmt.rupiah(r.entertain_approved) }}
              </div>
            </div>
          </div>
          <div class="flex gap-4 mt-3 pt-3 border-t border-navy-700/40 text-[10px] text-gray-600">
            <span><span style="color:#f97316">■</span> Entertain disetujui</span>
            <span><span style="color:#22c55e">■</span> Won (pipeline, skala berbeda)</span>
          </div>
        </div>

        <!-- ── Tren Bulanan ───────────────────────────────────── -->
        <div class="card mb-5">
          <div class="section-title mb-4">
            <i class="fa-solid fa-chart-column mr-1.5 text-orange-400" />Tren Entertain Bulanan — {{ filterTahun }}
            <span v-if="filterSales" class="text-xs text-gray-500 font-normal ml-2">{{ filterSales }}</span>
          </div>
          <div class="flex items-end gap-1.5 h-32">
            <div v-for="(v, i) in (roiData?.tren_monthly ?? [])" :key="i"
                 class="flex-1 flex flex-col items-center gap-1 group cursor-default"
                 :title="`${roiData?.bulan_labels?.[i]}: ${fmt.rupiah(v)}`">
              <div class="text-[9px] text-gray-600 group-hover:text-gray-400 transition-colors text-center leading-tight">
                {{ v > 0 ? fmt.rupiah(v) : '' }}
              </div>
              <div class="w-full rounded-t transition-all duration-500"
                   :style="`height:${maxTren > 0 ? v/maxTren*88 : 0}px; min-height:${v>0?4:1}px; background:${v>0?'#f97316':'#1e2d42'}`" />
              <div class="text-[9px] text-gray-600">{{ roiData?.bulan_labels?.[i] }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ VIEW SALES SENDIRI ═══════════════════════════════════════ -->
      <div v-if="!canApprove && myRoi" class="mb-5">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <!-- Budget card -->
          <div class="card">
            <div class="text-xs text-gray-500 mb-1"><i class="fa-solid fa-wallet mr-1 text-blue-400" />Budget Entertain {{ filterTahun }}</div>
            <div class="text-2xl font-bold text-apex-text mb-1">{{ fmt.rupiah(myRoi.budget_tahunan) }}</div>
            <div class="text-xs text-gray-500">{{ fmt.rupiah(myRoi.entertain_limit) }}/bln × 12</div>
            <div class="mt-3 h-2 rounded-full bg-navy-700 overflow-hidden">
              <div class="h-full rounded-full transition-all duration-700"
                   :class="myRoi.usage_pct > 100 ? 'bg-red-500' : myRoi.usage_pct > 75 ? 'bg-yellow-500' : 'bg-emerald-500'"
                   :style="`width:${Math.min(myRoi.usage_pct,100)}%`" />
            </div>
            <div class="flex justify-between mt-1 text-[10px] text-gray-600">
              <span>Terpakai: {{ fmt.rupiah(myRoi.entertain_approved) }}</span>
              <span :class="myRoi.usage_pct > 100 ? 'text-red-400' : ''">{{ myRoi.usage_pct.toFixed(0) }}%</span>
            </div>
            <div class="mt-2 text-sm font-semibold" :class="myRoi.sisa_budget <= 0 ? 'text-red-400' : 'text-emerald-400'">
              Sisa: {{ fmt.rupiah(myRoi.sisa_budget) }}
            </div>
          </div>

          <!-- Won card -->
          <div class="card border border-emerald-700/40">
            <div class="text-xs text-gray-500 mb-1"><i class="fa-solid fa-trophy mr-1 text-emerald-400" />Pipeline Won {{ filterTahun }}</div>
            <div class="text-2xl font-bold text-emerald-400 mb-1">{{ fmt.rupiah(myRoi.won_value) }}</div>
            <div class="text-xs text-gray-500">{{ myRoi.won_count }} deal ditutup</div>
            <div v-if="myRoi.revenue_actual > 0" class="mt-3 pt-3 border-t border-navy-700/40">
              <div class="text-xs text-gray-500 mb-0.5"><i class="fa-solid fa-chart-line mr-1 text-blue-400" />Revenue Realisasi</div>
              <div class="text-lg font-bold text-blue-300">{{ fmt.rupiah(myRoi.revenue_actual) }}</div>
            </div>
          </div>

          <!-- ROI card -->
          <div class="card border-2 flex flex-col items-center justify-center py-6"
               :class="roiColor(myRoi).border">
            <div class="text-xs text-gray-500 mb-2">Setiap Rp 1 entertain menghasilkan</div>
            <div class="text-5xl font-black leading-none mb-1" :class="roiColor(myRoi).text">
              {{ myRoi.roi_pipeline !== null ? myRoi.roi_pipeline + '×' : '—' }}
            </div>
            <div class="text-sm text-gray-500">deal won</div>
            <div v-if="myRoi.roi_revenue !== null" class="mt-3 text-center">
              <div class="text-xs text-gray-500">ROI Revenue</div>
              <div class="text-xl font-bold" :class="roiColor(myRoi).text">{{ myRoi.roi_revenue }}×</div>
            </div>
            <div class="mt-4 text-[10px] px-3 py-1.5 rounded-full"
                 :class="roiColor(myRoi).badge">
              {{ roiColor(myRoi).label }}
            </div>
          </div>
        </div>
      </div>

      <!-- ══ PENDING + APPROVED ════════════════════════════════════════ -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <div class="section-title mb-0"><i class="fa-solid fa-clock text-yellow-400 mr-1.5" />Menunggu Approval</div>
            <NuxtLink :to="canApprove ? '/entertain/approval' : '/entertain/claims'"
                      class="text-xs text-primary-400 hover:text-primary-300">Lihat semua →</NuxtLink>
          </div>
          <div v-if="!pendingClaims.length" class="text-center py-6 text-gray-600 text-sm">Tidak ada klaim pending.</div>
          <div v-else class="space-y-2">
            <div v-for="c in pendingClaims.slice(0,5)" :key="c.id"
                 class="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-navy-800/40 hover:bg-navy-800/70 transition-colors">
              <div class="min-w-0">
                <div class="text-xs font-mono text-primary-400">{{ c.claim_no }}</div>
                <div class="text-sm font-medium text-apex-text truncate">{{ c.nama_klien }}</div>
                <div class="text-xs text-gray-500">{{ c.sales_nama }} · {{ fmt.tgl(c.tgl_klaim) }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="font-semibold text-sm">{{ fmt.rupiah(c.jumlah) }}</div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/50 text-yellow-300">Pending</span>
              </div>
            </div>
            <div v-if="pendingClaims.length > 5" class="text-center pt-1">
              <NuxtLink :to="canApprove ? '/entertain/approval' : '/entertain/claims'"
                        class="text-xs text-primary-400">+{{ pendingClaims.length - 5 }} lainnya</NuxtLink>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-3">
            <div class="section-title mb-0"><i class="fa-solid fa-circle-check text-emerald-400 mr-1.5" />Approved Terbaru</div>
            <NuxtLink to="/entertain/claims" class="text-xs text-primary-400 hover:text-primary-300">Lihat semua →</NuxtLink>
          </div>
          <div v-if="!approvedClaims.length" class="text-center py-6 text-gray-600 text-sm">Belum ada klaim disetujui.</div>
          <div v-else class="space-y-2">
            <div v-for="c in approvedClaims.slice(0,5)" :key="c.id"
                 class="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-navy-800/40 hover:bg-navy-800/70 transition-colors">
              <div class="min-w-0">
                <div class="text-xs font-mono text-primary-400">{{ c.claim_no }}</div>
                <div class="text-sm font-medium text-apex-text truncate">{{ c.nama_klien }}</div>
                <div class="text-xs text-gray-500">{{ c.sales_nama }} · {{ fmt.tgl(c.tgl_klaim) }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="font-semibold text-sm text-emerald-400">{{ fmt.rupiah(c.jumlah) }}</div>
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300">Approved</span>
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

const { get } = useApi()
const fmt  = useFormat()
const auth = useAuthStore()

const canApprove = computed(() => [1, 2].includes(auth.user?.role_id ?? 0))

const loading     = ref(true)
const filterTahun = ref(new Date().getFullYear())
const filterBulan = ref(0)
const filterSales = ref('')
const years       = Array.from({ length: 4 }, (_, i) => new Date().getFullYear() - i)
const salesList   = ref<string[]>([])

const summaryAll     = ref<any>({})
const pendingClaims  = ref<any[]>([])
const approvedClaims = ref<any[]>([])
const roiData        = ref<any>(null)
const rekapSales     = ref<any[]>([])

const pendingCount = computed(() => summaryAll.value.pending_total ?? summaryAll.value.pending ?? 0)
const myLimit      = computed(() => summaryAll.value.limit_per_bulan || 0)
const myPct        = computed(() => myLimit.value ? (summaryAll.value.total_amount || 0) / myLimit.value * 100 : 0)

const leaderboard = computed(() =>
  [...rekapSales.value].sort((a, b) => (b.total_approved || 0) - (a.total_approved || 0))
)

const curYear  = new Date().getFullYear()
const curMonth = new Date().getMonth() + 1

// Pro-rata per sales: mulai dari bulan join (jika join tahun ini), atau Januari
function proRataMonths(joinDate?: string): number {
  if (filterTahun.value < curYear) return 12          // tahun lampau → full 12 bln
  if (!joinDate) return curMonth                       // tidak ada join_date → dari Jan
  const jd = new Date(joinDate)
  const joinYear  = jd.getFullYear()
  const joinMonth = jd.getMonth() + 1
  const startMonth = joinYear >= filterTahun.value ? joinMonth : 1
  return Math.max(curMonth - startMonth + 1, 1)
}

function capLimit(r: any): number {
  return filterBulan.value ? r.entertain_limit : r.entertain_limit * proRataMonths(r.join_date)
}

function pct(r: any): number {
  if (!r.entertain_limit) return 0
  const used = r.total_approved || 0
  return (used / capLimit(r)) * 100
}

// ── ROI helpers ───────────────────────────────────────────────────────────
const roiRows   = computed<any[]>(() => roiData.value?.rows ?? [])
const roiRanked = computed(() => [...roiRows.value].sort((a, b) => (b.roi_pipeline ?? 0) - (a.roi_pipeline ?? 0)))
const myRoi     = computed(() => !canApprove.value ? (roiRows.value[0] ?? null) : null)

const totalBudget        = computed(() => roiRows.value.reduce((s, r) => s + (r.budget_tahunan || 0), 0))
const totalEntertain     = computed(() => roiRows.value.reduce((s, r) => s + (r.entertain_approved || 0), 0))
const totalWon           = computed(() => roiRows.value.reduce((s, r) => s + (r.won_value || 0), 0))
const totalRevenue       = computed(() => roiRows.value.reduce((s, r) => s + (r.revenue_actual || 0), 0))
const totalUsagePct      = computed(() => totalBudget.value > 0 ? totalEntertain.value / totalBudget.value * 100 : 0)
const totalRoi           = computed(() => totalEntertain.value > 0 ? totalWon.value / totalEntertain.value : 0)
// KPI Card 1 & 2: sumber independen — tidak bergantung pada roi endpoint
const totalBudgetFromRekap = computed(() =>
  rekapSales.value.reduce((s, r) => s + (r.entertain_limit || 0) * proRataMonths(r.join_date), 0)
)

const maxTren     = computed(() => Math.max(0, ...(roiData.value?.tren_monthly ?? [0])))
const maxEntertain = computed(() => Math.max(0, ...roiRows.value.map(r => r.entertain_approved || 0)))
const maxWon      = computed(() => Math.max(0, ...roiRows.value.map(r => r.won_value || 0)))

function roiColor(r: any) {
  const roi = r?.roi_pipeline ?? 0
  if (roi >= 10) return {
    border: 'border-l-emerald-500', avatar: 'bg-emerald-900/50 text-emerald-300',
    text: 'text-emerald-400', badge: 'bg-emerald-900/40 text-emerald-300', label: 'Sangat Efisien',
  }
  if (roi >= 3) return {
    border: 'border-l-yellow-500', avatar: 'bg-yellow-900/50 text-yellow-300',
    text: 'text-yellow-400', badge: 'bg-yellow-900/40 text-yellow-300', label: 'Cukup Baik',
  }
  return {
    border: 'border-l-red-500', avatar: 'bg-red-900/50 text-red-300',
    text: 'text-red-400', badge: 'bg-red-900/40 text-red-300', label: 'Perlu Evaluasi',
  }
}

// ── Load ──────────────────────────────────────────────────────────────────
async function loadClaims() {
  try {
    // Summary + pending claims (filter status=Pending, ambil semua)
    const baseParams: any = { tahun: filterTahun.value }
    if (filterBulan.value) baseParams.bulan = filterBulan.value

    const [resSummary, resPending, resApproved] = await Promise.all([
      get('/v1/entertain/claims', { ...baseParams, per_page: 1 }),           // summary only
      get('/v1/entertain/claims', { ...baseParams, status: 'Pending',  per_page: 500 }),
      get('/v1/entertain/claims', { ...baseParams, status: 'Approved', per_page: 10  }),
    ])
    summaryAll.value    = resSummary.summary || {}
    pendingClaims.value = resPending.claims  || []
    approvedClaims.value = (resApproved.claims || []).sort((a: any, b: any) => b.id - a.id)
  } catch {}
  loadRekap()
}

async function loadRekap() {
  if (!canApprove.value) return
  try {
    const res = await get('/v1/entertain/rekap', {
      tahun: filterTahun.value,
      bulan: filterBulan.value || undefined,
    })
    rekapSales.value = (res.per_sales_total || []).sort((a: any, b: any) =>
      a.sales_nama.localeCompare(b.sales_nama)
    )
  } catch {}
}

async function loadRoi() {
  try {
    const params: any = { tahun: filterTahun.value }
    if (filterSales.value) params.sales = filterSales.value
    roiData.value = await get('/v1/entertain/roi', params)
  } catch {}
}

async function load() {
  loading.value = true
  try { await Promise.all([loadClaims(), loadRekap(), loadRoi()]) }
  finally { loading.value = false }
}

function monthName(m: number) {
  return new Date(2000, m - 1, 1).toLocaleString('id-ID', { month: 'long' })
}
function initials(name: string) {
  return name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
}

onMounted(async () => {
  load()
  if (canApprove.value) {
    try {
      const res = await get('/v1/sales')
      salesList.value = (res.sales || []).map((s: any) => s.nama)
    } catch {}
  }
})
</script>

<style scoped>
.leaderboard-grid { grid-template-columns: 32px 1fr 120px 1fr 48px; }
</style>
