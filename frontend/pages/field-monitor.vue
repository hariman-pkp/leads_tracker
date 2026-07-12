<template>
  <div>
    <!-- ── HEADER ──────────────────────────────────────────────────────── -->
    <div class="page-header mb-4">
      <div>
        <h1 class="page-title">
          <i class="fa-solid fa-chart-line text-primary-400 mr-2" />Field Activity Monitor
        </h1>
        <p class="page-subtitle">Monitoring kunjungan lapangan tim sales</p>
      </div>
      <!-- Tab switcher -->
      <div class="flex rounded-lg overflow-hidden border border-apex-border text-sm font-medium">
        <button @click="activeTab = 'activity'"
                :class="activeTab === 'activity' ? 'bg-primary-700 text-white' : 'bg-apex-bg text-gray-400 hover:text-gray-200'"
                class="px-4 py-2 transition">
          <i class="fa-solid fa-map-marked-alt mr-1.5" />Aktivitas
        </button>
        <button @click="activeTab = 'live'; loadLive()"
                :class="activeTab === 'live' ? 'bg-primary-700 text-white' : 'bg-apex-bg text-gray-400 hover:text-gray-200'"
                class="px-4 py-2 transition flex items-center gap-2">
          <span class="relative flex h-2 w-2">
            <span v-if="activeTab === 'live'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2 w-2" :class="activeTab === 'live' ? 'bg-emerald-400' : 'bg-gray-600'" />
          </span>
          Live Tracking
        </button>
      </div>
    </div>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- TAB: LIVE TRACKING                                                 -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'live'">
      <!-- Status bar -->
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-400">
            Update terakhir: <span class="text-gray-200">{{ liveLastUpdate || '—' }}</span>
          </span>
          <span v-if="liveTeam" class="text-sm">
            <span class="text-emerald-400 font-semibold">{{ liveTeam.active_count }}</span>
            <span class="text-gray-400"> online · </span>
            <span class="text-gray-500 font-semibold">{{ liveTeam.offline_count }}</span>
            <span class="text-gray-400"> offline</span>
          </span>
        </div>
        <button @click="loadLive" :disabled="liveLoading"
                class="btn-secondary btn-sm flex items-center gap-2">
          <i :class="liveLoading ? 'fa-solid fa-circle-notch fa-spin' : 'fa-solid fa-rotate'" class="text-xs" />
          Refresh
        </button>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <!-- Peta real-time -->
        <div class="xl:col-span-2 card p-0 overflow-hidden">
          <div class="px-4 py-3 border-b border-apex-border flex items-center justify-between">
            <div class="flex items-center gap-2 text-sm font-medium text-gray-200">
              <i class="fa-solid fa-location-dot text-primary-400" />Posisi Tim Sales
            </div>
            <div class="flex items-center gap-2 text-xs text-gray-500">
              <i class="fa-solid fa-clock" />Auto-refresh 30 detik
            </div>
          </div>
          <ClientOnly>
            <div ref="liveMapEl" style="height: 480px; background: #1e293b" />
            <template #fallback>
              <div class="flex items-center justify-center" style="height: 480px">
                <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
              </div>
            </template>
          </ClientOnly>
        </div>

        <!-- Panel status sales -->
        <div class="space-y-3">
          <!-- Online -->
          <div class="card">
            <div class="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
              Online ({{ liveTeam?.active_count || 0 }})
            </div>
            <div v-if="!liveTeam?.active?.length" class="text-sm text-gray-500 text-center py-4">
              Belum ada sales aktif
            </div>
            <div v-for="s in liveTeam?.active || []" :key="s.user_id"
                 class="flex items-center gap-3 py-2 border-b border-apex-border last:border-0 cursor-pointer hover:bg-apex-card/50 rounded px-1 -mx-1 transition"
                 @click="focusSales(s)">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                   :style="{ background: salesColorMap[s.user_id] || '#6366f1' }">
                {{ initials(s.sales_nama) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm font-medium text-gray-200 truncate">{{ s.sales_nama }}</div>
                <div class="text-xs text-gray-500 truncate">{{ s.address || fmtCoord(s.latitude, s.longitude) }}</div>
              </div>
              <div class="text-right flex-shrink-0">
                <div class="text-xs text-emerald-400">{{ fmtTimeAgo(s.last_seen) }}</div>
              </div>
            </div>
          </div>

          <!-- Offline -->
          <div class="card">
            <div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-gray-600 inline-block" />
              Offline ({{ liveTeam?.offline_count || 0 }})
            </div>
            <div v-if="!liveTeam?.offline?.length" class="text-sm text-gray-500 text-center py-3">
              —
            </div>
            <div v-for="s in liveTeam?.offline || []" :key="s.user_id"
                 class="flex items-center gap-3 py-2 border-b border-apex-border last:border-0">
              <div class="w-8 h-8 rounded-full bg-apex-card flex items-center justify-center text-xs font-bold text-apex-faint flex-shrink-0">
                {{ initials(s.sales_nama) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-500 truncate">{{ s.sales_nama }}</div>
              </div>
              <i class="fa-solid fa-location-slash text-xs text-gray-700" />
            </div>
          </div>

          <!-- Trail hari ini -->
          <div class="card">
            <div class="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-3">
              <i class="fa-solid fa-route mr-1" />Trail Hari Ini
            </div>
            <div class="space-y-1.5">
              <div v-for="s in liveTrails || []" :key="s.user_id"
                   class="flex items-center justify-between text-sm cursor-pointer hover:bg-apex-card/50 rounded px-1 py-1 -mx-1 transition"
                   @click="highlightTrail(s.user_id)">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full inline-block border border-white/20"
                        :style="{ background: salesColorMap[s.user_id] || '#6366f1' }" />
                  <span class="text-gray-300">{{ s.sales_nama }}</span>
                </div>
                <span class="text-gray-500 text-xs">{{ s.points?.length || 0 }} titik</span>
              </div>
              <div v-if="!liveTrails?.length" class="text-sm text-gray-500 text-center py-2">
                Belum ada data trail hari ini
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════════════ -->
    <!-- TAB: ACTIVITY                                                       -->
    <!-- ══════════════════════════════════════════════════════════════════ -->
    <template v-if="activeTab === 'activity'">
    <!-- ── FILTER BAR ──────────────────────────────────────────────────── -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3 items-end">
        <div>
          <label class="form-label">Dari Tanggal</label>
          <input v-model="f.date_from" type="date" class="form-input w-36" @change="load" />
        </div>
        <div>
          <label class="form-label">Sampai Tanggal</label>
          <input v-model="f.date_to" type="date" class="form-input w-36" @change="load" />
        </div>
        <div>
          <label class="form-label">Sales</label>
          <select v-model="f.user_id" class="form-select w-44" @change="load">
            <option value="">Semua Sales</option>
            <option v-for="s in data?.sales_list || []" :key="s.id" :value="s.id">{{ s.nama }}</option>
          </select>
        </div>
        <!-- Preset buttons -->
        <div class="flex gap-2 pb-0.5">
          <button v-for="p in presets" :key="p.label" @click="applyPreset(p)"
                  class="btn-secondary btn-sm text-xs">
            {{ p.label }}
          </button>
        </div>
        <button @click="exportCsv" class="btn-secondary btn-sm ml-auto">
          <i class="fa-solid fa-file-csv" />Export CSV
        </button>
      </div>
    </div>

    <div v-if="pending" class="flex justify-center py-20">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <template v-else-if="data">
      <!-- ── SUMMARY KPI STRIP ──────────────────────────────────────────── -->
      <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4">
        <div class="stat-card">
          <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-map-pin" /></div>
          <div>
            <div class="stat-value">{{ data.summary.total_kunjungan }}</div>
            <div class="stat-label">Total Kunjungan</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-users" /></div>
          <div>
            <div class="stat-value">{{ data.summary.total_sales }}</div>
            <div class="stat-label">Sales Aktif</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-calendar-check" /></div>
          <div>
            <div class="stat-value">{{ data.summary.total_hari }}</div>
            <div class="stat-label">Hari Kerja</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-yellow-900/40 text-yellow-400"><i class="fa-solid fa-clock" /></div>
          <div>
            <div class="stat-value">{{ fmtDuration(data.summary.avg_durasi) }}</div>
            <div class="stat-label">Rata-rata Durasi</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-hourglass-half" /></div>
          <div>
            <div class="stat-value">{{ fmtDuration(data.summary.total_durasi) }}</div>
            <div class="stat-label">Total Durasi</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange-900/40 text-orange-400"><i class="fa-solid fa-circle-dot" /></div>
          <div>
            <div class="stat-value">{{ data.summary.on_going }}</div>
            <div class="stat-label">Sedang Aktif</div>
            <div class="text-xs text-gray-600 mt-0.5">{{ data.summary.completed }} selesai</div>
          </div>
        </div>
      </div>

      <!-- ── ROW: TOP SALES + CHART HARIAN ─────────────────────────────── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4">
        <!-- Top Sales -->
        <div class="card">
          <div class="section-title mb-3"><i class="fa-solid fa-trophy mr-1.5 text-yellow-400" />Top Sales</div>
          <div v-if="!(data.top_sales || []).length" class="text-center text-gray-600 text-sm py-6">Tidak ada data</div>
          <div v-for="(s, i) in (data.top_sales || [])" :key="s.sales_nama" class="flex items-center gap-3 mb-3 last:mb-0">
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                 :class="i===0?'bg-yellow-500 text-black':i===1?'bg-gray-400 text-black':i===2?'bg-orange-700 text-white':'bg-apex-card text-apex-faint'">
              {{ i+1 }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-gray-200 truncate">{{ s.sales_nama }}</div>
              <div class="text-xs text-gray-500">{{ fmtDuration(s.avg_durasi) }} rata-rata</div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-sm font-semibold text-primary-400">{{ s.total_kunjungan }}×</div>
              <div class="text-xs text-gray-600">{{ fmtDuration(s.total_durasi) }}</div>
            </div>
          </div>
        </div>

        <!-- Chart kunjungan per hari -->
        <div class="card xl:col-span-2">
          <div class="section-title mb-3"><i class="fa-solid fa-chart-bar mr-1.5 text-primary-400" />Kunjungan per Hari</div>
          <div v-if="!chartDays.length" class="text-center text-gray-600 text-sm py-6">Tidak ada data</div>
          <div v-else class="overflow-x-auto">
            <div class="flex items-end gap-1.5 min-h-28" style="min-width:max-content">
              <div v-for="d in chartDays" :key="d.tgl"
                   class="flex flex-col items-center gap-1 flex-shrink-0" style="width:36px">
                <div class="text-xs text-primary-400 font-medium">{{ d.total }}</div>
                <div class="w-full rounded-t transition-all duration-500 bg-primary-700/70 hover:bg-primary-600"
                     :style="`height:${chartBarH(d.total)}px`" :title="`${d.tgl}: ${d.total} kunjungan`" />
                <div class="text-xs text-gray-600 text-center leading-tight" style="font-size:10px">
                  {{ fmtTglShort(d.tgl) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── TIMELINE per SALES ─────────────────────────────────────────── -->
      <div class="card mb-4">
        <div class="section-title mb-3">
          <i class="fa-solid fa-timeline mr-1.5 text-blue-400" />Timeline Kunjungan
          <span class="text-xs text-gray-500 font-normal ml-2">— per sales per hari</span>
        </div>
        <!-- Date tabs jika range > 1 hari -->
        <div v-if="timelineDates.length > 1" class="flex gap-1.5 mb-3 flex-wrap">
          <button v-for="d in timelineDates" :key="d"
                  @click="selectedTimelineDate = d"
                  class="btn-xs rounded-lg px-3 py-1.5 text-xs transition-colors"
                  :class="selectedTimelineDate===d ? 'bg-primary-700 text-white' : 'bg-apex-card text-gray-400 hover:bg-apex-card'">
            {{ fmtTgl(d) }}
          </button>
        </div>
        <div v-if="!filteredTimeline.length" class="text-center text-gray-600 text-sm py-6">Tidak ada data kunjungan</div>
        <div v-else>
          <!-- Header jam -->
          <div class="flex mb-1">
            <div class="w-28 flex-shrink-0"></div>
            <div class="flex-1 relative h-4">
              <div v-for="h in timelineHours" :key="h"
                   class="absolute text-gray-500 -translate-x-1/2"
                   :style="`left:${(h-7)/13*100}%;font-size:10px`">
                {{ h.toString().padStart(2,'0') }}:00
              </div>
            </div>
          </div>
          <!-- Baris per sales -->
          <div v-for="sg in timelineGroups" :key="sg.nama" class="flex items-center mb-1.5">
            <div class="w-28 text-xs text-gray-400 truncate pr-2 flex-shrink-0 text-right">{{ sg.nama }}</div>
            <div class="flex-1 relative h-7 bg-apex-card/50 rounded overflow-visible" :id="`tl-${sg.nama}`">
              <!-- Grid lines jam — koordinat sama dengan bar: (h-7)/13*100% -->
              <div v-for="h in timelineHours" :key="h"
                   class="absolute top-0 bottom-0 border-l border-apex-border/40"
                   :style="`left:${(h-7)/13*100}%`" />
              <!-- Blok kunjungan -->
              <div v-for="v in sg.visits" :key="v.id"
                   class="absolute top-0.5 bottom-0.5 rounded cursor-pointer transition-opacity hover:opacity-90 group"
                   :style="timelineBarStyle(v)"
                   :class="v.checked_out_at ? 'bg-primary-600/80' : 'bg-orange-500/80'"
                   :title="`${v.client_nama || v.address || 'Kunjungan'} | ${fmtTime(v.checked_in_at)} – ${v.checked_out_at ? fmtTime(v.checked_out_at) : 'aktif'} | ${v.duration_minutes ? fmtDuration(v.duration_minutes) : 'berlangsung'}`">
                <div class="hidden group-hover:block absolute bottom-full left-0 mb-1.5 z-[999] bg-gray-900 border border-white/10 rounded-lg px-3 py-2 text-xs shadow-2xl whitespace-nowrap min-w-[160px]">
                  <!-- Nama klien atau lokasi -->
                  <div class="font-semibold text-white mb-1">{{ v.client_nama || '— Kunjungan —' }}</div>
                  <!-- Produk jika ada -->
                  <div v-if="v.product" class="text-blue-400 mb-1">{{ v.product }}</div>
                  <!-- Alamat jika tidak ada lead atau sebagai info tambahan -->
                  <div v-if="!v.client_nama && v.address" class="text-gray-400 mb-1 max-w-[220px] whitespace-normal leading-tight">{{ v.address }}</div>
                  <!-- Waktu -->
                  <div class="text-gray-300">{{ fmtTime(v.checked_in_at) }} – {{ v.checked_out_at ? fmtTime(v.checked_out_at) : 'masih berlangsung' }}</div>
                  <!-- Durasi -->
                  <div v-if="v.duration_minutes" class="text-gray-500 mt-0.5">{{ fmtDuration(v.duration_minutes) }}</div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-4 mt-3 text-xs text-gray-500">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-primary-600/80" />Selesai (checkout)</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-orange-500/80" />Sedang berlangsung</span>
          </div>
        </div>
      </div>

      <!-- ── REKAP PER SALES ────────────────────────────────────────────── -->
      <div class="card mb-4">
        <div class="section-title mb-3"><i class="fa-solid fa-table mr-1.5 text-emerald-400" />Rekap per Sales</div>
        <div v-if="!(data.sales_recap || []).length" class="text-center text-gray-600 text-sm py-6">Tidak ada data</div>
        <div v-else class="overflow-x-auto">
          <table class="tbl">
            <thead>
              <tr>
                <th>Sales</th>
                <th class="text-right">Total Kunjungan</th>
                <th class="text-right">Hari Aktif</th>
                <th class="text-right">Kunjungan/Hari</th>
                <th class="text-right">Total Durasi</th>
                <th class="text-right">Rata-rata Durasi</th>
                <th class="text-center">Belum Checkout</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="s in (data.sales_recap || [])" :key="s.user_id">
                <td class="font-medium text-gray-200">{{ s.sales_nama }}</td>
                <td class="text-right text-primary-400 font-semibold">{{ s.total_kunjungan }}</td>
                <td class="text-right text-gray-300">{{ s.hari_aktif }}</td>
                <td class="text-right text-gray-300">
                  {{ s.hari_aktif > 0 ? (s.total_kunjungan / s.hari_aktif).toFixed(1) : '0' }}
                </td>
                <td class="text-right text-gray-300">{{ fmtDuration(s.total_durasi) }}</td>
                <td class="text-right text-gray-300">{{ fmtDuration(s.avg_durasi) }}</td>
                <td class="text-center">
                  <span v-if="s.belum_checkout > 0" class="badge-yellow">{{ s.belum_checkout }}</span>
                  <span v-else class="text-gray-600 text-xs">—</span>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="font-semibold bg-apex-card/50">
                <td class="text-gray-400">Total</td>
                <td class="text-right text-primary-400">{{ data.summary.total_kunjungan }}</td>
                <td class="text-right text-gray-400">{{ data.summary.total_hari }}</td>
                <td class="text-right text-gray-400">—</td>
                <td class="text-right text-gray-400">{{ fmtDuration(data.summary.total_durasi) }}</td>
                <td class="text-right text-gray-400">{{ fmtDuration(data.summary.avg_durasi) }}</td>
                <td class="text-center text-gray-400">{{ data.summary.on_going }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- ── TABEL AKTIVITAS DETAIL ─────────────────────────────────────── -->
      <div class="card">
        <div class="flex items-center justify-between mb-3">
          <div class="section-title"><i class="fa-solid fa-list mr-1.5 text-gray-400" />Detail Aktivitas</div>
          <span class="text-xs text-gray-500">{{ data.total || 0 }} entri · halaman {{ data.page || 1 }}/{{ data.total_pages || 1 }}</span>
        </div>
        <div v-if="!(data.activities || []).length" class="text-center text-gray-600 text-sm py-6">Tidak ada data</div>
        <div v-else class="overflow-x-auto">
          <table class="tbl">
            <thead>
              <tr>
                <th>Tgl</th>
                <th>Sales</th>
                <th>Client</th>
                <th>Alamat Check-in</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th class="text-right leading-snug">Jarak<br>Check-In & Out</th>
                <th class="text-right">Durasi</th>
                <th>Catatan</th>
                <th class="text-center">Foto</th>
                <th class="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in (data.activities || [])" :key="a.id">
                <td class="text-xs text-gray-400 whitespace-nowrap">{{ fmt.tgl(a.tgl) }}</td>
                <td class="text-xs font-medium text-gray-200 whitespace-nowrap">{{ a.sales_nama }}</td>
                <td class="text-xs text-gray-300 whitespace-nowrap">{{ a.client_nama || '—' }}</td>
                <td class="text-xs max-w-40 truncate">
                  <button v-if="a.latitude && a.longitude"
                     @click="openMapPopup({ type: 'point', lat: a.latitude, lng: a.longitude, label: a.address || `${a.latitude}, ${a.longitude}` })"
                     class="text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-1 text-left"
                     :title="a.address">
                    <i class="fa-solid fa-location-dot text-[10px]" />{{ a.address || `${a.latitude}, ${a.longitude}` }}
                  </button>
                  <span v-else-if="a.address" class="text-gray-400 flex items-center gap-1">
                    <i class="fa-solid fa-location-dot text-[10px]" />{{ a.address }}
                  </span>
                  <span v-else class="text-gray-600">—</span>
                </td>
                <td class="text-xs text-gray-300 whitespace-nowrap">{{ fmtTime(a.checked_in_at) }}</td>
                <td class="text-xs text-gray-300 whitespace-nowrap">{{ a.checked_out_at ? fmtTime(a.checked_out_at) : '—' }}</td>
                <td class="text-right text-xs whitespace-nowrap">
                  <template v-if="a.distance_km !== null && a.distance_km !== undefined">
                    <div class="flex items-center justify-end gap-1.5">
                      <span :class="a.distance_km > 1 ? 'text-amber-400' : 'text-emerald-400'">
                        {{ a.distance_km < 1 ? `${Math.round(a.distance_km * 1000)} m` : `${a.distance_km} km` }}
                      </span>
                      <button @click="openMapPopup({ type: 'route', lat: a.latitude, lng: a.longitude, lat2: a.checkout_latitude, lng2: a.checkout_longitude, distance: a.distance_km })"
                         title="Lihat rute check-in → check-out"
                         class="text-primary-400 hover:text-primary-300 transition flex-shrink-0">
                        <i class="fa-solid fa-route text-[11px]" />
                      </button>
                    </div>
                  </template>
                  <template v-else-if="a.latitude && a.longitude">
                    <div class="flex items-center justify-end gap-1.5">
                      <span class="text-gray-600">—</span>
                      <button @click="openMapPopup({ type: 'point', lat: a.latitude, lng: a.longitude, label: a.address })"
                         title="Lihat titik check-in"
                         class="text-primary-400/60 hover:text-primary-300 transition flex-shrink-0">
                        <i class="fa-solid fa-location-dot text-[11px]" />
                      </button>
                    </div>
                  </template>
                  <span v-else class="text-gray-600">—</span>
                </td>
                <td class="text-right text-xs text-gray-300 whitespace-nowrap">{{ a.duration_minutes ? fmtDuration(a.duration_minutes) : '—' }}</td>
                <td class="text-xs text-gray-500 max-w-32 truncate" :title="a.notes">{{ a.notes || '—' }}</td>
                <td class="text-center">
                  <button v-if="a.photo_url" @click="lightboxUrl = photoUrl(a.photo_url)"
                    title="Lihat foto check-in" class="focus:outline-none">
                    <img :src="photoUrl(a.photo_url)"
                         class="w-10 h-10 object-cover rounded border border-apex-border hover:border-primary-400 transition mx-auto cursor-zoom-in" />
                  </button>
                  <span v-else class="text-gray-700">—</span>
                </td>
                <td class="text-center">
                  <span v-if="!a.checked_out_at" class="badge-yellow">Aktif</span>
                  <span v-else class="badge-green">Selesai</span>
                </td>
              </tr>
            </tbody>
          </table>
          <AppPagination
            v-model:page="monitorPage"
            v-model:per-page="monitorPerPage"
            :total="data.total ?? 0"
            :total-pages="data.total_pages ?? 1"
            :per-page-options="[10, 25, 50, 100]"
          />
        </div>
      </div>

      <!-- ── PETA SEBARAN KUNJUNGAN ─────────────────────────────────────── -->
      <div class="card mt-4">
        <div class="section-title mb-3">
          <i class="fa-solid fa-map mr-1.5 text-primary-400" />Sebaran Kunjungan
          <span class="text-xs text-gray-500 font-normal ml-2">— {{ (data.map_points || []).length }} titik</span>
        </div>
        <ClientOnly>
          <div ref="mapEl" class="rounded-xl overflow-hidden" style="height:380px;background:#1e293b" />
          <template #fallback>
            <div class="rounded-xl bg-apex-card flex items-center justify-center" style="height:380px">
              <i class="fa-solid fa-circle-notch fa-spin text-2xl text-primary-400" />
            </div>
          </template>
        </ClientOnly>
      </div>
    </template><!-- end v-else-if data -->
    </template><!-- end activity tab -->
  </div>

  <!-- Map Popup -->
  <Teleport to="body">
    <div v-if="mapPopup.show"
         class="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
         @click.self="closeMapPopup">
      <div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <!-- Header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-apex-border">
          <div class="flex items-center gap-2 text-sm font-medium text-apex-text">
            <i :class="mapPopup.type === 'route' ? 'fa-solid fa-route text-amber-400' : 'fa-solid fa-location-dot text-primary-400'" />
            {{ mapPopup.type === 'route' ? `Rute Check-In → Check-Out (${mapPopup.distance !== undefined ? (mapPopup.distance < 1 ? Math.round(mapPopup.distance * 1000) + ' m' : mapPopup.distance + ' km') : ''})` : 'Lokasi Check-In' }}
          </div>
          <button @click="closeMapPopup"
                  class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-apex-card text-apex-muted hover:text-apex-text transition">
            <i class="fa-solid fa-xmark text-sm" />
          </button>
        </div>
        <!-- Map -->
        <div ref="mapPopupEl" style="height: 520px" class="w-full" />
        <!-- Footer -->
        <div class="px-4 py-2.5 border-t border-apex-border flex items-center justify-between">
          <span class="text-xs text-apex-faint truncate max-w-xs">{{ mapPopup.label || '' }}</span>
          <a :href="mapPopup.type === 'route'
                ? `https://www.google.com/maps/dir/${mapPopup.lat},${mapPopup.lng}/${mapPopup.lat2},${mapPopup.lng2}`
                : `https://www.google.com/maps?q=${mapPopup.lat},${mapPopup.lng}`"
             target="_blank" rel="noopener"
             class="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition flex-shrink-0">
            <i class="fa-solid fa-arrow-up-right-from-square text-[10px]" />Buka Google Maps
          </a>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Lightbox foto -->
  <Teleport to="body">
    <div v-if="lightboxUrl" class="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm" style="z-index:9999"
      @click.self="lightboxUrl = null" @keydown.esc="lightboxUrl = null">
      <div class="relative max-w-3xl max-h-[90vh] mx-4">
        <img :src="lightboxUrl" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        <button @click="lightboxUrl = null"
          class="absolute -top-3 -right-3 w-8 h-8 bg-apex-card hover:bg-apex-card/80 text-apex-text rounded-full flex items-center justify-center shadow-lg transition">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get } = useApi()
const fmt = useFormat()

// ── Tab ───────────────────────────────────────────────────────────────────
const activeTab = ref<'activity' | 'live'>('activity')

// ── Live Tracking ─────────────────────────────────────────────────────────
const liveTeam       = ref<any>(null)
const liveTrails     = ref<any[]>([])
const liveLoading    = ref(false)
const liveLastUpdate = ref('')
const liveMapEl      = ref<HTMLElement | null>(null)
let   liveMap: any   = null
let   liveRefreshTimer: ReturnType<typeof setInterval> | null = null
const salesColorMap  = ref<Record<number, string>>({})
let   liveMarkers: any[] = []
let   liveTrailLayers: any[] = []
let   highlightedUserId = ref<number | null>(null)

const LIVE_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16','#f97316','#14b8a6']

function initials(name: string) {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function fmtCoord(lat: any, lng: any): string {
  return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`
}

function fmtTimeAgo(ts: string): string {
  if (!ts) return '—'
  const d = new Date(ts.replace(' ', 'T') + '+07:00')
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return `${diff}d lalu`
  if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`
  return `${Math.floor(diff / 3600)}j lalu`
}

async function loadLive() {
  liveLoading.value = true
  try {
    const [teamData, trailData] = await Promise.all([
      get('/v1/location/team'),
      get('/v1/location/team/trails'),
    ])
    liveTeam.value   = teamData
    liveTrails.value = trailData?.trails || []
    liveLastUpdate.value = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    // Assign colors
    const allSales = [
      ...(teamData?.active || []),
      ...(teamData?.offline || []),
    ]
    allSales.forEach((s: any, i: number) => {
      if (!salesColorMap.value[s.user_id]) {
        salesColorMap.value[s.user_id] = LIVE_COLORS[i % LIVE_COLORS.length]
      }
    })

    await nextTick()
    await initLiveMap()
  } catch (e) {
    console.warn('loadLive error:', e)
  } finally {
    liveLoading.value = false
  }
}

async function initLiveMap() {
  if (!liveMapEl.value) return
  try {
    const L = (await import('leaflet')).default

    if (!liveMap) {
      liveMap = L.map(liveMapEl.value, { zoomControl: true }).setView([-6.2, 106.8], 11)
      await addTileLayer(L, liveMap)
    }

    // Hapus layer lama
    liveMarkers.forEach(m => m.remove())
    liveTrailLayers.forEach(m => m.remove())
    liveMarkers = []
    liveTrailLayers = []

    const bounds: [number, number][] = []

    // Gambar trails
    for (const trail of (liveTrails.value || [])) {
      const color = salesColorMap.value[trail.user_id] || '#6366f1'
      const isHighlighted = highlightedUserId.value === null || highlightedUserId.value === trail.user_id
      const pts = (trail.points || []).map((p: any) => [p.lat, p.lng] as [number, number])
      if (pts.length < 2) continue
      const line = L.polyline(pts, {
        color,
        weight: isHighlighted ? 3 : 1.5,
        opacity: isHighlighted ? 0.8 : 0.3,
      }).addTo(liveMap)
      liveTrailLayers.push(line)
    }

    // Gambar posisi terakhir (active sales)
    for (const s of (liveTeam.value?.active || [])) {
      const color = salesColorMap.value[s.user_id] || '#6366f1'
      const lat = parseFloat(s.latitude)
      const lng = parseFloat(s.longitude)
      bounds.push([lat, lng])

      const icon = L.divIcon({
        className: '',
        html: `<div style="
          position:relative;width:36px;height:36px;
          border-radius:50%;background:${color};
          border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5);
          display:flex;align-items:center;justify-content:center;
          font-size:11px;font-weight:700;color:white;
        ">${initials(s.sales_nama)}<span style="
          position:absolute;bottom:-2px;right:-2px;width:10px;height:10px;
          border-radius:50%;background:#22c55e;border:2px solid white;
        "></span></div>`,
        iconAnchor: [18, 18],
      })

      const timeStr = s.last_seen
        ? new Date(s.last_seen.replace(' ', 'T') + '+07:00').toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
        : '—'

      const marker = L.marker([lat, lng], { icon })
        .bindPopup(`<div style="font-size:12px;min-width:160px">
          <b>${s.sales_nama}</b><br>
          <span style="color:#22c55e">● Online</span><br>
          <span style="color:#9ca3af">${s.address || fmtCoord(lat, lng)}</span><br>
          Terakhir: ${timeStr}
        </div>`)
        .addTo(liveMap)

      liveMarkers.push(marker)
    }

    if (bounds.length) liveMap.fitBounds(bounds, { padding: [50, 50] })
  } catch (e) {
    console.warn('initLiveMap error:', e)
  }
}

function focusSales(s: any) {
  if (!liveMap) return
  liveMap.setView([parseFloat(s.latitude), parseFloat(s.longitude)], 16)
}

function highlightTrail(userId: number) {
  highlightedUserId.value = highlightedUserId.value === userId ? null : userId
  initLiveMap()
}

// Watch tab switch → start/stop auto-refresh
watch(activeTab, (tab) => {
  if (tab === 'live') {
    liveRefreshTimer = setInterval(loadLive, 30000)
  } else {
    if (liveRefreshTimer) { clearInterval(liveRefreshTimer); liveRefreshTimer = null }
    if (liveMap) { liveMap.remove(); liveMap = null }
  }
})

onUnmounted(() => {
  if (liveRefreshTimer) clearInterval(liveRefreshTimer)
})

function photoUrl(path: string): string {
  return `/storage/${path}`
}

// ── Filter ────────────────────────────────────────────────────────────────
function wibDateStr(d = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }) // YYYY-MM-DD
}
function todayStr() { return wibDateStr() }
function daysAgo(n: number) { return wibDateStr(new Date(Date.now() - n * 86400000)) }
function monthStart() {
  const d = new Date(); d.setDate(1)
  return d.toISOString().slice(0, 10)
}

const f = reactive({ date_from: daysAgo(6), date_to: todayStr(), user_id: '' })

const presets = [
  { label: 'Hari ini',   fn: () => ({ date_from: todayStr(),   date_to: todayStr() }) },
  { label: '7 Hari',     fn: () => ({ date_from: daysAgo(6),   date_to: todayStr() }) },
  { label: 'Bulan ini',  fn: () => ({ date_from: monthStart(), date_to: todayStr() }) },
]

function applyPreset(p: { fn: () => any }) {
  const v = p.fn()
  f.date_from = v.date_from
  f.date_to   = v.date_to
  load(true)
}

// ── Data ──────────────────────────────────────────────────────────────────
const data          = ref<any>(null)
const pending       = ref(false)
const monitorPage   = ref(1)
const monitorPerPage = ref(10)
const lightboxUrl = ref<string | null>(null)

// ── Map Popup ──────────────────────────────────────────────────────────────
interface MapPopupState {
  show: boolean
  type: 'point' | 'route'
  lat?: number; lng?: number
  lat2?: number; lng2?: number
  label?: string
  distance?: number
}
const mapPopup    = ref<MapPopupState>({ show: false, type: 'point' })
const mapPopupEl  = ref<HTMLElement | null>(null)
let   popupMap: any = null

async function openMapPopup(opts: Omit<MapPopupState, 'show'>) {
  mapPopup.value = { show: true, ...opts }
  await nextTick()
  await initPopupMap()
}

function closeMapPopup() {
  mapPopup.value = { show: false, type: 'point' }
  if (popupMap) { popupMap.remove(); popupMap = null }
}

async function initPopupMap() {
  if (!mapPopupEl.value) return
  const L = (await import('leaflet')).default
  if (popupMap) { popupMap.remove(); popupMap = null }

  const { lat, lng, lat2, lng2, type } = mapPopup.value

  const center: [number, number] = [lat!, lng!]
  popupMap = L.map(mapPopupEl.value, { zoomControl: true }).setView(center, 15)
  await addTileLayer(L, popupMap)

  const checkinIcon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5)"></div>`,
    iconAnchor: [7, 7],
  })
  const checkoutIcon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5)"></div>`,
    iconAnchor: [7, 7],
  })

  if (type === 'route' && lat2 && lng2) {
    L.marker([lat!, lng!], { icon: checkinIcon }).addTo(popupMap).bindPopup('Check-In').openPopup()
    L.marker([lat2, lng2], { icon: checkoutIcon }).addTo(popupMap).bindPopup('Check-Out')
    L.polyline([[lat!, lng!], [lat2, lng2]], {
      color: '#6366f1', weight: 3, dashArray: '6,5', opacity: 0.85,
    }).addTo(popupMap)
    popupMap.fitBounds([[lat!, lng!], [lat2, lng2]], { padding: [40, 40] })
  } else {
    L.marker([lat!, lng!], { icon: checkinIcon }).addTo(popupMap).bindPopup('Check-In').openPopup()
  }
}

