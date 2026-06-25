<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * NotificationController
 *
 * RBAC:
 *   GET    /v1/notifications             → semua role (notif milik sendiri)
 *   POST   /v1/notifications/{id}/read   → semua role (tandai 1 notif)
 *   POST   /v1/notifications/read-all    → semua role (tandai semua)
 *   POST   /v1/notifications/push        → Manager & Admin saja (kirim notif ke sales)
 *   GET    /v1/notifications/unread-count→ semua role
 */
class NotificationController extends Controller
{
    private function authUser(Request $request): array
    {
        return $request->attributes->get('auth_user', []);
    }

    // ── GET /v1/notifications ─────────────────────────────────────────────
    public function index(Request $request)
    {
        $auth   = $this->authUser($request);
        $type   = $request->query('type');    // overdue | reminder | stale | comment | closing | info
        $unread = $request->query('unread');  // '1' = hanya yang belum dibaca
        $limit  = (int) $request->query('limit', 30);
        $offset = (int) $request->query('offset', 0);

        $where  = ['n.user_id = ?'];
        $params = [$auth['id']];

        if ($type) {
            $where[]  = 'n.type = ?';
            $params[] = $type;
        }
        if ($unread === '1') {
            $where[] = 'n.read_at IS NULL';
        }

        $whereStr = implode(' AND ', $where);

        // Ambil data + total + unread_count dalam satu query menggunakan window function
        $rows = DB::select("
            SELECT n.id, n.type, n.title, n.body,
                   n.lead_id, l.nama_company AS lead_nama,
                   n.claim_id,
                   ec.claim_no, ec.status AS claim_status,
                   n.sender_id, u.nama AS sender_nama,
                   n.read_at, n.created_at,
                   COUNT(*) OVER() AS _total,
                   COUNT(*) FILTER (WHERE n.read_at IS NULL) OVER() AS _unread
            FROM notifications n
            LEFT JOIN leads l              ON l.lead_id = n.lead_id
            LEFT JOIN entertainment_claims ec ON ec.id  = n.claim_id
            LEFT JOIN users u              ON u.id      = n.sender_id
            WHERE $whereStr
            ORDER BY n.created_at DESC
            LIMIT ? OFFSET ?
        ", array_merge($params, [$limit, $offset]));

        $total       = (int) ($rows[0]->_total  ?? 0);
        $unreadCount = (int) ($rows[0]->_unread ?? 0);

        return response()->json([
            'total'        => $total,
            'unread_count' => $unreadCount,
            'notifications'=> array_map(function ($r) {
                $arr = (array) $r;
                unset($arr['_total'], $arr['_unread']);
                return $arr;
            }, $rows),
        ]);
    }

    // ── GET /v1/notifications/unread-count ────────────────────────────────
    public function unreadCount(Request $request)
    {
        $auth = $this->authUser($request);

        $count = (int) DB::selectOne(
            "SELECT COUNT(*) AS c FROM notifications WHERE user_id = ? AND read_at IS NULL",
            [$auth['id']]
        )->c;

        return response()->json(['unread_count' => $count]);
    }

    // ── POST /v1/notifications/{id}/read ─────────────────────────────────
    public function markRead(Request $request, int $id)
    {
        $auth = $this->authUser($request);

        $notif = DB::selectOne(
            "SELECT id, user_id FROM notifications WHERE id = ?", [$id]
        );

        if (!$notif) {
            return response()->json(['detail' => 'Notifikasi tidak ditemukan.'], 404);
        }
        if ($notif->user_id !== $auth['id']) {
            return response()->json(['detail' => 'Bukan notifikasi Anda.'], 403);
        }

        DB::update(
            "UPDATE notifications SET read_at = NOW() WHERE id = ? AND read_at IS NULL",
            [$id]
        );

        return response()->json(['message' => 'Notifikasi ditandai sudah dibaca.']);
    }

    // ── POST /v1/notifications/read-all ──────────────────────────────────
    public function markAllRead(Request $request)
    {
        $auth = $this->authUser($request);

        $count = DB::update(
            "UPDATE notifications SET read_at = NOW() WHERE user_id = ? AND read_at IS NULL",
            [$auth['id']]
        );

        return response()->json(['message' => "$count notifikasi ditandai sudah dibaca."]);
    }

    // ── POST /v1/notifications/push ───────────────────────────────────────
    // Manager/Admin kirim notifikasi manual ke satu atau banyak sales
    public function push(Request $request)
    {
        $auth = $this->authUser($request);

        // RBAC: hanya Manager & Admin
        if ($auth['is_sales_only'] ?? false) {
            return response()->json(['detail' => 'Hanya Manager dan Admin yang dapat mengirim notifikasi.'], 403);
        }

        $request->validate([
            'user_ids'  => 'required|array|min:1',
            'user_ids.*'=> 'integer',
            'title'     => 'required|string|max:255',
            'body'      => 'required|string',
            'type'      => 'nullable|string|in:comment,info,warning,approval',
            'lead_id'   => 'nullable|string',
        ]);

        $userIds  = $request->input('user_ids');
        $title    = $request->input('title');
        $body     = $request->input('body');
        $type     = $request->input('type', 'comment');
        $leadId   = $request->input('lead_id');
        $now      = now();
        $inserted = 0;

        foreach ($userIds as $uid) {
            // Validasi user exist
            $user = DB::selectOne("SELECT id FROM users WHERE id = ? AND is_active = 1", [$uid]);
            if (!$user) continue;

            DB::table('notifications')->insert([
                'user_id'    => $uid,
                'sender_id'  => $auth['id'],
                'type'       => $type,
                'title'      => $title,
                'body'       => $body,
                'lead_id'    => $leadId,
                'read_at'    => null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            $inserted++;
        }

        return response()->json([
            'message'  => "Notifikasi berhasil dikirim ke $inserted user.",
            'sent_to'  => $inserted,
        ], 201);
    }

    // ── Sistem: buat notif otomatis (dipanggil dari controller lain) ──────
    public static function createSystemNotif(
        int    $userId,
        string $type,
        string $title,
        string $body,
        ?string $leadId  = null,
        ?int    $claimId = null
    ): void {
        DB::table('notifications')->insert([
            'user_id'    => $userId,
            'sender_id'  => null,
            'type'       => $type,
            'title'      => $title,
            'body'       => $body,
            'lead_id'    => $leadId,
            'claim_id'   => $claimId,
            'read_at'    => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
