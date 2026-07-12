<template>
  <div class="min-h-screen">

    <!-- Header -->
    <div class="px-6 py-5 border-b border-apex-border flex items-center justify-between gap-4 flex-wrap">
      <div>
        <h1 class="text-xl font-bold text-apex-text flex items-center gap-2">
          <i class="fa-solid fa-map-location-dot text-emerald-400"></i>
          Field Activity
        </h1>
        <p class="text-xs text-apex-muted mt-0.5">Monitor kunjungan & posisi sales di lapangan</p>
      </div>
      <button @click="openCheckin"
        class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-apex-text text-sm px-4 py-2 rounded-lg font-medium transition">
        <i class="fa-solid fa-location-crosshairs"></i>
        Tambah Kunjungan
      </button>
    </div>

    <!-- Stats Bar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-5">
      <div v-for="s in statsCards" :key="s.label"
        class="bg-apex-surface border border-apex-border rounded-xl p-4 flex items-center gap-3">
        <div class="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" :class="s.bg">
          <i :class="['fa-solid', s.icon, s.color]"></i>
        </div>
        <div>
          <div class="text-2xl font-bold text-apex-text leading-none">{{ s.value }}</div>
          <div class="text-xs text-apex-muted mt-0.5">{{ s.label }}</div>
        </div>
      </div>
    </div>

    <!-- Map + Sidebar -->
    <div class="flex gap-4 px-6 pt-5 h-[500px]">
      <!-- Main Map -->
      <div class="flex-1 bg-apex-surface border border-apex-border rounded-xl overflow-hidden relative min-w-0">
        <div class="absolute top-3 left-3 z-10 flex gap-2">
          <span class="text-xs bg-apex-surface/90 border border-apex-border text-apex-muted px-2 py-1 rounded-lg">
            <i class="fa-solid fa-circle text-emerald-400 text-[8px] mr-1"></i> Aktif
          </span>
          <span class="text-xs bg-apex-surface/90 border border-apex-border text-apex-muted px-2 py-1 rounded-lg">
            <i class="fa-solid fa-circle text-apex-muted text-[8px] mr-1"></i> Selesai
          </span>
        </div>
        <div v-if="mapLoading" class="w-full h-full flex items-center justify-center text-apex-faint">
          <i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat peta…
        </div>
        <ClientOnly v-else>
          <FieldMap :markers="mapMarkers" :trails="mapTrails" :height="500" />
        </ClientOnly>
      </div>

      <!-- Active Sales sidebar -->
      <div class="w-72 shrink-0 bg-apex-surface border border-apex-border rounded-xl flex flex-col overflow-hidden">
        <div class="px-4 py-3 border-b border-apex-border font-semibold text-sm text-apex-text flex items-center gap-2">
          <i class="fa-solid fa-users text-emerald-400 text-xs"></i>
          Sales di Lapangan
          <span class="ml-auto bg-emerald-900/60 text-emerald-300 text-xs px-2 py-0.5 rounded-full">
            {{ activeSales.length }}
          </span>
        </div>
        <div class="overflow-y-auto flex-1 divide-y divide-apex-border">
          <div v-if="!activeSales.length" class="flex flex-col items-center justify-center h-full text-apex-faint text-sm gap-2 py-8">
            <i class="fa-solid fa-map-pin text-2xl"></i>
            <span>Tidak ada sales aktif</span>
          </div>
          <div v-for="s in activeSales" :key="s.user_id"
            class="px-4 py-3 flex items-center gap-3 hover:bg-apex-card/40 transition">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-apex-text shrink-0"
              :style="`background:${userColor(s.user_id)}`">
              {{ initials(s.sales_nama) }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm font-medium text-apex-text truncate">{{ s.sales_nama }}</div>
              <div class="text-xs text-apex-muted truncate">{{ s.client_nama || 'Kunjungan umum' }}</div>
              <div class="text-xs text-emerald-400 mt-0.5">
                <i class="fa-regular fa-clock mr-1"></i>{{ fmtTime(s.checked_in_at) }}
              </div>
            </div>
            <button @click="doCheckout(s.id)"
              class="text-xs bg-red-900/50 hover:bg-red-800 text-red-300 px-2 py-1 rounded-lg transition shrink-0">
              Out
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Log Table -->
    <div class="px-6 pt-5 pb-8">
      <div class="bg-apex-surface border border-apex-border rounded-xl overflow-hidden">
        <!-- Filter bar -->
        <div class="px-4 py-3 border-b border-apex-border flex flex-wrap gap-3 items-end">
          <div>
            <label class="block text-xs text-apex-muted mb-1">Tanggal</label>
            <input type="date" v-model="filter.date" @change="loadLog"
              class="bg-apex-input border border-apex-border rounded-lg px-3 py-1.5 text-sm text-apex-text focus:outline-none focus:border-emerald-500 w-40" />
          </div>
          <div>
            <label class="block text-xs text-apex-muted mb-1">Sales</label>
            <select v-model="filter.user_id" @change="loadLog"
              class="bg-apex-input border border-apex-border rounded-lg px-3 py-1.5 text-sm text-apex-text focus:outline-none focus:border-emerald-500 w-44">
              <option value="">Semua Sales</option>
              <option v-for="u in userList" :key="u.id" :value="u.id">{{ u.nama }}</option>
            </select>
          </div>
          <div>
            <label class="block text-xs text-apex-muted mb-1">Tipe</label>
            <select v-model="filter.type" @change="loadLog"
              class="bg-apex-input border border-apex-border rounded-lg px-3 py-1.5 text-sm text-apex-text focus:outline-none focus:border-emerald-500 w-36">
              <option value="">Semua Tipe</option>
              <option value="check_in">Check-in</option>
              <option value="check_out">Check-out</option>
              <option value="visit">Visit</option>
            </select>
          </div>
          <div class="ml-auto text-xs text-apex-faint self-end pb-1.5">{{ logTotal }} kunjungan</div>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead>
              <tr class="border-b border-apex-border text-xs text-apex-muted uppercase tracking-wide">
                <th class="text-left px-4 py-3">Sales</th>
                <th class="text-left px-4 py-3">Tipe</th>
                <th class="text-left px-4 py-3">Client / Lead</th>
                <th class="text-left px-4 py-3">Lokasi</th>
                <th class="text-left px-4 py-3">Check-in</th>
                <th class="text-left px-4 py-3">Check-out</th>
                <th class="text-left px-4 py-3">Durasi</th>
                <th class="text-left px-4 py-3">Catatan</th>
                <th class="text-center px-4 py-3">Foto</th>
                <th class="text-left px-4 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody v-if="logLoading">
              <tr><td colspan="10" class="text-center py-12 text-apex-faint">
                <i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat data…
              </td></tr>
            </tbody>
            <tbody v-else-if="!logRows.length">
              <tr><td colspan="10" class="text-center py-12 text-apex-faint">
                <i class="fa-solid fa-inbox text-2xl mb-2 block"></i>Tidak ada data kunjungan
              </td></tr>
            </tbody>
            <tbody v-else class="divide-y divide-apex-border">
              <tr v-for="r in logRows" :key="r.id" class="hover:bg-apex-card/30 transition">
                <td class="px-4 py-3">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-apex-text shrink-0"
                      :style="`background:${userColor(r.user_id)}`">{{ initials(r.sales_nama) }}</div>
                    <span class="text-apex-text font-medium text-xs">{{ r.sales_nama }}</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <span class="text-xs px-2 py-0.5 rounded-full font-medium"
                    :class="r.type === 'check_in' ? 'bg-emerald-900/50 text-emerald-300'
                          : r.type === 'check_out' ? 'bg-red-900/50 text-red-300'
                          : 'bg-blue-900/50 text-blue-300'">
                    {{ r.type === 'check_in' ? 'Check-in' : r.type === 'check_out' ? 'Check-out' : 'Visit' }}
                  </span>
                </td>
                <td class="px-4 py-3 text-apex-muted text-xs">
                  <div>{{ r.client_nama || '—' }}</div>
                  <div v-if="r.product" class="text-apex-faint">{{ r.product }}</div>
                </td>
                <td class="px-4 py-3 text-xs max-w-[160px]">
                  <button v-if="r.latitude && r.longitude"
                     @click="openMapPopup({ type: 'point', lat: r.latitude, lng: r.longitude, label: r.address || `${r.latitude}, ${r.longitude}` })"
                     class="w-full text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-1 overflow-hidden text-left"
                     :title="r.address">
                    <i class="fa-solid fa-location-dot text-[10px] flex-shrink-0" /><span class="truncate">{{ r.address || `${r.latitude}, ${r.longitude}` }}</span>
                  </button>
                  <button v-else-if="r.address"
                     @click="openMapPopup({ type: 'point', label: r.address })"
                     class="w-full text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-1 overflow-hidden text-left"
                     :title="r.address">
                    <i class="fa-solid fa-location-dot text-[10px] flex-shrink-0" /><span class="truncate">{{ r.address }}</span>
                  </button>
                  <span v-else class="text-apex-faint">—</span>
                  <div v-if="r.accuracy_m" class="text-apex-faint mt-0.5">±{{ r.accuracy_m }}m</div>
                </td>
                <td class="px-4 py-3 text-apex-muted text-xs">{{ fmtDatetime(r.checked_in_at) }}</td>
                <td class="px-4 py-3 text-apex-muted text-xs">
                  <span v-if="r.checked_out_at">{{ fmtDatetime(r.checked_out_at) }}</span>
                  <span v-else class="text-yellow-400"><i class="fa-solid fa-circle-dot animate-pulse mr-1"></i>Aktif</span>
                </td>
                <td class="px-4 py-3 text-xs text-apex-muted">
                  <span v-if="r.duration_minutes != null">{{ fmtDuration(r.duration_minutes) }}</span>
                  <span v-else>—</span>
                </td>
                <td class="px-4 py-3 text-xs text-apex-muted max-w-[140px]">
                  <div class="truncate" :title="r.notes">{{ r.notes || '—' }}</div>
                </td>
                <td class="px-4 py-3 text-center">
                  <button v-if="r.photo_url" @click="lightboxUrl = photoUrl(r.photo_url)"
                    title="Lihat foto check-in" class="focus:outline-none">
                    <img :src="photoUrl(r.photo_url)"
                         class="w-10 h-10 object-cover rounded border border-apex-border hover:border-primary-400 transition mx-auto cursor-zoom-in" />
                  </button>
                  <span v-else class="text-apex-faint">—</span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex gap-1.5">
                    <button v-if="!r.checked_out_at" @click="doCheckout(r.id)"
                      class="text-xs bg-red-900/50 hover:bg-red-800 text-red-300 px-2 py-1 rounded transition">
                      <i class="fa-solid fa-right-from-bracket"></i>
                    </button>
                    <button @click="deleteLog(r.id)"
                      class="text-xs bg-apex-input hover:bg-red-900/40 text-apex-muted hover:text-red-400 px-2 py-1 rounded transition">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-4 pb-3 pt-1">
          <AppPagination
            v-model:page="logPage"
            v-model:per-page="logPerPage"
            :total="logTotal"
            :total-pages="logPages"
            :per-page-options="[10, 25, 50]"
          />
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════════
         CHECK-IN MODAL
    ════════════════════════════════════════════════════════════════════════ -->
    <div v-if="showCheckinModal"
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]">

        <!-- Modal header -->
        <div class="px-6 py-4 border-b border-apex-border flex items-center justify-between shrink-0">
          <h3 class="font-semibold text-apex-text flex items-center gap-2">
            <i class="fa-solid fa-location-crosshairs text-emerald-400"></i>
            Catat Kunjungan
          </h3>
          <button @click="showCheckinModal = false" class="text-apex-muted hover:text-apex-text transition">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <!-- Modal body — scrollable -->
        <div class="px-6 py-4 space-y-4 overflow-y-auto flex-1">

          <!-- Sales -->
          <div>
            <label class="block text-xs font-medium text-apex-muted mb-1">Sales</label>
            <select v-model="checkinForm.user_id"
              class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500">
              <option value="">-- Pilih Sales --</option>
              <option v-for="u in userList" :key="u.id" :value="u.id">{{ u.nama }}</option>
            </select>
          </div>

          <!-- Lead (opsional) -->
          <div>
            <label class="block text-xs font-medium text-apex-muted mb-1">Lead / Client <span class="text-apex-faint">(opsional)</span></label>
            <input v-model="checkinForm.lead_id" type="text" placeholder="ID Lead (cth: LD-001)"
              class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500" />
          </div>

          <!-- Lokasi -->
          <div>
            <label class="block text-xs font-medium text-apex-muted mb-1">Lokasi</label>

            <!-- Input alamat + tombol-tombol -->
            <div class="relative">
              <div class="flex gap-2 mb-2">
                <div class="relative flex-1">
                  <input
                    v-model="checkinForm.address"
                    type="text"
                    placeholder="Ketik alamat untuk mencari…"
                    autocomplete="off"
                    @input="onAddressInput"
                    @keydown.down.prevent="suggestionCursor = Math.min(suggestionCursor+1, addressSuggestions.length-1)"
                    @keydown.up.prevent="suggestionCursor = Math.max(suggestionCursor-1, 0)"
                    @keydown.enter.prevent="suggestionCursor >= 0 && pickSuggestion(addressSuggestions[suggestionCursor])"
                    @keydown.escape="addressSuggestions = []"
                    @blur="hideSuggestionsDelayed"
                    class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500" />
                  <!-- Spinner saat searching -->
                  <i v-if="addressSearching"
                    class="fa-solid fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-apex-muted text-xs pointer-events-none"></i>
                  <!-- Dropdown saran -->
                  <div v-if="addressSuggestions.length"
                    class="absolute z-10 top-full left-0 right-0 mt-1 bg-apex-input border border-apex-border rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
                    <button
                      v-for="(s, i) in addressSuggestions" :key="s.place_id"
                      @mousedown.prevent="pickSuggestion(s)"
                      :class="[
                        'w-full text-left px-3 py-2.5 text-xs flex items-start gap-2 transition border-b border-apex-border last:border-0',
                        i === suggestionCursor ? 'bg-emerald-800/50 text-apex-text' : 'hover:bg-apex-card text-apex-text'
                      ]">
                      <i class="fa-solid fa-location-dot text-emerald-400 mt-0.5 shrink-0 text-[11px]"></i>
                      <div>
                        <div class="font-medium leading-snug">{{ s.display_name.split(',')[0] }}</div>
                        <div class="text-apex-muted text-[10px] leading-snug mt-0.5 line-clamp-1">
                          {{ s.display_name.split(',').slice(1).join(',').trim() }}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                <!-- GPS otomatis -->
                <button @click="detectLocation" :disabled="geoLoading" title="Deteksi lokasi saat ini"
                  class="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-apex-text px-3 py-2 rounded-lg transition text-sm shrink-0">
                  <i :class="['fa-solid', geoLoading ? 'fa-spinner fa-spin' : 'fa-location-arrow']"></i>
                </button>
                <!-- Toggle map picker -->
                <button @click="toggleMapPicker" title="Pilih dari peta"
                  :class="showMapPicker ? 'bg-blue-600 hover:bg-blue-500 text-apex-text' : 'bg-apex-card hover:bg-gray-600 text-apex-muted'"
                  class="px-3 py-2 rounded-lg transition text-sm shrink-0">
                  <i class="fa-solid fa-map-marked-alt"></i>
                </button>
              </div>
            </div>

            <!-- Koordinat hasil pick / GPS / suggestion -->
            <div v-if="checkinForm.latitude" class="text-xs text-apex-faint flex items-center gap-1 mb-2">
              <i class="fa-solid fa-map-pin text-emerald-500"></i>
              <span>{{ checkinForm.latitude }}, {{ checkinForm.longitude }}</span>
              <span v-if="checkinForm.accuracy_m" class="text-apex-faint">±{{ checkinForm.accuracy_m }}m</span>
              <button @click="clearLocation" class="ml-auto text-apex-faint hover:text-red-400 transition text-xs">
                <i class="fa-solid fa-xmark"></i> hapus koordinat
              </button>
            </div>

            <!-- MAP PICKER -->
            <div v-if="showMapPicker" class="rounded-xl overflow-hidden border border-apex-border relative">
              <div class="bg-apex-input px-3 py-1.5 text-xs text-apex-muted flex items-center gap-2 border-b border-apex-border">
                <i class="fa-solid fa-hand-pointer text-blue-400"></i>
                Klik pada peta untuk menentukan lokasi
                <span v-if="pickerGeocoding" class="ml-auto text-emerald-400">
                  <i class="fa-solid fa-spinner fa-spin mr-1"></i>Mencari alamat…
                </span>
              </div>
              <div ref="pickerMapEl" style="height:260px;width:100%"></div>
            </div>
          </div>

          <!-- Waktu -->
          <div>
            <label class="block text-xs font-medium text-apex-muted mb-1">Waktu Check-in</label>
            <input type="datetime-local" v-model="checkinForm.checked_in_at"
              class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500" />
          </div>

          <!-- Catatan -->
          <div>
            <label class="block text-xs font-medium text-apex-muted mb-1">Catatan</label>
            <textarea v-model="checkinForm.notes" rows="2" placeholder="Tujuan kunjungan, keterangan dll"
              class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500 resize-none"></textarea>
          </div>

          <!-- Foto Check-in -->
          <div>
            <label class="block text-xs font-medium text-apex-muted mb-1">Foto Check-in <span class="text-apex-faint">(opsional)</span></label>
            <div v-if="!photoPreview"
              class="border-2 border-dashed border-apex-border rounded-lg p-4 text-center cursor-pointer hover:border-emerald-600 transition"
              @click="triggerFileInput" @dragover.prevent @drop.prevent="onPhotoDrop">
              <i class="fa-solid fa-camera text-2xl text-apex-faint mb-2 block"></i>
              <p class="text-xs text-apex-faint">Klik untuk upload foto</p>
              <div class="flex justify-center mt-3">
                <button type="button" @click.stop="triggerFileInput"
                  class="text-xs px-3 py-1.5 bg-apex-input hover:bg-apex-card text-apex-muted rounded-lg border border-apex-border transition">
                  <i class="fa-solid fa-folder-open mr-1"></i>Pilih File
                </button>
              </div>
            </div>
            <div v-else class="relative rounded-lg overflow-hidden border border-apex-border">
              <img :src="photoPreview" class="w-full max-h-48 object-cover" />
              <button type="button" @click="clearPhoto"
                class="absolute top-2 right-2 w-7 h-7 bg-red-900/80 hover:bg-red-700 text-apex-text rounded-full flex items-center justify-center transition">
                <i class="fa-solid fa-xmark text-xs"></i>
              </button>
              <div class="bg-apex-surface/70 text-xs text-apex-muted px-3 py-1.5 flex items-center gap-2">
                <i class="fa-solid fa-image text-emerald-400"></i>{{ photoFileName }}
              </div>
            </div>
            <input ref="fileInputRef" type="file" accept="image/*" class="hidden" @change="onFileSelected" />
          </div>

        </div>

        <!-- Modal footer -->
        <div class="px-6 py-4 border-t border-apex-border flex gap-3 justify-end shrink-0">
          <button @click="showCheckinModal = false"
            class="px-4 py-2 rounded-lg bg-apex-input hover:bg-apex-card text-sm text-apex-muted transition">
            Batal
          </button>
          <button @click="submitCheckin" :disabled="savingCheckin"
            class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-apex-text text-sm font-medium transition disabled:opacity-50">
            <i v-if="savingCheckin" class="fa-solid fa-spinner fa-spin mr-1"></i>
            Simpan Check-in
          </button>
        </div>
      </div>
    </div>

  <!-- Map Popup -->
  <Teleport to="body">
    <div v-if="mapPopup.show"
         class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
         @click.self="closeMapPopup">
      <div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-apex-border">
          <div class="flex items-center gap-2 text-sm font-medium text-apex-text">
            <i class="fa-solid fa-location-dot text-emerald-400" />
            Lokasi Kunjungan
          </div>
          <button @click="closeMapPopup"
                  class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-apex-card text-apex-muted hover:text-apex-text transition">
            <i class="fa-solid fa-xmark text-sm" />
          </button>
        </div>
        <div ref="mapPopupEl" style="height: 520px" class="w-full" />
        <div class="px-4 py-2.5 border-t border-apex-border flex items-center justify-between">
          <span class="text-xs text-apex-faint truncate max-w-xs">{{ mapPopup.label || '' }}</span>
          <a v-if="mapPopup.lat"
             :href="`https://www.google.com/maps?q=${mapPopup.lat},${mapPopup.lng}`"
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
    <div v-if="lightboxUrl" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      @click.self="lightboxUrl = null" @keydown.esc="lightboxUrl = null">
      <div class="relative max-w-3xl max-h-[90vh] mx-4">
        <img :src="lightboxUrl" class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        <button @click="lightboxUrl = null"
          class="absolute -top-3 -right-3 w-8 h-8 bg-apex-input hover:bg-apex-card text-apex-text rounded-full flex items-center justify-center shadow-lg transition">
          <i class="fa-solid fa-xmark text-sm"></i>
        </button>
      </div>
    </div>
  </Teleport>

  </div>
