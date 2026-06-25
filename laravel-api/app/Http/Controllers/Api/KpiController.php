<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KpiController extends Controller
{
    // ─── Mapping: kpi_name → auto-calc query type ─────────────────────────────
    // KPI yang bisa dihitung otomatis dari database
    private const AUTO_KPI = [
        'Total Prospek Teridentifikasi' => 'leads_total',
        'Qualified Prospects'           => 'leads_qualified',
        'Proposals Submitted'           => 'proposals_submitted',
        'Deals Closed'                  => 'deals_closed',
        'Proposal Win Rate'             => 'win_rate',
        'Meeting Conversion Rate'       => 'meeting_conversion',
        'Meetings Scheduled'            => 'meetings_scheduled',
        'Meetings Conducted'            => 'meetings_conducted',
        'Total Pipeline Value'          => 'pipeline_value',
        'Weighted Pipeline'             => 'weighted_pipeline',
        'Average Deal Size'             => 'avg_deal_size',
        'Average Sales Cycle'           => 'avg_sales_cycle',
        'Revenue Recognized'            => 'revenue_recognized',
    ];

    // ─── GET /v1/kpi/prospecting?tahun=2026 ───────────────────────────────────
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $tahun = (int)$request->query('tahun', date('Y'));

        // Ambil semua KPI (exclude LEGEND rows)
        $rows = DB::select(
            "SELECT * FROM kpi_prospecting
             WHERE tahun = ? AND kpi_category NOT LIKE 'LEGEND%'
             ORDER BY kpi_category, sort_order, kpi_name",
            [$tahun]
        );

        // Hitung actuals dari database (cumulative per quarter)
        $actuals = $this->calcActuals($tahun);

        $result = array_map(function ($r) use ($actuals) {
            $type    = self::AUTO_KPI[$r->kpi_name] ?? null;
            $isAuto  = $type !== null;
            $calc    = $actuals[$type] ?? null;

            return [
                'id'            => $r->id,
                'tahun'         => $r->tahun,
                'kpi_category'  => $r->kpi_category,
                'kpi_name'      => $r->kpi_name,
                'unit'          => $r->unit,
                'target_annual' => (float)$r->target_annual,
                'is_auto'       => $isAuto,
                'q1_target'     => (float)$r->q1_target,
                'q1_actual'     => $isAuto ? ($calc['q1'] ?? 0) : (float)$r->q1_actual,
                'q2_target'     => (float)$r->q2_target,
                'q2_actual'     => $isAuto ? ($calc['q2'] ?? 0) : (float)$r->q2_actual,
                'q3_target'     => (float)$r->q3_target,
                'q3_actual'     => $isAuto ? ($calc['q3'] ?? 0) : (float)$r->q3_actual,
                'q4_target'     => (float)$r->q4_target,
                'q4_actual'     => $isAuto ? ($calc['q4'] ?? 0) : (float)$r->q4_actual,
                'sort_order'    => (int)$r->sort_order,
            ];
        }, $rows);

        // Hitung current quarter
        $curMonth = (int)date('n');
        $curQ     = (int)ceil($curMonth / 3);

        return response()->json([
            'tahun'    => $tahun,
            'cur_q'    => $curQ,
            'cur_month'=> $curMonth,
            'data'     => $result,
        ]);
    }

    // ─── PUT /v1/kpi/prospecting/{id} (update target & manual actual) ─────────
    public function update(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        $row = DB::selectOne("SELECT * FROM kpi_prospecting WHERE id = ?", [$id]);
        if (!$row) return response()->json(['message' => 'Not found'], 404);

        $type   = self::AUTO_KPI[$row->kpi_name] ?? null;
        $isAuto = $type !== null;

        $fields = [
            'target_annual' => (float)$request->input('target_annual', $row->target_annual),
            'q1_target'     => (float)$request->input('q1_target',     $row->q1_target),
            'q2_target'     => (float)$request->input('q2_target',     $row->q2_target),
            'q3_target'     => (float)$request->input('q3_target',     $row->q3_target),
            'q4_target'     => (float)$request->input('q4_target',     $row->q4_target),
        ];

        // Hanya simpan actual jika KPI manual
        if (!$isAuto) {
            $fields['q1_actual'] = (float)$request->input('q1_actual', $row->q1_actual);
            $fields['q2_actual'] = (float)$request->input('q2_actual', $row->q2_actual);
            $fields['q3_actual'] = (float)$request->input('q3_actual', $row->q3_actual);
            $fields['q4_actual'] = (float)$request->input('q4_actual', $row->q4_actual);
        }

        DB::table('kpi_prospecting')->where('id', $id)->update($fields);

        return response()->json(['message' => 'Updated', 'id' => $id]);
    }

    // ─── POST /v1/kpi/prospecting (tambah KPI baru) ───────────────────────────
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $tahun = (int)$request->input('tahun', date('Y'));

        $maxOrder = DB::selectOne(
            "SELECT COALESCE(MAX(sort_order),0)+1 AS s FROM kpi_prospecting WHERE tahun=?",
            [$tahun]
        )->s;

        DB::table('kpi_prospecting')->insert([
            'tahun'         => $tahun,
            'kpi_category'  => $request->input('kpi_category'),
            'kpi_name'      => $request->input('kpi_name'),
            'unit'          => $request->input('unit', 'Count'),
            'target_annual' => (float)$request->input('target_annual', 0),
            'q1_target'     => (float)$request->input('q1_target', 0),
            'q1_actual'     => 0,
            'q2_target'     => (float)$request->input('q2_target', 0),
            'q2_actual'     => 0,
            'q3_target'     => (float)$request->input('q3_target', 0),
            'q3_actual'     => 0,
            'q4_target'     => (float)$request->input('q4_target', 0),
            'q4_actual'     => 0,
            'sort_order'    => $maxOrder,
            'created_at'    => now(),
        ]);

        return response()->json(['message' => 'Created'], 201);
    }

    // ─── DELETE /v1/kpi/prospecting/{id} ──────────────────────────────────────
    public function destroy(int $id): \Illuminate\Http\JsonResponse
    {
        DB::table('kpi_prospecting')->where('id', $id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    // ─── GET /v1/kpi/prospecting/years ────────────────────────────────────────
    public function years(): \Illuminate\Http\JsonResponse
    {
        $years = DB::select("SELECT DISTINCT tahun FROM kpi_prospecting ORDER BY tahun DESC");
        $list  = array_map(fn($r) => (int)$r->tahun, $years);
        if (!in_array((int)date('Y'), $list)) $list[] = (int)date('Y');
        rsort($list);
        return response()->json($list);
    }

    // ─── Hitung actuals dari database (cumulative per Q) ──────────────────────
    private function calcActuals(int $tahun): array
    {
        // Helper: batas bulan per Q (cumulative)
        $qMonths = [
            'q1' => [1, 3],
            'q2' => [1, 6],
            'q3' => [1, 9],
            'q4' => [1, 12],
        ];

        $result = [];

        foreach ($qMonths as $q => [$mStart, $mEnd]) {
            $startDate = "{$tahun}-{$mStart}-01";
            $endDate   = date('Y-m-t', strtotime("{$tahun}-{$mEnd}-01"));

            // Leads total (semua leads masuk dalam periode)
            $leadsTotal = DB::selectOne(
                "SELECT COUNT(*) AS cnt FROM leads
                 WHERE tgl_masuk BETWEEN ? AND ?",
                [$startDate, $endDate]
            )->cnt;
            $result['leads_total'][$q] = (int)$leadsTotal;

            // Qualified prospects (stage bukan New/On Hold)
            $leadsQual = DB::selectOne(
                "SELECT COUNT(*) AS cnt FROM leads
                 WHERE tgl_masuk BETWEEN ? AND ?
                   AND stage NOT IN ('New', 'On Hold')",
                [$startDate, $endDate]
            )->cnt;
            $result['leads_qualified'][$q] = (int)$leadsQual;

            // Proposals submitted (stage = Proposal Sent atau lebih lanjut)
            $proposals = DB::selectOne(
                "SELECT COUNT(*) AS cnt FROM leads
                 WHERE tgl_masuk BETWEEN ? AND ?
                   AND stage IN ('Proposal Sent', 'Demo Scheduled', 'Won')",
                [$startDate, $endDate]
            )->cnt;
            $result['proposals_submitted'][$q] = (int)$proposals;

            // Deals closed (stage = Won)
            $dealsClosed = DB::selectOne(
                "SELECT COUNT(*) AS cnt FROM leads
                 WHERE stage = 'Won'
                   AND (exp_close_date BETWEEN ? AND ? OR updated_at::date BETWEEN ? AND ?)",
                [$startDate, $endDate, $startDate, $endDate]
            )->cnt;
            $result['deals_closed'][$q] = (int)$dealsClosed;

            // Win rate (berdasarkan leads Won vs Lost dalam periode)
            $won  = (int)DB::selectOne(
                "SELECT COUNT(*) AS cnt FROM leads WHERE stage='Won'
                   AND (exp_close_date BETWEEN ? AND ? OR updated_at::date BETWEEN ? AND ?)",
                [$startDate, $endDate, $startDate, $endDate]
            )->cnt;
            $lost = (int)DB::selectOne(
                "SELECT COUNT(*) AS cnt FROM leads WHERE stage='Lost'
                   AND (exp_close_date BETWEEN ? AND ? OR updated_at::date BETWEEN ? AND ?)",
                [$startDate, $endDate, $startDate, $endDate]
            )->cnt;
            $total = $won + $lost;
            $result['win_rate'][$q] = $total > 0 ? round($won / $total * 100, 1) : 0;

            // Meetings scheduled (dari follow_up_log)
            $meetSched = DB::selectOne(
                "SELECT COUNT(*) AS cnt FROM follow_up_log
                 WHERE tgl_fu BETWEEN ? AND ?
                   AND LOWER(metode_fu) LIKE '%meeting%'",
                [$startDate, $endDate]
            )->cnt;
            $result['meetings_scheduled'][$q] = (int)$meetSched;

            // Meetings conducted (status done/completed)
            $meetDone = DB::selectOne(
                "SELECT COUNT(*) AS cnt FROM follow_up_log
                 WHERE tgl_fu BETWEEN ? AND ?
                   AND LOWER(metode_fu) LIKE '%meeting%'
                   AND LOWER(status) IN ('done', 'completed', 'selesai')",
                [$startDate, $endDate]
            )->cnt;
            $result['meetings_conducted'][$q] = (int)$meetDone;

            // Meeting conversion rate = meetings / qualified * 100
            $meetQ   = $result['meetings_scheduled'][$q];
            $qualQ   = $result['leads_qualified'][$q];
            $result['meeting_conversion'][$q] = $qualQ > 0 ? round($meetQ / $qualQ * 100, 1) : 0;

            // Pipeline value (active leads)
            $pipeline = DB::selectOne(
                "SELECT COALESCE(SUM(propose_value),0) AS s FROM leads
                 WHERE stage NOT IN ('Won', 'Lost')
                   AND EXTRACT(YEAR FROM tgl_masuk) = ?",
                [$tahun]
            )->s;
            $result['pipeline_value'][$q] = round((float)$pipeline / 1_000_000_000, 3); // Miliar Rp

            // Weighted pipeline
            $weighted = DB::selectOne(
                "SELECT COALESCE(SUM(weighted_value),0) AS s FROM leads
                 WHERE stage NOT IN ('Won', 'Lost')
                   AND EXTRACT(YEAR FROM tgl_masuk) = ?",
                [$tahun]
            )->s;
            $result['weighted_pipeline'][$q] = round((float)$weighted / 1_000_000_000, 3);

            // Average deal size (Won leads, dalam miliar)
            $avgDeal = DB::selectOne(
                "SELECT COALESCE(AVG(deal_value),0) AS a FROM leads
                 WHERE stage='Won' AND EXTRACT(YEAR FROM tgl_masuk) = ?",
                [$tahun]
            )->a;
            $result['avg_deal_size'][$q] = round((float)$avgDeal / 1_000_000_000, 3);

            // Revenue recognized (Won leads dalam periode)
            $rev = DB::selectOne(
                "SELECT COALESCE(SUM(deal_value),0) AS s FROM leads
                 WHERE stage='Won'
                   AND (exp_close_date BETWEEN ? AND ? OR updated_at::date BETWEEN ? AND ?)",
                [$startDate, $endDate, $startDate, $endDate]
            )->s;
            $result['revenue_recognized'][$q] = round((float)$rev / 1_000_000_000, 3);

            // Average sales cycle (hari)
            $avgCycle = DB::selectOne(
                "SELECT COALESCE(AVG(sales_cycle),0) AS a FROM win_loss
                 WHERE EXTRACT(YEAR FROM tgl_close) = ?",
                [$tahun]
            )->a;
            $result['avg_sales_cycle'][$q] = round((float)$avgCycle, 1);
        }

        return $result;
    }
}
