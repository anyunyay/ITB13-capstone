<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Schedule the low stock alerts check to run daily at 9 AM
Schedule::command('stock:check-low-alerts')->dailyAt('09:00');

// Schedule the member earnings update to run monthly on the 1st at 10 AM
Schedule::command('earnings:update --period=monthly')->monthlyOn(1, '10:00');

// Schedule the daily system lockout to run daily at 6 AM
Schedule::command('system:daily-lockout')->dailyAt('06:00');