</template>

<script setup lang="ts">
import type { MapMarker, TrailPoint } from '~/components/FieldMap.vue'

definePageMeta({ layout: 'default' })

const { get, post, put, del } = useApi()
const { todayStr: _todayStr } = useFormat()
function todayStr() { return _todayStr() }
function photoUrl(path: string) { return `/storage/${path}` }

// ── State ─────────────────────────────────────────────────────────────────────
const stats      = ref<any>(null)
const mapData    = ref<{ positions: any[]; trails: any[] }>({ positions: [], trails: [] })
const mapLoading = ref(true)
const logRows    = ref<any[]>([])
const logTotal   = ref(0)
const logPage    = ref(1)
const logPages   = ref(1)
const logPerPage = ref(5)
const logLoading = ref(false)
const userList   = ref<any[]>([])

const filter = reactive({ date: todayStr(), user_id: '', type: '' })

const showCheckinModal = ref(false)
const geoLoading       = ref(false)
const savingCheckin    = ref(false)
const checkinForm      = reactive({
  user_id:       '' as any,
  lead_id:       '',
  address:       '',
  latitude:      null as number | null,
  longitude:     null as number | null,
  accuracy_m:    null as number | null,
  notes:         '',
  checked_in_at: '',
})

// ── Map Popup ─────────────────────────────────────────────────────────────────
interface MapPopupState {
  show: boolean
  type: 'point'
  lat?: number; lng?: number
  label?: string
}
const mapPopup   = ref<MapPopupState>({ show: false, type: 'point' })
const mapPopupEl = ref<HTMLElement | null>(null)
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
  if (!mapPopupEl.value || !mapPopup.value.lat) return
  const L = (await import('leaflet')).default
  if (popupMap) { popupMap.remove(); popupMap = null }

  const { lat, lng } = mapPopup.value
  popupMap = L.map(mapPopupEl.value, { zoomControl: true }).setView([lat!, lng!], 15)
  await addTileLayer(L, popupMap)

  const icon = L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5)"></div>`,
    iconAnchor: [7, 7],
  })
  L.marker([lat!, lng!], { icon }).addTo(popupMap).bindPopup('Lokasi Check-In').openPopup()
}

