import { defineComponent, computed, ref, reactive, mergeProps, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
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
  __name: "kpi",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const fmt = useFormat();
    const authStore = useAuthStore();
    const isAdmin = computed(() => authStore.user?.role_id === 1);
    const loading = ref(true);
    const saving = ref(false);
    const selectedYear = ref((/* @__PURE__ */ new Date()).getFullYear());
    const years = ref([]);
    const kpiData = ref([]);
    const curQ = ref(Math.ceil((/* @__PURE__ */ new Date()).getMonth() + 1) / 3 | 0 || 1);
    const lockDate = ref("");
    const isTargetLocked = computed(() => {
      if (!lockDate.value) return false;
      if (isAdmin.value) return false;
      const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
      return today >= lockDate.value;
    });
    const lockSaving = ref(false);
    const lockInput = ref("");
    const editModal = reactive({
      open: false,
      isNew: false,
      form: {}
    });
    const deleteModal = reactive({ open: false, kpi: null });
    const CAT_ORDER = ["Lead Generation", "Activity", "Conversion", "Pipeline", "Quality", "Revenue"];
    const categories = computed(() => {
      const cats = [...new Set(kpiData.value.map((k) => k.kpi_category))];
      return cats.sort((a, b) => {
        const ia = CAT_ORDER.indexOf(a), ib = CAT_ORDER.indexOf(b);
        if (ia === -1 && ib === -1) return a.localeCompare(b);
        if (ia === -1) return 1;
        if (ib === -1) return -1;
        return ia - ib;
      });
    });
    function kpiByCategory(cat) {
      return kpiData.value.filter((k) => k.kpi_category === cat);
    }
    function qLabel(q) {
      const map = { 1: "Jan – Mar", 2: "Apr – Jun", 3: "Jul – Sep", 4: "Okt – Des" };
      return map[q];
    }
    function qKpiCount(q) {
      return kpiData.value.filter((k) => k[`q${q}_target`] > 0).length;
    }
    function fmtVal(val, unit) {
      if (val === 0) return "0";
      if (unit === "%") return val.toFixed(1) + "%";
      if (unit === "Miliar Rp") return val.toFixed(2) + " M";
      if (unit === "Juta Rp") return val.toFixed(1) + " jt";
      if (unit === "Days") return val.toFixed(1) + " hr";
      return new Intl.NumberFormat("id-ID").format(Math.round(val));
    }
    function achPct(actual, target) {
      if (!target) return 0;
      return Math.round(actual / target * 100);
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-apex-bg text-apex-text p-6" }, _attrs))}><div class="flex flex-wrap items-center justify-between gap-4 mb-6"><div><h1 class="text-2xl font-bold text-apex-text">KPI Prospecting</h1><p class="text-sm text-apex-muted mt-0.5">Monitoring kinerja prospecting &amp; pipeline penjualan</p></div><div class="flex items-center gap-3 flex-wrap">`);
      if (unref(lockDate)) {
        _push(`<div class="${ssrRenderClass([unref(isTargetLocked) ? "bg-red-900/30 text-red-400 border border-red-800/50" : "bg-emerald-900/30 text-emerald-400 border border-emerald-800/50", "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full"])}"><i class="${ssrRenderClass(unref(isTargetLocked) ? "fa-solid fa-lock" : "fa-solid fa-lock-open")}"></i> ${ssrInterpolate(unref(isTargetLocked) ? "Target Terkunci" : "Target Terbuka")} <span class="opacity-70">· s/d ${ssrInterpolate(new Date(unref(lockDate)).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }))}</span></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<select class="form-select text-sm w-28"><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(selectedYear)) ? ssrLooseContain(unref(selectedYear), y) : ssrLooseEqual(unref(selectedYear), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (unref(isAdmin)) {
        _push(`<button class="btn-primary flex items-center gap-2 text-sm"><i class="fa-solid fa-plus"></i> Tambah KPI </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(isAdmin)) {
        _push(`<div class="mb-5 card flex flex-wrap items-center gap-4"><div class="flex items-center gap-2 text-sm font-medium text-apex-muted"><i class="fa-solid fa-calendar-lock text-primary-400"></i> Kunci Target Setelah Tanggal: </div><input${ssrRenderAttr("value", unref(lockInput))} type="date" class="form-input w-44 text-sm"><button${ssrIncludeBooleanAttr(unref(lockSaving)) ? " disabled" : ""} class="btn-primary btn-sm">`);
        if (unref(lockSaving)) {
          _push(`<i class="fa-solid fa-spinner fa-spin"></i>`);
        } else {
          _push(`<i class="fa-solid fa-floppy-disk"></i>`);
        }
        _push(` Simpan </button><p class="text-xs text-apex-muted"> Setelah tanggal ini, non-admin tidak dapat mengubah nilai target. Admin tetap bisa edit kapan saja. </p></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(isTargetLocked) && !unref(isAdmin)) {
        _push(`<div class="mb-5 flex items-center gap-3 bg-red-900/20 border border-red-800/50 rounded-xl px-4 py-3 text-sm text-red-300"><i class="fa-solid fa-lock text-red-400 text-base"></i><span>Target tahun ${ssrInterpolate(unref(selectedYear))} sudah dikunci sejak <strong>${ssrInterpolate(new Date(unref(lockDate)).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }))}</strong>. Hubungi admin untuk perubahan target. </span></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="flex items-center justify-center py-20 text-apex-muted"><i class="fa-solid fa-spinner fa-spin mr-2"></i> Memuat data... </div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"><!--[-->`);
        ssrRenderList([1, 2, 3, 4], (q) => {
          _push(`<div class="${ssrRenderClass([
            "rounded-xl border p-4 transition-all",
            unref(curQ) === q ? "border-primary-500 bg-primary-900/20" : "border-apex-border bg-apex-surface"
          ])}"><div class="text-xs text-apex-muted font-medium mb-1"> Q${ssrInterpolate(q)} `);
          if (unref(curQ) === q) {
            _push(`<span class="ml-1 text-primary-400 text-[10px]">● Berjalan</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="text-sm font-semibold text-apex-text">${ssrInterpolate(qLabel(q))}</div><div class="mt-2 text-xs text-apex-faint">${ssrInterpolate(qKpiCount(q))} KPI terpantau </div></div>`);
        });
        _push(`<!--]--></div><!--[-->`);
        ssrRenderList(unref(categories), (cat) => {
          _push(`<div class="mb-6"><div class="flex items-center gap-2 mb-2"><span class="text-xs font-bold uppercase tracking-widest text-primary-400">${ssrInterpolate(cat)}</span><div class="flex-1 h-px bg-apex-card"></div></div><div class="card overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-apex-border"><th class="text-left py-2.5 px-3 text-apex-muted font-medium w-64">Indikator</th><th class="text-center py-2.5 px-2 text-apex-muted font-medium w-16">Unit</th><th class="text-center py-2.5 px-2 text-apex-muted font-medium w-12">Auto</th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24 border-l border-apex-border"> Q1 Target </th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24">Q1 Aktual</th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-16">Ach%</th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24 border-l border-apex-border"> Q2 Target </th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24">Q2 Aktual</th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-16">Ach%</th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24 border-l border-apex-border"> Q3 Target </th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24">Q3 Aktual</th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-16">Ach%</th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24 border-l border-apex-border"> Q4 Target </th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-24">Q4 Aktual</th><th class="text-right py-2.5 px-2 text-apex-faint font-medium w-16">Ach%</th><th class="py-2.5 px-3 w-20 text-center text-apex-muted font-medium">Aksi</th></tr></thead><tbody><!--[-->`);
          ssrRenderList(kpiByCategory(cat), (kpi) => {
            _push(`<tr class="border-b border-apex-border hover:bg-apex-card/30 transition-colors"><td class="py-2.5 px-3 font-medium text-apex-text">${ssrInterpolate(kpi.kpi_name)}</td><td class="py-2.5 px-2 text-center text-xs text-apex-muted">${ssrInterpolate(kpi.unit)}</td><td class="py-2.5 px-2 text-center">`);
            if (kpi.is_auto) {
              _push(`<span title="Dihitung otomatis dari database" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-900/50 text-emerald-400 text-[10px]"><i class="fa-solid fa-bolt"></i></span>`);
            } else {
              _push(`<span title="Entry manual" class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-apex-card text-apex-faint text-[10px]"><i class="fa-solid fa-pen"></i></span>`);
            }
            _push(`</td><td class="py-2.5 px-2 text-right text-apex-muted border-l border-apex-border">${ssrInterpolate(fmtVal(kpi.q1_target, kpi.unit))}</td><td class="${ssrRenderClass([unref(curQ) >= 1 ? unref(fmt).achColor(achPct(kpi.q1_actual, kpi.q1_target)) : "text-apex-faint", "py-2.5 px-2 text-right font-medium"])}">${ssrInterpolate(unref(curQ) >= 1 ? fmtVal(kpi.q1_actual, kpi.unit) : "—")}</td><td class="${ssrRenderClass([unref(curQ) >= 1 ? unref(fmt).achColor(achPct(kpi.q1_actual, kpi.q1_target)) : "text-apex-faint", "py-2.5 px-2 text-right text-xs font-bold"])}">${ssrInterpolate(unref(curQ) >= 1 ? achPct(kpi.q1_actual, kpi.q1_target).toFixed(0) + "%" : "—")}</td><td class="py-2.5 px-2 text-right text-apex-muted border-l border-apex-border">${ssrInterpolate(fmtVal(kpi.q2_target, kpi.unit))}</td><td class="${ssrRenderClass([unref(curQ) >= 2 ? unref(fmt).achColor(achPct(kpi.q2_actual, kpi.q2_target)) : "text-apex-faint", "py-2.5 px-2 text-right font-medium"])}">${ssrInterpolate(unref(curQ) >= 2 ? fmtVal(kpi.q2_actual, kpi.unit) : "—")}</td><td class="${ssrRenderClass([unref(curQ) >= 2 ? unref(fmt).achColor(achPct(kpi.q2_actual, kpi.q2_target)) : "text-apex-faint", "py-2.5 px-2 text-right text-xs font-bold"])}">${ssrInterpolate(unref(curQ) >= 2 ? achPct(kpi.q2_actual, kpi.q2_target).toFixed(0) + "%" : "—")}</td><td class="py-2.5 px-2 text-right text-apex-muted border-l border-apex-border">${ssrInterpolate(fmtVal(kpi.q3_target, kpi.unit))}</td><td class="${ssrRenderClass([unref(curQ) >= 3 ? unref(fmt).achColor(achPct(kpi.q3_actual, kpi.q3_target)) : "text-apex-faint", "py-2.5 px-2 text-right font-medium"])}">${ssrInterpolate(unref(curQ) >= 3 ? fmtVal(kpi.q3_actual, kpi.unit) : "—")}</td><td class="${ssrRenderClass([unref(curQ) >= 3 ? unref(fmt).achColor(achPct(kpi.q3_actual, kpi.q3_target)) : "text-apex-faint", "py-2.5 px-2 text-right text-xs font-bold"])}">${ssrInterpolate(unref(curQ) >= 3 ? achPct(kpi.q3_actual, kpi.q3_target).toFixed(0) + "%" : "—")}</td><td class="py-2.5 px-2 text-right text-apex-muted border-l border-apex-border">${ssrInterpolate(fmtVal(kpi.q4_target, kpi.unit))}</td><td class="${ssrRenderClass([unref(curQ) >= 4 ? unref(fmt).achColor(achPct(kpi.q4_actual, kpi.q4_target)) : "text-apex-faint", "py-2.5 px-2 text-right font-medium"])}">${ssrInterpolate(unref(curQ) >= 4 ? fmtVal(kpi.q4_actual, kpi.unit) : "—")}</td><td class="${ssrRenderClass([unref(curQ) >= 4 ? unref(fmt).achColor(achPct(kpi.q4_actual, kpi.q4_target)) : "text-apex-faint", "py-2.5 px-2 text-right text-xs font-bold"])}">${ssrInterpolate(unref(curQ) >= 4 ? achPct(kpi.q4_actual, kpi.q4_target).toFixed(0) + "%" : "—")}</td><td class="py-2.5 px-3 text-center"><button${ssrIncludeBooleanAttr(unref(isTargetLocked) && !unref(isAdmin)) ? " disabled" : ""}${ssrRenderAttr("title", unref(isTargetLocked) && !unref(isAdmin) ? "Target dikunci" : "Edit target / aktual")} class="${ssrRenderClass([unref(isTargetLocked) && !unref(isAdmin) ? "text-apex-faint cursor-not-allowed" : "text-primary-400 hover:text-primary-300 transition-colors", "mr-2"])}"><i class="${ssrRenderClass(unref(isTargetLocked) && !unref(isAdmin) ? "fa-solid fa-lock" : "fa-solid fa-pen-to-square")}"></i></button>`);
            if (unref(isAdmin)) {
              _push(`<button class="text-red-400 hover:text-red-300 transition-colors" title="Hapus KPI"><i class="fa-solid fa-trash"></i></button>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</td></tr>`);
          });
          _push(`<!--]--></tbody></table></div></div>`);
        });
        _push(`<!--]--><!--]-->`);
      }
      if (unref(editModal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-2xl shadow-2xl"><div class="flex items-center justify-between p-5 border-b border-apex-border"><h2 class="text-lg font-semibold text-apex-text">${ssrInterpolate(unref(editModal).isNew ? "Tambah KPI" : "Edit KPI")}</h2><button class="text-apex-muted hover:text-apex-text"><i class="fa-solid fa-xmark text-xl"></i></button></div><div class="p-5 space-y-4"><div class="grid grid-cols-2 gap-4"><div><label class="form-label">Kategori</label><input${ssrRenderAttr("value", unref(editModal).form.kpi_category)} class="form-input" list="cat-list" placeholder="Pilih atau ketik kategori..."><datalist id="cat-list"><!--[-->`);
        ssrRenderList(unref(categories), (c) => {
          _push(`<option${ssrRenderAttr("value", c)}></option>`);
        });
        _push(`<!--]--></datalist></div><div><label class="form-label">Nama KPI</label><input${ssrRenderAttr("value", unref(editModal).form.kpi_name)} class="form-input" placeholder="Nama indikator..."></div></div><div><label class="form-label">Unit</label><input${ssrRenderAttr("value", unref(editModal).form.unit)} class="form-input w-40" list="unit-list" placeholder="Count / % / Miliar Rp..."><datalist id="unit-list"><option value="Count"></option><option value="%"></option><option value="Miliar Rp"></option><option value="Juta Rp"></option><option value="Days"></option><option value="Score"></option></datalist></div>`);
        if (unref(editModal).form.is_auto) {
          _push(`<div class="flex items-start gap-2 bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-3 text-xs text-emerald-300"><i class="fa-solid fa-bolt mt-0.5"></i><span> Aktual KPI ini dihitung <strong>otomatis</strong> dari database. Hanya target yang bisa diubah. </span></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(isTargetLocked) && !unref(isAdmin)) {
          _push(`<div class="flex items-center gap-2 bg-red-900/20 border border-red-800/50 rounded-lg p-3 text-xs text-red-300"><i class="fa-solid fa-lock"></i> Target dikunci. Hanya aktual yang dapat diubah. </div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div><label class="form-label">Target per Kuartal (kumulatif)</label><div class="grid grid-cols-4 gap-3"><!--[-->`);
        ssrRenderList([1, 2, 3, 4], (q) => {
          _push(`<div><label class="text-xs text-apex-muted mb-1 block">Q${ssrInterpolate(q)}</label><input${ssrRenderAttr("value", unref(editModal).form[`q${q}_target`])} type="number" min="0" placeholder="0"${ssrIncludeBooleanAttr(unref(isTargetLocked) && !unref(isAdmin)) ? " disabled" : ""} class="${ssrRenderClass([unref(isTargetLocked) && !unref(isAdmin) ? "opacity-50 cursor-not-allowed" : "", "form-input text-sm"])}"></div>`);
        });
        _push(`<!--]--></div></div>`);
        if (!unref(editModal).form.is_auto) {
          _push(`<div><label class="form-label">Aktual per Kuartal (entry manual)</label><div class="grid grid-cols-4 gap-3"><!--[-->`);
          ssrRenderList([1, 2, 3, 4], (q) => {
            _push(`<div><label class="text-xs text-apex-muted mb-1 block">Q${ssrInterpolate(q)}</label><input${ssrRenderAttr("value", unref(editModal).form[`q${q}_actual`])} type="number" min="0" class="form-input text-sm" placeholder="0"></div>`);
          });
          _push(`<!--]--></div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex justify-end gap-3 p-5 border-t border-apex-border"><button class="btn-ghost">Batal</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary">`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-spinner fa-spin mr-1"></i>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(editModal).isNew ? "Tambah" : "Simpan")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(deleteModal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div class="bg-apex-surface border border-red-900/50 rounded-2xl w-full max-w-sm shadow-2xl p-6"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center"><i class="fa-solid fa-trash text-red-400"></i></div><h2 class="text-lg font-semibold text-apex-text">Hapus KPI</h2></div><p class="text-sm text-apex-muted mb-5"> Hapus <strong class="text-apex-text">${ssrInterpolate(unref(deleteModal).kpi?.kpi_name)}</strong>? Tindakan ini tidak dapat dibatalkan. </p><div class="flex justify-end gap-3"><button class="btn-ghost">Batal</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-apex-text text-sm font-medium transition-colors">`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-spinner fa-spin mr-1"></i>`);
        } else {
          _push(`<!---->`);
        }
        _push(` Hapus </button></div></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/revenue/kpi.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=kpi-4RzOFfDz.js.map
