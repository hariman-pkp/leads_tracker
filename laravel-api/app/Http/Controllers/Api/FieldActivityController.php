<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FieldActivityController extends Controller
{
    // Normalisasi timestamp ke WIB: jika ada Z/+offset (UTC/timezone aware) → convert ke WIB.
    // Jika tidak ada timezone marker → asumsikan sudah WIB (web client, server local).
    private static function toWib(?string $ts): string
    {
        if (!$ts) return now()->format('Y-m-d H:i:s');
        try {
            if (preg_match('/Z$|[+-]\d{2}:\d{2}$/', trim($ts))) {
                return \Carbon\Carbon::parse($ts)->setTimezone('Asia/Jakarta')->format('Y-m-d H:i:s');
            }
            return \Carbon\Carbon::parse($ts, 'Asia/Jakarta')->format('Y-m-d H:i:s');
        } catch (\Exception $e) {
            return now()->format('Y-m-d H:i:s');
        }
    }

    // ── GET /api/v1/field-activity/stats ─────────────────────────────────
    public function stats()
    {
        $today     = now()->toDateString();
        $weekStart = now()->startOfWeek()->toDateString();

        $today_count = (int) DB::selectOne(
            "SELECT COUNT(DISTINCT id) as c FROM visit_logs
             WHERE DATE(checked_in_at) = ?", [$today]
        )->c;

        $active_count = (int) DB::selectOne(
            "SELECT COUNT(*) as c FROM visit_logs
             WHERE DATE(checked_in_at) = ? AND checked_out_at IS NULL AND type != 'check_out'", [$today]
        )->c;

        $avg_duration = (float) DB::selectOne(
            "SELECT COALESCE(AVG(duration_minutes), 0) as avg FROM visit_logs
             WHERE DATE(checked_in_at) = ? AND duration_minutes IS NOT NULL", [$today]
        )->avg;

        $week_count = (int) DB::selectOne(
            "SELECT COUNT(*) as c FROM visit_logs
             WHERE DATE(checked_in_at) >= ?", [$weekStart]
        )->c;

        $month_count = (int) DB::selectOne(
            "SELECT COUNT(*) as c FROM visit_logs
             WHERE DATE_TRUNC('month', checked_in_at) = DATE_TRUNC('month', NOW())"
        )->c;

        // Per-hari minggu ini (untuk mini chart)
        $daily = DB::select(
            "SELECT DATE(checked_in_at) as tgl, COUNT(*) as jumlah
             FROM visit_logs
             WHERE DATE(checked_in_at) >= ?
             GROUP BY DATE(checked_in_at)
             ORDER BY tgl", [$weekStart]
        );

        return response()->json([
            'today_count'  => $today_count,
            'active_count' => $active_count,
            'avg_duration' => round($avg_duration),
            'week_count'   => $week_count,
            'month_count'  => $month_count,
            'daily'        => array_map(fn($r) => (array)$r, $daily),
        ]);
    }

    // ── GET /api/v1/field-activity/monitor ───────────────────────────────
    // Dashboard monitoring: summary + tabel + rekap per sales untuk periode tertentu
    public function monitor(Request $request)
    {
        $dateFrom = $request->query('date_from', now()->toDateString());
        $dateTo   = $request->query('date_to',   now()->toDateString());
        $userId   = $request->query('user_id', '');

        $params = [$dateFrom, $dateTo];
        $userFilter = '';
        if ($userId) { $userFilter = ' AND vl.user_id = ?'; $params[] = (int)$userId; }

        // ── Summary KPI ──────────────────────────────────────────────────
        $summary = DB::selectOne("
            SELECT
                COUNT(*) FILTER (WHERE vl.type = 'check_out')        AS total_kunjungan,
                COUNT(DISTINCT vl.user_id)                           AS total_sales,
                COUNT(DISTINCT DATE(vl.checked_in_at))
                    FILTER (WHERE vl.type = 'check_out')             AS total_hari,
                COALESCE(ROUND(AVG(LEAST(vl.duration_minutes, 720)) FILTER
                    (WHERE vl.type = 'check_out' AND vl.duration_minutes > 0))::integer, 0) AS avg_durasi,
                COALESCE(SUM(LEAST(vl.duration_minutes, 720))
                    FILTER (WHERE vl.type = 'check_out' AND vl.duration_minutes > 0), 0) AS total_durasi,
                COUNT(*) FILTER (WHERE vl.type = 'check_out')         AS completed,
                COUNT(*) FILTER (WHERE vl.type != 'check_out')        AS on_going
            FROM visit_logs vl
            WHERE DATE(vl.checked_in_at) BETWEEN ? AND ?
            $userFilter
        ", $params);

        // ── Top 5 sales paling aktif ─────────────────────────────────────
        $topSales = DB::select("
            SELECT u.nama,
                   COUNT(*) FILTER (WHERE vl.type = 'check_out') AS kunjungan,
                   COALESCE(ROUND(AVG(LEAST(vl.duration_minutes, 720)) FILTER
                       (WHERE vl.type = 'check_out' AND vl.duration_minutes > 0))::integer, 0) AS avg_durasi,
                   COALESCE(SUM(LEAST(vl.duration_minutes, 720))
                       FILTER (WHERE vl.type = 'check_out' AND vl.duration_minutes > 0), 0) AS total_durasi
            FROM visit_logs vl
            JOIN users u ON u.id = vl.user_id
            WHERE DATE(vl.checked_in_at) BETWEEN ? AND ?
            $userFilter
            GROUP BY vl.user_id, u.nama
            ORDER BY kunjungan DESC
            LIMIT 5
        ", $params);

        // ── Tabel aktivitas detail ───────────────────────────────────────
        $activities = DB::select("
            SELECT vl.id, vl.user_id, u.nama AS sales_nama,
                   vl.lead_id, l.nama_company AS client_nama,
                   vl.address, vl.notes,
                   vl.latitude, vl.longitude,
                   vl.checkout_latitude, vl.checkout_longitude,
                   vl.photo_url,
                   vl.checked_in_at, vl.checked_out_at,
                   vl.duration_minutes,
                   DATE(vl.checked_in_at) AS tgl,
                   CASE
                     WHEN vl.latitude IS NOT NULL
                       AND vl.longitude IS NOT NULL
                       AND vl.checkout_latitude IS NOT NULL
                       AND vl.checkout_longitude IS NOT NULL
                     THEN ROUND((
                       6371 * 2 * ASIN(SQRT(
                         POWER(SIN(RADIANS(vl.checkout_latitude  - vl.latitude)  / 2), 2) +
                         COS(RADIANS(vl.latitude)) * COS(RADIANS(vl.checkout_latitude)) *
                         POWER(SIN(RADIANS(vl.checkout_longitude - vl.longitude) / 2), 2)
                       ))
                     )::numeric, 2)
                     ELSE NULL
                   END AS distance_km
            FROM visit_logs vl
            JOIN users u ON u.id = vl.user_id
            LEFT JOIN leads l ON l.lead_id = vl.lead_id
            WHERE DATE(vl.checked_in_at) BETWEEN ? AND ?
            $userFilter
            ORDER BY vl.checked_in_at DESC
            LIMIT 200
        ", $params);

        // ── Rekap harian per sales (untuk chart & tabel rekap) ───────────
        $dailyRecap = DB::select("
            SELECT DATE(vl.checked_in_at) AS tgl, u.nama AS sales_nama,
                   COUNT(*) AS kunjungan,
                   COALESCE(SUM(vl.duration_minutes), 0) AS total_durasi
            FROM visit_logs vl
            JOIN users u ON u.id = vl.user_id
            WHERE DATE(vl.checked_in_at) BETWEEN ? AND ?
            $userFilter
            GROUP BY DATE(vl.checked_in_at), vl.user_id, u.nama
            ORDER BY tgl, u.nama
        ", $params);

        // ── Rekap per sales (agregat keseluruhan periode) ────────────────
        $salesRecap = DB::select("
            SELECT u.id AS user_id, u.nama AS sales_nama,
                   COUNT(*) FILTER (WHERE vl.type = 'check_out') AS total_kunjungan,
                   COUNT(DISTINCT DATE(vl.checked_in_at)) FILTER (WHERE vl.type = 'check_out') AS hari_aktif,
                   COALESCE(SUM(LEAST(vl.duration_minutes, 720))
                       FILTER (WHERE vl.type = 'check_out' AND vl.duration_minutes > 0), 0) AS total_durasi,
                   COALESCE(ROUND(AVG(LEAST(vl.duration_minutes, 720))
                       FILTER (WHERE vl.type = 'check_out' AND vl.duration_minutes > 0))::integer, 0) AS avg_durasi,
                   COUNT(*) FILTER (WHERE vl.type != 'check_out') AS belum_checkout
            FROM visit_logs vl
            JOIN users u ON u.id = vl.user_id
            WHERE DATE(vl.checked_in_at) BETWEEN ? AND ?
            $userFilter
            GROUP BY vl.user_id, u.id, u.nama
            ORDER BY total_kunjungan DESC
        ", $params);

        // ── Timeline data (per entry, untuk gantt/timeline bar) ──────────
        $timeline = DB::select("
            SELECT vl.id, vl.user_id, u.nama AS sales_nama,
                   vl.lead_id, l.nama_company AS client_nama,
                   l.product AS product,
                   vl.address,
                   vl.checked_in_at, vl.checked_out_at,
                   vl.duration_minutes, DATE(vl.checked_in_at) AS tgl
            FROM visit_logs vl
            JOIN users u ON u.id = vl.user_id
            LEFT JOIN leads l ON l.lead_id = vl.lead_id
            WHERE DATE(vl.checked_in_at) BETWEEN ? AND ?
              AND vl.checked_in_at IS NOT NULL
            $userFilter
            ORDER BY vl.user_id, vl.checked_in_at
        ", $params);

        // ── Peta: semua titik kunjungan dalam periode ────────────────────
        $mapPoints = DB::select("
            SELECT vl.user_id, u.nama AS sales_nama,
                   vl.latitude, vl.longitude, vl.address,
                   vl.checked_in_at, vl.lead_id,
                   l.nama_company AS client_nama,
                   l.product AS product,
                   vl.duration_minutes
            FROM visit_logs vl
            JOIN users u ON u.id = vl.user_id
            LEFT JOIN leads l ON l.lead_id = vl.lead_id
            WHERE DATE(vl.checked_in_at) BETWEEN ? AND ?
              AND vl.latitude IS NOT NULL AND vl.longitude IS NOT NULL
            $userFilter
            ORDER BY vl.checked_in_at
        ", $params);

        // Daftar sales untuk filter dropdown
        $salesList = DB::select(
            "SELECT id, nama FROM users WHERE is_active = 1 ORDER BY nama"
        );

        return response()->json([
            'summary'     => (array)$summary,
            'top_sales'   => array_map(fn($r) => (array)$r, $topSales),
            'activities'  => array_map(fn($r) => (array)$r, $activities),
            'daily_recap' => array_map(fn($r) => (array)$r, $dailyRecap),
            'sales_recap' => array_map(fn($r) => (array)$r, $salesRecap),
            'timeline'    => array_map(fn($r) => (array)$r, $timeline),
            'map_points'  => array_map(fn($r) => (array)$r, $mapPoints),
            'sales_list'  => array_map(fn($r) => (array)$r, $salesList),
            'date_from'   => $dateFrom,
            'date_to'     => $dateTo,
        ]);
    }

    // ── GET /api/v1/field-activity/map ────────────────────────────────────
    // Posisi terakhir per sales hari ini + status aktif/tidak
    public function map()
    {
        $today = now()->toDateString();

        // Posisi terakhir tiap sales hari ini (semua, termasuk tanpa koordinat)
        $positions = DB::select("
            SELECT DISTINCT ON (vl.user_id)
                vl.id, vl.user_id, u.nama as sales_nama,
                vl.latitude, vl.longitude, vl.address,
                vl.type, vl.checked_in_at, vl.checked_out_at,
                vl.lead_id, l.nama_company as client_nama,
                vl.notes,
                CASE WHEN vl.checked_out_at IS NULL AND vl.type != 'check_out'
                     THEN true ELSE false END as is_active
            FROM visit_logs vl
            JOIN users u ON u.id = vl.user_id
            LEFT JOIN leads l ON l.lead_id = vl.lead_id
            WHERE DATE(vl.checked_in_at) = ?
            ORDER BY vl.user_id, vl.checked_in_at DESC
        ", [$today]);

        // Semua titik kunjungan hari ini untuk trail/polyline
        $trails = DB::select("
            SELECT vl.user_id, vl.latitude, vl.longitude,
                   vl.checked_in_at, vl.type
            FROM visit_logs vl
            WHERE DATE(vl.checked_in_at) = ?
              AND vl.latitude IS NOT NULL
            ORDER BY vl.user_id, vl.checked_in_at ASC
        ", [$today]);

        return response()->json([
            'positions' => array_map(fn($r) => (array)$r, $positions),
            'trails'    => array_map(fn($r) => (array)$r, $trails),
        ]);
    }

    // ── GET /api/v1/field-activity ────────────────────────────────────────
    // List visit logs dengan filter
    public function index(Request $request)
    {
        $auth    = $request->attributes->get('auth_user', []);
        $date    = $request->query('date', now()->toDateString());
        $type    = $request->query('type', '');
        $page    = (int) $request->query('page', 1);
        $perPage = max(1, min(100, (int) $request->query('per_page', 25)));
        $offset  = ($page - 1) * $perPage;

        // Sales hanya bisa lihat data milik sendiri; Manager/Admin bisa filter by user_id
        $isSalesOnly = $auth['is_sales_only'] ?? false;
        if ($isSalesOnly) {
            $userId = (string) ($auth['id'] ?? '');
        } else {
            $userId = $request->query('user_id', '');
        }

        $where  = ['1=1'];
        $params = [];

        if ($date) {
            $where[]  = 'DATE(vl.checked_in_at) = ?';
            $params[] = $date;
        }
        if ($userId) {
            $where[]  = 'vl.user_id = ?';
            $params[] = (int)$userId;
        }
        if ($type) {
            $where[]  = 'vl.type = ?';
            $params[] = $type;
        }

        $whereStr = implode(' AND ', $where);

        $total = (int) DB::selectOne(
            "SELECT COUNT(*) as c FROM visit_logs vl WHERE $whereStr",
            $params
        )->c;

        $rows = DB::select(
            "SELECT vl.id, vl.user_id, u.nama as sales_nama,
                    vl.lead_id, l.nama_company as client_nama, l.product,
                    vl.type, vl.latitude, vl.longitude, vl.address,
                    vl.notes, vl.photo_url, vl.checked_in_at, vl.checked_out_at,
                    vl.duration_minutes, vl.accuracy_m
             FROM visit_logs vl
             JOIN users u ON u.id = vl.user_id
             LEFT JOIN leads l ON l.lead_id = vl.lead_id
             WHERE $whereStr
             ORDER BY vl.checked_in_at DESC
             LIMIT ? OFFSET ?",
            array_merge($params, [$perPage, $offset])
        );

        return response()->json([
            'data'  => array_map(fn($r) => (array)$r, $rows),
            'total' => $total,
            'page'  => $page,
            'per_page'    => $perPage,
            'total_pages' => (int) ceil($total / $perPage),
        ]);
    }

    // ── POST /api/v1/field-activity/checkin ──────────────────────────────
    public function checkin(Request $request)
    {
        $request->validate([
            'user_id'  => 'required|integer',
            'latitude' => 'nullable|numeric',
            'longitude'=> 'nullable|numeric',
        ]);

        // Simpan foto check-in jika ada (base64 PNG)
        $photoPath = null;
        $photoBase64 = $request->input('photo_base64');
        if ($photoBase64) {
            $imgData = base64_decode($photoBase64, true);
            if ($imgData !== false) {
                $dir = storage_path('app/public/checkin-photos');
                if (!is_dir($dir)) mkdir($dir, 0755, true);
                $filename  = 'checkin_' . $request->input('user_id') . '_' . time() . '.png';
                file_put_contents("$dir/$filename", $imgData);
                $photoPath = 'checkin-photos/' . $filename;
            }
        }

        $id = DB::table('visit_logs')->insertGetId([
            'user_id'       => $request->input('user_id'),
            'lead_id'       => $request->input('lead_id'),
            'type'          => 'check_in',
            'latitude'      => $request->input('latitude'),
            'longitude'     => $request->input('longitude'),
            'address'       => $request->input('address'),
            'accuracy_m'    => $request->input('accuracy_m'),
            'notes'         => $request->input('notes'),
            'photo_url'     => $photoPath,
            'checked_in_at' => self::toWib($request->input('checked_in_at')),
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // Auto-done: tandai rencana kunjungan planned hari ini untuk lead yang sama
        $leadId = $request->input('lead_id');
        $userId = $request->input('user_id');
        if ($leadId) {
            DB::update("
                UPDATE visit_plans
                SET status = 'done', visit_log_id = ?, updated_at = NOW()
                WHERE user_id = ? AND lead_id = ?
                  AND planned_date = CURRENT_DATE AND status = 'planned'
            ", [$id, $userId, $leadId]);
        }

        return response()->json(['message' => 'Check-in berhasil dicatat.', 'id' => $id], 201);
    }

    // ── PUT /api/v1/field-activity/{id}/checkout ─────────────────────────
    public function checkout(Request $request, int $id)
    {
        $log = DB::selectOne("SELECT * FROM visit_logs WHERE id=?", [$id]);
        if (!$log) return response()->json(['message' => 'Data tidak ditemukan.'], 404);

        $checkedOutAt = self::toWib($request->input('checked_out_at'));
        $duration     = null;

        if ($log->checked_in_at) {
            $inTime  = new \DateTime($log->checked_in_at);
            $outTime = new \DateTime($checkedOutAt);
            $diff    = $inTime->diff($outTime);
            $duration = max(0, $diff->days * 1440 + $diff->h * 60 + $diff->i);
        }

        $updateData = [
            'checked_out_at'   => $checkedOutAt,
            'duration_minutes' => $duration,
            'notes'            => $request->input('notes', $log->notes),
            'type'             => 'check_out',
            'updated_at'       => now(),
        ];

        if ($request->filled('checkout_latitude'))  $updateData['checkout_latitude']  = (float)$request->input('checkout_latitude');
        if ($request->filled('checkout_longitude')) $updateData['checkout_longitude'] = (float)$request->input('checkout_longitude');

        DB::table('visit_logs')->where('id', $id)->update($updateData);

        return response()->json([
            'message'          => 'Check-out berhasil dicatat.',
            'duration_minutes' => $duration,
        ]);
    }

    // ── DELETE /api/v1/field-activity/{id} ───────────────────────────────
    public function destroy(int $id)
    {
        DB::table('visit_logs')->where('id', $id)->delete();
        return response()->json(['message' => 'Data kunjungan dihapus.']);
    }

    // ── GET /api/v1/field-activity/users ─────────────────────────────────
    public function users()
    {
        $rows = DB::select(
            "SELECT id, nama, role FROM users WHERE is_active = 1 ORDER BY nama"
        );
        return response()->json(array_map(fn($r) => (array)$r, $rows));
    }
}