// ── Foto check-in ─────────────────────────────────────────────────────────────
const lightboxUrl    = ref<string | null>(null)
const fileInputRef   = ref<HTMLInputElement | null>(null)
const photoPreview   = ref<string | null>(null)
const photoBase64    = ref<string | null>(null)
const photoFileName  = ref('')

function triggerFileInput() { fileInputRef.value?.click() }

function clearPhoto() {
  photoPreview.value  = null
  photoBase64.value   = null
  photoFileName.value = ''
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function onPhotoDrop(e: DragEvent) {
  const file = e.dataTransfer?.files?.[0]
  if (file) processPhotoFile(file)
}

function onFileSelected(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processPhotoFile(file)
}

function processPhotoFile(file: File) {
  if (!file.type.startsWith('image/')) return alert('File harus berupa gambar.')
  photoFileName.value = file.name
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    photoPreview.value = result
    // Ambil base64 tanpa prefix "data:image/...;base64,"
    photoBase64.value  = result.split(',')[1] ?? null
  }
  reader.readAsDataURL(file)
}

// ── Address autocomplete ──────────────────────────────────────────────────────
const addressSuggestions = ref<any[]>([])
const addressSearching   = ref(false)
const suggestionCursor   = ref(-1)
let   searchDebounce: ReturnType<typeof setTimeout> | null = null

