import { _ as __nuxt_component_0 } from "./nuxt-link-CFSz172Y.js";
import { _ as __nuxt_component_1 } from "./AppPagination-DUr1sfAX.js";
import { defineComponent, ref, reactive, watch, mergeProps, unref, withCtx, createVNode, createTextVNode, isRef, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderList, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrInterpolate, ssrRenderComponent, ssrRenderClass } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import { u as useAuthStore } from "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ufo/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/defu/dist/defu.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/h3/dist/index.mjs";
import "pinia";
import "vue-router";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/klona/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "approval",
  __ssrInlineRender: true,
  setup(__props) {
    const { get } = useApi();
    const fmt = useFormat();
    useAuthStore();
    const loading = ref(true);
    const saving = ref(false);
    const filterTahun = ref((/* @__PURE__ */ new Date()).getFullYear());
    const filterBulan = ref(0);
    const filterStatus = ref("Pending");
    const years = Array.from({ length: 3 }, (_, i) => (/* @__PURE__ */ new Date()).getFullYear() - i);
    const claims = ref([]);
    const summary = ref({});
    const page = ref(1);
    const perPage = ref(10);
    const totalCount = ref(0);
    const totalPages = ref(1);
    const toast = reactive({ show: false, msg: "", type: "success" });
    const detailModal = reactive({ open: false, loading: false, claim: null, approvals: [] });
    const approveModal = reactive({ open: false, action: "", catatan: "", claim: null, error: "" });
    const mapModal = reactive({ open: false, claim: null, lat: 0, lng: 0 });
    const photoModal = reactive({ open: false, claim: null });
    async function load(resetPage = false) {
      if (resetPage) page.value = 1;
      loading.value = true;
      try {
        const params = { tahun: filterTahun.value, page: page.value, per_page: perPage.value };
        if (filterBulan.value) params.bulan = filterBulan.value;
        if (filterStatus.value) params.status = filterStatus.value;
        const res = await get("/v1/entertain/claims", params);
        claims.value = res.claims || [];
        summary.value = res.summary || {};
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
      const map = {
        "Pending": "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-900/50 text-yellow-300",
        "Approved": "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-900/50 text-emerald-300",
        "Rejected": "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-900/50 text-red-400",
        "Cancelled": "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-500"
      };
      return map[s] ?? "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-800 text-gray-400";
    }
    function monthName(m) {
      return new Date(2e3, m - 1, 1).toLocaleString("id-ID", { month: "long" });
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen bg-apex-bg text-apex-text p-6" }, _attrs))} data-v-6bd9ad54><div class="flex flex-wrap items-center justify-between gap-4 mb-6" data-v-6bd9ad54><div data-v-6bd9ad54><h1 class="text-2xl font-bold text-apex-text" data-v-6bd9ad54><i class="fa-solid fa-circle-check text-emerald-400 mr-2" data-v-6bd9ad54></i>Approval Klaim Entertain </h1><p class="text-sm text-apex-muted mt-0.5" data-v-6bd9ad54>Review dan setujui pengajuan klaim dari tim sales</p></div><div class="flex items-center gap-3 flex-wrap" data-v-6bd9ad54><select class="form-select text-sm w-28" data-v-6bd9ad54><!--[-->`);
      ssrRenderList(unref(years), (y) => {
        _push(`<option${ssrRenderAttr("value", y)} data-v-6bd9ad54${ssrIncludeBooleanAttr(Array.isArray(unref(filterTahun)) ? ssrLooseContain(unref(filterTahun), y) : ssrLooseEqual(unref(filterTahun), y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select text-sm w-36" data-v-6bd9ad54><option${ssrRenderAttr("value", 0)} data-v-6bd9ad54${ssrIncludeBooleanAttr(Array.isArray(unref(filterBulan)) ? ssrLooseContain(unref(filterBulan), 0) : ssrLooseEqual(unref(filterBulan), 0)) ? " selected" : ""}>Semua Bulan</option><!--[-->`);
      ssrRenderList(12, (m) => {
        _push(`<option${ssrRenderAttr("value", m)} data-v-6bd9ad54${ssrIncludeBooleanAttr(Array.isArray(unref(filterBulan)) ? ssrLooseContain(unref(filterBulan), m) : ssrLooseEqual(unref(filterBulan), m)) ? " selected" : ""}>${ssrInterpolate(monthName(m))}</option>`);
      });
      _push(`<!--]--></select><select class="form-select text-sm w-36" data-v-6bd9ad54><option value="Pending" data-v-6bd9ad54${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "Pending") : ssrLooseEqual(unref(filterStatus), "Pending")) ? " selected" : ""}>Pending</option><option value="" data-v-6bd9ad54${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "") : ssrLooseEqual(unref(filterStatus), "")) ? " selected" : ""}>Semua Status</option><option value="Approved" data-v-6bd9ad54${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "Approved") : ssrLooseEqual(unref(filterStatus), "Approved")) ? " selected" : ""}>Approved</option><option value="Rejected" data-v-6bd9ad54${ssrIncludeBooleanAttr(Array.isArray(unref(filterStatus)) ? ssrLooseContain(unref(filterStatus), "Rejected") : ssrLooseEqual(unref(filterStatus), "Rejected")) ? " selected" : ""}>Rejected</option></select>`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/entertain",
        class: "btn-ghost flex items-center gap-2 text-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<i class="fa-solid fa-chart-bar" data-v-6bd9ad54${_scopeId}></i> Dashboard `);
          } else {
            return [
              createVNode("i", { class: "fa-solid fa-chart-bar" }),
              createTextVNode(" Dashboard ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6" data-v-6bd9ad54><div class="apex-card border-yellow-700/40" data-v-6bd9ad54><div class="text-xs text-apex-muted mb-1" data-v-6bd9ad54>Menunggu Approval</div><div class="text-3xl font-bold text-yellow-400" data-v-6bd9ad54>${ssrInterpolate(unref(summary).pending || 0)}</div><div class="text-xs text-apex-faint mt-0.5" data-v-6bd9ad54>klaim pending</div></div><div class="apex-card" data-v-6bd9ad54><div class="text-xs text-apex-muted mb-1" data-v-6bd9ad54>Total Diajukan</div><div class="text-2xl font-bold text-apex-text" data-v-6bd9ad54>${ssrInterpolate(unref(fmt).rupiah(unref(summary).total_bulan || 0))}</div><div class="text-xs text-apex-faint mt-0.5" data-v-6bd9ad54>${ssrInterpolate(unref(filterBulan) ? monthName(unref(filterBulan)) : "Tahun " + unref(filterTahun))}</div></div><div class="apex-card border-emerald-700/40" data-v-6bd9ad54><div class="text-xs text-apex-muted mb-1" data-v-6bd9ad54>Approved</div><div class="text-2xl font-bold text-emerald-400" data-v-6bd9ad54>${ssrInterpolate(unref(summary).approved || 0)}</div></div><div class="apex-card border-red-700/40" data-v-6bd9ad54><div class="text-xs text-apex-muted mb-1" data-v-6bd9ad54>Rejected</div><div class="text-2xl font-bold text-red-400" data-v-6bd9ad54>${ssrInterpolate(unref(summary).rejected || 0)}</div></div></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center py-20 text-apex-muted" data-v-6bd9ad54><i class="fa-solid fa-spinner fa-spin mr-2" data-v-6bd9ad54></i>Memuat data... </div>`);
      } else {
        _push(`<div class="apex-card overflow-x-auto" data-v-6bd9ad54><table class="w-full text-sm" data-v-6bd9ad54><thead data-v-6bd9ad54><tr class="border-b border-apex-border" data-v-6bd9ad54><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-6bd9ad54>No. Klaim</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-6bd9ad54>Sales</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-6bd9ad54>Tanggal</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-6bd9ad54>Nama Klien</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-6bd9ad54>Lokasi</th><th class="text-left py-3 px-3 text-apex-muted font-medium" data-v-6bd9ad54>Leads</th><th class="text-center py-3 px-3 text-apex-muted font-medium w-16" data-v-6bd9ad54>Foto</th><th class="text-right py-3 px-3 text-apex-muted font-medium" data-v-6bd9ad54>Jumlah</th><th class="text-center py-3 px-3 text-apex-muted font-medium" data-v-6bd9ad54>Status</th><th class="text-center py-3 px-3 text-apex-muted font-medium w-28" data-v-6bd9ad54>Aksi</th></tr></thead><tbody data-v-6bd9ad54>`);
        if (unref(claims).length === 0) {
          _push(`<tr data-v-6bd9ad54><td colspan="10" class="text-center py-12 text-apex-faint" data-v-6bd9ad54> Tidak ada klaim untuk filter ini. </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(claims), (c) => {
          _push(`<tr class="border-b border-apex-border hover:bg-apex-card/30 transition-colors" data-v-6bd9ad54><td class="py-2.5 px-3" data-v-6bd9ad54><span class="font-mono text-xs text-primary-400" data-v-6bd9ad54>${ssrInterpolate(c.claim_no)}</span>`);
          if (c.limit_warning) {
            _push(`<i class="fa-solid fa-triangle-exclamation text-yellow-400 ml-1.5 text-xs" title="Melebihi limit bulanan" data-v-6bd9ad54></i>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td class="py-2.5 px-3 font-medium text-apex-text" data-v-6bd9ad54>${ssrInterpolate(c.sales_nama)}</td><td class="py-2.5 px-3 text-apex-muted whitespace-nowrap" data-v-6bd9ad54>${ssrInterpolate(unref(fmt).tgl(c.tgl_klaim))}</td><td class="py-2.5 px-3 text-apex-text" data-v-6bd9ad54>${ssrInterpolate(c.nama_klien)}</td><td class="py-2.5 px-3" data-v-6bd9ad54>`);
          if (c.lat && c.lng) {
            _push(`<div class="flex items-center gap-1.5" data-v-6bd9ad54><span class="text-xs text-apex-muted truncate max-w-[90px]"${ssrRenderAttr("title", c.lokasi)} data-v-6bd9ad54>${ssrInterpolate(c.lokasi || `${Number(c.lat).toFixed(4)},${Number(c.lng).toFixed(4)}`)}</span><button class="text-primary-400 hover:text-primary-300 flex-shrink-0" title="Lihat peta" data-v-6bd9ad54><i class="fa-solid fa-map-location-dot text-xs" data-v-6bd9ad54></i></button></div>`);
          } else if (c.lokasi) {
            _push(`<span class="text-xs text-apex-muted" data-v-6bd9ad54>${ssrInterpolate(c.lokasi)}</span>`);
          } else {
            _push(`<span class="text-xs text-apex-faint" data-v-6bd9ad54>—</span>`);
          }
          _push(`</td><td class="py-2.5 px-3 text-xs text-apex-muted" data-v-6bd9ad54>${ssrInterpolate(c.lead_nama || "—")}</td><td class="py-2 px-3 text-center" data-v-6bd9ad54>`);
          if (c.foto_bukti) {
            _push(`<button class="block mx-auto rounded-lg overflow-hidden border border-apex-border hover:border-primary-500 transition-colors focus:outline-none" title="Lihat foto bukti" data-v-6bd9ad54><img${ssrRenderAttr("src", `http://localhost:8001/storage/${c.foto_bukti}`)} class="w-10 h-10 object-cover" data-v-6bd9ad54></button>`);
          } else {
            _push(`<span class="text-apex-faint text-xs" data-v-6bd9ad54>—</span>`);
          }
          _push(`</td><td class="py-2.5 px-3 text-right font-semibold text-apex-text" data-v-6bd9ad54>${ssrInterpolate(unref(fmt).rupiah(c.jumlah))}</td><td class="py-2.5 px-3 text-center" data-v-6bd9ad54><span class="${ssrRenderClass(statusBadge(c.status))}" data-v-6bd9ad54>${ssrInterpolate(c.status)}</span></td><td class="py-2.5 px-3 text-center" data-v-6bd9ad54><button class="text-primary-400 hover:text-primary-300 transition-colors mr-1" title="Detail" data-v-6bd9ad54><i class="fa-solid fa-eye" data-v-6bd9ad54></i></button>`);
          if (c.status === "Pending") {
            _push(`<!--[--><button class="text-emerald-400 hover:text-emerald-300 mr-1" title="Approve" data-v-6bd9ad54><i class="fa-solid fa-check" data-v-6bd9ad54></i></button><button class="text-red-400 hover:text-red-300" title="Reject" data-v-6bd9ad54><i class="fa-solid fa-xmark" data-v-6bd9ad54></i></button><!--]-->`);
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
      if (unref(detailModal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-v-6bd9ad54><div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" data-v-6bd9ad54><div class="flex items-center justify-between p-5 border-b border-apex-border" data-v-6bd9ad54><h2 class="text-lg font-semibold text-apex-text" data-v-6bd9ad54> Detail — <span class="font-mono text-primary-400" data-v-6bd9ad54>${ssrInterpolate(unref(detailModal).claim?.claim_no)}</span></h2><button class="text-apex-muted hover:text-apex-text" data-v-6bd9ad54><i class="fa-solid fa-xmark text-xl" data-v-6bd9ad54></i></button></div>`);
        if (unref(detailModal).loading) {
          _push(`<div class="flex justify-center py-10 text-apex-muted" data-v-6bd9ad54><i class="fa-solid fa-spinner fa-spin" data-v-6bd9ad54></i></div>`);
        } else if (unref(detailModal).claim) {
          _push(`<div class="p-5 space-y-4" data-v-6bd9ad54><div class="grid grid-cols-2 gap-3 text-sm" data-v-6bd9ad54><div data-v-6bd9ad54><div class="text-xs text-apex-muted" data-v-6bd9ad54>Sales</div><div class="font-medium" data-v-6bd9ad54>${ssrInterpolate(unref(detailModal).claim.sales_nama)}</div></div><div data-v-6bd9ad54><div class="text-xs text-apex-muted" data-v-6bd9ad54>Status</div><span class="${ssrRenderClass(statusBadge(unref(detailModal).claim.status))}" data-v-6bd9ad54>${ssrInterpolate(unref(detailModal).claim.status)}</span></div><div data-v-6bd9ad54><div class="text-xs text-apex-muted" data-v-6bd9ad54>Tanggal</div><div data-v-6bd9ad54>${ssrInterpolate(unref(fmt).tgl(unref(detailModal).claim.tgl_klaim))}</div></div><div data-v-6bd9ad54><div class="text-xs text-apex-muted" data-v-6bd9ad54>Jumlah</div><div class="font-bold text-base" data-v-6bd9ad54>${ssrInterpolate(unref(fmt).rupiah(unref(detailModal).claim.jumlah))}</div></div><div data-v-6bd9ad54><div class="text-xs text-apex-muted" data-v-6bd9ad54>Nama Klien</div><div data-v-6bd9ad54>${ssrInterpolate(unref(detailModal).claim.nama_klien)}</div></div><div data-v-6bd9ad54><div class="text-xs text-apex-muted" data-v-6bd9ad54>Lokasi</div><div class="flex items-center gap-1.5" data-v-6bd9ad54><span data-v-6bd9ad54>${ssrInterpolate(unref(detailModal).claim.lokasi || "—")}</span>`);
          if (unref(detailModal).claim.lat && unref(detailModal).claim.lng) {
            _push(`<button class="text-primary-400 text-xs" data-v-6bd9ad54><i class="fa-solid fa-map-location-dot" data-v-6bd9ad54></i></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="col-span-2" data-v-6bd9ad54><div class="text-xs text-apex-muted" data-v-6bd9ad54>Leads</div><div data-v-6bd9ad54>${ssrInterpolate(unref(detailModal).claim.lead_nama || "—")}</div></div><div class="col-span-2" data-v-6bd9ad54><div class="text-xs text-apex-muted" data-v-6bd9ad54>Keterangan</div><div data-v-6bd9ad54>${ssrInterpolate(unref(detailModal).claim.keterangan || "—")}</div></div></div>`);
          if (unref(detailModal).claim.foto_bukti) {
            _push(`<div data-v-6bd9ad54><div class="text-xs text-apex-muted mb-2" data-v-6bd9ad54>Bukti / Struk</div><img${ssrRenderAttr("src", `http://localhost:8001/storage/${unref(detailModal).claim.foto_bukti}`)} class="max-w-full max-h-52 rounded-xl border border-apex-border object-contain" data-v-6bd9ad54></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(detailModal).approvals.length) {
            _push(`<div data-v-6bd9ad54><div class="text-xs text-apex-muted mb-2" data-v-6bd9ad54>Riwayat Approval</div><div class="space-y-2" data-v-6bd9ad54><!--[-->`);
            ssrRenderList(unref(detailModal).approvals, (a) => {
              _push(`<div class="flex items-start gap-3 text-sm" data-v-6bd9ad54><div class="${ssrRenderClass([a.action === "Approved" ? "bg-emerald-900/50 text-emerald-400" : "bg-red-900/50 text-red-400", "w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"])}" data-v-6bd9ad54><i class="${ssrRenderClass([a.action === "Approved" ? "fa-solid fa-check" : "fa-solid fa-xmark", "text-xs"])}" data-v-6bd9ad54></i></div><div data-v-6bd9ad54><div class="font-medium" data-v-6bd9ad54>${ssrInterpolate(a.approver_nama)} <span class="${ssrRenderClass(a.action === "Approved" ? "text-emerald-400" : "text-red-400")}" data-v-6bd9ad54>${ssrInterpolate(a.action)}</span></div>`);
              if (a.catatan) {
                _push(`<div class="text-apex-muted text-xs" data-v-6bd9ad54>${ssrInterpolate(a.catatan)}</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`<div class="text-apex-faint text-xs" data-v-6bd9ad54>${ssrInterpolate(unref(fmt).tgl(a.created_at))}</div></div></div>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end gap-3 p-5 border-t border-apex-border" data-v-6bd9ad54>`);
        if (unref(detailModal).claim?.status === "Pending") {
          _push(`<button class="btn-primary" data-v-6bd9ad54><i class="fa-solid fa-check mr-1" data-v-6bd9ad54></i>Approve </button>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(detailModal).claim?.status === "Pending") {
          _push(`<button class="btn-danger" data-v-6bd9ad54><i class="fa-solid fa-xmark mr-1" data-v-6bd9ad54></i>Reject </button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<button class="btn-ghost" data-v-6bd9ad54>Tutup</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(approveModal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" data-v-6bd9ad54><div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-md shadow-2xl" data-v-6bd9ad54><div class="flex items-center justify-between p-5 border-b border-apex-border" data-v-6bd9ad54><h2 class="${ssrRenderClass([unref(approveModal).action === "Approved" ? "text-emerald-400" : "text-red-400", "text-lg font-semibold"])}" data-v-6bd9ad54><i class="${ssrRenderClass(unref(approveModal).action === "Approved" ? "fa-solid fa-check mr-2" : "fa-solid fa-xmark mr-2")}" data-v-6bd9ad54></i> ${ssrInterpolate(unref(approveModal).action === "Approved" ? "Setujui" : "Tolak")} Klaim </h2><button class="text-apex-muted hover:text-apex-text" data-v-6bd9ad54><i class="fa-solid fa-xmark text-xl" data-v-6bd9ad54></i></button></div><div class="p-5 space-y-4" data-v-6bd9ad54><div class="bg-apex-card rounded-xl p-3 text-sm" data-v-6bd9ad54><div class="font-mono text-primary-400 text-xs mb-1" data-v-6bd9ad54>${ssrInterpolate(unref(approveModal).claim?.claim_no)}</div><div class="font-medium text-apex-text" data-v-6bd9ad54>${ssrInterpolate(unref(approveModal).claim?.nama_klien)}</div><div class="text-apex-muted" data-v-6bd9ad54>${ssrInterpolate(unref(approveModal).claim?.sales_nama)} · ${ssrInterpolate(unref(fmt).rupiah(unref(approveModal).claim?.jumlah))}</div></div><div data-v-6bd9ad54><label class="form-label" data-v-6bd9ad54> Catatan `);
        if (unref(approveModal).action === "Rejected") {
          _push(`<span class="text-red-400" data-v-6bd9ad54>*</span>`);
        } else {
          _push(`<span class="text-apex-muted text-xs" data-v-6bd9ad54>(opsional)</span>`);
        }
        _push(`</label><textarea rows="3" class="form-input resize-none"${ssrRenderAttr("placeholder", unref(approveModal).action === "Rejected" ? "Alasan penolakan..." : "Catatan tambahan (opsional)")} data-v-6bd9ad54>${ssrInterpolate(unref(approveModal).catatan)}</textarea></div>`);
        if (unref(approveModal).error) {
          _push(`<div class="text-xs text-red-400" data-v-6bd9ad54><i class="fa-solid fa-circle-exclamation mr-1" data-v-6bd9ad54></i>${ssrInterpolate(unref(approveModal).error)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex justify-end gap-3 p-5 border-t border-apex-border" data-v-6bd9ad54><button class="btn-ghost" data-v-6bd9ad54>Batal</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="${ssrRenderClass(unref(approveModal).action === "Approved" ? "btn-primary" : "btn-danger")}" data-v-6bd9ad54>`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-spinner fa-spin mr-1" data-v-6bd9ad54></i>`);
        } else {
          _push(`<!---->`);
        }
        _push(` ${ssrInterpolate(unref(approveModal).action === "Approved" ? "Setujui" : "Tolak")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(mapModal).open) {
        _push(`<div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" data-v-6bd9ad54><div class="bg-apex-surface border border-apex-border rounded-2xl w-full max-w-xl shadow-2xl" data-v-6bd9ad54><div class="flex items-center justify-between p-4 border-b border-apex-border" data-v-6bd9ad54><div data-v-6bd9ad54><h2 class="text-base font-semibold text-apex-text" data-v-6bd9ad54><i class="fa-solid fa-map-location-dot text-primary-400 mr-2" data-v-6bd9ad54></i>Lokasi Klaim </h2><p class="text-xs text-apex-muted mt-0.5" data-v-6bd9ad54>${ssrInterpolate(unref(mapModal).claim?.nama_klien)} · ${ssrInterpolate(unref(fmt).tgl(unref(mapModal).claim?.tgl_klaim))}</p></div><button class="text-apex-muted hover:text-apex-text" data-v-6bd9ad54><i class="fa-solid fa-xmark text-xl" data-v-6bd9ad54></i></button></div><div class="p-4 space-y-3" data-v-6bd9ad54><div class="text-xs text-apex-muted" data-v-6bd9ad54>${ssrInterpolate(unref(mapModal).claim?.lokasi)} · <span class="font-mono" data-v-6bd9ad54>${ssrInterpolate(unref(mapModal).lat?.toFixed(6))}, ${ssrInterpolate(unref(mapModal).lng?.toFixed(6))}</span></div><div id="approval-map" class="w-full h-64 rounded-xl border border-apex-border overflow-hidden z-0" data-v-6bd9ad54></div><a${ssrRenderAttr("href", `https://www.google.com/maps?q=${unref(mapModal).lat},${unref(mapModal).lng}`)} target="_blank" class="flex items-center gap-2 text-xs text-primary-400 hover:text-primary-300" data-v-6bd9ad54><i class="fa-solid fa-arrow-up-right-from-square" data-v-6bd9ad54></i>Buka di Google Maps </a></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(photoModal).open) {
        _push(`<div class="fixed inset-0 z-[70] flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm p-4" data-v-6bd9ad54><div class="w-full max-w-2xl" data-v-6bd9ad54><div class="flex items-center justify-between mb-3 px-1" data-v-6bd9ad54><div data-v-6bd9ad54><div class="font-mono text-xs text-primary-400" data-v-6bd9ad54>${ssrInterpolate(unref(photoModal).claim?.claim_no)}</div><div class="text-sm font-medium text-white" data-v-6bd9ad54>${ssrInterpolate(unref(photoModal).claim?.nama_klien)}</div><div class="text-xs text-gray-400" data-v-6bd9ad54>${ssrInterpolate(unref(fmt).tgl(unref(photoModal).claim?.tgl_klaim))} · ${ssrInterpolate(unref(photoModal).claim?.sales_nama)}</div></div><button class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" data-v-6bd9ad54><i class="fa-solid fa-xmark text-white" data-v-6bd9ad54></i></button></div><img${ssrRenderAttr("src", `http://localhost:8001/storage/${unref(photoModal).claim?.foto_bukti}`)} class="w-full max-h-[70vh] object-contain rounded-xl shadow-2xl" data-v-6bd9ad54><div class="flex justify-center mt-3" data-v-6bd9ad54><a${ssrRenderAttr("href", `http://localhost:8001/storage/${unref(photoModal).claim?.foto_bukti}`)} target="_blank" class="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors" data-v-6bd9ad54><i class="fa-solid fa-arrow-up-right-from-square" data-v-6bd9ad54></i>Buka di tab baru </a></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-green-800 border-green-600" : "bg-red-900 border-red-600", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm"])}" data-v-6bd9ad54><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-green-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-6bd9ad54></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/entertain/approval.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const approval = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6bd9ad54"]]);
export {
  approval as default
};
//# sourceMappingURL=approval-CvQb6x2l.js.map
