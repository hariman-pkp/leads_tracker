<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CommandCenterController extends Controller
{
    public function index(Request $request)
    {
        $now        = now();
        $thisYear   = (int)$now->format('Y');
        $thisMonth  = (int)$now->format('n');
        $today      = $now->toDateString();
        $monthStart = $now->copy()->startOfMonth()->toDateString();
        $monthEnd   = $now->copy()->endOfMonth()->toDateString();
        $weekEnd    = $now->copy()->addDays(7)->toDateString();

        // ── 1. REVENUE PULSE ─────────────────────────────────────────────

        // Target bulan ini (semua organisasi)
        $targetRow = DB::selectOne(
            "SELECT COALESCE(SUM(target_revenue),0) as total
             FROM annual_targets WHERE tahun=? AND bulan=?",
            [$thisYear, $thisMonth]
        );
        $targetMonthly = (float)$targetRow->total;

        // Realisasi invoice lunas bulan ini
        $realisasiRow = DB::selectOne(
            "SELECT COALESCE(SUM(paid_amount),0) as total
             FROM invoices WHERE tahun=? AND EXTRACT(MONTH FROM invoice_date)=? AND status='Lunas'",
            [$thisYear, $thisMonth]
        );
        $realisasi = (float)$realisasiRow->total;

        // Outstanding invoice (belum lunas)
        $outstandingRow = DB::selectOne(
            "SELECT COALESCE(SUM(invoice_amount - paid_amount),0) as total
             FROM invoices WHERE status != 'Lunas' AND tahun=?",
            [$thisYear]
        );
        $outstanding = (float)$outstandingRow->total;

        // Pipeline potensial (leads active non-Won/Lost)
        $pipelineRow = DB::selectOne(
            "SELECT COALESCE(SUM(propose_value),0) as total
             FROM leads WHERE stage NOT IN ('Won','Lost') AND propose_value > 0"
        );
        $pipeline = (float)$pipelineRow->total;

        // Leads yang exp_close_date bulan ini (pipeline yang bisa closing)
        $closingThisMonth = DB::select(
            "SELECT lead_id, nama_company, prioritas, stage, propose_value, sales_owner, exp_close_date
             FROM leads WHERE stage NOT IN ('Won','Lost')
               AND exp_close_date BETWEEN ? AND ?
               AND propose_value > 0
             ORDER BY propose_value DESC",
            [$monthStart, $monthEnd]
        );

        $revenuePulse = [
            'target_monthly'       => $targetMonthly,
            'realisasi'            => $realisasi,
            'achievement_pct'      => $targetMonthly > 0 ? round($realisasi / $targetMonthly * 100, 1) : 0,
            'outstanding'          => $outstanding,
            'pipeline_potensial'   => $pipeline,
            'gap_to_target'        => max(0, $targetMonthly - $realisasi),
            'closing_this_month'   => array_map(fn($r) => (array)$r, $closingThisMonth),
        ];

        // ── 2. INVOICE ALERTS ────────────────────────────────────────────

        // Project aktif yang belum ada invoice bulan ini
        $noInvoiceThisMonth = DB::select(
            "SELECT p.project_id, p.client, p.organisasi, p.product,
                    p.revenue_target, p.target_invoice_date,
                    MAX(i.invoice_date) as last_invoice_date,
                    (CURRENT_DATE - MAX(i.invoice_date)::date) as days_since_invoice
             FROM revenue_projects p
             LEFT JOIN invoices i ON i.project_id = p.project_id
             WHERE p.project_status = 'Active' AND p.is_active = 1
               AND p.revenue_target > 0
             GROUP BY p.project_id, p.client, p.organisasi, p.product,
                      p.revenue_target, p.target_invoice_date
             HAVING MAX(i.invoice_date) IS NULL
                 OR MAX(i.invoice_date) < ?
             ORDER BY days_since_invoice DESC NULLS FIRST",
            [$monthStart]
        );

        // Invoice overdue > 30 hari belum dibayar
        $overdueInvoice = DB::select(
            "SELECT id, invoice_no, client, invoice_amount, paid_amount,
                    invoice_date, (CURRENT_DATE - invoice_date::date) as days_overdue,
                    (invoice_amount - paid_amount) as remaining
             FROM invoices
             WHERE status != 'Lunas'
               AND (CURRENT_DATE - invoice_date::date) > 30
             ORDER BY days_overdue DESC"
        );

        // Invoice jatuh tempo minggu ini (target_invoice_date)
        $dueSoonInvoice = DB::select(
            "SELECT p.project_id, p.client, p.organisasi, p.revenue_target,
                    p.target_invoice_date,
                    (p.target_invoice_date - CURRENT_DATE) as days_until_due
             FROM revenue_projects p
             WHERE p.project_status = 'Active' AND p.is_active = 1
               AND p.target_invoice_date BETWEEN ? AND ?
             ORDER BY p.target_invoice_date ASC",
            [$today, $weekEnd]
        );

        $invoiceAlerts = [
            'no_invoice_this_month' => array_map(fn($r) => (array)$r, $noInvoiceThisMonth),
            'overdue_invoice'       => array_map(fn($r) => (array)$r, $overdueInvoice),
            'due_soon'              => array_map(fn($r) => (array)$r, $dueSoonInvoice),
            'summary' => [
                'no_invoice_count'  => count($noInvoiceThisMonth),
                'overdue_count'     => count($overdueInvoice),
                'overdue_amount'    => array_sum(array_column(array_map(fn($r) => (array)$r, $overdueInvoice), 'remaining')),
                'due_soon_count'    => count($dueSoonInvoice),
            ],
        ];

        // ── 3. PIPELINE DECISIONS ────────────────────────────────────────

        // Leads Hot/Warm di stage lanjut (Negotiation/Proposal) > 30 hari tanpa update
        $stalePipeline = DB::select(
            "SELECT lead_id, nama_company, prioritas, stage, propose_value,
                    sales_owner, last_fu_date, exp_close_date,
                    (CURRENT_DATE - last_fu_date::date) as days_stale
             FROM leads
             WHERE stage IN ('Negotiation','Proposal')
               AND prioritas IN ('Hot','Warm')
               AND last_fu_date IS NOT NULL
               AND (CURRENT_DATE - last_fu_date::date) > 30
               AND stage NOT IN ('Won','Lost')
             ORDER BY propose_value DESC, days_stale DESC
             LIMIT 10"
        );

        // Leads Hot tanpa proposal (masih Prospecting > 14 hari)
        $hotNoProposal = DB::select(
            "SELECT lead_id, nama_company, prioritas, stage, propose_value,
                    sales_owner, created_at,
                    (CURRENT_DATE - created_at::date) as days_in_pipe
             FROM leads
             WHERE prioritas = 'Hot' AND stage = 'Prospecting'
               AND (CURRENT_DATE - created_at::date) > 14
             ORDER BY days_in_pipe DESC
             LIMIT 10"
        );

        // Leads dengan exp_close_date terlewat (masih belum Won/Lost)
        $missedClose = DB::select(
            "SELECT lead_id, nama_company, prioritas, stage, propose_value,
                    sales_owner, exp_close_date,
                    (CURRENT_DATE - exp_close_date::date) as days_overdue
             FROM leads
             WHERE exp_close_date < ? AND stage NOT IN ('Won','Lost')
               AND exp_close_date IS NOT NULL
             ORDER BY propose_value DESC
             LIMIT 10",
            [$today]
        );

        // Project yang tidak ada invoice > 45 hari (risiko kehilangan revenue)
        $atRiskProjects = array_filter(
            array_map(fn($r) => (array)$r, $noInvoiceThisMonth),
            fn($r) => ($r['days_since_invoice'] ?? 9999) > 45
        );

        $pipelineDecisions = [
            'stale_pipeline'  => array_map(fn($r) => (array)$r, $stalePipeline),
            'hot_no_proposal' => array_map(fn($r) => (array)$r, $hotNoProposal),
            'missed_close'    => array_map(fn($r) => (array)$r, $missedClose),
            'at_risk_projects'=> array_values($atRiskProjects),
            'summary' => [
                'stale_count'       => count($stalePipeline),
                'hot_no_prop_count' => count($hotNoProposal),
                'missed_close_count'=> count($missedClose),
                'at_risk_count'     => count($atRiskProjects),
            ],
        ];

        return response()->json([
            'period'             => $now->translatedFormat('F Y'),
            'generated_at'       => $now->toDateTimeString(),
            'revenue_pulse'      => $revenuePulse,
            'invoice_alerts'     => $invoiceAlerts,
            'pipeline_decisions' => $pipelineDecisions,
        ]);
    }
}
