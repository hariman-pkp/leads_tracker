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

      <!-- Summary Cards: 2 kolom mobile, 5 kolom desktop -->
      <div class="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div class="card text-center">
          <div class="text-xs text-gray-400 mb-1">Target Setahun</div>
          <div class="text-lg font-bold text-indigo-400">{{ fmt.rupiah(summary.grand_target) }}</div>
          <div class="text-xs text-gray-500 mt-1">full year {{ selectedYear }}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs text-gray-400 mb-1">Target YTD</div>
          <div class="text-lg font-bold text-blue-400">{{ fmt.rupiah(summary.ytd_target) }}</div>
          <div class="text-xs text-gray-500 mt-1">s/d {{ MONTHS_ID[(summary.cur_month||1)-1] }}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs text-gray-400 mb-1">Realisasi YTD</div>
          <div class="text-lg font-bold text-emerald-400">{{ fmt.rupiah(summary.ytd_actual) }}</div>
          <div class="text-xs text-gray-500 mt-1">dari {{ fmt.rupiah(summary.grand_actual) }}</div>
        </div>
        <div class="card text-center">
          <div class="text-xs text-gray-400 mb-1">Achievement YTD</div>
          <div class="text-lg font-bold" :class="achColor(summary.ytd_ach)">{{ summary.ytd_ach }}%</div>
          <div class="text-xs text-gray-500 mt-1">target full year</div>
        </div>
        <div class="card text-center col-span-2 md:col-span-1">
          <div class="text-xs text-gray-400 mb-1">Gap YTD</div>
          <div class="text-lg font-bold" :class="summary.ytd_gap <= 0 ? 'text-emerald-400' : 'text-red-400'">
            {{ fmt.rupiah(Math.abs(summary.ytd_gap)) }}
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ summary.ytd_gap <= 0 ? 'surplus' : 'belum tercapai' }}</div>
        </div>
      </div>

      <!-- Chart + Tabel Bulanan: di desktop side-by-side -->
      <div class="grid grid-cols-1 md:grid-cols-5 gap-5">

        <!-- Line Chart -->
        <div class="card md:col-span-3">
          <div class="flex justify-between items-center mb-4">
            <div class="section-title mb-0">Target vs Realisasi per Bulan</div>
            <div class="flex items-center gap-4 text-xs text-gray-400">
              <span class="flex items-center gap-1.5">
                <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#818cf8" stroke-width="2" stroke-dasharray="4,3"/></svg>Target
              </span>
              <span class="flex items-center gap-1.5">
                <svg width="24" height="2"><line x1="0" y1="1" x2="24" y2="1" stroke="#34d399" stroke-width="2"/></svg>Realisasi
              </span>
            </div>
          </div>
          <svg v-if="linePoints.length" :viewBox="`0 0 ${svgW} ${svgH}`" class="w-full" :style="`height:${svgH}px`" preserveAspectRatio="none">
            <defs>
              <linearGradient id="shGradAch" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#34d399" stop-opacity="0.22"/>
                <stop offset="100%" stop-color="#34d399" stop-opacity="0.01"/>
              </linearGradient>
              <linearGradient id="shGradTarget" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#818cf8" stop-opacity="0.10"/>
                <stop offset="100%" stop-color="#818cf8" stop-opacity="0"/>
              </linearGradient>
            </defs>
            <line v-for="i in 4" :key="'h'+i"
              :x1="padL" :y1="padT + (svgH - padT - padB) * i / 4"
              :x2="svgW - padR" :y2="padT + (svgH - padT - padB) * i / 4"
              stroke="#1e3a5f" stroke-width="0.5"/>
            <text v-for="i in 5" :key="'yl'+i"
              :x="padL - 6" :y="padT + (svgH - padT - padB) * (i-1) / 4 + 4"
              text-anchor="end" fill="#475569" font-size="10">
              {{ fmt.rupiah(yMax - yMax * (i-1) / 4) }}
            </text>
            <path :d="atTargetFill" fill="url(#shGradTarget)"/>
            <path :d="atActualFill" fill="url(#shGradAch)"/>
            <path :d="atTargetLine" fill="none" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="5,4"/>
            <path :d="atActualLine" fill="none" stroke="#34d399" stroke-width="2.5"/>
            <circle v-for="p in linePoints" :key="'t'+p.label" :cx="p.x" :cy="p.ty" r="2.5" fill="#818cf8"/>
            <circle v-for="p in linePoints" :key="'a'+p.label" :cx="p.x" :cy="p.ay" r="4" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
            <text v-for="p in linePoints" :key="'xl'+p.label"
              :x="p.x" :y="svgH - 4" text-anchor="middle" fill="#475569" font-size="10">{{ p.label }}</text>
          </svg>
          <div v-else class="flex items-center justify-center h-40 text-gray-500 text-sm">Belum ada data</div>
        </div>

        <!-- Tabel Bulanan -->
        <div class="card p-0 overflow-hidden md:col-span-2">
          <div class="px-4 py-3 border-b border-apex-border">
            <div class="section-title mb-0">Detail Bulanan</div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-apex-border bg-apex-card/40">
                  <th class="text-left py-2 px-3 text-gray-400 font-medium">Bulan</th>
                  <th class="text-right py-2 px-3 text-gray-400 font-medium">Target</th>
                  <th class="text-right py-2 px-3 text-gray-400 font-medium">Realisasi</th>
                  <th class="text-right py-2 px-3 text-gray-400 font-medium">Ach%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in summary.monthly" :key="m.bulan"
                    class="border-b border-apex-border/40"
                    :class="m.bulan === summary.cur_month ? 'bg-primary-900/20' : ''">
                  <td class="py-1.5 px-3 font-medium text-gray-300">
                    {{ m.bulan_nama.slice(0,3) }}
                    <span v-if="m.bulan === summary.cur_month" class="text-[8px] text-primary-400 ml-0.5">●</span>
                  </td>
                  <td class="py-1.5 px-3 text-right text-blue-300">{{ fmt.rupiah(m.total_target) }}</td>
                  <td class="py-1.5 px-3 text-right text-emerald-400">{{ fmt.rupiah(m.total_actual) }}</td>
                  <td class="py-1.5 px-3 text-right">
                    <span :class="achClassNum(m.total_actual, m.total_target)">
                      {{ m.total_target > 0 ? Math.round(m.total_actual / m.total_target * 100) : 0 }}%
                    </span>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t-2 border-apex-border bg-apex-card/60 font-semibold">
                  <td class="py-2 px-3 text-gray-300">Total</td>
                  <td class="py-2 px-3 text-right text-blue-300">{{ fmt.rupiah(summary.grand_target) }}</td>
                  <td class="py-2 px-3 text-right text-emerald-400">{{ fmt.rupiah(summary.grand_actual) }}</td>
                  <td class="py-2 px-3 text-right">
                    <span :class="achClassNum(summary.grand_actual, summary.grand_target)">
                      {{ summary.grand_target > 0 ? Math.round(summary.grand_actual / summary.grand_target * 100) : 0 }}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      <!-- LOB + Kategori: di desktop side-by-side -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <!-- Realisasi vs Target per LOB -->
        <div v-if="summary.lobs?.length" class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-apex-border">
            <div class="section-title mb-0">Realisasi vs Target per LOB</div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-apex-border">
                  <th class="text-left py-2 px-3 text-gray-400">LOB</th>
                  <th class="text-right py-2 px-3 text-gray-400">Target</th>
                  <th class="text-right py-2 px-3 text-gray-400">Realisasi</th>
                  <th class="text-right py-2 px-3 text-gray-400">Ach%</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lob in summary.lobs" :key="lob" class="border-b border-apex-border/40 hover:bg-apex-card/40">
                  <td class="py-2 px-3">
                    <div class="font-medium text-gray-300">{{ summary.org_names?.[lob] || lob }}</div>
                    <div class="text-xs text-gray-500">{{ lob }}</div>
                  </td>
                  <td class="py-2 px-3 text-right text-blue-300">{{ fmt.rupiah(summary.lob_summary[lob]?.target || 0) }}</td>
                  <td class="py-2 px-3 text-right text-emerald-400">{{ fmt.rupiah(summary.lob_summary[lob]?.actual || 0) }}</td>
                  <td class="py-2 px-3 text-right">
                    <span :class="achClassNum(summary.lob_summary[lob]?.actual||0, summary.lob_summary[lob]?.target||0)">
                      {{ summary.lob_summary[lob]?.target > 0 ? Math.round((summary.lob_summary[lob]?.actual||0) / summary.lob_summary[lob].target * 100) : 0 }}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Realisasi vs Target per Kategori -->
        <div v-if="summary.kategori_summary?.length" class="card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-apex-border">
            <div class="section-title mb-0">Realisasi vs Target per Kategori</div>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-apex-border">
                  <th class="text-left py-2 px-3 text-gray-400">Kategori</th>
                  <th class="text-right py-2 px-3 text-gray-400">Target</th>
                  <th class="text-right py-2 px-3 text-gray-400">Realisasi</th>
                  <th class="text-right py-2 px-3 text-gray-400">Ach%</th>
                  <th class="text-right py-2 px-3 text-gray-400">Gap</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="k in summary.kategori_summary" :key="k.kategori" class="border-b border-apex-border/40 hover:bg-apex-card/40">
                  <td class="py-2 px-3">
                    <span :class="k.kategori === 'Project' ? 'badge-blue' : k.kategori === 'Recurring' ? 'badge-purple' : 'badge-gray'">
                      {{ k.kategori }}
                    </span>
                  </td>
                  <td class="py-2 px-3 text-right text-blue-300">{{ fmt.rupiah(k.target) }}</td>
                  <td class="py-2 px-3 text-right text-emerald-400">{{ fmt.rupiah(k.actual) }}</td>
                  <td class="py-2 px-3 text-right">
                    <span :class="achClassNum(k.actual, k.target)">
                      {{ k.target > 0 ? (k.actual / k.target * 100).toFixed(1) : '0.0' }}%
                    </span>
                  </td>
                  <td class="py-2 px-3 text-right" :class="(k.target - k.actual) <= 0 ? 'text-emerald-400' : 'text-red-400'">
                    {{ fmt.rupiah(Math.abs(k.target - k.actual)) }}
                  </td>
                </tr>
              </tbody>
            </table>
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

