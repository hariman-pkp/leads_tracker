import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { _ as __nuxt_component_1 } from './AppPagination-DUr1sfAX.mjs';
import { defineComponent, ref, withAsyncContext, unref, withCtx, createTextVNode, toDisplayString, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
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
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-phone-alt text-primary-400 mr-2"></i>Follow-Up Log</h1><p class="page-subtitle">${ssrInterpolate(((_a = unref(data)) == null ? void 0 : _a.total) || 0)} catatan \u2014 halaman ${ssrInterpolate(((_b = unref(data)) == null ? void 0 : _b.page) || 1)} / ${ssrInterpolate(((_c = unref(data)) == null ? void 0 : _c.total_pages) || 1)}</p></div></div><div class="card mb-5 flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(search))} class="form-input w-48" placeholder="\u{1F50D} Cari company/catatan..."><select class="form-select w-52 text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(leadFilter)) ? ssrLooseContain(unref(leadFilter), "") : ssrLooseEqual(unref(leadFilter), "")) ? " selected" : ""}>Semua Lead</option><!--[-->`);
      ssrRenderList(((_d = unref(data)) == null ? void 0 : _d.leads) || [], (l) => {
        _push(`<option${ssrRenderAttr("value", l.lead_id)}${ssrIncludeBooleanAttr(Array.isArray(unref(leadFilter)) ? ssrLooseContain(unref(leadFilter), l.lead_id) : ssrLooseEqual(unref(leadFilter), l.lead_id)) ? " selected" : ""}>${ssrInterpolate(l.lead_id)} \u2014 ${ssrInterpolate(l.nama_company)}</option>`);
      });
      _push(`<!--]--></select></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-16"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (!((_f = (_e = unref(data)) == null ? void 0 : _e.logs) == null ? void 0 : _f.length)) {
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
          total: (_h = (_g = unref(data)) == null ? void 0 : _g.total) != null ? _h : 0,
          "total-pages": (_j = (_i = unref(data)) == null ? void 0 : _i.total_pages) != null ? _j : 1,
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

export { _sfc_main as default };
//# sourceMappingURL=followup-DqgMjgRI.mjs.map
