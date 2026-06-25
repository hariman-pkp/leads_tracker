<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            // lead_id boleh null (kontak bisa berdiri sendiri)
            $table->text('lead_id')->nullable()->change();
            $table->timestamp('created_at')->nullable()->after('catatan');
            $table->timestamp('updated_at')->nullable()->after('created_at');
            $table->timestamp('deleted_at')->nullable()->after('updated_at');
        });
    }

    public function down(): void
    {
        Schema::table('contacts', function (Blueprint $table) {
            $table->dropColumn(['created_at', 'updated_at', 'deleted_at']);
        });
    }
};
