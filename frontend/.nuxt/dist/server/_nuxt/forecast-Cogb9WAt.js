import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass, ssrRenderStyle } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import "../server.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ufo/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/klona/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "forecast",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const fmt = useFormat();
    const curYear = (/* @__PURE__ */ new Date()).getFullYear();
    const selectedYear = ref(curYear);
    const years = Array.from({ length: 4 }, (_, i) => curYear - i);
    const loading = ref(false);
    const data = ref(null);
    const closingRate = computed(() => {
      if (!data.value) return 0;
      const t = data.value.summary.total_leads;
      const w = data.value.summary.total_won_count;
      return t > 0 ? Math.round(w / t * 100) : 0;
    });
    const maxWeighted = computed(
      () => Math.max(...(data.value?.by_sales || []).map((s) => s.total_weighted), 1)
    );
    function salesBarPct(s) {
      return Math.round(s.total_weighted / maxWeighted.value * 100);
    }
    function wonPct(row) {
      if (!row.total_weighted) return 0;
      return Math.min(100, Math.round(row.actual_won / row.total_weighted * 100));
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-apex-bg text-apex-text p-6" }, _attrs))}><div class="flex flex-wrap items-center justify-between gap-4 mb-6"><div><h1 class="text-2xl font-bold text-apex-text"><i class="fa-solid fa-chart-line text-primary-400 mr-2"></i>Pipeline Forecast </h1><p class="text-sm text-apex-muted mt-0.5">Proyeksi pipeline berdasarkan weighted value &amp; exp. close date</p></div><select class="form-select text-sm w-28"><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedYear)) ? ssrLooseContain(unref(selectedYear), y) : ssrLooseEqual(unref(selectedYear), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center py-24 text-apex-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Memuat forecast... </div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"><div class="apex-card text-center"><p class="text-xs text-apex-muted mb-1">Total Weighted Pipeline</p><p class="text-xl font-bold text-primary-400">${ssrInterpolate(unref(fmt).rupiah(unref(data).summary.total_weighted))}</p></div><div class="apex-card text-center"><p class="text-xs text-apex-muted mb-1">Actual Won YTD</p><p class="text-xl font-bold text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(data).summary.total_won))}</p></div><div class="apex-card text-center"><p class="text-xs text-apex-muted mb-1">Leads di Forecast</p><p class="text-xl font-bold text-apex-text">${ssrInterpolate(unref(data).summary.total_leads)}</p></div><div class="apex-card text-center"><p class="text-xs text-apex-muted mb-1">Closing Rate</p><p class="${ssrRenderClass([unref(closingRate) >= 30 ? "text-emerald-400" : unref(closingRate) >= 15 ? "text-yellow-400" : "text-red-400", "text-xl font-bold"])}">${ssrInterpolate(unref(closingRate))}% </p></div></div><div class="apex-card mb-6"><h2 class="text-sm font-semibold text-apex-text mb-4">Forecast per Bulan</h2><div class="overflow-x-auto"><table class="w-full text-sm"><thead><tr class="text-xs text-apex-muted border-b border-apex-border"><th class="text-left py-2 pr-4 font-medium">Bulan</th><th class="text-right py-2 px-4 font-medium">Jumlah Lead</th><th class="text-right py-2 px-4 font-medium">Total Propose</th><th class="text-right py-2 px-4 font-medium">Weighted Value</th><th class="text-right py-2 pl-4 font-medium">Actual Won</th><th class="text-left py-2 pl-4 font-medium">Progress</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(data).monthly_forecast, (row) => {
          _push(`<tr class="border-b border-apex-border/40 hover:bg-apex-card/30 transition-colors"><td class="py-3 pr-4 font-medium text-apex-text">${ssrInterpolate(row.bulan_label)}</td><td class="py-3 px-4 text-right text-apex-muted">${ssrInterpolate(row.jumlah_lead)}</td><td class="py-3 px-4 text-right text-apex-muted">${ssrInterpolate(unref(fmt).rupiah(row.total_propose))}</td><td class="py-3 px-4 text-right font-semibold text-primary-400">${ssrInterpolate(unref(fmt).rupiah(row.total_weighted))}</td><td class="py-3 pl-4 text-right text-emerald-400 font-semibold">${ssrInterpolate(unref(fmt).rupiah(row.actual_won))}</td><td class="py-3 pl-4 w-32"><div class="h-2 bg-apex-border/30 rounded-full overflow-hidden"><div class="h-2 rounded-full bg-emerald-500 transition-all" style="${ssrRenderStyle({ width: wonPct(row) + "%" })}"></div></div><span class="text-xs text-apex-muted">${ssrInterpolate(wonPct(row))}% closed</span></td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(data).monthly_forecast.length) {
          _push(`<tr><td colspan="6" class="py-8 text-center text-apex-muted text-sm"> Belum ada lead dengan exp. close date di tahun ${ssrInterpolate(unref(selectedYear))}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6"><div class="apex-card"><h2 class="text-sm font-semibold text-apex-text mb-4">Pipeline per Sales</h2><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(data).by_sales, (s) => {
          _push(`<div class="flex items-center gap-3"><div class="w-28 text-xs text-apex-muted truncate">${ssrInterpolate(s.sales_owner)}</div><div class="flex-1"><div class="h-2 bg-apex-border/30 rounded-full overflow-hidden"><div class="h-2 bg-primary-500 rounded-full transition-all" style="${ssrRenderStyle({ width: salesBarPct(s) + "%" })}"></div></div></div><div class="text-right w-24 text-xs"><span class="text-primary-400 font-semibold">${ssrInterpolate(unref(fmt).rupiah(s.total_weighted))}</span></div><div class="text-right w-16 text-xs text-apex-muted">${ssrInterpolate(s.jumlah_lead)} lead </div></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(data).by_sales.length) {
          _push(`<p class="text-sm text-apex-muted text-center py-4"> Tidak ada data </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="apex-card"><h2 class="text-sm font-semibold text-apex-text mb-4"><i class="fa-solid fa-circle-xmark text-red-400 mr-1"></i>Analisa Loss Reason </h2><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(data).loss_analysis, (lr, i) => {
          _push(`<div class="p-3 rounded-lg bg-apex-bg border border-apex-border/40"><div class="flex items-start justify-between gap-2 mb-1"><span class="text-sm text-apex-text font-medium">${ssrInterpolate(lr.reason)}</span><span class="badge badge-red text-xs flex-shrink-0">${ssrInterpolate(lr.jumlah)}x</span></div><p class="text-xs text-red-400">Nilai hilang: ${ssrInterpolate(unref(fmt).rupiah(lr.nilai_hilang))}</p></div>`);
        });
        _push(`<!--]-->`);
        if (!unref(data).loss_analysis.length) {
          _push(`<p class="text-sm text-apex-muted text-center py-4"> Belum ada lead Lost tahun ini </p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/forecast.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=forecast-Cogb9WAt.js.map