async function load(resetPage = false) {
  if (resetPage) monitorPage.value = 1
  pending.value = true
  try {
    data.value = await get('/v1/field-activity/monitor', {
      date_from: f.date_from,
      date_to  : f.date_to,
      user_id  : f.user_id || undefined,
      page     : monitorPage.value,
      per_page : monitorPerPage.value,
    })
  } finally {
    pending.value = false
  }
}

watch([monitorPage, monitorPerPage], () => load())

// Setelah data berubah, reinit map
watch(() => data.value?.map_points, async () => {
  await nextTick()
  await initMap()
})

onMounted(() => load())

// ── Format helpers ────────────────────────────────────────────────────────
function fmtDuration(mins: number | string): string {
  const m = Math.round(Number(mins) || 0)
  if (!m) return '—'
  const h = Math.floor(m / 60)
  const r = m % 60
  return h > 0 ? `${h}j ${r}m` : `${r}m`
}

function toWibDate(s: string): Date {
  if (!s) return new Date()
  return /Z|[+-]\d{2}:\d{2}$/.test(s) ? new Date(s) : new Date(s.replace(' ', 'T') + '+07:00')
}

function fmtTime(s: string): string {
  if (!s) return '—'
  return toWibDate(s).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })
}

function fmtTgl(s: string): string {
  return new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

function fmtTglShort(s: string): string {
  const d = new Date(s + 'T00:00:00')
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
}

// ── Chart harian ──────────────────────────────────────────────────────────
const chartDays = computed(() => {
  if (!data.value?.daily_recap) return []
  const byDay: Record<string, number> = {}
  for (const r of (data.value?.daily_recap || [])) {
    byDay[r.tgl] = (byDay[r.tgl] || 0) + Number(r.kunjungan)
  }
  return Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).map(([tgl, total]) => ({ tgl, total }))
})

