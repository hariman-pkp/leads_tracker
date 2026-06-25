import { defineComponent, ref, watch, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderClass, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "ProductSelect",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    products: { default: () => [] },
    placeholder: { default: "Pilih atau ketik produk..." },
    inputClass: { default: "form-input" },
    inputId: { default: void 0 }
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    var _a;
    const props = __props;
    const listId = `prod-list-${Math.random().toString(36).slice(2)}`;
    ref(null);
    const inputVal = ref((_a = props.modelValue) != null ? _a : "");
    watch(() => props.modelValue, (v) => {
      if (v !== inputVal.value) inputVal.value = v != null ? v : "";
    });
    const matchedKategori = computed(() => {
      var _a2;
      if (!inputVal.value) return "";
      const match = props.products.find(
        (p) => p.nama.toLowerCase() === inputVal.value.toLowerCase()
      );
      return (_a2 = match == null ? void 0 : match.kategori) != null ? _a2 : "";
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "relative" }, _attrs))}><input${ssrRenderAttr("id", __props.inputId)}${ssrRenderAttr("value", unref(inputVal))}${ssrRenderAttr("list", listId)}${ssrRenderAttr("placeholder", __props.placeholder)} class="${ssrRenderClass(__props.inputClass)}" autocomplete="off"><datalist${ssrRenderAttr("id", listId)}><!--[-->`);
      ssrRenderList(__props.products, (p) => {
        _push(`<option${ssrRenderAttr("value", p.nama)}>${ssrInterpolate(p.kode)} \u2014 ${ssrInterpolate(p.nama)}</option>`);
      });
      _push(`<!--]--></datalist>`);
      if (unref(matchedKategori)) {
        _push(`<span class="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-navy-700 text-primary-400 pointer-events-none">${ssrInterpolate(unref(matchedKategori))}</span>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ProductSelect.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=ProductSelect-DXo4uezQ.mjs.map
