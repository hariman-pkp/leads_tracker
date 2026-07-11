<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * DailyReportController
 *
 * RBAC:
 *   GET    /v1/daily-report             → Sales: laporan sendiri | Manager/Admin: semua
 *   POST   /v1/daily-report             → semua role (buat laporan sendiri)
 *   GET    /v1/daily-report/{id}        → Sales: miliknya saja | Manager/Admin: semua
 *   PUT    /v1/daily-report/{id}        → hanya pemilik laporan (status draft)
 *   POST   /v1/daily-report/{id}/send   → kirim ke manager (status: sent)
 *   GET    /v1/daily-report/team        → Manager & Admin saja
 *   GET    /v1/daily-report/summary     → otomatis dari data hari ini
 */
class DailyReportController extends Controller
{
    private function authUser(Request $request): array
    {
        return $request->attributes->get('auth_user', []);
    }

    // ── GET /v1/daily-report ──────────────────────────────────────────────
    public function index(Request $request)
    {
        $auth     = $this->authUser($request);
        $month    = $request->query('month'); // format: 2026-06
        $dateFrom = $request->query('date_from'); // format: 2026-07-01
        $dateTo   = $request->query('date_to');   // format: 2026-07-31
        $userId   = $request->query('user_id');
        $status   = $request->query('status');
        $limit    = (int) $request->query('limit', 20);
        $offset   = (int) $request->query('offset', 0);

        $where  = ['1=1'];
        $params = [];

        // RBAC: Sales hanya lihat laporan sendiri
        if ($auth['is_sales_only'] ?? false) {
            $where[]  = 'dr.user_id = ?';
            $params[] = $auth['id'];
        } elseif ($userId) {
            $where[]  = 'dr.user_id = ?';
            $params[] = (int) $userId;
        }

        if ($month) {
            $where[]  = "TO_CHAR(dr.report_date, 'YYYY-MM') = ?";
            $params[] = $month;
        }
        if ($dateFrom) {
            $where[]  = 'dr.report_date >= ?';
            $params[] = $dateFrom;
        }
        if ($dateTo) {
            $where[]  = 'dr.report_date <= ?';
            $params[] = $dateTo;
        }
        if ($status) {
            $where[]  = 'dr.status = ?';
            $params[] = $status;
        }

        $whereStr = implode(' AND ', $where);

        $rows = DB::select("
            SELECT dr.id, dr.user_id, u.nama AS sales_nama,
                   dr.report_date, dr.status,
                   dr.visit_count, dr.fu_count, dr.new_lead_count,
                   dr.notes_obstacle, dr.notes_plan,
                   dr.mood, dr.sent_at, dr.created_at,
                   dr.send_latitude, dr.send_longitude, dr.send_address
            FROM daily_reports dr
            JOIN users u ON u.id = dr.user_id
            WHERE $whereStr
            ORDER BY dr.report_date DESC
            LIMIT ? OFFSET ?
        ", array_merge($params, [$limit, $offset]));

        $total = (int) DB::selectOne(
            "SELECT COUNT(*) as n FROM daily_reports dr WHERE $whereStr",
            $params
        )->n;

        // Sales list dari master sales untuk dropdown filter
        $salesList = DB::select(
            "SELECT u.id, u.nama FROM users u
             JOIN roles r ON r.id = u.role_id
             WHERE u.is_active = 1
             ORDER BY u.nama"
        );

        return response()->json([
            'total'      => $total,
            'reports'    => array_map(fn($r) => (array) $r, $rows),
            'sales_list' => array_map(fn($r) => (array) $r, $salesList),
        ]);
    }

    // ── POST /v1/daily-report ─────────────────────────────────────────────
    public function store(Request $request)
    {
        $auth = $this->authUser($request);
        $d    = $request->all();
        $date = $d['report_date'] ?? now()->toDateString();

        // Cek apakah laporan hari ini sudah ada
        $existing = DB::selectOne(
            "SELECT id, status FROM daily_reports WHERE user_id = ? AND report_date = ?",
            [$auth['id'], $date]
        );

        if ($existing) {
            return response()->json([
                'detail'    => 'Laporan untuk tanggal ini sudah ada.',
                'report_id' => $existing->id,
                'status'    => $existing->status,
            ], 422);
        }

        // Auto-rekap dari data check-in & follow-up hari ini
        $autoSummary = $this->buildAutoSummary($auth['id'], $date);

        $id = DB::table('daily_reports')->insertGetId([
            'user_id'         => $auth['id'],
            'report_date'     => $date,
            'status'          => 'draft',
            'visit_count'     => $d['visit_count']    ?? $autoSummary['visit_count'],
            'fu_count'        => $d['fu_count']        ?? $autoSummary['fu_count'],
            'new_lead_count'  => $d['new_lead_count']  ?? $autoSummary['new_lead_count'],
            'notes_obstacle'  => $d['notes_obstacle']  ?? null,
            'notes_plan'      => $d['notes_plan']      ?? null,
            'mood'            => $d['mood']             ?? null,
            'visit_details'   => isset($d['visit_details'])
                ? json_encode($d['visit_details'])
                : json_encode($autoSummary['visit_details']),
            'created_at'      => now(),
            'updated_at'      => now(),
        ]);

        return response()->json([
            'message'   => 'Laporan berhasil dibuat.',
            'report_id' => $id,
        ], 201);
    }

    // ── GET /v1/daily-report/{id} ─────────────────────────────────────────
    public function show(Request $request, int $id)
    {
        $auth   = $this->authUser($request);
        $report = DB::selectOne("
            SELECT dr.*, u.nama AS sales_nama
            FROM daily_reports dr
            JOIN users u ON u.id = dr.user_id
            WHERE dr.id = ?
        ", [$id]);

        if (!$report) {
            return response()->json(['detail' => 'Laporan tidak ditemukan.'], 404);
        }

        // RBAC: Sales hanya bisa lihat laporan sendiri
        if (($auth['is_sales_only'] ?? false) && $report->user_id !== $auth['id']) {
            return response()->json(['detail' => 'Anda tidak memiliki akses ke laporan ini.'], 403);
        }

        $data = (array) $report;
        if (isset($data['visit_details']) && $data['visit_details']) {
            $data['visit_details'] = json_decode($data['visit_details'], true);
        }

        return response()->json($data);
    }

    // ── PUT /v1/daily-report/{id} ─────────────────────────────────────────
    public function update(Request $request, int $id)
    {
        $auth   = $this->authUser($request);
        $report = DB::selectOne("SELECT id, user_id, status FROM daily_reports WHERE id = ?", [$id]);

        if (!$report) {
            return response()->json(['detail' => 'Laporan tidak ditemukan.'], 404);
        }
        if ($report->user_id !== $auth['id']) {
            return response()->json(['detail' => 'Anda tidak dapat mengubah laporan orang lain.'], 403);
        }
        if ($report->status === 'sent') {
            return response()->json(['detail' => 'Laporan yang sudah dikirim tidak dapat diubah.'], 422);
        }

        $d = $request->only([
            'visit_count','fu_count','new_lead_count',
            'notes_obstacle','notes_plan','mood','visit_details',
        ]);

        $sets   = [];
        $params = [];
        foreach ($d as $k => $v) {
            $sets[]   = "$k = ?";
            $params[] = $k === 'visit_details' ? json_encode($v) : $v;
        }
        $sets[]   = "updated_at = NOW()";
        $params[] = $id;

        DB::update("UPDATE daily_reports SET " . implode(', ', $sets) . " WHERE id = ?", $params);

        return response()->json(['message' => 'Laporan berhasil diperbarui.']);
    }

    // ── POST /v1/daily-report/{id}/send ──────────────────────────────────
    // Ubah status draft → sent + catat waktu kirim
    public function send(Request $request, int $id)
    {
        $auth   = $this->authUser($request);
        $report = DB::selectOne(
            "SELECT id, user_id, status FROM daily_reports WHERE id = ?", [$id]
        );

        if (!$report) {
            return response()->json(['detail' => 'Laporan tidak ditemukan.'], 404);
        }
        if ($report->user_id !== $auth['id']) {
            return response()->json(['detail' => 'Anda tidak dapat mengirim laporan orang lain.'], 403);
        }
        if ($report->status === 'sent') {
            return response()->json(['detail' => 'Laporan sudah pernah dikirim.'], 422);
        }

        $lat     = $request->input('latitude');
        $lng     = $request->input('longitude');
        $address = $request->input('address');

        DB::update(
            "UPDATE daily_reports
             SET status = 'sent', sent_at = NOW(), updated_at = NOW(),
                 send_latitude = ?, send_longitude = ?, send_address = ?
             WHERE id = ?",
            [$lat, $lng, $address, $id]
        );

        return response()->json(['message' => 'Laporan berhasil dikirim ke manager.']);
    }

    // ── GET /v1/daily-report/team ─────────────────────────────────────────
    // Manager/Admin: rekap laporan seluruh tim
    public function team(Request $request)
    {
        $auth = $this->authUser($request);

        if ($auth['is_sales_only'] ?? false) {
            return response()->json(['detail' => 'Akses tidak diizinkan untuk role Sales.'], 403);
        }

        $date   = $request->query('date', now()->toDateString());
        $month  = $request->query('month');

        $where  = ['1=1'];
        $params = [];

        if ($month) {
            $where[]  = "TO_CHAR(dr.report_date, 'YYYY-MM') = ?";
            $params[] = $month;
        } else {
            $where[]  = 'dr.report_date = ?';
            $params[] = $date;
        }

        $whereStr = implode(' AND ', $where);

        // Laporan yang masuk
        $reports = DB::select("
            SELECT dr.id, dr.user_id, u.nama AS sales_nama,
                   dr.report_date, dr.status, dr.visit_count,
                   dr.fu_count, dr.new_lead_count, dr.mood,
                   dr.sent_at
            FROM daily_reports dr
            JOIN users u ON u.id = dr.user_id
            WHERE $whereStr
            ORDER BY dr.report_date DESC, u.nama ASC
        ", $params);

        // Sales yang belum lapor hari ini
        $reportedIds  = array_column($reports, 'user_id');
        $placeholders = count($reportedIds) > 0
            ? implode(',', array_fill(0, count($reportedIds), '?'))
            : '0';

        $missing = count($reportedIds) > 0
            ? DB::select(
                "SELECT id AS user_id, nama AS sales_nama
                 FROM users WHERE is_active = 1 AND id NOT IN ($placeholders) ORDER BY nama",
                $reportedIds
              )
            : DB::select("SELECT id AS user_id, nama AS sales_nama FROM users WHERE is_active = 1 ORDER BY nama");

        return response()->json([
            'date'          => $date,
            'reports'       => array_map(fn($r) => (array) $r, $reports),
            'missing_report'=> array_map(fn($r) => (array) $r, $missing),
            'submitted'     => count($reports),
            'missing'       => count($missing),
        ]);
    }

    // ── GET /v1/daily-report/summary ─────────────────────────────────────
    // Auto-rekap hari ini dari data check-in & follow-up
    public function summary(Request $request)
    {
        $auth = $this->authUser($request);
        $date = $request->query('date', now()->toDateString());

        return response()->json($this->buildAutoSummary($auth['id'], $date));
    }

    // ── Private: build auto summary dari visit_logs & follow_up_log ──────
    private function buildAutoSummary(int $userId, string $date): array
    {
        // Kunjungan
        $visits = DB::select("
            SELECT vl.id, l.nama_company AS client_nama, vl.address,
                   vl.checked_in_at, vl.checked_out_at, vl.duration_minutes
            FROM visit_logs vl
            LEFT JOIN leads l ON l.lead_id = vl.lead_id
            WHERE vl.user_id = ? AND DATE(vl.checked_in_at) = ?
              AND vl.type = 'check_out'
            ORDER BY vl.checked_in_at ASC
        ", [$userId, $date]);

        // Follow-up
        $fuCount = (int) DB::selectOne("
            SELECT COUNT(*) AS c FROM follow_up_log
            WHERE sales_owner = (SELECT nama FROM users WHERE id = ?)
              AND DATE(tgl_fu) = ?
        ", [$userId, $date])->c;

        // Leads baru hari ini
        $newLeads = (int) DB::selectOne("
            SELECT COUNT(*) AS c FROM leads
            WHERE sales_owner = (SELECT nama FROM users WHERE id = ?)
              AND DATE(tgl_masuk) = ?
        ", [$userId, $date])->c;

        return [
            'date'           => $date,
            'visit_count'    => count($visits),
            'fu_count'       => $fuCount,
            'new_lead_count' => $newLeads,
            'visit_details'  => array_map(fn($v) => (array) $v, $visits),
        ];
    }
}
