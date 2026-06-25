import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { _ as __nuxt_component_1 } from './AppPagination-DUr1sfAX.mjs';
import { defineComponent, reactive, ref, withAsyncContext, computed, unref, withCtx, createVNode, createTextVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderStyle, ssrRenderComponent } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useFormat } from './useFormat-D7DNHH-1.mjs';
import { u as useAsyncData } from './asyncData-BUVmteIW.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import 'perfect-debounce';

const DETAIL_PER_PAGE = 5;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "monthly",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const f = reactive({ tahun: (/* @__PURE__ */ new Date()).getFullYear() });
    const selectedMonth = ref(0);
    const detailPending = ref(false);
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "rev-monthly",
      () => get("/v1/revenue/monthly", {
        tahun: f.tahun,
        month: selectedMonth.value
      }),
      { server: false }
    )), __temp = await __temp, __restore(), __temp);
    const detailTotalTarget = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = data.value) == null ? void 0 : _a.detail_rows) != null ? _b : []).reduce((s, r) => {
          var _a2;
          return s + ((_a2 = r.target) != null ? _a2 : 0);
        }, 0);
      }
    );
    const detailTotalActual = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = data.value) == null ? void 0 : _a.detail_rows) != null ? _b : []).reduce((s, r) => {
          var _a2;
          return s + ((_a2 = r.actual) != null ? _a2 : 0);
        }, 0);
      }
    );
    const detailPage = ref(1);
    const detailTotal = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = data.value) == null ? void 0 : _a.detail_rows) == null ? void 0 : _b.length) != null ? _c : 0;
    });
    const detailTotalPages = computed(() => Math.ceil(detailTotal.value / DETAIL_PER_PAGE) || 1);
    const detailSlice = computed(() => {
      var _a, _b;
      const all = (_b = (_a = data.value) == null ? void 0 : _a.detail_rows) != null ? _b : [];
      const start = (detailPage.value - 1) * DETAIL_PER_PAGE;
      return all.slice(start, start + DETAIL_PER_PAGE);
    });
    const quarterSummary = computed(() => {
      var _a, _b;
      const summary = (_b = (_a = data.value) == null ? void 0 : _a.summary) != null ? _b : [];
      const result = {};
      for (const q of ["Q1", "Q2", "Q3", "Q4"]) {
        const rows = summary.filter((r) => r.quarter === q);
        const target = rows.reduce((s, r) => s + r.target, 0);
        const actual = rows.reduce((s, r) => s + r.actual, 0);
        const collection = rows.reduce((s, r) => s + r.collection, 0);
        const outstanding = rows.reduce((s, r) => s + r.outstanding, 0);
        const ach_pct = target > 0 ? Math.round(actual / target * 100 * 10) / 10 : 0;
        result[q] = { target, actual, collection, outstanding, ach_pct };
      }
      return result;
    });
    function quarterColor(q) {
      var _a;
      const map = {
        Q1: "bg-blue-900/50 text-blue-300",
        Q2: "bg-purple-900/50 text-purple-300",
        Q3: "bg-amber-900/50 text-amber-300",
        Q4: "bg-emerald-900/50 text-emerald-300"
      };
      return (_a = map[q]) != null ? _a : "bg-navy-700 text-gray-400";
    }
    function achBarColor(pct) {
      if (pct >= 80) return "bg-emerald-500";
      if (pct >= 50) return "bg-yellow-500";
      return "bg-red-500";
    }
    function achTextColor(pct) {
      if (pct >= 80) return "text-emerald-400";
      if (pct >= 50) return "text-yellow-400";
      return "text-red-400";
    }
    function statusBadge(status) {
      var _a;
      const map = {
        "On Track": "badge-green",
        "At Risk": "badge-yellow",
        "Critical": "badge-red"
      };
      return (_a = map[status]) != null ? _a : "badge-gray";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-calendar-alt text-primary-400 mr-2"></i>Monthly Monitoring </h1><p class="page-subtitle">Summary Revenue ${ssrInterpolate(unref(f).tahun)}</p></div><select class="form-select w-24 text-xs"><!--[-->`);
      ssrRenderList(((_a = unref(data)) == null ? void 0 : _a.years) || [], (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(f).tahun) ? ssrLooseContain(unref(f).tahun, y) : ssrLooseEqual(unref(f).tahun, y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5"><div class="stat-card"><div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-bullseye"></i></div><div><div class="stat-value text-xs">${ssrInterpolate(unref(fmt).rupiah(unref(data).grand_target))}</div><div class="stat-label">Target ${ssrInterpolate(unref(f).tahun)}</div></div></div><div class="stat-card"><div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-coins"></i></div><div><div class="stat-value text-xs text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(data).grand_actual))}</div><div class="stat-label">Total Realisasi</div></div></div><div class="stat-card"><div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-hand-holding-dollar"></i></div><div><div class="stat-value text-xs text-purple-300">${ssrInterpolate(unref(fmt).rupiah(unref(data).grand_coll))}</div><div class="stat-label">Total Collection</div></div></div><div class="${ssrRenderClass([unref(data).grand_out > 0 ? "border border-orange-800/40" : "", "stat-card"])}"><div class="${ssrRenderClass([unref(data).grand_out > 0 ? "bg-orange-900/40 text-orange-400" : "bg-gray-800 text-gray-500", "stat-icon"])}"><i class="fa-solid fa-hourglass-half"></i></div><div><div class="${ssrRenderClass([unref(data).grand_out > 0 ? "text-orange-400" : "text-gray-500", "stat-value text-xs"])}">${ssrInterpolate(unref(fmt).rupiah(unref(data).grand_out))}</div><div class="stat-label">Outstanding</div></div></div><div class="stat-card"><div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-percent"></i></div><div><div class="${ssrRenderClass([achTextColor(unref(data).grand_ach), "stat-value"])}">${ssrInterpolate(unref(data).grand_ach)}% </div><div class="stat-label">Achievement YTD</div></div></div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5"><!--[-->`);
        ssrRenderList(["Q1", "Q2", "Q3", "Q4"], (q) => {
          _push(`<div class="${ssrRenderClass([{
            "border-blue-500": q === "Q1",
            "border-purple-500": q === "Q2",
            "border-amber-500": q === "Q3",
            "border-emerald-500": q === "Q4"
          }, "card border-t-2"])}"><div class="flex items-center justify-between mb-3"><span class="${ssrRenderClass([quarterColor(q), "text-sm font-bold px-2 py-0.5 rounded"])}">${ssrInterpolate(q)}</span><span class="${ssrRenderClass([unref(quarterSummary)[q].ach_pct >= 80 ? "badge-green" : unref(quarterSummary)[q].ach_pct >= 50 ? "badge-yellow" : "badge-red", "text-xs font-semibold px-2 py-0.5 rounded"])}">${ssrInterpolate(unref(quarterSummary)[q].ach_pct >= 80 ? "On Track" : unref(quarterSummary)[q].ach_pct >= 50 ? "At Risk" : "Critical")}</span></div><div class="space-y-1.5 mb-3"><div class="flex justify-between text-xs"><span class="text-gray-500">Target</span><span class="text-gray-200 font-medium">${ssrInterpolate(unref(fmt).rupiah(unref(quarterSummary)[q].target))}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Actual</span><span class="${ssrRenderClass([achTextColor(unref(quarterSummary)[q].ach_pct), "font-semibold"])}">${ssrInterpolate(unref(fmt).rupiah(unref(quarterSummary)[q].actual))}</span></div></div><div class="h-1.5 bg-navy-800 rounded overflow-hidden"><div class="${ssrRenderClass([achBarColor(unref(quarterSummary)[q].ach_pct), "h-full rounded transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(unref(quarterSummary)[q].ach_pct, 100)}%`)}"></div></div><div class="text-right mt-1"><span class="${ssrRenderClass([achTextColor(unref(quarterSummary)[q].ach_pct), "text-xs font-bold"])}">${ssrInterpolate(unref(quarterSummary)[q].ach_pct)}% </span></div></div>`);
        });
        _push(`<!--]--></div><div class="card overflow-x-auto"><table class="tbl"><thead><tr><th class="w-14 text-center">Quarter</th><th class="w-32">Bulan</th><th class="text-right">Target Revenue</th><th class="text-right">Actual Revenue</th><th class="text-right">Collection</th><th class="text-right">Outstanding</th><th class="w-36">Achievement %</th><th class="w-24">Status</th><th class="w-16 text-center">Detail</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(data).summary, (row, idx) => {
          var _a2;
          _push(`<!--[--><tr class="${ssrRenderClass([[
            unref(selectedMonth) === row.month_num ? "bg-primary-900/25 border-l-2 border-primary-500" : row.is_current ? "bg-primary-900/10 hover:bg-primary-900/20" : "hover:bg-navy-800/60",
            !row.is_past && !row.is_current ? "opacity-40" : ""
          ], "cursor-pointer select-none transition-colors"])}"><td class="text-center py-3">`);
          if (idx === 0 || unref(data).summary[idx - 1].quarter !== row.quarter) {
            _push(`<span class="${ssrRenderClass([quarterColor(row.quarter), "inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold"])}">${ssrInterpolate(row.quarter)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="py-3"><div class="flex items-center gap-2"><div class="${ssrRenderClass([row.is_current ? "bg-primary-400 animate-pulse" : row.is_past ? "bg-gray-600" : "bg-navy-700", "w-1.5 h-1.5 rounded-full flex-shrink-0"])}"></div><span class="${ssrRenderClass([row.is_current ? "text-primary-300" : "text-gray-200", "text-sm font-medium"])}">${ssrInterpolate(row.month_name)}</span>`);
          if (row.is_current) {
            _push(`<span class="text-xs px-1.5 py-0.5 rounded-full bg-primary-900/40 text-primary-400 border border-primary-800/50 leading-none"> Ini </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td><td class="text-right text-xs text-gray-300 py-3">${ssrInterpolate(row.target > 0 ? unref(fmt).rupiah(row.target) : "\u2014")}</td><td class="${ssrRenderClass([row.actual > 0 ? "text-emerald-400" : "text-gray-600", "text-right text-xs font-medium py-3"])}">${ssrInterpolate(row.actual > 0 ? unref(fmt).rupiah(row.actual) : "\u2014")}</td><td class="${ssrRenderClass([row.collection > 0 ? "text-purple-300" : "text-gray-600", "text-right text-xs py-3"])}">${ssrInterpolate(row.collection > 0 ? unref(fmt).rupiah(row.collection) : "\u2014")}</td><td class="${ssrRenderClass([row.outstanding > 0 ? "text-orange-400 font-medium" : "text-gray-600", "text-right text-xs py-3"])}">${ssrInterpolate(row.outstanding > 0 ? unref(fmt).rupiah(row.outstanding) : "\u2014")}</td><td class="py-3">`);
          if (row.is_past || row.is_current) {
            _push(`<div class="flex items-center gap-1.5"><div class="flex-1 h-1.5 bg-navy-700 rounded overflow-hidden"><div class="${ssrRenderClass([achBarColor(row.ach_pct), "h-full rounded transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(row.ach_pct, 100)}%`)}"></div></div><span class="${ssrRenderClass([achTextColor(row.ach_pct), "text-xs w-10 text-right flex-shrink-0 font-medium"])}">${ssrInterpolate(row.ach_pct)}% </span></div>`);
          } else {
            _push(`<span class="text-xs text-gray-700">\u2014</span>`);
          }
          _push(`</td><td class="py-3">`);
          if (row.is_past || row.is_current) {
            _push(`<span class="${ssrRenderClass(statusBadge(row.status))}">${ssrInterpolate(row.status)}</span>`);
          } else {
            _push(`<span class="text-xs text-gray-700 italic">Upcoming</span>`);
          }
          _push(`</td><td class="text-center py-3">`);
          if (row.project_count > 0) {
            _push(`<button class="flex items-center gap-1 mx-auto text-xs text-primary-400 hover:text-primary-300 transition-colors"><span class="font-medium">${ssrInterpolate(row.project_count)}</span><i class="${ssrRenderClass([unref(selectedMonth) === row.month_num ? "rotate-180" : "", "fa-solid fa-chevron-down transition-transform duration-200"])}"></i></button>`);
          } else {
            _push(`<span class="text-xs text-gray-700">\u2014</span>`);
          }
          _push(`</td></tr>`);
          if (unref(selectedMonth) === row.month_num) {
            _push(`<tr><td colspan="9" class="p-0 bg-navy-900/70"><div class="px-6 py-4 border-y border-primary-900/30">`);
            if (unref(detailPending)) {
              _push(`<div class="flex items-center gap-2 text-xs text-gray-500 py-3 justify-center"><i class="fa-solid fa-circle-notch fa-spin"></i> Memuat detail proyek... </div>`);
            } else {
              _push(`<!--[--><div class="flex items-center justify-between mb-3"><div class="text-xs font-semibold text-primary-300"><i class="fa-solid fa-folder-open mr-1.5"></i> Detail Proyek \u2014 ${ssrInterpolate(row.month_name)} ${ssrInterpolate(unref(f).tahun)}</div><div class="flex gap-3">`);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/revenue/tracker?tahun=${unref(f).tahun}`,
                class: "text-xs text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-1"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<i class="fa-solid fa-list-check text-xs"${_scopeId}></i>Revenue Tracker `);
                  } else {
                    return [
                      createVNode("i", { class: "fa-solid fa-list-check text-xs" }),
                      createTextVNode("Revenue Tracker ")
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/revenue/invoice?tahun=${unref(f).tahun}`,
                class: "text-xs text-gray-400 hover:text-primary-400 transition-colors flex items-center gap-1"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(`<i class="fa-solid fa-file-invoice text-xs"${_scopeId}></i>Invoice &amp; Payment `);
                  } else {
                    return [
                      createVNode("i", { class: "fa-solid fa-file-invoice text-xs" }),
                      createTextVNode("Invoice & Payment ")
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</div></div>`);
              if ((_a2 = unref(data).detail_rows) == null ? void 0 : _a2.length) {
                _push(`<table class="w-full text-xs"><thead><tr class="border-b border-navy-700"><th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-28">Project</th><th class="text-left py-1.5 pr-3 text-gray-500 font-medium">Client</th><th class="text-left py-1.5 pr-3 text-gray-500 font-medium">Produk</th><th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-20">Organisasi</th><th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-20">Kategori</th><th class="text-right py-1.5 pr-3 text-gray-500 font-medium">Target</th><th class="text-right py-1.5 pr-3 text-gray-500 font-medium">Actual</th><th class="text-right py-1.5 pr-3 text-gray-500 font-medium w-16">Ach%</th><th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-20">Status Bulan</th><th class="text-left py-1.5 pr-3 text-gray-500 font-medium w-16">Risk</th><th class="text-center py-1.5 text-gray-500 font-medium w-16">Invoice</th></tr></thead><tbody><!--[-->`);
                ssrRenderList(unref(detailSlice), (dr) => {
                  var _a3, _b, _c;
                  _push(`<tr class="border-b border-navy-800/40 hover:bg-navy-800/30 transition-colors"><td class="py-2 pr-3 font-medium text-gray-200">${ssrInterpolate(dr.project_id)}</td><td class="py-2 pr-3 text-gray-300 max-w-[160px] truncate">${ssrInterpolate(dr.client)}</td><td class="py-2 pr-3 text-gray-400 max-w-[160px] truncate">${ssrInterpolate(dr.product || "\u2014")}</td><td class="py-2 pr-3 text-gray-400">${ssrInterpolate(dr.organisasi)}</td><td class="py-2 pr-3"><span class="${ssrRenderClass(dr.kategori === "Project" ? "badge-blue" : "badge-purple")}">${ssrInterpolate(dr.kategori)}</span></td><td class="py-2 pr-3 text-right text-gray-300">${ssrInterpolate(unref(fmt).rupiah(dr.target))}</td><td class="${ssrRenderClass([dr.actual > 0 ? "text-emerald-400" : "text-gray-600", "py-2 pr-3 text-right font-semibold"])}">${ssrInterpolate(dr.actual > 0 ? unref(fmt).rupiah(dr.actual) : "\u2014")}</td><td class="${ssrRenderClass([unref(fmt).achColor(dr.ach_pct), "py-2 pr-3 text-right font-medium"])}">${ssrInterpolate((_b = (_a3 = dr.ach_pct) == null ? void 0 : _a3.toFixed(0)) != null ? _b : "\u2014")}% </td><td class="py-2 pr-3"><span class="${ssrRenderClass(unref(fmt).statusClass(dr.status))}"${ssrRenderAttr("title", `Status berdasarkan kinerja bulan ini: ${(_c = dr.ach_pct) == null ? void 0 : _c.toFixed(0)}%`)}>${ssrInterpolate(dr.status)}</span></td><td class="py-2 pr-3"><span class="${ssrRenderClass(unref(fmt).riskClass(dr.risk_level))}">${ssrInterpolate(dr.risk_level)}</span></td><td class="py-2 text-center">`);
                  _push(ssrRenderComponent(_component_NuxtLink, {
                    to: `/revenue/invoice?project=${dr.project_id}`,
                    class: "inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 transition-colors",
                    title: "Lihat invoice proyek ini"
                  }, {
                    default: withCtx((_, _push2, _parent2, _scopeId) => {
                      if (_push2) {
                        _push2(`<i class="fa-solid fa-file-invoice"${_scopeId}></i>`);
                      } else {
                        return [
                          createVNode("i", { class: "fa-solid fa-file-invoice" })
                        ];
                      }
                    }),
                    _: 2
                  }, _parent));
                  _push(`</td></tr>`);
                });
                _push(`<!--]--></tbody><tfoot><tr class="border-t border-navy-600 bg-navy-800/50"><td colspan="5" class="py-2 pr-3 text-gray-400 font-semibold"> Total (${ssrInterpolate(unref(detailTotal))} proyek) </td><td class="py-2 pr-3 text-right text-gray-200 font-semibold">${ssrInterpolate(unref(fmt).rupiah(unref(detailTotalTarget)))}</td><td class="py-2 pr-3 text-right text-emerald-400 font-semibold">${ssrInterpolate(unref(fmt).rupiah(unref(detailTotalActual)))}</td><td colspan="3"></td></tr></tfoot></table>`);
              } else {
                _push(`<!---->`);
              }
              if (unref(detailTotalPages) > 1) {
                _push(ssrRenderComponent(_component_AppPagination, {
                  page: unref(detailPage),
                  "onUpdate:page": ($event) => isRef(detailPage) ? detailPage.value = $event : null,
                  "total-pages": unref(detailTotalPages),
                  total: unref(detailTotal),
                  "per-page": DETAIL_PER_PAGE,
                  class: "mt-3"
                }, null, _parent));
              } else {
                _push(`<div class="text-xs text-gray-600 py-4 text-center"> Tidak ada data proyek untuk bulan ini </div>`);
              }
              _push(`<!--]-->`);
            }
            _push(`</div></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--><tr class="border-t-2 border-navy-600 bg-navy-800/40 font-semibold"><td colspan="2" class="py-3 px-3 text-xs text-gray-300"><i class="fa-solid fa-sigma mr-1.5 text-gray-500"></i>Grand Total ${ssrInterpolate(unref(f).tahun)}</td><td class="text-right text-xs text-gray-200 py-3 pr-3">${ssrInterpolate(unref(fmt).rupiah(unref(data).grand_target))}</td><td class="text-right text-xs text-emerald-400 py-3 pr-3">${ssrInterpolate(unref(fmt).rupiah(unref(data).grand_actual))}</td><td class="text-right text-xs text-purple-300 py-3 pr-3">${ssrInterpolate(unref(fmt).rupiah(unref(data).grand_coll))}</td><td class="${ssrRenderClass([unref(data).grand_out > 0 ? "text-orange-400" : "text-gray-600", "text-right text-xs py-3 pr-3"])}">${ssrInterpolate(unref(data).grand_out > 0 ? unref(fmt).rupiah(unref(data).grand_out) : "\u2014")}</td><td class="py-3 pr-3"><div class="flex items-center gap-1.5"><div class="flex-1 h-2 bg-navy-700 rounded overflow-hidden"><div class="${ssrRenderClass([achBarColor(unref(data).grand_ach), "h-full rounded transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(unref(data).grand_ach, 100)}%`)}"></div></div><span class="${ssrRenderClass([achTextColor(unref(data).grand_ach), "text-xs w-10 text-right flex-shrink-0 font-bold"])}">${ssrInterpolate(unref(data).grand_ach)}% </span></div></td><td colspan="2"></td></tr></tbody></table></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/revenue/monthly.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=monthly-C2kdwJyu.mjs.map
