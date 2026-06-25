<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('visit_logs', function (Blueprint $table) {
            $table->decimal('checkout_latitude',  10, 8)->nullable()->after('longitude');
            $table->decimal('checkout_longitude', 11, 8)->nullable()->after('checkout_latitude');
        });
    }

    public function down(): void
    {
        Schema::table('visit_logs', function (Blueprint $table) {
            $table->dropColumn(['checkout_latitude', 'checkout_longitude']);
        });
    }
};
