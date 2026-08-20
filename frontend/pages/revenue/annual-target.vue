<template>
  <div class="min-h-screen bg-apex-bg text-apex-text p-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-apex-text">
          <i class="fa-solid fa-flag-checkered text-primary-400 mr-2" />Annual Target
        </h1>
        <p class="text-sm text-apex-muted mt-0.5">Target revenue tahunan {{ selectedYear }}</p>
      </div>
      <div class="flex items-center gap-3">
        <select v-model.number="selectedYear" @change="loadData" class="form-select text-sm w-28">
          <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
        </select>
        <button v-if="isAdmin" @click="showInputModal = true" class="btn-secondary text-sm">
          <i class="fa-solid fa-pen-to-square" />Input Target
        </button>
        <button v-if="isAdmin" @click="showShareModal = true" class="btn-secondary text-sm">
          <i class="fa-solid fa-share-nodes" />Share
        </button>
      </div>
    </div>

    <div v-if="summary">

      <!-- KPI Strip -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div class="card text-center">
          <div class="text-xs text-gray-400 mb-1">Target Setahun</div>
          <div class="text-lg font-bold text-indigo-400">{{ fmt.rupiah(summary.grand_target) }}</div>
          <div class="text-xs text-gray-500 mt-1">full year {{ selectedYear }}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs text-gray-400 mb-1">Realisasi YTD</div>
          <div class="text-lg font-bold text-emerald-400">{{ fmt.rupiah(summary.ytd_actual) }}</div>
          <div class="text-xs text-gray-500 mt-1">s/d {{ MONTHS_ID[(summary.cur_month||1)-1] }}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs text-gray-400 mb-1">Achievement YTD</div>
          <div class="text-lg font-bold" :class="achColorPct(summary.ytd_ach)">{{ summary.ytd_ach }}%</div>
          <div class="text-xs text-gray-500 mt-1">vs target YTD {{ fmt.rupiah(summary.ytd_target) }}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs text-gray-400 mb-1">Sisa Target</div>
          <div class="text-lg font-bold" :class="summary.sisa_target <= 0 ? 'text-emerald-400' : 'text-red-400'">
            {{ fmt.rupiah(summary.sisa_target) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ summary.sisa_target <= 0 ? '✓ target tercapai' : 'untuk capai target tahunan' }}</div>
        </div>
        <div class="card text-center relative">
          <div class="absolute top-3 right-3">
            <button @click.stop="toggleInfo('eoy')" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
              <i class="fa-solid fa-circle-info text-sm" />
            </button>
            <div v-if="activeInfo === 'eoy'" @click.stop class="absolute right-0 top-7 z-30 w-72 text-left bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
              <div class="text-xs font-semibold text-gray-300 mb-3">{{ infoContent.eoy.title }}</div>
              <div class="space-y-2">
                <div v-for="l in infoContent.eoy.lines" :key="l.label" class="flex gap-2 text-xs">
                  <span class="text-blue-400 font-medium min-w-[72px]">{{ l.label }}</span>
                  <span class="text-gray-400">{{ l.desc }}</span>
                </div>
              </div>
              <div class="mt-3 pt-3 border-t border-apex-border/60 text-[11px] text-amber-400/80 flex gap-1.5">
                <i class="fa-solid fa-triangle-exclamation mt-0.5 flex-shrink-0" />
                <span>{{ infoContent.eoy.note }}</span>
              </div>
            </div>
          </div>
          <div class="text-xs text-gray-400 mb-1">Proyeksi EOY</div>
          <div class="text-lg font-bold" :class="achColorPct(summary.grand_target > 0 ? summary.proyeksi_eoy / summary.grand_target * 100 : 0)">
            {{ fmt.rupiah(summary.proyeksi_eoy) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ summary.proyeksi_eoy >= summary.grand_target ? '✓ on track' : (summary.grand_target > 0 ? (summary.proyeksi_eoy / summary.grand_target * 100).toFixed(1) + '% dari target' : '—') }}
          </div>
        </div>
      </div>

      <!-- Progress Bar Tahunan -->
      <div class="card mb-6">
        <div class="flex items-center justify-between mb-3">
          <div class="section-title mb-0">Progress Tahunan {{ selectedYear }}</div>
          <span class="text-sm font-bold" :class="achColorPct(summary.grand_target > 0 ? summary.ytd_actual / summary.grand_target * 100 : 0)">
            {{ summary.grand_target > 0 ? (summary.ytd_actual / summary.grand_target * 100).toFixed(1) : '0.0' }}% dari target tahunan
          </span>
        </div>

        <!-- Bar -->
        <div class="relative h-7 bg-navy-700 rounded-full overflow-hidden mb-3">
          <!-- YTD actual -->
          <div class="absolute inset-y-0 left-0 rounded-full transition-all"
               :class="summary.ytd_ach >= 100 ? 'bg-emerald-500' : summary.ytd_ach >= 75 ? 'bg-yellow-500' : 'bg-red-500'"
               :style="`width:${Math.min(summary.grand_target > 0 ? summary.ytd_actual / summary.grand_target * 100 : 0, 100)}%`" />
          <!-- YTD target marker -->
          <div class="absolute inset-y-0 w-0.5 bg-indigo-400 opacity-70"
               :style="`left:${Math.min(summary.grand_target > 0 ? summary.ytd_target / summary.grand_target * 100 : 0, 100)}%`" />
        </div>

        <!-- Info strip -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div class="bg-apex-card rounded-lg p-3">
            <div class="text-gray-400 mb-0.5">Run Rate / bulan</div>
            <div class="font-semibold text-blue-300">{{ fmt.rupiah(summary.run_rate) }}</div>
          </div>
          <div class="bg-apex-card rounded-lg p-3">
            <div class="text-gray-400 mb-0.5">Sisa bulan</div>
            <div class="font-semibold text-gray-200">{{ summary.sisa_bulan }} bulan</div>
          </div>
          <div class="bg-apex-card rounded-lg p-3">
            <div class="text-gray-400 mb-0.5">Target/bulan dibutuhkan</div>
            <div class="font-semibold" :class="summary.target_per_bulan > summary.run_rate ? 'text-red-400' : 'text-emerald-400'">
              {{ fmt.rupiah(summary.target_per_bulan) }}
            </div>
          </div>
          <div class="bg-apex-card rounded-lg p-3">
            <div class="text-gray-400 mb-0.5">Gap YTD</div>
            <div class="font-semibold" :class="summary.ytd_gap <= 0 ? 'text-emerald-400' : 'text-red-400'">
              {{ summary.ytd_gap <= 0 ? '+' : '-' }}{{ fmt.rupiah(Math.abs(summary.ytd_gap)) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Quarter + Per LOB -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        <!-- Per Quarter -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title mb-0">Realisasi vs Target per Quarter</div>
            <div class="relative">
              <button @click.stop="toggleInfo('quarter')" class="w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'quarter'" @click.stop
                   class="absolute right-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
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
          <div v-if="quarterData.some(q => q.target > 0 || q.actual > 0)" class="space-y-3">
            <div v-for="q in quarterData" :key="q.label" class="flex items-center gap-3">
              <div class="w-8 text-xs font-bold text-gray-400 flex-shrink-0">{{ q.label }}</div>
              <div class="flex-1 relative h-6 bg-navy-700 rounded overflow-hidden">
                <div class="absolute inset-y-0 left-0 rounded transition-all"
                     :class="q.ach >= 100 ? 'bg-emerald-500' : q.ach >= 75 ? 'bg-yellow-500' : 'bg-red-500'"
                     :style="`width:${Math.min(qMax > 0 ? q.actual / qMax * 100 : 0, 100)}%`" />
                <div class="absolute inset-y-0 w-0.5 bg-indigo-400 opacity-70"
                     :style="`left:${Math.min(qMax > 0 ? q.target / qMax * 100 : 0, 100)}%`" />
              </div>
              <div class="w-14 text-right text-xs font-bold" :class="achColorPct(q.ach)">{{ q.ach }}%</div>
              <div class="w-28 text-right text-xs text-gray-400 hidden sm:block">{{ fmt.rupiah(q.actual) }}</div>
            </div>
            <div class="pt-2 border-t border-apex-border text-xs text-gray-500 flex gap-4">
              <span class="flex items-center gap-1.5"><span class="inline-block w-2 h-2 rounded-sm bg-emerald-500"></span>Realisasi</span>
              <span class="flex items-center gap-1.5"><span class="inline-block w-0.5 h-3 bg-indigo-400"></span>Target</span>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 text-sm">Belum ada data</div>
        </div>

        <!-- Per LOB -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title mb-0">Realisasi vs Target per LOB</div>
            <div class="relative">
              <button @click.stop="toggleInfo('lob')" class="w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'lob'" @click.stop
                   class="absolute right-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
                <div class="text-xs font-semibold text-gray-300 mb-3">{{ infoContent.lob.title }}</div>
                <div class="space-y-2">
                  <div v-for="l in infoContent.lob.lines" :key="l.label" class="flex gap-2 text-xs">
                    <span class="text-blue-400 font-medium min-w-[56px]">{{ l.label }}</span>
                    <span class="text-gray-400">{{ l.desc }}</span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-apex-border/60 text-[11px] text-amber-400/80 flex gap-1.5">
                  <i class="fa-solid fa-triangle-exclamation mt-0.5 flex-shrink-0" />
                  <span>{{ infoContent.lob.note }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="summary.lobs?.length" class="space-y-3">
            <div v-for="lob in summary.lobs" :key="lob">
              <div class="flex items-center justify-between mb-1">
                <div class="text-xs text-gray-300 font-medium">{{ summary.org_names?.[lob] || lob }}</div>
                <div class="text-xs font-bold" :class="achColorPct(achPct(summary.lob_summary[lob]))">
                  {{ achPct(summary.lob_summary[lob]) }}%
                </div>
              </div>
              <div class="relative h-4 bg-navy-700 rounded overflow-hidden">
                <div class="absolute inset-y-0 left-0 rounded transition-all"
                     :class="achPct(summary.lob_summary[lob]) >= 100 ? 'bg-emerald-500' : achPct(summary.lob_summary[lob]) >= 75 ? 'bg-yellow-500' : 'bg-red-500'"
                     :style="`width:${Math.min(achPct(summary.lob_summary[lob]), 100)}%`" />
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-0.5">
                <span>{{ fmt.rupiah(summary.lob_summary[lob]?.actual || 0) }}</span>
                <span>{{ fmt.rupiah(summary.lob_summary[lob]?.target || 0) }}</span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 text-sm">Belum ada LOB terdaftar</div>
        </div>
      </div>

      <!-- New vs Existing + Kategori -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">

        <!-- New vs Existing -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title mb-0">New Revenue Stream vs Existing Revenue</div>
            <div class="relative">
              <button @click.stop="toggleInfo('revenue_type')" class="w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'revenue_type'" @click.stop
                   class="absolute right-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
                <div class="text-xs font-semibold text-gray-300 mb-3">{{ infoContent.revenue_type.title }}</div>
                <div class="space-y-2">
                  <div v-for="l in infoContent.revenue_type.lines" :key="l.label" class="flex gap-2 text-xs">
                    <span class="text-blue-400 font-medium min-w-[56px]">{{ l.label }}</span>
                    <span class="text-gray-400">{{ l.desc }}</span>
                  </div>
                </div>
                <div class="mt-3 pt-3 border-t border-apex-border/60 text-[11px] text-amber-400/80 flex gap-1.5">
                  <i class="fa-solid fa-triangle-exclamation mt-0.5 flex-shrink-0" />
                  <span>{{ infoContent.revenue_type.note }}</span>
                </div>
              </div>
            </div>
          </div>
          <div v-if="summary.revenue_type_summary?.length" class="space-y-4">
            <div v-for="ct in summary.revenue_type_summary" :key="ct.revenue_type">
              <div class="flex items-center justify-between mb-1">
                <div class="flex items-center gap-2">
                  <span :class="ct.revenue_type === 'New' ? 'badge-blue' : 'badge-purple'">
                    {{ ct.revenue_type === 'New' ? 'New Revenue Stream' : 'Existing Revenue' }}
                  </span>
                </div>
                <span class="text-xs font-bold" :class="achColorPct(ct.target > 0 ? ct.actual / ct.target * 100 : 0)">
                  {{ ct.target > 0 ? (ct.actual / ct.target * 100).toFixed(1) : '0.0' }}%
                </span>
              </div>
              <div class="relative h-5 bg-navy-700 rounded overflow-hidden">
                <div class="absolute inset-y-0 left-0 rounded transition-all"
                     :class="ct.revenue_type === 'New' ? 'bg-blue-500' : 'bg-purple-500'"
                     :style="`width:${Math.min(ct.target > 0 ? ct.actual / ct.target * 100 : 0, 100)}%`" />
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-0.5">
                <span>Realisasi: {{ fmt.rupiah(ct.actual) }}</span>
                <span>Target: {{ fmt.rupiah(ct.target) }}</span>
              </div>
            </div>
            <!-- Total -->
            <div class="pt-3 border-t border-apex-border">
              <div class="flex justify-between text-xs text-gray-400">
                <span>Total target (dari proyek)</span>
                <span class="font-semibold text-blue-300">
                  {{ fmt.rupiah(summary.revenue_type_summary.reduce((s: number, c: any) => s + c.target, 0)) }}
                </span>
              </div>
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>Total realisasi</span>
                <span class="font-semibold text-emerald-400">
                  {{ fmt.rupiah(summary.revenue_type_summary.reduce((s: number, c: any) => s + c.actual, 0)) }}
                </span>
              </div>
            </div>
          </div>
          <div v-else class="text-center py-8 text-gray-500 text-sm">Belum ada data</div>
        </div>

        <!-- Per Kategori -->
        <div v-if="summary.kategori_summary?.length" class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title mb-0">Realisasi vs Target per Kategori</div>
            <div class="relative">
              <button @click.stop="toggleInfo('kategori')" class="w-5 h-5 rounded-full flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'kategori'" @click.stop
                   class="absolute right-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
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
          <div class="space-y-4">
            <div v-for="k in summary.kategori_summary" :key="k.kategori">
              <div class="flex items-center justify-between mb-1">
                <span :class="k.kategori === 'Project' ? 'badge-blue' : k.kategori === 'Recurring' ? 'badge-purple' : 'badge-gray'">
                  {{ k.kategori }}
                </span>
                <span class="text-xs font-bold" :class="achColorPct(k.target > 0 ? k.actual / k.target * 100 : 0)">
                  {{ k.target > 0 ? (k.actual / k.target * 100).toFixed(1) : '0.0' }}%
                </span>
              </div>
              <div class="relative h-5 bg-navy-700 rounded overflow-hidden">
                <div class="absolute inset-y-0 left-0 rounded transition-all"
                     :class="k.kategori === 'Project' ? 'bg-blue-500' : k.kategori === 'Recurring' ? 'bg-purple-500' : 'bg-gray-500'"
                     :style="`width:${Math.min(k.target > 0 ? k.actual / k.target * 100 : 0, 100)}%`" />
              </div>
              <div class="flex justify-between text-xs text-gray-500 mt-0.5">
                <span>Realisasi: {{ fmt.rupiah(k.actual) }}</span>
                <span>Target: {{ fmt.rupiah(k.target) }}</span>
              </div>
            </div>
            <!-- Total -->
            <div class="pt-3 border-t border-apex-border">
              <div class="flex justify-between text-xs text-gray-400">
                <span>Total target</span>
                <span class="font-semibold text-blue-300">
                  {{ fmt.rupiah(summary.kategori_summary.reduce((s: number, k: any) => s + k.target, 0)) }}
                </span>
              </div>
              <div class="flex justify-between text-xs text-gray-400 mt-1">
                <span>Total realisasi</span>
                <span class="font-semibold text-emerald-400">
                  {{ fmt.rupiah(summary.kategori_summary.reduce((s: number, k: any) => s + k.actual, 0)) }}
                </span>
              </div>
            </div>
          </div>
          <div class="mt-4 p-3 rounded-lg bg-amber-900/20 border border-amber-700/30 text-xs text-amber-300 flex gap-2">
            <i class="fa-solid fa-circle-info mt-0.5 flex-shrink-0" />
            <span>Target dari nilai kontrak proyek di Revenue Tracker (Active &amp; Completed saja).</span>
          </div>
        </div>
      </div>

    </div><!-- /summary -->

    <!-- Modal Input Target -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showInputModal" class="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showInputModal = false" />
          <div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">

            <div class="flex items-center justify-between px-6 py-4 border-b border-apex-border flex-shrink-0">
              <div>
                <h2 class="text-lg font-bold text-apex-text">Input Target Revenue {{ selectedYear }}</h2>
                <p class="text-xs text-apex-muted mt-0.5">Pilih organisasi dan isi target per bulan</p>
              </div>
              <button @click="showInputModal = false" class="btn-ghost btn-sm rounded-lg text-gray-400 hover:text-white">
                <i class="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div>
                <div class="flex items-center justify-between mb-3">
                  <div class="text-sm font-semibold text-gray-300">Organisasi dengan Target Revenue</div>
                  <button @click="saveOrgSelection" :disabled="savingOrgs" class="btn-secondary text-xs">
                    <i :class="savingOrgs ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'" />
                    {{ savingOrgs ? 'Menyimpan...' : 'Simpan Pilihan' }}
                  </button>
                </div>
                <div class="flex flex-wrap gap-2">
                  <label v-for="org in allOrgs" :key="org.kode"
                         class="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors select-none"
                         :class="org.selected ? 'border-primary-500 bg-primary-900/30 text-primary-300' : 'border-apex-border text-gray-400 hover:border-gray-500'">
                    <input type="checkbox" v-model="org.selected" class="accent-primary-500" />
                    <span class="text-sm font-medium">{{ org.nama }}</span>
                    <span class="text-xs opacity-60">{{ org.kode }}</span>
                  </label>
                </div>
              </div>

              <div class="border-t border-apex-border" />

              <div v-if="loading" class="flex justify-center py-10">
                <i class="fa-solid fa-circle-notch fa-spin text-primary-400 text-2xl" />
              </div>

              <div v-else-if="lobs.length" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b border-apex-border">
                      <th class="text-left py-2 px-3 text-gray-400 font-medium w-28">Bulan</th>
                      <th v-for="lob in lobs" :key="lob" class="text-right py-2 px-3 text-gray-400 font-medium min-w-[180px]">
                        <div>{{ orgNames[lob] || lob }}</div>
                        <div class="text-xs font-normal text-gray-500">{{ lob }}</div>
                      </th>
                      <th class="text-right py-2 px-3 text-gray-400 font-medium min-w-[140px]">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(month, idx) in MONTHS_ID" :key="idx+1"
                        class="border-b border-apex-border/40 hover:bg-apex-card/40 transition-colors">
                      <td class="py-2 px-3 font-medium text-gray-300">{{ month }}</td>
                      <td v-for="lob in lobs" :key="lob" class="py-1.5 px-2">
                        <input
                          type="text" inputmode="numeric"
                          :value="formatNum(grid[idx+1]?.[lob])"
                          class="form-input text-right text-sm w-full"
                          placeholder="0"
                          @focus="($event.target as HTMLInputElement).select()"
                          @input="onGridInput($event, idx+1, lob)"
                        />
                      </td>
                      <td class="py-2 px-3 text-right font-semibold text-blue-300">
                        {{ fmt.rupiah(rowTotal(idx+1)) }}
                      </td>
                    </tr>
                    <tr class="border-t-2 border-apex-border bg-apex-card/60 font-semibold">
                      <td class="py-2 px-3 text-gray-300">Total</td>
                      <td v-for="lob in lobs" :key="lob" class="py-2 px-3 text-right text-blue-300">
                        {{ fmt.rupiah(colTotal(lob)) }}
                      </td>
                      <td class="py-2 px-3 text-right text-blue-400 text-base">
                        {{ fmt.rupiah(grandTotal) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div v-else-if="!loading" class="text-center py-8 text-gray-500 text-sm">
                Pilih organisasi di atas lalu klik Simpan Pilihan untuk menampilkan grid entry.
              </div>
            </div>

            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-apex-border flex-shrink-0">
              <button @click="showInputModal = false" class="btn-secondary text-sm">Tutup</button>
              <button @click="saveAll" :disabled="saving" class="btn-primary text-sm">
                <i :class="saving ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-floppy-disk'" />
                {{ saving ? 'Menyimpan...' : 'Simpan Target' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Share Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showShareModal" class="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showShareModal = false" />
          <div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-md">
            <div class="flex items-center justify-between px-6 py-4 border-b border-apex-border">
              <h2 class="text-base font-bold text-apex-text">
                <i class="fa-solid fa-share-nodes text-primary-400 mr-2" />Share Annual Target
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

    <!-- Toast -->
    <Transition name="toast">
      <div v-if="toast.show"
           :class="toast.type === 'success' ? 'bg-emerald-900 border-emerald-600' : 'bg-red-900 border-red-700'"
           class="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm text-white">
        <i :class="toast.type === 'success' ? 'fa-solid fa-circle-check text-emerald-400' : 'fa-solid fa-circle-exclamation text-red-400'" />
        {{ toast.msg }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { get, post } = useApi()
const authStore = useAuthStore()
const fmt = useFormat()

const isAdmin   = computed(() => authStore.user?.role_id === 1 || authStore.user?.role_id === 2)
const curYear   = new Date().getFullYear()
const years     = Array.from({ length: 5 }, (_, i) => curYear - 1 + i)
const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']

const selectedYear   = ref(curYear)
const showInputModal = ref(false)
const showShareModal = ref(false)
const activeInfo     = ref<string | null>(null)

const infoContent: Record<string, { title: string; lines: { label: string; desc: string }[]; note?: string }> = {
  quarter: {
    title: 'Realisasi vs Target per Quarter',
    lines: [
      { label: 'Target', desc: 'Dari tabel annual_targets — diinput manual per organisasi/bulan di halaman ini.' },
      { label: 'Realisasi', desc: 'Dari revenue_monthly (billing per proyek per bulan), hanya untuk LOB yang terkonfigurasi.' },
    ],
    note: 'Angka quarter = agregat 3 bulan. Hanya mencakup LOB yang sudah didaftarkan.',
  },
  lob: {
    title: 'Realisasi vs Target per LOB',
    lines: [
      { label: 'Target', desc: 'Dari tabel annual_targets, dikelompokkan per organisasi/LOB.' },
      { label: 'Realisasi', desc: 'Dari revenue_monthly, dikelompokkan per organisasi proyek.' },
    ],
    note: 'Hanya LOB yang dikonfigurasi di pengaturan Annual Target yang tampil di sini.',
  },
  revenue_type: {
    title: 'New Revenue Stream vs Existing Revenue',
    lines: [
      { label: 'Target', desc: 'Dari kolom revenue_target di tabel revenue_projects.' },
      { label: 'Realisasi', desc: 'Dari kolom actual_revenue di tabel revenue_projects.' },
    ],
    note: 'Mencakup semua proyek aktif (Active & Completed), tidak terbatas pada LOB terkonfigurasi. Proyek tanpa revenue_type dianggap "Existing".',
  },
  kategori: {
    title: 'Realisasi vs Target per Kategori',
    lines: [
      { label: 'Target', desc: 'Dari kolom revenue_target di tabel revenue_projects.' },
      { label: 'Realisasi', desc: 'Dari kolom actual_revenue di tabel revenue_projects.' },
    ],
    note: 'Mencakup semua proyek aktif (Active & Completed). Target berbasis nilai kontrak proyek, bukan target bulanan yang diinput.',
  },
  eoy: {
    title: 'Proyeksi End-of-Year (EOY)',
    lines: [
      { label: 'Formula', desc: 'Realisasi YTD ÷ bulan berjalan × 12 — ekstrapolasi linear dari rata-rata bulanan saat ini.' },
      { label: 'Realisasi YTD', desc: 'Total actual_revenue dari revenue_projects untuk proyek aktif tahun ini.' },
      { label: 'Bulan', desc: 'Bulan saat ini (1–12) digunakan sebagai pembagi.' },
    ],
    note: 'Proyeksi bersifat estimasi; tidak memperhitungkan musiman atau pipeline yang belum masuk.',
  },
}

function toggleInfo(key: string) {
  activeInfo.value = activeInfo.value === key ? null : key
}
const loading        = ref(false)
const saving         = ref(false)
const savingOrgs     = ref(false)
const lobs           = ref<string[]>([])
const orgNames       = ref<Record<string, string>>({})
const allOrgs        = ref<{ kode: string; nama: string; selected: boolean }[]>([])
const grid           = ref<Record<number, Record<string, number>>>({})
const summary        = ref<any>(null)
const toast          = reactive({ show: false, msg: '', type: 'success' })

const { post: apiPost } = useApi()
const shareInfo       = reactive({ token: null as string | null, url: null as string | null })
const sharePassword   = ref('')
const generatingShare = ref(false)
const linkCopied      = ref(false)

function achColorPct(pct: number) {
  return pct >= 100 ? 'text-emerald-400' : pct >= 75 ? 'text-yellow-400' : 'text-red-400'
}

function achPct(lobData: any) {
  if (!lobData || !lobData.target) return 0
  return Math.round(lobData.actual / lobData.target * 100)
}

const quarterData = computed(() => {
  const m = summary.value?.monthly ?? []
  const slices = [[0,3],[3,6],[6,9],[9,12]]
  return slices.map((s, i) => {
    const target = m.slice(s[0], s[1]).reduce((acc: number, r: any) => acc + r.total_target, 0)
    const actual = m.slice(s[0], s[1]).reduce((acc: number, r: any) => acc + r.total_actual, 0)
    return { label: `Q${i+1}`, target, actual, ach: target > 0 ? Math.round(actual / target * 100) : 0 }
  })
})

const qMax = computed(() => Math.max(...quarterData.value.map(q => Math.max(q.target, q.actual)), 1))

async function loadShareInfo() {
  const { get: apiGet } = useApi()
  try {
    const res: any = await apiGet('/v1/share-links/annual-target')
    shareInfo.token = res.token
    shareInfo.url   = res.url
  } catch {}
}

async function doGenerateShare() {
  if (sharePassword.value.length < 4) return
  if (shareInfo.url && !confirm('Generate ulang akan menonaktifkan link lama. Lanjutkan?')) return
  generatingShare.value = true
  try {
    const res: any = await apiPost('/v1/share-links/annual-target/generate', { password: sharePassword.value })
    shareInfo.token = res.token
    shareInfo.url   = res.url
    sharePassword.value = ''
    showToast('Share link berhasil dibuat.')
  } catch {
    showToast('Gagal membuat share link.', 'error')
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

function initGrid() {
  const g: Record<number, Record<string, number>> = {}
  for (let m = 1; m <= 12; m++) {
    g[m] = {}
    for (const lob of lobs.value) g[m][lob] = 0
  }
  grid.value = g
}

function formatNum(val: number | undefined) {
  if (!val) return ''
  return Math.round(val).toLocaleString('id-ID')
}

function onGridInput(e: Event, bulan: number, lob: string) {
  const raw = (e.target as HTMLInputElement).value.replace(/\./g, '').replace(/,/g, '')
  const num = parseFloat(raw) || 0
  grid.value[bulan][lob] = num
  ;(e.target as HTMLInputElement).value = num ? Math.round(num).toLocaleString('id-ID') : ''
}

function rowTotal(bulan: number) {
  return lobs.value.reduce((s, lob) => s + (grid.value[bulan]?.[lob] || 0), 0)
}

function colTotal(lob: string) {
  return Array.from({ length: 12 }, (_, i) => i + 1).reduce((s, m) => s + (grid.value[m]?.[lob] || 0), 0)
}

const grandTotal = computed(() => lobs.value.reduce((s, lob) => s + colTotal(lob), 0))

function showToast(msg: string, type = 'success') {
  toast.msg = msg; toast.type = type; toast.show = true
  setTimeout(() => toast.show = false, 3000)
}

async function loadData() {
  loading.value = true
  try {
    const [orgsRes, res, sum] = await Promise.all([
      get(`/v1/annual-targets/orgs?tahun=${selectedYear.value}`),
      get(`/v1/annual-targets?tahun=${selectedYear.value}`),
      get(`/v1/annual-targets/summary?tahun=${selectedYear.value}`),
    ])
    allOrgs.value  = orgsRes.orgs || []
    lobs.value     = res.lobs || []
    orgNames.value = res.org_names || {}
    initGrid()
    for (const [bulan, lobMap] of Object.entries(res.data as Record<string, Record<string, number>>)) {
      for (const [org, val] of Object.entries(lobMap)) {
        if (grid.value[Number(bulan)]) grid.value[Number(bulan)][org] = val
      }
    }
    summary.value = sum
  } catch {
    showToast('Gagal memuat data.', 'error')
  } finally {
    loading.value = false
  }
}

async function saveOrgSelection() {
  savingOrgs.value = true
  try {
    const selected = allOrgs.value.filter(o => o.selected).map(o => o.kode)
    await post('/v1/annual-targets/orgs', { tahun: selectedYear.value, selected })
    showToast('Pilihan organisasi disimpan.')
    await loadData()
  } catch {
    showToast('Gagal menyimpan pilihan.', 'error')
  } finally {
    savingOrgs.value = false
  }
}

async function saveAll() {
  saving.value = true
  try {
    const items: any[] = []
    for (let m = 1; m <= 12; m++) {
      for (const lob of lobs.value) {
        items.push({ bulan: m, organisasi: lob, target_revenue: grid.value[m]?.[lob] || 0 })
      }
    }
    await post('/v1/annual-targets', { tahun: selectedYear.value, items })
    showToast('Target berhasil disimpan.')
    showInputModal.value = false
    const sum = await get(`/v1/annual-targets/summary?tahun=${selectedYear.value}`)
    summary.value = sum
  } catch {
    showToast('Gagal menyimpan target.', 'error')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
  if (isAdmin.value) loadShareInfo()
  document.addEventListener('click', () => { activeInfo.value = null })
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform 0.2s ease; }
.modal-enter-from .relative              { transform: translateY(-16px); }
.modal-leave-to .relative                { transform: translateY(-8px); }
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(8px); }
</style>
