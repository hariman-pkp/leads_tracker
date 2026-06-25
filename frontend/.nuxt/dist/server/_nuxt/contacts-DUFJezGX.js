import { _ as __nuxt_component_0 } from "./nuxt-link-CFSz172Y.js";
import { _ as __nuxt_component_1 } from "./AppPagination-DUr1sfAX.js";
import { defineComponent, computed, ref, withAsyncContext, reactive, unref, withCtx, createVNode, createTextVNode, toDisplayString, isRef, useSSRContext } from "vue";
import { ssrRenderAttrs, ssrInterpolate, ssrRenderAttr, ssrRenderList, ssrRenderComponent, ssrRenderClass, ssrIncludeBooleanAttr, ssrLooseContain, ssrLooseEqual } from "vue/server-renderer";
import "/Users/hariman/Development/Leads_tracker/frontend/node_modules/hookable/dist/index.mjs";
import { u as useApi } from "./useApi-CZbofOlc.js";
import { u as useAuthStore } from "../server.mjs";
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
  __name: "contacts",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const { get } = useApi();
    const authStore = useAuthStore();
    computed(() => authStore.user?.role_id === 1);
    const search = ref("");
    const page = ref(1);
    const perPage = ref(10);
    const { data, pending, refresh } = ([__temp, __restore] = withAsyncContext(() => useAsyncData(
      "contacts",
      () => get("/v1/contacts", { q: search.value, page: page.value, per_page: perPage.value }),
      { server: false, watch: [page, perPage] }
    )), __temp = await __temp, __restore(), __temp);
    function roleBadge(role) {
      const map = {
        "Decision Maker": "badge-purple",
        "Influencer": "badge-blue",
        "User": "badge-gray",
        "Technical": "badge-yellow",
        "Champion": "badge-green",
        "Gatekeeper": "badge-red"
      };
      return map[role] ?? "badge-gray";
    }
    const saving = ref(false);
    const formModal = reactive({
      show: false,
      mode: "add",
      id: 0,
      lead_id: "",
      nama_company: "",
      nama_contact: "",
      jabatan: "",
      dept: "",
      role: "",
      no_hp: "",
      email: "",
      telepon: "",
      linkedin: "",
      preferensi_kontak: "",
      catatan: ""
    });
    const deleting = ref(false);
    const deleteModal = reactive({
      show: false,
      id: 0,
      nama_contact: "",
      nama_company: "",
      jabatan: ""
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_AppPagination = __nuxt_component_1;
      _push(`<div${ssrRenderAttrs(_attrs)}><div class="page-header mb-5"><div><h1 class="page-title"><i class="fa-solid fa-address-book text-primary-400 mr-2"></i>Contacts </h1><p class="page-subtitle">${ssrInterpolate(unref(data)?.total || 0)} kontak terdaftar</p></div><button class="btn-primary btn-sm"><i class="fa-solid fa-plus"></i>Tambah Kontak </button></div><div class="card mb-4"><div class="flex flex-wrap gap-3 items-center"><input${ssrRenderAttr("value", unref(search))} class="form-input w-64" placeholder="🔍 Nama / company / HP / email..."><span class="text-xs text-gray-500">${ssrInterpolate(unref(data)?.total || 0)} hasil </span>`);
      if (unref(search)) {
        _push(`<button class="btn-ghost btn-xs text-gray-500 hover:text-gray-200"><i class="fa-solid fa-xmark"></i>Reset </button>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div>`);
      if (unref(pending)) {
        _push(`<div class="flex justify-center py-16"><i class="fa-solid fa-circle-notch fa-spin text-3xl text-primary-400"></i></div>`);
      } else {
        _push(`<div class="card overflow-x-auto"><table class="tbl"><thead><tr><th>Nama Kontak</th><th>Company</th><th>Jabatan</th><th>Role</th><th>HP</th><th>Email</th><th>Pref. Kontak</th><th class="text-center w-20">Aksi</th></tr></thead><tbody><!--[-->`);
        ssrRenderList(unref(data)?.contacts, (c) => {
          _push(`<tr class="hover:bg-navy-800/40 transition-colors"><td><div class="font-medium text-gray-200 text-sm">${ssrInterpolate(c.nama_contact)}</div>`);
          if (c.dept) {
            _push(`<div class="text-xs text-gray-600">${ssrInterpolate(c.dept)}</div>`);
          } else {
            _push(`<!---->`);
          }
          _push(`</td><td>`);
          if (c.lead_id) {
            _push(ssrRenderComponent(_component_NuxtLink, {
              to: `/pipeline/${c.lead_id}`,
              class: "text-xs text-primary-300 hover:text-primary-200 flex items-center gap-1"
            }, {
              default: withCtx((_, _push2, _parent2, _scopeId) => {
                if (_push2) {
                  _push2(`<i class="fa-solid fa-link text-xs opacity-60"${_scopeId}></i>${ssrInterpolate(c.nama_company)}`);
                } else {
                  return [
                    createVNode("i", { class: "fa-solid fa-link text-xs opacity-60" }),
                    createTextVNode(toDisplayString(c.nama_company), 1)
                  ];
                }
              }),
              _: 2
            }, _parent));
          } else {
            _push(`<span class="text-xs text-gray-400">${ssrInterpolate(c.nama_company || "—")}</span>`);
          }
          _push(`</td><td class="text-xs text-gray-400">${ssrInterpolate(c.jabatan || "—")}</td><td>`);
          if (c.role) {
            _push(`<span class="${ssrRenderClass(roleBadge(c.role))}">${ssrInterpolate(c.role)}</span>`);
          } else {
            _push(`<span class="text-xs text-gray-600">—</span>`);
          }
          _push(`</td><td>`);
          if (c.no_hp) {
            _push(`<a${ssrRenderAttr("href", `tel:${c.no_hp}`)} class="text-xs text-primary-300 hover:text-primary-200">${ssrInterpolate(c.no_hp)}</a>`);
          } else {
            _push(`<span class="text-xs text-gray-600">—</span>`);
          }
          _push(`</td><td>`);
          if (c.email) {
            _push(`<a${ssrRenderAttr("href", `mailto:${c.email}`)} class="text-xs text-primary-300 hover:text-primary-200">${ssrInterpolate(c.email)}</a>`);
          } else {
            _push(`<span class="text-xs text-gray-600">—</span>`);
          }
          _push(`</td><td class="text-xs text-gray-400">${ssrInterpolate(c.preferensi_kontak || "—")}</td><td class="text-center"><div class="flex items-center justify-center gap-1"><button class="btn-ghost btn-xs text-gray-400 hover:text-primary-400" title="Edit kontak"><i class="fa-solid fa-pen text-xs"></i></button><button class="btn-ghost btn-xs text-gray-600 hover:text-red-400" title="Hapus kontak"><i class="fa-solid fa-trash text-xs"></i></button></div></td></tr>`);
        });
        _push(`<!--]-->`);
        if (!unref(data)?.contacts?.length) {
          _push(`<tr><td colspan="8" class="py-10 text-center text-gray-600"><i class="fa-solid fa-address-book text-3xl mb-2 block text-gray-700"></i> Tidak ada kontak ditemukan </td></tr>`);
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
      if (unref(formModal).show) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-navy-700 rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col"><div class="flex items-center justify-between p-5 border-b border-navy-800 flex-shrink-0"><div><h3 class="font-semibold text-white">${ssrInterpolate(unref(formModal).mode === "add" ? "Tambah Kontak" : "Edit Kontak")}</h3>`);
        if (unref(formModal).mode === "edit") {
          _push(`<p class="text-xs text-gray-500 mt-0.5"> ID ${ssrInterpolate(unref(formModal).id)} · ${ssrInterpolate(unref(formModal).nama_company)}</p>`);
        } else {
          _push(`<!---->`);
        }
        _push(`</div><button class="btn-ghost btn-xs"><i class="fa-solid fa-xmark"></i></button></div><form class="p-5 overflow-y-auto flex-1"><div class="grid grid-cols-2 gap-3"><div class="col-span-2"><label class="form-label">Nama Kontak <span class="text-red-400">*</span></label><input${ssrRenderAttr("value", unref(formModal).nama_contact)} class="form-input" required placeholder="Nama lengkap kontak"></div><div class="col-span-2"><label class="form-label">Link ke Pipeline (opsional)</label><select class="form-select"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).lead_id) ? ssrLooseContain(unref(formModal).lead_id, "") : ssrLooseEqual(unref(formModal).lead_id, "")) ? " selected" : ""}>— Tidak ada / Mandiri —</option><!--[-->`);
        ssrRenderList(unref(data)?.leads || [], (l) => {
          _push(`<option${ssrRenderAttr("value", l.lead_id)}${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).lead_id) ? ssrLooseContain(unref(formModal).lead_id, l.lead_id) : ssrLooseEqual(unref(formModal).lead_id, l.lead_id)) ? " selected" : ""}>${ssrInterpolate(l.lead_id)} · ${ssrInterpolate(l.nama_company)}</option>`);
        });
        _push(`<!--]--></select><p class="text-xs text-gray-600 mt-1">Jika dipilih, nama company akan otomatis terisi</p></div><div class="col-span-2"><label class="form-label">Nama Company</label><input${ssrRenderAttr("value", unref(formModal).nama_company)} class="form-input" placeholder="PT / CV / Instansi..."></div><div><label class="form-label">Jabatan</label><input${ssrRenderAttr("value", unref(formModal).jabatan)} class="form-input" placeholder="Direktur, Manager, Staff..."></div><div><label class="form-label">Departemen</label><input${ssrRenderAttr("value", unref(formModal).dept)} class="form-input" placeholder="IT, Finance, HRD..."></div><div><label class="form-label">Role dalam Deal</label><select class="form-select"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).role) ? ssrLooseContain(unref(formModal).role, "") : ssrLooseEqual(unref(formModal).role, "")) ? " selected" : ""}>— Pilih role —</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).role) ? ssrLooseContain(unref(formModal).role, null) : ssrLooseEqual(unref(formModal).role, null)) ? " selected" : ""}>Decision Maker</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).role) ? ssrLooseContain(unref(formModal).role, null) : ssrLooseEqual(unref(formModal).role, null)) ? " selected" : ""}>Influencer</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).role) ? ssrLooseContain(unref(formModal).role, null) : ssrLooseEqual(unref(formModal).role, null)) ? " selected" : ""}>User</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).role) ? ssrLooseContain(unref(formModal).role, null) : ssrLooseEqual(unref(formModal).role, null)) ? " selected" : ""}>Technical</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).role) ? ssrLooseContain(unref(formModal).role, null) : ssrLooseEqual(unref(formModal).role, null)) ? " selected" : ""}>Champion</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).role) ? ssrLooseContain(unref(formModal).role, null) : ssrLooseEqual(unref(formModal).role, null)) ? " selected" : ""}>Gatekeeper</option></select></div><div><label class="form-label">Preferensi Kontak</label><select class="form-select"><option value=""${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).preferensi_kontak) ? ssrLooseContain(unref(formModal).preferensi_kontak, "") : ssrLooseEqual(unref(formModal).preferensi_kontak, "")) ? " selected" : ""}>— Pilih —</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).preferensi_kontak) ? ssrLooseContain(unref(formModal).preferensi_kontak, null) : ssrLooseEqual(unref(formModal).preferensi_kontak, null)) ? " selected" : ""}>WhatsApp</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).preferensi_kontak) ? ssrLooseContain(unref(formModal).preferensi_kontak, null) : ssrLooseEqual(unref(formModal).preferensi_kontak, null)) ? " selected" : ""}>Email</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).preferensi_kontak) ? ssrLooseContain(unref(formModal).preferensi_kontak, null) : ssrLooseEqual(unref(formModal).preferensi_kontak, null)) ? " selected" : ""}>Telepon</option><option${ssrIncludeBooleanAttr(Array.isArray(unref(formModal).preferensi_kontak) ? ssrLooseContain(unref(formModal).preferensi_kontak, null) : ssrLooseEqual(unref(formModal).preferensi_kontak, null)) ? " selected" : ""}>Meeting</option></select></div><div><label class="form-label">No. HP / WhatsApp</label><input${ssrRenderAttr("value", unref(formModal).no_hp)} class="form-input" placeholder="+62 8xx-xxxx-xxxx"></div><div><label class="form-label">No. Telepon Kantor</label><input${ssrRenderAttr("value", unref(formModal).telepon)} class="form-input" placeholder="021-xxxxxxx"></div><div><label class="form-label">Email</label><input${ssrRenderAttr("value", unref(formModal).email)} class="form-input" type="email" placeholder="nama@company.com"></div><div><label class="form-label">LinkedIn</label><input${ssrRenderAttr("value", unref(formModal).linkedin)} class="form-input" placeholder="linkedin.com/in/..."></div><div class="col-span-2"><label class="form-label">Catatan</label><textarea class="form-textarea h-16" placeholder="Catatan tambahan tentang kontak ini...">${ssrInterpolate(unref(formModal).catatan)}</textarea></div></div><div class="flex gap-2 justify-end pt-4 mt-2 border-t border-navy-800"><button type="button" class="btn-secondary"> Batal </button><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(unref(saving)) ? " disabled" : ""}>`);
        if (unref(saving)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<i class="fa-solid fa-floppy-disk"></i>`);
        }
        _push(` ${ssrInterpolate(unref(formModal).mode === "add" ? "Simpan" : "Update")}</button></div></form></div></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(deleteModal).show) {
        _push(`<div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"><div class="bg-navy-900 border border-red-900/50 rounded-xl w-full max-w-sm shadow-2xl"><div class="flex items-center gap-3 p-5 border-b border-navy-800"><div class="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center flex-shrink-0"><i class="fa-solid fa-triangle-exclamation text-red-400"></i></div><div><h3 class="font-semibold text-white">Hapus Kontak</h3><p class="text-xs text-gray-500 mt-0.5">Kontak akan dipindahkan ke recycle bin</p></div></div><div class="p-5"><div class="p-3 rounded-lg bg-navy-800 border border-navy-700 space-y-1.5 text-xs"><div class="flex justify-between"><span class="text-gray-500">Nama</span><span class="text-gray-200 font-medium">${ssrInterpolate(unref(deleteModal).nama_contact)}</span></div><div class="flex justify-between"><span class="text-gray-500">Company</span><span class="text-gray-400">${ssrInterpolate(unref(deleteModal).nama_company || "—")}</span></div><div class="flex justify-between"><span class="text-gray-500">Jabatan</span><span class="text-gray-400">${ssrInterpolate(unref(deleteModal).jabatan || "—")}</span></div></div></div><div class="flex gap-2 justify-end p-5 pt-0"><button class="btn-secondary"${ssrIncludeBooleanAttr(unref(deleting)) ? " disabled" : ""}> Batal </button><button class="btn-danger"${ssrIncludeBooleanAttr(unref(deleting)) ? " disabled" : ""}>`);
        if (unref(deleting)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin"></i>`);
        } else {
          _push(`<i class="fa-solid fa-trash"></i>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/contacts.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
export {
  _sfc_main as default
};
//# sourceMappingURL=contacts-DUFJezGX.js.map
