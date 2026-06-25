<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ContactsController extends Controller
{
    // ══════════════════════════════════════════════════════════════════
    // GET /api/v1/contacts
    // ══════════════════════════════════════════════════════════════════
    public function index(Request $request)
    {
        $q      = $request->query('q', '');
        $limit  = (int)$request->query('limit', 50);
        $offset = (int)$request->query('offset', 0);

        $auth      = $request->attributes->get('auth_user', []);
        $salesOnly = $auth['is_sales_only'] ?? false;
        $salesName = $auth['nama'] ?? null;

        $where  = ['c.deleted_at IS NULL'];
        $params = [];

        if ($salesOnly && $salesName) {
            $where[]  = '(l.sales_owner = ? OR c.lead_id IS NULL)';
            $params[] = $salesName;
        }

        if ($q) {
            $where[]  = '(c.nama_contact ILIKE ? OR c.email ILIKE ? OR c.nama_company ILIKE ? OR c.no_hp ILIKE ?)';
            $params[] = "%$q%";
            $params[] = "%$q%";
            $params[] = "%$q%";
            $params[] = "%$q%";
        }

        $whereStr = implode(' AND ', $where);

        $rows = DB::select(
            "SELECT c.*, l.stage, l.sales_owner
             FROM contacts c
             LEFT JOIN leads l ON c.lead_id = l.lead_id
             WHERE $whereStr
             ORDER BY c.nama_contact
             LIMIT ? OFFSET ?",
            array_merge($params, [$limit, $offset])
        );

        $total = DB::selectOne(
            "SELECT COUNT(*) as n FROM contacts c
             LEFT JOIN leads l ON c.lead_id=l.lead_id
             WHERE $whereStr",
            $params
        )->n;

        // Leads dropdown untuk form add/edit (filter by sales_owner untuk sales)
        $leadsQuery  = $salesOnly && $salesName
            ? "SELECT lead_id, nama_company FROM leads WHERE sales_owner = ? ORDER BY nama_company"
            : "SELECT lead_id, nama_company FROM leads ORDER BY nama_company";
        $leadsParams = $salesOnly && $salesName ? [$salesName] : [];
        $leads       = DB::select($leadsQuery, $leadsParams);

        return response()->json([
            'total'    => (int)$total,
            'contacts' => array_map(fn($r) => (array)$r, $rows),
            'leads'    => array_map(fn($r) => ['lead_id' => $r->lead_id, 'nama_company' => $r->nama_company], $leads),
        ]);
    }

    // ══════════════════════════════════════════════════════════════════
    // POST /api/v1/contacts
    // ══════════════════════════════════════════════════════════════════
    public function store(Request $request)
    {
        $allowed = ['lead_id','nama_company','nama_contact','jabatan','dept',
                    'role','no_hp','email','telepon','linkedin',
                    'preferensi_kontak','catatan'];
        $d = $request->only($allowed);

        if (empty($d['nama_contact'])) {
            return response()->json(['message' => 'Nama kontak wajib diisi.'], 422);
        }

        // Jika lead_id dipilih, sync nama_company dari lead
        if (!empty($d['lead_id'])) {
            $lead = DB::selectOne("SELECT nama_company FROM leads WHERE lead_id=?", [$d['lead_id']]);
            if ($lead && empty($d['nama_company'])) {
                $d['nama_company'] = $lead->nama_company;
            }
        }

        $d['created_at'] = now();
        $d['updated_at'] = now();

        $id = DB::table('contacts')->insertGetId($d);

        return response()->json(['message' => 'Kontak berhasil ditambahkan.', 'id' => $id], 201);
    }

    // ══════════════════════════════════════════════════════════════════
    // PUT /api/v1/contacts/{id}
    // ══════════════════════════════════════════════════════════════════
    public function update(Request $request, int $id)
    {
        $exists = DB::selectOne("SELECT id FROM contacts WHERE id=? AND deleted_at IS NULL", [$id]);
        if (!$exists) return response()->json(['message' => 'Kontak tidak ditemukan.'], 404);

        $allowed = ['lead_id','nama_company','nama_contact','jabatan','dept',
                    'role','no_hp','email','telepon','linkedin',
                    'preferensi_kontak','catatan'];
        $d = $request->only($allowed);

        // Jika lead_id dipilih, sync nama_company dari lead
        if (!empty($d['lead_id'])) {
            $lead = DB::selectOne("SELECT nama_company FROM leads WHERE lead_id=?", [$d['lead_id']]);
            if ($lead && empty($d['nama_company'])) {
                $d['nama_company'] = $lead->nama_company;
            }
        }

        $d['updated_at'] = now();

        DB::table('contacts')->where('id', $id)->update($d);

        return response()->json(['message' => 'Kontak berhasil diupdate.', 'id' => $id]);
    }

    // ══════════════════════════════════════════════════════════════════
    // DELETE /api/v1/contacts/{id}  — Soft delete
    // ══════════════════════════════════════════════════════════════════
    public function destroy(Request $request, int $id)
    {
        $exists = DB::selectOne("SELECT id FROM contacts WHERE id=? AND deleted_at IS NULL", [$id]);
        if (!$exists) return response()->json(['message' => 'Kontak tidak ditemukan.'], 404);

        DB::table('contacts')->where('id', $id)->update(['deleted_at' => now()]);

        return response()->json(['message' => 'Kontak berhasil dihapus.']);
    }

    // ══════════════════════════════════════════════════════════════════
    // POST /api/v1/contacts/{id}/restore  — Restore (Admin only)
    // ══════════════════════════════════════════════════════════════════
    public function restore(Request $request, int $id)
    {
        $authUser = $request->attributes->get('auth_user');
        if (!$authUser || (int)$authUser['role_id'] !== 1) {
            return response()->json(['message' => 'Akses ditolak. Hanya Admin.'], 403);
        }

        $exists = DB::selectOne("SELECT id FROM contacts WHERE id=? AND deleted_at IS NOT NULL", [$id]);
        if (!$exists) return response()->json(['message' => 'Kontak tidak ditemukan di recycle bin.'], 404);

        DB::table('contacts')->where('id', $id)->update(['deleted_at' => null, 'updated_at' => now()]);

        return response()->json(['message' => 'Kontak berhasil dipulihkan.']);
    }
}
