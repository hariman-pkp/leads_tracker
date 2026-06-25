<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    // GET /api/v1/master/products
    public function index()
    {
        $rows = DB::select("
            SELECT id, kode, nama, kategori, deskripsi, is_active, created_at
            FROM products
            ORDER BY nama ASC
        ");
        return response()->json(array_map(fn($r) => (array)$r, $rows));
    }

    // GET /api/v1/master/products/dropdown
    // Hanya yang aktif, untuk digunakan di form select
    public function dropdown()
    {
        $rows = DB::select("
            SELECT kode, nama, kategori
            FROM products
            WHERE is_active = true
            ORDER BY nama ASC
        ");
        return response()->json(array_map(fn($r) => (array)$r, $rows));
    }

    // POST /api/v1/master/products
    public function store(Request $request)
    {
        $request->validate([
            'kode' => 'required|string|max:20',
            'nama' => 'required|string|max:255',
        ]);

        $kode = strtoupper(trim($request->input('kode')));

        $exists = DB::selectOne("SELECT id FROM products WHERE kode = ?", [$kode]);
        if ($exists) {
            return response()->json(['message' => "Kode '$kode' sudah digunakan."], 422);
        }

        $id = DB::table('products')->insertGetId([
            'kode'       => $kode,
            'nama'       => trim($request->input('nama')),
            'kategori'   => trim($request->input('kategori', '')) ?: null,
            'deskripsi'  => trim($request->input('deskripsi', '')) ?: null,
            'is_active'  => $request->boolean('is_active', true),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Produk berhasil ditambahkan.', 'id' => $id], 201);
    }

    // PUT /api/v1/master/products/{id}
    public function update(Request $request, int $id)
    {
        $request->validate([
            'kode' => 'required|string|max:20',
            'nama' => 'required|string|max:255',
        ]);

        $kode = strtoupper(trim($request->input('kode')));

        $exists = DB::selectOne("SELECT id FROM products WHERE kode = ? AND id != ?", [$kode, $id]);
        if ($exists) {
            return response()->json(['message' => "Kode '$kode' sudah digunakan produk lain."], 422);
        }

        DB::table('products')->where('id', $id)->update([
            'kode'       => $kode,
            'nama'       => trim($request->input('nama')),
            'kategori'   => trim($request->input('kategori', '')) ?: null,
            'deskripsi'  => trim($request->input('deskripsi', '')) ?: null,
            'is_active'  => $request->boolean('is_active', true),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Produk berhasil diperbarui.']);
    }

    // DELETE /api/v1/master/products/{id}
    public function destroy(int $id)
    {
        // Cek apakah dipakai di leads / revenue_projects / invoices
        $usedIn = [];
        $cntLeads = DB::selectOne(
            "SELECT COUNT(*) as c FROM leads l JOIN products p ON p.nama = l.product WHERE p.id = ?", [$id]
        );
        if ((int)$cntLeads->c > 0) $usedIn[] = "leads ({$cntLeads->c} data)";

        $cntRev = DB::selectOne(
            "SELECT COUNT(*) as c FROM revenue_projects rp JOIN products p ON p.nama = rp.product WHERE p.id = ? AND rp.deleted_at IS NULL", [$id]
        );
        if ((int)$cntRev->c > 0) $usedIn[] = "revenue project ({$cntRev->c} data)";

        $cntInv = DB::selectOne(
            "SELECT COUNT(*) as c FROM invoices i JOIN products p ON p.nama = i.product WHERE p.id = ?", [$id]
        );
        if ((int)$cntInv->c > 0) $usedIn[] = "invoice ({$cntInv->c} data)";

        if (!empty($usedIn)) {
            return response()->json([
                'message' => 'Produk tidak dapat dihapus karena sedang digunakan di: ' . implode(', ', $usedIn) . '.',
            ], 422);
        }

        DB::table('products')->where('id', $id)->delete();

        return response()->json(['message' => 'Produk berhasil dihapus.']);
    }
}