const maxBar = computed(() => Math.max(1, ...chartDays.value.map(d => d.total)))
function chartBarH(v: number): number { return Math.max(4, (v / maxBar.value) * 80) }

// ── Timeline ──────────────────────────────────────────────────────────────
const timelineHours = Array.from({ length: 14 }, (_, i) => i + 7) // 07–20

const timelineDates = computed(() => {
  if (!data.value?.timeline) return []
  const s = new Set<string>()
  for (const v of (data.value?.timeline || [])) s.add(v.tgl)
  return [...s].sort()
})

const selectedTimelineDate = ref('')
watch(timelineDates, (v) => { if (v.length) selectedTimelineDate.value = v[v.length - 1] }, { immediate: true })

const filteredTimeline = computed(() => {
  if (!data.value?.timeline) return []
  if (!selectedTimelineDate.value) return data.value?.timeline || []
  return (data.value?.timeline || []).filter((v: any) => v.tgl === selectedTimelineDate.value)
})

const timelineGroups = computed(() => {
  const groups: Record<string, { nama: string; visits: any[] }> = {}
  for (const v of filteredTimeline.value) {
    if (!groups[v.sales_nama]) groups[v.sales_nama] = { nama: v.sales_nama, visits: [] }
    groups[v.sales_nama].visits.push(v)
  }
  return Object.values(groups)
})

