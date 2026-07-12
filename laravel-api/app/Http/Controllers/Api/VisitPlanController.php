<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * VisitPlanController
 *
 * RBAC:
 *   GET    /v1/visit-plan          → Sales: milik sendiri | Admin/Manager: semua / filter user
 *   POST   /v1/visit-plan          → Sales buat rencana sendiri
 *   PUT    /v1/visit-plan/{id}     → pemilik atau Admin/Manager
 *   DELETE /v1/visit-plan/{id}     → pemilik atau Admin/Manager
 */
class VisitPlanController extends Controller
{
    private function authUser(Request $request): array
    {
        return $request->attributes->get('auth_user', []);
    }

    // ── GET /v1/visit-plan ────────────────────────────────────────────────
    public function index(Request $request)
    {
        $auth       = $this->authUser($request);
        $userId     = $request->query('user_id');
        $dateFrom   = $request->query('date_from');
        $dateTo     = $request->query('date_to');
        $month      = $request->query('month'); // format: 2026-07
        $status     = $request->query('status');

        $where  = ['1=1'];
        $params = [];

        if ($auth['is_sales_only'] ?? false) {
            $where[]  = 'vp.user_id = ?';
            $params[] = $auth['id'];
        } elseif ($userId) {
            $where[]  = 'vp.user_id = ?';
            $params[] = (int) $userId;
        }

        if ($month) {
            $where[]  = "TO_CHAR(vp.planned_date, 'YYYY-MM') = ?";
            $params[] = $month;
        } elseif ($dateFrom && $dateTo) {
            $where[]  = 'vp.planned_date BETWEEN ? AND ?';
            $params[] = $dateFrom;
            $params[] = $dateTo;
        } elseif ($dateFrom) {
            $where[]  = 'vp.planned_date >= ?';
            $params[] = $dateFrom;
        } elseif ($dateTo) {
            $where[]  = 'vp.planned_date <= ?';
            $params[] = $dateTo;
        }

        if ($status) {
            $where[]  = 'vp.status = ?';
            $params[] = $status;
        }

        $whereStr = implode(' AND ', $where);

        $rows = DB::select("
            SELECT vp.id, vp.user_id, u.nama AS sales_nama,
                   vp.lead_id, l.nama_company AS lead_nama,
                   vp.planned_date, vp.planned_time,
                   vp.notes, vp.status, vp.visit_log_id,
                   vp.created_at, vp.updated_at
            FROM visit_plans vp
            JOIN users u ON u.id = vp.user_id
            LEFT JOIN leads l ON l.lead_id = vp.lead_id
            WHERE $whereStr
            ORDER BY vp.planned_date ASC, vp.planned_time ASC
        ", $params);

        return response()->json([
            'plans' => array_map(fn($r) => (array) $r, $rows),
        ]);
    }

    // ── POST /v1/visit-plan ───────────────────────────────────────────────
    public function store(Request $request)
    {
        $auth = $this->authUser($request);
        $d    = $request->all();

        // Sales hanya bisa buat untuk dirinya sendiri
        $userId = ($auth['is_sales_only'] ?? false)
            ? $auth['id']
            : (int) ($d['user_id'] ?? $auth['id']);

        $id = DB::table('visit_plans')->insertGetId([
            'user_id'      => $userId,
            'lead_id'      => $d['lead_id']      ?? null,
            'planned_date' => $d['planned_date'],
            'planned_time' => $d['planned_time'] ?? null,
            'notes'        => $d['notes']        ?? null,
            'status'       => 'planned',
            'created_at'   => now(),
            'updated_at'   => now(),
        ]);

        $plan = DB::selectOne("
            SELECT vp.*, u.nama AS sales_nama, l.nama_company AS lead_nama
            FROM visit_plans vp
            JOIN users u ON u.id = vp.user_id
            LEFT JOIN leads l ON l.lead_id = vp.lead_id
            WHERE vp.id = ?
        ", [$id]);

        return response()->json([
            'message' => 'Rencana kunjungan berhasil dibuat.',
            'plan'    => (array) $plan,
        ], 201);
    }

    // ── PUT /v1/visit-plan/{id} ───────────────────────────────────────────
    public function update(Request $request, int $id)
    {
        $auth = $this->authUser($request);
        $plan = DB::selectOne("SELECT * FROM visit_plans WHERE id = ?", [$id]);

        if (!$plan) {
            return response()->json(['detail' => 'Rencana kunjungan tidak ditemukan.'], 404);
        }

        // Sales hanya bisa ubah miliknya sendiri
        if (($auth['is_sales_only'] ?? false) && $plan->user_id !== $auth['id']) {
            return response()->json(['detail' => 'Akses tidak diizinkan.'], 403);
        }

        $d      = $request->only(['planned_date', 'planned_time', 'notes', 'status', 'lead_id']);
        $sets   = [];
        $params = [];

        foreach ($d as $k => $v) {
            $sets[]   = "$k = ?";
            $params[] = $v;
        }
        $sets[]   = 'updated_at = NOW()';
        $params[] = $id;

        DB::update("UPDATE visit_plans SET " . implode(', ', $sets) . " WHERE id = ?", $params);

        return response()->json(['message' => 'Rencana kunjungan berhasil diperbarui.']);
    }

    // ── DELETE /v1/visit-plan/{id} ────────────────────────────────────────
    public function destroy(Request $request, int $id)
    {
        $auth = $this->authUser($request);
        $plan = DB::selectOne("SELECT * FROM visit_plans WHERE id = ?", [$id]);

        if (!$plan) {
            return response()->json(['detail' => 'Rencana kunjungan tidak ditemukan.'], 404);
        }

        if (($auth['is_sales_only'] ?? false) && $plan->user_id !== $auth['id']) {
            return response()->json(['detail' => 'Akses tidak diizinkan.'], 403);
        }

        DB::delete("DELETE FROM visit_plans WHERE id = ?", [$id]);

        return response()->json(['message' => 'Rencana kunjungan dihapus.']);
    }
}
