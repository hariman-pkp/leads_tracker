import { defineComponent, ref, computed, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass, ssrRenderStyle } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import { u as useAuthStore } from "../server.mjs";
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
  __name: "sales-target",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const fmt = useFormat();
    const auth = useAuthStore();
    const curYear = (/* @__PURE__ */ new Date()).getFullYear();
    const selectedYear = ref(curYear);
    const years = Array.from({ length: 4 }, (_, i) => curYear - i);
    const loading = ref(false);
    const editMode = ref(false);
    const saving = ref(false);
    const rows = ref([]);
    const isAdmin = computed(() => auth.user?.role_id === 1);
    const canEdit = computed(() => [1, 2].includes(auth.user?.role_id ?? 0));
    const lockDate = ref("");
    const isTargetLocked = computed(() => {
      if (!lockDate.value) return false;
      if (isAdmin.value) return false;
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      return today >= lockDate.value;
    });
    const canSetTarget = computed(() => canEdit.value && !isTargetLocked.value);
    const pendingChanges = ref([]);
    const saveError = ref("");
    function achColor(pct) {
      if (pct === null) return "text-apex-muted";
      if (pct >= 80) return "text-emerald-400";
      if (pct >= 50) return "text-yellow-400";
      return "text-red-400";
    }
    function achBg(pct) {
      if (pct === null) return "bg-apex-border";
      if (pct >= 80) return "bg-emerald-500";
      if (pct >= 50) return "bg-yellow-500";
      return "bg-red-500";
    }
    function cellClass(m) {
      if (m.target <= 0) return "border-apex-border/30 bg-apex-bg";
      if (m.achievement_pct === null) return "border-apex-border bg-apex-card";
      if (m.achievement_pct >= 80) return "border-emerald-500 bg-emerald-500/10";
      if (m.achievement_pct >= 50) return "border-yellow-500 bg-yellow-500/10";
      return "border-red-500 bg-red-500/10";
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-apex-bg text-apex-text p-6" }, _attrs))}><div class="flex flex-wrap items-center justify-between gap-4 mb-6"><div><h1 class="text-2xl font-bold text-apex-text"><i class="fa-solid fa-bullseye text-yellow-400 mr-2"></i>Target Sales Individu </h1><p class="text-sm text-apex-muted mt-0.5">Target deal per sales per bulan vs pencapaian aktual</p></div><div class="flex items-center gap-3"><select class="form-select text-sm w-28"><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedYear)) ? ssrLooseContain(unref(selectedYear), y) : ssrLooseEqual(unref(selectedYear), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (unref(lockDate)) {
        _push(`<div class="${ssrRenderClass([unref(isTargetLocked) ? "bg-red-900/30 text-red-400 border border-red-800/50" : "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50", "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"])}"><i class="${ssrRenderClass(unref(isTargetLocked) ? "fa-solid fa-lock" : "fa-solid fa-lock-open")}"></i> ${ssrInterpolate(unref(isTargetLocked) ? "Target Terkunci" : "Target Terbuka")}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(canSetTarget)) {
        _push(`<button class="${ssrRenderClass([unref(editMode) ? "btn-danger" : "btn-primary", "flex items-center gap-2 text-sm"])}"><i class="${ssrRenderClass(unref(editMode) ? "fa-solid fa-xmark" : "fa-solid fa-pen")}"></i> ${ssrInterpolate(unref(editMode) ? "Batal Edit" : "Set Target")}</button>`);
      } else if (unref(isTargetLocked) && !unref(isAdmin)) {
        _push(`<button disabled class="btn-secondary btn-sm opacity-50 cursor-not-allowed flex items-center gap-2 text-sm"><i class="fa-solid fa-lock"></i> Target Terkunci </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center py-24 text-apex-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i>Memuat data... </div>`);
      } else if (unref(rows).length) {
        _push(`<!--[--><div class="flex items-center gap-4 mb-4 text-xs text-apex-muted"><span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-emerald-500/30 border border-emerald-500 inline-block"></span>≥ 80% target</span><span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-yellow-500/30 border border-yellow-500 inline-block"></span>50–79%</span><span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-red-500/30 border border-red-500 inline-block"></span>&lt; 50%</span><span class="flex items-center gap-1"><span class="w-3 h-3 rounded-sm bg-apex-border/30 border border-apex-border inline-block"></span>Belum ada target</span></div><div class="space-y-6"><!--[-->`);
        ssrRenderList(unref(rows), (row) => {
          _push(`<div class="apex-card"><div class="flex items-center justify-between mb-4"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-primary-900/50 text-primary-400 flex items-center justify-center text-sm font-bold">${ssrInterpolate(row.sales_nama[0])}</div><div><p class="font-semibold text-apex-text">${ssrInterpolate(row.sales_nama)}</p><p class="text-xs text-apex-muted"> YTD: ${ssrInterpolate(unref(fmt).rupiah(row.ytd_actual))} `);
          if (row.ytd_target > 0) {
            _push(`<span> / ${ssrInterpolate(unref(fmt).rupiah(row.ytd_target))} <span class="${ssrRenderClass([achColor(row.ytd_achievement_pct), "font-semibold ml-1"])}"> (${ssrInterpolate(row.ytd_achievement_pct ?? "—")}%) </span></span>`);
          } else {
            _push(`<span class="text-apex-muted ml-1">(target belum diset)</span>`);
          }
          _push(`</p></div></div>`);
          if (row.ytd_target > 0) {
            _push(`<div class="w-32 hidden md:block"><div class="h-2 bg-apex-border/30 rounded-full overflow-hidden"><div class="${ssrRenderClass([achBg(row.ytd_achievement_pct), "h-2 rounded-full transition-all"])}" style="${ssrRenderStyle({ width: Math.min(100, row.ytd_achievement_pct ?? 0) + "%" })}"></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2"><!--[-->`);
          ssrRenderList(row.bulan, (m) => {
            _push(`<div class="${ssrRenderClass([cellClass(m), "rounded-lg p-2 border text-center transition-colors"])}"><p class="text-xs font-medium text-apex-muted mb-1">${ssrInterpolate(m.bulan_label)}</p>`);
            if (unref(editMode)) {
              _push(`<!--[--><input type="number" min="0" step="1000000" class="w-full text-center text-xs bg-transparent border-b border-apex-border focus:outline-none focus:border-primary-400 text-apex-text"${ssrRenderAttr("value", m.target / 1e6)} placeholder="0"><p class="text-xs text-apex-muted mt-1">juta</p><!--]-->`);
            } else {
              _push(`<!--[--><p class="${ssrRenderClass([m.target > 0 ? "text-apex-text" : "text-apex-muted", "text-xs font-semibold"])}">${ssrInterpolate(m.target > 0 ? unref(fmt).rupiah(m.target) : "—")}</p>`);
              if (m.actual > 0) {
                _push(`<p class="text-xs text-emerald-400 font-semibold mt-0.5">${ssrInterpolate(unref(fmt).rupiah(m.actual))}</p>`);
              } else if (m.target > 0) {
                _push(`<p class="text-xs text-apex-muted mt-0.5">-</p>`);
              } else {
                _push(`<!---->`);
              }
              if (m.achievement_pct !== null) {
                _push(`<p class="${ssrRenderClass([achColor(m.achievement_pct), "text-xs font-bold mt-0.5"])}">${ssrInterpolate(m.achievement_pct)}% </p>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<!--]-->`);
            }
            _push(`</div>`);
          });
          _push(`<!--]--></div></div>`);
        });
        _push(`<!--]--></div>`);
        if (unref(editMode) && unref(pendingChanges).length) {
          _push(`<div class="fixed bottom-6 right-6 flex flex-col items-end gap-2">`);
          if (unref(saveError)) {
            _push(`<div class="bg-red-900/90 text-red-200 text-sm px-4 py-2 rounded-lg max-w-xs text-right"><i class="fa-solid fa-circle-exclamation mr-1"></i>${ssrInterpolate(unref(saveError))}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary flex items-center gap-2 shadow-lg px-6 py-3"><i class="${ssrRenderClass(unref(saving) ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-floppy-disk")}"></i> ${ssrInterpolate(unref(saving) ? "Menyimpan..." : `Simpan ${unref(pendingChanges).length} perubahan`)}</button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      } else {
        _push(`<div class="apex-card text-center py-12 text-apex-muted"> Belum ada data sales. Tambahkan user dengan role Sales terlebih dahulu. </div>`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/sales-target.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=sales-target-qGVpKI8_.js.map
