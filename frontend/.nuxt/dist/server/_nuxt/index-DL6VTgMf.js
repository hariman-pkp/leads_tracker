import { _ as __nuxt_component_1 } from "./AppPagination-DUr1sfAX.js";
import { defineComponent, ref, withAsyncContext, computed, unref, isRef, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderStyle, ssrRenderComponent } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import { a as useRoute } from "../server.mjs";
import { u as useAsyncData } from "./asyncData-BUVmteIW.js";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ufo/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/klona/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/perfect-debounce/dist/index.mjs";
const criticalPerPage = 5;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const route = useRoute();
    const selectedYear = ref(Number(route.query.tahun) || 0);
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "revenue-summary",
      () => get("/v1/revenue/summary", { tahun: selectedYear.value || void 0 }),
      { server: false }
    )), __temp = await __temp, __restore(), __temp);
    const statusEntries = computed(
      () => Object.entries(data.value?.by_status || {})
    );
    const criticalPage = ref(1);
    const criticalTotal = computed(() => data.value?.critical?.length ?? 0);
    const criticalPages = computed(() => Math.ceil(criticalTotal.value / criticalPerPage) || 1);
    const criticalSlice = computed(() => {
      const all = data.value?.critical ?? [];
      const start = (criticalPage.value - 1) * criticalPerPage;
      return all.slice(start, start + criticalPerPage);
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppPagination = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-chart-bar text-primary-400 mr-2"></i>Revenue Dashboard</h1><p class="page-subtitle">Monitoring revenue ${ssrInterpolate(unref(data)?.cur_year)}</p></div><div class="flex gap-2 items-center">`);
      if (unref(data)?.years?.length) {
        _push(`<select class="form-select w-28 text-xs"><!--[-->`);
        ssrRenderList(unref(data).years, (y) => {
          _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedYear)) ? ssrLooseContain(unref(selectedYear), y) : ssrLooseEqual(unref(selectedYear), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
        });
        _push(`<!--]--></select>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-secondary btn-sm"><i class="fa-solid fa-rotate"></i></button></div></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"><div class="stat-card"><div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-bullseye"></i></div><div><div class="stat-value text-sm">${ssrInterpolate(unref(fmt).rupiah(unref(data).total_target))}</div><div class="stat-label">Total Target</div></div></div><div class="stat-card"><div class="stat-icon bg-green-900/40 text-green-400"><i class="fa-solid fa-coins"></i></div><div><div class="stat-value text-sm text-green-400">${ssrInterpolate(unref(fmt).rupiah(unref(data).total_actual))}</div><div class="stat-label">Realisasi</div></div></div><div class="stat-card"><div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-percent"></i></div><div><div class="${ssrRenderClass([unref(data).ach_pct >= 80 ? "text-green-400" : unref(data).ach_pct >= 50 ? "text-yellow-400" : "text-red-400", "stat-value"])}">${ssrInterpolate(unref(data).ach_pct)}% </div><div class="stat-label">Achievement</div></div></div><div class="stat-card"><div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-folder-open"></i></div><div><div class="stat-value">${ssrInterpolate(unref(data).total_projects)}</div><div class="stat-label">Total Proyek</div></div></div></div><div class="card mb-5"><div class="flex justify-between items-center mb-2"><span class="text-sm font-medium text-gray-300">Achievement YTD</span><span class="${ssrRenderClass([unref(data).ach_pct >= 80 ? "text-green-400" : "text-red-400", "text-sm font-bold"])}">${ssrInterpolate(unref(data).ach_pct)}% </span></div><div class="progress-bar h-3"><div class="${ssrRenderClass([unref(fmt).achBgColor(unref(data).ach_pct), "progress-fill h-3"])}" style="${ssrRenderStyle(`width:${Math.min(unref(data).ach_pct, 100)}%`)}"></div></div><div class="flex justify-between text-xs text-gray-500 mt-1"><span>Rp 0</span><span>${ssrInterpolate(unref(fmt).rupiah(unref(data).total_actual))} / ${ssrInterpolate(unref(fmt).rupiah(unref(data).total_target))}</span></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5"><div class="card"><div class="section-title">Per Kategori</div><div class="space-y-4"><!--[-->`);
        ssrRenderList([
          { label: "Recurring", target: unref(data).rec_target, actual: unref(data).rec_actual },
          { label: "Project", target: unref(data).prj_target, actual: unref(data).prj_actual }
        ], (cat) => {
          _push(`<div><div class="flex justify-between text-sm mb-1"><span class="text-gray-300 font-medium">${ssrInterpolate(cat.label)}</span><span class="text-xs text-gray-400">${ssrInterpolate(unref(fmt).rupiah(cat.actual))} / ${ssrInterpolate(unref(fmt).rupiah(cat.target))}</span></div><div class="progress-bar"><div class="${ssrRenderClass([unref(fmt).achBgColor(cat.target ? cat.actual / cat.target * 100 : 0), "progress-fill"])}" style="${ssrRenderStyle(`width:${cat.target ? Math.min(cat.actual / cat.target * 100, 100) : 0}%`)}"></div></div><div class="text-xs text-gray-500 mt-0.5 text-right">${ssrInterpolate(cat.target ? (cat.actual / cat.target * 100).toFixed(1) : 0)}% </div></div>`);
        });
        _push(`<!--]--></div></div><div class="card"><div class="section-title">Status Proyek</div><div class="space-y-2.5"><!--[-->`);
        ssrRenderList(unref(statusEntries), ([status, cnt]) => {
          _push(`<div class="flex items-center gap-3"><span class="${ssrRenderClass([unref(fmt).statusClass(status), "w-24 flex-shrink-0"])}">${ssrInterpolate(status)}</span><div class="flex-1 progress-bar"><div class="progress-fill bg-primary-500" style="${ssrRenderStyle(`width:${unref(data).total_projects ? (cnt / unref(data).total_projects * 100).toFixed(0) : 0}%`)}"></div></div><span class="text-xs text-gray-300 w-6 text-right">${ssrInterpolate(cnt)}</span></div>`);
        });
        _push(`<!--]--></div></div></div>`);
        if (unref(data).critical?.length) {
          _push(`<div class="card mb-5"><div class="section-title text-red-400"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Proyek Critical / At Risk (${ssrInterpolate(unref(criticalTotal))}) </div><div class="overflow-x-auto"><table class="tbl"><thead><tr><th>Project</th><th>Client</th><th>Organisasi</th><th class="text-right">Target</th><th class="text-right">Actual</th><th>Status</th><th>Risk</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(criticalSlice), (p) => {
            _push(`<tr><td class="text-xs">${ssrInterpolate(p.project_id)}<div class="text-gray-400">${ssrInterpolate(p.product)}</div></td><td class="text-xs text-gray-300">${ssrInterpolate(p.client)}</td><td class="text-xs text-gray-400">${ssrInterpolate(p.organisasi)}</td><td class="text-right text-xs text-gray-300">${ssrInterpolate(unref(fmt).rupiah(p.revenue_target))}</td><td class="text-right text-xs text-green-300">${ssrInterpolate(unref(fmt).rupiah(p.actual_revenue))}</td><td><span class="${ssrRenderClass(unref(fmt).statusClass(p.status))}">${ssrInterpolate(p.status)}</span></td><td><span class="${ssrRenderClass(unref(fmt).riskClass(p.risk_level))}">${ssrInterpolate(p.risk_level)}</span></td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
          if (unref(criticalPages) > 1) {
            _push(ssrRenderComponent(_component_AppPagination, {
              page: unref(criticalPage),
              "onUpdate:page": ($event) => isRef(criticalPage) ? criticalPage.value = $event : null,
              "total-pages": unref(criticalPages),
              total: unref(criticalTotal),
              "per-page": criticalPerPage,
              class: "mt-3"
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="card"><div class="section-title">Monthly Trend</div><div class="overflow-x-auto"><table class="tbl"><thead><tr><th>Bulan</th><th class="text-right">Target</th><th class="text-right">Actual</th><th>Progress</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(data).monthly_trend, (m) => {
          _push(`<tr><td class="text-sm">${ssrInterpolate(m.month_name)}</td><td class="text-right text-xs text-gray-300">${ssrInterpolate(unref(fmt).rupiah(m.total_target))}</td><td class="text-right text-xs text-green-300">${ssrInterpolate(unref(fmt).rupiah(m.total_actual))}</td><td class="w-32"><div class="progress-bar"><div class="${ssrRenderClass([unref(fmt).achBgColor(m.total_target ? m.total_actual / m.total_target * 100 : 0), "progress-fill"])}" style="${ssrRenderStyle(`width:${m.total_target ? Math.min(m.total_actual / m.total_target * 100, 100) : 0}%`)}"></div></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/revenue/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=index-DL6VTgMf.js.map
