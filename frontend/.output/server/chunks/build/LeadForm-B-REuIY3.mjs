import { _ as _sfc_main$1 } from './ProductSelect-DXo4uezQ.mjs';
import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { defineComponent, reactive, mergeProps, unref, withCtx, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderComponent, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { u as useSegmen } from './useSegmen-CyO8zV4Z.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "LeadForm",
  __ssrInlineRender: true,
  props: {
    initial: {},
    salesList: {},
    orgList: {},
    productList: {},
    loading: { type: Boolean }
  },
  emits: ["submit"],
  setup(__props, { emit: __emit }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r;
    const props = __props;
    const stages = ["New", "In Progress", "Demo Scheduled", "Proposal Sent", "Negotiation", "Won", "On Hold", "Lost"];
    const { segmens } = useSegmen();
    const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    const form = reactive({
      nama_company: ((_a = props.initial) == null ? void 0 : _a.nama_company) || "",
      product: ((_b = props.initial) == null ? void 0 : _b.product) || "",
      contact_person: ((_c = props.initial) == null ? void 0 : _c.contact_person) || "",
      segmen: ((_d = props.initial) == null ? void 0 : _d.segmen) || "",
      sub_segmen: ((_e = props.initial) == null ? void 0 : _e.sub_segmen) || "",
      source: ((_f = props.initial) == null ? void 0 : _f.source) || "",
      stage: ((_g = props.initial) == null ? void 0 : _g.stage) || "New",
      prioritas: ((_h = props.initial) == null ? void 0 : _h.prioritas) || "Warm",
      sales_owner: ((_i = props.initial) == null ? void 0 : _i.sales_owner) || "",
      organisasi: ((_j = props.initial) == null ? void 0 : _j.organisasi) || "",
      tgl_masuk: ((_k = props.initial) == null ? void 0 : _k.tgl_masuk) || today,
      propose_value: ((_l = props.initial) == null ? void 0 : _l.propose_value) || 0,
      deal_value: ((_m = props.initial) == null ? void 0 : _m.deal_value) || 0,
      probability: ((_n = props.initial) == null ? void 0 : _n.probability) || 0,
      exp_close_date: ((_o = props.initial) == null ? void 0 : _o.exp_close_date) || "",
      next_fu_date: ((_p = props.initial) == null ? void 0 : _p.next_fu_date) || "",
      remarks: ((_q = props.initial) == null ? void 0 : _q.remarks) || "",
      loss_reason: ((_r = props.initial) == null ? void 0 : _r.loss_reason) || "",
      loss_reason_detail: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ProductSelect = _sfc_main$1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<form${ssrRenderAttrs(mergeProps({ class: "card space-y-5" }, _attrs))}><div class="grid grid-cols-2 gap-4"><div class="col-span-2"><label class="form-label">Nama Company *</label><input${ssrRenderAttr("value", unref(form).nama_company)} class="form-input" required placeholder="PT ..."></div><div><label class="form-label">Produk / Layanan</label>`);
      _push(ssrRenderComponent(_component_ProductSelect, {
        modelValue: unref(form).product,
        "onUpdate:modelValue": ($event) => unref(form).product = $event,
        products: __props.productList,
        placeholder: "Ketik atau pilih produk..."
      }, null, _parent));
      _push(`</div><div><label class="form-label">Contact Person</label><input${ssrRenderAttr("value", unref(form).contact_person)} class="form-input" placeholder="Nama PIC"></div><div><label class="form-label">Segmen</label><select class="form-select"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).segmen) ? ssrLooseContain(unref(form).segmen, "") : ssrLooseEqual(unref(form).segmen, "")) ? " selected" : ""}>\u2014 Pilih \u2014</option><!--[-->`);
      ssrRenderList(unref(segmens), (s) => {
        _push(`<option${ssrIncludeBooleanAttr(Array.isArray(unref(form).segmen) ? ssrLooseContain(unref(form).segmen, null) : ssrLooseEqual(unref(form).segmen, null)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="form-label">Sub Segmen</label><input${ssrRenderAttr("value", unref(form).sub_segmen)} class="form-input" placeholder="Opsional"></div><div><label class="form-label">Stage</label><select class="form-select"><!--[-->`);
      ssrRenderList(stages, (s) => {
        _push(`<option${ssrIncludeBooleanAttr(Array.isArray(unref(form).stage) ? ssrLooseContain(unref(form).stage, null) : ssrLooseEqual(unref(form).stage, null)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="form-label">Prioritas</label><select class="form-select"><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).prioritas) ? ssrLooseContain(unref(form).prioritas, null) : ssrLooseEqual(unref(form).prioritas, null)) ? " selected" : ""}>Hot</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).prioritas) ? ssrLooseContain(unref(form).prioritas, null) : ssrLooseEqual(unref(form).prioritas, null)) ? " selected" : ""}>Warm</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).prioritas) ? ssrLooseContain(unref(form).prioritas, null) : ssrLooseEqual(unref(form).prioritas, null)) ? " selected" : ""}>Cold</option></select></div><div><label class="form-label">Source</label><select class="form-select"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).source) ? ssrLooseContain(unref(form).source, "") : ssrLooseEqual(unref(form).source, "")) ? " selected" : ""}>\u2014 Pilih \u2014</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).source) ? ssrLooseContain(unref(form).source, null) : ssrLooseEqual(unref(form).source, null)) ? " selected" : ""}>Referral</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).source) ? ssrLooseContain(unref(form).source, null) : ssrLooseEqual(unref(form).source, null)) ? " selected" : ""}>Cold Call</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).source) ? ssrLooseContain(unref(form).source, null) : ssrLooseEqual(unref(form).source, null)) ? " selected" : ""}>Event</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).source) ? ssrLooseContain(unref(form).source, null) : ssrLooseEqual(unref(form).source, null)) ? " selected" : ""}>Website</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).source) ? ssrLooseContain(unref(form).source, null) : ssrLooseEqual(unref(form).source, null)) ? " selected" : ""}>Existing Client</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).source) ? ssrLooseContain(unref(form).source, null) : ssrLooseEqual(unref(form).source, null)) ? " selected" : ""}>Tender</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).source) ? ssrLooseContain(unref(form).source, null) : ssrLooseEqual(unref(form).source, null)) ? " selected" : ""}>Partnership</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(form).source) ? ssrLooseContain(unref(form).source, null) : ssrLooseEqual(unref(form).source, null)) ? " selected" : ""}>Internal</option></select></div><div><label class="form-label">Sales Owner</label><select class="form-select"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).sales_owner) ? ssrLooseContain(unref(form).sales_owner, "") : ssrLooseEqual(unref(form).sales_owner, "")) ? " selected" : ""}>\u2014 Pilih \u2014</option><!--[-->`);
      ssrRenderList(__props.salesList, (s) => {
        _push(`<option${ssrIncludeBooleanAttr(Array.isArray(unref(form).sales_owner) ? ssrLooseContain(unref(form).sales_owner, null) : ssrLooseEqual(unref(form).sales_owner, null)) ? " selected" : ""}>${ssrInterpolate(s)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="form-label">Organisasi</label><select class="form-select"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).organisasi) ? ssrLooseContain(unref(form).organisasi, "") : ssrLooseEqual(unref(form).organisasi, "")) ? " selected" : ""}>\u2014 Pilih Organisasi \u2014</option><!--[-->`);
      ssrRenderList(__props.orgList, (o) => {
        _push(`<option${ssrRenderAttr("value", o.kode)}${ssrIncludeBooleanAttr(Array.isArray(unref(form).organisasi) ? ssrLooseContain(unref(form).organisasi, o.kode) : ssrLooseEqual(unref(form).organisasi, o.kode)) ? " selected" : ""}>${ssrInterpolate(o.kode)} \u2014 ${ssrInterpolate(o.nama)}</option>`);
      });
      _push(`<!--]--></select></div><div><label class="form-label">Tanggal Masuk</label><input${ssrRenderAttr("value", unref(form).tgl_masuk)} type="date" class="form-input"></div><div><label class="form-label">Propose Value (Rp)</label><input${ssrRenderAttr("value", unref(form).propose_value)} type="number" class="form-input" min="0" step="1000000"></div><div><label class="form-label">Deal Value (Rp)</label><input${ssrRenderAttr("value", unref(form).deal_value)} type="number" class="form-input" min="0" step="1000000"></div><div><label class="form-label">Probability (%)</label><input${ssrRenderAttr("value", unref(form).probability)} type="number" class="form-input" min="0" max="100"></div><div><label class="form-label">Exp. Close Date</label><input${ssrRenderAttr("value", unref(form).exp_close_date)} type="date" class="form-input"></div><div><label class="form-label">Next FU Date</label><input${ssrRenderAttr("value", unref(form).next_fu_date)} type="date" class="form-input"></div><div class="col-span-2"><label class="form-label">Remarks</label><textarea class="form-textarea h-20" placeholder="Catatan tambahan...">${ssrInterpolate(unref(form).remarks)}</textarea></div>`);
      if (unref(form).stage === "Lost") {
        _push(`<div class="col-span-2"><label class="form-label text-red-400"><i class="fa-solid fa-circle-xmark mr-1"></i>Alasan Tidak Menang (Loss Reason) </label><select class="form-select"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "") : ssrLooseEqual(unref(form).loss_reason, "")) ? " selected" : ""}>\u2014 Pilih alasan \u2014</option><option value="Harga tidak kompetitif"${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "Harga tidak kompetitif") : ssrLooseEqual(unref(form).loss_reason, "Harga tidak kompetitif")) ? " selected" : ""}>Harga tidak kompetitif</option><option value="Kalah dari kompetitor"${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "Kalah dari kompetitor") : ssrLooseEqual(unref(form).loss_reason, "Kalah dari kompetitor")) ? " selected" : ""}>Kalah dari kompetitor</option><option value="Budget klien terbatas"${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "Budget klien terbatas") : ssrLooseEqual(unref(form).loss_reason, "Budget klien terbatas")) ? " selected" : ""}>Budget klien terbatas</option><option value="Proyek ditunda"${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "Proyek ditunda") : ssrLooseEqual(unref(form).loss_reason, "Proyek ditunda")) ? " selected" : ""}>Proyek ditunda</option><option value="Kebutuhan berubah"${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "Kebutuhan berubah") : ssrLooseEqual(unref(form).loss_reason, "Kebutuhan berubah")) ? " selected" : ""}>Kebutuhan berubah</option><option value="Tidak ada respons"${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "Tidak ada respons") : ssrLooseEqual(unref(form).loss_reason, "Tidak ada respons")) ? " selected" : ""}>Tidak ada respons dari klien</option><option value="Fitur tidak sesuai"${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "Fitur tidak sesuai") : ssrLooseEqual(unref(form).loss_reason, "Fitur tidak sesuai")) ? " selected" : ""}>Fitur / produk tidak sesuai kebutuhan</option><option value="Hubungan tidak terjalin"${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "Hubungan tidak terjalin") : ssrLooseEqual(unref(form).loss_reason, "Hubungan tidak terjalin")) ? " selected" : ""}>Hubungan tidak terjalin dengan baik</option><option value="Lainnya"${ssrIncludeBooleanAttr(Array.isArray(unref(form).loss_reason) ? ssrLooseContain(unref(form).loss_reason, "Lainnya") : ssrLooseEqual(unref(form).loss_reason, "Lainnya")) ? " selected" : ""}>Lainnya</option></select>`);
        if (unref(form).loss_reason === "Lainnya") {
          _push(`<textarea class="form-textarea h-16 mt-2" placeholder="Jelaskan alasan lainnya...">${ssrInterpolate(unref(form).loss_reason_detail)}</textarea>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="flex gap-3 justify-end pt-2 border-t border-navy-800">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/pipeline",
        class: "btn-secondary"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`Batal`);
          } else {
            return [
              createTextVNode("Batal")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(__props.loading) ? " disabled" : ""}>`);
      if (__props.loading) {
        _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
      } else {
        _push(`<i class="fa-solid fa-floppy-disk"></i>`);
      }
      _push(` Simpan </button></div></form>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LeadForm.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=LeadForm-B-REuIY3.mjs.map
