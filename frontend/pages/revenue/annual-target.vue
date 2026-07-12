<template>
  <div class="min-h-screen bg-apex-bg text-apex-text p-6">

    <!-- Header -->
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 class="text-2xl font-bold text-apex-text">
          <i class="fa-solid fa-flag-checkered text-primary-400 mr-2" />Annual Target
        </h1>
        <p class="text-sm text-apex-muted mt-0.5">Target revenue per bulan per organisasi tahun {{ selectedYear }}</p>
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

    <!-- Summary Cards -->
    <div v-if="summary" class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
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
        <div class="text-xs text-gray-500 mt-1">dari total {{ fmt.rupiah(summary.grand_actual) }}</div>
      </div>
      <div class="card text-center">
        <div class="text-xs text-gray-400 mb-1">Achievement YTD</div>
        <div class="text-lg font-bold" :class="summary.ytd_ach >= 100 ? 'text-emerald-400' : summary.ytd_ach >= 75 ? 'text-yellow-400' : 'text-red-400'">
          {{ summary.ytd_ach }}%
        </div>
        <div class="text-xs text-gray-500 mt-1">target full year {{ fmt.rupiah(summary.grand_target) }}</div>
      </div>
      <div class="card text-center">
        <div class="text-xs text-gray-400 mb-1">Gap YTD</div>
        <div class="text-lg font-bold" :class="summary.ytd_gap <= 0 ? 'text-emerald-400' : 'text-red-400'">
          {{ fmt.rupiah(Math.abs(summary.ytd_gap)) }}
        </div>
        <div class="text-xs text-gray-500 mt-1">{{ summary.ytd_gap <= 0 ? 'surplus' : 'belum tercapai' }}</div>
      </div>
    </div>

    <!-- Modal Input Target -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showInputModal" class="fixed inset-0 z-50 flex items-start justify-center pt-10 px-4 pb-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showInputModal = false" />
          <div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">

            <!-- Modal Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-apex-border flex-shrink-0">
              <div>
                <h2 class="text-lg font-bold text-apex-text">Input Target Revenue {{ selectedYear }}</h2>
                <p class="text-xs text-apex-muted mt-0.5">Pilih organisasi dan isi target per bulan</p>
              </div>
              <button @click="showInputModal = false" class="btn-ghost btn-sm rounded-lg text-gray-400 hover:text-white">
                <i class="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <!-- Modal Body -->
            <div class="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              <!-- Pilih Organisasi -->
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

              <!-- Grid Entry Target -->
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

            <!-- Modal Footer -->
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

    <!-- Charts -->
    <div v-if="summary?.monthly" class="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-6">

      <!-- Line Chart Monthly -->
      <div class="card lg:col-span-2">
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
            <linearGradient id="atGradAch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#34d399" stop-opacity="0.22"/>
              <stop offset="100%" stop-color="#34d399" stop-opacity="0.01"/>
            </linearGradient>
            <linearGradient id="atGradTarget" x1="0" y1="0" x2="0" y2="1">
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
          <path :d="atTargetFill" fill="url(#atGradTarget)"/>
          <path :d="atActualFill" fill="url(#atGradAch)"/>
          <path :d="atTargetLine" fill="none" stroke="#818cf8" stroke-width="1.5" stroke-dasharray="5,4"/>
          <path :d="atActualLine" fill="none" stroke="#34d399" stroke-width="2.5"/>
          <circle v-for="p in linePoints" :key="'t'+p.label" :cx="p.x" :cy="p.ty" r="2.5" fill="#818cf8"/>
          <circle v-for="p in linePoints" :key="'a'+p.label" :cx="p.x" :cy="p.ay" r="4" fill="#0f172a" stroke="#34d399" stroke-width="2"/>
          <text v-for="p in linePoints" :key="'xl'+p.label"
            :x="p.x" :y="svgH - 4" text-anchor="middle" fill="#475569" font-size="10">{{ p.label }}</text>
        </svg>
        <div v-else class="flex items-center justify-center h-40 text-gray-500 text-sm">Belum ada data</div>
      </div>

      <!-- Bar Chart Quarterly -->
      <div class="card">
        <div class="flex justify-between items-center mb-4">
          <div class="section-title mb-0">Target vs Realisasi per Quarter</div>
          <div class="flex items-center gap-3 text-xs text-gray-400">
            <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded-sm bg-indigo-400 opacity-60"></span>Target</span>
            <span class="flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded-sm bg-emerald-400"></span>Realisasi</span>
          </div>
        </div>
        <svg v-if="qtrPoints.length" :viewBox="`0 0 ${qsvgW} ${qsvgH}`" class="w-full" :style="`height:${qsvgH}px`" preserveAspectRatio="none">
          <line v-for="i in 4" :key="'qh'+i"
            :x1="qpadL" :y1="qpadT + (qsvgH - qpadT - qpadB) * i / 4"
            :x2="qsvgW - qpadR" :y2="qpadT + (qsvgH - qpadT - qpadB) * i / 4"
            stroke="#1e3a5f" stroke-width="0.5"/>
          <text v-for="i in 5" :key="'qyl'+i"
            :x="qpadL - 6" :y="qpadT + (qsvgH - qpadT - qpadB) * (i-1) / 4 + 4"
            text-anchor="end" fill="#475569" font-size="11">
            {{ fmt.rupiah(qyMax - qyMax * (i-1) / 4) }}
          </text>
          <g v-for="p in qtrPoints" :key="p.label">
            <rect :x="p.tx" :y="p.ty" :width="qBarW" :height="p.th" fill="#818cf8" opacity="0.35" rx="2"/>
            <rect :x="p.ax" :y="p.ay" :width="qBarW" :height="p.ah" fill="#34d399" opacity="0.9" rx="2"/>
            <text :x="p.ax + qBarW / 2" :y="Math.max(p.ay - 4, qpadT + 10)"
              text-anchor="middle" fill="#34d399" font-size="10" font-weight="bold">{{ p.ach }}%</text>
            <text :x="p.cx" :y="qsvgH - 4"
              text-anchor="middle" fill="#475569" font-size="11" font-weight="bold">{{ p.label }}</text>
          </g>
        </svg>
        <div v-else class="flex items-center justify-center h-40 text-gray-500 text-sm">Belum ada data</div>
      </div>
    </div>

    <!-- Realisasi vs Target: LOB + Kategori dalam 1 baris -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">

    <!-- Tabel Realisasi vs Target per LOB -->
    <div v-if="summary && summary.lob_summary" class="card overflow-x-auto">
      <div class="section-title mb-4">Realisasi vs Target per LOB</div>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-apex-border">
            <th class="text-left py-2 px-3 text-gray-400">LOB</th>
            <th class="text-right py-2 px-3 text-gray-400">Target</th>
            <th class="text-right py-2 px-3 text-gray-400">Realisasi</th>
            <th class="text-right py-2 px-3 text-gray-400">Achievement</th>
            <th class="text-right py-2 px-3 text-gray-400">Gap</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lob in summary.lobs" :key="lob"
              class="border-b border-apex-border/40 hover:bg-apex-card/40">
            <td class="py-2 px-3">
              <div class="font-medium text-gray-300">{{ summary.org_names?.[lob] || lob }}</div>
              <div class="text-xs text-gray-500">{{ lob }}</div>
            </td>
            <td class="py-2 px-3 text-right text-blue-300">{{ fmt.rupiah(summary.lob_summary[lob]?.target || 0) }}</td>
            <td class="py-2 px-3 text-right text-emerald-400">{{ fmt.rupiah(summary.lob_summary[lob]?.actual || 0) }}</td>
            <td class="py-2 px-3 text-right">
              <span :class="achClass(summary.lob_summary[lob])">
                {{ achPct(summary.lob_summary[lob]) }}%
              </span>
            </td>
            <td class="py-2 px-3 text-right text-red-400">
              {{ fmt.rupiah((summary.lob_summary[lob]?.target || 0) - (summary.lob_summary[lob]?.actual || 0)) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Realisasi vs Target per Kategori -->
    <div v-if="summary?.kategori_summary?.length" class="card overflow-x-auto">
      <div class="section-title mb-4">Realisasi vs Target per Kategori</div>
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-apex-border">
            <th class="text-left py-2 px-3 text-gray-400">Kategori</th>
            <th class="text-right py-2 px-3 text-gray-400">Target</th>
            <th class="text-right py-2 px-3 text-gray-400">Realisasi</th>
            <th class="text-right py-2 px-3 text-gray-400">Achievement</th>
            <th class="text-right py-2 px-3 text-gray-400">Gap</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="k in summary.kategori_summary" :key="k.kategori"
              class="border-b border-apex-border/40 hover:bg-apex-card/40">
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
              <span class="text-xs ml-1">{{ (k.target - k.actual) <= 0 ? '▲' : '▼' }}</span>
            </td>
          </tr>
          <!-- Total row -->
          <tr class="border-t-2 border-apex-border bg-apex-card/60 font-semibold text-sm">
            <td class="py-2 px-3 text-gray-300">Total</td>
            <td class="py-2 px-3 text-right text-blue-300">
              {{ fmt.rupiah(summary.kategori_summary.reduce((s: number, k: any) => s + k.target, 0)) }}
            </td>
            <td class="py-2 px-3 text-right text-emerald-400">
              {{ fmt.rupiah(summary.kategori_summary.reduce((s: number, k: any) => s + k.actual, 0)) }}
            </td>
            <td class="py-2 px-3 text-right">
              <span :class="achClassNum(
                summary.kategori_summary.reduce((s: number, k: any) => s + k.actual, 0),
                summary.kategori_summary.reduce((s: number, k: any) => s + k.target, 0)
              )">
                {{
                  (() => {
                    const t = summary.kategori_summary.reduce((s: number, k: any) => s + k.target, 0)
                    const a = summary.kategori_summary.reduce((s: number, k: any) => s + k.actual, 0)
                    return t > 0 ? (a / t * 100).toFixed(1) : '0.0'
                  })()
                }}%
              </span>
            </td>
            <td class="py-2 px-3 text-right">
              {{
                (() => {
                  const t = summary.kategori_summary.reduce((s: number, k: any) => s + k.target, 0)
                  const a = summary.kategori_summary.reduce((s: number, k: any) => s + k.actual, 0)
                  return fmt.rupiah(Math.abs(t - a))
                })()
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    </div><!-- end grid LOB + Kategori -->

    <!-- Chart Target vs Realisasi bulanan -->
    <div v-if="summary?.monthly" class="card mt-6">
      <div class="section-title mb-4">Target vs Realisasi Bulanan</div>
      <div class="overflow-x-auto">
        <table class="w-full text-xs">
          <thead>
            <tr class="border-b border-apex-border">
              <th class="text-left py-2 px-2 text-gray-400 w-20">Bulan</th>
              <th class="text-right py-2 px-2 text-gray-400">Target</th>
              <th class="text-right py-2 px-2 text-gray-400">Realisasi</th>
              <th class="text-right py-2 px-2 text-gray-400">Ach%</th>
              <th class="py-2 px-2 text-gray-400 min-w-[160px]">Progress</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in summary.monthly" :key="m.bulan"
                class="border-b border-apex-border/40 hover:bg-apex-card/40">
              <td class="py-1.5 px-2 font-medium text-gray-300">{{ m.bulan_nama }}</td>
              <td class="py-1.5 px-2 text-right text-blue-300">{{ fmt.rupiah(m.total_target) }}</td>
              <td class="py-1.5 px-2 text-right text-emerald-400">{{ fmt.rupiah(m.total_actual) }}</td>
              <td class="py-1.5 px-2 text-right">
                <span :class="achClassNum(m.total_actual, m.total_target)">
                  {{ m.total_target > 0 ? Math.round(m.total_actual / m.total_target * 100) : 0 }}%
                </span>
              </td>
              <td class="py-1.5 px-2">
                <div class="h-2 bg-navy-700 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all"
                       :class="m.total_actual >= m.total_target ? 'bg-emerald-500' : m.total_actual >= m.total_target * 0.75 ? 'bg-yellow-500' : 'bg-red-500'"
                       :style="`width:${Math.min(m.total_target > 0 ? m.total_actual / m.total_target * 100 : 0, 100)}%`" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

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
              <p class="text-sm text-apex-muted">
                Buat link publik yang dapat diakses tanpa login, dilindungi password.
              </p>

              <!-- Current link -->
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
                <input v-model="sharePassword" type="text" class="form-input"
                       placeholder="Minimal 4 karakter..." />
              </div>
            </div>
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-apex-border">
              <button @click="showShareModal = false" class="btn-secondary text-sm">Tutup</button>
              <button @click="doGenerateShare" :disabled="generatingShare || sharePassword.length < 4"
                      class="btn-primary text-sm">
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

const selectedYear = ref(curYear)
const showInputModal = ref(false)
const showShareModal = ref(false)
const loading        = ref(false)
const saving         = ref(false)
const savingOrgs     = ref(false)
const lobs         = ref<string[]>([])
const orgNames     = ref<Record<string, string>>({})
const allOrgs      = ref<{ kode: string; nama: string; selected: boolean }[]>([])
const grid         = ref<Record<number, Record<string, number>>>({})
const summary      = ref<any>(null)
const toast        = reactive({ show: false, msg: '', type: 'success' })

// Share link
const { post: apiPost } = useApi()
const shareInfo      = reactive({ token: null as string | null, url: null as string | null })
const sharePassword  = ref('')
const generatingShare = ref(false)
const linkCopied     = ref(false)

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
    generatingShare.value = false }
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
  // Update tampilan dengan separator
  ;(e.target as HTMLInputElement).value = num ? Math.round(num).toLocaleString('id-ID') : ''
}

function rowTotal(bulan: number) {
  return lobs.value.reduce((s, lob) => s + (grid.value[bulan]?.[lob] || 0), 0)
}

function colTotal(lob: string) {
  return Array.from({ length: 12 }, (_, i) => i + 1).reduce((s, m) => s + (grid.value[m]?.[lob] || 0), 0)
}

const grandTotal = computed(() => lobs.value.reduce((s, lob) => s + colTotal(lob), 0))

function achPct(lobData: any) {
  if (!lobData || !lobData.target) return 0
  return Math.round(lobData.actual / lobData.target * 100)
}

function achClass(lobData: any) {
  const pct = achPct(lobData)
  return pct >= 100 ? 'text-emerald-400' : pct >= 75 ? 'text-yellow-400' : 'text-red-400'
}

function achClassNum(actual: number, target: number) {
  if (!target) return 'text-gray-500'
  const pct = actual / target * 100
  return pct >= 100 ? 'text-emerald-400' : pct >= 75 ? 'text-yellow-400' : 'text-red-400'
}

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

// ── Line Chart Monthly ────────────────────────────────────────────────────────
const svgW = 700; const svgH = 220
const padL = 72;  const padR = 16; const padT = 20; const padB = 24

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

// ── Bar Chart Quarterly ───────────────────────────────────────────────────────
const qsvgW = 400; const qsvgH = 220
const qpadL = 72;  const qpadR = 16; const qpadT = 24; const qpadB = 28

const quarterData = computed(() => {
  const m = summary.value?.monthly ?? []
  return [
    { label: 'Q1', target: m.slice(0,3).reduce((s:number,r:any)=>s+r.total_target,0), actual: m.slice(0,3).reduce((s:number,r:any)=>s+r.total_actual,0) },
    { label: 'Q2', target: m.slice(3,6).reduce((s:number,r:any)=>s+r.total_target,0), actual: m.slice(3,6).reduce((s:number,r:any)=>s+r.total_actual,0) },
    { label: 'Q3', target: m.slice(6,9).reduce((s:number,r:any)=>s+r.total_target,0), actual: m.slice(6,9).reduce((s:number,r:any)=>s+r.total_actual,0) },
    { label: 'Q4', target: m.slice(9,12).reduce((s:number,r:any)=>s+r.total_target,0), actual: m.slice(9,12).reduce((s:number,r:any)=>s+r.total_actual,0) },
  ]
})

const qyMax = computed(() => Math.max(...quarterData.value.map(q => Math.max(q.target, q.actual)), 1) * 1.1)

const qtrPoints = computed(() => {
  const qt = quarterData.value; if (!qt.length) return []
  const areaW = qsvgW - qpadL - qpadR
  const slotW = areaW / qt.length
  const barW  = Math.min(slotW * 0.32, 40)
  const gap   = barW * 0.4
  const h     = qsvgH - qpadT - qpadB
  const max   = qyMax.value || 1
  return qt.map((q, i) => {
    const cx = qpadL + slotW * i + slotW / 2
    const th = (q.target / max) * h; const ah = (q.actual / max) * h
    return {
      label: q.label, ach: q.target ? Math.round(q.actual / q.target * 100) : 0, cx,
      tx: cx - gap / 2 - barW, ty: qpadT + h - th, th,
      ax: cx + gap / 2,        ay: qpadT + h - ah,  ah,
    }
  })
})

const qBarW = computed(() => {
  const slotW = (qsvgW - qpadL - qpadR) / 4
  return Math.min(slotW * 0.32, 40)
})

onMounted(() => {
  loadData()
  if (isAdmin.value) loadShareInfo()
})
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-from, .modal-leave-to       { opacity: 0; }
.modal-enter-active .relative, .modal-leave-active .relative { transition: transform 0.2s ease; }
.modal-enter-from .relative              { transform: translateY(-16px); }
.modal-leave-to .relative                { transform: translateY(-8px); }
</style>
