<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PipelineController extends Controller
{
    // ── Helper: ambil auth_user dari request ─────────────────────────────
    private function authUser(Request $request): array
    {
        return $request->attributes->get('auth_user', []);
    }

    // ── GET /v1/pipeline ─────────────────────────────────────────────────
    public function index(Request $request)
    {
        $auth       = $this->authUser($request);
        $q          = $request->query('q', '') ?: $request->query('search', '');
        $stage      = $request->query('stage', '');
        $sales      = $request->query('sales', '');
        $segmen     = $request->query('segmen', '');
        $organisasi = $request->query('organisasi', '');
        $product    = $request->query('product', '');
        $page       = max(1, (int) $request->query('page', 1));
        $perPage    = min(200, max(1, (int) $request->query('per_page', $request->query('limit', 25))));
        $offset     = ($page - 1) * $perPage;

        $where  = ['1=1'];
        $params = [];

        // ── RBAC: Sales hanya bisa lihat leads miliknya sendiri ──────────
        if ($auth['is_sales_only'] ?? false) {
            $where[]  = 'sales_owner = ?';
            $params[] = $auth['nama'];
        } elseif ($sales) {
            // Manager/Admin bisa filter by sales tertentu
            $where[]  = 'sales_owner = ?';
            $params[] = $sales;
        }

        if ($stage) {
            $where[]  = 'stage = ?';
            $params[] = $stage;
        }
        if ($segmen) {
            $where[]  = 'segmen = ?';
            $params[] = $segmen;
        }
        if ($organisasi) {
            $where[]  = 'organisasi = ?';
            $params[] = $organisasi;
        }
        if ($product) {
            $where[]  = 'product = ?';
            $params[] = $product;
        }
        if ($q) {
            $where[]  = '(nama_company ILIKE ? OR product ILIKE ? OR contact_person ILIKE ?)';
            $params[] = "%$q%";
            $params[] = "%$q%";
            $params[] = "%$q%";
        }

        $whereStr = implode(' AND ', $where);

        $rows = DB::select(
            "SELECT * FROM leads WHERE $whereStr ORDER BY updated_at DESC LIMIT ? OFFSET ?",
            array_merge($params, [$perPage, $offset])
        );

        $total = (int) DB::selectOne(
            "SELECT COUNT(*) as n FROM leads WHERE $whereStr",
            $params
        )->n;

        // Daftar sales untuk filter dropdown (Manager/Admin: semua, Sales: hanya dirinya)
        $salesList = [];
        if (!($auth['is_sales_only'] ?? false)) {
            $salesRows = DB::select(
                "SELECT DISTINCT sales_owner FROM leads WHERE sales_owner IS NOT NULL AND sales_owner != '' ORDER BY sales_owner"
            );
            $salesList = array_column($salesRows, 'sales_owner');
        }

        return response()->json([
            'total'       => $total,
            'page'        => $page,
            'per_page'    => $perPage,
            'total_pages' => max(1, (int) ceil($total / $perPage)),
            'leads'       => array_map(fn($r) => $this->normLead((array) $r), $rows),
            'sales_list'  => $salesList,
        ]);
    }

    // ── GET /v1/pipeline/{leadId} ─────────────────────────────────────────
    public function show(Request $request, string $leadId)
    {
        $auth = $this->authUser($request);
        $lead = DB::selectOne("SELECT * FROM leads WHERE lead_id = ?", [$leadId]);

        if (!$lead) {
            return response()->json(['detail' => 'Lead tidak ditemukan.'], 404);
        }

        // RBAC: Sales hanya bisa lihat lead miliknya
        if (($auth['is_sales_only'] ?? false) &&
            strtolower(trim($lead->sales_owner ?? '')) !== strtolower(trim($auth['nama'] ?? ''))) {
            return response()->json(['detail' => 'Anda tidak memiliki akses ke lead ini.'], 403);
        }

        $contacts = DB::select(
            "SELECT * FROM contacts WHERE lead_id = ? ORDER BY id",
            [$leadId]
        );

        $fuLogs = DB::select(
            "SELECT * FROM follow_up_log WHERE lead_id = ? ORDER BY tgl_fu DESC",
            [$leadId]
        );

        return response()->json([
            'lead'          => $this->normLead((array) $lead),
            'contacts'      => array_map(fn($c) => (array) $c, $contacts),
            'fu_logs'       => array_map(fn($f) => (array) $f, $fuLogs),
            'follow_up_log' => array_map(fn($f) => (array) $f, $fuLogs),
        ]);
    }

    // ── POST /v1/pipeline ─────────────────────────────────────────────────
    public function store(Request $request)
    {
        $auth = $this->authUser($request);
        $d    = $request->all();

        // Sales: sales_owner otomatis diisi dengan namanya sendiri
        if ($auth['is_sales_only'] ?? false) {
            $d['sales_owner'] = $auth['nama'];
        }

        // Generate lead_id
        $last    = DB::selectOne("SELECT lead_id FROM leads ORDER BY id DESC LIMIT 1");
        $nextNum = 1;
        if ($last) {
            preg_match('/(\d+)$/', $last->lead_id, $m);
            $nextNum = ((int) ($m[1] ?? 0)) + 1;
        }
        $leadId = 'LD-' . str_pad($nextNum, 4, '0', STR_PAD_LEFT);

        DB::insert(
            "INSERT INTO leads (lead_id, nama_company, contact_person, phone, email,
                segmen, sub_segmen, source, stage, prioritas, tgl_masuk, propose_value,
                deal_value, probability, exp_close_date, sales_owner, organisasi, product,
                last_fu_notes, created_at, updated_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())",
            [
                $leadId,
                $d['nama_company']   ?? $d['company']      ?? '',
                $d['contact_person'] ?? $d['pic']           ?? '',
                $d['phone']          ?? null,
                $d['email']          ?? null,
                $d['segmen']         ?? '',
                $d['sub_segmen']     ?? '',
                $d['source']         ?? '',
                $d['stage']          ?? 'New',
                $d['prioritas']      ?? $d['priority']      ?? 'Warm',
                $d['tgl_masuk']      ?? now()->toDateString(),
                $d['propose_value']  ?? $d['nilai_project'] ?? 0,
                $d['deal_value']     ?? 0,
                $d['probability']    ?? 0,
                $d['exp_close_date'] ?? $d['target_close']  ?? null,
                $d['sales_owner']    ?? '',
                $d['organisasi']     ?? null,
                $d['product']        ?? null,
                $d['last_fu_notes']  ?? $d['notes']         ?? '',
            ]
        );

        return response()->json(['message' => 'Lead berhasil dibuat.', 'lead_id' => $leadId], 201);
    }

    // ── PUT /v1/pipeline/{leadId} ─────────────────────────────────────────
    public function update(Request $request, string $leadId)
    {
        $auth = $this->authUser($request);
        $lead = DB::selectOne("SELECT lead_id, sales_owner FROM leads WHERE lead_id=?", [$leadId]);

        if (!$lead) {
            return response()->json(['detail' => 'Lead tidak ditemukan.'], 404);
        }

        // RBAC: Sales hanya bisa edit lead miliknya
        if (($auth['is_sales_only'] ?? false) &&
            strtolower(trim($lead->sales_owner ?? '')) !== strtolower(trim($auth['nama'] ?? ''))) {
            return response()->json(['detail' => 'Anda tidak memiliki akses untuk mengubah lead ini.'], 403);
        }

        $d      = $request->all();
        $fields = [
            'nama_company','contact_person','phone','email','segmen','sub_segmen','source',
            'stage','prioritas','tgl_masuk','propose_value','deal_value',
            'probability','exp_close_date','sales_owner','organisasi','last_fu_notes',
            'next_fu_date','last_fu_date','weighted_value','product','remarks','loss_reason',
        ];

        // Sales tidak boleh mengubah sales_owner
        if ($auth['is_sales_only'] ?? false) {
            $fields = array_diff($fields, ['sales_owner']);
        }

        $sets   = [];
        $params = [];
        foreach ($fields as $f) {
            if (array_key_exists($f, $d)) {
                $sets[]   = "$f = ?";
                $params[] = $d[$f];
            }
        }

        if (empty($sets)) {
            return response()->json(['detail' => 'Tidak ada field yang diubah.'], 422);
        }

        $sets[]   = "updated_at = NOW()";
        $params[] = $leadId;

        DB::update("UPDATE leads SET " . implode(', ', $sets) . " WHERE lead_id = ?", $params);

        return response()->json(['message' => 'Lead berhasil diupdate.', 'lead_id' => $leadId]);
    }

    // ── DELETE /v1/pipeline/{leadId} ─────────────────────────────────────
    public function destroy(Request $request, string $leadId)
    {
        $auth = $this->authUser($request);

        // RBAC: Sales tidak boleh menghapus lead
        if ($auth['is_sales_only'] ?? false) {
            return response()->json(['detail' => 'Sales tidak memiliki izin untuk menghapus lead.'], 403);
        }

        $lead = DB::selectOne("SELECT lead_id FROM leads WHERE lead_id=?", [$leadId]);
        if (!$lead) {
            return response()->json(['detail' => 'Lead tidak ditemukan.'], 404);
        }

        DB::delete("DELETE FROM follow_up_log WHERE lead_id = ?", [$leadId]);
        DB::delete("DELETE FROM contacts WHERE lead_id = ?", [$leadId]);
        DB::delete("DELETE FROM win_loss WHERE lead_id = ?", [$leadId]);
        DB::delete("DELETE FROM leads WHERE lead_id = ?", [$leadId]);

        return response()->json(['message' => 'Lead berhasil dihapus.', 'lead_id' => $leadId]);
    }

    // ── Private: normalisasi tipe numerik ────────────────────────────────
    private function normLead(array $r): array
    {
        foreach (['propose_value', 'deal_value', 'probability', 'weighted_value'] as $k) {
            if (isset($r[$k])) $r[$k] = (float) $r[$k];
        }
        return $r;
    }
}
