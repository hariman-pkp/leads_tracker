import { _ as __nuxt_component_1 } from "./AppPagination-DUr1sfAX.js";
import { _ as __nuxt_component_0 } from "./nuxt-link-CFSz172Y.js";
import { defineComponent, ref, withAsyncContext, computed, unref, isRef, withCtx, createTextVNode, createVNode, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderClass, ssrRenderStyle, ssrRenderComponent } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import { u as useAsyncData } from "./asyncData-BUVmteIW.js";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
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
const INSIGHT_PER_PAGE = 5;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "insights",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const selectedYear = ref((/* @__PURE__ */ new Date()).getFullYear());
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "rev-insights",
      () => get("/v1/revenue/insights", { tahun: selectedYear.value }),
      { server: false }
    )), __temp = await __temp, __restore(), __temp);
    const totalProjects = computed(
      () => (data.value?.by_status ?? []).reduce((s, r) => s + r.cnt, 0)
    );
    const zeroValue = computed(
      () => (data.value?.zero_projects ?? []).reduce((s, p) => s + Number(p.revenue_target), 0)
    );
    const criticalValue = computed(
      () => (data.value?.at_risk_projects ?? []).reduce((s, p) => s + Number(p.revenue_target), 0)
    );
    const atRiskPage = ref(1);
    const atRiskTotal = computed(() => data.value?.at_risk_projects?.length ?? 0);
    const atRiskPages = computed(() => Math.ceil(atRiskTotal.value / INSIGHT_PER_PAGE) || 1);
    const atRiskSlice = computed(() => {
      const all = data.value?.at_risk_projects ?? [];
      const start = (atRiskPage.value - 1) * INSIGHT_PER_PAGE;
      return all.slice(start, start + INSIGHT_PER_PAGE);
    });
    const zeroPage = ref(1);
    const zeroTotal = computed(() => data.value?.zero_projects?.length ?? 0);
    const zeroPages = computed(() => Math.ceil(zeroTotal.value / INSIGHT_PER_PAGE) || 1);
    const zeroSlice = computed(() => {
      const all = data.value?.zero_projects ?? [];
      const start = (zeroPage.value - 1) * INSIGHT_PER_PAGE;
      return all.slice(start, start + INSIGHT_PER_PAGE);
    });
    const ytdActual = computed(() => {
      const m = data.value?.monthly ?? [];
      const cur = data.value?.cur_month ?? 0;
      return m.filter((x) => x.month_num <= cur).reduce((s, x) => s + Number(x.actual), 0);
    });
    const curTarget = computed(() => {
      const m = data.value?.monthly ?? [];
      const cur = data.value?.cur_month ?? 0;
      return m.filter((x) => x.month_num <= cur).reduce((s, x) => s + Number(x.target), 0);
    });
    const monthlyMax = computed(
      () => Math.max(...(data.value?.monthly ?? []).map((m) => Math.max(Number(m.target), Number(m.actual))), 1)
    );
    const typeMax = computed(
      () => Math.max(...(data.value?.by_type ?? []).map((t) => Number(t.actual)), 1)
    );
    const riskMax = computed(
      () => Math.max(...(data.value?.by_risk ?? []).map((r) => Number(r.target)), 1)
    );
    const kategoriItems = computed(() => [
      { label: "Project", ach: data.value?.project_ach ?? 0, actual: data.value?.project_actual ?? 0, target: data.value?.project_target ?? 0 },
      { label: "Recurring", ach: data.value?.recurring_ach ?? 0, actual: data.value?.recurring_actual ?? 0, target: data.value?.recurring_target ?? 0 }
    ]);
    const ownerItems = computed(() => [
      { label: "FSP-ECO", ach: data.value?.fsp_eco_ach ?? 0, actual: data.value?.fsp_eco_actual ?? 0, target: data.value?.fsp_eco_target ?? 0 },
      { label: "FSP-CORE", ach: data.value?.fsp_core_ach ?? 0, actual: data.value?.fsp_core_actual ?? 0, target: data.value?.fsp_core_target ?? 0 }
    ]);
    const rootCauses = computed(() => {
      if (!data.value) return [];
      const d = data.value;
      const causes = [];
      if (d.ach_pct < 50) {
        causes.push({
          level: "critical",
          icon: "fa-chart-line",
          title: `Achievement Sangat Rendah (${d.ach_pct}%)`,
          desc: `Realisasi hanya ${d.ach_pct}% dari target YTD. Dengan run rate saat ini, proyeksi akhir tahun hanya ${d.projected_ach}% — jauh dari target 100%.`
        });
      } else if (d.ach_pct < 80) {
        causes.push({
          level: "warning",
          icon: "fa-chart-line",
          title: `Achievement Di Bawah Target (${d.ach_pct}%)`,
          desc: `Realisasi belum mencapai 80% dari target berjalan. Proyeksi akhir tahun ${d.projected_ach}% — perlu akselerasi signifikan.`
        });
      }
      if (d.critical_count > 0) {
        const pct = totalProjects.value > 0 ? Math.round(d.critical_count / totalProjects.value * 100) : 0;
        causes.push({
          level: "critical",
          icon: "fa-triangle-exclamation",
          title: `${d.critical_count} Proyek Critical/High Risk (${pct}%)`,
          desc: `${pct}% dari total proyek dalam kondisi Critical atau High Risk. Proyek-proyek ini berisiko tinggi tidak terealisasi dan menyumbang gap besar terhadap target.`
        });
      }
      if (d.zero_count > 0) {
        causes.push({
          level: d.zero_count > 5 ? "critical" : "warning",
          icon: "fa-circle-xmark",
          title: `${d.zero_count} Proyek Belum Ada Realisasi`,
          desc: `Proyek senilai ${fmt.rupiah(zeroValue.value)} sama sekali belum ada realisasi. Kemungkinan: proyek belum kick-off, hambatan kontrak, atau pending invoicing.`
        });
      }
      if (d.miss_months_count >= 3) {
        causes.push({
          level: "critical",
          icon: "fa-calendar-xmark",
          title: `Miss Target ${d.miss_months_count} Bulan Berturut`,
          desc: `${d.miss_months_count} dari ${d.past_months_count} bulan realisasi di bawah 80% target. Pola ini menunjukkan masalah sistemik, bukan hanya faktor temporer.`
        });
      } else if (d.miss_months_count > 0) {
        causes.push({
          level: "warning",
          icon: "fa-calendar-minus",
          title: `${d.miss_months_count} Bulan Miss Target`,
          desc: `${d.miss_months_count} bulan tidak mencapai target meskipun ada beberapa bulan yang achieve. Perlu dievaluasi penyebab di bulan-bulan tersebut.`
        });
      }
      if (d.outstanding_amount > 0) {
        causes.push({
          level: "warning",
          icon: "fa-file-invoice",
          title: `Invoice Outstanding ${fmt.rupiah(d.outstanding_amount)}`,
          desc: `${d.outstanding_count} invoice senilai ${fmt.rupiah(d.outstanding_amount)} belum dibayarkan. Realisasi bisa langsung meningkat jika pembayaran masuk.`
        });
      }
      if (d.project_ach < 30 && d.recurring_ach > 70) {
        causes.push({
          level: "warning",
          icon: "fa-scale-unbalanced",
          title: "Project Revenue Jauh di Bawah Recurring",
          desc: `Recurring mencapai ${d.recurring_ach}% namun Project hanya ${d.project_ach}%. Revenue project one-time lebih sulit diprediksi dan sering terlambat karena dependency project delivery.`
        });
      }
      if (causes.length === 0) {
        causes.push({
          level: "info",
          icon: "fa-circle-check",
          title: "Revenue Dalam Kondisi Baik",
          desc: "Tidak ada masalah kritis yang terdeteksi. Pertahankan konsistensi pengiriman dan invoicing."
        });
      }
      return causes;
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppPagination = __nuxt_component_1;
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-lightbulb text-yellow-400 mr-2"></i>Revenue Insights</h1><p class="page-subtitle">Analisis mendalam revenue ${ssrInterpolate(unref(selectedYear))} — apa yang terjadi, kenapa, dan apa yang harus dilakukan</p></div>`);
      if (unref(data)?.years) {
        _push(`<select class="form-select w-28 text-xs"><!--[-->`);
        ssrRenderList(unref(data).years, (y) => {
          _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedYear)) ? ssrLooseContain(unref(selectedYear), y) : ssrLooseEqual(unref(selectedYear), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
        });
        _push(`<!--]--></select>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else if (unref(data)) {
        _push(`<!--[--><div class="flex items-center gap-3 mb-4"><div class="w-8 h-8 rounded-full bg-blue-900/60 flex items-center justify-center text-blue-400 font-bold text-sm flex-shrink-0">1</div><div><h2 class="text-base font-bold text-white">Apa yang Terjadi?</h2><p class="text-xs text-gray-500">Kondisi revenue saat ini secara menyeluruh</p></div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5"><div class="card text-center py-4"><div class="${ssrRenderClass([unref(data).ach_pct >= 80 ? "text-emerald-400" : unref(data).ach_pct >= 50 ? "text-yellow-400" : "text-red-400", "text-3xl font-bold mb-1"])}">${ssrInterpolate(unref(data).ach_pct)}% </div><div class="text-xs text-gray-400">Achievement YTD</div><div class="${ssrRenderClass([unref(data).ach_pct >= 80 ? "text-emerald-500" : unref(data).ach_pct >= 50 ? "text-yellow-500" : "text-red-500", "text-xs mt-1"])}">${ssrInterpolate(unref(data).ach_pct >= 80 ? "✓ On Track" : unref(data).ach_pct >= 50 ? "⚠ Perlu Upaya" : "✗ Jauh dari Target")}</div></div><div class="card text-center py-4"><div class="text-3xl font-bold text-red-400 mb-1">${ssrInterpolate(unref(data).critical_count)}</div><div class="text-xs text-gray-400">Proyek Critical/High Risk</div><div class="text-xs text-red-500 mt-1">dari ${ssrInterpolate(unref(totalProjects))} proyek aktif</div></div><div class="card text-center py-4"><div class="text-3xl font-bold text-yellow-400 mb-1">${ssrInterpolate(unref(data).zero_count)}</div><div class="text-xs text-gray-400">Proyek Nol Realisasi</div><div class="text-xs text-yellow-500 mt-1">${ssrInterpolate(unref(fmt).rupiah(unref(zeroValue)))} tertahan</div></div><div class="card text-center py-4"><div class="text-xl font-bold text-orange-400 mb-1">${ssrInterpolate(unref(fmt).rupiah(unref(data).outstanding_amount))}</div><div class="text-xs text-gray-400">Invoice Outstanding</div><div class="text-xs text-orange-500 mt-1">${ssrInterpolate(unref(data).outstanding_count)} invoice belum lunas</div></div></div><div class="card mb-5"><div class="section-title mb-4"><i class="fa-solid fa-chart-bar mr-1.5 text-primary-400"></i>Realisasi vs Target per Bulan <span class="ml-auto text-xs text-gray-500 font-normal">${ssrInterpolate(unref(data).ach_months_count)}/${ssrInterpolate(unref(data).past_months_count)} bulan achieve target </span></div><div class="flex items-end gap-1.5 h-36 mb-2"><!--[-->`);
        ssrRenderList(unref(data).monthly, (m) => {
          _push(`<div class="flex-1 flex flex-col items-center justify-end gap-0.5"><div class="w-full relative flex flex-col justify-end" style="${ssrRenderStyle({ "height": "120px" })}"><div class="${ssrRenderClass([m.is_past ? "bg-gray-400" : "bg-gray-700", "w-full rounded-t opacity-20 absolute bottom-0"])}" style="${ssrRenderStyle(`height:${unref(monthlyMax) ? Math.round(m.target / unref(monthlyMax) * 100) : 0}%`)}"></div><div class="${ssrRenderClass([!m.is_past ? "bg-navy-700" : m.actual >= m.target ? "bg-emerald-500" : m.actual >= m.target * 0.8 ? "bg-yellow-500" : "bg-red-500", "w-full rounded-t absolute bottom-0 transition-all duration-700"])}" style="${ssrRenderStyle(`height:${unref(monthlyMax) ? Math.round(m.actual / unref(monthlyMax) * 100) : 0}%`)}"></div></div><div class="text-xs text-gray-600 mt-1">${ssrInterpolate(m.month_name.slice(0, 3))}</div></div>`);
        });
        _push(`<!--]--></div><div class="flex justify-end gap-4 text-xs text-gray-600"><span><span class="text-gray-400 opacity-40">█</span> Target</span><span><span class="text-emerald-400">█</span> Achieve</span><span><span class="text-yellow-400">█</span> &gt;80%</span><span><span class="text-red-400">█</span> Miss</span></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5"><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-calculator mr-1.5 text-primary-400"></i>Proyeksi &amp; Gap</div><div class="space-y-3"><div class="flex justify-between items-end border-b border-navy-800 pb-2"><span class="text-xs text-gray-500">Realisasi YTD (s/d bln ${ssrInterpolate(unref(data).cur_month)})</span><span class="text-sm font-bold text-white">${ssrInterpolate(unref(fmt).rupiah(unref(ytdActual)))}</span></div><div class="flex justify-between items-end border-b border-navy-800 pb-2"><span class="text-xs text-gray-500">Target s/d bln ${ssrInterpolate(unref(data).cur_month)}</span><span class="text-sm font-semibold text-gray-300">${ssrInterpolate(unref(fmt).rupiah(unref(curTarget)))}</span></div><div class="flex justify-between items-end border-b border-navy-800 pb-2"><span class="text-xs text-gray-500">Gap dari target berjalan</span><span class="${ssrRenderClass([unref(data).gap_ytd > 0 ? "text-red-400" : "text-emerald-400", "text-sm font-bold"])}">${ssrInterpolate(unref(data).gap_ytd > 0 ? "-" : "+")}${ssrInterpolate(unref(fmt).rupiah(Math.abs(unref(data).gap_ytd)))}</span></div><div class="flex justify-between items-end border-b border-navy-800 pb-2"><span class="text-xs text-gray-500">Run Rate / bulan</span><span class="text-sm font-semibold text-blue-300">${ssrInterpolate(unref(fmt).rupiah(unref(data).run_rate))}</span></div><div class="flex justify-between items-end border-b border-navy-800 pb-2"><span class="text-xs text-gray-500">Proyeksi Akhir Tahun</span><span class="${ssrRenderClass([unref(data).projected_ach >= 80 ? "text-emerald-400" : unref(data).projected_ach >= 50 ? "text-yellow-400" : "text-red-400", "text-sm font-bold"])}">${ssrInterpolate(unref(fmt).rupiah(unref(data).projected_eoy))}</span></div><div class="flex justify-between items-end"><span class="text-xs text-gray-500">Est. Achievement EOY</span><span class="${ssrRenderClass([unref(data).projected_ach >= 80 ? "text-emerald-400" : unref(data).projected_ach >= 50 ? "text-yellow-400" : "text-red-400", "text-base font-bold"])}">${ssrInterpolate(unref(data).projected_ach)}% </span></div></div></div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-tags mr-1.5"></i>Per Kategori</div><div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(kategoriItems), (item) => {
          _push(`<div><div class="flex justify-between mb-1"><span class="text-sm font-medium text-gray-200">${ssrInterpolate(item.label)}</span><span class="${ssrRenderClass([item.ach >= 80 ? "text-emerald-400" : item.ach >= 50 ? "text-yellow-400" : "text-red-400", "text-xs font-bold"])}">${ssrInterpolate(item.ach)}% </span></div><div class="h-2.5 bg-navy-800 rounded overflow-hidden mb-1"><div class="${ssrRenderClass([unref(fmt).achColor(item.ach), "h-full rounded transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(item.ach, 100)}%`)}"></div></div><div class="flex justify-between text-xs text-gray-500"><span class="text-white">${ssrInterpolate(unref(fmt).rupiah(item.actual))}</span><span>dari ${ssrInterpolate(unref(fmt).rupiah(item.target))}</span></div></div>`);
        });
        _push(`<!--]--></div><div class="mt-4 pt-3 border-t border-navy-800"><div class="section-title text-xs mb-2"><i class="fa-solid fa-shapes mr-1"></i>Per Type Kontrak</div><div class="space-y-1.5"><!--[-->`);
        ssrRenderList(unref(data).by_type, (t) => {
          _push(`<div class="flex items-center gap-2"><span class="text-xs text-gray-400 w-20 truncate flex-shrink-0">${ssrInterpolate(t.type)}</span><div class="flex-1 h-2 bg-navy-800 rounded overflow-hidden"><div class="h-full bg-primary-600 rounded transition-all duration-700" style="${ssrRenderStyle(`width:${unref(typeMax) ? Math.round(t.actual / unref(typeMax) * 100) : 0}%`)}"></div></div><span class="text-xs text-gray-400 flex-shrink-0 w-24 text-right">${ssrInterpolate(unref(fmt).rupiah(t.actual))}</span></div>`);
        });
        _push(`<!--]--></div></div></div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-user-tie mr-1.5"></i>Per Organisasi</div><div class="space-y-4"><!--[-->`);
        ssrRenderList(unref(ownerItems), (item) => {
          _push(`<div><div class="flex justify-between mb-1"><span class="text-sm font-medium text-gray-200">${ssrInterpolate(item.label)}</span><span class="${ssrRenderClass([item.ach >= 80 ? "text-emerald-400" : item.ach >= 50 ? "text-yellow-400" : "text-red-400", "text-xs font-bold"])}">${ssrInterpolate(item.ach)}% </span></div><div class="h-2.5 bg-navy-800 rounded overflow-hidden mb-1"><div class="${ssrRenderClass([unref(fmt).achColor(item.ach), "h-full rounded transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(item.ach, 100)}%`)}"></div></div><div class="flex justify-between text-xs text-gray-500"><span class="text-white">${ssrInterpolate(unref(fmt).rupiah(item.actual))}</span><span>dari ${ssrInterpolate(unref(fmt).rupiah(item.target))}</span></div></div>`);
        });
        _push(`<!--]--></div><div class="mt-4 pt-3 border-t border-navy-800"><div class="section-title text-xs mb-2"><i class="fa-solid fa-shield-alt mr-1"></i>Risk Level Proyek</div><div class="space-y-1.5"><!--[-->`);
        ssrRenderList(unref(data).by_risk, (r) => {
          _push(`<div class="flex items-center gap-2"><span class="${ssrRenderClass([r.risk_level === "HIGH" ? "text-red-400" : r.risk_level === "MEDIUM" ? "text-yellow-400" : "text-emerald-400", "text-xs w-16 flex-shrink-0"])}">${ssrInterpolate(r.risk_level)}</span><div class="flex-1 h-2 bg-navy-800 rounded overflow-hidden"><div class="${ssrRenderClass([r.risk_level === "HIGH" ? "bg-red-500" : r.risk_level === "MEDIUM" ? "bg-yellow-500" : "bg-emerald-500", "h-full rounded transition-all duration-700"])}" style="${ssrRenderStyle(`width:${unref(riskMax) ? Math.round(r.target / unref(riskMax) * 100) : 0}%`)}"></div></div><span class="text-xs text-gray-500 flex-shrink-0 w-4 text-right">${ssrInterpolate(r.cnt)}</span><span class="text-xs text-gray-600 flex-shrink-0 w-24 text-right">${ssrInterpolate(unref(fmt).rupiah(r.target))}</span></div>`);
        });
        _push(`<!--]--></div></div></div></div><div class="card mb-8"><div class="section-title mb-3"><i class="fa-solid fa-star mr-1.5 text-yellow-400"></i>Top 5 Kontributor Realisasi</div><div class="space-y-2.5"><!--[-->`);
        ssrRenderList(unref(data).top_contributors, (p, i) => {
          _push(`<div class="flex items-center gap-3 p-2.5 rounded-lg bg-navy-800/40"><div class="${ssrRenderClass([i === 0 ? "bg-yellow-900/60 text-yellow-400" : i === 1 ? "bg-gray-700 text-gray-300" : "bg-navy-700 text-gray-500", "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"])}">${ssrInterpolate(i + 1)}</div><div class="flex-1 min-w-0"><div class="text-sm font-medium text-gray-200 truncate">${ssrInterpolate(p.client)}</div><div class="text-xs text-gray-500">${ssrInterpolate(p.project_id)} · ${ssrInterpolate(p.product)} · ${ssrInterpolate(p.organisasi)}</div></div><div class="text-right flex-shrink-0"><div class="text-sm font-bold text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(p.actual_revenue))}</div><div class="text-xs text-gray-600">dari ${ssrInterpolate(unref(fmt).rupiah(p.revenue_target))}</div></div><div class="w-20 flex-shrink-0"><div class="h-1.5 bg-navy-700 rounded overflow-hidden"><div class="h-full bg-emerald-500 rounded" style="${ssrRenderStyle(`width:${p.revenue_target ? Math.min(p.actual_revenue / p.revenue_target * 100, 100) : 0}%`)}"></div></div><div class="text-xs text-gray-600 text-right mt-0.5">${ssrInterpolate(p.revenue_target ? Math.round(p.actual_revenue / p.revenue_target * 100) : 0)}% </div></div></div>`);
        });
        _push(`<!--]--></div></div><div class="flex items-center gap-3 mb-4"><div class="w-8 h-8 rounded-full bg-yellow-900/60 flex items-center justify-center text-yellow-400 font-bold text-sm flex-shrink-0">2</div><div><h2 class="text-base font-bold text-white">Kenapa Bisa Terjadi?</h2><p class="text-xs text-gray-500">Root cause analysis berdasarkan data revenue</p></div></div><div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5"><!--[-->`);
        ssrRenderList(unref(rootCauses), (rc) => {
          _push(`<div class="${ssrRenderClass([rc.level === "critical" ? "border-red-500" : rc.level === "warning" ? "border-yellow-500" : "border-blue-500", "card border-l-4"])}"><div class="flex items-start gap-3"><div class="${ssrRenderClass([rc.level === "critical" ? "bg-red-900/40 text-red-400" : rc.level === "warning" ? "bg-yellow-900/40 text-yellow-400" : "bg-blue-900/40 text-blue-400", "w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"])}"><i class="${ssrRenderClass(`fa-solid ${rc.icon} text-sm`)}"></i></div><div><div class="text-sm font-semibold text-white mb-1">${ssrInterpolate(rc.title)}</div><div class="text-xs text-gray-400 leading-relaxed">${ssrInterpolate(rc.desc)}</div></div></div></div>`);
        });
        _push(`<!--]--></div><div class="card mb-5"><div class="section-title text-red-400 mb-3"><i class="fa-solid fa-triangle-exclamation mr-1.5"></i>Proyek Critical &amp; At Risk — Perlu Tindakan Segera </div>`);
        if (unref(data).at_risk_projects?.length) {
          _push(`<div class="overflow-x-auto"><table class="tbl"><thead><tr><th>Project</th><th>Client</th><th>Organisasi</th><th class="text-right">Target</th><th class="text-right">Realisasi</th><th class="text-right">Gap</th><th>Status</th><th>Risk</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(atRiskSlice), (p) => {
            _push(`<tr><td><div class="text-xs font-medium text-gray-200">${ssrInterpolate(p.project_id)}</div><div class="text-xs text-gray-500 max-w-28 truncate">${ssrInterpolate(p.product)}</div></td><td class="text-xs text-gray-300 max-w-32 truncate">${ssrInterpolate(p.client)}</td><td class="text-xs text-gray-400">${ssrInterpolate(p.organisasi)}</td><td class="text-right text-xs text-gray-300">${ssrInterpolate(unref(fmt).rupiah(p.revenue_target))}</td><td class="text-right text-xs text-emerald-300">${ssrInterpolate(unref(fmt).rupiah(p.actual_revenue))}</td><td class="text-right text-xs font-semibold text-red-400"> -${ssrInterpolate(unref(fmt).rupiah(p.revenue_target - p.actual_revenue))}</td><td><span class="${ssrRenderClass(unref(fmt).statusClass(p.status))}">${ssrInterpolate(p.status)}</span></td><td><span class="${ssrRenderClass(unref(fmt).riskClass(p.risk_level))}">${ssrInterpolate(p.risk_level)}</span></td></tr>`);
          });
          _push(`<!--]--></tbody></table>`);
          if (unref(atRiskPages) > 1) {
            _push(ssrRenderComponent(_component_AppPagination, {
              page: unref(atRiskPage),
              "onUpdate:page": ($event) => isRef(atRiskPage) ? atRiskPage.value = $event : null,
              "total-pages": unref(atRiskPages),
              total: unref(atRiskTotal),
              "per-page": INSIGHT_PER_PAGE,
              class: "mt-3"
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="text-center py-6 text-emerald-400 text-sm"><i class="fa-solid fa-circle-check mr-1"></i>Tidak ada proyek Critical atau At Risk </div>`);
        }
        _push(`</div>`);
        if (unref(data).zero_projects?.length) {
          _push(`<div class="card mb-8"><div class="section-title text-yellow-400 mb-3"><i class="fa-solid fa-circle-xmark mr-1.5"></i>Proyek Nol Realisasi (${ssrInterpolate(unref(data).zero_count)}) — Total ${ssrInterpolate(unref(fmt).rupiah(unref(zeroValue)))}</div><div class="overflow-x-auto"><table class="tbl"><thead><tr><th>Project</th><th>Client</th><th>Organisasi</th><th class="text-right">Target</th><th>Type</th><th>Risk</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(unref(zeroSlice), (p) => {
            _push(`<tr><td class="text-xs">${ssrInterpolate(p.project_id)} <div class="text-gray-500 max-w-28 truncate">${ssrInterpolate(p.product)}</div></td><td class="text-xs text-gray-300">${ssrInterpolate(p.client)}</td><td class="text-xs text-gray-400">${ssrInterpolate(p.organisasi)}</td><td class="text-right text-xs text-gray-300">${ssrInterpolate(unref(fmt).rupiah(p.revenue_target))}</td><td class="text-xs text-gray-400">${ssrInterpolate(p.type)}</td><td><span class="${ssrRenderClass(unref(fmt).riskClass(p.risk_level))}">${ssrInterpolate(p.risk_level)}</span></td></tr>`);
          });
          _push(`<!--]--></tbody></table>`);
          if (unref(zeroPages) > 1) {
            _push(ssrRenderComponent(_component_AppPagination, {
              page: unref(zeroPage),
              "onUpdate:page": ($event) => isRef(zeroPage) ? zeroPage.value = $event : null,
              "total-pages": unref(zeroPages),
              total: unref(zeroTotal),
              "per-page": INSIGHT_PER_PAGE,
              class: "mt-3"
            }, null, _parent));
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex items-center gap-3 mb-4"><div class="w-8 h-8 rounded-full bg-emerald-900/60 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">3</div><div><h2 class="text-base font-bold text-white">Apa yang Harus Dilakukan?</h2><p class="text-xs text-gray-500">Rekomendasi aksi prioritas untuk menutup gap revenue</p></div></div><div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5"><div class="card border border-red-900/50"><div class="section-title text-red-400 mb-3"><i class="fa-solid fa-bolt mr-1.5"></i>🔴 Akselerasi Proyek Critical </div><div class="text-xs text-gray-400 mb-3 leading-relaxed"><strong class="text-red-300">${ssrInterpolate(unref(data).critical_count)} proyek</strong> dalam status Critical/High Risk dengan total nilai <strong class="text-white">${ssrInterpolate(unref(fmt).rupiah(unref(criticalValue)))}</strong> terancam tidak terealisasi tahun ini. </div>`);
        if (unref(data).at_risk_projects?.length) {
          _push(`<div class="space-y-2 mb-3"><!--[-->`);
          ssrRenderList(unref(data).at_risk_projects.slice(0, 3), (p) => {
            _push(`<div class="flex items-center gap-2 p-2 rounded bg-red-900/10 border border-red-900/20"><div class="flex-1 min-w-0"><div class="text-xs font-medium text-gray-200 truncate">${ssrInterpolate(p.client)}</div><div class="text-xs text-gray-500">${ssrInterpolate(p.organisasi)} · ${ssrInterpolate(p.status)}</div></div><div class="text-xs font-semibold text-red-400 flex-shrink-0">${ssrInterpolate(unref(fmt).rupiah(p.revenue_target))}</div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="bg-navy-800/60 rounded-lg p-2.5 text-xs text-gray-400"><strong class="text-white block mb-1">Langkah:</strong><ol class="list-decimal list-inside space-y-0.5"><li>Review progress setiap proyek minggu ini</li><li>Identifikasi hambatan teknis/komersial</li><li>Eskalasi ke manajemen jika ada hambatan serius</li><li>Update action plan dalam sistem</li></ol></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/revenue/tracker?status=Critical",
          class: "mt-3 btn-secondary btn-sm w-full justify-center text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Buka Revenue Tracker <i class="fa-solid fa-arrow-right ml-1"${_scopeId}></i>`);
            } else {
              return [
                createTextVNode(" Buka Revenue Tracker "),
                createVNode("i", { class: "fa-solid fa-arrow-right ml-1" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="card border border-yellow-900/50"><div class="section-title text-yellow-400 mb-3"><i class="fa-solid fa-chart-line mr-1.5"></i>🟡 Kejar Gap Bulan Berjalan </div><div class="text-xs text-gray-400 mb-3 leading-relaxed"> Gap dari target berjalan sebesar <strong class="text-red-300">${ssrInterpolate(unref(fmt).rupiah(unref(data).gap_ytd))}</strong>. Dengan run rate ${ssrInterpolate(unref(fmt).rupiah(unref(data).run_rate))}/bulan, proyeksi akhir tahun <strong class="${ssrRenderClass(unref(data).projected_ach >= 80 ? "text-emerald-300" : "text-red-300")}">${ssrInterpolate(unref(data).projected_ach)}%</strong> dari target. </div><div class="space-y-2 mb-3"><div class="flex justify-between text-xs"><span class="text-gray-500">Target EOY</span><span class="font-semibold text-gray-200">${ssrInterpolate(unref(fmt).rupiah(unref(data).projected_eoy > 0 ? unref(data).projected_eoy / (unref(data).projected_ach / 100) : 0))}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Proyeksi EOY</span><span class="${ssrRenderClass([unref(data).projected_ach >= 80 ? "text-emerald-400" : "text-red-400", "font-semibold"])}">${ssrInterpolate(unref(fmt).rupiah(unref(data).projected_eoy))}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Sisa target (bln ${ssrInterpolate(unref(data).cur_month + 1)}-12)</span><span class="font-semibold text-primary-300">${ssrInterpolate(unref(fmt).rupiah(unref(data).remain_target))}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Bulan miss target</span><span class="font-semibold text-red-400">${ssrInterpolate(unref(data).miss_months_count)} dari ${ssrInterpolate(unref(data).past_months_count)} bulan</span></div></div><div class="bg-navy-800/60 rounded-lg p-2.5 text-xs text-gray-400"><strong class="text-white block mb-1">Langkah:</strong><ol class="list-decimal list-inside space-y-0.5"><li>Fokus akselerasi bulan-bulan sisa tahun</li><li>Pastikan milestone proyek termin sesuai jadwal</li><li>Push closing proyek yang sudah di tahap akhir</li><li>Review kembali target yang realistis</li></ol></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/revenue",
          class: "mt-3 btn-secondary btn-sm w-full justify-center text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Buka Revenue Dashboard <i class="fa-solid fa-arrow-right ml-1"${_scopeId}></i>`);
            } else {
              return [
                createTextVNode(" Buka Revenue Dashboard "),
                createVNode("i", { class: "fa-solid fa-arrow-right ml-1" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="card border border-orange-900/50"><div class="section-title text-orange-400 mb-3"><i class="fa-solid fa-file-invoice-dollar mr-1.5"></i>🟠 Tagih Invoice Outstanding </div><div class="text-xs text-gray-400 mb-3 leading-relaxed"> Ada <strong class="text-orange-300">${ssrInterpolate(unref(data).outstanding_count)} invoice</strong> belum lunas senilai <strong class="text-white">${ssrInterpolate(unref(fmt).rupiah(unref(data).outstanding_amount))}</strong>. Pembayaran invoice akan langsung menambah realisasi bulan ini. </div><div class="bg-navy-800/60 rounded-lg p-2.5 text-xs text-gray-400 mb-3"><strong class="text-white block mb-1">Langkah:</strong><ol class="list-decimal list-inside space-y-0.5"><li>Kirim reminder ke client dengan invoice outstanding</li><li>Cek jadwal jatuh tempo setiap invoice</li><li>Eskalasi ke finance jika sudah lewat jatuh tempo</li><li>Catat pembayaran segera setelah diterima</li></ol></div>`);
        if (unref(data).zero_count > 0) {
          _push(`<div class="text-xs text-yellow-400/80 bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-2.5 mb-3"><i class="fa-solid fa-triangle-exclamation mr-1"></i><strong>${ssrInterpolate(unref(data).zero_count)} proyek</strong> senilai ${ssrInterpolate(unref(fmt).rupiah(unref(zeroValue)))} belum ada realisasi sama sekali — perlu diprioritaskan untuk invoicing. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/revenue/invoice",
          class: "mt-1 btn-secondary btn-sm w-full justify-center text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Buka Invoice &amp; Payment <i class="fa-solid fa-arrow-right ml-1"${_scopeId}></i>`);
            } else {
              return [
                createTextVNode(" Buka Invoice & Payment "),
                createVNode("i", { class: "fa-solid fa-arrow-right ml-1" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-layer-group mr-1.5"></i>Status Seluruh Proyek</div><div class="space-y-2.5"><!--[-->`);
        ssrRenderList(unref(data).by_status, (s) => {
          _push(`<div class="flex items-center gap-3"><span class="${ssrRenderClass([unref(fmt).statusClass(s.status), "w-20 text-xs flex-shrink-0"])}">${ssrInterpolate(s.status)}</span><div class="flex-1 h-4 bg-navy-800 rounded overflow-hidden"><div class="${ssrRenderClass([s.status === "On Track" ? "bg-emerald-600" : s.status === "At Risk" ? "bg-yellow-600" : "bg-red-600", "h-full rounded transition-all duration-700 flex items-center px-2"])}" style="${ssrRenderStyle(`width:${unref(totalProjects) ? Math.round(s.cnt / unref(totalProjects) * 100) : 0}%`)}">`);
          if (s.cnt / unref(totalProjects) * 100 > 15) {
            _push(`<span class="text-xs font-bold text-white">${ssrInterpolate(Math.round(s.cnt / unref(totalProjects) * 100))}% </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><span class="text-xs text-gray-400 flex-shrink-0 w-4 text-right">${ssrInterpolate(s.cnt)}</span><span class="text-xs text-gray-600 flex-shrink-0 w-28 text-right">${ssrInterpolate(unref(fmt).rupiah(s.target))}</span><span class="${ssrRenderClass([s.status === "On Track" ? "text-emerald-400" : "text-red-400", "text-xs flex-shrink-0 w-28 text-right"])}">${ssrInterpolate(unref(fmt).rupiah(s.actual))}</span></div>`);
        });
        _push(`<!--]--></div><div class="flex justify-end gap-4 mt-2 text-xs text-gray-600"><span>Target</span><span>Realisasi</span></div></div><!--]-->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/revenue/insights.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=insights-C7lNAZ8j.js.map