function onAddressInput() {
  suggestionCursor.value = -1
  const q = checkinForm.address.trim()
  if (searchDebounce) clearTimeout(searchDebounce)
  if (q.length < 3) { addressSuggestions.value = []; return }
  searchDebounce = setTimeout(() => searchAddress(q), 400)
}

async function searchAddress(q: string) {
  addressSearching.value = true
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=6&addressdetails=1&accept-language=id`,
      { headers: { 'Accept-Language': 'id' } }
    )
    const data = await res.json()
    addressSuggestions.value = data
  } catch {
    addressSuggestions.value = []
  } finally {
    addressSearching.value = false
  }
}

async function pickSuggestion(s: any) {
  checkinForm.address   = s.display_name
  checkinForm.latitude  = parseFloat(parseFloat(s.lat).toFixed(8))
  checkinForm.longitude = parseFloat(parseFloat(s.lon).toFixed(8))
  checkinForm.accuracy_m = null
  addressSuggestions.value = []
  suggestionCursor.value   = -1

  // Pan map picker jika sedang terbuka
  if (pickerMap) {
    const L = (await import('leaflet')).default
    pickerMap.setView([checkinForm.latitude, checkinForm.longitude], 16)
    if (pickerMarker) pickerMarker.remove()
    pickerMarker = L.marker([checkinForm.latitude, checkinForm.longitude], {
      icon: L.divIcon({
        html: `<div style="width:28px;height:28px;border-radius:50%;background:#3b82f6;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
        className: '', iconSize:[28,28], iconAnchor:[14,14],
      }),
    }).addTo(pickerMap)
  }
}

