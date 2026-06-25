<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrganizationController extends Controller
{
    // ─── GET /v1/master/organizations ────────────────────────────────────────
    public function index(): \Illuminate\Http\JsonResponse
    {
        $rows = DB::select(
            "SELECT o.*,
                    p.kode  AS parent_kode,
                    p.nama  AS parent_nama
             FROM organizations o
             LEFT JOIN organizations p ON o.parent_id = p.id
             WHERE o.deleted_at IS NULL
             ORDER BY o.kode"
        );

        $list = array_map(fn($r) => [
            'id'          => $r->id,
            'kode'        => $r->kode,
            'nama'        => $r->nama,
            'parent_id'   => $r->parent_id,
            'parent_kode' => $r->parent_kode,
            'parent_nama' => $r->parent_nama,
            'head'        => $r->head,
            'is_active'   => (int)$r->is_active,
        ], $rows);

        return response()->json($list);
    }

    // ─── POST /v1/master/organizations ───────────────────────────────────────
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $kode = strtoupper(trim($request->input('kode', '')));
        if (!$kode) return response()->json(['message' => 'Kode wajib diisi'], 422);

        $exists = DB::selectOne(
            "SELECT id FROM organizations WHERE kode = ? AND deleted_at IS NULL",
            [$kode]
        );
        if ($exists) return response()->json(['message' => 'Kode organisasi sudah digunakan'], 422);

        $id = DB::table('organizations')->insertGetId([
            'kode'       => $kode,
            'nama'       => trim($request->input('nama', '')),
            'parent_id'  => $request->input('parent_id') ?: null,
            'head'       => trim($request->input('head', '')) ?: null,
            'is_active'  => 1,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Organisasi berhasil ditambahkan', 'id' => $id], 201);
    }

    // ─── PUT /v1/master/organizations/{id} ───────────────────────────────────
    public function update(Request $request, int $id): \Illuminate\Http\JsonResponse
    {
        $row = DB::selectOne(
            "SELECT * FROM organizations WHERE id = ? AND deleted_at IS NULL", [$id]
        );
        if (!$row) return response()->json(['message' => 'Data tidak ditemukan'], 404);

        $kode = strtoupper(trim($request->input('kode', $row->kode)));

        // Cek duplikat kode (kecuali dirinya sendiri)
        $dup = DB::selectOne(
            "SELECT id FROM organizations WHERE kode = ? AND id != ? AND deleted_at IS NULL",
            [$kode, $id]
        );
        if ($dup) return response()->json(['message' => 'Kode organisasi sudah digunakan'], 422);

        // Jangan izinkan parent = dirinya sendiri atau membentuk circular
        $parentId = $request->input('parent_id') ?: null;
        if ($parentId == $id) {
            return response()->json(['message' => 'Parent tidak boleh dirinya sendiri'], 422);
        }

        DB::table('organizations')->where('id', $id)->update([
            'kode'       => $kode,
            'nama'       => trim($request->input('nama', $row->nama)),
            'parent_id'  => $parentId,
            'head'       => trim($request->input('head', $row->head ?? '')) ?: null,
            'is_active'  => (int)$request->input('is_active', $row->is_active),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Data berhasil diperbarui']);
    }

    // ─── DELETE /v1/master/organizations/{id} (soft delete) ─────────────────
    public function destroy(int $id): \Illuminate\Http\JsonResponse
    {
        $row = DB::selectOne(
            "SELECT id FROM organizations WHERE id = ? AND deleted_at IS NULL", [$id]
        );
        if (!$row) return response()->json(['message' => 'Data tidak ditemukan'], 404);

        // Cek apakah punya anak
        $children = DB::selectOne(
            "SELECT COUNT(*) AS cnt FROM organizations WHERE parent_id = ? AND deleted_at IS NULL",
            [$id]
        );
        if ($children->cnt > 0) {
            return response()->json([
                'message' => 'Tidak dapat dihapus — organisasi ini masih memiliki sub-organisasi'
            ], 422);
        }

        DB::table('organizations')->where('id', $id)->update(['deleted_at' => now()]);
        return response()->json(['message' => 'Organisasi berhasil dihapus']);
    }

    // ─── GET /v1/master/organizations/dropdown ───────────────────────────────
    // Untuk kebutuhan dropdown pilih parent (tanpa soft-deleted)
    public function dropdown(): \Illuminate\Http\JsonResponse
    {
        $rows = DB::select(
            "SELECT id, kode, nama FROM organizations
             WHERE deleted_at IS NULL AND is_active = 1
             ORDER BY kode"
        );
        return response()->json(array_map(fn($r) => [
            'id'   => $r->id,
            'kode' => $r->kode,
            'nama' => $r->nama,
        ], $rows));
    }
}
