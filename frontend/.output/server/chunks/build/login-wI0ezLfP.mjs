import { defineComponent, reactive, ref, withAsyncContext, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderDynamicModel, ssrRenderClass, ssrInterpolate, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useAuthStore, a as useRoute, n as navigateTo } from './server.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "login",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const auth = useAuthStore();
    useRoute();
    const form = reactive({ email: "", password: "" });
    const loading = ref(false);
    const errorMsg = ref("");
    const showPw = ref(false);
    if (auth.isLoggedIn) {
      [__temp, __restore] = withAsyncContext(() => navigateTo("/")), await __temp, __restore();
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-navy-950 flex items-center justify-center px-4" }, _attrs))}><div class="w-full max-w-md"><div class="text-center mb-8"><div class="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-600/40"><span class="text-white font-black text-xl tracking-tight">APEX</span></div><h1 class="text-3xl font-black text-white tracking-wide">APEX</h1><p class="text-xs text-primary-400 font-medium mt-1 tracking-widest uppercase"> Achievement &amp; Performance Execution Platform </p><p class="text-xs text-gray-500 mt-2">PT. PKP</p></div><div class="card"><h2 class="text-base font-semibold text-white mb-5">Masuk ke Akun</h2><form class="space-y-4"><div><label class="form-label">Email</label><input${ssrRenderAttr("value", unref(form).email)} type="email" class="form-input" placeholder="nama@pkp.co.id" required autocomplete="username"></div><div><label class="form-label">Password</label><div class="relative"><input${ssrRenderDynamicModel(unref(showPw) ? "text" : "password", unref(form).password, null)}${ssrRenderAttr("type", unref(showPw) ? "text" : "password")} class="form-input pr-10" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required autocomplete="current-password"><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"><i class="${ssrRenderClass(`fa-solid ${unref(showPw) ? "fa-eye-slash" : "fa-eye"} text-sm`)}"></i></button></div></div>`);
      if (unref(errorMsg)) {
        _push(`<div class="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2.5 text-sm text-red-300"><i class="fa-solid fa-circle-exclamation"></i> ${ssrInterpolate(unref(errorMsg))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button type="submit" class="btn-primary w-full justify-center py-2.5"${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""}>`);
      if (unref(loading)) {
        _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
      } else {
        _push(`<i class="fa-solid fa-right-to-bracket"></i>`);
      }
      _push(` ${ssrInterpolate(unref(loading) ? "Masuk..." : "Masuk")}</button></form></div><p class="text-center text-xs text-gray-600 mt-6"> APEX v2.0 \u2014 PT. PKP </p></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=login-wI0ezLfP.mjs.map
