<template>
  <div class="min-h-screen bg-apex-bg text-apex-text">

    <!-- Top Bar -->
    <div class="bg-apex-surface border-b border-apex-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      <div class="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center flex-shrink-0">
        <span class="text-white font-black text-[10px]">APEX</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-apex-text leading-tight">Revenue Dashboard {{ unlocked ? selectedYear : '' }}</div>
        <div class="text-[10px] text-apex-faint">PT. PKP — Read only</div>
      </div>
      <select v-if="unlocked" v-model.number="selectedYear" @change="reloadData"
              class="form-select text-xs w-20 py-1 px-2">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
    </div>

    <!-- Invalid token -->
    <div v-if="tokenInvalid" class="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
      <i class="fa-solid fa-link-slash text-4xl text-red-400 mb-4" />
      <div class="text-lg font-bold mb-2">Link Tidak Valid</div>
      <div class="text-sm text-apex-muted">Link ini sudah kadaluarsa atau tidak ditemukan.</div>
    </div>

    <!-- Password Gate -->
    <div v-else-if="!unlocked" class="flex flex-col items-center justify-center min-h-[80vh] px-6">
      <div class="w-full max-w-sm">
        <div class="text-center mb-8">
          <div class="w-16 h-16 bg-primary-900/40 border border-primary-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-lock text-2xl text-primary-400" />
          </div>
          <div class="text-xl font-bold mb-1">Revenue Dashboard</div>
          <div class="text-sm text-apex-muted">Masukkan password untuk melihat data</div>
        </div>
        <div class="card">
          <form @submit.prevent="verify">
            <label class="form-label">Password</label>
            <input v-model="password" type="password" class="form-input mb-4"
                   placeholder="Masukkan password..." autofocus />
            <div v-if="errMsg" class="text-xs text-red-400 mb-3 flex items-center gap-1.5">
              <i class="fa-solid fa-circle-exclamation" /> {{ errMsg }}
            </div>
            <button type="submit" :disabled="verifying" class="btn-primary w-full justify-center">
              <i :class="verifying ? 'fa-solid fa-spinner fa-spin' : 'fa-solid fa-unlock'" />
              {{ verifying ? 'Memverifikasi...' : 'Masuk' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="dashData" class="max-w-5xl mx-auto px-4 py-6 space-y-5">

      <!-- KPI Strip -->
      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div class="stat-card">
          <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-bullseye" /></div>
          <div>
            <div class="stat-value text-sm text-blue-300">{{ fmt.rupiah(dashData.total_target) }}</div>
            <div class="stat-label">Target YTD</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-amber-900/40 text-amber-400"><i class="fa-solid fa-file-invoice-dollar" /></div>
          <div>
            <div class="stat-value text-sm text-amber-400">{{ fmt.rupiah(dashData.total_billed ?? 0) }}</div>
            <div class="stat-label">Billed</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-green-900/40 text-green-400"><i class="fa-solid fa-coins" /></div>
          <div>
            <div class="stat-value text-sm text-green-400">{{ fmt.rupiah(dashData.total_actual) }}</div>
            <div class="stat-label">Collected</div>
            <div v-if="billedGap > 0" class="text-[10px] text-amber-400 mt-0.5">Gap billed: {{ fmt.rupiah(billedGap) }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-percent" /></div>
          <div>
            <div class="stat-value" :class="dashData.ach_pct >= 80 ? 'text-green-400' : dashData.ach_pct >= 50 ? 'text-yellow-400' : 'text-red-400'">
              {{ dashData.ach_pct }}%
            </div>
            <div class="stat-label">Achievement</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-folder-open" /></div>
          <div>
            <div class="stat-value">{{ dashData.total_projects }}</div>
            <div class="stat-label">Total Proyek</div>
          </div>
        </div>
        <div class="stat-card lg:border-l lg:border-apex-border">
          <div class="stat-icon bg-teal-900/40 text-teal-400"><i class="fa-solid fa-bolt" /></div>
          <div>
            <div class="stat-value text-sm text-teal-400">{{ fmt.rupiah(rtNew?.actual ?? 0) }}</div>
            <div class="stat-label">New Stream</div>
            <div class="text-[10px] text-gray-500 mt-0.5">Ach {{ rtNew?.ach_pct ?? 0 }}% · {{ rtNew?.cnt ?? 0 }} proyek</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-rotate" /></div>
          <div>
            <div class="stat-value text-sm text-emerald-400">{{ fmt.rupiah(rtExisting?.actual ?? 0) }}</div>
            <div class="stat-label">Existing Rev</div>
            <div class="text-[10px] text-gray-500 mt-0.5">Ach {{ rtExisting?.ach_pct ?? 0 }}% · {{ rtExisting?.cnt ?? 0 }} proyek</div>
          </div>
        </div>
      </div>

      <!-- Per Organisasi + Per Kategori & Revenue Type -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
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
            <div v-for="org in dashData.org_breakdown" :key="org.organisasi">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-sm font-medium text-gray-300">{{ org.organisasi || '—' }}</span>
                <span class="text-xs text-gray-500">{{ fmt.rupiah(org.actual) }} / {{ fmt.rupiah(org.target) }}</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill" :class="achBgColor(org.ach)" :style="`width:${Math.min(org.ach,100)}%`" />
              </div>
              <div class="text-xs mt-0.5 text-right"
                :class="org.ach >= 80 ? 'text-green-400' : org.ach >= 50 ? 'text-yellow-400' : 'text-red-400'">
                {{ org.ach }}%
              </div>
            </div>
            <div v-if="!dashData.org_breakdown?.length" class="text-xs text-gray-600 text-center py-4">Tidak ada data</div>
          </div>
        </div>

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
          <div class="space-y-3 mb-4">
            <div v-for="cat in [
              { label: 'Recurring', target: dashData.rec_target, actual: dashData.rec_actual, cls: 'bg-purple-500' },
              { label: 'Project',   target: dashData.prj_target, actual: dashData.prj_actual, cls: 'bg-blue-500' },
            ]" :key="cat.label">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-sm font-medium text-gray-300">{{ cat.label }}</span>
                <span class="text-xs" :class="cat.target ? (cat.actual/cat.target*100 >= 80 ? 'text-green-400' : cat.actual/cat.target*100 >= 50 ? 'text-yellow-400' : 'text-red-400') : 'text-gray-500'">
                  {{ cat.target ? (cat.actual/cat.target*100).toFixed(0) : 0 }}%
                </span>
              </div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden">
                <div class="absolute inset-y-0 left-0 rounded" :class="cat.cls"
                  :style="`width:${cat.target ? Math.min(cat.actual/cat.target*100,100) : 0}%`" />
              </div>
              <div class="flex justify-between text-[11px] text-gray-500 mt-0.5">
                <span>{{ fmt.rupiah(cat.actual) }}</span><span>{{ fmt.rupiah(cat.target) }}</span>
              </div>
            </div>
          </div>
          <div class="border-t border-apex-border/60 mb-3" />
          <div class="space-y-3">
            <div v-for="rt in (dashData.revenue_type_summary ?? [])" :key="rt.revenue_type">
              <div class="flex justify-between items-baseline mb-1">
                <span class="text-sm font-medium" :class="rt.revenue_type === 'New' ? 'text-teal-400' : 'text-emerald-400'">
                  {{ rt.revenue_type === 'New' ? 'New Stream' : 'Existing Rev' }}
                </span>
                <span class="text-xs" :class="rt.ach_pct >= 80 ? 'text-green-400' : rt.ach_pct >= 50 ? 'text-yellow-400' : 'text-red-400'">
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

      <!-- Quarter Trend -->
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
        <div v-if="dashData.quarter_trend?.length">
          <!-- Header row -->
          <div class="grid gap-2 pb-1.5 border-b border-apex-border/60 mb-1"
               style="grid-template-columns: 44px 1fr 1fr 52px 64px;">
            <span class="text-xs text-gray-500">Q</span>
            <span class="text-xs text-gray-500">Collected</span>
            <span class="text-xs text-gray-500">Billed</span>
            <span class="text-xs text-gray-500 text-right">Ach%</span>
            <span class="text-xs text-gray-500 text-right">vs Q sblm</span>
          </div>
          <div v-for="(q, idx) in dashData.quarter_trend" :key="q.quarter"
               class="grid gap-2 py-2 border-b border-apex-border/30 last:border-0 items-center rounded-lg"
               :class="Math.ceil(curMonth / 3) === idx + 1 ? 'bg-blue-900/20 px-2 -mx-2' : ''"
               :style="Math.ceil(curMonth / 3) < idx + 1 ? 'opacity:0.45' : ''"
               style="grid-template-columns: 44px 1fr 1fr 52px 64px;">
            <div>
              <div v-if="Math.ceil(curMonth / 3) === idx + 1" class="text-[10px] text-blue-400 font-medium leading-none mb-0.5">● Berjalan</div>
              <span class="text-sm font-medium" :class="Math.ceil(curMonth / 3) === idx + 1 ? 'text-blue-300' : 'text-gray-300'">{{ q.quarter }}</span>
            </div>
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
            <div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden mb-0.5">
                <div class="absolute inset-y-0 left-0 rounded bg-amber-400"
                     :style="`width:${q.target ? Math.min((q.billed ?? 0) / q.target * 100, 100) : 0}%`" />
              </div>
              <span class="text-[11px] text-amber-400">
                {{ Math.ceil(curMonth / 3) <= idx ? '—' : fmt.rupiah(q.billed ?? 0) }}
              </span>
            </div>
            <div class="text-right">
              <span v-if="Math.ceil(curMonth / 3) <= idx" class="text-xs text-gray-600">—</span>
              <span v-else class="text-xs font-medium"
                    :class="Math.ceil(curMonth / 3) === idx + 1 ? 'text-blue-400' : q.ach >= 100 ? 'text-blue-300' : q.ach >= 80 ? 'text-emerald-400' : q.ach >= 60 ? 'text-yellow-400' : 'text-red-400'">
                {{ q.ach }}%
              </span>
            </div>
            <div class="text-right">
              <template v-if="idx === 0 || Math.ceil(curMonth / 3) <= idx || !dashData.quarter_trend[idx-1].actual">
                <span class="text-xs text-gray-600">—</span>
              </template>
              <template v-else>
                <span class="text-xs" :class="q.ach > dashData.quarter_trend[idx-1].ach ? 'text-emerald-400' : q.ach < dashData.quarter_trend[idx-1].ach ? 'text-red-400' : 'text-gray-500'">
                  {{ q.ach > dashData.quarter_trend[idx-1].ach ? '▲' : q.ach < dashData.quarter_trend[idx-1].ach ? '▼' : '' }}
                  {{ Math.abs(q.ach - dashData.quarter_trend[idx-1].ach).toFixed(0) }}%
                </span>
              </template>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-apex-border/40">
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">YTD Collected</div>
              <div class="text-sm font-medium text-emerald-400 mt-0.5">
                {{ fmt.rupiah(dashData.quarter_trend.filter((_: any, i: number) => i < Math.ceil(curMonth / 3)).reduce((s: number, q: any) => s + q.actual, 0)) }}
              </div>
            </div>
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">YTD Billed</div>
              <div class="text-sm font-medium text-amber-400 mt-0.5">
                {{ fmt.rupiah(dashData.quarter_trend.filter((_: any, i: number) => i < Math.ceil(curMonth / 3)).reduce((s: number, q: any) => s + (q.billed ?? 0), 0)) }}
              </div>
            </div>
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">Avg Ach%</div>
              <div class="text-sm font-medium mt-0.5"
                   :class="(() => { const past = dashData.quarter_trend.filter((_: any, i: number) => i < Math.ceil(curMonth / 3)); const t = past.reduce((s: number, q: any) => s + q.target, 0); const a = past.reduce((s: number, q: any) => s + q.actual, 0); const p = t > 0 ? a/t*100 : 0; return p >= 80 ? 'text-emerald-400' : p >= 60 ? 'text-yellow-400' : 'text-red-400' })()">
                {{ (() => { const past = dashData.quarter_trend.filter((_: any, i: number) => i < Math.ceil(curMonth / 3)); const t = past.reduce((s: number, q: any) => s + q.target, 0); const a = past.reduce((s: number, q: any) => s + q.actual, 0); return t > 0 ? (a/t*100).toFixed(0) + '%' : '0%' })() }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-24 text-gray-600 text-sm">Tidak ada data quarter</div>
      </div>

      <!-- Monthly Trend -->
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
        <div v-if="dashData.monthly_trend?.length">
          <div class="grid gap-2 pb-1.5 border-b border-apex-border/60 mb-1"
               style="grid-template-columns: 56px 1fr 1fr 52px 80px;">
            <span class="text-xs text-gray-500">Bulan</span>
            <span class="text-xs text-gray-500">Collected</span>
            <span class="text-xs text-gray-500">Billed</span>
            <span class="text-xs text-gray-500 text-right">Ach%</span>
            <span class="text-xs text-gray-500 text-right">Status</span>
          </div>
          <div v-for="m in dashData.monthly_trend" :key="m.month_num"
               class="grid gap-2 py-2 border-b border-apex-border/30 last:border-0 items-center rounded-lg"
               :class="m.month_num === curMonth ? 'bg-blue-900/20 px-2 -mx-2' : ''"
               style="grid-template-columns: 56px 1fr 1fr 52px 80px;">
            <div>
              <div v-if="m.month_num === curMonth" class="text-[10px] text-blue-400 font-medium leading-none mb-0.5">● Berjalan</div>
              <span class="text-sm font-medium text-gray-300">{{ m.month_name.slice(0,3) }}</span>
            </div>
            <div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden mb-0.5">
                <div class="absolute inset-y-0 left-0 rounded bg-emerald-500"
                     :style="`width:${m.total_target ? Math.min(m.total_actual/m.total_target*100,100) : 0}%`" />
              </div>
              <span class="text-[11px] text-emerald-400">{{ fmt.rupiah(m.total_actual) }}</span>
            </div>
            <div>
              <div class="relative h-2 bg-apex-card rounded overflow-hidden mb-0.5">
                <div class="absolute inset-y-0 left-0 rounded bg-amber-400"
                     :style="`width:${m.total_target ? Math.min((m.total_billed??0)/m.total_target*100,100) : 0}%`" />
              </div>
              <span class="text-[11px] text-amber-400">{{ fmt.rupiah(m.total_billed ?? 0) }}</span>
            </div>
            <div class="text-right">
              <span class="text-xs font-medium"
                    :class="(() => { const p = m.total_target ? m.total_actual/m.total_target*100 : 0; return p >= 80 ? 'text-emerald-400' : p >= 60 ? 'text-yellow-400' : 'text-red-400' })()">
                {{ m.total_target ? (m.total_actual/m.total_target*100).toFixed(0) : '0' }}%
              </span>
            </div>
            <div class="text-right">
              <template v-if="m.month_num > curMonth">
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-apex-border/40 text-gray-500">Belum</span>
              </template>
              <template v-else>
                <span class="text-[10px] px-1.5 py-0.5 rounded font-medium"
                      :class="(() => { const p = m.total_target ? m.total_actual/m.total_target*100 : 0; if(p>=100) return 'bg-blue-900/50 text-blue-300'; if(p>=80) return 'bg-emerald-900/50 text-emerald-300'; if(p>=60) return 'bg-yellow-900/50 text-yellow-300'; return 'bg-red-900/50 text-red-300' })()">
                  {{ (() => { const p = m.total_target ? m.total_actual/m.total_target*100 : 0; if(p>=100) return 'Exceeded'; if(p>=80) return 'On Track'; if(p>=60) return 'Behind'; return 'Critical' })() }}
                </span>
              </template>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-apex-border/40">
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">YTD Collected</div>
              <div class="text-sm font-medium text-emerald-400 mt-0.5">
                {{ fmt.rupiah(dashData.monthly_trend.filter((m: any) => m.month_num <= curMonth).reduce((s: number, m: any) => s + (m.total_actual||0), 0)) }}
              </div>
            </div>
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">YTD Billed</div>
              <div class="text-sm font-medium text-amber-400 mt-0.5">
                {{ fmt.rupiah(dashData.monthly_trend.filter((m: any) => m.month_num <= curMonth).reduce((s: number, m: any) => s + (m.total_billed||0), 0)) }}
              </div>
            </div>
            <div class="bg-apex-card/60 rounded-lg px-3 py-2">
              <div class="text-[11px] text-gray-500">Avg Ach%</div>
              <div class="text-sm font-medium text-gray-200 mt-0.5">
                {{ (() => { const p = dashData.monthly_trend.filter((m: any) => m.month_num <= curMonth && m.total_target > 0); if(!p.length) return '0%'; return (p.reduce((s: number, m: any) => s + m.total_actual/m.total_target*100, 0)/p.length).toFixed(0) + '%' })() }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center justify-center h-32 text-gray-600 text-sm">Tidak ada data trend</div>
      </div>

      <!-- Footer -->
      <div class="text-center text-[10px] text-gray-600 pt-2">
        APEX — Achievement & Performance Execution Platform<br>
        Data per {{ new Date().toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' }) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const route = useRoute()
const token = route.params.token as string
const fmt   = useFormat()

const curYear = new Date().getFullYear()
const years   = Array.from({ length: 5 }, (_, i) => curYear - 2 + i)
const curMonth = new Date().getMonth() + 1

const tokenInvalid = ref(false)
const unlocked     = ref(false)
const verifying    = ref(false)
const errMsg       = ref('')
const password     = ref('')
const dashData     = ref<any>(null)
const selectedYear = ref(curYear)

const API = useRuntimeConfig().public.apiBase as string

function achBgColor(pct: number) {
  if (pct >= 80) return 'bg-green-500'
  if (pct >= 50) return 'bg-yellow-500'
  return 'bg-red-500'
}

const rtNew      = computed(() => dashData.value?.revenue_type_summary?.find((r: any) => r.revenue_type === 'New'))
const rtExisting = computed(() => dashData.value?.revenue_type_summary?.find((r: any) => r.revenue_type === 'Existing'))
const billedGap  = computed(() => Math.max((dashData.value?.total_billed ?? 0) - (dashData.value?.total_actual ?? 0), 0))

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
function toggleInfo(key: string) { activeInfo.value = activeInfo.value === key ? null : key }
onMounted(() => { document.addEventListener('click', () => { activeInfo.value = null }) })

async function verify() {
  verifying.value = true
  errMsg.value = ''
  try {
    const res = await $fetch<any>(`${API}/v1/public/revenue-dashboard/${token}/verify`, {
      method: 'POST',
      body: { password: password.value, tahun: selectedYear.value },
    })
    if (res.ok) {
      dashData.value = res.data
      unlocked.value = true
    }
  } catch (e: any) {
    errMsg.value = e?.data?.message ?? 'Password salah.'
  } finally {
    verifying.value = false
  }
}

async function reloadData() {
  try {
    const res = await $fetch<any>(`${API}/v1/public/revenue-dashboard/${token}/verify`, {
      method: 'POST',
      body: { password: password.value, tahun: selectedYear.value },
    })
    if (res.ok) dashData.value = res.data
  } catch {}
}

onMounted(async () => {
  try {
    await $fetch(`${API}/v1/public/revenue-dashboard/${token}`)
  } catch {
    tokenInvalid.value = true
  }
})
</script>
