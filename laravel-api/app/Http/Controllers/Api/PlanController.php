<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PlanController extends Controller
{
    // GET /v1/plan/weekly?week_start=2026-07-14&sales_owner=...
    public function weekly(Request $request)
    {
        $auth      = $request->attributes->get('auth_user', []);
        $isSales   = $auth['is_sales_only'] ?? false;
        $authNama  = $auth['nama'] ?? '';

        $weekStart = $request->query('week_start') ?? now()->startOfWeek(1)->toDateString(); // Senin
        $weekEnd   = date('Y-m-d', strtotime($weekStart . ' +6 days'));
        $today     = now()->toDateString();

        $salesOwner = $isSales
            ? $authNama
            : ($request->query('sales_owner') ?: null);

        $sf     = $salesOwner ? " AND sales_owner = ?" : "";
        $sfP    = $salesOwner ? [$salesOwner] : [];

        $cols = "lead_id, nama_company, stage, prioritas, next_fu_date, next_fu_type,
                 last_fu_date, last_fu_notes, sales_owner, product,
                 COALESCE(propose_value, 0) as propose_value";

        // Lead tanpa jadwal (next_fu_date IS NULL) — aktif saja
        $unscheduled = DB::select(
            "SELECT $cols FROM leads
             WHERE next_fu_date IS NULL
               AND stage NOT IN ('Won','Lost') $sf
             ORDER BY prioritas DESC, nama_company ASC
             LIMIT 100",
            $sfP
        );

        // Lead overdue
        $overdue = DB::select(
            "SELECT $cols,
                    (CURRENT_DATE - next_fu_date::date) as days_overdue
             FROM leads
             WHERE next_fu_date < ?
               AND stage NOT IN ('Won','Lost') $sf
             ORDER BY next_fu_date ASC",
            array_merge([$today], $sfP)
        );

        // Lead dijadwalkan dalam rentang minggu ini
        $scheduled = DB::select(
            "SELECT $cols FROM leads
             WHERE next_fu_date >= ? AND next_fu_date <= ?
               AND stage NOT IN ('Won','Lost') $sf
             ORDER BY next_fu_date ASC, prioritas DESC",
            array_merge([$weekStart, $weekEnd], $sfP)
        );

        // Group by_date
        $byDate = [];
        foreach ($scheduled as $r) {
            $byDate[$r->next_fu_date][] = (array)$r;
        }

        return response()->json([
            'week_start'  => $weekStart,
            'week_end'    => $weekEnd,
            'today'       => $today,
            'unscheduled' => array_map(fn($r) => (array)$r, $unscheduled),
            'overdue'     => array_map(fn($r) => (array)$r, $overdue),
            'by_date'     => empty($byDate) ? (object)[] : $byDate,
        ]);
    }

    // PATCH /v1/plan/assign
    // Body: { lead_id, next_fu_date, next_fu_type }
    public function assign(Request $request)
    {
        $auth   = $request->attributes->get('auth_user', []);
        $leadId = $request->input('lead_id');

        if (!$leadId) {
            return response()->json(['detail' => 'lead_id wajib diisi.'], 400);
        }

        $lead = DB::selectOne("SELECT lead_id, sales_owner FROM leads WHERE lead_id=?", [$leadId]);
        if (!$lead) {
            return response()->json(['detail' => 'Lead tidak ditemukan.'], 404);
        }

        // Sales hanya boleh assign lead miliknya
        if (($auth['is_sales_only'] ?? false) && $lead->sales_owner !== $auth['nama']) {
            return response()->json(['detail' => 'Akses ditolak.'], 403);
        }

        $nextFuDate = $request->input('next_fu_date'); // null = hapus jadwal
        $nextFuType = $request->input('next_fu_type', 'call');

        DB::update(
            "UPDATE leads SET next_fu_date=?, next_fu_type=?, updated_at=NOW() WHERE lead_id=?",
            [$nextFuDate, $nextFuType, $leadId]
        );

        return response()->json(['message' => 'Jadwal berhasil diperbarui.']);
    }
}
