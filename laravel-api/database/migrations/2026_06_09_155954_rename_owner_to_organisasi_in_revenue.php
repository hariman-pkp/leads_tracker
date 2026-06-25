<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Rename kolom owner → organisasi di revenue_projects
        Schema::table('revenue_projects', function (Blueprint $table) {
            $table->renameColumn('owner', 'organisasi');
        });

        // Rename kolom owner → organisasi di invoices
        Schema::table('invoices', function (Blueprint $table) {
            $table->renameColumn('owner', 'organisasi');
        });

        // Migrasi nilai: EIW → FSP-CORE, selain itu → FSP-ECO
        DB::statement("UPDATE revenue_projects SET organisasi = 'FSP-CORE' WHERE organisasi = 'EIW'");
        DB::statement("UPDATE revenue_projects SET organisasi = 'FSP-ECO'  WHERE organisasi != 'FSP-CORE'");

        DB::statement("UPDATE invoices SET organisasi = 'FSP-CORE' WHERE organisasi = 'EIW'");
        DB::statement("UPDATE invoices SET organisasi = 'FSP-ECO'  WHERE organisasi != 'FSP-CORE'");

        // Seed organizations jika belum ada
        $fspCore = DB::selectOne("SELECT id FROM organizations WHERE kode='FSP-CORE' AND deleted_at IS NULL");
        if (!$fspCore) {
            DB::table('organizations')->insert([
                'kode'       => 'FSP-CORE',
                'nama'       => 'FSP Core',
                'parent_id'  => null,
                'head'       => null,
                'is_active'  => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
        $fspEco = DB::selectOne("SELECT id FROM organizations WHERE kode='FSP-ECO' AND deleted_at IS NULL");
        if (!$fspEco) {
            DB::table('organizations')->insert([
                'kode'       => 'FSP-ECO',
                'nama'       => 'FSP Eco',
                'parent_id'  => null,
                'head'       => null,
                'is_active'  => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::table('revenue_projects', function (Blueprint $table) {
            $table->renameColumn('organisasi', 'owner');
        });
        Schema::table('invoices', function (Blueprint $table) {
            $table->renameColumn('organisasi', 'owner');
        });
    }
};
