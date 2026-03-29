<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\BillingController;
use App\Http\Controllers\ContentPieceController;
use App\Http\Controllers\GoogleAuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\VideoController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Landing page
Route::get('/', fn () => Inertia::render('Landing'))->name('home');

// Google OAuth
Route::get('/auth/google', [GoogleAuthController::class, 'redirect'])->name('auth.google');
Route::get('/auth/google/callback', [GoogleAuthController::class, 'callback'])->name('auth.google.callback');

// Stripe webhooks (must be before auth middleware)
Route::post('/webhooks/stripe', \Laravel\Cashier\Http\Controllers\WebhookController::class)->name('cashier.webhook');

// Health check
Route::get('/api/health', function () {
    $dbOk    = false;
    $redisOk = false;

    try {
        \DB::connection()->getPdo();
        $dbOk = true;
    } catch (\Exception $e) {}

    try {
        \Cache::store('redis')->get('health_check');
        $redisOk = true;
    } catch (\Exception $e) {}

    $queueDepth = \DB::table('jobs')->count();

    return response()->json([
        'status'              => ($dbOk && $redisOk) ? 'ok' : 'degraded',
        'database'            => $dbOk ? 'connected' : 'error',
        'redis'               => $redisOk ? 'connected' : 'error',
        'queue_depth'         => $queueDepth,
        'last_job_completed'  => \App\Models\Video::where('status', 'ready')
            ->latest('processing_completed_at')
            ->value('processing_completed_at'),
    ]);
});

// Authenticated routes
Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [VideoController::class, 'index'])->name('dashboard');

    // Videos
    Route::get('/dashboard/new', [VideoController::class, 'create'])->name('videos.create');
    Route::post('/dashboard/videos', [VideoController::class, 'store'])->name('videos.store');
    Route::get('/dashboard/videos/{video}', [VideoController::class, 'show'])->name('videos.show');
    Route::delete('/dashboard/videos/{video}', [VideoController::class, 'destroy'])->name('videos.destroy');
    Route::get('/api/videos/{video}/status', [VideoController::class, 'status'])->name('videos.status');

    // Content pieces
    Route::patch('/api/content/{contentPiece}', [ContentPieceController::class, 'update'])->name('content.update');
    Route::post('/api/content/{contentPiece}/copy', [ContentPieceController::class, 'markCopied'])->name('content.copy');
    Route::post('/api/content/{contentPiece}/regenerate', [ContentPieceController::class, 'regenerate'])->name('content.regenerate');

    // Settings
    Route::get('/dashboard/settings', [SettingsController::class, 'show'])->name('settings');
    Route::patch('/dashboard/settings', [SettingsController::class, 'update'])->name('settings.update');

    // Billing
    Route::get('/billing/checkout', [BillingController::class, 'checkout'])->name('billing.checkout');
    Route::get('/billing/success', [BillingController::class, 'success'])->name('billing.success');
    Route::get('/billing/portal', [BillingController::class, 'portal'])->name('billing.portal');

    // Admin (admin-only via middleware check in controller or gate)
    Route::get('/admin', [AdminController::class, 'index'])
        ->name('admin.index')
        ->middleware('can:access-admin');
});

// Breeze auth routes (login, register, password reset)
require __DIR__.'/auth.php';
