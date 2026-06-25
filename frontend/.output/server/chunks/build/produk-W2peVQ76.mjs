import { defineComponent, ref, reactive, computed, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrInterpolate, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "produk",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const rows = ref([]);
    const pending = ref(true);
    const toast = reactive({ show: false, msg: "", type: "success" });
    const deleting = ref(null);
    const search = ref("");
    const filterKat = ref("");
    const filterActive = ref("");
    const kategoriList = computed(() => {
      const ks = [...new Set(rows.value.map((p) => p.kategori).filter(Boolean))];
      return ks.sort();
    });
    const filtered = computed(() => rows.value.filter((p) => {
      const q = search.value.toLowerCase();
      if (q && !p.nama.toLowerCase().includes(q) && !p.kode.toLowerCase().includes(q)) return false;
      if (filterKat.value && p.kategori !== filterKat.value) return false;
      if (filterActive.value === "1" && !p.is_active) return false;
      if (filterActive.value === "0" && p.is_active) return false;
      return true;
    }));
    const modal = reactive({
      show: false,
      isEdit: false,
      id: 0,
      kode: "",
      nama: "",
      kategori: "",
      deskripsi: "",
      is_active: true
    });
    const modalErr = ref("");
    const modalLoading = ref(false);
    function katClass(k) {
      var _a;
      return (_a = {
        "Platform": "bg-blue-900/40 text-blue-300",
        "Service": "bg-purple-900/40 text-purple-300",
        "Membership": "bg-yellow-900/40 text-yellow-300",
        "Custom": "bg-gray-800 text-gray-400"
      }[k]) != null ? _a : "bg-gray-800 text-gray-400";
    }
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-c21d01ab>`);
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-emerald-900 border-emerald-600" : "bg-red-900 border-red-700", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl text-sm text-white max-w-sm"])}" data-v-c21d01ab><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-emerald-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-c21d01ab></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="page-header mb-5" data-v-c21d01ab><div data-v-c21d01ab><h1 class="page-title" data-v-c21d01ab><i class="fa-solid fa-box-open text-primary-400 mr-2" data-v-c21d01ab></i>Master Produk</h1><p class="page-subtitle" data-v-c21d01ab>${ssrInterpolate(unref(rows).length)} produk terdaftar</p></div><button class="btn-primary" data-v-c21d01ab><i class="fa-solid fa-plus" data-v-c21d01ab></i>Tambah Produk </button></div><div class="card mb-5" data-v-c21d01ab><div class="flex flex-wrap gap-3 items-center" data-v-c21d01ab><input${ssrRenderAttr("value", unref(search))} class="form-input w-56" placeholder="\u{1F50D} Cari nama / kode..." data-v-c21d01ab><select class="form-select w-40" data-v-c21d01ab><option value="" data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(filterKat)) ? ssrLooseContain(unref(filterKat), "") : ssrLooseEqual(unref(filterKat), "")) ? " selected" : ""}>Semua Kategori</option><!--[-->`);
      ssrRenderList(unref(kategoriList), (k) => {
        _push(`<option data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(filterKat)) ? ssrLooseContain(unref(filterKat), null) : ssrLooseEqual(unref(filterKat), null)) ? " selected" : ""}>${ssrInterpolate(k)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select w-36" data-v-c21d01ab><option value="" data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(filterActive)) ? ssrLooseContain(unref(filterActive), "") : ssrLooseEqual(unref(filterActive), "")) ? " selected" : ""}>Semua Status</option><option value="1" data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(filterActive)) ? ssrLooseContain(unref(filterActive), "1") : ssrLooseEqual(unref(filterActive), "1")) ? " selected" : ""}>Aktif</option><option value="0" data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(filterActive)) ? ssrLooseContain(unref(filterActive), "0") : ssrLooseEqual(unref(filterActive), "0")) ? " selected" : ""}>Non-aktif</option></select><span class="ml-auto text-xs text-gray-500" data-v-c21d01ab>${ssrInterpolate(unref(filtered).length)} hasil</span></div></div><div class="card overflow-x-auto" data-v-c21d01ab>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-16" data-v-c21d01ab><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400" data-v-c21d01ab></i></div>`);
      } else {
        _push(`<table class="tbl" data-v-c21d01ab><thead data-v-c21d01ab><tr data-v-c21d01ab><th data-v-c21d01ab>Kode</th><th data-v-c21d01ab>Nama Produk</th><th data-v-c21d01ab>Kategori</th><th data-v-c21d01ab>Deskripsi</th><th data-v-c21d01ab>Status</th><th class="text-center" data-v-c21d01ab>Aksi</th></tr></thead><tbody data-v-c21d01ab>`);
        if (!unref(filtered).length) {
          _push(`<tr data-v-c21d01ab><td colspan="6" class="text-center py-12 text-gray-600" data-v-c21d01ab><i class="fa-solid fa-box-open text-3xl mb-2 block opacity-30" data-v-c21d01ab></i> Tidak ada data </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(filtered), (p) => {
          _push(`<tr data-v-c21d01ab><td data-v-c21d01ab><span class="font-mono text-xs bg-navy-800 text-primary-300 px-2 py-0.5 rounded font-semibold" data-v-c21d01ab>${ssrInterpolate(p.kode)}</span></td><td class="font-medium text-gray-200" data-v-c21d01ab>${ssrInterpolate(p.nama)}</td><td data-v-c21d01ab>`);
          if (p.kategori) {
            _push(`<span class="${ssrRenderClass([katClass(p.kategori), "text-xs px-2 py-0.5 rounded-full font-medium"])}" data-v-c21d01ab>${ssrInterpolate(p.kategori)}</span>`);
          } else {
            _push(`<span class="text-gray-600 text-xs" data-v-c21d01ab>\u2014</span>`);
          }
          _push(`</td><td class="text-xs text-gray-500 max-w-56 truncate" data-v-c21d01ab>${ssrInterpolate(p.deskripsi || "\u2014")}</td><td data-v-c21d01ab><span class="${ssrRenderClass([p.is_active ? "badge-green" : "bg-gray-800 text-gray-500", "text-xs px-2 py-0.5 rounded-full font-medium"])}" data-v-c21d01ab>${ssrInterpolate(p.is_active ? "Aktif" : "Non-aktif")}</span></td><td class="text-center" data-v-c21d01ab><div class="flex items-center justify-center gap-1" data-v-c21d01ab><button class="btn-ghost btn-xs rounded" title="Edit" data-v-c21d01ab><i class="fa-solid fa-pen text-xs" data-v-c21d01ab></i></button><button${ssrIncludeBooleanAttr(unref(deleting) === p.id) ? " disabled" : ""} class="btn-ghost btn-xs rounded text-red-400 hover:text-red-300 disabled:opacity-40" data-v-c21d01ab><i class="${ssrRenderClass([unref(deleting) === p.id ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-trash", "text-xs"])}" data-v-c21d01ab></i></button></div></td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      }
      _push(`</div>`);
      if (unref(modal).show) {
        _push(`<div class="fixed inset-0 z-40 bg-black/60 flex items-center justify-center p-4" data-v-c21d01ab><div class="card w-full max-w-lg relative" data-v-c21d01ab><button class="absolute top-4 right-4 btn-ghost btn-xs rounded-lg" data-v-c21d01ab><i class="fa-solid fa-xmark" data-v-c21d01ab></i></button><h3 class="section-title mb-5" data-v-c21d01ab><i class="fa-solid fa-box-open text-primary-400 mr-1.5" data-v-c21d01ab></i> ${ssrInterpolate(unref(modal).isEdit ? "Edit Produk" : "Tambah Produk")}</h3><form class="space-y-4" data-v-c21d01ab><div class="grid grid-cols-2 gap-4" data-v-c21d01ab><div data-v-c21d01ab><label class="form-label" data-v-c21d01ab>Kode <span class="text-red-400" data-v-c21d01ab>*</span></label><input${ssrRenderAttr("value", unref(modal).kode)} class="form-input font-mono uppercase" placeholder="Contoh: FINCORE" required maxlength="20" data-v-c21d01ab><p class="text-xs text-gray-600 mt-1" data-v-c21d01ab>Unik, max 20 karakter</p></div><div data-v-c21d01ab><label class="form-label" data-v-c21d01ab>Kategori</label><select class="form-select" data-v-c21d01ab><option value="" data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(modal).kategori) ? ssrLooseContain(unref(modal).kategori, "") : ssrLooseEqual(unref(modal).kategori, "")) ? " selected" : ""}>\u2014 Pilih \u2014</option><option data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(modal).kategori) ? ssrLooseContain(unref(modal).kategori, null) : ssrLooseEqual(unref(modal).kategori, null)) ? " selected" : ""}>Platform</option><option data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(modal).kategori) ? ssrLooseContain(unref(modal).kategori, null) : ssrLooseEqual(unref(modal).kategori, null)) ? " selected" : ""}>Service</option><option data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(modal).kategori) ? ssrLooseContain(unref(modal).kategori, null) : ssrLooseEqual(unref(modal).kategori, null)) ? " selected" : ""}>Membership</option><option data-v-c21d01ab${ssrIncludeBooleanAttr(Array.isArray(unref(modal).kategori) ? ssrLooseContain(unref(modal).kategori, null) : ssrLooseEqual(unref(modal).kategori, null)) ? " selected" : ""}>Custom</option></select></div></div><div data-v-c21d01ab><label class="form-label" data-v-c21d01ab>Nama Produk <span class="text-red-400" data-v-c21d01ab>*</span></label><input${ssrRenderAttr("value", unref(modal).nama)} class="form-input" placeholder="Nama lengkap produk" required data-v-c21d01ab></div><div data-v-c21d01ab><label class="form-label" data-v-c21d01ab>Deskripsi</label><textarea class="form-textarea h-20" placeholder="Keterangan singkat produk (opsional)..." data-v-c21d01ab>${ssrInterpolate(unref(modal).deskripsi)}</textarea></div><div class="flex items-center gap-3" data-v-c21d01ab><label class="flex items-center gap-2 cursor-pointer" data-v-c21d01ab><input type="checkbox"${ssrIncludeBooleanAttr(Array.isArray(unref(modal).is_active) ? ssrLooseContain(unref(modal).is_active, null) : unref(modal).is_active) ? " checked" : ""} class="w-4 h-4 accent-primary-500" data-v-c21d01ab><span class="text-sm text-gray-300" data-v-c21d01ab>Produk Aktif</span></label><span class="text-xs text-gray-600" data-v-c21d01ab>(non-aktif = tidak muncul di dropdown form)</span></div>`);
        if (unref(modalErr)) {
          _push(`<div class="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300" data-v-c21d01ab><i class="fa-solid fa-circle-exclamation text-red-400" data-v-c21d01ab></i>${ssrInterpolate(unref(modalErr))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-3 justify-end pt-2 border-t border-navy-800" data-v-c21d01ab><button type="button" class="btn-secondary" data-v-c21d01ab>Batal</button><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(unref(modalLoading)) ? " disabled" : ""} data-v-c21d01ab><i class="${ssrRenderClass(unref(modalLoading) ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-floppy-disk")}" data-v-c21d01ab></i> Simpan </button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/master/produk.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const produk = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-c21d01ab"]]);

export { produk as default };
//# sourceMappingURL=produk-W2peVQ76.mjs.map
