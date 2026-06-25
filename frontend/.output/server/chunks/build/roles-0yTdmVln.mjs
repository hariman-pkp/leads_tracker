import { defineComponent, ref, reactive, withAsyncContext, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
  __name: "roles",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const saving = ref(null);
    const toast = reactive({ show: false, msg: "", type: "success" });
    const { data: roles2, pending } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("roles-data", () => get("/v1/master/roles"), { server: false })), __temp = await __temp, __restore(), __temp);
    const { data: allMenus } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("all-menus", () => get("/v1/master/menus"), { server: false })), __temp = await __temp, __restore(), __temp);
    const roleMenus = reactive({});
    if (roles2.value) {
      [__temp, __restore] = withAsyncContext(async () => Promise.all(
        roles2.value.map(async (r) => {
          const keys = await get(`/v1/master/roles/${r.id}/menus`);
          roleMenus[r.id] = new Set(Array.isArray(keys) ? keys : []);
        })
      )), await __temp, __restore();
    }
    const menuGroups = computed(() => {
      const groups = {};
      if (!allMenus.value) return groups;
      for (const m of allMenus.value) {
        if (!groups[m.group]) groups[m.group] = [];
        groups[m.group].push(m);
      }
      return groups;
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-5xl" }, _attrs))} data-v-65ceaf71><div class="page-header" data-v-65ceaf71><div data-v-65ceaf71><h1 class="page-title" data-v-65ceaf71><i class="fa-solid fa-shield-alt text-primary-400 mr-2" data-v-65ceaf71></i>Role &amp; Menu</h1><p class="page-subtitle" data-v-65ceaf71>Kelola role dan hak akses menu</p></div></div>`);
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-green-800 border-green-600" : "bg-red-900 border-red-600", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm"])}" data-v-65ceaf71><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-green-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-65ceaf71></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20" data-v-65ceaf71><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" data-v-65ceaf71></i></div>`);
      } else {
        _push(`<div class="space-y-5" data-v-65ceaf71><!--[-->`);
        ssrRenderList(unref(roles2), (role) => {
          _push(`<div class="card" data-v-65ceaf71><div class="flex items-center justify-between mb-4" data-v-65ceaf71><div class="flex items-center gap-3" data-v-65ceaf71><span class="${ssrRenderClass([role.nama === "Admin" ? "badge-blue" : role.nama === "Manager" ? "badge-yellow" : "badge-gray", "badge"])}" data-v-65ceaf71>${ssrInterpolate(role.nama)}</span><span class="text-gray-500 text-sm" data-v-65ceaf71>${ssrInterpolate(role.deskripsi)}</span></div><button class="btn-primary btn-sm"${ssrIncludeBooleanAttr(unref(saving) === role.id) ? " disabled" : ""} data-v-65ceaf71><i class="${ssrRenderClass(unref(saving) === role.id ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-floppy-disk")}" data-v-65ceaf71></i> Simpan </button></div><!--[-->`);
          ssrRenderList(unref(menuGroups), (items, group) => {
            _push(`<div class="mb-4" data-v-65ceaf71><div class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2" data-v-65ceaf71>${ssrInterpolate(group)}</div><div class="flex flex-wrap gap-2" data-v-65ceaf71><!--[-->`);
            ssrRenderList(items, (m) => {
              var _a, _b;
              _push(`<label class="${ssrRenderClass([((_a = unref(roleMenus)[role.id]) == null ? void 0 : _a.has(m.key)) ? "border-primary-600 bg-primary-900/30 text-primary-300" : "border-navy-700 bg-navy-800/50 text-gray-500 hover:border-navy-600", "flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border text-sm transition-colors"])}" data-v-65ceaf71><input type="checkbox"${ssrIncludeBooleanAttr((_b = unref(roleMenus)[role.id]) == null ? void 0 : _b.has(m.key)) ? " checked" : ""} class="accent-primary-500" data-v-65ceaf71><i class="${ssrRenderClass(`fa-solid ${m.icon} text-xs`)}" data-v-65ceaf71></i> ${ssrInterpolate(m.label)}</label>`);
            });
            _push(`<!--]--></div></div>`);
          });
          _push(`<!--]--></div>`);
        });
        _push(`<!--]--></div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/roles.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const roles = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-65ceaf71"]]);

export { roles as default };
//# sourceMappingURL=roles-0yTdmVln.mjs.map
