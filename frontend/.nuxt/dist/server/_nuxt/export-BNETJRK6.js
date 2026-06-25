import { defineComponent, computed, ref, reactive, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderAttr, ssrInterpolate, ssrRenderClass } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useAuthStore } from "../server.mjs";
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
  __name: "export",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const auth = useAuthStore();
    computed(() => auth.token);
    const curYear = (/* @__PURE__ */ new Date()).getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => curYear - i);
    const stages = ["New", "In Progress", "Prospect", "Qualified", "Proposal", "Proposal Sent", "Negotiation", "On Hold", "Won", "Lost"];
    const salesList = ref([]);
    const pipeFilter = reactive({ stage: "", sales: "" });
    const reportFilter = reactive({ month: (/* @__PURE__ */ new Date()).toISOString().slice(0, 7), sales: "" });
    const analyticsFilter = reactive({ tahun: curYear });
    const downloading = reactive({
      pipeline: false,
      pipelinePdf: false,
      reports: false,
      reportsPdf: false,
      analytics: false,
      analyticsPdf: false
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-apex-bg text-apex-text p-6" }, _attrs))}><div class="mb-6"><h1 class="text-2xl font-bold text-apex-text"><i class="fa-solid fa-file-arrow-down text-emerald-400 mr-2"></i>Export Data </h1><p class="text-sm text-apex-muted mt-0.5">Download data ke format CSV yang dapat dibuka di Excel</p></div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"><div class="apex-card"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-xl bg-primary-900/50 flex items-center justify-center text-primary-400"><i class="fa-solid fa-funnel-dollar text-lg"></i></div><div><h2 class="font-semibold text-apex-text">Pipeline</h2><p class="text-xs text-apex-muted">Semua leads beserta status &amp; nilai</p></div></div><div class="space-y-3 mb-4"><div><label class="text-xs text-apex-muted mb-1 block">Filter Stage</label><select class="form-select text-sm w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(pipeFilter).stage) ? ssrLooseContain(unref(pipeFilter).stage, "") : ssrLooseEqual(unref(pipeFilter).stage, "")) ? " selected" : ""}>Semua Stage</option><!--[-->`);
      ssrRenderList(stages, (s) => {
        _push(`<option${ssrRenderAttr("value", s)}${ssrIncludeBooleanAttr(Array.isArray(unref(pipeFilter).stage) ? ssrLooseContain(unref(pipeFilter).stage, s) : ssrLooseEqual(unref(pipeFilter).stage, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="text-xs text-apex-muted mb-1 block">Filter Sales</label><select class="form-select text-sm w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(pipeFilter).sales) ? ssrLooseContain(unref(pipeFilter).sales, "") : ssrLooseEqual(unref(pipeFilter).sales, "")) ? " selected" : ""}>Semua Sales</option><!--[-->`);
      ssrRenderList(unref(salesList), (s) => {
        _push(`<option${ssrRenderAttr("value", s)}${ssrIncludeBooleanAttr(Array.isArray(unref(pipeFilter).sales) ? ssrLooseContain(unref(pipeFilter).sales, s) : ssrLooseEqual(unref(pipeFilter).sales, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(downloading).pipeline) ? " disabled" : ""} class="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"><i class="${ssrRenderClass(unref(downloading).pipeline ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-file-csv")}"></i> ${ssrInterpolate(unref(downloading).pipeline ? "Menyiapkan..." : "CSV")}</button><button${ssrIncludeBooleanAttr(unref(downloading).pipelinePdf) ? " disabled" : ""} class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"><i class="${ssrRenderClass(unref(downloading).pipelinePdf ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-file-pdf")}"></i> ${ssrInterpolate(unref(downloading).pipelinePdf ? "Menyiapkan..." : "PDF")}</button></div></div><div class="apex-card"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-xl bg-blue-900/50 flex items-center justify-center text-blue-400"><i class="fa-solid fa-clipboard-list text-lg"></i></div><div><h2 class="font-semibold text-apex-text">Laporan Harian</h2><p class="text-xs text-apex-muted">Laporan harian sales per bulan</p></div></div><div class="space-y-3 mb-4"><div><label class="text-xs text-apex-muted mb-1 block">Bulan</label><input${ssrRenderAttr("value", unref(reportFilter).month)} type="month" class="form-input text-sm w-full"></div><div><label class="text-xs text-apex-muted mb-1 block">Filter Sales</label><select class="form-select text-sm w-full"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(reportFilter).sales) ? ssrLooseContain(unref(reportFilter).sales, "") : ssrLooseEqual(unref(reportFilter).sales, "")) ? " selected" : ""}>Semua Sales</option><!--[-->`);
      ssrRenderList(unref(salesList), (s) => {
        _push(`<option${ssrRenderAttr("value", s)}${ssrIncludeBooleanAttr(Array.isArray(unref(reportFilter).sales) ? ssrLooseContain(unref(reportFilter).sales, s) : ssrLooseEqual(unref(reportFilter).sales, s)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select></div></div><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(downloading).reports) ? " disabled" : ""} class="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"><i class="${ssrRenderClass(unref(downloading).reports ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-file-csv")}"></i> ${ssrInterpolate(unref(downloading).reports ? "Menyiapkan..." : "CSV")}</button><button${ssrIncludeBooleanAttr(unref(downloading).reportsPdf) ? " disabled" : ""} class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"><i class="${ssrRenderClass(unref(downloading).reportsPdf ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-file-pdf")}"></i> ${ssrInterpolate(unref(downloading).reportsPdf ? "Menyiapkan..." : "PDF")}</button></div></div><div class="apex-card"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-xl bg-yellow-900/50 flex items-center justify-center text-yellow-400"><i class="fa-solid fa-chart-bar text-lg"></i></div><div><h2 class="font-semibold text-apex-text">Analytics per Sales</h2><p class="text-xs text-apex-muted">Ringkasan kinerja setiap sales per tahun</p></div></div><div class="space-y-3 mb-4"><div><label class="text-xs text-apex-muted mb-1 block">Tahun</label><select class="form-select text-sm w-full"><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(analyticsFilter).tahun) ? ssrLooseContain(unref(analyticsFilter).tahun, y) : ssrLooseEqual(unref(analyticsFilter).tahun, y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select></div><div class="h-[60px] flex items-center"><p class="text-xs text-apex-muted">Kolom: Sales, Total Leads, Won, Lost, Total Deal, Win Rate, Avg Probability</p></div></div><div class="flex gap-2"><button${ssrIncludeBooleanAttr(unref(downloading).analytics) ? " disabled" : ""} class="btn-primary flex-1 flex items-center justify-center gap-2 text-sm"><i class="${ssrRenderClass(unref(downloading).analytics ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-file-csv")}"></i> ${ssrInterpolate(unref(downloading).analytics ? "Menyiapkan..." : "CSV")}</button><button${ssrIncludeBooleanAttr(unref(downloading).analyticsPdf) ? " disabled" : ""} class="btn-secondary flex-1 flex items-center justify-center gap-2 text-sm"><i class="${ssrRenderClass(unref(downloading).analyticsPdf ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-file-pdf")}"></i> ${ssrInterpolate(unref(downloading).analyticsPdf ? "Menyiapkan..." : "PDF")}</button></div></div></div><div class="mt-6 p-4 rounded-xl border border-blue-500/30 bg-blue-900/10 text-sm text-blue-300"><i class="fa-solid fa-circle-info mr-2"></i><strong>CSV</strong> — dapat dibuka di Microsoft Excel (pilih encoding UTF-8 saat import). <strong class="ml-3">PDF</strong> — format landscape A4, siap cetak atau kirim via email. </div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/export.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=export-BNETJRK6.js.map
