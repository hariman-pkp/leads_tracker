import { _ as _sfc_main$1 } from './NumericInput-CpnBtvaB.mjs';
import { defineComponent, ref, reactive, computed, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderClass, ssrRenderStyle, ssrRenderComponent } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useFormat } from './useFormat-D7DNHH-1.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "budget",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const fmt = useFormat();
    const loading = ref(true);
    const saving = ref(false);
    const selectedYear = ref((/* @__PURE__ */ new Date()).getFullYear());
    const years = ref([]);
    const budgetData = ref([]);
    const summaryData = ref([]);
    const perspectives = ref([]);
    const filterBsc = ref("");
    const formModal = reactive({ open: false, isNew: false, form: {} });
    const deleteModal = reactive({ open: false, item: null });
    const saveError = ref("");
    const toast = reactive({ show: false, msg: "", type: "success" });
    const filteredItems = computed(
      () => filterBsc.value ? budgetData.value.filter((i) => i.perspektif_bsc === filterBsc.value) : budgetData.value
    );
    const filteredBudget = computed(
      () => filteredItems.value.reduce((s, i) => s + i.budget_amount, 0)
    );
    const filteredActual = computed(
      () => filteredItems.value.reduce((s, i) => s + i.actual_amount, 0)
    );
    const filteredAchPct = computed(
      () => filteredBudget.value > 0 ? Math.round(filteredActual.value / filteredBudget.value * 1e3) / 10 : 0
    );
    const totalBudget = computed(
      () => budgetData.value.reduce((s, i) => s + i.budget_amount, 0)
    );
    const totalActual = computed(
      () => budgetData.value.reduce((s, i) => s + i.actual_amount, 0)
    );
    const totalAchPct = computed(
      () => totalBudget.value > 0 ? Math.round(totalActual.value / totalBudget.value * 1e3) / 10 : 0
    );
    const allCategories = computed(
      () => [...new Set(budgetData.value.map((i) => i.category))]
    );
    function bscBadge(bsc) {
      var _a;
      const map = {
        "Financial": "badge-emerald",
        "Customer": "badge-blue",
        "Internal Process": "badge-purple",
        "Learning & Growth": "badge-yellow"
      };
      return (_a = map[bsc]) != null ? _a : "badge-gray";
    }
    function statusBadge(status) {
      var _a;
      const map = {
        "Planning": "badge-gray",
        "Active": "badge-blue",
        "Over Budget": "badge-red",
        "Completed": "badge-emerald",
        "Cancelled": "badge-gray"
      };
      return (_a = map[status]) != null ? _a : "badge-gray";
    }
    function achBarColor(pct) {
      if (pct >= 80) return "bg-emerald-500";
      if (pct >= 60) return "bg-yellow-500";
      return "bg-red-500";
    }
    function monthName(m) {
      return new Date(2e3, m - 1, 1).toLocaleString("id-ID", { month: "long" });
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b;
      const _component_NumericInput = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-apex-bg text-apex-text p-6" }, _attrs))} data-v-48fb3634><div class="flex flex-wrap items-center justify-between gap-4 mb-6" data-v-48fb3634><div data-v-48fb3634><h1 class="text-2xl font-bold text-apex-text" data-v-48fb3634>Budget Monitoring</h1><p class="text-sm text-apex-muted mt-0.5" data-v-48fb3634>Pantau realisasi anggaran vs RKAP per perspektif BSC</p></div><div class="flex items-center gap-3" data-v-48fb3634><select class="form-select text-sm w-28" data-v-48fb3634><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)} data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(selectedYear)) ? ssrLooseContain(unref(selectedYear), y) : ssrLooseEqual(unref(selectedYear), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select text-sm w-44" data-v-48fb3634><option value="" data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(filterBsc)) ? ssrLooseContain(unref(filterBsc), "") : ssrLooseEqual(unref(filterBsc), "")) ? " selected" : ""}>Semua Perspektif</option><!--[-->`);
      ssrRenderList(unref(perspectives), (p) => {
        _push(`<option${ssrRenderAttr("value", p)} data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(filterBsc)) ? ssrLooseContain(unref(filterBsc), p) : ssrLooseEqual(unref(filterBsc), p)) ? " selected" : ""}>${ssrInterpolate(p)}</option>`);
      });
      _push(`<!--]--></select><button class="btn-primary flex items-center gap-2 text-sm" data-v-48fb3634><i class="fa-solid fa-plus" data-v-48fb3634></i> Tambah Item </button></div></div>`);
      if (unref(loading)) {
        _push(`<div class="flex items-center justify-center py-20 text-apex-muted" data-v-48fb3634><i class="fa-solid fa-spinner fa-spin mr-2" data-v-48fb3634></i> Memuat data... </div>`);
      } else {
        _push(`<!--[--><div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6" data-v-48fb3634><!--[-->`);
        ssrRenderList(unref(summaryData), (s) => {
          _push(`<div class="${ssrRenderClass([unref(filterBsc) === s.perspektif_bsc ? "border-primary-500" : "", "card cursor-pointer transition-all hover:border-primary-600/50"])}" data-v-48fb3634><div class="text-xs text-apex-muted font-medium mb-1 truncate" data-v-48fb3634>${ssrInterpolate(s.perspektif_bsc)}</div><div class="text-lg font-bold text-apex-text" data-v-48fb3634>${ssrInterpolate(unref(fmt).rupiahFull(s.actual))}</div><div class="text-xs text-apex-faint mt-0.5" data-v-48fb3634>dari ${ssrInterpolate(unref(fmt).rupiahFull(s.budget))}</div><div class="mt-2 h-1.5 bg-apex-card rounded-full overflow-hidden" data-v-48fb3634><div class="${ssrRenderClass([achBarColor(s.ach_pct), "h-full rounded-full transition-all"])}" style="${ssrRenderStyle(`width: ${Math.min(s.ach_pct, 100)}%`)}" data-v-48fb3634></div></div><div class="${ssrRenderClass([unref(fmt).achColor(s.ach_pct), "text-xs font-semibold mt-1"])}" data-v-48fb3634>${ssrInterpolate(s.ach_pct.toFixed(1))}% </div></div>`);
        });
        _push(`<!--]--></div><div class="card mb-6 flex flex-wrap items-center gap-6" data-v-48fb3634><div data-v-48fb3634><div class="text-xs text-apex-muted" data-v-48fb3634>Total Budget</div><div class="text-xl font-bold text-apex-text" data-v-48fb3634>${ssrInterpolate(unref(fmt).rupiahFull(unref(totalBudget)))}</div></div><div class="h-8 w-px bg-apex-card" data-v-48fb3634></div><div data-v-48fb3634><div class="text-xs text-apex-muted" data-v-48fb3634>Total Aktual</div><div class="text-xl font-bold text-emerald-400" data-v-48fb3634>${ssrInterpolate(unref(fmt).rupiahFull(unref(totalActual)))}</div></div><div class="h-8 w-px bg-apex-card" data-v-48fb3634></div><div data-v-48fb3634><div class="text-xs text-apex-muted" data-v-48fb3634>Sisa Budget</div><div class="${ssrRenderClass([unref(totalBudget) - unref(totalActual) >= 0 ? "text-blue-400" : "text-red-400", "text-xl font-bold"])}" data-v-48fb3634>${ssrInterpolate(unref(fmt).rupiahFull(unref(totalBudget) - unref(totalActual)))}</div></div><div class="h-8 w-px bg-apex-card" data-v-48fb3634></div><div class="flex-1 min-w-[120px]" data-v-48fb3634><div class="text-xs text-apex-muted mb-1" data-v-48fb3634>Realisasi Keseluruhan</div><div class="flex items-center gap-2" data-v-48fb3634><div class="flex-1 h-2 bg-apex-card rounded-full overflow-hidden" data-v-48fb3634><div class="${ssrRenderClass([achBarColor(unref(totalAchPct)), "h-full rounded-full"])}" style="${ssrRenderStyle(`width: ${Math.min(unref(totalAchPct), 100)}%`)}" data-v-48fb3634></div></div><span class="${ssrRenderClass([unref(fmt).achColor(unref(totalAchPct)), "text-sm font-bold"])}" data-v-48fb3634>${ssrInterpolate(unref(totalAchPct).toFixed(1))}% </span></div></div></div><div class="card overflow-x-auto" data-v-48fb3634><table class="w-full text-sm" data-v-48fb3634><thead data-v-48fb3634><tr class="border-b border-apex-border" data-v-48fb3634><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-48fb3634>Perspektif BSC</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-48fb3634>Kategori</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-48fb3634>Sub Kategori</th><th class="text-right py-3 px-3 text-apex-muted font-medium" data-v-48fb3634>Budget</th><th class="text-right py-3 px-3 text-apex-muted font-medium" data-v-48fb3634>Aktual</th><th class="text-right py-3 px-3 text-apex-muted font-medium w-20" data-v-48fb3634>Ach%</th><th class="text-center py-3 px-3 text-apex-muted font-medium w-24" data-v-48fb3634>Status</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-48fb3634>Catatan</th><th class="text-center py-3 px-3 text-apex-muted font-medium w-20" data-v-48fb3634>Aksi</th></tr></thead><tbody data-v-48fb3634>`);
        if (unref(filteredItems).length === 0) {
          _push(`<tr data-v-48fb3634><td colspan="9" class="text-center py-10 text-apex-faint" data-v-48fb3634> Belum ada data budget untuk tahun ${ssrInterpolate(unref(selectedYear))}</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(filteredItems), (item) => {
          _push(`<tr class="border-b border-apex-border hover:bg-apex-card/30 transition-colors" data-v-48fb3634><td class="py-2.5 px-3" data-v-48fb3634><span class="${ssrRenderClass(bscBadge(item.perspektif_bsc))}" data-v-48fb3634>${ssrInterpolate(item.perspektif_bsc)}</span></td><td class="py-2.5 px-3 text-apex-text font-medium" data-v-48fb3634>${ssrInterpolate(item.category)}</td><td class="py-2.5 px-3 text-apex-muted" data-v-48fb3634>${ssrInterpolate(item.sub_category || "\u2014")}</td><td class="py-2.5 px-3 text-right text-apex-muted" data-v-48fb3634>${ssrInterpolate(unref(fmt).rupiah(item.budget_amount))}</td><td class="${ssrRenderClass([item.actual_amount > 0 ? "text-emerald-400" : "text-apex-faint", "py-2.5 px-3 text-right font-semibold"])}" data-v-48fb3634>${ssrInterpolate(item.actual_amount > 0 ? unref(fmt).rupiah(item.actual_amount) : "\u2014")}</td><td class="${ssrRenderClass([unref(fmt).achColor(item.ach_pct), "py-2.5 px-3 text-right font-bold"])}" data-v-48fb3634>${ssrInterpolate(item.ach_pct > 0 ? item.ach_pct.toFixed(1) + "%" : "\u2014")}</td><td class="py-2.5 px-3 text-center" data-v-48fb3634><span class="${ssrRenderClass(statusBadge(item.status))}" data-v-48fb3634>${ssrInterpolate(item.status)}</span></td><td class="py-2.5 px-3 text-apex-muted text-xs max-w-[200px] truncate" data-v-48fb3634>${ssrInterpolate(item.notes || "\u2014")}</td><td class="py-2.5 px-3 text-center" data-v-48fb3634><button class="text-primary-400 hover:text-primary-300 transition-colors mr-2" title="Edit" data-v-48fb3634><i class="fa-solid fa-pen-to-square" data-v-48fb3634></i></button><button class="text-red-400 hover:text-red-300 transition-colors" title="Hapus" data-v-48fb3634><i class="fa-solid fa-trash" data-v-48fb3634></i></button></td></tr>`);
        });
        _push(`<!--]--></tbody>`);
        if (unref(filteredItems).length > 0) {
          _push(`<tfoot data-v-48fb3634><tr class="border-t-2 border-apex-border2 bg-apex-card/30" data-v-48fb3634><td colspan="3" class="py-2.5 px-3 text-xs font-bold text-apex-muted uppercase tracking-wide" data-v-48fb3634> Total (${ssrInterpolate(unref(filterBsc) || "Semua")}) </td><td class="py-2.5 px-3 text-right font-bold text-apex-text" data-v-48fb3634>${ssrInterpolate(unref(fmt).rupiah(unref(filteredBudget)))}</td><td class="py-2.5 px-3 text-right font-bold text-emerald-400" data-v-48fb3634>${ssrInterpolate(unref(fmt).rupiah(unref(filteredActual)))}</td><td class="${ssrRenderClass([unref(fmt).achColor(unref(filteredAchPct)), "py-2.5 px-3 text-right font-bold"])}" data-v-48fb3634>${ssrInterpolate(unref(filteredAchPct).toFixed(1))}% </td><td colspan="3" data-v-48fb3634></td></tr></tfoot>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</table></div><!--]-->`);
      }
      if (unref(formModal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-v-48fb3634><div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-lg shadow-2xl" data-v-48fb3634><div class="flex items-center justify-between p-5 border-b border-apex-border" data-v-48fb3634><h2 class="text-lg font-semibold text-apex-text" data-v-48fb3634>${ssrInterpolate(unref(formModal).isNew ? "Tambah Budget Item" : "Edit Budget Item")}</h2><button class="text-apex-muted hover:text-apex-text" data-v-48fb3634><i class="fa-solid fa-xmark text-xl" data-v-48fb3634></i></button></div><div class="p-5 space-y-4" data-v-48fb3634><div data-v-48fb3634><label class="form-label" data-v-48fb3634>Perspektif BSC <span class="text-red-400" data-v-48fb3634>*</span></label><input${ssrRenderAttr("value", unref(formModal).form.perspektif_bsc)} class="form-input" list="bsc-list" placeholder="Financial / Customer / Internal..." data-v-48fb3634><datalist id="bsc-list" data-v-48fb3634><!--[-->`);
        ssrRenderList(unref(perspectives), (p) => {
          _push(`<option${ssrRenderAttr("value", p)} data-v-48fb3634></option>`);
        });
        _push(`<!--]--><option value="Financial" data-v-48fb3634></option><option value="Customer" data-v-48fb3634></option><option value="Internal Process" data-v-48fb3634></option><option value="Learning &amp; Growth" data-v-48fb3634></option></datalist></div><div class="grid grid-cols-2 gap-4" data-v-48fb3634><div data-v-48fb3634><label class="form-label" data-v-48fb3634>Kategori <span class="text-red-400" data-v-48fb3634>*</span></label><input${ssrRenderAttr("value", unref(formModal).form.category)} class="form-input" list="cat-budget-list" placeholder="Nama kategori..." data-v-48fb3634><datalist id="cat-budget-list" data-v-48fb3634><!--[-->`);
        ssrRenderList(unref(allCategories), (c) => {
          _push(`<option${ssrRenderAttr("value", c)} data-v-48fb3634></option>`);
        });
        _push(`<!--]--></datalist></div><div data-v-48fb3634><label class="form-label" data-v-48fb3634>Sub Kategori</label><input${ssrRenderAttr("value", unref(formModal).form.sub_category)} class="form-input" placeholder="Opsional..." data-v-48fb3634></div></div><div class="grid grid-cols-2 gap-4" data-v-48fb3634><div data-v-48fb3634><label class="form-label" data-v-48fb3634>Budget (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(formModal).form.budget_amount,
          "onUpdate:modelValue": ($event) => unref(formModal).form.budget_amount = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div><div data-v-48fb3634><label class="form-label" data-v-48fb3634>Aktual (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(formModal).form.actual_amount,
          "onUpdate:modelValue": ($event) => unref(formModal).form.actual_amount = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div></div><div class="grid grid-cols-2 gap-4" data-v-48fb3634><div data-v-48fb3634><label class="form-label" data-v-48fb3634>Status</label><select class="form-select" data-v-48fb3634><option value="Planning" data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).form.status) ? ssrLooseContain(unref(formModal).form.status, "Planning") : ssrLooseEqual(unref(formModal).form.status, "Planning")) ? " selected" : ""}>Planning</option><option value="Active" data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).form.status) ? ssrLooseContain(unref(formModal).form.status, "Active") : ssrLooseEqual(unref(formModal).form.status, "Active")) ? " selected" : ""}>Active</option><option value="Over Budget" data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).form.status) ? ssrLooseContain(unref(formModal).form.status, "Over Budget") : ssrLooseEqual(unref(formModal).form.status, "Over Budget")) ? " selected" : ""}>Over Budget</option><option value="Completed" data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).form.status) ? ssrLooseContain(unref(formModal).form.status, "Completed") : ssrLooseEqual(unref(formModal).form.status, "Completed")) ? " selected" : ""}>Completed</option><option value="Cancelled" data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).form.status) ? ssrLooseContain(unref(formModal).form.status, "Cancelled") : ssrLooseEqual(unref(formModal).form.status, "Cancelled")) ? " selected" : ""}>Cancelled</option></select></div><div data-v-48fb3634><label class="form-label" data-v-48fb3634>Bulan (0 = tahunan)</label><select class="form-select" data-v-48fb3634><option${ssrRenderAttr("value", 0)} data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).form.month_num) ? ssrLooseContain(unref(formModal).form.month_num, 0) : ssrLooseEqual(unref(formModal).form.month_num, 0)) ? " selected" : ""}>Tahunan</option><!--[-->`);
        ssrRenderList(12, (m) => {
          _push(`<option${ssrRenderAttr("value", m)} data-v-48fb3634${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).form.month_num) ? ssrLooseContain(unref(formModal).form.month_num, m) : ssrLooseEqual(unref(formModal).form.month_num, m)) ? " selected" : ""}>${ssrInterpolate(monthName(m))}</option>`);
        });
        _push(`<!--]--></select></div></div><div data-v-48fb3634><label class="form-label" data-v-48fb3634>Catatan</label><textarea rows="2" class="form-input resize-none" placeholder="Keterangan tambahan..." data-v-48fb3634>${ssrInterpolate(unref(formModal).form.notes)}</textarea></div></div>`);
        if (unref(saveError)) {
          _push(`<div class="mx-5 mb-1 text-xs text-red-400 flex items-center gap-1.5" data-v-48fb3634><i class="fa-solid fa-circle-exclamation" data-v-48fb3634></i>${ssrInterpolate(unref(saveError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end gap-3 p-5 border-t border-apex-border" data-v-48fb3634><button class="btn-ghost" data-v-48fb3634>Batal</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary" data-v-48fb3634>`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-spinner fa-spin mr-1" data-v-48fb3634></i>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(formModal).isNew ? "Tambah" : "Simpan")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-green-800 border-green-600" : "bg-red-900 border-red-600", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm"])}" data-v-48fb3634><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-green-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-48fb3634></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(deleteModal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-v-48fb3634><div class="bg-apex-surface border border-red-900/50 rounded-2xl w-full max-w-sm shadow-2xl p-6" data-v-48fb3634><div class="flex items-center gap-3 mb-4" data-v-48fb3634><div class="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center" data-v-48fb3634><i class="fa-solid fa-trash text-red-400" data-v-48fb3634></i></div><h2 class="text-lg font-semibold text-apex-text" data-v-48fb3634>Hapus Budget Item</h2></div><p class="text-sm text-apex-muted mb-1" data-v-48fb3634> Hapus item <strong class="text-apex-text" data-v-48fb3634>${ssrInterpolate((_a = unref(deleteModal).item) == null ? void 0 : _a.category)}</strong>? </p>`);
        if ((_b = unref(deleteModal).item) == null ? void 0 : _b.sub_category) {
          _push(`<p class="text-xs text-apex-faint mb-4" data-v-48fb3634>${ssrInterpolate(unref(deleteModal).item.sub_category)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end gap-3" data-v-48fb3634><button class="btn-ghost" data-v-48fb3634>Batal</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-apex-text text-sm font-medium transition-colors" data-v-48fb3634>`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-spinner fa-spin mr-1" data-v-48fb3634></i>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/revenue/budget.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const budget = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-48fb3634"]]);

export { budget as default };
//# sourceMappingURL=budget-DxdMMlOl.mjs.map
