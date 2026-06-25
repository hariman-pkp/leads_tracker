<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('sender_id')->nullable(); // null = sistem otomatis
            $table->enum('type', [
                'overdue',   // FU melewati jadwal
                'reminder',  // pengingat FU hari ini
                'stale',     // lead tidak disentuh > X hari
                'closing',   // deadline closing mendekat
                'comment',   // komentar dari manager
                'approval',  // approval pipeline dari manager
                'info',      // informasi umum
                'warning',   // peringatan sistem
            ])->default('info');
            $table->string('title', 255);
            $table->text('body');
            $table->string('lead_id', 50)->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'read_at']);
            $table->index(['user_id', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
