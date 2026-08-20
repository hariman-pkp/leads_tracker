<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $today    = now()->toDateString();
        $dateFrom = $request->query('date_from') ?? $today;
        $dateTo   = $request->query('date_to')   ?? now()->addDays((int)$request->query('days', 14))->toDateString();

        $auth       = $request->attributes->get('auth_user', []);
        $salesOnly  = $auth['is_sales_only'] ?? false;
        $salesOwner = $auth['nama'] ?? null;

        // Manager boleh filter per sales
        $filterSales = $salesOnly
            ? $salesOwner
            : ($request->query('sales_owner') ?: null);

        $sf     = $filterSales ? " AND sales_owner = ?" : "";
        $cols   = "lead_id, nama_company, stage, prioritas, product,
                   next_fu_date, next_fu_type, last_fu_notes, sales_owner,
                   COALESCE(propose_value, 0) as propose_value";

        // Overdue (hanya jika dateFrom <= today)
        $overdue = [];
        if ($dateFrom <= $today) {
            $p = $filterSales ? [$dateFrom, $salesOwner] : [$dateFrom];
            $overdue = DB::select(
                "SELECT $cols, 'Overdue' as fu_status,
                        (CURRENT_DATE - next_fu_date::date) as days_overdue
                 FROM leads
                 WHERE next_fu_date < ? AND next_fu_date IS NOT NULL
                   AND stage NOT IN ('Won','Lost') $sf
                 ORDER BY next_fu_date ASC",
                $p
            );
        }

        // In range
        $p = $filterSales ? [$dateFrom, $dateTo, $filterSales] : [$dateFrom, $dateTo];
        $inRange = DB::select(
            "SELECT $cols,
                    CASE WHEN next_fu_date = ? THEN 'Today' ELSE 'Upcoming' END as fu_status,
                    NULL::int as days_overdue
             FROM leads
             WHERE next_fu_date >= ? AND next_fu_date <= ?
               AND stage NOT IN ('Won','Lost') $sf
             ORDER BY next_fu_date ASC, prioritas DESC",
            $filterSales
                ? [$today, $dateFrom, $dateTo, $filterSales]
                : [$today, $dateFrom, $dateTo]
        );

        $all = array_merge(
            array_map(fn($r) => (array)$r, $overdue),
            array_map(fn($r) => (array)$r, $inRange)
        );

        // Group by date untuk calendar view
        $byDate = [];
        foreach ($all as $row) {
            $key = $row['next_fu_date'] ?? 'overdue';
            $byDate[$key][] = $row;
        }

        return response()->json([
            'from'     => $dateFrom,
            'to'       => $dateTo,
            'today'    => $today,
            'total'    => count($all),
            'schedule' => $all,
            'by_date'  => $byDate,
        ]);
    }
}
