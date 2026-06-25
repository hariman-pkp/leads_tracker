import { _ as __nuxt_component_0 } from "./nuxt-link-CFSz172Y.js";
import { defineComponent, withAsyncContext, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderComponent } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import { u as useAsyncData } from "./asyncData-BUVmteIW.js";
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
  __name: "today",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("today", () => get("/v1/today"), { server: false })), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-bolt text-yellow-400 mr-2"></i>Hari Ini</h1><p class="page-subtitle">${ssrInterpolate(unref(data)?.date ? unref(fmt).tgl(unref(data).date) : "")} — Agenda Follow-Up</p></div><button class="btn-secondary btn-sm"><i class="fa-solid fa-rotate"></i>Refresh </button></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="flex flex-wrap gap-3 mb-6"><div class="${ssrRenderClass([unref(data).overdue?.length ? "border-red-700/50 bg-red-900/10" : "border-navy-700", "card-sm flex items-center gap-2.5 px-4 border"])}"><i class="${ssrRenderClass([unref(data).overdue?.length ? "text-red-400" : "text-gray-600", "fa-solid fa-circle-exclamation"])}"></i><div><div class="${ssrRenderClass([unref(data).overdue?.length ? "text-red-300" : "text-gray-500", "text-sm font-bold"])}">${ssrInterpolate(unref(data).overdue?.length)} Overdue </div><div class="text-xs text-gray-600">Melewati jadwal</div></div></div><div class="${ssrRenderClass([unref(data).due_today?.length ? "border-yellow-700/50 bg-yellow-900/10" : "border-navy-700", "card-sm flex items-center gap-2.5 px-4 border"])}"><i class="${ssrRenderClass([unref(data).due_today?.length ? "text-yellow-400" : "text-gray-600", "fa-solid fa-calendar-day"])}"></i><div><div class="${ssrRenderClass([unref(data).due_today?.length ? "text-yellow-300" : "text-gray-500", "text-sm font-bold"])}">${ssrInterpolate(unref(data).due_today?.length)} Hari Ini </div><div class="text-xs text-gray-600">Jadwal hari ini</div></div></div><div class="card-sm flex items-center gap-2.5 px-4 border border-navy-700"><i class="fa-solid fa-calendar-week text-blue-400"></i><div><div class="text-sm font-bold text-blue-300">${ssrInterpolate(unref(data).upcoming?.length)} Mendatang</div><div class="text-xs text-gray-600">7 hari ke depan</div></div></div><div class="card-sm flex items-center gap-2.5 px-4 border border-navy-700"><i class="fa-solid fa-hourglass-half text-orange-400"></i><div><div class="text-sm font-bold text-orange-300">${ssrInterpolate(unref(data).stale?.length)} Stale</div><div class="text-xs text-gray-600">&gt;30 hari tanpa FU</div></div></div><div class="card-sm flex items-center gap-2.5 px-4 border border-emerald-700/40 bg-emerald-900/10 ml-auto"><i class="fa-solid fa-check-circle text-emerald-400"></i><div><div class="text-sm font-bold text-emerald-300">${ssrInterpolate(unref(data).fu_done_today)} FU Selesai</div><div class="text-xs text-gray-600">Hari ini</div></div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-5"><div class="card"><div class="section-title text-red-400 mb-3"><i class="fa-solid fa-circle-exclamation mr-1.5"></i>Overdue (${ssrInterpolate(unref(data).overdue?.length)}) </div>`);
        if (unref(data).overdue?.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).overdue, (l) => {
            _push(`<div class="flex items-center gap-3 p-2.5 rounded-lg bg-red-900/10 border border-red-900/30 hover:border-red-700/50 transition-colors"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-0.5"><span class="${ssrRenderClass([unref(fmt).priorityClass(l.prioritas), "flex-shrink-0"])}">${ssrInterpolate(l.prioritas)}</span>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-sm font-medium text-gray-200 hover:text-primary-300 truncate"
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
            _push(`</div><div class="text-xs text-gray-500">${ssrInterpolate(l.stage)} · ${ssrInterpolate(l.sales_owner || "Unassigned")}</div>`);
            if (l.last_fu_notes) {
              _push(`<div class="text-xs text-gray-600 truncate mt-0.5 italic">&quot;${ssrInterpolate(l.last_fu_notes)}&quot;</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-right flex-shrink-0"><div class="text-xs font-bold text-red-400">${ssrInterpolate(l.days_overdue)}h lalu</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8"><i class="fa-solid fa-circle-check text-emerald-400 text-2xl mb-2 block"></i><div class="text-sm text-gray-500">Tidak ada FU yang overdue 🎉</div></div>`);
        }
        _push(`</div><div class="card"><div class="section-title text-yellow-400 mb-3"><i class="fa-solid fa-calendar-day mr-1.5"></i>Jadwal Hari Ini (${ssrInterpolate(unref(data).due_today?.length)}) </div>`);
        if (unref(data).due_today?.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).due_today, (l) => {
            _push(`<div class="flex items-center gap-3 p-2.5 rounded-lg bg-yellow-900/10 border border-yellow-900/30 hover:border-yellow-700/50 transition-colors"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 mb-0.5"><span class="${ssrRenderClass([unref(fmt).priorityClass(l.prioritas), "flex-shrink-0"])}">${ssrInterpolate(l.prioritas)}</span>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-sm font-medium text-gray-200 hover:text-primary-300 truncate"
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
            _push(`</div><div class="text-xs text-gray-500">${ssrInterpolate(l.stage)} · ${ssrInterpolate(l.sales_owner || "Unassigned")}</div>`);
            if (l.last_fu_notes) {
              _push(`<div class="text-xs text-gray-600 truncate mt-0.5 italic">&quot;${ssrInterpolate(l.last_fu_notes)}&quot;</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-right flex-shrink-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-xs text-primary-400 hover:text-primary-300 block mb-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` FU Now → `);
                } else {
                  return [
                    createTextVNode(" FU Now → ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8"><i class="fa-solid fa-inbox text-gray-600 text-2xl mb-2 block"></i><div class="text-sm text-gray-500">Tidak ada jadwal FU hari ini</div></div>`);
        }
        _push(`</div><div class="card"><div class="section-title text-blue-400 mb-3"><i class="fa-solid fa-calendar-week mr-1.5"></i>7 Hari ke Depan (${ssrInterpolate(unref(data).upcoming?.length)}) </div>`);
        if (unref(data).upcoming?.length) {
          _push(`<div class="space-y-1.5"><!--[-->`);
          ssrRenderList(unref(data).upcoming, (l) => {
            _push(`<div class="flex items-center gap-3 py-2 border-b border-navy-800 last:border-0"><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="${ssrRenderClass([unref(fmt).priorityClass(l.prioritas), "flex-shrink-0"])}">${ssrInterpolate(l.prioritas)}</span>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-sm text-gray-300 hover:text-primary-300 truncate"
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
            _push(`</div><div class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(l.stage)} · ${ssrInterpolate(l.sales_owner || "—")}</div></div><div class="text-right flex-shrink-0"><div class="text-xs font-medium text-blue-300">${ssrInterpolate(unref(fmt).tgl(l.next_fu_date))}</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8 text-sm text-gray-500"> Tidak ada jadwal FU minggu ini </div>`);
        }
        _push(`</div><div class="card"><div class="section-title text-orange-400 mb-3"><i class="fa-solid fa-hourglass-half mr-1.5"></i>Perlu Direaktivasi (${ssrInterpolate(unref(data).stale?.length)}) </div>`);
        if (unref(data).stale?.length) {
          _push(`<div class="space-y-1.5"><!--[-->`);
          ssrRenderList(unref(data).stale, (l) => {
            _push(`<div class="flex items-center gap-3 py-2 border-b border-navy-800 last:border-0"><div class="flex-1 min-w-0"><div class="flex items-center gap-2"><span class="${ssrRenderClass([unref(fmt).stageClass(l.stage), "flex-shrink-0"])}">${ssrInterpolate(l.stage)}</span>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-sm text-gray-300 hover:text-primary-300 truncate"
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
            _push(`</div><div class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(l.sales_owner || "Unassigned")} · ${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div><div class="text-right flex-shrink-0"><div class="${ssrRenderClass([l.days_since_fu > 90 ? "text-red-400" : l.days_since_fu > 60 ? "text-orange-400" : "text-yellow-400", "text-sm font-bold"])}">${ssrInterpolate(l.days_since_fu >= 9999 ? "∞" : l.days_since_fu + " hr")}</div><div class="text-xs text-gray-600">tanpa FU</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8"><i class="fa-solid fa-check-circle text-emerald-400 text-2xl mb-2 block"></i><div class="text-sm text-gray-500">Semua lead aktif terjadwal 👍</div></div>`);
        }
        _push(`</div></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/today.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=today-BOlJG9AN.js.map
