<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnnualTargetController extends Controller
{
    private function curYear(Request $request): int
    {
        $tahun = (int)$request->query('tahun', 0);
        return $tahun ?: (int)now()->year;
    }

    // GET /api/v1/annual-targets/orgs
    public function orgs(Request $request)
    {
        $tahun = $this->curYear($request);

        $allOrgs = DB::select(
            "SELECT kode, nama FROM organizations WHERE is_active=1 AND deleted_at IS NULL ORDER BY nama"
        );
        $selected = DB::select(
            "SELECT organisasi FROM annual_target_orgs WHERE tahun=?", [$tahun]
        );
        $selectedSet = collect($selected)->pluck('organisasi')->flip();

        $orgs = array_map(fn($o) => [
            'kode'     => $o->kode,
            'nama'     => $o->nama,
            'selected' => isset($selectedSet[$o->kode]),
        ], $allOrgs);

        return response()->json(['tahun' => $tahun, 'orgs' => $orgs]);
    }

    // POST /api/v1/annual-targets/orgs
    public function saveOrgs(Request $request)
    {
        $tahun    = (int)$request->input('tahun', now()->year);
        $selected = $request->input('selected', []);

        DB::transaction(function () use ($tahun, $selected) {
            DB::delete("DELETE FROM annual_target_orgs WHERE tahun=?", [$tahun]);
            foreach ($selected as $kode) {
                DB::statement(
                    "INSERT INTO annual_target_orgs (tahun, organisasi) VALUES (?,?) ON CONFLICT DO NOTHING",
                    [$tahun, $kode]
                );
            }
        });

        return response()->json(['message' => 'Organisasi target berhasil disimpan.']);
    }

    // GET /api/v1/annual-targets
    public function index(Request $request)
    {
        $tahun = $this->curYear($request);

        $selected = DB::select(
            "SELECT organisasi FROM annual_target_orgs WHERE tahun=? ORDER BY organisasi", [$tahun]
        );
        $lobs = array_column($selected, 'organisasi');

        $orgRows = DB::select(
            "SELECT kode, nama FROM organizations WHERE is_active=1 AND deleted_at IS NULL"
        );
        $orgNames = collect($orgRows)->pluck('nama', 'kode')->all();

        $rows = DB::select(
            "SELECT bulan, organisasi, target_revenue FROM annual_targets WHERE tahun=?", [$tahun]
        );
        $data = [];
        foreach ($rows as $r) {
            $data[(string)$r->bulan][$r->organisasi] = (float)$r->target_revenue;
        }

        return response()->json(['tahun' => $tahun, 'lobs' => $lobs, 'org_names' => $orgNames, 'data' => $data]);
    }

    // POST /api/v1/annual-targets
    public function save(Request $request)
    {
        $tahun = (int)$request->input('tahun', now()->year);
        $items = $request->input('items', []);

        DB::transaction(function () use ($tahun, $items) {
            foreach ($items as $item) {
                $bulan  = (int)$item['bulan'];
                $org    = (string)$item['organisasi'];
                $target = (float)($item['target_revenue'] ?? 0);
                DB::statement(
                    "INSERT INTO annual_targets (tahun, bulan, organisasi, target_revenue, updated_at)
                     VALUES (?,?,?,?,NOW())
                     ON CONFLICT (tahun, bulan, organisasi)
                     DO UPDATE SET target_revenue=EXCLUDED.target_revenue, updated_at=NOW()",
                    [$tahun, $bulan, $org, $target]
                );
            }
        });

        return response()->json(['message' => 'Target berhasil disimpan.']);
    }

    // GET /api/v1/annual-targets/summary
    public function summary(Request $request)
    {
        $tahun    = $this->curYear($request);
        $curYear  = (int)now()->year;
        $curMonth = $tahun === $curYear ? (int)now()->month : 12;

        $monthNames = ['January','February','March','April','May','June',
                       'July','August','September','October','November','December'];

        $selectedRows = DB::select(
            "SELECT organisasi FROM annual_target_orgs WHERE tahun=? ORDER BY organisasi", [$tahun]
        );
        $lobs = array_column($selectedRows, 'organisasi');

        $orgRows  = DB::select("SELECT kode, nama FROM organizations WHERE is_active=1 AND deleted_at IS NULL");
        $orgNames = collect($orgRows)->pluck('nama', 'kode')->all();

        $targetRows = DB::select(
            "SELECT bulan, organisasi, SUM(target_revenue) AS target
             FROM annual_targets WHERE tahun=?
             GROUP BY bulan, organisasi ORDER BY bulan, organisasi",
            [$tahun]
        );
        $actualRows = DB::select(
            "SELECT m.month_num AS bulan, p.organisasi, SUM(m.actual) AS actual
             FROM revenue_monthly m
             JOIN revenue_projects p ON m.project_id = p.project_id
             WHERE p.tahun=? AND p.is_active=1
             GROUP BY m.month_num, p.organisasi ORDER BY m.month_num, p.organisasi",
            [$tahun]
        );

        // Build monthly array
        $monthly = [];
        for ($m = 1; $m <= 12; $m++) {
            $byLob = [];
            foreach ($lobs as $lob) $byLob[$lob] = ['target' => 0, 'actual' => 0];
            $monthly[$m] = ['bulan' => $m, 'bulan_nama' => $monthNames[$m-1],
                            'total_target' => 0, 'total_actual' => 0, 'by_lob' => $byLob];
        }
        foreach ($targetRows as $r) {
            $m = (int)$r->bulan; $org = $r->organisasi; $t = (float)$r->target;
            $monthly[$m]['total_target'] += $t;
            if (isset($monthly[$m]['by_lob'][$org])) $monthly[$m]['by_lob'][$org]['target'] = $t;
        }
        foreach ($actualRows as $r) {
            $m = (int)$r->bulan; $org = $r->organisasi; $a = (float)$r->actual;
            if (isset($monthly[$m]['by_lob'][$org])) {
                $monthly[$m]['by_lob'][$org]['actual'] = $a;
                $monthly[$m]['total_actual'] += $a;
            }
        }

        // LOB summary
        $lobSummary = [];
        foreach ($lobs as $lob) {
            $lobSummary[$lob] = [
                'target' => array_sum(array_column(array_column($monthly, 'by_lob'), null)[$lob] ?? []) +
                            array_sum(array_map(fn($m) => $m['by_lob'][$lob]['target'] ?? 0, $monthly)),
                'actual' => array_sum(array_map(fn($m) => $m['by_lob'][$lob]['actual'] ?? 0, $monthly)),
            ];
            // Fix: recompute properly
            $lobSummary[$lob] = [
                'target' => array_sum(array_map(fn($m) => $m['by_lob'][$lob]['target'] ?? 0, $monthly)),
                'actual' => array_sum(array_map(fn($m) => $m['by_lob'][$lob]['actual'] ?? 0, $monthly)),
            ];
        }

        $grandTarget = array_sum(array_column($monthly, 'total_target'));
        $grandActual = array_sum(array_column($monthly, 'total_actual'));
        $ytdTarget   = array_sum(array_map(fn($m) => $m['bulan'] <= $curMonth ? $m['total_target'] : 0, $monthly));
        $ytdActual   = array_sum(array_map(fn($m) => $m['bulan'] <= $curMonth ? $m['total_actual'] : 0, $monthly));
        $ytdAch      = $ytdTarget > 0 ? round($ytdActual / $ytdTarget * 100, 1) : 0;

        $katRows = DB::select(
            "SELECT COALESCE(kategori,'Lainnya') AS kategori,
                    COALESCE(SUM(revenue_target),0) AS target,
                    COALESCE(SUM(actual_revenue),0)  AS actual
             FROM revenue_projects
             WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
               AND project_status IN ('Active','Completed')
             GROUP BY kategori ORDER BY kategori",
            [$tahun]
        );
        $kategoriSummary = array_map(fn($r) => [
            'kategori' => $r->kategori,
            'target'   => (float)$r->target,
            'actual'   => (float)$r->actual,
        ], $katRows);

        $clientTypeRows = DB::select(
            "SELECT COALESCE(revenue_type,'Existing') AS revenue_type,
                    COALESCE(SUM(revenue_target),0) AS target,
                    COALESCE(SUM(actual_revenue),0) AS actual
             FROM revenue_projects
             WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
               AND project_status IN ('Active','Completed')
             GROUP BY revenue_type ORDER BY revenue_type",
            [$tahun]
        );
        $clientTypeSummary = array_map(fn($r) => [
            'revenue_type' => $r->revenue_type,
            'target'      => (float)$r->target,
            'actual'      => (float)$r->actual,
        ], $clientTypeRows);

        // Gunakan total actual_revenue dari semua proyek (bukan hanya LOB yg terkonfigurasi)
        $totalActualRow = DB::selectOne(
            "SELECT COALESCE(SUM(actual_revenue),0) AS actual
             FROM revenue_projects
             WHERE tahun=? AND is_active=1 AND deleted_at IS NULL
               AND project_status IN ('Active','Completed')",
            [$tahun]
        );
        $totalActual = (float)$totalActualRow->actual;

        $sisaBulan   = 12 - $curMonth;
        $runRate     = $curMonth > 0 ? round($totalActual / $curMonth, 0) : 0;
        $proyeksi    = $runRate * 12;
        $sisaTarget  = max($grandTarget - $totalActual, 0);

        return response()->json([
            'tahun'                => $tahun,
            'lobs'                 => $lobs,
            'org_names'            => $orgNames,
            'monthly'              => array_values($monthly),
            'lob_summary'          => $lobSummary,
            'kategori_summary'     => $kategoriSummary,
            'revenue_type_summary' => $clientTypeSummary,
            'grand_target'         => $grandTarget,
            'grand_actual'         => $totalActual,
            'grand_ach'            => $grandTarget > 0 ? round($totalActual / $grandTarget * 100, 1) : 0,
            'ytd_target'           => $ytdTarget,
            'ytd_actual'           => $totalActual,
            'ytd_ach'              => $ytdTarget > 0 ? round($totalActual / $ytdTarget * 100, 1) : 0,
            'ytd_gap'              => $ytdTarget - $totalActual,
            'cur_month'            => $curMonth,
            'run_rate'             => $runRate,
            'proyeksi_eoy'         => $proyeksi,
            'sisa_bulan'           => $sisaBulan,
            'sisa_target'          => $sisaTarget,
            'target_per_bulan'     => $sisaBulan > 0 ? round($sisaTarget / $sisaBulan, 0) : 0,
        ]);
    }
}
