<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ActivityHeatmapController extends Controller
{
    public function index(Request $request)
    {
        $auth  = $request->attributes->get('auth_user', []);
        $tahun = (int) $request->query('tahun', date('Y'));
        $sales = $request->query('sales', '');

        // Sales hanya bisa lihat datanya sendiri
        if ($auth['is_sales_only'] ?? false) {
            $sales = $auth['nama'];
        }

        $grid = [];
        for ($d = 0; $d < 7; $d++) {
            $grid[$d] = array_fill(0, 24, 0);
        }

        // ── Follow-up log (created_at) ────────────────────────────────────
        $params = [$tahun];
        $filter = '';
        if ($sales) { $filter = "AND sales_owner = ?"; $params[] = $sales; }

        $fuRows = DB::select(
            "SELECT EXTRACT(DOW FROM created_at)::int AS dow,
                    EXTRACT(HOUR FROM created_at)::int AS hr,
                    COUNT(*) AS cnt
             FROM follow_up_log
             WHERE EXTRACT(YEAR FROM created_at) = ?
               $filter
             GROUP BY 1, 2",
            $params
        );
        foreach ($fuRows as $r) $grid[(int)$r->dow][(int)$r->hr] += (int)$r->cnt;

        // ── Visit logs / check-in (checked_in_at) ────────────────────────
        $params2 = [$tahun];
        $filter2 = '';
        if ($sales) { $filter2 = "AND u.nama = ?"; $params2[] = $sales; }

        $vlRows = DB::select(
            "SELECT EXTRACT(DOW FROM vl.checked_in_at)::int AS dow,
                    EXTRACT(HOUR FROM vl.checked_in_at)::int AS hr,
                    COUNT(*) AS cnt
             FROM visit_logs vl
             JOIN users u ON u.id = vl.user_id
             WHERE vl.checked_in_at IS NOT NULL
               AND EXTRACT(YEAR FROM vl.checked_in_at) = ?
               $filter2
             GROUP BY 1, 2",
            $params2
        );
        foreach ($vlRows as $r) $grid[(int)$r->dow][(int)$r->hr] += (int)$r->cnt;

        // ── Daily reports (created_at) ────────────────────────────────────
        $params3 = [$tahun];
        $filter3 = '';
        if ($sales) { $filter3 = "AND u.nama = ?"; $params3[] = $sales; }

        $drRows = DB::select(
            "SELECT EXTRACT(DOW FROM dr.created_at)::int AS dow,
                    EXTRACT(HOUR FROM dr.created_at)::int AS hr,
                    COUNT(*) AS cnt
             FROM daily_reports dr
             JOIN users u ON u.id = dr.user_id
             WHERE EXTRACT(YEAR FROM dr.created_at) = ?
               $filter3
             GROUP BY 1, 2",
            $params3
        );
        foreach ($drRows as $r) $grid[(int)$r->dow][(int)$r->hr] += (int)$r->cnt;

        // ── Build response ────────────────────────────────────────────────
        $cells    = [];
        $maxCount = 0;
        for ($d = 0; $d < 7; $d++) {
            for ($h = 0; $h < 24; $h++) {
                if ($grid[$d][$h] > 0) {
                    $cells[] = ['dow' => $d, 'hour' => $h, 'count' => $grid[$d][$h]];
                    if ($grid[$d][$h] > $maxCount) $maxCount = $grid[$d][$h];
                }
            }
        }

        $byHour = array_fill(0, 24, 0);
        $byDow  = array_fill(0, 7, 0);
        for ($d = 0; $d < 7; $d++) {
            for ($h = 0; $h < 24; $h++) {
                $byHour[$h] += $grid[$d][$h];
                $byDow[$d]  += $grid[$d][$h];
            }
        }

        return response()->json([
            'tahun'      => $tahun,
            'cells'      => $cells,
            'by_hour'    => array_values($byHour),
            'by_dow'     => array_values($byDow),
            'dow_labels' => ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'],
            'max_count'  => $maxCount,
        ]);
    }
}
