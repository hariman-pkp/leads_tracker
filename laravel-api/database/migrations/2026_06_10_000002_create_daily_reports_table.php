<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('daily_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->date('report_date');
            $table->enum('status', ['draft', 'sent'])->default('draft');
            $table->integer('visit_count')->default(0);
            $table->integer('fu_count')->default(0);
            $table->integer('new_lead_count')->default(0);
            $table->text('notes_obstacle')->nullable();    // hambatan hari ini
            $table->text('notes_plan')->nullable();        // rencana esok hari
            $table->string('mood', 20)->nullable();        // good | neutral | hard
            $table->json('visit_details')->nullable();     // array kunjungan dari visit_logs
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            // Satu laporan per user per hari
            $table->unique(['user_id', 'report_date']);
            $table->index(['user_id', 'report_date']);
            $table->index(['status', 'report_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('daily_reports');
    }
};
