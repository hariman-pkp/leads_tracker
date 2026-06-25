<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visit_logs', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');               // sales yang check-in
            $table->string('lead_id')->nullable();               // lead terkait (opsional)
            $table->unsignedBigInteger('fu_id')->nullable();     // FU log terkait (opsional)
            $table->string('type', 20)->default('check_in');     // check_in | check_out | visit
            $table->decimal('latitude',  10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->text('address')->nullable();                 // hasil reverse geocode
            $table->integer('accuracy_m')->nullable();           // akurasi GPS (meter)
            $table->text('photo_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamp('checked_in_at')->nullable();      // waktu check-in
            $table->timestamp('checked_out_at')->nullable();     // waktu check-out
            $table->integer('duration_minutes')->nullable();     // durasi kunjungan
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_logs');
    }
};
