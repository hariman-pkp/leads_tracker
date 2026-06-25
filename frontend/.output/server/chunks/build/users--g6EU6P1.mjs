import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { defineComponent, ref, reactive, withAsyncContext, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderComponent } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useAsyncData } from './asyncData-BUVmteIW.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "users",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const editing = ref(null);
    const saving = ref(false);
    const deleting = ref(null);
    const togglingId = ref(null);
    const showAdd = ref(false);
    const addErr = ref("");
    const toast = reactive({ show: false, msg: "", type: "success" });
    const editForm = reactive({ nama: "", email: "", role_id: 3, is_active: 1, password: "" });
    const addForm = reactive({ nama: "", email: "", password: "", role_id: 3 });
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("users-master", () => get("/v1/master/users"), { server: false })), __temp = await __temp, __restore(), __temp);
    const { data: roles } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("roles-for-users", () => get("/v1/master/roles"), { server: false })), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-6xl" }, _attrs))} data-v-dbe4e19d><div class="page-header" data-v-dbe4e19d><div data-v-dbe4e19d><h1 class="page-title" data-v-dbe4e19d><i class="fa-solid fa-user-cog text-primary-400 mr-2" data-v-dbe4e19d></i>Master Users</h1><p class="page-subtitle" data-v-dbe4e19d>${ssrInterpolate(((_a = unref(data)) == null ? void 0 : _a.length) || 0)} user terdaftar</p></div><button class="btn-primary" data-v-dbe4e19d><i class="fa-solid fa-plus" data-v-dbe4e19d></i>Tambah User </button></div>`);
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-green-800 border-green-600" : "bg-red-900 border-red-600", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm"])}" data-v-dbe4e19d><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-green-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-dbe4e19d></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showAdd)) {
        _push(`<div class="fixed inset-0 z-40 flex items-center justify-center bg-black/60" data-v-dbe4e19d><div class="bg-navy-900 border border-navy-700 rounded-xl p-6 w-full max-w-md shadow-2xl" data-v-dbe4e19d><h2 class="text-lg font-semibold text-gray-100 mb-4" data-v-dbe4e19d>Tambah User Baru</h2><div class="space-y-3" data-v-dbe4e19d><div data-v-dbe4e19d><label class="form-label" data-v-dbe4e19d>Nama</label><input${ssrRenderAttr("value", unref(addForm).nama)} class="form-input" placeholder="Nama lengkap" data-v-dbe4e19d></div><div data-v-dbe4e19d><label class="form-label" data-v-dbe4e19d>Email</label><input${ssrRenderAttr("value", unref(addForm).email)} type="email" class="form-input" placeholder="email@pkp.co.id" data-v-dbe4e19d></div><div data-v-dbe4e19d><label class="form-label" data-v-dbe4e19d>Password</label><input${ssrRenderAttr("value", unref(addForm).password)} type="password" class="form-input" placeholder="Min. 6 karakter" data-v-dbe4e19d></div><div data-v-dbe4e19d><label class="form-label" data-v-dbe4e19d>Role</label><select class="form-select" data-v-dbe4e19d><!--[-->`);
        ssrRenderList(unref(roles), (r) => {
          _push(`<option${ssrRenderAttr("value", r.id)} data-v-dbe4e19d${ssrIncludeBooleanAttr(Array.isArray(unref(addForm).role_id) ? ssrLooseContain(unref(addForm).role_id, r.id) : ssrLooseEqual(unref(addForm).role_id, r.id)) ? " selected" : ""}>${ssrInterpolate(r.nama)}</option>`);
        });
        _push(`<!--]--></select></div>`);
        if (unref(addErr)) {
          _push(`<div class="text-red-400 text-sm" data-v-dbe4e19d>${ssrInterpolate(unref(addErr))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex gap-3 mt-5 justify-end" data-v-dbe4e19d><button class="btn-secondary" data-v-dbe4e19d>Batal</button><button class="btn-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-dbe4e19d><i class="${ssrRenderClass(unref(saving) ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-plus")}" data-v-dbe4e19d></i> Simpan </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20" data-v-dbe4e19d><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" data-v-dbe4e19d></i></div>`);
      } else {
        _push(`<div class="card overflow-x-auto" data-v-dbe4e19d><table class="tbl" data-v-dbe4e19d><thead data-v-dbe4e19d><tr data-v-dbe4e19d><th data-v-dbe4e19d>Nama</th><th data-v-dbe4e19d>Email</th><th data-v-dbe4e19d>Role</th><th class="text-center" data-v-dbe4e19d>Status</th><th class="text-center" data-v-dbe4e19d><div class="flex items-center justify-center gap-1" data-v-dbe4e19d><i class="fa-solid fa-location-dot text-primary-400" data-v-dbe4e19d></i> Location Tracking </div></th><th class="text-center" data-v-dbe4e19d>Reset Password</th><th class="text-center" data-v-dbe4e19d>Aksi</th></tr></thead><tbody data-v-dbe4e19d><!--[-->`);
        ssrRenderList(unref(data), (u) => {
          _push(`<tr data-v-dbe4e19d>`);
          if (unref(editing) === u.id) {
            _push(`<!--[--><td data-v-dbe4e19d><input${ssrRenderAttr("value", unref(editForm).nama)} class="form-input py-1 text-sm" data-v-dbe4e19d></td><td data-v-dbe4e19d><input${ssrRenderAttr("value", unref(editForm).email)} class="form-input py-1 text-sm" data-v-dbe4e19d></td><td data-v-dbe4e19d><select class="form-select py-1 text-sm" data-v-dbe4e19d><!--[-->`);
            ssrRenderList(unref(roles), (r) => {
              _push(`<option${ssrRenderAttr("value", r.id)} data-v-dbe4e19d${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).role_id) ? ssrLooseContain(unref(editForm).role_id, r.id) : ssrLooseEqual(unref(editForm).role_id, r.id)) ? " selected" : ""}>${ssrInterpolate(r.nama)}</option>`);
            });
            _push(`<!--]--></select></td><td class="text-center" data-v-dbe4e19d><select class="form-select py-1 text-sm w-24" data-v-dbe4e19d><option${ssrRenderAttr("value", 1)} data-v-dbe4e19d${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).is_active) ? ssrLooseContain(unref(editForm).is_active, 1) : ssrLooseEqual(unref(editForm).is_active, 1)) ? " selected" : ""}>Aktif</option><option${ssrRenderAttr("value", 0)} data-v-dbe4e19d${ssrIncludeBooleanAttr(Array.isArray(unref(editForm).is_active) ? ssrLooseContain(unref(editForm).is_active, 0) : ssrLooseEqual(unref(editForm).is_active, 0)) ? " selected" : ""}>Nonaktif</option></select></td><td class="text-center" data-v-dbe4e19d><span class="text-gray-500 text-xs" data-v-dbe4e19d>via toggle</span></td><td class="text-center" data-v-dbe4e19d><input${ssrRenderAttr("value", unref(editForm).password)} type="password" class="form-input py-1 text-sm" placeholder="Kosongkan jika tidak diubah" data-v-dbe4e19d></td><td class="text-center" data-v-dbe4e19d><div class="flex justify-center gap-1" data-v-dbe4e19d><button class="btn-primary btn-xs rounded"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} data-v-dbe4e19d><i class="${ssrRenderClass(unref(saving) ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-check")}" data-v-dbe4e19d></i></button><button class="btn-secondary btn-xs rounded" data-v-dbe4e19d><i class="fa-solid fa-xmark" data-v-dbe4e19d></i></button></div></td><!--]-->`);
          } else {
            _push(`<!--[--><td class="font-medium text-gray-200" data-v-dbe4e19d>${ssrInterpolate(u.nama)}</td><td class="text-gray-400 text-sm" data-v-dbe4e19d>${ssrInterpolate(u.email)}</td><td data-v-dbe4e19d><span class="${ssrRenderClass([u.role_nama === "Admin" ? "badge-blue" : u.role_nama === "Manager" ? "badge-yellow" : "badge-gray", "badge"])}" data-v-dbe4e19d>${ssrInterpolate(u.role_nama)}</span></td><td class="text-center" data-v-dbe4e19d><span class="${ssrRenderClass(u.is_active ? "badge badge-green" : "badge badge-red")}" data-v-dbe4e19d>${ssrInterpolate(u.is_active ? "Aktif" : "Nonaktif")}</span></td><td class="text-center" data-v-dbe4e19d><button${ssrIncludeBooleanAttr(unref(togglingId) === u.id) ? " disabled" : ""}${ssrRenderAttr("title", u.location_tracking_enabled ? "Klik untuk menonaktifkan tracking" : "Klik untuk mengaktifkan tracking")} class="${ssrRenderClass([u.location_tracking_enabled ? "tracking-on" : "tracking-off", "tracking-toggle"])}" data-v-dbe4e19d>`);
            if (unref(togglingId) === u.id) {
              _push(`<i class="fa-solid fa-circle-notch fa-spin text-xs" data-v-dbe4e19d></i>`);
            } else {
              _push(`<!--[--><i class="${ssrRenderClass([u.location_tracking_enabled ? "fa-solid fa-location-dot" : "fa-solid fa-location-slash", "text-xs mr-1"])}" data-v-dbe4e19d></i> ${ssrInterpolate(u.location_tracking_enabled ? "ON" : "OFF")}<!--]-->`);
            }
            _push(`</button></td><td class="text-center text-gray-600 text-xs" data-v-dbe4e19d>\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022</td><td class="text-center" data-v-dbe4e19d><div class="flex justify-center gap-1" data-v-dbe4e19d><button class="btn-ghost btn-xs rounded" title="Edit" data-v-dbe4e19d><i class="fa-solid fa-pen text-xs" data-v-dbe4e19d></i></button><button class="btn-ghost btn-xs rounded text-red-400 hover:text-red-300" title="Hapus"${ssrIncludeBooleanAttr(unref(deleting) === u.id) ? " disabled" : ""} data-v-dbe4e19d><i class="${ssrRenderClass([unref(deleting) === u.id ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-trash", "text-xs"])}" data-v-dbe4e19d></i></button></div></td><!--]-->`);
          }
          _push(`</tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      _push(`<div class="mt-4 p-4 rounded-xl bg-navy-900 border border-navy-700 flex gap-3 text-sm text-gray-400" data-v-dbe4e19d><i class="fa-solid fa-circle-info text-primary-400 mt-0.5 flex-shrink-0" data-v-dbe4e19d></i><div data-v-dbe4e19d><span class="font-medium text-gray-300" data-v-dbe4e19d>Location Tracking</span> mengontrol apakah mobile app sales mengirimkan posisi GPS ke server secara real-time. Saat <span class="text-emerald-400 font-medium" data-v-dbe4e19d>ON</span>, posisi dikirim setiap 5 menit saat aplikasi aktif dan dapat dipantau melalui halaman `);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/field-monitor",
        class: "text-primary-400 underline"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Field Monitor`);
          } else {
            return [
              createTextVNode("Field Monitor")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`. Saat <span class="text-red-400 font-medium" data-v-dbe4e19d>OFF</span>, aplikasi tidak mengirim data posisi sama sekali \u2014 privasi terjaga. </div></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/users.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const users = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-dbe4e19d"]]);

export { users as default };
//# sourceMappingURL=users--g6EU6P1.mjs.map
