<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MasterController extends Controller
{
    // ── ROLES ─────────────────────────────────────────────────────────────
    public function roles()
    {
        $rows = DB::select("SELECT * FROM roles ORDER BY id");
        return response()->json(array_map(fn($r) => (array)$r, $rows));
    }

    public function updateRole(Request $request, int $id)
    {
        $d = $request->all();
        DB::update("UPDATE roles SET nama=? WHERE id=?", [$d['nama'], $id]);
        return response()->json(['message' => 'Role diupdate.']);
    }

    // ── USERS ─────────────────────────────────────────────────────────────
    public function users()
    {
        $rows = DB::select(
            "SELECT u.id, u.nama, u.email, u.is_active, u.role_id, r.nama as role_nama,
                    COALESCE(u.location_tracking_enabled, TRUE) as location_tracking_enabled
             FROM users u LEFT JOIN roles r ON u.role_id=r.id
             ORDER BY u.nama"
        );
        return response()->json(array_map(fn($r) => (array)$r, $rows));
    }

    public function updateUser(Request $request, int $id)
    {
        $d      = $request->all();
        $fields = ['nama','email','role_id','is_active','location_tracking_enabled'];
        $sets   = [];
        $params = [];

        foreach ($fields as $f) {
            if (array_key_exists($f, $d)) {
                $sets[]   = "$f = ?";
                $params[] = $d[$f];
            }
        }
        if (isset($d['password']) && $d['password']) {
            $sets[]   = "password = ?";
            $params[] = $d['password'];
        }

        $params[] = $id;
        DB::update("UPDATE users SET " . implode(', ', $sets) . " WHERE id=?", $params);
        return response()->json(['message' => 'User diupdate.']);
    }

    // ── SALES LIST ────────────────────────────────────────────────────────
    public function sales()
    {
        $rows = DB::select(
            "SELECT u.id, u.nama, u.email, u.is_active, r.nama as role_nama
             FROM users u LEFT JOIN roles r ON u.role_id=r.id
             ORDER BY u.nama"
        );
        return response()->json(array_map(fn($r) => (array)$r, $rows));
    }

    // ── MENUS ─────────────────────────────────────────────────────────────
    public static function allMenus(): array
    {
        return [
            ['key'=>'today',        'label'=>'Hari Ini',           'url'=>'/today',              'icon'=>'fa-bolt',           'group'=>'Aktivitas'],
            ['key'=>'schedule',     'label'=>'FU Schedule',        'url'=>'/schedule',           'icon'=>'fa-calendar-check', 'group'=>'Aktivitas'],
            ['key'=>'followup',     'label'=>'Follow-Up Log',      'url'=>'/followup',           'icon'=>'fa-phone-alt',      'group'=>'Aktivitas'],
            ['key'=>'field_activity','label'=>'Field Activity',    'url'=>'/field-activity',     'icon'=>'fa-map-marked-alt', 'group'=>'Aktivitas'],
            ['key'=>'field_monitor','label'=>'Field Monitor',      'url'=>'/field-monitor',      'icon'=>'fa-satellite-dish', 'group'=>'Aktivitas'],
            ['key'=>'daily_report', 'label'=>'Laporan Harian',     'url'=>'/daily-report',       'icon'=>'fa-clipboard-list', 'group'=>'Aktivitas'],
            ['key'=>'dashboard',    'label'=>'Dashboard',          'url'=>'/',                   'icon'=>'fa-tachometer-alt', 'group'=>'Pipeline CRM'],
            ['key'=>'pipeline',     'label'=>'Pipeline',           'url'=>'/pipeline',           'icon'=>'fa-funnel-dollar',  'group'=>'Pipeline CRM'],
            ['key'=>'contacts',     'label'=>'Contacts',           'url'=>'/contacts',           'icon'=>'fa-address-book',   'group'=>'Pipeline CRM'],
            ['key'=>'winloss',      'label'=>'Win / Loss',         'url'=>'/winloss',            'icon'=>'fa-trophy',         'group'=>'Pipeline CRM'],
            ['key'=>'insights',     'label'=>'Pipeline Insights',  'url'=>'/insights',           'icon'=>'fa-lightbulb',      'group'=>'Pipeline CRM'],
            ['key'=>'rev_dashboard','label'=>'Revenue Dashboard',  'url'=>'/revenue',            'icon'=>'fa-chart-bar',      'group'=>'Revenue LOB'],
            ['key'=>'rev_insights', 'label'=>'Revenue Insights',   'url'=>'/revenue/insights',   'icon'=>'fa-lightbulb',      'group'=>'Revenue LOB'],
            ['key'=>'rev_tracker',  'label'=>'Revenue Tracker',    'url'=>'/revenue/tracker',    'icon'=>'fa-tasks',          'group'=>'Revenue LOB'],
            ['key'=>'rev_monthly',  'label'=>'Monthly Monitoring', 'url'=>'/revenue/monthly',    'icon'=>'fa-calendar-alt',   'group'=>'Revenue LOB'],
            ['key'=>'rev_invoice',  'label'=>'Invoice & Payment',  'url'=>'/revenue/invoice',    'icon'=>'fa-file-invoice',   'group'=>'Revenue LOB'],
            ['key'=>'rev_kpi',      'label'=>'KPI Prospecting',    'url'=>'/revenue/kpi',        'icon'=>'fa-bullseye',       'group'=>'Revenue LOB'],
            ['key'=>'rev_budget',   'label'=>'Budget Monitoring',  'url'=>'/revenue/budget',     'icon'=>'fa-wallet',         'group'=>'Revenue LOB'],
            ['key'=>'import',       'label'=>'Import Data',        'url'=>'/import',             'icon'=>'fa-file-import',    'group'=>'Master Data'],
            ['key'=>'products',     'label'=>'Master Produk',      'url'=>'/master/produk',      'icon'=>'fa-box',            'group'=>'Master Data'],
            ['key'=>'org',          'label'=>'Master Organisasi',  'url'=>'/master/organisasi',  'icon'=>'fa-building',       'group'=>'Master Data'],
            ['key'=>'sales',        'label'=>'Master Sales',       'url'=>'/sales',              'icon'=>'fa-users',          'group'=>'Master Data'],
            ['key'=>'roles',        'label'=>'Role & Menu',        'url'=>'/roles',              'icon'=>'fa-shield-alt',     'group'=>'Master Data'],
            ['key'=>'users',        'label'=>'Master Users',       'url'=>'/users',              'icon'=>'fa-user-cog',       'group'=>'Master Data'],
        ];
    }

    public function menus()
    {
        return response()->json(self::allMenus());
    }

    public function updateMenu(Request $request, int $id)
    {
        // menus are static; this endpoint is for role_menus management
        return response()->json(['message' => 'Menu definitions are static.'], 200);
    }

    // ── ROLE MENUS ────────────────────────────────────────────────────────
    public function roleMenus(int $id)
    {
        $rows = DB::select("SELECT menu_key FROM role_menus WHERE role_id = ?", [$id]);
        return response()->json(array_column($rows, 'menu_key'));
    }

    public function updateRoleMenus(Request $request, int $id)
    {
        $keys = $request->input('menus', []);
        DB::delete("DELETE FROM role_menus WHERE role_id = ?", [$id]);
        foreach ($keys as $key) {
            DB::insert("INSERT INTO role_menus (role_id, menu_key) VALUES (?,?)", [$id, $key]);
        }
        return response()->json(['message' => 'Role menus diupdate.']);
    }

    // ── CREATE USER ───────────────────────────────────────────────────────
    public function createUser(Request $request)
    {
        $d = $request->all();
        $exists = DB::selectOne("SELECT id FROM users WHERE email=?", [$d['email']]);
        if ($exists) {
            return response()->json(['detail' => 'Email sudah terdaftar.'], 422);
        }
        $pass = hash('sha256', $d['password'] ?? 'password123');
        DB::insert(
            "INSERT INTO users (nama, email, password, role_id, is_active) VALUES (?,?,?,?,?)",
            [$d['nama'], $d['email'], $pass, $d['role_id'] ?? 3, $d['is_active'] ?? 1]
        );
        return response()->json(['message' => 'User berhasil dibuat.'], 201);
    }

    public function deleteUser(int $id)
    {
        DB::delete("DELETE FROM users WHERE id=?", [$id]);
        return response()->json(['message' => 'User dihapus.']);
    }

    // ── MENUS per USER ────────────────────────────────────────────────────
    public function userMenus(Request $request)
    {
        $user   = $request->attributes->get('auth_user');
        $roleId = $user['role_id'] ?? 0;

        $roleMenus = DB::select(
            "SELECT menu_key FROM role_menus WHERE role_id = ?",
            [$roleId]
        );
        $allowed = array_column($roleMenus, 'menu_key');

        $groups = [];
        foreach (self::allMenus() as $m) {
            if (!in_array($m['key'], $allowed)) continue;
            $g = $m['group'];
            if (!isset($groups[$g])) $groups[$g] = [];
            $groups[$g][] = $m;
        }

        return response()->json($groups);
    }
}