// ── Line Chart ────────────────────────────────────────────────────────────
const svgW = 360; const svgH = 180
const padL = 56;  const padR = 8; const padT = 16; const padB = 20

const yMax = computed(() => {
  const pts = summary.value?.monthly ?? []
  return Math.max(...pts.map((m: any) => Math.max(m.total_target, m.total_actual)), 1) * 1.1
})

const linePoints = computed(() => {
  const pts = summary.value?.monthly ?? []
  if (!pts.length) return []
  const h = svgH - padT - padB
  const areaW = svgW - padL - padR
  const max = yMax.value || 1
  return pts.map((m: any, i: number) => ({
    label: m.bulan_nama.slice(0, 3),
    x:  padL + areaW * i / (pts.length - 1),
    ty: padT + h * (1 - m.total_target / max),
    ay: padT + h * (1 - m.total_actual / max),
  }))
})

function smoothLine(pts: {x: number, y: number}[]): string {
  if (!pts.length) return ''
  if (pts.length === 1) return `M${pts[0].x},${pts[0].y}`
  const t = 0.4
  let d = `M${pts[0].x},${pts[0].y}`
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[i - 2] ?? pts[i - 1]
    const p1 = pts[i - 1]; const p2 = pts[i]; const p3 = pts[i + 1] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) * t / 2; const cp1y = p1.y + (p2.y - p0.y) * t / 2
    const cp2x = p2.x - (p3.x - p1.x) * t / 2; const cp2y = p2.y - (p3.y - p1.y) * t / 2
    d += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }
  return d
}

const atTargetLine = computed(() => smoothLine(linePoints.value.map(p => ({ x: p.x, y: p.ty }))))
const atActualLine = computed(() => smoothLine(linePoints.value.map(p => ({ x: p.x, y: p.ay }))))

const atTargetFill = computed(() => {
  const pts = linePoints.value; if (!pts.length) return ''
  const base = padT + (svgH - padT - padB)
  return `${atTargetLine.value} L${pts[pts.length-1].x},${base} L${pts[0].x},${base} Z`
})
const atActualFill = computed(() => {
  const pts = linePoints.value; if (!pts.length) return ''
  const base = padT + (svgH - padT - padB)
  return `${atActualLine.value} L${pts[pts.length-1].x},${base} L${pts[0].x},${base} Z`
})

onMounted(checkToken)
</script>
