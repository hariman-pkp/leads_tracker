<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ShareLinkController extends Controller
{
    private function ensureTable(): void
    {
        DB::statement("
            CREATE TABLE IF NOT EXISTS share_links (
                id          SERIAL PRIMARY KEY,
                resource    VARCHAR(50)  NOT NULL,
                token       VARCHAR(64)  NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                created_at  TIMESTAMP DEFAULT NOW(),
                updated_at  TIMESTAMP DEFAULT NOW()
            )
        ");
    }

    // GET /api/v1/share-links/annual-target  (protected)
    public function getAnnualTarget()
    {
        $this->ensureTable();
        $row = DB::selectOne("SELECT token FROM share_links WHERE resource='annual_target' LIMIT 1");
        if (!$row) return response()->json(['token' => null, 'url' => null]);

        $url = config('app.url') . '/share/annual-target/' . $row->token;
        return response()->json(['token' => $row->token, 'url' => $url]);
    }

    // POST /api/v1/share-links/annual-target/generate  (protected)
    public function generateAnnualTarget(Request $request)
    {
        $this->ensureTable();
        $password = $request->input('password');
        if (!$password || strlen($password) < 4) {
            return response()->json(['message' => 'Password minimal 4 karakter.'], 422);
        }

        $token = Str::random(48);
        $hash  = password_hash($password, PASSWORD_BCRYPT);

        DB::statement("DELETE FROM share_links WHERE resource='annual_target'");
        DB::statement(
            "INSERT INTO share_links (resource, token, password_hash) VALUES ('annual_target', ?, ?)",
            [$token, $hash]
        );

        $url = config('app.url') . '/share/annual-target/' . $token;
        return response()->json(['token' => $token, 'url' => $url]);
    }

    // POST /api/v1/public/annual-target/{token}/verify  (public)
    public function verifyAnnualTarget(Request $request, string $token)
    {
        $this->ensureTable();
        $row = DB::selectOne("SELECT password_hash FROM share_links WHERE resource='annual_target' AND token=?", [$token]);
        if (!$row) return response()->json(['message' => 'Link tidak valid.'], 404);

        $password = $request->input('password', '');
        if (!password_verify($password, $row->password_hash)) {
            return response()->json(['message' => 'Password salah.'], 401);
        }

        // Return summary data
        $tahun = (int)$request->input('tahun', now()->year);
        $curMonth = (int)now()->month;

        $summary = $this->buildSummary($tahun);
        return response()->json(['ok' => true, 'summary' => $summary, 'tahun' => $tahun]);
    }

    // GET /api/v1/public/annual-target/{token}  (public) - check token valid
    public function checkToken(string $token)
    {
        $this->ensureTable();
        $row = DB::selectOne("SELECT id FROM share_links WHERE resource='annual_target' AND token=?", [$token]);
        if (!$row) return response()->json(['valid' => false], 404);
        return response()->json(['valid' => true]);
    }

    private function buildSummary(int $tahun): array
    {
        $curYear  = (int)now()->year;
        $curMonth = $tahun === $curYear ? (int)now()->month : 12;

        $MONTHS = ['Januari','Februari','Maret','April','Mei','Juni',
                   'Juli','Agustus','September','Oktober','November','Desember'];

        $selectedRows = DB::select("SELECT organisasi FROM annual_target_orgs WHERE tahun=? ORDER BY organisasi", [$tahun]);
        $lobs = array_column($selectedRows, 'organisasi');

        $orgRows  = DB::select("SELECT kode, nama FROM organizations WHERE is_active=1 AND deleted_at IS NULL");
        $orgNames = collect($orgRows)->pluck('nama', 'kode')->all();

        $targetRows = DB::select(
            "SELECT bulan, organisasi, SUM(target_revenue) AS target
             FROM annual_targets WHERE tahun=?
             GROUP BY bulan, organisasi ORDER BY bulan, organisasi", [$tahun]
        );
        $actualRows = DB::select(
            "SELECT m.month_num AS bulan, p.organisasi, SUM(m.actual) AS actual
             FROM revenue_monthly m
             JOIN revenue_projects p ON m.project_id = p.project_id
             WHERE p.tahun=? AND p.is_active=1
             GROUP BY m.month_num, p.organisasi ORDER BY m.month_num, p.organisasi", [$tahun]
        );

        $monthly = [];
        for ($m = 1; $m <= 12; $m++) {
            $byLob = [];
            foreach ($lobs as $lob) $byLob[$lob] = ['target' => 0, 'actual' => 0];
            $monthly[$m] = ['bulan' => $m, 'bulan_nama' => $MONTHS[$m-1],
                            'total_target' => 0, 'total_actual' => 0, 'by_lob' => $byLob];
        }
        foreach ($targetRows as $r) {
            $m = (int)$r->bulan; $t = (float)$r->target;
            $monthly[$m]['total_target'] += $t;
            if (isset($monthly[$m]['by_lob'][$r->organisasi])) $monthly[$m]['by_lob'][$r->organisasi]['target'] = $t;
        }
        foreach ($actualRows as $r) {
            $m = (int)$r->bulan; $a = (float)$r->actual;
            if (isset($monthly[$m]['by_lob'][$r->organisasi])) {
                $monthly[$m]['by_lob'][$r->organisasi]['actual'] = $a;
                $monthly[$m]['total_actual'] += $a;
            }
        }

        $lobSummary = [];
        foreach ($lobs as $lob) {
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
             GROUP BY kategori ORDER BY kategori", [$tahun]
        );
        $kategoriSummary = array_map(fn($r) => [
            'kategori' => $r->kategori,
            'target'   => (float)$r->target,
            'actual'   => (float)$r->actual,
        ], $katRows);

        return [
            'tahun'            => $tahun,
            'lobs'             => $lobs,
            'org_names'        => $orgNames,
            'monthly'          => array_values($monthly),
            'lob_summary'      => $lobSummary,
            'kategori_summary' => $kategoriSummary,
            'grand_target'     => $grandTarget,
            'grand_actual'     => $grandActual,
            'ytd_target'       => $ytdTarget,
            'ytd_actual'       => $ytdActual,
            'ytd_ach'          => $ytdAch,
            'ytd_gap'          => $ytdTarget - $ytdActual,
            'cur_month'        => $curMonth,
        ];
    }
}
