<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ImportController extends Controller
{
    /**
     * Default probability (%) per stage — dipakai saat kolom probability kosong.
     */
    private const STAGE_PROBABILITY = [
        'New'            => 10,
        'In Progress'    => 25,
        'Demo Scheduled' => 40,
        'Proposal Sent'  => 60,
        'Negotiation'    => 80,
        'Won'            => 100,
        'On Hold'        => 20,
        'Lost'           => 0,
    ];

    // ────────────────────────────────────────────────────────────────────
    // TEMPLATES
    // ────────────────────────────────────────────────────────────────────

    public function templatePipeline()
    {
        $headers = [
            'lead_id','nama_company','product','contact_person','segmen','sub_segmen',
            'source','stage','prioritas','tgl_masuk','propose_value','deal_value',
            'probability','exp_close_date','sales_owner','next_fu_date','remarks','organisasi',
        ];
        // Contoh data (probability dikosongkan → akan diisi otomatis dari stage)
        $example = [
            'LEA-0001','PT Contoh Maju','DCSS','Budi Santoso','Perbankan','Bank Swasta',
            'Referral','Proposal Sent','Hot','2026-01-15',
            '500000000','0','','2026-03-31','John Doe','2026-02-01',
            'Catatan contoh','FSP-ECO',
        ];

        // Baris keterangan mapping stage → probability
        $note = [
            '# KETERANGAN','','','','','',
            '','','','',
            '','','Kolom probability boleh dikosongkan — otomatis diisi berdasarkan Stage:',
            '','','',
            'New=10% | In Progress=25% | Demo Scheduled=40% | Proposal Sent=60% | Negotiation=80% | Won=100% | On Hold=20% | Lost=0%',
            '',
        ];

        return $this->csvDown('template_pipeline.csv', $headers, [$example, $note]);
    }

    public function templateRevenue()
    {
        $headers = [
            'project_id','lob','organisasi','product','client','kategori','type',
            'tahun','pic','target_invoice_date',
            'target_1','target_2','target_3','target_4','target_5','target_6',
            'target_7','target_8','target_9','target_10','target_11','target_12',
            'actual_1','actual_2','actual_3','actual_4','actual_5','actual_6',
            'actual_7','actual_8','actual_9','actual_10','actual_11','actual_12',
        ];
        $example = [
            'REV-0001','LOB A','FSP-ECO','DCSS','PT Bank Contoh','Project','Bulanan',
            '2026','John Doe','2026-03-31',
            '100000000','100000000','100000000','100000000','100000000','100000000',
            '100000000','100000000','100000000','100000000','100000000','100000000',
            '95000000','102000000','0','0','0','0','0','0','0','0','0','0',
        ];
        $note = [
            '# KETERANGAN','','','','',
            'kategori: Project atau Recurring',
            'type: Tahunan | Bulanan | Termin',
            '','','',
            '','','','','','','','','','','','',
            '','','','','','','','','','','','',
        ];

        return $this->csvDown('template_revenue.csv', $headers, [$example, $note]);
    }

    /**
     * Baca file CSV dengan robust:
     * - Strip UTF-8 BOM
     * - Normalisasi semua line ending (\r\n, \r, \n) → \n
     * - Deteksi separator otomatis (koma vs titik koma)
     * - Skip baris komentar (#)
     *
     * Mengembalikan ['headers' => string[], 'rows' => Generator]
     */
    private function openCsv(string $path): array
    {
        $raw = file_get_contents($path);

        // Strip BOM UTF-8
        if (str_starts_with($raw, "\xEF\xBB\xBF")) {
            $raw = substr($raw, 3);
        }

        // Normalisasi line ending → \n
        $raw   = str_replace(["\r\n", "\r"], "\n", $raw);
        $lines = array_filter(explode("\n", $raw), fn($l) => trim($l) !== '');
        $lines = array_values($lines);

        if (empty($lines)) {
            return ['headers' => [], 'lines' => []];
        }

        // Deteksi separator: titik koma jika lebih banyak dari koma pada baris header
        $sep = (substr_count($lines[0], ';') > substr_count($lines[0], ',')) ? ';' : ',';

        $parseLine = function (string $line) use ($sep): array {
            return array_map('trim', str_getcsv($line, $sep));
        };

        $headers   = $parseLine($lines[0]);
        $dataLines = array_filter(
            array_slice($lines, 1),
            fn($l) => !str_starts_with(ltrim($l), '#')
        );

        return [
            'headers'   => $headers,
            'dataLines' => array_values($dataLines),
            'parseLine' => $parseLine,
        ];
    }

    private function csvDown(string $filename, array $headers, array $rows)
    {
        return response()->streamDownload(function () use ($headers, $rows) {
            $f = fopen('php://output', 'w');
            // UTF-8 BOM agar Excel tidak rusak encoding
            fwrite($f, "\xEF\xBB\xBF");
            fputcsv($f, $headers);
            foreach ($rows as $row) {
                fputcsv($f, $row);
            }
            fclose($f);
        }, $filename, [
            'Content-Type'        => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }

    // ────────────────────────────────────────────────────────────────────
    // IMPORT PIPELINE
    // ────────────────────────────────────────────────────────────────────

    public function importPipeline(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:10240']);
        $clearFirst = $request->boolean('clear_first', false);

        $path = $request->file('file')->getRealPath();
        $csv  = $this->openCsv($path);

        $headers   = $csv['headers'];
        $dataLines = $csv['dataLines'];
        $parseLine = $csv['parseLine'];

        $required = ['nama_company', 'stage'];
        foreach ($required as $r) {
            if (!in_array($r, $headers)) {
                return response()->json(['message' => "Kolom wajib '$r' tidak ada dalam file CSV."], 422);
            }
        }

        if ($clearFirst) {
            DB::statement("DELETE FROM follow_up_log");
            DB::statement("DELETE FROM lead_contacts");
            DB::statement("DELETE FROM leads");
        }

        $imported = 0;
        $updated  = 0;
        $skipped  = 0;
        $errors   = [];
        $rowNum   = 1;

        foreach ($dataLines as $line) {
            $rowNum++;
            $cols = $parseLine($line);
            if (!$cols || implode('', $cols) === '') continue;

            $rec = array_combine($headers, array_pad($cols, count($headers), ''));
            if (!$rec) continue;

            try {
                $leadId  = trim($rec['lead_id'] ?? '');
                $company = trim($rec['nama_company'] ?? '');
                if (!$company) {
                    $skipped++;
                    $errors[] = "Baris $rowNum: nama_company kosong — dilewati.";
                    continue;
                }

                // Auto-generate lead_id jika kosong
                if (!$leadId) {
                    $last    = DB::selectOne("SELECT lead_id FROM leads ORDER BY id DESC LIMIT 1");
                    $lastNum = $last ? (int) preg_replace('/\D/', '', substr($last->lead_id, -4)) : 0;
                    $leadId  = 'LEA-' . str_pad($lastNum + $imported + $updated + 1, 4, '0', STR_PAD_LEFT);
                }

                $proposeVal = $this->num($rec['propose_value'] ?? '');
                $dealVal    = $this->num($rec['deal_value'] ?? '');
                $stage      = $this->str($rec['stage'] ?? '') ?? 'New';
                $prob       = $this->num($rec['probability'] ?? '');
                // Auto-fill probability dari stage jika tidak diisi
                if ($prob === null) {
                    $prob = self::STAGE_PROBABILITY[$stage] ?? self::STAGE_PROBABILITY['New'];
                }
                $weighted   = ($proposeVal && $prob) ? round($proposeVal * $prob / 100) : null;

                $payload = [
                    'nama_company'   => $company,
                    'product'        => $this->str($rec['product'] ?? ''),
                    'contact_person' => $this->str($rec['contact_person'] ?? ''),
                    'segmen'         => $this->str($rec['segmen'] ?? ''),
                    'sub_segmen'     => $this->str($rec['sub_segmen'] ?? ''),
                    'source'         => $this->str($rec['source'] ?? ''),
                    'stage'          => $stage,
                    'prioritas'      => $this->str($rec['prioritas'] ?? '') ?? 'Warm',
                    'tgl_masuk'      => $this->date($rec['tgl_masuk'] ?? ''),
                    'propose_value'  => $proposeVal,
                    'deal_value'     => $dealVal,
                    'probability'    => $prob,
                    'exp_close_date' => $this->date($rec['exp_close_date'] ?? ''),
                    'weighted_value' => $weighted,
                    'sales_owner'    => $this->str($rec['sales_owner'] ?? ''),
                    'next_fu_date'   => $this->date($rec['next_fu_date'] ?? ''),
                    'remarks'        => $this->str($rec['remarks'] ?? ''),
                    'organisasi'     => $this->str($rec['organisasi'] ?? ''),
                    'updated_at'     => now(),
                ];

                $existing = DB::selectOne("SELECT id FROM leads WHERE lead_id=?", [$leadId]);
                if ($existing) {
                    DB::table('leads')->where('lead_id', $leadId)->update($payload);
                    $updated++;
                } else {
                    $payload['lead_id']    = $leadId;
                    $payload['created_at'] = now();
                    DB::table('leads')->insert($payload);
                    $imported++;
                }
            } catch (\Throwable $e) {
                $skipped++;
                $errors[] = "Baris $rowNum: " . $e->getMessage();
            }
        }

        return response()->json([
            'imported' => $imported,
            'updated'  => $updated,
            'skipped'  => $skipped,
            'errors'   => array_slice($errors, 0, 30),
        ]);
    }

    // ────────────────────────────────────────────────────────────────────
    // IMPORT REVENUE
    // ────────────────────────────────────────────────────────────────────

    public function importRevenue(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:10240']);
        $clearFirst = $request->boolean('clear_first', false);

        $path = $request->file('file')->getRealPath();
        $csv  = $this->openCsv($path);

        $headers   = $csv['headers'];
        $dataLines = $csv['dataLines'];
        $parseLine = $csv['parseLine'];

        $required = ['project_id', 'client', 'tahun'];
        foreach ($required as $r) {
            if (!in_array($r, $headers)) {
                return response()->json(['message' => "Kolom wajib '$r' tidak ada dalam file CSV."], 422);
            }
        }

        if ($clearFirst) {
            DB::statement("DELETE FROM revenue_monthly");
            DB::statement("DELETE FROM revenue_projects");
        }

        $monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

        $imported = 0;
        $updated  = 0;
        $skipped  = 0;
        $errors   = [];
        $rowNum   = 1;

        foreach ($dataLines as $line) {
            $rowNum++;
            $cols = $parseLine($line);
            if (!$cols || implode('', $cols) === '') continue;

            $rec = array_combine($headers, array_pad($cols, count($headers), ''));
            if (!$rec) continue;

            try {
                $projectId = trim($rec['project_id'] ?? '');
                $tahun     = (int) trim($rec['tahun'] ?? date('Y'));

                if (!$projectId) {
                    $skipped++;
                    $errors[] = "Baris $rowNum: project_id kosong — dilewati.";
                    continue;
                }

                // Hitung total target dari bulan 1-12
                $totalTarget = 0;
                for ($m = 1; $m <= 12; $m++) {
                    $totalTarget += $this->num($rec["target_$m"] ?? '') ?? 0;
                }

                $projectPayload = [
                    'lob'                 => $this->str($rec['lob'] ?? ''),
                    'organisasi'          => $this->str($rec['organisasi'] ?? ''),
                    'product'             => $this->str($rec['product'] ?? ''),
                    'client'              => trim($rec['client'] ?? ''),
                    'kategori'            => $this->str($rec['kategori'] ?? ''),
                    'type'                => $this->str($rec['type'] ?? ''),
                    'tahun'               => $tahun,
                    'pic'                 => $this->str($rec['pic'] ?? ''),
                    'target_invoice_date' => $this->date($rec['target_invoice_date'] ?? ''),
                    'revenue_target'      => $totalTarget,
                    'is_active'           => true,
                    'deleted_at'          => null,
                    'updated_at'          => now(),
                ];

                $existing = DB::selectOne(
                    "SELECT id FROM revenue_projects WHERE project_id=? AND tahun=?",
                    [$projectId, $tahun]
                );

                if ($existing) {
                    DB::table('revenue_projects')
                        ->where('project_id', $projectId)->where('tahun', $tahun)
                        ->update($projectPayload);
                    $updated++;
                } else {
                    $projectPayload['project_id'] = $projectId;
                    $projectPayload['created_at'] = now();
                    DB::table('revenue_projects')->insert($projectPayload);
                    $imported++;
                }

                // Upsert revenue_monthly (12 baris per project)
                for ($m = 1; $m <= 12; $m++) {
                    $target = $this->num($rec["target_$m"] ?? '') ?? 0;
                    $actual = $this->num($rec["actual_$m"] ?? '') ?? 0;
                    $ach    = $target > 0 ? round($actual / $target * 100, 1) : ($actual > 0 ? 100.0 : 0.0);
                    $status = $ach >= 100 ? 'On Track' : ($ach >= 70 ? 'At Risk' : ($target > 0 || $actual > 0 ? 'Off Track' : 'On Track'));

                    $monthly = [
                        'month_num'  => $m,
                        'month_name' => $monthNames[$m - 1],
                        'target'     => $target,
                        'actual'     => $actual,
                        'status'     => $status,
                    ];

                    $existM = DB::selectOne(
                        "SELECT id FROM revenue_monthly WHERE project_id=? AND month_num=?",
                        [$projectId, $m]
                    );

                    if ($existM) {
                        DB::table('revenue_monthly')
                            ->where('project_id', $projectId)->where('month_num', $m)
                            ->update($monthly);
                    } else {
                        $monthly['project_id'] = $projectId;
                        DB::table('revenue_monthly')->insert($monthly);
                    }
                }
            } catch (\Throwable $e) {
                $skipped++;
                $errors[] = "Baris $rowNum: " . $e->getMessage();
            }
        }

        return response()->json([
            'imported' => $imported,
            'updated'  => $updated,
            'skipped'  => $skipped,
            'errors'   => array_slice($errors, 0, 30),
        ]);
    }

    // ────────────────────────────────────────────────────────────────────
    // TEMPLATE INVOICE
    // ────────────────────────────────────────────────────────────────────

    public function templateInvoice()
    {
        $headers = [
            'invoice_no', 'project_id', 'invoice_date',
            'invoice_amount', 'paid_amount', 'paid_date',
            'status', 'notes',
        ];
        $example = [
            'INV/2026/001', 'REV-0001', '2026-01-15',
            '100000000', '100000000', '2026-01-20',
            'Lunas', 'Pembayaran bulan Januari',
        ];
        $note = [
            '# KETERANGAN', '', '',
            '', '', '',
            'Status: Lunas | Partial | Unpaid (opsional — otomatis dihitung dari paid_amount)',
            'paid_date boleh dikosongkan jika belum dibayar',
        ];

        return $this->csvDown('template_invoice.csv', $headers, [$example, $note]);
    }

    // ────────────────────────────────────────────────────────────────────
    // IMPORT INVOICE & PAYMENT
    // ────────────────────────────────────────────────────────────────────

    public function importInvoice(Request $request)
    {
        $request->validate(['file' => 'required|file|mimes:csv,txt|max:10240']);
        $clearFirst = $request->boolean('clear_first', false);

        $path = $request->file('file')->getRealPath();
        $csv  = $this->openCsv($path);

        $headers   = $csv['headers'];
        $dataLines = $csv['dataLines'];
        $parseLine = $csv['parseLine'];

        $required = ['invoice_no', 'project_id', 'invoice_date', 'invoice_amount'];
        foreach ($required as $r) {
            if (!in_array($r, $headers)) {
                return response()->json(['message' => "Kolom wajib '$r' tidak ada dalam file CSV."], 422);
            }
        }

        if ($clearFirst) {
            DB::statement("DELETE FROM invoices");
        }

        $imported        = 0;
        $updated         = 0;
        $skipped         = 0;
        $errors          = [];
        $rowNum          = 1;
        $affectedProjects = []; // project_id+month_num yang perlu di-recalculate

        foreach ($dataLines as $line) {
            $rowNum++;
            $cols = $parseLine($line);
            if (!$cols || implode('', $cols) === '') continue;

            $rec = array_combine($headers, array_pad($cols, count($headers), ''));
            if (!$rec) continue;

            try {
                $invoiceNo  = trim($rec['invoice_no'] ?? '');
                $projectId  = trim($rec['project_id'] ?? '');
                $invDateStr = trim($rec['invoice_date'] ?? '');

                if (!$invoiceNo || !$projectId || !$invDateStr) {
                    $skipped++;
                    $errors[] = "Baris $rowNum: invoice_no / project_id / invoice_date kosong — dilewati.";
                    continue;
                }

                // Validasi project_id ada
                $proj = DB::selectOne(
                    "SELECT project_id, lob, organisasi, product, client, tahun FROM revenue_projects WHERE project_id=? AND deleted_at IS NULL",
                    [$projectId]
                );
                if (!$proj) {
                    $skipped++;
                    $errors[] = "Baris $rowNum: project_id '$projectId' tidak ditemukan — dilewati.";
                    continue;
                }

                $invDate    = $this->date($invDateStr);
                $paidDate   = $this->date($rec['paid_date'] ?? '');
                $invAmount  = $this->num($rec['invoice_amount'] ?? '') ?? 0;
                $paidAmount = $this->num($rec['paid_amount'] ?? '') ?? 0;

                if (!$invDate) {
                    $skipped++;
                    $errors[] = "Baris $rowNum: format invoice_date '$invDateStr' tidak dikenali — dilewati.";
                    continue;
                }

                // Auto status dari paid_amount vs invoice_amount
                $statusRaw = $this->str($rec['status'] ?? '');
                if (!$statusRaw) {
                    if ($paidAmount <= 0)               $statusRaw = 'Unpaid';
                    elseif ($paidAmount >= $invAmount)   $statusRaw = 'Lunas';
                    else                                 $statusRaw = 'Partial';
                }

                // Tentukan bulan dan tahun dari invoice_date
                $parsedDate = \Carbon\Carbon::parse($invDate);
                $monthNum   = (int) $parsedDate->format('n');
                $monthName  = $parsedDate->locale('id')->translatedFormat('F');
                $tahun      = (int) $parsedDate->format('Y');

                $payload = [
                    'project_id'     => $projectId,
                    'lob'            => $proj->lob,
                    'organisasi'     => $proj->organisasi,
                    'product'        => $proj->product,
                    'client'         => $proj->client,
                    'invoice_date'   => $invDate,
                    'period'         => $monthName,
                    'invoice_amount' => $invAmount,
                    'paid_amount'    => $paidAmount,
                    'paid_date'      => $paidDate,
                    'notes'          => $this->str($rec['notes'] ?? ''),
                    // status adalah generated column — tidak diisi manual
                    'tahun'          => $tahun,
                ];

                $existing = DB::selectOne("SELECT id FROM invoices WHERE invoice_no=?", [$invoiceNo]);
                if ($existing) {
                    DB::table('invoices')->where('invoice_no', $invoiceNo)->update($payload);
                    $updated++;
                } else {
                    $payload['invoice_no'] = $invoiceNo;
                    $payload['created_at'] = now();
                    DB::table('invoices')->insert($payload);
                    $imported++;
                }

                // Tandai project+bulan ini perlu di-recalculate
                $affectedProjects["$projectId:$monthNum"] = [
                    'project_id' => $projectId,
                    'month_num'  => $monthNum,
                    'month_name' => $monthName,
                ];
            } catch (\Throwable $e) {
                $skipped++;
                $errors[] = "Baris $rowNum: " . $e->getMessage();
            }
        }

        // ── Recalculate revenue_monthly.actual & revenue_projects.actual_revenue ──
        $syncedMonths    = 0;
        $syncedProjects  = [];

        foreach ($affectedProjects as $key => $info) {
            $projectId = $info['project_id'];
            $monthNum  = $info['month_num'];
            $monthName = $info['month_name'];

            // Sum invoice_amount dari invoices untuk project + bulan ini
            // Realisasi = nilai yang sudah diinvoice (bukan hanya yang sudah dibayar)
            $sumInv = (float) DB::selectOne(
                "SELECT COALESCE(SUM(invoice_amount), 0) as s
                 FROM invoices
                 WHERE project_id=? AND EXTRACT(MONTH FROM invoice_date::date)=?",
                [$projectId, $monthNum]
            )->s;

            // Dapatkan target bulan ini
            $rm = DB::selectOne(
                "SELECT id, target FROM revenue_monthly WHERE project_id=? AND month_num=?",
                [$projectId, $monthNum]
            );

            $target = $rm ? (float)$rm->target : 0;
            $ach    = $target > 0 ? round($sumInv / $target * 100, 1) : ($sumInv > 0 ? 100.0 : 0.0);
            $mStatus = $ach >= 100 ? 'On Track' : ($ach >= 70 ? 'At Risk' : ($target > 0 || $sumInv > 0 ? 'Off Track' : 'On Track'));

            if ($rm) {
                DB::table('revenue_monthly')
                    ->where('id', $rm->id)
                    ->update(['actual' => $sumInv, 'status' => $mStatus]);
            } else {
                // Buat row monthly jika belum ada
                DB::table('revenue_monthly')->insert([
                    'project_id' => $projectId,
                    'month_num'  => $monthNum,
                    'month_name' => $monthName,
                    'target'     => 0,
                    'actual'     => $sumInv,
                    'status'     => $mStatus,
                ]);
            }

            $syncedMonths++;
            $syncedProjects[$projectId] = true;
        }

        // Sync actual_revenue & status di revenue_projects
        foreach (array_keys($syncedProjects) as $projectId) {
            $sumActual = (float) DB::selectOne(
                "SELECT COALESCE(SUM(actual), 0) as s FROM revenue_monthly WHERE project_id=?",
                [$projectId]
            )->s;

            DB::table('revenue_projects')
                ->where('project_id', $projectId)
                ->update(['actual_revenue' => $sumActual]);

            $this->syncProjectStatus($projectId);
        }

        return response()->json([
            'imported'        => $imported,
            'updated'         => $updated,
            'skipped'         => $skipped,
            'synced_months'   => $syncedMonths,
            'synced_projects' => count($syncedProjects),
            'errors'          => array_slice($errors, 0, 30),
        ]);
    }

    // ────────────────────────────────────────────────────────────────────
    // syncProjectStatus — duplikasi dari RevenueController agar mandiri
    // ────────────────────────────────────────────────────────────────────

    private function syncProjectStatus(string $projectId): void
    {
        $p = DB::selectOne(
            "SELECT revenue_target, actual_revenue, type FROM revenue_projects WHERE project_id=?",
            [$projectId]
        );
        if (!$p) return;

        $actual   = (float)$p->actual_revenue;
        $curMonth = (int) date('n');

        if (in_array($p->type, ['Bulanan', 'Termin'])) {
            $ytd = DB::selectOne(
                "SELECT COALESCE(SUM(target), 0) as s FROM revenue_monthly
                 WHERE project_id=? AND month_num <= ?",
                [$projectId, $curMonth]
            );
            $target = (float)$ytd->s;
        } else {
            $target = (float)$p->revenue_target;
        }

        if ($target <= 0) {
            DB::table('revenue_projects')
                ->where('project_id', $projectId)
                ->update(['status' => 'On Track', 'risk_level' => 'LOW']);
            return;
        }

        $ach = round($actual / $target * 100, 1);

        $status = $ach >= 80 ? 'On Track' : ($ach >= 50 ? 'At Risk' : 'Critical');
        $risk   = $ach >= 80 ? 'LOW'      : ($ach >= 60 ? 'MEDIUM' : ($ach >= 30 ? 'HIGH' : 'CRITICAL'));

        DB::table('revenue_projects')
            ->where('project_id', $projectId)
            ->update([
                'actual_revenue' => $actual,
                'status'         => $status,
                'risk_level'     => $risk,
            ]);
    }

    // ────────────────────────────────────────────────────────────────────
    // HELPERS
    // ────────────────────────────────────────────────────────────────────

    private function str(string $v): ?string
    {
        $v = trim($v);
        return ($v === '' || $v === '-') ? null : $v;
    }

    private function num(string $v): ?float
    {
        // Hapus spasi dan pemisah ribuan (koma atau titik jika dipakai sebagai ribuan)
        $v = trim($v);
        if ($v === '' || $v === '-') return null;
        // Jika format Indonesia: 1.000.000 → hapus titik, atau 1,000,000 → hapus koma
        // Deteksi: jika ada titik AND tidak ada koma → titik sebagai ribuan
        $hasDot   = str_contains($v, '.');
        $hasComma = str_contains($v, ',');
        if ($hasDot && !$hasComma) {
            // Cek apakah titik terakhir adalah desimal (mis. 1.5) atau ribuan (mis. 1.000)
            $afterDot = strlen($v) - strrpos($v, '.') - 1;
            if ($afterDot === 3) {
                $v = str_replace('.', '', $v); // titik ribuan
            }
            // else biarkan sebagai desimal
        } elseif ($hasComma && !$hasDot) {
            $afterComma = strlen($v) - strrpos($v, ',') - 1;
            if ($afterComma === 3) {
                $v = str_replace(',', '', $v); // koma ribuan
            } else {
                $v = str_replace(',', '.', $v); // koma desimal
            }
        } elseif ($hasDot && $hasComma) {
            // Misal: 1.000.000,50
            $v = str_replace(['.', ','], ['', '.'], $v);
        }
        return is_numeric($v) ? (float) $v : null;
    }

    private function date(string $v): ?string
    {
        $v = trim($v);
        if (!$v || $v === '-' || $v === '0') return null;
        try {
            // Format DD/MM/YYYY atau DD-MM-YYYY (Excel Indonesia)
            if (preg_match('/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/', $v, $m)) {
                return \Carbon\Carbon::createFromDate((int)$m[3], (int)$m[2], (int)$m[1])->toDateString();
            }
            // Format YYYY/MM/DD atau YYYY-MM-DD
            if (preg_match('/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})$/', $v, $m)) {
                return \Carbon\Carbon::createFromDate((int)$m[1], (int)$m[2], (int)$m[3])->toDateString();
            }
            return \Carbon\Carbon::parse($v)->toDateString();
        } catch (\Throwable $e) {
            return null;
        }
    }
}
