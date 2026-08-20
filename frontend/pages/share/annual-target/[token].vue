<template>
  <div class="min-h-screen bg-apex-bg text-apex-text">

    <!-- Top Bar -->
    <div class="bg-apex-surface border-b border-apex-border px-4 py-3 flex items-center gap-3 sticky top-0 z-10">
      <div class="w-7 h-7 bg-primary-600 rounded-md flex items-center justify-center flex-shrink-0">
        <span class="text-white font-black text-[10px]">APEX</span>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-sm font-bold text-apex-text leading-tight">Annual Target {{ unlocked ? selectedYear : '' }}</div>
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
          <div class="text-xl font-bold mb-1">Annual Target</div>
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

    <!-- Data View -->
    <div v-else-if="summary" class="max-w-5xl mx-auto px-4 py-5 space-y-5 pb-10">

      <!-- KPI Strip -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
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
          <div class="text-lg font-bold" :class="achColor(summary.ytd_ach)">{{ summary.ytd_ach }}%</div>
          <div class="text-xs text-gray-500 mt-1">vs target YTD</div>
        </div>
        <div class="card text-center">
          <div class="text-xs text-gray-400 mb-1">Sisa Target</div>
          <div class="text-lg font-bold" :class="summary.sisa_target <= 0 ? 'text-emerald-400' : 'text-red-400'">
            {{ fmt.rupiah(summary.sisa_target) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ summary.sisa_target <= 0 ? '✓ target tercapai' : 'untuk capai target tahunan' }}</div>
        </div>
        <div class="card text-center col-span-2 md:col-span-1 relative">
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
          <div class="text-lg font-bold" :class="achColor(summary.grand_target > 0 ? summary.proyeksi_eoy / summary.grand_target * 100 : 0)">
            {{ fmt.rupiah(summary.proyeksi_eoy) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">
            {{ summary.proyeksi_eoy >= summary.grand_target ? '✓ on track' : (summary.grand_target > 0 ? (summary.proyeksi_eoy / summary.grand_target * 100).toFixed(1) + '% dari target' : '—') }}
          </div>
        </div>
      </div>

      <!-- Progress Bar Tahunan -->
      <div class="card">
        <div class="flex items-center justify-between mb-3">
          <div class="section-title mb-0">Progress Tahunan {{ selectedYear }}</div>
          <span class="text-sm font-bold" :class="achColor(summary.grand_target > 0 ? summary.ytd_actual / summary.grand_target * 100 : 0)">
            {{ summary.grand_target > 0 ? (summary.ytd_actual / summary.grand_target * 100).toFixed(1) : '0.0' }}% dari target tahunan
          </span>
        </div>
        <div class="relative h-7 bg-navy-700 rounded-full overflow-hidden mb-3">
          <div class="absolute inset-y-0 left-0 rounded-full transition-all"
               :class="summary.ytd_ach >= 100 ? 'bg-emerald-500' : summary.ytd_ach >= 75 ? 'bg-yellow-500' : 'bg-red-500'"
               :style="`width:${Math.min(summary.grand_target > 0 ? summary.ytd_actual / summary.grand_target * 100 : 0, 100)}%`" />
          <div class="absolute inset-y-0 w-0.5 bg-indigo-400 opacity-70"
               :style="`left:${Math.min(summary.grand_target > 0 ? summary.ytd_target / summary.grand_target * 100 : 0, 100)}%`" />
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <!-- Per Quarter -->
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title mb-0">Realisasi vs Target per Quarter</div>
            <div class="relative">
              <button @click.stop="toggleInfo('quarter')" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'quarter'" @click.stop class="absolute right-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
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
              <div class="w-14 text-right text-xs font-bold flex-shrink-0" :class="achColor(q.ach)">{{ q.ach }}%</div>
              <div class="w-28 text-right text-xs text-gray-400 hidden sm:block flex-shrink-0">{{ fmt.rupiah(q.actual) }}</div>
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
              <button @click.stop="toggleInfo('lob')" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'lob'" @click.stop class="absolute right-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
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
                <div class="text-xs font-bold" :class="achColor(lobAch(lob))">{{ lobAch(lob) }}%</div>
              </div>
              <div class="relative h-4 bg-navy-700 rounded overflow-hidden">
                <div class="absolute inset-y-0 left-0 rounded transition-all"
                     :class="lobAch(lob) >= 100 ? 'bg-emerald-500' : lobAch(lob) >= 75 ? 'bg-yellow-500' : 'bg-red-500'"
                     :style="`width:${Math.min(lobAch(lob), 100)}%`" />
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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <!-- New vs Existing -->
        <div v-if="revenueTypeSummary.length" class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title mb-0">New Revenue Stream vs Existing Revenue</div>
            <div class="relative">
              <button @click.stop="toggleInfo('revenue_type')" class="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-blue-400 transition-colors">
                <i class="fa-solid fa-circle-info text-sm" />
              </button>
              <div v-if="activeInfo === 'revenue_type'" @click.stop class="absolute right-0 top-7 z-30 w-72 bg-apex-card border border-apex-border rounded-xl shadow-lg p-4">
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
          <div class="space-y-4">
            <div v-for="ct in revenueTypeSummary" :key="ct.revenue_type">
              <div class="flex items-center justify-between mb-1">
                <span :class="ct.revenue_type === 'New' ? 'badge-blue' : 'badge-purple'">
                  {{ ct.revenue_type === 'New' ? 'New Revenue Stream' : 'Existing Revenue' }}
                </span>
                <span class="text-xs font-bold" :class="achColor(ct.target > 0 ? ct.actual / ct.target * 100 : 0)">
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
            <!-- Komposisi -->
            <div v-if="revenueTypeSummary.length >= 2" class="pt-3 border-t border-apex-border">
              <div class="text-xs text-gray-500 mb-2">Komposisi Target</div>
              <div class="h-3 rounded overflow-hidden flex">
                <div v-for="ct in revenueTypeSummary" :key="ct.revenue_type"
                     class="h-full"
                     :class="ct.revenue_type === 'New' ? 'bg-blue-500' : 'bg-purple-500'"
                     :style="`width:${totalRtTarget > 0 ? ct.target / totalRtTarget * 100 : 0}%`" />
              </div>
              <div class="flex justify-between mt-1.5">
                <div v-for="ct in revenueTypeSummary" :key="ct.revenue_type" class="text-xs text-gray-500">
                  <span :class="ct.revenue_type === 'New' ? 'text-blue-400' : 'text-purple-400'">●</span>
                  {{ ct.revenue_type === 'New' ? 'New' : 'Existing' }}
                  {{ totalRtTarget > 0 ? (ct.target / totalRtTarget * 100).toFixed(1) : 0 }}%
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Per Kategori -->
        <div v-if="summary.kategori_summary?.length" class="card">
          <div class="flex items-center justify-between mb-4">
            <div class="section-title mb-0">Realisasi vs Target per Kategori</div>
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
          <div class="space-y-4">
            <div v-for="k in summary.kategori_summary" :key="k.kategori">
              <div class="flex items-center justify-between mb-1">
                <span :class="k.kategori === 'Project' ? 'badge-blue' : k.kategori === 'Recurring' ? 'badge-purple' : 'badge-gray'">
                  {{ k.kategori }}
                </span>
                <span class="text-xs font-bold" :class="achClassNum(k.actual, k.target)">
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
        </div>
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

const MONTHS_ID = ['Januari','Februari','Maret','April','Mei','Juni',
                   'Juli','Agustus','September','Oktober','November','Desember']
const curYear   = new Date().getFullYear()
const years     = Array.from({ length: 5 }, (_, i) => curYear - 2 + i)

const tokenInvalid = ref(false)
const unlocked     = ref(false)
const verifying    = ref(false)
const password     = ref('')
const errMsg       = ref('')
const summary      = ref<any>(null)
const selectedYear = ref(curYear)

async function checkToken() {
  try {
    await $fetch(`/api-proxy/v1/public/annual-target/${token}`)
  } catch {
    tokenInvalid.value = true
  }
}

async function verify() {
  if (!password.value) return
  verifying.value = true
  errMsg.value = ''
  try {
    const res: any = await $fetch(`/api-proxy/v1/public/annual-target/${token}/verify`, {
      method: 'POST',
      body: { password: password.value, tahun: selectedYear.value },
    })
    summary.value  = res.summary
    unlocked.value = true
  } catch (e: any) {
    errMsg.value = e?.data?.message || 'Password salah.'
  } finally {
    verifying.value = false
  }
}

async function reloadData() {
  try {
    const res: any = await $fetch(`/api-proxy/v1/public/annual-target/${token}/verify`, {
      method: 'POST',
      body: { password: password.value, tahun: selectedYear.value },
    })
    summary.value = res.summary
  } catch {}
}

function achClassNum(actual: number, target: number) {
  if (!target) return 'text-gray-500'
  const pct = actual / target * 100
  return pct >= 100 ? 'text-emerald-400' : pct >= 75 ? 'text-yellow-400' : 'text-red-400'
}

function achColor(pct: number) {
  return pct >= 100 ? 'text-emerald-400' : pct >= 75 ? 'text-yellow-400' : 'text-red-400'
}

function lobAch(lob: string): number {
  const d = summary.value?.lob_summary?.[lob]
  if (!d || !d.target) return 0
  return Math.round(d.actual / d.target * 100)
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

const revenueTypeSummary = computed(() => {
  const rows: any[] = summary.value?.revenue_type_summary ?? []
  return ['Existing', 'New'].map(rt => rows.find((r: any) => r.revenue_type === rt)).filter(Boolean)
})

const totalRtTarget = computed(() =>
  revenueTypeSummary.value.reduce((s: number, r: any) => s + r.target, 0)
)

const activeInfo = ref<string | null>(null)
const infoContent: Record<string, { title: string; lines: { label: string; desc: string }[]; note?: string }> = {
  quarter: {
    title: 'Realisasi vs Target per Quarter',
    lines: [
      { label: 'Target', desc: 'Dari tabel annual_targets — diinput manual per organisasi/bulan.' },
      { label: 'Realisasi', desc: 'Dari revenue_monthly (billing per proyek per bulan), hanya untuk LOB yang terkonfigurasi.' },
    ],
    note: 'Hanya mencakup LOB yang sudah didaftarkan di pengaturan Annual Target.',
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
    note: 'Mencakup semua proyek aktif (Active & Completed). Proyek tanpa revenue_type dianggap "Existing".',
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
function toggleInfo(key: string) { activeInfo.value = activeInfo.value === key ? null : key }

onMounted(() => {
  checkToken()
  document.addEventListener('click', () => { activeInfo.value = null })
})
</script>
