<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Isi sales_owner yang kosong dari leads.sales_owner
        DB::statement("
            UPDATE follow_up_log fl
            SET sales_owner = l.sales_owner
            FROM leads l
            WHERE fl.lead_id = l.lead_id
              AND (fl.sales_owner IS NULL OR fl.sales_owner = '')
              AND l.sales_owner IS NOT NULL
              AND l.sales_owner <> ''
        ");
    }

    public function down(): void {}
};
