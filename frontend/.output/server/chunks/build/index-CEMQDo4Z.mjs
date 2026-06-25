import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { _ as __nuxt_component_1 } from './AppPagination-DUr1sfAX.mjs';
import { defineComponent, withAsyncContext, ref, computed, unref, withCtx, createTextVNode, createVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrIncludeBooleanAttr, ssrRenderClass, ssrRenderAttr, ssrRenderStyle, ssrRenderComponent, ssrRenderList } from 'vue/server-renderer';
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
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import 'perfect-debounce';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("dashboard", () => get("/v1/dashboard"), { server: false })), __temp = await __temp, __restore(), __temp);
    const overduePage = ref(1);
    const overduePerPage = ref(10);
    const overdue = ref({ data: [], total: 0, total_pages: 1 });
    async function loadOverdue() {
      overdue.value = await get("/v1/dashboard/overdue-fu", { page: overduePage.value, per_page: overduePerPage.value });
    }
    const activityPage = ref(1);
    const activityPerPage = ref(10);
    const activity = ref({ data: [], total: 0, total_pages: 1 });
    async function loadActivity() {
      activity.value = await get("/v1/dashboard/recent-activity", { page: activityPage.value, per_page: activityPerPage.value });
    }
    const todayLabel = computed(
      () => (/* @__PURE__ */ new Date()).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    );
    const s = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const st = (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
      return {
        total: Number((_c = st.total) != null ? _c : 0),
        won: Number((_d = st.won) != null ? _d : 0),
        lost: Number((_e = st.lost) != null ? _e : 0),
        on_hold: Number((_f = st.on_hold) != null ? _f : 0),
        aktif: Number((_g = st.aktif) != null ? _g : 0),
        unassigned: Number((_h = st.unassigned) != null ? _h : 0),
        stale: Number((_i = st.stale) != null ? _i : 0),
        overdue_fu: Number((_j = st.overdue_fu) != null ? _j : 0),
        total_pipeline: Number((_k = st.total_pipeline) != null ? _k : 0),
        active_pipeline: Number((_l = st.active_pipeline) != null ? _l : 0),
        weighted_pipeline: Number((_m = st.weighted_pipeline) != null ? _m : 0),
        total_won: Number((_n = st.total_won) != null ? _n : 0),
        onhold_value: Number((_o = st.onhold_value) != null ? _o : 0)
      };
    });
    const winRate = computed(() => {
      const closed = s.value.won + s.value.lost;
      return closed ? Math.round(s.value.won / closed * 100) : 0;
    });
    const STAGE_COLORS = {
      "New": "#60a5fa",
      "In Progress": "#a78bfa",
      "Demo Scheduled": "#f472b6",
      "Proposal Sent": "#fb923c",
      "Negotiation": "#facc15",
      "Won": "#34d399",
      "On Hold": "#94a3b8",
      "Lost": "#f87171"
    };
    const stageFunnel = computed(() => {
      var _a, _b;
      const rows = (_b = (_a = data.value) == null ? void 0 : _a.by_stage) != null ? _b : [];
      const max = Math.max(...rows.map((r) => Number(r.jumlah)), 1);
      return rows.map((r) => {
        var _a2;
        return {
          ...r,
          pct: Math.round(Number(r.jumlah) / max * 100),
          color: (_a2 = STAGE_COLORS[r.stage]) != null ? _a2 : "#64748b"
        };
      });
    });
    const healthColor = computed(() => {
      var _a, _b;
      const h = (_b = (_a = data.value) == null ? void 0 : _a.health_score) != null ? _b : 0;
      return h >= 70 ? "#34d399" : h >= 40 ? "#facc15" : "#f87171";
    });
    const healthLabel = computed(() => {
      var _a, _b;
      const h = (_b = (_a = data.value) == null ? void 0 : _a.health_score) != null ? _b : 0;
      return h >= 70 ? "Sehat" : h >= 40 ? "Perlu Perhatian" : "Kritis";
    });
    const healthDesc = computed(() => {
      var _a, _b;
      const h = (_b = (_a = data.value) == null ? void 0 : _a.health_score) != null ? _b : 0;
      return h >= 70 ? "Pipeline berjalan baik" : h >= 40 ? "Ada beberapa masalah yang perlu ditangani" : "Pipeline butuh intervensi segera";
    });
    function metodeIcon(m) {
      var _a;
      const map = {
        "WhatsApp": "fa-whatsapp",
        "Email": "fa-envelope",
        "Telepon": "fa-phone",
        "Meeting": "fa-handshake",
        "Demo": "fa-desktop"
      };
      return (_a = map[m]) != null ? _a : "fa-comment";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-tachometer-alt text-primary-400 mr-2"></i>Dashboard</h1><p class="page-subtitle">${ssrInterpolate(unref(todayLabel))}</p></div><button class="btn-secondary btn-sm"${ssrIncludeBooleanAttr(unref(pending)) ? " disabled" : ""}><i class="${ssrRenderClass(`fa-solid fa-rotate ${unref(pending) ? "fa-spin" : ""}`)}"></i>Refresh </button></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-24"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-5"><div class="stat-card"><div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-briefcase"></i></div><div><div class="stat-value">${ssrInterpolate(unref(fmt).num(unref(s).total))}</div><div class="stat-label">Total Leads</div></div></div><div class="stat-card"><div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-fire"></i></div><div><div class="stat-value text-primary-300">${ssrInterpolate(unref(fmt).num(unref(s).aktif))}</div><div class="stat-label">Aktif</div></div></div><div class="stat-card"><div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-trophy"></i></div><div><div class="stat-value text-emerald-400">${ssrInterpolate(unref(fmt).num(unref(s).won))}</div><div class="stat-label">Won (${ssrInterpolate(unref(winRate))}%)</div></div></div><div class="stat-card"><div class="stat-icon bg-yellow-900/40 text-yellow-400"><i class="fa-solid fa-pause-circle"></i></div><div><div class="stat-value text-yellow-400">${ssrInterpolate(unref(fmt).num(unref(s).on_hold))}</div><div class="stat-label">On Hold</div></div></div><div class="stat-card"><div class="stat-icon bg-orange-900/40 text-orange-400"><i class="fa-solid fa-hourglass-half"></i></div><div><div class="stat-value text-orange-400">${ssrInterpolate(unref(fmt).num(unref(s).stale))}</div><div class="stat-label">Stale &gt;30hr</div></div></div><div class="stat-card"><div class="stat-icon bg-gray-800 text-gray-400"><i class="fa-solid fa-user-slash"></i></div><div><div class="stat-value text-gray-300">${ssrInterpolate(unref(fmt).num(unref(s).unassigned))}</div><div class="stat-label">Unassigned</div></div></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5"><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-funnel-dollar mr-1.5 text-primary-400"></i>Nilai Pipeline</div><div class="space-y-2.5"><div class="flex justify-between items-end"><span class="text-xs text-gray-500">Total Propose</span><span class="text-sm font-semibold text-white">${ssrInterpolate(unref(fmt).rupiah(unref(s).total_pipeline))}</span></div><div class="flex justify-between items-end"><span class="text-xs text-gray-500">Active Pipeline</span><span class="text-base font-bold text-primary-300">${ssrInterpolate(unref(fmt).rupiah(unref(s).active_pipeline))}</span></div><div class="flex justify-between items-end"><span class="text-xs text-gray-500">Weighted (prob)</span><span class="text-sm font-semibold text-blue-300">${ssrInterpolate(unref(fmt).rupiah(unref(s).weighted_pipeline))}</span></div><div class="h-px bg-navy-700 my-1"></div><div class="flex justify-between items-end"><span class="text-xs text-gray-500">Total Won</span><span class="text-sm font-semibold text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(s).total_won))}</span></div></div></div><div class="card flex flex-col items-center justify-center text-center"><div class="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Pipeline Health Score</div><div class="relative w-28 h-28 mb-3"><svg class="w-full h-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" stroke-width="10"></circle><circle cx="50" cy="50" r="40" fill="none"${ssrRenderAttr("stroke", unref(healthColor))} stroke-width="10" stroke-linecap="round"${ssrRenderAttr("stroke-dasharray", `${unref(data).health_score * 2.51} 251`)} style="${ssrRenderStyle({ "transition": "stroke-dasharray 1s ease" })}"></circle></svg><div class="absolute inset-0 flex flex-col items-center justify-center"><span class="text-3xl font-bold text-white">${ssrInterpolate(unref(data).health_score)}</span><span class="text-xs text-gray-500">/ 100</span></div></div><div class="${ssrRenderClass([unref(healthColor) === "#34d399" ? "text-emerald-400" : unref(healthColor) === "#facc15" ? "text-yellow-400" : "text-red-400", "text-sm font-semibold"])}">${ssrInterpolate(unref(healthLabel))}</div><p class="text-xs text-gray-500 mt-1 max-w-36">${ssrInterpolate(unref(healthDesc))}</p></div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-chart-line mr-1.5 text-emerald-400"></i>Revenue Bulan Ini</div><div class="mb-3"><div class="flex justify-between text-xs text-gray-500 mb-1.5"><span>Aktual</span><span>Target</span></div><div class="flex justify-between text-sm font-semibold mb-2"><span class="text-white">${ssrInterpolate(unref(fmt).rupiah(unref(data).rev_actual))}</span><span class="text-gray-400">${ssrInterpolate(unref(fmt).rupiah(unref(data).rev_target))}</span></div><div class="h-3 bg-navy-800 rounded-full overflow-hidden"><div class="${ssrRenderClass([unref(data).rev_ach >= 80 ? "bg-emerald-500" : unref(data).rev_ach >= 50 ? "bg-yellow-500" : "bg-red-500", "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width: ${Math.min(unref(data).rev_ach, 100)}%`)}"></div></div><div class="flex justify-between mt-2"><span class="text-xs text-gray-500">Pencapaian</span><span class="${ssrRenderClass([unref(data).rev_ach >= 80 ? "text-emerald-400" : unref(data).rev_ach >= 50 ? "text-yellow-400" : "text-red-400", "text-sm font-bold"])}">${ssrInterpolate(unref(data).rev_ach)}% </span></div></div><div class="h-px bg-navy-700/60 my-3"></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/revenue",
          class: "btn-secondary btn-sm w-full justify-center text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Detail Revenue <i class="fa-solid fa-arrow-right ml-1"${_scopeId}></i>`);
            } else {
              return [
                createTextVNode(" Detail Revenue "),
                createVNode("i", { class: "fa-solid fa-arrow-right ml-1" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5"><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-layer-group mr-1.5"></i>Pipeline per Stage</div><div class="space-y-2"><!--[-->`);
        ssrRenderList(unref(stageFunnel), (s2) => {
          _push(`<div class="flex items-center gap-2"><span class="w-24 text-xs text-gray-300 truncate flex-shrink-0">${ssrInterpolate(s2.stage)}</span><div class="flex-1 h-4 bg-navy-800 rounded overflow-hidden"><div class="h-full rounded" style="${ssrRenderStyle(`width:${s2.pct}%; background:${s2.color}`)}"></div></div><span class="text-xs font-semibold w-8 text-right flex-shrink-0" style="${ssrRenderStyle(`color:${s2.color}`)}">${ssrInterpolate(unref(fmt).num(s2.jumlah))}</span><span class="text-xs text-gray-600 w-16 text-right flex-shrink-0">${ssrInterpolate(unref(fmt).rupiah(s2.total_nilai))}</span></div>`);
        });
        _push(`<!--]--></div></div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-building mr-1.5"></i>Per Segmen</div><div class="space-y-2.5"><!--[-->`);
        ssrRenderList(unref(data).by_segmen, (sg) => {
          _push(`<div class="flex items-center gap-2"><span class="w-24 text-xs text-gray-300 truncate flex-shrink-0">${ssrInterpolate(sg.segmen)}</span><div class="flex-1 h-3 bg-navy-800 rounded overflow-hidden"><div class="h-full rounded bg-primary-600" style="${ssrRenderStyle(`width:${Math.round(sg.jumlah / unref(s).total * 100)}%`)}"></div></div><span class="text-xs text-gray-400 w-8 text-right flex-shrink-0">${ssrInterpolate(unref(fmt).num(sg.jumlah))}</span><span class="text-xs text-gray-600 w-14 text-right flex-shrink-0">${ssrInterpolate(unref(fmt).rupiah(sg.total_nilai))}</span></div>`);
        });
        _push(`<!--]--></div><div class="mt-4 pt-3 border-t border-navy-800"><div class="section-title mb-2 text-xs"><i class="fa-solid fa-share-nodes mr-1"></i>Sumber Lead</div><div class="flex flex-wrap gap-2"><!--[-->`);
        ssrRenderList(unref(data).by_source, (src) => {
          _push(`<div class="flex-1 min-w-0 bg-navy-800/60 rounded-lg px-2 py-1.5 text-center"><div class="text-sm font-bold text-white">${ssrInterpolate(src.jumlah)}</div><div class="text-xs text-gray-500 truncate">${ssrInterpolate(src.source)}</div></div>`);
        });
        _push(`<!--]--></div></div></div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-fire mr-1.5 text-orange-400"></i>Per Prioritas</div><div class="flex gap-3 mb-4"><!--[-->`);
        ssrRenderList(unref(data).by_priority, (p) => {
          _push(`<div class="${ssrRenderClass([p.prioritas === "Hot" ? "border-red-700/50 bg-red-900/20" : p.prioritas === "Warm" ? "border-yellow-700/50 bg-yellow-900/20" : "border-blue-700/50 bg-blue-900/20", "flex-1 rounded-lg p-3 text-center border"])}"><div class="${ssrRenderClass([p.prioritas === "Hot" ? "text-red-400" : p.prioritas === "Warm" ? "text-yellow-400" : "text-blue-400", "text-xl font-bold"])}">${ssrInterpolate(unref(fmt).num(p.jumlah))}</div><div class="text-xs text-gray-400 mt-0.5">${ssrInterpolate(p.prioritas)}</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).rupiah(p.total_nilai))}</div></div>`);
        });
        _push(`<!--]--></div><div class="section-title mb-2 text-xs"><i class="fa-solid fa-calendar-check mr-1 text-blue-400"></i>FU Mendatang</div><div class="space-y-1.5"><!--[-->`);
        ssrRenderList(unref(data).upcoming_fu, (fu) => {
          _push(`<div class="flex items-center gap-2 py-1 border-b border-navy-800/60 last:border-0">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/pipeline/${fu.lead_id}`,
            class: "flex-1 text-xs text-gray-300 hover:text-primary-300 truncate"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`${ssrInterpolate(fu.nama_company)}`);
              } else {
                return [
                  createTextVNode(toDisplayString(fu.nama_company), 1)
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<span class="text-xs text-gray-500 flex-shrink-0">${ssrInterpolate(unref(fmt).tgl(fu.next_fu_date))}</span></div>`);
        });
        _push(`<!--]-->`);
        if (!((_a = unref(data).upcoming_fu) == null ? void 0 : _a.length)) {
          _push(`<div class="text-xs text-gray-600 py-2 text-center"> Tidak ada jadwal FU minggu ini </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div>`);
        if ((_b = unref(data).by_organisasi) == null ? void 0 : _b.length) {
          _push(`<div class="card mb-5"><div class="section-title mb-3"><i class="fa-solid fa-sitemap mr-1.5 text-primary-400"></i>Per Organisasi</div><div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3"><!--[-->`);
          ssrRenderList(unref(data).by_organisasi, (org) => {
            _push(`<div class="bg-navy-800/50 rounded-lg p-3 border border-navy-700/50"><div class="flex items-center justify-between mb-2"><span class="font-mono text-xs bg-navy-700 text-primary-300 px-2 py-0.5 rounded font-semibold">${ssrInterpolate(org.organisasi)}</span><span class="text-xs text-gray-500">${ssrInterpolate(org.jumlah)} leads</span></div><div class="text-sm font-bold text-white mb-1">${ssrInterpolate(unref(fmt).rupiah(org.total_nilai))}</div><div class="h-px bg-navy-700/60 my-1.5"></div><div class="flex items-center justify-between text-xs text-gray-500"><span>Aktif: <span class="text-primary-300 font-medium">${ssrInterpolate(org.aktif)}</span></span><span>Won: <span class="text-emerald-400 font-medium">${ssrInterpolate(org.won)}</span></span></div><div class="mt-2 h-1.5 bg-navy-700 rounded-full overflow-hidden"><div class="h-full rounded-full bg-primary-600 transition-all" style="${ssrRenderStyle(`width:${unref(s).total > 0 ? Math.round(org.jumlah / unref(s).total * 100) : 0}%`)}"></div></div></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5"><div class="card"><div class="section-title text-emerald-400 mb-3"><i class="fa-solid fa-bullseye mr-1.5"></i>Siap Closing <span class="ml-auto text-xs text-gray-600 font-normal">(Proposal/Negosiasi)</span></div>`);
        if ((_c = unref(data).ready_to_close) == null ? void 0 : _c.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).ready_to_close.slice(0, 5), (l) => {
            var _a2;
            _push(`<div class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0"><span class="${ssrRenderClass([unref(fmt).priorityClass(l.prioritas), "flex-shrink-0 text-xs"])}">${ssrInterpolate(l.prioritas)}</span><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-xs text-gray-300 hover:text-primary-300 truncate block"
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
            if (l.organisasi) {
              _push(`<span class="font-mono text-[10px] text-primary-400">${ssrInterpolate(l.organisasi)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-right flex-shrink-0"><div class="text-xs font-semibold text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div><div class="text-xs text-gray-600">${ssrInterpolate((_a2 = l.probability) != null ? _a2 : "\u2014")}%</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6 text-xs text-gray-600">Belum ada leads di tahap ini</div>`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/insights",
          class: "mt-3 text-xs text-primary-400 hover:text-primary-300 flex items-center gap-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Lihat semua <i class="fa-solid fa-arrow-right text-xs"${_scopeId}></i>`);
            } else {
              return [
                createTextVNode(" Lihat semua "),
                createVNode("i", { class: "fa-solid fa-arrow-right text-xs" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="card"><div class="section-title text-red-400 mb-3"><i class="fa-solid fa-fire-flame-curved mr-1.5"></i>Hot Terabaikan <span class="ml-auto text-xs text-gray-600 font-normal">(&gt;14 hr tanpa FU)</span></div>`);
        if ((_d = unref(data).hot_stale) == null ? void 0 : _d.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).hot_stale.slice(0, 5), (l) => {
            _push(`<div class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0"><div class="w-6 h-6 rounded-full bg-red-900/40 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-fire text-red-400 text-xs"></i></div><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-xs text-gray-300 hover:text-primary-300 truncate block"
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
            if (l.organisasi) {
              _push(`<span class="font-mono text-[10px] text-primary-400">${ssrInterpolate(l.organisasi)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-right flex-shrink-0"><div class="text-xs font-bold text-red-400">${ssrInterpolate(l.days_since_fu >= 9999 ? "\u221E" : l.days_since_fu + "hr")}</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6"><i class="fa-solid fa-circle-check text-emerald-400 text-xl mb-1.5 block"></i><div class="text-xs text-gray-600">Semua Hot leads ter-follow-up</div></div>`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/today",
          class: "mt-3 text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Follow up sekarang <i class="fa-solid fa-arrow-right text-xs"${_scopeId}></i>`);
            } else {
              return [
                createTextVNode(" Follow up sekarang "),
                createVNode("i", { class: "fa-solid fa-arrow-right text-xs" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="card"><div class="section-title text-yellow-400 mb-3"><i class="fa-solid fa-calendar-check mr-1.5"></i>Deadline Terdekat </div>`);
        if ((_e = unref(data).closing_soon) == null ? void 0 : _e.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).closing_soon.slice(0, 5), (l) => {
            _push(`<div class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0"><div class="w-8 text-center flex-shrink-0"><div class="${ssrRenderClass([l.days_until_close <= 7 ? "text-red-400" : l.days_until_close <= 30 ? "text-yellow-400" : "text-gray-400", "text-sm font-bold"])}">${ssrInterpolate(l.days_until_close)}</div><div class="text-xs text-gray-600">hr</div></div><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-xs text-gray-300 hover:text-primary-300 truncate block"
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
            if (l.organisasi) {
              _push(`<span class="font-mono text-[10px] text-primary-400">${ssrInterpolate(l.organisasi)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-xs text-gray-500 flex-shrink-0">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6 text-xs text-gray-600">Tidak ada deadline terdekat</div>`);
        }
        _push(`</div><div class="card"><div class="section-title text-orange-400 mb-3"><i class="fa-solid fa-pause-circle mr-1.5"></i>On Hold at Risk <span class="ml-auto text-xs text-gray-600 font-normal">${ssrInterpolate(unref(fmt).rupiah(unref(s).onhold_value))}</span></div>`);
        if ((_f = unref(data).onhold_at_risk) == null ? void 0 : _f.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).onhold_at_risk.slice(0, 5), (l) => {
            _push(`<div class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0"><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-xs text-gray-300 hover:text-primary-300 truncate block"
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
            _push(`<div class="flex items-center gap-1.5"><span class="text-xs text-gray-600">${ssrInterpolate(l.sales_owner || "Unassigned")}</span>`);
            if (l.organisasi) {
              _push(`<span class="font-mono text-[10px] text-primary-400">\xB7 ${ssrInterpolate(l.organisasi)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div><div class="text-right flex-shrink-0"><div class="text-xs font-semibold text-orange-400">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div><div class="text-xs text-gray-600">${ssrInterpolate(l.days_idle >= 9999 ? "\u221E" : l.days_idle + "hr")} idle</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6 text-xs text-gray-600">Tidak ada leads On Hold</div>`);
        }
        _push(`</div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-triangle-exclamation text-yellow-400 mr-1.5"></i>Yang Perlu Perhatian Segera </div>`);
        if (unref(s).unassigned > 0) {
          _push(`<div class="flex items-center gap-3 bg-orange-900/20 border border-orange-700/40 rounded-lg px-3 py-2.5 mb-3"><i class="fa-solid fa-user-slash text-orange-400 text-sm flex-shrink-0"></i><div class="flex-1 text-xs text-orange-300"><strong>${ssrInterpolate(unref(s).unassigned)} leads</strong> belum ditugaskan ke sales </div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/pipeline",
            class: "btn-sm text-xs border border-orange-700/50 text-orange-300 rounded px-2 py-1 hover:bg-orange-900/30 flex-shrink-0"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Assign `);
              } else {
                return [
                  createTextVNode(" Assign ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(s).stale > 0) {
          _push(`<div class="flex items-center gap-3 bg-yellow-900/20 border border-yellow-700/40 rounded-lg px-3 py-2.5 mb-3"><i class="fa-solid fa-hourglass-end text-yellow-400 text-sm flex-shrink-0"></i><div class="flex-1 text-xs text-yellow-300"><strong>${ssrInterpolate(unref(s).stale)} leads</strong> tanpa follow-up lebih dari 30 hari </div>`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: "/today",
            class: "btn-sm text-xs border border-yellow-700/50 text-yellow-300 rounded px-2 py-1 hover:bg-yellow-900/30 flex-shrink-0"
          }, {
            default: withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(` Lihat `);
              } else {
                return [
                  createTextVNode(" Lihat ")
                ];
              }
            }),
            _: 1
          }, _parent));
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_g = unref(overdue).data) == null ? void 0 : _g.length) {
          _push(`<div><div class="flex items-center justify-between mb-2"><span class="text-xs text-gray-500">Overdue Follow-Up</span><span class="text-xs text-red-400">${ssrInterpolate(unref(fmt).num(unref(overdue).total))} total</span></div><!--[-->`);
          ssrRenderList(unref(overdue).data, (l) => {
            _push(`<div class="flex items-center gap-2 py-1.5 border-b border-navy-800 last:border-0"><span class="${ssrRenderClass([unref(fmt).priorityClass(l.prioritas), "flex-shrink-0"])}">${ssrInterpolate(l.prioritas)}</span>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "flex-1 text-xs text-gray-300 hover:text-primary-300 truncate"
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
            _push(`<span class="text-xs text-red-400 flex-shrink-0">${ssrInterpolate(l.days_overdue)}h lalu</span></div>`);
          });
          _push(`<!--]-->`);
          if (unref(overdue).total_pages > 1) {
            _push(ssrRenderComponent(_component_AppPagination, {
              class: "mt-3",
              page: unref(overduePage),
              "per-page": unref(overduePerPage),
              total: unref(overdue).total,
              "total-pages": unref(overdue).total_pages,
              "per-page-options": [5, 10],
              "onUpdate:page": ($event) => {
                overduePage.value = $event;
                loadOverdue();
              },
              "onUpdate:perPage": ($event) => {
                overduePerPage.value = $event;
                overduePage.value = 1;
                loadOverdue();
              }
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        if (!unref(s).unassigned && !unref(s).stale && !((_h = unref(overdue).data) == null ? void 0 : _h.length)) {
          _push(`<div class="text-center py-6 text-gray-500 text-sm"><i class="fa-solid fa-circle-check text-emerald-500 text-2xl mb-2 block"></i> Pipeline dalam kondisi baik! </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-clock-rotate-left text-primary-400 mr-1.5"></i>Aktivitas Terbaru <span class="ml-auto text-xs text-gray-600 font-normal">${ssrInterpolate(unref(fmt).num(unref(activity).total))} aktivitas</span></div>`);
        if ((_i = unref(activity).data) == null ? void 0 : _i.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(activity).data, (a) => {
            _push(`<div class="flex items-start gap-3 p-2.5 rounded-lg bg-navy-800/40 hover:bg-navy-800/70 transition-colors"><div class="w-8 h-8 rounded-full bg-primary-800/50 flex items-center justify-center flex-shrink-0 mt-0.5"><i class="${ssrRenderClass(`fa-solid ${metodeIcon(a.metode_fu)} text-xs text-primary-400`)}"></i></div><div class="flex-1 min-w-0"><div class="flex items-center justify-between gap-2">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${a.lead_id}`,
              class: "text-xs font-medium text-gray-200 hover:text-primary-300 truncate"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(a.nama_company)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(a.nama_company), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`<span class="text-xs text-gray-600 flex-shrink-0">${ssrInterpolate(unref(fmt).tgl(a.tgl_fu))}</span></div><div class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(a.metode_fu)} \xB7 ${ssrInterpolate(a.hasil_fu)}</div>`);
            if (a.catatan_fu) {
              _push(`<div class="text-xs text-gray-600 truncate mt-0.5">${ssrInterpolate(a.catatan_fu)}</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8 text-gray-600 text-sm"><i class="fa-solid fa-inbox text-2xl mb-2 block"></i> Belum ada aktivitas follow-up </div>`);
        }
        if (unref(activity).total_pages > 1) {
          _push(ssrRenderComponent(_component_AppPagination, {
            class: "mt-3",
            page: unref(activityPage),
            "per-page": unref(activityPerPage),
            total: unref(activity).total,
            "total-pages": unref(activity).total_pages,
            "per-page-options": [5, 10, 25],
            "onUpdate:page": ($event) => {
              activityPage.value = $event;
              loadActivity();
            },
            "onUpdate:perPage": ($event) => {
              activityPerPage.value = $event;
              activityPage.value = 1;
              loadActivity();
            }
          }, null, _parent));
        } else {
          _push(`<!---->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-CEMQDo4Z.mjs.map
