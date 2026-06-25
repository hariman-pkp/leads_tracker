<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ── FU Reminder — setiap hari jam 07:00 ──────────────────────────────────
use Illuminate\Support\Facades\Schedule;
Schedule::command('fu:remind')->dailyAt('07:00');

// ── Stale Lead Alert — setiap Senin jam 08:00 ─────────────────────────────
Schedule::command('leads:stale-alert')->weeklyOn(1, '08:00');
