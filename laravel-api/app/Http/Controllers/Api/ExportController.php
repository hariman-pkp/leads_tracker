<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Dompdf\Dompdf;
use Dompdf\Options;

class ExportController extends Controller
{
    // ── helpers ─────────────────────────────────────────────────────────────

    private function authUser(Request $request): array
    {
        return $request->attributes->get('auth_user', []);
    }

    private function isAdmin(array $auth): bool
    {
        return (int)($auth['role_id'] ?? 0) === 1;
    }

    private function csvResponse(array $rows, string $filename): \Illuminate\Http\Response
    {
        if (empty($rows)) {
            return response('', 200)->header('Content-Type', 'text/csv')
                ->header('Content-Disposition', "attachment; filename=\"$filename\"");
        }

        $out = fopen('php://temp', 'r+');

        // BOM UTF-8 agar Excel baca encoding dengan benar
        fputs($out, "\xEF\xBB\xBF");

        fputcsv($out, array_keys((array) $rows[0]), ';');
        foreach ($rows as $row) {
            fputcsv($out, array_values((array) $row), ';');
        }

        rewind($out);
        $csv = stream_get_contents($out);
        fclose($out);

        return response($csv, 200)
            ->header('Content-Type', 'text/csv; charset=UTF-8')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"")
            ->header('Cache-Control', 'no-cache');
    }

    private function pdfResponse(string $html, string $filename): \Illuminate\Http\Response
    {
        $options = new Options();
        $options->set('defaultFont', 'Arial');
        $options->set('isRemoteEnabled', false);
        $options->set('isHtml5ParserEnabled', true);

        $dompdf = new Dompdf($options);
        $dompdf->loadHtml($html, 'UTF-8');
        $dompdf->setPaper('A4', 'landscape');
        $dompdf->render();

        $pdf = $dompdf->output();

        return response($pdf, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', "attachment; filename=\"$filename\"")
            ->header('Cache-Control', 'no-cache');
    }

    private function rupiah(float $val): string
    {
        return 'Rp ' . number_format($val, 0, ',', '.');
    }

    private function pdfStyle(): string
    {
        return <<<HTML
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 10px; color: #1a1a2e; background: #fff; }
          h1 { font-size: 14px; margin-bottom: 2px; }
          .meta { font-size: 9px; color: #555; margin-bottom: 12px; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #1e3a5f; color: #fff; padding: 5px 6px; text-align: left; font-size: 9px; }
          td { padding: 4px 6px; border-bottom: 1px solid #e0e0e0; font-size: 9px; vertical-align: top; }
          tr:nth-child(even) td { background: #f5f8fc; }
          .badge { display: inline-block; padding: 1px 6px; border-radius: 10px; font-size: 8px; font-weight: bold; }
          .badge-green  { background: #d1fae5; color: #065f46; }
          .badge-blue   { background: #dbeafe; color: #1e40af; }
          .badge-yellow { background: #fef3c7; color: #92400e; }
          .badge-red    { background: #fee2e2; color: #991b1b; }
          .badge-gray   { background: #f3f4f6; color: #374151; }
          .text-right { text-align: right; }
          .footer { margin-top: 12px; font-size: 8px; color: #888; text-align: right; }
          @media print { body { -webkit-print-color-adjust: exact; } }
        </style>
        HTML;
    }

    // ── 1. PIPELINE CSV ─────────────────────────────────────────────────────

    public function pipelineCsv(Request $request): \Illuminate\Http\Response
    {
        $auth  = $this->authUser($request);
        $stage = $request->query('stage', '');
        $sales = $request->query('sales', '');

        [$rows] = $this->pipelineRows($auth, $stage, $sales);

        $data = array_map(fn($r) => [
            'Lead ID'         => $r->lead_id,
            'Nama Perusahaan' => $r->nama_company,
            'Stage'           => $r->stage,
            'Prioritas'       => $r->prioritas,
            'Sales Owner'     => $r->sales_owner,
            'Produk'          => $r->product ?? '',
            'Segmen'          => $r->segmen ?? '',
            'Sub Segmen'      => $r->sub_segmen ?? '',
            'Organisasi'      => $r->organisasi ?? '',
            'Propose Value'   => $r->propose_value ?? 0,
            'Deal Value'      => $r->deal_value ?? 0,
            'Probability (%)'  => $r->probability ?? 0,
            'Exp Close Date'  => $r->exp_close_date ?? '',
            'Next FU Date'    => $r->next_fu_date ?? '',
            'Next FU Type'    => $r->next_fu_type ?? '',
            'Source'          => $r->source ?? '',
            'Tgl Masuk'       => $r->tgl_masuk ?? '',
            'Updated At'      => $r->updated_at ?? '',
        ], $rows);

        return $this->csvResponse($data, 'pipeline_export.csv');
    }

    // ── 2. PIPELINE PDF ─────────────────────────────────────────────────────

    public function pipelinePdf(Request $request): \Illuminate\Http\Response
    {
        $auth  = $this->authUser($request);
        $stage = $request->query('stage', '');
        $sales = $request->query('sales', '');

        [$rows, $total] = $this->pipelineRows($auth, $stage, $sales);

        $stageColors = [
            'Won'          => 'badge-green',
            'Lost'         => 'badge-red',
            'Negotiation'  => 'badge-blue',
            'Proposal Sent'=> 'badge-blue',
            'Proposal'     => 'badge-blue',
            'Qualified'    => 'badge-yellow',
            'Prospect'     => 'badge-yellow',
            'In Progress'  => 'badge-gray',
            'New'          => 'badge-gray',
            'On Hold'      => 'badge-gray',
        ];

        $filterDesc = [];
        if ($stage) $filterDesc[] = "Stage: $stage";
        if ($sales) $filterDesc[] = "Sales: $sales";
        $filterStr = $filterDesc ? implode(' | ', $filterDesc) : 'Semua data';

        $rows_html = '';
        foreach ($rows as $i => $r) {
            $cls   = $stageColors[$r->stage] ?? 'badge-gray';
            $pv    = $this->rupiah((float)($r->propose_value ?? 0));
            $dv    = $r->deal_value ? $this->rupiah((float)$r->deal_value) : '—';
            $prob  = $r->probability ? $r->probability . '%' : '—';
            $rows_html .= "<tr>
                <td>" . ($i + 1) . "</td>
                <td>{$r->lead_id}</td>
                <td>{$r->nama_company}</td>
                <td><span class='badge $cls'>{$r->stage}</span></td>
                <td>{$r->prioritas}</td>
                <td>{$r->sales_owner}</td>
                <td>" . ($r->product ?? '—') . "</td>
                <td class='text-right'>$pv</td>
                <td class='text-right'>$dv</td>
                <td class='text-right'>$prob</td>
                <td>" . ($r->exp_close_date ?? '—') . "</td>
                <td>" . ($r->next_fu_date ?? '—') . "</td>
            </tr>";
        }

        $now  = now()->format('d/m/Y H:i');
        $html = <<<HTML
        <!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Pipeline Report</title>{$this->pdfStyle()}</head><body>
        <h1>Pipeline Report — APEX CRM</h1>
        <div class="meta">Dicetak: $now &nbsp;|&nbsp; Filter: $filterStr &nbsp;|&nbsp; Total: $total leads</div>
        <table>
          <thead><tr>
            <th>#</th><th>Lead ID</th><th>Nama Perusahaan</th><th>Stage</th>
            <th>Prioritas</th><th>Sales</th><th>Produk</th>
            <th class="text-right">Propose Value</th>
            <th class="text-right">Deal Value</th>
            <th class="text-right">Prob.</th>
            <th>Exp Close</th><th>Next FU</th>
          </tr></thead>
          <tbody>$rows_html</tbody>
        </table>
        <div class="footer">APEX CRM &copy; {$this->curYear()} — Dicetak $now</div>
        </body></html>
        HTML;

        return $this->pdfResponse($html, 'pipeline_report.pdf');
    }

    private function pipelineRows(array $auth, string $stage, string $sales): array
    {
        $isSales = $auth['is_sales_only'] ?? false;
        $where   = ['1=1'];
        $params  = [];

        if ($isSales) {
            $where[]  = 'sales_owner = ?';
            $params[] = $auth['nama'];
        } elseif ($sales) {
            $where[]  = 'sales_owner = ?';
            $params[] = $sales;
        }

        if ($stage) {
            $where[]  = 'stage = ?';
            $params[] = $stage;
        }

        $whereStr = implode(' AND ', $where);
        $rows = DB::select(
            "SELECT lead_id, nama_company, stage, prioritas, sales_owner,
                    product, segmen, sub_segmen, organisasi, source,
                    COALESCE(propose_value,0) AS propose_value,
                    COALESCE(deal_value,0) AS deal_value,
                    probability, exp_close_date, next_fu_date, next_fu_type,
                    tgl_masuk, updated_at
             FROM leads
             WHERE $whereStr
             ORDER BY stage, nama_company",
            $params
        );

        return [$rows, count($rows)];
    }

    // ── 3. LAPORAN HARIAN CSV ────────────────────────────────────────────────

    public function dailyReportCsv(Request $request): \Illuminate\Http\Response
    {
        $auth  = $this->authUser($request);
        $month = $request->query('month', now()->format('Y-m'));
        $sales = $request->query('sales', '');

        $rows = $this->dailyReportRows($auth, $month, $sales);

        $data = array_map(fn($r) => [
            'Tanggal'          => $r->report_date,
            'Sales'            => $r->sales_nama,
            'Kunjungan'        => $r->visit_count ?? 0,
            'Follow Up'        => $r->fu_count ?? 0,
            'Lead Baru'        => $r->new_lead_count ?? 0,
            'Mood'             => $r->mood ?? '',
            'Status'           => $r->status,
            'Catatan Hambatan' => $r->notes_obstacle ?? '',
            'Rencana Besok'    => $r->notes_plan ?? '',
            'Dikirim Pukul'    => $r->sent_at ?? '',
        ], $rows);

        $filename = "laporan_harian_$month.csv";
        return $this->csvResponse($data, $filename);
    }

    // ── 4. LAPORAN HARIAN PDF ────────────────────────────────────────────────

    public function dailyReportPdf(Request $request): \Illuminate\Http\Response
    {
        $auth  = $this->authUser($request);
        $month = $request->query('month', now()->format('Y-m'));
        $sales = $request->query('sales', '');

        $rows = $this->dailyReportRows($auth, $month, $sales);

        $filterDesc = ["Bulan: $month"];
        if ($sales) $filterDesc[] = "Sales: $sales";

        $statusColors = [
            'sent'  => 'badge-green',
            'draft' => 'badge-yellow',
        ];

        $rows_html = '';
        foreach ($rows as $i => $r) {
            $cls  = $statusColors[$r->status] ?? 'badge-gray';
            $mood = $r->mood ? htmlspecialchars($r->mood) : '—';
            $rows_html .= "<tr>
                <td>" . ($i + 1) . "</td>
                <td>{$r->report_date}</td>
                <td>{$r->sales_nama}</td>
                <td class='text-right'>{$r->visit_count}</td>
                <td class='text-right'>{$r->fu_count}</td>
                <td class='text-right'>{$r->new_lead_count}</td>
                <td>$mood</td>
                <td><span class='badge $cls'>{$r->status}</span></td>
                <td>" . htmlspecialchars($r->notes_obstacle ?? '—') . "</td>
                <td>" . htmlspecialchars($r->notes_plan ?? '—') . "</td>
            </tr>";
        }

        $now       = now()->format('d/m/Y H:i');
        $filterStr = implode(' | ', $filterDesc);
        $total     = count($rows);

        $html = <<<HTML
        <!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Laporan Harian</title>{$this->pdfStyle()}</head><body>
        <h1>Laporan Harian Sales — APEX CRM</h1>
        <div class="meta">Dicetak: $now &nbsp;|&nbsp; Filter: $filterStr &nbsp;|&nbsp; Total: $total laporan</div>
        <table>
          <thead><tr>
            <th>#</th><th>Tanggal</th><th>Sales</th>
            <th class="text-right">Kunjungan</th>
            <th class="text-right">Follow Up</th>
            <th class="text-right">Lead Baru</th>
            <th>Mood</th><th>Status</th>
            <th>Catatan Hambatan</th><th>Rencana Besok</th>
          </tr></thead>
          <tbody>$rows_html</tbody>
        </table>
        <div class="footer">APEX CRM &copy; {$this->curYear()} — Dicetak $now</div>
        </body></html>
        HTML;

        return $this->pdfResponse($html, "laporan_harian_$month.pdf");
    }

    private function dailyReportRows(array $auth, string $month, string $sales): array
    {
        $isSales = $auth['is_sales_only'] ?? false;
        $where   = ["TO_CHAR(dr.report_date, 'YYYY-MM') = ?"];
        $params  = [$month];

        if ($isSales) {
            $where[]  = 'dr.user_id = ?';
            $params[] = $auth['id'];
        } elseif ($sales) {
            $where[]  = 'u.nama = ?';
            $params[] = $sales;
        }

        $whereStr = implode(' AND ', $where);

        return DB::select(
            "SELECT dr.report_date, u.nama AS sales_nama,
                    dr.visit_count, dr.fu_count, dr.new_lead_count,
                    dr.mood, dr.status, dr.notes_obstacle, dr.notes_plan, dr.sent_at
             FROM daily_reports dr
             JOIN users u ON u.id = dr.user_id
             WHERE $whereStr
             ORDER BY dr.report_date ASC, u.nama ASC",
            $params
        );
    }

    // ── 5. ANALYTICS PER SALES CSV ──────────────────────────────────────────

    public function analyticsCsv(Request $request): \Illuminate\Http\Response
    {
        $auth  = $this->authUser($request);
        $tahun = (int) $request->query('tahun', now()->year);

        $rows = $this->analyticsRows($auth, $tahun);

        $data = array_map(fn($r) => [
            'Sales'           => $r->sales,
            'Total Leads'     => $r->total_leads,
            'Won'             => $r->won,
            'Lost'            => $r->lost,
            'In Progress'     => $r->in_progress,
            'Total Deal (Rp)' => $r->total_deal,
            'Win Rate (%)'    => $r->win_rate,
            'Avg Probability (%)' => $r->avg_probability,
            'Avg Deal Value (Rp)' => $r->avg_deal_value,
        ], $rows);

        return $this->csvResponse($data, "analytics_$tahun.csv");
    }

    // ── 6. ANALYTICS PER SALES PDF ──────────────────────────────────────────

    public function analyticsPdf(Request $request): \Illuminate\Http\Response
    {
        $auth  = $this->authUser($request);
        $tahun = (int) $request->query('tahun', now()->year);

        $rows = $this->analyticsRows($auth, $tahun);

        $rows_html = '';
        foreach ($rows as $i => $r) {
            $wr  = $r->win_rate . '%';
            $avg = $r->avg_probability . '%';
            $rows_html .= "<tr>
                <td>" . ($i + 1) . "</td>
                <td>{$r->sales}</td>
                <td class='text-right'>{$r->total_leads}</td>
                <td class='text-right' style='color:#059669'>{$r->won}</td>
                <td class='text-right' style='color:#dc2626'>{$r->lost}</td>
                <td class='text-right'>{$r->in_progress}</td>
                <td class='text-right'>{$this->rupiah((float)$r->total_deal)}</td>
                <td class='text-right'><b>$wr</b></td>
                <td class='text-right'>$avg</td>
                <td class='text-right'>{$this->rupiah((float)$r->avg_deal_value)}</td>
            </tr>";
        }

        $now   = now()->format('d/m/Y H:i');
        $total = count($rows);

        $html = <<<HTML
        <!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Analytics per Sales $tahun</title>{$this->pdfStyle()}</head><body>
        <h1>Analytics per Sales — Tahun $tahun — APEX CRM</h1>
        <div class="meta">Dicetak: $now &nbsp;|&nbsp; Total: $total sales</div>
        <table>
          <thead><tr>
            <th>#</th><th>Sales</th>
            <th class="text-right">Total Leads</th>
            <th class="text-right">Won</th>
            <th class="text-right">Lost</th>
            <th class="text-right">In Progress</th>
            <th class="text-right">Total Deal</th>
            <th class="text-right">Win Rate</th>
            <th class="text-right">Avg Prob.</th>
            <th class="text-right">Avg Deal Value</th>
          </tr></thead>
          <tbody>$rows_html</tbody>
        </table>
        <div class="footer">APEX CRM &copy; {$this->curYear()} — Dicetak $now</div>
        </body></html>
        HTML;

        return $this->pdfResponse($html, "analytics_$tahun.pdf");
    }

    private function analyticsRows(array $auth, int $tahun): array
    {
        $isSales = $auth['is_sales_only'] ?? false;
        $where   = ["EXTRACT(YEAR FROM tgl_masuk) = ?"];
        $params  = [$tahun];

        if ($isSales) {
            $where[]  = 'sales_owner = ?';
            $params[] = $auth['nama'];
        }

        $whereStr = implode(' AND ', $where);

        return DB::select(
            "SELECT
                sales_owner AS sales,
                COUNT(*)                                                   AS total_leads,
                COUNT(*) FILTER (WHERE stage = 'Won')                      AS won,
                COUNT(*) FILTER (WHERE stage = 'Lost')                     AS lost,
                COUNT(*) FILTER (WHERE stage NOT IN ('Won','Lost'))         AS in_progress,
                COALESCE(SUM(deal_value) FILTER (WHERE stage = 'Won'), 0)  AS total_deal,
                ROUND(
                    100.0 * COUNT(*) FILTER (WHERE stage = 'Won')
                    / NULLIF(COUNT(*) FILTER (WHERE stage IN ('Won','Lost')), 0)
                , 1)                                                        AS win_rate,
                ROUND(AVG(COALESCE(probability, 0)), 1)                    AS avg_probability,
                ROUND(
                    COALESCE(AVG(deal_value) FILTER (WHERE stage = 'Won'), 0)
                , 0)                                                        AS avg_deal_value
             FROM leads
             WHERE $whereStr
             GROUP BY sales_owner
             ORDER BY total_leads DESC",
            $params
        );
    }

    private function curYear(): int
    {
        return now()->year;
    }
}
