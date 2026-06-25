<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kpi_prospecting', function (Blueprint $table) {
            $table->integer('tahun')->default(2026)->after('id');
        });

        Schema::table('budget_items', function (Blueprint $table) {
            $table->integer('tahun')->default(2026)->after('id');
        });

        DB::statement('UPDATE kpi_prospecting SET tahun = 2026');
        DB::statement('UPDATE budget_items SET tahun = 2026');
    }

    public function down(): void
    {
        Schema::table('kpi_prospecting', function (Blueprint $table) {
            $table->dropColumn('tahun');
        });
        Schema::table('budget_items', function (Blueprint $table) {
            $table->dropColumn('tahun');
        });
    }
};
