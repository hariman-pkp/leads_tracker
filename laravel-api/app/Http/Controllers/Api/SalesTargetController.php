<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SalesTargetController extends Controller
{
    public function index(Request $request)
    {
        $tahun   = (int)$request->query('tahun', now()->year);
        $user    = $request->attributes->get('auth_user');
        $isSales = ($user['role_id'] ?? 0) == 3;

        if ($isSales) {
            $allSales = [$user['nama']];
        } else {
            $rows     = DB::select("SELECT DISTINCT nama FROM users WHERE is_active = 1 AND role_id = 3 ORDER BY nama");
            $allSales = array_map(fn($r) => $r->nama, $rows);
        }

        if ($isSales) {
            $targetRows = DB::select(
                "SELECT sales_nama, bulan, target_deal FROM sales_targets WHERE tahun = ? AND sales_nama = ? ORDER BY bulan",
                [$tahun, $user['nama']]
            );
            $actualRows = DB::select(
                "SELECT sales_owner,
                        EXTRACT(MONTH FROM tgl_masuk)::integer as bulan,
                        COALESCE(SUM(deal_value), 0) as actual_deal,
                        COUNT(*) as won_count
                 FROM leads
                 WHERE stage='Won' AND EXTRACT(YEAR FROM tgl_masuk) = ? AND sales_owner = ?
                 GROUP BY sales_owner, bulan",
                [$tahun, $user['nama']]
            );
        } else {
            $targetRows = DB::select(
                "SELECT sales_nama, bulan, target_deal FROM sales_targets WHERE tahun = ? ORDER BY sales_nama, bulan",
                [$tahun]
            );
            $actualRows = DB::select(
                "SELECT sales_owner,
                        EXTRACT(MONTH FROM tgl_masuk)::integer as bulan,
                        COALESCE(SUM(deal_value), 0) as actual_deal,
                        COUNT(*) as won_count
                 FROM leads
                 WHERE stage='Won' AND EXTRACT(YEAR FROM tgl_masuk) = ?
                   AND sales_owner IS NOT NULL AND sales_owner <> ''
                 GROUP BY sales_owner, bulan",
                [$tahun]
            );
        }

        $targets = [];
        foreach ($targetRows as $r) {
            $targets[$r->sales_nama . '_' . $r->bulan] = (float)$r->target_deal;
        }

        $actuals = [];
        foreach ($actualRows as $r) {
            $actuals[$r->sales_owner . '_' . $r->bulan] = [
                'actual'    => (float)$r->actual_deal,
                'won_count' => (int)$r->won_count,
            ];
        }

        $bulanLabels = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
        $result = [];
        foreach ($allSales as $sales) {
            $row = ['sales_nama' => $sales, 'bulan' => []];
            $ytdTarget = 0; $ytdActual = 0;
            for ($m = 1; $m <= 12; $m++) {
                $t      = $targets[$sales . '_' . $m] ?? 0;
                $aData  = $actuals[$sales . '_' . $m] ?? ['actual' => 0, 'won_count' => 0];
                $a      = $aData['actual'];
                $ytdTarget += $t; $ytdActual += $a;
                $row['bulan'][] = [
                    'bulan'           => $m,
                    'bulan_label'     => $bulanLabels[$m - 1],
                    'target'          => $t,
                    'actual'          => $a,
                    'won_count'       => $aData['won_count'],
                    'achievement_pct' => $t > 0 ? round($a / $t * 100, 1) : null,
                ];
            }
            $row['ytd_target']          = $ytdTarget;
            $row['ytd_actual']          = $ytdActual;
            $row['ytd_achievement_pct'] = $ytdTarget > 0 ? round($ytdActual / $ytdTarget * 100, 1) : null;
            $result[] = $row;
        }

        return response()->json(['tahun' => $tahun, 'data' => $result]);
    }

    public function upsert(Request $request)
    {
        $user    = $request->attributes->get('auth_user');
        $roleId  = $user['role_id'] ?? 0;

        if ($roleId == 3) {
            return response()->json(['message' => 'Tidak diizinkan.'], 403);
        }

        $data = $request->validate([
            'sales_nama'  => 'required|string',
            'tahun'       => 'required|integer',
            'bulan'       => 'required|integer|between:1,12',
            'target_deal' => 'required|numeric',
        ]);

        $isSalesUser = DB::selectOne(
            "SELECT id FROM users WHERE nama = ? AND role_id = 3 AND is_active = 1",
            [$data['sales_nama']]
        );
        if (!$isSalesUser) {
            return response()->json(['message' => 'User bukan Sales aktif.'], 422);
        }

        DB::statement("
            INSERT INTO sales_targets (sales_nama, tahun, bulan, target_deal, updated_at)
            VALUES (?, ?, ?, ?, NOW())
            ON CONFLICT (sales_nama, tahun, bulan)
            DO UPDATE SET target_deal = EXCLUDED.target_deal, updated_at = NOW()
        ", [$data['sales_nama'], $data['tahun'], $data['bulan'], $data['target_deal']]);

        return response()->json(['message' => 'Target berhasil disimpan.']);
    }
}
