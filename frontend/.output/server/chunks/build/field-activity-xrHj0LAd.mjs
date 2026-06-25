import { _ as __nuxt_component_0$1, d as useRuntimeConfig } from './server.mjs';
import { _ as __nuxt_component_1 } from './AppPagination-DUr1sfAX.mjs';
import { defineComponent, computed, ref, reactive, mergeProps, unref, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderComponent, ssrRenderStyle, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "field-activity",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const _config = useRuntimeConfig();
    const storageBase = computed(() => {
      const api = _config.public.apiBase || "http://localhost:8002/api";
      return api.replace(/\/api\/?$/, "") + "/storage";
    });
    function photoUrl(path) {
      return `${storageBase.value}/${path}`;
    }
    const stats = ref(null);
    const mapData = ref({ positions: [], trails: [] });
    const mapLoading = ref(true);
    const logRows = ref([]);
    const logTotal = ref(0);
    const logPage = ref(1);
    const logPages = ref(1);
    const logPerPage = ref(10);
    const logLoading = ref(false);
    const userList = ref([]);
    const filter = reactive({ date: todayStr(), user_id: "", type: "" });
    const showCheckinModal = ref(false);
    const geoLoading = ref(false);
    const savingCheckin = ref(false);
    const checkinForm = reactive({
      user_id: "",
      lead_id: "",
      address: "",
      latitude: null,
      longitude: null,
      accuracy_m: null,
      notes: "",
      checked_in_at: ""
    });
    const mapPopup = ref({ show: false, type: "point" });
    ref(null);
    const lightboxUrl = ref(null);
    ref(null);
    const photoPreview = ref(null);
    ref(null);
    const photoFileName = ref("");
    const addressSuggestions = ref([]);
    const addressSearching = ref(false);
    const suggestionCursor = ref(-1);
    const showMapPicker = ref(false);
    const pickerGeocoding = ref(false);
    ref(null);
    const allPositions = computed(
      () => mapData.value.positions.map((p) => ({
        ...p,
        is_active: p.is_active === true || p.is_active === "t",
        latitude: p.latitude ? parseFloat(p.latitude) : null,
        longitude: p.longitude ? parseFloat(p.longitude) : null
      }))
    );
    computed(
      () => allPositions.value.filter((p) => p.latitude && p.longitude)
    );
    computed(
      () => mapData.value.trails.map((t) => ({
        ...t,
        latitude: parseFloat(t.latitude),
        longitude: parseFloat(t.longitude)
      }))
    );
    const activeSales = computed(() => allPositions.value.filter((m) => m.is_active));
    const statsCards = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return [
        {
          label: "Kunjungan Hari Ini",
          value: (_b = (_a = stats.value) == null ? void 0 : _a.today_count) != null ? _b : 0,
          icon: "fa-map-pin",
          color: "text-emerald-400",
          bg: "bg-emerald-900/30"
        },
        {
          label: "Sales Aktif",
          value: (_d = (_c = stats.value) == null ? void 0 : _c.active_count) != null ? _d : 0,
          icon: "fa-user-check",
          color: "text-blue-400",
          bg: "bg-blue-900/30"
        },
        {
          label: "Rata-rata Durasi",
          value: stats.value ? fmtDuration(stats.value.avg_duration) : "\u2014",
          icon: "fa-clock",
          color: "text-yellow-400",
          bg: "bg-yellow-900/30"
        },
        {
          label: "Total Minggu Ini",
          value: (_f = (_e = stats.value) == null ? void 0 : _e.week_count) != null ? _f : 0,
          icon: "fa-calendar-week",
          color: "text-purple-400",
          bg: "bg-purple-900/30"
        }
      ];
    });
    function todayStr() {
      return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    }
    function toWibDate(dt) {
      if (/Z|[+-]\d{2}:\d{2}$/.test(dt)) return new Date(dt);
      return /* @__PURE__ */ new Date(dt.replace(" ", "T") + "+07:00");
    }
    function fmtTime(dt) {
      if (!dt) return "\u2014";
      return toWibDate(dt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
    }
    function fmtDatetime(dt) {
      if (!dt) return "\u2014";
      return toWibDate(dt).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
    }
    function fmtDuration(min) {
      if (!min && min !== 0) return "\u2014";
      if (min < 60) return `${min}m`;
      return `${Math.floor(min / 60)}j ${min % 60}m`;
    }
    function initials(nama) {
      return (nama || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    }
    const USER_COLORS = ["#22c55e", "#3b82f6", "#f97316", "#a855f7", "#ec4899", "#14b8a6", "#eab308", "#ef4444"];
    function userColor(id) {
      return USER_COLORS[id % USER_COLORS.length];
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0$1;
      const _component_AppPagination = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen" }, _attrs))}><div class="px-6 py-5 border-b border-apex-border flex items-center justify-between gap-4 flex-wrap"><div><h1 class="text-xl font-bold text-apex-text flex items-center gap-2"><i class="fa-solid fa-map-location-dot text-emerald-400"></i> Field Activity </h1><p class="text-xs text-apex-muted mt-0.5">Monitor kunjungan &amp; posisi sales di lapangan</p></div><button class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-apex-text text-sm px-4 py-2 rounded-lg font-medium transition"><i class="fa-solid fa-location-crosshairs"></i> Tambah Kunjungan </button></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-5"><!--[-->`);
      ssrRenderList(unref(statsCards), (s) => {
        _push(`<div class="bg-apex-surface border border-apex-border rounded-xl p-4 flex items-center gap-3"><div class="${ssrRenderClass([s.bg, "w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"])}"><i class="${ssrRenderClass(["fa-solid", s.icon, s.color])}"></i></div><div><div class="text-2xl font-bold text-apex-text leading-none">${ssrInterpolate(s.value)}</div><div class="text-xs text-apex-muted mt-0.5">${ssrInterpolate(s.label)}</div></div></div>`);
      });
      _push(`<!--]--></div><div class="flex gap-4 px-6 pt-5 h-[500px]"><div class="flex-1 bg-apex-surface border border-apex-border rounded-xl overflow-hidden relative min-w-0"><div class="absolute top-3 left-3 z-10 flex gap-2"><span class="text-xs bg-apex-surface/90 border border-apex-border text-apex-muted px-2 py-1 rounded-lg"><i class="fa-solid fa-circle text-emerald-400 text-[8px] mr-1"></i> Aktif </span><span class="text-xs bg-apex-surface/90 border border-apex-border text-apex-muted px-2 py-1 rounded-lg"><i class="fa-solid fa-circle text-apex-muted text-[8px] mr-1"></i> Selesai </span></div>`);
      if (unref(mapLoading)) {
        _push(`<div class="w-full h-full flex items-center justify-center text-apex-faint"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat peta\u2026 </div>`);
      } else {
        _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      }
      _push(`</div><div class="w-72 shrink-0 bg-apex-surface border border-apex-border rounded-xl flex flex-col overflow-hidden"><div class="px-4 py-3 border-b border-apex-border font-semibold text-sm text-apex-text flex items-center gap-2"><i class="fa-solid fa-users text-emerald-400 text-xs"></i> Sales di Lapangan <span class="ml-auto bg-emerald-900/60 text-emerald-300 text-xs px-2 py-0.5 rounded-full">${ssrInterpolate(unref(activeSales).length)}</span></div><div class="overflow-y-auto flex-1 divide-y divide-apex-border">`);
      if (!unref(activeSales).length) {
        _push(`<div class="flex flex-col items-center justify-center h-full text-apex-faint text-sm gap-2 py-8"><i class="fa-solid fa-map-pin text-2xl"></i><span>Tidak ada sales aktif</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<!--[-->`);
      ssrRenderList(unref(activeSales), (s) => {
        _push(`<div class="px-4 py-3 flex items-center gap-3 hover:bg-apex-card/40 transition"><div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-apex-text shrink-0" style="${ssrRenderStyle(`background:${userColor(s.user_id)}`)}">${ssrInterpolate(initials(s.sales_nama))}</div><div class="min-w-0 flex-1"><div class="text-sm font-medium text-apex-text truncate">${ssrInterpolate(s.sales_nama)}</div><div class="text-xs text-apex-muted truncate">${ssrInterpolate(s.client_nama || "Kunjungan umum")}</div><div class="text-xs text-emerald-400 mt-0.5"><i class="fa-regular fa-clock mr-1"></i>${ssrInterpolate(fmtTime(s.checked_in_at))}</div></div><button class="text-xs bg-red-900/50 hover:bg-red-800 text-red-300 px-2 py-1 rounded-lg transition shrink-0"> Out </button></div>`);
      });
      _push(`<!--]--></div></div></div><div class="px-6 pt-5 pb-8"><div class="bg-apex-surface border border-apex-border rounded-xl overflow-hidden"><div class="px-4 py-3 border-b border-apex-border flex flex-wrap gap-3 items-end"><div><label class="block text-xs text-apex-muted mb-1">Tanggal</label><input type="date"${ssrRenderAttr("value", unref(filter).date)} class="bg-apex-input border border-apex-border rounded-lg px-3 py-1.5 text-sm text-apex-text focus:outline-none focus:border-emerald-500 w-40"></div><div><label class="block text-xs text-apex-muted mb-1">Sales</label><select class="bg-apex-input border border-apex-border rounded-lg px-3 py-1.5 text-sm text-apex-text focus:outline-none focus:border-emerald-500 w-44"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filter).user_id) ? ssrLooseContain(unref(filter).user_id, "") : ssrLooseEqual(unref(filter).user_id, "")) ? " selected" : ""}>Semua Sales</option><!--[-->`);
      ssrRenderList(unref(userList), (u) => {
        _push(`<option${ssrRenderAttr("value", u.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(filter).user_id) ? ssrLooseContain(unref(filter).user_id, u.id) : ssrLooseEqual(unref(filter).user_id, u.id)) ? " selected" : ""}>${ssrInterpolate(u.nama)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="block text-xs text-apex-muted mb-1">Tipe</label><select class="bg-apex-input border border-apex-border rounded-lg px-3 py-1.5 text-sm text-apex-text focus:outline-none focus:border-emerald-500 w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filter).type) ? ssrLooseContain(unref(filter).type, "") : ssrLooseEqual(unref(filter).type, "")) ? " selected" : ""}>Semua Tipe</option><option value="check_in"${ssrIncludeBooleanAttr(Array.isArray(unref(filter).type) ? ssrLooseContain(unref(filter).type, "check_in") : ssrLooseEqual(unref(filter).type, "check_in")) ? " selected" : ""}>Check-in</option><option value="check_out"${ssrIncludeBooleanAttr(Array.isArray(unref(filter).type) ? ssrLooseContain(unref(filter).type, "check_out") : ssrLooseEqual(unref(filter).type, "check_out")) ? " selected" : ""}>Check-out</option><option value="visit"${ssrIncludeBooleanAttr(Array.isArray(unref(filter).type) ? ssrLooseContain(unref(filter).type, "visit") : ssrLooseEqual(unref(filter).type, "visit")) ? " selected" : ""}>Visit</option></select></div><div class="ml-auto text-xs text-apex-faint self-end pb-1.5">${ssrInterpolate(unref(logTotal))} kunjungan</div></div><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-apex-border text-xs text-apex-muted uppercase tracking-wide"><th class="text-left px-4 py-3">Sales</th><th class="text-left px-4 py-3">Tipe</th><th class="text-left px-4 py-3">Client / Lead</th><th class="text-left px-4 py-3">Lokasi</th><th class="text-left px-4 py-3">Check-in</th><th class="text-left px-4 py-3">Check-out</th><th class="text-left px-4 py-3">Durasi</th><th class="text-left px-4 py-3">Catatan</th><th class="text-center px-4 py-3">Foto</th><th class="text-left px-4 py-3">Aksi</th></tr></thead>`);
      if (unref(logLoading)) {
        _push(`<tbody><tr><td colspan="10" class="text-center py-12 text-apex-faint"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat data\u2026 </td></tr></tbody>`);
      } else if (!unref(logRows).length) {
        _push(`<tbody><tr><td colspan="10" class="text-center py-12 text-apex-faint"><i class="fa-solid fa-inbox text-2xl mb-2 block"></i>Tidak ada data kunjungan </td></tr></tbody>`);
      } else {
        _push(`<tbody class="divide-y divide-apex-border"><!--[-->`);
        ssrRenderList(unref(logRows), (r) => {
          _push(`<tr class="hover:bg-apex-card/30 transition"><td class="px-4 py-3"><div class="flex items-center gap-2"><div class="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-apex-text shrink-0" style="${ssrRenderStyle(`background:${userColor(r.user_id)}`)}">${ssrInterpolate(initials(r.sales_nama))}</div><span class="text-apex-text font-medium text-xs">${ssrInterpolate(r.sales_nama)}</span></div></td><td class="px-4 py-3"><span class="${ssrRenderClass([r.type === "check_in" ? "bg-emerald-900/50 text-emerald-300" : r.type === "check_out" ? "bg-red-900/50 text-red-300" : "bg-blue-900/50 text-blue-300", "text-xs px-2 py-0.5 rounded-full font-medium"])}">${ssrInterpolate(r.type === "check_in" ? "Check-in" : r.type === "check_out" ? "Check-out" : "Visit")}</span></td><td class="px-4 py-3 text-apex-muted text-xs"><div>${ssrInterpolate(r.client_nama || "\u2014")}</div>`);
          if (r.product) {
            _push(`<div class="text-apex-faint">${ssrInterpolate(r.product)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3 text-xs max-w-[160px]">`);
          if (r.latitude && r.longitude) {
            _push(`<button class="w-full text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-1 overflow-hidden text-left"${ssrRenderAttr("title", r.address)}><i class="fa-solid fa-location-dot text-[10px] flex-shrink-0"></i><span class="truncate">${ssrInterpolate(r.address || `${r.latitude}, ${r.longitude}`)}</span></button>`);
          } else if (r.address) {
            _push(`<button class="w-full text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-1 overflow-hidden text-left"${ssrRenderAttr("title", r.address)}><i class="fa-solid fa-location-dot text-[10px] flex-shrink-0"></i><span class="truncate">${ssrInterpolate(r.address)}</span></button>`);
          } else {
            _push(`<span class="text-apex-faint">\u2014</span>`);
          }
          if (r.accuracy_m) {
            _push(`<div class="text-apex-faint mt-0.5">\xB1${ssrInterpolate(r.accuracy_m)}m</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="px-4 py-3 text-apex-muted text-xs">${ssrInterpolate(fmtDatetime(r.checked_in_at))}</td><td class="px-4 py-3 text-apex-muted text-xs">`);
          if (r.checked_out_at) {
            _push(`<span>${ssrInterpolate(fmtDatetime(r.checked_out_at))}</span>`);
          } else {
            _push(`<span class="text-yellow-400"><i class="fa-solid fa-circle-dot animate-pulse mr-1"></i>Aktif</span>`);
          }
          _push(`</td><td class="px-4 py-3 text-xs text-apex-muted">`);
          if (r.duration_minutes != null) {
            _push(`<span>${ssrInterpolate(fmtDuration(r.duration_minutes))}</span>`);
          } else {
            _push(`<span>\u2014</span>`);
          }
          _push(`</td><td class="px-4 py-3 text-xs text-apex-muted max-w-[140px]"><div class="truncate"${ssrRenderAttr("title", r.notes)}>${ssrInterpolate(r.notes || "\u2014")}</div></td><td class="px-4 py-3 text-center">`);
          if (r.photo_url) {
            _push(`<button title="Lihat foto check-in" class="focus:outline-none"><img${ssrRenderAttr("src", photoUrl(r.photo_url))} class="w-10 h-10 object-cover rounded border border-apex-border hover:border-primary-400 transition mx-auto cursor-zoom-in"></button>`);
          } else {
            _push(`<span class="text-apex-faint">\u2014</span>`);
          }
          _push(`</td><td class="px-4 py-3"><div class="flex gap-1.5">`);
          if (!r.checked_out_at) {
            _push(`<button class="text-xs bg-red-900/50 hover:bg-red-800 text-red-300 px-2 py-1 rounded transition"><i class="fa-solid fa-right-from-bracket"></i></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="text-xs bg-apex-input hover:bg-red-900/40 text-apex-muted hover:text-red-400 px-2 py-1 rounded transition"><i class="fa-solid fa-trash"></i></button></div></td></tr>`);
        });
        _push(`<!--]--></tbody>`);
      }
      _push(`</table></div><div class="px-4 pb-3 pt-1">`);
      _push(ssrRenderComponent(_component_AppPagination, {
        page: unref(logPage),
        "onUpdate:page": ($event) => isRef(logPage) ? logPage.value = $event : null,
        "per-page": unref(logPerPage),
        "onUpdate:perPage": ($event) => isRef(logPerPage) ? logPerPage.value = $event : null,
        total: unref(logTotal),
        "total-pages": unref(logPages),
        "per-page-options": [10, 25, 50]
      }, null, _parent));
      _push(`</div></div></div>`);
      if (unref(showCheckinModal)) {
        _push(`<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div class="bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh]"><div class="px-6 py-4 border-b border-apex-border flex items-center justify-between shrink-0"><h3 class="font-semibold text-apex-text flex items-center gap-2"><i class="fa-solid fa-location-crosshairs text-emerald-400"></i> Catat Kunjungan </h3><button class="text-apex-muted hover:text-apex-text transition"><i class="fa-solid fa-xmark"></i></button></div><div class="px-6 py-4 space-y-4 overflow-y-auto flex-1"><div><label class="block text-xs font-medium text-apex-muted mb-1">Sales</label><select class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(checkinForm).user_id) ? ssrLooseContain(unref(checkinForm).user_id, "") : ssrLooseEqual(unref(checkinForm).user_id, "")) ? " selected" : ""}>-- Pilih Sales --</option><!--[-->`);
        ssrRenderList(unref(userList), (u) => {
          _push(`<option${ssrRenderAttr("value", u.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(checkinForm).user_id) ? ssrLooseContain(unref(checkinForm).user_id, u.id) : ssrLooseEqual(unref(checkinForm).user_id, u.id)) ? " selected" : ""}>${ssrInterpolate(u.nama)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="block text-xs font-medium text-apex-muted mb-1">Lead / Client <span class="text-apex-faint">(opsional)</span></label><input${ssrRenderAttr("value", unref(checkinForm).lead_id)} type="text" placeholder="ID Lead (cth: LD-001)" class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500"></div><div><label class="block text-xs font-medium text-apex-muted mb-1">Lokasi</label><div class="relative"><div class="flex gap-2 mb-2"><div class="relative flex-1"><input${ssrRenderAttr("value", unref(checkinForm).address)} type="text" placeholder="Ketik alamat untuk mencari\u2026" autocomplete="off" class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500">`);
        if (unref(addressSearching)) {
          _push(`<i class="fa-solid fa-spinner fa-spin absolute right-3 top-1/2 -translate-y-1/2 text-apex-muted text-xs pointer-events-none"></i>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(addressSuggestions).length) {
          _push(`<div class="absolute z-10 top-full left-0 right-0 mt-1 bg-apex-input border border-apex-border rounded-xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto"><!--[-->`);
          ssrRenderList(unref(addressSuggestions), (s, i) => {
            _push(`<button class="${ssrRenderClass([
              "w-full text-left px-3 py-2.5 text-xs flex items-start gap-2 transition border-b border-apex-border last:border-0",
              i === unref(suggestionCursor) ? "bg-emerald-800/50 text-apex-text" : "hover:bg-apex-card text-apex-text"
            ])}"><i class="fa-solid fa-location-dot text-emerald-400 mt-0.5 shrink-0 text-[11px]"></i><div><div class="font-medium leading-snug">${ssrInterpolate(s.display_name.split(",")[0])}</div><div class="text-apex-muted text-[10px] leading-snug mt-0.5 line-clamp-1">${ssrInterpolate(s.display_name.split(",").slice(1).join(",").trim())}</div></div></button>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button${ssrIncludeBooleanAttr(unref(geoLoading)) ? " disabled" : ""} title="Deteksi lokasi saat ini" class="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-apex-text px-3 py-2 rounded-lg transition text-sm shrink-0"><i class="${ssrRenderClass(["fa-solid", unref(geoLoading) ? "fa-spinner fa-spin" : "fa-location-arrow"])}"></i></button><button title="Pilih dari peta" class="${ssrRenderClass([unref(showMapPicker) ? "bg-blue-600 hover:bg-blue-500 text-apex-text" : "bg-apex-card hover:bg-gray-600 text-apex-muted", "px-3 py-2 rounded-lg transition text-sm shrink-0"])}"><i class="fa-solid fa-map-marked-alt"></i></button></div></div>`);
        if (unref(checkinForm).latitude) {
          _push(`<div class="text-xs text-apex-faint flex items-center gap-1 mb-2"><i class="fa-solid fa-map-pin text-emerald-500"></i><span>${ssrInterpolate(unref(checkinForm).latitude)}, ${ssrInterpolate(unref(checkinForm).longitude)}</span>`);
          if (unref(checkinForm).accuracy_m) {
            _push(`<span class="text-apex-faint">\xB1${ssrInterpolate(unref(checkinForm).accuracy_m)}m</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="ml-auto text-apex-faint hover:text-red-400 transition text-xs"><i class="fa-solid fa-xmark"></i> hapus koordinat </button></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(showMapPicker)) {
          _push(`<div class="rounded-xl overflow-hidden border border-apex-border relative"><div class="bg-apex-input px-3 py-1.5 text-xs text-apex-muted flex items-center gap-2 border-b border-apex-border"><i class="fa-solid fa-hand-pointer text-blue-400"></i> Klik pada peta untuk menentukan lokasi `);
          if (unref(pickerGeocoding)) {
            _push(`<span class="ml-auto text-emerald-400"><i class="fa-solid fa-spinner fa-spin mr-1"></i>Mencari alamat\u2026 </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div style="${ssrRenderStyle({ "height": "260px", "width": "100%" })}"></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div><label class="block text-xs font-medium text-apex-muted mb-1">Waktu Check-in</label><input type="datetime-local"${ssrRenderAttr("value", unref(checkinForm).checked_in_at)} class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500"></div><div><label class="block text-xs font-medium text-apex-muted mb-1">Catatan</label><textarea rows="2" placeholder="Tujuan kunjungan, keterangan dll" class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-emerald-500 resize-none">${ssrInterpolate(unref(checkinForm).notes)}</textarea></div><div><label class="block text-xs font-medium text-apex-muted mb-1">Foto Check-in <span class="text-apex-faint">(opsional)</span></label>`);
        if (!unref(photoPreview)) {
          _push(`<div class="border-2 border-dashed border-apex-border rounded-lg p-4 text-center cursor-pointer hover:border-emerald-600 transition"><i class="fa-solid fa-camera text-2xl text-apex-faint mb-2 block"></i><p class="text-xs text-apex-faint">Klik untuk upload foto</p><div class="flex justify-center mt-3"><button type="button" class="text-xs px-3 py-1.5 bg-apex-input hover:bg-apex-card text-apex-muted rounded-lg border border-apex-border transition"><i class="fa-solid fa-folder-open mr-1"></i>Pilih File </button></div></div>`);
        } else {
          _push(`<div class="relative rounded-lg overflow-hidden border border-apex-border"><img${ssrRenderAttr("src", unref(photoPreview))} class="w-full max-h-48 object-cover"><button type="button" class="absolute top-2 right-2 w-7 h-7 bg-red-900/80 hover:bg-red-700 text-apex-text rounded-full flex items-center justify-center transition"><i class="fa-solid fa-xmark text-xs"></i></button><div class="bg-apex-surface/70 text-xs text-apex-muted px-3 py-1.5 flex items-center gap-2"><i class="fa-solid fa-image text-emerald-400"></i>${ssrInterpolate(unref(photoFileName))}</div></div>`);
        }
        _push(`<input type="file" accept="image/*" class="hidden"></div></div><div class="px-6 py-4 border-t border-apex-border flex gap-3 justify-end shrink-0"><button class="px-4 py-2 rounded-lg bg-apex-input hover:bg-apex-card text-sm text-apex-muted transition"> Batal </button><button${ssrIncludeBooleanAttr(unref(savingCheckin)) ? " disabled" : ""} class="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-apex-text text-sm font-medium transition disabled:opacity-50">`);
        if (unref(savingCheckin)) {
          _push(`<i class="fa-solid fa-spinner fa-spin mr-1"></i>`);
        } else {
          _push(`<!---->`);
        }
        _push(` Simpan Check-in </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(mapPopup).show) {
          _push2(`<div class="fixed inset-0 z-[9998] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"><div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"><div class="flex items-center justify-between px-4 py-3 border-b border-apex-border"><div class="flex items-center gap-2 text-sm font-medium text-apex-text"><i class="fa-solid fa-location-dot text-emerald-400"></i> Lokasi Kunjungan </div><button class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-apex-card text-apex-muted hover:text-apex-text transition"><i class="fa-solid fa-xmark text-sm"></i></button></div><div style="${ssrRenderStyle({ "height": "520px" })}" class="w-full"></div><div class="px-4 py-2.5 border-t border-apex-border flex items-center justify-between"><span class="text-xs text-apex-faint truncate max-w-xs">${ssrInterpolate(unref(mapPopup).label || "")}</span>`);
          if (unref(mapPopup).lat) {
            _push2(`<a${ssrRenderAttr("href", `https://www.google.com/maps?q=${unref(mapPopup).lat},${unref(mapPopup).lng}`)} target="_blank" rel="noopener" class="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition flex-shrink-0"><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>Buka Google Maps </a>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(lightboxUrl)) {
          _push2(`<div class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"><div class="relative max-w-3xl max-h-[90vh] mx-4"><img${ssrRenderAttr("src", unref(lightboxUrl))} class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"><button class="absolute -top-3 -right-3 w-8 h-8 bg-apex-input hover:bg-apex-card text-apex-text rounded-full flex items-center justify-center shadow-lg transition"><i class="fa-solid fa-xmark text-sm"></i></button></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/field-activity.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=field-activity-xrHj0LAd.mjs.map
