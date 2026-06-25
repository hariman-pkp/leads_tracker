<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\NotificationController;

/**
 * Setiap Senin 08:00 — ingatkan sales tentang lead yang tidak ada aktivitas 30+ hari
 */
class SendStaleLeadAlerts extends Command
{
    protected $signature   = 'leads:stale-alert';
    protected $description = 'Kirim notifikasi untuk lead yang stagnan (>30 hari tanpa aktivitas)';

    public function handle(): int
    {
        $staleLeads = DB::select("
            SELECT l.lead_id, l.nama_company, l.stage, l.last_fu_date,
                   (CURRENT_DATE - COALESCE(l.last_fu_date, l.tgl_masuk)::date) AS days_idle,
                   u.id AS user_id
            FROM leads l
            JOIN users u ON u.nama = l.sales_owner AND u.is_active = 1
            WHERE (l.last_fu_date IS NULL OR l.last_fu_date < NOW() - INTERVAL '30 days')
              AND l.stage NOT IN ('Won','Lost')
        ");

        $count = 0;
        $today = now()->toDateString();
        foreach ($staleLeads as $lead) {
            $exists = DB::selectOne("
                SELECT id FROM notifications
                WHERE user_id = ? AND lead_id = ? AND type = 'stale'
                  AND DATE(created_at) = ?
            ", [$lead->user_id, $lead->lead_id, $today]);

            if ($exists) continue;

            NotificationController::createSystemNotif(
                userId: $lead->user_id,
                type:   'stale',
                title:  '🔕 Lead Stagnan: ' . $lead->nama_company,
                body:   "{$lead->nama_company} sudah {$lead->days_idle} hari tanpa aktivitas follow-up. Segera update atau close lead ini.",
                leadId: $lead->lead_id,
            );
            $count++;
        }

        $this->info("✓ Stale alert: {$count} notif dikirim.");
        return Command::SUCCESS;
    }
}
