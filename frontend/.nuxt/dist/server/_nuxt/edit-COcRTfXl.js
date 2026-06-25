import { _ as __nuxt_component_0 } from "./nuxt-link-CFSz172Y.js";
import { _ as _sfc_main$1 } from "./LeadForm-B-REuIY3.js";
import { defineComponent, ref, withAsyncContext, computed, mergeProps, unref, withCtx, createVNode, createTextVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { a as useRoute, n as navigateTo } from "../server.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useAsyncData, c as clearNuxtData } from "./asyncData-BUVmteIW.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ufo/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/defu/dist/defu.mjs";
import "./ProductSelect-DXo4uezQ.js";
import "./useSegmen-CyO8zV4Z.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/h3/dist/index.mjs";
import "pinia";
import "vue-router";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/klona/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/perfect-debounce/dist/index.mjs";
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
      loading.value = true;
      errMsg.value = "";
      try {
        await put(`/v1/pipeline/${leadId}`, form);
        clearNuxtData(`lead-${leadId}`);
        await navigateTo(`/pipeline/${leadId}`);
      } catch (err) {
        errMsg.value = err?.data?.detail || err?.data?.message || err?.message || "Gagal menyimpan perubahan.";
        console.error("[edit lead]", err);
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
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
      _push(`<div><h1 class="page-title">Edit Lead</h1><p class="page-subtitle">${ssrInterpolate(unref(leadData)?.lead?.lead_id || unref(leadData)?.lead_id)}</p></div></div>`);
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
              _push2(`← Kembali ke Pipeline`);
            } else {
              return [
                createTextVNode("← Kembali ke Pipeline")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
      } else if (unref(leadData)) {
        _push(ssrRenderComponent(_component_LeadForm, {
          initial: unref(leadData)?.lead ?? unref(leadData),
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
export {
  _sfc_main as default
};
//# sourceMappingURL=edit-COcRTfXl.js.map
