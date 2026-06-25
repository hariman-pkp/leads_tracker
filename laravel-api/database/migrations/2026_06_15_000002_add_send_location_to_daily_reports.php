<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('daily_reports', function (Blueprint $table) {
            $table->decimal('send_latitude',  10, 7)->nullable()->after('sent_at');
            $table->decimal('send_longitude', 10, 7)->nullable()->after('send_latitude');
            $table->string('send_address', 500)->nullable()->after('send_longitude');
        });
    }

    public function down(): void
    {
        Schema::table('daily_reports', function (Blueprint $table) {
            $table->dropColumn(['send_latitude', 'send_longitude', 'send_address']);
        });
    }
};
