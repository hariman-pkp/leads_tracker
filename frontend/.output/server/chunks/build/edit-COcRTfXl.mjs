import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { _ as _sfc_main$1 } from './LeadForm-B-REuIY3.mjs';
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import { a as useRoute, n as navigateTo } from './server.mjs';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useAsyncData, c as clearNuxtData } from './asyncData-BUVmteIW.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import './ProductSelect-DXo4uezQ.mjs';
import './useSegmen-CyO8zV4Z.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "edit",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { get, put } = useApi();
    const loading = ref(false);
    const errMsg = ref("");
    const leadId = route.params.id;
    const { data: leadData, error: leadError } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      `lead-edit-${leadId}`,
      () => get(`/v1/pipeline/${leadId}`),
      { server: false }
    )), __temp = await __temp, __restore(), __temp);
    const { data: salesData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "sales-edit",
      () => get("/v1/master/sales").catch(() => []),
      { server: false }
    )), __temp = await __temp, __restore(), __temp);
    const salesList = computed(
      () => Array.isArray(salesData.value) ? salesData.value.map((s) => s.nama) : []
    );
    const orgList = ref([]);
    const productList = ref([]);
    async function updateLead(form) {
      var _a, _b;
      loading.value = true;
      errMsg.value = "";
      try {
        await put(`/v1/pipeline/${leadId}`, form);
        clearNuxtData(`lead-${leadId}`);
        await navigateTo(`/pipeline/${leadId}`);
      } catch (err) {
        errMsg.value = ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.detail) || ((_b = err == null ? void 0 : err.data) == null ? void 0 : _b.message) || (err == null ? void 0 : err.message) || "Gagal menyimpan perubahan.";
        console.error("[edit lead]", err);
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_LeadForm = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl" }, _attrs))}><div class="flex items-center gap-3 mb-5">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/pipeline/${unref(route).params.id}`,
        class: "btn-ghost btn-sm rounded-lg"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<i class="fa-solid fa-arrow-left"${_scopeId}></i>`);
          } else {
            return [
              createVNode("i", { class: "fa-solid fa-arrow-left" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<div><h1 class="page-title">Edit Lead</h1><p class="page-subtitle">${ssrInterpolate(((_b = (_a = unref(leadData)) == null ? void 0 : _a.lead) == null ? void 0 : _b.lead_id) || ((_c = unref(leadData)) == null ? void 0 : _c.lead_id))}</p></div></div>`);
      if (unref(errMsg)) {
        _push(`<div class="mb-4 flex items-center gap-3 bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300"><i class="fa-solid fa-circle-exclamation"></i> ${ssrInterpolate(unref(errMsg))}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(leadError)) {
        _push(`<div class="card text-center text-red-400 py-10"><i class="fa-solid fa-triangle-exclamation text-3xl mb-3"></i><div>Lead tidak ditemukan.</div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/pipeline",
          class: "btn-secondary btn-sm mt-4"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`\u2190 Kembali ke Pipeline`);
            } else {
              return [
                createTextVNode("\u2190 Kembali ke Pipeline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(leadData)) {
        _push(ssrRenderComponent(_component_LeadForm, {
          initial: (_e = (_d = unref(leadData)) == null ? void 0 : _d.lead) != null ? _e : unref(leadData),
          "sales-list": unref(salesList),
          "org-list": unref(orgList),
          "product-list": unref(productList),
          onSubmit: updateLead,
          loading: unref(loading)
        }, null, _parent));
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pipeline/[id]/edit.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=edit-COcRTfXl.mjs.map
