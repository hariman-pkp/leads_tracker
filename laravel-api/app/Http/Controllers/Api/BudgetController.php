<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BudgetController extends Controller
{
    // ─── GET /v1/budget?tahun=2026 ────────────────────────────────────────────
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $tahun = (int)$request->query('tahun', date('Y'));

        $rows = DB::select(
            "SELECT * FROM budget_items
             WHERE tahun = ? AND deleted_at IS NULL
             ORDER BY perspektif_bsc, category, sub_category, id",
            [$tahun]
        );

        $items = array_map(fn($r) => [
            'id'             => $r->id,
            'tahun'          => $r->tahun,
            'perspektif_bsc' => $r->perspektif_bsc,
            'category'       => $r->category,
            'sub_category'   => $r->sub_category,
            'budget_amount'  => (float)$r->budget_amount,
            'actual_amount'  => (float)$r->actual_amount,
            'month_num'      => (int)$r->month_num,
            'notes'          => $r->notes,
            'status'         => $r->status,
            'ach_pct'        => (float)$r->budget_amount > 0
                                  ? round((float)$r->actual_amount / (float)$r->budget_amount * 100, 1)
                                  : 0,
        ], $rows);

        // Summary per perspektif_bsc
        $summary = [];
        foreach ($items as $item) {
            $bsc = $item['perspektif_bsc'];
            if (!isset($summary[$bsc])) {
                $summary[$bsc] = ['perspektif_bsc' => $bsc, 'budget' => 0, 'actual' => 0];
            }
            $summary[$bsc]['budget'] += $item['budget_amount'];
            $summary[$bsc]['actual'] += $item['actual_amount'];
        }
        foreach ($summary as &$s) {
            $s['ach_pct'] = $s['budget'] > 0 ? round($s['actual'] / $s['budget'] * 100, 1) : 0;
        }

        // Distinct values untuk dropdown filter/form
        $perspectives = DB::select(
            "SELECT DISTINCT perspektif_bsc FROM budget_items
             WHERE tahun=? AND deleted_at IS NULL ORDER BY perspektif_bsc",
            [$tahun]
        );
        $categories = DB::select(
            "SELECT DISTINCT perspektif_bsc, category FROM budget_items
             WHERE tahun=? AND deleted_at IS NULL ORDER BY category",
            [$tahun]
        );

        // Tahun yang tersedia
        $years = DB::select("SELECT DISTINCT tahun FROM budget_items ORDER BY tahun DESC");
        $yearList = array_map(fn($r) => (int)$r->tahun, $years);
        if (!in_array((int)date('Y'), $yearList)) $yearList[] = (int)date('Y');
        rsort($yearList);

        return response()->json([
            'tahun'        => $tahun,
            'years'        => $yearList,
            'data'         => $items,
            'summary'      => array_values($summary),
            'perspectives' => array_map(fn($r) => $r->perspektif_bsc, $perspectives),
            'categories'   => array_map(fn($r) => [
                'perspektif_bsc' => $r->perspektif_bsc,
                'category'       => $r->category,
            ], $categories),
        ]);
    }

    // ─── POST /v1/budget ──────────────────────────────────────────────────────
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $tahun = (int)$request->input('tahun', date('Y'));

        $id = DB::table('budget_items')->insertGetId([
            'tahun'          => $tahun,
            'perspektif_bsc' => $request->input('perspektif_bsc'),
            'category'       => $request->input('category'),
            'sub_category'   => $request->input('sub_category', ''),
            'budget_amount'  => (float)$request->input('budget_amount', 0),
            'actual_amount'  => (float)$request->input('actual_amount', 0),
            'month_num'      => (int)$request->input('month_num', 0),
            'notes'          => $request->input('notes', ''),
            'status'         => $request->input('status', 'Planning'),
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return response()->json(['message' => 'Created', 'id' => $id], 201);
    }

    // ─── PUT /v1/budget/{id} ──────────────────────────────────────────────────
    public function update(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        $row = DB::selectOne("SELECT * FROM budget_items WHERE id=? AND deleted_at IS NULL", [$id]);
        if (!$row) return response()->json(['message' => 'Not found'], 404);

        DB::table('budget_items')->where('id', $id)->update([
            'perspektif_bsc' => $request->input('perspektif_bsc', $row->perspektif_bsc),
            'category'       => $request->input('category',       $row->category),
            'sub_category'   => $request->input('sub_category',   $row->sub_category),
            'budget_amount'  => (float)$request->input('budget_amount', $row->budget_amount),
            'actual_amount'  => (float)$request->input('actual_amount', $row->actual_amount),
            'month_num'      => (int)$request->input('month_num',   $row->month_num),
            'notes'          => $request->input('notes',            $row->notes),
            'status'         => $request->input('status',           $row->status),
            'updated_at'     => now(),
        ]);

        return response()->json(['message' => 'Updated']);
    }

    // ─── DELETE /v1/budget/{id} (soft delete) ────────────────────────────────
    public function destroy(int $id): \Illuminate\Http\JsonResponse
    {
        $row = DB::selectOne("SELECT id FROM budget_items WHERE id=? AND deleted_at IS NULL", [$id]);
        if (!$row) return response()->json(['message' => 'Not found'], 404);

        DB::table('budget_items')->where('id', $id)->update(['deleted_at' => now()]);
        return response()->json(['message' => 'Deleted']);
    }

    // ─── GET /v1/budget/years ─────────────────────────────────────────────────
    public function years(): \Illuminate\Http\JsonResponse
    {
        $years = DB::select("SELECT DISTINCT tahun FROM budget_items ORDER BY tahun DESC");
        $list  = array_map(fn($r) => (int)$r->tahun, $years);
        if (!in_array((int)date('Y'), $list)) $list[] = (int)date('Y');
        rsort($list);
        return response()->json($list);
    }
}
