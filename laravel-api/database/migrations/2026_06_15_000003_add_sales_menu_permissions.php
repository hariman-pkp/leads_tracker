<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $menus = ['field_activity', 'daily_report'];

        foreach ($menus as $menu) {
            $exists = DB::selectOne(
                "SELECT 1 FROM role_menus WHERE role_id = 3 AND menu_key = ?",
                [$menu]
            );
            if (!$exists) {
                DB::table('role_menus')->insert([
                    'role_id'  => 3,
                    'menu_key' => $menu,
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('role_menus')
            ->where('role_id', 3)
            ->whereIn('menu_key', ['field_activity', 'daily_report'])
            ->delete();
    }
};
