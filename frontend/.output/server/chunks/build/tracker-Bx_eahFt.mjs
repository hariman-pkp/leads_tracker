import { _ as __nuxt_component_0 } from './nuxt-link-CFSz172Y.mjs';
import { _ as __nuxt_component_1 } from './AppPagination-DUr1sfAX.mjs';
import { _ as _sfc_main$1 } from './NumericInput-CpnBtvaB.mjs';
import { _ as _sfc_main$2 } from './ProductSelect-DXo4uezQ.mjs';
import { defineComponent, ref, computed, reactive, withAsyncContext, unref, withCtx, createVNode, createTextVNode, isRef, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate, ssrRenderComponent, ssrRenderClass, ssrRenderAttr, ssrRenderStyle, ssrRenderList, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
import { u as useFormat } from './useFormat-D7DNHH-1.mjs';
import { u as useAuthStore } from './server.mjs';
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
import './_plugin-vue_export-helper-1tPrXgE0.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';
import 'pinia';
import 'vue-router';
import 'perfect-debounce';

const TERMIN_PER_PAGE = 5;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "tracker",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const authStore = useAuthStore();
    const orgList = ref([]);
    const productList = ref([]);
    const isAdmin = computed(() => {
      var _a;
      return ((_a = authStore.user) == null ? void 0 : _a.role_id) === 1;
    });
    const f = reactive({
      search: "",
      organisasi: "",
      kategori: "",
      status: "",
      tahun: (/* @__PURE__ */ new Date()).getFullYear()
    });
    const page = ref(1);
    const perPage = ref(10);
    const selectedYear = computed(() => f.tahun);
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "rev-tracker",
      () => get("/v1/revenue/projects", { ...f, page: page.value, per_page: perPage.value }),
      { server: false, watch: [page, perPage] }
    )), __temp = await __temp, __restore(), __temp);
    const inv = computed(() => {
      var _a, _b;
      return (_b = (_a = data.value) == null ? void 0 : _a.inv_summary) != null ? _b : {
        total_inv: 0,
        projects_with_inv: 0,
        total_amount: 0,
        total_paid: 0,
        lunas_count: 0,
        belum_count: 0,
        outstanding: 0,
        collection_rate: 0
      };
    });
    const showNewForm = ref(false);
    const saving = ref(false);
    const newProj = reactive({
      lob: "DCSS",
      organisasi: "FSP-ECO",
      product: "",
      client: "",
      kategori: "Project",
      type: "One Time",
      target_invoice_date: "",
      tahun: (/* @__PURE__ */ new Date()).getFullYear(),
      revenue_target: 0,
      notes: ""
    });
    const editModal = reactive({
      show: false,
      project_id: "",
      client: "",
      product: "",
      organisasi: "",
      lob: "",
      kategori: "Project",
      type: "One Time",
      target_invoice_date: "",
      tahun: (/* @__PURE__ */ new Date()).getFullYear(),
      revenue_target: 0,
      status: "On Track",
      risk_level: "LOW",
      notes: ""
    });
    const deleteModal = reactive({
      show: false,
      project_id: "",
      client: "",
      product: "",
      organisasi: "",
      revenue_target: 0,
      confirm_text: ""
    });
    const deleteDeleting = ref(false);
    const showTrash = ref(false);
    const trashedList = ref([]);
    const trashedCount = ref(0);
    const trashLoading = ref(false);
    const restoring = ref(null);
    const expandedProjects = ref(/* @__PURE__ */ new Set());
    const monthlyData = ref({});
    const monthlyLoading = ref(/* @__PURE__ */ new Set());
    const terminPages = ref({});
    function terminSlice(projectId) {
      var _a, _b, _c;
      const all = (_b = (_a = monthlyData.value[projectId]) == null ? void 0 : _a.monthly) != null ? _b : [];
      const page2 = (_c = terminPages.value[projectId]) != null ? _c : 1;
      const start = (page2 - 1) * TERMIN_PER_PAGE;
      return all.slice(start, start + TERMIN_PER_PAGE);
    }
    function terminTotalPages(projectId) {
      var _a, _b, _c;
      const len = (_c = (_b = (_a = monthlyData.value[projectId]) == null ? void 0 : _a.monthly) == null ? void 0 : _b.length) != null ? _c : 0;
      return Math.ceil(len / TERMIN_PER_PAGE) || 1;
    }
    function setTerminPage(projectId, p) {
      terminPages.value = { ...terminPages.value, [projectId]: p };
    }
    const terminModal = reactive({
      show: false,
      id: 0,
      project_id: "",
      label: "",
      month_name: "",
      target: 0,
      actual: 0,
      status: "Pending"
    });
    const terminSaving = ref(false);
    const addTerminModal = reactive({
      show: false,
      project_id: "",
      type: "",
      month_num: 1,
      target: 0,
      actual: 0
    });
    const monthOptions = [
      { num: 1, name: "Januari" },
      { num: 2, name: "Februari" },
      { num: 3, name: "Maret" },
      { num: 4, name: "April" },
      { num: 5, name: "Mei" },
      { num: 6, name: "Juni" },
      { num: 7, name: "Juli" },
      { num: 8, name: "Agustus" },
      { num: 9, name: "September" },
      { num: 10, name: "Oktober" },
      { num: 11, name: "November" },
      { num: 12, name: "Desember" }
    ];
    function terminStatusBadge(status) {
      var _a;
      const map = {
        "Achieve": "badge-green",
        "Not Achieve": "badge-red",
        "Pending": "badge-yellow"
      };
      return (_a = map[status]) != null ? _a : "badge-gray";
    }
    function typeBadge(type) {
      var _a;
      const map = {
        "One Time": "badge-gray",
        "Termin": "badge-yellow",
        "Bulanan": "badge-blue",
        "Tahunan": "badge-purple"
      };
      return (_a = map[type]) != null ? _a : "badge-gray";
    }
    function invoicePeriodBadge(status) {
      var _a;
      const map = {
        "Tepat Waktu": "badge-green",
        "Terlambat": "badge-red",
        "Belum Jatuh Tempo": "badge-yellow"
      };
      return (_a = map[status]) != null ? _a : "badge-gray";
    }
    const showImportModal = ref(false);
    const importTab = ref("pending");
    const wonLeads = ref([]);
    const wonPending = ref(0);
    const selectedLeads = ref(/* @__PURE__ */ new Set());
    const leadForms = ref({});
    const importSaving = ref(false);
    const importResult = ref(null);
    const filteredWonLeads = computed(
      () => importTab.value === "pending" ? wonLeads.value.filter((l) => !l.is_imported) : wonLeads.value.filter((l) => l.is_imported)
    );
    const allPendingSelected = computed(() => {
      const pending2 = wonLeads.value.filter((l) => !l.is_imported);
      return pending2.length > 0 && pending2.every((l) => selectedLeads.value.has(l.lead_id));
    });
    return (_ctx, _push, _parent, _attrs) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      const _component_NumericInput = _sfc_main$1;
      const _component_ProductSelect = _sfc_main$2;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-tasks text-primary-400 mr-2"></i>Revenue Tracker</h1><p class="page-subtitle">${ssrInterpolate((_a = unref(data)) == null ? void 0 : _a.total_projects)} proyek \xB7 ${ssrInterpolate(unref(selectedYear))}</p></div><div class="flex gap-2 flex-wrap">`);
      _push(ssrRenderComponent(_component_NuxtLink, {
        to: "/revenue/invoice",
        class: "btn-secondary btn-sm"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<i class="fa-solid fa-file-invoice"${_scopeId}></i>Invoice &amp; Payment `);
          } else {
            return [
              createVNode("i", { class: "fa-solid fa-file-invoice" }),
              createTextVNode("Invoice & Payment ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`<button class="btn-secondary btn-sm relative"><i class="fa-solid fa-trophy text-yellow-400"></i>Import Pipeline Won `);
      if (unref(wonPending) > 0) {
        _push(`<span class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center justify-center leading-none">${ssrInterpolate(unref(wonPending))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button>`);
      if (unref(isAdmin)) {
        _push(`<button class="btn-secondary btn-sm relative"><i class="fa-solid fa-trash-can text-red-400"></i>Recycle Bin `);
        if (unref(trashedCount) > 0) {
          _push(`<span class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center leading-none">${ssrInterpolate(unref(trashedCount))}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<button class="btn-primary btn-sm"><i class="fa-solid fa-plus"></i>Tambah Proyek </button></div></div>`);
      if (unref(data)) {
        _push(`<div class="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-3 mb-5"><div class="stat-card col-span-2 md:col-span-1 xl:col-span-1"><div class="stat-icon bg-blue-900/40 text-blue-400"><i class="fa-solid fa-bullseye"></i></div><div><div class="stat-value text-xs">${ssrInterpolate(unref(fmt).rupiah(unref(data).total_target))}</div><div class="stat-label">Total Target</div></div></div><div class="stat-card"><div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-coins"></i></div><div><div class="stat-value text-xs text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(data).total_actual))}</div><div class="stat-label">Realisasi</div></div></div><div class="stat-card"><div class="stat-icon bg-primary-900/40 text-primary-400"><i class="fa-solid fa-percent"></i></div><div><div class="${ssrRenderClass([unref(data).ach_pct >= 80 ? "text-emerald-400" : unref(data).ach_pct >= 50 ? "text-yellow-400" : "text-red-400", "stat-value"])}">${ssrInterpolate(unref(data).ach_pct)}% </div><div class="stat-label">Achievement</div></div></div><div class="hidden xl:flex items-center justify-center"><div class="w-px h-8 bg-navy-700"></div></div><div class="stat-card"><div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-file-invoice-dollar"></i></div><div><div class="stat-value text-xs text-purple-300">${ssrInterpolate(unref(fmt).rupiah(unref(inv).total_amount))}</div><div class="stat-label">Total Invoiced</div><div class="text-xs text-gray-600 mt-0.5">${ssrInterpolate(unref(inv).total_inv)} invoice</div></div></div><div class="stat-card"><div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-circle-check"></i></div><div><div class="stat-value text-xs text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(inv).total_paid))}</div><div class="stat-label">Sudah Dibayar</div><div class="text-xs text-gray-600 mt-0.5">${ssrInterpolate(unref(inv).lunas_count)} lunas</div></div></div><div class="${ssrRenderClass([unref(inv).outstanding > 0 ? "border border-orange-800/40" : "", "stat-card"])}"><div class="${ssrRenderClass([unref(inv).outstanding > 0 ? "bg-orange-900/40 text-orange-400" : "bg-gray-800 text-gray-500", "stat-icon"])}"><i class="fa-solid fa-hourglass-half"></i></div><div><div class="${ssrRenderClass([unref(inv).outstanding > 0 ? "text-orange-400" : "text-gray-400", "stat-value text-xs"])}">${ssrInterpolate(unref(fmt).rupiah(unref(inv).outstanding))}</div><div class="stat-label">Outstanding</div><div class="${ssrRenderClass([unref(inv).outstanding > 0 ? "text-orange-500/70" : "text-gray-600", "text-xs mt-0.5"])}">${ssrInterpolate(unref(inv).belum_count)} belum lunas </div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(data)) {
        _push(`<div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5"><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-hand-holding-dollar mr-1.5 text-emerald-400"></i>Collection Rate </div><div class="flex items-center gap-4"><div class="relative w-20 h-20 flex-shrink-0"><svg class="w-full h-full -rotate-90" viewBox="0 0 80 80"><circle cx="40" cy="40" r="30" fill="none" stroke="#1e293b" stroke-width="10"></circle><circle cx="40" cy="40" r="30" fill="none"${ssrRenderAttr("stroke", unref(inv).collection_rate >= 90 ? "#34d399" : unref(inv).collection_rate >= 70 ? "#facc15" : "#f87171")} stroke-width="10" stroke-linecap="round"${ssrRenderAttr("stroke-dasharray", `${unref(inv).collection_rate * 1.885} 188.5`)} style="${ssrRenderStyle({ "transition": "stroke-dasharray 0.8s ease" })}"></circle></svg><div class="absolute inset-0 flex items-center justify-center"><span class="text-lg font-bold text-white">${ssrInterpolate(unref(inv).collection_rate)}%</span></div></div><div class="flex-1 space-y-2"><div class="flex justify-between text-xs"><span class="text-gray-500">Invoiced</span><span class="text-gray-200 font-medium">${ssrInterpolate(unref(fmt).rupiah(unref(inv).total_amount))}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Terkumpul</span><span class="text-emerald-400 font-medium">${ssrInterpolate(unref(fmt).rupiah(unref(inv).total_paid))}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Sisa Tagih</span><span class="${ssrRenderClass([unref(inv).outstanding > 0 ? "text-orange-400" : "text-gray-500", "font-medium"])}">${ssrInterpolate(unref(fmt).rupiah(unref(inv).outstanding))}</span></div><div class="h-px bg-navy-700"></div><div class="flex justify-between text-xs"><span class="text-gray-500">Proyek dg invoice</span><span class="text-gray-300">${ssrInterpolate(unref(inv).projects_with_inv)} dari ${ssrInterpolate(unref(data).total_projects)}</span></div></div></div>`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/revenue/invoice",
          class: "mt-4 flex items-center justify-between px-3 py-2 rounded-lg bg-primary-900/20 border border-primary-800/40 hover:bg-primary-900/40 transition-colors group"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<span class="text-xs text-primary-300"${_scopeId}>Kelola Invoice &amp; Payment</span><i class="fa-solid fa-arrow-right text-xs text-primary-400 group-hover:translate-x-0.5 transition-transform"${_scopeId}></i>`);
            } else {
              return [
                createVNode("span", { class: "text-xs text-primary-300" }, "Kelola Invoice & Payment"),
                createVNode("i", { class: "fa-solid fa-arrow-right text-xs text-primary-400 group-hover:translate-x-0.5 transition-transform" })
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-chart-pie mr-1.5 text-primary-400"></i>Status Invoice </div><div class="flex h-6 rounded-lg overflow-hidden mb-3 bg-navy-800"><div class="bg-emerald-500 flex items-center justify-center transition-all duration-700" style="${ssrRenderStyle(`width:${unref(inv).total_inv ? unref(inv).lunas_count / unref(inv).total_inv * 100 : 0}%`)}">`);
        if (unref(inv).lunas_count / unref(inv).total_inv * 100 > 15) {
          _push(`<span class="text-xs font-bold text-white">${ssrInterpolate(unref(inv).lunas_count)} Lunas </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="bg-orange-500 flex items-center justify-center transition-all duration-700" style="${ssrRenderStyle(`width:${unref(inv).total_inv ? unref(inv).belum_count / unref(inv).total_inv * 100 : 0}%`)}">`);
        if (unref(inv).belum_count / unref(inv).total_inv * 100 > 15) {
          _push(`<span class="text-xs font-bold text-white">${ssrInterpolate(unref(inv).belum_count)} Belum </span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="space-y-2.5"><div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></div><div class="flex-1"><div class="flex justify-between text-xs mb-0.5"><span class="text-gray-300">Lunas</span><span class="font-semibold text-emerald-400">${ssrInterpolate(unref(inv).lunas_count)} invoice</span></div></div></div><div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full bg-orange-500 flex-shrink-0"></div><div class="flex-1"><div class="flex justify-between text-xs mb-0.5"><span class="text-gray-300">Belum / Partial</span><span class="font-semibold text-orange-400">${ssrInterpolate(unref(inv).belum_count)} invoice</span></div><div class="text-xs text-gray-500">Nilai: ${ssrInterpolate(unref(fmt).rupiah(unref(inv).outstanding))}</div></div></div></div>`);
        if (unref(inv).belum_count > 0) {
          _push(`<div class="mt-3 p-2.5 rounded-lg bg-orange-900/10 border border-orange-900/30"><div class="text-xs text-orange-300"><i class="fa-solid fa-triangle-exclamation mr-1"></i> ${ssrInterpolate(unref(inv).belum_count)} invoice belum lunas senilai ${ssrInterpolate(unref(fmt).rupiah(unref(inv).outstanding))} perlu ditagih. </div></div>`);
        } else {
          _push(`<div class="mt-3 p-2.5 rounded-lg bg-emerald-900/10 border border-emerald-900/30"><div class="text-xs text-emerald-300"><i class="fa-solid fa-circle-check mr-1"></i>Semua invoice sudah lunas! </div></div>`);
        }
        _push(`</div><div class="card"><div class="section-title mb-3"><i class="fa-solid fa-clock mr-1.5 text-orange-400"></i>Invoice Belum Lunas `);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/revenue/invoice?status=Belum",
          class: "ml-auto text-xs text-primary-400 hover:text-primary-300 font-normal"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Lihat Semua \u2192 `);
            } else {
              return [
                createTextVNode(" Lihat Semua \u2192 ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div>`);
        if ((_b = unref(data).unpaid_invoices) == null ? void 0 : _b.length) {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(data).unpaid_invoices, (inv2) => {
            _push(`<div class="flex items-center gap-2 p-2 rounded-lg bg-orange-900/10 border border-orange-900/20 hover:border-orange-700/40 transition-colors"><div class="flex-1 min-w-0"><div class="text-xs font-medium text-gray-200 truncate">${ssrInterpolate(inv2.client)}</div><div class="text-xs text-gray-500">${ssrInterpolate(inv2.invoice_no || inv2.project_id)} \xB7 ${ssrInterpolate(inv2.period)}</div></div><div class="text-right flex-shrink-0"><div class="text-xs font-semibold text-orange-400">${ssrInterpolate(unref(fmt).rupiah(inv2.outstanding))}</div><div class="text-xs text-gray-600">${ssrInterpolate(unref(fmt).tgl(inv2.invoice_date))}</div></div></div>`);
          });
          _push(`<!--]--></div>`);
        } else {
          _push(`<div class="text-center py-6"><i class="fa-solid fa-circle-check text-emerald-400 text-2xl mb-2 block"></i><div class="text-xs text-gray-500">Tidak ada invoice outstanding</div></div>`);
        }
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/revenue/invoice",
          class: "mt-3 btn-secondary btn-sm w-full justify-center text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<i class="fa-solid fa-file-invoice"${_scopeId}></i>Kelola Semua Invoice `);
            } else {
              return [
                createVNode("i", { class: "fa-solid fa-file-invoice" }),
                createTextVNode("Kelola Semua Invoice ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="card mb-4"><div class="flex flex-wrap gap-3"><input${ssrRenderAttr("value", unref(f).search)} class="form-input w-48" placeholder="\u{1F50D} Cari produk/client..."><select class="form-select w-32"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(f).organisasi) ? ssrLooseContain(unref(f).organisasi, "") : ssrLooseEqual(unref(f).organisasi, "")) ? " selected" : ""}>Semua Organisasi</option><!--[-->`);
      ssrRenderList(((_c = unref(data)) == null ? void 0 : _c.owners) || [], (o) => {
        _push(`<option${ssrIncludeBooleanAttr(Array.isArray(unref(f).organisasi) ? ssrLooseContain(unref(f).organisasi, null) : ssrLooseEqual(unref(f).organisasi, null)) ? " selected" : ""}>${ssrInterpolate(o)}</option>`);
      });
      _push(`<!--]--></select><select class="form-select w-32"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(f).kategori) ? ssrLooseContain(unref(f).kategori, "") : ssrLooseEqual(unref(f).kategori, "")) ? " selected" : ""}>Semua Kategori</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(f).kategori) ? ssrLooseContain(unref(f).kategori, null) : ssrLooseEqual(unref(f).kategori, null)) ? " selected" : ""}>Project</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(f).kategori) ? ssrLooseContain(unref(f).kategori, null) : ssrLooseEqual(unref(f).kategori, null)) ? " selected" : ""}>Recurring</option></select><select class="form-select w-32"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, "") : ssrLooseEqual(unref(f).status, "")) ? " selected" : ""}>Semua Status</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, null) : ssrLooseEqual(unref(f).status, null)) ? " selected" : ""}>On Track</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, null) : ssrLooseEqual(unref(f).status, null)) ? " selected" : ""}>At Risk</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, null) : ssrLooseEqual(unref(f).status, null)) ? " selected" : ""}>Critical</option></select><select class="form-select w-24"><!--[-->`);
      ssrRenderList(((_d = unref(data)) == null ? void 0 : _d.years) || [], (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(f).tahun) ? ssrLooseContain(unref(f).tahun, y) : ssrLooseEqual(unref(f).tahun, y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select><button class="btn-secondary btn-sm ml-auto"><i class="fa-solid fa-xmark"></i>Reset </button></div></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-16"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else {
        _push(`<div class="card overflow-x-auto"><table class="tbl"><thead><tr><th>Project</th><th>Client</th><th>Organisasi</th><th>Kategori</th><th>Type</th><th>Target Invoice</th><th class="text-right">Target</th><th class="text-right">Realisasi</th><th>Ach. %</th><th>Status</th><th>Risk</th><th class="text-center">Invoice</th><th class="text-center w-14">Aksi</th></tr></thead><tbody><!--[-->`);
        ssrRenderList((_e = unref(data)) == null ? void 0 : _e.projects, (p) => {
          var _a2;
          _push(`<!--[--><tr class="${ssrRenderClass(unref(expandedProjects).has(p.project_id) ? "bg-navy-800/60" : "")}"><td><div class="text-xs font-medium text-gray-200">${ssrInterpolate(p.project_id)}</div><div class="text-xs text-gray-500 max-w-32 truncate">${ssrInterpolate(p.product)}</div></td><td class="text-xs text-gray-300 max-w-36 truncate">${ssrInterpolate(p.client)}</td><td class="text-xs text-gray-400">${ssrInterpolate(p.organisasi)}</td><td><span class="${ssrRenderClass(p.kategori === "Project" ? "badge-blue" : "badge-purple")}">${ssrInterpolate(p.kategori)}</span></td><td><div class="flex flex-col items-start gap-1">`);
          if (p.type) {
            _push(`<span class="${ssrRenderClass(typeBadge(p.type))}">${ssrInterpolate(p.type)}</span>`);
          } else {
            _push(`<span class="text-xs text-gray-600">\u2014</span>`);
          }
          if (p.type === "Termin" || p.type === "Bulanan") {
            _push(`<button class="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors"><i class="${ssrRenderClass([unref(expandedProjects).has(p.project_id) ? "fa-chevron-up" : "fa-chevron-down", "fa-solid text-xs"])}"></i><span>${ssrInterpolate(unref(expandedProjects).has(p.project_id) ? "Tutup" : "Lihat Termin")}</span></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td><td class="min-w-[130px]">`);
          if (p.target_period_label) {
            _push(`<div class="text-xs space-y-0.5"><div class="text-gray-400"> Target: <span class="text-gray-200 font-medium">${ssrInterpolate(p.target_period_label)}</span></div>`);
            if (p.actual_period_label) {
              _push(`<div class="text-gray-500"> Terbit: <span class="text-emerald-400">${ssrInterpolate(p.actual_period_label)}</span></div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`<span class="${ssrRenderClass(invoicePeriodBadge(p.invoice_period_status))}">${ssrInterpolate(p.invoice_period_status)}</span></div>`);
          } else {
            _push(`<span class="text-xs text-gray-600">\u2014</span>`);
          }
          _push(`</td><td class="text-right text-xs text-gray-300">${ssrInterpolate(unref(fmt).rupiah(p.revenue_target))}</td><td class="text-right text-xs text-emerald-300 font-medium">${ssrInterpolate(unref(fmt).rupiah(p.invoice_actual))}</td><td class="w-28"><div class="flex items-center gap-1.5"><div class="flex-1 h-1.5 bg-navy-700 rounded overflow-hidden"><div class="${ssrRenderClass([unref(fmt).achBgColor(p.is_ytd ? p.ytd_ach_pct : p.achievement_pct * 100), "h-full rounded transition-all"])}" style="${ssrRenderStyle(`width:${Math.min(p.is_ytd ? p.ytd_ach_pct : p.achievement_pct * 100, 100)}%`)}"></div></div><span class="${ssrRenderClass([unref(fmt).achColor(p.is_ytd ? p.ytd_ach_pct : p.achievement_pct * 100), "text-xs w-9 text-right flex-shrink-0"])}">${ssrInterpolate((p.is_ytd ? p.ytd_ach_pct : p.achievement_pct * 100).toFixed(0))}% </span></div>`);
          if (p.is_ytd) {
            _push(`<div class="text-xs text-gray-600 mt-0.5 leading-tight"> YTD bln ${ssrInterpolate(p.cur_month)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td><span class="${ssrRenderClass(unref(fmt).statusClass(p.status))}">${ssrInterpolate(p.status)}</span></td><td><span class="${ssrRenderClass(unref(fmt).riskClass(p.risk_level))}">${ssrInterpolate(p.risk_level)}</span></td><td class="text-center">`);
          if (p.inv) {
            _push(`<div class="flex flex-col items-center gap-0.5"><div class="flex items-center gap-1"><span class="${ssrRenderClass([p.inv.belum_count > 0 ? "text-orange-400" : "text-emerald-400", "text-xs font-semibold"])}">${ssrInterpolate(p.inv.total_inv)}</span><span class="text-xs text-gray-600">inv</span></div><div class="${ssrRenderClass([p.inv.outstanding > 0 ? "text-orange-400" : "text-emerald-400", "text-xs"])}">${ssrInterpolate(p.inv.outstanding > 0 ? unref(fmt).rupiah(p.inv.outstanding) + " sisa" : "\u2713 Lunas")}</div>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/revenue/invoice?project=${p.project_id}`,
              class: "text-xs text-primary-400 hover:text-primary-300 mt-0.5"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` Detail \u2192 `);
                } else {
                  return [
                    createTextVNode(" Detail \u2192 ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div>`);
          } else {
            _push(`<div class="flex flex-col items-center gap-1"><span class="text-xs text-gray-600">\u2014</span>`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/revenue/invoice`,
              class: "text-xs text-gray-500 hover:text-primary-400"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(` + Invoice `);
                } else {
                  return [
                    createTextVNode(" + Invoice ")
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</div>`);
          }
          _push(`</td><td class="text-center"><div class="flex items-center justify-center gap-1"><button class="btn-ghost btn-xs text-gray-400 hover:text-primary-400" title="Edit proyek"><i class="fa-solid fa-pen text-xs"></i></button>`);
          if (unref(isAdmin)) {
            _push(`<button class="btn-ghost btn-xs text-gray-600 hover:text-red-400" title="Hapus proyek (Admin)"><i class="fa-solid fa-trash text-xs"></i></button>`);
          } else {
            _push(`<span class="inline-flex items-center justify-center w-6 h-6 text-gray-700 cursor-not-allowed" title="Hanya Admin yang dapat menghapus proyek"><i class="fa-solid fa-lock text-xs"></i></span>`);
          }
          _push(`</div></td></tr>`);
          if (unref(expandedProjects).has(p.project_id)) {
            _push(`<tr class="bg-navy-900/80"><td colspan="13" class="p-0"><div class="mx-4 my-3">`);
            if (unref(monthlyLoading).has(p.project_id)) {
              _push(`<div class="flex items-center gap-2 py-4 justify-center"><i class="fa-solid fa-circle-notch fa-spin text-primary-400"></i><span class="text-xs text-gray-500">Memuat data termin...</span></div>`);
            } else if (unref(monthlyData)[p.project_id]) {
              _push(`<div class="rounded-xl border border-navy-700 overflow-hidden"><div class="flex items-center justify-between px-4 py-2.5 bg-navy-800 border-b border-navy-700"><div class="flex items-center gap-3"><span class="text-xs font-semibold text-white"><i class="fa-solid fa-layer-group mr-1.5 text-primary-400"></i> Rincian ${ssrInterpolate(p.type === "Termin" ? "Termin" : "Bulanan")} \u2014 ${ssrInterpolate(p.project_id)}</span><span class="badge-gray text-xs">${ssrInterpolate(unref(monthlyData)[p.project_id].monthly.length)} ${ssrInterpolate(p.type === "Termin" ? "termin" : "bulan")}</span></div><div class="flex items-center gap-4 text-xs"><span class="text-gray-500"> Total Target: <span class="text-gray-200 font-medium">${ssrInterpolate(unref(fmt).rupiah(unref(monthlyData)[p.project_id].total_target))}</span></span><span class="text-gray-500"> Realisasi: <span class="text-emerald-400 font-medium">${ssrInterpolate(unref(fmt).rupiah(unref(monthlyData)[p.project_id].total_actual))}</span></span><button class="btn-primary btn-xs text-xs"><i class="fa-solid fa-plus"></i>Tambah ${ssrInterpolate(p.type === "Termin" ? "Termin" : "Bulan")}</button></div></div><table class="w-full text-xs"><thead class="bg-navy-800/60"><tr><th class="px-3 py-2 text-left text-gray-500 font-medium w-16">${ssrInterpolate(p.type === "Termin" ? "Termin" : "Bln")}</th><th class="px-3 py-2 text-left text-gray-500 font-medium">Bulan</th><th class="px-3 py-2 text-right text-gray-500 font-medium">Target Revenue</th><th class="px-3 py-2 text-right text-gray-500 font-medium">Realisasi</th><th class="px-3 py-2 text-center text-gray-500 font-medium w-28">Achievement</th><th class="px-3 py-2 text-center text-gray-500 font-medium w-24">Status</th><th class="px-3 py-2 text-center text-gray-500 font-medium w-14">Aksi</th></tr></thead><tbody class="divide-y divide-navy-800"><!--[-->`);
              ssrRenderList(terminSlice(p.project_id), (m) => {
                _push(`<tr class="hover:bg-navy-800/40 transition-colors"><td class="px-3 py-2"><span class="font-semibold text-primary-300">${ssrInterpolate(p.type === "Termin" ? m.termin_no : m.month_num)}</span></td><td class="px-3 py-2 text-gray-300">${ssrInterpolate(m.month_name)}</td><td class="px-3 py-2 text-right text-gray-300 font-medium">${ssrInterpolate(unref(fmt).rupiah(m.target))}</td><td class="${ssrRenderClass([m.actual > 0 ? "text-emerald-400" : "text-gray-600", "px-3 py-2 text-right font-semibold"])}">${ssrInterpolate(m.actual > 0 ? unref(fmt).rupiah(m.actual) : "\u2014")}</td><td class="px-3 py-2"><div class="flex items-center gap-1.5"><div class="flex-1 h-1.5 bg-navy-700 rounded overflow-hidden"><div class="${ssrRenderClass([unref(fmt).achBgColor(m.ach_pct), "h-full rounded transition-all"])}" style="${ssrRenderStyle(`width:${Math.min(m.ach_pct, 100)}%`)}"></div></div><span class="text-gray-400 w-8 text-right">${ssrInterpolate(m.ach_pct)}%</span></div></td><td class="px-3 py-2 text-center"><span class="${ssrRenderClass(terminStatusBadge(m.status))}">${ssrInterpolate(m.status)}</span></td><td class="px-3 py-2 text-center"><button class="btn-ghost btn-xs text-gray-500 hover:text-primary-400"><i class="fa-solid fa-pen text-xs"></i></button></td></tr>`);
              });
              _push(`<!--]--><tr class="bg-navy-800/80 font-semibold"><td colspan="2" class="px-3 py-2 text-gray-400 text-xs">Total</td><td class="px-3 py-2 text-right text-gray-200">${ssrInterpolate(unref(fmt).rupiah(unref(monthlyData)[p.project_id].total_target))}</td><td class="px-3 py-2 text-right text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(monthlyData)[p.project_id].total_actual))}</td><td class="px-3 py-2"><div class="flex items-center gap-1.5"><div class="flex-1 h-1.5 bg-navy-700 rounded overflow-hidden"><div class="${ssrRenderClass([unref(fmt).achBgColor(unref(monthlyData)[p.project_id].total_target > 0 ? unref(monthlyData)[p.project_id].total_actual / unref(monthlyData)[p.project_id].total_target * 100 : 0), "h-full rounded"])}" style="${ssrRenderStyle(`width:${Math.min(unref(monthlyData)[p.project_id].total_target > 0 ? unref(monthlyData)[p.project_id].total_actual / unref(monthlyData)[p.project_id].total_target * 100 : 0, 100)}%`)}"></div></div><span class="text-gray-300 w-8 text-right">${ssrInterpolate(unref(monthlyData)[p.project_id].total_target > 0 ? (unref(monthlyData)[p.project_id].total_actual / unref(monthlyData)[p.project_id].total_target * 100).toFixed(0) : 0)}% </span></div></td><td colspan="2"></td></tr></tbody></table>`);
              if (terminTotalPages(p.project_id) > 1) {
                _push(`<div class="px-4 py-2 border-t border-navy-700">`);
                _push(ssrRenderComponent(_component_AppPagination, {
                  page: (_a2 = unref(terminPages)[p.project_id]) != null ? _a2 : 1,
                  "total-pages": terminTotalPages(p.project_id),
                  total: unref(monthlyData)[p.project_id].monthly.length,
                  "per-page": TERMIN_PER_PAGE,
                  "onUpdate:page": ($event) => setTerminPage(p.project_id, $event)
                }, null, _parent));
                _push(`</div>`);
              } else {
                _push(`<!---->`);
              }
              _push(`</div>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></td></tr>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        });
        _push(`<!--]-->`);
        if (!((_g = (_f = unref(data)) == null ? void 0 : _f.projects) == null ? void 0 : _g.length)) {
          _push(`<tr><td colspan="13" class="py-8 text-center text-gray-600">Tidak ada proyek ditemukan</td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table>`);
        _push(ssrRenderComponent(_component_AppPagination, {
          page: unref(page),
          "onUpdate:page": ($event) => isRef(page) ? page.value = $event : null,
          "per-page": unref(perPage),
          "onUpdate:perPage": ($event) => isRef(perPage) ? perPage.value = $event : null,
          total: (_i = (_h = unref(data)) == null ? void 0 : _h.total) != null ? _i : 0,
          "total-pages": (_k = (_j = unref(data)) == null ? void 0 : _j.total_pages) != null ? _k : 1,
          "per-page-options": [10, 25, 50]
        }, null, _parent));
        _push(`</div>`);
      }
      if (unref(deleteModal).show) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-red-900/50 rounded-xl w-full max-w-md shadow-2xl"><div class="flex items-center gap-3 p-5 border-b border-navy-800"><div class="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-triangle-exclamation text-red-400"></i></div><div><h3 class="font-semibold text-white">Hapus Proyek</h3><p class="text-xs text-gray-500 mt-0.5">Tindakan ini tidak dapat dibatalkan</p></div></div><div class="p-5 space-y-4"><div class="p-3 rounded-lg bg-navy-800 border border-navy-700 space-y-1.5"><div class="flex justify-between text-xs"><span class="text-gray-500">Project ID</span><span class="text-gray-200 font-medium">${ssrInterpolate(unref(deleteModal).project_id)}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Client</span><span class="text-gray-300">${ssrInterpolate(unref(deleteModal).client)}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Produk</span><span class="text-gray-300">${ssrInterpolate(unref(deleteModal).product)}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Organisasi</span><span class="text-gray-300">${ssrInterpolate(unref(deleteModal).organisasi)}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Target Revenue</span><span class="text-yellow-400 font-medium">${ssrInterpolate(unref(fmt).rupiah(unref(deleteModal).revenue_target))}</span></div></div><div class="p-3 rounded-lg bg-red-900/10 border border-red-900/30"><div class="text-xs text-red-300 space-y-1"><div class="font-medium mb-1.5"><i class="fa-solid fa-triangle-exclamation mr-1"></i>Data berikut akan ikut terhapus: </div><div class="flex items-center gap-2"><i class="fa-solid fa-circle text-red-600" style="${ssrRenderStyle({ "font-size": "5px" })}"></i><span>Semua data monthly monitoring proyek ini</span></div><div class="flex items-center gap-2"><i class="fa-solid fa-circle text-red-600" style="${ssrRenderStyle({ "font-size": "5px" })}"></i><span>Semua invoice &amp; data pembayaran proyek ini</span></div></div></div><div><label class="form-label text-red-400"> Ketik <span class="font-mono font-bold">${ssrInterpolate(unref(deleteModal).project_id)}</span> untuk konfirmasi </label><input${ssrRenderAttr("value", unref(deleteModal).confirm_text)} class="form-input border-red-900/50 focus:border-red-600"${ssrRenderAttr("placeholder", unref(deleteModal).project_id)} autocomplete="off"></div></div><div class="flex gap-2 justify-end p-5 border-t border-navy-800"><button class="btn-secondary"${ssrIncludeBooleanAttr(unref(deleteDeleting)) ? " disabled" : ""}>Batal</button><button class="btn-danger"${ssrIncludeBooleanAttr(unref(deleteModal).confirm_text !== unref(deleteModal).project_id || unref(deleteDeleting)) ? " disabled" : ""}>`);
        if (unref(deleteDeleting)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<i class="fa-solid fa-trash"></i>`);
        }
        _push(` Hapus Permanen </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showTrash)) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-3xl shadow-2xl my-4"><div class="flex items-center justify-between p-5 border-b border-navy-800"><div><h3 class="font-semibold text-white flex items-center gap-2"><i class="fa-solid fa-trash-can text-red-400"></i>Recycle Bin </h3><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(trashedList).length)} proyek dihapus \xB7 Data masih tersimpan dan dapat dipulihkan </p></div><button class="btn-ghost btn-xs"><i class="fa-solid fa-xmark"></i></button></div><div class="p-5">`);
        if (unref(trashLoading)) {
          _push(`<div class="flex justify-center py-8"><i class="fa-solid fa-circle-notch fa-spin text-2xl text-primary-400"></i></div>`);
        } else if (unref(trashedList).length === 0) {
          _push(`<div class="text-center py-10"><i class="fa-solid fa-check-circle text-emerald-400 text-3xl mb-3 block"></i><p class="text-sm text-gray-400">Recycle Bin kosong</p><p class="text-xs text-gray-600 mt-1">Tidak ada proyek yang dihapus</p></div>`);
        } else {
          _push(`<div class="space-y-2"><!--[-->`);
          ssrRenderList(unref(trashedList), (t) => {
            _push(`<div class="flex items-center gap-3 p-3 rounded-lg border border-navy-700 bg-navy-800/40 hover:border-navy-600 transition-colors"><div class="flex-1 min-w-0"><div class="flex items-center gap-2 flex-wrap"><span class="text-xs font-semibold text-gray-300">${ssrInterpolate(t.project_id)}</span><span class="${ssrRenderClass(t.kategori === "Project" ? "badge-blue" : "badge-purple")}">${ssrInterpolate(t.kategori)}</span>`);
            if (t.type) {
              _push(`<span class="badge-gray">${ssrInterpolate(t.type)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-xs text-gray-200 mt-0.5">${ssrInterpolate(t.client)}</div><div class="text-xs text-gray-500">${ssrInterpolate(t.product)} \xB7 ${ssrInterpolate(t.organisasi)}</div><div class="flex items-center gap-3 mt-1 text-xs text-gray-600"><span>Target: <span class="text-gray-400">${ssrInterpolate(unref(fmt).rupiah(t.revenue_target))}</span></span><span>Dihapus: <span class="text-red-400">${ssrInterpolate(unref(fmt).tgl(t.deleted_at))}</span></span></div></div><button${ssrIncludeBooleanAttr(unref(restoring) === t.project_id) ? " disabled" : ""} class="btn-secondary btn-sm flex-shrink-0 text-xs hover:border-emerald-700 hover:text-emerald-400">`);
            if (unref(restoring) === t.project_id) {
              _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
            } else {
              _push(`<i class="fa-solid fa-rotate-left text-emerald-400"></i>`);
            }
            _push(` Pulihkan </button></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div><div class="p-4 border-t border-navy-800 flex justify-end"><button class="btn-secondary">Tutup</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(terminModal).show) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-md shadow-2xl"><div class="flex items-center justify-between p-5 border-b border-navy-800"><div><h3 class="font-semibold text-white">Edit ${ssrInterpolate(unref(terminModal).label)}</h3><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(terminModal).project_id)} \xB7 ${ssrInterpolate(unref(terminModal).month_name)}</p></div><button class="btn-ghost btn-xs"><i class="fa-solid fa-xmark"></i></button></div><form class="p-5 space-y-4"><div class="grid grid-cols-2 gap-3"><div><label class="form-label">Bulan</label><div class="form-input bg-navy-800 cursor-not-allowed text-gray-400">${ssrInterpolate(unref(terminModal).month_name)}</div></div><div><label class="form-label">Status</label><select class="form-select"><option${ssrIncludeBooleanAttr(Array.isArray(unref(terminModal).status) ? ssrLooseContain(unref(terminModal).status, null) : ssrLooseEqual(unref(terminModal).status, null)) ? " selected" : ""}>Pending</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(terminModal).status) ? ssrLooseContain(unref(terminModal).status, null) : ssrLooseEqual(unref(terminModal).status, null)) ? " selected" : ""}>Achieve</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(terminModal).status) ? ssrLooseContain(unref(terminModal).status, null) : ssrLooseEqual(unref(terminModal).status, null)) ? " selected" : ""}>Not Achieve</option></select></div><div class="col-span-2"><label class="form-label">Target Revenue (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(terminModal).target,
          "onUpdate:modelValue": ($event) => unref(terminModal).target = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div><div class="col-span-2"><label class="form-label">Realisasi (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(terminModal).actual,
          "onUpdate:modelValue": ($event) => unref(terminModal).actual = $event,
          class: "form-input"
        }, null, _parent));
        _push(`<p class="text-xs text-gray-600 mt-1">Nilai realisasi revenue pada periode ini</p></div></div><div class="flex gap-2 justify-end pt-2 border-t border-navy-800"><button type="button" class="btn-secondary">Batal</button><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(unref(terminSaving)) ? " disabled" : ""}>`);
        if (unref(terminSaving)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<i class="fa-solid fa-floppy-disk"></i>`);
        }
        _push(`Simpan </button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(addTerminModal).show) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-md shadow-2xl"><div class="flex items-center justify-between p-5 border-b border-navy-800"><div><h3 class="font-semibold text-white">Tambah ${ssrInterpolate(unref(addTerminModal).type === "Termin" ? "Termin" : "Bulan")}</h3><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(addTerminModal).project_id)}</p></div><button class="btn-ghost btn-xs"><i class="fa-solid fa-xmark"></i></button></div><form class="p-5 space-y-4"><div class="grid grid-cols-2 gap-3"><div class="col-span-2"><label class="form-label">Bulan</label><select class="form-select"><!--[-->`);
        ssrRenderList(monthOptions, (m) => {
          _push(`<option${ssrRenderAttr("value", m.num)}${ssrIncludeBooleanAttr(Array.isArray(unref(addTerminModal).month_num) ? ssrLooseContain(unref(addTerminModal).month_num, m.num) : ssrLooseEqual(unref(addTerminModal).month_num, m.num)) ? " selected" : ""}>${ssrInterpolate(m.name)}</option>`);
        });
        _push(`<!--]--></select></div><div class="col-span-2"><label class="form-label">Target Revenue (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(addTerminModal).target,
          "onUpdate:modelValue": ($event) => unref(addTerminModal).target = $event,
          class: "form-input",
          required: true
        }, null, _parent));
        _push(`</div><div class="col-span-2"><label class="form-label">Realisasi (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(addTerminModal).actual,
          "onUpdate:modelValue": ($event) => unref(addTerminModal).actual = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div></div><div class="flex gap-2 justify-end pt-2 border-t border-navy-800"><button type="button" class="btn-secondary">Batal</button><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(unref(terminSaving)) ? " disabled" : ""}>`);
        if (unref(terminSaving)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<i class="fa-solid fa-plus"></i>`);
        }
        _push(`Simpan </button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showImportModal)) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-start justify-center p-4 overflow-y-auto"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-4xl shadow-2xl my-4"><div class="flex items-center justify-between p-5 border-b border-navy-800"><div><h3 class="font-semibold text-white flex items-center gap-2"><i class="fa-solid fa-trophy text-yellow-400"></i>Import Pipeline Won ke Revenue Tracker </h3><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(wonLeads).filter((l) => !l.is_imported).length)} lead belum diimport \xB7 ${ssrInterpolate(unref(wonLeads).filter((l) => l.is_imported).length)} sudah diimport </p></div><button class="btn-ghost btn-xs"><i class="fa-solid fa-xmark"></i></button></div>`);
        if (unref(importResult)) {
          _push(`<div class="${ssrRenderClass([((_l = unref(importResult).imported) == null ? void 0 : _l.length) ? "bg-emerald-900/20 border border-emerald-800/40" : "bg-red-900/20 border border-red-800/40", "mx-5 mt-4 p-3 rounded-lg"])}"><div class="${ssrRenderClass([((_m = unref(importResult).imported) == null ? void 0 : _m.length) ? "text-emerald-300" : "text-red-300", "text-sm font-medium"])}"><i class="fa-solid fa-circle-check mr-1.5"></i>${ssrInterpolate(unref(importResult).message)}</div>`);
          if ((_n = unref(importResult).imported) == null ? void 0 : _n.length) {
            _push(`<div class="mt-1 flex flex-wrap gap-1"><!--[-->`);
            ssrRenderList(unref(importResult).imported, (i) => {
              _push(`<span class="text-xs bg-emerald-900/30 text-emerald-400 px-2 py-0.5 rounded-full">${ssrInterpolate(i.project_id)} \xB7 ${ssrInterpolate(i.client)}</span>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          if ((_o = unref(importResult).skipped) == null ? void 0 : _o.length) {
            _push(`<div class="mt-1"><!--[-->`);
            ssrRenderList(unref(importResult).skipped, (s) => {
              _push(`<div class="text-xs text-orange-400">\u26A0 ${ssrInterpolate(s.lead_id)}: ${ssrInterpolate(s.reason)}</div>`);
            });
            _push(`<!--]--></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="p-5 space-y-3 max-h-[60vh] overflow-y-auto"><div class="flex gap-1 p-1 bg-navy-800 rounded-lg w-fit mb-4"><button class="${ssrRenderClass([unref(importTab) === "pending" ? "bg-navy-700 text-white" : "text-gray-500 hover:text-gray-300", "px-4 py-1.5 rounded-md text-xs font-medium transition-colors"])}"> Belum Diimport `);
        if (unref(wonLeads).filter((l) => !l.is_imported).length) {
          _push(`<span class="ml-1.5 px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">${ssrInterpolate(unref(wonLeads).filter((l) => !l.is_imported).length)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button><button class="${ssrRenderClass([unref(importTab) === "done" ? "bg-navy-700 text-white" : "text-gray-500 hover:text-gray-300", "px-4 py-1.5 rounded-md text-xs font-medium transition-colors"])}"> Sudah Diimport `);
        if (unref(wonLeads).filter((l) => l.is_imported).length) {
          _push(`<span class="ml-1.5 px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">${ssrInterpolate(unref(wonLeads).filter((l) => l.is_imported).length)}</span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</button></div>`);
        if (unref(filteredWonLeads).length === 0) {
          _push(`<div class="text-center py-8 text-gray-500"><i class="fa-solid fa-trophy text-3xl mb-2 block text-gray-700"></i><div class="text-sm">`);
          if (unref(importTab) === "pending") {
            _push(`<span>Semua lead Won sudah diimport ke Revenue Tracker</span>`);
          } else {
            _push(`<span>Belum ada lead yang diimport</span>`);
          }
          _push(`</div></div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(filteredWonLeads), (lead) => {
          _push(`<div class="${ssrRenderClass([unref(importTab) === "done" ? "border-emerald-900/30 bg-emerald-900/5" : unref(selectedLeads).has(lead.lead_id) ? "border-primary-600/60 bg-primary-900/10" : "border-navy-700 bg-navy-800/40 hover:border-navy-600", "border rounded-xl transition-colors"])}"><div class="${ssrRenderClass([unref(importTab) === "pending" ? "cursor-pointer" : "", "flex items-start gap-3 p-4"])}">`);
          if (unref(importTab) === "pending") {
            _push(`<div class="mt-0.5 flex-shrink-0"><div class="${ssrRenderClass([unref(selectedLeads).has(lead.lead_id) ? "bg-primary-500 border-primary-500" : "border-gray-600", "w-4 h-4 rounded border-2 flex items-center justify-center transition-colors"])}">`);
            if (unref(selectedLeads).has(lead.lead_id)) {
              _push(`<i class="fa-solid fa-check text-white" style="${ssrRenderStyle({ "font-size": "9px" })}"></i>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div></div>`);
          } else {
            _push(`<div class="mt-0.5 flex-shrink-0"><div class="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center"><i class="fa-solid fa-check text-white" style="${ssrRenderStyle({ "font-size": "9px" })}"></i></div></div>`);
          }
          _push(`<div class="flex-1 min-w-0"><div class="flex items-start justify-between gap-2"><div><div class="text-sm font-semibold text-white">${ssrInterpolate(lead.nama_company)}</div><div class="text-xs text-gray-400 mt-0.5">${ssrInterpolate(lead.product)}</div><div class="flex gap-3 mt-1.5 flex-wrap"><span class="text-xs text-gray-500"><i class="fa-solid fa-tag mr-1"></i>${ssrInterpolate(lead.segmen || "\u2014")}</span><span class="text-xs text-gray-500"><i class="fa-solid fa-user mr-1"></i>${ssrInterpolate(lead.sales_owner || "Unassigned")}</span><span class="text-xs text-gray-500"><i class="fa-solid fa-hashtag mr-1"></i>${ssrInterpolate(lead.lead_id)}</span>`);
          if (unref(importTab) === "done") {
            _push(`<span class="text-xs text-emerald-400"><i class="fa-solid fa-folder mr-1"></i>${ssrInterpolate(lead.imported_project_id)}</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div><div class="text-right flex-shrink-0"><div class="text-sm font-bold text-yellow-400">${ssrInterpolate(unref(fmt).rupiah(lead.deal_value))}</div><div class="text-xs text-gray-500">Deal Value</div>`);
          if (lead.propose_value !== lead.deal_value) {
            _push(`<div class="text-xs text-gray-600 mt-0.5"> Propose: ${ssrInterpolate(unref(fmt).rupiah(lead.propose_value))}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></div></div></div>`);
          if (unref(importTab) === "pending" && unref(selectedLeads).has(lead.lead_id)) {
            _push(`<div class="px-4 pb-4 border-t border-navy-700 pt-3"><div class="text-xs text-primary-400 font-medium mb-3"><i class="fa-solid fa-pen-to-square mr-1"></i>Sesuaikan mapping sebelum import: </div><div class="grid grid-cols-2 md:grid-cols-3 gap-3"><div><label class="form-label">Client</label><input${ssrRenderAttr("value", unref(leadForms)[lead.lead_id].client)} class="form-input text-xs"></div><div><label class="form-label">Produk</label>`);
            _push(ssrRenderComponent(_component_ProductSelect, {
              modelValue: unref(leadForms)[lead.lead_id].product,
              "onUpdate:modelValue": ($event) => unref(leadForms)[lead.lead_id].product = $event,
              products: unref(productList),
              "input-class": "form-input text-xs"
            }, null, _parent));
            _push(`</div><div><label class="form-label">Organisasi</label><input${ssrRenderAttr("value", unref(leadForms)[lead.lead_id].organisasi)} class="form-input text-xs"${ssrRenderAttr("placeholder", lead.sales_owner || "Isi owner")}></div><div><label class="form-label">Kategori</label><select class="form-select text-xs"><option${ssrIncludeBooleanAttr(Array.isArray(unref(leadForms)[lead.lead_id].kategori) ? ssrLooseContain(unref(leadForms)[lead.lead_id].kategori, null) : ssrLooseEqual(unref(leadForms)[lead.lead_id].kategori, null)) ? " selected" : ""}>Project</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(leadForms)[lead.lead_id].kategori) ? ssrLooseContain(unref(leadForms)[lead.lead_id].kategori, null) : ssrLooseEqual(unref(leadForms)[lead.lead_id].kategori, null)) ? " selected" : ""}>Recurring</option></select></div><div><label class="form-label">Type</label><select class="form-select text-xs"><option${ssrIncludeBooleanAttr(Array.isArray(unref(leadForms)[lead.lead_id].type) ? ssrLooseContain(unref(leadForms)[lead.lead_id].type, null) : ssrLooseEqual(unref(leadForms)[lead.lead_id].type, null)) ? " selected" : ""}>One Time</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(leadForms)[lead.lead_id].type) ? ssrLooseContain(unref(leadForms)[lead.lead_id].type, null) : ssrLooseEqual(unref(leadForms)[lead.lead_id].type, null)) ? " selected" : ""}>Termin</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(leadForms)[lead.lead_id].type) ? ssrLooseContain(unref(leadForms)[lead.lead_id].type, null) : ssrLooseEqual(unref(leadForms)[lead.lead_id].type, null)) ? " selected" : ""}>Bulanan</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(leadForms)[lead.lead_id].type) ? ssrLooseContain(unref(leadForms)[lead.lead_id].type, null) : ssrLooseEqual(unref(leadForms)[lead.lead_id].type, null)) ? " selected" : ""}>Tahunan</option></select></div><div><label class="form-label">Tahun</label><input${ssrRenderAttr("value", unref(leadForms)[lead.lead_id].tahun)} type="number" class="form-input text-xs"></div><div class="md:col-span-2"><label class="form-label">Target Revenue (Rp)</label><div class="flex gap-2">`);
            _push(ssrRenderComponent(_component_NumericInput, {
              modelValue: unref(leadForms)[lead.lead_id].revenue_target,
              "onUpdate:modelValue": ($event) => unref(leadForms)[lead.lead_id].revenue_target = $event,
              class: "form-input text-xs flex-1"
            }, null, _parent));
            _push(`<button class="btn-ghost btn-xs text-xs shrink-0" title="Gunakan Deal Value"> Deal </button><button class="btn-ghost btn-xs text-xs shrink-0" title="Gunakan Propose Value"> Propose </button></div><div class="text-xs text-gray-600 mt-1"> Deal: ${ssrInterpolate(unref(fmt).rupiah(lead.deal_value))} \xB7 Propose: ${ssrInterpolate(unref(fmt).rupiah(lead.propose_value))}</div></div><div><label class="form-label">LOB</label><input${ssrRenderAttr("value", unref(leadForms)[lead.lead_id].lob)} class="form-input text-xs"${ssrRenderAttr("placeholder", lead.segmen || "Isi LOB")}></div><div class="md:col-span-3"><label class="form-label">Notes</label><input${ssrRenderAttr("value", unref(leadForms)[lead.lead_id].notes)} class="form-input text-xs" placeholder="Notes tambahan..."></div></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        });
        _push(`<!--]--></div><div class="p-5 border-t border-navy-800 flex items-center justify-between gap-3">`);
        if (unref(importTab) === "pending") {
          _push(`<div class="flex items-center gap-3"><label class="flex items-center gap-2 cursor-pointer text-xs text-gray-400 hover:text-gray-200"><input type="checkbox"${ssrIncludeBooleanAttr(unref(allPendingSelected)) ? " checked" : ""} class="w-3 h-3"> Pilih Semua </label>`);
          if (unref(selectedLeads).size) {
            _push(`<span class="text-xs text-primary-400">${ssrInterpolate(unref(selectedLeads).size)} dipilih </span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
        } else {
          _push(`<div class="text-xs text-gray-500"><i class="fa-solid fa-info-circle mr-1"></i>Lead yang sudah diimport bisa dilihat di tabel proyek </div>`);
        }
        _push(`<div class="flex gap-2 ml-auto"><button class="btn-secondary">Tutup</button>`);
        if (unref(importTab) === "pending") {
          _push(`<button class="btn-primary"${ssrIncludeBooleanAttr(unref(selectedLeads).size === 0 || unref(importSaving)) ? " disabled" : ""}>`);
          if (unref(importSaving)) {
            _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
          } else {
            _push(`<i class="fa-solid fa-file-import"></i>`);
          }
          _push(` Import ${ssrInterpolate(unref(selectedLeads).size > 0 ? unref(selectedLeads).size + " Lead" : "")}</button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showNewForm)) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-lg shadow-2xl"><div class="flex items-center justify-between p-5 border-b border-navy-800"><h3 class="font-semibold text-white">Tambah Proyek Revenue</h3><button class="btn-ghost btn-xs"><i class="fa-solid fa-xmark"></i></button></div><form class="p-5 space-y-4"><div class="grid grid-cols-2 gap-3"><div class="col-span-2"><label class="form-label">Client</label><input${ssrRenderAttr("value", unref(newProj).client)} class="form-input" required></div><div><label class="form-label">Produk</label>`);
        _push(ssrRenderComponent(_component_ProductSelect, {
          modelValue: unref(newProj).product,
          "onUpdate:modelValue": ($event) => unref(newProj).product = $event,
          products: unref(productList)
        }, null, _parent));
        _push(`</div><div><label class="form-label">Organisasi</label><select class="form-select"><!--[-->`);
        ssrRenderList(unref(orgList), (org) => {
          _push(`<option${ssrRenderAttr("value", org.kode)}${ssrIncludeBooleanAttr(Array.isArray(unref(newProj).organisasi) ? ssrLooseContain(unref(newProj).organisasi, org.kode) : ssrLooseEqual(unref(newProj).organisasi, org.kode)) ? " selected" : ""}>${ssrInterpolate(org.kode)} \u2014 ${ssrInterpolate(org.nama)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="form-label">Kategori</label><select class="form-select"><option${ssrIncludeBooleanAttr(Array.isArray(unref(newProj).kategori) ? ssrLooseContain(unref(newProj).kategori, null) : ssrLooseEqual(unref(newProj).kategori, null)) ? " selected" : ""}>Project</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newProj).kategori) ? ssrLooseContain(unref(newProj).kategori, null) : ssrLooseEqual(unref(newProj).kategori, null)) ? " selected" : ""}>Recurring</option></select></div><div><label class="form-label">Type</label><select class="form-select"><option${ssrIncludeBooleanAttr(Array.isArray(unref(newProj).type) ? ssrLooseContain(unref(newProj).type, null) : ssrLooseEqual(unref(newProj).type, null)) ? " selected" : ""}>One Time</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newProj).type) ? ssrLooseContain(unref(newProj).type, null) : ssrLooseEqual(unref(newProj).type, null)) ? " selected" : ""}>Termin</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newProj).type) ? ssrLooseContain(unref(newProj).type, null) : ssrLooseEqual(unref(newProj).type, null)) ? " selected" : ""}>Bulanan</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(newProj).type) ? ssrLooseContain(unref(newProj).type, null) : ssrLooseEqual(unref(newProj).type, null)) ? " selected" : ""}>Tahunan</option></select></div><div><label class="form-label">Target Penerbitan Invoice</label><input${ssrRenderAttr("value", unref(newProj).target_invoice_date)} type="month" class="form-input"><p class="text-xs text-gray-600 mt-1">Pilih bulan target penerbitan invoice pertama</p></div><div><label class="form-label">Tahun</label><input${ssrRenderAttr("value", unref(newProj).tahun)} type="number" class="form-input" min="2020" max="2030"></div><div><label class="form-label">Target Revenue (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(newProj).revenue_target,
          "onUpdate:modelValue": ($event) => unref(newProj).revenue_target = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div><div class="col-span-2"><label class="form-label">Notes</label><textarea class="form-textarea h-16">${ssrInterpolate(unref(newProj).notes)}</textarea></div></div><div class="flex gap-2 justify-end pt-2"><button type="button" class="btn-secondary">Batal</button><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<!---->`);
        }
        _push(`Simpan </button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(editModal).show) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-2xl shadow-2xl"><div class="flex items-center justify-between p-5 border-b border-navy-800"><div><h3 class="font-semibold text-white">Edit Proyek</h3><p class="text-xs text-gray-500 mt-0.5">${ssrInterpolate(unref(editModal).project_id)} \xB7 ${ssrInterpolate(unref(editModal).client)}</p></div><button class="btn-ghost btn-xs"><i class="fa-solid fa-xmark"></i></button></div><form class="p-5 space-y-4"><div class="grid grid-cols-2 gap-3"><div class="col-span-2"><label class="form-label">Client</label><input${ssrRenderAttr("value", unref(editModal).client)} class="form-input" required></div><div><label class="form-label">Produk</label>`);
        _push(ssrRenderComponent(_component_ProductSelect, {
          modelValue: unref(editModal).product,
          "onUpdate:modelValue": ($event) => unref(editModal).product = $event,
          products: unref(productList)
        }, null, _parent));
        _push(`</div><div><label class="form-label">Organisasi</label><select class="form-select"><!--[-->`);
        ssrRenderList(unref(orgList), (org) => {
          _push(`<option${ssrRenderAttr("value", org.kode)}${ssrIncludeBooleanAttr(Array.isArray(unref(editModal).organisasi) ? ssrLooseContain(unref(editModal).organisasi, org.kode) : ssrLooseEqual(unref(editModal).organisasi, org.kode)) ? " selected" : ""}>${ssrInterpolate(org.kode)} \u2014 ${ssrInterpolate(org.nama)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="form-label">LOB</label><input${ssrRenderAttr("value", unref(editModal).lob)} class="form-input"></div><div><label class="form-label">Kategori</label><select class="form-select"><option${ssrIncludeBooleanAttr(Array.isArray(unref(editModal).kategori) ? ssrLooseContain(unref(editModal).kategori, null) : ssrLooseEqual(unref(editModal).kategori, null)) ? " selected" : ""}>Project</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(editModal).kategori) ? ssrLooseContain(unref(editModal).kategori, null) : ssrLooseEqual(unref(editModal).kategori, null)) ? " selected" : ""}>Recurring</option></select></div><div><label class="form-label">Type</label><select class="form-select"><option${ssrIncludeBooleanAttr(Array.isArray(unref(editModal).type) ? ssrLooseContain(unref(editModal).type, null) : ssrLooseEqual(unref(editModal).type, null)) ? " selected" : ""}>One Time</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(editModal).type) ? ssrLooseContain(unref(editModal).type, null) : ssrLooseEqual(unref(editModal).type, null)) ? " selected" : ""}>Termin</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(editModal).type) ? ssrLooseContain(unref(editModal).type, null) : ssrLooseEqual(unref(editModal).type, null)) ? " selected" : ""}>Bulanan</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(editModal).type) ? ssrLooseContain(unref(editModal).type, null) : ssrLooseEqual(unref(editModal).type, null)) ? " selected" : ""}>Tahunan</option></select></div><div><label class="form-label">Target Penerbitan Invoice</label><input${ssrRenderAttr("value", unref(editModal).target_invoice_date)} type="month" class="form-input"><p class="text-xs text-gray-600 mt-1">Bulan target penerbitan invoice pertama</p></div><div><label class="form-label">Target Revenue (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(editModal).revenue_target,
          "onUpdate:modelValue": ($event) => unref(editModal).revenue_target = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div><div><label class="form-label">Tahun</label><input${ssrRenderAttr("value", unref(editModal).tahun)} type="number" class="form-input" min="2020" max="2030"></div><div class="col-span-2 p-3 rounded-lg bg-navy-800 border border-navy-700"><div class="flex items-center gap-2 text-xs text-gray-500"><i class="fa-solid fa-circle-info text-primary-400"></i><span><strong class="text-gray-300">Status</strong> dan <strong class="text-gray-300">Risk Level</strong> dihitung otomatis dari Achievement % (Realisasi \xF7 Target).</span></div><div class="flex gap-4 mt-2 text-xs text-gray-500"><span>\u226580% \u2192 <span class="badge-green">On Track / LOW</span></span><span>50\u201379% \u2192 <span class="badge-yellow">At Risk / MEDIUM</span></span><span>&lt;50% \u2192 <span class="badge-red">Critical / HIGH\u2013CRITICAL</span></span></div></div><div class="col-span-2"><label class="form-label">Notes</label><textarea class="form-textarea h-16">${ssrInterpolate(unref(editModal).notes)}</textarea></div></div><div class="flex gap-2 justify-end pt-2 border-t border-navy-800"><button type="button" class="btn-secondary">Batal</button><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<i class="fa-solid fa-floppy-disk"></i>`);
        }
        _push(`Simpan </button></div></form></div></div>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/revenue/tracker.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=tracker-Bx_eahFt.mjs.map
