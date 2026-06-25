import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { defineComponent, withAsyncContext, computed, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderList, ssrRenderComponent } from 'vue/server-renderer';
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
  __name: "schedule",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("schedule", () => get("/v1/schedule"), { server: false })), __temp = await __temp, __restore(), __temp);
    const allItems = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.schedule) != null ? _b : [];
    });
    const overdueItems = computed(() => allItems.value.filter((l) => l.fu_status === "Overdue"));
    const todayItems = computed(() => allItems.value.filter((l) => l.fu_status === "Today"));
    const upcomingItems = computed(() => allItems.value.filter((l) => l.fu_status === "Upcoming"));
    const scheduleGroups = computed(() => [
      { status: "Overdue", label: "Overdue", icon: "fa-circle-exclamation", items: overdueItems.value },
      { status: "Today", label: "Jadwal Hari Ini", icon: "fa-calendar-day", items: todayItems.value },
      { status: "Upcoming", label: "Mendatang", icon: "fa-calendar-week", items: upcomingItems.value }
    ]);
    function overdayCount(dateStr) {
      if (!dateStr) return 0;
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 864e5);
      return diff > 0 ? diff : 0;
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-calendar-check text-primary-400 mr-2"></i>FU Schedule</h1><p class="page-subtitle">${ssrInterpolate((_b = (_a = unref(data)) == null ? void 0 : _a.total) != null ? _b : 0)} lead terjadwal \xB7 ${ssrInterpolate((_c = unref(data)) == null ? void 0 : _c.from)} s/d ${ssrInterpolate((_d = unref(data)) == null ? void 0 : _d.to)}</p></div><button class="btn-secondary btn-sm"${ssrIncludeBooleanAttr(unref(pending)) ? " disabled" : ""}><i class="${ssrRenderClass(`fa-solid fa-rotate ${unref(pending) ? "fa-spin" : ""}`)}"></i>Refresh </button></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-16"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="flex flex-wrap gap-3 mb-5"><div class="${ssrRenderClass([unref(overdueItems).length ? "border-red-700/50 bg-red-900/10" : "border-navy-700", "card-sm flex items-center gap-2.5 px-4 border"])}"><i class="${ssrRenderClass([unref(overdueItems).length ? "text-red-400" : "text-gray-600", "fa-solid fa-circle-exclamation"])}"></i><div><div class="${ssrRenderClass([unref(overdueItems).length ? "text-red-300" : "text-gray-500", "text-sm font-bold"])}">${ssrInterpolate(unref(overdueItems).length)} Overdue </div><div class="text-xs text-gray-600">Melewati jadwal</div></div></div><div class="${ssrRenderClass([unref(todayItems).length ? "border-yellow-700/50 bg-yellow-900/10" : "border-navy-700", "card-sm flex items-center gap-2.5 px-4 border"])}"><i class="${ssrRenderClass([unref(todayItems).length ? "text-yellow-400" : "text-gray-600", "fa-solid fa-calendar-day"])}"></i><div><div class="${ssrRenderClass([unref(todayItems).length ? "text-yellow-300" : "text-gray-500", "text-sm font-bold"])}">${ssrInterpolate(unref(todayItems).length)} Hari Ini </div><div class="text-xs text-gray-600">Jadwal hari ini</div></div></div><div class="card-sm flex items-center gap-2.5 px-4 border border-navy-700"><i class="fa-solid fa-calendar-week text-blue-400"></i><div><div class="text-sm font-bold text-blue-300">${ssrInterpolate(unref(upcomingItems).length)} Mendatang</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(data).days)} hari ke depan</div></div></div></div><!--[-->`);
        ssrRenderList(unref(scheduleGroups), (group) => {
          _push(`<!--[-->`);
          if (group.items.length) {
            _push(`<div class="mb-6"><div class="${ssrRenderClass([group.status === "Overdue" ? "text-red-400" : group.status === "Today" ? "text-yellow-400" : "text-blue-400", "section-title mb-3"])}"><i class="${ssrRenderClass(`fa-solid ${group.icon} mr-1.5`)}"></i> ${ssrInterpolate(group.label)} (${ssrInterpolate(group.items.length)}) </div><div class="card overflow-x-auto"><table class="tbl"><thead><tr><th>Perusahaan</th><th>Stage</th><th>Prioritas</th><th>Next FU</th><th>Sales</th><th class="text-right">Nilai</th><th></th></tr></thead><tbody><!--[-->`);
            ssrRenderList(group.items, (l) => {
              _push(`<tr class="${ssrRenderClass(group.status === "Overdue" ? "bg-red-900/5" : group.status === "Today" ? "bg-yellow-900/5" : "")}"><td>`);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/pipeline/${l.lead_id}`,
                class: "text-primary-300 hover:text-primary-200 font-medium"
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
              if (l.product) {
                _push(`<div class="text-xs text-gray-600 mt-0.5">${ssrInterpolate(l.product)}</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</td><td><span class="${ssrRenderClass(unref(fmt).stageClass(l.stage))}">${ssrInterpolate(l.stage)}</span></td><td><span class="${ssrRenderClass(unref(fmt).priorityClass(l.prioritas))}">${ssrInterpolate(l.prioritas)}</span></td><td class="${ssrRenderClass([group.status === "Overdue" ? "text-red-400" : group.status === "Today" ? "text-yellow-400" : "text-blue-400", "text-xs font-medium"])}">${ssrInterpolate(unref(fmt).tgl(l.next_fu_date))} `);
              if (group.status === "Overdue") {
                _push(`<span class="block text-red-500/70">${ssrInterpolate(overdayCount(l.next_fu_date))} hari lalu </span>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</td><td class="text-xs text-gray-400">${ssrInterpolate(l.sales_owner || "\u2014")}</td><td class="text-right text-xs text-primary-300 font-medium">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</td><td class="text-right">`);
              _push(ssrRenderComponent(_component_NuxtLink, {
                to: `/pipeline/${l.lead_id}`,
                class: "text-xs text-primary-400 hover:text-primary-300 whitespace-nowrap"
              }, {
                default: withCtx((_, _push2, _parent2, _scopeId) => {
                  if (_push2) {
                    _push2(` FU \u2192 `);
                  } else {
                    return [
                      createTextVNode(" FU \u2192 ")
                    ];
                  }
                }),
                _: 2
              }, _parent));
              _push(`</td></tr>`);
            });
            _push(`<!--]--></tbody></table></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]-->`);
        if (!unref(data).total) {
          _push(`<div class="card text-center py-12"><i class="fa-solid fa-calendar-check text-emerald-400 text-4xl mb-3 block"></i><div class="text-base font-semibold text-gray-300 mb-1">Tidak ada jadwal FU</div><div class="text-sm text-gray-500">Semua follow-up sudah terlaksana atau belum ada yang dijadwalkan</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/schedule.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=schedule-9tfQGhjA.mjs.map
