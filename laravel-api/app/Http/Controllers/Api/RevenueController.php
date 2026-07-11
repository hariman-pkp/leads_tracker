<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RevenueController extends Controller
{
    // ── Helper: daftar tahun yang tersedia ────────────────────────────
    private function years(): array
    {
        return array_column(
            DB::select("SELECT DISTINCT tahun FROM revenue_projects WHERE deleted_at IS NULL ORDER BY tahun DESC"),
            'tahun'
        );
    }

    // ── Helper: hitung & simpan status + risk_level otomatis ─────────
    /**
     * Recalculate realisasi dari tabel invoices → revenue_monthly → revenue_projects.
     * Dipanggil setelah setiap insert/update invoice.
     */
    // Map nama bulan (EN/ID) → nomor bulan
    private function periodToMonthNum(?string $period): ?int
    {
        if (!$period) return null;
        $map = [
            'january'=>1,'february'=>2,'march'=>3,'april'=>4,'may'=>5,'june'=>6,
            'july'=>7,'august'=>8,'september'=>9,'october'=>10,'november'=>11,'december'=>12,
            'januari'=>1,'februari'=>2,'maret'=>3,'mei'=>5,'juni'=>6,
            'juli'=>7,'agustus'=>8,'oktober'=>10,'desember'=>12,
        ];
        return $map[strtolower(trim($period))] ?? null;
    }

    private function syncRealisasi(string $projectId): void
    {
        $names = ['','Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];

        // Ambil semua invoice project ini
        $invoices = DB::select(
            "SELECT invoice_amount, period, invoice_date FROM invoices WHERE project_id=?",
            [$projectId]
        );

        // Daftar bulan yang punya target (untuk fallback ke bulan terdekat)
        $targetMonths = array_column(
            DB::select(
                "SELECT month_num FROM revenue_monthly WHERE project_id=? AND target > 0 ORDER BY month_num",
                [$projectId]
            ),
            'month_num'
        );
        $targetMonths = array_map('intval', $targetMonths);

        // 1. Akumulasi invoice_amount per bulan (gunakan period, fallback ke invoice_date)
        $byMonth = [];
        foreach ($invoices as $inv) {
            $m = $this->periodToMonthNum($inv->period);
            // Fallback ke bulan dari invoice_date jika period tidak dikenali
            if (!$m && $inv->invoice_date) {
                $m = (int)date('n', strtotime($inv->invoice_date));
            }
            if (!$m) continue;

            // Jika bulan $m tidak punya target, cari bulan terdekat yang ada target
            if (!empty($targetMonths) && !in_array($m, $targetMonths)) {
                $closest = null;
                $minDiff = PHP_INT_MAX;
                foreach ($targetMonths as $tm) {
                    $diff = abs($tm - $m);
                    if ($diff < $minDiff) { $minDiff = $diff; $closest = $tm; }
                }
                $m = $closest;
            }

            $byMonth[$m] = ($byMonth[$m] ?? 0) + (float)$inv->invoice_amount;
        }

        // 2. Update revenue_monthly.actual — hanya bulan yang ada di revenue_monthly
        $rows = DB::select(
            "SELECT id, month_num, target FROM revenue_monthly WHERE project_id=?",
            [$projectId]
        );
        foreach ($rows as $row) {
            $actual = $byMonth[(int)$row->month_num] ?? 0;
            $target = (float)$row->target;
            $ach    = $target > 0 ? round($actual / $target * 100, 1) : ($actual > 0 ? 100.0 : 0.0);
            $status = $ach >= 100 ? 'On Track' : ($ach >= 70 ? 'At Risk' : ($target > 0 || $actual > 0 ? 'Off Track' : 'On Track'));
            DB::table('revenue_monthly')->where('id', $row->id)
                ->update(['actual' => $actual, 'status' => $status]);
        }

        // Jika ada bulan realisasi yang sama sekali tidak ada di revenue_monthly, buat baris baru
        $existingMonths = array_map(fn($r) => (int)$r->month_num, $rows);
        foreach ($byMonth as $m => $actual) {
            if (in_array($m, $existingMonths) || $actual <= 0) continue;
            $target = 0;
            $status = 'Off Track';
            DB::table('revenue_monthly')->insert([
                'project_id' => $projectId, 'month_num' => $m,
                'month_name' => $names[$m] ?? "Bulan $m",
                'target' => 0, 'actual' => $actual, 'status' => $status,
            ]);
        }

        // 3. Update actual_revenue di revenue_projects
        $sumActual = (float)DB::selectOne(
            "SELECT COALESCE(SUM(actual), 0) as s FROM revenue_monthly WHERE project_id=?",
            [$projectId]
        )->s;
        DB::table('revenue_projects')
            ->where('project_id', $projectId)
            ->update(['actual_revenue' => $sumActual]);

        // 4. Recalculate status & risk_level
        $this->syncProjectStatus($projectId);
    }

    private function syncProjectStatus(string $projectId): void
    {
        $p = DB::selectOne(
            "SELECT revenue_target, actual_revenue, type FROM revenue_projects WHERE project_id=?",
            [$projectId]
        );
        if (!$p) return;

        $actual   = (float)$p->actual_revenue;
        $curMonth = (int)date('n');

        // Bulanan/Termin: bandingkan dengan target kumulatif s.d. bulan berjalan
        if (in_array($p->type, ['Bulanan', 'Termin'])) {
            $ytd = DB::selectOne(
                "SELECT COALESCE(SUM(target), 0) as s FROM revenue_monthly
                 WHERE project_id=? AND month_num <= ?",
                [$projectId, $curMonth]
            );
            $target = (float)$ytd->s;
        } else {
            $target = (float)$p->revenue_target;
        }

        // Jika target belum diset, tidak bisa menghitung status — biarkan On Track
        if ($target <= 0) {
            DB::table('revenue_projects')
                ->where('project_id', $projectId)
                ->update(['status' => 'On Track', 'risk_level' => 'LOW']);
            return;
        }

        $ach = $actual / $target * 100;

        // Status
        if ($ach >= 80)      $status = 'On Track';
        elseif ($ach >= 50)  $status = 'At Risk';
        else                 $status = 'Critical';

        // Risk Level
        if ($ach >= 80)      $risk = 'LOW';
        elseif ($ach >= 60)  $risk = 'MEDIUM';
        elseif ($ach >= 30)  $risk = 'HIGH';
        else                 $risk = 'CRITICAL';

        DB::table('revenue_projects')
            ->where('project_id', $projectId)
            ->update(['status' => $status, 'risk_level' => $risk]);
    }

    // ── Helper: bulan Januari..Desember ──────────────────────────────
    private function monthList(): array
    {
        $names = ['','Januari','Februari','Maret','April','Mei','Juni',
                  'Juli','Agustus','September','Oktober','November','Desember'];
        $list  = [];
        for ($i = 1; $i <= 12; $i++) {
            $list[] = ['num' => $i, 'name' => $names[$i]];
        }
        return $list;
    }

    // ══════════════════════════════════════════════════════════════════
    // GET /api/v1/revenue/summary   — untuk revenue/index.vue
    // ══════════════════════════════════════════════════════════════════
    public function summary(Request $request)
    {
        $tahun    = (int)$request->query('tahun', now()->year);
        $curMonth = $tahun === (int)now()->year ? (int)now()->month : 12;

        // YTD totals (exclude On Hold & Failed)
        $ytd = DB::selectOne(
            "SELECT COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual,
                    COUNT(*) as total_projects
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             AND project_status IN ('Active','Completed')",
            [$tahun]
        );
        $ytdTarget = (float)$ytd->target;
        $ytdActual = (float)$ytd->actual;
        $achPct    = $ytdTarget > 0 ? round($ytdActual / $ytdTarget * 100, 1) : 0;

        // By kategori (exclude On Hold & Failed)
        $byKat = DB::select(
            "SELECT kategori,
                    COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             AND project_status IN ('Active','Completed')
             GROUP BY kategori",
            [$tahun]
        );
        $recTarget = $recActual = $prjTarget = $prjActual = 0;
        foreach ($byKat as $r) {
            if ($r->kategori === 'Recurring') { $recTarget = (float)$r->target; $recActual = (float)$r->actual; }
            if ($r->kategori === 'Project')   { $prjTarget = (float)$r->target; $prjActual = (float)$r->actual; }
        }

        // By status (object map)
        $statusRows = DB::select(
            "SELECT status, COUNT(*) as cnt FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL GROUP BY status",
            [$tahun]
        );
        $byStatus = [];
        foreach ($statusRows as $r) $byStatus[$r->status] = (int)$r->cnt;

        // Project status summary
        $psRows = DB::select(
            "SELECT project_status, COUNT(*) as cnt,
                    COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             GROUP BY project_status",
            [$tahun]
        );
        $projectStatusSummary = [];
        foreach ($psRows as $r) {
            $projectStatusSummary[$r->project_status] = [
                'cnt'    => (int)$r->cnt,
                'target' => (float)$r->target,
                'actual' => (float)$r->actual,
            ];
        }

        // Critical / At Risk projects — deteksi otomatis dari project_status Active/On Hold
        $critical = DB::select(
            "WITH ytd_target AS (
                SELECT rm.project_id,
                       COALESCE(SUM(CASE WHEN rm.month_num <= :m1 THEN rm.target ELSE 0 END), 0) AS target_ytd
                FROM revenue_monthly rm
                JOIN revenue_projects rp ON rp.project_id = rm.project_id
                WHERE rp.tahun = :yr1 AND rp.is_active = 1 AND rp.deleted_at IS NULL
                  AND rp.project_status NOT IN ('Failed', 'Completed')
                GROUP BY rm.project_id
            ),
            inv_ytd AS (
                SELECT project_id,
                       COALESCE(SUM(invoice_amount), 0) AS billed
                FROM invoices
                WHERE tahun = :yr2 AND EXTRACT(MONTH FROM invoice_date)::int <= :m2
                GROUP BY project_id
            )
            SELECT rp.project_id, rp.client, rp.product, rp.organisasi, rp.pic,
                   rp.revenue_target, rp.actual_revenue, rp.project_status,
                   COALESCE(yt.target_ytd, 0) AS target_ytd,
                   COALESCE(iv.billed, 0)      AS billed_ytd,
                   CASE
                     WHEN rp.project_status = 'On Hold' THEN 'At Risk'
                     WHEN COALESCE(yt.target_ytd, 0) = 0 THEN 'Critical'
                     WHEN COALESCE(iv.billed, 0) = 0 THEN 'Critical'
                     WHEN COALESCE(iv.billed, 0) / COALESCE(yt.target_ytd, 1) < 0.5 THEN 'Critical'
                     WHEN COALESCE(iv.billed, 0) / COALESCE(yt.target_ytd, 1) < 0.75 THEN 'At Risk'
                   END AS risk_label
            FROM revenue_projects rp
            LEFT JOIN ytd_target yt ON yt.project_id = rp.project_id
            LEFT JOIN inv_ytd iv    ON iv.project_id = rp.project_id
            WHERE rp.tahun = :yr3 AND rp.is_active = 1 AND rp.deleted_at IS NULL
              AND rp.project_status NOT IN ('Failed', 'Completed')
              AND (
                rp.project_status = 'On Hold'
                OR COALESCE(yt.target_ytd, 0) = 0
                OR COALESCE(iv.billed, 0) = 0
                OR COALESCE(iv.billed, 0) / NULLIF(COALESCE(yt.target_ytd, 0), 0) < 0.75
              )
            ORDER BY
              CASE
                WHEN rp.project_status = 'On Hold' THEN 1
                WHEN COALESCE(yt.target_ytd, 0) = 0 THEN 0
                WHEN COALESCE(iv.billed, 0) = 0 THEN 0
                WHEN COALESCE(iv.billed, 0) / NULLIF(COALESCE(yt.target_ytd, 0), 0) < 0.5 THEN 0
                ELSE 1
              END ASC,
              (COALESCE(iv.billed, 0) - COALESCE(yt.target_ytd, 0)) ASC",
            ['m1' => $curMonth, 'yr1' => $tahun, 'yr2' => $tahun, 'm2' => $curMonth, 'yr3' => $tahun]
        );

        // Total billed (YTD — semua invoice tahun ini)
        $totalBilled = (float)DB::selectOne(
            "SELECT COALESCE(SUM(invoice_amount),0) as billed FROM invoices WHERE tahun=?",
            [$tahun]
        )->billed;

        // Quarter trend
        $quarterRows = DB::select(
            "SELECT CEIL(rm.month_num / 3.0)::int AS quarter,
                    COALESCE(SUM(rm.target),0) as target,
                    COALESCE(SUM(rm.actual),0) as actual
             FROM revenue_monthly rm
             JOIN revenue_projects rp ON rm.project_id=rp.project_id
             WHERE rp.tahun=? AND rp.is_active=1
             GROUP BY CEIL(rm.month_num / 3.0)::int ORDER BY quarter",
            [$tahun]
        );
        $quarterTrend = array_map(fn($r) => [
            'quarter' => 'Q' . $r->quarter,
            'target'  => (float)$r->target,
            'actual'  => (float)$r->actual,
            'ach'     => $r->target > 0 ? round($r->actual / $r->target * 100, 1) : 0,
        ], $quarterRows);

        // Org breakdown
        $orgRows = DB::select(
            "SELECT organisasi,
                    COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual
             FROM revenue_projects
             WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
               AND project_status != 'Failed'
             GROUP BY organisasi ORDER BY target DESC",
            [$tahun]
        );
        $orgBreakdown = array_map(fn($r) => [
            'organisasi' => $r->organisasi,
            'target'     => (float)$r->target,
            'actual'     => (float)$r->actual,
            'ach'        => $r->target > 0 ? round($r->actual / $r->target * 100, 1) : 0,
        ], $orgRows);

        // Failed per organisasi
        $failedOrgRows = DB::select(
            "SELECT organisasi, COUNT(*) as cnt,
                    COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual
             FROM revenue_projects
             WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
               AND project_status = 'Failed'
             GROUP BY organisasi ORDER BY target DESC",
            [$tahun]
        );
        $failedByOrg = array_map(fn($r) => [
            'organisasi' => $r->organisasi,
            'cnt'        => (int)$r->cnt,
            'target'     => (float)$r->target,
            'actual'     => (float)$r->actual,
            'gap'        => (float)$r->actual - (float)$r->target,
        ], $failedOrgRows);

        // Recurring behind YTD target — via CTE
        $recurringBehind = DB::select(
            "WITH monthly_ytd AS (
                 SELECT rm.project_id,
                        COALESCE(SUM(CASE WHEN rm.month_num <= :m1 THEN rm.target ELSE 0 END),0) AS target_ytd,
                        COALESCE(SUM(CASE WHEN rm.month_num <= :m2 THEN rm.actual ELSE 0 END),0) AS collected
                 FROM revenue_monthly rm
                 JOIN revenue_projects rp ON rp.project_id = rm.project_id
                 WHERE rp.tahun = :yr1 AND rp.is_active = 1 AND rp.kategori = 'Recurring'
                   AND rp.deleted_at IS NULL AND rp.project_status NOT IN ('On Hold','Failed')
                 GROUP BY rm.project_id
             ),
             inv_ytd AS (
                 SELECT project_id,
                        COALESCE(SUM(invoice_amount),0) AS billed,
                        COALESCE(SUM(paid_amount),0)    AS paid
                 FROM invoices
                 WHERE tahun = :yr2 AND EXTRACT(MONTH FROM invoice_date)::int <= :m3
                 GROUP BY project_id
             )
             SELECT rp.project_id, rp.product, rp.client, rp.pic, rp.revenue_target,
                    m.target_ytd, m.collected,
                    COALESCE(i.billed,0) AS billed,
                    COALESCE(i.paid,0)   AS paid
             FROM revenue_projects rp
             JOIN monthly_ytd m ON m.project_id = rp.project_id
             LEFT JOIN inv_ytd i ON i.project_id = rp.project_id
             WHERE m.collected < m.target_ytd
             ORDER BY (m.collected - m.target_ytd) ASC",
            ['m1' => $curMonth, 'm2' => $curMonth, 'm3' => $curMonth,
             'yr1' => $tahun,   'yr2' => $tahun]
        );
        $recurringBehindMapped = array_map(fn($r) => [
            'project_id'    => $r->project_id,
            'product'       => $r->product,
            'client'        => $r->client,
            'pic'           => $r->pic,
            'revenue_target'=> (float)$r->revenue_target,
            'target_ytd'    => (float)$r->target_ytd,
            'billed'        => (float)$r->billed,
            'paid'          => (float)$r->paid,
            'collected'     => (float)$r->collected,
            'gap_billed'    => (float)$r->billed    - (float)$r->target_ytd,
            'gap_collected' => (float)$r->collected - (float)$r->target_ytd,
            'ach_pct'       => (float)$r->target_ytd > 0
                               ? round((float)$r->collected / (float)$r->target_ytd * 100, 1) : 0,
        ], $recurringBehind);

        // Monthly trend
        $monthly = DB::select(
            "SELECT rm.month_num, MAX(rm.month_name) as month_name,
                    COALESCE(SUM(rm.target),0) as total_target,
                    COALESCE(SUM(rm.actual),0) as total_actual,
                    COALESCE(SUM(inv.billed),0) as total_billed
             FROM revenue_monthly rm
             JOIN revenue_projects rp ON rm.project_id=rp.project_id
             LEFT JOIN (
                 SELECT EXTRACT(MONTH FROM invoice_date)::int AS month_num,
                        project_id,
                        SUM(invoice_amount) as billed
                 FROM invoices
                 WHERE tahun=?
                 GROUP BY EXTRACT(MONTH FROM invoice_date)::int, project_id
             ) inv ON inv.project_id=rm.project_id AND inv.month_num=rm.month_num
             WHERE rp.tahun=? AND rp.is_active=1
             GROUP BY rm.month_num ORDER BY rm.month_num",
            [$tahun, $tahun]
        );

        return response()->json([
            'tahun'           => $tahun,
            'cur_year'        => now()->year,
            'cur_month'       => $curMonth,
            'years'           => $this->years(),
            'total_target'    => $ytdTarget,
            'total_actual'    => $ytdActual,
            'total_billed'    => $totalBilled,
            'ach_pct'         => $achPct,
            'total_projects'  => (int)$ytd->total_projects,
            'rec_target'      => $recTarget,
            'rec_actual'      => $recActual,
            'prj_target'      => $prjTarget,
            'prj_actual'      => $prjActual,
            'by_status'              => $byStatus,
            'project_status_summary' => $projectStatusSummary,
            'quarter_trend'   => $quarterTrend,
            'org_breakdown'   => $orgBreakdown,
            'failed_by_org'   => $failedByOrg,
            'recurring_behind'=> $recurringBehindMapped,
            'critical'        => array_map(fn($r) => array_merge((array)$r, [
                'revenue_target' => (float)$r->revenue_target,
                'actual_revenue' => (float)$r->actual_revenue,
            ]), $critical),
            'monthly_trend'   => array_map(fn($r) => [
                'month_num'    => (int)$r->month_num,
                'month_name'   => $r->month_name,
                'total_target' => (float)$r->total_target,
                'total_actual' => (float)$r->total_actual,
                'total_billed' => (float)$r->total_billed,
            ], $monthly),
        ]);
    }

    // ══════════════════════════════════════════════════════════════════
    // GET /api/v1/revenue/insights  — untuk revenue/insights.vue
    // ══════════════════════════════════════════════════════════════════
    public function insights(Request $request)
    {
        $tahun = (int)$request->query('tahun', now()->year);

        // YTD (exclude On Hold & Failed)
        $ytd = DB::selectOne(
            "SELECT COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             AND project_status IN ('Active','Completed')",
            [$tahun]
        );
        $achPct = (float)$ytd->target > 0
            ? round((float)$ytd->actual / (float)$ytd->target * 100, 1) : 0;

        // By kategori (exclude On Hold & Failed)
        $byKat = DB::select(
            "SELECT kategori,
                    COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             AND project_status IN ('Active','Completed')
             GROUP BY kategori",
            [$tahun]
        );
        $katMap = [];
        foreach ($byKat as $r) $katMap[strtolower($r->kategori)] = $r;

        $projTarget  = isset($katMap['project'])   ? (float)$katMap['project']->target   : 0;
        $projActual  = isset($katMap['project'])   ? (float)$katMap['project']->actual    : 0;
        $recurTarget = isset($katMap['recurring']) ? (float)$katMap['recurring']->target  : 0;
        $recurActual = isset($katMap['recurring']) ? (float)$katMap['recurring']->actual  : 0;

        $projectAch   = $projTarget  > 0 ? round($projActual  / $projTarget  * 100, 1) : 0;
        $recurringAch = $recurTarget > 0 ? round($recurActual / $recurTarget * 100, 1) : 0;

        // By organisasi (exclude On Hold & Failed)
        $byOwner = DB::select(
            "SELECT organisasi,
                    COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             AND project_status IN ('Active','Completed')
             GROUP BY organisasi",
            [$tahun]
        );
        $ownerMap = [];
        foreach ($byOwner as $r) $ownerMap[strtolower((string)$r->organisasi)] = $r;

        $amaTarget = isset($ownerMap['fsp-eco'])  ? (float)$ownerMap['fsp-eco']->target  : 0;
        $amaActual = isset($ownerMap['fsp-eco'])  ? (float)$ownerMap['fsp-eco']->actual  : 0;
        $eiwTarget = isset($ownerMap['fsp-core']) ? (float)$ownerMap['fsp-core']->target : 0;
        $eiwActual = isset($ownerMap['fsp-core']) ? (float)$ownerMap['fsp-core']->actual : 0;
        $amaAch    = $amaTarget > 0 ? round($amaActual / $amaTarget * 100, 1) : 0;
        $eiwAch    = $eiwTarget > 0 ? round($eiwActual / $eiwTarget * 100, 1) : 0;

        // Critical count
        $critCount = (int)DB::selectOne(
            "SELECT COUNT(*) as c FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL AND (status='Critical' OR risk_level='HIGH')",
            [$tahun]
        )->c;

        // Zero realisasi
        $zeroProjects = DB::select(
            "SELECT project_id, client, product, organisasi, revenue_target, type, risk_level
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL AND actual_revenue=0
               AND project_status NOT IN ('Failed', 'Completed')
             ORDER BY revenue_target DESC",
            [$tahun]
        );

        // Invoice outstanding
        $outstanding = DB::selectOne(
            "SELECT COUNT(*) as cnt, COALESCE(SUM(invoice_amount - paid_amount),0) as amt
             FROM invoices WHERE tahun=? AND status != 'Lunas'",
            [$tahun]
        );

        // ── INSIGHT BARU ─────────────────────────────────────────────

        // Monthly trend (target vs actual per bulan)
        $monthly = DB::select(
            "SELECT rm.month_num, MAX(rm.month_name) as month_name,
                    COALESCE(SUM(rm.target),0) as target,
                    COALESCE(SUM(rm.actual),0) as actual
             FROM revenue_monthly rm
             JOIN revenue_projects rp ON rm.project_id=rp.project_id
             WHERE rp.tahun=? AND rp.is_active=1
             GROUP BY rm.month_num ORDER BY rm.month_num",
            [$tahun]
        );

        // Berapa bulan sudah lewat & berapa yang miss target
        $curMonth  = now()->month;
        $pastMonths = array_filter($monthly, fn($m) => (int)$m->month_num <= $curMonth);
        $missMonths = array_filter($pastMonths, fn($m) => (float)$m->actual < (float)$m->target * 0.8);
        $achMonths  = array_filter($pastMonths, fn($m) => (float)$m->actual >= (float)$m->target);

        // By status breakdown
        $statusRows = DB::select(
            "SELECT status, COUNT(*) as cnt,
                    COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             GROUP BY status ORDER BY cnt DESC",
            [$tahun]
        );

        // By risk level
        $riskRows = DB::select(
            "SELECT risk_level, COUNT(*) as cnt,
                    COALESCE(SUM(revenue_target),0) as target
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             GROUP BY risk_level ORDER BY cnt DESC",
            [$tahun]
        );

        // By type (kontribusi realisasi)
        $typeRows = DB::select(
            "SELECT COALESCE(NULLIF(type,''),'—') as type,
                    COUNT(*) as cnt,
                    COALESCE(SUM(revenue_target),0)  as target,
                    COALESCE(SUM(actual_revenue),0)   as actual
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             GROUP BY type ORDER BY actual DESC",
            [$tahun]
        );

        // Top 5 kontributor realisasi
        $topContributors = DB::select(
            "SELECT project_id, client, product, organisasi, actual_revenue, revenue_target, status, risk_level
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL AND actual_revenue>0
             ORDER BY actual_revenue DESC LIMIT 5",
            [$tahun]
        );

        // Proyek Critical/At Risk dengan nilai terbesar (perlu perhatian)
        $atRiskProjects = DB::select(
            "SELECT project_id, client, product, organisasi, revenue_target, actual_revenue,
                    status, risk_level, action_required
             FROM revenue_projects
             WHERE tahun=? AND is_active=1 AND deleted_at IS NULL AND status IN ('Critical','At Risk')
             ORDER BY revenue_target DESC LIMIT 8",
            [$tahun]
        );

        // Gap bulan berjalan: proyeksi vs target sisa tahun
        $remainTarget = 0;
        $remainMonths = array_filter($monthly, fn($m) => (int)$m->month_num > $curMonth);
        foreach ($remainMonths as $m) $remainTarget += (float)$m->target;

        $ytdActual   = (float)$ytd->actual;
        $ytdTarget   = (float)$ytd->target;
        $curTarget   = 0;
        foreach ($pastMonths as $m) $curTarget += (float)$m->target;
        $gap         = $curTarget - $ytdActual;     // selisih dari target berjalan
        $gapPct      = $curTarget > 0 ? round($gap / $curTarget * 100, 1) : 0;
        $runRate     = $curMonth > 0 ? round($ytdActual / $curMonth) : 0;
        $projectedEoy = $runRate * 12;
        $projectedAch = $ytdTarget > 0 ? round($projectedEoy / $ytdTarget * 100, 1) : 0;

        return response()->json([
            'tahun'               => $tahun,
            'cur_year'            => now()->year,
            'cur_month'           => $curMonth,
            'years'               => $this->years(),
            // KPI utama
            'ach_pct'             => $achPct,
            'critical_count'      => $critCount,
            'zero_count'          => count($zeroProjects),
            'outstanding_amount'  => (float)$outstanding->amt,
            'outstanding_count'   => (int)$outstanding->cnt,
            // By kategori
            'project_target'      => $projTarget,
            'project_actual'      => $projActual,
            'project_ach'         => $projectAch,
            'recurring_target'    => $recurTarget,
            'recurring_actual'    => $recurActual,
            'recurring_ach'       => $recurringAch,
            // By organisasi
            'fsp_eco_target'      => $amaTarget,
            'fsp_eco_actual'      => $amaActual,
            'fsp_eco_ach'         => $amaAch,
            'fsp_core_target'     => $eiwTarget,
            'fsp_core_actual'     => $eiwActual,
            'fsp_core_ach'        => $eiwAch,
            // Trend & gap
            'monthly'             => array_map(fn($r) => [
                'month_num'  => (int)$r->month_num,
                'month_name' => $r->month_name,
                'target'     => (float)$r->target,
                'actual'     => (float)$r->actual,
                'is_past'    => (int)$r->month_num <= $curMonth,
            ], $monthly),
            'gap_ytd'             => round($gap),
            'gap_pct'             => $gapPct,
            'run_rate'            => $runRate,
            'projected_eoy'       => $projectedEoy,
            'projected_ach'       => $projectedAch,
            'remain_target'       => round($remainTarget),
            'miss_months_count'   => count($missMonths),
            'ach_months_count'    => count($achMonths),
            'past_months_count'   => count($pastMonths),
            // Breakdown
            'by_status'           => array_map(fn($r) => [
                'status' => $r->status,
                'cnt'    => (int)$r->cnt,
                'target' => (float)$r->target,
                'actual' => (float)$r->actual,
            ], $statusRows),
            'by_risk'             => array_map(fn($r) => [
                'risk_level' => $r->risk_level,
                'cnt'        => (int)$r->cnt,
                'target'     => (float)$r->target,
            ], $riskRows),
            'by_type'             => array_map(fn($r) => [
                'type'   => $r->type,
                'cnt'    => (int)$r->cnt,
                'target' => (float)$r->target,
                'actual' => (float)$r->actual,
            ], $typeRows),
            // Lists
            'zero_projects'       => array_map(fn($r) => array_merge((array)$r, [
                'revenue_target' => (float)$r->revenue_target,
            ]), $zeroProjects),
            'top_contributors'    => array_map(fn($r) => array_merge((array)$r, [
                'actual_revenue'  => (float)$r->actual_revenue,
                'revenue_target'  => (float)$r->revenue_target,
            ]), $topContributors),
            'at_risk_projects'    => array_map(fn($r) => array_merge((array)$r, [
                'revenue_target' => (float)$r->revenue_target,
                'actual_revenue' => (float)$r->actual_revenue,
            ]), $atRiskProjects),
        ]);
    }

    // ══════════════════════════════════════════════════════════════════
    // GET /api/v1/revenue/projects  — untuk revenue/tracker.vue
    // ══════════════════════════════════════════════════════════════════
    public function projects(Request $request)
    {
        $tahun    = (int)$request->query('tahun', now()->year);
        $owner    = $request->query('organisasi', '');
        $kategori = $request->query('kategori', '');
        $status   = $request->query('status', '');
        $psFilter = $request->query('project_status', '');
        $search   = $request->query('search', '');
        $page     = max(1, (int)$request->query('page', 1));
        $perPage  = max(1, min(100, (int)$request->query('per_page', 10)));

        $where  = ['tahun = ?', 'is_active = 1', 'deleted_at IS NULL'];
        $params = [$tahun];

        if ($owner)    { $where[] = 'organisasi = ?';    $params[] = $owner; }
        if ($kategori) { $where[] = 'kategori = ?'; $params[] = $kategori; }
        if ($status)   { $where[] = 'status = ?';   $params[] = $status; }
        if ($psFilter) { $where[] = 'project_status = ?'; $params[] = $psFilter; }
        if ($search) {
            $s = '%' . strtolower($search) . '%';
            $where[]  = "(LOWER(client) LIKE ? OR LOWER(product) LIKE ?)";
            $params[] = $s; $params[] = $s;
        }

        $whereClause = implode(' AND ', $where);

        // Count total untuk pagination
        $total      = DB::selectOne("SELECT COUNT(*) as n FROM revenue_projects WHERE $whereClause", $params)->n;
        $totalPages = (int)ceil($total / $perPage);
        $offset     = ($page - 1) * $perPage;

        $rows = DB::select(
            "SELECT project_id, lob, organisasi, product, client, kategori, type,
                    target_invoice_date,
                    revenue_target, actual_revenue, achievement_pct, status, risk_level, notes,
                    project_status
             FROM revenue_projects WHERE $whereClause ORDER BY project_id
             LIMIT ? OFFSET ?",
            array_merge($params, [$perPage, $offset])
        );

        // Totals (semua, tanpa filter search/organisasi/kategori; exclude On Hold & Failed)
        $totals = DB::selectOne(
            "SELECT COALESCE(SUM(revenue_target),0) as target,
                    COALESCE(SUM(actual_revenue),0)  as actual
             FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
             AND project_status IN ('Active','Completed')",
            [$tahun]
        );

        // Project status counts
        $psCountRows = DB::select(
            "SELECT project_status, COUNT(*) as cnt FROM revenue_projects
             WHERE tahun=? AND is_active=1 AND deleted_at IS NULL GROUP BY project_status",
            [$tahun]
        );
        $projectStatusCounts = [];
        foreach ($psCountRows as $r) $projectStatusCounts[$r->project_status] = (int)$r->cnt;
        $achPct = (float)$totals->target > 0
            ? round((float)$totals->actual / (float)$totals->target * 100, 1) : 0;

        $owners = array_column(DB::select(
            "SELECT DISTINCT organisasi FROM revenue_projects WHERE tahun=? AND is_active=1 AND deleted_at IS NULL AND organisasi IS NOT NULL ORDER BY organisasi",
            [$tahun]
        ), 'organisasi');

        // Invoice summary global (untuk panel ringkasan)
        $invSummary = DB::selectOne(
            "SELECT COUNT(*) as total_inv,
                    COUNT(DISTINCT project_id) as projects_with_inv,
                    COALESCE(SUM(invoice_amount),0) as total_amount,
                    COALESCE(SUM(paid_amount),0)    as total_paid,
                    SUM(CASE WHEN status='Lunas' THEN 1 ELSE 0 END) as lunas_count,
                    SUM(CASE WHEN status!='Lunas' THEN 1 ELSE 0 END) as belum_count,
                    COALESCE(SUM(CASE WHEN status!='Lunas' THEN invoice_amount-paid_amount ELSE 0 END),0) as outstanding
             FROM invoices WHERE tahun=?",
            [$tahun]
        );

        // Invoice per project_id (untuk kolom invoice di tabel proyek)
        $invPerProject = DB::select(
            "SELECT project_id,
                    COUNT(*) as total_inv,
                    COALESCE(SUM(invoice_amount),0) as total_amount,
                    COALESCE(SUM(paid_amount),0)    as total_paid,
                    SUM(CASE WHEN status='Lunas' THEN 1 ELSE 0 END) as lunas_count,
                    SUM(CASE WHEN status!='Lunas' THEN 1 ELSE 0 END) as belum_count
             FROM invoices WHERE tahun=? GROUP BY project_id",
            [$tahun]
        );
        $invMap = [];
        foreach ($invPerProject as $inv) {
            $invMap[$inv->project_id] = [
                'total_inv'    => (int)$inv->total_inv,
                'total_amount' => (float)$inv->total_amount,
                'total_paid'   => (float)$inv->total_paid,
                'lunas_count'  => (int)$inv->lunas_count,
                'belum_count'  => (int)$inv->belum_count,
                'outstanding'  => (float)$inv->total_amount - (float)$inv->total_paid,
            ];
        }

        // Invoice period pertama per project (untuk cek on-time vs terlambat)
        $invFirstPeriod = DB::select(
            "SELECT project_id, MIN(invoice_date) as first_invoice_date, period as first_period
             FROM invoices WHERE tahun=?
             GROUP BY project_id, period
             ORDER BY project_id, MIN(invoice_date) ASC",
            [$tahun]
        );
        // Ambil hanya yang pertama per project_id
        $invPeriodMap = [];
        foreach ($invFirstPeriod as $r) {
            if (!isset($invPeriodMap[$r->project_id])) {
                $invPeriodMap[$r->project_id] = [
                    'first_invoice_date' => $r->first_invoice_date,
                    'first_period'       => $r->first_period,
                ];
            }
        }

        // Map bulan Inggris → nomor bulan
        $monthNumMap = [
            'January'=>1,'February'=>2,'March'=>3,'April'=>4,
            'May'=>5,'June'=>6,'July'=>7,'August'=>8,
            'September'=>9,'October'=>10,'November'=>11,'December'=>12,
        ];

        // YTD target per project untuk type Bulanan/Termin (s.d. bulan berjalan)
        $curMonth = (int)date('n');
        $ytdRows  = DB::select(
            "SELECT project_id, COALESCE(SUM(target), 0) as ytd_target
             FROM revenue_monthly
             WHERE month_num <= ?
             GROUP BY project_id",
            [$curMonth]
        );
        $ytdMap = [];
        foreach ($ytdRows as $yr) {
            $ytdMap[$yr->project_id] = (float)$yr->ytd_target;
        }

        // Recent unpaid invoices (untuk quick list)
        $unpaidInvoices = DB::select(
            "SELECT id, project_id, client, invoice_no, invoice_amount, paid_amount, invoice_date, period
             FROM invoices WHERE tahun=? AND status!='Lunas'
             ORDER BY invoice_date ASC LIMIT 10",
            [$tahun]
        );

        return response()->json([
            'tahun'          => $tahun,
            'cur_year'       => now()->year,
            'years'          => $this->years(),
            'owners'         => $owners,
            'total'          => (int)$total,
            'total_pages'    => $totalPages,
            'page'           => $page,
            'per_page'       => $perPage,
            'total_projects' => (int)$total,
            'total_target'   => (float)$totals->target,
            'total_actual'   => (float)$totals->actual,
            'ach_pct'        => $achPct,
            // Invoice summary
            'inv_summary'    => [
                'total_inv'           => (int)$invSummary->total_inv,
                'projects_with_inv'   => (int)$invSummary->projects_with_inv,
                'total_amount'        => (float)$invSummary->total_amount,
                'total_paid'          => (float)$invSummary->total_paid,
                'lunas_count'         => (int)$invSummary->lunas_count,
                'belum_count'         => (int)$invSummary->belum_count,
                'outstanding'         => (float)$invSummary->outstanding,
                'collection_rate'     => (float)$invSummary->total_amount > 0
                    ? round((float)$invSummary->total_paid / (float)$invSummary->total_amount * 100, 1) : 0,
            ],
            'project_status_counts' => $projectStatusCounts,
            'unpaid_invoices' => array_map(fn($r) => array_merge((array)$r, [
                'invoice_amount' => (float)$r->invoice_amount,
                'paid_amount'    => (float)$r->paid_amount,
                'outstanding'    => (float)$r->invoice_amount - (float)$r->paid_amount,
            ]), $unpaidInvoices),
            'projects'       => array_map(function($r) use ($invMap, $invPeriodMap, $monthNumMap, $tahun, $ytdMap, $curMonth) {
                // Hitung invoice period status
                $targetDate    = $r->target_invoice_date;
                $firstInv      = $invPeriodMap[$r->project_id] ?? null;
                $invoicePeriodStatus = null;  // null = belum set target
                $targetPeriodLabel   = null;
                $actualPeriodLabel   = null;

                if ($targetDate) {
                    // Tampilkan target sebagai "Bulan Tahun" (misal "Juli 2026")
                    $targetTs    = strtotime($targetDate);
                    $targetMonth = (int)date('n', $targetTs);
                    $targetYear  = (int)date('Y', $targetTs);
                    $idNames     = ['','Januari','Februari','Maret','April','Mei','Juni',
                                    'Juli','Agustus','September','Oktober','November','Desember'];
                    $targetPeriodLabel = $idNames[$targetMonth] . ' ' . $targetYear;

                    if ($firstInv) {
                        // Ada invoice — bandingkan bulan terbit vs target
                        $actualMonth = (int)date('n', strtotime($firstInv['first_invoice_date']));
                        $actualYear  = (int)date('Y', strtotime($firstInv['first_invoice_date']));
                        $actualPeriodLabel = $idNames[$actualMonth] . ' ' . $actualYear;

                        $targetTs2 = mktime(0,0,0,$targetMonth,1,$targetYear);
                        $actualTs2 = mktime(0,0,0,$actualMonth,1,$actualYear);
                        $invoicePeriodStatus = $actualTs2 <= $targetTs2 ? 'Tepat Waktu' : 'Terlambat';
                    } else {
                        // Belum ada invoice — cek apakah target sudah lewat
                        $nowTs = mktime(0,0,0,(int)date('n'),1,(int)date('Y'));
                        $tgtTs = mktime(0,0,0,$targetMonth,1,$targetYear);
                        $invoicePeriodStatus = $nowTs > $tgtTs ? 'Terlambat' : 'Belum Jatuh Tempo';
                    }
                }

                // Hitung YTD achievement untuk Bulanan/Termin
                $isBulananTermin = in_array($r->type, ['Bulanan', 'Termin']);
                $ytdTarget = $isBulananTermin ? ($ytdMap[$r->project_id] ?? 0) : (float)$r->revenue_target;
                $ytdAchPct = $ytdTarget > 0
                    ? round((float)$r->actual_revenue / $ytdTarget * 100, 1)
                    : 0;

                return [
                    'project_id'           => $r->project_id,
                    'lob'                  => $r->lob,
                    'organisasi'                => $r->organisasi,
                    'product'              => $r->product,
                    'client'               => $r->client,
                    'kategori'             => $r->kategori,
                    'type'                 => $r->type,
                    'target_invoice_date'  => $r->target_invoice_date,
                    'target_period_label'  => $targetPeriodLabel,
                    'actual_period_label'  => $actualPeriodLabel,
                    'invoice_period_status'=> $invoicePeriodStatus,
                    'revenue_target'       => (float)$r->revenue_target,
                    'actual_revenue'       => (float)$r->actual_revenue,
                    'invoice_actual'       => (float)$r->actual_revenue,
                    'achievement_pct'      => (float)$r->achievement_pct,
                    // YTD: untuk Bulanan/Termin dibandingkan dengan target s.d. bulan berjalan
                    'ytd_target'           => $ytdTarget,
                    'ytd_ach_pct'          => $ytdAchPct,
                    'is_ytd'               => $isBulananTermin,
                    'cur_month'            => $curMonth,
                    'status'               => $r->status,
                    'risk_level'           => $r->risk_level,
                    'notes'                => $r->notes,
                    'project_status'       => $r->project_status ?? 'Active',
                    'inv'                  => $invMap[$r->project_id] ?? null,
                ];
            }, $rows),
        ]);
    }

    // ══════════════════════════════════════════════════════════════════
    // POST /api/v1/revenue/projects  — Tambah Proyek baru
    // ══════════════════════════════════════════════════════════════════
    public function storeProject(Request $request)
    {
        $d = $request->only(['lob','organisasi','product','client','kategori','type',
                             'target_invoice_date','tahun','revenue_target','notes']);
        if (empty($d['target_invoice_date'])) unset($d['target_invoice_date']);
        $d['actual_revenue']  = 0;
        $d['status']          = 'On Track';
        $d['risk_level']      = 'LOW';
        $d['is_active']       = 1;
        $d['created_at']      = now();
        $d['updated_at']      = now();

        $last = DB::selectOne("SELECT project_id FROM revenue_projects ORDER BY id DESC LIMIT 1");
        $num  = 1;
        if ($last) {
            preg_match('/(\d+)$/', $last->project_id, $m);
            $num = isset($m[1]) ? ((int)$m[1] + 1) : 1;
        }
        $d['project_id'] = 'REV-' . str_pad($num, 4, '0', STR_PAD_LEFT);

        DB::table('revenue_projects')->insert($d);
        return response()->json(['message' => 'Proyek berhasil ditambahkan.', 'project_id' => $d['project_id']], 201);
    }

    // ══════════════════════════════════════════════════════════════════
    // PATCH /api/v1/revenue/projects/{id}/status  — Update project_status
    // ══════════════════════════════════════════════════════════════════
    public function patchProjectStatus(Request $request, string $id)
    {
        $ps = $request->input('project_status');
        $allowed = ['Active', 'On Hold', 'Completed', 'Failed'];
        if (!in_array($ps, $allowed)) {
            return response()->json(['message' => 'Status tidak valid.'], 422);
        }
        DB::table('revenue_projects')
            ->where('project_id', $id)
            ->update(['project_status' => $ps, 'updated_at' => now()]);
        return response()->json(['ok' => true]);
    }

    // ══════════════════════════════════════════════════════════════════
    // PUT /api/v1/revenue/projects/{id}  — Update proyek
    // ══════════════════════════════════════════════════════════════════
    public function updateProject(Request $request, string $id)
    {
        $exists = DB::selectOne("SELECT project_id FROM revenue_projects WHERE project_id=?", [$id]);
        if (!$exists) return response()->json(['message' => 'Proyek tidak ditemukan.'], 404);

        $allowed = ['lob','organisasi','product','client','kategori','type',
                    'target_invoice_date','tahun',
                    'revenue_target','actual_revenue','notes','project_status'];

        $d = $request->only($allowed);
        if (isset($d['target_invoice_date']) && empty($d['target_invoice_date'])) {
            $d['target_invoice_date'] = null;
        }
        $d['updated_at'] = now();

        DB::table('revenue_projects')->where('project_id', $id)->update($d);

        // Auto-hitung status & risk_level berdasarkan achievement %
        $this->syncProjectStatus($id);

        return response()->json(['message' => 'Proyek berhasil diupdate.', 'project_id' => $id]);
    }

    // ══════════════════════════════════════════════════════════════════
    // DELETE /api/v1/revenue/projects/{id}  — Hapus proyek beserta data terkait
    // ══════════════════════════════════════════════════════════════════
    public function deleteProject(Request $request, string $id)
    {
        // Hanya Admin (role_id = 1) yang boleh menghapus proyek
        $authUser = $request->attributes->get('auth_user');
        if (!$authUser || (int)$authUser['role_id'] !== 1) {
            return response()->json([
                'message' => 'Akses ditolak. Hanya Admin yang dapat menghapus proyek.'
            ], 403);
        }

        $exists = DB::selectOne(
            "SELECT project_id FROM revenue_projects WHERE project_id=? AND deleted_at IS NULL", [$id]
        );
        if (!$exists) return response()->json(['message' => 'Proyek tidak ditemukan.'], 404);

        // Soft delete — set deleted_at, data tetap tersimpan di DB
        DB::table('revenue_projects')
            ->where('project_id', $id)
            ->update(['deleted_at' => now()]);

        return response()->json(['message' => "Proyek {$id} berhasil dihapus dan dapat dipulihkan oleh Admin."]);
    }

    // ══════════════════════════════════════════════════════════════════
    // GET /api/v1/revenue/trashed  — Daftar proyek yang sudah dihapus (Admin)
    // ══════════════════════════════════════════════════════════════════
    public function trashedProjects(Request $request)
    {
        $authUser = $request->attributes->get('auth_user');
        if (!$authUser || (int)$authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $rows = DB::select(
            "SELECT project_id, client, product, organisasi, kategori, type,
                    revenue_target, actual_revenue, achievement_pct, status, deleted_at
             FROM revenue_projects
             WHERE deleted_at IS NOT NULL
             ORDER BY deleted_at DESC"
        );

        $result = array_map(fn($r) => [
            'project_id'     => $r->project_id,
            'client'         => $r->client,
            'product'        => $r->product,
            'organisasi'          => $r->organisasi,
            'kategori'       => $r->kategori,
            'type'           => $r->type,
            'revenue_target' => (float)$r->revenue_target,
            'actual_revenue' => (float)$r->actual_revenue,
            'achievement_pct'=> (float)$r->achievement_pct,
            'status'         => $r->status,
            'deleted_at'     => $r->deleted_at,
        ], $rows);

        return response()->json(['trashed' => $result, 'count' => count($result)]);
    }

    // ══════════════════════════════════════════════════════════════════
    // POST /api/v1/revenue/projects/{id}/restore  — Pulihkan proyek (Admin)
    // ══════════════════════════════════════════════════════════════════
    public function restoreProject(Request $request, string $id)
    {
        $authUser = $request->attributes->get('auth_user');
        if (!$authUser || (int)$authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Akses ditolak. Hanya Admin yang dapat memulihkan proyek.'], 403);
        }

        $exists = DB::selectOne(
            "SELECT project_id FROM revenue_projects WHERE project_id=? AND deleted_at IS NOT NULL", [$id]
        );
        if (!$exists) return response()->json(['message' => 'Proyek tidak ditemukan di recycle bin.'], 404);

        DB::table('revenue_projects')
            ->where('project_id', $id)
            ->update(['deleted_at' => null]);

        // Sinkronisasi ulang status & risk setelah restore
        $this->syncProjectStatus($id);

        return response()->json(['message' => "Proyek {$id} berhasil dipulihkan."]);
    }

    // ══════════════════════════════════════════════════════════════════
    // GET /api/v1/revenue/won-leads  — Leads Won belum/sudah di-import
    // ══════════════════════════════════════════════════════════════════
    public function wonLeads(Request $request)
    {
        // Semua lead Won dari pipeline
        $leads = DB::select(
            "SELECT l.id, l.lead_id, l.nama_company, l.product, l.deal_value,
                    l.propose_value, l.sales_owner, l.exp_close_date,
                    l.segmen, l.source, l.remarks,
                    rp.project_id  AS imported_project_id,
                    rp.status      AS imported_status
             FROM leads l
             LEFT JOIN revenue_projects rp ON rp.lead_id = l.lead_id
             WHERE l.stage = 'Won' AND COALESCE(l.won_import_excluded, FALSE) = FALSE
             ORDER BY l.updated_at DESC"
        );

        $result = array_map(fn($r) => [
            'id'                  => $r->id,
            'lead_id'             => $r->lead_id,
            'nama_company'        => $r->nama_company,
            'product'             => $r->product,
            'deal_value'          => (float)($r->deal_value ?? 0),
            'propose_value'       => (float)($r->propose_value ?? 0),
            'sales_owner'         => $r->sales_owner,
            'exp_close_date'      => $r->exp_close_date,
            'segmen'              => $r->segmen,
            'source'              => $r->source,
            'remarks'             => $r->remarks,
            'is_imported'         => !empty($r->imported_project_id),
            'imported_project_id' => $r->imported_project_id,
            'imported_status'     => $r->imported_status,
            // Mapping default ke revenue_projects
            'suggested_tahun'     => $r->exp_close_date
                ? (int)date('Y', strtotime($r->exp_close_date))
                : now()->year,
            'suggested_kategori'  => 'Project',
            'suggested_type'      => 'One Time',
        ], $leads);

        return response()->json([
            'total'       => count($result),
            'pending'     => count(array_filter($result, fn($r) => !$r['is_imported'])),
            'imported'    => count(array_filter($result, fn($r) =>  $r['is_imported'])),
            'leads'       => $result,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════
    // DELETE /api/v1/revenue/won-leads/{lead_id}  — Exclude dari daftar
    // ══════════════════════════════════════════════════════════════════
    public function excludeWonLead(string $leadId)
    {
        DB::table('leads')
            ->where('lead_id', $leadId)
            ->where('stage', 'Won')
            ->update(['won_import_excluded' => true]);

        return response()->json(['ok' => true]);
    }

    // ══════════════════════════════════════════════════════════════════
    // POST /api/v1/revenue/import-won  — Import Won leads ke tracker
    // ══════════════════════════════════════════════════════════════════
    public function importWon(Request $request)
    {
        // Payload: array of { lead_id, tahun, kategori, type, organisasi, revenue_target, notes }
        $items = $request->input('items', []);
        if (empty($items)) {
            return response()->json(['message' => 'Tidak ada data yang dikirim.'], 422);
        }

        // Nomor project terakhir
        $last = DB::selectOne("SELECT project_id FROM revenue_projects ORDER BY id DESC LIMIT 1");
        $num  = 1;
        if ($last) {
            preg_match('/(\d+)$/', $last->project_id, $m);
            $num = isset($m[1]) ? ((int)$m[1] + 1) : 1;
        }

        $imported = [];
        $skipped  = [];

        foreach ($items as $item) {
            $leadId = $item['lead_id'] ?? null;
            if (!$leadId) continue;

            // Skip jika sudah diimport
            $existing = DB::selectOne(
                "SELECT project_id FROM revenue_projects WHERE lead_id = ?", [$leadId]
            );
            if ($existing) {
                $skipped[] = ['lead_id' => $leadId, 'reason' => 'Sudah diimport sebagai ' . $existing->project_id];
                continue;
            }

            // Ambil data lead
            $lead = DB::selectOne(
                "SELECT * FROM leads WHERE lead_id = ? AND stage = 'Won'", [$leadId]
            );
            if (!$lead) {
                $skipped[] = ['lead_id' => $leadId, 'reason' => 'Lead tidak ditemukan atau bukan Won'];
                continue;
            }

            $projectId = 'REV-' . str_pad($num, 4, '0', STR_PAD_LEFT);
            $tahun     = (int)($item['tahun']    ?? now()->year);
            $target    = (float)($item['revenue_target'] ?? $lead->deal_value ?? 0);

            $insertData = [
                'project_id'     => $projectId,
                'lead_id'        => $leadId,
                'lob'            => $item['lob']          ?? ($lead->segmen ?? 'DCSS'),
                'organisasi'     => $item['organisasi']    ?? 'FSP-ECO',
                'product'        => $item['product']      ?? $lead->product,
                'client'         => $item['client']       ?? $lead->nama_company,
                'kategori'       => $item['kategori']     ?? 'Project',
                'type'           => $item['type']         ?? 'One Time',
                'tahun'          => $tahun,
                'revenue_target' => $target,
                'actual_revenue' => 0,
                'status'         => 'On Track',
                'risk_level'     => 'LOW',
                'notes'          => $item['notes'] ?? $lead->remarks ?? '',
                'is_active'      => 1,
                'created_at'     => now(),
                'updated_at'     => now(),
            ];
            if (!empty($item['target_invoice_date'])) {
                $insertData['target_invoice_date'] = $item['target_invoice_date'];
            }
            DB::table('revenue_projects')->insert($insertData);

            $imported[] = ['lead_id' => $leadId, 'project_id' => $projectId, 'client' => $lead->nama_company];
            $num++;
        }

        return response()->json([
            'message'  => count($imported) . ' proyek berhasil diimport.',
            'imported' => $imported,
            'skipped'  => $skipped,
        ], 201);
    }

    // ══════════════════════════════════════════════════════════════════
    // GET /api/v1/revenue/monthly   — untuk revenue/monthly.vue
    // ══════════════════════════════════════════════════════════════════
    public function monthly(Request $request)
    {
        $tahun     = (int)$request->query('tahun', now()->year);
        $curMonth  = (int)now()->month;
        $curYear   = now()->year;

        $nameId = ['','Januari','Februari','Maret','April','Mei','Juni',
                   'Juli','Agustus','September','Oktober','November','Desember'];

        // ── 1. Summary revenue per bulan (semua 12 bulan) ──────────────
        $revRows = DB::select(
            "SELECT rm.month_num, rm.month_name,
                    COALESCE(SUM(rm.target), 0) AS target,
                    COALESCE(SUM(rm.actual), 0) AS actual,
                    COUNT(DISTINCT rm.project_id)  AS project_count
             FROM revenue_monthly rm
             JOIN revenue_projects rp ON rm.project_id = rp.project_id
             WHERE rp.tahun = ? AND rp.is_active = 1
             GROUP BY rm.month_num, rm.month_name
             ORDER BY rm.month_num",
            [$tahun]
        );

        // Jadikan map month_num → row
        $revMap = [];
        foreach ($revRows as $r) {
            $revMap[(int)$r->month_num] = $r;
        }

        // ── 2. Collection per bulan dari tabel invoices ─────────────────
        // period di invoices adalah nama bulan bahasa Inggris
        $monthNumEn = [
            1=>'January',2=>'February',3=>'March',4=>'April',
            5=>'May',6=>'June',7=>'July',8=>'August',
            9=>'September',10=>'October',11=>'November',12=>'December'
        ];
        $monthEnNum = array_flip($monthNumEn);

        $invRows = DB::select(
            "SELECT EXTRACT(MONTH FROM invoice_date)::int AS month_num,
                    COALESCE(SUM(invoice_amount), 0)  AS total_invoice,
                    COALESCE(SUM(paid_amount), 0)      AS total_paid,
                    COALESCE(SUM(CASE WHEN status != 'Lunas'
                                      THEN invoice_amount - paid_amount
                                      ELSE 0 END), 0)  AS outstanding,
                    COUNT(*) AS inv_count
             FROM invoices
             WHERE tahun = ? AND invoice_date IS NOT NULL
             GROUP BY EXTRACT(MONTH FROM invoice_date)::int",
            [$tahun]
        );

        $invMap = [];
        foreach ($invRows as $r) {
            $mNum = (int)$r->month_num;
            if ($mNum >= 1 && $mNum <= 12) {
                $invMap[$mNum] = $r;
            }
        }

        // ── 3. Bangun summary 12 bulan ─────────────────────────────────
        $summary = [];
        for ($m = 1; $m <= 12; $m++) {
            $rev = $revMap[$m] ?? null;
            $inv = $invMap[$m] ?? null;

            $target      = $rev ? (float)$rev->target : 0;
            $actual      = $rev ? (float)$rev->actual  : 0;
            $collection  = $inv ? (float)$inv->total_paid    : 0;
            $outstanding = $inv ? (float)$inv->outstanding   : 0;
            $totalInv    = $inv ? (float)$inv->total_invoice : 0;
            $achPct      = $target > 0 ? round($actual / $target * 100, 1) : 0;

            // Status: bulan yang sudah lewat saja diberi status
            $isPast   = ($tahun < $curYear) || ($tahun == $curYear && $m < $curMonth);
            $isCurrent = ($tahun == $curYear && $m == $curMonth);

            if ($isPast || $isCurrent) {
                if ($achPct >= 80)      $status = 'On Track';
                elseif ($achPct >= 50)  $status = 'At Risk';
                else                    $status = 'Critical';
            } else {
                $status = 'Upcoming';
            }

            // Quarter
            $quarter = 'Q' . ceil($m / 3);

            $summary[] = [
                'month_num'    => $m,
                'month_name'   => $nameId[$m],
                'month_name_en'=> $monthNumEn[$m],
                'quarter'      => $quarter,
                'target'       => $target,
                'actual'       => $actual,
                'collection'   => $collection,
                'outstanding'  => $outstanding,
                'total_invoice'=> $totalInv,
                'ach_pct'      => $achPct,
                'status'       => $status,
                'is_past'      => $isPast,
                'is_current'   => $isCurrent,
                'project_count'=> $rev ? (int)$rev->project_count : 0,
            ];
        }

        // ── 4. Grand total ─────────────────────────────────────────────
        $grandTarget = array_sum(array_column($summary, 'target'));
        $grandActual = array_sum(array_column($summary, 'actual'));
        $grandColl   = array_sum(array_column($summary, 'collection'));
        $grandOut    = array_sum(array_column($summary, 'outstanding'));

        // ── 5. Detail rows untuk bulan tertentu (query param month) ────
        $selectedMonth = (int)$request->query('month', 0);
        $detailRows    = [];
        if ($selectedMonth >= 1 && $selectedMonth <= 12) {
            $dr = DB::select(
                "SELECT rm.project_id, rm.month_num, rm.month_name,
                        rm.target, rm.actual,
                        rp.client, rp.product, rp.organisasi, rp.kategori, rp.lob, rp.type,
                        rp.status AS proj_status, rp.risk_level AS proj_risk
                 FROM revenue_monthly rm
                 JOIN revenue_projects rp ON rm.project_id = rp.project_id
                 WHERE rp.tahun = ? AND rm.month_num = ?
                   AND rp.is_active = 1 AND rp.deleted_at IS NULL
                 ORDER BY rm.actual DESC, rm.target DESC",
                [$tahun, $selectedMonth]
            );
            $detailRows = array_map(function($r) {
                $target = (float)$r->target;
                $actual = (float)$r->actual;
                // Hitung ach% dan status berdasarkan kinerja bulan ini
                $achPct = $target > 0 ? round($actual / $target * 100, 1) : 0;
                if ($target <= 0) {
                    $status = 'On Track'; $risk = 'LOW';
                } elseif ($achPct >= 80) {
                    $status = 'On Track'; $risk = 'LOW';
                } elseif ($achPct >= 60) {
                    $status = 'At Risk';  $risk = 'MEDIUM';
                } elseif ($achPct >= 30) {
                    $status = 'Critical'; $risk = 'HIGH';
                } else {
                    $status = 'Critical'; $risk = 'CRITICAL';
                }
                return [
                    'project_id'   => $r->project_id,
                    'client'       => $r->client,
                    'product'      => $r->product,
                    'organisasi'        => $r->organisasi,
                    'kategori'     => $r->kategori,
                    'lob'          => $r->lob,
                    'type'         => $r->type,
                    'month_num'    => (int)$r->month_num,
                    'month_name'   => $r->month_name,
                    'target'       => $target,
                    'actual'       => $actual,
                    'ach_pct'      => $achPct,
                    // Status & risk dihitung dari kinerja BULAN INI (bukan status proyek)
                    'status'       => $status,
                    'risk_level'   => $risk,
                    // Status proyek keseluruhan (untuk referensi)
                    'proj_status'  => $r->proj_status,
                    'proj_risk'    => $r->proj_risk,
                ];
            }, $dr);
        }

        return response()->json([
            'tahun'         => $tahun,
            'cur_year'      => $curYear,
            'cur_month'     => $curMonth,
            'years'         => $this->years(),
            'months'        => $this->monthList(),
            'summary'       => $summary,
            'grand_target'  => $grandTarget,
            'grand_actual'  => $grandActual,
            'grand_coll'    => $grandColl,
            'grand_out'     => $grandOut,
            'grand_ach'     => $grandTarget > 0 ? round($grandActual / $grandTarget * 100, 1) : 0,
            'selected_month'=> $selectedMonth,
            'detail_rows'   => $detailRows,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════
    // GET /api/v1/revenue/invoices  — untuk revenue/invoice.vue
    // ══════════════════════════════════════════════════════════════════
    public function invoices(Request $request)
    {
        $status    = $request->query('status', '');
        $search    = $request->query('search', '');
        $projectId = $request->query('project_id', '');
        $dateFrom  = $request->query('date_from', '');
        $dateTo    = $request->query('date_to', '');
        $page      = max(1, (int)$request->query('page', 1));
        $perPage   = max(1, min(100, (int)$request->query('per_page', 10)));

        $where  = ['1=1'];
        $params = [];

        if ($projectId) {
            $where[]  = 'project_id = ?';
            $params[] = $projectId;
        }

        if ($status === 'Lunas') {
            $where[] = "status = 'Lunas'";
        } elseif ($status === 'Belum') {
            $where[] = "status != 'Lunas'";
        }

        if ($dateFrom) {
            $where[]  = 'invoice_date >= ?';
            $params[] = $dateFrom;
        }

        if ($dateTo) {
            $where[]  = 'invoice_date <= ?';
            $params[] = $dateTo;
        }

        if ($search) {
            $s = '%' . strtolower($search) . '%';
            $where[]  = "(LOWER(client) LIKE ? OR LOWER(invoice_no) LIKE ?)";
            $params[] = $s; $params[] = $s;
        }

        $whereStr = implode(' AND ', $where);

        // Total count untuk pagination
        $totalCount = (int)DB::selectOne(
            "SELECT COUNT(*) as cnt FROM invoices WHERE $whereStr", $params
        )->cnt;

        $totalPages = max(1, (int)ceil($totalCount / $perPage));
        $offset     = ($page - 1) * $perPage;

        // Sort: belum bayar dulu, lalu invoice_date DESC
        $rows = DB::select(
            "SELECT * FROM invoices WHERE $whereStr
             ORDER BY CASE WHEN status != 'Lunas' THEN 0 ELSE 1 END ASC, invoice_date DESC
             LIMIT ? OFFSET ?",
            array_merge($params, [$perPage, $offset])
        );

        // Summary total keseluruhan (semua halaman)
        $totals = DB::selectOne(
            "SELECT COALESCE(SUM(invoice_amount),0) as total_invoice,
                    COALESCE(SUM(paid_amount),0) as total_paid
             FROM invoices WHERE $whereStr",
            $params
        );
        $totalInvoice = (float)$totals->total_invoice;
        $totalPaid    = (float)$totals->total_paid;

        $revProjects = DB::select(
            "SELECT project_id, client, product FROM revenue_projects WHERE is_active=1 AND deleted_at IS NULL ORDER BY project_id",
            []
        );

        // Info project yang sedang difilter (untuk header di frontend)
        $projectInfo = null;
        if ($projectId) {
            $pi = DB::selectOne(
                "SELECT project_id, client, product, organisasi, revenue_target, actual_revenue, achievement_pct, status
                 FROM revenue_projects WHERE project_id = ? AND deleted_at IS NULL",
                [$projectId]
            );
            if ($pi) {
                $projectInfo = [
                    'project_id'     => $pi->project_id,
                    'client'         => $pi->client,
                    'product'        => $pi->product,
                    'organisasi'          => $pi->organisasi,
                    'revenue_target' => (float)$pi->revenue_target,
                    'actual_revenue' => (float)$pi->actual_revenue,
                    'achievement_pct'=> (float)$pi->achievement_pct,
                    'status'         => $pi->status,
                ];
            }
        }

        // Ringkasan invoice untuk project yang difilter (atau semua) — ikuti filter yang aktif
        $summaryWhere  = $where;
        $summaryParams = $params;
        $invSummary = DB::selectOne(
            "SELECT COUNT(*) as total_inv,
                    COALESCE(SUM(invoice_amount),0) as total_amount,
                    COALESCE(SUM(paid_amount),0)    as total_paid,
                    SUM(CASE WHEN status='Lunas' THEN 1 ELSE 0 END) as lunas_count,
                    SUM(CASE WHEN status!='Lunas' THEN 1 ELSE 0 END) as belum_count,
                    COALESCE(SUM(CASE WHEN status!='Lunas' THEN invoice_amount-paid_amount ELSE 0 END),0) as outstanding
             FROM invoices WHERE " . implode(' AND ', $summaryWhere),
            $summaryParams
        );

        return response()->json([
            'years'         => $this->years(),
            'total'         => $totalCount,
            'total_pages'   => $totalPages,
            'page'          => $page,
            'per_page'      => $perPage,
            'total_invoice' => $totalInvoice,
            'total_paid'    => $totalPaid,
            'project_filter'=> $projectId ?: null,
            'project_info'  => $projectInfo,
            'inv_summary'   => [
                'total_inv'      => (int)$invSummary->total_inv,
                'total_amount'   => (float)$invSummary->total_amount,
                'total_paid'     => (float)$invSummary->total_paid,
                'lunas_count'    => (int)$invSummary->lunas_count,
                'belum_count'    => (int)$invSummary->belum_count,
                'outstanding'    => (float)$invSummary->outstanding,
                'collection_rate'=> (float)$invSummary->total_amount > 0
                    ? round((float)$invSummary->total_paid / (float)$invSummary->total_amount * 100, 1) : 0,
            ],
            'rev_projects'  => array_map(fn($r) => (array)$r, $revProjects),
            'invoices'      => array_map(fn($r) => [
                'id'             => $r->id,
                'project_id'     => $r->project_id,
                'lob'            => $r->lob,
                'organisasi'          => $r->organisasi,
                'product'        => $r->product,
                'client'         => $r->client,
                'invoice_no'     => $r->invoice_no,
                'invoice_date'   => $r->invoice_date,
                'period'         => $r->period,
                'invoice_amount' => (float)$r->invoice_amount,
                'paid_amount'    => (float)$r->paid_amount,
                'paid_date'      => $r->paid_date,
                'notes'          => $r->notes,
                'status'         => $r->status,
                'tahun'          => $r->tahun,
                'display_status' => $this->invoiceDisplayStatus($r),
            ], $rows),
        ]);
    }

    private function invoiceDisplayStatus(object $inv): string
    {
        $amt  = (float)$inv->invoice_amount;
        $paid = (float)$inv->paid_amount;
        if ($inv->status === 'Lunas' || ($amt > 0 && $paid >= $amt)) return 'Lunas';
        if ($paid > 0 && $paid < $amt) return 'Partial';
        return 'Belum';
    }

    // ══════════════════════════════════════════════════════════════════
    // POST /api/v1/revenue/invoices
    // ══════════════════════════════════════════════════════════════════
    public function storeInvoice(Request $request)
    {
        $d = $request->only([
            'project_id','lob','organisasi','product','client',
            'invoice_no','invoice_date','period','invoice_amount','tahun','notes'
        ]);
        $d['paid_amount'] = 0;
        $d['created_at']  = now();

        if (!empty($d['project_id'])) {
            $proj = DB::selectOne("SELECT * FROM revenue_projects WHERE project_id=?", [$d['project_id']]);
            if ($proj) {
                if (empty($d['lob']))     $d['lob']     = $proj->lob;
                if (empty($d['organisasi']))   $d['organisasi']   = $proj->organisasi;
                if (empty($d['product'])) $d['product'] = $proj->product;
                if (empty($d['client']))  $d['client']  = $proj->client;
            }
        }

        DB::table('invoices')->insert($d);

        // Sync realisasi ke revenue_monthly & revenue_projects
        if (!empty($d['project_id'])) {
            $this->syncRealisasi($d['project_id']);
        }

        return response()->json(['message' => 'Invoice berhasil ditambahkan.'], 201);
    }

    // ══════════════════════════════════════════════════════════════════
    // POST /api/v1/revenue/invoices/{id}/pay
    // ══════════════════════════════════════════════════════════════════
    public function payInvoice(Request $request, int $id)
    {
        $inv = DB::selectOne("SELECT * FROM invoices WHERE id=?", [$id]);
        if (!$inv) return response()->json(['message' => 'Invoice tidak ditemukan.'], 404);

        $paid    = (float)$request->input('paid_amount', 0);
        $date    = $request->input('paid_date', now()->toDateString());
        $newPaid = (float)$inv->paid_amount + $paid;

        // status adalah generated column — tidak boleh di-update manual
        DB::update("UPDATE invoices SET paid_amount=?, paid_date=? WHERE id=?",
            [$newPaid, $date, $id]);

        // Baca status hasil generated column
        $updated = DB::selectOne("SELECT status, project_id FROM invoices WHERE id=?", [$id]);

        // Sync realisasi ke revenue_monthly & revenue_projects
        if (!empty($updated->project_id)) {
            $this->syncRealisasi($updated->project_id);
        }

        return response()->json(['message' => 'Pembayaran berhasil dicatat.', 'status' => $updated->status]);
    }

    // ══════════════════════════════════════════════════════════════════
    // PUT /api/v1/revenue/invoices/{id}
    // ══════════════════════════════════════════════════════════════════
    public function updateInvoice(Request $request, int $id)
    {
        $inv = DB::selectOne("SELECT * FROM invoices WHERE id=?", [$id]);
        if (!$inv) return response()->json(['message' => 'Invoice tidak ditemukan.'], 404);

        $d = $request->only([
            'project_id','lob','organisasi','product','client',
            'invoice_no','invoice_date','period','invoice_amount','tahun','notes'
        ]);

        // Auto-fill dari project jika project_id berubah
        if (!empty($d['project_id'])) {
            $proj = DB::selectOne("SELECT * FROM revenue_projects WHERE project_id=?", [$d['project_id']]);
            if ($proj) {
                if (empty($d['lob']))         $d['lob']         = $proj->lob;
                if (empty($d['organisasi']))  $d['organisasi']  = $proj->organisasi;
                if (empty($d['product']))     $d['product']     = $proj->product;
                if (empty($d['client']))      $d['client']      = $proj->client;
            }
        }

        DB::table('invoices')->where('id', $id)->update($d);

        // Sync project lama jika project_id berubah
        $oldProjectId = $inv->project_id;
        $newProjectId = $d['project_id'] ?? $oldProjectId;

        if (!empty($newProjectId)) $this->syncRealisasi($newProjectId);
        if (!empty($oldProjectId) && $oldProjectId !== $newProjectId) {
            $this->syncRealisasi($oldProjectId);
        }

        return response()->json(['message' => 'Invoice berhasil diperbarui.']);
    }

    // ══════════════════════════════════════════════════════════════════
    // DELETE /api/v1/revenue/invoices/{id}  — Admin only
    // ══════════════════════════════════════════════════════════════════
    public function deleteInvoice(Request $request, int $id)
    {
        $authUser = $request->attributes->get('auth_user');
        if (!$authUser || (int)$authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Hanya Admin yang dapat menghapus invoice.'], 403);
        }

        $inv = DB::selectOne("SELECT * FROM invoices WHERE id=?", [$id]);
        if (!$inv) return response()->json(['message' => 'Invoice tidak ditemukan.'], 404);

        DB::table('invoices')->where('id', $id)->delete();

        if (!empty($inv->project_id)) {
            $this->syncRealisasi($inv->project_id);
        }

        return response()->json(['message' => 'Invoice berhasil dihapus.']);
    }

    // ══════════════════════════════════════════════════════════════════
    // GET /api/v1/revenue/projects/{id}/monthly
    // Semua proyek + data bulanan — untuk halaman Project View
    // ══════════════════════════════════════════════════════════════════
    public function projectMonthlyView(Request $request)
    {
        $tahun      = (int)$request->query('tahun', now()->year);
        $organisasi = $request->query('organisasi', '');
        $kategori   = $request->query('kategori', '');
        $search     = $request->query('search', '');
        $curYear    = now()->year;
        $curMonth   = $tahun === $curYear ? (int)now()->month : 12;

        $monthNamesId = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

        $query  = "SELECT project_id, product, client, pic, kategori, organisasi, revenue_target
                   FROM revenue_projects WHERE is_active = 1 AND tahun = ?";
        $params = [$tahun];
        if ($organisasi) { $query .= " AND organisasi = ?"; $params[] = $organisasi; }
        if ($kategori)   { $query .= " AND kategori = ?";   $params[] = $kategori; }
        if ($search)     { $query .= " AND (product LIKE ? OR client LIKE ?)"; $params[] = "%$search%"; $params[] = "%$search%"; }
        $query .= " ORDER BY organisasi, product";

        $projects = DB::select($query, $params);

        if (empty($projects)) {
            $years = array_column(DB::select("SELECT DISTINCT tahun FROM revenue_projects ORDER BY tahun DESC"), 'tahun');
            return response()->json([
                'projects' => [], 'months' => $monthNamesId, 'cur_year' => $tahun,
                'cur_month' => $curMonth, 'grand_target' => 0, 'grand_actual' => 0,
                'month_totals' => [], 'years' => $years ?: [$tahun], 'org_list' => [],
            ]);
        }

        $pids = array_column($projects, 'project_id');
        $placeholders = implode(',', array_fill(0, count($pids), '?'));
        $monthlyRows = DB::select(
            "SELECT project_id, month_num, COALESCE(target,0) AS target, COALESCE(actual,0) AS actual
             FROM revenue_monthly WHERE project_id IN ($placeholders) ORDER BY project_id, month_num",
            $pids
        );

        $monthlyMap = [];
        foreach ($monthlyRows as $r) {
            $monthlyMap[$r->project_id][$r->month_num] = [
                'target' => (float)$r->target, 'actual' => (float)$r->actual,
            ];
        }

        $result = [];
        foreach ($projects as $p) {
            $months = [];
            for ($mn = 1; $mn <= 12; $mn++) {
                $t = $monthlyMap[$p->project_id][$mn]['target'] ?? 0;
                $a = $monthlyMap[$p->project_id][$mn]['actual'] ?? 0;
                $months[] = ['month_num' => $mn, 'target' => $t, 'actual' => $a,
                             'ach' => $t ? round($a / $t * 100, 1) : 0];
            }
            $totalTarget = array_sum(array_column($months, 'target'));
            $totalActual = array_sum(array_column($months, 'actual'));
            $result[] = [
                'project_id'     => $p->project_id,
                'product'        => $p->product,
                'client'         => $p->client,
                'pic'            => $p->pic,
                'kategori'       => $p->kategori,
                'organisasi'     => $p->organisasi,
                'revenue_target' => (float)$p->revenue_target,
                'months'         => $months,
                'total_target'   => $totalTarget,
                'total_actual'   => $totalActual,
                'total_ach'      => $totalTarget ? round($totalActual / $totalTarget * 100, 1) : 0,
            ];
        }

        $monthTotals = [];
        for ($mn = 1; $mn <= 12; $mn++) {
            $t = array_sum(array_column(array_column($result, 'months'), $mn - 1, null)[$mn - 1] ?? []);
            $a = 0;
            $t = 0;
            foreach ($result as $p) {
                $t += $p['months'][$mn - 1]['target'];
                $a += $p['months'][$mn - 1]['actual'];
            }
            $monthTotals[] = [
                'month_num'  => $mn,
                'label'      => $monthNamesId[$mn - 1],
                'target'     => $t, 'actual' => $a,
                'ach'        => $t ? round($a / $t * 100, 1) : 0,
                'is_past'    => $mn < $curMonth,
                'is_current' => $mn === $curMonth,
            ];
        }

        $grandTarget = array_sum(array_column($result, 'total_target'));
        $grandActual = array_sum(array_column($result, 'total_actual'));
        $years   = array_column(DB::select("SELECT DISTINCT tahun FROM revenue_projects ORDER BY tahun DESC"), 'tahun');
        $orgList = array_column(DB::select("SELECT DISTINCT organisasi FROM revenue_projects WHERE is_active=1 AND organisasi IS NOT NULL ORDER BY organisasi"), 'organisasi');

        return response()->json([
            'projects'     => $result,
            'months'       => $monthNamesId,
            'month_totals' => $monthTotals,
            'grand_target' => $grandTarget,
            'grand_actual' => $grandActual,
            'grand_ach'    => $grandTarget > 0 ? round($grandActual / $grandTarget * 100, 1) : 0,
            'cur_year'     => $tahun,
            'cur_month'    => $curMonth,
            'years'        => $years,
            'org_list'     => $orgList,
        ]);
    }

    // Mengembalikan rincian termin/bulanan dari revenue_monthly (target > 0)
    // ══════════════════════════════════════════════════════════════════
    public function projectMonthly(Request $request, string $id)
    {
        $project = DB::selectOne(
            "SELECT project_id, type, client, product, revenue_target FROM revenue_projects WHERE project_id=?",
            [$id]
        );
        if (!$project) return response()->json(['message' => 'Proyek tidak ditemukan.'], 404);

        $rows = DB::select(
            "SELECT id, month_num, month_name, target, actual, status
             FROM revenue_monthly WHERE project_id=? AND target > 0 ORDER BY month_num",
            [$id]
        );

        $idNames = ['','Januari','Februari','Maret','April','Mei','Juni',
                    'Juli','Agustus','September','Oktober','November','Desember'];

        $totalTarget = 0;
        $totalActual = 0;
        $result = [];
        foreach ($rows as $i => $r) {
            $target = (float)$r->target;
            $actual = (float)$r->actual;
            $totalTarget += $target;
            $totalActual += $actual;
            $result[] = [
                'id'         => $r->id,
                'termin_no'  => $i + 1,
                'month_num'  => $r->month_num,
                'month_name' => $idNames[$r->month_num] ?? $r->month_name,
                'target'     => $target,
                'actual'     => $actual,
                'status'     => $r->status,
                'ach_pct'    => $target > 0 ? round($actual / $target * 100, 1) : 0,
            ];
        }

        return response()->json([
            'project_id'   => $project->project_id,
            'type'         => $project->type,
            'client'       => $project->client,
            'product'      => $project->product,
            'total_target' => $totalTarget,
            'total_actual' => $totalActual,
            'monthly'      => $result,
        ]);
    }

    // ══════════════════════════════════════════════════════════════════
    // PUT /api/v1/revenue/monthly/{id}
    // Update satu row revenue_monthly (target, actual, status)
    // ══════════════════════════════════════════════════════════════════
    public function updateMonthly(Request $request, int $id)
    {
        $row = DB::selectOne("SELECT id, project_id FROM revenue_monthly WHERE id=?", [$id]);
        if (!$row) return response()->json(['message' => 'Data tidak ditemukan.'], 404);

        $allowed = ['target', 'actual', 'status'];
        $d = $request->only($allowed);

        if (empty($d)) return response()->json(['message' => 'Tidak ada data untuk diupdate.'], 422);

        // Auto-hitung status jika target & actual tersedia
        if (isset($d['actual']) || isset($d['target'])) {
            $target = isset($d['target']) ? (float)$d['target']
                      : (float)DB::selectOne("SELECT target FROM revenue_monthly WHERE id=?", [$id])->target;
            $actual = isset($d['actual']) ? (float)$d['actual']
                      : (float)DB::selectOne("SELECT actual FROM revenue_monthly WHERE id=?", [$id])->actual;
            if (!isset($d['status'])) {
                if ($actual <= 0)         $d['status'] = 'Pending';
                elseif ($actual >= $target) $d['status'] = 'Achieve';
                else                        $d['status'] = 'Not Achieve';
            }
        }

        DB::table('revenue_monthly')->where('id', $id)->update($d);

        // Update actual_revenue di revenue_projects dari sum monthly actual
        $projectId = $row->project_id;
        $sumActual = DB::selectOne(
            "SELECT COALESCE(SUM(actual),0) as s FROM revenue_monthly WHERE project_id=?",
            [$projectId]
        )->s;
        DB::table('revenue_projects')
            ->where('project_id', $projectId)
            ->update(['actual_revenue' => $sumActual]);

        $this->syncProjectStatus($projectId);

        return response()->json(['message' => 'Data termin berhasil diupdate.', 'id' => $id]);
    }

    // ══════════════════════════════════════════════════════════════════
    // POST /api/v1/revenue/monthly/upsert
    // Tambah atau update row revenue_monthly berdasarkan project_id+month_num
    // ══════════════════════════════════════════════════════════════════
    public function upsertMonthly(Request $request)
    {
        $projectId = $request->input('project_id');
        $monthNum  = (int)$request->input('month_num');
        $monthName = $request->input('month_name', '');
        $target    = (float)$request->input('target', 0);
        $actual    = (float)$request->input('actual', 0);

        if (!$projectId || !$monthNum) {
            return response()->json(['message' => 'project_id dan month_num wajib diisi.'], 422);
        }

        // Auto status
        if ($actual <= 0)           $status = 'Pending';
        elseif ($actual >= $target) $status = 'Achieve';
        else                        $status = 'Not Achieve';

        // Cek apakah row sudah ada
        $existing = DB::selectOne(
            "SELECT id FROM revenue_monthly WHERE project_id=? AND month_num=?",
            [$projectId, $monthNum]
        );

        if ($existing) {
            DB::table('revenue_monthly')
                ->where('id', $existing->id)
                ->update(['target' => $target, 'actual' => $actual, 'status' => $status]);
            $id = $existing->id;
        } else {
            $id = DB::table('revenue_monthly')->insertGetId([
                'project_id' => $projectId,
                'month_num'  => $monthNum,
                'month_name' => $monthName,
                'target'     => $target,
                'actual'     => $actual,
                'status'     => $status,
            ]);
        }

        // Sync actual_revenue di revenue_projects
        $sumActual = DB::selectOne(
            "SELECT COALESCE(SUM(actual),0) as s FROM revenue_monthly WHERE project_id=?",
            [$projectId]
        )->s;
        DB::table('revenue_projects')
            ->where('project_id', $projectId)
            ->update(['actual_revenue' => $sumActual]);

        $this->syncProjectStatus($projectId);

        return response()->json(['message' => 'Data termin berhasil disimpan.', 'id' => $id]);
    }

    // ══════════════════════════════════════════════════════════════════
    // Stub endpoints (tabel belum ada)
    // ══════════════════════════════════════════════════════════════════
    public function kpi(Request $request)
    {
        return response()->json(['tahun' => now()->year, 'kpi' => []]);
    }

    public function budget(Request $request)
    {
        return response()->json(['tahun' => now()->year, 'budget' => []]);
    }
}