function hideSuggestionsDelayed() {
  setTimeout(() => { addressSuggestions.value = [] }, 150)
}

// ── Map Picker state ──────────────────────────────────────────────────────────
const showMapPicker   = ref(false)
const pickerGeocoding = ref(false)
const pickerMapEl     = ref<HTMLElement | null>(null)
let   pickerMap: any  = null
let   pickerMarker: any = null

// ── Computed ──────────────────────────────────────────────────────────────────
const allPositions = computed(() =>
  mapData.value.positions.map(p => ({
    ...p,
    is_active: p.is_active === true || p.is_active === 't',
    latitude:  p.latitude  ? parseFloat(p.latitude)  : null,
    longitude: p.longitude ? parseFloat(p.longitude) : null,
  }))
)
const mapMarkers = computed<MapMarker[]>(() =>
  allPositions.value.filter(p => p.latitude && p.longitude) as MapMarker[]
)
const mapTrails = computed<TrailPoint[]>(() =>
  mapData.value.trails.map(t => ({
    ...t,
    latitude:  parseFloat(t.latitude),
    longitude: parseFloat(t.longitude),
  }))
)
const activeSales = computed(() => allPositions.value.filter(m => m.is_active))
const statsCards  = computed(() => [
  { label: 'Kunjungan Hari Ini', value: stats.value?.today_count ?? 0,
    icon: 'fa-map-pin',       color: 'text-emerald-400', bg: 'bg-emerald-900/30' },
  { label: 'Sales Aktif',       value: stats.value?.active_count ?? 0,
    icon: 'fa-user-check',    color: 'text-blue-400',    bg: 'bg-blue-900/30'    },
  { label: 'Rata-rata Durasi',  value: stats.value ? fmtDuration(stats.value.avg_duration) : '—',
    icon: 'fa-clock',         color: 'text-yellow-400',  bg: 'bg-yellow-900/30'  },
  { label: 'Total Minggu Ini',  value: stats.value?.week_count ?? 0,
    icon: 'fa-calendar-week', color: 'text-purple-400',  bg: 'bg-purple-900/30'  },
])

