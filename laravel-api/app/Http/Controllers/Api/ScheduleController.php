<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $days  = (int)$request->query('days', 14);
        $today = now()->toDateString();
        $end   = now()->addDays($days)->toDateString();

        $auth        = $request->attributes->get('auth_user', []);
        $salesOnly   = $auth['is_sales_only'] ?? false;
        $salesOwner  = $auth['nama'] ?? null;
        $salesFilter = $salesOnly ? " AND sales_owner = ?" : "";

        // Overdue (next_fu_date < today, not Won/Lost)
        $overdueParams = $salesOnly ? [$today, $salesOwner] : [$today];
        $overdue = DB::select(
            "SELECT lead_id, nama_company, stage, prioritas, product,
                    next_fu_date, sales_owner,
                    COALESCE(propose_value, 0) as propose_value,
                    'Overdue' as fu_status
             FROM leads
             WHERE next_fu_date < ?
               AND next_fu_date IS NOT NULL
               AND stage NOT IN ('Won','Lost')
               $salesFilter
             ORDER BY next_fu_date ASC",
            $overdueParams
        );

        // Today
        $todayParams = $salesOnly ? [$today, $salesOwner] : [$today];
        $todayRows = DB::select(
            "SELECT lead_id, nama_company, stage, prioritas, product,
                    next_fu_date, sales_owner,
                    COALESCE(propose_value, 0) as propose_value,
                    'Today' as fu_status
             FROM leads
             WHERE next_fu_date = ?
               AND stage NOT IN ('Won','Lost')
               $salesFilter
             ORDER BY prioritas DESC",
            $todayParams
        );

        // Upcoming
        $upcomingParams = $salesOnly ? [$today, $end, $salesOwner] : [$today, $end];
        $upcoming = DB::select(
            "SELECT lead_id, nama_company, stage, prioritas, product,
                    next_fu_date, sales_owner,
                    COALESCE(propose_value, 0) as propose_value,
                    'Upcoming' as fu_status
             FROM leads
             WHERE next_fu_date > ?
               AND next_fu_date <= ?
               AND stage NOT IN ('Won','Lost')
               $salesFilter
             ORDER BY next_fu_date ASC, prioritas DESC",
            $upcomingParams
        );

        $all = array_merge(
            array_map(fn($r) => (array)$r, $overdue),
            array_map(fn($r) => (array)$r, $todayRows),
            array_map(fn($r) => (array)$r, $upcoming)
        );

        return response()->json([
            'from'     => $today,
            'to'       => $end,
            'days'     => $days,
            'total'    => count($all),
            'schedule' => $all,
        ]);
    }
}
