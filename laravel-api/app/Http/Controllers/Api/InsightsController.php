<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InsightsController extends Controller
{
    public function index(Request $request)
    {
        $tahun = (int)$request->query('tahun', now()->year);

        // ── By stage ─────────────────────────────────────────────────────
        $stageRows = DB::select("
            SELECT stage, COUNT(*) as jumlah,
                   COALESCE(SUM(propose_value),0) as total_nilai,
                   COALESCE(SUM(COALESCE(weighted_value,0)),0) as weighted
            FROM leads GROUP BY stage ORDER BY jumlah DESC"
        );

        // ── By sales_owner ────────────────────────────────────────────────
        $salesRows = DB::select("
            SELECT COALESCE(sales_owner,'Tidak Ditugaskan') as sales_owner,
                   COUNT(*) as jumlah,
                   COALESCE(SUM(propose_value),0) as total_nilai,
                   SUM(CASE WHEN stage NOT IN ('Won','Lost','On Hold') THEN 1 ELSE 0 END) as aktif
            FROM leads GROUP BY sales_owner ORDER BY jumlah DESC"
        );

        // ── Win/loss by year ──────────────────────────────────────────────
        $wlRows = DB::select("
            SELECT hasil, COUNT(*) as jumlah,
                   COALESCE(SUM(deal_value),0) as total_nilai
            FROM win_loss WHERE EXTRACT(YEAR FROM tgl_close) = ?
            GROUP BY hasil", [$tahun]
        );

        // ── By product ────────────────────────────────────────────────────
        $productRows = DB::select("
            SELECT product, COUNT(*) as jumlah,
                   COALESCE(SUM(propose_value),0) as total_nilai
            FROM leads WHERE product IS NOT NULL AND product != ''
            GROUP BY product ORDER BY jumlah DESC LIMIT 10"
        );

        // ── Stale leads ────────────────────────────────────────────────────
        $stale = DB::select("
            SELECT lead_id, nama_company, stage, last_fu_date, sales_owner,
                   propose_value,
                   COALESCE(EXTRACT(DAY FROM NOW()-last_fu_date)::int, 9999) as days_since_fu
            FROM leads
            WHERE stage NOT IN ('Won','Lost')
              AND (last_fu_date IS NULL OR last_fu_date < NOW()-INTERVAL '30 days')
            ORDER BY days_since_fu DESC NULLS LAST LIMIT 10"
        );

        // ── High-value active leads ───────────────────────────────────────
        $highValue = DB::select("
            SELECT lead_id, nama_company, stage, propose_value, probability,
                   sales_owner, next_fu_date, exp_close_date
            FROM leads
            WHERE stage NOT IN ('Won','Lost') AND propose_value > 0
            ORDER BY propose_value DESC LIMIT 5"
        );

        // ── By priority breakdown ─────────────────────────────────────────
        $byPriority = DB::select("
            SELECT prioritas,
                   COUNT(*) as jumlah,
                   SUM(CASE WHEN stage NOT IN ('Won','Lost','On Hold') THEN 1 ELSE 0 END) as aktif,
                   COALESCE(SUM(propose_value),0) as total_nilai
            FROM leads GROUP BY prioritas ORDER BY jumlah DESC"
        );

        // ── Conversion stats ──────────────────────────────────────────────
        $conv = DB::selectOne("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN stage='Won' THEN 1 ELSE 0 END) as won,
                SUM(CASE WHEN stage='Lost' THEN 1 ELSE 0 END) as lost,
                SUM(CASE WHEN stage='On Hold' THEN 1 ELSE 0 END) as on_hold,
                SUM(CASE WHEN stage NOT IN ('Won','Lost','On Hold') THEN 1 ELSE 0 END) as aktif,
                SUM(CASE WHEN sales_owner IS NULL THEN 1 ELSE 0 END) as unassigned,
                COALESCE(SUM(propose_value),0) as total_pipeline,
                COALESCE(SUM(CASE WHEN stage='Won' THEN deal_value ELSE 0 END),0) as total_won,
                COALESCE(SUM(CASE WHEN stage NOT IN ('Won','Lost') THEN propose_value ELSE 0 END),0) as active_pipeline,
                COALESCE(SUM(CASE WHEN stage NOT IN ('Won','Lost') THEN COALESCE(weighted_value,0) ELSE 0 END),0) as weighted_pipeline
            FROM leads"
        );

        // ── Avg days to close (Won leads) ─────────────────────────────────
        $avgClose = DB::selectOne("
            SELECT ROUND(AVG(EXTRACT(DAY FROM updated_at - tgl_masuk))) as avg_days
            FROM leads WHERE stage = 'Won' AND tgl_masuk IS NOT NULL"
        );

        // ── Monthly new leads trend (6 bulan terakhir) ────────────────────
        $monthlyTrend = DB::select("
            SELECT TO_CHAR(tgl_masuk,'YYYY-MM') as bulan,
                   COUNT(*) as jumlah,
                   COALESCE(SUM(propose_value),0) as total_nilai
            FROM leads WHERE tgl_masuk >= NOW() - INTERVAL '6 months'
            GROUP BY bulan ORDER BY bulan ASC"
        );

        // ── INSIGHT BARU: Pipeline Velocity (avg days_in_stage per stage) ─
        $velocity = DB::select("
            SELECT stage,
                   COUNT(*) as jumlah,
                   ROUND(AVG(days_in_stage)) as avg_days,
                   MAX(days_in_stage) as max_days,
                   MIN(days_in_stage) as min_days
            FROM leads
            WHERE stage NOT IN ('Won','Lost') AND days_in_stage IS NOT NULL
            GROUP BY stage ORDER BY avg_days DESC"
        );

        // ── INSIGHT BARU: Konversi per Source ─────────────────────────────
        $sourceConversion = DB::select("
            SELECT COALESCE(source,'Unknown') as source,
                   COUNT(*) as total,
                   SUM(CASE WHEN stage='Won' THEN 1 ELSE 0 END) as won,
                   SUM(CASE WHEN stage='Lost' THEN 1 ELSE 0 END) as lost,
                   COALESCE(SUM(CASE WHEN stage='Won' THEN deal_value ELSE 0 END),0) as won_value,
                   COALESCE(SUM(propose_value),0) as pipeline_value
            FROM leads GROUP BY source ORDER BY total DESC"
        );

        // ── INSIGHT BARU: Weighted Forecast per Stage ─────────────────────
        $weightedForecast = DB::select("
            SELECT stage,
                   COUNT(*) as jumlah,
                   COALESCE(SUM(propose_value),0) as propose_value,
                   COALESCE(SUM(COALESCE(weighted_value,0)),0) as weighted_value,
                   ROUND(AVG(NULLIF(probability,0))) as avg_probability
            FROM leads
            WHERE stage NOT IN ('Won','Lost')
            GROUP BY stage ORDER BY weighted_value DESC"
        );

        // ── INSIGHT BARU: On Hold at Risk ─────────────────────────────────
        $onHoldRisk = DB::select("
            SELECT lead_id, nama_company, propose_value, sales_owner,
                   last_fu_date, segmen,
                   COALESCE(EXTRACT(DAY FROM NOW()-last_fu_date)::int, 9999) as days_idle
            FROM leads
            WHERE stage = 'On Hold'
            ORDER BY propose_value DESC"
        );

        // ── INSIGHT BARU: Hot leads yang tidak di-FU > 14 hari ────────────
        $hotStale = DB::select("
            SELECT lead_id, nama_company, stage, propose_value, sales_owner,
                   last_fu_date, next_fu_date,
                   COALESCE(EXTRACT(DAY FROM NOW()-last_fu_date)::int, 9999) as days_since_fu
            FROM leads
            WHERE prioritas = 'Hot'
              AND stage NOT IN ('Won','Lost')
              AND (last_fu_date IS NULL OR last_fu_date < NOW()-INTERVAL '14 days')
            ORDER BY propose_value DESC"
        );

        // ── INSIGHT BARU: Top leads siap close ────────────────────────────
        $readyToClose = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, propose_value,
                   probability, exp_close_date, sales_owner, next_fu_date,
                   COALESCE(COALESCE(weighted_value,0),0) as weighted_value
            FROM leads
            WHERE stage IN ('Proposal Sent','Negotiation')
            ORDER BY
                CASE prioritas WHEN 'Hot' THEN 1 WHEN 'Warm' THEN 2 ELSE 3 END,
                propose_value DESC"
        );

        // ── INSIGHT BARU: Leads closing soon (exp_close_date terdekat) ────
        $closingSoon = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, propose_value,
                   exp_close_date, sales_owner,
                   (exp_close_date::date - CURRENT_DATE) as days_until_close
            FROM leads
            WHERE exp_close_date IS NOT NULL
              AND exp_close_date >= CURRENT_DATE
              AND stage NOT IN ('Won','Lost')
            ORDER BY exp_close_date ASC LIMIT 10"
        );

        return response()->json([
            'tahun'             => $tahun,
            'by_stage'          => array_map(fn($r) => (array)$r, $stageRows),
            'by_sales'          => array_map(fn($r) => (array)$r, $salesRows),
            'win_loss'          => array_map(fn($r) => (array)$r, $wlRows),
            'by_product'        => array_map(fn($r) => (array)$r, $productRows),
            'stale_leads'       => array_map(fn($r) => (array)$r, $stale),
            'high_value'        => array_map(fn($r) => (array)$r, $highValue),
            'by_priority'       => array_map(fn($r) => (array)$r, $byPriority),
            'monthly_trend'     => array_map(fn($r) => (array)$r, $monthlyTrend),
            'stats'             => (array)$conv,
            'avg_days_close'    => (int)($avgClose->avg_days ?? 0),
            // New insights
            'velocity'          => array_map(fn($r) => (array)$r, $velocity),
            'source_conversion' => array_map(fn($r) => (array)$r, $sourceConversion),
            'weighted_forecast' => array_map(fn($r) => (array)$r, $weightedForecast),
            'onhold_risk'       => array_map(fn($r) => (array)$r, $onHoldRisk),
            'hot_stale'         => array_map(fn($r) => (array)$r, $hotStale),
            'ready_to_close'    => array_map(fn($r) => (array)$r, $readyToClose),
            'closing_soon'      => array_map(fn($r) => (array)$r, $closingSoon),
        ]);
    }
}
