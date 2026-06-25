import { defineComponent, computed, ref, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderStyle } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useFormat } from './useFormat-D7DNHH-1.mjs';
import { u as useAuthStore } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "heatmap",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const fmt = useFormat();
    const auth = useAuthStore();
    const isAdminOrManager = computed(() => {
      var _a, _b;
      return ((_b = (_a = auth.user) == null ? void 0 : _a.role_id) != null ? _b : 3) < 3;
    });
    const curYear = (/* @__PURE__ */ new Date()).getFullYear();
    const years = Array.from({ length: 4 }, (_, i) => curYear - i);
    const filterTahun = ref(curYear);
    const filterSales = ref("");
    const salesList = ref([]);
    const loading = ref(false);
    const data = ref(null);
    const cellMap = computed(() => {
      const m = {};
      if (!data.value) return m;
      for (const c of data.value.cells) m[`${c.dow}_${c.hour}`] = c.count;
      return m;
    });
    function cellCount(dow, hour) {
      var _a;
      return (_a = cellMap.value[`${dow}_${hour}`]) != null ? _a : 0;
    }
    const totalActivity = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = data.value) == null ? void 0 : _a.by_hour) == null ? void 0 : _b.reduce((a, b) => a + b, 0)) != null ? _c : 0;
    });
    const maxHour = computed(() => {
      var _a, _b;
      return Math.max(...(_b = (_a = data.value) == null ? void 0 : _a.by_hour) != null ? _b : [0]);
    });
    const maxDow = computed(() => {
      var _a, _b;
      return Math.max(...(_b = (_a = data.value) == null ? void 0 : _a.by_dow) != null ? _b : [0]);
    });
    const peakHourLabel = computed(() => {
      if (!data.value) return "\u2014";
      const h = data.value.by_hour.indexOf(maxHour.value);
      return `${String(h).padStart(2, "0")}:00`;
    });
    const peakDowLabel = computed(() => {
      var _a;
      if (!data.value) return "\u2014";
      const d = data.value.by_dow.indexOf(maxDow.value);
      return (_a = data.value.dow_labels[d]) != null ? _a : "\u2014";
    });
    const legendSteps = [0.1, 0.25, 0.5, 0.75, 1];
    function heatColor(val, max) {
      if (!max || !val) return "#1e2d42";
      const ratio = Math.min(val / max, 1);
      if (ratio < 0.01) return "#1e2d42";
      const stops = [
        [0, [30, 45, 66]],
        [0.25, [29, 78, 216]],
        [0.5, [234, 88, 12]],
        [0.75, [234, 179, 8]],
        [1, [239, 68, 68]]
      ];
      let lo = stops[0], hi = stops[stops.length - 1];
      for (let i = 0; i < stops.length - 1; i++) {
        if (ratio >= stops[i][0] && ratio <= stops[i + 1][0]) {
          lo = stops[i];
          hi = stops[i + 1];
          break;
        }
      }
      const t = lo[0] === hi[0] ? 1 : (ratio - lo[0]) / (hi[0] - lo[0]);
      const r = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * t);
      const g = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * t);
      const b = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * t);
      return `rgb(${r},${g},${b})`;
    }
    function cellStyle(dow, hour) {
      var _a, _b;
      const cnt = cellCount(dow, hour);
      const max = (_b = (_a = data.value) == null ? void 0 : _a.max_count) != null ? _b : 1;
      return `background:${heatColor(cnt, max)}`;
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-fire text-orange-400 mr-2"></i>Activity Heatmap</h1><p class="page-subtitle">Pola aktivitas sales berdasarkan jam &amp; hari dalam seminggu</p></div><div class="flex gap-3 flex-wrap">`);
      if (unref(isAdminOrManager)) {
        _push(`<select class="form-select text-sm w-40"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterSales)) ? ssrLooseContain(unref(filterSales), "") : ssrLooseEqual(unref(filterSales), "")) ? " selected" : ""}>Semua Sales</option><!--[-->`);
        ssrRenderList(unref(salesList), (s) => {
          _push(`<option${ssrRenderAttr("value", s)}${ssrIncludeBooleanAttr(Array.isArray(unref(filterSales)) ? ssrLooseContain(unref(filterSales), s) : ssrLooseEqual(unref(filterSales), s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
        });
        _push(`<!--]--></select>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<select class="form-select text-sm w-28"><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(filterTahun)) ? ssrLooseContain(unref(filterTahun), y) : ssrLooseEqual(unref(filterTahun), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select></div></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center py-24 text-apex-muted"><i class="fa-solid fa-circle-notch fa-spin text-2xl mr-2"></i>Memuat data... </div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"><div class="card text-center py-4"><div class="text-2xl font-bold text-primary-300">${ssrInterpolate(unref(fmt).num(unref(totalActivity)))}</div><div class="text-xs text-gray-500 mt-1">Total Aktivitas</div></div><div class="card text-center py-4"><div class="text-2xl font-bold text-emerald-300">${ssrInterpolate(unref(peakHourLabel))}</div><div class="text-xs text-gray-500 mt-1">Jam Paling Aktif</div></div><div class="card text-center py-4"><div class="text-2xl font-bold text-yellow-300">${ssrInterpolate(unref(peakDowLabel))}</div><div class="text-xs text-gray-500 mt-1">Hari Paling Aktif</div></div><div class="card text-center py-4"><div class="text-2xl font-bold text-orange-300">${ssrInterpolate(unref(fmt).num(unref(data).max_count))}</div><div class="text-xs text-gray-500 mt-1">Peak / Slot</div></div></div><div class="card mb-6 overflow-x-auto"><div class="section-title mb-4"><i class="fa-solid fa-th mr-1 text-orange-400"></i>Heatmap Jam \xD7 Hari</div><div class="min-w-[700px]"><div class="flex mb-1 ml-10"><!--[-->`);
        ssrRenderList(24, (h) => {
          _push(`<div class="text-center text-[9px] text-gray-600 flex-1">${ssrInterpolate((h - 1) % 3 === 0 ? `${String(h - 1).padStart(2, "0")}` : "")}</div>`);
        });
        _push(`<!--]--></div><!--[-->`);
        ssrRenderList(unref(data).dow_labels, (dow, di) => {
          _push(`<div class="flex items-center mb-1"><div class="w-10 text-xs text-gray-500 text-right pr-2 flex-shrink-0">${ssrInterpolate(dow)}</div><!--[-->`);
          ssrRenderList(24, (h) => {
            _push(`<div class="flex-1 h-7 rounded-sm mx-px transition-all cursor-default relative group" style="${ssrRenderStyle(cellStyle(di, h - 1))}"><div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-10 bg-navy-900 border border-navy-700 rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap shadow-xl pointer-events-none"><span class="font-semibold text-gray-200">${ssrInterpolate(dow)}</span><span class="text-gray-400 mx-1">\xB7</span><span class="text-gray-300">${ssrInterpolate(String(h - 1).padStart(2, "0"))}:00</span><span class="ml-2 text-orange-300 font-bold">${ssrInterpolate(cellCount(di, h - 1))} aktivitas</span></div></div>`);
          });
          _push(`<!--]--></div>`);
        });
        _push(`<!--]--><div class="flex items-center gap-2 mt-3 justify-end"><span class="text-xs text-gray-600">Rendah</span><!--[-->`);
        ssrRenderList(legendSteps, (l) => {
          _push(`<div class="w-5 h-4 rounded-sm" style="${ssrRenderStyle(`background:${heatColor(l, 1)}`)}"></div>`);
        });
        _push(`<!--]--><span class="text-xs text-gray-600">Tinggi</span></div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"><div class="card"><div class="section-title mb-4"><i class="fa-solid fa-clock mr-1 text-blue-400"></i>Distribusi per Jam</div><div class="space-y-1"><!--[-->`);
        ssrRenderList(unref(data).by_hour, (cnt, h) => {
          _push(`<div class="flex items-center gap-2"><div class="w-10 text-xs text-gray-500 text-right flex-shrink-0">${ssrInterpolate(String(h).padStart(2, "0"))}:00</div><div class="flex-1 h-5 bg-navy-800 rounded overflow-hidden"><div class="h-full rounded transition-all duration-500" style="${ssrRenderStyle(`width:${unref(maxHour) ? cnt / unref(maxHour) * 100 : 0}%;background:${heatColor(cnt, unref(maxHour))}`)}"></div></div><div class="w-8 text-xs text-gray-400 text-right flex-shrink-0">${ssrInterpolate(cnt || "")}</div></div>`);
        });
        _push(`<!--]--></div></div><div class="card"><div class="section-title mb-4"><i class="fa-solid fa-calendar-week mr-1 text-purple-400"></i>Distribusi per Hari</div><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(data).by_dow, (cnt, di) => {
          _push(`<div class="flex items-center gap-3"><div class="w-10 text-xs text-gray-500 text-right flex-shrink-0">${ssrInterpolate(unref(data).dow_labels[di])}</div><div class="flex-1 h-7 bg-navy-800 rounded overflow-hidden"><div class="h-full rounded transition-all duration-500" style="${ssrRenderStyle(`width:${unref(maxDow) ? cnt / unref(maxDow) * 100 : 0}%;background:${heatColor(cnt, unref(maxDow))}`)}"></div></div><div class="w-10 text-xs text-gray-400 text-right flex-shrink-0">${ssrInterpolate(unref(fmt).num(cnt))}</div></div>`);
        });
        _push(`<!--]--></div></div></div><div class="p-3 rounded-lg border border-navy-700 bg-navy-800/30 text-xs text-gray-500"><i class="fa-solid fa-circle-info mr-1.5 text-gray-600"></i> Data menggabungkan: <span class="text-gray-400">Follow-Up Log</span>, <span class="text-gray-400">Field Activity (check-in)</span>, dan <span class="text-gray-400">Laporan Harian (waktu kirim)</span> \u2014 tahun ${ssrInterpolate(unref(data).tahun)}. </div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/heatmap.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=heatmap-DALmR4ee.mjs.map
