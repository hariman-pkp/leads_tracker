import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { _ as __nuxt_component_1 } from './AppPagination-DUr1sfAX.mjs';
import { _ as _sfc_main$1 } from './NumericInput-CpnBtvaB.mjs';
import { defineComponent, computed, ref, reactive, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderComponent, ssrRenderClass, ssrRenderStyle } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useFormat } from './useFormat-D7DNHH-1.mjs';
import { u as useAuthStore } from './server.mjs';
import { _ as _export_sfc } from './_plugin-vue_export-helper-1tPrXgE0.mjs';
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
  __name: "claims",
  __ssrInlineRender: true,
  setup(__props) {
    const { get } = useApi();
    const fmt = useFormat();
    const auth = useAuthStore();
    const canApprove = computed(() => {
      var _a, _b;
      return [1, 2].includes((_b = (_a = auth.user) == null ? void 0 : _a.role_id) != null ? _b : 0);
    });
    const myId = computed(() => {
      var _a;
      return (_a = auth.user) == null ? void 0 : _a.id;
    });
    const loading = ref(true);
    const saving = ref(false);
    const locating = ref(false);
    const stamping = ref(false);
    const locError = ref("");
    const filterTahun = ref((/* @__PURE__ */ new Date()).getFullYear());
    const filterBulan = ref((/* @__PURE__ */ new Date()).getMonth() + 1);
    const filterStatus = ref("");
    const filterUserId = ref(0);
    const years = Array.from({ length: 3 }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() - i);
    const page = ref(1);
    const perPage = ref(10);
    const totalCount = ref(0);
    const totalPages = ref(1);
    const claims2 = ref([]);
    const summary = ref({});
    const limitPerBulan = ref(0);
    const leads = ref([]);
    const salesList = ref([]);
    ref(null);
    const photoFile = ref(null);
    const photoPreview = ref("");
    ref(null);
    const toast = reactive({ show: false, msg: "", type: "success" });
    const formModal = reactive({ open: false, isNew: true, error: "", form: {} });
    const detailModal = reactive({ open: false, loading: false, claim: null, approvals: [] });
    const mapModal = reactive({ open: false, claim: null, lat: 0, lng: 0 });
    const photoModal = reactive({ open: false, claim: null });
    const pctLimit = computed(
      () => limitPerBulan.value ? (summary.value.total_bulan || 0) / limitPerBulan.value * 100 : 0
    );
    async function load(resetPage = false) {
      if (resetPage) page.value = 1;
      loading.value = true;
      try {
        const params = { tahun: filterTahun.value, page: page.value, per_page: perPage.value };
        if (filterBulan.value) params.bulan = filterBulan.value;
        if (filterStatus.value) params.status = filterStatus.value;
        if (filterUserId.value) params.user_id = filterUserId.value;
        const res = await get("/v1/entertain/claims", params);
        claims2.value = res.claims || [];
        summary.value = res.summary || {};
        limitPerBulan.value = res.limit_per_bulan || 0;
        totalCount.value = res.total || 0;
        totalPages.value = res.total_pages || 1;
      } finally {
        loading.value = false;
      }
    }
    watch([page, perPage], () => load());
    watch(() => mapModal.open, (v) => {
    });
    function statusBadge(s) {
      var _a;
      const map = {
        "Pending": "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/50 text-yellow-300",
        "Approved": "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-300",
        "Rejected": "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400",
        "Cancelled": "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-500"
      };
      return (_a = map[s]) != null ? _a : "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400";
    }
    function monthName(m) {
      return new Date(2e3, m - 1, 1).toLocaleString("id-ID", { month: "long" });
    }
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      const _component_NumericInput = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-apex-bg text-apex-text p-6" }, _attrs))} data-v-60cc886a><div class="flex flex-wrap items-center justify-between gap-4 mb-6" data-v-60cc886a><div data-v-60cc886a><h1 class="text-2xl font-bold text-apex-text" data-v-60cc886a><i class="fa-solid fa-receipt text-primary-400 mr-2" data-v-60cc886a></i>Klaim Entertain </h1><p class="text-sm text-apex-muted mt-0.5" data-v-60cc886a>${ssrInterpolate(unref(canApprove) ? "Semua klaim entertain" : "Klaim entertain saya")}</p></div><div class="flex items-center gap-3 flex-wrap" data-v-60cc886a><select class="form-select text-sm w-28" data-v-60cc886a><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)} data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterTahun)) ? ssrLooseContain(unref(filterTahun), y) : ssrLooseEqual(unref(filterTahun), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select text-sm w-36" data-v-60cc886a><option${ssrRenderAttr("value", 0)} data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterBulan)) ? ssrLooseContain(unref(filterBulan), 0) : ssrLooseEqual(unref(filterBulan), 0)) ? " selected" : ""}>Semua Bulan</option><!--[-->`);
      ssrRenderList(12, (m) => {
        _push(`<option${ssrRenderAttr("value", m)} data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterBulan)) ? ssrLooseContain(unref(filterBulan), m) : ssrLooseEqual(unref(filterBulan), m)) ? " selected" : ""}>${ssrInterpolate(monthName(m))}</option>`);
      });
      _push(`<!--]--></select>`);
      if (unref(canApprove)) {
        _push(`<select class="form-select text-sm w-40" data-v-60cc886a><option${ssrRenderAttr("value", 0)} data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterUserId)) ? ssrLooseContain(unref(filterUserId), 0) : ssrLooseEqual(unref(filterUserId), 0)) ? " selected" : ""}>Semua Sales</option><!--[-->`);
        ssrRenderList(unref(salesList), (s) => {
          _push(`<option${ssrRenderAttr("value", s.id)} data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterUserId)) ? ssrLooseContain(unref(filterUserId), s.id) : ssrLooseEqual(unref(filterUserId), s.id)) ? " selected" : ""}>${ssrInterpolate(s.nama)}</option>`);
        });
        _push(`<!--]--></select>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<select class="form-select text-sm w-36" data-v-60cc886a><option value="" data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "") : ssrLooseEqual(unref(filterStatus), "")) ? " selected" : ""}>Semua Status</option><option value="Pending" data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "Pending") : ssrLooseEqual(unref(filterStatus), "Pending")) ? " selected" : ""}>Pending</option><option value="Approved" data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "Approved") : ssrLooseEqual(unref(filterStatus), "Approved")) ? " selected" : ""}>Approved</option><option value="Rejected" data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "Rejected") : ssrLooseEqual(unref(filterStatus), "Rejected")) ? " selected" : ""}>Rejected</option><option value="Cancelled" data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "Cancelled") : ssrLooseEqual(unref(filterStatus), "Cancelled")) ? " selected" : ""}>Cancelled</option></select><button class="btn-primary flex items-center gap-2 text-sm" data-v-60cc886a><i class="fa-solid fa-plus" data-v-60cc886a></i> Ajukan Klaim </button>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/entertain",
        class: "btn-ghost flex items-center gap-2 text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<i class="fa-solid fa-chart-bar" data-v-60cc886a${_scopeId}></i> Dashboard `);
          } else {
            return [
              createVNode("i", { class: "fa-solid fa-chart-bar" }),
              createTextVNode(" Dashboard ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-v-60cc886a><div class="apex-card" data-v-60cc886a><div class="text-xs text-apex-muted mb-1" data-v-60cc886a>Total Diajukan</div><div class="text-xl font-bold text-apex-text" data-v-60cc886a>${ssrInterpolate(unref(fmt).rupiah(unref(summary).total_bulan || 0))}</div><div class="text-xs text-apex-faint mt-0.5" data-v-60cc886a>${ssrInterpolate(unref(filterBulan) ? monthName(unref(filterBulan)) : "Tahun " + unref(filterTahun))}</div>`);
      if (unref(limitPerBulan) > 0 && !unref(canApprove)) {
        _push(`<div class="mt-2" data-v-60cc886a><div class="h-1.5 bg-apex-border/30 rounded-full overflow-hidden" data-v-60cc886a><div class="${ssrRenderClass([unref(pctLimit) > 100 ? "bg-red-500" : unref(pctLimit) > 75 ? "bg-yellow-500" : "bg-emerald-500", "h-full rounded-full transition-all"])}" style="${ssrRenderStyle(`width:${Math.min(unref(pctLimit), 100)}%`)}" data-v-60cc886a></div></div><div class="text-xs text-apex-faint mt-0.5" data-v-60cc886a>${ssrInterpolate(unref(pctLimit).toFixed(0))}% dari ${ssrInterpolate(unref(fmt).rupiah(unref(limitPerBulan)))}</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="apex-card" data-v-60cc886a><div class="text-xs text-apex-muted mb-1" data-v-60cc886a>Pending</div><div class="text-2xl font-bold text-yellow-400" data-v-60cc886a>${ssrInterpolate(unref(summary).pending || 0)}</div></div><div class="apex-card" data-v-60cc886a><div class="text-xs text-apex-muted mb-1" data-v-60cc886a>Approved</div><div class="text-2xl font-bold text-emerald-400" data-v-60cc886a>${ssrInterpolate(unref(summary).approved || 0)}</div></div><div class="apex-card" data-v-60cc886a><div class="text-xs text-apex-muted mb-1" data-v-60cc886a>Rejected</div><div class="text-2xl font-bold text-red-400" data-v-60cc886a>${ssrInterpolate(unref(summary).rejected || 0)}</div></div></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center py-20 text-apex-muted" data-v-60cc886a><i class="fa-solid fa-spinner fa-spin mr-2" data-v-60cc886a></i>Memuat data... </div>`);
      } else {
        _push(`<div class="apex-card overflow-x-auto" data-v-60cc886a><table class="w-full text-sm" data-v-60cc886a><thead data-v-60cc886a><tr class="border-b border-apex-border" data-v-60cc886a><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-60cc886a>No. Klaim</th>`);
        if (unref(canApprove)) {
          _push(`<th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-60cc886a>Sales</th>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-60cc886a>Tanggal</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-60cc886a>Nama Klien</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-60cc886a>Leads</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-60cc886a>Lokasi</th><th class="text-center py-3 px-3 text-apex-muted font-medium w-16" data-v-60cc886a>Foto</th><th class="text-right py-3 px-3 text-apex-muted font-medium" data-v-60cc886a>Jumlah</th><th class="text-center py-3 px-3 text-apex-muted font-medium" data-v-60cc886a>Status</th><th class="text-center py-3 px-3 text-apex-muted font-medium w-24" data-v-60cc886a>Aksi</th></tr></thead><tbody data-v-60cc886a>`);
        if (unref(claims2).length === 0) {
          _push(`<tr data-v-60cc886a><td${ssrRenderAttr("colspan", unref(canApprove) ? 10 : 9)} class="text-center py-12 text-apex-faint" data-v-60cc886a> Belum ada klaim untuk periode ini. </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(claims2), (c) => {
          _push(`<tr class="border-b border-apex-border hover:bg-apex-card/30 transition-colors" data-v-60cc886a><td class="py-2.5 px-3" data-v-60cc886a><span class="font-mono text-xs text-primary-400" data-v-60cc886a>${ssrInterpolate(c.claim_no)}</span>`);
          if (c.limit_warning) {
            _push(`<i class="fa-solid fa-triangle-exclamation text-yellow-400 ml-1.5 text-xs" title="Melebihi limit bulan ini" data-v-60cc886a></i>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td>`);
          if (unref(canApprove)) {
            _push(`<td class="py-2.5 px-3 font-medium text-apex-text" data-v-60cc886a>${ssrInterpolate(c.sales_nama)}</td>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<td class="py-2.5 px-3 text-apex-muted whitespace-nowrap" data-v-60cc886a>${ssrInterpolate(unref(fmt).tgl(c.tgl_klaim))}</td><td class="py-2.5 px-3 text-apex-text" data-v-60cc886a>${ssrInterpolate(c.nama_klien)}</td><td class="py-2.5 px-3 text-xs text-apex-muted" data-v-60cc886a>${ssrInterpolate(c.lead_nama || "\u2014")}</td><td class="py-2.5 px-3" data-v-60cc886a>`);
          if (c.lat && c.lng) {
            _push(`<div class="flex items-center gap-1.5" data-v-60cc886a><span class="text-xs text-apex-muted truncate max-w-[100px]"${ssrRenderAttr("title", c.lokasi)} data-v-60cc886a>${ssrInterpolate(c.lokasi || `${Number(c.lat).toFixed(4)}, ${Number(c.lng).toFixed(4)}`)}</span><button class="text-primary-400 hover:text-primary-300 flex-shrink-0" title="Lihat di peta" data-v-60cc886a><i class="fa-solid fa-map-location-dot text-xs" data-v-60cc886a></i></button></div>`);
          } else if (c.lokasi) {
            _push(`<span class="text-xs text-apex-muted" data-v-60cc886a>${ssrInterpolate(c.lokasi)}</span>`);
          } else {
            _push(`<span class="text-xs text-apex-faint" data-v-60cc886a>\u2014</span>`);
          }
          _push(`</td><td class="py-2 px-3 text-center" data-v-60cc886a>`);
          if (c.foto_bukti) {
            _push(`<button class="block mx-auto rounded-lg overflow-hidden border border-apex-border hover:border-primary-500 transition-colors focus:outline-none" title="Lihat foto bukti" data-v-60cc886a><img${ssrRenderAttr("src", `http://localhost:8001/storage/${c.foto_bukti}`)} class="w-10 h-10 object-cover" data-v-60cc886a></button>`);
          } else {
            _push(`<span class="text-apex-faint text-xs" data-v-60cc886a>\u2014</span>`);
          }
          _push(`</td><td class="py-2.5 px-3 text-right font-semibold text-apex-text" data-v-60cc886a>${ssrInterpolate(unref(fmt).rupiah(c.jumlah))}</td><td class="py-2.5 px-3 text-center" data-v-60cc886a><span class="${ssrRenderClass(statusBadge(c.status))}" data-v-60cc886a>${ssrInterpolate(c.status)}</span></td><td class="py-2.5 px-3 text-center" data-v-60cc886a><button class="text-primary-400 hover:text-primary-300 mr-2" title="Detail" data-v-60cc886a><i class="fa-solid fa-eye" data-v-60cc886a></i></button>`);
          if (c.status === "Pending" && c.user_id === unref(myId)) {
            _push(`<button class="text-amber-400 hover:text-amber-300 mr-2" title="Edit" data-v-60cc886a><i class="fa-solid fa-pen" data-v-60cc886a></i></button>`);
          } else {
            _push(`<!---->`);
          }
          if (c.status === "Pending" && c.user_id === unref(myId)) {
            _push(`<button class="text-red-400 hover:text-red-300" title="Batalkan" data-v-60cc886a><i class="fa-solid fa-xmark" data-v-60cc886a></i></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td></tr>`);
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
        _push(`</div>`);
      }
      if (unref(formModal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-v-60cc886a><div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" data-v-60cc886a><div class="flex items-center justify-between p-5 border-b border-apex-border sticky top-0 bg-apex-surface z-10" data-v-60cc886a><h2 class="text-lg font-semibold text-apex-text" data-v-60cc886a>${ssrInterpolate(unref(formModal).isNew ? "Ajukan Klaim Entertain" : "Edit Klaim")}</h2><button class="text-apex-muted hover:text-apex-text" data-v-60cc886a><i class="fa-solid fa-xmark text-xl" data-v-60cc886a></i></button></div><div class="p-5 space-y-4" data-v-60cc886a><div class="grid grid-cols-2 gap-4" data-v-60cc886a><div data-v-60cc886a><label class="form-label" data-v-60cc886a>Tanggal <span class="text-red-400" data-v-60cc886a>*</span></label><input${ssrRenderAttr("value", unref(formModal).form.tgl_klaim)} type="date" class="form-input" data-v-60cc886a></div><div data-v-60cc886a><label class="form-label" data-v-60cc886a>Jumlah (Rp) <span class="text-red-400" data-v-60cc886a>*</span></label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(formModal).form.jumlah,
          "onUpdate:modelValue": ($event) => unref(formModal).form.jumlah = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div></div><div data-v-60cc886a><label class="form-label" data-v-60cc886a>Nama Klien <span class="text-red-400" data-v-60cc886a>*</span></label><input${ssrRenderAttr("value", unref(formModal).form.nama_klien)} class="form-input" placeholder="Nama individu / perusahaan klien" data-v-60cc886a></div><div data-v-60cc886a><label class="form-label" data-v-60cc886a>Lokasi</label><div class="flex gap-2" data-v-60cc886a><input${ssrRenderAttr("value", unref(formModal).form.lokasi)} class="form-input flex-1" placeholder="Nama restoran / tempat..." data-v-60cc886a><button${ssrIncludeBooleanAttr(unref(locating)) ? " disabled" : ""} class="${ssrRenderClass([unref(formModal).form.lat ? "border-emerald-600 bg-emerald-900/30 text-emerald-400" : "border-apex-border bg-apex-card text-apex-muted hover:text-apex-text", "flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors"])}" title="Ambil lokasi GPS saat ini" data-v-60cc886a>`);
        if (unref(locating)) {
          _push(`<i class="fa-solid fa-spinner fa-spin text-xs" data-v-60cc886a></i>`);
        } else {
          _push(`<i class="fa-solid fa-location-crosshairs text-xs" data-v-60cc886a></i>`);
        }
        _push(`<span class="text-xs" data-v-60cc886a>${ssrInterpolate(unref(locating) ? "Detecting..." : unref(formModal).form.lat ? "GPS OK" : "GPS")}</span></button></div>`);
        if (unref(formModal).form.lat && unref(formModal).form.lng) {
          _push(`<div class="mt-1.5 flex items-center gap-1.5 text-xs text-emerald-400" data-v-60cc886a><i class="fa-solid fa-circle-check" data-v-60cc886a></i> ${ssrInterpolate(Number(unref(formModal).form.lat).toFixed(6))}, ${ssrInterpolate(Number(unref(formModal).form.lng).toFixed(6))}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(locError)) {
          _push(`<div class="mt-1 text-xs text-red-400" data-v-60cc886a>${ssrInterpolate(unref(locError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div data-v-60cc886a><label class="form-label" data-v-60cc886a>Leads Terkait</label><select class="form-select" data-v-60cc886a><option value="" data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).form.lead_id) ? ssrLooseContain(unref(formModal).form.lead_id, "") : ssrLooseEqual(unref(formModal).form.lead_id, "")) ? " selected" : ""}>\u2014 Tidak terkait leads \u2014</option><!--[-->`);
        ssrRenderList(unref(leads), (l) => {
          _push(`<option${ssrRenderAttr("value", l.lead_id)} data-v-60cc886a${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).form.lead_id) ? ssrLooseContain(unref(formModal).form.lead_id, l.lead_id) : ssrLooseEqual(unref(formModal).form.lead_id, l.lead_id)) ? " selected" : ""}>${ssrInterpolate(l.nama_company)} (${ssrInterpolate(l.stage)}) </option>`);
        });
        _push(`<!--]--></select></div><div data-v-60cc886a><label class="form-label" data-v-60cc886a>Keterangan</label><textarea rows="2" class="form-input resize-none" placeholder="Tujuan entertain, agenda..." data-v-60cc886a>${ssrInterpolate(unref(formModal).form.keterangan)}</textarea></div><div class="border border-apex-border rounded-xl p-4 space-y-3" data-v-60cc886a><label class="form-label mb-0" data-v-60cc886a><i class="fa-solid fa-camera mr-1 text-primary-400" data-v-60cc886a></i>Foto Bukti / Struk </label><p class="text-xs text-apex-muted -mt-1" data-v-60cc886a>Foto akan distamp dengan tanggal, jam, dan koordinat GPS.</p>`);
        if (unref(formModal).form.foto_bukti && !unref(photoPreview)) {
          _push(`<div class="relative w-fit" data-v-60cc886a><img${ssrRenderAttr("src", `http://localhost:8001/storage/${unref(formModal).form.foto_bukti}`)} class="w-40 h-40 object-cover rounded-lg border border-apex-border" data-v-60cc886a></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(photoPreview)) {
          _push(`<div class="relative w-fit" data-v-60cc886a><img${ssrRenderAttr("src", unref(photoPreview))} class="w-40 h-40 object-cover rounded-lg border border-emerald-600" data-v-60cc886a><button class="absolute -top-2 -right-2 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center" data-v-60cc886a><i class="fa-solid fa-xmark text-white text-[10px]" data-v-60cc886a></i></button></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex items-center gap-2 flex-wrap" data-v-60cc886a><label class="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border border-apex-border bg-apex-card hover:bg-apex-card/80 text-sm text-apex-muted transition-colors" data-v-60cc886a><i class="fa-solid fa-image text-xs" data-v-60cc886a></i><span class="text-xs" data-v-60cc886a>${ssrInterpolate(unref(photoFile) ? unref(photoFile).name : "Pilih Foto")}</span><input type="file" accept="image/*" class="hidden" data-v-60cc886a></label>`);
        if (unref(photoFile)) {
          _push(`<button${ssrIncludeBooleanAttr(unref(stamping)) ? " disabled" : ""} class="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-primary-600 bg-primary-900/30 text-primary-400 text-xs transition-colors" data-v-60cc886a>`);
          if (unref(stamping)) {
            _push(`<i class="fa-solid fa-spinner fa-spin" data-v-60cc886a></i>`);
          } else {
            _push(`<i class="fa-solid fa-stamp" data-v-60cc886a></i>`);
          }
          _push(` ${ssrInterpolate(unref(stamping) ? "Memproses..." : "Preview Stamp")}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div>`);
        if (unref(formModal).error) {
          _push(`<div class="text-xs text-red-400 flex items-center gap-1.5" data-v-60cc886a><i class="fa-solid fa-circle-exclamation" data-v-60cc886a></i>${ssrInterpolate(unref(formModal).error)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex justify-end gap-3 p-5 border-t border-apex-border sticky bottom-0 bg-apex-surface" data-v-60cc886a><button class="btn-ghost" data-v-60cc886a>Batal</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary" data-v-60cc886a>`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-spinner fa-spin mr-1" data-v-60cc886a></i>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(formModal).isNew ? "Ajukan Klaim" : "Simpan")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(detailModal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-v-60cc886a><div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" data-v-60cc886a><div class="flex items-center justify-between p-5 border-b border-apex-border" data-v-60cc886a><h2 class="text-lg font-semibold text-apex-text" data-v-60cc886a> Detail \u2014 <span class="font-mono text-primary-400" data-v-60cc886a>${ssrInterpolate((_a = unref(detailModal).claim) == null ? void 0 : _a.claim_no)}</span></h2><button class="text-apex-muted hover:text-apex-text" data-v-60cc886a><i class="fa-solid fa-xmark text-xl" data-v-60cc886a></i></button></div>`);
        if (unref(detailModal).loading) {
          _push(`<div class="flex justify-center py-10 text-apex-muted" data-v-60cc886a><i class="fa-solid fa-spinner fa-spin" data-v-60cc886a></i></div>`);
        } else if (unref(detailModal).claim) {
          _push(`<div class="p-5 space-y-4" data-v-60cc886a><div class="grid grid-cols-2 gap-3 text-sm" data-v-60cc886a><div data-v-60cc886a><div class="text-xs text-apex-muted" data-v-60cc886a>Sales</div><div class="font-medium" data-v-60cc886a>${ssrInterpolate(unref(detailModal).claim.sales_nama)}</div></div><div data-v-60cc886a><div class="text-xs text-apex-muted" data-v-60cc886a>Status</div><span class="${ssrRenderClass(statusBadge(unref(detailModal).claim.status))}" data-v-60cc886a>${ssrInterpolate(unref(detailModal).claim.status)}</span></div><div data-v-60cc886a><div class="text-xs text-apex-muted" data-v-60cc886a>Tanggal</div><div data-v-60cc886a>${ssrInterpolate(unref(fmt).tgl(unref(detailModal).claim.tgl_klaim))}</div></div><div data-v-60cc886a><div class="text-xs text-apex-muted" data-v-60cc886a>Jumlah</div><div class="font-bold text-base" data-v-60cc886a>${ssrInterpolate(unref(fmt).rupiah(unref(detailModal).claim.jumlah))}</div></div><div data-v-60cc886a><div class="text-xs text-apex-muted" data-v-60cc886a>Nama Klien</div><div data-v-60cc886a>${ssrInterpolate(unref(detailModal).claim.nama_klien)}</div></div><div data-v-60cc886a><div class="text-xs text-apex-muted" data-v-60cc886a>Lokasi</div><div class="flex items-center gap-1.5" data-v-60cc886a><span data-v-60cc886a>${ssrInterpolate(unref(detailModal).claim.lokasi || "\u2014")}</span>`);
          if (unref(detailModal).claim.lat && unref(detailModal).claim.lng) {
            _push(`<button class="text-primary-400 text-xs" data-v-60cc886a><i class="fa-solid fa-map-location-dot" data-v-60cc886a></i></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (unref(detailModal).claim.lat) {
            _push(`<div class="text-xs text-apex-faint mt-0.5" data-v-60cc886a>${ssrInterpolate(Number(unref(detailModal).claim.lat).toFixed(6))}, ${ssrInterpolate(Number(unref(detailModal).claim.lng).toFixed(6))}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><div class="col-span-2" data-v-60cc886a><div class="text-xs text-apex-muted" data-v-60cc886a>Leads</div><div data-v-60cc886a>${ssrInterpolate(unref(detailModal).claim.lead_nama || "\u2014")}</div></div><div class="col-span-2" data-v-60cc886a><div class="text-xs text-apex-muted" data-v-60cc886a>Keterangan</div><div data-v-60cc886a>${ssrInterpolate(unref(detailModal).claim.keterangan || "\u2014")}</div></div></div>`);
          if (unref(detailModal).claim.foto_bukti) {
            _push(`<div data-v-60cc886a><div class="text-xs text-apex-muted mb-2" data-v-60cc886a>Bukti / Struk</div><img${ssrRenderAttr("src", `http://localhost:8001/storage/${unref(detailModal).claim.foto_bukti}`)} class="max-w-full max-h-52 rounded-xl border border-apex-border object-contain" data-v-60cc886a></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(detailModal).approvals.length) {
            _push(`<div data-v-60cc886a><div class="text-xs text-apex-muted mb-2" data-v-60cc886a>Riwayat Approval</div><div class="space-y-2" data-v-60cc886a><!--[-->`);
            ssrRenderList(unref(detailModal).approvals, (a) => {
              _push(`<div class="flex items-start gap-3 text-sm" data-v-60cc886a><div class="${ssrRenderClass([a.action === "Approved" ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400", "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"])}" data-v-60cc886a><i class="${ssrRenderClass([a.action === "Approved" ? "fa-solid fa-check" : "fa-solid fa-xmark", "text-xs"])}" data-v-60cc886a></i></div><div data-v-60cc886a><div class="font-medium" data-v-60cc886a>${ssrInterpolate(a.approver_nama)} <span class="${ssrRenderClass(a.action === "Approved" ? "text-emerald-400" : "text-red-400")}" data-v-60cc886a>${ssrInterpolate(a.action)}</span></div>`);
              if (a.catatan) {
                _push(`<div class="text-apex-muted text-xs" data-v-60cc886a>${ssrInterpolate(a.catatan)}</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<div class="text-apex-faint text-xs" data-v-60cc886a>${ssrInterpolate(unref(fmt).tgl(a.created_at))}</div></div></div>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end gap-3 p-5 border-t border-apex-border" data-v-60cc886a><button class="btn-ghost" data-v-60cc886a>Tutup</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(mapModal).open) {
        _push(`<div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" data-v-60cc886a><div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-xl shadow-2xl" data-v-60cc886a><div class="flex items-center justify-between p-4 border-b border-apex-border" data-v-60cc886a><div data-v-60cc886a><h2 class="text-base font-semibold text-apex-text" data-v-60cc886a><i class="fa-solid fa-map-location-dot text-primary-400 mr-2" data-v-60cc886a></i>Lokasi Klaim </h2><p class="text-xs text-apex-muted mt-0.5" data-v-60cc886a>${ssrInterpolate((_b = unref(mapModal).claim) == null ? void 0 : _b.nama_klien)} \xB7 ${ssrInterpolate(unref(fmt).tgl((_c = unref(mapModal).claim) == null ? void 0 : _c.tgl_klaim))}</p></div><button class="text-apex-muted hover:text-apex-text" data-v-60cc886a><i class="fa-solid fa-xmark text-xl" data-v-60cc886a></i></button></div><div class="p-4 space-y-3" data-v-60cc886a><div class="text-xs text-apex-muted" data-v-60cc886a>${ssrInterpolate((_d = unref(mapModal).claim) == null ? void 0 : _d.lokasi)} \xB7 <span class="font-mono" data-v-60cc886a>${ssrInterpolate((_e = unref(mapModal).lat) == null ? void 0 : _e.toFixed(6))}, ${ssrInterpolate((_f = unref(mapModal).lng) == null ? void 0 : _f.toFixed(6))}</span></div><div id="claims-map" class="w-full h-72 rounded-xl border border-apex-border overflow-hidden z-0" data-v-60cc886a></div><a${ssrRenderAttr("href", `https://www.google.com/maps?q=${unref(mapModal).lat},${unref(mapModal).lng}`)} target="_blank" class="flex items-center gap-2 text-xs text-primary-400 hover:text-primary-300" data-v-60cc886a><i class="fa-solid fa-arrow-up-right-from-square" data-v-60cc886a></i>Buka di Google Maps </a></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(photoModal).open) {
        _push(`<div class="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-4" data-v-60cc886a><div class="w-full max-w-2xl" data-v-60cc886a><div class="flex items-center justify-between mb-3 px-1" data-v-60cc886a><div data-v-60cc886a><div class="font-mono text-xs text-primary-400" data-v-60cc886a>${ssrInterpolate((_g = unref(photoModal).claim) == null ? void 0 : _g.claim_no)}</div><div class="text-sm font-medium text-white" data-v-60cc886a>${ssrInterpolate((_h = unref(photoModal).claim) == null ? void 0 : _h.nama_klien)}</div><div class="text-xs text-gray-400" data-v-60cc886a>${ssrInterpolate(unref(fmt).tgl((_i = unref(photoModal).claim) == null ? void 0 : _i.tgl_klaim))} \xB7 ${ssrInterpolate((_j = unref(photoModal).claim) == null ? void 0 : _j.sales_nama)}</div></div><button class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" data-v-60cc886a><i class="fa-solid fa-xmark text-white" data-v-60cc886a></i></button></div><img${ssrRenderAttr("src", `http://localhost:8001/storage/${(_k = unref(photoModal).claim) == null ? void 0 : _k.foto_bukti}`)} class="w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" data-v-60cc886a><div class="flex justify-center mt-3" data-v-60cc886a><a${ssrRenderAttr("href", `http://localhost:8001/storage/${(_l = unref(photoModal).claim) == null ? void 0 : _l.foto_bukti}`)} target="_blank" class="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors" data-v-60cc886a><i class="fa-solid fa-arrow-up-right-from-square" data-v-60cc886a></i>Buka di tab baru </a></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<canvas class="hidden" data-v-60cc886a></canvas>`);
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-green-800 border-green-600" : "bg-red-900 border-red-600", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm"])}" data-v-60cc886a><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-green-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-60cc886a></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/entertain/claims.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const claims = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-60cc886a"]]);

export { claims as default };
//# sourceMappingURL=claims-CqWXInML.mjs.map
