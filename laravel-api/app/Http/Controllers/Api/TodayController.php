<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TodayController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->toDateString();
        $week  = now()->addDays(7)->toDateString();

        $auth      = $request->attributes->get('auth_user', []);
        $salesOnly = $auth['is_sales_only'] ?? false;
        $salesName = $auth['nama'] ?? null;

        $sf = $salesOnly ? " AND sales_owner = ?" : "";

        // Overdue FU
        $overdue = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, product,
                   next_fu_date, last_fu_date, last_fu_notes, sales_owner,
                   propose_value,
                   (CURRENT_DATE - next_fu_date::date) as days_overdue
            FROM leads
            WHERE next_fu_date < ? AND stage NOT IN ('Won','Lost') $sf
            ORDER BY next_fu_date ASC, prioritas DESC",
            $salesOnly ? [$today, $salesName] : [$today]
        );

        // Due today
        $dueToday = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, product,
                   next_fu_date, last_fu_date, last_fu_notes, sales_owner, propose_value
            FROM leads
            WHERE next_fu_date = ? AND stage NOT IN ('Won','Lost') $sf
            ORDER BY prioritas DESC",
            $salesOnly ? [$today, $salesName] : [$today]
        );

        // Upcoming 7 days (excluding today)
        $upcoming = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, product,
                   next_fu_date, last_fu_date, last_fu_notes, sales_owner, propose_value
            FROM leads
            WHERE next_fu_date > ? AND next_fu_date <= ?
              AND stage NOT IN ('Won','Lost') $sf
            ORDER BY next_fu_date ASC, prioritas DESC",
            $salesOnly ? [$today, $week, $salesName] : [$today, $week]
        );

        // Stale — aktif tapi tidak ada FU >30 hari
        $stale = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, product,
                   next_fu_date, last_fu_date, last_fu_notes, sales_owner, propose_value,
                   COALESCE(EXTRACT(DAY FROM NOW()-last_fu_date)::int, 9999) as days_since_fu
            FROM leads
            WHERE stage NOT IN ('Won','Lost')
              AND (last_fu_date IS NULL OR last_fu_date < NOW()-INTERVAL '30 days')
              AND (next_fu_date IS NULL OR next_fu_date < ?) $sf
            ORDER BY days_since_fu DESC LIMIT 8",
            $salesOnly ? [now()->addDays(7)->toDateString(), $salesName] : [now()->addDays(7)->toDateString()]
        );

        // FU yang sudah dilakukan hari ini
        $fuDoneToday = DB::selectOne(
            "SELECT COUNT(*) as n FROM follow_up_log WHERE DATE(created_at) = ?" . ($salesOnly ? " AND sales_owner = ?" : ""),
            $salesOnly ? [$today, $salesName] : [$today]
        );

        return response()->json([
            'date'          => $today,
            'overdue'       => array_map(fn($r) => (array)$r, $overdue),
            'due_today'     => array_map(fn($r) => (array)$r, $dueToday),
            'upcoming'      => array_map(fn($r) => (array)$r, $upcoming),
            'stale'         => array_map(fn($r) => (array)$r, $stale),
            'fu_done_today' => (int)($fuDoneToday->n ?? 0),
        ]);
    }
}
