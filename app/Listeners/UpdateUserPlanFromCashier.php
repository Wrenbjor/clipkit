<?php

namespace App\Listeners;

use App\Models\User;
use Laravel\Cashier\Events\WebhookReceived;
use Illuminate\Support\Facades\Log;

class UpdateUserPlanFromCashier
{
    public function handle(WebhookReceived $event): void
    {
        $payload = $event->payload;
        $type    = $payload['type'] ?? '';

        match (true) {
            in_array($type, ['customer.subscription.created', 'customer.subscription.updated']) => $this->handleSubscriptionActive($payload),
            in_array($type, ['customer.subscription.deleted', 'customer.subscription.paused'])  => $this->handleSubscriptionInactive($payload),
            default => null,
        };
    }

    private function handleSubscriptionActive(array $payload): void
    {
        $stripeCustomerId = $payload['data']['object']['customer'] ?? null;
        $status           = $payload['data']['object']['status'] ?? '';

        if (!$stripeCustomerId) return;

        $user = User::where('stripe_id', $stripeCustomerId)->first();
        if (!$user) return;

        if (in_array($status, ['active', 'trialing'])) {
            $user->update([
                'plan'              => 'pro',
                'plan_video_limit'  => PHP_INT_MAX,
            ]);
            Log::info('User upgraded to Pro', ['user_id' => $user->id]);
        }
    }

    private function handleSubscriptionInactive(array $payload): void
    {
        $stripeCustomerId = $payload['data']['object']['customer'] ?? null;
        if (!$stripeCustomerId) return;

        $user = User::where('stripe_id', $stripeCustomerId)->first();
        if (!$user) return;

        $user->update([
            'plan'             => 'free',
            'plan_video_limit' => 3,
        ]);
        Log::info('User downgraded to Free', ['user_id' => $user->id]);
    }
}
