<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('kode', 20)->unique();
            $table->string('nama');
            $table->string('kategori', 50)->nullable();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // ── Seed dari data existing di leads, revenue_projects, invoices ──
        $all = [];
        foreach (['leads', 'revenue_projects', 'invoices'] as $tbl) {
            $rows = DB::select("SELECT DISTINCT product FROM {$tbl} WHERE product IS NOT NULL AND TRIM(product) != ''");
            foreach ($rows as $r) {
                $nama = trim($r->product);
                if ($nama !== '') $all[] = $nama;
            }
        }
        $all = array_values(array_unique($all));
        sort($all);

        foreach ($all as $nama) {
            $kode = self::generateKode($nama);
            $base = $kode;
            $i    = 2;
            while (DB::table('products')->where('kode', $kode)->exists()) {
                $kode = $base . $i++;
            }
            DB::table('products')->insert([
                'kode'       => $kode,
                'nama'       => $nama,
                'kategori'   => self::guessKategori($nama),
                'is_active'  => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }

    private static function generateKode(string $nama): string
    {
        $words    = preg_split('/[\s\-\/\(\),\+]+/', $nama, -1, PREG_SPLIT_NO_EMPTY);
        $initials = '';
        foreach ($words as $w) {
            if (preg_match('/^\d/', $w)) {
                $initials .= $w;
            } else {
                $initials .= strtoupper(substr($w, 0, 1));
            }
        }
        $kode = substr($initials, 0, 10);
        return $kode ?: strtoupper(substr(preg_replace('/[^A-Z0-9]/i', '', $nama), 0, 8));
    }

    private static function guessKategori(string $nama): string
    {
        $n = strtolower($nama);
        if (str_contains($n, 'membership'))                                 return 'Membership';
        if (str_contains($n, 'mandays') || str_contains($n, 'reenginering')
            || str_contains($n, 'dev') || str_contains($n, 'development'))  return 'Service';
        if (str_contains($n, 'maintenance') || str_contains($n, 'pmo'))     return 'Service';
        if (str_contains($n, 'sso') || str_contains($n, 'ui'))              return 'Service';
        return 'Platform';
    }
};
