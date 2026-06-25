<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('revenue_projects', function (Blueprint $table) {
            // Relasi ke tabel leads — nullable karena project bisa dibuat manual
            $table->string('lead_id')->nullable()->after('project_id');
        });
    }

    public function down(): void
    {
        Schema::table('revenue_projects', function (Blueprint $table) {
            $table->dropColumn('lead_id');
        });
    }
};
