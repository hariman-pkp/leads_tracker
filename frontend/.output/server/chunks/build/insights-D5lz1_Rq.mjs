import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { defineComponent, withAsyncContext, computed, unref, withCtx, createTextVNode, toDisplayString, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderStyle, ssrRenderComponent, ssrRenderClass } from 'vue/server-renderer';
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
  __name: "insights",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const { data, pending } = ([__temp, __restore] = withAsyncContext(() => useAsyncData("insights", () => get("/v1/insights"), { server: false })), __temp = await __temp, __restore(), __temp);
    const st = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      const s = (_b = (_a = data.value) == null ? void 0 : _a.stats) != null ? _b : {};
      return {
        total: Number((_c = s.total) != null ? _c : 0),
        won: Number((_d = s.won) != null ? _d : 0),
        lost: Number((_e = s.lost) != null ? _e : 0),
        on_hold: Number((_f = s.on_hold) != null ? _f : 0),
        aktif: Number((_g = s.aktif) != null ? _g : 0),
        unassigned: Number((_h = s.unassigned) != null ? _h : 0),
        total_pipeline: Number((_i = s.total_pipeline) != null ? _i : 0),
        active_pipeline: Number((_j = s.active_pipeline) != null ? _j : 0),
        weighted_pipeline: Number((_k = s.weighted_pipeline) != null ? _k : 0),
        total_won: Number((_l = s.total_won) != null ? _l : 0)
      };
    });
    const winRate = computed(() => {
      const c = st.value.won + st.value.lost;
      return c ? Math.round(st.value.won / c * 100) : 0;
    });
    const staleCount = computed(() => {
      var _a, _b, _c;
      return (_c = (_b = (_a = data.value) == null ? void 0 : _a.stale_leads) == null ? void 0 : _b.length) != null ? _c : 0;
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
    const monthlyMax = computed(
      () => {
        var _a, _b;
        return Math.max(...((_b = (_a = data.value) == null ? void 0 : _a.monthly_trend) != null ? _b : []).map((m) => Number(m.jumlah)), 1);
      }
    );
    const velocityMax = computed(
      () => {
        var _a, _b;
        return Math.max(...((_b = (_a = data.value) == null ? void 0 : _a.velocity) != null ? _b : []).map((v) => Number(v.avg_days)), 1);
      }
    );
    const salesMax = computed(
      () => {
        var _a, _b;
        return Math.max(...((_b = (_a = data.value) == null ? void 0 : _a.by_sales) != null ? _b : []).map((s) => Number(s.jumlah)), 1);
      }
    );
    const totalWeighted = computed(
      () => {
        var _a, _b;
        return ((_b = (_a = data.value) == null ? void 0 : _a.weighted_forecast) != null ? _b : []).reduce((sum, w) => sum + Number(w.weighted_value), 0);
      }
    );
    const rootCauses = computed(() => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const causes = [];
      const s = st.value;
      const total = s.total || 1;
      if (s.unassigned > 0) {
        const pct = Math.round(s.unassigned / total * 100);
        causes.push({
          level: pct > 20 ? "critical" : "warning",
          icon: "fa-user-slash",
          title: `${s.unassigned} Leads Belum Ditugaskan`,
          desc: `${pct}% dari total leads tidak memiliki sales owner. Leads tanpa PIC cenderung terabaikan dan tidak termonitoring.`
        });
      }
      const staleLen = (_c = (_b = (_a = data.value) == null ? void 0 : _a.stale_leads) == null ? void 0 : _b.length) != null ? _c : 0;
      if (staleLen > 0) {
        const pct = Math.round(staleLen / total * 100);
        causes.push({
          level: pct > 30 ? "critical" : pct > 10 ? "warning" : "info",
          icon: "fa-hourglass-end",
          title: `${staleLen} Leads Stale >30 Hari`,
          desc: `${pct}% leads tidak di-follow-up lebih dari 30 hari. Peluang hilang karena tidak dipelihara.`
        });
      }
      const hotStaleLen = (_f = (_e = (_d = data.value) == null ? void 0 : _d.hot_stale) == null ? void 0 : _e.length) != null ? _f : 0;
      if (hotStaleLen > 0) {
        causes.push({
          level: "critical",
          icon: "fa-fire-flame-curved",
          title: `${hotStaleLen} Hot Leads Terabaikan`,
          desc: `Hot leads dengan prioritas tinggi tidak di-FU >14 hari. Risiko kehilangan peluang bernilai tinggi.`
        });
      }
      if (winRate.value < 30 && s.won + s.lost > 2) {
        causes.push({
          level: "warning",
          icon: "fa-chart-line",
          title: `Win Rate Rendah (${winRate.value}%)`,
          desc: `Win rate di bawah 30% menunjukkan proses closing perlu diperbaiki atau kualitas lead masuk perlu ditingkatkan.`
        });
      }
      const velocity = (_h = (_g = data.value) == null ? void 0 : _g.velocity) != null ? _h : [];
      const slowStages = velocity.filter((v) => Number(v.avg_days) > 30);
      if (slowStages.length > 0) {
        causes.push({
          level: "warning",
          icon: "fa-gauge-low",
          title: `Stage Lambat: ${slowStages.map((v) => v.stage).slice(0, 2).join(", ")}`,
          desc: `Rata-rata >30 hari di stage tersebut menunjukkan bottleneck. Perlu evaluasi proses dan hambatan yang terjadi.`
        });
      }
      const sourceConv = (_j = (_i = data.value) == null ? void 0 : _i.source_conversion) != null ? _j : [];
      const lowConvSrc = sourceConv.filter((s2) => s2.total >= 5 && s2.won + s2.lost > 0 && s2.won / (s2.won + s2.lost) < 0.2);
      if (lowConvSrc.length > 0) {
        causes.push({
          level: "info",
          icon: "fa-share-nodes",
          title: `Sumber Konversi Rendah`,
          desc: `Sumber ${lowConvSrc.slice(0, 2).map((s2) => s2.source).join(", ")} memiliki win rate <20%. Evaluasi kualitas lead dari sumber ini.`
        });
      }
      const onHoldLen = (_m = (_l = (_k = data.value) == null ? void 0 : _k.onhold_risk) == null ? void 0 : _l.length) != null ? _m : 0;
      if (onHoldLen > 0) {
        const onHoldVal = ((_o = (_n = data.value) == null ? void 0 : _n.onhold_risk) != null ? _o : []).reduce((sum, l) => sum + Number(l.propose_value), 0);
        causes.push({
          level: "warning",
          icon: "fa-pause-circle",
          title: `${onHoldLen} Leads On Hold (${fmt.rupiah(onHoldVal)})`,
          desc: `Nilai pipeline tertahan. Re-evaluasi apakah leads ini bisa diaktifkan kembali atau harus di-drop.`
        });
      }
      if (causes.length === 0) {
        causes.push({
          level: "info",
          icon: "fa-circle-check",
          title: "Pipeline dalam Kondisi Baik",
          desc: "Tidak ada masalah kritis yang terdeteksi. Pertahankan konsistensi follow-up dan monitoring."
        });
      }
      return causes;
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-lightbulb text-yellow-400 mr-2"></i>Pipeline Insights</h1><p class="page-subtitle">Analisis mendalam \u2014 apa yang terjadi, kenapa, dan apa yang harus dilakukan</p></div></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="flex items-center gap-3 mb-4"><div class="w-8 h-8 rounded-full bg-blue-900/60 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">1</div><div><h2 class="text-base font-bold text-white">Apa yang Terjadi?</h2><p class="text-xs text-gray-500">Gambaran kondisi pipeline saat ini secara menyeluruh</p></div></div><div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5"><div class="stat-card"><div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-briefcase"></i></div><div><div class="stat-value">${ssrInterpolate(unref(fmt).num(unref(st).total))}</div><div class="stat-label">Total Leads</div></div></div><div class="stat-card"><div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-fire"></i></div><div><div class="stat-value text-primary-300">${ssrInterpolate(unref(fmt).num(unref(st).aktif))}</div><div class="stat-label">Aktif</div></div></div><div class="stat-card"><div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-trophy"></i></div><div><div class="stat-value text-emerald-400">${ssrInterpolate(unref(fmt).num(unref(st).won))}</div><div class="stat-label">Won (${ssrInterpolate(unref(winRate))}%)</div></div></div><div class="stat-card"><div class="stat-icon bg-orange-900/40 text-orange-400"><i class="fa-solid fa-hourglass-half"></i></div><div><div class="stat-value text-orange-400">${ssrInterpolate(unref(fmt).num(unref(staleCount)))}</div><div class="stat-label">Stale &gt;30hr</div></div></div><div class="stat-card"><div class="stat-icon bg-gray-800 text-gray-400"><i class="fa-solid fa-user-slash"></i></div><div><div class="stat-value text-gray-300">${ssrInterpolate(unref(fmt).num(unref(st).unassigned))}</div><div class="stat-label">Unassigned</div></div></div><div class="stat-card"><div class="stat-icon bg-yellow-900/40 text-yellow-400"><i class="fa-solid fa-pause-circle"></i></div><div><div class="stat-value text-yellow-400">${ssrInterpolate(unref(fmt).num(unref(st).on_hold))}</div><div class="stat-label">On Hold</div></div></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5"><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-funnel-dollar mr-1.5 text-primary-400"></i>Nilai Pipeline</div><div class="space-y-2.5"><div class="flex justify-between"><span class="text-xs text-gray-500">Total Propose</span><span class="text-sm font-semibold text-white">${ssrInterpolate(unref(fmt).rupiah(unref(st).total_pipeline))}</span></div><div class="flex justify-between"><span class="text-xs text-gray-500">Active Pipeline</span><span class="text-base font-bold text-primary-300">${ssrInterpolate(unref(fmt).rupiah(unref(st).active_pipeline))}</span></div><div class="flex justify-between"><span class="text-xs text-gray-500">Weighted (prob)</span><span class="text-sm font-semibold text-blue-300">${ssrInterpolate(unref(fmt).rupiah(unref(st).weighted_pipeline))}</span></div><div class="h-px bg-navy-700"></div><div class="flex justify-between"><span class="text-xs text-gray-500">Total Won</span><span class="text-sm font-semibold text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(st).total_won))}</span></div><div class="flex justify-between"><span class="text-xs text-gray-500">Avg Days to Close</span><span class="text-sm font-semibold text-gray-300">${ssrInterpolate((_a = unref(data).avg_days_close) != null ? _a : "\u2014")} hari</span></div></div></div><div class="card lg:col-span-2"><div class="section-title mb-3"><i class="fa-solid fa-layer-group mr-1.5"></i>Funnel per Stage</div><div class="space-y-2.5"><!--[-->`);
        ssrRenderList(unref(stageFunnel), (row) => {
          _push(`<div class="flex items-center gap-3"><span class="w-28 text-xs text-gray-400 truncate flex-shrink-0">${ssrInterpolate(row.stage)}</span><div class="flex-1 h-5 bg-navy-800 rounded overflow-hidden"><div class="h-full rounded transition-all duration-700 flex items-center px-2" style="${ssrRenderStyle(`width:${row.pct}%; background:${row.color}`)}">`);
          if (row.pct > 20) {
            _push(`<span class="text-xs font-bold text-white">${ssrInterpolate(row.pct)}%</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><span class="text-xs font-bold w-5 text-right flex-shrink-0 text-white">${ssrInterpolate(unref(fmt).num(row.jumlah))}</span><span class="text-xs text-gray-500 w-20 text-right flex-shrink-0">${ssrInterpolate(unref(fmt).rupiah(row.total_nilai))}</span><span class="text-xs text-blue-400 w-20 text-right flex-shrink-0">${ssrInterpolate(unref(fmt).rupiah(row.weighted))}</span></div>`);
        });
        _push(`<!--]--></div><div class="flex justify-end gap-4 mt-2 text-xs text-gray-600"><span><span class="text-white">\u2588</span> Propose</span><span><span class="text-blue-400">\u2588</span> Weighted</span></div></div></div><div class="card mb-5"><div class="section-title mb-3"><i class="fa-solid fa-star mr-1.5 text-yellow-400"></i>Top 5 Leads High Value (Aktif)</div><div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-500 border-b border-navy-700"><th class="text-left pb-2 pr-3">Perusahaan</th><th class="text-left pb-2 pr-3">Stage</th><th class="text-left pb-2 pr-3">Sales</th><th class="text-right pb-2 pr-3">Propose Value</th><th class="text-right pb-2 pr-3">Prob.</th><th class="text-right pb-2">Exp Close</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(data).high_value, (l) => {
          var _a2;
          _push(`<tr class="border-b border-navy-800/60 hover:bg-navy-800/30 transition-colors"><td class="py-2 pr-3">`);
          _push(ssrRenderComponent(_component_NuxtLink, {
            to: `/pipeline/${l.lead_id}`,
            class: "text-gray-200 hover:text-primary-300 font-medium"
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
          _push(`</td><td class="py-2 pr-3"><span class="${ssrRenderClass(unref(fmt).stageClass(l.stage))}">${ssrInterpolate(l.stage)}</span></td><td class="py-2 pr-3 text-gray-400">${ssrInterpolate(l.sales_owner || "\u2014")}</td><td class="py-2 pr-3 text-right font-semibold text-primary-300">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</td><td class="py-2 pr-3 text-right text-gray-400">${ssrInterpolate((_a2 = l.probability) != null ? _a2 : "\u2014")}%</td><td class="py-2 text-right text-gray-500">${ssrInterpolate(unref(fmt).tgl(l.exp_close_date))}</td></tr>`);
        });
        _push(`<!--]-->`);
        if (!((_b = unref(data).high_value) == null ? void 0 : _b.length)) {
          _push(`<tr><td colspan="6" class="py-6 text-center text-gray-600">Belum ada data</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table></div></div><div class="card mb-8"><div class="section-title mb-4"><i class="fa-solid fa-chart-bar mr-1.5 text-blue-400"></i>Tren Leads Masuk (6 Bulan Terakhir)</div>`);
        if ((_c = unref(data).monthly_trend) == null ? void 0 : _c.length) {
          _push(`<div class="flex items-end gap-2 h-32"><!--[-->`);
          ssrRenderList(unref(data).monthly_trend, (m) => {
            _push(`<div class="flex-1 flex flex-col items-center justify-end gap-1"><div class="text-xs text-gray-500">${ssrInterpolate(unref(fmt).num(m.jumlah))}</div><div class="w-full rounded-t bg-primary-600 transition-all duration-700" style="${ssrRenderStyle(`height:${unref(monthlyMax) ? Math.max(Math.round(m.jumlah / unref(monthlyMax) * 96), 4) : 4}px`)}"></div><div class="text-xs text-gray-600">${ssrInterpolate(m.bulan.slice(5))}/${ssrInterpolate(m.bulan.slice(2, 4))}</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-8 text-gray-600 text-sm">Belum ada data trend</div>`);
        }
        _push(`</div><div class="flex items-center gap-3 mb-4"><div class="w-8 h-8 rounded-full bg-yellow-900/60 flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">2</div><div><h2 class="text-base font-bold text-white">Kenapa Bisa Terjadi?</h2><p class="text-xs text-gray-500">Root cause analysis berdasarkan data pipeline</p></div></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5"><!--[-->`);
        ssrRenderList(unref(rootCauses), (rc) => {
          _push(`<div class="${ssrRenderClass([rc.level === "critical" ? "border-red-500" : rc.level === "warning" ? "border-yellow-500" : "border-blue-500", "card border-l-4"])}"><div class="flex items-start gap-3"><div class="${ssrRenderClass([rc.level === "critical" ? "bg-red-900/40 text-red-400" : rc.level === "warning" ? "bg-yellow-900/40 text-yellow-400" : "bg-blue-900/40 text-blue-400", "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"])}"><i class="${ssrRenderClass(`fa-solid ${rc.icon} text-sm`)}"></i></div><div><div class="text-sm font-semibold text-white mb-1">${ssrInterpolate(rc.title)}</div><div class="text-xs text-gray-400">${ssrInterpolate(rc.desc)}</div></div></div></div>`);
        });
        _push(`<!--]--></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5"><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-gauge-high mr-1.5 text-primary-400"></i>Pipeline Velocity <span class="ml-2 text-xs text-gray-500 font-normal">Rata-rata hari per stage</span></div>`);
        if ((_d = unref(data).velocity) == null ? void 0 : _d.length) {
          _push(`<div class="space-y-2.5"><!--[-->`);
          ssrRenderList(unref(data).velocity, (v) => {
            _push(`<div class="flex items-center gap-3"><span class="w-28 text-xs text-gray-400 truncate flex-shrink-0">${ssrInterpolate(v.stage)}</span><div class="flex-1 h-4 bg-navy-800 rounded overflow-hidden"><div class="${ssrRenderClass([v.avg_days > 90 ? "bg-red-500" : v.avg_days > 30 ? "bg-yellow-500" : "bg-emerald-500", "h-full rounded transition-all duration-700"])}" style="${ssrRenderStyle(`width:${unref(velocityMax) ? Math.round(v.avg_days / unref(velocityMax) * 100) : 0}%`)}"></div></div><div class="text-right flex-shrink-0 w-16"><div class="${ssrRenderClass([v.avg_days > 90 ? "text-red-400" : v.avg_days > 30 ? "text-yellow-400" : "text-emerald-400", "text-xs font-bold"])}">${ssrInterpolate(v.avg_days)} hr </div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).num(v.jumlah))} leads</div></div></div>`);
          });
          _push(`<!--]--><div class="flex gap-4 pt-2 text-xs text-gray-600"><span><span class="text-emerald-400">\u2588</span> \u226430hr</span><span><span class="text-yellow-400">\u2588</span> 31-90hr</span><span><span class="text-red-400">\u2588</span> &gt;90hr</span></div></div>`);
        } else {
          _push(`<div class="text-center py-6 text-gray-600 text-sm">Data velocity belum tersedia</div>`);
        }
        _push(`</div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-share-nodes mr-1.5 text-purple-400"></i>Konversi per Sumber Lead </div>`);
        if ((_e = unref(data).source_conversion) == null ? void 0 : _e.length) {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(data).source_conversion, (src) => {
            _push(`<div><div class="flex items-center justify-between mb-1"><span class="text-xs text-gray-300 font-medium">${ssrInterpolate(src.source)}</span><div class="flex items-center gap-2 text-xs"><span class="text-emerald-400">${ssrInterpolate(unref(fmt).num(src.won))}W</span><span class="text-gray-500">/</span><span class="text-red-400">${ssrInterpolate(unref(fmt).num(src.lost))}L</span><span class="text-gray-600">of ${ssrInterpolate(unref(fmt).num(src.total))}</span><span class="font-bold text-white ml-1">${ssrInterpolate(src.won + src.lost > 0 ? Math.round(src.won / (src.won + src.lost) * 100) + "%" : "\u2014")}</span></div></div><div class="flex h-2.5 rounded overflow-hidden bg-navy-800"><div class="bg-emerald-500 transition-all duration-700" style="${ssrRenderStyle(`width:${src.total ? src.won / src.total * 100 : 0}%`)}"></div><div class="bg-red-500 transition-all duration-700" style="${ssrRenderStyle(`width:${src.total ? src.lost / src.total * 100 : 0}%`)}"></div></div><div class="text-xs text-gray-600 mt-0.5">Pipeline: ${ssrInterpolate(unref(fmt).rupiah(src.pipeline_value))}</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6 text-gray-600 text-sm">Data source belum tersedia</div>`);
        }
        _push(`</div></div><div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8"><div class="card"><div class="section-title text-orange-400 mb-3"><i class="fa-solid fa-hourglass-end mr-1.5"></i>Leads Stale Terlama </div>`);
        if ((_f = unref(data).stale_leads) == null ? void 0 : _f.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).stale_leads, (l) => {
            _push(`<div class="flex items-center gap-3 py-1.5 border-b border-navy-800 last:border-0"><div class="text-center w-10 flex-shrink-0"><div class="${ssrRenderClass([l.days_since_fu > 90 ? "text-red-400" : l.days_since_fu > 60 ? "text-orange-400" : "text-yellow-400", "text-sm font-bold"])}">${ssrInterpolate(l.days_since_fu >= 9999 ? "\u221E" : l.days_since_fu)}</div><div class="text-xs text-gray-600">hr</div></div><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-xs font-medium text-gray-300 hover:text-primary-300 truncate block"
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
            _push(`<div class="text-xs text-gray-500">${ssrInterpolate(l.stage)} \xB7 ${ssrInterpolate(l.sales_owner || "Unassigned")}</div></div><div class="text-xs text-gray-500 flex-shrink-0">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6"><i class="fa-solid fa-check-circle text-emerald-400 text-2xl mb-2 block"></i><div class="text-sm text-gray-500">Semua leads aktif terjadwal</div></div>`);
        }
        _push(`</div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-users mr-1.5 text-primary-400"></i>Distribusi per Sales</div>`);
        if ((_g = unref(data).by_sales) == null ? void 0 : _g.length) {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(data).by_sales, (sl) => {
            var _a2, _b2;
            _push(`<div class="flex items-center gap-3"><div class="w-7 h-7 rounded-full bg-primary-800/50 flex items-center justify-center text-xs font-bold text-primary-300 flex-shrink-0">${ssrInterpolate((_b2 = (_a2 = sl.sales_owner) == null ? void 0 : _a2.charAt(0)) != null ? _b2 : "?")}</div><div class="flex-1"><div class="flex justify-between text-xs mb-1"><span class="text-gray-300">${ssrInterpolate(sl.sales_owner)}</span><span class="text-gray-500">${ssrInterpolate(unref(fmt).num(sl.jumlah))} leads (${ssrInterpolate(unref(fmt).num(sl.aktif))} aktif)</span></div><div class="h-2 bg-navy-800 rounded overflow-hidden"><div class="h-full bg-primary-600 rounded transition-all duration-700" style="${ssrRenderStyle(`width:${unref(salesMax) ? Math.round(sl.jumlah / unref(salesMax) * 100) : 0}%`)}"></div></div></div><div class="text-xs text-gray-600 flex-shrink-0 w-20 text-right">${ssrInterpolate(unref(fmt).rupiah(sl.total_nilai))}</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="flex items-center gap-3 mb-4"><div class="w-8 h-8 rounded-full bg-emerald-900/60 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">3</div><div><h2 class="text-base font-bold text-white">Apa yang Harus Dilakukan?</h2><p class="text-xs text-gray-500">Rekomendasi aksi prioritas berdasarkan analisis data</p></div></div><div class="card mb-5"><div class="section-title mb-3"><i class="fa-solid fa-chart-pie mr-1.5 text-blue-400"></i>Weighted Pipeline Forecast per Stage <span class="ml-auto text-xs text-gray-500 font-normal">Total Weighted: ${ssrInterpolate(unref(fmt).rupiah(unref(totalWeighted)))}</span></div>`);
        if ((_h = unref(data).weighted_forecast) == null ? void 0 : _h.length) {
          _push(`<div class="space-y-3"><!--[-->`);
          ssrRenderList(unref(data).weighted_forecast, (w) => {
            _push(`<div class="flex items-center gap-3"><span class="w-28 text-xs text-gray-400 flex-shrink-0 truncate">${ssrInterpolate(w.stage)}</span><div class="flex-1 flex flex-col gap-1"><div class="h-2.5 rounded bg-primary-500/40 overflow-hidden"><div class="h-full bg-primary-500 opacity-60 transition-all duration-700" style="${ssrRenderStyle(`width:${unref(st).active_pipeline ? Math.min(Math.round(w.propose_value / unref(st).active_pipeline * 100), 100) : 0}%`)}"></div></div><div class="h-2.5 rounded bg-navy-800 overflow-hidden"><div class="h-full bg-blue-500 transition-all duration-700" style="${ssrRenderStyle(`width:${unref(totalWeighted) ? Math.min(Math.round(w.weighted_value / unref(totalWeighted) * 100), 100) : 0}%`)}"></div></div></div><div class="text-right flex-shrink-0 w-32"><div class="text-xs text-gray-400">${ssrInterpolate(unref(fmt).rupiah(w.propose_value))}</div><div class="text-xs font-semibold text-blue-400">${ssrInterpolate(unref(fmt).rupiah(w.weighted_value))}</div></div><div class="text-xs text-gray-600 w-10 text-right flex-shrink-0">${ssrInterpolate(w.avg_probability)}%</div></div>`);
          });
          _push(`<!--]--><div class="flex justify-end gap-4 text-xs text-gray-600 pt-1"><span><span class="text-primary-400 opacity-60">\u2588</span> Propose</span><span><span class="text-blue-400">\u2588</span> Weighted</span></div></div>`);
        } else {
          _push(`<div class="text-center py-6 text-gray-600 text-sm">Data weighted forecast belum tersedia</div>`);
        }
        _push(`</div><div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5"><div class="card border border-red-900/50"><div class="section-title text-red-400 mb-3"><i class="fa-solid fa-bolt mr-1.5"></i>\u{1F534} Hot Leads Terabaikan </div>`);
        if ((_i = unref(data).hot_stale) == null ? void 0 : _i.length) {
          _push(`<div class="space-y-2 mb-3"><!--[-->`);
          ssrRenderList(unref(data).hot_stale, (l) => {
            _push(`<div class="flex items-center gap-2 p-2 rounded-lg bg-red-900/10 border border-red-900/30"><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-xs font-medium text-gray-200 hover:text-primary-300 truncate block"
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
            _push(`<div class="text-xs text-gray-500">${ssrInterpolate(l.stage)} \xB7 ${ssrInterpolate(l.sales_owner || "Unassigned")}</div></div><div class="text-right flex-shrink-0"><div class="text-xs font-bold text-red-400">${ssrInterpolate(l.days_since_fu >= 9999 ? "\u221E" : l.days_since_fu + "hr")}</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="py-3 text-center text-xs text-emerald-400 mb-3"><i class="fa-solid fa-circle-check mr-1"></i>Semua Hot leads ter-follow-up! </div>`);
        }
        _push(`<div class="text-xs text-gray-500 bg-navy-800/60 rounded-lg p-2.5"><strong class="text-white">Langkah:</strong><ol class="list-decimal list-inside mt-1 space-y-0.5"><li>Hubungi via WhatsApp atau telepon hari ini</li><li>Catat hasil follow-up di sistem</li><li>Set jadwal next FU dalam 3-5 hari</li></ol></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/today",
          class: "mt-3 btn-secondary btn-sm w-full justify-center text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Buka Agenda Hari Ini `);
            } else {
              return [
                createTextVNode(" Buka Agenda Hari Ini ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="card border border-emerald-900/50"><div class="section-title text-emerald-400 mb-3"><i class="fa-solid fa-bullseye mr-1.5"></i>\u{1F7E2} Siap Closing </div>`);
        if ((_j = unref(data).ready_to_close) == null ? void 0 : _j.length) {
          _push(`<div class="space-y-2 mb-3"><!--[-->`);
          ssrRenderList(unref(data).ready_to_close, (l) => {
            var _a2;
            _push(`<div class="flex items-center gap-2 p-2 rounded-lg bg-emerald-900/10 border border-emerald-900/30"><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-xs font-medium text-gray-200 hover:text-primary-300 truncate block"
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
            _push(`<div class="text-xs text-gray-500">${ssrInterpolate(l.stage)} \xB7 ${ssrInterpolate(l.sales_owner || "\u2014")}</div></div><div class="text-right flex-shrink-0"><div class="text-xs font-bold text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div><div class="text-xs text-gray-600">${ssrInterpolate((_a2 = l.probability) != null ? _a2 : "\u2014")}%</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="py-3 text-center text-xs text-gray-600 mb-3">Belum ada leads di tahap Proposal/Negosiasi</div>`);
        }
        _push(`<div class="text-xs text-gray-500 bg-navy-800/60 rounded-lg p-2.5"><strong class="text-white">Langkah:</strong><ol class="list-decimal list-inside mt-1 space-y-0.5"><li>Review proposal terakhir yang dikirim</li><li>Follow up status keputusan</li><li>Tawarkan solusi untuk hambatan</li></ol></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/pipeline",
          class: "mt-3 btn-secondary btn-sm w-full justify-center text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Buka Pipeline `);
            } else {
              return [
                createTextVNode(" Buka Pipeline ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="card border border-orange-900/50"><div class="section-title text-orange-400 mb-3"><i class="fa-solid fa-pause-circle mr-1.5"></i>\u{1F7E1} On Hold Bernilai Tinggi </div>`);
        if ((_k = unref(data).onhold_risk) == null ? void 0 : _k.length) {
          _push(`<div class="space-y-2 mb-3"><!--[-->`);
          ssrRenderList(unref(data).onhold_risk.slice(0, 5), (l) => {
            _push(`<div class="flex items-center gap-2 p-2 rounded-lg bg-orange-900/10 border border-orange-900/30"><div class="flex-1 min-w-0">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-xs font-medium text-gray-200 hover:text-primary-300 truncate block"
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
            _push(`<div class="text-xs text-gray-500">${ssrInterpolate(l.segmen || "\u2014")} \xB7 ${ssrInterpolate(l.sales_owner || "Unassigned")}</div></div><div class="text-right flex-shrink-0"><div class="text-xs font-bold text-orange-400">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</div><div class="text-xs text-gray-600">${ssrInterpolate(l.days_idle >= 9999 ? "\u221E" : l.days_idle + "hr")} idle</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="py-3 text-center text-xs text-gray-600 mb-3">Tidak ada leads On Hold</div>`);
        }
        _push(`<div class="text-xs text-gray-500 bg-navy-800/60 rounded-lg p-2.5"><strong class="text-white">Langkah:</strong><ol class="list-decimal list-inside mt-1 space-y-0.5"><li>Identifikasi alasan on hold</li><li>Cek apakah kondisi sudah berubah</li><li>Re-aktifkan atau putuskan lanjut/drop</li></ol></div></div></div><div class="card mb-5"><div class="section-title mb-3"><i class="fa-solid fa-calendar-check mr-1.5 text-yellow-400"></i>Leads dengan Deadline Terdekat <span class="ml-auto text-xs text-gray-500 font-normal">(exp_close_date)</span></div>`);
        if ((_l = unref(data).closing_soon) == null ? void 0 : _l.length) {
          _push(`<div class="overflow-x-auto"><table class="w-full text-xs"><thead><tr class="text-gray-500 border-b border-navy-700"><th class="text-left pb-2 pr-3">Perusahaan</th><th class="text-left pb-2 pr-3">Stage</th><th class="text-left pb-2 pr-3">Prioritas</th><th class="text-left pb-2 pr-3">Sales</th><th class="text-right pb-2 pr-3">Nilai</th><th class="text-right pb-2 pr-3">Exp Close</th><th class="text-right pb-2">Sisa</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(data).closing_soon, (l) => {
            _push(`<tr class="border-b border-navy-800/60 hover:bg-navy-800/30"><td class="py-2 pr-3">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${l.lead_id}`,
              class: "text-gray-200 hover:text-primary-300 font-medium"
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
            _push(`</td><td class="py-2 pr-3"><span class="${ssrRenderClass(unref(fmt).stageClass(l.stage))}">${ssrInterpolate(l.stage)}</span></td><td class="py-2 pr-3"><span class="${ssrRenderClass(unref(fmt).priorityClass(l.prioritas))}">${ssrInterpolate(l.prioritas)}</span></td><td class="py-2 pr-3 text-gray-400">${ssrInterpolate(l.sales_owner || "\u2014")}</td><td class="py-2 pr-3 text-right font-semibold text-primary-300">${ssrInterpolate(unref(fmt).rupiah(l.propose_value))}</td><td class="py-2 pr-3 text-right text-gray-400">${ssrInterpolate(unref(fmt).tgl(l.exp_close_date))}</td><td class="${ssrRenderClass([l.days_until_close <= 7 ? "text-red-400" : l.days_until_close <= 30 ? "text-yellow-400" : "text-gray-400", "py-2 text-right font-bold"])}">${ssrInterpolate(l.days_until_close)}hr </td></tr>`);
          });
          _push(`<!--]--></tbody></table></div>`);
        } else {
          _push(`<div class="text-center py-6 text-gray-600 text-sm">Tidak ada leads dengan exp_close_date</div>`);
        }
        _push(`</div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-box-open mr-1.5 text-primary-400"></i>Breakdown per Produk</div>`);
        if ((_m = unref(data).by_product) == null ? void 0 : _m.length) {
          _push(`<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3"><!--[-->`);
          ssrRenderList(unref(data).by_product, (p) => {
            _push(`<div class="bg-navy-800/60 rounded-lg p-3"><div class="text-xs text-gray-500 truncate mb-1">${ssrInterpolate(p.product)}</div><div class="text-lg font-bold text-white">${ssrInterpolate(unref(fmt).num(p.jumlah))}</div><div class="text-xs text-primary-300">${ssrInterpolate(unref(fmt).rupiah(p.total_nilai))}</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6 text-gray-600 text-sm">Data produk belum tersedia</div>`);
        }
        _push(`</div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/insights.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=insights-D5lz1_Rq.mjs.map
