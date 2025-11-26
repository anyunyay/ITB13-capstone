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

// Schedule the auto-confirmation of delivered orders to run daily at 11 PM
Schedule::command('orders:auto-confirm')->dailyAt('23:00');

// Schedule the clearing of expired suspicious orders to run every 5 minutes
// This ensures orders older than 10 minutes are automatically cleared from suspicious status
Schedule::command('orders:clear-expired-suspicious')->everyFiveMinutes();