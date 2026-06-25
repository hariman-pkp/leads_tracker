<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WinlossController extends Controller
{
    // POST /v1/winloss/reason — simpan alasan won/lost untuk lead tertentu
    public function storeReason(Request $request)
    {
        $d      = $request->all();
        $leadId = $d['lead_id'] ?? null;

        if (!$leadId) return response()->json(['detail' => 'lead_id wajib diisi.'], 400);

        $lead = DB::selectOne("SELECT lead_id, nama_company, stage, propose_value, deal_value, tgl_masuk, sales_owner, segmen FROM leads WHERE lead_id = ?", [$leadId]);
        if (!$lead) return response()->json(['detail' => 'Lead tidak ditemukan.'], 404);
        if (!in_array($lead->stage, ['Won', 'Lost'])) {
            return response()->json(['detail' => 'Alasan hanya dapat dicatat untuk lead Won atau Lost.'], 422);
        }

        // Upsert — satu lead satu record di win_loss
        $existing = DB::selectOne("SELECT id FROM win_loss WHERE lead_id = ?", [$leadId]);

        $tglMasuk = $lead->tgl_masuk ? substr($lead->tgl_masuk, 0, 10) : null;
        $tglClose = $d['tgl_close'] ?? now()->toDateString();
        $salesCycle = ($tglMasuk && $tglClose)
            ? max(0, (int) now()->parse($tglClose)->diffInDays(now()->parse($tglMasuk)))
            : null;

        $data = [
            'lead_id'        => $leadId,
            'nama_company'   => $lead->nama_company,
            'segmen'         => $lead->segmen,
            'hasil'          => $lead->stage,
            'deal_value'     => $lead->stage === 'Won' ? ($lead->deal_value ?? $lead->propose_value) : $lead->propose_value,
            'tgl_masuk'      => $tglMasuk,
            'tgl_close'      => $tglClose,
            'sales_cycle'    => $salesCycle,
            'sales_owner'    => $lead->sales_owner,
            'alasan'         => $d['alasan'] ?? null,
            'kompetitor'     => $d['kompetitor'] ?? null,
            'lesson_learned' => $d['lesson_learned'] ?? null,
        ];

        if ($existing) {
            DB::table('win_loss')->where('id', $existing->id)->update(array_merge($data, ['updated_at' => now()]));
        } else {
            DB::table('win_loss')->insert(array_merge($data, ['created_at' => now(), 'updated_at' => now()]));
        }

        return response()->json(['message' => 'Alasan berhasil disimpan.'], 200);
    }

    // GET /v1/winloss/reason/{leadId}
    public function getReason(string $leadId)
    {
        $row = DB::selectOne("SELECT * FROM win_loss WHERE lead_id = ?", [$leadId]);
        return response()->json($row ? (array) $row : null);
    }


    public function index(Request $request)
    {
        $tahun = (int)$request->query('tahun', now()->year);

        // Ambil dari leads table (stage Won/Lost) karena win_loss table masih kosong
        $leads = DB::select("
            SELECT lead_id, nama_company, product, segmen, stage,
                   propose_value, deal_value, probability,
                   sales_owner, tgl_masuk, exp_close_date, updated_at,
                   last_fu_notes, prioritas
            FROM leads
            WHERE stage IN ('Won','Lost')
            ORDER BY updated_at DESC"
        );

        // Summary
        $won = array_filter($leads, fn($r) => $r->stage === 'Won');
        $lost = array_filter($leads, fn($r) => $r->stage === 'Lost');
        $wonVal  = array_sum(array_map(fn($r) => (float)($r->deal_value ?: $r->propose_value), $won));
        $lostVal = array_sum(array_map(fn($r) => (float)($r->propose_value), $lost));
        $total   = count($won) + count($lost);
        $winRate = $total > 0 ? round(count($won) / $total * 100, 1) : 0;

        // By product (Won)
        $byProduct = DB::select("
            SELECT COALESCE(product,'—') as product,
                   SUM(CASE WHEN stage='Won' THEN 1 ELSE 0 END) as won,
                   SUM(CASE WHEN stage='Lost' THEN 1 ELSE 0 END) as lost,
                   COALESCE(SUM(CASE WHEN stage='Won' THEN deal_value ELSE 0 END),0) as won_value
            FROM leads WHERE stage IN ('Won','Lost')
            GROUP BY product ORDER BY won DESC"
        );

        // By segmen
        $bySegmen = DB::select("
            SELECT COALESCE(segmen,'—') as segmen,
                   SUM(CASE WHEN stage='Won' THEN 1 ELSE 0 END) as won,
                   SUM(CASE WHEN stage='Lost' THEN 1 ELSE 0 END) as lost,
                   COALESCE(SUM(CASE WHEN stage='Won' THEN deal_value ELSE 0 END),0) as won_value
            FROM leads WHERE stage IN ('Won','Lost')
            GROUP BY segmen ORDER BY won DESC"
        );

        // By sales
        $bySales = DB::select("
            SELECT COALESCE(sales_owner,'Tidak Ditugaskan') as sales_owner,
                   SUM(CASE WHEN stage='Won' THEN 1 ELSE 0 END) as won,
                   SUM(CASE WHEN stage='Lost' THEN 1 ELSE 0 END) as lost,
                   COALESCE(SUM(CASE WHEN stage='Won' THEN deal_value ELSE 0 END),0) as won_value
            FROM leads WHERE stage IN ('Won','Lost')
            GROUP BY sales_owner ORDER BY won DESC"
        );

        // Avg deal size (Won)
        $avgDeal = count($won) > 0 ? $wonVal / count($won) : 0;

        return response()->json([
            'tahun'      => $tahun,
            'summary'    => [
                'won'       => count($won),
                'lost'      => count($lost),
                'win_rate'  => $winRate,
                'won_value' => $wonVal,
                'lost_value'=> $lostVal,
                'avg_deal'  => round($avgDeal),
            ],
            'by_product' => array_map(fn($r) => (array)$r, $byProduct),
            'by_segmen'  => array_map(fn($r) => (array)$r, $bySegmen),
            'by_sales'   => array_map(fn($r) => (array)$r, $bySales),
            'won_leads'  => array_map(fn($r) => (array)$r, array_values($won)),
            'lost_leads' => array_map(fn($r) => (array)$r, array_values($lost)),
        ]);
    }
}
