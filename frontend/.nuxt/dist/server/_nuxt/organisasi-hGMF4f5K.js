import { defineComponent, computed, unref, useSSRContext, ref, reactive, mergeProps } from "vue";
import { ssrRenderAttrs, ssrRenderStyle, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrRenderComponent, ssrRenderAttr, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import "../server.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ofetch/dist/node.mjs";
import "#internal/nuxt/paths";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/unctx/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/h3/dist/index.mjs";
import "pinia";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/defu/dist/defu.mjs";
import "vue-router";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/ufo/dist/index.mjs";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/klona/dist/index.mjs";
const _sfc_main$1 = /* @__PURE__ */ defineComponent({
  __name: "OrgTreeNode",
  __ssrInlineRender: true,
  props: {
    node: {},
    all: {},
    depth: {}
  },
  setup(__props) {
    const props = __props;
    const children = computed(
      () => props.all.filter((o) => o.parent_id === props.node.id)
    );
    return (_ctx, _push, _parent, _attrs) => {
      const _component_OrgTreeNode = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="flex items-center gap-2 py-1 rounded hover:bg-navy-800/40 px-2 transition-colors" style="${ssrRenderStyle(`padding-left: ${__props.depth * 20 + 8}px`)}">`);
      if (__props.depth > 0) {
        _push(`<span class="text-gray-600 text-xs select-none">${ssrInterpolate(__props.depth > 1 ? "└─" : "└─")}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<i class="${ssrRenderClass([
        "fa-solid text-xs w-3.5 text-center",
        unref(children).length ? "fa-sitemap text-primary-500" : "fa-circle-dot text-gray-600"
      ])}"></i><span class="font-mono text-xs text-primary-300 bg-navy-800 px-1.5 py-0.5 rounded">${ssrInterpolate(__props.node.kode)}</span><span class="text-gray-200 font-medium">${ssrInterpolate(__props.node.nama)}</span>`);
      if (__props.node.head) {
        _push(`<span class="text-xs text-gray-500 flex items-center gap-1 ml-1"><i class="fa-solid fa-user-tie text-[10px]"></i>${ssrInterpolate(__props.node.head)}</span>`);
      } else {
        _push(`<!---->`);
      }
      if (!__props.node.is_active) {
        _push(`<span class="text-[10px] text-gray-500 border border-gray-700 rounded px-1">non-aktif</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><!--[-->`);
      ssrRenderList(unref(children), (child) => {
        _push(ssrRenderComponent(_component_OrgTreeNode, {
          key: child.id,
          node: child,
          all: __props.all,
          depth: __props.depth + 1
        }, null, _parent));
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/OrgTreeNode.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "organisasi",
  __ssrInlineRender: true,
  setup(__props) {
    useApi();
    const loading = ref(true);
    const saving = ref(false);
    const list = ref([]);
    const users = ref([]);
    const toast = reactive({ show: false, type: "success", msg: "" });
    const modal = reactive({
      open: false,
      isNew: false,
      error: "",
      form: { kode: "", nama: "", parent_id: null, head: "", is_active: 1 }
    });
    const delModal = reactive({ open: false, org: null, error: "" });
    const rootOrgs = computed(() => list.value.filter((o) => !o.parent_id));
    const parentOptions = computed(
      () => list.value.filter((o) => o.id !== modal.form["id"])
    );
    function hasChildren(id) {
      return list.value.some((o) => o.parent_id === id);
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_OrgTreeNode = _sfc_main$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "max-w-5xl" }, _attrs))}><div class="page-header"><div><h1 class="page-title"><i class="fa-solid fa-sitemap text-primary-400 mr-2"></i>Master Organisasi </h1><p class="page-subtitle">${ssrInterpolate(unref(list).length)} organisasi terdaftar</p></div><button class="btn-primary"><i class="fa-solid fa-plus"></i> Tambah Organisasi </button></div>`);
      if (unref(toast).show) {
        _push(`<div class="${ssrRenderClass([unref(toast).type === "success" ? "bg-green-800 border-green-600" : "bg-red-900 border-red-600", "fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl text-sm text-white max-w-sm"])}"><i class="${ssrRenderClass(unref(toast).type === "success" ? "fa-solid fa-circle-check text-green-400" : "fa-solid fa-circle-exclamation text-red-400")}"></i> ${ssrInterpolate(unref(toast).msg)}</div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(loading)) {
        _push(`<div class="flex justify-center py-20"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else {
        _push(`<div class="card overflow-x-auto"><table class="w-full text-sm"><thead><tr class="border-b border-navy-700"><th class="text-left py-3 px-4 text-gray-400 font-medium w-32">Kode</th><th class="text-left py-3 px-4 text-gray-400 font-medium">Nama Organisasi</th><th class="text-left py-3 px-4 text-gray-400 font-medium">Parent Organisasi</th><th class="text-left py-3 px-4 text-gray-400 font-medium">Head</th><th class="text-center py-3 px-4 text-gray-400 font-medium w-24">Status</th><th class="text-center py-3 px-4 text-gray-400 font-medium w-24">Aksi</th></tr></thead><tbody>`);
        if (unref(list).length === 0) {
          _push(`<tr><td colspan="6" class="text-center py-16 text-gray-500"><i class="fa-solid fa-sitemap text-4xl block mb-3 opacity-30"></i> Belum ada data organisasi </td></tr>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<!--[-->`);
        ssrRenderList(unref(list), (org) => {
          _push(`<tr class="border-b border-navy-800/50 hover:bg-navy-800/30 transition-colors"><td class="py-3 px-4"><span class="font-mono text-xs bg-navy-800 text-primary-300 px-2 py-1 rounded">${ssrInterpolate(org.kode)}</span></td><td class="py-3 px-4"><div class="flex items-center gap-2">`);
          if (hasChildren(org.id)) {
            _push(`<i class="fa-solid fa-sitemap text-xs text-gray-500" title="Memiliki sub-organisasi"></i>`);
          } else {
            _push(`<!---->`);
          }
          _push(`<span class="font-medium text-gray-100">${ssrInterpolate(org.nama)}</span></div></td><td class="py-3 px-4">`);
          if (org.parent_kode) {
            _push(`<span class="inline-flex items-center gap-1.5 text-gray-300 text-xs"><i class="fa-solid fa-arrow-up text-[10px] text-gray-500"></i><span class="font-mono text-primary-400">${ssrInterpolate(org.parent_kode)}</span><span class="text-gray-400">${ssrInterpolate(org.parent_nama)}</span></span>`);
          } else {
            _push(`<span class="text-gray-600 text-xs">— (Root)</span>`);
          }
          _push(`</td><td class="py-3 px-4 text-gray-300">`);
          if (org.head) {
            _push(`<span class="flex items-center gap-1.5"><i class="fa-solid fa-user-tie text-xs text-gray-500"></i> ${ssrInterpolate(org.head)}</span>`);
          } else {
            _push(`<span class="text-gray-600 text-xs">—</span>`);
          }
          _push(`</td><td class="py-3 px-4 text-center"><span class="${ssrRenderClass(org.is_active ? "badge-emerald" : "badge-gray")}">${ssrInterpolate(org.is_active ? "Aktif" : "Non-aktif")}</span></td><td class="py-3 px-4 text-center"><button class="text-primary-400 hover:text-primary-300 transition-colors mr-3" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button><button${ssrRenderAttr("title", hasChildren(org.id) ? "Tidak dapat dihapus — memiliki sub-organisasi" : "Hapus")} class="${ssrRenderClass([hasChildren(org.id) ? "opacity-30 cursor-not-allowed" : "", "text-red-400 hover:text-red-300 transition-colors"])}"><i class="fa-solid fa-trash"></i></button></td></tr>`);
        });
        _push(`<!--]--></tbody></table></div>`);
      }
      if (!unref(loading) && unref(list).length > 0) {
        _push(`<div class="card mt-4"><div class="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3"><i class="fa-solid fa-sitemap mr-1.5"></i> Struktur Hierarki </div><div class="space-y-1 text-sm"><!--[-->`);
        ssrRenderList(unref(rootOrgs), (root) => {
          _push(ssrRenderComponent(_component_OrgTreeNode, {
            key: root.id,
            node: root,
            all: unref(list),
            depth: 0
          }, null, _parent));
        });
        _push(`<!--]--></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(modal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div class="bg-navy-900 border border-navy-700 rounded-2xl w-full max-w-md shadow-2xl"><div class="flex items-center justify-between p-5 border-b border-navy-700"><h2 class="text-lg font-semibold text-white"><i class="fa-solid fa-sitemap text-primary-400 mr-2"></i> ${ssrInterpolate(unref(modal).isNew ? "Tambah Organisasi" : "Edit Organisasi")}</h2><button class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark text-xl"></i></button></div><div class="p-5 space-y-4"><div><label class="form-label"> Kode Organisasi <span class="text-red-400">*</span></label><input${ssrRenderAttr("value", unref(modal).form.kode)} class="form-input font-mono uppercase" placeholder="Contoh: DIR, DIV-IT, DEPT-HR"><p class="text-xs text-gray-500 mt-1">Kode unik, otomatis diubah ke huruf kapital</p></div><div><label class="form-label"> Nama Organisasi <span class="text-red-400">*</span></label><input${ssrRenderAttr("value", unref(modal).form.nama)} class="form-input" placeholder="Contoh: Direktorat Utama"></div><div><label class="form-label">Parent Organisasi</label><select class="form-select"><option${ssrRenderAttr("value", null)}${ssrIncludeBooleanAttr(Array.isArray(unref(modal).form.parent_id) ? ssrLooseContain(unref(modal).form.parent_id, null) : ssrLooseEqual(unref(modal).form.parent_id, null)) ? " selected" : ""}>— Tidak ada (Root) —</option><!--[-->`);
        ssrRenderList(unref(parentOptions), (org) => {
          _push(`<option${ssrRenderAttr("value", org.id)}${ssrIncludeBooleanAttr(Array.isArray(unref(modal).form.parent_id) ? ssrLooseContain(unref(modal).form.parent_id, org.id) : ssrLooseEqual(unref(modal).form.parent_id, org.id)) ? " selected" : ""}>${ssrInterpolate(org.kode)} — ${ssrInterpolate(org.nama)}</option>`);
        });
        _push(`<!--]--></select></div><div><label class="form-label">Head / Kepala Organisasi</label><input${ssrRenderAttr("value", unref(modal).form.head)} class="form-input" list="head-list" placeholder="Nama penanggung jawab..."><datalist id="head-list"><!--[-->`);
        ssrRenderList(unref(users), (u) => {
          _push(`<option${ssrRenderAttr("value", u.nama)}></option>`);
        });
        _push(`<!--]--></datalist></div>`);
        if (!unref(modal).isNew) {
          _push(`<div><label class="form-label">Status</label><select class="form-select"><option${ssrRenderAttr("value", 1)}${ssrIncludeBooleanAttr(Array.isArray(unref(modal).form.is_active) ? ssrLooseContain(unref(modal).form.is_active, 1) : ssrLooseEqual(unref(modal).form.is_active, 1)) ? " selected" : ""}>Aktif</option><option${ssrRenderAttr("value", 0)}${ssrIncludeBooleanAttr(Array.isArray(unref(modal).form.is_active) ? ssrLooseContain(unref(modal).form.is_active, 0) : ssrLooseEqual(unref(modal).form.is_active, 0)) ? " selected" : ""}>Non-aktif</option></select></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(modal).error) {
          _push(`<div class="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2.5 text-sm text-red-300"><i class="fa-solid fa-circle-exclamation"></i> ${ssrInterpolate(unref(modal).error)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><div class="flex justify-end gap-3 p-5 border-t border-navy-700"><button class="btn-ghost">Batal</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="btn-primary"><i class="${ssrRenderClass(unref(saving) ? "fa-solid fa-circle-notch fa-spin" : "fa-solid fa-floppy-disk")}"></i> ${ssrInterpolate(unref(modal).isNew ? "Tambah" : "Simpan")}</button></div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(delModal).open) {
        _push(`<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"><div class="bg-navy-900 border border-red-900/50 rounded-2xl w-full max-w-sm shadow-2xl p-6"><div class="flex items-center gap-3 mb-4"><div class="w-10 h-10 rounded-full bg-red-900/40 flex items-center justify-center"><i class="fa-solid fa-trash text-red-400"></i></div><h2 class="text-lg font-semibold text-white">Hapus Organisasi</h2></div><p class="text-sm text-gray-300 mb-1"> Hapus <strong class="text-white">${ssrInterpolate(unref(delModal).org?.nama)}</strong>? </p><p class="text-xs text-gray-500 mb-5"> Kode: <span class="font-mono text-gray-400">${ssrInterpolate(unref(delModal).org?.kode)}</span></p>`);
        if (unref(delModal).error) {
          _push(`<div class="flex items-center gap-2 bg-red-900/30 border border-red-700/50 rounded-lg px-3 py-2.5 text-sm text-red-300 mb-4"><i class="fa-solid fa-circle-exclamation"></i> ${ssrInterpolate(unref(delModal).error)}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex justify-end gap-3"><button class="btn-ghost">Batal</button><button${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""} class="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors">`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin mr-1"></i>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/master/organisasi.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=organisasi-hGMF4f5K.js.map
