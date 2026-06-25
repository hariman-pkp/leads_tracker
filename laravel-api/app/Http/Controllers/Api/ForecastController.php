<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ForecastController extends Controller
{
    public function index(Request $request)
    {
        $tahun    = (int)$request->query('tahun', now()->year);
        $user     = $request->attributes->get('auth_user');
        $isSales  = ($user['role_id'] ?? 0) == 3;
        $nama     = $isSales ? ($user['nama'] ?? null) : null;
        $ownerSql = $isSales ? 'AND sales_owner = ?' : '';

        $monthlyParams = $isSales ? [$tahun, $nama] : [$tahun];
        $summaryParams = $isSales ? [$tahun, $nama] : [$tahun];
        $salesParams   = $isSales ? [$tahun, $nama] : [$tahun];
        $lossParams    = $isSales ? [$tahun, $nama] : [$tahun];

        $monthly = DB::select("
            SELECT
                EXTRACT(MONTH FROM exp_close_date)::integer as bulan,
                TO_CHAR(exp_close_date, 'Mon') as bulan_label,
                COUNT(*) as jumlah_lead,
                COALESCE(SUM(propose_value), 0) as total_propose,
                COALESCE(SUM(weighted_value), 0) as total_weighted,
                COALESCE(SUM(CASE WHEN stage='Won' THEN deal_value ELSE 0 END), 0) as actual_won
            FROM leads
            WHERE EXTRACT(YEAR FROM exp_close_date) = ?
              AND exp_close_date IS NOT NULL
              AND stage NOT IN ('Lost')
              {$ownerSql}
            GROUP BY 1, 2 ORDER BY 1
        ", $monthlyParams);

        $summary = DB::selectOne("
            SELECT
                COALESCE(SUM(weighted_value), 0) as total_weighted,
                COALESCE(SUM(CASE WHEN stage='Won' THEN deal_value ELSE 0 END), 0) as total_won,
                COUNT(*) as total_leads,
                COUNT(CASE WHEN stage='Won' THEN 1 END) as total_won_count
            FROM leads
            WHERE EXTRACT(YEAR FROM exp_close_date) = ?
              AND exp_close_date IS NOT NULL
              {$ownerSql}
        ", $summaryParams);

        $bySales = DB::select("
            SELECT
                sales_owner,
                COUNT(*) as jumlah_lead,
                COALESCE(SUM(weighted_value), 0) as total_weighted,
                COALESCE(SUM(CASE WHEN stage='Won' THEN deal_value ELSE 0 END), 0) as actual_won,
                COALESCE(AVG(probability), 0) as avg_probability
            FROM leads
            WHERE EXTRACT(YEAR FROM exp_close_date) = ?
              AND exp_close_date IS NOT NULL
              AND stage NOT IN ('Lost')
              AND sales_owner IS NOT NULL AND sales_owner <> ''
              {$ownerSql}
            GROUP BY sales_owner ORDER BY total_weighted DESC
        ", $salesParams);

        $lossAnalysis = DB::select("
            SELECT
                COALESCE(NULLIF(loss_reason, ''), 'Tidak dicatat') as reason,
                COUNT(*) as jumlah,
                COALESCE(SUM(propose_value), 0) as nilai_hilang
            FROM leads
            WHERE stage = 'Lost'
              AND EXTRACT(YEAR FROM COALESCE(updated_at, tgl_masuk)) = ?
              {$ownerSql}
            GROUP BY 1 ORDER BY 2 DESC
        ", $lossParams);

        $castSummary = $summary ? [
            'total_weighted'   => (float)$summary->total_weighted,
            'total_won'        => (float)$summary->total_won,
            'total_leads'      => (int)$summary->total_leads,
            'total_won_count'  => (int)$summary->total_won_count,
        ] : ['total_weighted' => 0, 'total_won' => 0, 'total_leads' => 0, 'total_won_count' => 0];

        $castMonthly = array_map(fn($r) => [
            'bulan'          => (int)$r->bulan,
            'bulan_label'    => $r->bulan_label,
            'jumlah_lead'    => (int)$r->jumlah_lead,
            'total_propose'  => (float)$r->total_propose,
            'total_weighted' => (float)$r->total_weighted,
            'actual_won'     => (float)$r->actual_won,
        ], $monthly);

        $castBySales = array_map(fn($r) => [
            'sales_owner'    => $r->sales_owner,
            'jumlah_lead'    => (int)$r->jumlah_lead,
            'total_weighted' => (float)$r->total_weighted,
            'actual_won'     => (float)$r->actual_won,
            'avg_probability'=> (float)$r->avg_probability,
        ], $bySales);

        $castLoss = array_map(fn($r) => [
            'reason'      => $r->reason,
            'jumlah'      => (int)$r->jumlah,
            'nilai_hilang'=> (float)$r->nilai_hilang,
        ], $lossAnalysis);

        return response()->json([
            'tahun'           => $tahun,
            'summary'         => $castSummary,
            'monthly_forecast'=> $castMonthly,
            'by_sales'        => $castBySales,
            'loss_analysis'   => $castLoss,
        ]);
    }
}
