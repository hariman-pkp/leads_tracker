/**
 * composables/useNavMenus.ts
 * Definisi menu hardcoded (sama dengan MasterController::allMenus() di Laravel).
 * Sidebar cukup filter berdasarkan allowed_menus dari auth store —
 * tidak perlu API call, tidak ada timing issue, tidak ada SSR error.
 */

export const GROUP_ORDER = [
  'Aktivitas',
  'Pipeline CRM',
  'Entertain',
  'Revenue LOB',
  'Master Data',
  'Utilitas',
]

const ALL_MENUS = [
  { key: 'today',        label: 'Hari Ini',          url: '/today',            icon: 'fa-bolt',           group: 'Aktivitas'    },
  { key: 'schedule',     label: 'FU Schedule',        url: '/schedule',         icon: 'fa-calendar-check', group: 'Aktivitas'    },
  { key: 'followup',     label: 'Follow-Up Log',      url: '/followup',         icon: 'fa-phone-alt',      group: 'Aktivitas'    },
  { key: 'field_activity', label: 'Field Activity',   url: '/field-activity',   icon: 'fa-map-location-dot', group: 'Aktivitas'  },
  { key: 'field_monitor', label: 'Field Monitor',    url: '/field-monitor',    icon: 'fa-chart-line',       group: 'Aktivitas'  },
  { key: 'daily_report',  label: 'Laporan Harian',   url: '/daily-report',     icon: 'fa-clipboard-list',   group: 'Aktivitas'  },
  { key: 'dashboard',    label: 'Dashboard',          url: '/',                 icon: 'fa-tachometer-alt', group: 'Pipeline CRM' },
  { key: 'pipeline',     label: 'Pipeline',           url: '/pipeline',         icon: 'fa-funnel-dollar',  group: 'Pipeline CRM' },
  { key: 'contacts',     label: 'Contacts',           url: '/contacts',         icon: 'fa-address-book',   group: 'Pipeline CRM' },
  { key: 'winloss',      label: 'Win / Loss',         url: '/winloss',          icon: 'fa-trophy',         group: 'Pipeline CRM' },
  { key: 'insights',     label: 'Pipeline Insights',  url: '/insights',         icon: 'fa-lightbulb',      group: 'Pipeline CRM' },
  { key: 'forecast',     label: 'Pipeline Forecast',  url: '/forecast',         icon: 'fa-chart-line',     group: 'Pipeline CRM' },
  { key: 'heatmap',      label: 'Activity Heatmap',   url: '/heatmap',          icon: 'fa-fire',           group: 'Pipeline CRM' },
  { key: 'sales_target', label: 'Target Sales',       url: '/sales-target',     icon: 'fa-bullseye',       group: 'Pipeline CRM' },
  { key: 'rev_annual_target', label: 'Annual Target',  url: '/revenue/annual-target', icon: 'fa-flag-checkered', group: 'Revenue LOB' },
  { key: 'rev_dashboard',label: 'Revenue Dashboard',  url: '/revenue',          icon: 'fa-chart-bar',      group: 'Revenue LOB'  },
  { key: 'rev_insights', label: 'Revenue Insights',   url: '/revenue/insights', icon: 'fa-lightbulb',      group: 'Revenue LOB'  },
  { key: 'rev_tracker',  label: 'Revenue Tracker',    url: '/revenue/tracker',  icon: 'fa-tasks',          group: 'Revenue LOB'  },
  { key: 'rev_monthly',  label: 'Monthly Monitoring', url: '/revenue/monthly',  icon: 'fa-calendar-alt',   group: 'Revenue LOB'  },
  { key: 'rev_proj_view',label: 'Project View',       url: '/revenue/project-view', icon: 'fa-table-cells', group: 'Revenue LOB'  },
  { key: 'rev_invoice',  label: 'Invoice & Payment',  url: '/revenue/invoice',  icon: 'fa-file-invoice',   group: 'Revenue LOB'  },
  { key: 'rev_kpi',      label: 'KPI Prospecting',    url: '/revenue/kpi',      icon: 'fa-bullseye',       group: 'Revenue LOB'  },
  { key: 'rev_budget',   label: 'Budget Monitoring',  url: '/revenue/budget',   icon: 'fa-wallet',         group: 'Revenue LOB'  },
  { key: 'export',       label: 'Export Data',        url: '/export',           icon: 'fa-file-arrow-down',group: 'Utilitas'     },
  { key: 'import',       label: 'Upload Data',        url: '/import',           icon: 'fa-file-arrow-up',  group: 'Utilitas'     },
  { key: 'products',     label: 'Master Produk',      url: '/master/produk',    icon: 'fa-box-open',       group: 'Master Data'  },
  { key: 'org',          label: 'Master Organisasi',  url: '/master/organisasi',icon: 'fa-sitemap',        group: 'Master Data'  },
  { key: 'sales',        label: 'Master Sales',       url: '/sales',            icon: 'fa-users',          group: 'Master Data'  },
  { key: 'roles',        label: 'Role & Menu',        url: '/roles',            icon: 'fa-shield-alt',     group: 'Master Data'  },
  { key: 'users',        label: 'Master Users',       url: '/users',            icon: 'fa-user-cog',       group: 'Master Data'  },
  { key: 'settings',    label: 'Pengaturan',         url: '/settings',         icon: 'fa-gear',           group: 'Master Data'  },
  { key: 'cleansing',  label: 'Data Cleansing',     url: '/admin/cleansing',  icon: 'fa-broom',          group: 'Master Data'  },
  { key: 'entertain',          label: 'Dashboard Entertain', url: '/entertain',          icon: 'fa-utensils',       group: 'Entertain'    },
  { key: 'entertain_claims',   label: 'Klaim Saya',          url: '/entertain/claims',   icon: 'fa-receipt',        group: 'Entertain'    },
  { key: 'entertain_approval', label: 'Approval Klaim',      url: '/entertain/approval', icon: 'fa-circle-check',   group: 'Entertain'    },
]

export function useNavMenus() {
  const auth = useAuthStore()

  const navGroups = computed(() => {
    const allowed = auth.user?.allowed_menus ?? []
    const isAdmin = auth.user?.role_id === 1
    const groups: Record<string, { name: string; menus: typeof ALL_MENUS }> = {}

    for (const m of ALL_MENUS) {
      if (!isAdmin && !allowed.includes(m.key)) continue
      if (!groups[m.group]) groups[m.group] = { name: m.group, menus: [] }
      groups[m.group].menus.push(m)
    }

    // Urutkan sesuai GROUP_ORDER
    return GROUP_ORDER
      .filter(g => groups[g])
      .map(g => groups[g])
  })

  return { navGroups }
}
