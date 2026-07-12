<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_plans', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('lead_id')->nullable();
            $table->date('planned_date');
            $table->time('planned_time')->nullable();
            $table->text('notes')->nullable();
            $table->string('status', 20)->default('planned'); // planned | done | cancelled
            $table->unsignedBigInteger('visit_log_id')->nullable(); // diisi saat auto-done via check-in
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->index(['user_id', 'planned_date']);
            $table->index(['lead_id', 'planned_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_plans');
    }
};
