import { u as useAuthStore, a as useRoute, k as useTheme, _ as __nuxt_component_0$1 } from './server.mjs';
import { useSSRContext, defineComponent, ref, reactive, computed, watch, mergeProps, unref, withCtx, createVNode } from 'vue';
import { ssrRenderAttrs, ssrRenderClass, ssrRenderComponent, ssrInterpolate, ssrRenderSlot, ssrRenderTeleport, ssrRenderStyle, ssrRenderList, ssrRenderDynamicModel, ssrRenderAttr, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import { u as useApi } from './useApi-CZbofOlc.mjs';
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

const GROUP_ORDER = [
  "Aktivitas",
  "Pipeline CRM",
  "Entertain",
  "Revenue LOB",
  "Master Data",
  "Utilitas"
];
const ALL_MENUS = [
  { key: "today", label: "Hari Ini", url: "/today", icon: "fa-bolt", group: "Aktivitas" },
  { key: "schedule", label: "FU Schedule", url: "/schedule", icon: "fa-calendar-check", group: "Aktivitas" },
  { key: "followup", label: "Follow-Up Log", url: "/followup", icon: "fa-phone-alt", group: "Aktivitas" },
  { key: "field_activity", label: "Field Activity", url: "/field-activity", icon: "fa-map-location-dot", group: "Aktivitas" },
  { key: "field_monitor", label: "Field Monitor", url: "/field-monitor", icon: "fa-chart-line", group: "Aktivitas" },
  { key: "daily_report", label: "Laporan Harian", url: "/daily-report", icon: "fa-clipboard-list", group: "Aktivitas" },
  { key: "dashboard", label: "Dashboard", url: "/", icon: "fa-tachometer-alt", group: "Pipeline CRM" },
  { key: "pipeline", label: "Pipeline", url: "/pipeline", icon: "fa-funnel-dollar", group: "Pipeline CRM" },
  { key: "contacts", label: "Contacts", url: "/contacts", icon: "fa-address-book", group: "Pipeline CRM" },
  { key: "winloss", label: "Win / Loss", url: "/winloss", icon: "fa-trophy", group: "Pipeline CRM" },
  { key: "insights", label: "Pipeline Insights", url: "/insights", icon: "fa-lightbulb", group: "Pipeline CRM" },
  { key: "forecast", label: "Pipeline Forecast", url: "/forecast", icon: "fa-chart-line", group: "Pipeline CRM" },
  { key: "heatmap", label: "Activity Heatmap", url: "/heatmap", icon: "fa-fire", group: "Pipeline CRM" },
  { key: "sales_target", label: "Target Sales", url: "/sales-target", icon: "fa-bullseye", group: "Pipeline CRM" },
  { key: "rev_dashboard", label: "Revenue Dashboard", url: "/revenue", icon: "fa-chart-bar", group: "Revenue LOB" },
  { key: "rev_insights", label: "Revenue Insights", url: "/revenue/insights", icon: "fa-lightbulb", group: "Revenue LOB" },
  { key: "rev_tracker", label: "Revenue Tracker", url: "/revenue/tracker", icon: "fa-tasks", group: "Revenue LOB" },
  { key: "rev_monthly", label: "Monthly Monitoring", url: "/revenue/monthly", icon: "fa-calendar-alt", group: "Revenue LOB" },
  { key: "rev_invoice", label: "Invoice & Payment", url: "/revenue/invoice", icon: "fa-file-invoice", group: "Revenue LOB" },
  { key: "rev_kpi", label: "KPI Prospecting", url: "/revenue/kpi", icon: "fa-bullseye", group: "Revenue LOB" },
  { key: "rev_budget", label: "Budget Monitoring", url: "/revenue/budget", icon: "fa-wallet", group: "Revenue LOB" },
  { key: "export", label: "Export Data", url: "/export", icon: "fa-file-arrow-down", group: "Utilitas" },
  { key: "import", label: "Upload Data", url: "/import", icon: "fa-file-arrow-up", group: "Utilitas" },
  { key: "products", label: "Master Produk", url: "/master/produk", icon: "fa-box-open", group: "Master Data" },
  { key: "org", label: "Master Organisasi", url: "/master/organisasi", icon: "fa-sitemap", group: "Master Data" },
  { key: "sales", label: "Master Sales", url: "/sales", icon: "fa-users", group: "Master Data" },
  { key: "roles", label: "Role & Menu", url: "/roles", icon: "fa-shield-alt", group: "Master Data" },
  { key: "users", label: "Master Users", url: "/users", icon: "fa-user-cog", group: "Master Data" },
  { key: "settings", label: "Pengaturan", url: "/settings", icon: "fa-gear", group: "Master Data" },
  { key: "entertain", label: "Dashboard Entertain", url: "/entertain", icon: "fa-utensils", group: "Entertain" },
  { key: "entertain_claims", label: "Klaim Saya", url: "/entertain/claims", icon: "fa-receipt", group: "Entertain" },
  { key: "entertain_approval", label: "Approval Klaim", url: "/entertain/approval", icon: "fa-circle-check", group: "Entertain" }
];
function useNavMenus() {
  const auth = useAuthStore();
  const navGroups = computed(() => {
    var _a, _b, _c;
    const allowed = (_b = (_a = auth.user) == null ? void 0 : _a.allowed_menus) != null ? _b : [];
    const isAdmin = ((_c = auth.user) == null ? void 0 : _c.role_id) === 1;
    const groups = {};
    for (const m of ALL_MENUS) {
      if (!isAdmin && !allowed.includes(m.key)) continue;
      if (!groups[m.group]) groups[m.group] = { name: m.group, menus: [] };
      groups[m.group].menus.push(m);
    }
    return GROUP_ORDER.filter((g) => groups[g]).map((g) => groups[g]);
  });
  return { navGroups };
}
const STORAGE_KEY = "apex-nav-open-groups";
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "default",
  __ssrInlineRender: true,
  setup(__props) {
    useAuthStore();
    const route = useRoute();
    useApi();
    const { isDark } = useTheme();
    const userMenuOpen = ref(false);
    ref(null);
    const dropdownStyle = ref({ bottom: "0px", left: "0px", width: "224px" });
    const showChangePwd = ref(false);
    const savingPwd = ref(false);
    const pwdError = ref("");
    const pwdSuccess = ref("");
    const showOld = ref(false);
    const showNew = ref(false);
    const pwdForm = reactive({ old_password: "", new_password: "", confirm_password: "" });
    const pwdStrength = computed(() => {
      const p = pwdForm.new_password;
      if (!p) return 0;
      let s = 0;
      if (p.length >= 8) s++;
      if (/[A-Z]/.test(p)) s++;
      if (/[0-9]/.test(p)) s++;
      if (/[^A-Za-z0-9]/.test(p)) s++;
      return s;
    });
    const pwdStrengthColor = computed(() => ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"][pwdStrength.value]);
    const pwdStrengthTextColor = computed(() => ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-emerald-400"][pwdStrength.value]);
    const pwdStrengthLabel = computed(() => ["", "Lemah", "Cukup", "Kuat", "Sangat Kuat"][pwdStrength.value]);
    useApi();
    ref(null);
    const notifOpen = ref(false);
    const notifLoading = ref(false);
    const notifications = ref([]);
    const unreadCount = ref(0);
    const notifDropdownStyle = ref({});
    function notifIcon(type) {
      const map = {
        overdue: "fa-solid fa-clock text-red-400",
        stale: "fa-solid fa-hourglass-half text-orange-400",
        closing: "fa-solid fa-bullseye text-emerald-400",
        reminder: "fa-solid fa-calendar-check text-blue-400",
        comment: "fa-solid fa-comment text-purple-400",
        approval: "fa-solid fa-check-to-slot text-yellow-400",
        warning: "fa-solid fa-triangle-exclamation text-orange-400",
        info: "fa-solid fa-circle-info text-blue-400"
      };
      return map[type] || "fa-solid fa-bell text-apex-muted";
    }
    function notifIconBg(type) {
      const map = {
        overdue: "bg-red-900/30",
        stale: "bg-orange-900/30",
        closing: "bg-emerald-900/30",
        reminder: "bg-blue-900/30",
        comment: "bg-purple-900/30",
        approval: "bg-yellow-900/30",
        warning: "bg-orange-900/30",
        info: "bg-blue-900/30"
      };
      return map[type] || "bg-apex-card";
    }
    function timeAgo(dateStr) {
      if (!dateStr) return "";
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diff / 6e4);
      if (mins < 1) return "Baru saja";
      if (mins < 60) return `${mins} menit lalu`;
      const hrs = Math.floor(mins / 60);
      if (hrs < 24) return `${hrs} jam lalu`;
      const days = Math.floor(hrs / 24);
      if (days < 7) return `${days} hari lalu`;
      return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }
    const { navGroups } = useNavMenus();
    const sidebarOpen = ref(true);
    const isMobile = ref(false);
    const todayStr = computed(
      () => (/* @__PURE__ */ new Date()).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    );
    function isActive(url) {
      if (url === "/") return route.path === "/";
      return route.path.startsWith(url);
    }
    function groupHasActive(group) {
      return group.menus.some((m) => isActive(m.url));
    }
    const openGroups = ref(/* @__PURE__ */ new Set());
    watch(() => route.path, () => {
      for (const g of navGroups.value) {
        if (groupHasActive(g) && !openGroups.value.has(g.name)) {
          const next = new Set(openGroups.value);
          next.add(g.name);
          openGroups.value = next;
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
          } catch {
          }
        }
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_ClientOnly = __nuxt_component_0$1;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "flex h-screen overflow-hidden bg-apex-bg transition-theme duration-200" }, _attrs))} data-v-6e6261d4><aside class="${ssrRenderClass([unref(sidebarOpen) ? "translate-x-0" : "-translate-x-64 absolute z-40 h-full", "flex flex-col w-64 flex-shrink-0 bg-apex-surface border-r border-apex-border transition-all duration-200"])}" data-v-6e6261d4><div class="flex items-center gap-3 px-4 py-5 border-b border-apex-border" data-v-6e6261d4><div class="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/40" data-v-6e6261d4><span class="text-white font-black text-xs tracking-tight" data-v-6e6261d4>APEX</span></div><div data-v-6e6261d4><div class="text-sm font-bold text-apex-text leading-tight tracking-wide" data-v-6e6261d4>APEX</div><div class="text-[10px] text-apex-faint leading-tight" data-v-6e6261d4>Achievement &amp; Performance</div></div></div><nav class="flex-1 overflow-y-auto py-2 px-2" data-v-6e6261d4>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {
        fallback: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="px-3 py-8 text-center" data-v-6e6261d4${_scopeId}><i class="fa-solid fa-circle-notch fa-spin text-apex-faint" data-v-6e6261d4${_scopeId}></i></div>`);
          } else {
            return [
              createVNode("div", { class: "px-3 py-8 text-center" }, [
                createVNode("i", { class: "fa-solid fa-circle-notch fa-spin text-apex-faint" })
              ])
            ];
          }
        })
      }, _parent));
      _push(`</nav><div class="border-t border-apex-border p-3" data-v-6e6261d4>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`</div></aside><div class="flex-1 flex flex-col min-w-0 overflow-hidden" data-v-6e6261d4><header class="flex items-center gap-3 px-4 py-3 border-b border-apex-border bg-apex-surface/80 backdrop-blur-sm flex-shrink-0" data-v-6e6261d4><button class="btn-ghost btn-sm rounded-lg" data-v-6e6261d4><i class="fa-solid fa-bars text-apex-muted" data-v-6e6261d4></i></button><div class="flex-1" data-v-6e6261d4></div><div class="text-xs text-apex-faint hidden sm:block" data-v-6e6261d4><i class="fa-regular fa-calendar mr-1.5" data-v-6e6261d4></i> ${ssrInterpolate(unref(todayStr))}</div>`);
      _push(ssrRenderComponent(_component_ClientOnly, null, {}, _parent));
      _push(`<div class="relative" data-v-6e6261d4><button class="btn-ghost btn-sm rounded-lg relative" title="Notifikasi" data-v-6e6261d4><i class="fa-regular fa-bell text-apex-muted" data-v-6e6261d4></i>`);
      if (unref(unreadCount) > 0) {
        _push(`<span class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none" data-v-6e6261d4>${ssrInterpolate(unref(unreadCount) > 99 ? "99+" : unref(unreadCount))}</span>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</button></div></header><main class="flex-1 overflow-y-auto p-5" data-v-6e6261d4>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</main></div>`);
      if (unref(sidebarOpen) && unref(isMobile)) {
        _push(`<div class="fixed inset-0 bg-black/60 z-30" data-v-6e6261d4></div>`);
      } else {
        _push(`<!---->`);
      }
      if (unref(notifOpen)) {
        _push(`<div class="fixed inset-0 z-[9980]" data-v-6e6261d4></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(notifOpen)) {
          _push2(`<div class="${ssrRenderClass([unref(isDark) ? "bg-apex-surface border-apex-border" : "bg-white border-slate-200", "fixed z-[9985] w-80 rounded-xl shadow-2xl border overflow-hidden"])}" style="${ssrRenderStyle(unref(notifDropdownStyle))}" data-v-6e6261d4><div class="flex items-center justify-between px-4 py-3 border-b border-apex-border" data-v-6e6261d4><div class="flex items-center gap-2" data-v-6e6261d4><i class="fa-regular fa-bell text-primary-400" data-v-6e6261d4></i><span class="font-semibold text-sm text-apex-text" data-v-6e6261d4>Notifikasi</span>`);
          if (unref(unreadCount) > 0) {
            _push2(`<span class="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs font-bold rounded-full" data-v-6e6261d4>${ssrInterpolate(unref(unreadCount))}</span>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div>`);
          if (unref(unreadCount) > 0) {
            _push2(`<button class="text-xs text-primary-400 hover:text-primary-300 transition-colors" data-v-6e6261d4> Tandai semua dibaca </button>`);
          } else {
            _push2(`<!---->`);
          }
          _push2(`</div><div class="overflow-y-auto max-h-[420px]" data-v-6e6261d4>`);
          if (unref(notifLoading)) {
            _push2(`<div class="py-10 text-center text-apex-faint text-sm" data-v-6e6261d4><i class="fa-solid fa-circle-notch fa-spin mr-2" data-v-6e6261d4></i>Memuat... </div>`);
          } else if (unref(notifications).length === 0) {
            _push2(`<div class="py-10 text-center text-apex-faint text-sm" data-v-6e6261d4><i class="fa-regular fa-bell-slash text-2xl block mb-2 opacity-40" data-v-6e6261d4></i> Tidak ada notifikasi </div>`);
          } else {
            _push2(`<div data-v-6e6261d4><!--[-->`);
            ssrRenderList(unref(notifications), (n) => {
              _push2(`<div class="${ssrRenderClass([!n.read_at ? "bg-primary-900/10" : "", "flex gap-3 px-4 py-3 border-b border-apex-border/50 cursor-pointer transition-colors hover:bg-apex-card/60 last:border-0"])}" data-v-6e6261d4><div class="flex-shrink-0 mt-0.5" data-v-6e6261d4><div class="${ssrRenderClass([notifIconBg(n.type), "w-7 h-7 rounded-full flex items-center justify-center text-xs"])}" data-v-6e6261d4><i class="${ssrRenderClass(notifIcon(n.type))}" data-v-6e6261d4></i></div></div><div class="flex-1 min-w-0" data-v-6e6261d4><div class="${ssrRenderClass([!n.read_at ? "text-apex-text" : "text-apex-muted", "text-xs font-semibold text-apex-text leading-snug"])}" data-v-6e6261d4>${ssrInterpolate(n.title)}</div><div class="text-xs text-apex-muted mt-0.5 leading-relaxed line-clamp-2" data-v-6e6261d4>${ssrInterpolate(n.body)}</div><div class="text-[10px] text-apex-faint mt-1" data-v-6e6261d4>${ssrInterpolate(timeAgo(n.created_at))}</div></div>`);
              if (!n.read_at) {
                _push2(`<div class="flex-shrink-0 mt-1.5" data-v-6e6261d4><div class="w-2 h-2 rounded-full bg-primary-500" data-v-6e6261d4></div></div>`);
              } else {
                _push2(`<!---->`);
              }
              _push2(`</div>`);
            });
            _push2(`<!--]--></div>`);
          }
          _push2(`</div><div class="px-4 py-2.5 border-t border-apex-border text-center" data-v-6e6261d4><button class="text-xs text-apex-faint hover:text-apex-text transition-colors" data-v-6e6261d4><i class="fa-solid fa-rotate-right mr-1" data-v-6e6261d4></i>Refresh </button></div></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      if (unref(userMenuOpen)) {
        _push(`<div class="fixed inset-0 z-[9990]" data-v-6e6261d4></div>`);
      } else {
        _push(`<!---->`);
      }
      ssrRenderTeleport(_push, (_push2) => {
        if (unref(userMenuOpen)) {
          _push2(`<div class="${ssrRenderClass([unref(isDark) ? "bg-apex-surface border-apex-border" : "bg-white border-[#3d4f66]", "fixed rounded-xl shadow-2xl overflow-hidden z-[9995] w-56 border-2"])}" style="${ssrRenderStyle(unref(dropdownStyle))}" data-v-6e6261d4><button class="w-full flex items-center gap-3 px-4 py-3 text-sm text-apex-text hover:bg-apex-card transition-colors" data-v-6e6261d4><i class="fa-solid fa-key text-primary-400 w-4 text-center" data-v-6e6261d4></i> Ubah Password </button><button class="w-full flex items-center gap-3 px-4 py-3 text-sm text-apex-text hover:bg-apex-card transition-colors" data-v-6e6261d4><i class="${ssrRenderClass([unref(isDark) ? "fa-regular fa-sun text-yellow-400" : "fa-regular fa-moon text-indigo-400", "w-4 text-center"])}" data-v-6e6261d4></i> ${ssrInterpolate(unref(isDark) ? "Light Mode" : "Dark Mode")}</button><div class="h-px bg-apex-border" data-v-6e6261d4></div><button class="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 font-medium hover:bg-red-50 transition-colors" data-v-6e6261d4><i class="fa-solid fa-right-from-bracket w-4 text-center" data-v-6e6261d4></i> Logout </button></div>`);
        } else {
          _push2(`<!---->`);
        }
      }, "body", false, _parent);
      if (unref(showChangePwd)) {
        _push(`<div class="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-4" data-v-6e6261d4><div class="bg-apex-surface border border-apex-border rounded-xl w-full max-w-sm shadow-2xl" data-v-6e6261d4><div class="flex items-center justify-between p-5 border-b border-apex-border" data-v-6e6261d4><div class="flex items-center gap-2" data-v-6e6261d4><div class="w-8 h-8 rounded-lg bg-primary-900/50 flex items-center justify-center" data-v-6e6261d4><i class="fa-solid fa-key text-primary-400" data-v-6e6261d4></i></div><h3 class="font-semibold text-apex-text" data-v-6e6261d4>Ubah Password</h3></div><button class="btn-ghost btn-xs" data-v-6e6261d4><i class="fa-solid fa-xmark" data-v-6e6261d4></i></button></div><form class="p-5 space-y-4" data-v-6e6261d4><div data-v-6e6261d4><label class="form-label" data-v-6e6261d4>Password Lama</label><div class="relative" data-v-6e6261d4><input${ssrRenderDynamicModel(unref(showOld) ? "text" : "password", unref(pwdForm).old_password, null)}${ssrRenderAttr("type", unref(showOld) ? "text" : "password")} class="form-input pr-10" placeholder="Password saat ini" autocomplete="current-password" data-v-6e6261d4><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-apex-faint hover:text-apex-text" data-v-6e6261d4><i class="${ssrRenderClass(unref(showOld) ? "fa-solid fa-eye-slash" : "fa-solid fa-eye")}" data-v-6e6261d4></i></button></div></div><div data-v-6e6261d4><label class="form-label" data-v-6e6261d4>Password Baru</label><div class="relative" data-v-6e6261d4><input${ssrRenderDynamicModel(unref(showNew) ? "text" : "password", unref(pwdForm).new_password, null)}${ssrRenderAttr("type", unref(showNew) ? "text" : "password")} class="form-input pr-10" placeholder="Min. 8 karakter" autocomplete="new-password" data-v-6e6261d4><button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-apex-faint hover:text-apex-text" data-v-6e6261d4><i class="${ssrRenderClass(unref(showNew) ? "fa-solid fa-eye-slash" : "fa-solid fa-eye")}" data-v-6e6261d4></i></button></div></div><div data-v-6e6261d4><label class="form-label" data-v-6e6261d4>Konfirmasi Password Baru</label><input${ssrRenderDynamicModel(unref(showNew) ? "text" : "password", unref(pwdForm).confirm_password, null)}${ssrRenderAttr("type", unref(showNew) ? "text" : "password")} class="form-input" placeholder="Ulangi password baru" autocomplete="new-password" data-v-6e6261d4></div>`);
        if (unref(pwdForm).new_password) {
          _push(`<div class="space-y-1" data-v-6e6261d4><div class="flex gap-1" data-v-6e6261d4><!--[-->`);
          ssrRenderList(4, (i) => {
            _push(`<div class="${ssrRenderClass([i <= unref(pwdStrength) ? unref(pwdStrengthColor) : "bg-apex-card", "h-1 flex-1 rounded-full transition-all duration-300"])}" data-v-6e6261d4></div>`);
          });
          _push(`<!--]--></div><div class="${ssrRenderClass([unref(pwdStrengthTextColor), "text-xs"])}" data-v-6e6261d4>${ssrInterpolate(unref(pwdStrengthLabel))}</div></div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(pwdError)) {
          _push(`<div class="flex items-center gap-2 bg-red-900/40 border border-red-700/50 rounded-lg px-3 py-2 text-xs text-red-300" data-v-6e6261d4><i class="fa-solid fa-circle-exclamation text-red-400 shrink-0" data-v-6e6261d4></i>${ssrInterpolate(unref(pwdError))}</div>`);
        } else {
          _push(`<!---->`);
        }
        if (unref(pwdSuccess)) {
          _push(`<div class="flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/50 rounded-lg px-3 py-2 text-xs text-emerald-300" data-v-6e6261d4><i class="fa-solid fa-circle-check text-emerald-400 shrink-0" data-v-6e6261d4></i>${ssrInterpolate(unref(pwdSuccess))}</div>`);
        } else {
          _push(`<!---->`);
        }
        _push(`<div class="flex gap-2 justify-end pt-1" data-v-6e6261d4><button type="button" class="btn-secondary" data-v-6e6261d4>Batal</button><button type="submit" class="btn-primary"${ssrIncludeBooleanAttr(unref(savingPwd)) ? " disabled" : ""} data-v-6e6261d4>`);
        if (unref(savingPwd)) {
          _push(`<i class="fa-solid fa-circle-notch fa-spin" data-v-6e6261d4></i>`);
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("layouts/default.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _default = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-6e6261d4"]]);

export { _default as default };
//# sourceMappingURL=default-BQWaHwaF.mjs.map
