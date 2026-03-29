<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Reset video counts for free users on their billing cycle anniversary
Schedule::call(function () {
    $today = now()->day;

    User::where('plan', 'free')
        ->whereRaw('EXTRACT(DAY FROM billing_cycle_start) = ?', [$today])
        ->orWhereNull('billing_cycle_start')
        ->update(['videos_this_month' => 0]);
})->daily()->name('reset-free-video-counts');
