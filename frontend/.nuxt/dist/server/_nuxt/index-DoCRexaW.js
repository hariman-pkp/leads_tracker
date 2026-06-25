import { _ as __nuxt_component_0 } from "./nuxt-link-CFSz172Y.js";
import { _ as __nuxt_component_1 } from "./AppPagination-DUr1sfAX.js";
import { defineComponent, reactive, ref, withAsyncContext, watch, unref, withCtx, createVNode, createTextVNode, toDisplayString, isRef, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import { u as useSegmen } from "./useSegmen-CyO8zV4Z.js";
import { u as useAsyncData } from "./asyncData-BUVmteIW.js";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
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
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const stages = ["New", "In Progress", "Demo Scheduled", "Proposal Sent", "Negotiation", "Won", "On Hold", "Lost"];
    const { segmens } = useSegmen();
    const filters = reactive({ search: "", stage: "", segmen: "", sales: "", organisasi: "", product: "" });
    const orgList = ref([]);
    const productList = ref([]);
    const salesList = ref([]);
    const toast = reactive({ show: false, msg: "", type: "success" });
    const deleting = ref(null);
    const page = ref(1);
    const perPage = ref(10);
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "pipeline",
      () => get("/v1/pipeline", { ...filters, page: page.value, per_page: perPage.value }),
      { server: false }
    )), __temp = await __temp, __restore(), __temp);
    watch([page, perPage], () => refresh());
    function isOverdue(d) {
      if (!d) return false;
      return d < (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-c422f557>`);
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-green-800 border-green-600" : "bg-red-900 border-red-600", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm"])}" data-v-c422f557><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-green-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-c422f557></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="page-header" data-v-c422f557><div data-v-c422f557><h1 class="page-title" data-v-c422f557><i class="fa-solid fa-funnel-dollar text-primary-400 mr-2" data-v-c422f557></i>Pipeline</h1><p class="page-subtitle" data-v-c422f557>${ssrInterpolate(unref(data)?.total || 0)} leads ditemukan — halaman ${ssrInterpolate(unref(data)?.page || 1)} / ${ssrInterpolate(unref(data)?.total_pages || 1)}</p></div>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/pipeline/new",
        class: "btn-primary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<i class="fa-solid fa-plus" data-v-c422f557${_scopeId}></i>Tambah Lead `);
          } else {
            return [
              createVNode("i", { class: "fa-solid fa-plus" }),
              createTextVNode("Tambah Lead ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="card mb-5" data-v-c422f557><div class="flex flex-wrap gap-3" data-v-c422f557><input${ssrRenderAttr("value", unref(filters).search)} class="form-input w-48" placeholder="🔍 Cari company..." data-v-c422f557><select class="form-select w-40" data-v-c422f557><option value="" data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).stage) ? ssrLooseContain(unref(filters).stage, "") : ssrLooseEqual(unref(filters).stage, "")) ? " selected" : ""}>Semua Stage</option><!--[-->`);
      ssrRenderList(stages, (s) => {
        _push(`<option data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).stage) ? ssrLooseContain(unref(filters).stage, null) : ssrLooseEqual(unref(filters).stage, null)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select w-40" data-v-c422f557><option value="" data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).segmen) ? ssrLooseContain(unref(filters).segmen, "") : ssrLooseEqual(unref(filters).segmen, "")) ? " selected" : ""}>Semua Segmen</option><!--[-->`);
      ssrRenderList(unref(segmens), (s) => {
        _push(`<option data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).segmen) ? ssrLooseContain(unref(filters).segmen, null) : ssrLooseEqual(unref(filters).segmen, null)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select w-40" data-v-c422f557><option value="" data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).sales) ? ssrLooseContain(unref(filters).sales, "") : ssrLooseEqual(unref(filters).sales, "")) ? " selected" : ""}>Semua Sales</option><!--[-->`);
      ssrRenderList(unref(salesList), (s) => {
        _push(`<option${ssrRenderAttr("value", s.nama)} data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).sales) ? ssrLooseContain(unref(filters).sales, s.nama) : ssrLooseEqual(unref(filters).sales, s.nama)) ? " selected" : ""}>${ssrInterpolate(s.nama)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select w-44" data-v-c422f557><option value="" data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).organisasi) ? ssrLooseContain(unref(filters).organisasi, "") : ssrLooseEqual(unref(filters).organisasi, "")) ? " selected" : ""}>Semua Organisasi</option><!--[-->`);
      ssrRenderList(unref(orgList), (o) => {
        _push(`<option${ssrRenderAttr("value", o.kode)} data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).organisasi) ? ssrLooseContain(unref(filters).organisasi, o.kode) : ssrLooseEqual(unref(filters).organisasi, o.kode)) ? " selected" : ""}>${ssrInterpolate(o.kode)} — ${ssrInterpolate(o.nama)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select w-44" data-v-c422f557><option value="" data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).product) ? ssrLooseContain(unref(filters).product, "") : ssrLooseEqual(unref(filters).product, "")) ? " selected" : ""}>Semua Produk</option><!--[-->`);
      ssrRenderList(unref(productList), (p) => {
        _push(`<option${ssrRenderAttr("value", p.nama)} data-v-c422f557${ssrIncludeBooleanAttr(Array.isArray(unref(filters).product) ? ssrLooseContain(unref(filters).product, p.nama) : ssrLooseEqual(unref(filters).product, p.nama)) ? " selected" : ""}>${ssrInterpolate(p.nama)}</option>`);
      });
      _push(`<!--]--></select><button class="btn-secondary btn-sm ml-auto" data-v-c422f557><i class="fa-solid fa-xmark" data-v-c422f557></i>Reset </button></div></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20" data-v-c422f557><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" data-v-c422f557></i></div>`);
      } else if (unref(data)?.leads?.length === 0) {
        _push(`<div class="empty-state" data-v-c422f557><i class="fa-solid fa-inbox empty-icon" data-v-c422f557></i><div class="empty-text" data-v-c422f557>Tidak ada lead ditemukan</div></div>`);
      } else {
        _push(`<div class="card overflow-x-auto" data-v-c422f557><table class="tbl" data-v-c422f557><thead data-v-c422f557><tr data-v-c422f557><th data-v-c422f557>Company</th><th data-v-c422f557>Produk</th><th data-v-c422f557>Stage</th><th data-v-c422f557>Prioritas</th><th class="text-right" data-v-c422f557>Propose Value</th><th data-v-c422f557>Sales</th><th data-v-c422f557>Organisasi</th><th data-v-c422f557>Next FU</th><th data-v-c422f557>Stale</th><th class="text-center" data-v-c422f557>Aksi</th></tr></thead><tbody data-v-c422f557><!--[-->`);
        ssrRenderList(unref(data)?.leads, (l) => {
          _push(`<tr data-v-c422f557><td data-v-c422f557>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/pipeline/${l.lead_id}`,
            class: "font-medium text-primary-300 hover:text-primary-200"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(l.nama_company)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(l.nama_company), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<div class="text-xs text-gray-500" data-v-c422f557>${ssrInterpolate(l.lead_id)}</div></td><td class="text-gray-300 max-w-32 truncate" data-v-c422f557>${ssrInterpolate(l.product || "—")}</td><td data-v-c422f557><span class="${ssrRenderClass(unref(fmt).stageClass(l.stage))}" data-v-c422f557>${ssrInterpolate(l.stage)}</span></td><td data-v-c422f557><span class="${ssrRenderClass(unref(fmt).priorityClass(l.prioritas))}" data-v-c422f557>${ssrInterpolate(l.prioritas)}</span></td><td class="text-right font-medium text-primary-200" data-v-c422f557>${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</td><td class="text-gray-400 text-xs" data-v-c422f557>${ssrInterpolate(l.sales_owner || "—")}</td><td class="text-xs" data-v-c422f557>`);
          if (l.organisasi) {
            _push(`<span class="font-mono text-primary-300 bg-navy-800 px-1.5 py-0.5 rounded text-[11px]" data-v-c422f557>${ssrInterpolate(l.organisasi)}</span>`);
          } else {
            _push(`<span class="text-gray-600" data-v-c422f557>—</span>`);
          }
          _push(`</td><td class="${ssrRenderClass([isOverdue(l.next_fu_date) ? "text-red-400" : "text-gray-400", "text-xs"])}" data-v-c422f557>${ssrInterpolate(unref(fmt).tgl(l.next_fu_date))}</td><td data-v-c422f557>`);
          if (l.stale_flag && l.stale_flag !== "OK") {
            _push(`<span class="${ssrRenderClass([unref(fmt).staleClass(l.stale_flag), "text-xs"])}" data-v-c422f557>${ssrInterpolate(l.stale_flag)}</span>`);
          } else {
            _push(`<span class="text-gray-600 text-xs" data-v-c422f557>—</span>`);
          }
          _push(`</td><td class="text-center" data-v-c422f557><div class="flex items-center justify-center gap-1" data-v-c422f557>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/pipeline/${l.lead_id}`,
            class: "btn-ghost btn-xs rounded",
            title: "Detail"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<i class="fa-solid fa-eye text-xs" data-v-c422f557${_scopeId}></i>`);
              } else {
                return [
                  createVNode("i", { class: "fa-solid fa-eye text-xs" })
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/pipeline/${l.lead_id}/edit`,
            class: "btn-ghost btn-xs rounded",
            title: "Edit"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<i class="fa-solid fa-pen text-xs" data-v-c422f557${_scopeId}></i>`);
              } else {
                return [
                  createVNode("i", { class: "fa-solid fa-pen text-xs" })
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<button${ssrIncludeBooleanAttr(unref(deleting) === l.lead_id) ? " disabled" : ""} class="btn-ghost btn-xs rounded text-red-400 hover:text-red-300 disabled:opacity-50" title="Hapus" data-v-c422f557><i class="${ssrRenderClass([unref(deleting) === l.lead_id ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-trash", "text-xs"])}" data-v-c422f557></i></button></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pipeline/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c422f557"]]);
export {
  index as default
};
//# sourceMappingURL=index-DoCRexaW.js.map
