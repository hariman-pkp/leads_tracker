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

        // Update lead last_fu_date and next_fu_date
        DB::update(
            "UPDATE leads SET last_fu_date=?, next_fu_date=?, updated_at=NOW() WHERE lead_id=?",
            [
                $d['tgl_fu'] ?? $d['fu_date'] ?? now()->toDateString(),
                $d['tgl_fu_berikut'] ?? $d['next_date'] ?? null,
                $leadId,
            ]
        );

        return response()->json(['message' => 'Follow-up berhasil disimpan.', 'fu_id' => $fuId], 201);
    }

    // GET /v1/followup?today=1&limit=20&offset=0
    public function index(Request $request)
    {
        $auth    = $request->attributes->get('auth_user', []);
        $today   = $request->boolean('today');
        $limit   = (int) $request->query('limit', 50);
        $offset  = (int) $request->query('offset', 0);
        $search  = trim($request->query('search', ''));
        $leadId  = trim($request->query('lead_id', ''));

        $where  = ['1=1'];
        $params = [];

        // Sales hanya lihat FU miliknya
        if ($auth['is_sales_only'] ?? false) {
            $where[]  = 'f.sales_owner = ?';
            $params[] = $auth['nama'] ?? '';
        }

        if ($today) {
            $where[]  = 'f.tgl_fu_berikut = ?';
            $params[] = now()->toDateString();
        }

        if ($leadId !== '') {
            $where[]  = 'f.lead_id = ?';
            $params[] = $leadId;
        }

        if ($search !== '') {
            $where[]  = '(f.nama_company ILIKE ? OR f.catatan_fu ILIKE ? OR f.sales_owner ILIKE ?)';
            $params[] = "%$search%";
            $params[] = "%$search%";
            $params[] = "%$search%";
        }

        $whereStr = implode(' AND ', $where);

        $rows = DB::select("
            SELECT f.fu_id, f.lead_id, f.nama_company, f.sales_owner,
                   f.tgl_fu, f.metode_fu, f.hasil_fu, f.catatan_fu,
                   f.next_action, f.tgl_fu_berikut, f.status, f.stage_saat_fu,
                   l.stage, l.prioritas, l.contact_person
            FROM follow_up_log f
            LEFT JOIN leads l ON l.lead_id = f.lead_id
            WHERE $whereStr
            ORDER BY f.tgl_fu DESC
            LIMIT ? OFFSET ?
        ", array_merge($params, [$limit, $offset]));

        $leads = DB::select("
            SELECT DISTINCT f.lead_id, f.nama_company
            FROM follow_up_log f
            ORDER BY f.nama_company
        ");

        $salesWhere = ($auth['is_sales_only'] ?? false) ? "AND l.sales_owner = ?" : '';
        $salesParam = ($auth['is_sales_only'] ?? false) ? [$auth['nama'] ?? ''] : [];
        $today      = now()->toDateString();

        // FU hari ini: next_fu_date = hari ini
        $fuToday = DB::select("
            SELECT l.lead_id, l.nama_company, l.contact_person,
                   l.stage, l.prioritas, l.next_fu_date, l.sales_owner,
                   l.last_fu_notes
            FROM leads l
            WHERE l.next_fu_date = ?
              AND l.stage NOT IN ('Won','Lost')
              $salesWhere
            ORDER BY l.prioritas DESC
            LIMIT 50
        ", array_merge([$today], $salesParam));

        // Overdue FU: next_fu_date < hari ini
        $overdueFu = DB::select("
            SELECT l.lead_id, l.nama_company, l.contact_person,
                   l.stage, l.prioritas, l.next_fu_date, l.sales_owner,
                   l.last_fu_notes
            FROM leads l
            WHERE l.next_fu_date < ?
              AND l.stage NOT IN ('Won','Lost')
              $salesWhere
            ORDER BY l.next_fu_date ASC
            LIMIT 50
        ", array_merge([$today], $salesParam));

        return response()->json([
            'total'      => count($rows),
            'logs'       => array_map(fn($r) => (array)$r, $rows),
            'leads'      => array_map(fn($r) => (array)$r, $leads),
            'today_due'  => array_map(fn($r) => (array)$r, $fuToday),
            'overdue'    => array_map(fn($r) => (array)$r, $overdueFu),
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
