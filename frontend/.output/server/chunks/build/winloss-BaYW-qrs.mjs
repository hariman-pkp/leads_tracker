import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { defineComponent, withAsyncContext, computed, reactive, ref, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrInterpolate, ssrRenderAttr, ssrRenderClass, ssrRenderStyle, ssrRenderList, ssrRenderComponent, ssrRenderTeleport, ssrIncludeBooleanAttr } from 'vue/server-renderer';
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
  __name: "winloss",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("winloss", () => get("/v1/winloss"), { server: false })), __temp = await __temp, __restore(), __temp);
    const total = computed(() => {
      var _a, _b, _c, _d, _e, _f;
      return ((_c = (_b = (_a = data.value) == null ? void 0 : _a.summary) == null ? void 0 : _b.won) != null ? _c : 0) + ((_f = (_e = (_d = data.value) == null ? void 0 : _d.summary) == null ? void 0 : _e.lost) != null ? _f : 0);
    });
    const wonPct = computed(() => {
      var _a, _b, _c;
      return total.value ? Math.round(((_c = (_b = (_a = data.value) == null ? void 0 : _a.summary) == null ? void 0 : _b.won) != null ? _c : 0) / total.value * 100) : 0;
    });
    const lostPct = computed(() => {
      var _a, _b, _c;
      return total.value ? Math.round(((_c = (_b = (_a = data.value) == null ? void 0 : _a.summary) == null ? void 0 : _b.lost) != null ? _c : 0) / total.value * 100) : 0;
    });
    const modal = reactive({ open: false, lead: null });
    const form = reactive({ alasan: "", kompetitor: "", lesson_learned: "" });
    const saving = ref(false);
    const saveError = ref("");
    const saveSuccess = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<!--[--><div><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-trophy text-yellow-400 mr-2"></i>Win / Loss</h1><p class="page-subtitle">Analisis closed deals \u2014 ${ssrInterpolate((_a = unref(data)) == null ? void 0 : _a.tahun)}</p></div></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-16"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-5"><div class="card col-span-2 md:col-span-1 flex flex-col items-center justify-center py-4"><div class="text-xs text-gray-500 uppercase tracking-wider mb-2">Win Rate</div><div class="relative w-20 h-20 mb-2"><svg class="w-full h-full -rotate-90" viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="none" stroke="#1e293b" stroke-width="12"></circle><circle cx="50" cy="50" r="38" fill="none"${ssrRenderAttr("stroke", unref(data).summary.win_rate >= 50 ? "#34d399" : unref(data).summary.win_rate >= 30 ? "#facc15" : "#f87171")} stroke-width="12" stroke-linecap="round"${ssrRenderAttr("stroke-dasharray", `${unref(data).summary.win_rate * 2.39} 239`)}></circle></svg><div class="absolute inset-0 flex items-center justify-center"><span class="text-xl font-bold text-white">${ssrInterpolate(unref(data).summary.win_rate)}%</span></div></div><div class="${ssrRenderClass([unref(data).summary.win_rate >= 50 ? "text-emerald-400" : unref(data).summary.win_rate >= 30 ? "text-yellow-400" : "text-red-400", "text-xs"])}">${ssrInterpolate(unref(data).summary.win_rate >= 50 ? "Baik" : unref(data).summary.win_rate >= 30 ? "Cukup" : "Perlu Ditingkatkan")}</div></div><div class="stat-card"><div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-trophy"></i></div><div><div class="stat-value text-emerald-400">${ssrInterpolate(unref(data).summary.won)}</div><div class="stat-label">Total Won</div><div class="text-xs text-emerald-300/70 mt-0.5">${ssrInterpolate(unref(fmt).rupiah(unref(data).summary.won_value))}</div></div></div><div class="stat-card"><div class="stat-icon bg-red-900/40 text-red-400"><i class="fa-solid fa-times-circle"></i></div><div><div class="stat-value text-red-400">${ssrInterpolate(unref(data).summary.lost)}</div><div class="stat-label">Total Lost</div><div class="text-xs text-red-300/70 mt-0.5">${ssrInterpolate(unref(fmt).rupiah(unref(data).summary.lost_value))}</div></div></div><div class="stat-card"><div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-coins"></i></div><div><div class="stat-value text-primary-300">${ssrInterpolate(unref(fmt).rupiah(unref(data).summary.avg_deal))}</div><div class="stat-label">Avg Deal Won</div></div></div><div class="stat-card"><div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-scale-balanced"></i></div><div><div class="stat-value text-white">${ssrInterpolate(unref(data).summary.won + unref(data).summary.lost)}</div><div class="stat-label">Total Closed</div></div></div></div><div class="card mb-5"><div class="section-title mb-3"><i class="fa-solid fa-scale-balanced mr-1.5"></i>Perbandingan Won vs Lost</div><div class="flex items-center gap-3 mb-2"><span class="text-xs text-emerald-400 w-8 text-right">${ssrInterpolate(unref(data).summary.won)}</span><div class="flex-1 flex h-6 rounded-full overflow-hidden bg-apex-card"><div class="bg-emerald-500 transition-all duration-700 flex items-center justify-center" style="${ssrRenderStyle(`width:${unref(wonPct)}%`)}">`);
        if (unref(wonPct) > 15) {
          _push(`<span class="text-xs font-bold text-white">${ssrInterpolate(unref(wonPct))}%</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="bg-red-500 transition-all duration-700 flex items-center justify-center" style="${ssrRenderStyle(`width:${unref(lostPct)}%`)}">`);
        if (unref(lostPct) > 15) {
          _push(`<span class="text-xs font-bold text-white">${ssrInterpolate(unref(lostPct))}%</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><span class="text-xs text-red-400 w-8">${ssrInterpolate(unref(data).summary.lost)}</span></div><div class="flex justify-between text-xs text-gray-600 px-8"><span>Won (${ssrInterpolate(unref(fmt).rupiah(unref(data).summary.won_value))})</span><span>Lost (${ssrInterpolate(unref(fmt).rupiah(unref(data).summary.lost_value))})</span></div></div><div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5"><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-box-open mr-1.5 text-primary-400"></i>Per Produk</div><div class="space-y-2.5"><!--[-->`);
        ssrRenderList(unref(data).by_product, (p) => {
          _push(`<div class="flex items-center gap-2"><span class="text-xs text-gray-400 truncate flex-1">${ssrInterpolate(p.product)}</span><div class="flex items-center gap-1 flex-shrink-0">`);
          if (p.won) {
            _push(`<span class="text-xs px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300">${ssrInterpolate(p.won)}W</span>`);
          } else {
            _push(`<!---->`);
          }
          if (p.lost) {
            _push(`<span class="text-xs px-1.5 py-0.5 rounded bg-red-900/50 text-red-300">${ssrInterpolate(p.lost)}L</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        });
        _push(`<!--]--></div></div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-building mr-1.5 text-primary-400"></i>Per Segmen</div><div class="space-y-2.5"><!--[-->`);
        ssrRenderList(unref(data).by_segmen, (sg) => {
          _push(`<div><div class="flex items-center justify-between mb-1"><span class="text-xs text-gray-400">${ssrInterpolate(sg.segmen)}</span><div class="flex items-center gap-1">`);
          if (sg.won) {
            _push(`<span class="text-xs px-1.5 py-0.5 rounded bg-emerald-900/50 text-emerald-300">${ssrInterpolate(sg.won)}W</span>`);
          } else {
            _push(`<!---->`);
          }
          if (sg.lost) {
            _push(`<span class="text-xs px-1.5 py-0.5 rounded bg-red-900/50 text-red-300">${ssrInterpolate(sg.lost)}L</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="flex h-2 rounded overflow-hidden bg-apex-card"><div class="bg-emerald-500" style="${ssrRenderStyle(`width:${sg.won + sg.lost ? sg.won / (sg.won + sg.lost) * 100 : 0}%`)}"></div><div class="bg-red-500" style="${ssrRenderStyle(`width:${sg.won + sg.lost ? sg.lost / (sg.won + sg.lost) * 100 : 0}%`)}"></div></div></div>`);
        });
        _push(`<!--]--></div></div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-user-tie mr-1.5 text-primary-400"></i>Per Sales</div><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(data).by_sales, (s) => {
          _push(`<div class="flex items-center gap-3"><div class="w-7 h-7 rounded-full bg-primary-800/50 flex items-center justify-center text-xs font-bold text-primary-300 flex-shrink-0">${ssrInterpolate(s.sales_owner.charAt(0))}</div><div class="flex-1"><div class="flex justify-between text-xs mb-1"><span class="text-gray-300">${ssrInterpolate(s.sales_owner)}</span><span class="text-gray-500">${ssrInterpolate(s.won + s.lost)} closed</span></div><div class="flex h-2 rounded overflow-hidden bg-apex-card"><div class="bg-emerald-500" style="${ssrRenderStyle(`width:${s.won + s.lost ? s.won / (s.won + s.lost) * 100 : 0}%`)}"></div><div class="bg-red-500" style="${ssrRenderStyle(`width:${s.won + s.lost ? s.lost / (s.won + s.lost) * 100 : 0}%`)}"></div></div></div><div class="text-xs text-gray-500 flex-shrink-0 text-right"><span class="text-emerald-400">${ssrInterpolate(s.won)}W</span>/<span class="text-red-400">${ssrInterpolate(s.lost)}L</span></div></div>`);
        });
        _push(`<!--]-->`);
        if (!((_b = unref(data).by_sales) == null ? void 0 : _b.length)) {
          _push(`<div class="text-center text-gray-600 text-sm py-4">Belum ada data</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="card"><div class="section-title text-emerald-400 mb-3"><i class="fa-solid fa-trophy mr-1.5"></i>Deals Won (${ssrInterpolate((_c = unref(data).won_leads) == null ? void 0 : _c.length)}) </div>`);
        if ((_d = unref(data).won_leads) == null ? void 0 : _d.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).won_leads, (l) => {
            _push(`<div class="flex items-center gap-3 p-2.5 rounded-lg bg-emerald-900/10 border border-emerald-900/30"><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-sm font-medium text-gray-200 hover:text-primary-300 truncate block"
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
            _push(`<div class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(l.product || "\u2014")} \xB7 ${ssrInterpolate(l.segmen || "\u2014")} \xB7 ${ssrInterpolate(l.sales_owner || "\u2014")}</div></div><div class="text-right flex-shrink-0 flex flex-col items-end gap-1"><div class="text-sm font-bold text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(l.deal_value || l.propose_value))}</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).tgl(l.exp_close_date || l.updated_at))}</div><button class="text-xs px-2 py-0.5 rounded bg-emerald-800/60 border border-emerald-700/50 text-emerald-300 hover:bg-emerald-700/60 transition-colors"> Catat Alasan </button></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6 text-gray-600 text-sm">Belum ada deal yang Won</div>`);
        }
        _push(`</div><div class="card"><div class="section-title text-red-400 mb-3"><i class="fa-solid fa-times-circle mr-1.5"></i>Deals Lost (${ssrInterpolate((_e = unref(data).lost_leads) == null ? void 0 : _e.length)}) </div>`);
        if ((_f = unref(data).lost_leads) == null ? void 0 : _f.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).lost_leads, (l) => {
            _push(`<div class="flex items-center gap-3 p-2.5 rounded-lg bg-red-900/10 border border-red-900/30"><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-sm font-medium text-gray-200 hover:text-primary-300 truncate block"
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
            _push(`<div class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(l.product || "\u2014")} \xB7 ${ssrInterpolate(l.segmen || "\u2014")} \xB7 ${ssrInterpolate(l.sales_owner || "\u2014")}</div>`);
            if (l.last_fu_notes) {
              _push(`<div class="text-xs text-gray-600 truncate italic mt-0.5">&quot;${ssrInterpolate(l.last_fu_notes)}&quot;</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-right flex-shrink-0 flex flex-col items-end gap-1"><div class="text-sm font-bold text-red-400">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).tgl(l.updated_at))}</div><button class="text-xs px-2 py-0.5 rounded bg-red-800/60 border border-red-700/50 text-red-300 hover:bg-red-700/60 transition-colors"> Catat Alasan </button></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6 text-gray-600 text-sm">Belum ada deals yang Lost</div>`);
        }
        _push(`</div></div><!--]-->`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        var _a2, _b2, _c2;
        if (unref(modal).open) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"><div class="bg-apex-surface border border-apex-border rounded-xl w-full max-w-lg p-6 shadow-2xl"><div class="flex items-start justify-between mb-4"><div><h3 class="text-base font-bold text-gray-100">Catat Alasan ${ssrInterpolate((_a2 = unref(modal).lead) == null ? void 0 : _a2.stage)}</h3><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate((_b2 = unref(modal).lead) == null ? void 0 : _b2.nama_company)}</p></div><button class="text-gray-500 hover:text-gray-300 text-xl leading-none">\xD7</button></div><div class="space-y-4"><div><label class="block text-xs font-medium text-gray-400 mb-1">Alasan ${ssrInterpolate((_c2 = unref(modal).lead) == null ? void 0 : _c2.stage)} <span class="text-red-400">*</span></label><textarea rows="3" placeholder="Jelaskan alasan utama..." class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-primary-500 resize-none">${ssrInterpolate(unref(form).alasan)}</textarea></div><div><label class="block text-xs font-medium text-gray-400 mb-1">Kompetitor (jika ada)</label><input${ssrRenderAttr("value", unref(form).kompetitor)} type="text" placeholder="Nama kompetitor..." class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-primary-500"></div><div><label class="block text-xs font-medium text-gray-400 mb-1">Lesson Learned</label><textarea rows="2" placeholder="Apa yang bisa dipelajari..." class="w-full bg-apex-input border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:outline-none focus:border-primary-500 resize-none">${ssrInterpolate(unref(form).lesson_learned)}</textarea></div></div><div class="flex gap-3 mt-5"><button class="flex-1 px-4 py-2 rounded-lg border border-apex-border text-sm text-apex-muted hover:bg-apex-card transition-colors">Batal</button><button${ssrIncludeBooleanAttr(unref(saving) || !unref(form).alasan.trim()) ? " disabled" : ""} class="flex-1 px-4 py-2 rounded-lg bg-primary-600 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">${ssrInterpolate(unref(saving) ? "Menyimpan..." : "Simpan")}</button></div>`);
          if (unref(saveError)) {
            _push2(`<p class="text-xs text-red-400 mt-3 text-center">${ssrInterpolate(unref(saveError))}</p>`);
          } else {
            _push2(`<!---->`);
          }
          if (unref(saveSuccess)) {
            _push2(`<p class="text-xs text-emerald-400 mt-3 text-center">Alasan berhasil disimpan!</p>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/winloss.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=winloss-BaYW-qrs.mjs.map
