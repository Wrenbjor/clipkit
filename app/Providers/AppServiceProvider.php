<?php

namespace App\Providers;

use App\Listeners\UpdateUserPlanFromCashier;
use App\Models\User;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Laravel\Cashier\Cashier;
use Laravel\Cashier\Events\WebhookReceived;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Admin gate
        Gate::define('access-admin', function (User $user) {
            return $user->is_admin;
        });

        // Cashier config
        Cashier::calculateTaxes();

        // Update user plan on Stripe webhook events
        Event::listen(WebhookReceived::class, UpdateUserPlanFromCashier::class);
    }
}