function timelineBarStyle(v: any): Record<string, string> {
  const inDate  = toWibDate(v.checked_in_at)
  const inH  = inDate.getUTCHours() + 7  // WIB offset
  const inM  = inDate.getUTCMinutes()
  const inMin  = inH * 60 + inM

  let durMin = v.duration_minutes ? Number(v.duration_minutes) : 30
  if (!v.checked_out_at) durMin = 30 // sedang berlangsung: tampilkan 30m

  const dayStart = 7 * 60 // 07:00 WIB
  const dayEnd   = 20 * 60 // 20:00 WIB
  const daySpan  = dayEnd - dayStart

  const left = Math.max(0, Math.min(100, (inMin - dayStart) / daySpan * 100))
  const width = Math.max(1, Math.min(100 - left, durMin / daySpan * 100))

  return { left: `${left}%`, width: `${width}%` }
}

// ── Map sebaran ───────────────────────────────────────────────────────────
const mapEl   = ref<HTMLElement | null>(null)
let   map: any = null
let   L: any   = null

const COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#ec4899','#84cc16']

async function initMap() {
  try {
  if (!mapEl.value || !data.value?.map_points) return
  L = (await import('leaflet')).default
  await import('leaflet.markercluster')

  if (map) { map.remove(); map = null }

  map = L.map(mapEl.value, { zoomControl: true }).setView([-6.2, 106.8], 11)
  await addTileLayer(L, map)

  const points = data.value?.map_points || []
  if (!points.length) return

  // Warna per sales
  const salesColors: Record<number, string> = {}
  let ci = 0
  const bounds: [number, number][] = []

  // Cluster group — spiderfy otomatis saat zoom max atau klik cluster di titik sama
  const cluster = (L as any).markerClusterGroup({
    maxClusterRadius: 30,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    iconCreateFunction: (c: any) => {
      const count = c.getChildCount()
      return L.divIcon({
        className: '',
        html: `<div style="
          width:32px;height:32px;border-radius:50%;
          background:#6366f1;border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,.4);
          display:flex;align-items:center;justify-content:center;
          font-size:12px;font-weight:700;color:white;
        ">${count}</div>`,
        iconAnchor: [16, 16],
      })
    },
  })

  for (const p of points) {
    if (!salesColors[p.user_id]) salesColors[p.user_id] = COLORS[ci++ % COLORS.length]
    const color = salesColors[p.user_id]
    const lat = parseFloat(p.latitude)
    const lng = parseFloat(p.longitude)
    bounds.push([lat, lng])

    const icon = L.divIcon({
      className: '',
      html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>`,
      iconAnchor: [6, 6],
    })

    const timeStr = toWibDate(p.checked_in_at).toLocaleString('id-ID', { day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Jakarta' })

    const marker = L.marker([lat, lng], { icon })
      .bindPopup(`<div style="font-size:12px;min-width:160px">
        <b>${p.sales_nama}</b><br>
        ${p.client_nama || '—'}<br>
        ${p.product ? `<span style="color:#38bdf8">${p.product}</span><br>` : ''}
        <span style="color:#9ca3af">${timeStr}</span>
        ${p.duration_minutes ? `<br>Durasi: ${fmtDuration(p.duration_minutes)}` : ''}
      </div>`)

    cluster.addLayer(marker)
  }

  map.addLayer(cluster)
  if (bounds.length) map.fitBounds(bounds, { padding: [30, 30] })
  } catch (e) { console.warn('initMap error:', e) }
}

onUnmounted(() => { if (map) { map.remove(); map = null } })

// ── Export CSV ────────────────────────────────────────────────────────────
function exportCsv() {
  const rows = data.value?.activities || []
  if (!rows.length) return
  const headers = ['Tanggal','Sales','Client','Alamat','Check-in','Check-out','Jarak (km)','Durasi (menit)','Catatan','Status']
  const lines = [headers.join(',')]
  for (const a of rows) {
    lines.push([
      a.tgl,
      `"${a.sales_nama}"`,
      `"${a.client_nama || ''}"`,
      `"${(a.address || '').replace(/"/g,'""')}"`,
      fmtTime(a.checked_in_at),
      a.checked_out_at ? fmtTime(a.checked_out_at) : '',
      a.distance_km ?? '',
      a.duration_minutes || '',
      `"${(a.notes || '').replace(/"/g,'""')}"`,
      a.checked_out_at ? 'Selesai' : 'Aktif',
    ].join(','))
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `field_activity_${f.date_from}_${f.date_to}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>
