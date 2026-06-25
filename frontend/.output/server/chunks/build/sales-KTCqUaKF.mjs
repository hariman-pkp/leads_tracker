import { _ as _sfc_main$1 } from './NumericInput-CpnBtvaB.mjs';
import { defineComponent, ref, reactive, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderComponent } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useAsyncData } from './asyncData-BUVmteIW.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
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
  __name: "sales",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const editing = ref(null);
    const saving = ref(false);
    const editForm = reactive({ nama: "", email: "", role_id: 3, is_active: 1, entertain_limit: 0 });
    function fmtRupiah(v) {
      return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(v);
    }
    const toast = reactive({ show: false, msg: "", type: "success" });
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("sales-master", () => get("/v1/master/sales"), { server: false })), __temp = await __temp, __restore(), __temp);
    const { data: roles } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("roles-list", () => get("/v1/master/roles"), { server: false })), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NumericInput = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-4xl" }, _attrs))} data-v-c067895b><div class="page-header" data-v-c067895b><div data-v-c067895b><h1 class="page-title" data-v-c067895b><i class="fa-solid fa-users text-primary-400 mr-2" data-v-c067895b></i>Master Sales</h1><p class="page-subtitle" data-v-c067895b>Daftar user sales &amp; manager</p></div></div>`);
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-green-800 border-green-600" : "bg-red-900 border-red-600", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm"])}" data-v-c067895b><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-green-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-c067895b></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20" data-v-c067895b><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" data-v-c067895b></i></div>`);
      } else {
        _push(`<div class="card overflow-x-auto" data-v-c067895b><table class="tbl" data-v-c067895b><thead data-v-c067895b><tr data-v-c067895b><th data-v-c067895b>Nama</th><th data-v-c067895b>Email</th><th data-v-c067895b>Role</th><th class="text-center" data-v-c067895b>Status</th><th class="text-right" data-v-c067895b>Limit Entertain/Bln</th><th class="text-center" data-v-c067895b>Aksi</th></tr></thead><tbody data-v-c067895b><!--[-->`);
        ssrRenderList(unref(data), (u) => {
          _push(`<tr data-v-c067895b>`);
          if (unref(editing) === u.id) {
            _push(`<!--[--><td data-v-c067895b><input${ssrRenderAttr("value", unref(editForm).nama)} class="form-input py-1 text-sm" data-v-c067895b></td><td data-v-c067895b><input${ssrRenderAttr("value", unref(editForm).email)} class="form-input py-1 text-sm" data-v-c067895b></td><td data-v-c067895b><select class="form-select py-1 text-sm" data-v-c067895b><!--[-->`);
            ssrRenderList(unref(roles), (r) => {
              _push(`<option${ssrRenderAttr("value", r.id)} data-v-c067895b${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).role_id) ? ssrLooseContain(unref(editForm).role_id, r.id) : ssrLooseEqual(unref(editForm).role_id, r.id)) ? " selected" : ""}>${ssrInterpolate(r.nama)}</option>`);
            });
            _push(`<!--]--></select></td><td class="text-center" data-v-c067895b><select class="form-select py-1 text-sm w-24" data-v-c067895b><option${ssrRenderAttr("value", 1)} data-v-c067895b${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).is_active) ? ssrLooseContain(unref(editForm).is_active, 1) : ssrLooseEqual(unref(editForm).is_active, 1)) ? " selected" : ""}>Aktif</option><option${ssrRenderAttr("value", 0)} data-v-c067895b${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).is_active) ? ssrLooseContain(unref(editForm).is_active, 0) : ssrLooseEqual(unref(editForm).is_active, 0)) ? " selected" : ""}>Nonaktif</option></select></td><td class="text-right" data-v-c067895b>`);
            _push(ssrRenderComponent(_component_NumericInput, {
              modelValue: unref(editForm).entertain_limit,
              "onUpdate:modelValue": ($event) => unref(editForm).entertain_limit = $event,
              class: "form-input py-1 text-sm w-36 text-right"
            }, null, _parent));
            _push(`</td><td class="text-center" data-v-c067895b><div class="flex justify-center gap-1" data-v-c067895b><button class="btn-primary btn-xs rounded"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-c067895b><i class="${ssrRenderClass(unref(saving) ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-check")}" data-v-c067895b></i></button><button class="btn-secondary btn-xs rounded" data-v-c067895b><i class="fa-solid fa-xmark" data-v-c067895b></i></button></div></td><!--]-->`);
          } else {
            _push(`<!--[--><td class="font-medium text-gray-200" data-v-c067895b>${ssrInterpolate(u.nama)}</td><td class="text-gray-400 text-sm" data-v-c067895b>${ssrInterpolate(u.email)}</td><td data-v-c067895b><span class="${ssrRenderClass([u.role_nama === "Admin" ? "badge-blue" : u.role_nama === "Manager" ? "badge-yellow" : "badge-gray", "badge"])}" data-v-c067895b>${ssrInterpolate(u.role_nama)}</span></td><td class="text-center" data-v-c067895b><span class="${ssrRenderClass(u.is_active ? "badge badge-green" : "badge badge-red")}" data-v-c067895b>${ssrInterpolate(u.is_active ? "Aktif" : "Nonaktif")}</span></td><td class="text-right text-sm text-gray-400" data-v-c067895b>${ssrInterpolate(u.entertain_limit > 0 ? fmtRupiah(u.entertain_limit) : "\u2014")}</td><td class="text-center" data-v-c067895b><button class="btn-ghost btn-xs rounded" title="Edit" data-v-c067895b><i class="fa-solid fa-pen text-xs" data-v-c067895b></i></button></td><!--]-->`);
          }
          _push(`</tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/sales.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const sales = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c067895b"]]);

export { sales as default };
//# sourceMappingURL=sales-KTCqUaKF.mjs.map
