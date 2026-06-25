<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Api\NotificationController;

/**
 * Jalankan setiap hari pagi (misal 07:00) via scheduler.
 * Membuat notifikasi untuk:
 *   - reminder : next_fu_date = hari ini
 *   - overdue  : next_fu_date < hari ini (terlambat, belum diclose)
 */
class SendFuReminders extends Command
{
    protected $signature   = 'fu:remind';
    protected $description = 'Kirim notifikasi reminder FU harian dan overdue ke sales terkait';

    public function handle(): int
    {
        $today = now()->toDateString();

        // ── FU Hari Ini ───────────────────────────────────────────────────
        $todayLeads = DB::select("
            SELECT l.lead_id, l.nama_company, l.contact_person,
                   l.next_fu_date, l.prioritas, l.stage,
                   u.id AS user_id
            FROM leads l
            JOIN users u ON u.nama = l.sales_owner AND u.is_active = 1
            WHERE l.next_fu_date = ?
              AND l.stage NOT IN ('Won','Lost')
        ", [$today]);

        $remCount = 0;
        foreach ($todayLeads as $lead) {
            // Jangan kirim duplikat jika sudah ada notif hari ini
            $exists = DB::selectOne("
                SELECT id FROM notifications
                WHERE user_id = ? AND lead_id = ? AND type = 'reminder'
                  AND DATE(created_at) = ?
            ", [$lead->user_id, $lead->lead_id, $today]);

            if ($exists) continue;

            NotificationController::createSystemNotif(
                userId: $lead->user_id,
                type:   'reminder',
                title:  '📞 FU Hari Ini: ' . $lead->nama_company,
                body:   "Jadwal follow-up dengan {$lead->nama_company}"
                       . ($lead->contact_person ? " ({$lead->contact_person})" : '')
                       . " hari ini. Stage: {$lead->stage}.",
                leadId: $lead->lead_id,
            );
            $remCount++;
        }

        // ── Overdue FU ────────────────────────────────────────────────────
        $overdueLeads = DB::select("
            SELECT l.lead_id, l.nama_company, l.contact_person,
                   l.next_fu_date, l.prioritas, l.stage,
                   u.id AS user_id,
                   (CURRENT_DATE - l.next_fu_date::date) AS days_late
            FROM leads l
            JOIN users u ON u.nama = l.sales_owner AND u.is_active = 1
            WHERE l.next_fu_date < ?
              AND l.stage NOT IN ('Won','Lost')
        ", [$today]);

        $ovCount = 0;
        foreach ($overdueLeads as $lead) {
            // Satu notif overdue per lead per hari
            $exists = DB::selectOne("
                SELECT id FROM notifications
                WHERE user_id = ? AND lead_id = ? AND type = 'overdue'
                  AND DATE(created_at) = ?
            ", [$lead->user_id, $lead->lead_id, $today]);

            if ($exists) continue;

            $daysLate = (int) $lead->days_late;
            NotificationController::createSystemNotif(
                userId: $lead->user_id,
                type:   'overdue',
                title:  '⚠️ FU Terlambat ' . $daysLate . ' hari: ' . $lead->nama_company,
                body:   "Follow-up dengan {$lead->nama_company} terlambat {$daysLate} hari"
                       . " (seharusnya " . $lead->next_fu_date . "). Segera tindak lanjuti!",
                leadId: $lead->lead_id,
            );
            $ovCount++;
        }

        $this->info("✓ Reminder: {$remCount} notif | Overdue: {$ovCount} notif dikirim.");
        return Command::SUCCESS;
    }
}

