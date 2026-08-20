<template>
  <div>
    <!-- Header -->
    <div class="page-header mb-5">
      <div>
        <h1 class="page-title"><i class="fa-solid fa-tasks text-primary-400 mr-2" />Revenue Tracker</h1>
        <p class="page-subtitle">{{ data?.total_projects }} proyek · {{ selectedYear }}</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <NuxtLink to="/revenue/invoice" class="btn-secondary btn-sm">
          <i class="fa-solid fa-file-invoice" />Invoice & Payment
        </NuxtLink>
        <!-- Tombol Import Won — badge jumlah pending -->
        <button @click="openImportModal" class="btn-secondary btn-sm relative">
          <i class="fa-solid fa-trophy text-yellow-400" />Import Pipeline Won
          <span v-if="wonPending > 0"
                class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center leading-none">
            {{ wonPending }}
          </span>
        </button>
        <!-- Tombol Recycle Bin — hanya admin -->
        <button v-if="isAdmin" @click="openTrash" class="btn-secondary btn-sm relative">
          <i class="fa-solid fa-trash-can text-red-400" />Recycle Bin
          <span v-if="trashedCount > 0"
                class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center leading-none">
            {{ trashedCount }}
          </span>
        </button>
        <button @click="exportInvoiceTemplate" class="btn-secondary btn-sm">
          <i class="fa-solid fa-file-excel text-green-400" />Export Template Invoice
        </button>
        <button @click="showNewForm = true" class="btn-primary btn-sm">
          <i class="fa-solid fa-plus" />Tambah Proyek
        </button>
      </div>
    </div>

    <!-- ── SUMMARY STRIP ─────────────────────────────────────────── -->
    <div v-if="data" class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-5">
      <!-- Revenue -->
      <div class="stat-card col-span-2 md:col-span-1 xl:col-span-1">
        <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-bullseye" /></div>
        <div>
          <div class="stat-value text-xs">{{ fmt.rupiah(data.total_target) }}</div>
          <div class="stat-label">Total Target</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-coins" /></div>
        <div>
          <div class="stat-value text-xs text-emerald-400">{{ fmt.rupiah(data.total_actual) }}</div>
          <div class="stat-label">Realisasi</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-percent" /></div>
        <div>
          <div class="stat-value" :class="data.ach_pct>=80?'text-emerald-400':data.ach_pct>=50?'text-yellow-400':'text-red-400'">
            {{ data.ach_pct }}%
          </div>
          <div class="stat-label">Achievement</div>
        </div>
      </div>

      <!-- Divider visual -->
      <div class="hidden xl:flex items-center justify-center">
        <div class="w-px h-8 bg-navy-700" />
      </div>

      <!-- Invoice -->
      <div class="stat-card">
        <div class="stat-icon bg-amber-900/40 text-amber-400"><i class="fa-solid fa-file-invoice-dollar" /></div>
        <div>
          <div class="stat-value text-xs text-amber-300">{{ fmt.rupiah(inv.total_amount) }}</div>
          <div class="stat-label">Billed</div>
          <div class="text-xs text-gray-600 mt-0.5">{{ inv.total_inv }} invoice</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-circle-check" /></div>
        <div>
          <div class="stat-value text-xs text-emerald-400">{{ fmt.rupiah(inv.total_paid) }}</div>
          <div class="stat-label">Collected</div>
          <div class="text-xs text-gray-600 mt-0.5">{{ inv.lunas_count }} lunas</div>
        </div>
      </div>
      <div class="stat-card" :class="inv.outstanding > 0 ? 'border border-orange-800/40' : ''">
        <div class="stat-icon" :class="inv.outstanding > 0 ? 'bg-orange-900/40 text-orange-400' : 'bg-gray-800 text-gray-500'">
          <i class="fa-solid fa-hourglass-half" />
        </div>
        <div>
          <div class="stat-value text-xs" :class="inv.outstanding > 0 ? 'text-orange-400' : 'text-gray-400'">
            {{ fmt.rupiah(inv.outstanding) }}
          </div>
          <div class="stat-label">Outstanding</div>
          <div class="text-xs mt-0.5" :class="inv.outstanding > 0 ? 'text-orange-500/70' : 'text-gray-600'">
            {{ inv.belum_count }} belum lunas
          </div>
        </div>
      </div>
    </div>

    <!-- ── PROJECT STATUS CARDS ─────────────────────────────────── -->
    <div v-if="data" class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
      <div class="stat-card border border-blue-800/40">
        <div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-circle-play" /></div>
        <div>
          <div class="stat-value text-blue-300">{{ psCounts['Active'] ?? 0 }}</div>
          <div class="stat-label">Active</div>
        </div>
      </div>
      <div class="stat-card border border-yellow-800/40">
        <div class="stat-icon bg-yellow-900/40 text-yellow-400"><i class="fa-solid fa-pause-circle" /></div>
        <div>
          <div class="stat-value text-yellow-300">{{ psCounts['On Hold'] ?? 0 }}</div>
          <div class="stat-label">On Hold</div>
        </div>
      </div>
      <div class="stat-card border border-emerald-800/40">
        <div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-circle-check" /></div>
        <div>
          <div class="stat-value text-emerald-300">{{ psCounts['Completed'] ?? 0 }}</div>
          <div class="stat-label">Completed</div>
        </div>
      </div>
      <div class="stat-card border border-red-800/40">
        <div class="stat-icon bg-red-900/40 text-red-400"><i class="fa-solid fa-circle-xmark" /></div>
        <div>
          <div class="stat-value text-red-300">{{ psCounts['Failed'] ?? 0 }}</div>
          <div class="stat-label">Failed</div>
        </div>
      </div>
    </div>

    <!-- ── INVOICE SUMMARY PANEL ─────────────────────────────────── -->
    <div v-if="data" class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">

      <!-- Collection Rate -->
      <div class="card">
        <div class="section-title mb-3">
          <i class="fa-solid fa-hand-holding-dollar mr-1.5 text-emerald-400" />Collection Rate
        </div>
        <!-- Gauge ring -->
        <div class="flex items-center gap-4">
          <div class="relative w-20 h-20 flex-shrink-0">
            <svg class="w-full h-full -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="30" fill="none" stroke="#1e293b" stroke-width="10"/>
              <circle cx="40" cy="40" r="30" fill="none"
                      :stroke="inv.collection_rate >= 90 ? '#34d399' : inv.collection_rate >= 70 ? '#facc15' : '#f87171'"
                      stroke-width="10" stroke-linecap="round"
                      :stroke-dasharray="`${inv.collection_rate * 1.885} 188.5`"
                      style="transition:stroke-dasharray 0.8s ease"/>
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <span class="text-lg font-bold text-white">{{ inv.collection_rate }}%</span>
            </div>
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Invoiced</span>
              <span class="text-gray-200 font-medium">{{ fmt.rupiah(inv.total_amount) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Terkumpul</span>
              <span class="text-emerald-400 font-medium">{{ fmt.rupiah(inv.total_paid) }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Sisa Tagih</span>
              <span class="font-medium" :class="inv.outstanding > 0 ? 'text-orange-400' : 'text-gray-500'">
                {{ fmt.rupiah(inv.outstanding) }}
              </span>
            </div>
            <div class="h-px bg-navy-700" />
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Proyek dg invoice</span>
              <span class="text-gray-300">{{ inv.projects_with_inv }} dari {{ data.total_projects }}</span>
            </div>
          </div>
        </div>
        <NuxtLink to="/revenue/invoice"
                  class="mt-4 flex items-center justify-between px-3 py-2 rounded-lg bg-primary-900/20 border border-primary-800/40 hover:bg-primary-900/40 transition-colors group">
          <span class="text-xs text-primary-300">Kelola Invoice & Payment</span>
          <i class="fa-solid fa-arrow-right text-xs text-primary-400 group-hover:translate-x-0.5 transition-transform" />
        </NuxtLink>
      </div>

      <!-- Invoice Status Breakdown -->
      <div class="card">
        <div class="section-title mb-3">
          <i class="fa-solid fa-chart-pie mr-1.5 text-primary-400" />Status Invoice
        </div>
        <!-- Visual bar -->
        <div class="flex h-6 rounded-lg overflow-hidden mb-3 bg-navy-800">
          <div class="bg-emerald-500 flex items-center justify-center transition-all duration-700"
               :style="`width:${inv.total_inv ? inv.lunas_count/inv.total_inv*100 : 0}%`">
            <span v-if="inv.lunas_count/inv.total_inv*100 > 15" class="text-xs font-bold text-white">
              {{ inv.lunas_count }} Lunas
            </span>
          </div>
          <div class="bg-orange-500 flex items-center justify-center transition-all duration-700"
               :style="`width:${inv.total_inv ? inv.belum_count/inv.total_inv*100 : 0}%`">
            <span v-if="inv.belum_count/inv.total_inv*100 > 15" class="text-xs font-bold text-white">
              {{ inv.belum_count }} Belum
            </span>
          </div>
        </div>
        <div class="space-y-2.5">
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
            <div class="flex-1">
              <div class="flex justify-between text-xs mb-0.5">
                <span class="text-gray-300">Lunas</span>
                <span class="font-semibold text-emerald-400">{{ inv.lunas_count }} invoice</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <div class="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0" />
            <div class="flex-1">
              <div class="flex justify-between text-xs mb-0.5">
                <span class="text-gray-300">Belum / Partial</span>
                <span class="font-semibold text-orange-400">{{ inv.belum_count }} invoice</span>
              </div>
              <div class="text-xs text-gray-500">Nilai: {{ fmt.rupiah(inv.outstanding) }}</div>
            </div>
          </div>
        </div>
        <div v-if="inv.belum_count > 0" class="mt-3 p-2.5 rounded-lg bg-orange-900/10 border border-orange-900/30">
          <div class="text-xs text-orange-300">
            <i class="fa-solid fa-triangle-exclamation mr-1" />
            {{ inv.belum_count }} invoice belum lunas senilai {{ fmt.rupiah(inv.outstanding) }} perlu ditagih.
          </div>
        </div>
        <div v-else class="mt-3 p-2.5 rounded-lg bg-emerald-900/10 border border-emerald-900/30">
          <div class="text-xs text-emerald-300">
            <i class="fa-solid fa-circle-check mr-1" />Semua invoice sudah lunas!
          </div>
        </div>
      </div>

      <!-- Unpaid Invoices list -->
      <div class="card">
        <div class="section-title mb-3">
          <i class="fa-solid fa-clock mr-1.5 text-orange-400" />Invoice Belum Lunas
          <NuxtLink to="/revenue/invoice?status=Belum"
                    class="ml-auto text-xs text-primary-400 hover:text-primary-300 font-normal">
            Lihat Semua →
          </NuxtLink>
        </div>
        <div v-if="data.unpaid_invoices?.length" class="space-y-2">
          <div v-for="inv in unpaidSlice" :key="inv.id"
               class="flex items-center gap-2 p-2 rounded-lg bg-orange-900/10 border border-orange-900/20 hover:border-orange-700/40 transition-colors">
            <div class="flex-1 min-w-0">
              <div class="text-xs font-medium text-gray-200 truncate">{{ inv.client }}</div>
              <div class="text-xs text-gray-500">{{ inv.invoice_no || inv.project_id }} · {{ inv.period }}</div>
            </div>
            <div class="text-right flex-shrink-0">
              <div class="text-xs font-semibold text-orange-400">{{ fmt.rupiah(inv.outstanding) }}</div>
              <div class="text-xs text-gray-600">{{ fmt.tgl(inv.invoice_date) }}</div>
            </div>
          </div>
          <div v-if="unpaidPages > 1" class="flex items-center justify-between pt-1">
            <span class="text-xs text-gray-600">{{ unpaidPage }}/{{ unpaidPages }}</span>
            <div class="flex gap-1">
              <button :disabled="unpaidPage <= 1"
                class="btn-ghost btn-xs rounded px-2 disabled:opacity-30"
                @click="unpaidPage--">
                <i class="fa-solid fa-chevron-left text-xs" />
              </button>
              <button :disabled="unpaidPage >= unpaidPages"
                class="btn-ghost btn-xs rounded px-2 disabled:opacity-30"
                @click="unpaidPage++">
                <i class="fa-solid fa-chevron-right text-xs" />
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-6">
          <i class="fa-solid fa-circle-check text-emerald-400 text-2xl mb-2 block" />
          <div class="text-xs text-gray-500">Tidak ada invoice outstanding</div>
        </div>
        <NuxtLink to="/revenue/invoice"
                  class="mt-3 btn-secondary btn-sm w-full justify-center text-xs">
          <i class="fa-solid fa-file-invoice" />Kelola Semua Invoice
        </NuxtLink>
      </div>

    </div>

    <!-- ── FILTERS ───────────────────────────────────────────────── -->
    <div class="card mb-4">
      <div class="flex flex-wrap gap-3">
        <input v-model="f.search" class="form-input w-48" placeholder="🔍 Cari produk/client..." @input="debouncedFetch" />
        <select v-model="f.organisasi" class="form-select w-32" @change="fetchData">
          <option value="">Semua Organisasi</option>
          <option v-for="o in data?.owners || []" :key="o">{{ o }}</option>
        </select>
        <select v-model="f.kategori" class="form-select w-32" @change="fetchData">
          <option value="">Semua Kategori</option>
          <option>Project</option><option>Recurring</option>
        </select>
        <select v-model="f.project_status" class="form-select w-32" @change="fetchData">
          <option value="">Semua Status</option>
          <option>Active</option><option>On Hold</option><option>Completed</option><option>Failed</option>
        </select>
        <select v-model="f.status" class="form-select w-32" @change="fetchData">
          <option value="">Semua Status</option>
          <option>On Track</option><option>At Risk</option><option>Critical</option>
        </select>
        <select v-model.number="f.tahun" class="form-select w-24" @change="fetchData">
          <option v-for="y in data?.years || []" :key="y" :value="y">{{ y }}</option>
        </select>
        <button @click="resetFilters" class="btn-secondary btn-sm ml-auto">
          <i class="fa-solid fa-xmark" />Reset
        </button>
      </div>
    </div>

    <!-- ── PROJECT TABLE ─────────────────────────────────────────── -->
    <div v-if="pending && !data" class="flex justify-center py-16">
      <i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" />
    </div>

    <div v-if="data" class="card overflow-x-auto" :class="pending ? 'opacity-70' : ''">
      <div class="flex items-center justify-between mb-3">
        <div class="section-title mb-0">Daftar Proyek</div>
        <button @click="showProjectListInfo = true"
          class="w-6 h-6 rounded-full flex items-center justify-center text-gray-400 hover:text-primary-400 hover:bg-apex-border transition"
          title="Penjelasan kolom">
          <i class="fa-solid fa-circle-info text-sm" />
        </button>
      </div>
      <table class="tbl">
        <thead>
          <tr>
            <th>Project</th>
            <th>Client</th>
            <th>Organisasi</th>
            <th>Kategori</th>
            <th>Type</th>
            <th>Target Invoice</th>
            <th class="text-right">Target</th>
            <th class="text-right">Billed</th>
            <th class="text-right">Collected</th>
            <th>Ach. %</th>
            <th>Status</th>
            <th>Project Status</th>
            <th>Risk</th>
            <th class="text-center">Invoice</th>
            <th class="text-center w-14">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="p in data?.projects" :key="p.project_id">
            <!-- ── Main Project Row ── -->
            <tr :class="[
              expandedProjects.has(p.project_id) ? 'bg-navy-800/60' : '',
              (['On Hold','Failed'].includes(p.project_status)) ? 'opacity-60' : ''
            ]">
              <td>
                <div class="text-xs font-medium text-gray-200">{{ p.project_id }}</div>
                <div class="text-xs text-gray-500 max-w-32 truncate">{{ p.product }}</div>
              </td>
              <td class="text-xs text-gray-300 max-w-36 truncate">{{ p.client }}</td>
              <td class="text-xs text-gray-400">{{ p.organisasi }}</td>
              <td>
                <span :class="p.kategori === 'Project' ? 'badge-blue' : 'badge-purple'">{{ p.kategori }}</span>
              </td>
              <!-- Type + expand button for Termin/Bulanan -->
              <td>
                <div class="flex flex-col items-start gap-1">
                  <span v-if="p.type" :class="typeBadge(p.type)">{{ p.type }}</span>
                  <span v-else class="text-xs text-gray-600">—</span>
                  <!-- Tombol expand detail termin/bulanan -->
                  <button v-if="p.type === 'Termin' || p.type === 'Bulanan'"
                          @click="toggleExpand(p)"
                          class="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                    <i class="fa-solid text-xs"
                       :class="expandedProjects.has(p.project_id) ? 'fa-chevron-up' : 'fa-chevron-down'" />
                    <span>{{ expandedProjects.has(p.project_id) ? 'Tutup' : 'Lihat Termin' }}</span>
                  </button>
                </div>
              </td>
              <!-- Target Invoice Period -->
              <td class="min-w-[130px]">
                <div v-if="p.target_period_label" class="text-xs space-y-0.5">
                  <div class="text-gray-400">
                    Target: <span class="text-gray-200 font-medium">{{ p.target_period_label }}</span>
                  </div>
                  <div v-if="p.actual_period_label" class="text-gray-500">
                    Terbit: <span class="text-emerald-400">{{ p.actual_period_label }}</span>
                  </div>
                  <span :class="invoicePeriodBadge(p.invoice_period_status)">
                    {{ p.invoice_period_status }}
                  </span>
                </div>
                <span v-else class="text-xs text-gray-600">—</span>
              </td>
              <td class="text-right text-xs text-gray-300">{{ fmt.rupiah(p.revenue_target) }}</td>
              <td class="text-right text-xs text-amber-300 font-medium">{{ fmt.rupiah(p.inv?.total_amount ?? 0) }}</td>
              <td class="text-right text-xs text-emerald-300 font-medium">{{ fmt.rupiah(p.invoice_actual) }}</td>
              <td class="w-28">
                <!-- Bulanan/Termin: pakai YTD achievement s.d. bulan berjalan -->
                <div class="flex items-center gap-1.5">
                  <div class="flex-1 h-1.5 bg-navy-700 rounded overflow-hidden">
                    <div class="h-full rounded transition-all"
                         :class="fmt.achBgColor(p.is_ytd ? p.ytd_ach_pct : p.achievement_pct)"
                         :style="`width:${Math.min(p.is_ytd ? p.ytd_ach_pct : p.achievement_pct, 100)}%`" />
                  </div>
                  <span class="text-xs w-9 text-right flex-shrink-0"
                        :class="fmt.achColor(p.is_ytd ? p.ytd_ach_pct : p.achievement_pct)">
                    {{ (p.is_ytd ? p.ytd_ach_pct : p.achievement_pct).toFixed(0) }}%
                  </span>
                </div>
                <div v-if="p.is_ytd" class="text-xs text-gray-600 mt-0.5 leading-tight">
                  YTD bln {{ p.cur_month }}
                </div>
              </td>
              <td><span :class="fmt.statusClass(p.status)">{{ p.status }}</span></td>
              <td @click.stop>
                <select :value="p.project_status"
                        @change="updateProjectStatus(p.project_id, ($event.target as HTMLSelectElement).value)"
                        class="text-xs rounded px-1.5 py-0.5 border cursor-pointer"
                        :class="{
                          'bg-blue-900/40 border-blue-700 text-blue-300': p.project_status === 'Active',
                          'bg-yellow-900/40 border-yellow-700 text-yellow-300': p.project_status === 'On Hold',
                          'bg-emerald-900/40 border-emerald-700 text-emerald-300': p.project_status === 'Completed',
                          'bg-red-900/40 border-red-700 text-red-300': p.project_status === 'Failed',
                        }">
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                  <option value="Failed">Failed</option>
                </select>
              </td>
              <td><span :class="fmt.riskClass(p.risk_level)">{{ p.risk_level }}</span></td>
              <!-- Invoice cell -->
              <td class="text-center">
                <div v-if="p.inv" class="flex flex-col items-center gap-0.5">
                  <div class="flex items-center gap-1">
                    <span class="text-xs font-semibold"
                          :class="p.inv.belum_count > 0 ? 'text-orange-400' : 'text-emerald-400'">
                      {{ p.inv.total_inv }}
                    </span>
                    <span class="text-xs text-gray-600">inv</span>
                  </div>
                  <div class="text-xs" :class="p.inv.outstanding > 0 ? 'text-orange-400' : 'text-emerald-400'">
                    {{ p.inv.outstanding > 0 ? fmt.rupiah(p.inv.outstanding) + ' sisa' : '✓ Lunas' }}
                  </div>
                  <NuxtLink :to="`/revenue/invoice?project=${p.project_id}`"
                            class="text-xs text-primary-400 hover:text-primary-300 mt-0.5">
                    Detail →
                  </NuxtLink>
                </div>
                <div v-else class="flex flex-col items-center gap-1">
                  <span class="text-xs text-gray-600">—</span>
                  <NuxtLink :to="`/revenue/invoice`"
                            class="text-xs text-gray-500 hover:text-primary-400">
                    + Invoice
                  </NuxtLink>
                </div>
              </td>
              <!-- Aksi: Edit + Delete (delete hanya admin) -->
              <td class="text-center">
                <div class="flex items-center justify-center gap-1">
                  <button @click="openEdit(p)" class="btn-ghost btn-xs text-gray-400 hover:text-primary-400" title="Edit proyek">
                    <i class="fa-solid fa-pen text-xs" />
                  </button>
                  <!-- Tombol delete: tampil hanya untuk Admin -->
                  <button v-if="isAdmin"
                          @click="openDelete(p)"
                          class="btn-ghost btn-xs text-gray-600 hover:text-red-400"
                          title="Hapus proyek (Admin)">
                    <i class="fa-solid fa-trash text-xs" />
                  </button>
                  <!-- Non-admin: icon terkunci -->
                  <span v-else
                        class="inline-flex items-center justify-center w-6 h-6 text-gray-700 cursor-not-allowed"
                        title="Hanya Admin yang dapat menghapus proyek">
                    <i class="fa-solid fa-lock text-xs" />
                  </span>
                </div>
              </td>
            </tr>

            <!-- ── Expand: Detail Termin / Bulanan ── -->
            <tr v-if="expandedProjects.has(p.project_id)" class="bg-navy-900/80">
              <td colspan="14" class="p-0">
                <div class="mx-4 my-3">
                  <!-- Loading state -->
                  <div v-if="monthlyLoading.has(p.project_id)" class="flex items-center gap-2 py-4 justify-center">
                    <i class="fa-solid fa-circle-notch fa-spin text-primary-400" />
                    <span class="text-xs text-gray-500">Memuat data termin...</span>
                  </div>

                  <!-- Data loaded -->
                  <div v-else-if="monthlyData[p.project_id]" class="rounded-xl border border-navy-700 overflow-hidden">
                    <!-- Sub header -->
                    <div class="flex items-center justify-between px-4 py-2.5 bg-navy-800 border-b border-navy-700">
                      <div class="flex items-center gap-3">
                        <span class="text-xs font-semibold text-white">
                          <i class="fa-solid fa-layer-group mr-1.5 text-primary-400" />
                          Rincian {{ p.type === 'Termin' ? 'Termin' : 'Bulanan' }} — {{ p.project_id }}
                        </span>
                        <span class="badge-gray text-xs">
                          {{ monthlyData[p.project_id].monthly.length }} {{ p.type === 'Termin' ? 'termin' : 'bulan' }}
                        </span>
                      </div>
                      <div class="flex items-center gap-4 text-xs">
                        <span class="text-gray-500">
                          Total Target: <span class="text-gray-200 font-medium">{{ fmt.rupiah(monthlyData[p.project_id].total_target) }}</span>
                        </span>
                        <span class="text-gray-500">
                          Realisasi: <span class="text-emerald-400 font-medium">{{ fmt.rupiah(monthlyData[p.project_id].total_actual) }}</span>
                        </span>
                        <button @click="openAddTermin(p)" class="btn-primary btn-xs text-xs">
                          <i class="fa-solid fa-plus" />Tambah {{ p.type === 'Termin' ? 'Termin' : 'Bulan' }}
                        </button>
                      </div>
                    </div>

                    <!-- Termin table -->
                    <table class="w-full text-xs">
                      <thead class="bg-navy-800/60">
                        <tr>
                          <th class="px-3 py-2 text-left text-gray-500 font-medium w-16">
                            {{ p.type === 'Termin' ? 'Termin' : 'Bln' }}
                          </th>
                          <th class="px-3 py-2 text-left text-gray-500 font-medium">Bulan</th>
                          <th class="px-3 py-2 text-right text-gray-500 font-medium">Target Revenue</th>
                          <th class="px-3 py-2 text-right text-gray-500 font-medium">Realisasi</th>
                          <th class="px-3 py-2 text-center text-gray-500 font-medium w-28">Achievement</th>
                          <th class="px-3 py-2 text-center text-gray-500 font-medium w-24">Status</th>
                          <th class="px-3 py-2 text-center text-gray-500 font-medium w-14">Aksi</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-navy-800">
                        <tr v-for="m in terminSlice(p.project_id)" :key="m.id"
                            class="hover:bg-navy-800/40 transition-colors">
                          <td class="px-3 py-2">
                            <span class="font-semibold text-primary-300">{{ p.type === 'Termin' ? m.termin_no : m.month_num }}</span>
                          </td>
                          <td class="px-3 py-2 text-gray-300">{{ m.month_name }}</td>
                          <td class="px-3 py-2 text-right text-gray-300 font-medium">
                            {{ fmt.rupiah(m.target) }}
                          </td>
                          <td class="px-3 py-2 text-right font-semibold"
                              :class="m.actual > 0 ? 'text-emerald-400' : 'text-gray-600'">
                            {{ m.actual > 0 ? fmt.rupiah(m.actual) : '—' }}
                          </td>
                          <td class="px-3 py-2">
                            <div class="flex items-center gap-1.5">
                              <div class="flex-1 h-1.5 bg-navy-700 rounded overflow-hidden">
                                <div class="h-full rounded transition-all"
                                     :class="fmt.achBgColor(m.ach_pct)"
                                     :style="`width:${Math.min(m.ach_pct, 100)}%`" />
                              </div>
                              <span class="text-gray-400 w-8 text-right">{{ m.ach_pct }}%</span>
                            </div>
                          </td>
                          <td class="px-3 py-2 text-center">
                            <span :class="terminStatusBadge(m.status)">{{ m.status }}</span>
                          </td>
                          <td class="px-3 py-2 text-center">
                            <button @click="openEditTermin(p.project_id, m)"
                                    class="btn-ghost btn-xs text-gray-500 hover:text-primary-400">
                              <i class="fa-solid fa-pen text-xs" />
                            </button>
                          </td>
                        </tr>
                        <!-- Subtotal row -->
                        <tr class="bg-navy-800/80 font-semibold">
                          <td colspan="2" class="px-3 py-2 text-gray-400 text-xs">Total</td>
                          <td class="px-3 py-2 text-right text-gray-200">
                            {{ fmt.rupiah(monthlyData[p.project_id].total_target) }}
                          </td>
                          <td class="px-3 py-2 text-right text-emerald-400">
                            {{ fmt.rupiah(monthlyData[p.project_id].total_actual) }}
                          </td>
                          <td class="px-3 py-2">
                            <div class="flex items-center gap-1.5">
                              <div class="flex-1 h-1.5 bg-navy-700 rounded overflow-hidden">
                                <div class="h-full rounded"
                                     :class="fmt.achBgColor(monthlyData[p.project_id].total_target > 0 ? monthlyData[p.project_id].total_actual / monthlyData[p.project_id].total_target * 100 : 0)"
                                     :style="`width:${Math.min(monthlyData[p.project_id].total_target > 0 ? monthlyData[p.project_id].total_actual / monthlyData[p.project_id].total_target * 100 : 0, 100)}%`" />
                              </div>
                              <span class="text-gray-300 w-8 text-right">
                                {{ monthlyData[p.project_id].total_target > 0
                                   ? (monthlyData[p.project_id].total_actual / monthlyData[p.project_id].total_target * 100).toFixed(0)
                                   : 0 }}%
                              </span>
                            </div>
                          </td>
                          <td colspan="2" />
                        </tr>
                      </tbody>
                    </table>
                    <div v-if="terminTotalPages(p.project_id) > 1" class="px-4 py-2 border-t border-navy-700">
                      <AppPagination
                        :page="terminPages[p.project_id] ?? 1"
                        :total-pages="terminTotalPages(p.project_id)"
                        :total="monthlyData[p.project_id].monthly.length"
                        :per-page="TERMIN_PER_PAGE"
                        @update:page="setTerminPage(p.project_id, $event)"
                      />
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>

          <tr v-if="!data?.projects?.length">
            <td colspan="13" class="py-8 text-center text-gray-600">Tidak ada proyek ditemukan</td>
          </tr>
        </tbody>
      </table>
      <AppPagination
        v-model:page="page"
        v-model:per-page="perPage"
        :total="data?.total ?? 0"
        :total-pages="data?.total_pages ?? 1"
        :per-page-options="[10, 25, 50]"
      />
    </div>

    <!-- ── DELETE KONFIRMASI MODAL ──────────────────────────────── -->
    <div v-if="deleteModal.show" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-red-900/50 rounded-xl w-full max-w-md shadow-2xl">
        <div class="flex items-center gap-3 p-5 border-b border-navy-800">
          <div class="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0">
            <i class="fa-solid fa-triangle-exclamation text-red-400" />
          </div>
          <div>
            <h3 class="font-semibold text-white">Hapus Proyek</h3>
            <p class="text-xs text-gray-500 mt-0.5">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>
        <div class="p-5 space-y-4">
          <!-- Info proyek yang akan dihapus -->
          <div class="p-3 rounded-lg bg-navy-800 border border-navy-700 space-y-1.5">
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Project ID</span>
              <span class="text-gray-200 font-medium">{{ deleteModal.project_id }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Client</span>
              <span class="text-gray-300">{{ deleteModal.client }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Produk</span>
              <span class="text-gray-300">{{ deleteModal.product }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Organisasi</span>
              <span class="text-gray-300">{{ deleteModal.organisasi }}</span>
            </div>
            <div class="flex justify-between text-xs">
              <span class="text-gray-500">Target Revenue</span>
              <span class="text-yellow-400 font-medium">{{ fmt.rupiah(deleteModal.revenue_target) }}</span>
            </div>
          </div>
          <!-- Peringatan data terkait -->
          <div class="p-3 rounded-lg bg-red-900/10 border border-red-900/30">
            <div class="text-xs text-red-300 space-y-1">
              <div class="font-medium mb-1.5">
                <i class="fa-solid fa-triangle-exclamation mr-1" />Data berikut akan ikut terhapus:
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle text-red-600" style="font-size:5px" />
                <span>Semua data monthly monitoring proyek ini</span>
              </div>
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle text-red-600" style="font-size:5px" />
                <span>Semua invoice & data pembayaran proyek ini</span>
              </div>
            </div>
          </div>
          <!-- Konfirmasi ketik project_id -->
          <div>
            <label class="form-label text-red-400">
              Ketik <span class="font-mono font-bold">{{ deleteModal.project_id }}</span> untuk konfirmasi
            </label>
            <input v-model="deleteModal.confirm_text" class="form-input border-red-900/50 focus:border-red-600"
                   :placeholder="deleteModal.project_id" autocomplete="off" />
          </div>
        </div>
        <div class="flex gap-2 justify-end p-5 border-t border-navy-800">
          <button @click="deleteModal.show = false" class="btn-secondary" :disabled="deleteDeleting">Batal</button>
          <button @click="submitDelete"
                  class="btn-danger"
                  :disabled="deleteModal.confirm_text !== deleteModal.project_id || deleteDeleting">
            <i v-if="deleteDeleting" class="fa-solid fa-circle-notch fa-spin" />
            <i v-else class="fa-solid fa-trash" />
            Hapus Permanen
          </button>
        </div>
      </div>
    </div>

    <!-- ── RECYCLE BIN MODAL ─────────────────────────────────────── -->
    <div v-if="showTrash" class="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-3xl shadow-2xl my-4">
        <div class="flex items-center justify-between p-5 border-b border-navy-800">
          <div>
            <h3 class="font-semibold text-white flex items-center gap-2">
              <i class="fa-solid fa-trash-can text-red-400" />Recycle Bin
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ trashedList.length }} proyek dihapus · Data masih tersimpan dan dapat dipulihkan
            </p>
          </div>
          <button @click="showTrash = false" class="btn-ghost btn-xs">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- List -->
        <div class="p-5">
          <div v-if="trashLoading" class="flex justify-center py-8">
            <i class="fa-solid fa-circle-notch fa-spin text-2xl text-primary-400" />
          </div>
          <div v-else-if="trashedList.length === 0" class="text-center py-10">
            <i class="fa-solid fa-check-circle text-emerald-400 text-3xl mb-3 block" />
            <p class="text-sm text-gray-400">Recycle Bin kosong</p>
            <p class="text-xs text-gray-600 mt-1">Tidak ada proyek yang dihapus</p>
          </div>
          <div v-else class="space-y-2">
            <div v-for="t in trashedList" :key="t.project_id"
                 class="flex items-center gap-3 p-3 rounded-lg border border-navy-700 bg-navy-800/40
                        hover:border-navy-600 transition-colors">
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs font-semibold text-gray-300">{{ t.project_id }}</span>
                  <span :class="t.kategori === 'Project' ? 'badge-blue' : 'badge-purple'">{{ t.kategori }}</span>
                  <span v-if="t.type" class="badge-gray">{{ t.type }}</span>
                </div>
                <div class="text-xs text-gray-200 mt-0.5">{{ t.client }}</div>
                <div class="text-xs text-gray-500">{{ t.product }} · {{ t.organisasi }}</div>
                <div class="flex items-center gap-3 mt-1 text-xs text-gray-600">
                  <span>Target: <span class="text-gray-400">{{ fmt.rupiah(t.revenue_target) }}</span></span>
                  <span>Dihapus: <span class="text-red-400">{{ fmt.tgl(t.deleted_at) }}</span></span>
                </div>
              </div>
              <!-- Actions -->
              <div class="flex items-center gap-1.5 flex-shrink-0">
                <button @click="restoreProject(t.project_id)"
                        :disabled="restoring === t.project_id || deletingPermanent === t.project_id"
                        class="btn-secondary btn-sm text-xs hover:border-emerald-700 hover:text-emerald-400">
                  <i v-if="restoring === t.project_id" class="fa-solid fa-circle-notch fa-spin" />
                  <i v-else class="fa-solid fa-rotate-left text-emerald-400" />
                  Pulihkan
                </button>
                <button @click="deleteProjectPermanent(t.project_id)"
                        :disabled="deletingPermanent === t.project_id || restoring === t.project_id"
                        class="btn-sm text-xs border border-red-800/60 text-red-400 hover:bg-red-900/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  <i v-if="deletingPermanent === t.project_id" class="fa-solid fa-circle-notch fa-spin" />
                  <i v-else class="fa-solid fa-trash text-xs" />
                  Hapus Permanen
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 border-t border-navy-800 flex justify-end">
          <button @click="showTrash = false" class="btn-secondary">Tutup</button>
        </div>
      </div>
    </div>

    <!-- ── EDIT TERMIN MODAL ─────────────────────────────────────── -->
    <div v-if="terminModal.show" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-navy-800">
          <div>
            <h3 class="font-semibold text-white">Edit {{ terminModal.label }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ terminModal.project_id }} · {{ terminModal.month_name }}</p>
          </div>
          <button @click="terminModal.show = false" class="btn-ghost btn-xs">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>
        <form @submit.prevent="submitEditTermin" class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="form-label">Bulan</label>
              <div class="form-input bg-navy-800 cursor-not-allowed text-gray-400">{{ terminModal.month_name }}</div>
            </div>
            <div>
              <label class="form-label">Status</label>
              <select v-model="terminModal.status" class="form-select">
                <option>Pending</option>
                <option>Achieve</option>
                <option>Not Achieve</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="form-label">Target Revenue (Rp)</label>
              <NumericInput v-model="terminModal.target" class="form-input" />
            </div>
            <div class="col-span-2">
              <label class="form-label">Realisasi (Rp)</label>
              <NumericInput v-model="terminModal.actual" class="form-input" />
              <p class="text-xs text-gray-600 mt-1">Nilai realisasi revenue pada periode ini</p>
            </div>
          </div>
          <div class="flex gap-2 justify-end pt-2 border-t border-navy-800">
            <button type="button" @click="terminModal.show = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="terminSaving">
              <i v-if="terminSaving" class="fa-solid fa-circle-notch fa-spin" />
              <i v-else class="fa-solid fa-floppy-disk" />Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── TAMBAH TERMIN MODAL ────────────────────────────────────── -->
    <div v-if="addTerminModal.show" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-md shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-navy-800">
          <div>
            <h3 class="font-semibold text-white">Tambah {{ addTerminModal.type === 'Termin' ? 'Termin' : 'Bulan' }}</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ addTerminModal.project_id }}</p>
          </div>
          <button @click="addTerminModal.show = false" class="btn-ghost btn-xs">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>
        <form @submit.prevent="submitAddTermin" class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="form-label">Bulan</label>
              <select v-model.number="addTerminModal.month_num" class="form-select">
                <option v-for="m in monthOptions" :key="m.num" :value="m.num">{{ m.name }}</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="form-label">Target Revenue (Rp)</label>
              <NumericInput v-model="addTerminModal.target" class="form-input" :required="true" />
            </div>
            <div class="col-span-2">
              <label class="form-label">Realisasi (Rp)</label>
              <NumericInput v-model="addTerminModal.actual" class="form-input" />
            </div>
          </div>
          <div class="flex gap-2 justify-end pt-2 border-t border-navy-800">
            <button type="button" @click="addTerminModal.show = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="terminSaving">
              <i v-if="terminSaving" class="fa-solid fa-circle-notch fa-spin" />
              <i v-else class="fa-solid fa-plus" />Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── IMPORT PIPELINE WON MODAL ────────────────────────────── -->
    <div v-if="showImportModal" class="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-4xl shadow-2xl my-4">

        <!-- Header -->
        <div class="flex items-center justify-between p-5 border-b border-navy-800">
          <div>
            <h3 class="font-semibold text-white flex items-center gap-2">
              <i class="fa-solid fa-trophy text-yellow-400" />Import Pipeline Won ke Revenue Tracker
            </h3>
            <p class="text-xs text-gray-500 mt-0.5">
              {{ wonLeads.filter(l => !l.is_imported).length }} lead belum diimport ·
              {{ wonLeads.filter(l => l.is_imported).length }} sudah diimport
            </p>
          </div>
          <button @click="showImportModal = false" class="btn-ghost btn-xs">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>

        <!-- Error banner -->
        <div v-if="importError" class="mx-5 mt-4 p-3 rounded-lg bg-red-900/20 border border-red-800/40">
          <div class="text-sm font-medium text-red-300">
            <i class="fa-solid fa-circle-exclamation mr-1.5" />{{ importError }}
          </div>
        </div>

        <!-- Result banner -->
        <div v-if="importResult" class="mx-5 mt-4 p-3 rounded-lg"
             :class="importResult.imported?.length ? 'bg-emerald-900/20 border border-emerald-800/40' : 'bg-red-900/20 border border-red-800/40'">
          <div class="text-sm font-medium" :class="importResult.imported?.length ? 'text-emerald-300' : 'text-red-300'">
            <i class="fa-solid fa-circle-check mr-1.5" />{{ importResult.message }}
          </div>
          <div v-if="importResult.imported?.length" class="mt-1 flex flex-wrap gap-1">
            <span v-for="i in importResult.imported" :key="i.project_id"
                  class="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded-full">
              {{ i.project_id }} · {{ i.client }}
            </span>
          </div>
          <div v-if="importResult.skipped?.length" class="mt-1">
            <div v-for="s in importResult.skipped" :key="s.lead_id"
                 class="text-xs text-orange-400">⚠ {{ s.lead_id }}: {{ s.reason }}</div>
          </div>
        </div>

        <!-- Leads list -->
        <div class="p-5 space-y-3 max-h-[60vh] overflow-y-auto">

          <!-- Tabs: Belum / Sudah -->
          <div class="flex gap-1 p-1 bg-navy-800 rounded-lg w-fit mb-4">
            <button @click="importTab = 'pending'"
                    :class="importTab==='pending' ? 'bg-navy-700 text-white' : 'text-gray-500 hover:text-gray-300'"
                    class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors">
              Belum Diimport
              <span v-if="wonLeads.filter(l=>!l.is_imported).length"
                    class="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                {{ wonLeads.filter(l=>!l.is_imported).length }}
              </span>
            </button>
            <button @click="importTab = 'done'"
                    :class="importTab==='done' ? 'bg-navy-700 text-white' : 'text-gray-500 hover:text-gray-300'"
                    class="px-4 py-1.5 rounded-md text-xs font-medium transition-colors">
              Sudah Diimport
              <span v-if="wonLeads.filter(l=>l.is_imported).length"
                    class="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                {{ wonLeads.filter(l=>l.is_imported).length }}
              </span>
            </button>
          </div>

          <!-- Empty state -->
          <div v-if="filteredWonLeads.length === 0" class="text-center py-8 text-gray-500">
            <i class="fa-solid fa-trophy text-3xl mb-2 block text-gray-700" />
            <div class="text-sm">
              <span v-if="importTab==='pending'">Semua lead Won sudah diimport ke Revenue Tracker</span>
              <span v-else>Belum ada lead yang diimport</span>
            </div>
          </div>

          <!-- Card per lead (tab: pending) -->
          <div v-for="lead in filteredWonLeads" :key="lead.lead_id"
               class="border rounded-xl transition-colors"
               :class="importTab==='done'
                 ? 'border-emerald-900/30 bg-emerald-900/5'
                 : selectedLeads.has(lead.lead_id)
                   ? 'border-primary-600/60 bg-primary-900/10'
                   : 'border-navy-700 bg-navy-800/40 hover:border-navy-600'">

            <!-- Card header: checkbox + info -->
            <div class="flex items-start gap-3 p-4"
                 :class="importTab==='pending' ? 'cursor-pointer' : ''"
                 @click="importTab==='pending' && toggleLead(lead.lead_id)">

              <!-- Checkbox (hanya tab pending) -->
              <div v-if="importTab==='pending'" class="mt-0.5 flex-shrink-0">
                <div class="w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"
                     :class="selectedLeads.has(lead.lead_id)
                       ? 'bg-primary-500 border-primary-500' : 'border-gray-600'">
                  <i v-if="selectedLeads.has(lead.lead_id)" class="fa-solid fa-check text-white" style="font-size:9px" />
                </div>
              </div>
              <!-- Imported badge -->
              <div v-else class="mt-0.5 flex-shrink-0">
                <div class="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                  <i class="fa-solid fa-check text-white" style="font-size:9px" />
                </div>
              </div>

              <!-- Lead info -->
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <div>
                    <div class="text-sm font-semibold text-white">{{ lead.nama_company }}</div>
                    <div class="text-xs text-gray-400 mt-0.5">{{ lead.product }}</div>
                    <div class="flex gap-3 mt-1.5 flex-wrap">
                      <span class="text-xs text-gray-500">
                        <i class="fa-solid fa-tag mr-1" />{{ lead.segmen || '—' }}
                      </span>
                      <span class="text-xs text-gray-500">
                        <i class="fa-solid fa-user mr-1" />{{ lead.sales_owner || 'Unassigned' }}
                      </span>
                      <span class="text-xs text-gray-500">
                        <i class="fa-solid fa-hashtag mr-1" />{{ lead.lead_id }}
                      </span>
                      <span v-if="importTab==='done'" class="text-xs text-emerald-400">
                        <i class="fa-solid fa-folder mr-1" />{{ lead.imported_project_id }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <div class="text-sm font-bold text-yellow-400">{{ fmt.rupiah(lead.deal_value) }}</div>
                    <div class="text-xs text-gray-500">Deal Value</div>
                    <div v-if="lead.propose_value !== lead.deal_value" class="text-xs text-gray-600 mt-0.5">
                      Propose: {{ fmt.rupiah(lead.propose_value) }}
                    </div>
                    <!-- Tombol hapus — hanya tab pending -->
                    <button v-if="importTab==='pending'"
                            @click.stop="excludeLead(lead.lead_id)"
                            class="mt-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-900/30 px-2 py-0.5 rounded transition-colors"
                            title="Hapus dari daftar import">
                      <i class="fa-solid fa-trash-can mr-1" />Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Edit form (hanya saat dipilih di tab pending) -->
            <div v-if="importTab==='pending' && selectedLeads.has(lead.lead_id)"
                 class="px-4 pb-4 border-t border-navy-700 pt-3"
                 @click.stop>
              <div class="text-xs text-primary-400 font-medium mb-3">
                <i class="fa-solid fa-pen-to-square mr-1" />Sesuaikan mapping sebelum import:
              </div>
              <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label class="form-label">Client</label>
                  <input v-model="leadForms[lead.lead_id].client" class="form-input text-xs" />
                </div>
                <div>
                  <label class="form-label">Produk</label>
                  <ProductSelect v-model="leadForms[lead.lead_id].product" :products="productList" input-class="form-input text-xs" />
                </div>
                <div>
                  <label class="form-label">Organisasi</label>
                  <select v-model="leadForms[lead.lead_id].organisasi" class="form-select text-xs">
                    <option value="">— Pilih —</option>
                    <option v-for="org in orgList" :key="org.kode" :value="org.kode">
                      {{ org.kode }} — {{ org.nama }}
                    </option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Kategori</label>
                  <select v-model="leadForms[lead.lead_id].kategori" class="form-select text-xs">
                    <option>Project</option><option>Recurring</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Type</label>
                  <select v-model="leadForms[lead.lead_id].type" class="form-select text-xs"
                          @change="onTypeChange(lead.lead_id)">
                    <option>One Time</option><option>Termin</option><option>Bulanan</option><option>Tahunan</option>
                  </select>
                </div>
                <div>
                  <label class="form-label">Tgl Penagihan Pertama</label>
                  <input v-model="leadForms[lead.lead_id].tgl_penagihan_pertama" type="date" class="form-input text-xs"
                         @change="onBillingDateChange(lead.lead_id)" />
                  <div v-if="leadForms[lead.lead_id].tgl_penagihan_pertama" class="text-xs text-gray-500 mt-1">
                    <template v-if="leadForms[lead.lead_id].type === 'Bulanan'">
                      Buat {{ 12 - new Date(leadForms[lead.lead_id].tgl_penagihan_pertama).getMonth() }} termin bulanan
                      ({{ MONTH_NAMES[new Date(leadForms[lead.lead_id].tgl_penagihan_pertama).getMonth()] }}–Desember)
                    </template>
                    <template v-else-if="leadForms[lead.lead_id].type !== 'Termin'">
                      Buat 1 termin, bulan {{ new Date(leadForms[lead.lead_id].tgl_penagihan_pertama).getMonth()+1 }}
                    </template>
                  </div>
                </div>
                <div class="md:col-span-2">
                  <label class="form-label">Target Revenue (Rp)</label>
                  <div class="flex gap-2">
                    <NumericInput v-model="leadForms[lead.lead_id].revenue_target"
                                  class="form-input text-xs flex-1" />
                    <button @click="leadForms[lead.lead_id].revenue_target = lead.deal_value"
                            class="btn-ghost btn-xs text-xs shrink-0" title="Gunakan Deal Value">
                      Deal
                    </button>
                    <button @click="leadForms[lead.lead_id].revenue_target = lead.propose_value"
                            class="btn-ghost btn-xs text-xs shrink-0" title="Gunakan Propose Value">
                      Propose
                    </button>
                  </div>
                  <div class="text-xs text-gray-600 mt-1">
                    Deal: {{ fmt.rupiah(lead.deal_value) }} · Propose: {{ fmt.rupiah(lead.propose_value) }}
                  </div>
                </div>
                <div>
                  <label class="form-label">LOB</label>
                  <select v-model="leadForms[lead.lead_id].lob" class="form-select text-xs">
                    <option value="">— Pilih —</option>
                    <option v-for="l in lobList" :key="l.kode" :value="l.kode">{{ l.kode }} — {{ l.nama }}</option>
                  </select>
                </div>
                <div class="md:col-span-3">
                  <label class="form-label">Notes</label>
                  <input v-model="leadForms[lead.lead_id].notes" class="form-input text-xs"
                         placeholder="Notes tambahan..." />
                </div>

                <!-- Termin builder — hanya muncul saat type = Termin -->
                <div v-if="leadForms[lead.lead_id].type === 'Termin'" class="md:col-span-3">
                  <div class="flex items-center justify-between mb-2">
                    <label class="form-label mb-0">Rincian Termin</label>
                    <div class="flex items-center gap-2">
                      <span :class="terminPctTotal(lead.lead_id) === 100
                              ? 'text-emerald-400' : 'text-red-400'"
                            class="text-xs font-mono font-semibold">
                        {{ terminPctTotal(lead.lead_id) }}%
                        <span class="font-normal text-gray-500">/ 100%</span>
                      </span>
                      <button type="button" @click="addTerminRow(lead.lead_id)"
                              class="btn-ghost btn-xs text-xs">
                        <i class="fa-solid fa-plus mr-1" />Tambah Termin
                      </button>
                    </div>
                  </div>
                  <div class="rounded-lg border border-navy-700 overflow-hidden">
                    <table class="w-full text-xs">
                      <thead class="bg-navy-800 text-gray-400">
                        <tr>
                          <th class="px-3 py-2 text-left w-16">Termin</th>
                          <th class="px-3 py-2 text-left">Bulan</th>
                          <th class="px-3 py-2 text-right w-24">% Target</th>
                          <th class="px-3 py-2 text-right">Nilai (Rp)</th>
                          <th class="px-2 py-2 w-8"></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(t, idx) in leadForms[lead.lead_id].termins" :key="idx"
                            class="border-t border-navy-700">
                          <td class="px-3 py-1.5 text-primary-400 font-semibold">T{{ idx + 1 }}</td>
                          <td class="px-3 py-1.5">
                            <select v-model.number="t.month" class="form-select text-xs py-1">
                              <option v-for="(mn, mi) in MONTH_NAMES" :key="mi+1" :value="mi+1">{{ mn }}</option>
                            </select>
                          </td>
                          <td class="px-3 py-1.5">
                            <div class="flex items-center gap-1 justify-end">
                              <input v-model.number="t.pct" type="number" min="0" max="100" step="1"
                                     class="form-input text-xs text-right w-16 py-1" />
                              <span class="text-gray-500">%</span>
                            </div>
                          </td>
                          <td class="px-3 py-1.5 text-right text-gray-300 font-mono">
                            {{ fmt.rupiah(Math.round((leadForms[lead.lead_id].revenue_target || 0) * t.pct / 100)) }}
                          </td>
                          <td class="px-2 py-1.5 text-center">
                            <button v-if="leadForms[lead.lead_id].termins.length > 1"
                                    type="button" @click="removeTerminRow(lead.lead_id, idx)"
                                    class="text-red-500 hover:text-red-400 text-xs">
                              <i class="fa-solid fa-xmark" />
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p v-if="terminPctTotal(lead.lead_id) !== 100"
                     class="text-xs text-red-400 mt-1">
                    Total persentase harus 100%. Sisa: {{ 100 - terminPctTotal(lead.lead_id) }}%
                  </p>
                </div>

                <!-- Bulanan builder -->
                <div v-if="leadForms[lead.lead_id].type === 'Bulanan' && leadForms[lead.lead_id].bulanan_targets?.length"
                     class="md:col-span-3">
                  <div class="flex items-center justify-between mb-2">
                    <label class="form-label mb-0">Target Tagihan per Bulan</label>
                    <div class="flex items-center gap-3 text-xs">
                      <span class="text-gray-500">Total:</span>
                      <span :class="bulananTotal(lead.lead_id) > 0 ? 'text-emerald-400' : 'text-gray-500'"
                            class="font-mono font-semibold">
                        {{ fmt.rupiah(bulananTotal(lead.lead_id)) }}
                      </span>
                      <span v-if="leadForms[lead.lead_id].revenue_target" class="text-gray-600">
                        / {{ fmt.rupiah(leadForms[lead.lead_id].revenue_target) }}
                      </span>
                    </div>
                  </div>
                  <div class="rounded-lg border border-navy-700 overflow-hidden">
                    <table class="w-full text-xs">
                      <thead class="bg-navy-800 text-gray-400">
                        <tr>
                          <th class="px-3 py-2 text-left">Bulan</th>
                          <th class="px-3 py-2 text-right">Target Tagihan (Rp)</th>
                          <th class="px-3 py-2 text-right w-24">% dari Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="b in leadForms[lead.lead_id].bulanan_targets" :key="b.month"
                            class="border-t border-navy-700">
                          <td class="px-3 py-1.5 text-gray-300 font-medium">{{ b.name }}</td>
                          <td class="px-3 py-1.5">
                            <NumericInput v-model="b.target" class="form-input text-xs text-right w-full py-1" />
                          </td>
                          <td class="px-3 py-1.5 text-right text-gray-500 font-mono">
                            {{ leadForms[lead.lead_id].revenue_target
                               ? ((b.target / leadForms[lead.lead_id].revenue_target) * 100).toFixed(1) + '%'
                               : '—' }}
                          </td>
                        </tr>
                      </tbody>
                      <tfoot class="bg-navy-800/50 border-t border-navy-600">
                        <tr>
                          <td class="px-3 py-2 text-gray-400 font-medium">Total</td>
                          <td class="px-3 py-2 text-right font-mono font-semibold"
                              :class="leadForms[lead.lead_id].revenue_target && Math.abs(bulananTotal(lead.lead_id) - leadForms[lead.lead_id].revenue_target) < 1
                                        ? 'text-emerald-400' : 'text-gray-200'">
                            {{ fmt.rupiah(bulananTotal(lead.lead_id)) }}
                          </td>
                          <td class="px-3 py-2 text-right text-xs"
                              :class="leadForms[lead.lead_id].revenue_target && Math.abs(bulananTotal(lead.lead_id) - leadForms[lead.lead_id].revenue_target) < 1
                                        ? 'text-emerald-400' : 'text-gray-500'">
                            {{ leadForms[lead.lead_id].revenue_target
                               ? ((bulananTotal(lead.lead_id) / leadForms[lead.lead_id].revenue_target) * 100).toFixed(1) + '%'
                               : '—' }}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="p-5 border-t border-navy-800 flex items-center justify-between gap-3">
          <div v-if="importTab==='pending'" class="flex items-center gap-3">
            <label class="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-gray-200">
              <input type="checkbox" :checked="allPendingSelected" @change="toggleAllLeads" class="w-3 h-3" />
              Pilih Semua
            </label>
            <span v-if="selectedCount" class="text-xs text-primary-400">
              {{ selectedCount }} dipilih
            </span>
          </div>
          <div v-else class="text-xs text-gray-500">
            <i class="fa-solid fa-info-circle mr-1" />Lead yang sudah diimport bisa dilihat di tabel proyek
          </div>
          <div class="flex gap-2 ml-auto">
            <button @click="showImportModal = false" class="btn-secondary">Tutup</button>
            <button v-if="importTab==='pending'"
                    @click="submitImport" class="btn-primary"
                    :disabled="selectedCount === 0 || importSaving">
              <i v-if="importSaving" class="fa-solid fa-circle-notch fa-spin" />
              <i v-else class="fa-solid fa-file-import" />
              Import {{ selectedCount > 0 ? selectedCount + ' Lead' : '' }}
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ── NEW PROJECT MODAL ──────────────────────────────────────── -->
    <div v-if="showNewForm" class="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-2xl shadow-2xl my-4">
        <div class="flex items-center justify-between p-5 border-b border-navy-800">
          <h3 class="font-semibold text-white">Tambah Proyek Revenue</h3>
          <button type="button" @click="showNewForm = false" class="btn-ghost btn-xs"><i class="fa-solid fa-xmark" /></button>
        </div>
        <form @submit.prevent="submitProject" class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="form-label">Client</label>
              <input v-model="newProj.client" class="form-input" required />
            </div>
            <div>
              <label class="form-label">Produk</label>
              <ProductSelect v-model="newProj.product" :products="productList" />
            </div>
            <div>
              <label class="form-label">Organisasi</label>
              <select v-model="newProj.organisasi" class="form-select">
                <option value="">— Pilih —</option>
                <option v-for="org in orgList" :key="org.kode" :value="org.kode">
                  {{ org.kode }} — {{ org.nama }}
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">Kategori</label>
              <select v-model="newProj.kategori" class="form-select">
                <option>Project</option><option>Recurring</option>
              </select>
            </div>
            <div>
              <label class="form-label">Revenue Stream</label>
              <select v-model="newProj.revenue_type" class="form-select">
                <option value="Existing">Existing Revenue</option>
                <option value="New">New Revenue Stream</option>
              </select>
            </div>
            <div>
              <label class="form-label">Type</label>
              <select v-model="newProj.type" class="form-select" @change="onNewProjTypeChange">
                <option>One Time</option><option>Termin</option><option>Bulanan</option><option>Tahunan</option>
              </select>
            </div>
            <div>
              <label class="form-label">Tgl Penagihan Pertama</label>
              <input v-model="newProj.tgl_penagihan_pertama" type="date" class="form-input"
                     @change="onNewProjBillingDateChange" />
              <p v-if="newProj.tgl_penagihan_pertama" class="text-xs text-gray-500 mt-1">
                <template v-if="newProj.type === 'Bulanan'">
                  Buat {{ 12 - new Date(newProj.tgl_penagihan_pertama).getMonth() }} termin bulanan
                  ({{ MONTH_NAMES[new Date(newProj.tgl_penagihan_pertama).getMonth()] }}–Desember)
                </template>
                <template v-else-if="newProj.type !== 'Termin'">
                  1 termin, bulan {{ new Date(newProj.tgl_penagihan_pertama).getMonth()+1 }}
                </template>
              </p>
            </div>
            <div>
              <label class="form-label">Target Revenue (Rp)</label>
              <NumericInput v-model="newProj.revenue_target" class="form-input" />
            </div>
            <div>
              <label class="form-label">LOB</label>
              <select v-model="newProj.lob" class="form-select">
                <option value="">— Pilih —</option>
                <option v-for="l in lobList" :key="l.kode" :value="l.kode">{{ l.kode }} — {{ l.nama }}</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="form-label">Notes</label>
              <textarea v-model="newProj.notes" class="form-textarea h-16" />
            </div>

            <!-- Termin builder -->
            <div v-if="newProj.type === 'Termin'" class="col-span-2">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label mb-0">Rincian Termin</label>
                <div class="flex items-center gap-2">
                  <span :class="newProjTerminPctTotal() === 100 ? 'text-emerald-400' : 'text-red-400'"
                        class="text-xs font-mono font-semibold">
                    {{ newProjTerminPctTotal() }}% <span class="font-normal text-gray-500">/ 100%</span>
                  </span>
                  <button type="button" @click="addNewProjTerminRow" class="btn-ghost btn-xs text-xs">
                    <i class="fa-solid fa-plus mr-1" />Tambah Termin
                  </button>
                </div>
              </div>
              <div class="rounded-lg border border-navy-700 overflow-hidden">
                <table class="w-full text-xs">
                  <thead class="bg-navy-800 text-gray-400">
                    <tr>
                      <th class="px-3 py-2 text-left w-14">Termin</th>
                      <th class="px-3 py-2 text-left">Bulan</th>
                      <th class="px-3 py-2 text-right w-24">% Target</th>
                      <th class="px-3 py-2 text-right">Nilai (Rp)</th>
                      <th class="px-2 py-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(t, idx) in newProj.termins" :key="idx" class="border-t border-navy-700">
                      <td class="px-3 py-1.5 text-primary-400 font-semibold">T{{ idx + 1 }}</td>
                      <td class="px-3 py-1.5">
                        <select v-model.number="t.month" class="form-select text-xs py-1">
                          <option v-for="(mn, mi) in MONTH_NAMES" :key="mi+1" :value="mi+1">{{ mn }}</option>
                        </select>
                      </td>
                      <td class="px-3 py-1.5">
                        <div class="flex items-center gap-1 justify-end">
                          <input v-model.number="t.pct" type="number" min="0" max="100" step="1"
                                 class="form-input text-xs text-right w-16 py-1" />
                          <span class="text-gray-500">%</span>
                        </div>
                      </td>
                      <td class="px-3 py-1.5 text-right text-gray-300 font-mono">
                        {{ fmt.rupiah(Math.round((newProj.revenue_target || 0) * t.pct / 100)) }}
                      </td>
                      <td class="px-2 py-1.5 text-center">
                        <button v-if="newProj.termins.length > 1" type="button"
                                @click="removeNewProjTerminRow(idx)"
                                class="text-red-500 hover:text-red-400 text-xs">
                          <i class="fa-solid fa-xmark" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p v-if="newProjTerminPctTotal() !== 100" class="text-xs text-red-400 mt-1">
                Total persentase harus 100%. Sisa: {{ 100 - newProjTerminPctTotal() }}%
              </p>
            </div>

            <!-- Bulanan builder -->
            <div v-if="newProj.type === 'Bulanan' && newProj.bulanan_targets.length"
                 class="col-span-2">
              <div class="flex items-center justify-between mb-2">
                <label class="form-label mb-0">Target Tagihan per Bulan</label>
                <div class="flex items-center gap-2 text-xs">
                  <span class="text-gray-500">Total:</span>
                  <span :class="newProjBulananTotal() > 0 ? 'text-emerald-400' : 'text-gray-500'"
                        class="font-mono font-semibold">
                    {{ fmt.rupiah(newProjBulananTotal()) }}
                  </span>
                  <span v-if="newProj.revenue_target" class="text-gray-600">
                    / {{ fmt.rupiah(newProj.revenue_target) }}
                  </span>
                </div>
              </div>
              <div class="rounded-lg border border-navy-700 overflow-hidden">
                <table class="w-full text-xs">
                  <thead class="bg-navy-800 text-gray-400">
                    <tr>
                      <th class="px-3 py-2 text-left">Bulan</th>
                      <th class="px-3 py-2 text-right">Target Tagihan (Rp)</th>
                      <th class="px-3 py-2 text-right w-24">% dari Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="b in newProj.bulanan_targets" :key="b.month" class="border-t border-navy-700">
                      <td class="px-3 py-1.5 text-gray-300 font-medium">{{ b.name }}</td>
                      <td class="px-3 py-1.5">
                        <NumericInput v-model="b.target" class="form-input text-xs text-right w-full py-1" />
                      </td>
                      <td class="px-3 py-1.5 text-right text-gray-500 font-mono">
                        {{ newProj.revenue_target
                           ? ((b.target / newProj.revenue_target) * 100).toFixed(1) + '%'
                           : '—' }}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-navy-800/50 border-t border-navy-600">
                    <tr>
                      <td class="px-3 py-2 text-gray-400 font-medium">Total</td>
                      <td class="px-3 py-2 text-right font-mono font-semibold"
                          :class="newProj.revenue_target && Math.abs(newProjBulananTotal() - newProj.revenue_target) < 1
                                    ? 'text-emerald-400' : 'text-gray-200'">
                        {{ fmt.rupiah(newProjBulananTotal()) }}
                      </td>
                      <td class="px-3 py-2 text-right text-xs"
                          :class="newProj.revenue_target && Math.abs(newProjBulananTotal() - newProj.revenue_target) < 1
                                    ? 'text-emerald-400' : 'text-gray-500'">
                        {{ newProj.revenue_target
                           ? ((newProjBulananTotal() / newProj.revenue_target) * 100).toFixed(1) + '%'
                           : '—' }}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div class="flex gap-2 justify-end pt-2 border-t border-navy-800">
            <button type="button" @click="showNewForm = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <i v-if="saving" class="fa-solid fa-circle-notch fa-spin" />
              <i v-else class="fa-solid fa-floppy-disk" />Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ── EDIT PROJECT MODAL ─────────────────────────────────────── -->
    <div v-if="editModal.show" class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-2xl shadow-2xl">
        <div class="flex items-center justify-between p-5 border-b border-navy-800">
          <div>
            <h3 class="font-semibold text-white">Edit Proyek</h3>
            <p class="text-xs text-gray-500 mt-0.5">{{ editModal.project_id }} · {{ editModal.client }}</p>
          </div>
          <button @click="editModal.show = false" class="btn-ghost btn-xs">
            <i class="fa-solid fa-xmark" />
          </button>
        </div>
        <form @submit.prevent="submitEdit" class="p-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <div class="col-span-2">
              <label class="form-label">Client</label>
              <input v-model="editModal.client" class="form-input" required />
            </div>
            <div>
              <label class="form-label">Produk</label>
              <ProductSelect v-model="editModal.product" :products="productList" />
            </div>
            <div>
              <label class="form-label">Organisasi</label>
              <select v-model="editModal.organisasi" class="form-select">
                <option v-for="org in orgList" :key="org.kode" :value="org.kode">
                  {{ org.kode }} — {{ org.nama }}
                </option>
              </select>
            </div>
            <div>
              <label class="form-label">LOB</label>
              <select v-model="editModal.lob" class="form-select">
                <option value="">— Pilih —</option>
                <option v-for="l in lobList" :key="l.kode" :value="l.kode">{{ l.kode }} — {{ l.nama }}</option>
              </select>
            </div>
            <div>
              <label class="form-label">Kategori</label>
              <select v-model="editModal.kategori" class="form-select">
                <option>Project</option><option>Recurring</option>
              </select>
            </div>
            <div>
              <label class="form-label">Revenue Stream</label>
              <select v-model="editModal.revenue_type" class="form-select">
                <option value="Existing">Existing Revenue</option>
                <option value="New">New Revenue Stream</option>
              </select>
            </div>
            <div>
              <label class="form-label">Type</label>
              <select v-model="editModal.type" class="form-select">
                <option>One Time</option><option>Termin</option><option>Bulanan</option><option>Tahunan</option>
              </select>
            </div>
            <div>
              <label class="form-label">Target Penerbitan Invoice</label>
              <input v-model="editModal.target_invoice_date" type="month" class="form-input" />
            </div>
            <div>
              <label class="form-label">Target Revenue (Rp)</label>
              <NumericInput v-model="editModal.revenue_target" class="form-input" />
            </div>
            <div>
              <label class="form-label">Tahun</label>
              <input v-model.number="editModal.tahun" type="number" class="form-input" min="2020" max="2030" />
            </div>
            <!-- Status & Risk dihitung otomatis dari achievement % -->
            <div class="col-span-2 p-3 rounded-lg bg-navy-800 border border-navy-700">
              <div class="flex items-center gap-2 text-xs text-gray-500">
                <i class="fa-solid fa-circle-info text-primary-400" />
                <span><strong class="text-gray-300">Status</strong> dan <strong class="text-gray-300">Risk Level</strong>
                  dihitung otomatis dari Achievement % (Realisasi ÷ Target).</span>
              </div>
              <div class="flex gap-4 mt-2 text-xs text-gray-500">
                <span>≥80% → <span class="badge-green">On Track / LOW</span></span>
                <span>50–79% → <span class="badge-yellow">At Risk / MEDIUM</span></span>
                <span>&lt;50% → <span class="badge-red">Critical / HIGH–CRITICAL</span></span>
              </div>
            </div>
            <div>
              <label class="form-label">Project Status</label>
              <select v-model="editModal.project_status" class="form-select">
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
                <option value="Failed">Failed</option>
              </select>
            </div>
            <div class="col-span-2">
              <label class="form-label">Notes</label>
              <textarea v-model="editModal.notes" class="form-textarea h-16" />
            </div>
          </div>
          <div class="flex gap-2 justify-end pt-2 border-t border-navy-800">
            <button type="button" @click="editModal.show = false" class="btn-secondary">Batal</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <i v-if="saving" class="fa-solid fa-circle-notch fa-spin" />
              <i v-else class="fa-solid fa-floppy-disk" />Simpan
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>

  <!-- Modal: Penjelasan Kolom List Proyek -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showProjectListInfo"
           class="fixed inset-0 z-[9999] flex items-center justify-center p-4"
           @click.self="showProjectListInfo = false">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showProjectListInfo = false" />
        <div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-apex-border">
            <div class="flex items-center gap-2">
              <i class="fa-solid fa-table-list text-primary-400" />
              <span class="font-semibold text-apex-text">Penjelasan Kolom — Daftar Proyek</span>
            </div>
            <button @click="showProjectListInfo = false"
              class="w-7 h-7 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-apex-border transition">
              <i class="fa-solid fa-xmark" />
            </button>
          </div>

          <!-- Body -->
          <div class="px-5 py-4 space-y-5 text-sm">

            <!-- Kolom data -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Kolom Data</div>
              <div class="space-y-1.5 text-xs">
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-gray-300 font-semibold w-28 flex-shrink-0">Target</span>
                  <span class="text-gray-400">Nilai kontrak / target revenue tahunan proyek.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-amber-300 font-semibold w-28 flex-shrink-0">Billed</span>
                  <span class="text-gray-400">Total invoice yang sudah diterbitkan. Tanggung jawab <span class="text-white">Tim Project</span>.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-green-300 font-semibold w-28 flex-shrink-0">Collected</span>
                  <span class="text-gray-400">Realisasi revenue yang sudah masuk & dicatat. Tanggung jawab <span class="text-white">Finance</span>.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-blue-300 font-semibold w-28 flex-shrink-0">Ach. %</span>
                  <span class="text-gray-400">Achievement = Collected ÷ Target efektif × 100%. Dihitung real-time.</span>
                </div>
              </div>
            </div>

            <!-- Status Revenue -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Status Revenue (real-time)</div>
              <div class="space-y-1.5 text-xs">
                <div class="p-2.5 rounded-lg bg-emerald-900/20 border border-emerald-700/30 flex items-center gap-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/50 text-emerald-300 w-20 text-center flex-shrink-0">On Track</span>
                  <span class="text-gray-400">Achievement ≥ 80% dari target efektif.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-amber-900/20 border border-amber-700/30 flex items-center gap-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/50 text-amber-300 w-20 text-center flex-shrink-0">At Risk</span>
                  <span class="text-gray-400">Achievement 50–79%. Perlu perhatian agar tidak turun ke Critical.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-red-900/20 border border-red-700/30 flex items-center gap-3">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-red-900/50 text-red-300 w-20 text-center flex-shrink-0">Critical</span>
                  <span class="text-gray-400">Achievement &lt; 50%. Perlu tindakan segera.</span>
                </div>
              </div>
            </div>

            <!-- Target Efektif per Type -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Basis Target per Type Kontrak</div>
              <div class="space-y-1.5 text-xs">
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-purple-300 font-semibold w-20 flex-shrink-0">Bulanan</span>
                  <span class="text-gray-400">Target kumulatif dari jadwal bulanan s.d. bulan berjalan.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-purple-300 font-semibold w-20 flex-shrink-0">Termin</span>
                  <span class="text-gray-400">Target kumulatif dari jadwal termin s.d. bulan berjalan.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-purple-300 font-semibold w-20 flex-shrink-0">One Time</span>
                  <span class="text-gray-400">Target penuh = nilai kontrak (revenue_target).</span>
                </div>
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-purple-300 font-semibold w-20 flex-shrink-0">Tahunan</span>
                  <span class="text-gray-400">Target penuh = nilai kontrak (revenue_target).</span>
                </div>
              </div>
            </div>

            <!-- Risk Level -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Risk Level</div>
              <div class="grid grid-cols-2 gap-1.5 text-xs">
                <div class="p-2 rounded-lg bg-emerald-900/20 border border-emerald-700/30 text-center">
                  <div class="text-emerald-300 font-bold text-[10px]">LOW</div>
                  <div class="text-gray-500 text-[10px]">Ach ≥ 80%</div>
                </div>
                <div class="p-2 rounded-lg bg-yellow-900/20 border border-yellow-700/30 text-center">
                  <div class="text-yellow-300 font-bold text-[10px]">MEDIUM</div>
                  <div class="text-gray-500 text-[10px]">Ach 60–79%</div>
                </div>
                <div class="p-2 rounded-lg bg-orange-900/20 border border-orange-700/30 text-center">
                  <div class="text-orange-300 font-bold text-[10px]">HIGH</div>
                  <div class="text-gray-500 text-[10px]">Ach 30–59%</div>
                </div>
                <div class="p-2 rounded-lg bg-red-900/20 border border-red-700/30 text-center">
                  <div class="text-red-300 font-bold text-[10px]">CRITICAL</div>
                  <div class="text-gray-500 text-[10px]">Ach &lt; 30%</div>
                </div>
              </div>
            </div>

            <!-- Project Status -->
            <div>
              <div class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Project Status</div>
              <div class="space-y-1.5 text-xs">
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-green-300 font-semibold w-20 flex-shrink-0">Active</span>
                  <span class="text-gray-400">Proyek sedang berjalan.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-yellow-300 font-semibold w-20 flex-shrink-0">On Hold</span>
                  <span class="text-gray-400">Proyek ditangguhkan sementara, otomatis masuk At Risk.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-blue-300 font-semibold w-20 flex-shrink-0">Completed</span>
                  <span class="text-gray-400">Proyek selesai, tidak dihitung dalam status revenue.</span>
                </div>
                <div class="p-2.5 rounded-lg bg-apex-card border border-apex-border flex gap-3">
                  <span class="text-red-300 font-semibold w-20 flex-shrink-0">Failed</span>
                  <span class="text-gray-400">Proyek gagal, dikecualikan dari kalkulasi target.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Transition>
  </Teleport>

</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { get, post, put, patch, del, getBlob } = useApi()
const fmt      = useFormat()
const authStore = useAuthStore()

// Daftar organisasi dari Master Organisasi
const orgList     = ref<{kode: string, nama: string}[]>([])
const lobList     = ref<{kode: string, nama: string}[]>([])
const productList = ref<{kode: string, nama: string, kategori?: string}[]>([])
async function loadOrgList() {
  try {
    const [orgs, lobs] = await Promise.all([
      get('/v1/master/organizations/dropdown'),
      get('/v1/master/organizations/lob'),
    ])
    orgList.value = orgs || []
    lobList.value = lobs || []
  } catch {}
}
const isAdmin   = computed(() => authStore.user?.role_id === 1)

const f = reactive({
  search: '', organisasi: '', kategori: '', status: '', project_status: '',
  tahun: new Date().getFullYear()
})
const page    = ref(1)
const perPage = ref(10)

const selectedYear = computed(() => f.tahun)

const { data, pending, refresh } = await useAsyncData('rev-tracker', () =>
  get('/v1/revenue/projects', { ...f, page: page.value, per_page: perPage.value }),
  { server: false, watch: [page, perPage] }
)

// Unpaid invoice pagination
const unpaidPage    = ref(1)
const unpaidPerPage = 2
const unpaidPages   = computed(() => Math.ceil((data.value?.unpaid_invoices?.length ?? 0) / unpaidPerPage) || 1)
const unpaidSlice   = computed(() => {
  const all   = data.value?.unpaid_invoices ?? []
  const start = (unpaidPage.value - 1) * unpaidPerPage
  return all.slice(start, start + unpaidPerPage)
})

// psCounts — baca langsung dari data.value (triggerRef akan refresh computed ini)
const psCounts = computed(() => data.value?.project_status_counts ?? {})

// Invoice summary shorthand
const inv = computed(() => data.value?.inv_summary ?? {
  total_inv: 0, projects_with_inv: 0, total_amount: 0, total_paid: 0,
  lunas_count: 0, belum_count: 0, outstanding: 0, collection_rate: 0,
})

let debTimer: ReturnType<typeof setTimeout>
function debouncedFetch() { clearTimeout(debTimer); debTimer = setTimeout(fetchData, 400) }
async function fetchData() { page.value = 1; await refresh() }
function resetFilters() {
  f.search = f.organisasi = f.kategori = f.status = f.project_status = ''
  f.tahun = new Date().getFullYear()
  fetchData()
}

async function updateProjectStatus(projectId: string, newStatus: string) {
  // Cari project di data.value — data adalah shallowRef dari Nuxt, mutasi butuh triggerRef
  const project = data.value?.projects?.find((p: any) => p.project_id === projectId)
  if (!project) return
  const prevStatus = project.project_status

  // Update langsung di data — UI langsung tampil nilai baru
  project.project_status = newStatus
  if (data.value?.project_status_counts) {
    const counts = data.value.project_status_counts
    if (prevStatus && counts[prevStatus] > 0) counts[prevStatus]--
    counts[newStatus] = (counts[newStatus] ?? 0) + 1
  }
  triggerRef(data)  // Paksa Vue re-render karena data adalah shallowRef

  try {
    await patch(`/v1/revenue/projects/${projectId}/status`, { project_status: newStatus })
  } catch (e: any) {
    // Rollback jika gagal
    project.project_status = prevStatus
    if (data.value?.project_status_counts) {
      const counts = data.value.project_status_counts
      if (counts[newStatus] > 0) counts[newStatus]--
      counts[prevStatus] = (counts[prevStatus] ?? 0) + 1
    }
    triggerRef(data)
    alert('Gagal menyimpan: ' + (e?.data?.message || e?.message || 'unknown error'))
  }
}

const showProjectListInfo = ref(false)
const showNewForm = ref(false)
const saving      = ref(false)
function makeNewProj() {
  return {
    lob: 'DCSS', organisasi: 'FSP-ECO', product: '', client: '', kategori: 'Project',
    type: 'One Time' as string, revenue_type: 'Existing',
    tgl_penagihan_pertama: '',
    revenue_target: 0, notes: '',
    termins: [{ month: new Date().getMonth() + 1, pct: 100 }] as { month: number, pct: number }[],
    bulanan_targets: [] as { month: number, name: string, target: number }[],
  }
}
const newProj = reactive(makeNewProj())

function newProjTerminPctTotal() {
  return newProj.termins.reduce((s, t) => s + (Number(t.pct) || 0), 0)
}
function newProjBulananTotal() {
  return newProj.bulanan_targets.reduce((s, b) => s + (Number(b.target) || 0), 0)
}
function addNewProjTerminRow() {
  const last = newProj.termins.length ? newProj.termins[newProj.termins.length - 1].month : new Date().getMonth() + 1
  newProj.termins.push({ month: Math.min(last + 1, 12), pct: Math.max(0, 100 - newProjTerminPctTotal()) })
}
function removeNewProjTerminRow(idx: number) { newProj.termins.splice(idx, 1) }
function rebuildNewProjBulananMonths() {
  const sm = newProj.tgl_penagihan_pertama ? new Date(newProj.tgl_penagihan_pertama).getMonth() + 1 : new Date().getMonth() + 1
  const ex: Record<number, number> = {}
  for (const b of newProj.bulanan_targets) ex[b.month] = b.target
  newProj.bulanan_targets = Array.from({ length: 12 - sm + 1 }, (_, i) => {
    const m = sm + i
    return { month: m, name: MONTH_NAMES[m - 1], target: ex[m] ?? 0 }
  })
}
function onNewProjTypeChange() {
  if (newProj.type === 'Bulanan') rebuildNewProjBulananMonths()
}
function onNewProjBillingDateChange() {
  const month = newProj.tgl_penagihan_pertama ? new Date(newProj.tgl_penagihan_pertama).getMonth() + 1 : null
  if (newProj.type === 'Termin' && month && newProj.termins.length) newProj.termins[0].month = month
  if (newProj.type === 'Bulanan') rebuildNewProjBulananMonths()
}

async function submitProject() {
  saving.value = true
  try {
    await post('/v1/revenue/projects', { ...newProj })
    Object.assign(newProj, makeNewProj())
    showNewForm.value = false
    await refresh()
  } finally {
    saving.value = false
  }
}

// ── EDIT MODAL ───────────────────────────────────────────────────
const editModal = reactive({
  show: false, project_id: '',
  client: '', product: '', organisasi: '', lob: '',
  kategori: 'Project', type: 'One Time', revenue_type: 'Existing',
  target_invoice_date: '',
  tahun: new Date().getFullYear(), revenue_target: 0,
  status: 'On Track', risk_level: 'LOW', notes: '',
  project_status: 'Active',
})

function openEdit(p: any) {
  // target_invoice_date di DB = YYYY-MM-DD, input type=month butuh YYYY-MM
  const tid = p.target_invoice_date
    ? p.target_invoice_date.slice(0, 7)
    : ''
  Object.assign(editModal, {
    show                : true,
    project_id          : p.project_id,
    client              : p.client         ?? '',
    product             : p.product        ?? '',
    organisasi          : p.organisasi     ?? '',
    lob                 : p.lob            ?? '',
    kategori            : p.kategori       ?? 'Project',
    type                : p.type           ?? 'One Time',
    target_invoice_date : tid,
    tahun               : p.tahun          ?? new Date().getFullYear(),
    revenue_target      : p.revenue_target ?? 0,
    revenue_type        : p.revenue_type    ?? 'Existing',
    status              : p.status         ?? 'On Track',
    risk_level          : p.risk_level     ?? 'LOW',
    notes               : p.notes          ?? '',
    project_status      : p.project_status ?? 'Active',
  })
}

async function submitEdit() {
  saving.value = true
  try {
    const raw = toRaw(editModal)
    const { show, project_id, ...payload } = raw
    // input type=month menghasilkan "YYYY-MM", konversi ke "YYYY-MM-01" untuk DB
    if (payload.target_invoice_date && payload.target_invoice_date.length === 7)
      payload.target_invoice_date = payload.target_invoice_date + '-01'

    // Simpan snapshot sebelum update untuk rollback
    const project = data.value?.projects?.find((p: any) => p.project_id === raw.project_id)
    const snapshot = project ? { ...project } : null

    // Optimistic update — langsung update data lokal
    if (project) {
      Object.assign(project, payload)
      triggerRef(data)
    }

    try {
      await put(`/v1/revenue/projects/${raw.project_id}`, payload)
      editModal.show = false
      clearNuxtData('rev-tracker')
      await refresh()
    } catch (e: any) {
      // Rollback jika API gagal
      if (project && snapshot) {
        Object.assign(project, snapshot)
        triggerRef(data)
      }
      alert(e?.data?.message || e?.message || 'Gagal menyimpan perubahan.')
    }
  } finally {
    saving.value = false
  }
}

// ── DELETE PROYEK ────────────────────────────────────────────────
const deleteModal = reactive({
  show: false, project_id: '', client: '', product: '', organisasi: '',
  revenue_target: 0, confirm_text: '',
})
const deleteDeleting = ref(false)

function openDelete(p: any) {
  Object.assign(deleteModal, {
    show          : true,
    project_id    : p.project_id,
    client        : p.client        ?? '',
    product       : p.product       ?? '',
    organisasi         : p.organisasi         ?? '',
    revenue_target: p.revenue_target ?? 0,
    confirm_text  : '',
  })
}

async function submitDelete() {
  if (deleteModal.confirm_text !== deleteModal.project_id) return
  deleteDeleting.value = true
  try {
    await del(`/v1/revenue/projects/${deleteModal.project_id}`)
    deleteModal.show = false
    // Bersihkan cache expand jika proyek ini sedang expand
    expandedProjects.value.delete(deleteModal.project_id)
    expandedProjects.value = new Set(expandedProjects.value)
    delete monthlyData.value[deleteModal.project_id]
    await refresh()
  } finally {
    deleteDeleting.value = false
  }
}

// ── RECYCLE BIN ──────────────────────────────────────────────────
const showTrash    = ref(false)
const trashedList  = ref<any[]>([])
const trashedCount = ref(0)
const trashLoading = ref(false)
const restoring          = ref<string | null>(null)
const deletingPermanent  = ref<string | null>(null)

async function exportInvoiceTemplate() {
  const year = selectedYear.value || new Date().getFullYear()
  const blob = await getBlob(`/v1/revenue/export-invoice-template?tahun=${year}`)
  const a    = document.createElement('a')
  a.href     = URL.createObjectURL(blob)
  a.download = `template_invoice_${year}.xlsx`
  a.click()
  URL.revokeObjectURL(a.href)
}

async function openTrash() {
  showTrash.value    = true
  trashLoading.value = true
  try {
    const res = await get('/v1/revenue/trashed')
    trashedList.value  = res.trashed  ?? []
    trashedCount.value = res.count    ?? 0
  } finally {
    trashLoading.value = false
  }
}

async function deleteProjectPermanent(projectId: string) {
  if (!confirm(`Hapus permanen proyek ${projectId}? Tindakan ini tidak dapat dibatalkan dan akan menghapus semua invoice & data bulanan terkait.`)) return
  deletingPermanent.value = projectId
  try {
    await del(`/v1/revenue/trashed/${projectId}/permanent`)
    trashedList.value  = trashedList.value.filter(t => t.project_id !== projectId)
    trashedCount.value = trashedList.value.length
  } catch (e: any) {
    alert(e?.data?.detail || 'Gagal menghapus proyek.')
  } finally {
    deletingPermanent.value = null
  }
}

async function restoreProject(projectId: string) {
  restoring.value = projectId
  try {
    await post(`/v1/revenue/trashed/${projectId}/restore`, {})
    // Hapus dari list lokal
    trashedList.value  = trashedList.value.filter(t => t.project_id !== projectId)
    trashedCount.value = trashedList.value.length
    await refresh()
  } finally {
    restoring.value = null
  }
}

// Load badge count saat mount
async function loadTrashedCount() {
  if (!isAdmin.value) return
  try {
    const res = await get('/v1/revenue/trashed')
    trashedCount.value = res.count ?? 0
  } catch {}
}

// ── EXPAND TERMIN / BULANAN ──────────────────────────────────────
const expandedProjects = ref(new Set<string>())
const monthlyData      = ref<Record<string, any>>({})
const monthlyLoading   = ref(new Set<string>())
const terminPages      = ref<Record<string, number>>({})
const TERMIN_PER_PAGE  = 4

function terminSlice(projectId: string) {
  const all   = monthlyData.value[projectId]?.monthly ?? []
  const page  = terminPages.value[projectId] ?? 1
  const start = (page - 1) * TERMIN_PER_PAGE
  return all.slice(start, start + TERMIN_PER_PAGE)
}
function terminTotalPages(projectId: string) {
  const len = monthlyData.value[projectId]?.monthly?.length ?? 0
  return Math.ceil(len / TERMIN_PER_PAGE) || 1
}
function setTerminPage(projectId: string, p: number) {
  terminPages.value = { ...terminPages.value, [projectId]: p }
}

async function toggleExpand(p: any) {
  const id = p.project_id
  if (expandedProjects.value.has(id)) {
    expandedProjects.value.delete(id)
    expandedProjects.value = new Set(expandedProjects.value)
    return
  }
  expandedProjects.value.add(id)
  expandedProjects.value = new Set(expandedProjects.value)
  // Fetch jika belum ada
  if (!monthlyData.value[id]) {
    monthlyLoading.value.add(id)
    monthlyLoading.value = new Set(monthlyLoading.value)
    try {
      const res = await get(`/v1/revenue/projects/${id}/monthly`)
      monthlyData.value = { ...monthlyData.value, [id]: res }
    } finally {
      monthlyLoading.value.delete(id)
      monthlyLoading.value = new Set(monthlyLoading.value)
    }
  }
}

async function refreshMonthly(projectId: string) {
  const res = await get(`/v1/revenue/projects/${projectId}/monthly`)
  monthlyData.value = { ...monthlyData.value, [projectId]: res }
}

// ── EDIT TERMIN MODAL ────────────────────────────────────────────
const terminModal = reactive({
  show: false, id: 0, project_id: '', label: '', month_name: '',
  target: 0, actual: 0, status: 'Pending',
})
const terminSaving = ref(false)

function openEditTermin(projectId: string, m: any) {
  Object.assign(terminModal, {
    show      : true,
    id        : m.id,
    project_id: projectId,
    label     : `Termin ${m.termin_no}`,
    month_name: m.month_name,
    target    : m.target,
    actual    : m.actual,
    status    : m.status,
  })
}

async function submitEditTermin() {
  terminSaving.value = true
  try {
    await put(`/v1/revenue/monthly/${terminModal.id}`, {
      target: terminModal.target,
      actual: terminModal.actual,
      status: terminModal.status,
    })
    terminModal.show = false
    await refreshMonthly(terminModal.project_id)
    await refresh()
  } catch (e: any) {
    const msg = e?.data?.message || e?.message || 'Gagal menyimpan termin.'
    alert(`Error: ${msg}`)
    console.error('submitEditTermin error:', e)
  } finally {
    terminSaving.value = false
  }
}

// ── TAMBAH TERMIN MODAL ──────────────────────────────────────────
const addTerminModal = reactive({
  show: false, project_id: '', type: '',
  month_num: 1, target: 0, actual: 0,
})

const monthOptions = [
  { num: 1, name: 'Januari' }, { num: 2, name: 'Februari' }, { num: 3, name: 'Maret' },
  { num: 4, name: 'April' },   { num: 5, name: 'Mei' },      { num: 6, name: 'Juni' },
  { num: 7, name: 'Juli' },    { num: 8, name: 'Agustus' },  { num: 9, name: 'September' },
  { num: 10, name: 'Oktober' },{ num: 11, name: 'November' },{ num: 12, name: 'Desember' },
]

const monthEnNames = ['','January','February','March','April','May','June',
                      'July','August','September','October','November','December']

function openAddTermin(p: any) {
  // Default ke bulan dari target_invoice_date, atau bulan berikutnya setelah termin terakhir
  let defaultMonth = 1
  if (p.target_invoice_date) {
    defaultMonth = new Date(p.target_invoice_date).getMonth() + 1
  }
  const existing = monthlyData.value[p.project_id]?.monthly ?? []
  if (existing.length) {
    const maxMonth = Math.max(...existing.map((m: any) => m.month_num))
    defaultMonth = Math.min(maxMonth + 1, 12)
  }
  Object.assign(addTerminModal, {
    show      : true,
    project_id: p.project_id,
    type      : p.type,
    month_num : defaultMonth,
    target    : 0,
    actual    : 0,
  })
}

async function submitAddTermin() {
  terminSaving.value = true
  try {
    // Upsert: update row jika sudah ada, insert baru jika belum
    await post(`/v1/revenue/monthly/upsert`, {
      project_id: addTerminModal.project_id,
      month_num : addTerminModal.month_num,
      month_name: monthEnNames[addTerminModal.month_num],
      target    : addTerminModal.target,
      actual    : addTerminModal.actual,
    })
    addTerminModal.show = false
    await refreshMonthly(addTerminModal.project_id)
    await refresh()
  } finally {
    terminSaving.value = false
  }
}

function terminStatusBadge(status: string): string {
  const map: Record<string, string> = {
    'Achieve'    : 'badge-green',
    'Not Achieve': 'badge-red',
    'Pending'    : 'badge-yellow',
  }
  return map[status] ?? 'badge-gray'
}

// Helper: type badge color
function typeBadge(type: string): string {
  const map: Record<string, string> = {
    'One Time': 'badge-gray',
    'Termin'  : 'badge-yellow',
    'Bulanan' : 'badge-blue',
    'Tahunan' : 'badge-purple',
  }
  return map[type] ?? 'badge-gray'
}

// Helper: invoice period status badge
function invoicePeriodBadge(status: string): string {
  const map: Record<string, string> = {
    'Tepat Waktu'     : 'badge-green',
    'Terlambat'       : 'badge-red',
    'Belum Jatuh Tempo': 'badge-yellow',
  }
  return map[status] ?? 'badge-gray'
}

// ── IMPORT PIPELINE WON ──────────────────────────────────────────
const showImportModal = ref(false)
const importTab       = ref<'pending'|'done'>('pending')
const wonLeads        = ref<any[]>([])
const wonPending      = ref(0)        // badge di header tombol
const selectedLeads   = ref(new Set<string>())
const leadForms       = ref<Record<string, any>>({})
const importSaving    = ref(false)
const importResult    = ref<any>(null)
const importError     = ref<string>('')

const MONTH_NAMES = ['Januari','Februari','Maret','April','Mei','Juni',
                     'Juli','Agustus','September','Oktober','November','Desember']

function terminPctTotal(leadId: string) {
  return (leadForms.value[leadId]?.termins || []).reduce((s: number, t: any) => s + (Number(t.pct) || 0), 0)
}

function addTerminRow(leadId: string) {
  const form = leadForms.value[leadId]
  if (!form) return
  const usedPct = terminPctTotal(leadId)
  const remaining = Math.max(0, 100 - usedPct)
  const lastMonth = form.termins.length ? form.termins[form.termins.length - 1].month : (new Date().getMonth() + 1)
  form.termins.push({ month: Math.min(lastMonth + 1, 12), pct: remaining })
}

function removeTerminRow(leadId: string, idx: number) {
  leadForms.value[leadId]?.termins.splice(idx, 1)
}

function rebuildBulananMonths(leadId: string) {
  const form = leadForms.value[leadId]
  if (!form) return
  const startMonth = form.tgl_penagihan_pertama
    ? new Date(form.tgl_penagihan_pertama).getMonth() + 1
    : new Date().getMonth() + 1
  // Preserve existing targets
  const existing: Record<number, number> = {}
  for (const bt of (form.bulanan_targets || [])) existing[bt.month] = bt.target
  form.bulanan_targets = Array.from({ length: 12 - startMonth + 1 }, (_, i) => {
    const m = startMonth + i
    return { month: m, name: MONTH_NAMES[m - 1], target: existing[m] ?? 0 }
  })
}

function bulananTotal(leadId: string): number {
  return (leadForms.value[leadId]?.bulanan_targets || [])
    .reduce((s: number, b: any) => s + (Number(b.target) || 0), 0)
}

function onBillingDateChange(leadId: string) {
  const form = leadForms.value[leadId]
  if (!form || !form.tgl_penagihan_pertama) return
  const month = new Date(form.tgl_penagihan_pertama).getMonth() + 1
  if (form.type === 'Termin' && form.termins?.length) {
    form.termins[0].month = month
  }
  if (form.type === 'Bulanan') rebuildBulananMonths(leadId)
}

function onTypeChange(leadId: string) {
  const form = leadForms.value[leadId]
  if (!form) return
  if (form.type === 'Bulanan') rebuildBulananMonths(leadId)
}

const selectedCount = computed(() => selectedLeads.value.size)

// Leads yang tampil sesuai tab
const filteredWonLeads = computed(() =>
  importTab.value === 'pending'
    ? wonLeads.value.filter(l => !l.is_imported)
    : wonLeads.value.filter(l =>  l.is_imported)
)

const allPendingSelected = computed(() => {
  const pending = wonLeads.value.filter(l => !l.is_imported)
  return pending.length > 0 && pending.every(l => selectedLeads.value.has(l.lead_id))
})

// Inisialisasi form per lead dengan default dari data lead
function initLeadForm(lead: any) {
  if (leadForms.value[lead.lead_id]) return
  leadForms.value[lead.lead_id] = {
    lead_id                : lead.lead_id,
    client                 : lead.nama_company,
    product                : lead.product,
    owner                  : lead.sales_owner || '',
    lob                    : lead.segmen || 'DCSS',
    kategori               : lead.suggested_kategori,
    type                   : lead.suggested_type,
    tgl_penagihan_pertama  : '',
    revenue_target         : lead.deal_value,
    notes                  : lead.remarks || '',
    termins                : [{ month: new Date().getMonth() + 1, pct: 100 }],
    bulanan_targets        : [],
  }
}

function toggleLead(leadId: string) {
  if (selectedLeads.value.has(leadId)) {
    selectedLeads.value.delete(leadId)
  } else {
    selectedLeads.value.add(leadId)
    // Inisialisasi form saat dipilih pertama kali
    const lead = wonLeads.value.find(l => l.lead_id === leadId)
    if (lead) initLeadForm(lead)
  }
  // Trigger reactivity
  selectedLeads.value = new Set(selectedLeads.value)
}

function toggleAllLeads() {
  const pending = wonLeads.value.filter(l => !l.is_imported)
  if (allPendingSelected.value) {
    selectedLeads.value = new Set()
  } else {
    pending.forEach(l => { initLeadForm(l); selectedLeads.value.add(l.lead_id) })
    selectedLeads.value = new Set(selectedLeads.value)
  }
}

async function openImportModal() {
  importResult.value  = null
  importError.value   = ''
  selectedLeads.value = new Set()
  importTab.value     = 'pending'
  showImportModal.value = true
  try {
    const res = await get('/v1/revenue/won-leads')
    wonLeads.value  = res.leads || []
    wonPending.value = res.pending || 0
  } catch (e) {
    wonLeads.value = []
  }
}

async function excludeLead(leadId: string) {
  try {
    await del(`/v1/revenue/won-leads/${leadId}`)
    wonLeads.value = wonLeads.value.filter(l => l.lead_id !== leadId)
    selectedLeads.value.delete(leadId)
    selectedLeads.value = new Set(selectedLeads.value)
    wonPending.value = wonLeads.value.filter(l => !l.is_imported).length
  } catch (e) {}
}

async function submitImport() {
  if (selectedLeads.value.size === 0) return
  importSaving.value = true
  importResult.value = null
  importError.value  = ''
  try {
    const items = [...selectedLeads.value].map(id => ({ ...leadForms.value[id] }))
    const res   = await post('/v1/revenue/import-won', { items })
    importResult.value  = res
    selectedLeads.value = new Set()
    const wonRes = await get('/v1/revenue/won-leads')
    wonLeads.value   = wonRes.leads || []
    wonPending.value = wonRes.pending || 0
    await refresh()
  } catch (err: any) {
    const detail = err?.data?.detail || err?.message || 'Terjadi kesalahan saat import.'
    importError.value = typeof detail === 'string' ? detail : JSON.stringify(detail)
  } finally {
    importSaving.value = false
  }
}

// Load badge counts saat halaman dibuka
onMounted(async () => {
  await loadOrgList()
  try { productList.value = await get('/v1/master/products/dropdown') } catch {}
  try {
    const res = await get('/v1/revenue/won-leads')
    wonPending.value = res.pending || 0
  } catch {}
  await loadTrashedCount()
})
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
