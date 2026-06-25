<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * LocationController
 *
 * RBAC:
 *   POST   /v1/location              → semua role (simpan posisi sendiri)
 *   GET    /v1/location/me           → semua role (trail posisi sendiri hari ini)
 *   GET    /v1/location/team         → Manager & Admin saja
 *   GET    /v1/location/team/trails  → Manager & Admin saja
 */
class LocationController extends Controller
{
    private function authUser(Request $request): array
    {
        return $request->attributes->get('auth_user', []);
    }

    // ── GET /v1/location/settings ─────────────────────────────────────────
    // Mobile app cek apakah tracking diaktifkan untuk user ini
    public function settings(Request $request)
    {
        $auth = $this->authUser($request);
        $user = DB::selectOne(
            "SELECT location_tracking_enabled FROM users WHERE id = ?",
            [$auth['id']]
        );
        $enabled = $user ? (bool)$user->location_tracking_enabled : true;
        return response()->json(['location_tracking_enabled' => $enabled]);
    }

    // ── POST /v1/location ─────────────────────────────────────────────────
    // Sales kirim posisi GPS-nya (dipanggil dari mobile app secara periodik)
    public function store(Request $request)
    {
        $request->validate([
            'latitude'  => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $auth = $this->authUser($request);

        // Cek apakah tracking diaktifkan untuk user ini
        $user = DB::selectOne(
            "SELECT location_tracking_enabled FROM users WHERE id = ?",
            [$auth['id']]
        );
        if ($user && !(bool)$user->location_tracking_enabled) {
            return response()->json(['message' => 'Location tracking dinonaktifkan untuk akun ini.'], 403);
        }

        DB::table('location_logs')->insert([
            'user_id'    => $auth['id'],
            'latitude'   => $request->input('latitude'),
            'longitude'  => $request->input('longitude'),
            'accuracy_m' => $request->input('accuracy_m'),
            'speed_kmh'  => $request->input('speed_kmh'),
            'recorded_at'=> $request->input('recorded_at', now()),
            'created_at' => now(),
        ]);

        return response()->json(['message' => 'Lokasi berhasil disimpan.'], 201);
    }

    // ── GET /v1/location/me ───────────────────────────────────────────────
    // Trail pergerakan sales sendiri hari ini
    public function me(Request $request)
    {
        $auth  = $this->authUser($request);
        $date  = $request->query('date', now()->toDateString());

        $trail = DB::select(
            "SELECT id, latitude, longitude, accuracy_m, speed_kmh, recorded_at
             FROM location_logs
             WHERE user_id = ? AND DATE(recorded_at) = ?
             ORDER BY recorded_at ASC",
            [$auth['id'], $date]
        );

        // Hitung estimasi jarak tempuh (km)
        $distanceKm = $this->calcDistance(array_map(fn($r) => (array) $r, $trail));

        return response()->json([
            'user_id'     => $auth['id'],
            'date'        => $date,
            'trail'       => array_map(fn($r) => (array) $r, $trail),
            'total_points'=> count($trail),
            'distance_km' => round($distanceKm, 2),
        ]);
    }

    // ── GET /v1/location/team ─────────────────────────────────────────────
    // Posisi terakhir semua sales — HANYA Manager & Admin
    public function team(Request $request)
    {
        $auth = $this->authUser($request);

        if ($auth['is_sales_only'] ?? false) {
            return response()->json(['detail' => 'Akses tidak diizinkan untuk role Sales.'], 403);
        }

        $date = $request->query('date', now()->toDateString());

        // Posisi terakhir per user hari ini
        $positions = DB::select("
            SELECT DISTINCT ON (ll.user_id)
                ll.user_id,
                u.nama       AS sales_nama,
                u.role_id,
                ll.latitude,
                ll.longitude,
                ll.accuracy_m,
                ll.recorded_at,
                vl.type      AS activity_status,
                vl.lead_id,
                l.nama_company AS client_nama
            FROM location_logs ll
            JOIN users u ON u.id = ll.user_id
            LEFT JOIN LATERAL (
                SELECT type, lead_id
                FROM visit_logs
                WHERE user_id = ll.user_id
                  AND DATE(checked_in_at) = ?
                ORDER BY checked_in_at DESC
                LIMIT 1
            ) vl ON true
            LEFT JOIN leads l ON l.lead_id = vl.lead_id
            WHERE DATE(ll.recorded_at) = ?
            ORDER BY ll.user_id, ll.recorded_at DESC
        ", [$date, $date]);

        // Sales yang offline (tidak ada data location hari ini)
        $activeSalesIds = array_column($positions, 'user_id');
        $placeholders   = count($activeSalesIds) > 0
            ? implode(',', array_fill(0, count($activeSalesIds), '?'))
            : '0';

        $offlineSales = count($activeSalesIds) > 0
            ? DB::select(
                "SELECT id as user_id, nama as sales_nama, role_id
                 FROM users
                 WHERE is_active = 1 AND id NOT IN ($placeholders)
                 ORDER BY nama",
                $activeSalesIds
              )
            : DB::select(
                "SELECT id as user_id, nama as sales_nama, role_id
                 FROM users WHERE is_active = 1 ORDER BY nama"
              );

        return response()->json([
            'date'          => $date,
            'active'        => array_map(fn($r) => (array) $r, $positions),
            'offline'       => array_map(fn($r) => (array) $r, $offlineSales),
            'active_count'  => count($positions),
            'offline_count' => count($offlineSales),
        ]);
    }

    // ── GET /v1/location/team/trails ──────────────────────────────────────
    // Trail semua sales hari ini untuk peta — HANYA Manager & Admin
    public function teamTrails(Request $request)
    {
        $auth = $this->authUser($request);

        if ($auth['is_sales_only'] ?? false) {
            return response()->json(['detail' => 'Akses tidak diizinkan untuk role Sales.'], 403);
        }

        $date   = $request->query('date', now()->toDateString());
        $userId = $request->query('user_id'); // opsional: filter per sales

        $where  = ['DATE(ll.recorded_at) = ?'];
        $params = [$date];

        if ($userId) {
            $where[]  = 'll.user_id = ?';
            $params[] = (int) $userId;
        }

        $whereStr = implode(' AND ', $where);

        $trails = DB::select("
            SELECT ll.user_id, u.nama AS sales_nama,
                   ll.latitude, ll.longitude, ll.recorded_at
            FROM location_logs ll
            JOIN users u ON u.id = ll.user_id
            WHERE $whereStr
            ORDER BY ll.user_id, ll.recorded_at ASC
        ", $params);

        // Group by user
        $grouped = [];
        foreach ($trails as $row) {
            $uid = $row->user_id;
            if (!isset($grouped[$uid])) {
                $grouped[$uid] = [
                    'user_id'    => $uid,
                    'sales_nama' => $row->sales_nama,
                    'points'     => [],
                ];
            }
            $grouped[$uid]['points'][] = [
                'lat' => (float) $row->latitude,
                'lng' => (float) $row->longitude,
                'at'  => $row->recorded_at,
            ];
        }

        return response()->json([
            'date'   => $date,
            'trails' => array_values($grouped),
        ]);
    }

    // ── Private: hitung total jarak dari array trail points ──────────────
    private function calcDistance(array $points): float
    {
        $total = 0.0;
        for ($i = 1; $i < count($points); $i++) {
            $lat1 = deg2rad((float) $points[$i-1]['latitude']);
            $lon1 = deg2rad((float) $points[$i-1]['longitude']);
            $lat2 = deg2rad((float) $points[$i]['latitude']);
            $lon2 = deg2rad((float) $points[$i]['longitude']);

            $dlat = $lat2 - $lat1;
            $dlon = $lon2 - $lon1;
            $a    = sin($dlat/2)**2 + cos($lat1) * cos($lat2) * sin($dlon/2)**2;
            $total += 6371 * 2 * asin(sqrt($a)); // km
        }
        return $total;
    }
}
