<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = now()->toDateString();
        $y     = now()->year;
        $m     = now()->month;

        $auth        = $request->attributes->get('auth_user', []);
        $salesOnly   = $auth['is_sales_only'] ?? false;
        $salesOwner  = $auth['nama'] ?? null;
        $salesFilter = $salesOnly ? " AND sales_owner = ?" : "";
        $salesWhere  = $salesOnly ? " WHERE sales_owner = ?" : "";

        // ── Pipeline stats ────────────────────────────────────────────────
        $statsParams = $salesOnly
            ? [$today, $today, $salesOwner]
            : [$today, $today];
        $stats = DB::selectOne("
            SELECT
                COUNT(*) as total,
                SUM(CASE WHEN stage='Won'  THEN 1 ELSE 0 END) as won,
                SUM(CASE WHEN stage='Lost' THEN 1 ELSE 0 END) as lost,
                SUM(CASE WHEN stage='On Hold' THEN 1 ELSE 0 END) as on_hold,
                SUM(CASE WHEN stage NOT IN ('Won','Lost','On Hold') THEN 1 ELSE 0 END) as aktif,
                SUM(CASE WHEN sales_owner IS NULL THEN 1 ELSE 0 END) as unassigned,
                SUM(CASE WHEN (last_fu_date IS NULL OR last_fu_date < NOW()-INTERVAL '30 days')
                              AND stage NOT IN ('Won','Lost') THEN 1 ELSE 0 END) as stale,
                SUM(CASE WHEN next_fu_date < ? AND stage NOT IN ('Won','Lost') THEN 1 ELSE 0 END) as overdue_fu,
                SUM(CASE WHEN next_fu_date = ? THEN 1 ELSE 0 END) as fu_today,
                COALESCE(SUM(propose_value),0) as total_pipeline,
                COALESCE(SUM(CASE WHEN stage NOT IN ('Won','Lost') THEN propose_value ELSE 0 END),0) as active_pipeline,
                COALESCE(SUM(CASE WHEN stage NOT IN ('Won','Lost') THEN COALESCE(weighted_value,0) ELSE 0 END),0) as weighted_pipeline,
                COALESCE(SUM(CASE WHEN stage='Won' THEN deal_value ELSE 0 END),0) as total_won,
                COALESCE(SUM(CASE WHEN stage='On Hold' THEN propose_value ELSE 0 END),0) as onhold_value,
                COALESCE(SUM(CASE WHEN stage='Won' AND DATE_TRUNC('month',updated_at)=DATE_TRUNC('month',NOW()) THEN deal_value ELSE 0 END),0) as won_amount_month,
                COUNT(CASE WHEN stage NOT IN ('Won','Lost') THEN 1 END) as pipeline_count
            FROM leads
            WHERE 1=1 $salesFilter", $statsParams
        );

        // ── By stage with value ───────────────────────────────────────────
        $byStageParams = $salesOnly ? [$salesOwner] : [];
        $byStage = DB::select("
            SELECT stage, COUNT(*) as jumlah,
                   COALESCE(SUM(propose_value),0) as total_nilai
            FROM leads
            WHERE 1=1 $salesFilter
            GROUP BY stage ORDER BY jumlah DESC",
            $byStageParams
        );

        // ── By segmen ─────────────────────────────────────────────────────
        $bySegmen = DB::select("
            SELECT COALESCE(segmen,'Lainnya') as segmen,
                   COUNT(*) as jumlah,
                   COALESCE(SUM(propose_value),0) as total_nilai,
                   SUM(CASE WHEN stage='Won' THEN 1 ELSE 0 END) as won
            FROM leads
            WHERE 1=1 $salesFilter
            GROUP BY segmen ORDER BY jumlah DESC",
            $byStageParams
        );

        // ── By priority ───────────────────────────────────────────────────
        $byPriority = DB::select("
            SELECT COALESCE(prioritas,'—') as prioritas,
                   COUNT(*) as jumlah,
                   COALESCE(SUM(propose_value),0) as total_nilai
            FROM leads
            WHERE 1=1 $salesFilter
            GROUP BY prioritas ORDER BY jumlah DESC",
            $byStageParams
        );

        // ── By source ─────────────────────────────────────────────────────
        $bySource = DB::select("
            SELECT COALESCE(source,'Unknown') as source,
                   COUNT(*) as jumlah,
                   SUM(CASE WHEN stage='Won' THEN 1 ELSE 0 END) as won
            FROM leads
            WHERE 1=1 $salesFilter
            GROUP BY source ORDER BY jumlah DESC",
            $byStageParams
        );

        // ── By organisasi ─────────────────────────────────────────────────
        $byOrganisasi = DB::select("
            SELECT COALESCE(organisasi,'Tidak Ditentukan') as organisasi,
                   COUNT(*) as jumlah,
                   COALESCE(SUM(propose_value),0) as total_nilai,
                   SUM(CASE WHEN stage NOT IN ('Won','Lost') THEN 1 ELSE 0 END) as aktif,
                   SUM(CASE WHEN stage='Won' THEN 1 ELSE 0 END) as won
            FROM leads
            WHERE 1=1 $salesFilter
            GROUP BY organisasi ORDER BY total_nilai DESC",
            $byStageParams
        );

        // ── Sales target bulan ini ───────────────────────────────────────
        $targetParam = $salesOnly ? [$y, $m, $salesOwner] : [$y, $m];
        $targetFilter = $salesOnly ? " AND sales_nama = ?" : "";
        $targetRow = DB::selectOne("
            SELECT COALESCE(SUM(target_deal),0) as target_month
            FROM sales_targets
            WHERE tahun = ? AND bulan = ? $targetFilter",
            $targetParam
        );
        $targetMonth = (float)($targetRow->target_month ?? 0);

        // ── Weekly FU (7 hari terakhir per hari) ─────────────────────────
        $weekStart  = now()->subDays(6)->startOfDay()->toDateString();
        $weekParams = $salesOnly
            ? [$weekStart, $today, $salesOwner]
            : [$weekStart, $today];
        $salesFuFilter = $salesOnly ? " AND sales_owner = ?" : "";
        $weeklyFu = DB::select("
            SELECT DATE(tgl_fu) as fu_date, COUNT(*) as jumlah
            FROM follow_up_log
            WHERE tgl_fu BETWEEN ? AND ?
              $salesFuFilter
            GROUP BY DATE(tgl_fu)
            ORDER BY fu_date ASC",
            $weekParams
        );

        // ── Revenue bulan ini ─────────────────────────────────────────────
        $revRow = DB::selectOne("
            SELECT COALESCE(SUM(rm.actual),0) as actual,
                   COALESCE(SUM(rm.target),0) as target
            FROM revenue_monthly rm
            JOIN revenue_projects rp ON rm.project_id = rp.project_id
            WHERE rm.month_num = ? AND rp.tahun = ?",
            [$m, $y]
        );
        $revActual = (float)($revRow->actual ?? 0);
        $revTarget = (float)($revRow->target ?? 0);
        $revAch    = $revTarget > 0 ? round($revActual / $revTarget * 100, 1) : 0;

        // ── Upcoming FU (7 hari ke depan) ────────────────────────────────
        $upcomingParams = $salesOnly
            ? [$today, now()->addDays(7)->toDateString(), $salesOwner]
            : [$today, now()->addDays(7)->toDateString()];
        $upcoming = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, next_fu_date,
                   sales_owner, organisasi, propose_value
            FROM leads
            WHERE next_fu_date BETWEEN ? AND ?
              AND stage NOT IN ('Won','Lost')
              $salesFilter
            ORDER BY next_fu_date, prioritas DESC LIMIT 8",
            $upcomingParams
        );

        // ── Overdue FU ────────────────────────────────────────────────────
        $overdueParams = $salesOnly ? [$today, $salesOwner] : [$today];
        $overdue = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, next_fu_date,
                   sales_owner, organisasi, propose_value,
                   (CURRENT_DATE - next_fu_date::date) as days_overdue
            FROM leads
            WHERE next_fu_date < ? AND stage NOT IN ('Won','Lost')
              $salesFilter
            ORDER BY next_fu_date ASC LIMIT 5",
            $overdueParams
        );

        // ── Recent FU activity ────────────────────────────────────────────
        $recentParams = $salesOnly ? [$salesOwner] : [];
        $recentFilter = $salesOnly ? " WHERE fl.sales_owner = ?" : "";
        $recent = DB::select("
            SELECT fl.tgl_fu, fl.metode_fu, fl.hasil_fu, fl.catatan_fu,
                   fl.nama_company, fl.lead_id
            FROM follow_up_log fl
            $recentFilter
            ORDER BY fl.created_at DESC LIMIT 6",
            $recentParams
        );

        // ── Top 3 leads SIAP CLOSE ────────────────────────────────────────
        $readyToClose = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, propose_value,
                   probability, exp_close_date, sales_owner, organisasi, next_fu_date
            FROM leads
            WHERE stage IN ('Proposal Sent','Negotiation')
              AND stage NOT IN ('Won','Lost')
              $salesFilter
            ORDER BY
                CASE prioritas WHEN 'Hot' THEN 1 WHEN 'Warm' THEN 2 ELSE 3 END,
                propose_value DESC
            LIMIT 5",
            $byStageParams
        );

        // ── Hot leads yang STALE (tidak di-FU > 14 hari) ─────────────────
        $hotStale = DB::select("
            SELECT lead_id, nama_company, stage, propose_value, sales_owner, organisasi,
                   last_fu_date,
                   COALESCE(EXTRACT(DAY FROM NOW()-last_fu_date)::int, 9999) as days_since_fu
            FROM leads
            WHERE prioritas = 'Hot'
              AND stage NOT IN ('Won','Lost')
              AND (last_fu_date IS NULL OR last_fu_date < NOW()-INTERVAL '14 days')
              $salesFilter
            ORDER BY propose_value DESC LIMIT 5",
            $byStageParams
        );

        // ── Leads exp_close terdekat ──────────────────────────────────────
        $closingSoonParams = $salesOnly ? [$today, $salesOwner] : [$today];
        $closingSoon = DB::select("
            SELECT lead_id, nama_company, stage, prioritas, propose_value,
                   exp_close_date, sales_owner, organisasi,
                   (exp_close_date::date - CURRENT_DATE) as days_until_close
            FROM leads
            WHERE exp_close_date IS NOT NULL
              AND exp_close_date >= ?
              AND stage NOT IN ('Won','Lost')
              $salesFilter
            ORDER BY exp_close_date ASC LIMIT 5",
            $closingSoonParams
        );

        // ── On Hold at risk ───────────────────────────────────────────────
        $onHoldAtRisk = DB::select("
            SELECT lead_id, nama_company, propose_value, sales_owner, organisasi,
                   last_fu_date,
                   COALESCE(EXTRACT(DAY FROM NOW()-last_fu_date)::int, 9999) as days_idle
            FROM leads
            WHERE stage = 'On Hold'
              $salesFilter
            ORDER BY propose_value DESC LIMIT 5",
            $byStageParams
        );

        // ── Health score ──────────────────────────────────────────────────
        $aktif       = max((int)$stats->aktif + (int)$stats->on_hold, 1);
        $assignedPct = (($aktif - (int)$stats->unassigned) / $aktif * 100);
        $fuPct       = max(0, $aktif - (int)$stats->stale) / $aktif * 100;
        $closed      = (int)$stats->won + (int)$stats->lost;
        $winPct      = $closed > 0 ? ((int)$stats->won / $closed * 100) : 50;
        $healthScore = (int)round(($assignedPct * 0.4) + ($fuPct * 0.35) + ($winPct * 0.25));

        return response()->json([
            'stats'           => (array)$stats,
            'by_stage'        => array_map(fn($r) => (array)$r, $byStage),
            'by_segmen'       => array_map(fn($r) => (array)$r, $bySegmen),
            'by_priority'     => array_map(fn($r) => (array)$r, $byPriority),
            'by_source'       => array_map(fn($r) => (array)$r, $bySource),
            'rev_actual'      => $revActual,
            'rev_target'      => $revTarget,
            'rev_ach'         => $revAch,
            'upcoming_fu'     => array_map(fn($r) => (array)$r, $upcoming),
            'overdue_fu'      => array_map(fn($r) => (array)$r, $overdue),
            'recent_activity' => array_map(fn($r) => (array)$r, $recent),
            'ready_to_close'  => array_map(fn($r) => (array)$r, $readyToClose),
            'hot_stale'       => array_map(fn($r) => (array)$r, $hotStale),
            'closing_soon'    => array_map(fn($r) => (array)$r, $closingSoon),
            'onhold_at_risk'  => array_map(fn($r) => (array)$r, $onHoldAtRisk),
            'by_organisasi'   => array_map(fn($r) => (array)$r, $byOrganisasi),
            'health_score'    => $healthScore,
            'weekly_fu'       => array_map(fn($r) => (array)$r, $weeklyFu),
            'target_month'    => $targetMonth,
        ]);
    }

    public function dailyRecommendations(Request $request)
    {
        $auth      = $request->attributes->get('auth_user', []);
        $isSales   = $auth['is_sales_only'] ?? false;
        $authNama  = $auth['nama'] ?? '';

        $sf  = $isSales ? " AND sales_owner = ?" : "";
        $sfP = $isSales ? [$authNama] : [];
        $today = now()->toDateString();

        $items = [];

        // 1. FU hari ini
        $fuToday = DB::select(
            "SELECT lead_id, nama_company, prioritas, next_fu_type, propose_value, product
             FROM leads WHERE next_fu_date = ? AND stage NOT IN ('Won','Lost') $sf
             ORDER BY prioritas DESC, nama_company ASC LIMIT 10",
            array_merge([$today], $sfP)
        );
        foreach ($fuToday as $l) {
            $items[] = [
                'type'        => 'fu_today',
                'priority'    => 'high',
                'lead_id'     => $l->lead_id,
                'nama_company'=> $l->nama_company,
                'product'     => $l->product,
                'prioritas'   => $l->prioritas,
                'action'      => "Lakukan FU via " . ($l->next_fu_type ?: 'WhatsApp'),
                'label'       => 'FU Hari Ini',
                'icon'        => 'fa-bolt',
                'color'       => 'text-yellow-400',
            ];
        }

        // 2. Overdue FU
        $overdue = DB::select(
            "SELECT lead_id, nama_company, prioritas, next_fu_date, propose_value, product,
                    (CURRENT_DATE - next_fu_date::date) as days_overdue
             FROM leads WHERE next_fu_date < ? AND stage NOT IN ('Won','Lost') $sf
             ORDER BY days_overdue DESC, prioritas DESC LIMIT 10",
            array_merge([$today], $sfP)
        );
        foreach ($overdue as $l) {
            $items[] = [
                'type'        => 'overdue',
                'priority'    => $l->days_overdue >= 7 ? 'critical' : 'high',
                'lead_id'     => $l->lead_id,
                'nama_company'=> $l->nama_company,
                'product'     => $l->product,
                'prioritas'   => $l->prioritas,
                'action'      => "FU terlewat {$l->days_overdue} hari — segera hubungi",
                'label'       => 'Overdue',
                'icon'        => 'fa-clock',
                'color'       => 'text-red-400',
            ];
        }

        // 3. Hot leads tanpa jadwal FU
        $hotUnscheduled = DB::select(
            "SELECT lead_id, nama_company, prioritas, last_fu_date, propose_value, product
             FROM leads WHERE next_fu_date IS NULL AND prioritas = 'Hot'
               AND stage NOT IN ('Won','Lost') $sf
             ORDER BY nama_company ASC LIMIT 5",
            $sfP
        );
        foreach ($hotUnscheduled as $l) {
            $items[] = [
                'type'        => 'hot_unscheduled',
                'priority'    => 'high',
                'lead_id'     => $l->lead_id,
                'nama_company'=> $l->nama_company,
                'product'     => $l->product,
                'prioritas'   => $l->prioritas,
                'action'      => "Lead Hot belum punya jadwal FU — jadwalkan segera",
                'label'       => 'Perlu Dijadwalkan',
                'icon'        => 'fa-fire',
                'color'       => 'text-orange-400',
            ];
        }

        // 4. Leads Negotiation/Proposal tidak disentuh > 7 hari
        $stale = DB::select(
            "SELECT lead_id, nama_company, prioritas, last_fu_date, stage, propose_value, product,
                    (CURRENT_DATE - last_fu_date::date) as days_stale
             FROM leads WHERE stage IN ('Negotiation','Proposal')
               AND last_fu_date IS NOT NULL
               AND (CURRENT_DATE - last_fu_date::date) > 7
               AND stage NOT IN ('Won','Lost') $sf
             ORDER BY days_stale DESC LIMIT 5",
            $sfP
        );
        foreach ($stale as $l) {
            $items[] = [
                'type'        => 'stale',
                'priority'    => 'medium',
                'lead_id'     => $l->lead_id,
                'nama_company'=> $l->nama_company,
                'product'     => $l->product,
                'prioritas'   => $l->prioritas,
                'action'      => "Di stage {$l->stage}, tidak ada update sejak {$l->days_stale} hari lalu",
                'label'       => 'Perlu Update',
                'icon'        => 'fa-triangle-exclamation',
                'color'       => 'text-amber-400',
            ];
        }

        // 5. Warm leads tidak disentuh > 14 hari tanpa jadwal
        $warmCold = DB::select(
            "SELECT lead_id, nama_company, prioritas, last_fu_date, propose_value, product,
                    (CURRENT_DATE - last_fu_date::date) as days_stale
             FROM leads WHERE prioritas IN ('Warm','Hot') AND next_fu_date IS NULL
               AND last_fu_date IS NOT NULL
               AND (CURRENT_DATE - last_fu_date::date) > 14
               AND stage NOT IN ('Won','Lost') $sf
             ORDER BY prioritas DESC, days_stale DESC LIMIT 5",
            $sfP
        );
        foreach ($warmCold as $l) {
            $items[] = [
                'type'        => 'warm_stale',
                'priority'    => 'low',
                'lead_id'     => $l->lead_id,
                'nama_company'=> $l->nama_company,
                'product'     => $l->product,
                'prioritas'   => $l->prioritas,
                'action'      => "Belum ada kontak sejak {$l->days_stale} hari — pertimbangkan re-engage",
                'label'       => 'Sudah Lama',
                'icon'        => 'fa-rotate-left',
                'color'       => 'text-blue-400',
            ];
        }

        // Urutkan: critical → high → medium → low
        $order = ['critical' => 0, 'high' => 1, 'medium' => 2, 'low' => 3];
        usort($items, fn($a, $b) => ($order[$a['priority']] ?? 9) - ($order[$b['priority']] ?? 9));

        return response()->json([
            'date'  => $today,
            'items' => $items,
            'summary' => [
                'fu_today'   => count($fuToday),
                'overdue'    => count($overdue),
                'unscheduled'=> count($hotUnscheduled),
                'stale'      => count($stale),
            ],
        ]);
    }
}
