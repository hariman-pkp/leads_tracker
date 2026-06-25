<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('revenue_projects', function (Blueprint $table) {
            $table->string('tipe_revenue')->nullable()->after('type');       // Yearly / Monthly / Termin
            $table->date('target_invoice_date')->nullable()->after('tipe_revenue'); // Target tgl penerbitan invoice
        });
    }

    public function down(): void
    {
        Schema::table('revenue_projects', function (Blueprint $table) {
            $table->dropColumn(['tipe_revenue', 'target_invoice_date']);
        });
    }
};
