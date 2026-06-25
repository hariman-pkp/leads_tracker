import { _ as __nuxt_component_0 } from "./nuxt-link-CFSz172Y.js";
import { _ as __nuxt_component_1 } from "./AppPagination-DUr1sfAX.js";
import { defineComponent, ref, withAsyncContext, unref, withCtx, createTextVNode, toDisplayString, isRef, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderComponent, ssrRenderClass } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import { u as useAsyncData } from "./asyncData-BUVmteIW.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ufo/dist/index.mjs";
import "../server.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/klona/dist/index.mjs";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "followup",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const search = ref("");
    const leadFilter = ref("");
    const page = ref(1);
    const perPage = ref(10);
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "followup",
      () => get("/v1/followup", { search: search.value, lead_id: leadFilter.value, page: page.value, per_page: perPage.value }),
      { server: false, watch: [leadFilter, page, perPage] }
    )), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-phone-alt text-primary-400 mr-2"></i>Follow-Up Log</h1><p class="page-subtitle">${ssrInterpolate(unref(data)?.total || 0)} catatan — halaman ${ssrInterpolate(unref(data)?.page || 1)} / ${ssrInterpolate(unref(data)?.total_pages || 1)}</p></div></div><div class="card mb-5 flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} class="form-input w-48" placeholder="🔍 Cari company/catatan..."><select class="form-select w-52 text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(leadFilter)) ? ssrLooseContain(unref(leadFilter), "") : ssrLooseEqual(unref(leadFilter), "")) ? " selected" : ""}>Semua Lead</option><!--[-->`);
      ssrRenderList(unref(data)?.leads || [], (l) => {
        _push(`<option${ssrRenderAttr("value", l.lead_id)}${ssrIncludeBooleanAttr(Array.isArray(unref(leadFilter)) ? ssrLooseContain(unref(leadFilter), l.lead_id) : ssrLooseEqual(unref(leadFilter), l.lead_id)) ? " selected" : ""}>${ssrInterpolate(l.lead_id)} — ${ssrInterpolate(l.nama_company)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-16"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (!unref(data)?.logs?.length) {
        _push(`<div class="empty-state"><i class="fa-solid fa-phone-slash empty-icon"></i><div class="empty-text">Belum ada log FU</div></div>`);
      } else {
        _push(`<div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(data).logs, (log) => {
          _push(`<div class="card-sm flex gap-4"><div class="flex-shrink-0 text-center w-14"><div class="text-xs font-mono text-gray-400">${ssrInterpolate(log.fu_id)}</div><div class="text-xs text-gray-500 mt-1">${ssrInterpolate(unref(fmt).tgl(log.tgl_fu))}</div></div><div class="flex-1 min-w-0"><div class="flex items-center gap-2 flex-wrap mb-1">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/pipeline/${log.lead_id}`,
            class: "text-sm font-medium text-primary-300 hover:text-primary-200"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(log.nama_company)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(log.nama_company), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="badge-blue text-xs">${ssrInterpolate(log.metode_fu)}</span><span class="${ssrRenderClass([log.hasil_fu === "Interested" ? "badge-green" : "badge-gray", "text-xs"])}">${ssrInterpolate(log.hasil_fu)}</span>`);
          if (log.stage_saat_fu) {
            _push(`<span class="badge-purple text-xs">${ssrInterpolate(log.stage_saat_fu)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (log.catatan_fu) {
            _push(`<p class="text-sm text-gray-300">${ssrInterpolate(log.catatan_fu)}</p>`);
          } else {
            _push(`<!---->`);
          }
          if (log.tgl_fu_berikut) {
            _push(`<div class="text-xs text-yellow-400 mt-1"><i class="fa-solid fa-calendar-check mr-1"></i>Next FU: ${ssrInterpolate(unref(fmt).tgl(log.tgl_fu_berikut))}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="flex-shrink-0 text-xs text-gray-500">${ssrInterpolate(log.sales_owner)}</div></div>`);
        });
        _push(`<!--]-->`);
        _push(ssrRenderComponent(_component_AppPagination, {
          page: unref(page),
          "onUpdate:page": ($event) => isRef(page) ? page.value = $event : null,
          "per-page": unref(perPage),
          "onUpdate:perPage": ($event) => isRef(perPage) ? perPage.value = $event : null,
          total: unref(data)?.total ?? 0,
          "total-pages": unref(data)?.total_pages ?? 1,
          "per-page-options": [10, 25, 50, 100]
        }, null, _parent));
        _push(`</div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/followup.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=followup-DqgMjgRI.js.map
