import { _ as __nuxt_component_0$1, d as useRuntimeConfig, u as useAuthStore } from './server.mjs';
import { _ as __nuxt_component_1 } from './AppPagination-DUr1sfAX.mjs';
import { defineComponent, ref, watch, computed, reactive, nextTick, unref, withCtx, createVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderComponent, ssrRenderStyle, ssrRenderList, ssrRenderAttr, ssrLooseContain, ssrLooseEqual, ssrRenderTeleport } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useFormat } from './useFormat-D7DNHH-1.mjs';
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

const TILE_URLS = {
  osm: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: '\xA9 <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
  },
  voyager: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attr: '\xA9 <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors \xA9 <a href="https://carto.com/">CartoDB</a>'
  },
  hot: {
    url: "https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attr: '\xA9 <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, Tiles by <a href="https://hotosm.org/">HOT</a>'
  },
  voyager_nolabel: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png",
    attr: '\xA9 <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors \xA9 <a href="https://carto.com/">CartoDB</a>'
  }
};
let _cachedTile = null;
let _pendingCount = 0;
let _flushTimer = null;
async function _flush() {
  if (_pendingCount === 0) return;
  const n = _pendingCount;
  _pendingCount = 0;
  try {
    const config = useRuntimeConfig();
    const auth = useAuthStore();
    await $fetch(`${config.public.apiBase}/v1/tile-usage`, {
      method: "POST",
      headers: { Authorization: `Bearer ${auth.token}` },
      body: { count: n }
    });
  } catch {
  }
}
async function getMapTile() {
  var _a;
  if (_cachedTile) return _cachedTile;
  try {
    const config = useRuntimeConfig();
    const auth = useAuthStore();
    const res = await $fetch(`${config.public.apiBase}/v1/app-settings`, {
      headers: { Authorization: `Bearer ${auth.token}` }
    });
    const key = (res == null ? void 0 : res.map_tile) || "osm";
    _cachedTile = (_a = TILE_URLS[key]) != null ? _a : TILE_URLS.osm;
  } catch {
    _cachedTile = TILE_URLS.osm;
  }
  return _cachedTile;
}
async function addTileLayer(L, map) {
  const tile = await getMapTile();
  const layer = L.tileLayer(tile.url, { attribution: tile.attr, maxZoom: 19 }).addTo(map);
  layer.on("tileload", () => {
    _pendingCount++;
    if (_flushTimer) clearTimeout(_flushTimer);
    _flushTimer = setTimeout(_flush, 3e3);
  });
}
const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = (() => {
  console.error(intervalError);
});
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "field-monitor",
  __ssrInlineRender: true,
  setup(__props) {
    const { get } = useApi();
    const fmt = useFormat();
    const activeTab = ref("activity");
    const liveTeam = ref(null);
    const liveTrails = ref([]);
    const liveLoading = ref(false);
    const liveLastUpdate = ref("");
    ref(null);
    let liveRefreshTimer = null;
    const salesColorMap = ref({});
    ref(null);
    function initials(name) {
      return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
    }
    function fmtCoord(lat, lng) {
      return `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`;
    }
    function fmtTimeAgo(ts) {
      if (!ts) return "\u2014";
      const d = /* @__PURE__ */ new Date(ts.replace(" ", "T") + "+07:00");
      const diff = Math.floor((Date.now() - d.getTime()) / 1e3);
      if (diff < 60) return `${diff}d lalu`;
      if (diff < 3600) return `${Math.floor(diff / 60)}m lalu`;
      return `${Math.floor(diff / 3600)}j lalu`;
    }
    watch(activeTab, (tab) => {
      if (tab === "live") {
        liveRefreshTimer = setInterval();
      } else {
        if (liveRefreshTimer) {
          clearInterval(liveRefreshTimer);
          liveRefreshTimer = null;
        }
      }
    });
    const config = useRuntimeConfig();
    const storageBase = computed(() => {
      const api = config.public.apiBase || "http://localhost:8002/api";
      return api.replace(/\/api\/?$/, "") + "/storage";
    });
    function photoUrl(path) {
      return `${storageBase.value}/${path}`;
    }
    function wibDateStr(d = /* @__PURE__ */ new Date()) {
      return d.toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
    }
    function todayStr() {
      return wibDateStr();
    }
    function daysAgo(n) {
      return wibDateStr(new Date(Date.now() - n * 864e5));
    }
    function monthStart() {
      const d = /* @__PURE__ */ new Date();
      d.setDate(1);
      return d.toISOString().slice(0, 10);
    }
    const f = reactive({ date_from: daysAgo(6), date_to: todayStr(), user_id: "" });
    const presets = [
      { label: "Hari ini", fn: () => ({ date_from: todayStr(), date_to: todayStr() }) },
      { label: "7 Hari", fn: () => ({ date_from: daysAgo(6), date_to: todayStr() }) },
      { label: "Bulan ini", fn: () => ({ date_from: monthStart(), date_to: todayStr() }) }
    ];
    const data = ref(null);
    const pending = ref(false);
    const monitorPage = ref(1);
    const monitorPerPage = ref(10);
    const lightboxUrl = ref(null);
    const mapPopup = ref({ show: false, type: "point" });
    ref(null);
    async function load(resetPage = false) {
      if (resetPage) monitorPage.value = 1;
      pending.value = true;
      try {
        data.value = await get("/v1/field-activity/monitor", {
          date_from: f.date_from,
          date_to: f.date_to,
          user_id: f.user_id || void 0,
          page: monitorPage.value,
          per_page: monitorPerPage.value
        });
      } finally {
        pending.value = false;
      }
    }
    watch([monitorPage, monitorPerPage], () => load());
    watch(() => {
      var _a;
      return (_a = data.value) == null ? void 0 : _a.map_points;
    }, async () => {
      await nextTick();
      await initMap();
    });
    function fmtDuration(mins) {
      const m = Math.round(Number(mins) || 0);
      if (!m) return "\u2014";
      const h = Math.floor(m / 60);
      const r = m % 60;
      return h > 0 ? `${h}j ${r}m` : `${r}m`;
    }
    function toWibDate(s) {
      if (!s) return /* @__PURE__ */ new Date();
      return /Z|[+-]\d{2}:\d{2}$/.test(s) ? new Date(s) : /* @__PURE__ */ new Date(s.replace(" ", "T") + "+07:00");
    }
    function fmtTime(s) {
      if (!s) return "\u2014";
      return toWibDate(s).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
    }
    function fmtTgl(s) {
      return (/* @__PURE__ */ new Date(s + "T00:00:00")).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }
    function fmtTglShort(s) {
      const d = /* @__PURE__ */ new Date(s + "T00:00:00");
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }
    const chartDays = computed(() => {
      var _a, _b;
      if (!((_a = data.value) == null ? void 0 : _a.daily_recap)) return [];
      const byDay = {};
      for (const r of ((_b = data.value) == null ? void 0 : _b.daily_recap) || []) {
        byDay[r.tgl] = (byDay[r.tgl] || 0) + Number(r.kunjungan);
      }
      return Object.entries(byDay).sort((a, b) => a[0].localeCompare(b[0])).map(([tgl, total]) => ({ tgl, total }));
    });
    const maxBar = computed(() => Math.max(1, ...chartDays.value.map((d) => d.total)));
    function chartBarH(v) {
      return Math.max(4, v / maxBar.value * 80);
    }
    const timelineHours = Array.from({ length: 14 }, (_, i) => i + 7);
    const timelineDates = computed(() => {
      var _a, _b;
      if (!((_a = data.value) == null ? void 0 : _a.timeline)) return [];
      const s = /* @__PURE__ */ new Set();
      for (const v of ((_b = data.value) == null ? void 0 : _b.timeline) || []) s.add(v.tgl);
      return [...s].sort();
    });
    const selectedTimelineDate = ref("");
    watch(timelineDates, (v) => {
      if (v.length) selectedTimelineDate.value = v[v.length - 1];
    }, { immediate: true });
    const filteredTimeline = computed(() => {
      var _a, _b, _c;
      if (!((_a = data.value) == null ? void 0 : _a.timeline)) return [];
      if (!selectedTimelineDate.value) return ((_b = data.value) == null ? void 0 : _b.timeline) || [];
      return (((_c = data.value) == null ? void 0 : _c.timeline) || []).filter((v) => v.tgl === selectedTimelineDate.value);
    });
    const timelineGroups = computed(() => {
      const groups = {};
      for (const v of filteredTimeline.value) {
        if (!groups[v.sales_nama]) groups[v.sales_nama] = { nama: v.sales_nama, visits: [] };
        groups[v.sales_nama].visits.push(v);
      }
      return Object.values(groups);
    });
    function timelineBarStyle(v) {
      const inDate = toWibDate(v.checked_in_at);
      const inH = inDate.getUTCHours() + 7;
      const inM = inDate.getUTCMinutes();
      const inMin = inH * 60 + inM;
      let durMin = v.duration_minutes ? Number(v.duration_minutes) : 30;
      if (!v.checked_out_at) durMin = 30;
      const dayStart = 7 * 60;
      const dayEnd = 20 * 60;
      const daySpan = dayEnd - dayStart;
      const left = Math.max(0, Math.min(100, (inMin - dayStart) / daySpan * 100));
      const width = Math.max(1, Math.min(100 - left, durMin / daySpan * 100));
      return { left: `${left}%`, width: `${width}%` };
    }
    const mapEl = ref(null);
    let map = null;
    let L = null;
    const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16"];
    async function initMap() {
      var _a, _b;
      try {
        if (!mapEl.value || !((_a = data.value) == null ? void 0 : _a.map_points)) return;
        L = (await import('leaflet')).default;
        await import('leaflet.markercluster');
        if (map) {
          map.remove();
          map = null;
        }
        map = L.map(mapEl.value, { zoomControl: true }).setView([-6.2, 106.8], 11);
        await addTileLayer(L, map);
        const points = ((_b = data.value) == null ? void 0 : _b.map_points) || [];
        if (!points.length) return;
        const salesColors = {};
        let ci = 0;
        const bounds = [];
        const cluster = L.markerClusterGroup({
          maxClusterRadius: 30,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          iconCreateFunction: (c) => {
            const count = c.getChildCount();
            return L.divIcon({
              className: "",
              html: `<div style="
          width:32px;height:32px;border-radius:50%;
          background:#6366f1;border:3px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,.4);
          display:flex;align-items:center;justify-content:center;
          font-size:12px;font-weight:700;color:white;
        ">${count}</div>`,
              iconAnchor: [16, 16]
            });
          }
        });
        for (const p of points) {
          if (!salesColors[p.user_id]) salesColors[p.user_id] = COLORS[ci++ % COLORS.length];
          const color = salesColors[p.user_id];
          const lat = parseFloat(p.latitude);
          const lng = parseFloat(p.longitude);
          bounds.push([lat, lng]);
          const icon = L.divIcon({
            className: "",
            html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>`,
            iconAnchor: [6, 6]
          });
          const timeStr = toWibDate(p.checked_in_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta" });
          const marker = L.marker([lat, lng], { icon }).bindPopup(`<div style="font-size:12px;min-width:160px">
        <b>${p.sales_nama}</b><br>
        ${p.client_nama || p.lead_id || "\u2014"}<br>
        <span style="color:#9ca3af">${timeStr}</span>
        ${p.duration_minutes ? `<br>Durasi: ${fmtDuration(p.duration_minutes)}` : ""}
      </div>`);
          cluster.addLayer(marker);
        }
        map.addLayer(cluster);
        if (bounds.length) map.fitBounds(bounds, { padding: [30, 30] });
      } catch (e) {
        console.warn("initMap error:", e);
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      const _component_ClientOnly = __nuxt_component_0$1;
      const _component_AppPagination = __nuxt_component_1;
      _push(`<!--[--><div><div class="page-header mb-4"><div><h1 class="page-title"><i class="fa-solid fa-chart-line text-primary-400 mr-2"></i>Field Activity Monitor </h1><p class="page-subtitle">Monitoring kunjungan lapangan tim sales</p></div><div class="flex rounded-lg overflow-hidden border border-apex-border text-sm font-medium"><button class="${ssrRenderClass([unref(activeTab) === "activity" ? "bg-primary-700 text-white" : "bg-apex-bg text-gray-400 hover:text-gray-200", "px-4 py-2 transition"])}"><i class="fa-solid fa-map-marked-alt mr-1.5"></i>Aktivitas </button><button class="${ssrRenderClass([unref(activeTab) === "live" ? "bg-primary-700 text-white" : "bg-apex-bg text-gray-400 hover:text-gray-200", "px-4 py-2 transition flex items-center gap-2"])}"><span class="relative flex h-2 w-2">`);
      if (unref(activeTab) === "live") {
        _push(`<span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<span class="${ssrRenderClass([unref(activeTab) === "live" ? "bg-emerald-400" : "bg-gray-600", "relative inline-flex rounded-full h-2 w-2"])}"></span></span> Live Tracking </button></div></div>`);
      if (unref(activeTab) === "live") {
        _push(`<!--[--><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-3"><span class="text-sm text-gray-400"> Update terakhir: <span class="text-gray-200">${ssrInterpolate(unref(liveLastUpdate) || "\u2014")}</span></span>`);
        if (unref(liveTeam)) {
          _push(`<span class="text-sm"><span class="text-emerald-400 font-semibold">${ssrInterpolate(unref(liveTeam).active_count)}</span><span class="text-gray-400"> online \xB7 </span><span class="text-gray-500 font-semibold">${ssrInterpolate(unref(liveTeam).offline_count)}</span><span class="text-gray-400"> offline</span></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button${ssrIncludeBooleanAttr(unref(liveLoading)) ? " disabled" : ""} class="btn-secondary btn-sm flex items-center gap-2"><i class="${ssrRenderClass([unref(liveLoading) ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-rotate", "text-xs"])}"></i> Refresh </button></div><div class="grid grid-cols-1 xl:grid-cols-3 gap-4"><div class="xl:col-span-2 card p-0 overflow-hidden"><div class="px-4 py-3 border-b border-apex-border flex items-center justify-between"><div class="flex items-center gap-2 text-sm font-medium text-gray-200"><i class="fa-solid fa-location-dot text-primary-400"></i>Posisi Tim Sales </div><div class="flex items-center gap-2 text-xs text-gray-500"><i class="fa-solid fa-clock"></i>Auto-refresh 30 detik </div></div>`);
        _push(ssrRenderComponent(_component_ClientOnly, null, {
          fallback: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<div class="flex items-center justify-center" style="${ssrRenderStyle({ "height": "480px" })}"${_scopeId}><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"${_scopeId}></i></div>`);
            } else {
              return [
                createVNode("div", {
                  class: "flex items-center justify-center",
                  style: { "height": "480px" }
                }, [
                  createVNode("i", { class: "fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" })
                ])
              ];
            }
          })
        }, _parent));
        _push(`</div><div class="space-y-3"><div class="card"><div class="text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block"></span> Online (${ssrInterpolate(((_a = unref(liveTeam)) == null ? void 0 : _a.active_count) || 0)}) </div>`);
        if (!((_c = (_b = unref(liveTeam)) == null ? void 0 : _b.active) == null ? void 0 : _c.length)) {
          _push(`<div class="text-sm text-gray-500 text-center py-4"> Belum ada sales aktif </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(((_d = unref(liveTeam)) == null ? void 0 : _d.active) || [], (s) => {
          _push(`<div class="flex items-center gap-3 py-2 border-b border-apex-border last:border-0 cursor-pointer hover:bg-apex-card/50 rounded px-1 -mx-1 transition"><div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0" style="${ssrRenderStyle({ background: unref(salesColorMap)[s.user_id] || "#6366f1" })}">${ssrInterpolate(initials(s.sales_nama))}</div><div class="flex-1 min-w-0"><div class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(s.sales_nama)}</div><div class="text-xs text-gray-500 truncate">${ssrInterpolate(s.address || fmtCoord(s.latitude, s.longitude))}</div></div><div class="text-right flex-shrink-0"><div class="text-xs text-emerald-400">${ssrInterpolate(fmtTimeAgo(s.last_seen))}</div></div></div>`);
        });
        _push(`<!--]--></div><div class="card"><div class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-gray-600 inline-block"></span> Offline (${ssrInterpolate(((_e = unref(liveTeam)) == null ? void 0 : _e.offline_count) || 0)}) </div>`);
        if (!((_g = (_f = unref(liveTeam)) == null ? void 0 : _f.offline) == null ? void 0 : _g.length)) {
          _push(`<div class="text-sm text-gray-500 text-center py-3"> \u2014 </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(((_h = unref(liveTeam)) == null ? void 0 : _h.offline) || [], (s) => {
          _push(`<div class="flex items-center gap-3 py-2 border-b border-apex-border last:border-0"><div class="w-8 h-8 rounded-full bg-apex-card flex items-center justify-center text-xs font-bold text-apex-faint flex-shrink-0">${ssrInterpolate(initials(s.sales_nama))}</div><div class="flex-1 min-w-0"><div class="text-sm text-gray-500 truncate">${ssrInterpolate(s.sales_nama)}</div></div><i class="fa-solid fa-location-slash text-xs text-gray-700"></i></div>`);
        });
        _push(`<!--]--></div><div class="card"><div class="text-xs font-semibold uppercase tracking-wider text-primary-400 mb-3"><i class="fa-solid fa-route mr-1"></i>Trail Hari Ini </div><div class="space-y-1.5"><!--[-->`);
        ssrRenderList(unref(liveTrails) || [], (s) => {
          var _a2;
          _push(`<div class="flex items-center justify-between text-sm cursor-pointer hover:bg-apex-card/50 rounded px-1 py-1 -mx-1 transition"><div class="flex items-center gap-2"><span class="w-3 h-3 rounded-full inline-block border border-white/20" style="${ssrRenderStyle({ background: unref(salesColorMap)[s.user_id] || "#6366f1" })}"></span><span class="text-gray-300">${ssrInterpolate(s.sales_nama)}</span></div><span class="text-gray-500 text-xs">${ssrInterpolate(((_a2 = s.points) == null ? void 0 : _a2.length) || 0)} titik</span></div>`);
        });
        _push(`<!--]-->`);
        if (!((_i = unref(liveTrails)) == null ? void 0 : _i.length)) {
          _push(`<div class="text-sm text-gray-500 text-center py-2"> Belum ada data trail hari ini </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      if (unref(activeTab) === "activity") {
        _push(`<!--[--><div class="card mb-4"><div class="flex flex-wrap gap-3 items-end"><div><label class="form-label">Dari Tanggal</label><input${ssrRenderAttr("value", unref(f).date_from)} type="date" class="form-input w-36"></div><div><label class="form-label">Sampai Tanggal</label><input${ssrRenderAttr("value", unref(f).date_to)} type="date" class="form-input w-36"></div><div><label class="form-label">Sales</label><select class="form-select w-44"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(f).user_id) ? ssrLooseContain(unref(f).user_id, "") : ssrLooseEqual(unref(f).user_id, "")) ? " selected" : ""}>Semua Sales</option><!--[-->`);
        ssrRenderList(((_j = unref(data)) == null ? void 0 : _j.sales_list) || [], (s) => {
          _push(`<option${ssrRenderAttr("value", s.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(f).user_id) ? ssrLooseContain(unref(f).user_id, s.id) : ssrLooseEqual(unref(f).user_id, s.id)) ? " selected" : ""}>${ssrInterpolate(s.nama)}</option>`);
        });
        _push(`<!--]--></select></div><div class="flex gap-2 pb-0.5"><!--[-->`);
        ssrRenderList(presets, (p) => {
          _push(`<button class="btn-secondary btn-sm text-xs">${ssrInterpolate(p.label)}</button>`);
        });
        _push(`<!--]--></div><button class="btn-secondary btn-sm ml-auto"><i class="fa-solid fa-file-csv"></i>Export CSV </button></div></div>`);
        if (unref(pending)) {
          _push(`<div class="flex justify-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
        } else if (unref(data)) {
          _push(`<!--[--><div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4"><div class="stat-card"><div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-map-pin"></i></div><div><div class="stat-value">${ssrInterpolate(unref(data).summary.total_kunjungan)}</div><div class="stat-label">Total Kunjungan</div></div></div><div class="stat-card"><div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-users"></i></div><div><div class="stat-value">${ssrInterpolate(unref(data).summary.total_sales)}</div><div class="stat-label">Sales Aktif</div></div></div><div class="stat-card"><div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-calendar-check"></i></div><div><div class="stat-value">${ssrInterpolate(unref(data).summary.total_hari)}</div><div class="stat-label">Hari Kerja</div></div></div><div class="stat-card"><div class="stat-icon bg-yellow-900/40 text-yellow-400"><i class="fa-solid fa-clock"></i></div><div><div class="stat-value">${ssrInterpolate(fmtDuration(unref(data).summary.avg_durasi))}</div><div class="stat-label">Rata-rata Durasi</div></div></div><div class="stat-card"><div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-hourglass-half"></i></div><div><div class="stat-value">${ssrInterpolate(fmtDuration(unref(data).summary.total_durasi))}</div><div class="stat-label">Total Durasi</div></div></div><div class="stat-card"><div class="stat-icon bg-orange-900/40 text-orange-400"><i class="fa-solid fa-circle-dot"></i></div><div><div class="stat-value">${ssrInterpolate(unref(data).summary.on_going)}</div><div class="stat-label">Sedang Aktif</div><div class="text-xs text-gray-600 mt-0.5">${ssrInterpolate(unref(data).summary.completed)} selesai</div></div></div></div><div class="grid grid-cols-1 xl:grid-cols-3 gap-4 mb-4"><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-trophy mr-1.5 text-yellow-400"></i>Top Sales</div>`);
          if (!(unref(data).top_sales || []).length) {
            _push(`<div class="text-center text-gray-600 text-sm py-6">Tidak ada data</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--[-->`);
          ssrRenderList(unref(data).top_sales || [], (s, i) => {
            _push(`<div class="flex items-center gap-3 mb-3 last:mb-0"><div class="${ssrRenderClass([i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-400 text-black" : i === 2 ? "bg-orange-700 text-white" : "bg-apex-card text-apex-faint", "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"])}">${ssrInterpolate(i + 1)}</div><div class="flex-1 min-w-0"><div class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(s.sales_nama)}</div><div class="text-xs text-gray-500">${ssrInterpolate(fmtDuration(s.avg_durasi))} rata-rata</div></div><div class="text-right flex-shrink-0"><div class="text-sm font-semibold text-primary-400">${ssrInterpolate(s.total_kunjungan)}\xD7</div><div class="text-xs text-gray-600">${ssrInterpolate(fmtDuration(s.total_durasi))}</div></div></div>`);
          });
          _push(`<!--]--></div><div class="card xl:col-span-2"><div class="section-title mb-3"><i class="fa-solid fa-chart-bar mr-1.5 text-primary-400"></i>Kunjungan per Hari</div>`);
          if (!unref(chartDays).length) {
            _push(`<div class="text-center text-gray-600 text-sm py-6">Tidak ada data</div>`);
          } else {
            _push(`<div class="overflow-x-auto"><div class="flex items-end gap-1.5 min-h-28" style="${ssrRenderStyle({ "min-width": "max-content" })}"><!--[-->`);
            ssrRenderList(unref(chartDays), (d) => {
              _push(`<div class="flex flex-col items-center gap-1 flex-shrink-0" style="${ssrRenderStyle({ "width": "36px" })}"><div class="text-xs text-primary-400 font-medium">${ssrInterpolate(d.total)}</div><div class="w-full rounded-t transition-all duration-500 bg-primary-700/70 hover:bg-primary-600" style="${ssrRenderStyle(`height:${chartBarH(d.total)}px`)}"${ssrRenderAttr("title", `${d.tgl}: ${d.total} kunjungan`)}></div><div class="text-xs text-gray-600 text-center leading-tight" style="${ssrRenderStyle({ "font-size": "10px" })}">${ssrInterpolate(fmtTglShort(d.tgl))}</div></div>`);
            });
            _push(`<!--]--></div></div>`);
          }
          _push(`</div></div><div class="card mb-4"><div class="section-title mb-3"><i class="fa-solid fa-timeline mr-1.5 text-blue-400"></i>Timeline Kunjungan <span class="text-xs text-gray-500 font-normal ml-2">\u2014 per sales per hari</span></div>`);
          if (unref(timelineDates).length > 1) {
            _push(`<div class="flex gap-1.5 mb-3 flex-wrap"><!--[-->`);
            ssrRenderList(unref(timelineDates), (d) => {
              _push(`<button class="${ssrRenderClass([unref(selectedTimelineDate) === d ? "bg-primary-700 text-white" : "bg-apex-card text-gray-400 hover:bg-apex-card", "btn-xs rounded-lg px-3 py-1.5 text-xs transition-colors"])}">${ssrInterpolate(fmtTgl(d))}</button>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          if (!unref(filteredTimeline).length) {
            _push(`<div class="text-center text-gray-600 text-sm py-6">Tidak ada data kunjungan</div>`);
          } else {
            _push(`<div><div class="flex mb-1"><div class="w-28 flex-shrink-0"></div><div class="flex-1 relative h-4"><!--[-->`);
            ssrRenderList(unref(timelineHours), (h) => {
              _push(`<div class="absolute text-gray-500 -translate-x-1/2" style="${ssrRenderStyle(`left:${(h - 7) / 13 * 100}%;font-size:10px`)}">${ssrInterpolate(h.toString().padStart(2, "0"))}:00 </div>`);
            });
            _push(`<!--]--></div></div><!--[-->`);
            ssrRenderList(unref(timelineGroups), (sg) => {
              _push(`<div class="flex items-center mb-1.5"><div class="w-28 text-xs text-gray-400 truncate pr-2 flex-shrink-0 text-right">${ssrInterpolate(sg.nama)}</div><div class="flex-1 relative h-7 bg-apex-card/50 rounded overflow-visible"${ssrRenderAttr("id", `tl-${sg.nama}`)}><!--[-->`);
              ssrRenderList(unref(timelineHours), (h) => {
                _push(`<div class="absolute top-0 bottom-0 border-l border-apex-border/40" style="${ssrRenderStyle(`left:${(h - 7) / 13 * 100}%`)}"></div>`);
              });
              _push(`<!--]--><!--[-->`);
              ssrRenderList(sg.visits, (v) => {
                _push(`<div style="${ssrRenderStyle(timelineBarStyle(v))}" class="${ssrRenderClass([v.checked_out_at ? "bg-primary-600/80" : "bg-orange-500/80", "absolute top-0.5 bottom-0.5 rounded cursor-pointer transition-opacity hover:opacity-90 group"])}"${ssrRenderAttr("title", `${v.client_nama || v.lead_id || "\u2014"} | ${fmtTime(v.checked_in_at)} \u2013 ${v.checked_out_at ? fmtTime(v.checked_out_at) : "aktif"} | ${v.duration_minutes ? fmtDuration(v.duration_minutes) : "berlangsung"}`)}><div class="hidden group-hover:flex absolute bottom-full left-0 mb-1 z-50 bg-apex-card border border-apex-border rounded-lg px-3 py-2 text-xs shadow-xl whitespace-nowrap flex-col gap-0.5"><span class="font-medium text-white">${ssrInterpolate(v.client_nama || v.lead_id || "\u2014")}</span><span class="text-gray-300">${ssrInterpolate(fmtTime(v.checked_in_at))} \u2013 ${ssrInterpolate(v.checked_out_at ? fmtTime(v.checked_out_at) : "aktif")}</span>`);
                if (v.duration_minutes) {
                  _push(`<span class="text-gray-400">${ssrInterpolate(fmtDuration(v.duration_minutes))}</span>`);
                } else {
                  _push(`<!---->`);
                }
                _push(`</div></div>`);
              });
              _push(`<!--]--></div></div>`);
            });
            _push(`<!--]--><div class="flex items-center gap-4 mt-3 text-xs text-gray-500"><span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-primary-600/80"></span>Selesai (checkout)</span><span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded bg-orange-500/80"></span>Sedang berlangsung</span></div></div>`);
          }
          _push(`</div><div class="card mb-4"><div class="section-title mb-3"><i class="fa-solid fa-table mr-1.5 text-emerald-400"></i>Rekap per Sales</div>`);
          if (!(unref(data).sales_recap || []).length) {
            _push(`<div class="text-center text-gray-600 text-sm py-6">Tidak ada data</div>`);
          } else {
            _push(`<div class="overflow-x-auto"><table class="tbl"><thead><tr><th>Sales</th><th class="text-right">Total Kunjungan</th><th class="text-right">Hari Aktif</th><th class="text-right">Kunjungan/Hari</th><th class="text-right">Total Durasi</th><th class="text-right">Rata-rata Durasi</th><th class="text-center">Belum Checkout</th></tr></thead><tbody><!--[-->`);
            ssrRenderList(unref(data).sales_recap || [], (s) => {
              _push(`<tr><td class="font-medium text-gray-200">${ssrInterpolate(s.sales_nama)}</td><td class="text-right text-primary-400 font-semibold">${ssrInterpolate(s.total_kunjungan)}</td><td class="text-right text-gray-300">${ssrInterpolate(s.hari_aktif)}</td><td class="text-right text-gray-300">${ssrInterpolate(s.hari_aktif > 0 ? (s.total_kunjungan / s.hari_aktif).toFixed(1) : "0")}</td><td class="text-right text-gray-300">${ssrInterpolate(fmtDuration(s.total_durasi))}</td><td class="text-right text-gray-300">${ssrInterpolate(fmtDuration(s.avg_durasi))}</td><td class="text-center">`);
              if (s.belum_checkout > 0) {
                _push(`<span class="badge-yellow">${ssrInterpolate(s.belum_checkout)}</span>`);
              } else {
                _push(`<span class="text-gray-600 text-xs">\u2014</span>`);
              }
              _push(`</td></tr>`);
            });
            _push(`<!--]--></tbody><tfoot><tr class="font-semibold bg-apex-card/50"><td class="text-gray-400">Total</td><td class="text-right text-primary-400">${ssrInterpolate(unref(data).summary.total_kunjungan)}</td><td class="text-right text-gray-400">${ssrInterpolate(unref(data).summary.total_hari)}</td><td class="text-right text-gray-400">\u2014</td><td class="text-right text-gray-400">${ssrInterpolate(fmtDuration(unref(data).summary.total_durasi))}</td><td class="text-right text-gray-400">${ssrInterpolate(fmtDuration(unref(data).summary.avg_durasi))}</td><td class="text-center text-gray-400">${ssrInterpolate(unref(data).summary.on_going)}</td></tr></tfoot></table></div>`);
          }
          _push(`</div><div class="card"><div class="flex items-center justify-between mb-3"><div class="section-title"><i class="fa-solid fa-list mr-1.5 text-gray-400"></i>Detail Aktivitas</div><span class="text-xs text-gray-500">${ssrInterpolate(unref(data).total || 0)} entri \xB7 halaman ${ssrInterpolate(unref(data).page || 1)}/${ssrInterpolate(unref(data).total_pages || 1)}</span></div>`);
          if (!(unref(data).activities || []).length) {
            _push(`<div class="text-center text-gray-600 text-sm py-6">Tidak ada data</div>`);
          } else {
            _push(`<div class="overflow-x-auto"><table class="tbl"><thead><tr><th>Tgl</th><th>Sales</th><th>Client</th><th>Alamat Check-in</th><th>Check-in</th><th>Check-out</th><th class="text-right leading-snug">Jarak<br>Check-In &amp; Out</th><th class="text-right">Durasi</th><th>Catatan</th><th class="text-center">Foto</th><th class="text-center">Status</th></tr></thead><tbody><!--[-->`);
            ssrRenderList(unref(data).activities || [], (a) => {
              _push(`<tr><td class="text-xs text-gray-400 whitespace-nowrap">${ssrInterpolate(unref(fmt).tgl(a.tgl))}</td><td class="text-xs font-medium text-gray-200 whitespace-nowrap">${ssrInterpolate(a.sales_nama)}</td><td class="text-xs text-gray-300 whitespace-nowrap">${ssrInterpolate(a.client_nama || a.lead_id || "\u2014")}</td><td class="text-xs max-w-40 truncate">`);
              if (a.latitude && a.longitude) {
                _push(`<button class="text-primary-400 hover:text-primary-300 hover:underline flex items-center gap-1 text-left"${ssrRenderAttr("title", a.address)}><i class="fa-solid fa-location-dot text-[10px]"></i>${ssrInterpolate(a.address || `${a.latitude}, ${a.longitude}`)}</button>`);
              } else if (a.address) {
                _push(`<span class="text-gray-400 flex items-center gap-1"><i class="fa-solid fa-location-dot text-[10px]"></i>${ssrInterpolate(a.address)}</span>`);
              } else {
                _push(`<span class="text-gray-600">\u2014</span>`);
              }
              _push(`</td><td class="text-xs text-gray-300 whitespace-nowrap">${ssrInterpolate(fmtTime(a.checked_in_at))}</td><td class="text-xs text-gray-300 whitespace-nowrap">${ssrInterpolate(a.checked_out_at ? fmtTime(a.checked_out_at) : "\u2014")}</td><td class="text-right text-xs whitespace-nowrap">`);
              if (a.distance_km !== null && a.distance_km !== void 0) {
                _push(`<div class="flex items-center justify-end gap-1.5"><span class="${ssrRenderClass(a.distance_km > 1 ? "text-amber-400" : "text-emerald-400")}">${ssrInterpolate(a.distance_km < 1 ? `${Math.round(a.distance_km * 1e3)} m` : `${a.distance_km} km`)}</span><button title="Lihat rute check-in \u2192 check-out" class="text-primary-400 hover:text-primary-300 transition flex-shrink-0"><i class="fa-solid fa-route text-[11px]"></i></button></div>`);
              } else if (a.latitude && a.longitude) {
                _push(`<div class="flex items-center justify-end gap-1.5"><span class="text-gray-600">\u2014</span><button title="Lihat titik check-in" class="text-primary-400/60 hover:text-primary-300 transition flex-shrink-0"><i class="fa-solid fa-location-dot text-[11px]"></i></button></div>`);
              } else {
                _push(`<span class="text-gray-600">\u2014</span>`);
              }
              _push(`</td><td class="text-right text-xs text-gray-300 whitespace-nowrap">${ssrInterpolate(a.duration_minutes ? fmtDuration(a.duration_minutes) : "\u2014")}</td><td class="text-xs text-gray-500 max-w-32 truncate"${ssrRenderAttr("title", a.notes)}>${ssrInterpolate(a.notes || "\u2014")}</td><td class="text-center">`);
              if (a.photo_url) {
                _push(`<button title="Lihat foto check-in" class="focus:outline-none"><img${ssrRenderAttr("src", photoUrl(a.photo_url))} class="w-10 h-10 object-cover rounded border border-apex-border hover:border-primary-400 transition mx-auto cursor-zoom-in"></button>`);
              } else {
                _push(`<span class="text-gray-700">\u2014</span>`);
              }
              _push(`</td><td class="text-center">`);
              if (!a.checked_out_at) {
                _push(`<span class="badge-yellow">Aktif</span>`);
              } else {
                _push(`<span class="badge-green">Selesai</span>`);
              }
              _push(`</td></tr>`);
            });
            _push(`<!--]--></tbody></table>`);
            _push(ssrRenderComponent(_component_AppPagination, {
              page: unref(monitorPage),
              "onUpdate:page": ($event) => isRef(monitorPage) ? monitorPage.value = $event : null,
              "per-page": unref(monitorPerPage),
              "onUpdate:perPage": ($event) => isRef(monitorPerPage) ? monitorPerPage.value = $event : null,
              total: (_k = unref(data).total) != null ? _k : 0,
              "total-pages": (_l = unref(data).total_pages) != null ? _l : 1,
              "per-page-options": [10, 25, 50, 100]
            }, null, _parent));
            _push(`</div>`);
          }
          _push(`</div><div class="card mt-4"><div class="section-title mb-3"><i class="fa-solid fa-map mr-1.5 text-primary-400"></i>Sebaran Kunjungan <span class="text-xs text-gray-500 font-normal ml-2">\u2014 ${ssrInterpolate((unref(data).map_points || []).length)} titik</span></div>`);
          _push(ssrRenderComponent(_component_ClientOnly, null, {
            fallback: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="rounded-xl bg-apex-card flex items-center justify-center" style="${ssrRenderStyle({ "height": "380px" })}"${_scopeId}><i class="fa-solid fa-circle-notch fa-spin text-2xl text-primary-400"${_scopeId}></i></div>`);
              } else {
                return [
                  createVNode("div", {
                    class: "rounded-xl bg-apex-card flex items-center justify-center",
                    style: { "height": "380px" }
                  }, [
                    createVNode("i", { class: "fa-solid fa-circle-notch fa-spin text-2xl text-primary-400" })
                  ])
                ];
              }
            })
          }, _parent));
          _push(`</div><!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(mapPopup).show) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"><div class="relative bg-apex-surface border border-apex-border rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden"><div class="flex items-center justify-between px-4 py-3 border-b border-apex-border"><div class="flex items-center gap-2 text-sm font-medium text-apex-text"><i class="${ssrRenderClass(unref(mapPopup).type === "route" ? "fa-solid fa-route text-amber-400" : "fa-solid fa-location-dot text-primary-400")}"></i> ${ssrInterpolate(unref(mapPopup).type === "route" ? `Rute Check-In \u2192 Check-Out (${unref(mapPopup).distance !== void 0 ? unref(mapPopup).distance < 1 ? Math.round(unref(mapPopup).distance * 1e3) + " m" : unref(mapPopup).distance + " km" : ""})` : "Lokasi Check-In")}</div><button class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-apex-card text-apex-muted hover:text-apex-text transition"><i class="fa-solid fa-xmark text-sm"></i></button></div><div style="${ssrRenderStyle({ "height": "520px" })}" class="w-full"></div><div class="px-4 py-2.5 border-t border-apex-border flex items-center justify-between"><span class="text-xs text-apex-faint truncate max-w-xs">${ssrInterpolate(unref(mapPopup).label || "")}</span><a${ssrRenderAttr("href", unref(mapPopup).type === "route" ? `https://www.google.com/maps/dir/${unref(mapPopup).lat},${unref(mapPopup).lng}/${unref(mapPopup).lat2},${unref(mapPopup).lng2}` : `https://www.google.com/maps?q=${unref(mapPopup).lat},${unref(mapPopup).lng}`)} target="_blank" rel="noopener" class="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition flex-shrink-0"><i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>Buka Google Maps </a></div></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(lightboxUrl)) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"><div class="relative max-w-3xl max-h-[90vh] mx-4"><img${ssrRenderAttr("src", unref(lightboxUrl))} class="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"><button class="absolute -top-3 -right-3 w-8 h-8 bg-apex-card hover:bg-apex-card/80 text-apex-text rounded-full flex items-center justify-center shadow-lg transition"><i class="fa-solid fa-xmark text-sm"></i></button></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/field-monitor.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=field-monitor-B3cqK9Lv.mjs.map
