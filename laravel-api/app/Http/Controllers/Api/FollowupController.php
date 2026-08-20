<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FollowupController extends Controller
{
    public function store(Request $request)
    {
        $d      = $request->all();
        $auth   = $request->attributes->get('auth_user', []);
        $leadId = $d['lead_id'] ?? null;

        if (!$leadId) {
            return response()->json(['detail' => 'lead_id wajib diisi.'], 400);
        }

        $lead = DB::selectOne("SELECT lead_id, nama_company, sales_owner FROM leads WHERE lead_id=?", [$leadId]);
        if (!$lead) {
            return response()->json(['detail' => 'Lead tidak ditemukan.'], 404);
        }

        // Generate fu_id
        $last    = DB::selectOne("SELECT fu_id FROM follow_up_log ORDER BY id DESC LIMIT 1");
        $nextNum = 1;
        if ($last) {
            preg_match('/(\d+)$/', $last->fu_id, $m);
            $nextNum = ((int)($m[1] ?? 0)) + 1;
        }
        $fuId = 'FU-' . str_pad($nextNum, 5, '0', STR_PAD_LEFT);

        // Gunakan sales_owner dari request → lead → auth user (JWT)
        $salesOwner = $d['sales_owner']
            ?? (($lead->sales_owner !== '' && $lead->sales_owner !== null) ? $lead->sales_owner : null)
            ?? $auth['nama']
            ?? '';

        DB::insert(
            "INSERT INTO follow_up_log (fu_id, lead_id, tgl_fu, nama_company, sales_owner,
                metode_fu, kontak, hasil_fu, catatan_fu, stage_saat_fu,
                next_action, tgl_fu_berikut, status, created_at)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,'Done',NOW())",
            [
                $fuId,
                $leadId,
                $d['tgl_fu'] ?? $d['fu_date'] ?? now()->toDateString(),
                $lead->nama_company,
                $salesOwner,
                $d['metode_fu'] ?? $d['fu_type'] ?? 'Call',
                $d['kontak'] ?? '',
                $d['hasil_fu'] ?? $d['summary'] ?? '',
                $d['catatan_fu'] ?? '',
                $d['stage_saat_fu'] ?? '',
                $d['next_action'] ?? '',
                $d['tgl_fu_berikut'] ?? $d['next_date'] ?? null,
            ]
        );

        // Update lead last_fu_date, next_fu_date, next_fu_type
        $nextFuType = $d['next_fu_type'] ?? 'call';
        DB::update(
            "UPDATE leads SET last_fu_date=?, next_fu_date=?, next_fu_type=?, last_fu_notes=?, updated_at=NOW() WHERE lead_id=?",
            [
                $d['tgl_fu'] ?? $d['fu_date'] ?? now()->toDateString(),
                $d['tgl_fu_berikut'] ?? $d['next_date'] ?? null,
                $nextFuType,
                $d['hasil_fu'] ?? $d['summary'] ?? null,
                $leadId,
            ]
        );

        return response()->json(['message' => 'Follow-up berhasil disimpan.', 'fu_id' => $fuId], 201);
    }

    // GET /v1/followup
    public function index(Request $request)
    {
        $auth      = $request->attributes->get('auth_user', []);
        $isSales   = $auth['is_sales_only'] ?? false;
        $authNama  = $auth['nama'] ?? '';

        $page      = max(1, (int) $request->query('page', 1));
        $perPage   = min(100, max(10, (int) $request->query('per_page', 25)));
        $offset    = ($page - 1) * $perPage;
        $search    = trim($request->query('search', ''));
        $leadId    = trim($request->query('lead_id', ''));
        $dateFrom  = $request->query('date_from', '');
        $dateTo    = $request->query('date_to', '');
        $salesOwner = $request->query('sales_owner', '');

        $where  = ['1=1'];
        $params = [];

        // Sales hanya lihat FU miliknya
        if ($isSales) {
            $where[]  = 'f.sales_owner = ?';
            $params[] = $authNama;
        } elseif ($salesOwner !== '') {
            $where[]  = 'f.sales_owner = ?';
            $params[] = $salesOwner;
        }

        if ($leadId !== '') {
            $where[]  = 'f.lead_id = ?';
            $params[] = $leadId;
        }

        if ($dateFrom !== '') {
            $where[]  = 'f.tgl_fu >= ?';
            $params[] = $dateFrom;
        }

        if ($dateTo !== '') {
            $where[]  = 'f.tgl_fu <= ?';
            $params[] = $dateTo;
        }

        if ($search !== '') {
            $where[]  = '(f.nama_company ILIKE ? OR f.catatan_fu ILIKE ? OR f.sales_owner ILIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $whereStr = implode(' AND ', $where);

        $total = DB::selectOne(
            "SELECT COUNT(*) as cnt FROM follow_up_log f WHERE $whereStr",
            $params
        )->cnt;

        $rows = DB::select("
            SELECT f.fu_id, f.lead_id, f.nama_company, f.sales_owner,
                   f.tgl_fu, f.metode_fu, f.hasil_fu, f.catatan_fu,
                   f.next_action, f.tgl_fu_berikut, f.status, f.stage_saat_fu,
                   l.stage, l.prioritas, l.contact_person, l.next_fu_type
            FROM follow_up_log f
            LEFT JOIN leads l ON l.lead_id = f.lead_id
            WHERE $whereStr
            ORDER BY f.tgl_fu DESC, f.id DESC
            LIMIT ? OFFSET ?
        ", array_merge($params, [$perPage, $offset]));

        // by_date untuk kalender overlay
        $byDate = [];
        foreach ($rows as $r) {
            $key = $r->tgl_fu ?? 'unknown';
            $byDate[$key][] = (array)$r;
        }

        return response()->json([
            'total'       => (int)$total,
            'page'        => $page,
            'per_page'    => $perPage,
            'total_pages' => (int)ceil($total / $perPage),
            'logs'        => array_map(fn($r) => (array)$r, $rows),
            'by_date'     => $byDate,
        ]);
    }

    public function show(string $leadId)
    {
        $logs = DB::select(
            "SELECT * FROM follow_up_log WHERE lead_id = ? ORDER BY tgl_fu DESC",
            [$leadId]
        );

        return response()->json([
            'lead_id' => $leadId,
            'total'   => count($logs),
            'logs'    => array_map(fn($r) => (array)$r, $logs),
        ]);
    }
}
