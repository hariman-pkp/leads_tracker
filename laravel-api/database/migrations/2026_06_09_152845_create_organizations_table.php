<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('organizations', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 20)->unique();
            $table->string('nama');
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('head')->nullable();          // Nama kepala organisasi
            $table->integer('is_active')->default(1);
            $table->timestamps();
            $table->timestamp('deleted_at')->nullable();

            $table->foreign('parent_id')
                  ->references('id')
                  ->on('organizations')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('organizations');
    }
};