// ── Helpers ───────────────────────────────────────────────────────────────────
function nowLocalStr() {
  // Gunakan waktu WIB (UTC+7) agar konsisten dengan server
  const wib = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' }))
  return wib.getFullYear() + '-'
    + String(wib.getMonth()+1).padStart(2,'0') + '-'
    + String(wib.getDate()).padStart(2,'0') + 'T'
    + String(wib.getHours()).padStart(2,'0') + ':'
    + String(wib.getMinutes()).padStart(2,'0')
}
// Semua timestamp di DB disimpan dalam WIB (Asia/Jakarta, +07:00).
// Tambahkan offset WIB agar JS tidak salah interpret sebagai local browser time.
function toWibDate(dt: string): Date {
  if (/Z|[+-]\d{2}:\d{2}$/.test(dt)) return new Date(dt)
  return new Date(dt.replace(' ', 'T') + '+07:00')
}
function fmtTime(dt: string) {
  if (!dt) return '—'
  return toWibDate(dt).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit', timeZone:'Asia/Jakarta' })
}
function fmtDatetime(dt: string) {
  if (!dt) return '—'
  return toWibDate(dt).toLocaleString('id-ID', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', timeZone:'Asia/Jakarta' })
}
function fmtDuration(min: number) {
  if (!min && min !== 0) return '—'
  if (min < 60) return `${min}m`
  return `${Math.floor(min/60)}j ${min%60}m`
}
function initials(nama: string) {
  return (nama || '?').split(' ').map((w:string) => w[0]).slice(0,2).join('').toUpperCase()
}
const USER_COLORS = ['#22c55e','#3b82f6','#f97316','#a855f7','#ec4899','#14b8a6','#eab308','#ef4444']
function userColor(id: number) { return USER_COLORS[id % USER_COLORS.length] }

// ── Reverse geocode (Nominatim) ───────────────────────────────────────────────
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      { headers: { 'Accept-Language': 'id' } }
    )
    const j = await r.json()
    return j.display_name || ''
  } catch { return '' }
}

