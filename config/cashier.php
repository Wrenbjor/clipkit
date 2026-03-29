<?php

return [
    'key'     => env('STRIPE_KEY'),
    'secret'  => env('STRIPE_SECRET'),
    'webhook' => [
        'secret'    => env('STRIPE_WEBHOOK_SECRET'),
        'tolerance' => env('CASHIER_WEBHOOK_TOLERANCE', 300),
    ],
    'model'    => App\Models\User::class,
    'currency' => env('CASHIER_CURRENCY', 'usd'),
    'currency_locale' => env('CASHIER_CURRENCY_LOCALE', 'en'),
    'payment_notification' => null,
    'price_id' => env('STRIPE_PRO_PRICE_ID'),
    'logger'   => null,
    'path'     => env('CASHIER_PATH', 'stripe'),
];
