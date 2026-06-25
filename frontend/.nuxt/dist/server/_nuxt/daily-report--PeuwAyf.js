import { _ as __nuxt_component_1 } from "./AppPagination-DUr1sfAX.js";
import { defineComponent, ref, computed, reactive, watch, unref, isRef, useSSRContext } from "vue";
import { ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderComponent, ssrRenderTeleport } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import "../server.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ufo/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/klona/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "daily-report",
  __ssrInlineRender: true,
  setup(__props) {
    const today = /* @__PURE__ */ new Date();
    const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    const pickerYear = ref(today.getFullYear());
    const pickerMonth = ref(today.getMonth() + 1);
    const yearRange = computed(() => {
      const cur = today.getFullYear();
      return Array.from({ length: 5 }, (_, i) => cur - 2 + i);
    });
    const filterMonth = computed({
      get: () => `${pickerYear.value}-${String(pickerMonth.value).padStart(2, "0")}`,
      set: (v) => {
        const [y, m] = v.split("-").map(Number);
        pickerYear.value = y;
        pickerMonth.value = m;
      }
    });
    const filterUserId = ref("");
    const filterStatus = ref("");
    const loading = ref(false);
    const reports = ref([]);
    const page = ref(1);
    const perPage = ref(15);
    const totalCount = ref(0);
    const totalPages = ref(1);
    const salesList = ref([]);
    const errorMsg = ref("");
    const mapModal = reactive({
      show: false,
      lat: 0,
      lng: 0,
      address: "",
      salesNama: ""
    });
    ref(null);
    watch(() => mapModal.show, (v) => {
    });
    const summary = computed(() => ({
      total: reports.value.length,
      sent: reports.value.filter((r) => r.status === "sent").length,
      draft: reports.value.filter((r) => r.status === "draft").length,
      salesAktif: new Set(reports.value.map((r) => r.user_id)).size
    }));
    const statsCards = computed(() => [
      { label: "Total Laporan", value: summary.value.total, icon: "fa-clipboard-list", bg: "bg-purple-900/60", color: "text-purple-300" },
      { label: "Terkirim", value: summary.value.sent, icon: "fa-paper-plane", bg: "bg-green-900/60", color: "text-green-300" },
      { label: "Draft", value: summary.value.draft, icon: "fa-pen", bg: "bg-yellow-900/60", color: "text-yellow-300" },
      { label: "Sales Melapor", value: summary.value.salesAktif, icon: "fa-users", bg: "bg-blue-900/60", color: "text-blue-300" }
    ]);
    const trendData = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const r of reports.value) {
        const d = String(r.report_date).slice(0, 10);
        if (!map.has(d)) map.set(d, { fu: 0, visit: 0 });
        map.get(d).fu += r.fu_count ?? 0;
        map.get(d).visit += r.visit_count ?? 0;
      }
      return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([date, v]) => ({ date, fu: v.fu, visit: v.visit }));
    });
    const trendMaxVal = computed(
      () => Math.max(1, ...trendData.value.map((d) => Math.max(d.fu, d.visit)))
    );
    const salesStats = computed(() => {
      const map = /* @__PURE__ */ new Map();
      for (const r of reports.value) {
        const name = r.sales_nama ?? "—";
        if (!map.has(name)) map.set(name, { sent: 0, draft: 0 });
        if (r.status === "sent") map.get(name).sent++;
        else map.get(name).draft++;
      }
      return [...map.entries()].map(([nama, v]) => ({ nama, ...v, total: v.sent + v.draft })).sort((a, b) => b.total - a.total);
    });
    const salesMax = computed(
      () => Math.max(1, ...salesStats.value.map((s) => s.total))
    );
    const moodData = computed(() => ({
      great: reports.value.filter((r) => ["great", "happy", "good"].includes(r.mood ?? "")).length,
      okay: reports.value.filter((r) => ["okay", "neutral"].includes(r.mood ?? "")).length,
      tough: reports.value.filter((r) => ["tough", "sad", "hard"].includes(r.mood ?? "")).length
    }));
    const moodTotal = computed(() => moodData.value.great + moodData.value.okay + moodData.value.tough);
    async function loadReports(resetPage = false) {
      if (resetPage) page.value = 1;
      loading.value = true;
      errorMsg.value = "";
      try {
        const { get: apiGet } = useApi();
        const params = { month: filterMonth.value, page: page.value, per_page: perPage.value };
        if (filterUserId.value) params.user_id = filterUserId.value;
        if (filterStatus.value) params.status = filterStatus.value;
        const data = await apiGet("/v1/daily-report", params);
        reports.value = (data.reports ?? []).map((r) => ({ ...r, _open: false }));
        totalCount.value = data.total ?? 0;
        totalPages.value = data.total_pages ?? 1;
      } catch (e) {
        errorMsg.value = e?.data?.message ?? e?.message ?? String(e);
      } finally {
        loading.value = false;
      }
    }
    watch([page, perPage], () => loadReports());
    function moodEmoji(mood) {
      if (["great", "happy", "good"].includes(mood)) return "😊";
      if (["okay", "neutral"].includes(mood)) return "😐";
      if (["tough", "sad", "hard"].includes(mood)) return "😔";
      return "—";
    }
    function moodBg(mood) {
      if (["great", "happy", "good"].includes(mood)) return "bg-green-900/60";
      if (["tough", "sad", "hard"].includes(mood)) return "bg-red-900/60";
      return "bg-apex-input";
    }
    function statusClass(status) {
      if (status === "sent") return "bg-green-900/60 text-green-300";
      if (status === "reviewed") return "bg-blue-900/60 text-blue-300";
      return "bg-yellow-900/60 text-yellow-300";
    }
    function statusLabel(status) {
      if (status === "sent") return "✅ Terkirim";
      if (status === "reviewed") return "👁️ Reviewed";
      return "✏️ Draft";
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AppPagination = __nuxt_component_1;
      _push(`<!--[--><div><div class="px-6 py-5 border-b border-apex-border flex items-center justify-between gap-4 flex-wrap"><div><h1 class="text-xl font-bold text-apex-text flex items-center gap-2"><i class="fa-solid fa-clipboard-list text-purple-400"></i> Laporan Harian </h1><p class="text-xs text-apex-muted mt-0.5">Laporan harian yang dikirim sales via APEX Mobile App</p></div></div><div class="px-6 pt-5 flex flex-wrap gap-3 items-end"><div class="flex flex-col gap-1"><label class="text-xs text-apex-muted font-medium">Periode</label><div class="flex items-center gap-1 bg-apex-surface border border-apex-border rounded-lg px-2 py-1.5"><button class="w-6 h-6 flex items-center justify-center rounded hover:bg-apex-card text-apex-muted hover:text-apex-text transition"><i class="fa-solid fa-chevron-left text-[10px]"></i></button><select class="bg-transparent text-sm text-apex-text focus:outline-none cursor-pointer"><!--[-->`);
      ssrRenderList(MONTH_NAMES, (m, i) => {
        _push(`<option${ssrRenderAttr("value", i + 1)}${ssrIncludeBooleanAttr(Array.isArray(unref(pickerMonth)) ? ssrLooseContain(unref(pickerMonth), i + 1) : ssrLooseEqual(unref(pickerMonth), i + 1)) ? " selected" : ""}>${ssrInterpolate(m)}</option>`);
      });
      _push(`<!--]--></select><select class="bg-transparent text-sm text-apex-text focus:outline-none cursor-pointer w-16"><!--[-->`);
      ssrRenderList(unref(yearRange), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(pickerYear)) ? ssrLooseContain(unref(pickerYear), y) : ssrLooseEqual(unref(pickerYear), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select><button class="w-6 h-6 flex items-center justify-center rounded hover:bg-apex-card text-apex-muted hover:text-apex-text transition"><i class="fa-solid fa-chevron-right text-[10px]"></i></button></div></div><div class="flex flex-col gap-1"><label class="text-xs text-apex-muted font-medium">Sales</label><select class="bg-apex-surface border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:ring-2 focus:ring-purple-500 focus:outline-none"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterUserId)) ? ssrLooseContain(unref(filterUserId), "") : ssrLooseEqual(unref(filterUserId), "")) ? " selected" : ""}>Semua Sales</option><!--[-->`);
      ssrRenderList(unref(salesList), (s) => {
        _push(`<option${ssrRenderAttr("value", s.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(filterUserId)) ? ssrLooseContain(unref(filterUserId), s.id) : ssrLooseEqual(unref(filterUserId), s.id)) ? " selected" : ""}>${ssrInterpolate(s.nama)}</option>`);
      });
      _push(`<!--]--></select></div><div class="flex flex-col gap-1"><label class="text-xs text-apex-muted font-medium">Status</label><select class="bg-apex-surface border border-apex-border rounded-lg px-3 py-2 text-sm text-apex-text focus:ring-2 focus:ring-purple-500 focus:outline-none"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "") : ssrLooseEqual(unref(filterStatus), "")) ? " selected" : ""}>Semua Status</option><option value="draft"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "draft") : ssrLooseEqual(unref(filterStatus), "draft")) ? " selected" : ""}>Draft</option><option value="sent"${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "sent") : ssrLooseEqual(unref(filterStatus), "sent")) ? " selected" : ""}>Terkirim</option></select></div><button class="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-apex-text text-sm px-4 py-2 rounded-lg font-medium transition"><i class="fa-solid fa-magnifying-glass"></i> Filter </button><button class="text-sm text-apex-muted hover:text-apex-text px-3 py-2 transition"> Reset </button></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 pt-5"><!--[-->`);
      ssrRenderList(unref(statsCards), (s) => {
        _push(`<div class="bg-apex-surface border border-apex-border rounded-xl p-4 flex items-center gap-3"><div class="${ssrRenderClass([s.bg, "w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"])}"><i class="${ssrRenderClass(["fa-solid", s.icon, s.color])}"></i></div><div><div class="text-2xl font-bold text-apex-text leading-none">${ssrInterpolate(s.value)}</div><div class="text-xs text-apex-muted mt-0.5">${ssrInterpolate(s.label)}</div></div></div>`);
      });
      _push(`<!--]--></div>`);
      if (unref(reports).length && !unref(loading)) {
        _push(`<div class="px-6 pt-5 grid grid-cols-1 lg:grid-cols-3 gap-5"><div class="lg:col-span-2 bg-apex-surface border border-apex-border rounded-xl p-5"><div class="text-xs text-apex-muted uppercase tracking-wider font-medium mb-4 flex items-center gap-2"><i class="fa-solid fa-chart-bar text-purple-400"></i>Tren Aktivitas Harian </div><div class="flex items-end gap-1 h-36 overflow-x-auto overflow-y-hidden pb-1"><!--[-->`);
        ssrRenderList(unref(trendData), (d) => {
          _push(`<div class="flex flex-col items-center gap-0.5 flex-shrink-0" style="${ssrRenderStyle({ "min-width": "24px" })}"><div class="flex items-end gap-0.5 h-28"><div style="${ssrRenderStyle({ height: unref(trendMaxVal) ? Math.max(2, Math.round(d.fu / unref(trendMaxVal) * 112)) + "px" : "2px" })}" class="w-2 rounded-t bg-purple-500/80 hover:bg-purple-400 transition-all relative group"${ssrRenderAttr("title", `FU: ${d.fu}`)}><div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-purple-300 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none bg-apex-input px-1 rounded">${ssrInterpolate(d.fu)}</div></div><div style="${ssrRenderStyle({ height: unref(trendMaxVal) ? Math.max(2, Math.round(d.visit / unref(trendMaxVal) * 112)) + "px" : "2px" })}" class="w-2 rounded-t bg-emerald-500/80 hover:bg-emerald-400 transition-all relative group"${ssrRenderAttr("title", `Visit: ${d.visit}`)}><div class="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-emerald-300 opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none bg-apex-input px-1 rounded">${ssrInterpolate(d.visit)}</div></div></div><div class="text-[10px] text-apex-faint mt-1 text-center">${ssrInterpolate(d.date.slice(8))}</div></div>`);
        });
        _push(`<!--]--></div><div class="flex items-center gap-4 mt-3"><div class="flex items-center gap-1.5 text-xs text-apex-muted"><div class="w-3 h-3 rounded-sm bg-purple-500/80"></div> FU </div><div class="flex items-center gap-1.5 text-xs text-apex-muted"><div class="w-3 h-3 rounded-sm bg-emerald-500/80"></div> Kunjungan </div></div></div><div class="bg-apex-surface border border-apex-border rounded-xl p-5"><div class="text-xs text-apex-muted uppercase tracking-wider font-medium mb-4 flex items-center gap-2"><i class="fa-solid fa-face-smile text-yellow-400"></i>Distribusi Mood </div><div class="flex items-center justify-center mb-4"><svg${ssrRenderAttr("viewBox", `0 0 120 120`)} class="w-28 h-28" style="${ssrRenderStyle({ "transform": "rotate(-90deg)" })}"><circle cx="60" cy="60" r="44" fill="none" stroke="#1f2937" stroke-width="22"></circle>`);
        if (unref(moodTotal) > 0) {
          _push(`<circle cx="60" cy="60" r="44" fill="none" stroke="#22c55e" stroke-width="22"${ssrRenderAttr("stroke-dasharray", `${unref(moodData).great / unref(moodTotal) * 276.46} 276.46`)} stroke-dashoffset="0"></circle>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(moodTotal) > 0) {
          _push(`<circle cx="60" cy="60" r="44" fill="none" stroke="#eab308" stroke-width="22"${ssrRenderAttr("stroke-dasharray", `${unref(moodData).okay / unref(moodTotal) * 276.46} 276.46`)}${ssrRenderAttr("stroke-dashoffset", `${-(unref(moodData).great / unref(moodTotal) * 276.46)}`)}></circle>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(moodTotal) > 0) {
          _push(`<circle cx="60" cy="60" r="44" fill="none" stroke="#ef4444" stroke-width="22"${ssrRenderAttr("stroke-dasharray", `${unref(moodData).tough / unref(moodTotal) * 276.46} 276.46`)}${ssrRenderAttr("stroke-dashoffset", `${-((unref(moodData).great + unref(moodData).okay) / unref(moodTotal) * 276.46)}`)}></circle>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<text x="60" y="60" text-anchor="middle" dominant-baseline="central" style="${ssrRenderStyle({ "transform": "rotate(90deg)", "transform-origin": "60px 60px" })}" class="fill-white text-sm font-bold" font-size="20" font-weight="700">${ssrInterpolate(unref(moodTotal))}</text><text x="60" y="76" text-anchor="middle" style="${ssrRenderStyle({ "transform": "rotate(90deg)", "transform-origin": "60px 60px" })}" class="fill-gray-400" font-size="9" fill="#9ca3af">laporan</text></svg></div><div class="space-y-2"><div class="flex items-center justify-between text-xs"><div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-green-500"></div><span class="text-apex-muted">Semangat 😊</span></div><span class="font-bold text-apex-text">${ssrInterpolate(unref(moodData).great)}</span></div><div class="flex items-center justify-between text-xs"><div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-yellow-500"></div><span class="text-apex-muted">Biasa 😐</span></div><span class="font-bold text-apex-text">${ssrInterpolate(unref(moodData).okay)}</span></div><div class="flex items-center justify-between text-xs"><div class="flex items-center gap-1.5"><div class="w-2.5 h-2.5 rounded-full bg-red-500"></div><span class="text-apex-muted">Berat 😔</span></div><span class="font-bold text-apex-text">${ssrInterpolate(unref(moodData).tough)}</span></div></div></div><div class="lg:col-span-3 bg-apex-surface border border-apex-border rounded-xl p-5"><div class="text-xs text-apex-muted uppercase tracking-wider font-medium mb-4 flex items-center gap-2"><i class="fa-solid fa-users text-blue-400"></i>Kepatuhan Laporan per Sales </div><div class="space-y-3"><!--[-->`);
        ssrRenderList(unref(salesStats), (s) => {
          _push(`<div class="flex items-center gap-3"><div class="w-32 text-xs text-apex-muted truncate text-right shrink-0">${ssrInterpolate(s.nama)}</div><div class="flex-1 flex items-center gap-0"><div style="${ssrRenderStyle({ width: unref(salesMax) ? Math.max(4, Math.round(s.sent / unref(salesMax) * 100)) + "%" : "4px" })}" class="${ssrRenderClass([s.sent > 0 ? "bg-green-600/70" : "hidden", "h-5 rounded-l flex items-center justify-end pr-1 transition-all"])}">`);
          if (s.sent > 0) {
            _push(`<span class="text-[10px] text-green-200 font-bold">${ssrInterpolate(s.sent)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div style="${ssrRenderStyle({ width: unref(salesMax) ? Math.max(4, Math.round(s.draft / unref(salesMax) * 100)) + "%" : "4px" })}" class="${ssrRenderClass([[s.draft > 0 ? "bg-yellow-600/60" : "hidden", s.sent === 0 ? "rounded-l" : "", "rounded-r"], "h-5 flex items-center justify-end pr-1 transition-all"])}">`);
          if (s.draft > 0) {
            _push(`<span class="text-[10px] text-yellow-200 font-bold">${ssrInterpolate(s.draft)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="w-10 text-xs text-apex-faint shrink-0">${ssrInterpolate(s.total)}x</div></div>`);
        });
        _push(`<!--]--></div><div class="flex items-center gap-4 mt-4"><div class="flex items-center gap-1.5 text-xs text-apex-muted"><div class="w-3 h-3 rounded-sm bg-green-600/70"></div> Terkirim </div><div class="flex items-center gap-1.5 text-xs text-apex-muted"><div class="w-3 h-3 rounded-sm bg-yellow-600/60"></div> Draft </div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(errorMsg)) {
        _push(`<div class="mx-6 mt-5 bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm flex items-start gap-3"><i class="fa-solid fa-triangle-exclamation mt-0.5 shrink-0"></i><div><div class="font-semibold mb-1">Gagal memuat data</div><div class="font-mono text-xs opacity-75">${ssrInterpolate(unref(errorMsg))}</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="flex items-center justify-center py-24 text-apex-faint"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat laporan… </div>`);
      } else if (!unref(reports).length) {
        _push(`<div class="mx-6 mt-5 bg-apex-surface border border-dashed border-apex-border rounded-xl p-16 text-center"><div class="text-5xl mb-4">📋</div><div class="font-bold text-apex-muted text-lg mb-2">Belum ada laporan</div><div class="text-apex-faint text-sm">Laporan harian dikirim sales via APEX Mobile App.</div></div>`);
      } else {
        _push(`<div class="px-6 pt-5 pb-10"><div class="space-y-3 md:hidden"><!--[-->`);
        ssrRenderList(unref(reports), (r) => {
          _push(`<div class="bg-apex-surface border border-apex-border rounded-xl overflow-hidden"><div class="flex items-center gap-3 px-4 py-3 cursor-pointer"><div class="${ssrRenderClass([moodBg(r.mood), "w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xl"])}">${ssrInterpolate(moodEmoji(r.mood))}</div><div class="flex-1 min-w-0"><div class="flex items-center gap-2 flex-wrap"><span class="font-semibold text-apex-text text-sm">${ssrInterpolate(r.sales_nama)}</span><span class="${ssrRenderClass([statusClass(r.status), "text-xs px-2 py-0.5 rounded-full font-medium"])}">${ssrInterpolate(statusLabel(r.status))}</span></div><div class="text-xs text-apex-muted mt-0.5"> 📅 ${ssrInterpolate(r.report_date)}  ·  ${ssrInterpolate(r.fu_count ?? 0)} FU  ·  ${ssrInterpolate(r.visit_count ?? 0)} kunjungan </div></div><i class="${ssrRenderClass([r._open ? "rotate-180" : "", "fa-solid fa-chevron-down text-apex-faint text-xs transition-transform shrink-0"])}"></i></div>`);
          if (r._open) {
            _push(`<div class="px-4 pb-4 border-t border-apex-border pt-3 space-y-3">`);
            if (r.notes_obstacle) {
              _push(`<div class="bg-red-950/40 border border-red-900/40 rounded-lg p-3"><div class="text-xs font-bold text-red-400 mb-1">⚠️ Hambatan</div><p class="text-apex-muted text-sm leading-relaxed whitespace-pre-line">${ssrInterpolate(r.notes_obstacle)}</p></div>`);
            } else {
              _push(`<!---->`);
            }
            if (r.notes_plan) {
              _push(`<div class="bg-blue-950/40 border border-blue-900/40 rounded-lg p-3"><div class="text-xs font-bold text-blue-400 mb-1">📌 Rencana Besok</div><p class="text-apex-muted text-sm leading-relaxed whitespace-pre-line">${ssrInterpolate(r.notes_plan)}</p></div>`);
            } else {
              _push(`<!---->`);
            }
            if (r.send_latitude && r.send_longitude) {
              _push(`<div class="bg-emerald-950/40 border border-emerald-900/40 rounded-lg p-3"><div class="text-xs font-bold text-emerald-400 mb-1"><i class="fa-solid fa-location-dot mr-1"></i>Lokasi Kirim </div><p class="text-apex-muted text-xs">${ssrInterpolate(r.send_address || `${r.send_latitude}, ${r.send_longitude}`)}</p><button class="mt-1.5 text-xs text-emerald-400 hover:text-emerald-300 underline"> Lihat di peta → </button></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="text-xs text-apex-faint"> Dikirim: ${ssrInterpolate(r.sent_at ? r.sent_at.slice(0, 16).replace("T", " ") : "—")}</div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div><div class="hidden md:block bg-apex-surface border border-apex-border rounded-xl overflow-hidden"><table class="w-full text-sm"><thead class="border-b border-apex-border"><tr class="text-xs text-apex-muted uppercase tracking-wide"><th class="text-left px-5 py-3">Tanggal</th><th class="text-left px-4 py-3">Sales</th><th class="text-center px-4 py-3">Status</th><th class="text-center px-4 py-3">Mood</th><th class="text-center px-4 py-3">FU</th><th class="text-center px-4 py-3">Visit</th><th class="text-center px-4 py-3">Lead Baru</th><th class="text-left px-4 py-3">Hambatan</th><th class="text-left px-4 py-3">Rencana Besok</th><th class="text-center px-4 py-3">Lokasi</th><th class="text-left px-4 py-3">Dikirim</th></tr></thead><tbody class="divide-y divide-apex-border"><!--[-->`);
        ssrRenderList(unref(reports), (r) => {
          _push(`<!--[--><tr class="hover:bg-apex-card/40 cursor-pointer transition-colors"><td class="px-5 py-3 font-mono text-apex-muted text-xs whitespace-nowrap">${ssrInterpolate(r.report_date)}</td><td class="px-4 py-3 font-semibold text-apex-text">${ssrInterpolate(r.sales_nama)}</td><td class="px-4 py-3 text-center"><span class="${ssrRenderClass([statusClass(r.status), "px-2.5 py-1 rounded-full text-xs font-semibold"])}">${ssrInterpolate(statusLabel(r.status))}</span></td><td class="px-4 py-3 text-center text-lg">${ssrInterpolate(moodEmoji(r.mood))}</td><td class="px-4 py-3 text-center font-bold text-apex-text">${ssrInterpolate(r.fu_count ?? 0)}</td><td class="px-4 py-3 text-center font-bold text-apex-text">${ssrInterpolate(r.visit_count ?? 0)}</td><td class="px-4 py-3 text-center font-bold text-apex-text">${ssrInterpolate(r.new_lead_count ?? 0)}</td><td class="px-4 py-3 text-xs text-apex-muted max-w-[180px]">`);
          if (r.notes_obstacle) {
            _push(`<span class="text-red-400"> ⚠️ ${ssrInterpolate(r.notes_obstacle.slice(0, 50))}${ssrInterpolate(r.notes_obstacle.length > 50 ? "…" : "")}</span>`);
          } else {
            _push(`<span class="text-apex-faint">—</span>`);
          }
          _push(`</td><td class="px-4 py-3 text-xs text-apex-muted max-w-[180px]">${ssrInterpolate(r.notes_plan ? r.notes_plan.slice(0, 50) + (r.notes_plan.length > 50 ? "…" : "") : "—")}</td><td class="px-4 py-3 text-center">`);
          if (r.send_latitude && r.send_longitude) {
            _push(`<button class="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-800/50 px-2 py-1 rounded-lg transition"><i class="fa-solid fa-location-dot text-[11px]"></i> Lihat </button>`);
          } else {
            _push(`<span class="text-apex-faint text-xs">—</span>`);
          }
          _push(`</td><td class="px-4 py-3 text-xs text-apex-faint whitespace-nowrap">${ssrInterpolate(r.sent_at ? r.sent_at.slice(0, 16).replace("T", " ") : "—")}</td></tr>`);
          if (r._open) {
            _push(`<tr class="bg-apex-card/30"><td colspan="11" class="px-5 py-4"><div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">`);
            if (r.notes_obstacle) {
              _push(`<div class="bg-red-950/40 border border-red-900/40 rounded-lg p-3"><div class="text-xs font-bold text-red-400 mb-2">⚠️ Hambatan</div><p class="text-apex-muted text-xs leading-relaxed whitespace-pre-line">${ssrInterpolate(r.notes_obstacle)}</p></div>`);
            } else {
              _push(`<!---->`);
            }
            if (r.notes_plan) {
              _push(`<div class="bg-blue-950/40 border border-blue-900/40 rounded-lg p-3"><div class="text-xs font-bold text-blue-400 mb-2">📌 Rencana Besok</div><p class="text-apex-muted text-xs leading-relaxed whitespace-pre-line">${ssrInterpolate(r.notes_plan)}</p></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="flex flex-col gap-2">`);
            if (r.send_latitude && r.send_longitude) {
              _push(`<div class="bg-emerald-950/40 border border-emerald-900/40 rounded-lg p-3"><div class="text-xs font-bold text-emerald-400 mb-2"><i class="fa-solid fa-location-dot mr-1"></i>Lokasi Kirim Laporan </div><p class="text-apex-muted text-xs leading-relaxed">${ssrInterpolate(r.send_address || `${r.send_latitude}, ${r.send_longitude}`)}</p><button class="mt-2 text-xs text-emerald-400 hover:text-emerald-300 underline"> Lihat di peta → </button></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<div class="text-xs text-apex-faint"> ID: #${ssrInterpolate(r.id)}  ·  Dibuat: ${ssrInterpolate(r.created_at ? r.created_at.slice(0, 16).replace("T", " ") : "—")}</div></div></div></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]--></tbody></table>`);
        _push(ssrRenderComponent(_component_AppPagination, {
          page: unref(page),
          "onUpdate:page": ($event) => isRef(page) ? page.value = $event : null,
          "per-page": unref(perPage),
          "onUpdate:perPage": ($event) => isRef(perPage) ? perPage.value = $event : null,
          total: unref(totalCount),
          "total-pages": unref(totalPages),
          "per-page-options": [10, 25, 50]
        }, null, _parent));
        _push(`</div></div>`);
      }
      _push(`</div>`);
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(mapModal).show) {
          _push2(`<div class="fixed inset-0 z-50 flex items-center justify-center p-4" style="${ssrRenderStyle({ "background": "rgba(0,0,0,0.7)" })}"><div class="bg-apex-surface border border-apex-border rounded-2xl overflow-hidden shadow-2xl w-full max-w-2xl"><div class="flex items-center justify-between px-5 py-3 border-b border-apex-border"><div><div class="font-semibold text-apex-text text-sm flex items-center gap-2"><i class="fa-solid fa-location-dot text-emerald-400"></i> Lokasi Kirim Laporan — ${ssrInterpolate(unref(mapModal).salesNama)}</div><div class="text-xs text-apex-muted mt-0.5">${ssrInterpolate(unref(mapModal).address)}</div></div><button class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-apex-card text-apex-muted hover:text-apex-text transition"><i class="fa-solid fa-xmark"></i></button></div><div style="${ssrRenderStyle({ "height": "400px", "background": "#0d1b31" })}"></div><div class="flex items-center justify-between px-5 py-3 border-t border-apex-border text-xs text-apex-faint"><span>${ssrInterpolate(unref(mapModal).lat.toFixed(6))}, ${ssrInterpolate(unref(mapModal).lng.toFixed(6))}</span><a${ssrRenderAttr("href", `https://www.openstreetmap.org/?mlat=${unref(mapModal).lat}&mlon=${unref(mapModal).lng}#map=16/${unref(mapModal).lat}/${unref(mapModal).lng}`)} target="_blank" rel="noopener" class="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition"> Buka di OpenStreetMap <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i></a></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/daily-report.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=daily-report--PeuwAyf.js.map
