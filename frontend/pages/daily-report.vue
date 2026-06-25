<template>
  <div>
    <!-- Header -->
    <div class="px-6 py-5 border-b border-apex-border flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-xl font-bold text-apex-text flex items-center gap-2">
          <i class="fa-solid fa-clipboard-list text-purple-400" />
          Laporan Harian
        </h1>
        <p class="text-xs text-apex-muted mt-0.5">Laporan harian yang dikirim sales via APEX Mobile App</p>
      </div>
    </div>

    <!-- Filter Bar -->
    <div class="px-6 pt-5 flex flex-wrap gap-3 items-end">
      <!-- Month-Year Picker -->
      <div class="flex flex-col gap-1">
        <label class="text-xs text-apex-muted font-medium">Periode</label>
        <div class="flex items-center gap-1 bg-apex-surface border border-apex-border rounded-lg px-2 py-1.5">
          <!-- Prev month -->
          <button @click="shiftMonth(-1)"
                  class="w-6 h-6 flex items-center justify-center rounded hover:bg-apex-card text-apex-muted hover:text-apex-text transition">
            <i class="fa-solid fa-chevron-left text-[10px]" />
          </button>
          <!-- Bulan dropdown -->
          <select v-model="pickerMonth"
                  class="bg-transparent text-sm text-apex-text focus:outline-none cursor-pointer">
            <option v-for="(m, i) in MONTH_NAMES" :key="i" :value="i + 1">{{ m }}</option>
          </select>
          <!-- Tahun dropdown -->
          <select v-model="pickerYear"
                  class="bg-transparent text-sm text-apex-text focus:outline-none cursor-pointer w-16">
            <option v-for="y in yearRange" :key="y" :value="y">{{ y }}</option>
          </select>
          <!-- Next month -->
          <button @click="shiftMonth(1)"
                  class="w-6 h-6 flex items-center justify-center rounded hover:bg-apex-card text-apex-muted hover:text-apex-text transition">
            <i class="fa-solid fa-chevron-right text-[10px]" />
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs text-apex-muted font-medium">Sales</label>
        <select v-model="filterUserId"
                class="bg-apex-surface border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text
                       focus:ring-2 focus:ring-purple-500 focus:outline-none">
          <option value="">Semua Sales</option>
          <option v-for="s in salesList" :key="s.id" :value="s.id">{{ s.nama }}</option>
        </select>
      </div>
      <div class="flex flex-col gap-1">
        <label class="text-xs text-apex-muted font-medium">Status</label>
        <select v-model="filterStatus"
                class="bg-apex-surface border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text
                       focus:ring-2 focus:ring-purple-500 focus:outline-none">
          <option value="">Semua Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Terkirim</option>
        </select>
      </div>
      <button @click="loadReports"
              class="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-apex-text text-sm
                     px-4 py-2 rounded-lg font-medium transition">
        <i class="fa-solid fa-magnifying-glass" />
        Filter
      </button>
      <button @click="resetFilter"
              class="text-sm text-apex-muted hover:text-apex-text px-3 py-2 transition">
        Reset
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-5">
      <div v-for="s in statsCards" :key="s.label"
           class="bg-apex-surface border border-apex-border rounded-xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" :class="s.bg">
          <i :class="['fa-solid', s.icon, s.color]" />
        </div>
        <div>
          <div class="text-2xl font-bold text-apex-text leading-none">{{ s.value }}</div>
          <div class="text-xs text-apex-muted mt-0.5">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div v-if="reports.length && !loading" class="px-6 pt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">

      <!-- Chart 1: Tren Aktivitas Harian -->
      <div class="lg:col-span-2 bg-apex-surface border border-apex-border rounded-xl p-5">
        <div class="text-xs text-apex-muted uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
          <i class="fa-solid fa-chart-bar text-purple-400" />Tren Aktivitas Harian
        </div>
        <div class="flex items-end gap-1 h-36 overflow-x-auto overflow-y-hidden pb-1">
          <template v-for="d in trendData" :key="d.date">
            <div class="flex flex-col items-center gap-0.5 flex-shrink-0" style="min-width: 24px">
              <div class="flex items-end gap-0.5 h-28">
                <!-- FU bar -->
                <div
                  :style="{ height: trendMaxVal ? Math.max(2, Math.round((d.fu / trendMaxVal) * 112)) + 'px' : '2px' }"
                  class="w-2 rounded-t bg-purple-500/80 hover:bg-purple-400 transition-all relative group"
                  :title="`FU: ${d.fu}`">
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-purple-300 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none bg-apex-input px-1 rounded">{{ d.fu }}</div>
                </div>
                <!-- Visit bar -->
                <div
                  :style="{ height: trendMaxVal ? Math.max(2, Math.round((d.visit / trendMaxVal) * 112)) + 'px' : '2px' }"
                  class="w-2 rounded-t bg-emerald-500/80 hover:bg-emerald-400 transition-all relative group"
                  :title="`Visit: ${d.visit}`">
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-emerald-300 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none bg-apex-input px-1 rounded">{{ d.visit }}</div>
                </div>
              </div>
              <div class="text-[10px] text-apex-faint mt-1 text-center">{{ d.date.slice(8) }}</div>
            </div>
          </template>
        </div>
        <div class="flex items-center gap-4 mt-3">
          <div class="flex items-center gap-1.5 text-xs text-apex-muted">
            <div class="w-3 h-3 rounded-sm bg-purple-500/80"></div> FU
          </div>
          <div class="flex items-center gap-1.5 text-xs text-apex-muted">
            <div class="w-3 h-3 rounded-sm bg-emerald-500/80"></div> Kunjungan
          </div>
        </div>
      </div>

      <!-- Chart 2: Distribusi Mood (Donut SVG) -->
      <div class="bg-apex-surface border border-apex-border rounded-xl p-5">
        <div class="text-xs text-apex-muted uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
          <i class="fa-solid fa-face-smile text-yellow-400" />Distribusi Mood
        </div>
        <div class="flex items-center justify-center mb-4">
          <svg :viewBox="`0 0 120 120`" class="w-28 h-28" style="transform:rotate(-90deg)">
            <circle cx="60" cy="60" r="44" fill="none" stroke="#1f2937" stroke-width="22" />
            <circle v-if="moodTotal > 0"
              cx="60" cy="60" r="44"
              fill="none" stroke="#22c55e" stroke-width="22"
              :stroke-dasharray="`${(moodData.great / moodTotal) * 276.46} 276.46`"
              stroke-dashoffset="0" />
            <circle v-if="moodTotal > 0"
              cx="60" cy="60" r="44"
              fill="none" stroke="#eab308" stroke-width="22"
              :stroke-dasharray="`${(moodData.okay / moodTotal) * 276.46} 276.46`"
              :stroke-dashoffset="`${-((moodData.great / moodTotal) * 276.46)}`" />
            <circle v-if="moodTotal > 0"
              cx="60" cy="60" r="44"
              fill="none" stroke="#ef4444" stroke-width="22"
              :stroke-dasharray="`${(moodData.tough / moodTotal) * 276.46} 276.46`"
              :stroke-dashoffset="`${-(((moodData.great + moodData.okay) / moodTotal) * 276.46)}`" />
            <text x="60" y="60" text-anchor="middle" dominant-baseline="central"
              style="transform:rotate(90deg);transform-origin:60px 60px"
              class="fill-white text-sm font-bold" font-size="20" font-weight="700">{{ moodTotal }}</text>
            <text x="60" y="76" text-anchor="middle"
              style="transform:rotate(90deg);transform-origin:60px 60px"
              class="fill-gray-400" font-size="9" fill="#9ca3af">laporan</text>
          </svg>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-green-500"></div><span class="text-apex-muted">Semangat 😊</span></div>
            <span class="font-bold text-apex-text">{{ moodData.great }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><span class="text-apex-muted">Biasa 😐</span></div>
            <span class="font-bold text-apex-text">{{ moodData.okay }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-red-500"></div><span class="text-apex-muted">Berat 😔</span></div>
            <span class="font-bold text-apex-text">{{ moodData.tough }}</span>
          </div>
        </div>
      </div>

      <!-- Chart 3: Laporan per Sales -->
      <div class="lg:col-span-3 bg-apex-surface border border-apex-border rounded-xl p-5">
        <div class="text-xs text-apex-muted uppercase tracking-wider font-medium mb-4 flex items-center gap-2">
          <i class="fa-solid fa-users text-blue-400" />Kepatuhan Laporan per Sales
        </div>
        <div class="space-y-3">
          <div v-for="s in salesStats" :key="s.nama" class="flex items-center gap-3">
            <div class="w-32 text-xs text-apex-muted truncate text-right shrink-0">{{ s.nama }}</div>
            <div class="flex-1 flex items-center gap-0">
              <div class="h-5 rounded-l flex items-center justify-end pr-1 transition-all"
                :style="{ width: salesMax ? Math.max(4, Math.round((s.sent / salesMax) * 100)) + '%' : '4px' }"
                :class="s.sent > 0 ? 'bg-green-600/70' : 'hidden'">
                <span v-if="s.sent > 0" class="text-[10px] text-green-200 font-bold">{{ s.sent }}</span>
              </div>
              <div class="h-5 flex items-center justify-end pr-1 transition-all"
                :style="{ width: salesMax ? Math.max(4, Math.round((s.draft / salesMax) * 100)) + '%' : '4px' }"
                :class="[s.draft > 0 ? 'bg-yellow-600/60' : 'hidden', s.sent === 0 ? 'rounded-l' : '', 'rounded-r']">
                <span v-if="s.draft > 0" class="text-[10px] text-yellow-200 font-bold">{{ s.draft }}</span>
              </div>
            </div>
            <div class="w-10 text-xs text-apex-faint shrink-0">{{ s.total }}x</div>
          </div>
        </div>
        <div class="flex items-center gap-4 mt-4">
          <div class="flex items-center gap-1.5 text-xs text-apex-muted">
            <div class="w-3 h-3 rounded-sm bg-green-600/70"></div> Terkirim
          </div>
          <div class="flex items-center gap-1.5 text-xs text-apex-muted">
            <div class="w-3 h-3 rounded-sm bg-yellow-600/60"></div> Draft
          </div>
        </div>
      </div>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="mx-6 mt-5 bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm flex items-start gap-3">
      <i class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0" />
      <div>
        <div class="font-semibold mb-1">Gagal memuat data</div>
        <div class="font-mono text-xs opacity-75">{{ errorMsg }}</div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-24 text-apex-faint">
      <i class="fa-solid fa-spinner fa-spin mr-2" /> Memuat laporan…
    </div>

    <!-- Empty -->
    <div v-else-if="!reports.length"
         class="mx-6 mt-5 bg-apex-surface border border-dashed border-apex-border rounded-xl
                p-16 text-center">
      <div class="text-5xl mb-4">📋</div>
      <div class="font-bold text-apex-muted text-lg mb-2">Belum ada laporan</div>
      <div class="text-apex-faint text-sm">Laporan harian dikirim sales via APEX Mobile App.</div>
    </div>

    <!-- Table (desktop) -->
    <div v-else class="px-6 pt-5 pb-10">
      <!-- Mobile cards -->
      <div class="space-y-3 md:hidden">
        <div v-for="r in reports" :key="r.id"
             class="bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
          <div class="flex items-center gap-3 px-4 py-3 cursor-pointer"
               @click="r._open = !r._open">
            <div class="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"
                 :class="moodBg(r.mood)">
              {{ moodEmoji(r.mood) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-apex-text text-sm">{{ r.sales_nama }}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium" :class="statusClass(r.status)">
                  {{ statusLabel(r.status) }}
                </span>
              </div>
              <div class="text-xs text-apex-muted mt-0.5">
                📅 {{ r.report_date }} &nbsp;·&nbsp;
                {{ r.fu_count ?? 0 }} FU &nbsp;·&nbsp;
                {{ r.visit_count ?? 0 }} kunjungan
              </div>
            </div>
            <i class="fa-solid fa-chevron-down text-apex-faint text-xs transition-transform shrink-0"
               :class="r._open ? 'rotate-180' : ''" />
          </div>
          <div v-if="r._open" class="px-4 pb-4 border-t border-apex-border pt-3 space-y-3">
            <div v-if="r.notes_obstacle" class="bg-red-950/40 border border-red-900/40 rounded-lg p-3">
              <div class="text-xs font-bold text-red-400 mb-1">⚠️ Hambatan</div>
              <p class="text-apex-muted text-sm leading-relaxed whitespace-pre-line">{{ r.notes_obstacle }}</p>
            </div>
            <div v-if="r.notes_plan" class="bg-blue-950/40 border border-blue-900/40 rounded-lg p-3">
              <div class="text-xs font-bold text-blue-400 mb-1">📌 Rencana Besok</div>
              <p class="text-apex-muted text-sm leading-relaxed whitespace-pre-line">{{ r.notes_plan }}</p>
            </div>
            <div v-if="r.send_latitude && r.send_longitude"
                 class="bg-emerald-950/40 border border-emerald-900/40 rounded-lg p-3">
              <div class="text-xs font-bold text-emerald-400 mb-1">
                <i class="fa-solid fa-location-dot mr-1" />Lokasi Kirim
              </div>
              <p class="text-apex-muted text-xs">
                {{ r.send_address || `${r.send_latitude}, ${r.send_longitude}` }}
              </p>
              <button @click="openMap(r)"
                      class="mt-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline">
                Lihat di peta →
              </button>
            </div>
            <div class="text-xs text-apex-faint">
              Dikirim: {{ r.sent_at ? r.sent_at.slice(0,16).replace('T',' ') : '—' }}
            </div>
          </div>
        </div>
      </div>

      <!-- Desktop table -->
      <div class="hidden md:block bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
        <table class="w-full text-sm">
          <thead class="border-b border-apex-border">
            <tr class="text-xs text-apex-muted uppercase tracking-wide">
              <th class="text-left px-5 py-3">Tanggal</th>
              <th class="text-left px-4 py-3">Sales</th>
              <th class="text-center px-4 py-3">Status</th>
              <th class="text-center px-4 py-3">Mood</th>
              <th class="text-center px-4 py-3">FU</th>
              <th class="text-center px-4 py-3">Visit</th>
              <th class="text-center px-4 py-3">Lead Baru</th>
              <th class="text-left px-4 py-3">Hambatan</th>
              <th class="text-left px-4 py-3">Rencana Besok</th>
              <th class="text-center px-4 py-3">Lokasi</th>
              <th class="text-left px-4 py-3">Dikirim</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-apex-border">
            <template v-for="r in reports" :key="r.id">
              <tr class="hover:bg-apex-card/40 cursor-pointer transition-colors"
                  @click="r._open = !r._open">
                <td class="px-5 py-3 font-mono text-apex-muted text-xs whitespace-nowrap">
                  {{ r.report_date }}
                </td>
                <td class="px-4 py-3 font-semibold text-apex-text">{{ r.sales_nama }}</td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold" :class="statusClass(r.status)">
                    {{ statusLabel(r.status) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center text-lg">{{ moodEmoji(r.mood) }}</td>
                <td class="px-4 py-3 text-center font-bold text-apex-text">{{ r.fu_count ?? 0 }}</td>
                <td class="px-4 py-3 text-center font-bold text-apex-text">{{ r.visit_count ?? 0 }}</td>
                <td class="px-4 py-3 text-center font-bold text-apex-text">{{ r.new_lead_count ?? 0 }}</td>
                <td class="px-4 py-3 text-xs text-apex-muted max-w-[180px]">
                  <span v-if="r.notes_obstacle" class="text-red-400">
                    ⚠️ {{ r.notes_obstacle.slice(0, 50) }}{{ r.notes_obstacle.length > 50 ? '…' : '' }}
                  </span>
                  <span v-else class="text-apex-faint">—</span>
                </td>
                <td class="px-4 py-3 text-xs text-apex-muted max-w-[180px]">
                  {{ r.notes_plan ? r.notes_plan.slice(0, 50) + (r.notes_plan.length > 50 ? '…' : '') : '—' }}
                </td>
                <td class="px-4 py-3 text-center">
                  <button v-if="r.send_latitude && r.send_longitude"
                          @click.stop="openMap(r)"
                          class="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300
                                 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50
                                 px-2 py-1 rounded-lg transition">
                    <i class="fa-solid fa-location-dot text-[11px]" />
                    Lihat
                  </button>
                  <span v-else class="text-apex-faint text-xs">—</span>
                </td>
                <td class="px-4 py-3 text-xs text-apex-faint whitespace-nowrap">
                  {{ r.sent_at ? r.sent_at.slice(0, 16).replace('T', ' ') : '—' }}
                </td>
              </tr>
              <!-- Expanded row -->
              <tr v-if="r._open" class="bg-apex-card/30">
                <td colspan="11" class="px-5 py-4">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div v-if="r.notes_obstacle"
                         class="bg-red-950/40 border border-red-900/40 rounded-lg p-3">
                      <div class="text-xs font-bold text-red-400 mb-2">⚠️ Hambatan</div>
                      <p class="text-apex-muted text-xs leading-relaxed whitespace-pre-line">{{ r.notes_obstacle }}</p>
                    </div>
                    <div v-if="r.notes_plan"
                         class="bg-blue-950/40 border border-blue-900/40 rounded-lg p-3">
                      <div class="text-xs font-bold text-blue-400 mb-2">📌 Rencana Besok</div>
                      <p class="text-apex-muted text-xs leading-relaxed whitespace-pre-line">{{ r.notes_plan }}</p>
                    </div>
                    <div class="flex flex-col gap-2">
                      <div v-if="r.send_latitude && r.send_longitude"
                           class="bg-emerald-950/40 border border-emerald-900/40 rounded-lg p-3">
                        <div class="text-xs font-bold text-emerald-400 mb-2">
                          <i class="fa-solid fa-location-dot mr-1" />Lokasi Kirim Laporan
                        </div>
                        <p class="text-apex-muted text-xs leading-relaxed">
                          {{ r.send_address || `${r.send_latitude}, ${r.send_longitude}` }}
                        </p>
                        <button @click="openMap(r)"
                                class="mt-2 text-xs text-emerald-400 hover:text-emerald-300 underline">
                          Lihat di peta →
                        </button>
                      </div>
                      <div class="text-xs text-apex-faint">
                        ID: #{{ r.id }} &nbsp;·&nbsp;
                        Dibuat: {{ r.created_at ? r.created_at.slice(0,16).replace('T',' ') : '—' }}
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
        <AppPagination
          v-model:page="page"
          v-model:per-page="perPage"
          :total="totalCount"
          :total-pages="totalPages"
          :per-page-options="[10, 25, 50]"
        />
      </div>
    </div>
  </div>

  <!-- ── Map Popup Modal ─────────────────────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="mapModal.show"
         class="fixed inset-0 z-50 flex items-center justify-center p-4"
         style="background:rgba(0,0,0,0.7)"
         @click.self="mapModal.show = false">
      <div class="bg-apex-surface border border-apex-border rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl">
        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-3 border-b border-apex-border">
          <div>
            <div class="font-semibold text-apex-text text-sm flex items-center gap-2">
              <i class="fa-solid fa-location-dot text-emerald-400" />
              Lokasi Kirim Laporan — {{ mapModal.salesNama }}
            </div>
            <div class="text-xs text-apex-muted mt-0.5">{{ mapModal.address }}</div>
          </div>
          <button @click="mapModal.show = false"
                  class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-apex-card text-apex-muted hover:text-apex-text transition">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>
        <!-- Map Leaflet -->
        <div ref="drMapEl" style="height:400px;background:#0d1b31" />
        <!-- Footer: koordinat + link buka full map -->
        <div class="flex items-center justify-between px-5 py-3 border-t border-apex-border text-xs text-apex-faint">
          <span>{{ mapModal.lat.toFixed(6) }}, {{ mapModal.lng.toFixed(6) }}</span>
          <a :href="`https://www.openstreetmap.org/?mlat=${mapModal.lat}&mlon=${mapModal.lng}#map=16/${mapModal.lat}/${mapModal.lng}`"
             target="_blank" rel="noopener"
             class="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition">
            Buka di OpenStreetMap <i class="fa-solid fa-arrow-up-right-from-square text-[10px]" />
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const today = new Date()
const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const pickerYear  = ref(today.getFullYear())
const pickerMonth = ref(today.getMonth() + 1)
const yearRange   = computed(() => {
  const cur = today.getFullYear()
  return Array.from({ length: 5 }, (_, i) => cur - 2 + i)
})
const filterMonth = computed({
  get: () => `${pickerYear.value}-${String(pickerMonth.value).padStart(2, '0')}`,
  set: (v: string) => {
    const [y, m] = v.split('-').map(Number)
    pickerYear.value  = y
    pickerMonth.value = m
  },
})
function shiftMonth(delta: number) {
  let m = pickerMonth.value + delta
  let y = pickerYear.value
  if (m < 1)  { m = 12; y-- }
  if (m > 12) { m = 1;  y++ }
  pickerMonth.value = m
  pickerYear.value  = y
  loadReports()
}
const filterUserId = ref('')
const filterStatus = ref('')

const loading    = ref(false)
const reports    = ref<any[]>([])
const page       = ref(1)
const perPage    = ref(15)
const totalCount = ref(0)
const totalPages = ref(1)
const salesList = ref<any[]>([])
const errorMsg  = ref('')

const mapModal = reactive({
  show:      false,
  lat:       0,
  lng:       0,
  address:   '',
  salesNama: '',
})

const drMapEl  = ref<HTMLElement | null>(null)
let   drMap: any = null

async function initDrMap() {
  await nextTick()
  if (!drMapEl.value) return
  const L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')
  if (drMap) { drMap.remove(); drMap = null }
  drMap = L.map(drMapEl.value, { zoomControl: true }).setView([mapModal.lat, mapModal.lng], 16)
  await addTileLayer(L, drMap)
  const icon = L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
    iconAnchor: [8, 8],
  })
  L.marker([mapModal.lat, mapModal.lng], { icon })
    .addTo(drMap)
    .bindPopup(`<b>${mapModal.salesNama}</b><br><span style="font-size:11px">${mapModal.address}</span>`)
    .openPopup()
}

function openMap(r: any) {
  mapModal.lat       = parseFloat(r.send_latitude)
  mapModal.lng       = parseFloat(r.send_longitude)
  mapModal.address   = r.send_address || `${r.send_latitude}, ${r.send_longitude}`
  mapModal.salesNama = r.sales_nama || ''
  mapModal.show      = true
  initDrMap()
}

watch(() => mapModal.show, v => {
  if (!v && drMap) { drMap.remove(); drMap = null }
})

const summary = computed(() => ({
  total:       reports.value.length,
  sent:        reports.value.filter(r => r.status === 'sent').length,
  draft:       reports.value.filter(r => r.status === 'draft').length,
  salesAktif:  new Set(reports.value.map(r => r.user_id)).size,
}))

const statsCards = computed(() => [
  { label: 'Total Laporan', value: summary.value.total,      icon: 'fa-clipboard-list', bg: 'bg-purple-900/60', color: 'text-purple-300' },
  { label: 'Terkirim',      value: summary.value.sent,       icon: 'fa-paper-plane',    bg: 'bg-green-900/60',  color: 'text-green-300'  },
  { label: 'Draft',         value: summary.value.draft,      icon: 'fa-pen',            bg: 'bg-yellow-900/60', color: 'text-yellow-300' },
  { label: 'Sales Melapor', value: summary.value.salesAktif, icon: 'fa-users',          bg: 'bg-blue-900/60',   color: 'text-blue-300'   },
])

// ── Chart Computed ─────────────────────────────────────────────────────────
const trendData = computed(() => {
  const map = new Map<string, { fu: number; visit: number }>()
  for (const r of reports.value) {
    const d = String(r.report_date).slice(0, 10)
    if (!map.has(d)) map.set(d, { fu: 0, visit: 0 })
    map.get(d)!.fu    += r.fu_count    ?? 0
    map.get(d)!.visit += r.visit_count ?? 0
  }
  return [...map.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, v]) => ({ date, fu: v.fu, visit: v.visit }))
})

const trendMaxVal = computed(() =>
  Math.max(1, ...trendData.value.map(d => Math.max(d.fu, d.visit)))
)

const salesStats = computed(() => {
  const map = new Map<string, { sent: number; draft: number }>()
  for (const r of reports.value) {
    const name = r.sales_nama ?? '—'
    if (!map.has(name)) map.set(name, { sent: 0, draft: 0 })
    if (r.status === 'sent') map.get(name)!.sent++
    else map.get(name)!.draft++
  }
  return [...map.entries()]
    .map(([nama, v]) => ({ nama, ...v, total: v.sent + v.draft }))
    .sort((a, b) => b.total - a.total)
})

const salesMax = computed(() =>
  Math.max(1, ...salesStats.value.map(s => s.total))
)

const moodData = computed(() => ({
  great: reports.value.filter(r => ['great', 'happy', 'good'].includes(r.mood ?? '')).length,
  okay:  reports.value.filter(r => ['okay', 'neutral'].includes(r.mood ?? '')).length,
  tough: reports.value.filter(r => ['tough', 'sad', 'hard'].includes(r.mood ?? '')).length,
}))

const moodTotal = computed(() => moodData.value.great + moodData.value.okay + moodData.value.tough)

// ──────────────────────────────────────────────────────────────────────────
async function loadReports(resetPage = false) {
  if (resetPage) page.value = 1
  loading.value = true
  errorMsg.value = ''
  try {
    const { get: apiGet } = useApi()
    const params: Record<string, any> = { month: filterMonth.value, page: page.value, per_page: perPage.value }
    if (filterUserId.value) params.user_id = filterUserId.value
    if (filterStatus.value) params.status  = filterStatus.value

    const data = await apiGet<any>('/v1/daily-report', params)
    reports.value = (data.reports ?? []).map((r: any) => ({ ...r, _open: false }))
    totalCount.value = data.total ?? 0
    totalPages.value = data.total_pages ?? 1
  } catch (e: any) {
    errorMsg.value = e?.data?.message ?? e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

watch([page, perPage], () => loadReports())

async function loadSales() {
  try {
    const { get: apiGet } = useApi()
    const data = await apiGet<any>('/v1/master/sales')
    const all = Array.isArray(data) ? data : (data.data ?? [])
    salesList.value = all.filter((u: any) => u.is_active == 1 || u.is_active === true)
  } catch (_) {}
}

function resetFilter() {
  pickerYear.value   = today.getFullYear()
  pickerMonth.value  = today.getMonth() + 1
  filterUserId.value = ''
  filterStatus.value = ''
  loadReports(true)
}

function moodEmoji(mood: string) {
  if (['great', 'happy', 'good'].includes(mood))   return '😊'
  if (['okay', 'neutral'].includes(mood))           return '😐'
  if (['tough', 'sad', 'hard'].includes(mood))      return '😔'
  return '—'
}

function moodBg(mood: string) {
  if (['great', 'happy', 'good'].includes(mood))   return 'bg-green-900/60'
  if (['tough', 'sad', 'hard'].includes(mood))     return 'bg-red-900/60'
  return 'bg-apex-input'
}

function statusClass(status: string) {
  if (status === 'sent')     return 'bg-green-900/60 text-green-300'
  if (status === 'reviewed') return 'bg-blue-900/60 text-blue-300'
  return 'bg-yellow-900/60 text-yellow-300'
}

function statusLabel(status: string) {
  if (status === 'sent')     return '✅ Terkirim'
  if (status === 'reviewed') return '👁️ Reviewed'
  return '✏️ Draft'
}

onMounted(() => {
  loadSales()
  loadReports()
})
</script>
