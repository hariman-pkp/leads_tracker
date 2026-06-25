<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnalyticsController extends Controller
{
    private function authUser(Request $request): array
    {
        return $request->attributes->get('auth_user', []);
    }

    public function personal(Request $request)
    {
        $auth       = $this->authUser($request);
        $salesOnly  = $auth['is_sales_only'] ?? false;
        $salesOwner = $auth['nama'] ?? null;

        // ── Summary stats ───────────────────────────────────────────────
        $summaryWhere  = $salesOnly ? "WHERE l.sales_owner = ?" : "WHERE 1=1";
        $summaryParams = $salesOnly ? [$salesOwner] : [];

        $summary = DB::selectOne("
            SELECT
                COUNT(*)                                                              AS total_leads,
                SUM(CASE WHEN l.stage = 'Won'  THEN 1 ELSE 0 END)                   AS won,
                SUM(CASE WHEN l.stage = 'Lost' THEN 1 ELSE 0 END)                   AS lost,
                AVG(CASE WHEN l.stage = 'Won'  THEN l.deal_value ELSE NULL END)      AS avg_deal_value,
                SUM(CASE WHEN l.stage = 'Won'  THEN COALESCE(l.deal_value,0) ELSE 0 END) AS total_deal_won
            FROM leads l
            $summaryWhere
        ", $summaryParams);

        $totalClosed = ($summary->won ?? 0) + ($summary->lost ?? 0);
        $winRate     = $totalClosed > 0
            ? round(($summary->won / $totalClosed) * 100, 1)
            : 0;

        // ── Monthly activity (last 6 months) ────────────────────────────
        $monthlyWhere  = $salesOnly ? "AND f.sales_owner = ?" : "";
        $monthlyParams = $salesOnly ? [$salesOwner] : [];

        $monthlyActivity = DB::select("
            SELECT
                TO_CHAR(f.tgl_fu, 'YYYY-MM')  AS month,
                COUNT(f.fu_id)                 AS total_fu,
                COUNT(DISTINCT CASE
                    WHEN TO_CHAR(l.created_at, 'YYYY-MM') = TO_CHAR(f.tgl_fu, 'YYYY-MM')
                    THEN l.id END)             AS new_leads,
                COUNT(DISTINCT CASE
                    WHEN l.stage = 'Won'
                     AND TO_CHAR(l.updated_at, 'YYYY-MM') = TO_CHAR(f.tgl_fu, 'YYYY-MM')
                    THEN l.id END)             AS won
            FROM follow_up_log f
            JOIN leads l ON l.lead_id = f.lead_id
            WHERE f.tgl_fu >= CURRENT_DATE - INTERVAL '6 months'
              $monthlyWhere
            GROUP BY TO_CHAR(f.tgl_fu, 'YYYY-MM')
            ORDER BY month ASC
        ", $monthlyParams);

        // ── By stage ─────────────────────────────────────────────────────
        $stageWhere  = $salesOnly ? "AND l.sales_owner = ?" : "";
        $stageParams = $salesOnly ? [$salesOwner] : [];

        $byStage = DB::select("
            SELECT l.stage, COUNT(*) AS cnt
            FROM leads l
            WHERE l.stage NOT IN ('Won','Lost')
              $stageWhere
            GROUP BY l.stage
            ORDER BY cnt DESC
        ", $stageParams);

        // ── Follow-up this month ──────────────────────────────────────────
        $fuThisMonth = DB::selectOne("
            SELECT COUNT(*) AS total_fu
            FROM follow_up_log f
            JOIN leads l ON l.lead_id = f.lead_id
            WHERE f.tgl_fu >= CURRENT_DATE - INTERVAL '30 days'
              $monthlyWhere
        ", $monthlyParams);

        // ── Pipeline value by stage ──────────────────────────────────────
        $pipelineValue = DB::select("
            SELECT l.stage,
                   COALESCE(SUM(l.deal_value), 0) AS total_value,
                   COUNT(*) AS cnt
            FROM leads l
            WHERE l.stage NOT IN ('Won','Lost')
              $stageWhere
            GROUP BY l.stage
            ORDER BY total_value DESC
        ", $stageParams);

        return response()->json([
            'summary' => [
                'total_leads'    => (int)($summary->total_leads ?? 0),
                'won'            => (int)($summary->won ?? 0),
                'lost'           => (int)($summary->lost ?? 0),
                'win_rate'       => $winRate,
                'avg_deal_value' => round((float)($summary->avg_deal_value ?? 0)),
                'total_deal_won' => round((float)($summary->total_deal_won ?? 0)),
                'total_fu_month' => (int)($fuThisMonth->total_fu ?? 0),
            ],
            'monthly_activity' => $monthlyActivity,
            'by_stage'         => $byStage,
            'pipeline_value'   => $pipelineValue,
        ]);
    }
}
