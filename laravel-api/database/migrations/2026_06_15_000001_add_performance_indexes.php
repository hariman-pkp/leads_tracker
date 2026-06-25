<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public $withinTransaction = false;

    public function up(): void
    {
        $indexes = [
            "CREATE INDEX IF NOT EXISTS idx_leads_stage_owner   ON leads(stage, sales_owner)",
            "CREATE INDEX IF NOT EXISTS idx_leads_exp_close     ON leads(exp_close_date) WHERE exp_close_date IS NOT NULL",
            "CREATE INDEX IF NOT EXISTS idx_leads_prioritas     ON leads(prioritas)",
            "CREATE INDEX IF NOT EXISTS idx_leads_last_fu       ON leads(last_fu_date)",
            "CREATE INDEX IF NOT EXISTS idx_ec_status           ON entertainment_claims(status)",
            "CREATE INDEX IF NOT EXISTS idx_ec_user_status      ON entertainment_claims(user_id, status)",
            "CREATE INDEX IF NOT EXISTS idx_fu_log_sales_owner  ON follow_up_log(sales_owner)",
            "CREATE INDEX IF NOT EXISTS idx_fu_log_owner_tgl    ON follow_up_log(sales_owner, tgl_fu DESC)",
        ];

        foreach ($indexes as $sql) {
            DB::statement($sql);
        }
    }

    public function down(): void
    {
        $drops = [
            'idx_leads_stage_owner','idx_leads_exp_close','idx_leads_prioritas',
            'idx_leads_last_fu','idx_ec_status','idx_ec_user_status',
            'idx_fu_log_sales_owner','idx_fu_log_owner_tgl',
        ];
        foreach ($drops as $idx) {
            DB::statement("DROP INDEX IF EXISTS $idx");
        }
    }
};
