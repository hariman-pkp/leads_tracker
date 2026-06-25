import { defineComponent, withAsyncContext, ref, reactive, computed, unref, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrRenderAttr, ssrIncludeBooleanAttr, ssrRenderClass, ssrInterpolate, ssrRenderList, ssrLooseEqual, ssrRenderStyle, ssrLooseContain } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useFormat } from "./useFormat-D7DNHH-1.js";
import { u as useAuthStore, n as navigateTo } from "../server.mjs";
import { _ as _export_sfc } from "./_plugin-vue_export-helper-1tPrXgE0.js";
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
  __name: "settings",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    useApi();
    const fmt = useFormat();
    const auth = useAuthStore();
    if (auth.user?.role_id !== 1) {
      [__temp, __restore] = withAsyncContext(() => navigateTo("/")), await __temp, __restore();
    }
    const loading = ref(true);
    const saving = ref(null);
    const current = ref({});
    const form = reactive({ target_lock_date: "", map_tile: "osm" });
    const toast = reactive({ show: false, msg: "", type: "success" });
    const mapTileOptions = [
      { key: "osm", label: "OSM Standard", recommended: true, desc: "Tampilan OpenStreetMap default. Berwarna dan detail." },
      { key: "voyager", label: "CartoDB Voyager", recommended: false, desc: "Data OSM, rendering bersih & modern." },
      { key: "hot", label: "OSM Humanitarian", recommended: false, desc: "Variant OSM dengan skema warna lebih terang." },
      { key: "voyager_nolabel", label: "Voyager No Label", recommended: false, desc: "Paling minimal — tanpa label jalan, fokus ke marker." }
    ];
    const tileComparison = [
      {
        aspect: "Biaya",
        values: [
          { text: "Gratis", color: "text-emerald-400" },
          { text: "Gratis &lt;75k/bln", color: "text-emerald-400" },
          { text: "Gratis", color: "text-emerald-400" },
          { text: "Gratis &lt;75k/bln", color: "text-emerald-400" }
        ]
      },
      {
        aspect: "Limit request",
        values: [
          { text: "Fair use*", color: "text-yellow-400" },
          { text: "75.000/bln", color: "text-blue-300" },
          { text: "Fair use*", color: "text-yellow-400" },
          { text: "75.000/bln", color: "text-blue-300" }
        ]
      },
      {
        aspect: "Sumber data",
        values: [
          { text: "OSM", color: "text-gray-300" },
          { text: "OSM + CartoDB", color: "text-gray-300" },
          { text: "OSM", color: "text-gray-300" },
          { text: "OSM + CartoDB", color: "text-gray-300" }
        ]
      },
      {
        aspect: "Tampilan",
        values: [
          { text: "Ramai, berwarna", color: "text-gray-400" },
          { text: "Bersih, modern", color: "text-primary-300" },
          { text: "Cerah, terang", color: "text-gray-400" },
          { text: "Minimal", color: "text-gray-400" }
        ]
      },
      {
        aspect: "Label jalan",
        values: [
          { text: "✓ Ada", color: "text-gray-300" },
          { text: "✓ Ada", color: "text-gray-300" },
          { text: "✓ Ada", color: "text-gray-300" },
          { text: "✗ Tidak ada", color: "text-gray-500" }
        ]
      },
      {
        aspect: "Update peta",
        values: [
          { text: "Real-time", color: "text-emerald-400" },
          { text: "~1 minggu", color: "text-gray-400" },
          { text: "Real-time", color: "text-emerald-400" },
          { text: "~1 minggu", color: "text-gray-400" }
        ]
      },
      {
        aspect: "Penggunaan komersial",
        values: [
          { text: "Tidak dianjurkan", color: "text-red-400" },
          { text: "OK (s/d limit)", color: "text-emerald-400" },
          { text: "Non-komersial", color: "text-yellow-400" },
          { text: "OK (s/d limit)", color: "text-emerald-400" }
        ]
      }
    ];
    const loadingUsage = ref(false);
    const usageData = ref({});
    const TILE_LIMITS = {
      osm: 0,
      hot: 0,
      voyager: 75e3,
      voyager_nolabel: 75e3
    };
    const tileLimit = computed(() => TILE_LIMITS[form.map_tile] ?? 0);
    const currentMonthKey = computed(() => {
      const d = /* @__PURE__ */ new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    });
    const currentUsage = computed(() => usageData.value[currentMonthKey.value] ?? 0);
    const usagePct = computed(() => tileLimit.value > 0 ? currentUsage.value / tileLimit.value * 100 : 0);
    const currentMonthLabel = computed(() => {
      const [y, m] = currentMonthKey.value.split("-");
      const names = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      return `${names[Number(m) - 1]} ${y}`;
    });
    const usageHistory = computed(
      () => Object.entries(usageData.value).sort((a, b) => b[0].localeCompare(a[0])).map(([month, count]) => {
        const [y, m] = month.split("-");
        const names = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        return { month: `${names[Number(m) - 1]} ${y}`, count };
      })
    );
    const isLocked = computed(() => {
      if (!current.value.target_lock_date) return false;
      return /* @__PURE__ */ new Date() > new Date(current.value.target_lock_date);
    });
    const fuTemplates = ref([]);
    const savingTpl = ref(false);
    const tplForm = reactive({ nama: "", catatan: "", hasil_fu: "", metode_fu: "" });
    useApi();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)} data-v-f4225c6b><div class="page-header" data-v-f4225c6b><div data-v-f4225c6b><h1 class="page-title" data-v-f4225c6b><i class="fa-solid fa-gear text-primary-400 mr-2" data-v-f4225c6b></i>Pengaturan Aplikasi</h1><p class="page-subtitle" data-v-f4225c6b>Konfigurasi sistem APEX — hanya dapat diubah oleh Admin</p></div></div>`);
      if (unref(loading)) {
        _push(`<div class="flex justify-center py-24 text-apex-muted" data-v-f4225c6b><i class="fa-solid fa-spinner fa-spin mr-2" data-v-f4225c6b></i>Memuat pengaturan... </div>`);
      } else {
        _push(`<!--[--><div class="card mb-5" data-v-f4225c6b><div class="section-title mb-4" data-v-f4225c6b><i class="fa-solid fa-bullseye mr-1.5 text-yellow-400" data-v-f4225c6b></i>Pengaturan Target Sales </div><div class="grid grid-cols-1 md:grid-cols-2 gap-6" data-v-f4225c6b><div data-v-f4225c6b><label class="form-label" data-v-f4225c6b>Tanggal Kunci Target Sales</label><p class="text-xs text-apex-muted mb-2" data-v-f4225c6b> Setelah tanggal ini, target sales tidak bisa diubah oleh Manager/Sales. Biarkan kosong jika target selalu terbuka. </p><div class="flex gap-2" data-v-f4225c6b><input${ssrRenderAttr("value", unref(form).target_lock_date)} type="date" class="form-input flex-1" data-v-f4225c6b><button${ssrIncludeBooleanAttr(unref(saving) === "target_lock_date") ? " disabled" : ""} class="btn-primary btn-sm" data-v-f4225c6b><i class="${ssrRenderClass(unref(saving) === "target_lock_date" ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-floppy-disk")}" data-v-f4225c6b></i> Simpan </button>`);
        if (unref(form).target_lock_date) {
          _push(`<button${ssrIncludeBooleanAttr(unref(saving) === "target_lock_date") ? " disabled" : ""} class="btn-secondary btn-sm" title="Hapus lock date" data-v-f4225c6b><i class="fa-solid fa-xmark" data-v-f4225c6b></i></button>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
        if (unref(current).target_lock_date) {
          _push(`<div class="${ssrRenderClass([unref(isLocked) ? "text-red-400" : "text-emerald-400", "mt-2 text-xs"])}" data-v-f4225c6b><i class="${ssrRenderClass(unref(isLocked) ? "fa-solid fa-lock mr-1" : "fa-solid fa-lock-open mr-1")}" data-v-f4225c6b></i> ${ssrInterpolate(unref(isLocked) ? "Target saat ini TERKUNCI" : "Target saat ini TERBUKA")} — dikunci pada ${ssrInterpolate(unref(fmt).tgl(unref(current).target_lock_date))}</div>`);
        } else {
          _push(`<div class="mt-2 text-xs text-apex-muted" data-v-f4225c6b><i class="fa-solid fa-lock-open mr-1" data-v-f4225c6b></i>Target tidak dikunci (tidak ada lock date) </div>`);
        }
        _push(`</div></div></div><div class="card mb-5" data-v-f4225c6b><div class="section-title mb-1" data-v-f4225c6b><i class="fa-solid fa-map mr-1.5 text-blue-400" data-v-f4225c6b></i>Tampilan Peta </div><p class="text-xs text-gray-500 mb-4" data-v-f4225c6b>Berlaku di semua fitur yang menampilkan peta. Semua opsi menggunakan data <span class="text-gray-300 font-medium" data-v-f4225c6b>OpenStreetMap</span>.</p><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5" data-v-f4225c6b><!--[-->`);
        ssrRenderList(mapTileOptions, (opt) => {
          _push(`<label class="${ssrRenderClass([unref(form).map_tile === opt.key ? "border-primary-500 bg-primary-900/20" : "border-navy-600 hover:border-navy-500", "relative flex flex-col gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all"])}" data-v-f4225c6b><input type="radio"${ssrIncludeBooleanAttr(ssrLooseEqual(unref(form).map_tile, opt.key)) ? " checked" : ""}${ssrRenderAttr("value", opt.key)} class="sr-only" data-v-f4225c6b><div class="flex items-center gap-2 flex-wrap" data-v-f4225c6b><span class="text-sm font-medium text-white" data-v-f4225c6b>${ssrInterpolate(opt.label)}</span>`);
          if (opt.recommended) {
            _push(`<span class="text-xs px-2 py-0.5 rounded-full bg-primary-900/60 text-primary-300 border border-primary-700/50" data-v-f4225c6b>Rekomendasi</span>`);
          } else {
            _push(`<!---->`);
          }
          if (opt.key === "osm") {
            _push(`<span class="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-400" data-v-f4225c6b>Default</span>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div><p class="text-xs text-gray-500 leading-relaxed" data-v-f4225c6b>${ssrInterpolate(opt.desc)}</p>`);
          if (unref(form).map_tile === opt.key) {
            _push(`<div class="absolute top-2.5 right-2.5 w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center" data-v-f4225c6b><i class="fa-solid fa-check text-white" style="${ssrRenderStyle({ "font-size": "8px" })}" data-v-f4225c6b></i></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</label>`);
        });
        _push(`<!--]--></div><div class="mb-5" data-v-f4225c6b><div class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2" data-v-f4225c6b>Perbandingan Opsi</div><div class="overflow-x-auto rounded-xl border border-navy-700" data-v-f4225c6b><table class="w-full text-xs" data-v-f4225c6b><thead data-v-f4225c6b><tr class="border-b border-navy-700 bg-navy-800/60" data-v-f4225c6b><th class="text-left px-3 py-2 text-gray-500 font-medium" data-v-f4225c6b>Aspek</th><!--[-->`);
        ssrRenderList(mapTileOptions, (opt) => {
          _push(`<th class="${ssrRenderClass([unref(form).map_tile === opt.key ? "text-primary-300" : "text-gray-400", "text-center px-3 py-2 font-medium"])}" data-v-f4225c6b>${ssrInterpolate(opt.label)}</th>`);
        });
        _push(`<!--]--></tr></thead><tbody class="divide-y divide-navy-800/60" data-v-f4225c6b><!--[-->`);
        ssrRenderList(tileComparison, (row) => {
          _push(`<tr class="hover:bg-navy-800/30 transition-colors" data-v-f4225c6b><td class="px-3 py-2 text-gray-400" data-v-f4225c6b>${ssrInterpolate(row.aspect)}</td><!--[-->`);
          ssrRenderList(row.values, (val, i) => {
            _push(`<td class="${ssrRenderClass([[val.color, unref(form).map_tile === mapTileOptions[i].key ? "bg-primary-900/10" : ""], "px-3 py-2 text-center"])}" data-v-f4225c6b><span data-v-f4225c6b>${val.text ?? ""}</span></td>`);
          });
          _push(`<!--]--></tr>`);
        });
        _push(`<!--]--></tbody></table></div></div><div class="mb-5 p-4 rounded-xl border border-navy-700 bg-navy-800/30" data-v-f4225c6b><div class="flex items-center justify-between mb-3" data-v-f4225c6b><div class="text-xs font-semibold text-gray-400 uppercase tracking-wider" data-v-f4225c6b><i class="fa-solid fa-chart-simple mr-1.5 text-blue-400" data-v-f4225c6b></i>Penggunaan Tile Bulan Ini </div><button class="text-xs text-gray-500 hover:text-gray-300 transition" data-v-f4225c6b><i class="fa-solid fa-rotate" data-v-f4225c6b></i> Refresh </button></div>`);
        if (unref(loadingUsage)) {
          _push(`<div class="text-xs text-gray-600 py-2" data-v-f4225c6b>Memuat...</div>`);
        } else {
          _push(`<!--[--><div class="mb-3" data-v-f4225c6b><div class="flex items-center justify-between mb-1.5" data-v-f4225c6b><span class="text-xs text-gray-400" data-v-f4225c6b>${ssrInterpolate(unref(currentMonthLabel))}</span><span class="${ssrRenderClass([unref(usagePct) >= 90 ? "text-red-400" : unref(usagePct) >= 70 ? "text-yellow-400" : "text-emerald-400", "text-sm font-bold"])}" data-v-f4225c6b>${ssrInterpolate(unref(fmt).num(unref(currentUsage)))} <span class="text-xs font-normal text-gray-500" data-v-f4225c6b>${ssrInterpolate(unref(tileLimit) > 0 ? `/ ${unref(fmt).num(unref(tileLimit))} req` : "req (no limit)")}</span></span></div>`);
          if (unref(tileLimit) > 0) {
            _push(`<div class="h-2.5 rounded-full bg-navy-700 overflow-hidden" data-v-f4225c6b><div class="${ssrRenderClass([unref(usagePct) >= 90 ? "bg-red-500" : unref(usagePct) >= 70 ? "bg-yellow-500" : "bg-emerald-500", "h-full rounded-full transition-all duration-700"])}" style="${ssrRenderStyle(`width:${Math.min(unref(usagePct), 100)}%`)}" data-v-f4225c6b></div></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(tileLimit) > 0) {
            _push(`<div class="flex justify-between mt-1 text-xs text-gray-600" data-v-f4225c6b><span data-v-f4225c6b>${ssrInterpolate(unref(usagePct).toFixed(1))}% dari batas gratis</span><span class="${ssrRenderClass(unref(tileLimit) - unref(currentUsage) < 1e4 ? "text-red-400" : "text-gray-500")}" data-v-f4225c6b> Sisa ${ssrInterpolate(unref(fmt).num(unref(tileLimit) - unref(currentUsage)))} req </span></div>`);
          } else {
            _push(`<!---->`);
          }
          if (unref(tileLimit) === 0) {
            _push(`<p class="text-xs text-gray-600 mt-1" data-v-f4225c6b> OSM Standard &amp; HOT tidak memiliki limit angka pasti — gunakan dengan wajar sesuai fair-use policy. </p>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</div>`);
          if (unref(usageHistory).length > 1) {
            _push(`<div data-v-f4225c6b><div class="text-xs text-gray-600 mb-1.5" data-v-f4225c6b>Riwayat 3 bulan terakhir</div><div class="flex gap-2" data-v-f4225c6b><!--[-->`);
            ssrRenderList(unref(usageHistory).slice(0, 3), (h) => {
              _push(`<div class="flex-1 bg-navy-800/60 rounded-lg px-2.5 py-2 text-center" data-v-f4225c6b><div class="text-xs text-gray-500" data-v-f4225c6b>${ssrInterpolate(h.month)}</div><div class="text-sm font-semibold text-gray-300 mt-0.5" data-v-f4225c6b>${ssrInterpolate(unref(fmt).num(h.count))}</div></div>`);
            });
            _push(`<!--]--></div></div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<!--]-->`);
        }
        _push(`</div><div class="flex items-center gap-3" data-v-f4225c6b><button${ssrIncludeBooleanAttr(unref(saving) === "map_tile") ? " disabled" : ""} class="btn-primary btn-sm" data-v-f4225c6b><i class="${ssrRenderClass(unref(saving) === "map_tile" ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-floppy-disk")}" data-v-f4225c6b></i> Simpan Pilihan Peta </button>`);
        if (unref(current).map_tile) {
          _push(`<span class="text-xs text-gray-500" data-v-f4225c6b> Aktif: <span class="text-gray-300" data-v-f4225c6b>${ssrInterpolate(mapTileOptions.find((o) => o.key === unref(current).map_tile)?.label ?? unref(current).map_tile)}</span></span>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div></div><div class="card mb-5" data-v-f4225c6b><div class="section-title mb-4" data-v-f4225c6b><i class="fa-solid fa-comment-dots mr-1.5 text-blue-400" data-v-f4225c6b></i>Template Follow-Up </div><p class="text-xs text-gray-500 mb-4" data-v-f4225c6b>Preset catatan FU yang bisa dipilih cepat saat mencatat follow-up di detail lead.</p><form class="mb-4 p-3 bg-navy-800/50 rounded-lg border border-navy-700 space-y-3" data-v-f4225c6b><div class="grid grid-cols-1 md:grid-cols-3 gap-3" data-v-f4225c6b><div data-v-f4225c6b><label class="form-label" data-v-f4225c6b>Nama Template</label><input${ssrRenderAttr("value", unref(tplForm).nama)} class="form-input" placeholder="cth: Tidak Ada Respons" required data-v-f4225c6b></div><div data-v-f4225c6b><label class="form-label" data-v-f4225c6b>Hasil FU (opsional)</label><select class="form-select" data-v-f4225c6b><option value="" data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).hasil_fu) ? ssrLooseContain(unref(tplForm).hasil_fu, "") : ssrLooseEqual(unref(tplForm).hasil_fu, "")) ? " selected" : ""}>— tidak di-set —</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).hasil_fu) ? ssrLooseContain(unref(tplForm).hasil_fu, null) : ssrLooseEqual(unref(tplForm).hasil_fu, null)) ? " selected" : ""}>Interested</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).hasil_fu) ? ssrLooseContain(unref(tplForm).hasil_fu, null) : ssrLooseEqual(unref(tplForm).hasil_fu, null)) ? " selected" : ""}>Follow Up Later</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).hasil_fu) ? ssrLooseContain(unref(tplForm).hasil_fu, null) : ssrLooseEqual(unref(tplForm).hasil_fu, null)) ? " selected" : ""}>Send Proposal</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).hasil_fu) ? ssrLooseContain(unref(tplForm).hasil_fu, null) : ssrLooseEqual(unref(tplForm).hasil_fu, null)) ? " selected" : ""}>Not Interested</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).hasil_fu) ? ssrLooseContain(unref(tplForm).hasil_fu, null) : ssrLooseEqual(unref(tplForm).hasil_fu, null)) ? " selected" : ""}>No Response</option></select></div><div data-v-f4225c6b><label class="form-label" data-v-f4225c6b>Metode FU (opsional)</label><select class="form-select" data-v-f4225c6b><option value="" data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).metode_fu) ? ssrLooseContain(unref(tplForm).metode_fu, "") : ssrLooseEqual(unref(tplForm).metode_fu, "")) ? " selected" : ""}>— tidak di-set —</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).metode_fu) ? ssrLooseContain(unref(tplForm).metode_fu, null) : ssrLooseEqual(unref(tplForm).metode_fu, null)) ? " selected" : ""}>Phone</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).metode_fu) ? ssrLooseContain(unref(tplForm).metode_fu, null) : ssrLooseEqual(unref(tplForm).metode_fu, null)) ? " selected" : ""}>WhatsApp</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).metode_fu) ? ssrLooseContain(unref(tplForm).metode_fu, null) : ssrLooseEqual(unref(tplForm).metode_fu, null)) ? " selected" : ""}>Email</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).metode_fu) ? ssrLooseContain(unref(tplForm).metode_fu, null) : ssrLooseEqual(unref(tplForm).metode_fu, null)) ? " selected" : ""}>Meeting</option><option data-v-f4225c6b${ssrIncludeBooleanAttr(Array.isArray(unref(tplForm).metode_fu) ? ssrLooseContain(unref(tplForm).metode_fu, null) : ssrLooseEqual(unref(tplForm).metode_fu, null)) ? " selected" : ""}>Video Call</option></select></div></div><div data-v-f4225c6b><label class="form-label" data-v-f4225c6b>Isi Catatan</label><textarea class="form-textarea h-16" placeholder="Teks catatan default..." required data-v-f4225c6b>${ssrInterpolate(unref(tplForm).catatan)}</textarea></div><div class="flex justify-end" data-v-f4225c6b><button type="submit" class="btn-primary btn-sm"${ssrIncludeBooleanAttr(unref(savingTpl)) ? " disabled" : ""} data-v-f4225c6b><i class="${ssrRenderClass(unref(savingTpl) ? "fa-solid fa-spinner fa-spin" : "fa-solid fa-plus")}" data-v-f4225c6b></i> Tambah Template </button></div></form>`);
        if (!unref(fuTemplates).length) {
          _push(`<div class="text-xs text-gray-600 py-4 text-center" data-v-f4225c6b>Belum ada template.</div>`);
        } else {
          _push(`<div class="space-y-2" data-v-f4225c6b><!--[-->`);
          ssrRenderList(unref(fuTemplates), (t) => {
            _push(`<div class="flex gap-3 items-start p-3 bg-navy-800/30 rounded-lg border border-navy-700/40" data-v-f4225c6b><div class="flex-1 min-w-0" data-v-f4225c6b><div class="text-sm font-medium text-gray-200" data-v-f4225c6b>${ssrInterpolate(t.nama)}</div><div class="flex gap-2 mt-0.5" data-v-f4225c6b>`);
            if (t.hasil_fu) {
              _push(`<span class="text-xs text-primary-400" data-v-f4225c6b>${ssrInterpolate(t.hasil_fu)}</span>`);
            } else {
              _push(`<!---->`);
            }
            if (t.metode_fu) {
              _push(`<span class="text-xs text-gray-500" data-v-f4225c6b>${ssrInterpolate(t.metode_fu)}</span>`);
            } else {
              _push(`<!---->`);
            }
            _push(`</div><div class="text-xs text-gray-400 mt-1 line-clamp-2" data-v-f4225c6b>${ssrInterpolate(t.catatan)}</div></div><button class="text-red-400 hover:text-red-300 text-xs flex-shrink-0 mt-0.5" data-v-f4225c6b><i class="fa-solid fa-trash" data-v-f4225c6b></i></button></div>`);
          });
          _push(`<!--]--></div>`);
        }
        _push(`</div>`);
        if (unref(toast).show) {
          _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-green-800 border-green-600" : "bg-red-900 border-red-600", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm"])}" data-v-f4225c6b><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-green-400" : "fa-solid fa-circle-exclamation text-red-400")}" data-v-f4225c6b></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--]-->`);
      }
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/settings.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const settings = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f4225c6b"]]);
export {
  settings as default
};
//# sourceMappingURL=settings-BPTcyGc_.js.map