// ── Map Picker ────────────────────────────────────────────────────────────────
async function toggleMapPicker() {
  showMapPicker.value = !showMapPicker.value
  if (showMapPicker.value) {
    await nextTick()
    await initPickerMap()
  } else {
    destroyPickerMap()
  }
}

async function initPickerMap() {
  if (!pickerMapEl.value || pickerMap) return

  const L = (await import('leaflet')).default

  // Tentukan center awal: pakai koordinat yg sudah ada, atau Jakarta
  const initLat = checkinForm.latitude  ?? -6.2088
  const initLng = checkinForm.longitude ?? 106.8456

  pickerMap = L.map(pickerMapEl.value, { center: [initLat, initLng], zoom: 14, zoomControl: true })

  await addTileLayer(L, pickerMap)

  // Marker icon custom
  const crosshairIcon = L.divIcon({
    html: `<div style="
      width:28px;height:28px;border-radius:50%;
      background:#3b82f6;border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,.5);
    "></div>`,
    className: '',
    iconSize:   [28, 28],
    iconAnchor: [14, 14],
  })

  // Jika sudah ada koordinat, taruh marker
  if (checkinForm.latitude && checkinForm.longitude) {
    pickerMarker = L.marker([checkinForm.latitude, checkinForm.longitude], { icon: crosshairIcon })
      .addTo(pickerMap)
  }

  // Klik peta → set marker & reverse geocode
  pickerMap.on('click', async (e: any) => {
    const { lat, lng } = e.latlng
    checkinForm.latitude  = parseFloat(lat.toFixed(8))
    checkinForm.longitude = parseFloat(lng.toFixed(8))
    checkinForm.accuracy_m = null

    if (pickerMarker) pickerMarker.remove()
    pickerMarker = L.marker([lat, lng], { icon: crosshairIcon }).addTo(pickerMap)

    pickerGeocoding.value = true
    checkinForm.address = await reverseGeocode(lat, lng)
    pickerGeocoding.value = false
  })
}

function destroyPickerMap() {
  if (pickerMap) { pickerMap.remove(); pickerMap = null; pickerMarker = null }
}

// ── GPS detect ────────────────────────────────────────────────────────────────
async function detectLocation() {
  if (!navigator.geolocation) return alert('Browser tidak mendukung geolocation.')
  geoLoading.value = true
  navigator.geolocation.getCurrentPosition(async (pos) => {
    checkinForm.latitude   = parseFloat(pos.coords.latitude.toFixed(8))
    checkinForm.longitude  = parseFloat(pos.coords.longitude.toFixed(8))
    checkinForm.accuracy_m = Math.round(pos.coords.accuracy)
    checkinForm.address    = await reverseGeocode(checkinForm.latitude, checkinForm.longitude)
    geoLoading.value = false

    // Pan picker map ke lokasi baru jika sedang terbuka
    if (pickerMap) {
      const L = (await import('leaflet')).default
      pickerMap.setView([checkinForm.latitude, checkinForm.longitude], 16)
      if (pickerMarker) pickerMarker.remove()
      pickerMarker = L.marker([checkinForm.latitude, checkinForm.longitude], {
        icon: L.divIcon({
          html: `<div style="width:28px;height:28px;border-radius:50%;background:#22c55e;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`,
          className: '', iconSize:[28,28], iconAnchor:[14,14],
        }),
      }).addTo(pickerMap)
    }
  }, (err) => {
    geoLoading.value = false
    alert('Gagal mendapatkan lokasi: ' + err.message)
  }, { enableHighAccuracy: true, timeout: 15000 })
}

