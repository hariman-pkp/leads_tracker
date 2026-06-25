import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs } from "vue/server-renderer";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "NumericInput",
  __ssrInlineRender: true,
  props: {
    modelValue: {},
    placeholder: {},
    class: {},
    disabled: { type: Boolean },
    required: { type: Boolean },
    min: {}
  },
  emits: ["update:modelValue"],
  setup(__props, { emit: __emit }) {
    const props = __props;
    const inputRef = ref(null);
    const isFocused = ref(false);
    function formatNumber(n) {
      if (!n && n !== 0) return "";
      return new Intl.NumberFormat("id-ID").format(n);
    }
    const displayValue = computed(() => {
      const v = props.modelValue ?? 0;
      if (isFocused.value) {
        return v === 0 ? "" : String(v);
      }
      return v === 0 ? "" : formatNumber(v);
    });
    const inputClass = computed(() => props.class ?? "form-input");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<input${ssrRenderAttrs(mergeProps({
        ref_key: "inputRef",
        ref: inputRef,
        type: "text",
        inputmode: "numeric",
        value: unref(displayValue),
        placeholder: __props.placeholder || "0",
        class: unref(inputClass),
        disabled: __props.disabled,
        required: __props.required,
        autocomplete: "off"
      }, _attrs))}>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NumericInput.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as _
};
//# sourceMappingURL=NumericInput-CpnBtvaB.js.map
