import { _ as __nuxt_component_0 } from "./nuxt-link-CFSz172Y.js";
import { _ as _sfc_main$1 } from "./LeadForm-B-REuIY3.js";
import { defineComponent, ref, withAsyncContext, computed, mergeProps, withCtx, createVNode, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useAsyncData } from "./asyncData-BUVmteIW.js";
import { n as navigateTo } from "../server.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ufo/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/defu/dist/defu.mjs";
import "./ProductSelect-DXo4uezQ.js";
import "./useSegmen-CyO8zV4Z.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/perfect-debounce/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/h3/dist/index.mjs";
import "pinia";
import "vue-router";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/klona/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "new",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get, post } = useApi();
    const loading = ref(false);
    const errMsg = ref("");
    const { data: salesData } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "sales-new",
      () => get("/v1/master/sales").catch(() => []),
      { server: false }
    )), __temp = await __temp, __restore(), __temp);
    const salesList = computed(
      () => Array.isArray(salesData.value) ? salesData.value.map((s) => s.nama) : []
    );
    const orgList = ref([]);
    const productList = ref([]);
    async function createLead(form) {
      loading.value = true;
      errMsg.value = "";
      try {
        await post("/v1/pipeline", form);
        await navigateTo("/pipeline");
      } catch (err) {
        errMsg.value = err?.data?.detail || err?.data?.message || err?.message || "Gagal membuat lead.";
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_LeadForm = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-2xl" }, _attrs))}><div class="flex items-center gap-3 mb-5">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/pipeline",
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
      _push(`<div><h1 class="page-title">Tambah Lead Baru</h1><p class="page-subtitle">Isi informasi lead pipeline</p></div></div>`);
      if (unref(errMsg)) {
        _push(`<div class="mb-4 flex items-center gap-3 bg-red-900/50 border border-red-700 rounded-lg px-4 py-3 text-sm text-red-300"><i class="fa-solid fa-circle-exclamation"></i> ${ssrInterpolate(unref(errMsg))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(ssrRenderComponent(_component_LeadForm, {
        "sales-list": unref(salesList),
        "org-list": unref(orgList),
        "product-list": unref(productList),
        onSubmit: createLead,
        loading: unref(loading)
      }, null, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pipeline/new.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=new-CnQrZfO2.js.map
