import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { defineComponent, computed, ref, unref, withCtx, createVNode, createTextVNode, openBlock, createBlock, toDisplayString, createCommentVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrRenderComponent, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useFormat } from './useFormat-D7DNHH-1.mjs';
import { u as useAuthStore } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const fmt = useFormat();
    const auth = useAuthStore();
    const canApprove = computed(() => {
      var _a, _b;
      return [1, 2].includes((_b = (_a = auth.user) == null ? void 0 : _a.role_id) != null ? _b : 0);
    });
    const loading = ref(true);
    const filterTahun = ref((/* @__PURE__ */ new Date()).getFullYear());
    const filterBulan = ref(0);
    const filterSales = ref("");
    const years = Array.from({ length: 4 }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() - i);
    const salesList = ref([]);
    const summaryAll = ref({});
    const pendingClaims = ref([]);
    const approvedClaims = ref([]);
    const roiData = ref(null);
    const rekapSales = ref([]);
    const pendingCount = computed(() => {
      var _a, _b;
      return (_b = (_a = summaryAll.value.pending_total) != null ? _a : summaryAll.value.pending) != null ? _b : 0;
    });
    const myLimit = computed(() => summaryAll.value.limit_per_bulan || 0);
    const myPct = computed(() => myLimit.value ? (summaryAll.value.total_amount || 0) / myLimit.value * 100 : 0);
    const leaderboard = computed(
      () => [...rekapSales.value].sort((a, b) => (b.total_approved || 0) - (a.total_approved || 0))
    );
    function pct(r) {
      if (!r.entertain_limit) return 0;
      const used = r.total_approved || 0;
      const cap = filterBulan.value ? r.entertain_limit : r.entertain_limit * 12;
      return used / cap * 100;
    }
    const roiRows = computed(() => {
      var _a, _b;
      return (_b = (_a = roiData.value) == null ? void 0 : _a.rows) != null ? _b : [];
    });
    const roiRanked = computed(() => [...roiRows.value].sort((a, b) => {
      var _a, _b;
      return ((_a = b.roi_pipeline) != null ? _a : 0) - ((_b = a.roi_pipeline) != null ? _b : 0);
    }));
    const myRoi = computed(() => {
      var _a;
      return !canApprove.value ? (_a = roiRows.value[0]) != null ? _a : null : null;
    });
    const totalBudget = computed(() => roiRows.value.reduce((s, r) => s + (r.budget_tahunan || 0), 0));
    const totalEntertain = computed(() => roiRows.value.reduce((s, r) => s + (r.entertain_approved || 0), 0));
    const totalWon = computed(() => roiRows.value.reduce((s, r) => s + (r.won_value || 0), 0));
    computed(() => roiRows.value.reduce((s, r) => s + (r.revenue_actual || 0), 0));
    const totalUsagePct = computed(() => totalBudget.value > 0 ? totalEntertain.value / totalBudget.value * 100 : 0);
    const totalRoi = computed(() => totalEntertain.value > 0 ? totalWon.value / totalEntertain.value : 0);
    const maxTren = computed(() => {
      var _a, _b;
      return Math.max(0, ...(_b = (_a = roiData.value) == null ? void 0 : _a.tren_monthly) != null ? _b : [0]);
    });
    const maxEntertain = computed(() => Math.max(0, ...roiRows.value.map((r) => r.entertain_approved || 0)));
    const maxWon = computed(() => Math.max(0, ...roiRows.value.map((r) => r.won_value || 0)));
    function roiColor(r) {
      var _a;
      const roi = (_a = r == null ? void 0 : r.roi_pipeline) != null ? _a : 0;
      if (roi >= 10) return {
        border: "border-l-emerald-500",
        avatar: "bg-emerald-900/50 text-emerald-300",
        text: "text-emerald-400",
        badge: "bg-emerald-900/40 text-emerald-300",
        label: "Sangat Efisien"
      };
      if (roi >= 3) return {
        border: "border-l-yellow-500",
        avatar: "bg-yellow-900/50 text-yellow-300",
        text: "text-yellow-400",
        badge: "bg-yellow-900/40 text-yellow-300",
        label: "Cukup Baik"
      };
      return {
        border: "border-l-red-500",
        avatar: "bg-red-900/50 text-red-300",
        text: "text-red-400",
        badge: "bg-red-900/40 text-red-300",
        label: "Perlu Evaluasi"
      };
    }
    function monthName(m) {
      return new Date(2e3, m - 1, 1).toLocaleString("id-ID", { month: "long" });
    }
    function initials(name) {
      return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-ad177d93><div class="page-header" data-v-ad177d93><div data-v-ad177d93><h1 class="page-title" data-v-ad177d93><i class="fa-solid fa-utensils text-yellow-400 mr-2" data-v-ad177d93></i>Dashboard Entertain</h1><p class="page-subtitle" data-v-ad177d93>ROI &amp; produktivitas biaya entertain per sales \u2014 ${ssrInterpolate(unref(filterTahun))}</p></div><div class="flex items-center gap-3 flex-wrap" data-v-ad177d93>`);
      if (unref(canApprove)) {
        _push(`<select class="form-select text-sm w-40" data-v-ad177d93><option value="" data-v-ad177d93${ssrIncludeBooleanAttr(Array.isArray(unref(filterSales)) ? ssrLooseContain(unref(filterSales), "") : ssrLooseEqual(unref(filterSales), "")) ? " selected" : ""}>Semua Sales</option><!--[-->`);
        ssrRenderList(unref(salesList), (s) => {
          _push(`<option${ssrRenderAttr("value", s)} data-v-ad177d93${ssrIncludeBooleanAttr(Array.isArray(unref(filterSales)) ? ssrLooseContain(unref(filterSales), s) : ssrLooseEqual(unref(filterSales), s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
        });
        _push(`<!--]--></select>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<select class="form-select text-sm w-28" data-v-ad177d93><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)} data-v-ad177d93${ssrIncludeBooleanAttr(Array.isArray(unref(filterTahun)) ? ssrLooseContain(unref(filterTahun), y) : ssrLooseEqual(unref(filterTahun), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select text-sm w-36" data-v-ad177d93><option${ssrRenderAttr("value", 0)} data-v-ad177d93${ssrIncludeBooleanAttr(Array.isArray(unref(filterBulan)) ? ssrLooseContain(unref(filterBulan), 0) : ssrLooseEqual(unref(filterBulan), 0)) ? " selected" : ""}>Semua Bulan</option><!--[-->`);
      ssrRenderList(12, (m) => {
        _push(`<option${ssrRenderAttr("value", m)} data-v-ad177d93${ssrIncludeBooleanAttr(Array.isArray(unref(filterBulan)) ? ssrLooseContain(unref(filterBulan), m) : ssrLooseEqual(unref(filterBulan), m)) ? " selected" : ""}>${ssrInterpolate(monthName(m))}</option>`);
      });
      _push(`<!--]--></select>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/entertain/claims",
        class: "btn-primary btn-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<i class="fa-solid fa-receipt" data-v-ad177d93${_scopeId}></i> Klaim Saya `);
          } else {
            return [
              createVNode("i", { class: "fa-solid fa-receipt" }),
              createTextVNode(" Klaim Saya ")
            ];
          }
        }),
        _: 1
      }, _parent));
      if (unref(canApprove)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/entertain/approval",
          class: "btn-secondary btn-sm"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<i class="fa-solid fa-circle-check" data-v-ad177d93${_scopeId}></i> Approval `);
              if (unref(pendingCount) > 0) {
                _push2(`<span class="ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-px" data-v-ad177d93${_scopeId}>${ssrInterpolate(unref(pendingCount))}</span>`);
              } else {
                _push2(`<!---->`);
              }
            } else {
              return [
                createVNode("i", { class: "fa-solid fa-circle-check" }),
                createTextVNode(" Approval "),
                unref(pendingCount) > 0 ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "ml-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1.5 py-px"
                }, toDisplayString(unref(pendingCount)), 1)) : createCommentVNode("", true)
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5" data-v-ad177d93><div class="card text-center py-3" data-v-ad177d93><div class="text-xs text-gray-500 mb-1" data-v-ad177d93>Total Entertain</div><div class="text-xl font-bold text-apex-text" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(totalEntertain)))}</div><div class="text-xs text-gray-600 mt-0.5" data-v-ad177d93>disetujui ${ssrInterpolate(unref(filterTahun))}</div></div><div class="card text-center py-3" data-v-ad177d93><div class="text-xs text-gray-500 mb-1" data-v-ad177d93>Budget Tahunan</div><div class="text-xl font-bold text-blue-300" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(totalBudget)))}</div><div class="text-xs text-gray-600 mt-0.5" data-v-ad177d93>${ssrInterpolate(unref(totalUsagePct).toFixed(0))}% terpakai</div></div><div class="card text-center py-3" data-v-ad177d93><div class="text-xs text-gray-500 mb-1" data-v-ad177d93>Total Won</div><div class="text-xl font-bold text-emerald-400" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(totalWon)))}</div><div class="text-xs text-gray-600 mt-0.5" data-v-ad177d93>dari pipeline</div></div><div class="${ssrRenderClass([unref(totalRoi) >= 10 ? "border-emerald-700/60 bg-emerald-900/10" : unref(totalRoi) >= 3 ? "border-yellow-700/60 bg-yellow-900/10" : "border-red-700/40", "card text-center py-3 border"])}" data-v-ad177d93><div class="text-xs text-gray-500 mb-1" data-v-ad177d93>ROI Keseluruhan</div><div class="${ssrRenderClass([unref(totalRoi) >= 10 ? "text-emerald-400" : unref(totalRoi) >= 3 ? "text-yellow-400" : "text-red-400", "text-2xl font-bold"])}" data-v-ad177d93>${ssrInterpolate(unref(totalEntertain) > 0 ? unref(totalRoi).toFixed(1) + "\xD7" : "\u2014")}</div><div class="text-xs text-gray-600 mt-0.5" data-v-ad177d93>deal won per Rp entertain</div></div></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center py-20 text-gray-500" data-v-ad177d93><i class="fa-solid fa-circle-notch fa-spin text-2xl mr-2" data-v-ad177d93></i>Memuat... </div>`);
      } else {
        _push(`<!--[-->`);
        if (unref(canApprove) && unref(rekapSales).length) {
          _push(`<div class="card mb-5" data-v-ad177d93><div class="flex items-center justify-between mb-1" data-v-ad177d93><div data-v-ad177d93><div class="section-title mb-0" data-v-ad177d93><i class="fa-solid fa-ranking-star text-yellow-400 mr-1.5" data-v-ad177d93></i>Limit &amp; Penggunaan Entertain </div><div class="text-xs text-gray-500 mt-0.5" data-v-ad177d93>${ssrInterpolate(unref(filterBulan) ? monthName(unref(filterBulan)) + " " + unref(filterTahun) : "Tahun " + unref(filterTahun))} \xB7 diurutkan berdasarkan total disetujui </div></div><div class="flex items-center gap-6" data-v-ad177d93><div class="hidden md:block text-right" data-v-ad177d93><div class="text-xs text-gray-500" data-v-ad177d93>Total Disetujui</div><div class="text-sm font-semibold text-emerald-400" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(rekapSales).reduce((s, r) => s + (r.total_approved || 0), 0)))}</div></div><div class="hidden md:block text-right" data-v-ad177d93><div class="text-xs text-gray-500" data-v-ad177d93>Total Limit/Bln</div><div class="text-sm font-semibold text-apex-text" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(rekapSales).reduce((s, r) => s + (r.entertain_limit || 0), 0)))}</div></div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/sales",
            class: "text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1.5 border border-primary-400/30 rounded-lg px-3 py-1.5"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<i class="fa-solid fa-sliders text-[10px]" data-v-ad177d93${_scopeId}></i>Kelola Limit `);
              } else {
                return [
                  createVNode("i", { class: "fa-solid fa-sliders text-[10px]" }),
                  createTextVNode("Kelola Limit ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div></div><div class="grid leaderboard-grid gap-3 px-3 py-2 mt-3 border-b border-navy-700 text-[11px] text-gray-500 font-medium uppercase tracking-wide" data-v-ad177d93><div class="text-center" data-v-ad177d93>#</div><div data-v-ad177d93>Sales</div><div class="text-right" data-v-ad177d93>Disetujui</div><div data-v-ad177d93>Penggunaan limit</div><div class="text-right" data-v-ad177d93>%</div></div><!--[-->`);
          ssrRenderList(unref(leaderboard), (r, idx) => {
            _push(`<div class="grid leaderboard-grid gap-3 px-3 py-2.5 items-center border-b border-navy-700/40 hover:bg-navy-800/30 transition-colors last:border-0" data-v-ad177d93><div class="text-center" data-v-ad177d93>`);
            if (idx === 0) {
              _push(`<span class="text-base" data-v-ad177d93>\u{1F947}</span>`);
            } else if (idx === 1) {
              _push(`<span class="text-base" data-v-ad177d93>\u{1F948}</span>`);
            } else if (idx === 2) {
              _push(`<span class="text-base" data-v-ad177d93>\u{1F949}</span>`);
            } else {
              _push(`<span class="text-xs text-gray-500 font-medium tabular-nums" data-v-ad177d93>${ssrInterpolate(idx + 1)}</span>`);
            }
            _push(`</div><div class="flex items-center gap-2.5 min-w-0" data-v-ad177d93><div class="${ssrRenderClass([pct(r) > 100 ? "bg-red-900/50 text-red-300" : pct(r) > 75 ? "bg-yellow-900/50 text-yellow-300" : "bg-primary-900/50 text-primary-300", "w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0"])}" data-v-ad177d93>${ssrInterpolate(initials(r.sales_nama))}</div><div class="min-w-0" data-v-ad177d93><div class="text-sm font-medium text-apex-text truncate" data-v-ad177d93>${ssrInterpolate(r.sales_nama)}</div><div class="text-[11px] text-gray-500" data-v-ad177d93>${ssrInterpolate(r.jumlah_klaim || 0)} klaim</div></div>`);
            if (pct(r) > 100) {
              _push(`<span class="ml-1 text-[10px] font-medium bg-red-900/50 text-red-300 px-2 py-0.5 rounded-full flex-shrink-0" data-v-ad177d93>Melebihi</span>`);
            } else if (pct(r) > 75) {
              _push(`<span class="ml-1 text-[10px] font-medium bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full flex-shrink-0" data-v-ad177d93>Hampir</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-right" data-v-ad177d93><div class="${ssrRenderClass([pct(r) > 100 ? "text-red-400" : pct(r) > 75 ? "text-yellow-400" : "text-emerald-400", "text-sm font-semibold tabular-nums"])}" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(r.total_approved || 0))}</div><div class="text-[11px] text-gray-500 tabular-nums" data-v-ad177d93> / ${ssrInterpolate(r.entertain_limit > 0 ? unref(fmt).rupiah(unref(filterBulan) ? r.entertain_limit : r.entertain_limit * 12) : "\u2014")}</div></div>`);
            if (r.entertain_limit > 0) {
              _push(`<div data-v-ad177d93><div class="h-1.5 bg-navy-700 rounded-full overflow-hidden mb-1" data-v-ad177d93><div class="${ssrRenderClass([pct(r) > 100 ? "bg-red-500" : pct(r) > 75 ? "bg-yellow-500" : "bg-emerald-500", "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(pct(r), 100)}%`)}" data-v-ad177d93></div></div><div class="text-[10px] text-gray-600" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(r.total || 0))} diajukan</div></div>`);
            } else {
              _push(`<div class="text-[11px] text-gray-600 italic" data-v-ad177d93>Limit belum diatur</div>`);
            }
            _push(`<div class="text-right" data-v-ad177d93>`);
            if (r.entertain_limit > 0) {
              _push(`<span class="${ssrRenderClass([pct(r) > 100 ? "text-red-400" : pct(r) > 75 ? "text-yellow-400" : "text-emerald-400", "text-sm font-semibold tabular-nums"])}" data-v-ad177d93>${ssrInterpolate(pct(r).toFixed(0))}% </span>`);
            } else {
              _push(`<span class="text-gray-500 text-xs" data-v-ad177d93>\u2014</span>`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(canApprove) && unref(myLimit) > 0) {
          _push(`<div class="card mb-5" data-v-ad177d93><div class="section-title mb-3" data-v-ad177d93><i class="fa-solid fa-wallet text-primary-400 mr-1.5" data-v-ad177d93></i>Limit Entertain Saya \u2014 ${ssrInterpolate(unref(filterBulan) ? monthName(unref(filterBulan)) : "Tahun " + unref(filterTahun))}</div><div class="flex flex-col md:flex-row items-start md:items-center gap-4" data-v-ad177d93><div class="flex-1" data-v-ad177d93><div class="flex justify-between text-xs mb-2" data-v-ad177d93><span class="text-gray-500" data-v-ad177d93>Terpakai: <strong class="text-apex-text" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(summaryAll).total_amount || 0))}</strong></span><span class="${ssrRenderClass(unref(myPct) > 100 ? "text-red-400 font-semibold" : "text-gray-500")}" data-v-ad177d93>${ssrInterpolate(unref(myPct).toFixed(0))}%</span></div><div class="h-3 bg-navy-700 rounded-full overflow-hidden" data-v-ad177d93><div class="${ssrRenderClass([unref(myPct) > 100 ? "bg-red-500" : unref(myPct) > 75 ? "bg-yellow-500" : "bg-emerald-500", "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(unref(myPct), 100)}%`)}" data-v-ad177d93></div></div><div class="flex justify-between text-xs mt-1.5 text-gray-600" data-v-ad177d93><span data-v-ad177d93>Rp 0</span><span data-v-ad177d93>Limit: ${ssrInterpolate(unref(fmt).rupiah(unref(myLimit)))}/bln</span></div></div><div class="text-center md:text-right flex-shrink-0" data-v-ad177d93><div class="${ssrRenderClass([unref(myPct) > 100 ? "text-red-400" : "text-emerald-400", "text-2xl font-bold"])}" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(Math.max(unref(myLimit) - (unref(summaryAll).total_amount || 0), 0)))}</div><div class="text-xs text-gray-500" data-v-ad177d93>sisa limit ${ssrInterpolate(unref(filterBulan) ? "bulan ini" : "rata-rata/bln")}</div></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(canApprove) && unref(roiRows).length) {
          _push(`<div class="mb-5" data-v-ad177d93><div class="flex items-center justify-between mb-3" data-v-ad177d93><div class="section-title mb-0" data-v-ad177d93><i class="fa-solid fa-scale-balanced mr-1.5 text-blue-400" data-v-ad177d93></i>Produktivitas Entertain per Sales </div><div class="flex items-center gap-3 text-xs text-gray-500" data-v-ad177d93><span class="flex items-center gap-1.5" data-v-ad177d93><span class="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" data-v-ad177d93></span>\u226510\xD7 efisien</span><span class="flex items-center gap-1.5" data-v-ad177d93><span class="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block" data-v-ad177d93></span>3\u201310\xD7 cukup</span><span class="flex items-center gap-1.5" data-v-ad177d93><span class="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" data-v-ad177d93></span>&lt;3\xD7 perlu evaluasi</span></div></div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-5" data-v-ad177d93><!--[-->`);
          ssrRenderList(unref(roiRows), (r) => {
            _push(`<div class="${ssrRenderClass([roiColor(r).border, "card border-l-4 transition-all hover:shadow-lg"])}" data-v-ad177d93><div class="flex items-start justify-between mb-3" data-v-ad177d93><div class="flex items-center gap-2.5" data-v-ad177d93><div class="${ssrRenderClass([roiColor(r).avatar, "w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"])}" data-v-ad177d93>${ssrInterpolate(initials(r.sales_nama))}</div><div data-v-ad177d93><div class="font-semibold text-sm text-apex-text" data-v-ad177d93>${ssrInterpolate(r.sales_nama)}</div><div class="text-xs text-gray-500" data-v-ad177d93>${ssrInterpolate(r.jumlah_klaim)} klaim</div></div></div><div class="text-right" data-v-ad177d93><div class="${ssrRenderClass([roiColor(r).text, "text-2xl font-black leading-none"])}" data-v-ad177d93>${ssrInterpolate(r.roi_pipeline !== null ? r.roi_pipeline + "\xD7" : "\u2014")}</div><div class="text-[10px] text-gray-500" data-v-ad177d93>ROI Pipeline</div></div></div><div class="mb-3" data-v-ad177d93><div class="flex justify-between text-xs mb-1" data-v-ad177d93><span class="text-gray-500" data-v-ad177d93>Entertain terpakai</span><span class="${ssrRenderClass([r.usage_pct > 100 ? "text-red-400" : "text-gray-300", "font-medium"])}" data-v-ad177d93>${ssrInterpolate(r.usage_pct.toFixed(0))}% </span></div><div class="h-2 rounded-full bg-navy-700 overflow-hidden" data-v-ad177d93><div class="${ssrRenderClass([r.usage_pct > 100 ? "bg-red-500" : r.usage_pct > 75 ? "bg-yellow-500" : "bg-emerald-500", "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(r.usage_pct, 100)}%`)}" data-v-ad177d93></div></div><div class="flex justify-between text-[10px] mt-1 text-gray-600" data-v-ad177d93><span data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(r.entertain_approved))}</span><span data-v-ad177d93>Budget: ${ssrInterpolate(r.budget_tahunan > 0 ? unref(fmt).rupiah(r.budget_tahunan) : "no limit")}</span></div></div><div class="grid grid-cols-3 gap-2 pt-3 border-t border-navy-700/60" data-v-ad177d93><div class="text-center" data-v-ad177d93><div class="text-xs text-gray-500 mb-0.5" data-v-ad177d93>Won</div><div class="text-sm font-bold text-emerald-400" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(r.won_value))}</div><div class="text-[10px] text-gray-600" data-v-ad177d93>${ssrInterpolate(r.won_count)} deal</div></div><div class="text-center border-x border-navy-700/60" data-v-ad177d93><div class="text-xs text-gray-500 mb-0.5" data-v-ad177d93>Revenue</div><div class="text-sm font-bold text-blue-300" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(r.revenue_actual))}</div>`);
            if (r.revenue_target > 0) {
              _push(`<div class="text-[10px] text-gray-600" data-v-ad177d93> / ${ssrInterpolate(unref(fmt).rupiah(r.revenue_target))}</div>`);
            } else {
              _push(`<div class="text-[10px] text-gray-600" data-v-ad177d93>\u2014</div>`);
            }
            _push(`</div><div class="text-center" data-v-ad177d93><div class="text-xs text-gray-500 mb-0.5" data-v-ad177d93>Sisa</div><div class="${ssrRenderClass([r.sisa_budget <= 0 ? "text-red-400" : "text-gray-300", "text-sm font-bold"])}" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(r.sisa_budget))}</div><div class="${ssrRenderClass([r.sisa_budget <= 0 ? "text-red-500" : "text-gray-600", "text-[10px]"])}" data-v-ad177d93>${ssrInterpolate(r.sisa_budget <= 0 ? "habis" : "budget sisa")}</div></div></div>`);
            if (r.roi_revenue !== null) {
              _push(`<div class="mt-2.5 pt-2.5 border-t border-navy-700/60 flex items-center justify-between text-xs" data-v-ad177d93><span class="text-gray-500" data-v-ad177d93>ROI Revenue</span><span class="${ssrRenderClass([roiColor(r).text, "font-bold"])}" data-v-ad177d93>${ssrInterpolate(r.roi_revenue)}\xD7</span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div><div class="card mb-5" data-v-ad177d93><div class="section-title mb-4" data-v-ad177d93><i class="fa-solid fa-ranking-star mr-1.5 text-yellow-400" data-v-ad177d93></i>Ranking Efisiensi \u2014 ROI Pipeline </div><div class="space-y-3" data-v-ad177d93><!--[-->`);
          ssrRenderList(unref(roiRanked), (r) => {
            _push(`<div class="flex items-center gap-3" data-v-ad177d93><div class="w-24 text-xs text-gray-400 text-right flex-shrink-0 truncate" data-v-ad177d93>${ssrInterpolate(r.sales_nama)}</div><div class="flex-1 flex items-center gap-2" data-v-ad177d93><div class="relative h-5 flex-1 rounded bg-navy-800 overflow-hidden" data-v-ad177d93><div class="absolute left-0 top-0 h-full rounded transition-all duration-700 opacity-80" style="${ssrRenderStyle([{ "background": "#f97316" }, `width:${unref(maxEntertain) > 0 ? r.entertain_approved / unref(maxEntertain) * 100 : 0}%`])}" data-v-ad177d93></div><div class="absolute left-0 top-0 h-full rounded transition-all duration-700" style="${ssrRenderStyle([{ "background": "#22c55e", "opacity": "0.35" }, `width:${unref(maxWon) > 0 ? r.won_value / unref(maxWon) * 100 : 0}%`])}" data-v-ad177d93></div></div><div class="${ssrRenderClass([roiColor(r).text, "w-16 text-xs font-bold text-right flex-shrink-0"])}" data-v-ad177d93>${ssrInterpolate(r.roi_pipeline !== null ? r.roi_pipeline + "\xD7" : "\u2014")}</div></div><div class="w-28 text-xs text-gray-500 flex-shrink-0 hidden lg:block" data-v-ad177d93><span style="${ssrRenderStyle({ "color": "#f97316" })}" data-v-ad177d93>\u25A0</span> ${ssrInterpolate(unref(fmt).rupiah(r.entertain_approved))}</div></div>`);
          });
          _push(`<!--]--></div><div class="flex gap-4 mt-3 pt-3 border-t border-navy-700/40 text-[10px] text-gray-600" data-v-ad177d93><span data-v-ad177d93><span style="${ssrRenderStyle({ "color": "#f97316" })}" data-v-ad177d93>\u25A0</span> Entertain disetujui</span><span data-v-ad177d93><span style="${ssrRenderStyle({ "color": "#22c55e" })}" data-v-ad177d93>\u25A0</span> Won (pipeline, skala berbeda)</span></div></div><div class="card mb-5" data-v-ad177d93><div class="section-title mb-4" data-v-ad177d93><i class="fa-solid fa-chart-column mr-1.5 text-orange-400" data-v-ad177d93></i>Tren Entertain Bulanan \u2014 ${ssrInterpolate(unref(filterTahun))} `);
          if (unref(filterSales)) {
            _push(`<span class="text-xs text-gray-500 font-normal ml-2" data-v-ad177d93>${ssrInterpolate(unref(filterSales))}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex items-end gap-1.5 h-32" data-v-ad177d93><!--[-->`);
          ssrRenderList((_b = (_a = unref(roiData)) == null ? void 0 : _a.tren_monthly) != null ? _b : [], (v, i) => {
            var _a2, _b2, _c, _d;
            _push(`<div class="flex-1 flex flex-col items-center gap-1 group cursor-default"${ssrRenderAttr("title", `${(_b2 = (_a2 = unref(roiData)) == null ? void 0 : _a2.bulan_labels) == null ? void 0 : _b2[i]}: ${unref(fmt).rupiah(v)}`)} data-v-ad177d93><div class="text-[9px] text-gray-600 group-hover:text-gray-400 transition-colors text-center leading-tight" data-v-ad177d93>${ssrInterpolate(v > 0 ? unref(fmt).rupiah(v) : "")}</div><div class="w-full rounded-t transition-all duration-500" style="${ssrRenderStyle(`height:${unref(maxTren) > 0 ? v / unref(maxTren) * 88 : 0}px; min-height:${v > 0 ? 4 : 1}px; background:${v > 0 ? "#f97316" : "#1e2d42"}`)}" data-v-ad177d93></div><div class="text-[9px] text-gray-600" data-v-ad177d93>${ssrInterpolate((_d = (_c = unref(roiData)) == null ? void 0 : _c.bulan_labels) == null ? void 0 : _d[i])}</div></div>`);
          });
          _push(`<!--]--></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(canApprove) && unref(myRoi)) {
          _push(`<div class="mb-5" data-v-ad177d93><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5" data-v-ad177d93><div class="card" data-v-ad177d93><div class="text-xs text-gray-500 mb-1" data-v-ad177d93><i class="fa-solid fa-wallet mr-1 text-blue-400" data-v-ad177d93></i>Budget Entertain ${ssrInterpolate(unref(filterTahun))}</div><div class="text-2xl font-bold text-apex-text mb-1" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(myRoi).budget_tahunan))}</div><div class="text-xs text-gray-500" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(myRoi).entertain_limit))}/bln \xD7 12</div><div class="mt-3 h-2 rounded-full bg-navy-700 overflow-hidden" data-v-ad177d93><div class="${ssrRenderClass([unref(myRoi).usage_pct > 100 ? "bg-red-500" : unref(myRoi).usage_pct > 75 ? "bg-yellow-500" : "bg-emerald-500", "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(unref(myRoi).usage_pct, 100)}%`)}" data-v-ad177d93></div></div><div class="flex justify-between mt-1 text-[10px] text-gray-600" data-v-ad177d93><span data-v-ad177d93>Terpakai: ${ssrInterpolate(unref(fmt).rupiah(unref(myRoi).entertain_approved))}</span><span class="${ssrRenderClass(unref(myRoi).usage_pct > 100 ? "text-red-400" : "")}" data-v-ad177d93>${ssrInterpolate(unref(myRoi).usage_pct.toFixed(0))}%</span></div><div class="${ssrRenderClass([unref(myRoi).sisa_budget <= 0 ? "text-red-400" : "text-emerald-400", "mt-2 text-sm font-semibold"])}" data-v-ad177d93> Sisa: ${ssrInterpolate(unref(fmt).rupiah(unref(myRoi).sisa_budget))}</div></div><div class="card border border-emerald-700/40" data-v-ad177d93><div class="text-xs text-gray-500 mb-1" data-v-ad177d93><i class="fa-solid fa-trophy mr-1 text-emerald-400" data-v-ad177d93></i>Pipeline Won ${ssrInterpolate(unref(filterTahun))}</div><div class="text-2xl font-bold text-emerald-400 mb-1" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(myRoi).won_value))}</div><div class="text-xs text-gray-500" data-v-ad177d93>${ssrInterpolate(unref(myRoi).won_count)} deal ditutup</div>`);
          if (unref(myRoi).revenue_actual > 0) {
            _push(`<div class="mt-3 pt-3 border-t border-navy-700/40" data-v-ad177d93><div class="text-xs text-gray-500 mb-0.5" data-v-ad177d93><i class="fa-solid fa-chart-line mr-1 text-blue-400" data-v-ad177d93></i>Revenue Realisasi</div><div class="text-lg font-bold text-blue-300" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(unref(myRoi).revenue_actual))}</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="${ssrRenderClass([roiColor(unref(myRoi)).border, "card border-2 flex flex-col items-center justify-center py-6"])}" data-v-ad177d93><div class="text-xs text-gray-500 mb-2" data-v-ad177d93>Setiap Rp 1 entertain menghasilkan</div><div class="${ssrRenderClass([roiColor(unref(myRoi)).text, "text-5xl font-black leading-none mb-1"])}" data-v-ad177d93>${ssrInterpolate(unref(myRoi).roi_pipeline !== null ? unref(myRoi).roi_pipeline + "\xD7" : "\u2014")}</div><div class="text-sm text-gray-500" data-v-ad177d93>deal won</div>`);
          if (unref(myRoi).roi_revenue !== null) {
            _push(`<div class="mt-3 text-center" data-v-ad177d93><div class="text-xs text-gray-500" data-v-ad177d93>ROI Revenue</div><div class="${ssrRenderClass([roiColor(unref(myRoi)).text, "text-xl font-bold"])}" data-v-ad177d93>${ssrInterpolate(unref(myRoi).roi_revenue)}\xD7</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="${ssrRenderClass([roiColor(unref(myRoi)).badge, "mt-4 text-[10px] px-3 py-1.5 rounded-full"])}" data-v-ad177d93>${ssrInterpolate(roiColor(unref(myRoi)).label)}</div></div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 gap-5" data-v-ad177d93><div class="card" data-v-ad177d93><div class="flex items-center justify-between mb-3" data-v-ad177d93><div class="section-title mb-0" data-v-ad177d93><i class="fa-solid fa-clock text-yellow-400 mr-1.5" data-v-ad177d93></i>Menunggu Approval</div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: unref(canApprove) ? "/entertain/approval" : "/entertain/claims",
          class: "text-xs text-primary-400 hover:text-primary-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Lihat semua \u2192`);
            } else {
              return [
                createTextVNode("Lihat semua \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (!unref(pendingClaims).length) {
          _push(`<div class="text-center py-6 text-gray-600 text-sm" data-v-ad177d93>Tidak ada klaim pending.</div>`);
        } else {
          _push(`<div class="space-y-2" data-v-ad177d93><!--[-->`);
          ssrRenderList(unref(pendingClaims).slice(0, 5), (c) => {
            _push(`<div class="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-navy-800/40 hover:bg-navy-800/70 transition-colors" data-v-ad177d93><div class="min-w-0" data-v-ad177d93><div class="text-xs font-mono text-primary-400" data-v-ad177d93>${ssrInterpolate(c.claim_no)}</div><div class="text-sm font-medium text-apex-text truncate" data-v-ad177d93>${ssrInterpolate(c.nama_klien)}</div><div class="text-xs text-gray-500" data-v-ad177d93>${ssrInterpolate(c.sales_nama)} \xB7 ${ssrInterpolate(unref(fmt).tgl(c.tgl_klaim))}</div></div><div class="text-right flex-shrink-0" data-v-ad177d93><div class="font-semibold text-sm" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(c.jumlah))}</div><span class="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/50 text-yellow-300" data-v-ad177d93>Pending</span></div></div>`);
          });
          _push(`<!--]-->`);
          if (unref(pendingClaims).length > 5) {
            _push(`<div class="text-center pt-1" data-v-ad177d93>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: unref(canApprove) ? "/entertain/approval" : "/entertain/claims",
              class: "text-xs text-primary-400"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`+${ssrInterpolate(unref(pendingClaims).length - 5)} lainnya`);
                } else {
                  return [
                    createTextVNode("+" + toDisplayString(unref(pendingClaims).length - 5) + " lainnya", 1)
                  ];
                }
              }),
              _: 1
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        }
        _push(`</div><div class="card" data-v-ad177d93><div class="flex items-center justify-between mb-3" data-v-ad177d93><div class="section-title mb-0" data-v-ad177d93><i class="fa-solid fa-circle-check text-emerald-400 mr-1.5" data-v-ad177d93></i>Approved Terbaru</div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/entertain/claims",
          class: "text-xs text-primary-400 hover:text-primary-300"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`Lihat semua \u2192`);
            } else {
              return [
                createTextVNode("Lihat semua \u2192")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (!unref(approvedClaims).length) {
          _push(`<div class="text-center py-6 text-gray-600 text-sm" data-v-ad177d93>Belum ada klaim disetujui.</div>`);
        } else {
          _push(`<div class="space-y-2" data-v-ad177d93><!--[-->`);
          ssrRenderList(unref(approvedClaims).slice(0, 5), (c) => {
            _push(`<div class="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-navy-800/40 hover:bg-navy-800/70 transition-colors" data-v-ad177d93><div class="min-w-0" data-v-ad177d93><div class="text-xs font-mono text-primary-400" data-v-ad177d93>${ssrInterpolate(c.claim_no)}</div><div class="text-sm font-medium text-apex-text truncate" data-v-ad177d93>${ssrInterpolate(c.nama_klien)}</div><div class="text-xs text-gray-500" data-v-ad177d93>${ssrInterpolate(c.sales_nama)} \xB7 ${ssrInterpolate(unref(fmt).tgl(c.tgl_klaim))}</div></div><div class="text-right flex-shrink-0" data-v-ad177d93><div class="font-semibold text-sm text-emerald-400" data-v-ad177d93>${ssrInterpolate(unref(fmt).rupiah(c.jumlah))}</div><span class="text-[10px] px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300" data-v-ad177d93>Approved</span></div></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div></div><!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/entertain/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ad177d93"]]);

export { index as default };
//# sourceMappingURL=index-DONMKq58.mjs.map
