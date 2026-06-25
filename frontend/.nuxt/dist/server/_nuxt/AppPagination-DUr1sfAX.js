import { defineComponent, computed, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderList, ssrRenderClass, ssrRenderAttr } from "vue/server-renderer";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "AppPagination",
  __ssrInlineRender: true,
  props: {
    page: {},
    perPage: {},
    total: {},
    totalPages: {},
    perPageOptions: {}
  },
  emits: ["update:page", "update:perPage"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    computed(() => props.perPageOptions ?? [10, 20, 25, 50]);
    const from = computed(() => props.total === 0 ? 0 : (props.page - 1) * props.perPage + 1);
    const to = computed(() => Math.min(props.page * props.perPage, props.total));
    const pages = computed(() => {
      const total = props.totalPages;
      const cur = props.page;
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
      const result = [1];
      if (cur > 3) result.push("...");
      for (let p = Math.max(2, cur - 1); p <= Math.min(total - 1, cur + 1); p++) result.push(p);
      if (cur < total - 2) result.push("...");
      result.push(total);
      return result;
    });
    return (_ctx, _push, _parent, _attrs) => {
      if (__props.totalPages > 1) {
        _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex items-center justify-between gap-4 mt-4 px-1" }, _attrs))} data-v-6ffecedc><div class="text-xs text-gray-500" data-v-6ffecedc>${ssrInterpolate(unref(from))}–${ssrInterpolate(unref(to))} dari ${ssrInterpolate(__props.total)} data </div><div class="flex items-center gap-1" data-v-6ffecedc><button${ssrIncludeBooleanAttr(__props.page === 1) ? " disabled" : ""} class="pg-btn" data-v-6ffecedc><i class="fa-solid fa-angles-left text-[10px]" data-v-6ffecedc></i></button><button${ssrIncludeBooleanAttr(__props.page === 1) ? " disabled" : ""} class="pg-btn" data-v-6ffecedc><i class="fa-solid fa-angle-left text-[10px]" data-v-6ffecedc></i></button><!--[-->`);
        ssrRenderList(unref(pages), (p) => {
          _push(`<!--[-->`);
          if (p === "...") {
            _push(`<span class="px-1 text-gray-600 text-xs select-none" data-v-6ffecedc>…</span>`);
          } else {
            _push(`<button class="${ssrRenderClass(p === __props.page ? "pg-btn-active" : "pg-btn")}" data-v-6ffecedc>${ssrInterpolate(p)}</button>`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--><button${ssrIncludeBooleanAttr(__props.page === __props.totalPages) ? " disabled" : ""} class="pg-btn" data-v-6ffecedc><i class="fa-solid fa-angle-right text-[10px]" data-v-6ffecedc></i></button><button${ssrIncludeBooleanAttr(__props.page === __props.totalPages) ? " disabled" : ""} class="pg-btn" data-v-6ffecedc><i class="fa-solid fa-angles-right text-[10px]" data-v-6ffecedc></i></button></div><div class="flex items-center gap-2 text-xs text-gray-500" data-v-6ffecedc><span data-v-6ffecedc>Per halaman</span><select${ssrRenderAttr("value", __props.perPage)} class="form-select text-xs py-1 w-16" data-v-6ffecedc><!--[-->`);
        ssrRenderList(__props.perPageOptions, (n) => {
          _push(`<option${ssrRenderAttr("value", n)} data-v-6ffecedc>${ssrInterpolate(n)}</option>`);
        });
        _push(`<!--]--></select></div></div>`);
      } else {
        _push(`<!---->`);
      }
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/AppPagination.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6ffecedc"]]);
export {
  __nuxt_component_1 as _
};
//# sourceMappingURL=AppPagination-DUr1sfAX.js.map
