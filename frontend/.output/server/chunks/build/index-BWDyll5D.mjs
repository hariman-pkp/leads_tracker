import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { defineComponent, withAsyncContext, ref, reactive, watch, withCtx, createVNode, unref, createTextVNode, toDisplayString, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderSlot } from 'vue/server-renderer';
import { a as useRoute } from './server.mjs';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useFormat } from './useFormat-D7DNHH-1.mjs';
import { u as useAsyncData } from './asyncData-BUVmteIW.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "InfoRow",
  __ssrInlineRender: true,
  props: {
    label: {},
    val: {}
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="text-xs text-gray-500 uppercase tracking-wider mb-0.5">${ssrInterpolate(__props.label)}</div><div class="text-sm text-gray-200">`);
      ssrRenderSlot(_ctx.$slots, "default", {}, () => {
        _push(`${ssrInterpolate(__props.val || "\u2014")}`);
      }, _push, _parent);
      _push(`</div></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/InfoRow.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const route = useRoute();
    const { get } = useApi();
    const fmt = useFormat();
    const leadId = route.params.id;
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      `lead-${leadId}`,
      () => get(`/v1/pipeline/${leadId}`),
      { server: false }
    )), __temp = await __temp, __restore(), __temp);
    const showFuForm = ref(false);
    const submitting = ref(false);
    const fuForm = reactive({
      lead_id: leadId,
      tgl_fu: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      metode_fu: "Phone",
      hasil_fu: "Interested",
      catatan_fu: "",
      tgl_fu_berikut: "",
      status: "Done"
    });
    const fuTemplates = ref([]);
    const showHistory = ref(false);
    const historyLoading = ref(false);
    const history = ref([]);
    watch(showHistory, async (v) => {
      if (v && !history.value.length) {
        historyLoading.value = true;
        try {
          history.value = (await get(`/v1/pipeline/${leadId}/history`)).history;
        } catch {
        } finally {
          historyLoading.value = false;
        }
      }
    });
    function isOverdue(d) {
      if (!d) return false;
      return d < (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_InfoRow = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="flex items-center gap-3 mb-5">`);
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
      _push(`<div><h1 class="page-title">${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.lead) == null ? void 0 : _b.nama_company)}</h1><p class="page-subtitle">${ssrInterpolate((_d = (_c = unref(data)) == null ? void 0 : _c.lead) == null ? void 0 : _d.lead_id)} \xB7 ${ssrInterpolate((_f = (_e = unref(data)) == null ? void 0 : _e.lead) == null ? void 0 : _f.product)}</p></div><div class="ml-auto flex gap-2">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: `/pipeline/${unref(route).params.id}/edit`,
        class: "btn-secondary btn-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<i class="fa-solid fa-pen"${_scopeId}></i>Edit `);
          } else {
            return [
              createVNode("i", { class: "fa-solid fa-pen" }),
              createTextVNode("Edit ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-5"><div class="lg:col-span-2 space-y-5"><div class="card"><div class="section-title">Informasi Lead</div><div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">`);
        _push(ssrRenderComponent(_component_InfoRow, { label: "Stage" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(unref(fmt).stageClass(unref(data).lead.stage))}"${_scopeId}>${ssrInterpolate(unref(data).lead.stage)}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: unref(fmt).stageClass(unref(data).lead.stage)
                }, toDisplayString(unref(data).lead.stage), 3)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_InfoRow, { label: "Prioritas" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="${ssrRenderClass(unref(fmt).priorityClass(unref(data).lead.prioritas))}"${_scopeId}>${ssrInterpolate(unref(data).lead.prioritas)}</span>`);
            } else {
              return [
                createVNode("span", {
                  class: unref(fmt).priorityClass(unref(data).lead.prioritas)
                }, toDisplayString(unref(data).lead.prioritas), 3)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_InfoRow, {
          label: "Segmen",
          val: unref(data).lead.segmen
        }, null, _parent));
        _push(ssrRenderComponent(_component_InfoRow, {
          label: "Sub Segmen",
          val: unref(data).lead.sub_segmen
        }, null, _parent));
        _push(ssrRenderComponent(_component_InfoRow, {
          label: "Contact Person",
          val: unref(data).lead.contact_person
        }, null, _parent));
        _push(ssrRenderComponent(_component_InfoRow, {
          label: "Sales Owner",
          val: unref(data).lead.sales_owner
        }, null, _parent));
        _push(ssrRenderComponent(_component_InfoRow, { label: "Organisasi" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              if (unref(data).lead.organisasi) {
                _push2(`<span class="font-mono text-xs bg-navy-800 text-primary-300 px-2 py-0.5 rounded"${_scopeId}>${ssrInterpolate(unref(data).lead.organisasi)}</span>`);
              } else {
                _push2(`<span class="text-gray-600"${_scopeId}>\u2014</span>`);
              }
            } else {
              return [
                unref(data).lead.organisasi ? (openBlock(), createBlock("span", {
                  key: 0,
                  class: "font-mono text-xs bg-navy-800 text-primary-300 px-2 py-0.5 rounded"
                }, toDisplayString(unref(data).lead.organisasi), 1)) : (openBlock(), createBlock("span", {
                  key: 1,
                  class: "text-gray-600"
                }, "\u2014"))
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_InfoRow, {
          label: "Tanggal Masuk",
          val: unref(fmt).tgl(unref(data).lead.tgl_masuk)
        }, null, _parent));
        _push(ssrRenderComponent(_component_InfoRow, {
          label: "Exp. Close",
          val: unref(fmt).tgl(unref(data).lead.exp_close_date)
        }, null, _parent));
        _push(ssrRenderComponent(_component_InfoRow, { label: "Propose Value" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-primary-300 font-medium"${_scopeId}>${ssrInterpolate(unref(fmt).rupiahFull(unref(data).lead.propose_value))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-primary-300 font-medium" }, toDisplayString(unref(fmt).rupiahFull(unref(data).lead.propose_value)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_InfoRow, { label: "Deal Value" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-green-300 font-medium"${_scopeId}>${ssrInterpolate(unref(fmt).rupiahFull(unref(data).lead.deal_value))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-green-300 font-medium" }, toDisplayString(unref(fmt).rupiahFull(unref(data).lead.deal_value)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(ssrRenderComponent(_component_InfoRow, {
          label: "Probability",
          val: `${unref(data).lead.probability}%`
        }, null, _parent));
        _push(ssrRenderComponent(_component_InfoRow, { label: "Weighted Value" }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-yellow-300"${_scopeId}>${ssrInterpolate(unref(fmt).rupiahFull(unref(data).lead.weighted_value))}</span>`);
            } else {
              return [
                createVNode("span", { class: "text-yellow-300" }, toDisplayString(unref(fmt).rupiahFull(unref(data).lead.weighted_value)), 1)
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if (unref(data).lead.remarks) {
          _push(`<div class="mt-4 pt-4 border-t border-navy-800 text-sm text-gray-400"><span class="text-gray-500 text-xs uppercase tracking-wider">Remarks: </span> ${ssrInterpolate(unref(data).lead.remarks)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="card"><div class="flex items-center justify-between mb-3"><div class="section-title mb-0"><i class="fa-solid fa-phone-alt mr-1"></i>Follow-Up Log (${ssrInterpolate(((_g = unref(data).fu_logs) == null ? void 0 : _g.length) || 0)})</div><button class="btn-secondary btn-sm"><i class="fa-solid fa-plus"></i>Catat FU </button></div>`);
        if (unref(showFuForm)) {
          _push(`<form class="mb-4 p-4 bg-navy-800/50 rounded-lg space-y-3 border border-navy-700">`);
          if (unref(fuTemplates).length) {
            _push(`<div class="flex gap-2 flex-wrap"><span class="text-xs text-gray-500 self-center">Template:</span><!--[-->`);
            ssrRenderList(unref(fuTemplates), (t) => {
              _push(`<button type="button" class="text-xs px-2.5 py-1 rounded-full bg-navy-700 hover:bg-primary-800/60 border border-navy-600 hover:border-primary-600 text-gray-300 hover:text-primary-200 transition-colors">${ssrInterpolate(t.nama)}</button>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<div class="grid grid-cols-2 gap-3"><div><label class="form-label">Tanggal FU</label><input${ssrRenderAttr("value", unref(fuForm).tgl_fu)} type="date" class="form-input" required></div><div><label class="form-label">Metode</label><select class="form-select"><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).metode_fu) ? ssrLooseContain(unref(fuForm).metode_fu, null) : ssrLooseEqual(unref(fuForm).metode_fu, null)) ? " selected" : ""}>Phone</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).metode_fu) ? ssrLooseContain(unref(fuForm).metode_fu, null) : ssrLooseEqual(unref(fuForm).metode_fu, null)) ? " selected" : ""}>WhatsApp</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).metode_fu) ? ssrLooseContain(unref(fuForm).metode_fu, null) : ssrLooseEqual(unref(fuForm).metode_fu, null)) ? " selected" : ""}>Email</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).metode_fu) ? ssrLooseContain(unref(fuForm).metode_fu, null) : ssrLooseEqual(unref(fuForm).metode_fu, null)) ? " selected" : ""}>Meeting</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).metode_fu) ? ssrLooseContain(unref(fuForm).metode_fu, null) : ssrLooseEqual(unref(fuForm).metode_fu, null)) ? " selected" : ""}>Video Call</option></select></div></div><div><label class="form-label">Hasil FU</label><select class="form-select"><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).hasil_fu) ? ssrLooseContain(unref(fuForm).hasil_fu, null) : ssrLooseEqual(unref(fuForm).hasil_fu, null)) ? " selected" : ""}>Interested</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).hasil_fu) ? ssrLooseContain(unref(fuForm).hasil_fu, null) : ssrLooseEqual(unref(fuForm).hasil_fu, null)) ? " selected" : ""}>Follow Up Later</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).hasil_fu) ? ssrLooseContain(unref(fuForm).hasil_fu, null) : ssrLooseEqual(unref(fuForm).hasil_fu, null)) ? " selected" : ""}>Send Proposal</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).hasil_fu) ? ssrLooseContain(unref(fuForm).hasil_fu, null) : ssrLooseEqual(unref(fuForm).hasil_fu, null)) ? " selected" : ""}>Not Interested</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(fuForm).hasil_fu) ? ssrLooseContain(unref(fuForm).hasil_fu, null) : ssrLooseEqual(unref(fuForm).hasil_fu, null)) ? " selected" : ""}>No Response</option></select></div><div><label class="form-label">Catatan</label><textarea class="form-textarea h-20" placeholder="Hasil diskusi, kesepakatan, next step...">${ssrInterpolate(unref(fuForm).catatan_fu)}</textarea></div><div><label class="form-label">Next FU Date</label><input${ssrRenderAttr("value", unref(fuForm).tgl_fu_berikut)} type="date" class="form-input"></div><div class="flex gap-2 justify-end"><button type="button" class="btn-ghost btn-sm">Batal</button><button type="submit" class="btn-primary btn-sm"${ssrIncludeBooleanAttr(unref(submitting)) ? " disabled" : ""}>`);
          if (unref(submitting)) {
            _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
          } else {
            _push(`<!---->`);
          }
          _push(` Simpan FU </button></div></form>`);
        } else {
          _push(`<!---->`);
        }
        if (!((_h = unref(data).fu_logs) == null ? void 0 : _h.length)) {
          _push(`<div class="empty-state py-8"><i class="fa-solid fa-phone-slash empty-icon"></i><div class="empty-text">Belum ada catatan follow-up</div></div>`);
        } else {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(data).fu_logs, (log) => {
            _push(`<div class="p-3 bg-navy-800/40 rounded-lg border border-navy-700/50"><div class="flex items-start justify-between gap-2"><div class="flex items-center gap-2 flex-wrap"><span class="text-xs font-medium text-gray-200">${ssrInterpolate(unref(fmt).tgl(log.tgl_fu))}</span><span class="badge-blue text-xs">${ssrInterpolate(log.metode_fu)}</span><span class="${ssrRenderClass([log.hasil_fu === "Interested" ? "badge-green" : "badge-gray", "text-xs"])}">${ssrInterpolate(log.hasil_fu)}</span></div><span class="text-xs text-gray-500 flex-shrink-0">${ssrInterpolate(log.fu_id)}</span></div>`);
            if (log.catatan_fu) {
              _push(`<p class="text-sm text-gray-300 mt-2">${ssrInterpolate(log.catatan_fu)}</p>`);
            } else {
              _push(`<!---->`);
            }
            if (log.tgl_fu_berikut) {
              _push(`<p class="text-xs text-yellow-400 mt-1"><i class="fa-solid fa-calendar-check mr-1"></i>Next FU: ${ssrInterpolate(unref(fmt).tgl(log.tgl_fu_berikut))}</p>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div><div class="card"><button class="w-full flex items-center justify-between"><div class="section-title mb-0"><i class="fa-solid fa-clock-rotate-left mr-1 text-primary-400"></i>Riwayat Perubahan `);
        if (unref(history).length) {
          _push(`<span class="ml-2 text-xs text-gray-500 font-normal">(${ssrInterpolate(unref(history).length)})</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><i class="${ssrRenderClass([unref(showHistory) ? "fa-chevron-up" : "fa-chevron-down", "fa-solid text-gray-500 text-xs"])}"></i></button>`);
        if (unref(showHistory)) {
          _push(`<!--[-->`);
          if (unref(historyLoading)) {
            _push(`<div class="pt-4 text-center text-xs text-gray-600"><i class="fa-solid fa-circle-notch fa-spin mr-1"></i>Memuat... </div>`);
          } else if (!unref(history).length) {
            _push(`<div class="pt-4 text-center text-xs text-gray-600"> Belum ada riwayat perubahan. </div>`);
          } else {
            _push(`<div class="mt-3 space-y-0 divide-y divide-navy-800/60"><!--[-->`);
            ssrRenderList(unref(history), (h) => {
              _push(`<div class="py-2.5 flex gap-3 items-start text-xs"><div class="w-1.5 h-1.5 rounded-full bg-primary-600 mt-1.5 flex-shrink-0"></div><div class="flex-1 min-w-0"><span class="text-gray-400">${ssrInterpolate(h.field_name)}</span><span class="mx-1.5 text-gray-600">\xB7</span>`);
              if (h.old_value) {
                _push(`<span class="line-through text-gray-600">${ssrInterpolate(h.old_value)}</span>`);
              } else {
                _push(`<!---->`);
              }
              if (h.old_value && h.new_value) {
                _push(`<span class="mx-1 text-gray-600">\u2192</span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<span class="text-gray-200">${ssrInterpolate(h.new_value || "\u2014")}</span></div><div class="flex-shrink-0 text-right text-gray-600"><div>${ssrInterpolate(unref(fmt).tgl(h.changed_at))}</div><div class="text-[10px]">${ssrInterpolate(h.changed_by)}</div></div></div>`);
            });
            _push(`<!--]--></div>`);
          }
          _push(`<!--]-->`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="space-y-5"><div class="card"><div class="section-title"><i class="fa-solid fa-calendar-check mr-1"></i>Status Follow-Up</div><div class="space-y-2 text-sm"><div class="flex justify-between"><span class="text-gray-400">Last FU</span><span class="text-gray-200">${ssrInterpolate(unref(fmt).tgl(unref(data).lead.last_fu_date))}</span></div><div class="flex justify-between"><span class="text-gray-400">Next FU</span><span class="${ssrRenderClass(isOverdue(unref(data).lead.next_fu_date) ? "text-red-400" : "text-gray-200")}">${ssrInterpolate(unref(fmt).tgl(unref(data).lead.next_fu_date))}</span></div><div class="flex justify-between"><span class="text-gray-400">Total FU</span><span class="text-gray-200">${ssrInterpolate(unref(data).lead.fu_count || 0)}x</span></div>`);
        if (unref(data).lead.last_fu_notes) {
          _push(`<div class="pt-2 text-xs text-gray-400 border-t border-navy-800">${ssrInterpolate(unref(data).lead.last_fu_notes)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="card"><div class="section-title"><i class="fa-solid fa-address-book mr-1"></i>Contacts (${ssrInterpolate(((_i = unref(data).contacts) == null ? void 0 : _i.length) || 0)})</div>`);
        if (!((_j = unref(data).contacts) == null ? void 0 : _j.length)) {
          _push(`<div class="empty-state py-6"><i class="fa-solid fa-user-slash empty-icon"></i><div class="empty-text">Belum ada kontak</div></div>`);
        } else {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(data).contacts, (c) => {
            _push(`<div class="p-3 bg-navy-800/40 rounded-lg border border-navy-700/50"><div class="font-medium text-sm text-gray-200">${ssrInterpolate(c.nama_contact)}</div><div class="text-xs text-gray-400">${ssrInterpolate(c.jabatan)}</div>`);
            if (c.no_hp) {
              _push(`<div class="text-xs text-primary-400 mt-1"><i class="fa-solid fa-phone mr-1"></i>${ssrInterpolate(c.no_hp)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/pipeline/[id]/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BWDyll5D.mjs.map
