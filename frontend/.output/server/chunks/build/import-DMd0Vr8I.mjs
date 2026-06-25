import { defineComponent, ref, reactive, unref, withCtx, createVNode, createTextVNode, computed, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderStyle, ssrRenderComponent, ssrIncludeBooleanAttr, ssrRenderSlot, ssrLooseContain } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
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

const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "ImportPanel",
  __ssrInlineRender: true,
  props: {
    label: {},
    icon: {},
    color: {},
    templateUrl: {},
    uploadUrl: {},
    previewCols: {},
    description: {},
    dangerDesc: {}
  },
  emits: ["done"],
  setup(__props, { emit: __emit }) {
    useApi();
    ref(null);
    const dragging = ref(false);
    const downloading = ref(false);
    const uploading = ref(false);
    const clearFirst = ref(false);
    const confirmClear = ref(false);
    const file = ref(null);
    const csvHeaders = ref([]);
    const previewRows = ref([]);
    const result = ref(null);
    const canUpload = computed(
      () => !!file.value && !uploading.value && (!clearFirst.value || confirmClear.value)
    );
    function formatSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / 1048576).toFixed(1) + " MB";
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-7c657687><div class="card mb-5" data-v-7c657687><div class="flex items-start justify-between gap-4 flex-wrap" data-v-7c657687><div data-v-7c657687><div class="flex items-center gap-2 mb-1" data-v-7c657687><div class="${ssrRenderClass(`w-8 h-8 rounded-lg bg-${__props.color}-900/40 flex items-center justify-center`)}" data-v-7c657687><i class="${ssrRenderClass(`fa-solid ${__props.icon} text-${__props.color}-400 text-sm`)}" data-v-7c657687></i></div><h3 class="font-semibold text-gray-100" data-v-7c657687>${ssrInterpolate(__props.label)}</h3></div><p class="text-sm text-gray-500" data-v-7c657687>${ssrInterpolate(__props.description)}</p></div><button${ssrIncludeBooleanAttr(unref(downloading)) ? " disabled" : ""} class="btn-secondary btn-sm flex-shrink-0" data-v-7c657687><i class="${ssrRenderClass(unref(downloading) ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-download")}" data-v-7c657687></i> Download Template CSV </button></div></div><div class="card mb-5" data-v-7c657687><div class="section-title mb-4" data-v-7c657687><i class="fa-solid fa-file-csv mr-1.5 text-primary-400" data-v-7c657687></i>Pilih File CSV</div><div class="${ssrRenderClass([
        "border-2 border-dashed rounded-xl p-10 text-center transition-all cursor-pointer",
        unref(dragging) ? "border-primary-400 bg-primary-900/20" : unref(file) ? "border-emerald-600 bg-emerald-900/10" : "border-navy-600 hover:border-navy-500 hover:bg-navy-800/40"
      ])}" data-v-7c657687><input type="file" accept=".csv,.txt" class="hidden" data-v-7c657687>`);
      if (!unref(file)) {
        _push(`<div data-v-7c657687><i class="fa-solid fa-cloud-arrow-up text-4xl text-gray-600 mb-3 block" data-v-7c657687></i><p class="text-gray-400 font-medium" data-v-7c657687>Drag &amp; drop file CSV ke sini</p><p class="text-gray-600 text-sm mt-1" data-v-7c657687>atau klik untuk memilih file</p><p class="text-gray-700 text-xs mt-2" data-v-7c657687>Format: .csv \xB7 Maks. 10MB</p></div>`);
      } else {
        _push(`<div class="flex flex-col items-center gap-2" data-v-7c657687><i class="fa-solid fa-file-csv text-4xl text-emerald-400 mb-1" data-v-7c657687></i><p class="text-emerald-300 font-semibold" data-v-7c657687>${ssrInterpolate(unref(file).name)}</p><p class="text-gray-500 text-sm" data-v-7c657687>${ssrInterpolate(formatSize(unref(file).size))} \xB7 ${ssrInterpolate(unref(previewRows).length)} baris data</p><button type="button" class="mt-1 text-xs text-red-400 hover:text-red-300 flex items-center gap-1" data-v-7c657687><i class="fa-solid fa-xmark" data-v-7c657687></i>Hapus file </button></div>`);
      }
      _push(`</div>`);
      ssrRenderSlot(_ctx.$slots, "info", {}, null, _push, _parent);
      if (unref(previewRows).length) {
        _push(`<div class="mt-5" data-v-7c657687><div class="flex items-center justify-between mb-2" data-v-7c657687><p class="text-xs text-gray-500 font-medium uppercase tracking-wider" data-v-7c657687> Preview (${ssrInterpolate(unref(previewRows).length > 5 ? "5 dari" : "")} ${ssrInterpolate(unref(previewRows).length)} baris) </p><span class="text-xs text-gray-600" data-v-7c657687>${ssrInterpolate(unref(csvHeaders).length)} kolom</span></div><div class="overflow-x-auto rounded-lg border border-navy-700" data-v-7c657687><table class="w-full text-xs" data-v-7c657687><thead data-v-7c657687><tr class="bg-navy-800" data-v-7c657687><!--[-->`);
        ssrRenderList(__props.previewCols, (col) => {
          _push(`<th class="px-3 py-2 text-left text-gray-400 font-medium whitespace-nowrap border-b border-navy-700" data-v-7c657687>${ssrInterpolate(col.label)}</th>`);
        });
        _push(`<!--]--></tr></thead><tbody data-v-7c657687><!--[-->`);
        ssrRenderList(unref(previewRows).slice(0, 5), (row, i) => {
          _push(`<tr class="border-b border-navy-800/60 last:border-0 hover:bg-navy-800/30" data-v-7c657687><!--[-->`);
          ssrRenderList(__props.previewCols, (col) => {
            _push(`<td class="px-3 py-1.5 text-gray-300 whitespace-nowrap max-w-32 truncate" data-v-7c657687>${ssrInterpolate(row[col.key] || "\u2014")}</td>`);
          });
          _push(`<!--]--></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="card mb-5" data-v-7c657687><div class="section-title mb-4" data-v-7c657687><i class="fa-solid fa-sliders mr-1.5" data-v-7c657687></i>Opsi Import</div><label class="${ssrRenderClass([unref(clearFirst) ? "border-red-700/70 bg-red-900/20" : "border-navy-700 hover:border-navy-600 bg-navy-800/30", "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all mb-4"])}" data-v-7c657687><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(clearFirst)) ? ssrLooseContain(unref(clearFirst), null) : unref(clearFirst)) ? " checked" : ""} class="mt-0.5 accent-red-500 w-4 h-4 flex-shrink-0" data-v-7c657687><div data-v-7c657687><div class="${ssrRenderClass([unref(clearFirst) ? "text-red-300" : "text-gray-300", "text-sm font-medium"])}" data-v-7c657687><i class="${ssrRenderClass([unref(clearFirst) ? "text-red-400" : "text-gray-600", "fa-solid fa-triangle-exclamation mr-1"])}" data-v-7c657687></i> Hapus data existing sebelum import </div><div class="text-xs text-gray-500 mt-0.5" data-v-7c657687>${ssrInterpolate(__props.dangerDesc)}</div></div></label>`);
      if (unref(clearFirst)) {
        _push(`<div class="flex items-center gap-3 bg-red-900/30 border border-red-700/50 rounded-xl px-4 py-3 mb-4" data-v-7c657687><i class="fa-solid fa-skull-crossbones text-red-400 text-lg flex-shrink-0" data-v-7c657687></i><div class="flex-1 text-xs text-red-300" data-v-7c657687> Semua data yang ada akan <strong data-v-7c657687>dihapus permanen</strong> sebelum import dimulai. Pastikan Anda sudah melakukan backup. </div><label class="flex items-center gap-2 flex-shrink-0 cursor-pointer" data-v-7c657687><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(confirmClear)) ? ssrLooseContain(unref(confirmClear), null) : unref(confirmClear)) ? " checked" : ""} class="accent-red-500 w-4 h-4" data-v-7c657687><span class="text-xs text-red-300 font-medium" data-v-7c657687>Saya mengerti</span></label></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="flex items-center gap-3" data-v-7c657687><button${ssrIncludeBooleanAttr(!unref(canUpload)) ? " disabled" : ""} class="btn-primary disabled:opacity-40 disabled:cursor-not-allowed" data-v-7c657687><i class="${ssrRenderClass(unref(uploading) ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-file-arrow-up")}" data-v-7c657687></i> ${ssrInterpolate(unref(uploading) ? "Mengupload..." : "Mulai Import")}</button>`);
      if (!unref(file)) {
        _push(`<span class="text-xs text-gray-600" data-v-7c657687>Pilih file CSV terlebih dahulu</span>`);
      } else if (unref(clearFirst) && !unref(confirmClear)) {
        _push(`<span class="text-xs text-red-500" data-v-7c657687> Centang konfirmasi untuk melanjutkan </span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(result)) {
        _push(`<div class="card" data-v-7c657687><div class="section-title mb-4" data-v-7c657687><i class="fa-solid fa-clipboard-check mr-1.5 text-emerald-400" data-v-7c657687></i>Hasil Import </div><div class="grid grid-cols-3 gap-3 mb-4" data-v-7c657687><div class="bg-emerald-900/30 border border-emerald-700/50 rounded-xl p-4 text-center" data-v-7c657687><div class="text-3xl font-bold text-emerald-400" data-v-7c657687>${ssrInterpolate(unref(result).imported)}</div><div class="text-xs text-emerald-600 mt-0.5" data-v-7c657687>Baris Baru</div></div><div class="bg-blue-900/30 border border-blue-700/50 rounded-xl p-4 text-center" data-v-7c657687><div class="text-3xl font-bold text-blue-400" data-v-7c657687>${ssrInterpolate(unref(result).updated)}</div><div class="text-xs text-blue-600 mt-0.5" data-v-7c657687>Diperbarui</div></div><div class="bg-red-900/20 border border-red-700/30 rounded-xl p-4 text-center" data-v-7c657687><div class="${ssrRenderClass([unref(result).skipped > 0 ? "text-red-400" : "text-gray-600", "text-3xl font-bold"])}" data-v-7c657687>${ssrInterpolate(unref(result).skipped)}</div><div class="text-xs text-red-600 mt-0.5" data-v-7c657687>Dilewati</div></div></div>`);
        if (unref(result).synced_months != null) {
          _push(`<div class="flex items-center gap-4 bg-emerald-900/20 border border-emerald-700/40 rounded-xl px-4 py-3 mb-4 text-xs text-emerald-300" data-v-7c657687><i class="fa-solid fa-rotate text-emerald-400 text-lg flex-shrink-0" data-v-7c657687></i><div data-v-7c657687><div class="font-medium" data-v-7c657687>Revenue Tracker berhasil diperbarui</div><div class="text-emerald-400/70 mt-0.5" data-v-7c657687>${ssrInterpolate(unref(result).synced_months)} termin bulanan &amp; ${ssrInterpolate(unref(result).synced_projects)} project di-recalculate </div></div></div>`);
        } else {
          _push(`<!---->`);
        }
        if ((_a = unref(result).errors) == null ? void 0 : _a.length) {
          _push(`<div class="space-y-1" data-v-7c657687><div class="text-xs text-gray-500 font-medium uppercase tracking-wider mb-2" data-v-7c657687> Detail Error (${ssrInterpolate(unref(result).errors.length)}): </div><!--[-->`);
          ssrRenderList(unref(result).errors, (err) => {
            _push(`<div class="flex items-start gap-2 text-xs text-red-300 bg-red-900/20 border border-red-900/40 rounded px-3 py-1.5" data-v-7c657687><i class="fa-solid fa-circle-exclamation text-red-500 mt-0.5 flex-shrink-0" data-v-7c657687></i> ${ssrInterpolate(err)}</div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="flex items-center gap-2 text-sm text-emerald-400" data-v-7c657687><i class="fa-solid fa-circle-check" data-v-7c657687></i> Import selesai tanpa error. </div>`);
        }
        _push(`</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/ImportPanel.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["__scopeId", "data-v-7c657687"]]);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "import",
  __ssrInlineRender: true,
  setup(__props) {
    const activeTab = ref("pipeline");
    const tabs = [
      { key: "pipeline", label: "Pipeline", icon: "fa-funnel-dollar" },
      { key: "invoice", label: "Invoice & Payment", icon: "fa-file-invoice-dollar" },
      { key: "revenue", label: "Revenue Projects", icon: "fa-chart-line" }
    ];
    const pipelineCols = [
      { key: "lead_id", label: "Lead ID" },
      { key: "nama_company", label: "Company" },
      { key: "stage", label: "Stage" },
      { key: "prioritas", label: "Prioritas" },
      { key: "propose_value", label: "Propose Value" },
      { key: "sales_owner", label: "Sales" },
      { key: "organisasi", label: "Organisasi" },
      { key: "exp_close_date", label: "Exp. Close" }
    ];
    const invoiceCols = [
      { key: "invoice_no", label: "No. Invoice" },
      { key: "project_id", label: "Project ID" },
      { key: "invoice_date", label: "Tgl Invoice" },
      { key: "invoice_amount", label: "Nilai Invoice" },
      { key: "paid_amount", label: "Terbayar" },
      { key: "paid_date", label: "Tgl Bayar" },
      { key: "status", label: "Status" },
      { key: "notes", label: "Catatan" }
    ];
    const revenueCols = [
      { key: "project_id", label: "Project ID" },
      { key: "client", label: "Client" },
      { key: "product", label: "Product" },
      { key: "organisasi", label: "Organisasi" },
      { key: "type", label: "Type" },
      { key: "tahun", label: "Tahun" },
      { key: "target_1", label: "Target Jan" },
      { key: "actual_1", label: "Aktual Jan" }
    ];
    const toast = reactive({ show: false, msg: "", type: "success" });
    function handleDone(msg, type) {
      toast.msg = msg;
      toast.type = type;
      toast.show = true;
      setTimeout(() => {
        toast.show = false;
      }, 4e3);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ImportPanel = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-498972c1><div class="page-header mb-6" data-v-498972c1><div data-v-498972c1><h1 class="page-title" data-v-498972c1><i class="fa-solid fa-file-arrow-up text-primary-400 mr-2" data-v-498972c1></i>Upload Data</h1><p class="page-subtitle" data-v-498972c1>Import data Pipeline dan Revenue dari file CSV</p></div></div><div class="flex gap-1 mb-6 bg-navy-900 rounded-xl p-1 w-fit border border-navy-700" data-v-498972c1><!--[-->`);
      ssrRenderList(tabs, (tab) => {
        _push(`<button class="${ssrRenderClass([unref(activeTab) === tab.key ? "bg-primary-600 text-white shadow-lg" : "text-gray-400 hover:text-gray-200", "px-5 py-2 rounded-lg text-sm font-medium transition-all"])}" data-v-498972c1><i class="${ssrRenderClass(`fa-solid ${tab.icon} mr-1.5`)}" data-v-498972c1></i>${ssrInterpolate(tab.label)}</button>`);
      });
      _push(`<!--]--></div>`);
      if (unref(activeTab) === "invoice") {
        _push(`<div class="flex items-start gap-3 bg-emerald-900/20 border border-emerald-700/40 rounded-xl px-4 py-3 mb-5 text-sm text-emerald-300" data-v-498972c1><i class="fa-solid fa-circle-info text-emerald-400 mt-0.5 flex-shrink-0" data-v-498972c1></i><div data-v-498972c1><strong data-v-498972c1>Upload Invoice &amp; Payment</strong> akan otomatis memperbarui nilai <span class="font-mono text-emerald-200" data-v-498972c1>actual</span> pada Revenue Tracker. <span class="text-emerald-400/70 text-xs block mt-0.5" data-v-498972c1> Alur: CSV \u2192 upsert tabel invoices \u2192 recalculate realisasi bulanan per project \u2192 update status &amp; achievement project </span></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="space-y-5" style="${ssrRenderStyle(unref(activeTab) === "pipeline" ? null : { display: "none" })}" data-v-498972c1>`);
      _push(ssrRenderComponent(_component_ImportPanel, {
        label: "Pipeline / Leads",
        icon: "fa-funnel-dollar",
        color: "primary",
        "template-url": "/v1/import/template/pipeline",
        "upload-url": "/v1/import/pipeline",
        "preview-cols": pipelineCols,
        description: "Data leads pipeline: nama company, stage, prioritas, propose value, dst.",
        "danger-desc": `Hapus SEMUA leads, follow-up log, dan kontak sebelum import. Data tidak bisa dikembalikan.`,
        onDone: handleDone
      }, {
        info: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mt-4 p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl text-xs text-blue-300" data-v-498972c1${_scopeId}><i class="fa-solid fa-circle-info mr-1.5 text-blue-400" data-v-498972c1${_scopeId}></i><strong data-v-498972c1${_scopeId}>Kolom <code class="bg-blue-900/40 px-1 rounded" data-v-498972c1${_scopeId}>probability</code> bisa dikosongkan</strong> \u2014 sistem akan mengisi otomatis berdasarkan Stage: <div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-blue-400/80 font-mono" data-v-498972c1${_scopeId}><span data-v-498972c1${_scopeId}>New \u2192 <strong class="text-white" data-v-498972c1${_scopeId}>10%</strong></span><span data-v-498972c1${_scopeId}>In Progress \u2192 <strong class="text-white" data-v-498972c1${_scopeId}>25%</strong></span><span data-v-498972c1${_scopeId}>Demo Scheduled \u2192 <strong class="text-white" data-v-498972c1${_scopeId}>40%</strong></span><span data-v-498972c1${_scopeId}>Proposal Sent \u2192 <strong class="text-white" data-v-498972c1${_scopeId}>60%</strong></span><span data-v-498972c1${_scopeId}>Negotiation \u2192 <strong class="text-white" data-v-498972c1${_scopeId}>80%</strong></span><span data-v-498972c1${_scopeId}>Won \u2192 <strong class="text-white" data-v-498972c1${_scopeId}>100%</strong></span><span data-v-498972c1${_scopeId}>On Hold \u2192 <strong class="text-white" data-v-498972c1${_scopeId}>20%</strong></span><span data-v-498972c1${_scopeId}>Lost \u2192 <strong class="text-white" data-v-498972c1${_scopeId}>0%</strong></span></div></div>`);
          } else {
            return [
              createVNode("div", { class: "mt-4 p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl text-xs text-blue-300" }, [
                createVNode("i", { class: "fa-solid fa-circle-info mr-1.5 text-blue-400" }),
                createVNode("strong", null, [
                  createTextVNode("Kolom "),
                  createVNode("code", { class: "bg-blue-900/40 px-1 rounded" }, "probability"),
                  createTextVNode(" bisa dikosongkan")
                ]),
                createTextVNode(" \u2014 sistem akan mengisi otomatis berdasarkan Stage: "),
                createVNode("div", { class: "mt-2 flex flex-wrap gap-x-4 gap-y-1 text-blue-400/80 font-mono" }, [
                  createVNode("span", null, [
                    createTextVNode("New \u2192 "),
                    createVNode("strong", { class: "text-white" }, "10%")
                  ]),
                  createVNode("span", null, [
                    createTextVNode("In Progress \u2192 "),
                    createVNode("strong", { class: "text-white" }, "25%")
                  ]),
                  createVNode("span", null, [
                    createTextVNode("Demo Scheduled \u2192 "),
                    createVNode("strong", { class: "text-white" }, "40%")
                  ]),
                  createVNode("span", null, [
                    createTextVNode("Proposal Sent \u2192 "),
                    createVNode("strong", { class: "text-white" }, "60%")
                  ]),
                  createVNode("span", null, [
                    createTextVNode("Negotiation \u2192 "),
                    createVNode("strong", { class: "text-white" }, "80%")
                  ]),
                  createVNode("span", null, [
                    createTextVNode("Won \u2192 "),
                    createVNode("strong", { class: "text-white" }, "100%")
                  ]),
                  createVNode("span", null, [
                    createTextVNode("On Hold \u2192 "),
                    createVNode("strong", { class: "text-white" }, "20%")
                  ]),
                  createVNode("span", null, [
                    createTextVNode("Lost \u2192 "),
                    createVNode("strong", { class: "text-white" }, "0%")
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="space-y-5" style="${ssrRenderStyle(unref(activeTab) === "invoice" ? null : { display: "none" })}" data-v-498972c1>`);
      _push(ssrRenderComponent(_component_ImportPanel, {
        label: "Invoice & Payment",
        icon: "fa-file-invoice-dollar",
        color: "emerald",
        "template-url": "/v1/import/template/invoice",
        "upload-url": "/v1/import/invoice",
        "preview-cols": invoiceCols,
        description: "Upload data invoice dan pembayaran. Realisasi revenue bulanan akan otomatis diperbarui.",
        "danger-desc": `Hapus SEMUA data invoice sebelum import. Revenue aktual tetap aman \u2014 akan di-recalculate ulang dari data baru.`,
        onDone: handleDone
      }, {
        info: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="mt-4 space-y-2" data-v-498972c1${_scopeId}><div class="p-3 bg-navy-800/60 border border-navy-700 rounded-xl text-xs text-gray-400" data-v-498972c1${_scopeId}><div class="font-medium text-gray-300 mb-1.5" data-v-498972c1${_scopeId}><i class="fa-solid fa-table-columns mr-1 text-primary-400" data-v-498972c1${_scopeId}></i>Kolom CSV </div><div class="grid grid-cols-2 gap-x-6 gap-y-1" data-v-498972c1${_scopeId}><div data-v-498972c1${_scopeId}><span class="text-red-400" data-v-498972c1${_scopeId}>*</span> <code class="text-primary-300" data-v-498972c1${_scopeId}>invoice_no</code> \u2014 nomor invoice (unik, wajib)</div><div data-v-498972c1${_scopeId}><span class="text-red-400" data-v-498972c1${_scopeId}>*</span> <code class="text-primary-300" data-v-498972c1${_scopeId}>project_id</code> \u2014 harus cocok dengan revenue project</div><div data-v-498972c1${_scopeId}><span class="text-red-400" data-v-498972c1${_scopeId}>*</span> <code class="text-primary-300" data-v-498972c1${_scopeId}>invoice_date</code> \u2014 format YYYY-MM-DD</div><div data-v-498972c1${_scopeId}><span class="text-red-400" data-v-498972c1${_scopeId}>*</span> <code class="text-primary-300" data-v-498972c1${_scopeId}>invoice_amount</code> \u2014 nilai invoice (Rp)</div><div data-v-498972c1${_scopeId}><span class="text-gray-500" data-v-498972c1${_scopeId}>\u25CB</span> <code class="text-gray-400" data-v-498972c1${_scopeId}>paid_amount</code> \u2014 nilai terbayar (default 0)</div><div data-v-498972c1${_scopeId}><span class="text-gray-500" data-v-498972c1${_scopeId}>\u25CB</span> <code class="text-gray-400" data-v-498972c1${_scopeId}>paid_date</code> \u2014 tanggal bayar (opsional)</div><div data-v-498972c1${_scopeId}><span class="text-gray-500" data-v-498972c1${_scopeId}>\u25CB</span> <code class="text-gray-400" data-v-498972c1${_scopeId}>status</code> \u2014 otomatis: Lunas / Partial / Unpaid</div><div data-v-498972c1${_scopeId}><span class="text-gray-500" data-v-498972c1${_scopeId}>\u25CB</span> <code class="text-gray-400" data-v-498972c1${_scopeId}>notes</code> \u2014 catatan (opsional)</div></div></div><div class="p-3 bg-emerald-900/20 border border-emerald-700/40 rounded-xl text-xs text-emerald-300" data-v-498972c1${_scopeId}><i class="fa-solid fa-arrow-right-arrow-left mr-1.5 text-emerald-400" data-v-498972c1${_scopeId}></i><strong data-v-498972c1${_scopeId}>Yang otomatis diperbarui setelah upload:</strong><ol class="mt-1.5 ml-4 list-decimal space-y-0.5 text-emerald-400/80" data-v-498972c1${_scopeId}><li data-v-498972c1${_scopeId}>Realisasi bulanan (<code data-v-498972c1${_scopeId}>revenue_monthly.actual</code>) = SUM paid_amount per project per bulan</li><li data-v-498972c1${_scopeId}>Total realisasi project (<code data-v-498972c1${_scopeId}>revenue_projects.actual_revenue</code>) = SUM semua bulan</li><li data-v-498972c1${_scopeId}>Status &amp; Risk Level project (On Track / At Risk / Critical)</li><li data-v-498972c1${_scopeId}>Achievement % project</li></ol></div></div>`);
          } else {
            return [
              createVNode("div", { class: "mt-4 space-y-2" }, [
                createVNode("div", { class: "p-3 bg-navy-800/60 border border-navy-700 rounded-xl text-xs text-gray-400" }, [
                  createVNode("div", { class: "font-medium text-gray-300 mb-1.5" }, [
                    createVNode("i", { class: "fa-solid fa-table-columns mr-1 text-primary-400" }),
                    createTextVNode("Kolom CSV ")
                  ]),
                  createVNode("div", { class: "grid grid-cols-2 gap-x-6 gap-y-1" }, [
                    createVNode("div", null, [
                      createVNode("span", { class: "text-red-400" }, "*"),
                      createTextVNode(),
                      createVNode("code", { class: "text-primary-300" }, "invoice_no"),
                      createTextVNode(" \u2014 nomor invoice (unik, wajib)")
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-red-400" }, "*"),
                      createTextVNode(),
                      createVNode("code", { class: "text-primary-300" }, "project_id"),
                      createTextVNode(" \u2014 harus cocok dengan revenue project")
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-red-400" }, "*"),
                      createTextVNode(),
                      createVNode("code", { class: "text-primary-300" }, "invoice_date"),
                      createTextVNode(" \u2014 format YYYY-MM-DD")
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-red-400" }, "*"),
                      createTextVNode(),
                      createVNode("code", { class: "text-primary-300" }, "invoice_amount"),
                      createTextVNode(" \u2014 nilai invoice (Rp)")
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-gray-500" }, "\u25CB"),
                      createTextVNode(),
                      createVNode("code", { class: "text-gray-400" }, "paid_amount"),
                      createTextVNode(" \u2014 nilai terbayar (default 0)")
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-gray-500" }, "\u25CB"),
                      createTextVNode(),
                      createVNode("code", { class: "text-gray-400" }, "paid_date"),
                      createTextVNode(" \u2014 tanggal bayar (opsional)")
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-gray-500" }, "\u25CB"),
                      createTextVNode(),
                      createVNode("code", { class: "text-gray-400" }, "status"),
                      createTextVNode(" \u2014 otomatis: Lunas / Partial / Unpaid")
                    ]),
                    createVNode("div", null, [
                      createVNode("span", { class: "text-gray-500" }, "\u25CB"),
                      createTextVNode(),
                      createVNode("code", { class: "text-gray-400" }, "notes"),
                      createTextVNode(" \u2014 catatan (opsional)")
                    ])
                  ])
                ]),
                createVNode("div", { class: "p-3 bg-emerald-900/20 border border-emerald-700/40 rounded-xl text-xs text-emerald-300" }, [
                  createVNode("i", { class: "fa-solid fa-arrow-right-arrow-left mr-1.5 text-emerald-400" }),
                  createVNode("strong", null, "Yang otomatis diperbarui setelah upload:"),
                  createVNode("ol", { class: "mt-1.5 ml-4 list-decimal space-y-0.5 text-emerald-400/80" }, [
                    createVNode("li", null, [
                      createTextVNode("Realisasi bulanan ("),
                      createVNode("code", null, "revenue_monthly.actual"),
                      createTextVNode(") = SUM paid_amount per project per bulan")
                    ]),
                    createVNode("li", null, [
                      createTextVNode("Total realisasi project ("),
                      createVNode("code", null, "revenue_projects.actual_revenue"),
                      createTextVNode(") = SUM semua bulan")
                    ]),
                    createVNode("li", null, "Status & Risk Level project (On Track / At Risk / Critical)"),
                    createVNode("li", null, "Achievement % project")
                  ])
                ])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div class="space-y-5" style="${ssrRenderStyle(unref(activeTab) === "revenue" ? null : { display: "none" })}" data-v-498972c1>`);
      _push(ssrRenderComponent(_component_ImportPanel, {
        label: "Revenue Projects",
        icon: "fa-chart-line",
        color: "emerald",
        "template-url": "/v1/import/template/revenue",
        "upload-url": "/v1/import/revenue",
        "preview-cols": revenueCols,
        description: "Data revenue project beserta target & aktual per bulan (Jan\u2013Des).",
        "danger-desc": `Hapus SEMUA data revenue_projects dan revenue_monthly sebelum import.`,
        onDone: handleDone
      }, null, _parent));
      _push(`</div>`);
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-emerald-900 border-emerald-600" : "bg-red-900 border-red-700", "fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl text-sm text-white max-w-sm"])}" data-v-498972c1><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-emerald-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-498972c1></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/import.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _import = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-498972c1"]]);

export { _import as default };
//# sourceMappingURL=import-DMd0Vr8I.mjs.map
