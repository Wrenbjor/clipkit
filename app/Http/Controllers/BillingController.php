<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BillingController extends Controller
{
    public function checkout()
    {
        $user = Auth::user();

        $checkout = $user->newSubscription('default', config('cashier.price_id'))
            ->checkout([
                'success_url' => route('billing.success') . '?session_id={CHECKOUT_SESSION_ID}',
                'cancel_url'  => route('settings'),
            ]);

        return redirect($checkout->url);
    }

    public function success(Request $request)
    {
        // Cashier handles the webhook to update the subscription
        // This just redirects with a success flash
        return redirect()->route('dashboard')
            ->with('success', 'Welcome to Pro! You now have unlimited video processing.');
    }

    public function portal()
    {
        $user = Auth::user();

        $portalSession = $user->billingPortalUrl(route('settings'));

        return redirect($portalSession);
    }

    public function webhook()
    {
        // Handled by Laravel Cashier's built-in webhook controller
        // registered via Route::stripeWebhooks() in routes/web.php
    }
}
