import { _ as __nuxt_component_0 } from "./nuxt-link-CFSz172Y.js";
import { _ as __nuxt_component_1 } from "./AppPagination-DUr1sfAX.js";
import { _ as _sfc_main$1 } from "./NumericInput-CpnBtvaB.js";
import { defineComponent, computed, ref, reactive, withAsyncContext, watch, unref, withCtx, createVNode, createTextVNode, toDisplayString, isRef, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate, ssrRenderClass, ssrRenderAttr, ssrRenderStyle, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual, ssrRenderList } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import { u as useAuthStore, a as useRoute, b as useRouter } from "../server.mjs";
import { u as useAsyncData } from "./asyncData-BUVmteIW.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ufo/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/defu/dist/defu.mjs";
import "./_plugin-vue_export-helper-1tPrXgE0.js";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/h3/dist/index.mjs";
import "pinia";
import "vue-router";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/klona/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/perfect-debounce/dist/index.mjs";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "invoice",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const fmt = useFormat();
    const auth = useAuthStore();
    const isAdmin = computed(() => auth.user?.role_id === 1);
    const route = useRoute();
    useRouter();
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];
    const projectFilter = ref(route.query.project || "");
    const f = reactive({
      search: "",
      status: route.query.status || "",
      tahun: (/* @__PURE__ */ new Date()).getFullYear()
    });
    const selectedYear = computed(() => f.tahun);
    const page = ref(1);
    const perPage = ref(10);
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "invoices",
      () => get("/v1/revenue/invoices", {
        tahun: f.tahun,
        status: f.status,
        search: f.search,
        project_id: projectFilter.value,
        page: page.value,
        per_page: perPage.value
      }),
      { server: false, watch: [page, perPage] }
    )), __temp = await __temp, __restore(), __temp);
    watch(() => route.query.project, (val) => {
      projectFilter.value = val || "";
      refresh();
    });
    const showForm = ref(false);
    const savingInv = ref(false);
    const invError = ref("");
    const newInv = reactive({
      project_id: projectFilter.value,
      invoice_no: "",
      invoice_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
      period: months[(/* @__PURE__ */ new Date()).getMonth()],
      invoice_amount: 0,
      tahun: (/* @__PURE__ */ new Date()).getFullYear(),
      paid_amount: 0
    });
    watch(projectFilter, (val) => {
      newInv.project_id = val;
    });
    watch(showForm, (val) => {
      if (val) invError.value = "";
    });
    const showEditForm = ref(false);
    const savingEdit = ref(false);
    const editError = ref("");
    const editInv = reactive({
      id: 0,
      project_id: "",
      invoice_no: "",
      invoice_date: "",
      period: "",
      invoice_amount: 0,
      tahun: (/* @__PURE__ */ new Date()).getFullYear()
    });
    const deleteModal = reactive({ show: false, inv: null });
    const deletingInv = ref(false);
    const deleteError = ref("");
    const savingPay = ref(false);
    const payError = ref("");
    const payModal = reactive({
      show: false,
      inv: null,
      paid_amount: 0,
      paid_date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
    });
    computed(() => savingInv.value || savingPay.value);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      const _component_NumericInput = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-4"><div class="flex items-center gap-3">`);
      if (unref(projectFilter)) {
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/revenue/tracker",
          class: "btn-ghost btn-sm flex items-center gap-1.5 text-gray-400 hover:text-white"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<i class="fa-solid fa-arrow-left text-xs"${_scopeId}></i><span class="text-xs"${_scopeId}>Tracker</span>`);
            } else {
              return [
                createVNode("i", { class: "fa-solid fa-arrow-left text-xs" }),
                createVNode("span", { class: "text-xs" }, "Tracker")
              ];
            }
          }),
          _: 1
        }, _parent));
      } else {
        _push(`<!---->`);
      }
      _push(`<div><h1 class="page-title"><i class="fa-solid fa-file-invoice text-primary-400 mr-2"></i>Invoice &amp; Payment </h1><p class="page-subtitle">`);
      if (unref(projectFilter)) {
        _push(`<span class="text-primary-400 font-medium">${ssrInterpolate(unref(data)?.project_info?.project_id)} · ${ssrInterpolate(unref(data)?.project_info?.client)}</span>`);
      } else {
        _push(`<span>${ssrInterpolate(unref(data)?.total || 0)} invoice · ${ssrInterpolate(unref(selectedYear))}</span>`);
      }
      _push(`</p></div></div><button class="btn-primary btn-sm"><i class="fa-solid fa-plus"></i>Tambah Invoice </button></div>`);
      if (unref(projectFilter) && unref(data)?.project_info) {
        _push(`<div class="card mb-4 border border-primary-800/50"><div class="flex flex-wrap items-center gap-4"><div class="flex items-center gap-3"><div class="w-10 h-10 rounded-lg bg-primary-900/50 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-folder-open text-primary-400"></i></div><div><div class="text-sm font-semibold text-white">${ssrInterpolate(unref(data).project_info.project_id)}</div><div class="text-xs text-gray-400">${ssrInterpolate(unref(data).project_info.product)} · ${ssrInterpolate(unref(data).project_info.organisasi)}</div></div></div><div class="flex gap-6 flex-wrap"><div><div class="text-xs text-gray-500">Target Revenue</div><div class="text-sm font-semibold text-gray-200">${ssrInterpolate(unref(fmt).rupiah(unref(data).project_info.revenue_target))}</div></div><div><div class="text-xs text-gray-500">Realisasi</div><div class="text-sm font-semibold text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(data).project_info.actual_revenue))}</div></div><div><div class="text-xs text-gray-500">Achievement</div><div class="${ssrRenderClass([unref(data).project_info.achievement_pct * 100 >= 80 ? "text-emerald-400" : unref(data).project_info.achievement_pct * 100 >= 50 ? "text-yellow-400" : "text-red-400", "text-sm font-semibold"])}">${ssrInterpolate((unref(data).project_info.achievement_pct * 100).toFixed(1))}% </div></div><div><div class="text-xs text-gray-500">Status</div><span class="${ssrRenderClass(unref(fmt).statusClass(unref(data).project_info.status))}">${ssrInterpolate(unref(data).project_info.status)}</span></div></div><div class="ml-auto">`);
        _push(ssrRenderComponent(_component_NuxtLink, {
          to: "/revenue/tracker",
          class: "btn-secondary btn-sm text-xs"
        }, {
          default: withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(`<i class="fa-solid fa-list-check"${_scopeId}></i>Semua Proyek `);
            } else {
              return [
                createVNode("i", { class: "fa-solid fa-list-check" }),
                createTextVNode("Semua Proyek ")
              ];
            }
          }),
          _: 1
        }, _parent));
        _push(`</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(data)?.inv_summary) {
        _push(`<div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-4"><div class="stat-card"><div class="stat-icon bg-purple-900/40 text-purple-400"><i class="fa-solid fa-file-invoice-dollar"></i></div><div><div class="stat-value text-xs text-purple-300">${ssrInterpolate(unref(fmt).rupiah(unref(data).inv_summary.total_amount))}</div><div class="stat-label">Total Invoiced</div><div class="text-xs text-gray-600 mt-0.5">${ssrInterpolate(unref(data).inv_summary.total_inv)} invoice</div></div></div><div class="stat-card"><div class="stat-icon bg-emerald-900/40 text-emerald-400"><i class="fa-solid fa-circle-check"></i></div><div><div class="stat-value text-xs text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(data).inv_summary.total_paid))}</div><div class="stat-label">Terbayar</div><div class="text-xs text-gray-600 mt-0.5">${ssrInterpolate(unref(data).inv_summary.lunas_count)} lunas</div></div></div><div class="${ssrRenderClass([unref(data).inv_summary.outstanding > 0 ? "border border-orange-800/40" : "", "stat-card"])}"><div class="${ssrRenderClass([unref(data).inv_summary.outstanding > 0 ? "bg-orange-900/40 text-orange-400" : "bg-gray-800 text-gray-500", "stat-icon"])}"><i class="fa-solid fa-hourglass-half"></i></div><div><div class="${ssrRenderClass([unref(data).inv_summary.outstanding > 0 ? "text-orange-400" : "text-gray-500", "stat-value text-xs"])}">${ssrInterpolate(unref(fmt).rupiah(unref(data).inv_summary.outstanding))}</div><div class="stat-label">Outstanding</div><div class="${ssrRenderClass([unref(data).inv_summary.outstanding > 0 ? "text-orange-500/70" : "text-gray-600", "text-xs mt-0.5"])}">${ssrInterpolate(unref(data).inv_summary.belum_count)} belum lunas </div></div></div><div class="stat-card xl:col-span-3"><div class="flex items-center gap-3 w-full"><div class="relative w-14 h-14 flex-shrink-0"><svg class="w-full h-full -rotate-90" viewBox="0 0 56 56"><circle cx="28" cy="28" r="20" fill="none" stroke="#1e293b" stroke-width="7"></circle><circle cx="28" cy="28" r="20" fill="none"${ssrRenderAttr("stroke", unref(data).inv_summary.collection_rate >= 90 ? "#34d399" : unref(data).inv_summary.collection_rate >= 70 ? "#facc15" : "#f87171")} stroke-width="7" stroke-linecap="round"${ssrRenderAttr("stroke-dasharray", `${unref(data).inv_summary.collection_rate * 1.257} 125.7`)}></circle></svg><div class="absolute inset-0 flex items-center justify-center"><span class="text-xs font-bold text-white">${ssrInterpolate(unref(data).inv_summary.collection_rate)}%</span></div></div><div class="flex-1"><div class="text-xs font-semibold text-gray-200 mb-1">Collection Rate</div><div class="w-full bg-navy-800 h-2 rounded-full overflow-hidden"><div class="${ssrRenderClass([unref(data).inv_summary.collection_rate >= 90 ? "bg-emerald-500" : unref(data).inv_summary.collection_rate >= 70 ? "bg-yellow-500" : "bg-red-500", "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${unref(data).inv_summary.collection_rate}%`)}"></div></div><div class="flex justify-between text-xs text-gray-500 mt-1"><span>Bayar: ${ssrInterpolate(unref(fmt).rupiah(unref(data).inv_summary.total_paid))}</span><span>Sisa: ${ssrInterpolate(unref(fmt).rupiah(unref(data).inv_summary.outstanding))}</span></div></div></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="card mb-4"><div class="flex flex-wrap gap-3 items-center">`);
      if (unref(projectFilter)) {
        _push(`<div class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-900/30 border border-primary-700/50 text-xs text-primary-300"><i class="fa-solid fa-filter text-xs"></i><span>${ssrInterpolate(unref(projectFilter))}</span><button class="hover:text-white transition-colors ml-0.5"><i class="fa-solid fa-xmark"></i></button></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<input${ssrRenderAttr("value", unref(f).search)} class="form-input w-44" placeholder="🔍 Client / No. Invoice"><select class="form-select w-36"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, "") : ssrLooseEqual(unref(f).status, "")) ? " selected" : ""}>Semua Status</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, null) : ssrLooseEqual(unref(f).status, null)) ? " selected" : ""}>Lunas</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(f).status) ? ssrLooseContain(unref(f).status, null) : ssrLooseEqual(unref(f).status, null)) ? " selected" : ""}>Belum</option></select><select class="form-select w-24"><!--[-->`);
      ssrRenderList(unref(data)?.years || [], (y) => {
        _push(`<option${ssrRenderAttr("value", y)}${ssrIncludeBooleanAttr(Array.isArray(unref(f).tahun) ? ssrLooseContain(unref(f).tahun, y) : ssrLooseEqual(unref(f).tahun, y)) ? " selected" : ""}>${ssrInterpolate(y)}</option>`);
      });
      _push(`<!--]--></select>`);
      if (unref(f).search || unref(f).status) {
        _push(`<button class="btn-ghost btn-sm text-gray-500"><i class="fa-solid fa-xmark"></i>Reset </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-16"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else {
        _push(`<div class="card overflow-x-auto"><table class="tbl"><thead><tr><th>No. Invoice</th>`);
        if (!unref(projectFilter)) {
          _push(`<th>Proyek</th>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<th>Client</th>`);
        if (!unref(projectFilter)) {
          _push(`<th>Produk</th>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<th>Periode</th><th class="text-right">Nominal</th><th class="text-right">Terbayar</th><th class="text-right">Outstanding</th><th>Tgl Invoice</th><th>Tgl Bayar</th><th>Status</th><th class="text-center">Aksi</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(data)?.invoices, (inv) => {
          _push(`<tr><td class="text-xs font-medium text-gray-200">${ssrInterpolate(inv.invoice_no || "—")}</td>`);
          if (!unref(projectFilter)) {
            _push(`<td class="text-xs">`);
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/revenue/invoice?project=${inv.project_id}`,
              class: "text-primary-400 hover:text-primary-300 font-medium"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`${ssrInterpolate(inv.project_id)}`);
                } else {
                  return [
                    createTextVNode(toDisplayString(inv.project_id), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
            _push(`</td>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<td class="text-xs text-gray-300">${ssrInterpolate(inv.client)}</td>`);
          if (!unref(projectFilter)) {
            _push(`<td class="text-xs text-gray-400 max-w-32 truncate">${ssrInterpolate(inv.product)}</td>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<td class="text-xs text-gray-400">${ssrInterpolate(inv.period)}</td><td class="text-right text-xs text-gray-300">${ssrInterpolate(unref(fmt).rupiah(inv.invoice_amount))}</td><td class="text-right text-xs text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(inv.paid_amount))}</td><td class="${ssrRenderClass([inv.invoice_amount - inv.paid_amount > 0 ? "text-orange-400 font-medium" : "text-gray-600", "text-right text-xs"])}">${ssrInterpolate(inv.invoice_amount - inv.paid_amount > 0 ? unref(fmt).rupiah(inv.invoice_amount - inv.paid_amount) : "—")}</td><td class="text-xs text-gray-400">${ssrInterpolate(unref(fmt).tgl(inv.invoice_date))}</td><td class="text-xs text-gray-400">${ssrInterpolate(inv.paid_date ? unref(fmt).tgl(inv.paid_date) : "—")}</td><td><span class="${ssrRenderClass(inv.display_status === "Lunas" ? "badge-green" : inv.display_status === "Partial" ? "badge-yellow" : "badge-red")}">${ssrInterpolate(inv.display_status)}</span></td><td class="text-center"><div class="flex items-center justify-center gap-1.5">`);
          if (inv.display_status !== "Lunas") {
            _push(`<button class="btn-primary btn-xs"><i class="fa-solid fa-money-bill"></i>Bayar </button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<button class="btn-secondary btn-xs" title="Edit"><i class="fa-solid fa-pen"></i></button>`);
          if (unref(isAdmin)) {
            _push(`<button class="btn-xs bg-red-900/40 hover:bg-red-800/60 text-red-400 border border-red-800/50 rounded px-2 py-1" title="Hapus"><i class="fa-solid fa-trash"></i></button>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(data)?.invoices?.length) {
          _push(`<tr><td${ssrRenderAttr("colspan", unref(projectFilter) ? 10 : 12)} class="py-8 text-center"><div class="text-gray-500 text-sm"><i class="fa-solid fa-file-invoice text-2xl block mb-2 text-gray-700"></i>`);
          if (unref(projectFilter)) {
            _push(`<div>Belum ada invoice untuk proyek ${ssrInterpolate(unref(projectFilter))}</div>`);
          } else {
            _push(`<div>Tidak ada invoice ditemukan</div>`);
          }
          _push(`</div></td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</tbody></table>`);
        _push(ssrRenderComponent(_component_AppPagination, {
          page: unref(page),
          "onUpdate:page": ($event) => isRef(page) ? page.value = $event : null,
          "per-page": unref(perPage),
          "onUpdate:perPage": ($event) => isRef(perPage) ? perPage.value = $event : null,
          total: unref(data)?.total ?? 0,
          "total-pages": unref(data)?.total_pages ?? 1,
          "per-page-options": [10, 25, 50, 100]
        }, null, _parent));
        _push(`</div>`);
      }
      if (unref(payModal).show) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-sm shadow-2xl p-5"><h3 class="font-semibold text-white mb-1">Konfirmasi Pembayaran</h3><div class="mb-4 p-3 rounded-lg bg-navy-800 space-y-1"><div class="flex justify-between text-xs"><span class="text-gray-500">Invoice</span><span class="text-white">${ssrInterpolate(unref(payModal).inv?.invoice_no || "—")}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Client</span><span class="text-gray-200">${ssrInterpolate(unref(payModal).inv?.client)}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Nominal Invoice</span><span class="text-gray-200">${ssrInterpolate(unref(fmt).rupiah(unref(payModal).inv?.invoice_amount))}</span></div><div class="flex justify-between text-xs"><span class="text-gray-500">Sudah Dibayar</span><span class="text-emerald-400">${ssrInterpolate(unref(fmt).rupiah(unref(payModal).inv?.paid_amount))}</span></div><div class="h-px bg-navy-700 my-1"></div><div class="flex justify-between text-xs font-semibold"><span class="text-gray-400">Sisa Tagihan</span><span class="text-orange-400">${ssrInterpolate(unref(fmt).rupiah((unref(payModal).inv?.invoice_amount || 0) - (unref(payModal).inv?.paid_amount || 0)))}</span></div></div><div class="space-y-3"><div><label class="form-label">Jumlah Bayar (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(payModal).paid_amount,
          "onUpdate:modelValue": ($event) => unref(payModal).paid_amount = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div><div><label class="form-label">Tanggal Bayar</label><input${ssrRenderAttr("value", unref(payModal).paid_date)} type="date" class="form-input"></div></div>`);
        if (unref(payError)) {
          _push(`<div class="mt-3 flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300"><i class="fa-solid fa-circle-exclamation text-red-400 shrink-0"></i> ${ssrInterpolate(unref(payError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-2 justify-end mt-4"><button class="btn-secondary">Batal</button><button class="btn-primary"${ssrIncludeBooleanAttr(unref(savingPay)) ? " disabled" : ""}>`);
        if (unref(savingPay)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<!---->`);
        }
        _push(`Konfirmasi Bayar </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showEditForm)) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-lg shadow-2xl"><div class="flex items-center justify-between p-5 border-b border-navy-800"><h3 class="font-semibold text-white"><i class="fa-solid fa-pen mr-2 text-primary-400"></i>Edit Invoice</h3><button class="btn-ghost btn-xs"><i class="fa-solid fa-xmark"></i></button></div><form class="p-5 space-y-3"><div class="grid grid-cols-2 gap-3"><div><label class="form-label">Proyek</label><select class="form-select text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(editInv).project_id) ? ssrLooseContain(unref(editInv).project_id, "") : ssrLooseEqual(unref(editInv).project_id, "")) ? " selected" : ""}>— Tanpa Proyek —</option><!--[-->`);
        ssrRenderList(unref(data)?.rev_projects || [], (p) => {
          _push(`<option${ssrRenderAttr("value", p.project_id)}${ssrIncludeBooleanAttr(Array.isArray(unref(editInv).project_id) ? ssrLooseContain(unref(editInv).project_id, p.project_id) : ssrLooseEqual(unref(editInv).project_id, p.project_id)) ? " selected" : ""}>${ssrInterpolate(p.project_id)} — ${ssrInterpolate(p.client)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="form-label">No. Invoice</label><input${ssrRenderAttr("value", unref(editInv).invoice_no)} class="form-input" placeholder="INV-2026-001"></div><div><label class="form-label">Tgl Invoice</label><input${ssrRenderAttr("value", unref(editInv).invoice_date)} type="date" class="form-input" required></div><div><label class="form-label">Periode</label><select class="form-select"><!--[-->`);
        ssrRenderList(months, (m) => {
          _push(`<option${ssrIncludeBooleanAttr(Array.isArray(unref(editInv).period) ? ssrLooseContain(unref(editInv).period, null) : ssrLooseEqual(unref(editInv).period, null)) ? " selected" : ""}>${ssrInterpolate(m)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="form-label">Nominal (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(editInv).invoice_amount,
          "onUpdate:modelValue": ($event) => unref(editInv).invoice_amount = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div><div><label class="form-label">Tahun</label><input${ssrRenderAttr("value", unref(editInv).tahun)} type="number" class="form-input"></div></div>`);
        if (unref(editError)) {
          _push(`<div class="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300"><i class="fa-solid fa-circle-exclamation text-red-400 shrink-0"></i> ${ssrInterpolate(unref(editError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-2 justify-end pt-2"><button type="button" class="btn-secondary">Batal</button><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(unref(savingEdit)) ? " disabled" : ""}>`);
        if (unref(savingEdit)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<!---->`);
        }
        _push(`Simpan Perubahan </button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(deleteModal).show) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-red-800/50 rounded-xl w-full max-w-sm shadow-2xl p-5"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-triangle-exclamation text-red-400 text-lg"></i></div><div><h3 class="font-semibold text-white">Hapus Invoice</h3><p class="text-xs text-gray-400">Tindakan ini tidak dapat dibatalkan.</p></div></div><div class="bg-navy-800 rounded-lg p-3 mb-4 space-y-1.5 text-xs"><div class="flex justify-between"><span class="text-gray-500">No. Invoice</span><span class="text-white font-medium">${ssrInterpolate(unref(deleteModal).inv?.invoice_no || "—")}</span></div><div class="flex justify-between"><span class="text-gray-500">Client</span><span class="text-gray-200">${ssrInterpolate(unref(deleteModal).inv?.client)}</span></div><div class="flex justify-between"><span class="text-gray-500">Nominal</span><span class="text-gray-200">${ssrInterpolate(unref(fmt).rupiah(unref(deleteModal).inv?.invoice_amount))}</span></div><div class="flex justify-between"><span class="text-gray-500">Status</span><span class="${ssrRenderClass(unref(deleteModal).inv?.display_status === "Lunas" ? "text-emerald-400" : unref(deleteModal).inv?.display_status === "Partial" ? "text-yellow-400" : "text-red-400")}">${ssrInterpolate(unref(deleteModal).inv?.display_status)}</span></div></div>`);
        if (unref(deleteError)) {
          _push(`<div class="mb-3 flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300"><i class="fa-solid fa-circle-exclamation text-red-400 shrink-0"></i> ${ssrInterpolate(unref(deleteError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-2 justify-end"><button class="btn-secondary">Batal</button><button class="btn-xs bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium"${ssrIncludeBooleanAttr(unref(deletingInv)) ? " disabled" : ""}>`);
        if (unref(deletingInv)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin mr-1"></i>`);
        } else {
          _push(`<i class="fa-solid fa-trash mr-1"></i>`);
        }
        _push(`Hapus Invoice </button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(showForm)) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-lg shadow-2xl"><div class="flex items-center justify-between p-5 border-b border-navy-800"><h3 class="font-semibold text-white">Tambah Invoice</h3><button class="btn-ghost btn-xs"><i class="fa-solid fa-xmark"></i></button></div><form class="p-5 space-y-3"><div class="grid grid-cols-2 gap-3"><div><label class="form-label">Proyek</label><select class="form-select text-xs"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(newInv).project_id) ? ssrLooseContain(unref(newInv).project_id, "") : ssrLooseEqual(unref(newInv).project_id, "")) ? " selected" : ""}>— Tanpa Proyek —</option><!--[-->`);
        ssrRenderList(unref(data)?.rev_projects || [], (p) => {
          _push(`<option${ssrRenderAttr("value", p.project_id)}${ssrIncludeBooleanAttr(Array.isArray(unref(newInv).project_id) ? ssrLooseContain(unref(newInv).project_id, p.project_id) : ssrLooseEqual(unref(newInv).project_id, p.project_id)) ? " selected" : ""}>${ssrInterpolate(p.project_id)} — ${ssrInterpolate(p.client)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="form-label">No. Invoice</label><input${ssrRenderAttr("value", unref(newInv).invoice_no)} class="form-input" placeholder="INV-2026-001"></div><div><label class="form-label">Tgl Invoice</label><input${ssrRenderAttr("value", unref(newInv).invoice_date)} type="date" class="form-input" required></div><div><label class="form-label">Periode</label><select class="form-select"><!--[-->`);
        ssrRenderList(months, (m) => {
          _push(`<option${ssrIncludeBooleanAttr(Array.isArray(unref(newInv).period) ? ssrLooseContain(unref(newInv).period, null) : ssrLooseEqual(unref(newInv).period, null)) ? " selected" : ""}>${ssrInterpolate(m)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="form-label">Nominal (Rp)</label>`);
        _push(ssrRenderComponent(_component_NumericInput, {
          modelValue: unref(newInv).invoice_amount,
          "onUpdate:modelValue": ($event) => unref(newInv).invoice_amount = $event,
          class: "form-input"
        }, null, _parent));
        _push(`</div><div><label class="form-label">Tahun</label><input${ssrRenderAttr("value", unref(newInv).tahun)} type="number" class="form-input"></div></div>`);
        if (unref(invError)) {
          _push(`<div class="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300"><i class="fa-solid fa-circle-exclamation text-red-400 shrink-0"></i> ${ssrInterpolate(unref(invError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-2 justify-end pt-2"><button type="button" class="btn-secondary">Batal</button><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(unref(savingInv)) ? " disabled" : ""}>`);
        if (unref(savingInv)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<!---->`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/revenue/invoice.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=invoice-BdX6OJMp.js.map
