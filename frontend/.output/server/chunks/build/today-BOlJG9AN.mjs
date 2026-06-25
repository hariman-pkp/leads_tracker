import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { defineComponent, withAsyncContext, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "today",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("today", () => get("/v1/today"), { server: false })), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o, _p, _q, _r, _s;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-bolt text-yellow-400 mr-2"></i>Hari Ini</h1><p class="page-subtitle">${ssrInterpolate(((_a = unref(data)) == null ? void 0 : _a.date) ? unref(fmt).tgl(unref(data).date) : "")} \u2014 Agenda Follow-Up</p></div><button class="btn-secondary btn-sm"><i class="fa-solid fa-rotate"></i>Refresh </button></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="flex flex-wrap gap-3 mb-6"><div class="${ssrRenderClass([((_b = unref(data).overdue) == null ? void 0 : _b.length) ? "border-red-700/50 bg-red-900/10" : "border-navy-700", "card-sm flex items-center gap-2.5 px-4 border"])}"><i class="${ssrRenderClass([((_c = unref(data).overdue) == null ? void 0 : _c.length) ? "text-red-400" : "text-gray-600", "fa-solid fa-circle-exclamation"])}"></i><div><div class="${ssrRenderClass([((_d = unref(data).overdue) == null ? void 0 : _d.length) ? "text-red-300" : "text-gray-500", "text-sm font-bold"])}">${ssrInterpolate((_e = unref(data).overdue) == null ? void 0 : _e.length)} Overdue </div><div class="text-xs text-gray-600">Melewati jadwal</div></div></div><div class="${ssrRenderClass([((_f = unref(data).due_today) == null ? void 0 : _f.length) ? "border-yellow-700/50 bg-yellow-900/10" : "border-navy-700", "card-sm flex items-center gap-2.5 px-4 border"])}"><i class="${ssrRenderClass([((_g = unref(data).due_today) == null ? void 0 : _g.length) ? "text-yellow-400" : "text-gray-600", "fa-solid fa-calendar-day"])}"></i><div><div class="${ssrRenderClass([((_h = unref(data).due_today) == null ? void 0 : _h.length) ? "text-yellow-300" : "text-gray-500", "text-sm font-bold"])}">${ssrInterpolate((_i = unref(data).due_today) == null ? void 0 : _i.length)} Hari Ini </div><div class="text-xs text-gray-600">Jadwal hari ini</div></div></div><div class="card-sm flex items-center gap-2.5 px-4 border border-navy-700"><i class="fa-solid fa-calendar-week text-blue-400"></i><div><div class="text-sm font-bold text-blue-300">${ssrInterpolate((_j = unref(data).upcoming) == null ? void 0 : _j.length)} Mendatang</div><div class="text-xs text-gray-600">7 hari ke depan</div></div></div><div class="card-sm flex items-center gap-2.5 px-4 border border-navy-700"><i class="fa-solid fa-hourglass-half text-orange-400"></i><div><div class="text-sm font-bold text-orange-300">${ssrInterpolate((_k = unref(data).stale) == null ? void 0 : _k.length)} Stale</div><div class="text-xs text-gray-600">&gt;30 hari tanpa FU</div></div></div><div class="card-sm flex items-center gap-2.5 px-4 border border-emerald-700/40 bg-emerald-900/10 ml-auto"><i class="fa-solid fa-check-circle text-emerald-400"></i><div><div class="text-sm font-bold text-emerald-300">${ssrInterpolate(unref(data).fu_done_today)} FU Selesai</div><div class="text-xs text-gray-600">Hari ini</div></div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-5"><div class="card"><div class="section-title text-red-400 mb-3"><i class="fa-solid fa-circle-exclamation mr-1.5"></i>Overdue (${ssrInterpolate((_l = unref(data).overdue) == null ? void 0 : _l.length)}) </div>`);
        if ((_m = unref(data).overdue) == null ? void 0 : _m.length) {
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
            _push(`</div><div class="text-xs text-gray-500">${ssrInterpolate(l.stage)} \xB7 ${ssrInterpolate(l.sales_owner || "Unassigned")}</div>`);
            if (l.last_fu_notes) {
              _push(`<div class="text-xs text-gray-600 truncate mt-0.5 italic">&quot;${ssrInterpolate(l.last_fu_notes)}&quot;</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-right flex-shrink-0"><div class="text-xs font-bold text-red-400">${ssrInterpolate(l.days_overdue)}h lalu</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8"><i class="fa-solid fa-circle-check text-emerald-400 text-2xl mb-2 block"></i><div class="text-sm text-gray-500">Tidak ada FU yang overdue \u{1F389}</div></div>`);
        }
        _push(`</div><div class="card"><div class="section-title text-yellow-400 mb-3"><i class="fa-solid fa-calendar-day mr-1.5"></i>Jadwal Hari Ini (${ssrInterpolate((_n = unref(data).due_today) == null ? void 0 : _n.length)}) </div>`);
        if ((_o = unref(data).due_today) == null ? void 0 : _o.length) {
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
            _push(`</div><div class="text-xs text-gray-500">${ssrInterpolate(l.stage)} \xB7 ${ssrInterpolate(l.sales_owner || "Unassigned")}</div>`);
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
                  _push2(` FU Now \u2192 `);
                } else {
                  return [
                    createTextVNode(" FU Now \u2192 ")
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
        _push(`</div><div class="card"><div class="section-title text-blue-400 mb-3"><i class="fa-solid fa-calendar-week mr-1.5"></i>7 Hari ke Depan (${ssrInterpolate((_p = unref(data).upcoming) == null ? void 0 : _p.length)}) </div>`);
        if ((_q = unref(data).upcoming) == null ? void 0 : _q.length) {
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
            _push(`</div><div class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(l.stage)} \xB7 ${ssrInterpolate(l.sales_owner || "\u2014")}</div></div><div class="text-right flex-shrink-0"><div class="text-xs font-medium text-blue-300">${ssrInterpolate(unref(fmt).tgl(l.next_fu_date))}</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8 text-sm text-gray-500"> Tidak ada jadwal FU minggu ini </div>`);
        }
        _push(`</div><div class="card"><div class="section-title text-orange-400 mb-3"><i class="fa-solid fa-hourglass-half mr-1.5"></i>Perlu Direaktivasi (${ssrInterpolate((_r = unref(data).stale) == null ? void 0 : _r.length)}) </div>`);
        if ((_s = unref(data).stale) == null ? void 0 : _s.length) {
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
            _push(`</div><div class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(l.sales_owner || "Unassigned")} \xB7 ${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div><div class="text-right flex-shrink-0"><div class="${ssrRenderClass([l.days_since_fu > 90 ? "text-red-400" : l.days_since_fu > 60 ? "text-orange-400" : "text-yellow-400", "text-sm font-bold"])}">${ssrInterpolate(l.days_since_fu >= 9999 ? "\u221E" : l.days_since_fu + " hr")}</div><div class="text-xs text-gray-600">tanpa FU</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8"><i class="fa-solid fa-check-circle text-emerald-400 text-2xl mb-2 block"></i><div class="text-sm text-gray-500">Semua lead aktif terjadwal \u{1F44D}</div></div>`);
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

export { _sfc_main as default };
//# sourceMappingURL=today-BOlJG9AN.mjs.map
