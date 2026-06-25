<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Api\NotificationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class EntertainController extends Controller
{
    // ── List klaim ──────────────────────────────────────────────────────────
    public function index(Request $request)
    {
        $user   = $request->attributes->get('auth_user');
        $roleId = (int)($user['role_id'] ?? 3);
        $userId = (int)($user['id'] ?? 0);
        $yr     = (int)$request->query('tahun', now()->year);
        $bulan  = (int)$request->query('bulan', 0);
        $status = $request->query('status', '');

        $wheres = ['1=1'];
        $params = [];

        if ($roleId == 3) {
            $wheres[] = 'ec.user_id = ?'; $params[] = $userId;
        } elseif ($request->query('user_id')) {
            $wheres[] = 'ec.user_id = ?'; $params[] = (int)$request->query('user_id');
        }

        if ($status) { $wheres[] = 'ec.status = ?'; $params[] = $status; }
        if ($bulan)  { $wheres[] = 'EXTRACT(MONTH FROM ec.tgl_klaim) = ?'; $params[] = $bulan; }
        $wheres[] = 'EXTRACT(YEAR FROM ec.tgl_klaim) = ?'; $params[] = $yr;

        $where    = implode(' AND ', $wheres);
        $perPage  = max(1, (int)$request->query('per_page', 500));
        $page     = max(1, (int)$request->query('page', 1));
        $offset   = ($page - 1) * $perPage;

        $total = DB::selectOne("
            SELECT COUNT(*) as n
            FROM entertainment_claims ec
            JOIN users u ON u.id = ec.user_id
            LEFT JOIN leads l ON l.lead_id = ec.lead_id
            WHERE {$where}
        ", $params)->n;

        $claims = DB::select("
            SELECT ec.*, u.nama AS sales_nama, l.nama_company AS lead_nama
            FROM entertainment_claims ec
            JOIN users u ON u.id = ec.user_id
            LEFT JOIN leads l ON l.lead_id = ec.lead_id
            WHERE {$where}
            ORDER BY ec.submitted_at DESC
            LIMIT ? OFFSET ?
        ", array_merge($params, [$perPage, $offset]));

        // Summary — selalu berdasarkan user filter (tanpa pagination)
        $summaryWheres = ['EXTRACT(YEAR FROM tgl_klaim) = ?'];
        $summaryParams = [$yr];
        if ($roleId == 3) { $summaryWheres[] = 'user_id = ?'; $summaryParams[] = $userId; }
        elseif ($request->query('user_id')) { $summaryWheres[] = 'user_id = ?'; $summaryParams[] = (int)$request->query('user_id'); }
        if ($bulan) { $summaryWheres[] = 'EXTRACT(MONTH FROM tgl_klaim) = ?'; $summaryParams[] = $bulan; }
        $summaryWhere = implode(' AND ', $summaryWheres);

        $summary = DB::selectOne("
            SELECT COALESCE(SUM(jumlah),0)                               AS total_bulan,
                   COALESCE(SUM(CASE WHEN status='Approved' THEN jumlah ELSE 0 END),0) AS total_amount,
                   COUNT(*) FILTER (WHERE status='Pending')              AS pending,
                   COUNT(*) FILTER (WHERE status='Approved')             AS approved,
                   COUNT(*) FILTER (WHERE status='Rejected')             AS rejected,
                   COUNT(*)                                               AS pending_total
            FROM entertainment_claims
            WHERE {$summaryWhere}
        ", $summaryParams);

        // Limit
        if ($roleId == 3) {
            $u = DB::selectOne("SELECT entertain_limit FROM users WHERE id = ?", [$userId]);
            $limit = (float)($u->entertain_limit ?? 0);
        } else {
            $s = DB::selectOne("SELECT limit_per_bulan FROM entertainment_settings LIMIT 1");
            $limit = (float)($s->limit_per_bulan ?? 0);
        }

        return response()->json([
            'claims'          => array_map(fn($r) => $this->castClaim((array)$r), $claims),
            'summary'         => $this->castSummary((array)$summary),
            'limit_per_bulan' => $limit,
            'total'           => (int)$total,
            'page'            => $page,
            'per_page'        => $perPage,
        ]);
    }

    // ── Detail klaim ─────────────────────────────────────────────────────────
    public function show(Request $request, int $cid)
    {
        $user   = $request->attributes->get('auth_user');
        $roleId = (int)($user['role_id'] ?? 3);
        $userId = (int)($user['id'] ?? 0);

        $claim = DB::selectOne("
            SELECT ec.*, u.nama AS sales_nama, l.nama_company AS lead_nama
            FROM entertainment_claims ec
            JOIN users u ON u.id = ec.user_id
            LEFT JOIN leads l ON l.lead_id = ec.lead_id
            WHERE ec.id = ?
        ", [$cid]);

        if (!$claim) return response()->json(['message' => 'Klaim tidak ditemukan.'], 404);
        if ($roleId == 3 && (int)$claim->user_id !== $userId) {
            return response()->json(['message' => 'Akses ditolak.'], 403);
        }

        $approvals = DB::select("
            SELECT ea.*, u.nama AS approver_nama
            FROM entertainment_approvals ea
            JOIN users u ON u.id = ea.approver_id
            WHERE ea.claim_id = ? ORDER BY ea.created_at DESC
        ", [$cid]);

        return response()->json([
            'claim'     => $this->castClaim((array)$claim),
            'approvals' => array_map(fn($r) => (array)$r, $approvals),
        ]);
    }

    // ── Buat klaim baru ──────────────────────────────────────────────────────
    public function store(Request $request)
    {
        $user   = $request->attributes->get('auth_user');
        $userId = (int)($user['id'] ?? 0);

        $data = $request->validate([
            'lead_id'    => 'nullable|string',
            'tgl_klaim'  => 'required|date',
            'nama_klien' => 'required|string',
            'lokasi'     => 'nullable|string',
            'lat'        => 'nullable|numeric',
            'lng'        => 'nullable|numeric',
            'jumlah'     => 'required|numeric|min:0',
            'keterangan' => 'nullable|string',
        ]);

        $tgl  = \Carbon\Carbon::parse($data['tgl_klaim']);
        $yr   = $tgl->year;
        $mo   = $tgl->month;

        // Cek limit
        $totalRow = DB::selectOne("
            SELECT COALESCE(SUM(jumlah),0) AS total FROM entertainment_claims
            WHERE user_id=? AND status='Approved'
              AND EXTRACT(YEAR FROM tgl_klaim)=? AND EXTRACT(MONTH FROM tgl_klaim)=?
        ", [$userId, $yr, $mo]);
        $totalApproved = (float)($totalRow->total ?? 0);

        $uRow  = DB::selectOne("SELECT entertain_limit FROM users WHERE id=?", [$userId]);
        $limit = (float)($uRow->entertain_limit ?? 0);
        if (!$limit) {
            $sRow  = DB::selectOne("SELECT limit_per_bulan FROM entertainment_settings LIMIT 1");
            $limit = (float)($sRow->limit_per_bulan ?? 0);
        }
        $limitWarning = $limit > 0 && ($totalApproved + (float)$data['jumlah']) > $limit;

        $claimNo = $this->nextClaimNo();

        $result = DB::selectOne("
            INSERT INTO entertainment_claims
              (claim_no, user_id, lead_id, tgl_klaim, nama_klien, lokasi,
               lat, lng, jumlah, keterangan, status, limit_warning)
            VALUES (?,?,?,?,?,?,?,?,?,?,'Pending',?) RETURNING id
        ", [
            $claimNo, $userId,
            $data['lead_id'] ?? null,
            $data['tgl_klaim'],
            $data['nama_klien'],
            $data['lokasi'] ?? '',
            $data['lat'] ?? null,
            $data['lng'] ?? null,
            $data['jumlah'],
            $data['keterangan'] ?? '',
            $limitWarning ? 1 : 0,
        ]);

        $newId = $result->id;

        // Kirim notif ke semua Manager (role_id=2) dan Admin (role_id=1)
        $managers = DB::select(
            "SELECT id FROM users WHERE role_id IN (1,2) AND is_active = 1"
        );
        $salesNama = $user['nama'] ?? 'Sales';
        $warning   = $limitWarning ? ' ⚠ Melebihi limit.' : '';
        foreach ($managers as $m) {
            NotificationController::createSystemNotif(
                userId:  (int)$m->id,
                type:    'approval',
                title:   "📋 Klaim Baru dari $salesNama",
                body:    "Klaim {$claimNo} — {$data['nama_klien']}, Rp "
                         . number_format((float)$data['jumlah'], 0, ',', '.') . $warning,
                claimId: $newId,
            );
        }

        return response()->json([
            'id'            => $newId,
            'claim_no'      => $claimNo,
            'limit_warning' => $limitWarning,
            'message'       => 'Klaim berhasil disubmit.',
        ], 201);
    }

    // ── Upload foto bukti ────────────────────────────────────────────────────
    public function uploadPhoto(Request $request, int $cid)
    {
        $user   = $request->attributes->get('auth_user');
        $userId = (int)($user['id'] ?? 0);

        $request->validate(['photo' => 'required|image|max:5120']);

        $claim = DB::selectOne("SELECT user_id, status FROM entertainment_claims WHERE id=?", [$cid]);
        if (!$claim) return response()->json(['message' => 'Klaim tidak ditemukan.'], 404);
        if ((int)$claim->user_id !== $userId) return response()->json(['message' => 'Akses ditolak.'], 403);

        $file  = $request->file('photo');
        $fname = 'ent_' . $cid . '_' . time() . '.' . $file->getClientOriginalExtension();
        $file->move(public_path('uploads/entertain'), $fname);
        $photoUrl = 'uploads/entertain/' . $fname;

        DB::statement("UPDATE entertainment_claims SET foto_bukti=?, updated_at=NOW() WHERE id=?", [$photoUrl, $cid]);

        return response()->json(['foto_bukti' => $photoUrl, 'message' => 'Foto berhasil diupload.']);
    }

    // ── Batalkan klaim Pending ────────────────────────────────────────────────
    public function cancel(Request $request, int $cid)
    {
        $user   = $request->attributes->get('auth_user');
        $userId = (int)($user['id'] ?? 0);

        $claim = DB::selectOne("SELECT user_id, status FROM entertainment_claims WHERE id=?", [$cid]);
        if (!$claim) return response()->json(['message' => 'Klaim tidak ditemukan.'], 404);
        if ((int)$claim->user_id !== $userId) return response()->json(['message' => 'Akses ditolak.'], 403);
        if ($claim->status !== 'Pending') {
            return response()->json(['message' => 'Hanya klaim Pending yang dapat dibatalkan.'], 400);
        }

        DB::statement("UPDATE entertainment_claims SET status='Cancelled', updated_at=NOW() WHERE id=?", [$cid]);
        return response()->json(['message' => 'Klaim dibatalkan.']);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────
    // ── Approve / Reject klaim (Manager & Admin) ─────────────────────────────
    public function approve(Request $request, int $cid)
    {
        $user   = $request->attributes->get('auth_user');
        $roleId = (int)($user['role_id'] ?? 3);

        if ($roleId === 3) {
            return response()->json(['message' => 'Hanya Manager/Admin yang dapat approve.'], 403);
        }

        $data = $request->validate([
            'action'  => 'required|in:Approved,Rejected',
            'catatan' => 'nullable|string',
        ]);

        $claim = DB::selectOne("SELECT * FROM entertainment_claims WHERE id = ?", [$cid]);
        if (!$claim) return response()->json(['message' => 'Klaim tidak ditemukan.'], 404);
        if ($claim->status !== 'Pending') {
            return response()->json(['message' => 'Hanya klaim Pending yang dapat diproses.'], 400);
        }

        DB::statement(
            "INSERT INTO entertainment_approvals (claim_id, approver_id, action, catatan) VALUES (?,?,?,?)",
            [$cid, $user['id'], $data['action'], $data['catatan'] ?? '']
        );
        DB::statement(
            "UPDATE entertainment_claims SET status=?, updated_at=NOW() WHERE id=?",
            [$data['action'], $cid]
        );

        // Kirim notif ke Sales pemilik klaim
        $isApproved = $data['action'] === 'Approved';
        $emoji      = $isApproved ? '✅' : '❌';
        $catatan    = $data['catatan'] ? ' — ' . $data['catatan'] : '';
        NotificationController::createSystemNotif(
            userId:  (int)$claim->user_id,
            type:    'approval',
            title:   "$emoji Klaim {$claim->claim_no} {$data['action']}",
            body:    "Klaim entertainment Rp " . number_format((float)$claim->jumlah, 0, ',', '.')
                     . " untuk {$claim->nama_klien} telah {$data['action']}{$catatan}.",
            claimId: $cid,
        );

        return response()->json(['message' => "Klaim berhasil {$data['action']}."]);
    }

    // ── Serve static file dengan CORS ────────────────────────────────────────
    public function serveFile(string $path)
    {
        $fullPath = public_path($path);
        if (!file_exists($fullPath)) {
            return response()->json(['message' => 'File tidak ditemukan.'], 404);
        }
        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';
        return response()->file($fullPath, [
            'Content-Type'                => $mime,
            'Access-Control-Allow-Origin' => '*',
            'Cache-Control'               => 'public, max-age=86400',
        ]);
    }

    private function nextClaimNo(): string
    {
        $prefix = 'ENT-' . now()->format('Ym') . '-';
        $row    = DB::selectOne(
            "SELECT claim_no FROM entertainment_claims WHERE claim_no LIKE ? ORDER BY id DESC LIMIT 1",
            [$prefix . '%']
        );
        $seq = $row ? ((int)substr($row->claim_no, strrpos($row->claim_no, '-') + 1) + 1) : 1;
        return $prefix . str_pad($seq, 3, '0', STR_PAD_LEFT);
    }

    private function castClaim(array $r): array
    {
        return array_merge($r, [
            'id'            => (int)($r['id'] ?? 0),
            'user_id'       => (int)($r['user_id'] ?? 0),
            'jumlah'        => (float)($r['jumlah'] ?? 0),
            'lat'           => isset($r['lat']) ? (float)$r['lat'] : null,
            'lng'           => isset($r['lng']) ? (float)$r['lng'] : null,
            'limit_warning' => (bool)($r['limit_warning'] ?? false),
        ]);
    }

    private function castSummary(array $r): array
    {
        return [
            'total_bulan'   => (float)($r['total_bulan'] ?? 0),
            'total_amount'  => (float)($r['total_amount'] ?? 0),
            'pending'       => (int)($r['pending'] ?? 0),
            'approved'      => (int)($r['approved'] ?? 0),
            'rejected'      => (int)($r['rejected'] ?? 0),
            'pending_total' => (int)($r['pending_total'] ?? 0),
        ];
    }
}