function clearLocation() {
  checkinForm.latitude   = null
  checkinForm.longitude  = null
  checkinForm.accuracy_m = null
  if (pickerMarker) { pickerMarker.remove(); pickerMarker = null }
}

// ── Data Loaders ──────────────────────────────────────────────────────────────
async function loadStats() {
  try { stats.value = await get('/v1/field-activity/stats') } catch {}
}
async function loadMap() {
  mapLoading.value = true
  try {
    const res: any = await get('/v1/field-activity/map')
    // Laravel returns { positions, trails }; legacy FastAPI returned flat array
    if (res && Array.isArray(res.positions)) {
      mapData.value = {
        positions: res.positions.map((r: any) => ({ ...r, is_active: !r.checked_out_at || r.is_active === true || r.is_active === 't' })),
        trails:    res.trails ?? [],
      }
    } else {
      // fallback: flat array
      const rows: any[] = Array.isArray(res) ? res : []
      const byUser: Record<number, any> = {}
      for (const r of rows) {
        if (!byUser[r.user_id] || r.checked_in_at > byUser[r.user_id].checked_in_at) {
          byUser[r.user_id] = r
        }
      }
      mapData.value = {
        positions: Object.values(byUser).map(r => ({ ...r, is_active: !r.checked_out_at })),
        trails:    rows,
      }
    }
  } catch {}
  finally { mapLoading.value = false }
}
async function loadLog() {
  logLoading.value = true
  try {
    const params = new URLSearchParams()
    if (filter.date)    params.set('date', filter.date)
    if (filter.user_id) params.set('user_id', String(filter.user_id))
    if (filter.type)    params.set('type', filter.type)
    params.set('page', String(logPage.value))
    params.set('per_page', String(logPerPage.value))
    const res = await get(`/v1/field-activity?${params}`)
    logRows.value  = res.data
    logTotal.value = res.total
    logPages.value = res.pages
  } catch {} finally {
    logLoading.value = false
  }
}
async function loadUsers() {
  try { userList.value = await get('/v1/master/sales') } catch {}
}

// ── Actions ───────────────────────────────────────────────────────────────────
function openCheckin() {
  Object.assign(checkinForm, {
    user_id: '', lead_id: '', address: '',
    latitude: null, longitude: null, accuracy_m: null,
    notes: '', checked_in_at: nowLocalStr(),
  })
  clearPhoto()
  showMapPicker.value      = false
  addressSuggestions.value = []
  suggestionCursor.value   = -1
  destroyPickerMap()
  showCheckinModal.value = true
}

async function submitCheckin() {
  if (!checkinForm.user_id) return alert('Pilih sales terlebih dahulu.')
  savingCheckin.value = true
  try {
    await post('/v1/field-activity/checkin', {
      user_id:       checkinForm.user_id,
      lead_id:       checkinForm.lead_id    || null,
      latitude:      checkinForm.latitude,
      longitude:     checkinForm.longitude,
      address:       checkinForm.address    || null,
      accuracy_m:    checkinForm.accuracy_m,
      notes:         checkinForm.notes      || null,
      photo_base64:  photoBase64.value      || null,
      checked_in_at: checkinForm.checked_in_at || nowLocalStr(),
    })
    showCheckinModal.value = false
    clearPhoto()
    destroyPickerMap()
    await Promise.all([loadStats(), loadMap(), loadLog()])
  } catch (e: any) {
    alert('Gagal menyimpan: ' + (e?.message || e))
  } finally {
    savingCheckin.value = false
  }
}

async function doCheckout(id: number) {
  if (!confirm('Catat check-out sekarang?')) return
  try {
    const payload: Record<string, unknown> = { checked_out_at: nowLocalStr() }
    // Ambil koordinat GPS saat checkout (best-effort)
    if (navigator.geolocation) {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            payload.checkout_latitude  = pos.coords.latitude
            payload.checkout_longitude = pos.coords.longitude
            resolve()
          },
          () => resolve(), // lanjutkan meskipun GPS gagal
          { timeout: 5000, maximumAge: 30000 },
        )
      })
    }
    await put(`/v1/field-activity/${id}/checkout`, payload)
    await Promise.all([loadStats(), loadMap(), loadLog()])
  } catch (e: any) { alert('Gagal check-out: ' + (e?.message || e)) }
}

async function deleteLog(id: number) {
  if (!confirm('Hapus data kunjungan ini?')) return
  try {
    await del(`/v1/field-activity/${id}`)
    await Promise.all([loadStats(), loadLog()])
  } catch (e: any) { alert('Gagal menghapus: ' + (e?.message || e)) }
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
onMounted(async () => {
  await Promise.all([loadStats(), loadMap(), loadLog(), loadUsers()])
})

onUnmounted(() => {
  destroyPickerMap()
  if (popupMap) { popupMap.remove(); popupMap = null }
})
</script>
